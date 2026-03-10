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
import { createPayment } from "@/app/actions/create-payment";

interface Project {
    id: string;
    name: string;
}

export function PaymentForm({ projects, onSuccess }: { projects: Project[], onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createPayment(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("Payment recorded successfully");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || "Failed to record payment");
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">Project *</Label>
        <Select name="projectId" required>
          <SelectTrigger>
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
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="1000.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date Received *</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="method">Payment Method *</Label>
        <Select name="method" required>
          <SelectTrigger>
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
        <Textarea id="notes" name="notes" placeholder="Invoice #1234 referenced" />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform">
          {isPending ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
