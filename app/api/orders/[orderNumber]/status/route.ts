import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber } from '@/src/db/orders';

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Número do pedido não informado.' }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    let items: any[] = [];
    try {
      items = JSON.parse(order.itemsJson);
    } catch {
      items = [];
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal / 100,
      deliveryFee: order.deliveryFee / 100,
      total: order.total / 100,
      notes: order.notes,
      items,
      createdAt: order.createdAt,
      paymentConfirmedAt: order.paymentConfirmedAt,
      preparedAt: order.preparedAt,
      dispatchedAt: order.dispatchedAt,
      completedAt: order.completedAt,
    });
  } catch (error) {
    console.error('[ORDER STATUS API] Failed to fetch status:', error);
    return NextResponse.json({ error: 'Erro ao consultar status do pedido.' }, { status: 500 });
  }
}
