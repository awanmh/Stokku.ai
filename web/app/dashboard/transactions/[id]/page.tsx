"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { transactionApi, TransactionView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRightLeft, MapPin, Package, Calendar, User as UserIcon, FileText, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tx, setTx] = useState<TransactionView | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getById(id);
      setTx(res.data);
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

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">Transaksi tidak ditemukan</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const isStockIn = tx.type === "stock_in";

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft size={24} className="text-primary"/>
            Detail Transaksi
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-mono">
            ID: {tx.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative Type Background */}
          <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 ${isStockIn ? 'bg-success' : 'bg-destructive'}`} />

          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Ringkasan Pergerakan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${isStockIn ? 'bg-success/5 border-success/20 text-success' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
              <div className={`p-3 rounded-full ${isStockIn ? 'bg-success/20' : 'bg-destructive/20'}`}>
                {isStockIn ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-80">{isStockIn ? 'Barang Masuk' : 'Barang Keluar'}</p>
                <p className="text-2xl font-bold mt-1">
                  {isStockIn ? "+" : "-"}{formatNumber(tx.quantity)} <span className="text-sm font-normal opacity-80">unit</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Calendar size={12}/> Waktu Transaksi</p>
                <p className="font-medium mt-1">{formatDate(tx.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><UserIcon size={12}/> Operator</p>
                <p className="font-medium mt-1">{tx.performer_name}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Referensi & Catatan</p>
              <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Nomor Referensi</span>
                  <code className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-background">{tx.reference || "N/A"}</code>
                </div>
                {tx.notes && (
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1">Catatan Tambahan:</span>
                    <p className="text-sm leading-relaxed text-foreground/80">{tx.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package size={16} className="text-primary" /> Entitas Terkait
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Package size={12}/> Produk</p>
              <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors bg-background/50">
                <div>
                  <p className="font-medium">{tx.product_name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{tx.product_sku}</p>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/dashboard/products/${tx.product_id}`}>Lihat</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><MapPin size={12}/> Lokasi Gudang</p>
              <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors bg-background/50">
                <p className="font-medium">{tx.warehouse_name}</p>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/dashboard/warehouses/${tx.warehouse_id}`}>Lihat</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
