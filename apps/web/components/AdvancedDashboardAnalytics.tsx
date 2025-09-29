'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as ProductIcon,
  BugReport as IssueIcon,
  LocalShipping as ShipmentIcon,
  Business as CompanyIcon,
  Person as UserIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiClient } from '../lib/api';

interface AdvancedAnalyticsData {
  overview: {
    totalProducts: number;
    totalIssues: number;
    totalShipments: number;
    totalCompanies: number;
    totalUsers: number;
    activeTechnicians: number;
    systemUptime: number;
  };
  trends: {
    issuesCreated: number;
    issuesResolved: number;
    productsAdded: number;
    shipmentsCreated: number;
    resolutionTime: number;
    customerSatisfaction: number;
  };
  statusDistribution: {
    products: Record<string, number>;
    issues: Record<string, number>;
    shipments: Record<string, number>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
    priority: string;
    user: string;
  }>;
  performance: {
    averageResolutionTime: number;
    customerSatisfaction: number;
    systemUptime: number;
    responseTime: number;
    technicianPerformance: Array<{
      id: string;
      name: string;
      completedTasks: number;
      averageTime: number;
      rating: number;
    }>;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  charts: {
    monthlyTrends: Array<{
      month: string;
      issues: number;
      products: number;
      shipments: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    priorityDistribution: Array<{
      priority: string;
      count: number;
      color: string;
    }>;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  subtitle?: string;
  trend?: Array<number>;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  loading = false,
  subtitle,
  trend,
}) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {title}
            </Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
              {icon}
            </Avatar>
          </Box>
          <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {changeType === 'increase' ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={changeType === 'increase' ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 'medium' }}
              >
                {Math.abs(change)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs önceki dönem
              </Typography>
            </Box>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analytics-tabpanel-${index}`}
    aria-labelledby={`analytics-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdvancedDashboardAnalytics: React.FC = () => {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalyticsData();
      }, 30000); // 30 saniyede bir güncelle
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    setError(null);

    try {
      // Gerçek API çağrıları
      const [
        dashboardStats, 
        productAnalysis, 
        issueAnalysis, 
        performanceReport,
        companiesCount,
        usersCount,
        recentActivity,
        trendsData
      ] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getProductAnalysis(),
        apiClient.getIssueAnalysis(),
        apiClient.getPerformanceReport(),
        apiClient.getCompaniesCount(),
        apiClient.getUsersCount(),
        apiClient.getRecentActivity({ limit: 15 }),
        apiClient.getTrendsData({ days: parseInt(timeRange.replace('d', '').replace('y', '365')) })
      ]);
      
