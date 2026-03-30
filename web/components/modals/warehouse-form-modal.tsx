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
import type { Warehouse } from "@/lib/api";

const warehouseSchema = z.object({
  name: z.string().min(1, "Nama gudang wajib diisi").max(255),
  location: z.string().min(1, "Lokasi wajib diisi").max(255),
  address: z.string(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  warehouse?: Warehouse | null;
}

export function WarehouseFormModal({
  open,
  onOpenChange,
  onSubmit,
  warehouse,
}: WarehouseFormModalProps) {
  const isEdit = !!warehouse;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: "", location: "", address: "" },
  });

  // Reset form values when modal opens or warehouse changes
  useEffect(() => {
    if (open) {
      if (warehouse) {
        reset({
          name: warehouse.name,
          location: warehouse.location,
          address: warehouse.address,
        });
      } else {
        reset({ name: "", location: "", address: "" });
      }
    }
  }, [open, warehouse, reset]);

  const handleFormSubmit = async (data: WarehouseFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEdit ? "Gudang berhasil diperbarui" : "Gudang berhasil ditambahkan");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan gudang");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-h-none">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gudang" : "Tambah Gudang Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi gudang di bawah ini"
              : "Isi informasi lokasi gudang baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">Nama Gudang *</Label>
            <Input id="wh-name" placeholder="Gudang Utama Jakarta" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-location">Lokasi *</Label>
            <Input id="wh-location" placeholder="Jakarta Barat" {...register("location")} />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-address">Alamat Lengkap</Label>
            <Textarea id="wh-address" placeholder="Jl. Industri Raya No. 45" rows={2} {...register("address")} />
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
                "Tambah Gudang"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
