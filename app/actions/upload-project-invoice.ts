"use server";

import { db } from "@/lib/db";
import { projects, files } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function uploadProjectInvoice(formData: FormData) {
  try {
    const projectIdRaw = formData.get("projectId") as string;
    const invoiceFile = formData.get("invoice") as File | null;

    if (!projectIdRaw || !invoiceFile || invoiceFile.size === 0) {
      return { success: false, error: "Project ID and Invoice file are required." };
    }

    let invoiceUrl = null;

    // Handle File Upload to Database
    try {
        const buffer = Buffer.from(await invoiceFile.arrayBuffer());
        const fileId = crypto.randomUUID();
        
        await db.insert(files).values({
            id: fileId,
            projectId: projectIdRaw,
            fileName: invoiceFile.name,
            content: buffer,
            mimeType: invoiceFile.type,
            type: 'invoice',
            uploadedAt: new Date()
        });
        
        invoiceUrl = `/api/files/${fileId}`;
    } catch (fileErr) {
        console.error("Database file storage error:", fileErr);
        return { success: false, error: "Failed to store file in database." };
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
