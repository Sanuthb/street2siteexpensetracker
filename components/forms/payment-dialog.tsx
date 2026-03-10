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
import { PaymentForm } from "./payment-form";

interface Project { id: string; name: string; }

export function PaymentDialog({ projects, triggerVariant = "default" }: { projects: Project[], triggerVariant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "outline" ? (
             <Button variant="outline" className="border-border/50 bg-card hover:bg-accent/50">
                <Plus className="mr-2 h-4 w-4" /> Add Payment
            </Button>
        ) : (
            <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a payment received from a client for a project.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm projects={projects} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
