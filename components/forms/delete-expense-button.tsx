"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteExpense } from "@/app/actions/delete-expense";

export function DeleteExpenseButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this expense? This cannot be undone.")) {
            startTransition(async () => {
                const result = await deleteExpense(id);
                if (result.success) {
                    toast.success("Expense deleted");
                } else {
                    toast.error(result.error || "Failed to delete expense");
                }
            });
        }
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
