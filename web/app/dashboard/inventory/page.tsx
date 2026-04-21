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
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { TransactionFormModal } from "@/components/modals/transaction-form-modal";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { inventoryApi, productApi, warehouseApi } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { StockView, Product, Warehouse } from "@/lib/api";

const PAGE_SIZE = 15;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<StockView[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state for stock transaction
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryApi.getAll({
        search: search || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setInventory(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [search, offset]);

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
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const handleCreateTransaction = async (data: {
    warehouse_id: string;
    product_id: string;
    type: "stock_in" | "stock_out";
    quantity: number;
    reference?: string;
    notes?: string;
  }) => {
    const { transactionApi } = await import("@/lib/api");
    await transactionApi.create(data);
    fetchInventory();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor stock levels and product movements in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <ArrowRightLeft size={14} className="mr-1.5" />
            Stock In/Out
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              className="pl-9 h-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Stock levels</CardTitle>
            <span className="text-xs text-muted-foreground">{total} items</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchInventory}>
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Package size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No inventory data yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create a stock transaction to start tracking inventory.
              </p>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                <ArrowRightLeft size={14} />
                Create first transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Min stock</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const isLow = item.quantity <= item.min_stock;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.product_sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.warehouse_name}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatNumber(item.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.min_stock)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_value)}
                          </TableCell>
                          <TableCell>
                            {isLow ? (
                              <Badge variant="destructive">Low</Badge>
                            ) : (
                              <Badge variant="success">OK</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-border">
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
      />
    </div>
  );
}
