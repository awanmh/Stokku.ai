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
import {
  Search,
  Plus,
  PackageSearch,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productApi } from "@/lib/api";
import type { Product, CreateProductRequest } from "@/lib/api";

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productApi.getAll({
        search: search || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setProducts(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, offset]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (data: CreateProductRequest) => {
    await productApi.create(data);
    fetchProducts();
  };

  const handleEditProduct = async (data: CreateProductRequest) => {
    if (!editProduct) return;
    await productApi.update(editProduct.id, data);
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    await productApi.delete(deleteProduct.id);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola master data produk.</p>
        </div>
        <Button size="sm" onClick={() => { setEditProduct(null); setModalOpen(true); }}>
          <Plus size={14} />
          Tambah Produk
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari SKU atau nama produk..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              className="pl-9 h-8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Database Produk</CardTitle>
            <span className="text-xs text-muted-foreground">{total} produk</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <PackageSearch size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No products found</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first product to master data.</p>
              <Button variant="outline" size="sm" onClick={() => { setEditProduct(null); setModalOpen(true); }}>
                <Plus size={14} />
                Add product
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Min/Max limits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-[10px]">
                            {p.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(p.price)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {p.min_stock} / {p.max_stock} <span className="text-[10px] uppercase tracking-widest">{p.unit}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.is_active ? "success" : "secondary"}>
                            {p.is_active ? "Active" : "Archived"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => { setEditProduct(p); setModalOpen(true); }}
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => { setDeleteProduct(p); setDeleteDialogOpen(true); }}
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

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={editProduct ? handleEditProduct : handleAddProduct}
        product={editProduct}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Delete product"
        description={`Are you sure you want to delete "${deleteProduct?.name}"? You cannot delete this product if it has existing inventory or transactions.`}
        confirmLabel="Delete product"
      />
    </div>
  );
}
