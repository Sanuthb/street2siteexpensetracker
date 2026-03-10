"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, ReceiptText } from "lucide-react";
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
import { ExpenseForm } from "@/components/forms/expense-form";
import { deleteExpense } from "@/app/actions/delete-expense";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    name: string;
}

interface Expense {
    id: string;
    projectId: string | null;
    subject: string;
    merchant: string;
    description: string;
    amount: number;
    category: string;
    date: Date | string;
    receiptUrl: string | null;
    projectName: string | null;
    clientName: string | null;
}

export function ExpenseActions({ expense, projects }: { expense: Expense, projects: Project[] }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this expense log?")) {
        const result = await deleteExpense(expense.id);
        if (result.success) {
            toast.success("Expense deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete expense");
        }
    }
  };

  const expenseDataForEdit = {
      ...expense,
      date: new Date(expense.date).toISOString().split('T')[0]
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
            <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Expense
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground transition-colors">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-rose-500" />
                Expense Details
            </DialogTitle>
            <DialogDescription>Review logged transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="font-semibold text-lg">{expense.subject}</span>
                <span className="text-xl font-bold tracking-tight">₹{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                    <div className="font-medium text-foreground">{format(new Date(expense.date), 'MMM dd, yyyy')}</div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Merchant</Label>
                    <div className="font-medium text-foreground">{expense.merchant}</div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
                    <div className="font-medium text-foreground"><Badge variant="outline">{expense.category}</Badge></div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Project</Label>
                    <div className="font-medium text-foreground">{expense.projectName || "General/Internal"}</div>
                </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-border/50">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                <div className="font-medium text-muted-foreground text-sm">{expense.description || "No description provided."}</div>
            </div>
            {expense.receiptUrl && (
                <div className="space-y-1 pt-2 border-t border-border/50">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Attached Receipt</Label>
                    <div className="pt-1">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" /> View Receipt Document
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Modify the expense record.</DialogDescription>
          </DialogHeader>
          <ExpenseForm initialData={expenseDataForEdit} projects={projects} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
