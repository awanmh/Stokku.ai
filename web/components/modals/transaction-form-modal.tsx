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
import { useState, useEffect } from "react";
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
  defaultValues?: {
    warehouse_id: string;
    product_id: string;
    type: "stock_in" | "stock_out";
  } | null;
}

export function TransactionFormModal({
  open,
  onOpenChange,
  onSubmit,
  products,
  warehouses,
  defaultValues,
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

  // Reset form when defaultValues or open changes
  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset({
          warehouse_id: defaultValues.warehouse_id,
          product_id: defaultValues.product_id,
          type: defaultValues.type,
          quantity: 1,
          reference: "",
          notes: "",
        });
      } else {
        reset({
          warehouse_id: "",
          product_id: "",
          type: "stock_in",
          quantity: 1,
          reference: "",
          notes: "",
        });
      }
    }
  }, [open, defaultValues, reset]);

  const txType = watch("type");

  const handleFormSubmit = async (data: TransactionFormData) => {
    // Validate UUID format before sending
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.warehouse_id)) {
      toast.error("Pilih gudang yang valid");
      return;
    }
    if (!uuidRegex.test(data.product_id)) {
      toast.error("Pilih produk yang valid");
      return;
    }

    // Sanitize quantity
    const sanitized = {
      ...data,
      quantity: Number.isNaN(data.quantity) ? 1 : data.quantity,
      reference: data.reference || "",
      notes: data.notes || "",
    };

    setSubmitting(true);
    try {
      await onSubmit(sanitized);
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
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Buat Transaksi Baru</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Catat stock in atau stock out untuk produk tertentu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 pt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipe Transaksi *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange("stock_in")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold ${
                      field.value === "stock_in"
                        ? "border-success bg-success/10 text-success shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                        : "border-border bg-background/50 hover:border-muted-foreground/30"
                    }`}
                  >
                    <ArrowDownRight size={18} />
                    Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("stock_out")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold ${
                      field.value === "stock_out"
                        ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        : "border-border bg-background/50 hover:border-muted-foreground/30"
                    }`}
                  >
                    <ArrowUpRight size={18} />
                    Stock Out
                  </button>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Warehouse */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gudang *</Label>
              <Controller
                control={control}
                name="warehouse_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-10 bg-background/50 border-border">
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
                <p className="text-[10px] font-medium text-destructive mt-1">{errors.warehouse_id.message}</p>
              )}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produk *</Label>
              <Controller
                control={control}
                name="product_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-10 bg-background/50 border-border">
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
                <p className="text-[10px] font-medium text-destructive mt-1">{errors.product_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah *</Label>
              <Input id="quantity" type="number" min="1" {...register("quantity", { valueAsNumber: true })} className="h-10 bg-background/50 border-border" />
              {errors.quantity && (
                <p className="text-[10px] font-medium text-destructive mt-1">{errors.quantity.message}</p>
              )}
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">No. Referensi</Label>
              <Input id="reference" placeholder="PO-2026-001" {...register("reference")} className="h-10 bg-background/50 border-border" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catatan</Label>
            <Textarea id="notes" placeholder="Catatan tambahan mengenai transaksi ini..." rows={2} {...register("notes")} className="bg-background/50 border-border" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={`min-w-[140px] shadow-lg ${txType === "stock_in" ? "bg-success hover:bg-success/90 shadow-success/20" : "shadow-primary/20"}`}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
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
