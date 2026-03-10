"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/forms/payment-form";
import { deletePayment } from "@/app/actions/edit-delete-payment";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Project {
    id: string;
    name: string;
}

interface Payment {
    id: string;
    projectId: string;
    amount: number;
    method: string;
    date: Date | string;
    notes: string | null;
    projectName: string | null;
    clientName: string | null;
}

export function PaymentActions({ payment, projects }: { payment: Payment, projects: Project[] }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this payment record?")) {
        const result = await deletePayment(payment.id);
        if (result.success) {
            toast.success("Payment deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete payment");
        }
    }
  };

  const paymentDataForEdit = {
      ...payment,
      projectId: payment.projectId || projects[0]?.id || "",
      date: new Date(payment.date).toISOString().split('T')[0]
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border/50">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setViewOpen(true)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Payment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground transition-colors">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Payment Receipt
            </DialogTitle>
            <DialogDescription>Details of the logged transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm uppercase tracking-wider">Amount Received</span>
                <span className="text-xl font-bold text-emerald-500 tracking-tight">₹{payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                <div className="font-medium text-foreground">{format(new Date(payment.date), 'MMMM dd, yyyy')}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Client</Label>
                <div className="font-medium text-foreground">{payment.clientName || "-"}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Project</Label>
                <div className="font-medium text-foreground">{payment.projectName || "-"}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payment Method</Label>
                <div className="font-medium text-foreground capitalize">{payment.method}</div>
            </div>
            <div className="space-y-1 pt-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Notes</Label>
                <div className="font-medium text-muted-foreground text-sm italic">{payment.notes || "No additional notes provided."}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Modify transaction details below.</DialogDescription>
          </DialogHeader>
          <PaymentForm initialData={paymentDataForEdit} projects={projects} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
