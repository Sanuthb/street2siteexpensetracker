import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const fileId = resolvedParams.id;

    const fileResults = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
    const file = fileResults[0];

    if (!file || !file.content) {
      return new NextResponse("File not found", { status: 404 });
    }

    return new Response(file.content as any, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${file.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file from DB:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
