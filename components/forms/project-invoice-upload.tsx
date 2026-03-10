"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadProjectInvoice } from "@/app/actions/upload-project-invoice";

export function ProjectInvoiceUpload({ projectId, invoiceUrl }: { projectId: string; invoiceUrl?: string | null }) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     const formData = new FormData();
     formData.append("projectId", projectId);
     formData.append("invoice", file);

     startTransition(async () => {
         const result = await uploadProjectInvoice(formData);
         if (result.success) {
            toast.success("Invoice uploaded successfully");
            if (fileInputRef.current) fileInputRef.current.value = "";
         } else {
            toast.error(result.error || "Failed to upload invoice");
         }
     });
  };

  return (
      <div className="flex items-center gap-3">
         {invoiceUrl && (
            <Button variant="outline" className="border-border/50 bg-card hover:bg-accent/50 text-foreground" asChild>
                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" /> View Invoice
                </a>
            </Button>
         )}

         <div>
             <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUpload} disabled={isPending} />
             <Button variant="outline" className="border-border/50 bg-card hover:bg-accent/50 text-primary" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                 {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                 {invoiceUrl ? "Replace Invoice" : "Upload Invoice"}
             </Button>
         </div>
      </div>
  );
}
