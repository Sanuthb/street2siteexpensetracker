"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject } from "@/app/actions/create-project";
import { editProject } from "@/app/actions/edit-delete-project";

interface Client {
    id: string;
    name: string;
}

interface ProjectData {
    id: string;
    clientId: string;
    name: string;
    budget: number;
    status: string;
    startDate: string | null;
    endDate: string | null;
}

export function ProjectForm({ clients, onSuccess, initialData }: { clients: Client[], onSuccess?: () => void, initialData?: ProjectData }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result;
      if (initialData) {
         result = await editProject(initialData.id, formData);
      } else {
         result = await createProject(formData);
      }
      
      if (result.success) {
        toast.success(initialData ? "Project updated successfully" : "Project created successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input id="name" name="name" required placeholder="Website Redesign" defaultValue={initialData?.name} className="bg-background" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select name="clientId" required defaultValue={initialData?.clientId}>
          <SelectTrigger className="bg-background">
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
          <Label htmlFor="budget">Total Budget (₹) *</Label>
          <Input id="budget" name="budget" type="number" step="0.01" required placeholder="5000" defaultValue={initialData?.budget} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={initialData?.status || "active"}>
            <SelectTrigger className="bg-background">
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
          <Input id="startDate" name="startDate" type="date" required defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ""} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ""} className="bg-background" />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Project" : "Create Project"}
      </Button>
    </form>
  );
}
