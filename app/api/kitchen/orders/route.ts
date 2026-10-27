import { NextRequest, NextResponse } from 'next/server';
import { verifyKitchenSession } from '@/lib/kitchen-auth';
import {
  getAllKitchenOrders,
  getOrderById,
  updateOrderStatus,
  confirmOrderPayment,
  completeOrderWithFinancials,
} from '@/src/db/orders';
import { calculateOrderFinancials } from '@/lib/financial-engine';

export async function GET(req: NextRequest) {
  // 1. Strict Security Route Guard (supports Bearer token & cookie)
  const session = await verifyKitchenSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas operadores autenticados da cozinha podem visualizar pedidos.' },
      { status: 401 }
    );
  }

  try {
    const orders = await getAllKitchenOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[KDS API] Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Erro ao carregar pedidos da cozinha.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Strict Security Route Guard
  const session = await verifyKitchenSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Acesso não autorizado. Operação restrita ao painel da cozinha.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { orderId, action, targetStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido obrigatório.' }, { status: 400 });
    }

    const currentOrder = await getOrderById(Number(orderId));
    if (!currentOrder) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // 2. Action: Validate WhatsApp payment manually from kitchen card
    if (action === 'confirm_payment') {
      const updated = await confirmOrderPayment(Number(orderId));
      console.log(`[KDS] Operador "${session.operatorName}" confirmou pagamento do pedido ${currentOrder.orderNumber}`);
      return NextResponse.json({
        success: true,
        order: updated,
        message: 'Comprovante validado e pagamento confirmado!',
      });
    }

    // 3. Action: Change/Advance Status
    if (action === 'update_status') {
      const validStatuses = [
        'awaiting_payment',
        'payment_confirmed',
        'preparing',
        'ready',
        'awaiting_courier',
        'out_for_delivery',
        'completed',
        'cancelled',
      ];

      if (!targetStatus || !validStatuses.includes(targetStatus)) {
        return NextResponse.json({ error: 'Status do pedido inválido.' }, { status: 400 });
      }

        // If transitioning to "completed", trigger the automatic financial engine
      if (targetStatus === 'completed') {
        let items: any[] = [];
        try {
          items = JSON.parse(currentOrder.itemsJson);
        } catch {
          items = [];
        }

        const { getAllMenuOverrides } = await import('@/src/db/menu');
        const overrides = await getAllMenuOverrides();
        const customCosts: Record<string, number> = {};
        for (const ov of overrides) {
          if (ov.costPrice) customCosts[ov.itemId] = ov.costPrice / 100;
        }

        const totalReais = currentOrder.total / 100;
        const financials = calculateOrderFinancials(
          currentOrder.orderNumber,
          items,
          totalReais,
          currentOrder.paymentMethod,
          customCosts
        );

        const result = await completeOrderWithFinancials(Number(orderId), financials);

        console.log(
          `[KDS FINANCIAL ENGINE] Pedido ${currentOrder.orderNumber} CONCLUÍDO por ${session.operatorName}. Receita: R$${financials.grossRevenue.toFixed(
            2
          )} | Custo (CMV): R$${financials.productionCost.toFixed(2)} | Lucro: R$${financials.grossProfit.toFixed(
            2
          )} (${financials.profitMargin})`
        );

        return NextResponse.json({
          success: true,
          order: result.order,
          financialRecord: result.financialRecord,
          financials,
          message: 'Pedido concluído com sucesso e dados financeiros registrados.',
        });
      }

      // Standard status transition
      const updated = await updateOrderStatus(Number(orderId), targetStatus);
      return NextResponse.json({
        success: true,
        order: updated,
        message: `Status atualizado para "${targetStatus}".`,
      });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    console.error('[KDS API] Failed to update order:', error);
    return NextResponse.json(
      { error: 'Não foi possível atualizar o pedido na cozinha.' },
      { status: 500 }
    );
  }
}
