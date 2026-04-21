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
      setError(err instanceof Error ? err.message : "Failed to load transactions");
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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Stock-in and stock-out history.</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          New transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search product or reference..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="pl-9 h-8"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "stock_in", "stock_out"] as const).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setTypeFilter(type); setOffset(0); }}
                >
                  {type === "all" ? "All" : type === "stock_in" ? "In" : "Out"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Transaction log</CardTitle>
            <span className="text-xs text-muted-foreground">{total} transactions</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <TableSkeleton rows={8} columns={7} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTransactions}>
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ArrowRightLeft size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No transactions found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or create a new transaction.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge variant={tx.type === "stock_in" ? "success" : "destructive"}>
                            {tx.type === "stock_in" ? "In" : "Out"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">{tx.product_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{tx.product_sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>{tx.warehouse_name}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={tx.type === "stock_in" ? "text-success" : "text-destructive"}>
                            {tx.type === "stock_in" ? "+" : "-"}{formatNumber(tx.quantity)}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                        <TableCell>{tx.performer_name}</TableCell>
                        <TableCell className="text-xs">{formatDate(tx.created_at)}</TableCell>
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
