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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@/lib/api";

const addUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().min(1, "Nama wajib diisi").max(255),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "warehouse_staff", "viewer"], { message: "Pilih role" }),
});

const editUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  role: z.enum(["admin", "warehouse_staff", "viewer"], { message: "Pilih role" }),
});

type AddUserFormData = z.infer<typeof addUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitAdd?: (data: AddUserFormData) => Promise<void>;
  onSubmitEdit?: (data: EditUserFormData) => Promise<void>;
  user?: User | null;
}

export function UserFormModal({
  open,
  onOpenChange,
  onSubmitAdd,
  onSubmitEdit,
  user,
}: UserFormModalProps) {
  const isEdit = !!user;
  const [submitting, setSubmitting] = useState(false);

  const addForm = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { email: "", name: "", password: "", role: "viewer" },
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", role: "viewer" },
  });

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (open) {
      if (isEdit && user) {
        editForm.reset({ name: user.name, role: user.role });
      } else {
        addForm.reset({ email: "", name: "", password: "", role: "viewer" });
      }
    }
  }, [open, user, isEdit, addForm, editForm]);

  const handleAdd = async (data: AddUserFormData) => {
    setSubmitting(true);
    try {
      await onSubmitAdd?.(data);
      toast.success("Pengguna berhasil ditambahkan");
      addForm.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: EditUserFormData) => {
    setSubmitting(true);
    try {
      await onSubmitEdit?.(data);
      toast.success("Pengguna berhasil diperbarui");
      editForm.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "warehouse_staff", label: "Staff Gudang" },
    { value: "viewer", label: "Viewer" },
  ];

  if (isEdit) {
    const { register, handleSubmit, control, formState: { errors } } = editForm;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui nama dan role pengguna. Password tidak bisa diubah dari sini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nama *</Label>
              <Input id="edit-name" placeholder="Nama lengkap" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="animate-spin" size={16} /> Menyimpan...</>
                ) : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Add mode
  const { register, handleSubmit, control, formState: { errors } } = addForm;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Buat akun pengguna baru dengan role tertentu
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAdd)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email *</Label>
            <Input id="add-email" type="email" placeholder="email@perusahaan.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Nama *</Label>
            <Input id="add-name" placeholder="Nama lengkap" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-password">Password *</Label>
            <Input id="add-password" type="password" placeholder="Minimal 6 karakter" {...register("password")} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="animate-spin" size={16} /> Menambahkan...</>
              ) : "Tambah Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
