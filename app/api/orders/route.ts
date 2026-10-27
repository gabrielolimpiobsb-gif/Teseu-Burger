import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { CreateOrderSchema } from '@/lib/validation-schemas';
import { createOrder } from '@/src/db/orders';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 8 order submissions per minute per client IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`order_${clientIp}`, {
      limit: 8,
      windowMs: 60000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Muitas tentativas em pouco tempo. Aguarde um minuto antes de enviar um novo pedido.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Body Payload Parsing
    const rawBody = await req.json();

    // 3. Schema Validation & XSS Sanitization via Zod
    const validation = CreateOrderSchema.safeParse(rawBody);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        {
          error: issue?.message || 'Dados do pedido inválidos.',
        },
        { status: 400 }
      );
    }

    const validData = validation.data;
    const orderNumber = `TB-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Secure Database Persistence via Parameterized ORM
    const savedOrder = await createOrder({
      orderNumber,
      customerName: validData.customer.name,
      customerPhone: validData.customer.phone,
      customerAddress: validData.customer.address,
      deliveryMethod: validData.customer.deliveryMethod,
      paymentMethod: validData.customer.paymentMethod,
      status: 'awaiting_payment',
      subtotal: Math.round(validData.subtotal * 100), // stored as integer cents
      deliveryFee: Math.round(validData.deliveryFee * 100),
      total: Math.round(validData.total * 100),
      notes: validData.customer.notes,
      itemsJson: JSON.stringify(validData.items),
    });

    // 5. Audit Logging (Security & Incident Traceability)
    console.log(
      `[SECURITY AUDIT] Order placed: ${orderNumber} | IP: ${clientIp} | Total: R$ ${validData.total.toFixed(2)}`
    );

    return NextResponse.json(
      {
        success: true,
        orderId: orderNumber,
        dbId: savedOrder?.id,
        message: 'Pedido recebido com sucesso!',
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateCheck.limit.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        },
      }
    );
  } catch (err: unknown) {
    // 6. Security Sanitization: Never expose DB stack traces or internal errors to users
    console.error('[API SECURITY ERROR] Order submission failed:', err);
    return NextResponse.json(
      {
        error: 'Não foi possível processar seu pedido no momento. Tente novamente em instantes.',
      },
      { status: 500 }
    );
  }
}
