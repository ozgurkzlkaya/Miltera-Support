/**
 * Miltera Fixlog Frontend - Admin Dashboard
 * 
 * Bu dosya, yönetici (ADMIN) rolündeki kullanıcılar için özel dashboard sayfasıdır.
 * Sistem yönetimi, kullanıcı yönetimi ve kapsamlı raporlama özelliklerini içerir.
 * 
 * Özellikler:
 * - Sistem yönetimi ve ayarları
 * - Kullanıcı yönetimi (CRUD)
 * - Kapsamlı raporlama ve analytics
 * - Audit logs ve sistem durumu
 * - Performance monitoring
 * - Backup ve güvenlik yönetimi
 * 
 * URL: /dashboard/admin
 * Authentication: Gerekli (ADMIN rolü)
 */

"use client";

import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import CardActionArea from "@mui/material/CardActionArea";
import Link from "next/link";

import { 
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  GetApp as GetAppIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import { useAuth } from "../../../features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    totalShipments: 0,
    totalServiceOperations: 0,
    activeUsers: 0,
    openIssues: 0,
    pendingShipments: 0,
    completedOperations: 0
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Auth token
  const token = useMemo(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || '', []);
  const authHeaders = useMemo(() => {
    const h: any = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [usersRes, issuesRes, shipmentsRes, serviceOpsRes] = await Promise.all([
        fetch('http://localhost:3015/api/v1/users', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/issues', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/shipments', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/service-operations', { headers: authHeaders })
      ]);

      const [usersData, issuesData, shipmentsData, serviceOpsData] = await Promise.all([
        usersRes.ok ? usersRes.json() : { data: [] },
        issuesRes.ok ? issuesRes.json() : { data: [] },
        shipmentsRes.ok ? shipmentsRes.json() : { data: [] },
        serviceOpsRes.ok ? serviceOpsRes.json() : { data: [] }
      ]);

      const users = usersData.data?.items || usersData.data || [];
      const issues = issuesData.data?.items || issuesData.data || [];
      const shipments = shipmentsData.data?.items || shipmentsData.data || [];
      const serviceOps = serviceOpsData.data?.items || serviceOpsData.data || [];

      setStats({
        totalUsers: users.length,
        totalIssues: issues.length,
        totalShipments: shipments.length,
        totalServiceOperations: serviceOps.length,
        activeUsers: users.filter((u: any) => u.isActive).length,
        openIssues: issues.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length,
        pendingShipments: shipments.filter((s: any) => s.status === 'PREPARING' || s.status === 'SHIPPED').length,
        completedOperations: serviceOps.filter((op: any) => op.status === 'COMPLETED').length
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Authentication kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Fetch dashboard data
    fetchDashboardStats();
  }, [isAuthenticated, user, router, token]);

  // Export dashboard data
  const handleExportDashboard = async () => {
    try {
      // Fetch all data for export
      const [usersRes, issuesRes, shipmentsRes, serviceOpsRes] = await Promise.all([
        fetch('http://localhost:3015/api/v1/users', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/issues', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/shipments', { headers: authHeaders }),
        fetch('http://localhost:3015/api/v1/service-operations', { headers: authHeaders })
      ]);

      const [usersData, issuesData, shipmentsData, serviceOpsData] = await Promise.all([
        usersRes.ok ? usersRes.json() : { data: [] },
        issuesRes.ok ? issuesRes.json() : { data: [] },
        shipmentsRes.ok ? shipmentsRes.json() : { data: [] },
        serviceOpsRes.ok ? serviceOpsRes.json() : { data: [] }
      ]);

      const users = usersData.data?.items || usersData.data || [];
      const issues = issuesData.data?.items || issuesData.data || [];
      const shipments = shipmentsData.data?.items || shipmentsData.data || [];
      const serviceOps = serviceOpsData.data?.items || serviceOpsData.data || [];

      // Create comprehensive CSV
      const csvData = [
        ['=== MİLTERA DASHBOARD RAPORU ==='],
        [''],
        ['=== KULLANICILAR ==='],
        ['ID', 'Ad', 'Soyad', 'E-posta', 'Rol', 'Aktif', 'Oluşturulma Tarihi'],
        ...users.map((u: any) => [
          u.id,
          u.firstName || '',
          u.lastName || '',
          u.email || '',
          u.role || '',
          u.isActive ? 'Evet' : 'Hayır',
          new Date(u.createdAt).toLocaleDateString('tr-TR')
        ]),
        [''],
        ['=== ARIZALAR ==='],
        ['ID', 'Arıza No', 'Durum', 'Öncelik', 'Kaynak', 'Garanti', 'Arıza Tarihi'],
        ...issues.map((i: any) => [
          i.id,
          i.issueNumber || '',
          i.status || '',
          i.priority || '',
          i.source || '',
          i.isUnderWarranty ? 'Evet' : 'Hayır',
          new Date(i.issueDate).toLocaleDateString('tr-TR')
        ]),
        [''],
        ['=== SEVKİYATLAR ==='],
        ['ID', 'Sevkiyat No', 'Tür', 'Durum', 'Takip No', 'Oluşturulma Tarihi'],
        ...shipments.map((s: any) => [
          s.id,
          s.shipmentNumber || '',
          s.type || '',
          s.status || '',
          s.trackingNumber || '',
          new Date(s.createdAt).toLocaleDateString('tr-TR')
        ]),
        [''],
        ['=== SERVİS OPERASYONLARI ==='],
        ['ID', 'Operasyon Türü', 'Durum', 'Süre (dk)', 'Maliyet', 'Oluşturulma Tarihi'],
        ...serviceOps.map((op: any) => [
          op.id,
          op.operationType || '',
          op.status || '',
          op.duration || '',
          op.cost || '',
          new Date(op.createdAt).toLocaleDateString('tr-TR')
        ])
      ];

      // CSV string oluştur
      const csvString = csvData.map(row => row.join(',')).join('\n');
      
      // BOM ekle (Türkçe karakterler için)
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvString;

      // Blob oluştur ve indir
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `miltera-dashboard-raporu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: 'Dashboard raporu başarıyla dışa aktarıldı',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Dışa aktarma sırasında hata oluştu',
        severity: 'error'
      });
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Yetkiniz bulunmamaktadır.</Typography>
      </Box>
    );
  }

  const adminFeatures = [
    {
      title: "Kullanıcı Yönetimi",
      description: "Sistem kullanıcılarını yönetin, roller atayın ve yetkilendirin",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      path: "/dashboard/users",
      stats: `${stats.activeUsers}/${stats.totalUsers} Aktif Kullanıcı`
    },
    {
      title: "Arıza Yönetimi",
      description: "Sistem arızalarını yönetin ve takip edin",
      icon: <ReportIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      path: "/dashboard/issues",
      stats: `${stats.openIssues}/${stats.totalIssues} Açık Arıza`
    },
    {
      title: "Sevkiyat Yönetimi",
      description: "Sevkiyat işlemlerini yönetin ve takip edin",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      path: "/dashboard/shipments",
      stats: `${stats.pendingShipments}/${stats.totalShipments} Bekleyen Sevkiyat`
    },
    {
      title: "Servis Operasyonları",
      description: "Teknik servis operasyonlarını yönetin",
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      path: "/dashboard/service-operations",
      stats: `${stats.completedOperations}/${stats.totalServiceOperations} Tamamlanan`
    },
    {
      title: "Performans Takibi",
      description: "Sistem performansını izleyin ve analiz edin",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      path: "/dashboard/tsp/performance",
      stats: "Teknisyen Performansı"
    },
    {
      title: "Sistem Ayarları",
      description: "Genel sistem ayarlarını yapılandırın",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      path: "/dashboard/settings",
      stats: "Sistem Konfigürasyonu"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AdminIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Yönetici Dashboard
            </Typography>
            <Chip 
              label="ADMIN" 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardStats}
              disabled={loading}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleExportDashboard}
              disabled={loading}
            >
              DIŞA AKTAR
            </Button>
          </Stack>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Sistem yönetimi, kullanıcı yönetimi ve kapsamlı raporlama araçları
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Welcome Message */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Hoş geldiniz, {user?.name || 'Yönetici'}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistem yönetimi ve raporlama işlemlerinizi buradan gerçekleştirebilirsiniz.
              </Typography>
            </Box>
            <Tooltip title="Bildirimler">
              <IconButton>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* Admin Features Grid */}
      <Grid container spacing={3}>
        {adminFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card sx={{ height: '100%', transition: 'all 0.3s ease' }}>
              <CardActionArea component={Link} href={feature.path} sx={{ p: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ color: feature.color }}>
                      {feature.icon}
                    </Box>
                    <IconButton size="small" sx={{ color: feature.color }}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Stack>
                  
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.stats}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: feature.color,
                        color: feature.color,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hızlı İşlemler
          </Typography>
          <Stack direction={isMobile ? "column" : "row"} spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<PeopleIcon />}
              onClick={() => router.push('/dashboard/users')}
            >
              Kullanıcı Ekle
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ReportIcon />}
              onClick={() => router.push('/dashboard/reports')}
            >
              Rapor Oluştur
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<BackupIcon />}
              onClick={() => router.push('/dashboard/backup')}
            >
              Yedek Al
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<SecurityIcon />}
              onClick={() => router.push('/dashboard/security')}
            >
              Güvenlik Ayarları
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
