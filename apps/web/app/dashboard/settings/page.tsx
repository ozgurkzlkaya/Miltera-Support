'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  role: string;
  avatar?: string;
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    systemUpdates: boolean;
    serviceAlerts: boolean;
    maintenanceNotifications: boolean;
  };
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAlerts: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 555 123 4567',
    address: 'İstanbul, Türkiye',
    company: 'Miltera Teknoloji',
    role: 'ADMIN'
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      systemUpdates: true,
      serviceAlerts: true,
      maintenanceNotifications: false
    }
  });

  // Security state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true
  });

  // Form states
  const [profileForm, setProfileForm] = useState(profile);
  const [preferencesForm, setPreferencesForm] = useState(preferences);
  const [securityForm, setSecurityForm] = useState(security);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfileForm(profile);
        setPreferencesForm(preferences);
        setSecurityForm(security);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Ayarlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(profileForm);
      setSnackbar({
        open: true,
        message: 'Profil bilgileri başarıyla güncellendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Profil güncellenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreferences(preferencesForm);
      setSnackbar({
        open: true,
        message: 'Tercihler başarıyla güncellendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Tercihler güncellenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurity(securityForm);
      setSnackbar({
        open: true,
        message: 'Güvenlik ayarları başarıyla güncellendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Güvenlik ayarları güncellenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Yeni şifreler eşleşmiyor',
        severity: 'error'
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Şifre en az 8 karakter olmalıdır',
        severity: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
      setOpenPasswordDialog(false);
      setSnackbar({
        open: true,
        message: 'Şifre başarıyla değiştirildi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Şifre değiştirilirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      setPreferencesForm(preferences);
      setSecurityForm(security);
      setSnackbar({
        open: true,
        message: 'Ayarlar varsayılan değerlere sıfırlandı',
        severity: 'info'
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Ayarlar
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetSettings}
          >
            Varsayılanlara Sıfırla
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<PersonIcon />} label="Profil" />
            <Tab icon={<NotificationsIcon />} label="Tercihler" />
            <Tab icon={<SecurityIcon />} label="Güvenlik" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        fontSize: '3rem',
                        bgcolor: 'primary.main'
                      }}
                    >
                      {profileForm.firstName.charAt(0)}{profileForm.lastName.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {profileForm.firstName} {profileForm.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {profileForm.email}
                    </Typography>
                    <Chip
                      label={profileForm.role}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardHeader title="Profil Bilgileri" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Ad"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Soyad"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="E-posta"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Telefon"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Adres"
                          value={profileForm.address || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          InputProps={{
                            startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Şirket"
                          value={profileForm.company || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                          InputProps={{
                            startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Genel Tercihler" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Dil</InputLabel>
                          <Select
                            value={preferencesForm.language}
                            label="Dil"
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                          >
                            <MenuItem value="tr">Türkçe</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Zaman Dilimi</InputLabel>
                          <Select
                            value={preferencesForm.timezone}
                            label="Zaman Dilimi"
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                          >
                            <MenuItem value="Europe/Istanbul">İstanbul (GMT+3)</MenuItem>
                            <MenuItem value="Europe/London">Londra (GMT+0)</MenuItem>
                            <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Tarih Formatı</InputLabel>
                          <Select
                            value={preferencesForm.dateFormat}
                            label="Tarih Formatı"
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, dateFormat: e.target.value })}
                          >
                            <MenuItem value="DD/MM/YYYY">GG/AA/YYYY</MenuItem>
                            <MenuItem value="MM/DD/YYYY">AA/GG/YYYY</MenuItem>
                            <MenuItem value="YYYY-MM-DD">YYYY-AA-GG</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Tema</InputLabel>
                          <Select
                            value={preferencesForm.theme}
                            label="Tema"
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as any })}
                          >
                            <MenuItem value="light">Açık</MenuItem>
                            <MenuItem value="dark">Koyu</MenuItem>
                            <MenuItem value="auto">Otomatik</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Bildirim Tercihleri" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="E-posta Bildirimleri"
                          secondary="Sistem güncellemeleri ve önemli olaylar için e-posta al"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferencesForm.notifications.email}
                            onChange={(e) => setPreferencesForm({
                              ...preferencesForm,
                              notifications: {
                                ...preferencesForm.notifications,
                                email: e.target.checked
                              }
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Push Bildirimleri"
                          secondary="Tarayıcı push bildirimleri al"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferencesForm.notifications.push}
                            onChange={(e) => setPreferencesForm({
                              ...preferencesForm,
                              notifications: {
                                ...preferencesForm.notifications,
                                push: e.target.checked
                              }
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Sistem Güncellemeleri"
                          secondary="Sistem bakım ve güncelleme bildirimleri"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferencesForm.notifications.systemUpdates}
                            onChange={(e) => setPreferencesForm({
                              ...preferencesForm,
                              notifications: {
                                ...preferencesForm.notifications,
                                systemUpdates: e.target.checked
                              }
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Servis Uyarıları"
                          secondary="Kritik servis durumu bildirimleri"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferencesForm.notifications.serviceAlerts}
                            onChange={(e) => setPreferencesForm({
                              ...preferencesForm,
                              notifications: {
                                ...preferencesForm.notifications,
                                serviceAlerts: e.target.checked
                              }
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePreferences}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Güvenlik Ayarları" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securityForm.twoFactorAuth}
                              onChange={(e) => setSecurityForm({ ...securityForm, twoFactorAuth: e.target.checked })}
                            />
                          }
                          label="İki Faktörlü Kimlik Doğrulama"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Oturum Zaman Aşımı (dakika)</InputLabel>
                          <Select
                            value={securityForm.sessionTimeout}
                            label="Oturum Zaman Aşımı (dakika)"
                            onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value as number })}
                          >
                            <MenuItem value={15}>15 dakika</MenuItem>
                            <MenuItem value={30}>30 dakika</MenuItem>
                            <MenuItem value={60}>1 saat</MenuItem>
                            <MenuItem value={120}>2 saat</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Şifre Geçerlilik Süresi (gün)</InputLabel>
                          <Select
                            value={securityForm.passwordExpiry}
                            label="Şifre Geçerlilik Süresi (gün)"
                            onChange={(e) => setSecurityForm({ ...securityForm, passwordExpiry: e.target.value as number })}
                          >
                            <MenuItem value={30}>30 gün</MenuItem>
                            <MenuItem value={60}>60 gün</MenuItem>
                            <MenuItem value={90}>90 gün</MenuItem>
                            <MenuItem value={180}>180 gün</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securityForm.loginAlerts}
                              onChange={(e) => setSecurityForm({ ...securityForm, loginAlerts: e.target.checked })}
                            />
                          }
                          label="Giriş Uyarıları"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Şifre Yönetimi" />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Son şifre değişikliği: 15 gün önce
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<LockIcon />}
                        onClick={() => setOpenPasswordDialog(true)}
                      >
                        Şifre Değiştir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSecurity}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </Box>
          </TabPanel>
        </Paper>

        {/* Password Change Dialog */}
        <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Şifre Değiştir</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  type={passwordForm.showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })}
                      >
                        {passwordForm.showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  type={passwordForm.showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })}
                      >
                        {passwordForm.showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre (Tekrar)"
                  type={passwordForm.showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setPasswordForm({ ...passwordForm, showConfirm: !passwordForm.showConfirm })}
                      >
                        {passwordForm.showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleChangePassword} disabled={saving}>
              {saving ? 'Değiştiriliyor...' : 'Değiştir'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}
