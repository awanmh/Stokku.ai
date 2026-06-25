"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { dashboardApi, transactionApi } from "@/lib/api";
import type { DashboardStats, StockView, TransactionView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Activity,
  ArrowRightLeft,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useTranslation } from "@/lib/i18n";

// Mock chart data — replace with real API later
const mockWeeklyData = [
  { name: "Sen", stockIn: 4000, stockOut: 2400 },
  { name: "Sel", stockIn: 3000, stockOut: 1398 },
  { name: "Rab", stockIn: 2000, stockOut: 3800 },
  { name: "Kam", stockIn: 2780, stockOut: 3908 },
  { name: "Jum", stockIn: 1890, stockOut: 4800 },
  { name: "Sab", stockIn: 2390, stockOut: 3800 },
  { name: "Min", stockIn: 3490, stockOut: 4300 },
];

const mockCategoryData = [
  { name: "Elektronik", value: 35, color: "hsl(198, 80%, 48%)" },
  { name: "Material", value: 28, color: "hsl(152, 70%, 42%)" },
  { name: "Makanan", value: 20, color: "hsl(38, 90%, 52%)" },
  { name: "Lainnya", value: 17, color: "hsl(262, 60%, 55%)" },
];

const mockTopProducts = [
  { name: "Semen Portland", value: 120 },
  { name: "Besi Beton", value: 98 },
  { name: "Pipa PVC", value: 86 },
  { name: "Cat Tembok", value: 75 },
  { name: "Kabel Listrik", value: 65 },
];

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<StockView[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, lowStockRes, txRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getLowStockAlerts(5),
        transactionApi.getAll({ limit: 5 }),
      ]);
      setStats(statsRes.data);
      setLowStock(lowStockRes.data || []);
      setRecentTx(txRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting_morning");
    if (hour < 17) return t("greeting_afternoon");
    return t("greeting_evening");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-5xl font-semibold text-foreground tracking-tight mb-2">
            Stokku.ai
          </h1>
          <p className="text-lg text-muted-foreground mt-1 max-w-xl">
            Inventory. Perfected.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {t("refresh")}
          </Button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger-bg border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center justify-between"
        >
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            {t("retry")}
          </Button>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("inv_value")}
          value={stats?.total_stock_value || 0}
          formatter={formatCurrency}
          delta="+12.5%"
          deltaUp
          icon={TrendingUp}
          loading={loading}
          index={0}
        />
        <KpiCard
          label={t("active_products")}
          value={stats?.total_products || 0}
          delta="+4 this week"
          deltaUp
          icon={Package}
          loading={loading}
          index={1}
        />
        <KpiCard
          label={t("warehouses")}
          value={stats?.total_warehouses || 0}
          icon={Building2}
          loading={loading}
          index={2}
        />
        <KpiCard
          label={t("low_stock_alerts_count")}
          value={stats?.low_stock_count || 0}
          delta={stats?.low_stock_count ? t("needs_attention") : t("all_clear_status")}
          deltaUp={!stats?.low_stock_count}
          icon={AlertTriangle}
          loading={loading}
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Area Chart — Stock Activity */}
        <Card className="lg:col-span-5 bg-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">{t("stock_activity")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("weekly_vol")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {t("stock_in")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-4" />
                  {t("stock_out")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full min-h-[0] min-w-[0]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={mockWeeklyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(198, 80%, 48%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(198, 80%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 60%, 55%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(262, 60%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border-default))"
                    strokeOpacity={0.4}
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
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--bg-overlay))",
                      borderColor: "hsl(var(--border-default))",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      padding: "10px 14px",
                    }}
                    itemStyle={{ color: "hsl(var(--text-primary))" }}
                    labelStyle={{ color: "hsl(var(--text-secondary))", fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stockIn"
                    name={t("stock_in")}
                    stroke="hsl(198, 80%, 48%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="stockOut"
                    name={t("stock_out")}
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

        {/* Bar chart — Top Products */}
        <Card className="lg:col-span-2 bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Products</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">By outgoing volume</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full min-h-[0] min-w-[0]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTopProducts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-default))" strokeOpacity={0.4} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--text-muted))", fontSize: 10 }} width={80} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
                    contentStyle={{ backgroundColor: "hsl(var(--bg-overlay))", borderColor: "hsl(var(--border-default))", borderRadius: "10px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                  />
                  <Bar dataKey="value" fill="hsl(198, 80%, 48%)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground tracking-tight">
            {t("low_stock_alerts")}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/inventory">{t("view_all_inv")}</a>
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    {t("product")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    {t("warehouse")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    {t("stock")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    {t("status")}
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                    {t("action_col")}
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
                        <p className="text-sm text-foreground font-medium">{t("no_low_stock")}</p>
                        <p className="text-xs text-muted-foreground">{t("healthy_levels")}</p>
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
                        <Badge variant="destructive">{t("critical_badge")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm">{t("restock")}</Button>
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

/* ─── Counter-up KPI Card ──────────────────────────────────────────── */

function AnimatedNumber({
  value,
  formatter,
}: {
  value: number;
  formatter?: (v: number) => string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (formatter) return formatter(Math.round(latest));
    return formatNumber(Math.round(latest));
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v;
      }
    });
    return () => unsubscribe();
  }, [rounded]);

  return <span ref={nodeRef}>0</span>;
}

function KpiCard({
  label,
  value,
  formatter,
  delta,
  deltaUp,
  icon: Icon,
  loading,
  index = 0,
}: {
  label: string;
  value: number;
  formatter?: (v: number) => string;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  loading: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="bg-transparent border-0 group py-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
              {label}
            </span>
            <div className="text-foreground">
              <Icon size={20} strokeWidth={1.5} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mb-2" />
          ) : (
            <div className="text-5xl font-semibold text-foreground tracking-tighter">
              <AnimatedNumber value={value} formatter={formatter} />
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
    </motion.div>
  );
}
