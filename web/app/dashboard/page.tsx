"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats, StockView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { name: "Mon", stockIn: 4000, stockOut: 2400 },
  { name: "Tue", stockIn: 3000, stockOut: 1398 },
  { name: "Wed", stockIn: 2000, stockOut: 9800 },
  { name: "Thu", stockIn: 2780, stockOut: 3908 },
  { name: "Fri", stockIn: 1890, stockOut: 4800 },
  { name: "Sat", stockIn: 2390, stockOut: 3800 },
  { name: "Sun", stockIn: 3490, stockOut: 4300 },
];

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<StockView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
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
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your inventory today.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-danger-bg border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Inventory value"
          value={loading ? null : formatCurrency(stats?.total_stock_value || 0)}
          delta="+12.5%"
          deltaUp
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          label="Active products"
          value={loading ? null : String(stats?.total_products || 0)}
          delta="+4 this week"
          deltaUp
          icon={Package}
          loading={loading}
        />
        <KpiCard
          label="Warehouses"
          value={loading ? null : String(stats?.total_warehouses || 0)}
          icon={Building2}
          loading={loading}
        />
        <KpiCard
          label="Low stock alerts"
          value={loading ? null : String(stats?.low_stock_count || 0)}
          delta={stats?.low_stock_count ? "Needs attention" : "All clear"}
          deltaUp={!stats?.low_stock_count}
          icon={AlertTriangle}
          loading={loading}
        />
      </div>

      {/* Chart + sidebar */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Chart */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Stock activity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Weekly stock-in vs stock-out volume
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Stock in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-4" />
                  Stock out
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(198, 80%, 48%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(198, 80%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 60%, 55%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(262, 60%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border-default))"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--text-muted))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--text-muted))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--bg-overlay))",
                      borderColor: "hsl(var(--border-default))",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                    itemStyle={{ color: "hsl(var(--text-primary))" }}
                    labelStyle={{ color: "hsl(var(--text-secondary))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stockIn"
                    name="Stock In"
                    stroke="hsl(198, 80%, 48%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="stockOut"
                    name="Stock Out"
                    stroke="hsl(262, 60%, 55%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillOut)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats sidebar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Restock needed</span>
                <Badge variant="warning">High</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                SKU-LAP-001 is projected to run out within 3 days based on current velocity.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Demand trend</span>
                <Badge>Monitor</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Electronics category demand is forecasted to increase 15% next week.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Dead stock</span>
                <Badge variant="secondary">Low</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stats?.dead_stock_count || 0} items have not moved in 30+ days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground tracking-tight">
            Low stock alerts
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/inventory">View all inventory →</a>
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    Warehouse
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-7 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="text-muted-foreground" />
                        <p className="text-sm text-foreground font-medium">No low stock items</p>
                        <p className="text-xs text-muted-foreground">All inventory levels are healthy.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lowStock.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-secondary/50 transition-colors duration-100">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{item.product_sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.warehouse_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-destructive">{item.quantity}</span>
                        <span className="text-muted-foreground"> / {item.min_stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="destructive">Critical</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm">Restock</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | null;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
            {label}
          </span>
          <Icon size={16} className="text-muted-foreground" />
        </div>
        {loading || value === null ? (
          <Skeleton className="h-8 w-28 mb-2" />
        ) : (
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            {value}
          </div>
        )}
        {delta && (
          <div className="flex items-center gap-1 mt-2">
            {deltaUp !== undefined && (
              deltaUp
                ? <ArrowUpRight size={12} className="text-success" />
                : <ArrowDownRight size={12} className="text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">{delta}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
