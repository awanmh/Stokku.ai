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
  BarChart3,
  ArrowRightLeft,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<StockView[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (hour < 12) return "Selamat pagi";
    if (hour < 17) return "Selamat siang";
    return "Selamat malam";
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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan inventaris dan aktivitas hari ini.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
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
            Coba Lagi
          </Button>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Nilai Inventaris"
          value={stats?.total_stock_value || 0}
          formatter={formatCurrency}
          delta="+12.5%"
          deltaUp
          icon={TrendingUp}
          loading={loading}
          index={0}
        />
        <KpiCard
          label="Produk Aktif"
          value={stats?.total_products || 0}
          delta="+4 minggu ini"
          deltaUp
          icon={Package}
          loading={loading}
          index={1}
        />
        <KpiCard
          label="Gudang"
          value={stats?.total_warehouses || 0}
          icon={Building2}
          loading={loading}
          index={2}
        />
        <KpiCard
          label="Stok Rendah"
          value={stats?.low_stock_count || 0}
          delta={stats?.low_stock_count ? "Perlu perhatian" : "Semua aman"}
          deltaUp={!stats?.low_stock_count}
          icon={AlertTriangle}
          loading={loading}
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Area Chart — Stock Activity */}
        <Card className="lg:col-span-5 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Aktivitas Stok</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Volume stok masuk vs keluar per minggu
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Masuk
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-4" />
                  Keluar
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full min-h-[0] min-w-[0]">
              <ResponsiveContainer width="100%" height="100%">
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
                    name="Stok Masuk"
                    stroke="hsl(198, 80%, 48%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="stockOut"
                    name="Stok Keluar"
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

        {/* Donut chart — Category distribution */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribusi Kategori</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Berdasarkan jumlah produk</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {mockCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--bg-overlay))",
                      borderColor: "hsl(var(--border-default))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                    itemStyle={{ color: "hsl(var(--text-primary))" }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mockCategoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                  <span className="text-foreground font-medium ml-auto">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Recent transactions + Low stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <CardTitle className="text-sm font-medium">Transaksi Terakhir</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/transactions">Lihat semua →</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-b border-border/30">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : recentTx.length === 0 ? (
              <EmptyState
                icon={ArrowRightLeft}
                title="Belum ada transaksi"
                description="Catat transaksi stok pertama Anda."
                actionLabel="Buat Transaksi"
                onAction={() => window.location.href = "/dashboard/transactions"}
                className="py-16"
              />
            ) : (
              <div>
                {recentTx.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 px-6 py-3.5 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full ${
                      tx.type === "stock_in"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {tx.type === "stock_in" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.product_name}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.warehouse_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${
                        tx.type === "stock_in" ? "text-success" : "text-destructive"
                      }`}>
                        {tx.type === "stock_in" ? "+" : "-"}{formatNumber(tx.quantity)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(tx.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-warning" />
                <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/inventory">Lihat inventaris →</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-b border-border/30">
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Semua stok aman"
                description="Tidak ada produk dengan level stok rendah saat ini."
                className="py-16"
              />
            ) : (
              <div>
                {lowStock.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 px-6 py-3.5 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{item.product_sku}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{item.warehouse_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold text-destructive">{item.quantity}</span>
                        <span className="text-xs text-muted-foreground"> / {item.min_stock}</span>
                      </div>
                      <Badge variant="destructive" className="rounded-full px-2 text-[9px]">Kritis</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
              {label}
            </span>
            <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
              <Icon size={16} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mb-2" />
          ) : (
            <div className="text-2xl font-semibold text-foreground tracking-tight">
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
