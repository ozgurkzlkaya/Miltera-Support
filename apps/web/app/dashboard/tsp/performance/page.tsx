'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Layout } from '../../../../components/Layout';
import { useAuth } from '../../../../features/auth/useAuth';

interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  totalOperations: number;
  completedOperations: number;
  averageDuration: number;
  totalCost: number;
  successRate: number;
  monthlyTrend: Array<{
    month: string;
    operations: number;
    completed: number;
  }>;
}

interface PerformanceStats {
  totalTechnicians: number;
  averagePerformance: number;
  topPerformer: string;
  totalOperations: number;
  completedOperations: number;
  averageResolutionTime: number;
}

const PerformancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<TechnicianPerformance[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [filters, setFilters] = useState({
    dateRange: '30',
    sortBy: 'successRate',
    search: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const token = useMemo(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || '', []);

  const authHeaders = useMemo(() => {
    const h: any = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    fetchPerformanceData();
  }, [filters.dateRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from service operations API first
      try {
        const response = await fetch(`http://localhost:3015/api/v1/service-operations?limit=200`, {
          headers: authHeaders,
        });

        if (response.ok) {
          const data = await response.json();
          const operations = data.data?.items || data.data || [];
          
          
          // Process operations to get technician performance
          const technicianMap = new Map();
          
          operations.forEach((op: any) => {
            if (op.technicianId) {
              // Teknisyen adını performedByUser'dan al
              const technicianName = op.performedByUser?.firstName && op.performedByUser?.lastName 
                ? `${op.performedByUser.firstName} ${op.performedByUser.lastName}`
                : `Teknisyen ${op.technicianId.slice(0, 8)}`;

              if (!technicianMap.has(op.technicianId)) {
                technicianMap.set(op.technicianId, {
                  technicianId: op.technicianId,
                  technicianName: technicianName,
                  totalOperations: 0,
                  completedOperations: 0,
                  totalCost: 0,
                  totalDuration: 0,
                  monthlyTrend: []
                });
              }
              
              const tech = technicianMap.get(op.technicianId);
              tech.totalOperations++;
              if (op.status === 'COMPLETED') {
                tech.completedOperations++;
              }
              tech.totalCost += parseFloat(op.cost) || 0;
              tech.totalDuration += op.duration || 0;
            }
          });

          // Convert to performance data format
          const performanceData: TechnicianPerformance[] = Array.from(technicianMap.values()).map(tech => ({
            ...tech,
            averageDuration: tech.totalOperations > 0 ? Math.round(tech.totalDuration / tech.totalOperations) : 0,
            successRate: tech.totalOperations > 0 ? Math.round((tech.completedOperations / tech.totalOperations) * 100 * 10) / 10 : 0
          }));

          setPerformanceData(performanceData);
          
          // Calculate stats
          const totalOps = performanceData.reduce((sum, tech) => sum + tech.totalOperations, 0);
          const completedOps = performanceData.reduce((sum, tech) => sum + tech.completedOperations, 0);
          const avgDuration = performanceData.reduce((sum, tech) => sum + tech.averageDuration, 0) / (performanceData.length || 1);
          
          setStats({
            totalTechnicians: performanceData.length,
            averagePerformance: performanceData.reduce((sum, tech) => sum + tech.successRate, 0) / (performanceData.length || 1),
            topPerformer: performanceData[0]?.technicianName || 'N/A',
            totalOperations: totalOps,
            completedOperations: completedOps,
            averageResolutionTime: avgDuration,
          });
        } else {
          setError('Performans verileri yüklenemedi');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        setError('API bağlantı hatası - Lütfen API server\'ın çalıştığından emin olun');
      }

    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError('Veri yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  const getDateFrom = () => {
    const days = parseInt(filters.dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = performanceData.filter(tech =>
      tech.technicianName.toLowerCase().includes(filters.search.toLowerCase())
    );

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'successRate':
          return b.successRate - a.successRate;
        case 'totalOperations':
          return b.totalOperations - a.totalOperations;
        case 'completedOperations':
          return b.completedOperations - a.completedOperations;
        case 'averageDuration':
          return a.averageDuration - b.averageDuration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [performanceData, filters.search, filters.sortBy]);

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}s ${mins}dk`;
  };

  const handleExport = () => {
    try {
      // CSV formatında veri hazırla
      const csvData = [
        ['Teknisyen', 'Toplam Operasyon', 'Tamamlanan', 'Başarı Oranı (%)', 'Ortalama Süre (dk)', 'Toplam Maliyet (₺)'],
        ...filteredAndSortedData.map(tech => [
          tech.technicianName,
          tech.totalOperations.toString(),
          tech.completedOperations.toString(),
          tech.successRate.toString(),
          tech.averageDuration.toString(),
          tech.totalCost.toString()
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
      link.setAttribute('download', `performans-raporu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: 'Performans raporu başarıyla dışa aktarıldı',
        severity: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Dışa aktarma sırasında hata oluştu',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Performans Takibi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Teknisyen performansları ve iş yükü analizi
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchPerformanceData}
              disabled={loading}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Dışa Aktar
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalTechnicians}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Teknisyen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.averagePerformance.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Performans
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalOperations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Operasyon
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {formatDuration(stats.averageResolutionTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ort. Çözüm Süresi
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Teknisyen Ara"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tarih Aralığı</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Tarih Aralığı"
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                  <MenuItem value="7">Son 7 Gün</MenuItem>
                  <MenuItem value="30">Son 30 Gün</MenuItem>
                  <MenuItem value="90">Son 3 Ay</MenuItem>
                  <MenuItem value="365">Son 1 Yıl</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sıralama</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sıralama"
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <MenuItem value="successRate">Başarı Oranı</MenuItem>
                  <MenuItem value="totalOperations">Toplam Operasyon</MenuItem>
                  <MenuItem value="completedOperations">Tamamlanan</MenuItem>
                  <MenuItem value="averageDuration">Ortalama Süre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Filtreleri Temizle">
                  <IconButton onClick={() => setFilters({ dateRange: '30', sortBy: 'successRate', search: '' })}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Performance Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Teknisyen</TableCell>
                <TableCell align="center">Toplam Operasyon</TableCell>
                <TableCell align="center">Tamamlanan</TableCell>
                <TableCell align="center">Başarı Oranı</TableCell>
                <TableCell align="center">Ortalama Süre</TableCell>
                <TableCell align="center">Toplam Maliyet</TableCell>
                <TableCell align="center">İlerleme</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Performans verisi bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((tech) => (
                  <TableRow key={tech.technicianId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {tech.technicianName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {tech.technicianId.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" fontWeight="bold">
                        {tech.totalOperations}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body1" fontWeight="medium">
                          {tech.completedOperations}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${tech.successRate.toFixed(1)}%`}
                        color={getPerformanceColor(tech.successRate) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatDuration(tech.averageDuration)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {tech.totalCost ? `${tech.totalCost.toLocaleString('tr-TR')} ₺` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={tech.successRate}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getPerformanceColor(tech.successRate) === 'success' ? 'success.main' : 
                                              getPerformanceColor(tech.successRate) === 'warning' ? 'warning.main' : 'error.main'
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Top Performer Highlight */}
        {stats && stats.topPerformer && (
          <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    🏆 En İyi Performans
                  </Typography>
                  <Typography variant="body1">
                    {stats.topPerformer} - Bu dönemde en yüksek başarı oranına sahip teknisyen
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
};

export default PerformancePage;
