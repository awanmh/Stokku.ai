"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, Moon, Sun, Monitor, LogOut, User as UserIcon, AlertTriangle, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardApi, type StockView } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const [alerts, setAlerts] = useState<{
    lowStock: StockView[];
    deadStock: StockView[];
  }>({ lowStock: [], deadStock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowStockRes, deadStockRes] = await Promise.all([
          dashboardApi.getLowStockAlerts(5).catch(() => ({ data: [] })),
          dashboardApi.getDeadStock(5).catch(() => ({ data: [] })),
        ]);
        setAlerts({
          lowStock: lowStockRes?.data || [],
          deadStock: deadStockRes?.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch notification alerts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalAlertsCount = alerts.lowStock.length + alerts.deadStock.length;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

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
            placeholder={t("search_placeholder")}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Globe size={16} />
              <span className="sr-only">Toggle language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2 cursor-pointer flex items-center justify-between">
              <span className={language === "en" ? "font-semibold text-primary" : ""}>English</span>
              {language === "en" && <span className="text-primary font-bold">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("id")} className="gap-2 cursor-pointer flex items-center justify-between">
              <span className={language === "id" ? "font-semibold text-primary" : ""}>Bahasa Indonesia</span>
              {language === "id" && <span className="text-primary font-bold">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
              <Sun size={14} /> {t("light")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
              <Moon size={14} /> {t("dark")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
              <Monitor size={14} /> {t("sys_theme")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell size={16} />
              {totalAlertsCount > 0 && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[350px] overflow-y-auto">
            <DropdownMenuLabel className="font-semibold flex items-center justify-between py-2 px-3">
              <span className="text-sm">{t("alerts_notifications")}</span>
              {totalAlertsCount > 0 && (
                <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  {totalAlertsCount} {t("critical")}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {loading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {t("loading_alerts")}
              </div>
            ) : totalAlertsCount === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Bell size={24} className="text-muted-foreground opacity-40" />
                <p className="text-xs font-medium text-foreground">{t("all_clear")}</p>
                <p className="text-[10px] text-muted-foreground">{t("no_alerts")}</p>
              </div>
            ) : (
              <div className="py-1">
                {/* Low Stock Section */}
                {alerts.lowStock.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-secondary/50">
                      {t("low_stock_alerts")}
                    </div>
                    {alerts.lowStock.map((item) => (
                      <Link key={`low-${item.id}`} href="/dashboard/inventory?low_stock=true">
                        <DropdownMenuItem className="cursor-pointer flex items-start gap-2.5 px-3 py-2.5 focus:bg-secondary">
                          <div className="mt-0.5 p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {item.product_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate font-mono">
                              {item.product_sku} • {item.warehouse_name}
                            </p>
                            <p className="text-[10px] text-destructive font-medium mt-0.5">
                              {t("stock_status", { qty: item.quantity, min: item.min_stock })}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </>
                )}

                {/* Dead Stock Section */}
                {alerts.deadStock.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-secondary/50 mt-1">
                      {t("dead_stock_alerts")}
                    </div>
                    {alerts.deadStock.map((item) => (
                      <Link key={`dead-${item.id}`} href="/dashboard/inventory">
                        <DropdownMenuItem className="cursor-pointer flex items-start gap-2.5 px-3 py-2.5 focus:bg-secondary">
                          <div className="mt-0.5 p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <Clock size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {item.product_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate font-mono">
                              {item.product_sku} • {item.warehouse_name}
                            </p>
                            <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                              {t("not_moving", { qty: item.quantity })}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2.5 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-lg transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                  {user?.role?.replace("_", " ") || "ADMINISTRATOR"}
                </p>
              </div>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserIcon size={14} />
                {t("profile_settings")}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive gap-2 cursor-pointer">
              <LogOut size={14} />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
