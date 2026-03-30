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
  Settings as SettingsIcon,
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/api";

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  admin: { label: "Admin", variant: "default" },
  warehouse_staff: { label: "Staff Gudang", variant: "secondary" },
  viewer: { label: "Viewer", variant: "outline" },
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
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
      setError(err instanceof Error ? err.message : "Gagal memuat data pengguna");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SettingsIcon size={22} />
          Pengaturan
        </h2>
        <p className="text-sm text-muted-foreground">
          Kelola pengguna dan konfigurasi sistem
        </p>
      </div>

      {/* RBAC Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Role & Permission
          </CardTitle>
          <CardDescription>Sistem role-based access control (RBAC)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Badge className="mb-2">Admin</Badge>
              <p className="text-xs text-muted-foreground">
                Akses penuh: CRUD produk, gudang, transaksi, user management, dan konfigurasi sistem.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Badge variant="secondary" className="mb-2">Staff Gudang</Badge>
              <p className="text-xs text-muted-foreground">
                Buat produk, transaksi stock in/out. Tidak bisa kelola user atau hapus gudang.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Badge variant="outline" className="mb-2">Viewer</Badge>
              <p className="text-xs text-muted-foreground">
                Hanya bisa melihat data. Tidak bisa membuat atau mengedit apapun.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={16} />
                Daftar Pengguna
              </CardTitle>
              <CardDescription className="mt-1">
                {users.length} pengguna terdaftar
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus size={14} />
              Tambah User
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
                Coba Lagi
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Belum ada pengguna terdaftar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleLabels[user.role]?.variant || "outline"}>
                        {roleLabels[user.role]?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "success" : "secondary"}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
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

      {/* Add User Modal */}
      <UserFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmitAdd={handleAddUser}
      />

      {/* Edit User Modal */}
      <UserFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
        onSubmitEdit={handleEditUser}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna "${selectedUser?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Pengguna"
      />
    </div>
  );
}
