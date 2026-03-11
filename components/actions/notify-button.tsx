"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Send, Loader2 } from "lucide-react";
import { notifyClient } from "@/app/actions/notify-client";
import { toast } from "sonner";

interface NotifyButtonProps {
  projectId: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function NotifyButton({ 
  projectId, 
  variant = "outline", 
  size = "sm",
  showText = true,
  className
}: NotifyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleNotify = async () => {
    setIsLoading(true);
    try {
      const result = await notifyClient(projectId);
      if (result.success) {
        toast.success("Client notified successfully!");
      } else {
        toast.error(result.error || "Failed to notify client.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleNotify}
      disabled={isLoading}
      className={`gap-2 ${className || ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {showText && (isLoading ? "Notifying..." : "Notify Client")}
    </Button>
  );
}
