"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { WarehouseCardSkeleton } from "@/components/ui/skeleton";
import { WarehouseFormModal } from "@/components/modals/warehouse-form-modal";
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog";
import {
  Building2,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { warehouseApi } from "@/lib/api";
import type { Warehouse } from "@/lib/api";

const PAGE_SIZE = 12;

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteWarehouse, setDeleteWarehouse] = useState<Warehouse | null>(null);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await warehouseApi.getAll(PAGE_SIZE, offset);
      setWarehouses(res.data || []);
      setTotal(res.meta?.total || 0);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Gudang</h2>
          <p className="text-sm text-muted-foreground">
            Kelola gudang dan lokasi penyimpanan
          </p>
        </div>
        <Button onClick={() => { setEditWarehouse(null); setModalOpen(true); }}>
          <Plus size={16} />
          Tambah Gudang
        </Button>
      </div>

      {loading ? (
        <WarehouseCardSkeleton count={6} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchWarehouses}>
            <RefreshCw size={14} />
            Coba Lagi
          </Button>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 size={48} className="mb-3 opacity-40" />
          <p className="text-sm">Belum ada gudang terdaftar</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
            <Plus size={14} />
            Tambah Gudang Pertama
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <Card key={wh.id} className="hover:shadow-md transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-chart-4/10">
                        <Building2 size={20} className="text-chart-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{wh.name}</CardTitle>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{wh.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={wh.is_active ? "success" : "secondary"}>
                      {wh.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                    {wh.address || "Alamat belum diisi"}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditWarehouse(wh);
                        setModalOpen(true);
                      }}
                      title="Edit gudang"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setDeleteWarehouse(wh);
                        setDeleteDialogOpen(true);
                      }}
                      title="Hapus gudang"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination total={total} limit={PAGE_SIZE} offset={offset} onPageChange={setOffset} />
        </>
      )}

      {/* Warehouse Form Modal (Add + Edit) */}
      <WarehouseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={editWarehouse ? handleEditWarehouse : handleAddWarehouse}
        warehouse={editWarehouse}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteWarehouse}
        title="Hapus Gudang"
        description={`Apakah Anda yakin ingin menghapus gudang "${deleteWarehouse?.name}"? Semua data stok di gudang ini akan terhapus.`}
        confirmLabel="Hapus Gudang"
      />
    </div>
  );
}
