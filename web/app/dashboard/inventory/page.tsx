"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionFormModal } from "@/components/modals/transaction-form-modal";
import {
  Package,
  Search,
  RefreshCw,
  ArrowRightLeft,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { inventoryApi, productApi, warehouseApi, transactionApi } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import type { StockView, Product, Warehouse } from "@/lib/api";

const PAGE_SIZE = 15;

type InvSortKey = "product_name" | "warehouse_name" | "quantity" | "total_value";
type SortDir = "asc" | "desc";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<StockView[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<InvSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Modal state for stock transaction
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [prefillData, setPrefillData] = useState<{
    warehouse_id: string;
    product_id: string;
    type: "stock_in" | "stock_out";
  } | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryApi.getAll({
        search: debouncedSearch || undefined,
        warehouse_id: warehouseFilter !== "all" ? warehouseFilter : undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setInventory(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data inventaris");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, warehouseFilter, offset]);

  const fetchFormData = useCallback(async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        productApi.getAll({ limit: 100 }),
        warehouseApi.getAll(100),
      ]);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const handleCreateTransaction = async (data: { warehouse_id: string; product_id: string; type: "stock_in" | "stock_out"; quantity: number; notes?: string }) => {
    await transactionApi.create(data);
    fetchInventory();
  };

  const openRestockModal = (item: StockView) => {
    setPrefillData({
      warehouse_id: item.warehouse_id,
      product_id: item.product_id,
      type: "stock_in",
    });
    setModalOpen(true);
  };

  const toggleSort = (key: InvSortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: InvSortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="ml-1 text-primary" />
      : <ArrowDown size={12} className="ml-1 text-primary" />;
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortKey) return 0;
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "product_name") return a.product_name.localeCompare(b.product_name) * dir;
    if (sortKey === "warehouse_name") return a.warehouse_name.localeCompare(b.warehouse_name) * dir;
    if (sortKey === "quantity") return (a.quantity - b.quantity) * dir;
    if (sortKey === "total_value") return (a.total_value - b.total_value) * dir;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Inventaris</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau level stok dan pergerakan produk secara real-time.
          </p>
        </motion.div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading} className="hidden sm:flex">
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setPrefillData(null); setModalOpen(true); }} className="shadow-lg shadow-primary/20">
            <ArrowRightLeft size={14} className="mr-1.5" />
            Stock In/Out
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Cari SKU atau nama produk..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter size={14} className="text-muted-foreground" />
              <Select value={warehouseFilter} onValueChange={(v) => { setWarehouseFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-9 bg-background/50 border-border/50">
                  <SelectValue placeholder="Semua Gudang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gudang</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-0 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Data Stok</CardTitle>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{total} item terdaftar</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && inventory.length === 0 ? (
            <TableSkeleton rows={8} columns={6} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchInventory}>
                <RefreshCw size={14} className="mr-1.5" />
                Coba Lagi
              </Button>
            </div>
          ) : inventory.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Stok Kosong"
              description="Belum ada data stok yang tercatat untuk filter ini."
              actionLabel="Buat Transaksi"
              onAction={() => { setPrefillData(null); setModalOpen(true); }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[300px] cursor-pointer select-none" onClick={() => toggleSort("product_name")}>
                        <span className="flex items-center">Produk <SortIcon col="product_name" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("warehouse_name")}>
                        <span className="flex items-center">Gudang <SortIcon col="warehouse_name" /></span>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("quantity")}>
                        <span className="flex items-center justify-end">Jumlah <SortIcon col="quantity" /></span>
                      </TableHead>
                      <TableHead className="text-right">Min Stok</TableHead>
                      <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("total_value")}>
                        <span className="flex items-center justify-end">Nilai <SortIcon col="total_value" /></span>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {sortedInventory.map((item, idx) => {
                        const isLow = item.quantity <= item.min_stock;
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`group border-border/50 hover:bg-secondary/30 transition-colors ${idx % 2 === 1 ? "bg-secondary/10" : ""}`}
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{item.product_name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono tracking-tighter">{item.product_sku}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-medium">
                              {item.warehouse_name}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                              {formatNumber(item.quantity)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground/60 text-xs">
                              {formatNumber(item.min_stock)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-foreground/80">
                              {formatCurrency(item.total_value)}
                            </TableCell>
                            <TableCell>
                              {isLow ? (
                                <Badge variant="destructive" className="rounded-full px-2 text-[9px] uppercase tracking-wider shadow-[0_0_8px_rgba(239,68,68,0.2)]">Stok Rendah</Badge>
                              ) : (
                                <Badge variant="success" className="rounded-full px-2 text-[9px] uppercase tracking-wider">Aman</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-primary hover:bg-primary/10 transition-colors"
                                onClick={() => openRestockModal(item)}
                              >
                                Restok
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
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

      {/* Transaction modal */}
      <TransactionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateTransaction}
        products={products}
        warehouses={warehouses}
        defaultValues={prefillData}
      />
    </div>
  );
}
