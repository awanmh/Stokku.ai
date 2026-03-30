"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ProductFormModal } from "@/components/modals/product-form-modal";
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog";
import { Search, Filter, Plus, Package, RefreshCw, Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { inventoryApi, productApi } from "@/lib/api";
import type { StockView, Product } from "@/lib/api";

const PAGE_SIZE = 15;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<StockView[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteProductName, setDeleteProductName] = useState("");

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryApi.getAll({
        search: search || undefined,
        low_stock: filterLowStock || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setInventory(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat inventaris");
    } finally {
      setLoading(false);
    }
  }, [search, filterLowStock, offset]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchInventory(), 300);
    return () => clearTimeout(debounce);
  }, [fetchInventory]);

  const handleAddProduct = async (data: { sku: string; name: string; description?: string; category?: string; unit: string; price: number; min_stock: number; max_stock: number }) => {
    await productApi.create(data);
    fetchInventory();
  };

  const handleEditProduct = async (data: { sku: string; name: string; description?: string; category?: string; unit: string; price: number; min_stock: number; max_stock: number }) => {
    if (!editProduct) return;
    await productApi.update(editProduct.id, data);
    fetchInventory();
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    await productApi.delete(deleteProductId);
    fetchInventory();
  };

  const openEditModal = async (productId: string) => {
    try {
      const res = await productApi.getById(productId);
      setEditProduct(res.data);
      setProductModalOpen(true);
    } catch {
      // toast handled by global 401 or we can show inline
    }
  };

  const openDeleteDialog = (productId: string, productName: string) => {
    setDeleteProductId(productId);
    setDeleteProductName(productName);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Inventaris</h2>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau stok semua produk di seluruh gudang
          </p>
        </div>
        <Button onClick={() => { setEditProduct(null); setProductModalOpen(true); }}>
          <Plus size={16} />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk atau SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="pl-9"
              />
            </div>
            <Button
              variant={filterLowStock ? "default" : "outline"}
              onClick={() => { setFilterLowStock(!filterLowStock); setOffset(0); }}
              className="shrink-0"
            >
              <Filter size={16} />
              Low Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package size={16} />
              Daftar Stok
            </CardTitle>
            <span className="text-sm text-muted-foreground">{total} item</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={8} columns={9} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchInventory}>
                <RefreshCw size={14} />
                Coba Lagi
              </Button>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Tidak ada data inventaris ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{item.product_sku}</TableCell>
                        <TableCell>{item.warehouse_name}</TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(item.quantity)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatNumber(item.min_stock)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total_value)}</TableCell>
                        <TableCell>
                          {item.quantity <= item.min_stock ? (
                            <Badge variant="destructive">Low</Badge>
                          ) : item.quantity <= item.min_stock * 1.5 ? (
                            <Badge variant="warning">Warning</Badge>
                          ) : (
                            <Badge variant="success">Aman</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditModal(item.product_id)}
                              title="Edit produk"
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(item.product_id, item.product_name)}
                              title="Hapus produk"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination total={total} limit={PAGE_SIZE} offset={offset} onPageChange={setOffset} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal (Add + Edit) */}
      <ProductFormModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        onSubmit={editProduct ? handleEditProduct : handleAddProduct}
        product={editProduct}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Hapus Produk"
        description={`Apakah Anda yakin ingin menghapus produk "${deleteProductName}"? Semua data stok terkait akan terhapus.`}
        confirmLabel="Hapus Produk"
      />
    </div>
  );
}
