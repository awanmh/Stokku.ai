"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="text-cyan-400" /> Manajemen Inventaris
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Pantau pergerakan masuk-keluar stok secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white/70">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]">
            <Plus size={16} className="mr-2" /> Tambah Stok
          </Button>
        </div>
      </div>

      <Card className="bg-[#0d1326]/60 backdrop-blur-xl border-white/5 shadow-xl rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="border-b border-white/5 p-4 flex gap-4 bg-white/[0.02]">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input 
              placeholder="Cari SKU atau nama produk..." 
              className="pl-9 bg-white/5 border-white/10 h-9"
            />
          </div>
        </div>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-10">
          <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_4s_linear_infinite]" />
            <Package size={40} className="text-cyan-400 opacity-80" />
          </div>
          <h3 className="text-xl font-semibold text-white/90 mb-2">Tabel Inventaris Sedang Dipersiapkan</h3>
          <p className="text-white/50 max-w-md mx-auto mb-8">
            Modul integrasi data inventaris ini sedang dalam tahap sinkronisasi akhir dengan AI Engine. Segera hadir untuk pengalaman manajemen stok tanpa batas.
          </p>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            Kembali ke Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
