"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPayment } from "@/app/actions/create-payment";
import { editPayment } from "@/app/actions/edit-delete-payment";

interface Project {
    id: string;
    name: string;
}

interface PaymentData {
    id: string;
    projectId: string;
    amount: number;
    method: string;
    date: string | null;
    notes: string | null;
}

export function PaymentForm({ projects, onSuccess, initialData }: { projects: Project[], onSuccess?: () => void, initialData?: PaymentData }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result;
      if (initialData) {
         result = await editPayment(initialData.id, formData);
      } else {
         result = await createPayment(formData);
      }
      
      if (result.success) {
        toast.success(initialData ? "Payment updated successfully" : "Payment tracked successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">Project *</Label>
        <Select name="projectId" required defaultValue={initialData?.projectId || (projects.length === 1 ? projects[0].id : undefined)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
             {projects.map(p => (
                 <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
             ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($) *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="1000" defaultValue={initialData?.amount} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Payment Date *</Label>
          <Input id="date" name="date" type="date" required defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ""} className="bg-background" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="method">Payment Method *</Label>
        <Select name="method" required defaultValue={initialData?.method || "Bank Transfer"}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="Stripe">Stripe</SelectItem>
             <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
             <SelectItem value="UPI">UPI</SelectItem>
             <SelectItem value="Cash">Cash</SelectItem>
             <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Invoice #123 payment" defaultValue={initialData?.notes || ""} className="bg-background" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Payment" : "Track Payment"}
      </Button>
    </form>
  );
}
