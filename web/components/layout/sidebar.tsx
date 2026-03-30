"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Building2,
  ArrowRightLeft,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Warehouses",
    href: "/dashboard/warehouses",
    icon: Building2,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowRightLeft,
  },
  {
    title: "AI Forecast",
    href: "/dashboard/forecast",
    icon: Lightbulb,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#0a0f1c]/95 backdrop-blur-xl transition-transform hidden lg:flex flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center justify-center border-b border-white/5 px-6 relative">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-transparent blur-xl pointer-events-none" />
        <Link href="/dashboard" className="flex items-center gap-2 relative z-10 transition-transform hover:scale-105">
          <Image
            src="/logo.png"
            alt="stokku.ai"
            width={140}
            height={36}
            className="brightness-0 invert"
            style={{ width: "auto" }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <div className="mb-4 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Menu Utama
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                )}
                <item.icon
                  size={18}
                  className={cn(
                    "transition-colors duration-300",
                    isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white/80"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User / Logout */}
      <div className="border-t border-white/5 p-4">
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} className="text-white/40 group-hover:text-red-400 transition-colors" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
