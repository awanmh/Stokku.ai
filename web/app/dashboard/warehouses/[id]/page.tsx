"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { warehouseApi, inventoryApi, Warehouse, StockView } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, MapPin, PackageSearch, Tag, Layers, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stock, setStock] = useState<StockView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [whRes, invRes] = await Promise.all([
        warehouseApi.getById(id),
        inventoryApi.getAll({ warehouse_id: id, limit: 100 }),
      ]);
      setWarehouse(whRes.data);
      setStock(invRes.data || []);
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

  if (!warehouse) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">Gudang tidak ditemukan</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = stock.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalProducts = stock.length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 size={24} className="text-primary"/>
            {warehouse.name}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin size={14}/> {warehouse.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-primary" /> Rincian Gudang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Alamat Lengkap</p>
              <p className="font-medium text-sm mt-1">{warehouse.address || "Belum ada alamat spesifik."}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Status Operasional</p>
              <Badge variant={warehouse.is_active ? "success" : "secondary"}>
                {warehouse.is_active ? "Aktif & Beroperasi" : "Nonaktif"}
              </Badge>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><Layers size={12}/> Varian Produk</p>
                <p className="text-lg font-bold mt-1 text-foreground">{formatNumber(totalProducts)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><PackageSearch size={12}/> Total Unit Barang</p>
                <p className="text-lg font-bold mt-1 text-foreground">{formatNumber(totalQuantity)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5"><TrendingUp size={12}/> Estimasi Nilai Aset</p>
                <p className="text-lg font-bold mt-1 text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock List Table */}
        <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PackageSearch size={16} className="text-primary" /> Inventaris Gudang
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stock.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Gudang ini belum memiliki stok barang.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Kuantitas</TableHead>
                    <TableHead className="text-right">Nilai Aset</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.product_sku}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.quantity <= item.min_stock ? "destructive" : "success"} className="font-medium text-xs">
                          {formatNumber(item.quantity)} unit
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantity * item.price)}
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
