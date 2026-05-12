"use server";

import { db } from "@/lib/db";
import { invoices, invoiceItems, clients, projects, quotations, payments, receipts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  try {
    const data = await db.select({
      id: invoices.id,
      number: invoices.number,
      date: invoices.date,
      dueDate: invoices.dueDate,
      grandTotal: invoices.grandTotal,
      paidAmount: invoices.paidAmount,
      status: invoices.status,
      clientName: clients.name,
      projectName: projects.name,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .orderBy(desc(invoices.date));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch invoices", error);
    return { success: false, error: "Failed to fetch invoices" };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const invoiceArray = await db.select().from(invoices).where(eq(invoices.id, id));
    if (invoiceArray.length === 0) return { success: false, error: "Invoice not found" };

    const invoice = invoiceArray[0];

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    const clientArray = await db.select().from(clients).where(eq(clients.id, invoice.clientId));

    return { success: true, data: { ...invoice, items, client: clientArray[0] } };
  } catch (error) {
    console.error("Failed to fetch invoice", error);
    return { success: false, error: "Failed to fetch invoice" };
  }
}

type InvoicePayload = {
  clientId: string;
  projectId?: string | null;
  quotationId?: string | null;
  number: string;
  date: string | number | Date;
  dueDate?: string | number | Date | null;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string | null;
  terms?: string | null;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
  }[];
};

export async function createInvoice(data: InvoicePayload) {
  try {
    const { clientId, projectId, quotationId, number, date, dueDate, subTotal, taxTotal, grandTotal, notes, terms, items } = data;
    const id = crypto.randomUUID();

    await db.insert(invoices).values({
      id,
      clientId,
      projectId: projectId || null,
      quotationId: quotationId || null,
      number,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      subTotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      notes,
      terms,
      status: "Draft"
    });

    for (const item of items) {
      await db.insert(invoiceItems).values({
        id: crypto.randomUUID(),
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        amount: item.amount,
      });
    }

    if (quotationId) {
      await db.update(quotations).set({ status: "Converted" }).where(eq(quotations.id, quotationId));
    }

    revalidatePath("/invoices");
    revalidatePath("/quotations");
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create invoice", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoice(id: string, data: InvoicePayload) {
  try {
    const { clientId, projectId, quotationId, number, date, dueDate, subTotal, taxTotal, grandTotal, notes, terms, items } = data;

    await db.update(invoices).set({
      clientId,
      projectId: projectId || null,
      quotationId: quotationId || null,
      number,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      subTotal,
      taxTotal,
      grandTotal,
      notes,
      terms,
    }).where(eq(invoices.id, id));

    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    for (const item of items) {
      await db.insert(invoiceItems).values({
        id: crypto.randomUUID(),
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        amount: item.amount,
      });
    }

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    revalidatePath(`/invoices/${id}/edit`);
    return { success: true, id };
  } catch (error) {
    console.error("Failed to update invoice", error);
    return { success: false, error: "Failed to update invoice" };
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    await db.update(invoices).set({ status }).where(eq(invoices.id, id));
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update status", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Check if there are payments
    const linkedPayments = await db.select().from(payments).where(eq(payments.invoiceId, id)).limit(1);
    if (linkedPayments.length > 0) {
      return { success: false, error: "Cannot delete invoice with recorded payments. Delete the payments first." };
    }

    // Delete associated receipts
    await db.delete(receipts).where(eq(receipts.invoiceId, id));
    
    // Delete items first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
    
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete invoice", error);
    return { success: false, error: "Failed to delete invoice due to a database constraint." };
  }
}
