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
import { TransactionFormModal } from "@/components/modals/transaction-form-modal";
import {
  Search,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { transactionApi, productApi, warehouseApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import type { TransactionView, Product, Warehouse } from "@/lib/api";

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "stock_in" | "stock_out">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await transactionApi.getAll({
        type: typeFilter !== "all" ? typeFilter : undefined,
        limit: PAGE_SIZE,
        offset,
      });
      let txs = res.data || [];
      if (search) {
        const q = search.toLowerCase();
        txs = txs.filter(
          (t) =>
            t.product_name.toLowerCase().includes(q) ||
            t.reference.toLowerCase().includes(q) ||
            t.product_sku.toLowerCase().includes(q)
        );
      }
      setTransactions(txs);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, offset, search]);

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
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const handleCreateTransaction = async (data: any) => {
    await transactionApi.create(data);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Lacak semua pergerakan stok masuk dan keluar.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button size="sm" onClick={() => setModalOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus size={14} className="mr-1.5" />
            Transaksi Baru
          </Button>
        </motion.div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Cari produk atau referensi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50">
              {(["all", "stock_in", "stock_out"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(type); setOffset(0); }}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    typeFilter === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "Semua" : type === "stock_in" ? "Masuk" : "Keluar"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-0 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Log Transaksi</CardTitle>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{total} transaksi</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && transactions.length === 0 ? (
            <TableSkeleton rows={10} columns={7} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTransactions}>
                <RefreshCw size={14} className="mr-1.5" />
                Coba Lagi
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-secondary/50 mb-4">
                <ArrowRightLeft size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Tidak ada transaksi</p>
              <p className="text-xs text-muted-foreground mb-6">Sesuaikan filter atau catat pergerakan stok baru.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[80px]">Tipe</TableHead>
                      <TableHead className="min-w-[200px]">Produk</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Referensi</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead className="text-right">Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {transactions.map((tx, idx) => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {tx.type === "stock_in" ? (
                                <div className="p-1.5 rounded-full bg-success/10 text-success" title="Stock In">
                                  <ArrowDownRight size={14} />
                                </div>
                              ) : (
                                <div className="p-1.5 rounded-full bg-destructive/10 text-destructive" title="Stock Out">
                                  <ArrowUpRight size={14} />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{tx.product_name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono tracking-tighter">{tx.product_sku}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-muted-foreground">
                            {tx.warehouse_name}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            <span className={tx.type === "stock_in" ? "text-success" : "text-destructive"}>
                              {tx.type === "stock_in" ? "+" : "-"}{formatNumber(tx.quantity)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <code className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50">
                              {tx.reference || "N/A"}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <UserIcon size={12} className="opacity-50" />
                              {tx.performer_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-medium text-foreground/80">{formatDate(tx.created_at)}</span>
                              <span className="text-[9px] text-muted-foreground/60">Berhasil</span>
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

      <TransactionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateTransaction}
        products={products}
        warehouses={warehouses}
      />
    </div>
  );
}
