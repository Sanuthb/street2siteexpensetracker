"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function DownloadPdfButton({ type, data }: { type: 'invoice' | 'quotation' | 'receipt', data: any }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF...");
    
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button variant="outline" className="shadow-sm" onClick={handleDownload} disabled={isDownloading}>
      <Download className="mr-2 h-4 w-4" /> {isDownloading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
