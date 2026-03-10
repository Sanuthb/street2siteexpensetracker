"use server";

import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteExpense(expenseId: string) {
  try {
    if (!expenseId) {
      return { success: false, error: "Expense ID is required." };
    }

    await db.delete(expenses).where(eq(expenses.id, expenseId));

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/client-dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: "Failed to delete expense. Please try again." };
  }
}
