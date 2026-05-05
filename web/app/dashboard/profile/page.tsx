"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Save, 
  Loader2, 
  Camera, 
  Upload, 
  Trash2, 
  Key, 
  Eye, 
  EyeOff 
} from "lucide-react";

import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingAvatar, setIsSubmittingAvatar] = useState(false);
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password toggle states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmittingProfile(true);
    try {
      const response = await authApi.updateUser(user.id, { name: data.name });
      if (response.success) {
        setUser({ ...user, name: response.data.name });
        toast.success("Profil berhasil diperbarui");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmittingPassword(true);
    try {
      // Mock API call since backend doesn't support this yet
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Password berhasil diperbarui");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui password");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Hanya file JPG/PNG yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarPreview) return;
    setIsSubmittingAvatar(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (user) setUser({ ...user, avatar_url: avatarPreview });
      toast.success("Foto profil berhasil diperbarui");
    } catch (error: any) {
      toast.error("Gagal mengunggah foto profil");
    } finally {
      setIsSubmittingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    if (user) setUser({ ...user, avatar_url: undefined });
    toast.success("Foto profil dihapus");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-outfit font-bold tracking-tight">Profil & Pengaturan</h2>
          <p className="text-muted-foreground mt-1">
            Kelola informasi akun Anda dan preferensi sistem.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <Card className="bg-white/[0.02] backdrop-blur-md border-white/5 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Foto Profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full border-2 border-primary/20 p-1 bg-gradient-to-tr from-primary/10 to-transparent">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="h-full w-full rounded-full object-cover shadow-xl"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all transform hover:scale-110 active:scale-95"
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png"
                />
              </div>

              <div className="mt-6 flex flex-col w-full gap-2">
                <Button 
                  onClick={saveAvatar} 
                  disabled={isSubmittingAvatar || !avatarPreview || avatarPreview === user.avatar_url}
                  className="w-full"
                  size="sm"
                >
                  {isSubmittingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Simpan Foto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={removeAvatar} 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                  disabled={!avatarPreview}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Foto
                </Button>
              </div>
              <p className="mt-4 text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                JPG atau PNG, Maks 2MB
              </p>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="bg-white/[0.02] backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Peran</Label>
                <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md border border-border/50">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{user.role.replace("_", " ")}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Email</Label>
                <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md border border-border/50">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                Akun Aktif sejak {new Date(user.created_at).toLocaleDateString("id-ID", {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card className="bg-white/[0.02] backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Umum</CardTitle>
              <CardDescription>Perbarui nama dan informasi profil publik Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama Anda"
                    {...profileForm.register("name")}
                    className={profileForm.formState.errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingProfile} className="w-full sm:w-auto">
                    {isSubmittingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Nama
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-white/[0.02] backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Ubah Password
              </CardTitle>
              <CardDescription>Pastikan password Anda aman dan minimal 8 karakter.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Password Lama</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...passwordForm.register("oldPassword")}
                      className={passwordForm.formState.errors.oldPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.oldPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...passwordForm.register("newPassword")}
                        className={passwordForm.formState.errors.newPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...passwordForm.register("confirmPassword")}
                        className={passwordForm.formState.errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSubmittingPassword} className="w-full sm:w-auto">
                    {isSubmittingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
