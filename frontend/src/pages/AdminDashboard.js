import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, toggleBlockUser, deleteUser, createUser, updateUser } from '../utils/localStorage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield, Users, LogOut, UserPlus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleBlock = (userId) => {
    toggleBlockUser(userId);
    loadUsers();
    toast.success('Status user berhasil diubah');
  };

  const handleDelete = (userId) => {
    if (userId === currentUser.id) {
      toast.error('Tidak bisa menghapus akun sendiri');
      return;
    }
    deleteUser(userId);
    loadUsers();
    toast.success('User berhasil dihapus');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('User berhasil diupdate');
    } else {
      createUser(formData);
      toast.success('User berhasil dibuat');
    }
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
    loadUsers();
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: user.password, role: user.role });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
    setDialogOpen(true);
  };

  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Selamat datang, {currentUser?.username}</p>
            </div>
          </div>
          <Button data-testid="admin-logout-button" onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <Button
            data-testid="users-tab-button"
            onClick={() => setActiveTab('users')}
            variant={activeTab === 'users' ? 'default' : 'outline'}
          >
            <Users className="w-4 h-4 mr-2" />
            Users ({regularUsers.length})
          </Button>
          <Button
            data-testid="admins-tab-button"
            onClick={() => setActiveTab('admins')}
            variant={activeTab === 'admins' ? 'default' : 'outline'}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admins ({admins.length})
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activeTab === 'users' ? 'Daftar Users' : 'Daftar Admins'}</CardTitle>
                <CardDescription>Kelola pengguna platform</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-user-button" onClick={openCreateDialog}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
                      <DialogDescription>Isi data user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Username</Label>
                        <Input
                          data-testid="user-form-username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          data-testid="user-form-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                          <SelectTrigger data-testid="user-form-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" data-testid="user-form-submit">{editingUser ? 'Update' : 'Buat'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === 'users' ? regularUsers : admins).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? 'destructive' : 'success'}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`edit-user-${user.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          data-testid={`block-user-${user.id}`}
                          size="sm"
                          variant={user.isBlocked ? 'default' : 'destructive'}
                          onClick={() => handleToggleBlock(user.id)}
                        >
                          {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                        {user.id !== currentUser.id && (
                          <Button
                            data-testid={`delete-user-${user.id}`}
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};