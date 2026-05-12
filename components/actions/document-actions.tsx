"use client";

import { MoreHorizontal, Pencil, Trash2, Eye, CreditCard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteInvoice, updateInvoiceStatus } from "@/lib/actions/invoices";
import { deleteQuotation, updateQuotationStatus } from "@/lib/actions/quotations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface DocumentActionsProps {
  id: string;
  type: 'invoice' | 'quotation';
  status?: string;
}

export function DocumentActions({ id, type, status }: DocumentActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const promise = type === 'invoice' ? deleteInvoice(id) : deleteQuotation(id);
    
    try {
      const res = await promise;
      if (res.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        router.push(type === 'invoice' ? '/invoices' : '/quotations');
      } else {
        toast.error(res.error || `Failed to delete ${type}`);
      }
    } catch {
      toast.error(`An unexpected error occurred`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    const promise = type === 'invoice' ? updateInvoiceStatus(id, newStatus) : updateQuotationStatus(id, newStatus);
    
    try {
      const res = await promise;
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(res.error || `Failed to update status`);
      }
    } catch {
      toast.error(`An unexpected error occurred`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/${type}s/${id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Link>
        </DropdownMenuItem>
        
        {type === 'invoice' && status !== 'Paid' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate('Paid')} disabled={isUpdating}>
            <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
          </DropdownMenuItem>
        )}

        {status === 'Draft' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate(type === 'invoice' ? 'Sent' : 'Sent')} disabled={isUpdating}>
            <Send className="mr-2 h-4 w-4" /> Mark as Sent
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href={`/${type}s/${id}/edit`} className="flex items-center">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDelete} 
          className="text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete Permanently"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
