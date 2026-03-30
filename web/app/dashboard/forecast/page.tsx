"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForecastPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="text-amber-400" /> AI Demand Forecast
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Prediksi cerdas kebutuhan stok masa depan berdasarkan model Machine Learning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white/70">
            <Calendar size={16} className="mr-2" /> Pilih Periode
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]">
            <Sparkles size={16} className="mr-2" /> Generate Re-Forecast
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-linear-to-b from-[#1a120b] to-[#0a0f1c] border-amber-500/20 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 rotate-3">
              <TrendingUp size={36} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-amber-50 mb-3">Model Akurasi 94.2%</h3>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Algoritma kami sedang melakukan sinkronisasi dengan dataset historis transaksi gudang Anda untuk membangun kurva prediksi yang akurat.
            </p>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full w-[65%] animate-pulse" />
            </div>
            <span className="text-xs text-amber-500/60 mt-3 block font-mono">TRAINING KERNEL...</span>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#0d1326]/60 backdrop-blur-xl border-white/5 shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
          <CardContent className="flex flex-col items-center justify-center h-full text-center p-10">
            <Sparkles size={48} className="text-white/10 mb-6" />
            <h3 className="text-xl font-semibold text-white/80 mb-2">Visualisasi Prediksi Belum Tersedia</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Sistem membutuhkan setidaknya 24 jam data historis baru sebelum merender grafik prediktif. Mohon kembali lagi nanti.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
