"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, TrendingUp, ShoppingCart, AlertTriangle, Info, Loader2, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { forecastApi } from "@/lib/api";
import type { ForecastData, ReplenishmentData } from "@/lib/api";

const priorityColors: Record<string, "destructive" | "warning" | "success"> = {
  high: "destructive",
  medium: "warning",
  low: "success",
};

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [replenishment, setReplenishment] = useState<ReplenishmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [fRes, rRes] = await Promise.all([
        forecastApi.getForecast(),
        forecastApi.getReplenishment(),
      ]);
      setForecast(fRes.data);
      setReplenishment(rRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data forecast");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = forecast?.forecast?.map((f, i) => ({
    week: `Minggu ${i + 1}`,
    predicted: f.predicted_demand,
    confidence: Math.round(f.confidence * 100),
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
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
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit size={22} className="text-chart-4" />
          AI Forecast
        </h2>
        <p className="text-sm text-muted-foreground">
          Prediksi demand dan rekomendasi restok berbasis AI
        </p>
      </div>

      {/* Status Banner */}
      {forecast?.status === "mock" && (
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info size={18} className="text-chart-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">AI Service: Placeholder Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {forecast?.note || "AI forecasting service akan diintegrasikan setelah data historis cukup."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-chart-1" />
              Prediksi Demand
            </CardTitle>
            <CardDescription>Forecast permintaan produk berdasarkan data historis</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Tidak ada data forecast tersedia</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 80%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(215, 80%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(215, 80%, 48%)"
                    strokeWidth={2}
                    fill="url(#forecastGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Replenishment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart size={16} className="text-chart-2" />
              Rekomendasi Restok
            </CardTitle>
            <CardDescription>Draft PO berdasarkan prediksi demand</CardDescription>
          </CardHeader>
          <CardContent>
            {!replenishment?.suggestions?.length ? (
              <p className="text-sm text-muted-foreground text-center py-12">Tidak ada rekomendasi saat ini</p>
            ) : (
              <div className="space-y-3">
                {replenishment.suggestions.map((item) => (
                  <div
                    key={item.product_sku}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <Badge variant={priorityColors[item.priority] || "secondary"} className="text-[10px]">
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.product_sku} · Stockout est: {item.estimated_stockout}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm">
                        <span className="text-muted-foreground">{item.current_stock}</span>
                        <span className="mx-1">→</span>
                        <span className="font-semibold text-chart-2">+{item.recommended_order}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      {forecast?.recommendation && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Insight AI</p>
                <p className="text-sm text-muted-foreground mt-1">{forecast.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
