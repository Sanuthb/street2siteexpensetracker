"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function editClient(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;

    if (!name || !email) {
      return { success: false, error: "Name and Email are required" };
    }

    await db.update(clients).set({
      name,
      email,
      phone: phone || null,
      company: company || null
    }).where(eq(clients.id, id));

    revalidatePath("/clients");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
    try {
        await db.delete(clients).where(eq(clients.id, id));
        revalidatePath("/clients");
        revalidatePath("/projects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete client:", error);
        return { success: false, error: "Failed to delete client. Check if there are foreign key constraints." };
    }
}
