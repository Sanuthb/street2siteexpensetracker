"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject } from "@/app/actions/create-project";

interface Client {
    id: string;
    name: string;
}

export function ProjectForm({ clients, onSuccess }: { clients: Client[], onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createProject(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("Project created successfully");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || "Failed to create project");
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input id="name" name="name" required placeholder="Website Redesign" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select name="clientId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
             {clients.map(client => (
                 <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
             ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Total Budget ($) *</Label>
          <Input id="budget" name="budget" type="number" step="0.01" required placeholder="5000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="active">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="active">Active</SelectItem>
               <SelectItem value="completed">Completed</SelectItem>
               <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform">
          {isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
