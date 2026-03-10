"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { eq } from "drizzle-orm";

export async function uploadProjectInvoice(formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    const invoiceFile = formData.get("invoice") as File | null;

    if (!projectIdRaw || !invoiceFile || invoiceFile.size === 0) {
      return { success: false, error: "Project ID and Invoice file are required." };
    }

    let invoiceUrl = null;

    // Handle File Upload to /public/uploads/invoices
    try {
        const buffer = Buffer.from(await invoiceFile.arrayBuffer());
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "invoices");
        
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const filename = `${Date.now()}-${invoiceFile.name.replace(/\s+/g, '-')}`;
        const filepath = path.join(uploadsDir, filename);
        
        await writeFile(filepath, buffer);
        invoiceUrl = `/uploads/invoices/${filename}`;
    } catch (fileErr) {
        console.error("File upload error:", fileErr);
        return { success: false, error: "Failed to upload file to server." };
    }

    // Update Project row with invoiceUrl
    await db.update(projects)
      .set({ invoiceUrl })
      .where(eq(projects.id, projectIdRaw));

    revalidatePath(`/projects/${projectIdRaw}`);
    revalidatePath("/projects");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to upload project invoice:", error);
    return { success: false, error: "An unexpected error occurred uploading the invoice." };
  }
}
