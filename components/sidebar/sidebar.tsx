"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Receipt,
  FolderKanban,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/payments",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Support",
    icon: HelpCircle,
    href: "/support",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground border-r border-border shadow-sm">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4 bg-primary/10 rounded-lg flex items-center justify-center">
             <span className="text-primary font-bold text-xl leading-none">E</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Expensio
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition-colors",
                pathname === route.href || pathname.startsWith(route.href + '/')
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-4 py-6 border-t border-border">
          <div className="flex items-center gap-x-3 bg-secondary/50 p-3 rounded-xl">
             <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                JD
             </div>
             <div className="flex flex-col">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Admin</p>
             </div>
          </div>
      </div>
    </div>
  );
};
