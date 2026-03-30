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
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { transactionApi, productApi, warehouseApi } from "@/lib/api";
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
            t.reference.toLowerCase().includes(q)
        );
      }
      setTransactions(txs);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat transaksi");
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
      // silent — form will show empty selects
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const handleCreateTransaction = async (data: { warehouse_id: string; product_id: string; type: "stock_in" | "stock_out"; quantity: number; reference?: string; notes?: string }) => {
    await transactionApi.create(data);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Transaksi</h2>
          <p className="text-sm text-muted-foreground">Riwayat stock in dan stock out</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Buat Transaksi
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk atau referensi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "stock_in", "stock_out"] as const).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setTypeFilter(type); setOffset(0); }}
                >
                  {type === "all" ? "Semua" : type === "stock_in" ? "Masuk" : "Keluar"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft size={16} />
              Riwayat Transaksi
            </CardTitle>
            <span className="text-sm text-muted-foreground">{total} transaksi</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={8} columns={7} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTransactions}>
                <RefreshCw size={14} />
                Coba Lagi
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ArrowRightLeft size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Gudang</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${tx.type === "stock_in" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {tx.type === "stock_in" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          </div>
                          <Badge variant={tx.type === "stock_in" ? "success" : "destructive"} className="text-xs">
                            {tx.type === "stock_in" ? "Masuk" : "Keluar"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.product_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{tx.product_sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{tx.warehouse_name}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={tx.type === "stock_in" ? "text-success" : "text-destructive"}>
                          {tx.type === "stock_in" ? "+" : "-"}{formatNumber(tx.quantity)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{tx.reference}</TableCell>
                      <TableCell className="text-sm">{tx.performer_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.created_at)}</TableCell>
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
