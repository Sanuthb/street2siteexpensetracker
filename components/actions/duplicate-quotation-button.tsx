"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { duplicateQuotation } from "@/lib/actions/quotations";

export function DuplicateQuotationButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(async () => {
        const result = await duplicateQuotation(id);
        if (result.success && result.id) {
          toast.success("Quotation duplicated.");
          router.push(`/quotations/${result.id}`);
        } else {
          toast.error(result.error || "Failed to duplicate quotation.");
        }
      })}
    >
      <Copy className="mr-2 h-4 w-4" />
      Duplicate
    </Button>
  );
}
