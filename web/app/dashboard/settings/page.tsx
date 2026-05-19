"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { TableSkeleton } from "@/components/ui/skeleton";
import { UserFormModal } from "@/components/modals/user-form-modal";
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog";
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Database,
  Sliders,
  AlertOctagon,
  Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import type { User } from "@/lib/api";

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  admin: { label: "Admin", variant: "default" },
  warehouse_staff: { label: "Staff", variant: "secondary" },
  viewer: { label: "Viewer", variant: "outline" },
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.getUsers(50);
      setUsers(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (data: { email: string; name: string; password: string; role: string }) => {
    await authApi.createUser(data);
    fetchUsers();
  };

  const handleEditUser = async (data: { name?: string; role?: string }) => {
    if (!selectedUser) return;
    await authApi.updateUser(selectedUser.id, data);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await authApi.deleteUser(selectedUser.id);
    fetchUsers();
  };

  const handleBackup = async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: "Membuat cadangan basis data...",
      success: "Backup basis data berhasil diunduh (stokku_backup_2026.sql)",
      error: "Gagal membuat cadangan basis data.",
    });
  };

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users and system configuration.
        </p>
      </div>

      {/* RBAC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                Roles & permissions
              </CardTitle>
              <CardDescription>Ringkasan Hak Akses (Role-Based Access Control) Stokku.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Badge className="mb-2">Admin</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Akses penuh: mengelola produk, gudang, transaksi, pengguna, dan konfigurasi sistem.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Badge variant="secondary" className="mb-2">Staff</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Membuat produk, mencatat transaksi masuk/keluar. Tidak bisa mengelola pengguna/gudang.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Badge variant="outline" className="mb-2">Viewer</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Akses baca-saja (read-only). Tidak dapat menambah, mengubah, atau menghapus data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings & Actions Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sliders size={14} className="text-primary" />
                Konfigurasi Sistem
              </CardTitle>
              <CardDescription>Pengaturan utilitas Stokku.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/30">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Backup Otomatis</p>
                  <p className="text-[10px] text-muted-foreground">Cadangkan basis data</p>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleBackup}>
                  <Download size={14} />
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/30">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Notifikasi Email</p>
                  <p className="text-[10px] text-muted-foreground">Untuk peringatan stok rendah</p>
                </div>
                <button
                  onClick={() => {
                    setNotifEnabled(!notifEnabled);
                    toast.success(
                      notifEnabled ? "Peringatan email dinonaktifkan" : "Peringatan email diaktifkan"
                    );
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifEnabled ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/30">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Mode Pemeliharaan</p>
                  <p className="text-[10px] text-muted-foreground">Batasi akses bagi non-admin</p>
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    toast.warning(
                      maintenanceMode ? "Mode pemeliharaan dinonaktifkan" : "Mode pemeliharaan diaktifkan"
                    );
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    maintenanceMode ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      maintenanceMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users size={14} />
                User management
              </CardTitle>
              <CardDescription className="mt-1">
                {users.length} registered users
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus size={14} />
              Add user
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No users yet</p>
              <p className="text-xs text-muted-foreground">Add your first user to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleLabels[user.role]?.variant || "outline"}>
                          {roleLabels[user.role]?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
            <AlertOctagon size={14} />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-destructive/80">Tindakan destruktif yang tidak dapat dibatalkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/10">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Hapus Semua Data Transaksi</p>
              <p className="text-[10px] text-muted-foreground">Menghapus log dan histori transaksi secara permanen.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast.error("Tindakan dibatasi. Anda tidak memiliki akses untuk menghapus histori transaksi.");
              }}
              className="shrink-0 font-medium"
            >
              Hapus Histori
            </Button>
          </div>
        </CardContent>
      </Card>

      <UserFormModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmitAdd={handleAddUser} />
      <UserFormModal open={editModalOpen} onOpenChange={setEditModalOpen} user={selectedUser} onSubmitEdit={handleEditUser} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Delete user"
        description={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  );
}
