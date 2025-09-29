"use client";

import { Box, Typography, Button, Card, CardContent, Grid, Chip, Avatar, IconButton, Tooltip, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { useAuth } from "../../../features/auth/useAuth";
import { Layout } from "../../../components/Layout";

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "error";
    case "TSP":
      return "warning";
    case "USER":
      return "info";
    default:
      return "default";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "TSP":
      return "Teknik Servis";
    case "USER":
      return "Kullanıcı";
    default:
      return role;
  }
};

const UsersPage = () => {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Helper functions for role display
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'TSP': return 'Teknik Servis';
      case 'USER': return 'Kullanıcı';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'TSP': return 'warning';
      case 'USER': return 'primary';
      default: return 'default';
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch('http://localhost:3015/api/v1/users', { headers });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
        } else {
          throw new Error('Kullanıcılar yüklenemedi');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Kullanıcılar yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Check if user is admin
  if (!auth?.user || auth.user.role !== "ADMIN") {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            icon={<SecurityIcon />}
            sx={{ mt: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              Erişim Reddedildi
            </Typography>
            <Typography>
              Bu sayfaya erişim için Admin yetkisine sahip olmanız gerekmektedir.
            </Typography>
          </Alert>
        </Box>
      </Layout>
    );
  }

  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
      isActive: true
    });
    setOpenAddDialog(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
      setOpenEditDialog(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`http://localhost:3015/api/v1/users/${userId}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          throw new Error('Kullanıcı silinemedi');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Kullanıcı silinirken hata oluştu');
      }
    }
  };

  const handleSubmitAdd = async () => {
    try {
      // Form validasyonu
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Ad ve soyad alanları zorunludur');
        return;
      }
      if (!formData.email.trim()) {
        setError('E-posta alanı zorunludur');
        return;
      }
      if (!formData.password.trim() || formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Kullanıcı adını birleştir
      const userData = {
        ...formData,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
      };

      const response = await fetch('http://localhost:3015/api/v1/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([newUser.data, ...users]);
        setOpenAddDialog(false);
        setError(null);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'USER',
          isActive: true
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message || 'Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingUser) return;

    try {
      // Form validasyonu
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Ad ve soyad alanları zorunludur');
        return;
      }
      if (!formData.email.trim()) {
        setError('E-posta alanı zorunludur');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Kullanıcı adını birleştir ve şifre alanını kontrol et
      const userData = {
        ...formData,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
      };

      // Şifre boşsa kaldır
      if (!userData.password.trim()) {
        delete (userData as any).password;
      }

      const response = await fetch(`http://localhost:3015/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser.data : u));
        setOpenEditDialog(false);
        setEditingUser(null);
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı güncellenemedi');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Kullanıcı güncellenirken hata oluştu');
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ borderRadius: 2 }}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Kullanıcı Ara"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Rol"
              >
                <MenuItem value="ALL">Tüm Roller</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="TSP">Teknik Servis</MenuItem>
                <MenuItem value="USER">Kullanıcı</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Durum"
              >
                <MenuItem value="ALL">Tüm Durumlar</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="INACTIVE">Pasif</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              {filteredUsers.length} kullanıcı bulundu
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Kullanıcı
                  </Typography>
                  <Typography variant="h5" component="div">
                    {users.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aktif Kullanıcı
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Admin
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main">
                    {users.filter(u => u.role === "ADMIN").length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Teknik Servis
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main">
                    {users.filter(u => u.role === "TSP").length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users List */}
      {!isLoading && (
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Kullanıcı Listesi
          </Typography>
          
          {filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Kullanıcı bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' 
                  ? 'Arama kriterlerinize uygun kullanıcı bulunamadı. Filtreleri temizleyip tekrar deneyin.'
                  : 'Henüz hiç kullanıcı eklenmemiş. Yeni kullanıcı eklemek için yukarıdaki butonu kullanın.'
                }
              </Typography>
            </Box>
          ) : (
            filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  boxShadow: 2,
                  borderColor: "primary.main"
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {(() => {
                        const displayName = user.name && user.name !== 'undefined undefined' ? user.name : 
                                          user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` :
                                          user.firstName ? user.firstName :
                                          user.lastName ? user.lastName :
                                          'İsimsiz Kullanıcı';
                        return displayName.charAt(0).toUpperCase();
                      })()}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" component="div">
                        {user.name && user.name !== 'undefined undefined' ? user.name : 
                         user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` :
                         user.firstName ? user.firstName :
                         user.lastName ? user.lastName :
                         'İsimsiz Kullanıcı'}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <SecurityIcon sx={{ fontSize: 16, color: user.emailVerified ? "success.main" : "warning.main" }} />
                        <Typography variant="body2" color={user.emailVerified ? "success.main" : "warning.main"}>
                          {user.emailVerified ? "E-posta doğrulandı" : "E-posta doğrulanmadı"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip 
                      label={getRoleLabel(user.role)} 
                      color={getRoleColor(user.role) as any}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                    
                    <Chip 
                      label={user.isActive ? "Aktif" : "Pasif"} 
                      color={user.isActive ? "success" : "default"}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                    
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditUser(user.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            ))
          )}
        </CardContent>
      </Card>
      )}

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Ad"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Soyad"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              fullWidth
            />
            <TextField
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
            />
            <TextField
              label="Şifre (boş bırakılırsa değiştirilmez)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              fullWidth
              helperText="Şifre değiştirmek istemiyorsanız boş bırakın"
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                label="Rol"
              >
                <MenuItem value="USER">Kullanıcı</MenuItem>
                <MenuItem value="TSP">Teknik Servis</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>İptal</Button>
          <Button onClick={handleSubmitAdd} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Ad"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Soyad"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              fullWidth
            />
            <TextField
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
            />
            <TextField
              label="Şifre (boş bırakılırsa değiştirilmez)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              fullWidth
              helperText="Şifre değiştirmek istemiyorsanız boş bırakın"
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                label="Rol"
              >
                <MenuItem value="USER">Kullanıcı</MenuItem>
                <MenuItem value="TSP">Teknik Servis</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
          <Button onClick={handleSubmitEdit} variant="contained">Güncelle</Button>
        </DialogActions>
      </Dialog>

      </Box>
    </Layout>
  );
};

export default UsersPage;
