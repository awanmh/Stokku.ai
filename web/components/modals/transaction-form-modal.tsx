"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product, Warehouse } from "@/lib/api";

const transactionSchema = z.object({
  warehouse_id: z.string().min(1, "Pilih gudang"),
  product_id: z.string().min(1, "Pilih produk"),
  type: z.enum(["stock_in", "stock_out"], { message: "Pilih tipe transaksi" }),
  quantity: z.number().int().min(1, "Quantity minimal 1"),
  reference: z.string(),
  notes: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  products: Product[];
  warehouses: Warehouse[];
}

export function TransactionFormModal({
  open,
  onOpenChange,
  onSubmit,
  products,
  warehouses,
}: TransactionFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      warehouse_id: "",
      product_id: "",
      type: "stock_in",
      quantity: 1,
      reference: "",
      notes: "",
    },
  });

  const txType = watch("type");

  const handleFormSubmit = async (data: TransactionFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(
        data.type === "stock_in" ? "Stock In berhasil dicatat" : "Stock Out berhasil dicatat"
      );
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Transaksi Baru</DialogTitle>
          <DialogDescription>
            Catat stock in atau stock out untuk produk tertentu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-1.5">
            <Label>Tipe Transaksi *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange("stock_in")}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      field.value === "stock_in"
                        ? "border-success bg-success/10 text-success"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <ArrowDownRight size={16} />
                    Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("stock_out")}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      field.value === "stock_out"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <ArrowUpRight size={16} />
                    Stock Out
                  </button>
                </div>
              )}
            />
          </div>

          {/* Warehouse */}
          <div className="space-y-1.5">
            <Label>Gudang *</Label>
            <Controller
              control={control}
              name="warehouse_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.warehouse_id && (
              <p className="text-xs text-red-500 mt-1">{errors.warehouse_id.message}</p>
            )}
          </div>

          {/* Product */}
          <div className="space-y-1.5">
            <Label>Produk *</Label>
            <Controller
              control={control}
              name="product_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.product_id && (
              <p className="text-xs text-red-500 mt-1">{errors.product_id.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Jumlah *</Label>
            <Input id="quantity" type="number" min="1" {...register("quantity", { valueAsNumber: true })} />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="reference">No. Referensi</Label>
            <Input id="reference" placeholder="PO-2026-001" {...register("reference")} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" placeholder="Catatan tambahan..." rows={2} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={txType === "stock_in" ? "bg-success hover:bg-success/90" : ""}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Memproses...
                </>
              ) : txType === "stock_in" ? (
                "Catat Stock In"
              ) : (
                "Catat Stock Out"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
