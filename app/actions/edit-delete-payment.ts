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
        await db.delete(payments).where(eq(payments.id, id));
        revalidatePath("/payments");
        revalidatePath("/dashboard");
        // Cannot reliably target specific project revalidate here without an extra fetch, but dashboard/payments covers most bases
        return { success: true };
    } catch (error) {
        console.error("Failed to delete payment:", error);
        return { success: false, error: "Failed to delete payment." };
    }
}
