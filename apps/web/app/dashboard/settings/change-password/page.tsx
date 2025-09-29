'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { Lock as LockIcon, Security as SecurityIcon } from '@mui/icons-material';
import { authClient } from '../../../../features/auth/auth.service';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setSnackbar({
        open: true,
        message: 'Mevcut şifre gereklidir',
        severity: 'error',
      });
      return false;
    }

    if (!formData.newPassword) {
      setSnackbar({
        open: true,
        message: 'Yeni şifre gereklidir',
        severity: 'error',
      });
      return false;
    }

    if (formData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Yeni şifre en az 8 karakter olmalıdır',
        severity: 'error',
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Yeni şifreler eşleşmiyor',
        severity: 'error',
      });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setSnackbar({
        open: true,
        message: 'Yeni şifre mevcut şifre ile aynı olamaz',
        severity: 'error',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authClient.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSnackbar({
        open: true,
        message: 'Şifre başarıyla değiştirildi',
        severity: 'success',
      });
      
      // Formu temizle
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Şifre değiştirilirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Şifre Değiştir
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz.
        </Typography>
      </Box>

      <Card>
        <CardHeader
          avatar={<SecurityIcon color="primary" />}
          title="Güvenlik Ayarları"
          subheader="Şifrenizi güvenli bir şekilde değiştirin"
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange('currentPassword')}
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
                  disabled={loading}
                  required
                  helperText="En az 8 karakter olmalıdır"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre (Tekrar)"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={loading}
                    onClick={() => setFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })}
                  >
                    Temizle
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                  >
                    {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
