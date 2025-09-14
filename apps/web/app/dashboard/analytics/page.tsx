'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalIssues: number;
    totalOperations: number;
    totalShipments: number;
    activeUsers: number;
    systemHealth: number;
  };
  trends: {
    productTrend: Array<{ date: string; count: number }>;
    issueTrend: Array<{ date: string; count: number }>;
    operationTrend: Array<{ date: string; count: number }>;
  };
  performance: {
    avgResolutionTime: number;
    customerSatisfaction: number;
    systemUptime: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    role: string;
    performance: number;
    avatar?: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Mock data - gerçek API'den gelecek
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData: AnalyticsData = {
          overview: {
            totalProducts: 1247,
            totalIssues: 89,
            totalOperations: 156,
            totalShipments: 234,
            activeUsers: 45,
            systemHealth: 98.5
          },
          trends: {
            productTrend: [
              { date: '2025-01-01', count: 120 },
              { date: '2025-01-02', count: 135 },
              { date: '2025-01-03', count: 142 },
              { date: '2025-01-04', count: 128 },
              { date: '2025-01-05', count: 156 },
              { date: '2025-01-06', count: 148 },
              { date: '2025-01-07', count: 167 }
            ],
            issueTrend: [
              { date: '2025-01-01', count: 12 },
              { date: '2025-01-02', count: 15 },
              { date: '2025-01-03', count: 8 },
              { date: '2025-01-04', count: 18 },
              { date: '2025-01-05', count: 14 },
              { date: '2025-01-06', count: 11 },
              { date: '2025-01-07', count: 16 }
            ],
            operationTrend: [
              { date: '2025-01-01', count: 22 },
              { date: '2025-01-02', count: 28 },
              { date: '2025-01-03', count: 25 },
              { date: '2025-01-04', count: 31 },
              { date: '2025-01-05', count: 29 },
              { date: '2025-01-06', count: 27 },
              { date: '2025-01-07', count: 33 }
            ]
          },
          performance: {
            avgResolutionTime: 4.2,
            customerSatisfaction: 4.7,
            systemUptime: 99.8,
            errorRate: 0.3
          },
          alerts: [
            {
              id: '1',
              type: 'success',
              title: 'Sistem Performansı',
              message: 'Tüm sistemler normal çalışıyor',
              timestamp: '2025-01-15T10:30:00',
              priority: 'low'
            },
            {
              id: '2',
              type: 'warning',
              title: 'Yüksek İşlem Yükü',
              message: 'API yanıt süreleri artıyor',
              timestamp: '2025-01-15T09:45:00',
              priority: 'medium'
            },
            {
              id: '3',
              type: 'info',
              title: 'Bakım Bildirimi',
              message: 'Gece 02:00-04:00 arası planlı bakım',
              timestamp: '2025-01-15T08:00:00',
              priority: 'low'
            }
          ],
          topPerformers: [
            {
              id: '1',
              name: 'Ahmet Yılmaz',
              role: 'Teknik Servis Uzmanı',
              performance: 98,
              avatar: '/avatars/ahmet.jpg'
            },
            {
              id: '2',
              name: 'Fatma Demir',
              role: 'Kalite Kontrol Uzmanı',
              performance: 95,
              avatar: '/avatars/fatma.jpg'
            },
            {
              id: '3',
              name: 'Mehmet Kaya',
              role: 'Teknik Servis Uzmanı',
              performance: 92,
              avatar: '/avatars/mehmet.jpg'
            }
          ]
        };
        
        setAnalyticsData(mockData);
        setError(null);
      } catch (err) {
        setError('Analytics verileri yüklenirken hata oluştu');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

    // Auto refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalyticsData();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!analyticsData) return;
    
    try {
      if (format === 'pdf') {
        exportToPDF(analyticsData);
      } else if (format === 'excel') {
        exportToExcel(analyticsData);
      }
    } catch (error) {
      console.error(`Export error (${format}):`, error);
      // Show error notification
      setSnackbar({
        open: true,
        message: `${format.toUpperCase()} export işlemi başarısız oldu`,
        severity: 'error'
      });
    }
  };

  const exportToPDF = (data: AnalyticsData) => {
    let content = '';
    
    // PDF Header
    content += 'FIXLOG TEKNİK SERVİS PORTALI - ANALYTICS RAPORU\n';
    content += '='.repeat(50) + '\n\n';
    content += `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n`;
    content += `Zaman Aralığı: ${timeRange === '7d' ? 'Son 7 Gün' : timeRange === '30d' ? 'Son 30 Gün' : 'Son 90 Gün'}\n`;
    content += `Oluşturan: AHMET ÖZGÜR KIZILKAYA\n\n`;
    
    // Overview Section
    content += 'GENEL BAKIŞ\n';
    content += '-'.repeat(20) + '\n';
    content += `Toplam Ürün: ${data.overview.totalProducts.toLocaleString()}\n`;
    content += `Aktif Arıza: ${data.overview.totalIssues}\n`;
    content += `Operasyon: ${data.overview.totalOperations}\n`;
    content += `Sevkiyat: ${data.overview.totalShipments}\n`;
    content += `Aktif Kullanıcı: ${data.overview.activeUsers}\n`;
    content += `Sistem Sağlığı: ${data.overview.systemHealth}%\n\n`;
    
    // Performance Section
    content += 'PERFORMANS METRİKLERİ\n';
    content += '-'.repeat(25) + '\n';
    content += `Ortalama Çözüm Süresi: ${data.performance.avgResolutionTime} gün\n`;
    content += `Müşteri Memnuniyeti: ${data.performance.customerSatisfaction}/5\n`;
    content += `Sistem Uptime: ${data.performance.systemUptime}%\n`;
    content += `Hata Oranı: ${data.performance.errorRate}%\n\n`;
    
    // Trends Section
    content += 'TREND ANALİZİ\n';
    content += '-'.repeat(15) + '\n';
    content += 'Son 7 Günlük Veriler:\n';
    data.trends.productTrend.forEach(item => {
      content += `${item.date}: ${item.count} ürün\n`;
    });
    content += '\n';
    
    // Top Performers Section
    content += 'EN İYİ PERFORMANS GÖSTERENLER\n';
    content += '-'.repeat(35) + '\n';
    data.topPerformers.forEach((performer, index) => {
      content += `${index + 1}. ${performer.name} - ${performer.role}\n`;
      content += `   Performans: ${performer.performance}%\n`;
    });
    content += '\n';
    
    // System Alerts Section
    content += 'SİSTEM UYARILARI\n';
    content += '-'.repeat(20) + '\n';
    data.alerts.forEach(alert => {
      content += `• ${alert.title}: ${alert.message}\n`;
      content += `  Tarih: ${new Date(alert.timestamp).toLocaleString('tr-TR')}\n`;
      content += `  Öncelik: ${alert.priority}\n\n`;
    });
    
    // Footer
    content += '\n' + '='.repeat(50) + '\n';
    content += 'Bu rapor FixLog sistemi tarafından otomatik olarak oluşturulmuştur.\n';
    content += '© 2025 Miltera R&D - Tüm hakları saklıdır.\n';
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixlog-analytics-raporu-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Analytics raporu metin formatında indirildi. PDF yazıcısı ile yazdırabilirsiniz.',
      severity: 'success'
    });
  };

  const exportToExcel = (data: AnalyticsData) => {
    let csvContent = '';
    
    // CSV Header
    csvContent += 'FixLog Analytics Raporu\n';
    csvContent += `Rapor Tarihi,${new Date().toLocaleDateString('tr-TR')}\n`;
    csvContent += `Zaman Aralığı,${timeRange === '7d' ? 'Son 7 Gün' : timeRange === '30d' ? 'Son 30 Gün' : 'Son 90 Gün'}\n`;
    csvContent += `Oluşturan,AHMET ÖZGÜR KIZILKAYA\n\n`;
    
    // Overview Section
    csvContent += 'GENEL BAKIŞ\n';
    csvContent += 'Metrik,Değer\n';
    csvContent += `Toplam Ürün,${data.overview.totalProducts}\n`;
    csvContent += `Aktif Arıza,${data.overview.totalIssues}\n`;
    csvContent += `Operasyon,${data.overview.totalOperations}\n`;
    csvContent += `Sevkiyat,${data.overview.totalShipments}\n`;
    csvContent += `Aktif Kullanıcı,${data.overview.activeUsers}\n`;
    csvContent += `Sistem Sağlığı,${data.overview.systemHealth}%\n\n`;
    
    // Performance Section
    csvContent += 'PERFORMANS METRİKLERİ\n';
    csvContent += 'Metrik,Değer\n';
    csvContent += `Ortalama Çözüm Süresi,${data.performance.avgResolutionTime} gün\n`;
    csvContent += `Müşteri Memnuniyeti,${data.performance.customerSatisfaction}/5\n`;
    csvContent += `Sistem Uptime,${data.performance.systemUptime}%\n`;
    csvContent += `Hata Oranı,${data.performance.errorRate}%\n\n`;
    
    // Trends Section
    csvContent += 'TREND ANALİZİ - ÜRÜN TREND\n';
    csvContent += 'Tarih,Ürün Sayısı\n';
    data.trends.productTrend.forEach(item => {
      csvContent += `${item.date},${item.count}\n`;
    });
    csvContent += '\n';
    
    csvContent += 'TREND ANALİZİ - ARIZA TREND\n';
    csvContent += 'Tarih,Arıza Sayısı\n';
    data.trends.issueTrend.forEach(item => {
      csvContent += `${item.date},${item.count}\n`;
    });
    csvContent += '\n';
    
    csvContent += 'TREND ANALİZİ - OPERASYON TREND\n';
    csvContent += 'Tarih,Operasyon Sayısı\n';
    data.trends.operationTrend.forEach(item => {
      csvContent += `${item.date},${item.count}\n`;
    });
    csvContent += '\n';
    
    // Top Performers Section
    csvContent += 'EN İYİ PERFORMANS GÖSTERENLER\n';
    csvContent += 'Ad Soyad,Rol,Performans (%)\n';
    data.topPerformers.forEach(performer => {
      csvContent += `${performer.name},${performer.role},${performer.performance}\n`;
    });
    csvContent += '\n';
    
    // System Alerts Section
    csvContent += 'SİSTEM UYARILARI\n';
    csvContent += 'Başlık,Mesaj,Tarih,Öncelik,Tip\n';
    data.alerts.forEach(alert => {
      csvContent += `${alert.title},${alert.message},${new Date(alert.timestamp).toLocaleString('tr-TR')},${alert.priority},${alert.type}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixlog-analytics-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Analytics raporu Excel formatında (CSV) indirildi.',
      severity: 'success'
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analytics verileri yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Analytics verileri bulunamadı.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistem performansı ve iş analitikleri
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Otomatik Yenile"
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Zaman Aralığı"
            >
              <MenuItem value="1d">Son 1 Gün</MenuItem>
              <MenuItem value="7d">Son 7 Gün</MenuItem>
              <MenuItem value="30d">Son 30 Gün</MenuItem>
              <MenuItem value="90d">Son 90 Gün</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            PDF
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            Excel
          </Button>
          
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Auto Refresh Indicator */}
      {autoRefresh && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon />
            <Typography variant="body2">
              Otomatik yenileme aktif - 30 saniyede bir güncelleniyor
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<AssessmentIcon />} label="Genel Bakış" />
          <Tab icon={<TrendingUpIcon />} label="Trend Analizi" />
          <Tab icon={<BarChartIcon />} label="Performans" />
          <Tab icon={<NotificationsIcon />} label="Sistem Uyarıları" />
          <Tab icon={<PeopleIcon />} label="En İyi Performans" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.totalProducts.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Ürün
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BuildIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.totalIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktif Arıza
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BuildIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.totalOperations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Operasyon
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ShippingIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.totalShipments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sevkiyat
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.activeUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktif Kullanıcı
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analyticsData.overview.systemHealth}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistem Sağlığı
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health Progress */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Sistem Sağlığı" />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Genel Sistem Durumu</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {analyticsData.overview.systemHealth}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={analyticsData.overview.systemHealth} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Ürün Trend Analizi" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.productTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Arıza Trend Analizi" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.issueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Operasyon Trend Analizi" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.operationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="count" stroke="#00c49f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {analyticsData.performance.avgResolutionTime} gün
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ortalama Çözüm Süresi
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {analyticsData.performance.customerSatisfaction}/5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Müşteri Memnuniyeti
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {analyticsData.performance.systemUptime}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistem Uptime
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ErrorIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {analyticsData.performance.errorRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hata Oranı
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Card>
          <CardHeader title="Sistem Uyarıları" />
          <CardContent>
            <List>
              {analyticsData.alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {alert.title}
                          </Typography>
                          <Chip 
                            label={alert.priority} 
                            size="small" 
                            color={getPriorityColor(alert.priority) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < analyticsData.alerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardHeader title="En İyi Performans Gösterenler" />
          <CardContent>
            <Grid container spacing={2}>
              {analyticsData.topPerformers.map((performer) => (
                <Grid item xs={12} md={4} key={performer.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {performer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {performer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {performer.role}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Performans</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {performer.performance}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={performer.performance} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
  );
}
