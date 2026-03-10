"use server";

import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function editExpense(id: string, formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const amountRaw = formData.get("amount") as string;
    const dateRaw = formData.get("date") as string;
    const subject = formData.get("subject") as string || "General Expense";
    const merchant = formData.get("merchant") as string || "Unknown Merchant";

    if (!category || !description || !amountRaw || !dateRaw) {
      return { success: false, error: "Category, Description, Amount, and Date are required." };
    }

    const amount = parseFloat(amountRaw);
    if (isNaN(amount)) {
        return { success: false, error: "Invalid expense amount." };
    }

    const date = new Date(dateRaw);
    const projectId = projectIdRaw && projectIdRaw !== "unassigned" ? projectIdRaw : null;
    
    // Note: We are not handling receiptUrl edits in this basic method right now. For simplicity, we just leave the previous URL alone if it existed.
    // Uploading new files on edit can be complicated without specialized handling for deletions.

    await db.update(expenses).set({
      projectId,
      category,
      description,
      amount,
      date,
      subject,
      merchant,
      // Leaving receiptUrl unmodified to ensure we don't accidentally wipe it out
    }).where(eq(expenses.id, id));

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/client-dashboard");
    if (projectId) revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to edit expense:", error);
    return { success: false, error: "Failed to update expense. Please try again." };
  }
}
