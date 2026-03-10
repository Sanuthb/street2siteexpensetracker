"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense } from "@/app/actions/create-expense";

interface Project {
    id: string;
    name: string;
}

export function ExpenseForm({ projects, onSuccess }: { projects: Project[], onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createExpense(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("Expense logged successfully");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || "Failed to log expense");
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="subject">Subject *</Label>
          <Input id="subject" name="subject" required placeholder="Server Hosting" />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="merchant">Merchant *</Label>
          <Input id="merchant" name="merchant" required placeholder="AWS" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($) *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="50.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="Hosting">Hosting</SelectItem>
               <SelectItem value="Domain">Domain</SelectItem>
               <SelectItem value="Development">Development</SelectItem>
               <SelectItem value="Design">Design</SelectItem>
               <SelectItem value="Marketing">Marketing</SelectItem>
               <SelectItem value="Advertising">Advertising</SelectItem>
               <SelectItem value="Travel">Travel</SelectItem>
               <SelectItem value="Software">Software</SelectItem>
               <SelectItem value="Misc">Misc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectId">Project Assign (Optional)</Label>
          <Select name="projectId">
            <SelectTrigger>
              <SelectValue placeholder="General / Internal" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="unassigned">General / Internal</SelectItem>
               {projects.map(p => (
                   <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
               ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" required placeholder="Describe what this expense is for..." />
      </div>
      <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border border-dashed">
        <Label htmlFor="receipt">Upload Receipt/Invoice (Optional)</Label>
        <Input id="receipt" name="receipt" type="file" accept="image/*,.pdf" className="cursor-pointer bg-background" />
        <p className="text-xs text-muted-foreground mt-1 text-right">Max size: 5MB</p>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform">
          {isPending ? "Logging..." : "Log Expense"}
        </Button>
      </div>
    </form>
  );
}
