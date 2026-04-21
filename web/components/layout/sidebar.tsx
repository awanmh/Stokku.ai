"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  Building2,
  ArrowRightLeft,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";

const navSections = [
  {
    label: "Dashboard",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Products", href: "/dashboard/products", icon: PackageSearch },
      { title: "Inventory", href: "/dashboard/inventory", icon: Package },
      { title: "Warehouses", href: "/dashboard/warehouses", icon: Building2 },
      { title: "Transactions", href: "/dashboard/transactions", icon: ArrowRightLeft },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "AI Forecast", href: "/dashboard/forecast", icon: Lightbulb },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-sidebar-bg hidden lg:flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="stokku.ai"
            width={120}
            height={30}
            className="dark:brightness-0 dark:invert"
            style={{ width: "auto" }}
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon size={16} />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-danger-bg hover:text-destructive"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
