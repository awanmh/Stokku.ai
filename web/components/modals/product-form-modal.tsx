"use client";

import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/api";

const productSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi").max(100),
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  description: z.string(),
  category: z.string(),
  unit: z.string().min(1, "Satuan wajib diisi"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  min_stock: z.number().int().min(0, "Min stock tidak boleh negatif"),
  max_stock: z.number().int().min(0, "Max stock tidak boleh negatif"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product | null;
}

export function ProductFormModal({
  open,
  onOpenChange,
  onSubmit,
  product,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      unit: "pcs",
      price: 0,
      min_stock: 0,
      max_stock: 0,
    },
  });

  // Reset form values when modal opens or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          sku: product.sku,
          name: product.name,
          description: product.description || "",
          category: product.category || "",
          unit: product.unit,
          price: product.price || 0,
          min_stock: product.min_stock || 0,
          max_stock: product.max_stock || 0,
        });
      } else {
        reset({
          sku: "",
          name: "",
          description: "",
          category: "",
          unit: "pcs",
          price: 0,
          min_stock: 0,
          max_stock: 0,
        });
      }
    }
  }, [open, product, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    // Sanitize NaN values before sending to API
    const sanitized = {
      ...data,
      description: data.description || "",
      category: data.category || "",
      price: Number.isNaN(data.price) ? 0 : data.price,
      min_stock: Number.isNaN(data.min_stock) ? 0 : data.min_stock,
      max_stock: Number.isNaN(data.max_stock) ? 0 : data.max_stock,
    };
    setSubmitting(true);
    try {
      await onSubmit(sanitized);
      toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-h-none">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi produk di bawah ini"
              : "Isi detail produk baru yang akan ditambahkan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="BT-M820" {...register("sku")} disabled={isEdit} />
              {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Satuan *</Label>
              <Input id="unit" placeholder="pcs, kg, m" {...register("unit")} />
              {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input id="name" placeholder="Baut M8x20" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" placeholder="Material, Bahan Bangunan, dll" {...register("category")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Deskripsi produk..." rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input id="price" type="number" min="0" {...register("price", { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="min_stock">Min Stock</Label>
              <Input id="min_stock" type="number" min="0" {...register("min_stock", { valueAsNumber: true })} />
              {errors.min_stock && <p className="text-xs text-red-500 mt-1">{errors.min_stock.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max_stock">Max Stock</Label>
              <Input id="max_stock" type="number" min="0" {...register("max_stock", { valueAsNumber: true })} />
              {errors.max_stock && <p className="text-xs text-red-500 mt-1">{errors.max_stock.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Produk"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
