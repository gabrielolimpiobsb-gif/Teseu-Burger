import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address'),
  deliveryMethod: text('delivery_method').notNull().default('delivery'),
  paymentMethod: text('payment_method').notNull().default('pix'),
  status: text('status').notNull().default('awaiting_payment'),
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  total: integer('total').notNull(),
  notes: text('notes'),
  itemsJson: text('items_json').notNull(),
  productionCost: integer('production_cost'),
  grossProfit: integer('gross_profit'),
  profitMargin: text('profit_margin'),
  paymentConfirmedAt: timestamp('payment_confirmed_at'),
  preparedAt: timestamp('prepared_at'),
  dispatchedAt: timestamp('dispatched_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const financialRecords = pgTable('financial_records', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  orderNumber: text('order_number').notNull(),
  grossRevenue: integer('gross_revenue').notNull(),
  productionCost: integer('production_cost').notNull(),
  grossProfit: integer('gross_profit').notNull(),
  profitMargin: text('profit_margin').notNull(),
  paymentMethod: text('payment_method').notNull(),
  itemsBreakdownJson: text('items_breakdown_json').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

export const menuOverrides = pgTable('menu_overrides', {
  id: serial('id').primaryKey(),
  itemId: text('item_id').notNull().unique(),
  name: text('name'),
  description: text('description'),
  price: integer('price'), // in cents
  costPrice: integer('cost_price'), // in cents (production cost / CMV)
  isAvailable: integer('is_available').notNull().default(1), // 1 = active, 0 = sold out
  imageUrl: text('image_url'), // String path/URL only (code-only changes)
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: text('product_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  productId: text('product_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  favorites: many(favorites),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  financialRecord: one(financialRecords, {
    fields: [orders.id],
    references: [financialRecords.orderId],
  }),
}));

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  order: one(orders, {
    fields: [financialRecords.orderId],
    references: [orders.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));
