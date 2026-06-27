"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/lib/api";
import { PackageSearch, Tag, DollarSign, Activity, Calendar, Box } from "lucide-react";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailModal({ open, onOpenChange, product }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <PackageSearch size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                {product.sku}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <Tag size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Kategori</p>
                <p className="text-sm font-medium mt-1">{product.category || "General"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <DollarSign size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Harga Jual</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <Box size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Batas Stok</p>
                <p className="text-sm font-medium mt-1">Min: {product.min_stock} / Max: {product.max_stock}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <Activity size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                <Badge variant={product.is_active ? "success" : "secondary"} className="mt-1">
                  {product.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Terdaftar Pada</p>
                <p className="text-sm font-medium mt-1">{formatDate(product.created_at)}</p>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deskripsi</p>
              <p className="text-sm">{product.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
