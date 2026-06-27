"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { productApi, transactionApi, Product, TransactionView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Tag, DollarSign, Box, Activity, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<TransactionView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, histRes] = await Promise.all([
        productApi.getById(id),
        transactionApi.getAll({ product_id: id, limit: 10 }),
      ]);
      setProduct(prodRes.data);
      setHistory(histRes.data || []);
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

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">Produk tidak ditemukan</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package size={16} className="text-primary" /> Informasi Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Tag size={12}/> Kategori</p>
              <p className="font-medium mt-1">{product.category || "General"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><DollarSign size={12}/> Harga Jual</p>
              <p className="font-medium text-lg mt-1 text-primary">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Box size={12}/> Batas Stok</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">Min: {product.min_stock}</Badge>
                <Badge variant="outline">Max: {product.max_stock}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Activity size={12}/> Status</p>
              <Badge variant={product.is_active ? "success" : "secondary"} className="mt-1">
                {product.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Calendar size={12}/> Terdaftar Pada</p>
              <p className="text-sm mt-1">{formatDate(product.created_at)}</p>
            </div>
            {product.description && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deskripsi</p>
                <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Riwayat Transaksi Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Belum ada transaksi untuk produk ini.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Gudang</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs whitespace-nowrap">{formatDate(tx.created_at)}</TableCell>
                      <TableCell className="text-xs font-medium">{tx.warehouse_name}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "stock_in" ? "success" : "destructive"} className="text-[10px]">
                          {tx.type === "stock_in" ? "Masuk" : "Keluar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tx.type === "stock_in" ? "+" : "-"}{tx.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
