import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllKitchenOrders } from '@/src/db/orders';
import { getAllMenuOverrides } from '@/src/db/menu';
import { MENU_ITEMS, NEIGHBORHOOD_FEES } from '@/lib/data';

export async function GET(req: NextRequest) {
  // 1. Strict Security Guard (role: super-admin)
  const session = await verifyAdminSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas o proprietário (super-admin) pode acessar o Painel Admin.' },
      { status: 401 }
    );
  }

  try {
    // 2. Fetch all orders with resilient fallback
    const allOrders = await getAllKitchenOrders();

    // 3. Financial records and menu overrides
    const overrides = await getAllMenuOverrides();
    const allFinancials: any[] = [];
    const allUsers: any[] = [];

    // 6. Aggregate Financial Metrics
    let totalGrossRevenue = 0;
    let totalProductionCost = 0;
    let totalNetProfit = 0;
    let totalOrdersCount = allOrders.length;
    let completedOrdersCount = 0;

    const paymentMethodsStats = {
      pix: { count: 0, revenue: 0 },
      card: { count: 0, revenue: 0 },
      cash: { count: 0, revenue: 0 },
    };

    const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const neighborhoodStats: Record<
      string,
      {
        orderCount: number;
        revenue: number;
        dayCounts: Record<string, number>;
        deliveryFee: number;
      }
    > = {};

    // Initialize known neighborhoods from data
    Object.keys(NEIGHBORHOOD_FEES).forEach((n) => {
      neighborhoodStats[n] = {
        orderCount: 0,
        revenue: 0,
        dayCounts: { Domingo: 0, Segunda: 0, Terça: 0, Quarta: 0, Quinta: 0, Sexta: 0, Sábado: 0 },
        deliveryFee: NEIGHBORHOOD_FEES[n],
      };
    });

    const calendarOrdersByDate: Record<string, any[]> = {};

    for (const order of allOrders) {
      const orderRevenue = order.total / 100;
      totalGrossRevenue += orderRevenue;

      // Extract day and calendar date
      const dateObj = new Date(order.createdAt || new Date());
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = daysMap[dateObj.getDay()];

      if (!calendarOrdersByDate[dateKey]) {
        calendarOrdersByDate[dateKey] = [];
      }
      calendarOrdersByDate[dateKey].push(order);

      // Financials
      if (order.status === 'completed') {
        completedOrdersCount += 1;
        const prodCost = order.productionCost ? order.productionCost / 100 : Math.round(orderRevenue * 0.38 * 100) / 100;
        const profit = order.grossProfit ? order.grossProfit / 100 : Math.round((orderRevenue - prodCost) * 100) / 100;
        totalProductionCost += prodCost;
        totalNetProfit += profit;
      }

      // Payment method breakdown
      const method = (order.paymentMethod || 'pix').toLowerCase();
      if (method === 'pix') {
        paymentMethodsStats.pix.count += 1;
        paymentMethodsStats.pix.revenue += orderRevenue;
      } else if (method === 'card') {
        paymentMethodsStats.card.count += 1;
        paymentMethodsStats.card.revenue += orderRevenue;
      } else if (method === 'cash') {
        paymentMethodsStats.cash.count += 1;
        paymentMethodsStats.cash.revenue += orderRevenue;
      }

      // Geographic analysis (Neighborhood matching)
      if (order.customerAddress) {
        let matchedNeighborhood = 'Outro Bairro';
        for (const n of Object.keys(NEIGHBORHOOD_FEES)) {
          if (order.customerAddress.toLowerCase().includes(n.split('/')[0].trim().toLowerCase())) {
            matchedNeighborhood = n;
            break;
          }
        }

        if (!neighborhoodStats[matchedNeighborhood]) {
          neighborhoodStats[matchedNeighborhood] = {
            orderCount: 0,
            revenue: 0,
            dayCounts: { Domingo: 0, Segunda: 0, Terça: 0, Quarta: 0, Quinta: 0, Sexta: 0, Sábado: 0 },
            deliveryFee: NEIGHBORHOOD_FEES[matchedNeighborhood] || 10.0,
          };
        }

        neighborhoodStats[matchedNeighborhood].orderCount += 1;
        neighborhoodStats[matchedNeighborhood].revenue += orderRevenue;
        neighborhoodStats[matchedNeighborhood].dayCounts[dayOfWeek] += 1;
      }
    }

    // Geographic Ranking Array & Peak Day Analysis
    const neighborhoodRanking = Object.entries(neighborhoodStats)
      .map(([name, data]) => {
        // Find peak day
        let peakDay = 'Sexta';
        let peakMax = -1;
        Object.entries(data.dayCounts).forEach(([day, count]) => {
          if (count > peakMax) {
            peakMax = count;
            peakDay = day;
          }
        });

        const avgTicket = data.orderCount > 0 ? data.revenue / data.orderCount : 0;

        return {
          name,
          orderCount: data.orderCount,
          revenue: Math.round(data.revenue * 100) / 100,
          avgTicket: Math.round(avgTicket * 100) / 100,
          peakDay,
          deliveryFee: data.deliveryFee,
          dayCounts: data.dayCounts,
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount);

    const averageTicket = totalOrdersCount > 0 ? totalGrossRevenue / totalOrdersCount : 0;
    const profitMargin =
      totalGrossRevenue > 0 ? `${((totalNetProfit / totalGrossRevenue) * 100).toFixed(1)}%` : '0.0%';

    return NextResponse.json({
      summary: {
        totalOrdersCount,
        completedOrdersCount,
        totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
        totalProductionCost: Math.round(totalProductionCost * 100) / 100,
        totalNetProfit: Math.round(totalNetProfit * 100) / 100,
        profitMargin,
        averageTicket: Math.round(averageTicket * 100) / 100,
        paymentMethodsStats,
      },
      orders: allOrders,
      financialRecords: allFinancials,
      users: allUsers,
      menuOverrides: overrides,
      calendarOrdersByDate,
      neighborhoodRanking,
    });
  } catch (error) {
    console.error('[ADMIN API] Error fetching master data:', error);
    return NextResponse.json({ error: 'Erro ao consolidar dados mestres do Admin.' }, { status: 500 });
  }
}
