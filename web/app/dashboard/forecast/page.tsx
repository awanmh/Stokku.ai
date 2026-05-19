"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { forecastApi } from "@/lib/api";

type ForecastPoint = {
  date: string;
  predicted_demand: number;
  confidence: number;
};

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [recommendation, setRecommendation] = useState<string>("");
  const [status, setStatus] = useState<string>("loading");
  const [note, setNote] = useState<string>("");
  const [replenishmentNote, setReplenishmentNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadForecast() {
      try {
        setIsLoading(true);
        setError(null);

        const [forecastResponse, replenishmentResponse] = await Promise.all([
          forecastApi.getForecast("sample-product-1", "wh-1"),
          forecastApi.getReplenishment(),
        ]);

        if (!isMounted) return;

        setForecast(forecastResponse.data.forecast || []);
        setRecommendation(forecastResponse.data.recommendation || "");
        setStatus(forecastResponse.data.status || "ok");
        setNote(forecastResponse.data.note || "");
        setReplenishmentNote(replenishmentResponse.data.note || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data forecast.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadForecast();

    return () => {
      isMounted = false;
    };
  }, []);

  const maxDemand = useMemo(
    () => Math.max(...forecast.map((point) => point.predicted_demand), 1),
    [forecast]
  );

  const activeConfidence = useMemo(() => {
    if (forecast.length === 0) return 0;
    return forecast.reduce((sum, point) => sum + point.confidence, 0) / forecast.length;
  }, [forecast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Forecast</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prediksi demand berbasis data historis dan konteks replenishment terbaru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar size={14} />
            7 hari ke depan
          </Button>
          <Button size="sm">
            <TrendingUp size={14} />
            Refresh data
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-foreground">Gagal memuat forecast</div>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Model status
              </span>
              <Badge variant={status === "ok" ? "success" : "secondary"}>
                {status === "ok" ? "Active" : status}
              </Badge>
            </div>
            <div className="mb-2 text-2xl font-semibold text-foreground">
              {isLoading ? "--" : `${Math.round(activeConfidence * 100)}%`}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {note || "Model forecast sedang mengambil data historis terbaru."}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-1.5 rounded-full bg-success transition-all"
                style={{ width: `${Math.round(activeConfidence * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Forecast preview
                </div>
                <h2 className="mt-1 text-sm font-semibold text-foreground">
                  Prediksi demand per tanggal
                </h2>
              </div>
              <Lightbulb size={20} className="text-muted-foreground" />
            </div>

            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-sm text-muted-foreground">
                Memuat forecast...
              </div>
            ) : forecast.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-sm text-muted-foreground">
                Belum ada data forecast untuk ditampilkan.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {forecast.map((point) => (
                  <div
                    key={point.date}
                    className="rounded-xl border border-border bg-secondary/30 p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDateLabel(point.date)}</span>
                      <span>{Math.round(point.confidence * 100)}%</span>
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-foreground">
                      {point.predicted_demand}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.max((point.predicted_demand / maxDemand) * 100, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Recommendation
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {recommendation || "Belum ada rekomendasi forecast yang tersedia."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Replenishment note
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {replenishmentNote || "Belum ada catatan replenishment tambahan."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
