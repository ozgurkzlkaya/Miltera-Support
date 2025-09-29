'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../features/auth/useAuth';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface UserProfileProps {
  userId?: string; // If provided, edit another user (admin only)
  onSave?: (data: UserProfileData) => void;
  readOnly?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onSave,
  readOnly = false,
}) => {
  const auth = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    isActive: true,
    emailVerified: false,
    createdAt: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const targetUserId = userId || auth?.user?.id;
        if (!targetUserId) return;

        const response = await fetch(`http://localhost:3015/api/v1/users/${targetUserId}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.data);
        } else {
          throw new Error('Profil yüklenemedi');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Profil yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, auth?.user?.id]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const targetUserId = userId || auth?.user?.id;
      if (!targetUserId) return;

      const response = await fetch(`http://localhost:3015/api/v1/users/${targetUserId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setEditing(false);
        setSuccess('Profil başarıyla güncellendi');
        if (onSave) {
          onSave(profileData);
        }
      } else {
        throw new Error('Profil güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch('http://localhost:3015/api/v1/auth/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      });

      if (response.ok) {
        setOpenPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('Şifre başarıyla değiştirildi');
      } else {
        throw new Error('Şifre değiştirilemedi');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Şifre değiştirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
      case 'USER': return 'info';
      default: return 'default';
    }
  };

  const isAdmin = auth?.user?.role === 'ADMIN';
  const canEdit = !readOnly && (isAdmin || !userId);

  return (
    <Box>
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {profileData.firstName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h1">
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={getRoleLabel(profileData.role)}
                    color={getRoleColor(profileData.role) as any}
                    size="small"
                  />
                  <Chip
                    label={profileData.isActive ? 'Aktif' : 'Pasif'}
                    color={profileData.isActive ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            
            {canEdit && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {editing ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => setEditing(false)}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      İptal
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Düzenle
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Profile Form */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ad"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                disabled={!editing}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Soyad"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                disabled={!editing}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!editing}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta Durumu"
                value={profileData.emailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
                disabled
                InputProps={{
                  startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {isAdmin && userId && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    label="Rol"
                  >
                    <MenuItem value="USER">Kullanıcı</MenuItem>
                    <MenuItem value="TSP">Teknik Servis</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kayıt Tarihi"
                value={new Date(profileData.createdAt).toLocaleDateString('tr-TR')}
                disabled
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
          </Grid>

          {/* Password Section */}
          {!userId && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Şifre Yönetimi
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Şifre Değiştir
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <TextField
              fullWidth
              label="Yeni Şifre"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <TextField
              fullWidth
              label="Yeni Şifre (Tekrar)"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading}
          >
            Şifre Değiştir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messages */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default UserProfile;