      const analyticsData: AdvancedAnalyticsData = {
        overview: {
          totalProducts: dashboardStats.totalProducts,
          totalIssues: dashboardStats.activeIssues,
          totalShipments: dashboardStats.totalShipments,
          totalCompanies: companiesCount,
          totalUsers: usersCount,
          activeTechnicians: performanceReport.technicianPerformance?.length || 0,
          systemUptime: 99.8,
        },
        trends: {
          issuesCreated: trendsData.issuesCreated,
          issuesResolved: trendsData.issuesResolved,
          productsAdded: trendsData.productsAdded,
          shipmentsCreated: trendsData.shipmentsCreated,
          resolutionTime: issueAnalysis.averageResolutionTime,
          customerSatisfaction: performanceReport.teamPerformance?.customerSatisfaction || 0,
        },
        statusDistribution: {
          products: dashboardStats.productsByStatus,
          issues: dashboardStats.issuesByStatus,
          shipments: {
            'PREPARING': 20,
            'SHIPPED': 80,
            'DELIVERED': 56,
          },
        },
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp,
          status: activity.status || '',
          priority: activity.priority || '',
          user: (activity as any).user || 'Sistem'
        })),
        performance: {
          averageResolutionTime: performanceReport.teamPerformance?.averageResolutionTime || 0,
          customerSatisfaction: performanceReport.teamPerformance?.customerSatisfaction || 0,
          systemUptime: 99.8,
          responseTime: 245,
          technicianPerformance: performanceReport.technicianPerformance?.map((tech: any) => ({
            id: tech.technicianId,
            name: tech.technicianName,
            completedTasks: tech.completedOperations,
            averageTime: tech.averageResolutionTime,
            rating: tech.successRate * 5
          })) || [],
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'Yüksek Arıza Oranı',
            message: 'Son 24 saatte 5 yeni arıza kaydı oluşturuldu',
            timestamp: new Date().toISOString(),
            severity: 'medium',
          },
          {
            id: '2',
            type: 'info',
            title: 'Sistem Güncellemesi',
            message: 'Yeni özellikler eklendi: Gelişmiş raporlama ve analitik',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'low',
          },
          {
            id: '3',
            type: 'error',
            title: 'Kritik Sistem Hatası',
            message: 'Veritabanı bağlantısında sorun tespit edildi',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            severity: 'critical',
          },
        ],
        charts: {
          monthlyTrends: [
            { month: 'Ocak', issues: 45, products: 120, shipments: 80 },
            { month: 'Şubat', issues: 52, products: 135, shipments: 95 },
            { month: 'Mart', issues: 38, products: 110, shipments: 70 },
            { month: 'Nisan', issues: 61, products: 150, shipments: 105 },
            { month: 'Mayıs', issues: 47, products: 125, shipments: 85 },
            { month: 'Haziran', issues: 55, products: 140, shipments: 100 },
          ],
          categoryDistribution: [
            { category: 'Donanım', count: 45, percentage: 35 },
            { category: 'Yazılım', count: 32, percentage: 25 },
            { category: 'Ağ', count: 28, percentage: 22 },
            { category: 'Diğer', count: 23, percentage: 18 },
          ],
          priorityDistribution: [
            { priority: 'Kritik', count: 12, color: '#f44336' },
            { priority: 'Yüksek', count: 28, color: '#ff9800' },
            { priority: 'Orta', count: 45, color: '#2196f3' },
            { priority: 'Düşük', count: 23, color: '#4caf50' },
          ],
        },
      };

      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Dashboard Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistem performansı ve işletme metrikleri
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
          <FormControlLabel
            control={
              <Switch
                checked={realTimeMode}
                onChange={(e) => setRealTimeMode(e.target.checked)}
                color="secondary"
              />
            }
            label="Gerçek Zamanlı"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              label="Zaman Aralığı"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="7d">Son 7 Gün</MenuItem>
              <MenuItem value="30d">Son 30 Gün</MenuItem>
              <MenuItem value="90d">Son 90 Gün</MenuItem>
              <MenuItem value="1y">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Yenileniyor...' : 'Yenile'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            color="primary"
          >
            Rapor İndir
          </Button>
        </Box>
      </Box>

      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Toplam Ürün"
            value={data.overview.totalProducts.toLocaleString()}
            change={12}
            changeType="increase"
            icon={<ProductIcon />}
            color="#2196f3"
            subtitle="Aktif ürün sayısı"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Aktif Arızalar"
            value={data.overview.totalIssues.toLocaleString()}
            change={-8}
            changeType="decrease"
            icon={<IssueIcon />}
            color="#ff9800"
            subtitle="Çözüm bekleyen"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Kargolar"
            value={data.overview.totalShipments.toLocaleString()}
            change={15}
            changeType="increase"
            icon={<ShipmentIcon />}
            color="#4caf50"
            subtitle="Bu ay gönderilen"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Müşteri Memnuniyeti"
            value={`${data.trends.customerSatisfaction}%`}
            change={5}
            changeType="increase"
            icon={<SuccessIcon />}
            color="#9c27b0"
            subtitle="Ortalama puan"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Genel Bakış" icon={<AnalyticsIcon />} />
            <Tab label="Performans" icon={<BarChartIcon />} />
            <Tab label="Aktiviteler" icon={<TimelineIcon />} />
            <Tab label="Uyarılar" icon={<WarningIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Status Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Durum Dağılımı
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(data.statusDistribution.issues).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={status}
                          color={getStatusColor(status) as any}
                          size="small"
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(count / Math.max(...Object.values(data.statusDistribution.issues))) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Priority Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Öncelik Dağılımı
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.charts.priorityDistribution.map((item) => (
                      <Box key={item.priority} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          {item.priority}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(item.count / Math.max(...data.charts.priorityDistribution.map(p => p.count))) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Technician Performance */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teknisyen Performansı
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Teknisyen</TableCell>
                          <TableCell align="right">Tamamlanan Görev</TableCell>
                          <TableCell align="right">Ortalama Süre (saat)</TableCell>
                          <TableCell align="right">Puan</TableCell>
                          <TableCell align="right">Performans</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.performance.technicianPerformance.map((tech) => (
                          <TableRow key={tech.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {tech.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">{tech.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{tech.completedTasks}</TableCell>
                            <TableCell align="right">{tech.averageTime.toFixed(1)}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                <Typography variant="body2">{tech.rating.toFixed(1)}</Typography>
                                <Box sx={{ display: 'flex' }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Box
                                      key={i}
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: i < Math.floor(tech.rating) ? '#ffc107' : '#e0e0e0',
                                        mr: 0.5,
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <LinearProgress
                                variant="determinate"
                                value={(tech.rating / 5) * 100}
                                sx={{ width: 100, height: 8, borderRadius: 4 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Son Aktiviteler
                  </Typography>
                  <List>
                    {data.recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {activity.type === 'issue' ? <IssueIcon /> : 
                               activity.type === 'product' ? <ProductIcon /> : 
                               activity.type === 'shipment' ? <ShipmentIcon /> : <InfoIcon />}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {activity.title}
                                </Typography>
                                <Chip
                                  label={activity.status}
                                  color={getStatusColor(activity.status) as any}
                                  size="small"
                                />
                                {activity.priority && (
                                  <Chip
                                    label={activity.priority}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.user} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: tr })}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < data.recentActivity.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Alerts */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sistem Uyarıları
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.alerts.map((alert) => (
                      <Alert
                        key={alert.id}
                        severity={alert.type}
                        sx={{
                          borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                        }}
                        action={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={alert.severity.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: getSeverityColor(alert.severity),
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                            <IconButton size="small">
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="body2">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: tr })}
                        </Typography>
                      </Alert>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AdvancedDashboardAnalytics;
