"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const gstin = formData.get("gstin") as string;
    const billingAddress = formData.get("billingAddress") as string;
    const shippingAddress = formData.get("shippingAddress") as string;
    const notes = formData.get("notes") as string;

    if (!name || !email) {
      return { success: false, error: "Name and Email are required." };
    }

    const id = crypto.randomUUID();

    await db.insert(clients).values({
      id,
      name,
      company,
      email,
      phone,
      gstin,
      billingAddress,
      shippingAddress,
      notes,
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client. Please try again." };
  }
}
