"use server";

import { db } from "@/lib/db";
import { receipts, invoices, payments, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReceipts() {
  try {
    const data = await db.select({
      id: receipts.id,
      number: receipts.number,
      amount: receipts.amount,
      date: receipts.date,
      paymentMethod: receipts.paymentMethod,
      invoiceNumber: invoices.number,
      clientName: clients.name,
    })
    .from(receipts)
    .leftJoin(invoices, eq(receipts.invoiceId, invoices.id))
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(receipts.date));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch receipts", error);
    return { success: false, error: "Failed to fetch receipts" };
  }
}

export async function createReceipt(data: any) {
  try {
    const { invoiceId, number, amount, date, notes, paymentMethod } = data;
    
    // Fetch invoice to get projectId
    const invRes = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    const invoice = invRes[0];
    const projectId = invoice?.projectId || null;

    // First, log the payment
    const paymentId = crypto.randomUUID();
    await db.insert(payments).values({
      id: paymentId,
      projectId: projectId as any, // Cast to bypass potential null constraint in TS if needed, but we pass null if it's null
      invoiceId,
      amount,
      method: paymentMethod,
      date: new Date(date),
      notes
    });

    // Generate receipt
    const receiptId = crypto.randomUUID();
    await db.insert(receipts).values({
      id: receiptId,
      invoiceId,
      paymentId,
      number,
      amount,
      date: new Date(date),
      notes,
      paymentMethod
    });

    // Update invoice paidAmount and status
    const invoiceArray = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (invoiceArray.length > 0) {
      const invoice = invoiceArray[0];
      const newPaidAmount = invoice.paidAmount + amount;
      const newStatus = newPaidAmount >= invoice.grandTotal ? "Paid" : "Partially Paid";

      await db.update(invoices).set({ 
        paidAmount: newPaidAmount,
        status: newStatus 
      }).where(eq(invoices.id, invoiceId));
    }

    revalidatePath("/receipts");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, id: receiptId };
  } catch (error) {
    console.error("Failed to create receipt", error);
    return { success: false, error: "Failed to create receipt" };
  }
}

export async function deleteReceipt(id: string) {
  try {
    // Need to decrement invoice paidAmount before deleting
    const receiptArray = await db.select().from(receipts).where(eq(receipts.id, id));
    if (receiptArray.length > 0) {
      const receipt = receiptArray[0];
      const invoiceArray = await db.select().from(invoices).where(eq(invoices.id, receipt.invoiceId));
      
      if (invoiceArray.length > 0) {
        const invoice = invoiceArray[0];
        const newPaidAmount = Math.max(0, invoice.paidAmount - receipt.amount);
        const newStatus = newPaidAmount === 0 ? "Draft" : (newPaidAmount >= invoice.grandTotal ? "Paid" : "Partially Paid");

        await db.update(invoices).set({
          paidAmount: newPaidAmount,
          status: newStatus
        }).where(eq(invoices.id, receipt.invoiceId));
      }

      if (receipt.paymentId) {
        await db.delete(payments).where(eq(payments.id, receipt.paymentId));
      }
    }

    await db.delete(receipts).where(eq(receipts.id, id));
    revalidatePath("/receipts");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete receipt", error);
    return { success: false, error: "Failed to delete receipt" };
  }
}

export async function getReceiptsByInvoiceId(invoiceId: string) {
  try {
    const data = await db.select().from(receipts).where(eq(receipts.invoiceId, invoiceId)).orderBy(desc(receipts.date));
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch invoice receipts", error);
    return { success: false, error: "Failed to fetch invoice receipts" };
  }
}
