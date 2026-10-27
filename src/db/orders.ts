import { db } from './index.ts';
import { orders, financialRecords } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import type { OrderFinancialSummary } from '@/lib/financial-engine';
import fs from 'fs';
import path from 'path';

export interface CreateOrderParams {
  orderNumber: string;
  userId?: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: string;
  paymentMethod: string;
  status?: string;
  subtotal: number;
  deliveryFee?: number;
  total: number;
  notes?: string;
  itemsJson: string;
}

const ORDERS_FILE_PATH = path.join(process.cwd(), '.orders_cache.json');
const FINANCIALS_FILE_PATH = path.join(process.cwd(), '.financials_cache.json');

// Initial real orders from Cloud SQL
const SEED_ORDERS: any[] = [
  {
    id: 1,
    orderNumber: "TB-499695",
    userId: null,
    customerName: "rad",
    customerPhone: "61999699615",
    customerAddress: "sfsdfsf, 23423 - 221 - Bela Vista / Paulista",
    deliveryMethod: "delivery",
    paymentMethod: "pix",
    status: "awaiting_payment",
    subtotal: 3490,
    deliveryFee: 600,
    total: 4090,
    notes: null,
    itemsJson: JSON.stringify([{
      id: "legend-classic-1792963637076-773",
      menuItemId: "legend-classic",
      name: "THE OLYMPIAN CLASSIC",
      unitPrice: 34.9,
      quantity: 1,
      totalPrice: 34.9,
      imageType: "classic",
      doneness: "Ao ponto",
      selectedToppings: [],
      isComboUpgrade: false,
    }]),
    createdAt: new Date("2026-10-26T16:58:51.797Z").toISOString(),
  },
  {
    id: 2,
    orderNumber: "TB-780380",
    userId: null,
    customerName: "teste 01",
    customerPhone: "61999699615",
    customerAddress: "ASasAS, 12123 - Consolação / Augusta",
    deliveryMethod: "delivery",
    paymentMethod: "pix",
    status: "completed",
    subtotal: 5880,
    deliveryFee: 500,
    total: 6380,
    notes: null,
    itemsJson: JSON.stringify([{
      id: "legend-fury-1793036235587-597",
      menuItemId: "legend-fury",
      name: "ARES GREEN FURY",
      unitPrice: 58.8,
      quantity: 1,
      totalPrice: 58.8,
      imageType: "fury",
      doneness: "Bem passado",
      selectedToppings: [{ id: "bacon", name: "Bacon Artesanal Defumado em Lenha Sagrada", price: 5 }],
      isComboUpgrade: true,
      comboDrink: "Guaraná Antarctica (Lata 350ml)",
    }]),
    createdAt: new Date("2026-10-26T17:37:30.111Z").toISOString(),
    productionCost: 2718,
    grossProfit: 3662,
    profitMargin: "57.4%",
    paymentConfirmedAt: new Date("2026-10-26T17:38:57.780Z").toISOString(),
    preparedAt: new Date("2026-10-26T17:39:14.241Z").toISOString(),
    dispatchedAt: new Date("2026-10-27T18:43:44.870Z").toISOString(),
    completedAt: new Date("2026-10-27T18:43:47.506Z").toISOString(),
  },
];

function readLocalOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveLocalOrders(SEED_ORDERS);
  return SEED_ORDERS;
}

