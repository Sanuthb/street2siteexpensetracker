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
import { ProjectForm } from "@/components/forms/project-form";
import { deleteProject } from "@/app/actions/edit-delete-project";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Client {
    id: string;
    name: string;
}

interface Project {
    id: string;
    clientId: string;
    name: string;
    budget: number;
    status: string;
    startDate: string | null;
    endDate: string | null;
}

export function ProjectActions({ project, clients }: { project: Project, clients: Client[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
        const result = await deleteProject(project.id);
        if (result.success) {
            toast.success("Project deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete project");
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
          <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
            <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground transition-colors">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Make changes to the project settings.</DialogDescription>
          </DialogHeader>
          <ProjectForm initialData={project} clients={clients} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
