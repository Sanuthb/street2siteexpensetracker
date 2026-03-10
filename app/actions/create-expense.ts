"use server";

import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function createExpense(formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const amountRaw = formData.get("amount") as string;
    const dateRaw = formData.get("date") as string;
    const subject = formData.get("subject") as string || "General Expense";
    const merchant = formData.get("merchant") as string || "Unknown Merchant";
    const receiptFile = formData.get("receipt") as File | null;

    if (!category || !description || !amountRaw || !dateRaw) {
      return { success: false, error: "Category, Description, Amount, and Date are required." };
    }

    const amount = parseFloat(amountRaw);
    if (isNaN(amount)) {
        return { success: false, error: "Invalid expense amount." };
    }

    const date = new Date(dateRaw);
    const id = crypto.randomUUID();
    const projectId = projectIdRaw && projectIdRaw !== "unassigned" ? projectIdRaw : null;

    let receiptUrl = null;

    // Handle File Upload to /public/uploads
    if (receiptFile && receiptFile.size > 0) {
       try {
           const buffer = Buffer.from(await receiptFile.arrayBuffer());
           const uploadsDir = path.join(process.cwd(), "public", "uploads");
           
           if (!existsSync(uploadsDir)) {
               await mkdir(uploadsDir, { recursive: true });
           }

           const filename = `${Date.now()}-${receiptFile.name.replace(/\s+/g, '-')}`;
           const filepath = path.join(uploadsDir, filename);
           
           await writeFile(filepath, buffer);
           receiptUrl = `/uploads/${filename}`;
       } catch (fileErr) {
           console.error("File upload error:", fileErr);
           // We can proceed without the file if it fails, or return error. 
           // Proceeding for better UX but logging error.
       }
    }

    await db.insert(expenses).values({
      id,
      projectId,
      category,
      description,
      amount,
      date,
      subject,
      merchant,
      receiptUrl,
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/client-dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, error: "Failed to create expense. Please try again." };
  }
}
