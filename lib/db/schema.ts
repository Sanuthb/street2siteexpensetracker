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
  gstin: text('gstin'),
  billingAddress: text('billing_address'),
  shippingAddress: text('shipping_address'),
  notes: text('notes'),
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
  projectId: text('project_id').references(() => projects.id),
  invoiceId: text('invoice_id'), // Will reference invoices.id, defined below
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
  companyName: text('company_name'),
  companyAddress: text('company_address'),
  companyPhone: text('company_phone'),
  companyEmail: text('company_email'),
  companyGstin: text('company_gstin'),
  companyLogoUrl: text('company_logo_url'),
  signatureUrl: text('signature_url'),
  invoicePrefix: text('invoice_prefix').default('INV-'),
  quotationPrefix: text('quotation_prefix').default('QUO-'),
  receiptPrefix: text('receipt_prefix').default('REC-'),
  accountName: text('account_name'),
  accountNumber: text('account_number'),
  ifscCode: text('ifsc_code'),
  upiId: text('upi_id'),
});

export const taxes = sqliteTable('taxes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  rate: real('rate').notNull(),
  type: text('type').notNull(), // GST, CGST, SGST, IGST, TDS, VAT
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const quotations = sqliteTable('quotations', {
  id: text('id').primaryKey(),
  clientId: text('client_id').references(() => clients.id).notNull(),
  projectId: text('project_id').references(() => projects.id),
  number: text('number').notNull().unique(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  validUntil: integer('valid_until', { mode: 'timestamp' }),
  subTotal: real('sub_total').notNull(),
  taxTotal: real('tax_total').notNull(),
  grandTotal: real('grand_total').notNull(),
  notes: text('notes'),
  terms: text('terms'),
  status: text('status').notNull().default('Draft'), // Draft, Sent, Approved, Rejected, Converted
});

export const quotationItems = sqliteTable('quotation_items', {
  id: text('id').primaryKey(),
  quotationId: text('quotation_id').references(() => quotations.id).notNull(),
  description: text('description').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  taxRate: real('tax_rate').notNull().default(0),
  amount: real('amount').notNull(),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  clientId: text('client_id').references(() => clients.id).notNull(),
  projectId: text('project_id').references(() => projects.id),
  quotationId: text('quotation_id').references(() => quotations.id),
  number: text('number').notNull().unique(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  subTotal: real('sub_total').notNull(),
  taxTotal: real('tax_total').notNull(),
  grandTotal: real('grand_total').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  notes: text('notes'),
  terms: text('terms'),
  status: text('status').notNull().default('Draft'), // Draft, Sent, Partially Paid, Paid, Overdue
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id).notNull(),
  description: text('description').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  taxRate: real('tax_rate').notNull().default(0),
  amount: real('amount').notNull(),
});

export const receipts = sqliteTable('receipts', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id).notNull(),
  paymentId: text('payment_id').references(() => payments.id), // Link to payment log
  number: text('number').notNull().unique(),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
  paymentMethod: text('payment_method').notNull(),
});
