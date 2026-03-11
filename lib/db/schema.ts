import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'), // 'admin' or 'client'
});

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  clientId: text('client_id').references(() => clients.id).notNull(),
  budget: real('budget').notNull(),
  status: text("status").default("active").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  invoiceUrl: text("invoice_url"),
  shareToken: text("share_token").unique(),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  amount: real('amount').notNull(),
  method: text('method').notNull(), // UPI, Bank Transfer, Stripe, Cash
  date: integer('date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id), // Nullable for general expenses
  subject: text('subject').notNull().default(''),
  merchant: text('merchant').notNull().default(''),
  category: text('category').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  receiptUrl: text('receipt_url'),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  fileName: text('file_name').notNull(),
  content: blob('content').notNull(),
  mimeType: text('mime_type').notNull(),
  type: text('type').notNull(), // invoice, receipt, contract, misc
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  theme: text('theme').notNull().default('dark'),
  currency: text('currency').notNull().default('inr'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
  invoiceAlerts: integer('invoice_alerts', { mode: 'boolean' }).notNull().default(true),
});