function saveLocalOrders(list: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

function readLocalFinancials(): any[] {
  try {
    if (fs.existsSync(FINANCIALS_FILE_PATH)) {
      const data = fs.readFileSync(FINANCIALS_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function saveLocalFinancials(list: any[]) {
  try {
    fs.writeFileSync(FINANCIALS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export async function createOrder(data: CreateOrderParams) {
  // Always update local persistent store
  const localList = readLocalOrders();
  const newOrder = {
    id: Date.now(),
    orderNumber: data.orderNumber,
    userId: data.userId ?? null,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerAddress: data.customerAddress ?? null,
    deliveryMethod: data.deliveryMethod,
    paymentMethod: data.paymentMethod,
    status: data.status ?? 'awaiting_payment',
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee ?? 0,
    total: data.total,
    notes: data.notes ?? null,
    itemsJson: data.itemsJson,
    createdAt: new Date().toISOString(),
  };
  localList.unshift(newOrder);
  saveLocalOrders(localList);

  try {
    const result = await db.insert(orders).values({
      orderNumber: data.orderNumber,
      userId: data.userId ?? null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress ?? null,
      deliveryMethod: data.deliveryMethod,
      paymentMethod: data.paymentMethod,
      status: data.status ?? 'awaiting_payment',
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee ?? 0,
      total: data.total,
      notes: data.notes ?? null,
      itemsJson: data.itemsJson,
    }).returning();

    return result[0];
  } catch {
    return newOrder;
  }
}

export async function getOrdersByUserId(userId: number) {
  try {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  } catch {
    const local = readLocalOrders();
    return local.filter(o => o.userId === userId);
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (result && result.length > 0) return result[0];
  } catch {}
  
  const local = readLocalOrders();
  return local.find(o => o.orderNumber === orderNumber) || null;
}

export async function getOrderById(orderId: number) {
  try {
    const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (result && result.length > 0) return result[0];
  } catch {}

  const local = readLocalOrders();
  return local.find(o => o.id === orderId) || null;
}

/**
 * Retrieves all active orders for Kitchen Display System (KDS) & Admin.
 * Resilient to database proxy network termination.
 */
export async function getAllKitchenOrders() {
  try {
    const rows = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(100);
    if (rows && rows.length > 0) {
      saveLocalOrders(rows);
      return rows;
    }
  } catch {}

  return readLocalOrders();
}

/**
 * Updates order status and records intermediate milestone timestamps.
 */
export async function updateOrderStatus(orderId: number, status: string) {
  const localList = readLocalOrders();
  const orderIdx = localList.findIndex(o => o.id === orderId);
  const now = new Date().toISOString();

  let updatedLocal: any = null;
  if (orderIdx >= 0) {
    localList[orderIdx].status = status;
    if (status === 'payment_confirmed') localList[orderIdx].paymentConfirmedAt = now;
    if (status === 'preparing') localList[orderIdx].preparedAt = now;
    if (status === 'out_for_delivery') localList[orderIdx].dispatchedAt = now;
    if (status === 'completed') localList[orderIdx].completedAt = now;
    updatedLocal = localList[orderIdx];
    saveLocalOrders(localList);
  }

  try {
    const timestampUpdates: Record<string, Date> = {};
    if (status === 'payment_confirmed') timestampUpdates.paymentConfirmedAt = new Date();
    if (status === 'preparing') timestampUpdates.preparedAt = new Date();
    if (status === 'out_for_delivery') timestampUpdates.dispatchedAt = new Date();
    if (status === 'completed') timestampUpdates.completedAt = new Date();

    const result = await db
      .update(orders)
      .set({
        status,
        ...timestampUpdates,
      })
      .where(eq(orders.id, orderId))
      .returning();

    return result[0];
  } catch {
    return updatedLocal;
  }
}

/**
 * Validates and confirms manual WhatsApp payment from the kitchen.
 */
export async function confirmOrderPayment(orderId: number) {
  return updateOrderStatus(orderId, 'payment_confirmed');
}

/**
 * Completes order, updates status to 'completed', calculates and records
 * production cost, gross profit, and inserts consolidated financial record.
 */
export async function completeOrderWithFinancials(
  orderId: number,
  financials: OrderFinancialSummary
) {
  const prodCostCents = Math.round(financials.productionCost * 100);
  const grossProfitCents = Math.round(financials.grossProfit * 100);
  const grossRevenueCents = Math.round(financials.grossRevenue * 100);

  // Update local file store
  const localList = readLocalOrders();
  const orderIdx = localList.findIndex(o => o.id === orderId);
  let updatedOrderLocal: any = null;
  if (orderIdx >= 0) {
    localList[orderIdx].status = 'completed';
    localList[orderIdx].completedAt = new Date().toISOString();
    localList[orderIdx].productionCost = prodCostCents;
    localList[orderIdx].grossProfit = grossProfitCents;
    localList[orderIdx].profitMargin = financials.profitMargin;
    updatedOrderLocal = localList[orderIdx];
    saveLocalOrders(localList);
  }

  const newFinancialRecord = {
    id: Date.now(),
    orderId,
    orderNumber: financials.orderNumber,
    grossRevenue: grossRevenueCents,
    productionCost: prodCostCents,
    grossProfit: grossProfitCents,
    profitMargin: financials.profitMargin,
    paymentMethod: financials.paymentMethod,
    itemsBreakdownJson: JSON.stringify(financials.itemsBreakdown),
    completedAt: new Date().toISOString(),
  };
  const localFinancials = readLocalFinancials();
  localFinancials.unshift(newFinancialRecord);
  saveLocalFinancials(localFinancials);

  try {
    const updatedOrder = await db
      .update(orders)
      .set({
        status: 'completed',
        completedAt: new Date(),
        productionCost: prodCostCents,
        grossProfit: grossProfitCents,
        profitMargin: financials.profitMargin,
      })
      .where(eq(orders.id, orderId))
      .returning();

    const financialRecord = await db
      .insert(financialRecords)
      .values({
        orderId,
        orderNumber: financials.orderNumber,
        grossRevenue: grossRevenueCents,
        productionCost: prodCostCents,
        grossProfit: grossProfitCents,
        profitMargin: financials.profitMargin,
        paymentMethod: financials.paymentMethod,
        itemsBreakdownJson: JSON.stringify(financials.itemsBreakdown),
      })
      .returning();

    return {
      order: updatedOrder[0],
      financialRecord: financialRecord[0],
    };
  } catch {
    return {
      order: updatedOrderLocal,
      financialRecord: newFinancialRecord,
    };
  }
}
