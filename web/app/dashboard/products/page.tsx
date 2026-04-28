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
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, CreateProductRequest } from "@/lib/api";

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
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
        search: debouncedSearch || undefined,
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
  }, [debouncedSearch, offset]);

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

  // Helper for category colors
  const getCategoryVariant = (category: string) => {
    const c = category?.toLowerCase() || "";
    if (c.includes("electro")) return "success";
    if (c.includes("food") || c.includes("bever")) return "warning";
    if (c.includes("cloth") || c.includes("apparel")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola master data produk Anda secara terpusat.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button size="sm" onClick={() => { setEditProduct(null); setModalOpen(true); }} className="shadow-lg shadow-primary/20">
            <Plus size={14} className="mr-1.5" />
            Tambah Produk
          </Button>
        </motion.div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="relative max-w-sm w-full group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari SKU atau nama produk..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-0 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Database Produk</CardTitle>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{total} produk</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && products.length === 0 ? (
            <TableSkeleton rows={8} columns={6} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw size={14} className="mr-1.5" />
                Coba Lagi
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-secondary/50 mb-4">
                <PackageSearch size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Belum ada produk</p>
              <p className="text-xs text-muted-foreground mb-6 max-w-[200px]">Mulai dengan menambahkan produk pertama ke dalam sistem.</p>
              <Button variant="outline" size="sm" onClick={() => { setEditProduct(null); setModalOpen(true); }}>
                <Plus size={14} className="mr-1.5" />
                Tambah Sekarang
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[300px]">Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Min/Max Stok</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {products.map((p, idx) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="group border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono tracking-tighter">{p.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getCategoryVariant(p.category)} className="font-normal text-[10px] capitalize">
                              {p.category || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground/80">
                            {formatCurrency(p.price)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            <span className="font-medium text-foreground/70">{p.min_stock}</span>
                            <span className="mx-1 text-border">/</span>
                            <span>{p.max_stock}</span>
                            <span className="ml-1.5 text-[9px] uppercase tracking-widest text-muted-foreground/60">{p.unit}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted"}`} />
                              <span className="text-[11px] text-muted-foreground">
                                {p.is_active ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => { setEditProduct(p); setModalOpen(true); }}
                              >
                                <Edit2 size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={() => { setDeleteProduct(p); setDeleteDialogOpen(true); }}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-border/50">
                <Pagination total={total} limit={PAGE_SIZE} offset={offset} onPageChange={setOffset} />
              </div>
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
        title="Hapus Produk"
        description={`Apakah Anda yakin ingin menghapus "${deleteProduct?.name}"? Tindakan ini tidak dapat dibatalkan jika produk sudah memiliki data transaksi.`}
        confirmLabel="Hapus Produk"
      />
    </div>
  );
}
