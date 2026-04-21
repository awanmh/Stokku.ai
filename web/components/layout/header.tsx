"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu size={20} />
        </Button>

        <div className="relative max-w-sm w-full hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={14} className="text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search SKU, warehouse, or transaction..."
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={16} />
          </Button>
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {user?.role?.replace("_", " ") || "Administrator"}
            </p>
          </div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
