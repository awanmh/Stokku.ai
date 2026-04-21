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
      setError(err instanceof Error ? err.message : "Failed to load warehouses");
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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Warehouses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your storage locations and facilities.
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditWarehouse(null); setModalOpen(true); }}>
          <Plus size={14} />
          Add warehouse
        </Button>
      </div>

      {loading ? (
        <WarehouseCardSkeleton count={6} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWarehouses}>
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 size={32} className="text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No warehouses yet</p>
          <p className="text-xs text-muted-foreground mb-4">Add your first warehouse to get started.</p>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={14} />
            Add warehouse
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <Card key={wh.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Building2 size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{wh.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{wh.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={wh.is_active ? "success" : "secondary"}>
                      {wh.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                    {wh.address || "No address provided"}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      onClick={() => { setEditWarehouse(wh); setModalOpen(true); }}
                      title="Edit warehouse"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      onClick={() => { setDeleteWarehouse(wh); setDeleteDialogOpen(true); }}
                      title="Delete warehouse"
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
        title="Delete warehouse"
        description={`Are you sure you want to delete "${deleteWarehouse?.name}"? All stock data in this warehouse will be removed.`}
        confirmLabel="Delete warehouse"
      />
    </div>
  );
}
