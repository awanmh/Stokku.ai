"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-[#0a0f1c]/80 px-6 backdrop-blur-2xl">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-white/70 hover:text-white">
          <Menu size={20} />
        </Button>

        <div className="relative max-w-md w-full hidden md:block group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/40 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Cari SKU, Gudang, atau Transaksi..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-full focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-all focus-visible:bg-white/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
            <Bell size={20} />
          </Button>
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0a0f1c] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white group-hover:text-cyan-100 transition-colors">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-white/50 capitalize">
              {user?.role?.replace("_", " ") || "Administrator"}
            </p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-sm">
            <AvatarFallback className="bg-linear-to-br from-cyan-600 to-blue-900 text-white font-medium">
              {user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
