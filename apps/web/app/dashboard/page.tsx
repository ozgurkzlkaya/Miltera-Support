"use client";

import { 
  Typography, 
  Box, 
  CircularProgress, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Alert,
  Snackbar
} from "@mui/material";
import { 
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
  LocalShipping as ShippingIcon,
  Assessment as ReportIcon,
  Business as CompanyIcon,
  Group as UserIcon
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";

const DashboardPage = () => {
  const auth = useAuth();
  const router = useRouter();

  // Token kontrolü - localStorage'dan kontrol et (client-side'da)
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userStr, setUserStr] = useState<string | null>(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  
  // Stats state
  const [stats, setStats] = useState({
    activeProjects: 12,
    technicalTeam: 8,
    pendingOperations: 3,
    successRate: 95
  });

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    setToken(storedToken);
    setUserStr(storedUser);
  }, []);

  // Client-side render olana kadar bekle
  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // User'ı parse et - hata durumunda varsayılan user kullan
  let user;
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    } else {
      // Varsayılan user
      user = { name: 'Test User', email: 'testuser6@gmail.com', role: 'USER' };
    }
  } catch (error) {
    // Varsayılan user
    user = { name: 'Test User', email: 'testuser6@gmail.com', role: 'USER' };
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

  // Handler functions
  const handleRefresh = () => {
    setSnackbar({
      open: true,
      message: 'Dashboard verileri yenilendi',
      severity: 'success'
    });
    // Simulate data refresh
    setStats(prev => ({
      ...prev,
      activeProjects: Math.floor(Math.random() * 20) + 5,
      technicalTeam: Math.floor(Math.random() * 15) + 3,
      pendingOperations: Math.floor(Math.random() * 10),
      successRate: Math.floor(Math.random() * 20) + 80
    }));
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'newProject':
        router.push('/dashboard/products');
        break;
      case 'newIssue':
        router.push('/dashboard/issues');
        break;
      case 'newOperation':
        router.push('/dashboard/service-operations');
        break;
      case 'viewReports':
        router.push('/dashboard/reports');
        break;
      default:
        setSnackbar({
          open: true,
          message: 'Aksiyon bulunamadı',
          severity: 'error'
        });
    }
  };

  // Customer rolü kontrolü
  if (user.role === "CUSTOMER") {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          {/* Welcome Header */}
          <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem', fontWeight: 600 }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      Hoş Geldiniz, {user.name}!
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      Customer Portal
                    </Typography>
                  </Box>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          {/* User Info Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <EmailIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        E-posta Adresi
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SecurityIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Kullanıcı Rolü
                      </Typography>
                      <Chip 
                        label={getRoleLabel(user.role)} 
                        color={getRoleColor(user.role) as any}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, height: '100%', background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Sistem Durumu
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Aktif ve Çalışıyor
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    );
  }

  // Normal dashboard - modern tasarım
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Welcome Header */}
        <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem', fontWeight: 600 }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                    Hoş Geldiniz, {user.name}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    FixLog Teknik Servis Yönetim Sistemi
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Bildirimler (3)">
                  <IconButton 
                    sx={{ color: 'white' }}
                    onClick={() => handleNavigate('/dashboard/notifications')}
                  >
                    <NotificationsIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Ayarlar">
                  <IconButton 
                    sx={{ color: 'white' }}
                    onClick={() => handleNavigate('/dashboard/settings')}
                  >
                    <SettingsIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Yenile">
                  <IconButton 
                    sx={{ color: 'white' }}
                    onClick={handleRefresh}
                  >
                    <RefreshIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Info Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <EmailIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      E-posta Adresi
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <SecurityIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Kullanıcı Rolü
                    </Typography>
                    <Chip 
                      label={getRoleLabel(user.role)} 
                      color={getRoleColor(user.role) as any}
                      sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Sistem Durumu
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Dashboard Başarıyla Yüklendi!
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Hızlı İşlemler
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleQuickAction('newProject')}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Yeni Proje
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BugReportIcon />}
                  onClick={() => handleQuickAction('newIssue')}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Yeni Arıza
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BuildIcon />}
                  onClick={() => handleQuickAction('newOperation')}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Yeni Operasyon
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  onClick={() => handleQuickAction('viewReports')}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Raporları Görüntüle
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Modüller
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/products')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Ürünler
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/warehouse')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Depo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/service-operations')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <BuildIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Servis Operasyonları
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/issues')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <BugReportIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Arızalar
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/shipments')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <ShippingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Sevkiyat
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleNavigate('/dashboard/reports')}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <ReportIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Raporlar
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                textAlign: 'center', 
                p: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigate('/dashboard/products')}
            >
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.activeProjects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Aktif Projeler
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                textAlign: 'center', 
                p: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigate('/dashboard/users')}
            >
              <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.technicalTeam}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Teknik Ekip
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                textAlign: 'center', 
                p: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigate('/dashboard/service-operations')}
            >
              <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.pendingOperations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bekleyen İşlemler
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                textAlign: 'center', 
                p: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigate('/dashboard/reports')}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.successRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Başarı Oranı
        </Typography>
            </Card>
          </Grid>
        </Grid>

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
};

export default DashboardPage;