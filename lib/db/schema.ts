import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
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
  createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`)
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
  fileUrl: text('file_url').notNull(),
  type: text('type').notNull(), // invoice, receipt, contract, misc
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
});
