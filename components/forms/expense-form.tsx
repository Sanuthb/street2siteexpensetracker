"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense } from "@/app/actions/create-expense";
import { editExpense } from "@/app/actions/edit-expense";

interface Project {
    id: string;
    name: string;
}

interface ExpenseData {
    id: string;
    projectId: string | null;
    subject: string;
    merchant: string;
    category: string;
    amount: number;
    date: string;
    description: string;
}

export function ExpenseForm({ projects, onSuccess, initialData }: { projects: Project[], onSuccess?: () => void, initialData?: ExpenseData }) {
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");

  const categories = ["Hosting", "Domain", "Development", "Design", "Marketing", "Advertising", "Travel", "Software", "Misc"];
  const isCustomCategory = selectedCategory && !categories.includes(selectedCategory);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result;
      if (initialData) {
         result = await editExpense(initialData.id, formData);
      } else {
         result = await createExpense(formData);
      }
      
      if (result.success) {
        toast.success(initialData ? "Expense updated successfully" : "Expense logged successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="subject">Subject *</Label>
          <Input id="subject" name="subject" required placeholder="Server Hosting" defaultValue={initialData?.subject} className="bg-background" />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="merchant">Merchant *</Label>
          <Input id="merchant" name="merchant" required placeholder="AWS" defaultValue={initialData?.merchant} className="bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="50.00" defaultValue={initialData?.amount} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" name="date" type="date" required defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ""} className="bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="category">Category *</Label>
          <Select 
            name="category" 
            required 
            defaultValue={isCustomCategory ? "Other" : initialData?.category}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedCategory === "Other" && (
            <div className="space-y-2 col-span-2 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="customCategory">Enter Custom Category *</Label>
                <Input 
                    id="customCategory" 
                    name="customCategory" 
                    required 
                    placeholder="E.g., Legal, Printing, etc." 
                    className="bg-background focus:ring-primary"
                    defaultValue={isCustomCategory ? initialData?.category : ""}
                />
            </div>
        )}
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="projectId">Project Assign (Optional)</Label>
          <Select name="projectId" defaultValue={initialData?.projectId || "unassigned"}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="General / Internal" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="unassigned">General / Internal</SelectItem>
               {projects.map(p => (
                   <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
               ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" required placeholder="Describe what this expense is for..." defaultValue={initialData?.description} className="bg-background" />
      </div>
      
      {!initialData && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border border-dashed">
            <Label htmlFor="receipt">Upload Receipt/Invoice (Optional)</Label>
            <Input id="receipt" name="receipt" type="file" accept="image/*,.pdf" className="cursor-pointer bg-background" />
            <p className="text-xs text-muted-foreground mt-1 text-right">Max size: 5MB</p>
          </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Expense" : "Log Expense"}
      </Button>
    </form>
  );
}
