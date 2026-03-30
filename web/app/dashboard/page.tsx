"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Building2,
  TrendingUp,
  AlertTriangle,
  Skull,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats, StockView } from "@/lib/api";

const statCards = [
  { key: "total_products", label: "Total Produk", icon: Package, color: "text-chart-1", bg: "bg-chart-1/10" },
  { key: "total_warehouses", label: "Total Gudang", icon: Building2, color: "text-chart-4", bg: "bg-chart-4/10" },
  { key: "total_stock_value", label: "Nilai Stok", icon: TrendingUp, color: "text-chart-2", bg: "bg-chart-2/10", format: "currency" },
  { key: "low_stock_count", label: "Low Stock", icon: AlertTriangle, color: "text-chart-3", bg: "bg-chart-3/10" },
  { key: "dead_stock_count", label: "Dead Stock", icon: Skull, color: "text-chart-5", bg: "bg-chart-5/10" },
  { key: "today_tx_count", label: "Transaksi Hari Ini", icon: ArrowRightLeft, color: "text-chart-1", bg: "bg-chart-1/10" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<StockView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, lowStockRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getLowStockAlerts(5),
      ]);
      setStats(statsRes.data);
      setLowStock(lowStockRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={6} />
        <div className="rounded-xl border border-border bg-card p-5 space-y-4" style={{ minHeight: 200 }}>
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-14 w-full rounded bg-muted" />
            <div className="h-14 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw size={14} />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key as keyof DashboardStats] : 0;
          return (
            <Card key={card.key} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {card.format === "currency"
                        ? formatCurrency(value as number)
                        : formatNumber(value as number)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <Icon size={22} className={card.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" />
              Peringatan Stok Rendah
            </CardTitle>
            <Badge variant="warning">{lowStock.length} item</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tidak ada peringatan stok rendah saat ini 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product_sku} · {item.warehouse_name}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-destructive">
                      {item.quantity}/{item.min_stock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.min_stock > 0
                        ? Math.round((item.quantity / item.min_stock) * 100) + "%"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
