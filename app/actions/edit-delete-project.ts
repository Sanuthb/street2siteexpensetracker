"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function editProject(id: string, formData: FormData) {
  try {
    const clientId = formData.get("clientId") as string;
    const name = formData.get("name") as string;
    const budgetRaw = formData.get("budget") as string;
    const status = formData.get("status") as "active" | "completed" | "on_hold";
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;

    if (!clientId || !name || !budgetRaw) {
      return { success: false, error: "Client, Project Name, and Budget are required." };
    }

    const budget = parseFloat(budgetRaw);
    if (isNaN(budget)) {
      return { success: false, error: "Invalid budget amount." };
    }

    const startDate = startDateRaw || null;
    const endDate = endDateRaw || null;

    await db.update(projects).set({
      clientId,
      name,
      budget,
      status,
      startDate,
      endDate
    }).where(eq(projects.id, id));

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
    try {
        await db.delete(projects).where(eq(projects.id, id));
        revalidatePath("/projects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { success: false, error: "Failed to delete project. Check if there are related payments or expenses." };
    }
}
