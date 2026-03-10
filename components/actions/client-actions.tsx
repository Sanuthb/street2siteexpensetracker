"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { deleteClient } from "@/app/actions/edit-delete-client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
}

export function ClientActions({ client }: { client: Client }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this client?")) {
        const result = await deleteClient(client.id);
        if (result.success) {
            toast.success("Client deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete client");
        }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border/50">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setViewOpen(true)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Client
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground transition-colors">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>Overview of client information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                <div className="font-medium text-foreground">{client.name}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                <div className="font-medium text-foreground">{client.email}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone Number</Label>
                <div className="font-medium text-foreground">{client.phone || "-"}</div>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Company</Label>
                <div className="font-medium text-foreground">{client.company || "-"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Make changes to the client profile here.</DialogDescription>
          </DialogHeader>
          <ClientForm initialData={client} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
