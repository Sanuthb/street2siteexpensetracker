"use server";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function editPayment(id: string, formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    const amountRaw = formData.get("amount") as string;
    const method = formData.get("method") as string;
    const dateRaw = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    if (!projectIdRaw || !amountRaw || !method || !dateRaw) {
      return { success: false, error: "Project, Amount, Method, and Date are required." };
    }

    const amount = parseFloat(amountRaw);
    if (isNaN(amount)) {
        return { success: false, error: "Invalid payment amount." };
    }

    const date = new Date(dateRaw);
    const projectId = projectIdRaw !== "unassigned" ? projectIdRaw : null;
    
    // Payments enforce non-null project_id at DB layer currently, so passing null will throw DB error if unassigned was chosen
    if (!projectId) {
        return { success: false, error: "Payment must be assigned to a project." };
    }

    await db.update(payments).set({
      projectId,
      amount,
      method,
      date,
      notes: notes || null
    }).where(eq(payments.id, id));

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to edit payment:", error);
    return { success: false, error: "Failed to update payment" };
  }
}

export async function deletePayment(id: string) {
    try {
        // 1. Check if there's an associated receipt
        const { receipts, invoices } = await import("@/lib/db/schema");
        const receiptResult = await db.select().from(receipts).where(eq(receipts.paymentId, id)).limit(1);
        
        if (receiptResult.length > 0) {
            const receipt = receiptResult[0];
            
            // 2. Decrement invoice paidAmount
            const invoiceResult = await db.select().from(invoices).where(eq(invoices.id, receipt.invoiceId)).limit(1);
            if (invoiceResult.length > 0) {
                const invoice = invoiceResult[0];
                const newPaidAmount = Math.max(0, invoice.paidAmount - receipt.amount);
                const newStatus = newPaidAmount === 0 ? "Draft" : (newPaidAmount >= invoice.grandTotal ? "Paid" : "Partially Paid");

                await db.update(invoices).set({
                    paidAmount: newPaidAmount,
                    status: newStatus
                }).where(eq(invoices.id, invoice.id));
            }

            // 3. Delete receipt
            await db.delete(receipts).where(eq(receipts.id, receipt.id));
        }

        // 4. Delete payment record
        await db.delete(payments).where(eq(payments.id, id));
        
        revalidatePath("/payments");
        revalidatePath("/dashboard");
        revalidatePath("/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete payment:", error);
        return { success: false, error: "Failed to delete payment due to linked records." };
    }
}
