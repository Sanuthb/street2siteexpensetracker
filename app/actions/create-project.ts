"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const clientId = formData.get("clientId") as string;
    const budgetRaw = formData.get("budget") as string;
    const status = formData.get("status") as string || "active";
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;

    if (!name || !clientId || !budgetRaw || !startDateRaw) {
      return { success: false, error: "Name, Client, Budget, and Start Date are required." };
    }

    const budget = parseFloat(budgetRaw);
    if (isNaN(budget)) {
        return { success: false, error: "Invalid budget amount." };
    }

    const startDate = new Date(startDateRaw);
    const endDate = endDateRaw ? new Date(endDateRaw) : null;

    const id = crypto.randomUUID();

    await db.insert(projects).values({
      id,
      name,
      clientId,
      budget,
      status,
      startDate,
      endDate: endDate || undefined,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/client-dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project. Please try again." };
  }
}
