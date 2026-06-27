"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { WarehouseCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { WarehouseFormModal } from "@/components/modals/warehouse-form-modal";
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Eye,
} from "lucide-react";
import { warehouseApi, inventoryApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import type { Warehouse, StockView } from "@/lib/api";

const PAGE_SIZE = 12;

interface WarehouseStockSummary {
  totalProducts: number;
  totalQuantity: number;
  items: StockView[];
}

export default function WarehousesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === "admin" || user?.role === "warehouse_staff";
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteWarehouse, setDeleteWarehouse] = useState<Warehouse | null>(null);

  const [stockMap, setStockMap] = useState<Record<string, WarehouseStockSummary>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await warehouseApi.getAll(PAGE_SIZE, offset);
      const whList = res.data || [];
      setWarehouses(whList);
      setTotal(res.meta?.total || 0);

      // Fetch stock summary for each warehouse
      const stockEntries = await Promise.all(
        whList.map(async (wh) => {
          try {
            const invRes = await inventoryApi.getAll({
              warehouse_id: wh.id,
              limit: 100,
            });
            const items = invRes.data || [];
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            return [wh.id, { totalProducts: items.length, totalQuantity, items }] as const;
          } catch {
            return [wh.id, { totalProducts: 0, totalQuantity: 0, items: [] }] as const;
          }
        })
      );
      setStockMap(Object.fromEntries(stockEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data gudang");
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleAddWarehouse = async (data: { name: string; location: string; address: string }) => {
    await warehouseApi.create(data);
    fetchWarehouses();
  };

  const handleEditWarehouse = async (data: { name: string; location: string; address: string }) => {
    if (!editWarehouse) return;
    await warehouseApi.update(editWarehouse.id, data);
    fetchWarehouses();
  };

  const handleDeleteWarehouse = async () => {
    if (!deleteWarehouse) return;
    await warehouseApi.delete(deleteWarehouse.id);
    fetchWarehouses();
  };



  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Gudang & Lokasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola titik penyimpanan dan pantau ketersediaan stok di setiap gudang.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button size="sm" onClick={() => { setEditWarehouse(null); setModalOpen(true); }} className="shadow-lg shadow-primary/20">
            <Plus size={14} className="mr-1.5" />
            Tambah Gudang
          </Button>
        </motion.div>
      </div>

      {/* Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="relative max-w-sm w-full group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari nama atau lokasi gudang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      {loading && warehouses.length === 0 ? (
        <WarehouseCardSkeleton count={6} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWarehouses}>
            <RefreshCw size={14} className="mr-1.5" />
            Coba Lagi
          </Button>
        </div>
      ) : warehouses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada gudang terdaftar"
          description="Daftarkan lokasi penyimpanan pertama Anda untuk mulai mengelola inventaris."
          actionLabel="Tambah Gudang Baru"
          onAction={() => setModalOpen(true)}
        />
      ) : (() => {
          const filtered = warehouses.filter((wh) => {
            if (!debouncedSearch) return true;
            const q = debouncedSearch.toLowerCase();
            return wh.name.toLowerCase().includes(q) || wh.location.toLowerCase().includes(q);
          });
          return filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Gudang tidak ditemukan"
              description={`Tidak ada gudang yang cocok dengan pencarian "${debouncedSearch}".`}
              actionLabel="Reset Pencarian"
              onAction={() => setSearchQuery("")}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((wh, idx) => {
                const stock = stockMap[wh.id];
                return (
                  <motion.div
                    key={wh.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`/dashboard/warehouses/${wh.id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                      {/* Decorative element */}
                      <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">{wh.name}</CardTitle>
                              <div className="flex items-center gap-1.5 mt-1">
                                <MapPin size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">{wh.location}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={wh.is_active ? "success" : "secondary"} className="rounded-full px-2.5">
                            {wh.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <div className="space-y-4">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                            {wh.address || "Alamat belum ditambahkan."}
                          </p>
                          
                          {/* Real stock data */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Jenis Produk</span>
                                <span className="text-sm font-bold text-foreground">{stock ? formatNumber(stock.totalProducts) : "—"}</span>
                              </div>
                              <div className="h-8 w-[1px] bg-border/50" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Stok</span>
                                <span className="text-sm font-bold text-foreground">{stock ? formatNumber(stock.totalQuantity) : "—"}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                asChild
                                title="Lihat Detail Gudang"
                              >
                                <Link href={`/dashboard/warehouses/${wh.id}`}>
                                  <Eye size={14} />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={(e) => { e.stopPropagation(); setEditWarehouse(wh); setModalOpen(true); }}
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={(e) => { e.stopPropagation(); setDeleteWarehouse(wh); setDeleteDialogOpen(true); }}
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
            <div className="pt-4 border-t border-border/50">
              <Pagination total={total} limit={PAGE_SIZE} offset={offset} onPageChange={setOffset} />
            </div>
          </div>
          );
        })()}

      <WarehouseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={editWarehouse ? handleEditWarehouse : handleAddWarehouse}
        warehouse={editWarehouse}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteWarehouse}
        title="Hapus Gudang"
        description={`Apakah Anda yakin ingin menghapus "${deleteWarehouse?.name}"? Seluruh data stok yang ada di gudang ini akan terhapus permanen.`}
        confirmLabel="Hapus Gudang"
      />
    </div>
  );
}
