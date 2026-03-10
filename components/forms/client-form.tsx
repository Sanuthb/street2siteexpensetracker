"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/app/actions/create-client";

export function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createClient(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("Client added successfully");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || "Failed to add client");
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name *</Label>
        <Input id="name" name="name" required placeholder="Acme Corp" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input id="email" name="email" type="email" required placeholder="contact@acme.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" placeholder="Acme Corporation" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform">
          {isPending ? "Adding..." : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
