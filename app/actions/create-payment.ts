"use server";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    const amountRaw = formData.get("amount") as string;
    const method = formData.get("method") as string;
    const notes = formData.get("notes") as string;
    const dateRaw = formData.get("date") as string;

    if (!projectId || !amountRaw || !method || !dateRaw) {
      return { success: false, error: "Project, Amount, Method, and Date are required." };
    }

    const amount = parseFloat(amountRaw);
    if (isNaN(amount)) {
        return { success: false, error: "Invalid payment amount." };
    }

    const date = new Date(dateRaw);
    const id = crypto.randomUUID();

    await db.insert(payments).values({
      id,
      projectId,
      amount,
      method,
      date,
      notes,
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/client-dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create payment:", error);
    return { success: false, error: "Failed to create payment. Please try again." };
  }
}
