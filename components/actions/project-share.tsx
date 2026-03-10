"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toggleProjectSharing } from "@/lib/actions/projects";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProjectShareProps {
  projectId: string;
  isPublic: boolean;
  shareToken: string | null;
}

export function ProjectShare({ projectId, isPublic: initialIsPublic, shareToken: initialToken }: ProjectShareProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/shared/project/${token}` 
    : "";

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const result = await toggleProjectSharing(projectId, checked);
      if (result.success) {
        setIsPublic(checked);
        // We'd ideally want to get the new token if it was enabled
        // For simplicity, we'll assume the client can re-fetch or we refresh
        // But better is to just refresh the page data
        toast.success(checked ? "Public sharing enabled" : "Public sharing disabled");
        window.location.reload(); // Quick way to sync state
      } else {
        toast.error("Failed to update sharing settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Share Project Dashboard
          </DialogTitle>
          <DialogDescription>
            Allow clients to view a read-only version of this dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Access</Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view project stats.
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          </div>

          {isPublic && token && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Client Portal Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="bg-muted border-dashed"
                  />
                  <Button size="icon" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * This link provides view-only access to expenses, payments, and timelines.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
