"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { convertToInvoice } from "@/lib/actions/quotations";
import { toast } from "sonner";

export function ConvertQuotationButton({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    setIsLoading(true);
    const res = await convertToInvoice(quotationId);
    
    if (res.success) {
      toast.success("Converted to invoice successfully!");
      router.push(`/invoices/${res.invoiceId}`);
    } else {
      toast.error(res.error || "Failed to convert quotation");
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleConvert} 
      disabled={isLoading}
      className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
    >
      {isLoading ? "Converting..." : "Convert to Invoice"} <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
