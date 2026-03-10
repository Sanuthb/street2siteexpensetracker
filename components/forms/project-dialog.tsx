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
import { ProjectForm } from "./project-form";

interface Client { id: string; name: string; }

export function ProjectDialog({ clients, triggerVariant = "default" }: { clients: Client[], triggerVariant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "outline" ? (
             <Button variant="outline" className="border-border/50 bg-card hover:bg-accent/50">
                <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
        ) : (
            <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project tracking budget and timeline.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm clients={clients} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
