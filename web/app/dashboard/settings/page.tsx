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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users and system configuration.
        </p>
      </div>

      {/* RBAC */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield size={14} />
            Roles & permissions
          </CardTitle>
          <CardDescription>Role-based access control (RBAC) overview.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <Badge className="mb-2">Admin</Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full access: manage products, warehouses, transactions, users, and system configuration.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <Badge variant="secondary" className="mb-2">Staff</Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create products, record stock-in/out transactions. Cannot manage users or delete warehouses.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <Badge variant="outline" className="mb-2">Viewer</Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Read-only access. Cannot create, edit, or delete any data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
