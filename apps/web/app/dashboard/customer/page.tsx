/**
 * Miltera Fixlog Frontend - Customer Dashboard
 * 
 * Bu dosya, Müşteri (CUSTOMER) rolündeki kullanıcılar için özel dashboard sayfasıdır.
 * Arıza kaydı, durum takibi ve ürün geçmişi işlemlerini içerir.
 * 
 * Özellikler:
 * - Arıza kaydı oluşturma
 * - Durum takibi ve güncellemeler
 * - Ürün geçmişi görüntüleme
 * - Bildirimler ve uyarılar
 * - Destek talepleri
 * - Ürün bilgileri
 * 
 * URL: /dashboard/customer
 * Authentication: Gerekli (CUSTOMER rolü)
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";

import { 
  Person as CustomerIcon,
  BugReport as IssueIcon,
  TrackChanges as TrackIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
  Inventory as ProductIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  GetApp as GetAppIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import { useAuth } from "../../../features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerIssues, setCustomerIssues] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    closedIssues: 0,
    totalProducts: 0
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

  // Fetch customer data
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer issues
      const issuesRes = await fetch('http://localhost:3015/api/v1/issues', { headers: authHeaders });
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        const issues = issuesData.data?.items || issuesData.data || [];
        
        // Filter issues for this customer (assuming customerId is in user object)
        const customerIssues = issues.filter((issue: any) => 
          issue.customerId === user?.companyId || issue.reportedBy === user?.id
        );
        
        setCustomerIssues(customerIssues);
        
        setCustomerStats({
          totalIssues: customerIssues.length,
          openIssues: customerIssues.filter((i: any) => i.status === 'OPEN').length,
          inProgressIssues: customerIssues.filter((i: any) => i.status === 'IN_PROGRESS').length,
          closedIssues: customerIssues.filter((i: any) => i.status === 'CLOSED').length,
          totalProducts: 5 // Mock data for now
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError('Müşteri verileri yüklenemedi');
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
    
    if (user?.role !== 'CUSTOMER') {
      router.push('/dashboard');
      return;
    }

    // Fetch customer data
    fetchCustomerData();
  }, [isAuthenticated, user, router, token]);

  // Export customer data
  const handleExportCustomerData = () => {
    try {
      // Create CSV with customer issues
      const csvData = [
        ['=== MÜŞTERİ DASHBOARD RAPORU ==='],
        [''],
        ['=== ARIZALAR ==='],
        ['Arıza No', 'Durum', 'Öncelik', 'Kaynak', 'Garanti', 'Arıza Tarihi', 'Açıklama'],
        ...customerIssues.map((issue: any) => [
          issue.issueNumber || '',
          issue.status || '',
          issue.priority || '',
          issue.source || '',
          issue.isUnderWarranty ? 'Evet' : 'Hayır',
          new Date(issue.issueDate).toLocaleDateString('tr-TR'),
          issue.customerDescription || ''
        ]),
        [''],
        ['=== İSTATİSTİKLER ==='],
        ['Toplam Arıza', 'Açık Arıza', 'İşlemde', 'Kapalı', 'Toplam Ürün'],
        [
          customerStats.totalIssues.toString(),
          customerStats.openIssues.toString(),
          customerStats.inProgressIssues.toString(),
          customerStats.closedIssues.toString(),
          customerStats.totalProducts.toString()
        ]
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
      link.setAttribute('download', `musteri-raporu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: 'Müşteri raporu başarıyla dışa aktarıldı',
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

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Yetkiniz bulunmamaktadır.</Typography>
      </Box>
    );
  }

  const customerFeatures = [
    {
      title: "Arıza Kaydı",
      description: "Yeni arıza kaydı oluşturun ve destek talebi gönderin",
      icon: <IssueIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      path: "/dashboard/issues",
      stats: `${customerStats.totalIssues} Toplam Arıza`
    },
    {
      title: "Durum Takibi",
      description: "Açık arızalarınızın durumunu takip edin",
      icon: <TrackIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      path: "/dashboard/issues",
      stats: `${customerStats.openIssues + customerStats.inProgressIssues} Aktif Arıza`
    },
    {
      title: "Ürün Geçmişi",
      description: "Sahip olduğunuz ürünlerin geçmişini görüntüleyin",
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      path: "/dashboard/products",
      stats: `${customerStats.totalProducts} Ürün Kayıtlı`
    },
    {
      title: "Destek Talepleri",
      description: "Teknik destek taleplerinizi yönetin",
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      path: "/dashboard/issues",
      stats: `${customerStats.openIssues} Açık Talep`
    }
  ];

  // Use real customer issues data
  const recentIssues = customerIssues.slice(0, 5).map((issue: any) => ({
    id: issue.issueNumber || issue.id,
    title: issue.title || `Arıza ${issue.issueNumber}`,
    status: issue.status,
    date: new Date(issue.issueDate).toLocaleDateString('tr-TR'),
    priority: issue.priority
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return theme.palette.warning.main;
      case 'IN_PROGRESS': return theme.palette.info.main;
      case 'CLOSED': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'IN_PROGRESS': return 'İşlemde';
      case 'CLOSED': return 'Kapalı';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return theme.palette.error.main;
      case 'MEDIUM': return theme.palette.warning.main;
      case 'LOW': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomerIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Müşteri Dashboard
            </Typography>
            <Chip 
              label="MÜŞTERİ" 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCustomerData}
              disabled={loading}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleExportCustomerData}
              disabled={loading}
            >
              DIŞA AKTAR
            </Button>
          </Stack>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Arıza kaydı, durum takibi ve ürün geçmişi yönetimi
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
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.info.main}15)` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Hoş geldiniz, {user?.name || 'Müşteri'}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Arızalarınızı takip edin ve yeni destek talepleri oluşturun.
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

      {/* Customer Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {customerFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                },
                cursor: 'pointer'
              }}
              onClick={() => router.push(feature.path)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Stack spacing={2} alignItems="center">
                  <Box sx={{ color: feature.color }}>
                    {feature.icon}
                  </Box>
                  
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
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Issues */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Son Arızalar
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => router.push('/dashboard/customer/track-issues')}
                >
                  Tümünü Gör
                </Button>
              </Stack>
              
              <List>
                {recentIssues.map((issue, index) => (
                  <Box key={issue.id}>
                    <ListItem 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: theme.palette.action.hover }
                      }}
                      onClick={() => router.push(`/dashboard/customer/issues/${issue.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(issue.status) }}>
                          {issue.status === 'CLOSED' ? <CheckCircleIcon /> : 
                           issue.status === 'IN_PROGRESS' ? <ScheduleIcon /> : 
                           <WarningIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {issue.title}
                            </Typography>
                            <Chip 
                              label={getStatusText(issue.status)}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(issue.status),
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                            <Chip 
                              label={issue.priority}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: getPriorityColor(issue.priority),
                                color: getPriorityColor(issue.priority),
                                fontSize: '0.7rem'
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                              Arıza No: {issue.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tarih: {issue.date}
                            </Typography>
                          </Stack>
                        }
                      />
                      <IconButton size="small">
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItem>
                    {index < recentIssues.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Info */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hızlı İşlemler
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<IssueIcon />}
                    onClick={() => router.push('/dashboard/customer/create-issue')}
                  >
                    Yeni Arıza Kaydı
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<TrackIcon />}
                    onClick={() => router.push('/dashboard/customer/track-issues')}
                  >
                    Durum Takibi
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<SupportIcon />}
                    onClick={() => router.push('/dashboard/customer/support')}
                  >
                    Destek Talebi
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hesap Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      E-posta
                    </Typography>
                    <Typography variant="body1">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Arıza
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {customerStats.totalIssues}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Aktif Arıza
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {customerStats.openIssues + customerStats.inProgressIssues}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card sx={{ bgcolor: theme.palette.info.main + '10' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <InfoIcon color="info" />
                  <Typography variant="h6">
                    Destek İletişim
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📞 +90 212 555 0123
                  </Typography>
                  <Typography variant="body2">
                    📧 support@miltera.com.tr
                  </Typography>
                  <Typography variant="body2">
                    🕒 09:00 - 18:00 (Pazartesi-Cuma)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

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
