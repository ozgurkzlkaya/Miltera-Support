/**
 * Miltera Fixlog Frontend - TSP Dashboard
 * 
 * Bu dosya, Teknik Servis Personeli (TSP) rolündeki kullanıcılar için özel dashboard sayfasıdır.
 * Ürün yönetimi, fabrikasyon testi ve sevkiyat işlemlerini içerir.
 * 
 * Özellikler:
 * - Ürün ekleme ve yönetimi
 * - Fabrikasyon testi işlemleri
 * - Sevkiyat yönetimi
 * - Arıza çözümü ve servis operasyonları
 * - Ürün durumu takibi
 * - Test sonuçları ve raporlama
 * 
 * URL: /dashboard/tsp
 * Authentication: Gerekli (TSP rolü)
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
  LinearProgress
} from "@mui/material";

import { 
  Build as TSPIcon,
  Add as AddIcon,
  Science as TestIcon,
  LocalShipping as ShippingIcon,
  BugReport as IssueIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";

import { useAuth } from "../../../features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TSPDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Authentication kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    if (user?.role !== 'TSP') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'TSP') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Yetkiniz bulunmamaktadır.</Typography>
      </Box>
    );
  }

  const tspFeatures = [
    {
      title: "Ürün Ekleme",
      description: "Yeni ürünleri sisteme ekleyin ve üretim sürecini başlatın",
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      path: "/dashboard/products",
      stats: "15 Bekleyen Ürün",
      progress: 75
    },
    {
      title: "Fabrikasyon Testi",
      description: "Ürün kalite testlerini gerçekleştirin ve sonuçları kaydedin",
      icon: <TestIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      path: "/dashboard/testing",
      stats: "8 Test Bekliyor",
      progress: 60
    },
    {
      title: "Sevkiyat Yönetimi",
      description: "Ürün sevkiyatlarını planlayın ve takip edin",
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      path: "/dashboard/shipments",
      stats: "12 Hazır Sevkiyat",
      progress: 90
    },
    {
      title: "Arıza Çözümü",
      description: "Müşteri arızalarını çözün ve servis operasyonlarını yönetin",
      icon: <IssueIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      path: "/dashboard/issues",
      stats: "5 Aktif Arıza",
      progress: 40
    },
    {
      title: "Servis Operasyonları",
      description: "Teknik servis operasyonlarını planlayın ve yürütün",
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      path: "/dashboard/service-operations",
      stats: "3 Devam Eden Operasyon",
      progress: 65
    },
    {
      title: "Performans Takibi",
      description: "Kişisel performansınızı ve iş yükünüzü takip edin",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      path: "/dashboard/tsp/performance",
      stats: "Bu Ay: 45 Tamamlanan",
      progress: 85
    }
  ];

  const quickStats = [
    { label: "Bugünkü Görevler", value: "12", color: theme.palette.primary.main },
    { label: "Tamamlanan", value: "8", color: theme.palette.success.main },
    { label: "Bekleyen", value: "4", color: theme.palette.warning.main },
    { label: "Geciken", value: "1", color: theme.palette.error.main }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <TSPIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            TSP Dashboard
          </Typography>
          <Chip 
            label="TEKNİK SERVİS PERSONELİ" 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Ürün yönetimi, fabrikasyon testi ve sevkiyat işlemleri
        </Typography>
      </Box>

      {/* Welcome Message */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.success.main}15)` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Hoş geldiniz, {user?.name || 'TSP'}! 🔧
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bugünkü görevlerinizi ve iş yükünüzü buradan takip edebilirsiniz.
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

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TSP Features Grid */}
      <Grid container spacing={3}>
        {tspFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
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
              <CardContent sx={{ p: 3 }}>
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
                    
                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          İlerleme
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {feature.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={feature.progress}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: `${feature.color}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: feature.color
                          }
                        }}
                      />
                    </Box>
                    
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

      {/* Quick Actions */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hızlı İşlemler
          </Typography>
          <Stack direction={isMobile ? "column" : "row"} spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/products')}
            >
              Yeni Ürün Ekle
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<TestIcon />}
              onClick={() => router.push('/dashboard/testing')}
            >
              Test Başlat
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ShippingIcon />}
              onClick={() => router.push('/dashboard/shipments')}
            >
              Sevkiyat Planla
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<IssueIcon />}
              onClick={() => router.push('/dashboard/issues')}
            >
              Arıza Çöz
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              Bugünkü Program
            </Typography>
          </Stack>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  EA-1000 Seri Testleri
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  09:00 - 11:00
                </Typography>
              </Box>
              <Chip label="Devam Ediyor" color="primary" size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Müşteri Arıza Çözümü
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  14:00 - 16:00
                </Typography>
              </Box>
              <Chip label="Bekliyor" color="warning" size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Sevkiyat Hazırlığı
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  16:30 - 17:30
                </Typography>
              </Box>
              <Chip label="Planlandı" color="info" size="small" />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
