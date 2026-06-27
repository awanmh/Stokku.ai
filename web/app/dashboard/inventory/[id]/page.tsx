"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { inventoryApi, StockView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, Tag, DollarSign, Activity, Calendar } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [stock, setStock] = useState<StockView | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getById(id);
      setStock(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" disabled className="pl-0"><ArrowLeft size={16} className="mr-2"/> Kembali</Button>
        <TableSkeleton rows={4} columns={2} />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">Stok tidak ditemukan</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const isLowStock = stock.quantity <= stock.min_stock;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={24} className="text-primary"/>
            {stock.product_name}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-mono">
            {stock.product_sku}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Status Ketersediaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stok Saat Ini</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(stock.quantity)} <span className="text-sm font-normal text-muted-foreground">unit</span></p>
              </div>
              <div>
                {isLowStock ? (
                  <Badge variant="destructive" className="px-3 py-1 shadow-[0_0_12px_rgba(239,68,68,0.3)]">Stok Rendah</Badge>
                ) : (
                  <Badge variant="success" className="px-3 py-1">Stok Aman</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Batas Minimum</p>
                <p className="font-medium mt-1">{formatNumber(stock.min_stock)} unit</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Update Terakhir</p>
                <p className="text-sm mt-1">{formatDate(stock.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Lokasi & Nilai Aset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><MapPin size={12}/> Disimpan Di</p>
              <div className="flex items-center justify-between mt-2">
                <p className="font-medium">{stock.warehouse_name}</p>
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link href={`/dashboard/warehouses/${stock.warehouse_id}`}>Lihat Gudang</Link>
                </Button>
              </div>
            </div>

            <div className="p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Tag size={12}/> Detail Produk</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">Harga Satuan: <strong>{formatCurrency(stock.price)}</strong></p>
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link href={`/dashboard/products/${stock.product_id}`}>Lihat Produk</Link>
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><DollarSign size={12}/> Total Nilai Aset</p>
              <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(stock.total_value)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Estimasi nilai dari {stock.quantity} unit x {formatCurrency(stock.price)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
