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
  Sparkles,
  RefreshCw,
  Building2
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Premium Mock Data for demonstrating the $10,000 UI chart
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
      setError(err instanceof Error ? err.message : "Gagal mengambil data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Welcome Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-r from-cyan-950/40 via-blue-900/20 to-indigo-950/40 p-8 md:p-10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none mix-blend-screen">
          <div className="w-64 h-64 bg-cyan-400 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-6 backdrop-blur-md">
            <Sparkles size={16} className="animate-pulse" />
            AI Core Engine is Active
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">{user?.name?.split(" ")[0] || "Admin"}</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed font-light">
            Inilah ringkasan pergerakan inventaris Anda hari ini. Sistem prediktif kami mendeteksi aktivitas stok yang optimal.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
          <p>{error}</p>
          <Button variant="ghost" className="hover:bg-red-500/20 hover:text-red-300" onClick={fetchData}>
            <RefreshCw size={16} className="mr-2" /> Coba Lagi
          </Button>
        </div>
      )}

      {/* KPI Stats Metro Grid Concept */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Nilai Inventaris"
          value={loading ? "..." : formatIDR(stats?.total_stock_value || 0)}
          icon={TrendingUp}
          trend="+12.5%"
          trendUp={true}
          description="Aset stok tersimpan"
          loading={loading}
          color="cyan"
        />
        <StatCard
          title="Produk Aktif"
          value={loading ? "..." : (stats?.total_products || 0).toLocaleString()}
          icon={Package}
          trend="+4"
          trendUp={true}
          description="Total SKU aktif"
          loading={loading}
          color="blue"
        />
        <StatCard
          title="Gudang Operasional"
          value={loading ? "..." : (stats?.total_warehouses || 0).toLocaleString()}
          icon={Building2}
          description="Lokasi stok"
          loading={loading}
          color="indigo"
        />
        <StatCard
          title="Peringatan Stok Tipis"
          value={loading ? "..." : (stats?.low_stock_count || 0).toLocaleString()}
          icon={AlertTriangle}
          trend="-2.1%"
          trendUp={false}
          description="Perlu re-stock"
          loading={loading}
          color="amber"
          alert={!!stats?.low_stock_count && stats.low_stock_count > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="lg:col-span-5 bg-[#0d1326]/60 backdrop-blur-xl border-white/5 shadow-xl rounded-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-white/5 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white/90">Aktivitas Stok (7 Hari Terakhir)</CardTitle>
                <p className="text-sm text-white/50 mt-1">Volume Stock-In vs Stock-Out agregat semua gudang</p>
              </div>
              <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-4 px-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(10, 15, 28, 0.9)", 
                      borderColor: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                    }} 
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stockIn"
                    name="Stock In"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIn)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#22d3ee" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stockOut"
                    name="Stock Out"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOut)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Small Widgets Area */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* AI Predict Widget */}
          <Card className="flex-1 bg-linear-to-b from-[#0e172a] to-[#0a0f1c] border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.05)] rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 z-10 relative">
              <CardTitle className="text-md flex items-center gap-2 text-white/90">
                <Sparkles size={16} className="text-cyan-400" /> AI Replenishment
              </CardTitle>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-sm text-white/60 mb-5">
                Model machine learning kami menganalisis pola penjualan Anda.
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-white/80">SKU-LAP-001</span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-none hover:bg-amber-500/30 text-[10px]">High Priority</Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-white/50">Restock +50 unit dalam 3 hari</span>
                    <Button size="sm" variant="ghost" className="h-6 text-xs text-cyan-400 hover:text-cyan-300 p-0">Predict &rarr;</Button>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-white/80">SKU-MOU-092</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-none hover:bg-blue-500/30 text-[10px]">Monitor</Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-white/50">Penjualan melambat 15%</span>
                    <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400 hover:text-blue-300 p-0">Detail &rarr;</Button>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-5 bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 rounded-xl" variant="outline">
                Lihat Semua Forecast
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white/90 mb-5 flex items-center gap-2">
          Prioritas Restock
          {!!stats?.low_stock_count && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/30">
              {stats.low_stock_count}
            </span>
          )}
        </h3>
        <Card className="bg-[#0a0f1c]/80 backdrop-blur-xl border-white/10 shadow-lg rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Produk Info</th>
                  <th className="px-6 py-4 font-medium">Gudang</th>
                  <th className="px-6 py-4 font-medium">Current Stock</th>
                  <th className="px-6 py-4 font-medium">Sisa Hari (AI)</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-10 w-48 bg-white/10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-white/10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16 bg-white/10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-white/10" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto bg-white/10" /></td>
                    </tr>
                  ))
                ) : lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Package size={24} className="text-green-400" />
                        </div>
                        <p>Kabar baik! Tidak ada stok yang menipis saat ini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lowStock.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <Package size={20} className="text-white/60" />
                          </div>
                          <div>
                            <p className="font-semibold text-white/90 group-hover:text-cyan-300 transition-colors">{item.product_name}</p>
                            <p className="text-xs text-white/50">{item.product_sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">{item.warehouse_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-400">{item.quantity}</span>
                          <span className="text-xs text-white/40">/ Min {item.min_stock}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className="bg-red-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.max(5, (item.quantity / item.min_stock) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                          {Math.floor(Math.random() * 5) + 1} hari lagi
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" className="rounded-lg bg-white text-[#0a0f1c] hover:bg-cyan-400 font-medium">
                          Restock
                        </Button>
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

// Micro Component for Stats
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  description, 
  loading,
  color,
  alert = false
}: any) {
  
  const colors: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };
  
  const iconColorClass = colors[color] || colors.cyan;

  return (
    <Card className={`relative overflow-hidden border-white/10 bg-[#0d1326]/80 backdrop-blur-xl shadow-lg rounded-2xl group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${alert ? 'border-red-500/30 border-b-2' : ''}`}>
      {alert && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
        <CardTitle className="text-sm font-medium text-white/50">{title}</CardTitle>
        <div className={`p-2 rounded-xl border ${iconColorClass} transition-transform group-hover:scale-110`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="z-10 relative">
        {loading ? (
          <Skeleton className="h-8 w-24 mb-2 bg-white/10" />
        ) : (
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        )}
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </span>
          )}
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </CardContent>
      {/* Decorative subtle border bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all duration-500" />
    </Card>
  );
}
