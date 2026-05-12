"use server";

import { db } from "@/lib/db";
import { taxes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTaxes() {
  try {
    const data = await db.select().from(taxes);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch taxes", error);
    return { success: false, error: "Failed to fetch taxes" };
  }
}

export async function createTax(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const rate = parseFloat(formData.get("rate") as string);
    const type = formData.get("type") as string;

    if (!name || isNaN(rate) || !type) {
      return { success: false, error: "Name, Rate, and Type are required." };
    }

    const id = crypto.randomUUID();

    await db.insert(taxes).values({
      id,
      name,
      rate,
      type,
      isActive: true,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to create tax:", error);
    return { success: false, error: "Failed to create tax" };
  }
}

export async function deleteTax(id: string) {
  try {
    await db.delete(taxes).where(eq(taxes.id, id));
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tax:", error);
    return { success: false, error: "Failed to delete tax" };
  }
}
