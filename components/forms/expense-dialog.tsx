"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";

interface Project { id: string; name: string; }

export function ExpenseDialog({ projects, triggerVariant = "default" }: { projects: Project[], triggerVariant?: "default" | "outline" | "ghost" }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "outline" ? (
             <Button variant="outline" className="border-border/50 bg-card hover:bg-accent/50">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
        ) : triggerVariant === "ghost" ? (
             <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                <Plus className="mr-2 h-4 w-4" /> Add Exp
            </Button>
        ) : (
            <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Log Expense</DialogTitle>
          <DialogDescription>
            Enter expense details and upload the receipt if available.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm projects={projects} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
