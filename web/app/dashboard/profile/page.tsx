"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User as UserIcon, Mail, Shield, Save, Loader2 } from "lucide-react";

import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Assuming authApi.updateUser works for the current user to update their name
      const response = await authApi.updateUser(user.id, { name: data.name });
      
      if (response.success) {
        setUser({ ...user, name: response.data.name });
        toast.success("Profil berhasil diperbarui");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 pb-12 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-outfit font-bold tracking-tight">Profil & Pengaturan</h2>
        <p className="text-muted-foreground mt-1">
          Kelola informasi akun Anda dan preferensi sistem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="bg-white/[0.02] backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="h-5 w-5 text-primary" />
              Informasi Pengguna
            </CardTitle>
            <CardDescription>
              Detail profil Anda saat ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Peran</Label>
              <div className="flex items-center gap-2 bg-secondary/50 p-2.5 rounded-md border border-border/50">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium capitalize">{user.role.replace("_", " ")}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
              <div className="flex items-center gap-2 bg-secondary/50 p-2.5 rounded-md border border-border/50">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>Akun dibuat pada: {new Date(user.created_at).toLocaleDateString("id-ID", {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="bg-white/[0.02] backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Edit Profil</CardTitle>
            <CardDescription>
              Perbarui nama tampilan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama Anda"
                  {...register("name")}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
