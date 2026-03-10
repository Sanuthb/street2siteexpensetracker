"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/app/actions/create-client";
import { editClient } from "@/app/actions/edit-delete-client";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
  };
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result;
      if (initialData) {
         result = await editClient(initialData.id, formData);
      } else {
         result = await createClient(formData);
      }
      
      if (result.success) {
        toast.success(initialData ? "Client updated successfully" : "Client created successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required placeholder="John Doe" defaultValue={initialData?.name} className="bg-background" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" required placeholder="john@example.com" defaultValue={initialData?.email} className="bg-background" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" defaultValue={initialData?.phone || ""} className="bg-background" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" placeholder="Acme Inc." defaultValue={initialData?.company || ""} className="bg-background" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Client" : "Create Client"}
      </Button>
    </form>
  );
}
