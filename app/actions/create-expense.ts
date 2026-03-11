"use server";

import { db } from "@/lib/db";
import { expenses, files } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    let category = formData.get("category") as string;
    const customCategory = formData.get("customCategory") as string;
    
    if (category === "Other" && customCategory) {
        category = customCategory;
    }

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

    // Handle File Upload to Database
    if (receiptFile && receiptFile.size > 0) {
       try {
           const buffer = Buffer.from(await receiptFile.arrayBuffer());
           const fileId = crypto.randomUUID();
           
           await db.insert(files).values({
               id: fileId,
               projectId,
               fileName: receiptFile.name,
               content: buffer,
               mimeType: receiptFile.type,
               type: 'receipt',
               uploadedAt: new Date()
           });
           
           receiptUrl = `/api/files/${fileId}`;
       } catch (fileErr) {
           console.error("Database file storage error:", fileErr);
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
