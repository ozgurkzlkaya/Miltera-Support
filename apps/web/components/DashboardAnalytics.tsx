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
} from '@mui/icons-material';
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiClient } from '../lib/api';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalIssues: number;
    totalShipments: number;
    totalCompanies: number;
    totalUsers: number;
  };
  trends: {
    issuesCreated: number;
    issuesResolved: number;
    productsAdded: number;
    shipmentsCreated: number;
    resolutionTime: number;
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
  }>;
  performance: {
    averageResolutionTime: number;
    customerSatisfaction: number;
    systemUptime: number;
    responseTime: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  loading = false,
}) => (
  <Card sx={{ height: '100%', position: 'relative' }}>
    <CardContent>
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
              {icon}
            </Avatar>
          </Box>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
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
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                geçen haftaya göre
              </Typography>
            </Box>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

interface StatusProgressProps {
  title: string;
  data: Record<string, number>;
  colors: Record<string, string>;
}

const StatusProgress: React.FC<StatusProgressProps> = ({ title, data, colors }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {Object.entries(data).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <Box key={status} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {count} ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors[status] || 'primary.main',
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
    priority: string;
  }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ProductIcon />;
      case 'issue':
        return <IssueIcon />;
      case 'shipment':
        return <ShipmentIcon />;
      case 'company':
        return <CompanyIcon />;
      case 'user':
        return <UserIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
      case 'shipped':
        return 'success';
      case 'inactive':
      case 'closed':
      case 'delivered':
        return 'default';
      case 'maintenance':
      case 'in_progress':
      case 'preparing':
        return 'warning';
      case 'retired':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Son Aktiviteler
        </Typography>
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" component="span">
                        {activity.title}
                      </Typography>
                      <Chip
                        label={activity.status}
                        size="small"
                        color={getStatusColor(activity.status) as any}
                        variant="outlined"
                      />
                      {activity.priority && (
                        <Chip
                          label={activity.priority}
                          size="small"
                          color="primary"
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
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

interface PerformanceMetricsProps {
  performance: {
    averageResolutionTime: number;
    customerSatisfaction: number;
    systemUptime: number;
    responseTime: number;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ performance }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Performans Metrikleri
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary.main">
              {performance.averageResolutionTime}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ortalama Çözüm Süresi
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="success.main">
              {performance.customerSatisfaction}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Müşteri Memnuniyeti
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="info.main">
              {performance.systemUptime}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistem Çalışma Süresi
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="warning.main">
              {performance.responseTime}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yanıt Süresi
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

interface AlertsPanelProps {
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sistem Uyarıları
        </Typography>
        <List sx={{ p: 0 }}>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  {getAlertIcon(alert.type)}
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(alert.timestamp), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < alerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
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
        apiClient.getRecentActivity({ limit: 10 }),
        apiClient.getTrendsData({ days: 7 })
      ]);
      
      const analyticsData: AnalyticsData = {
        overview: {
          totalProducts: dashboardStats.totalProducts,
          totalIssues: dashboardStats.activeIssues,
          totalShipments: dashboardStats.totalShipments,
          totalCompanies: companiesCount,
          totalUsers: usersCount,
        },
        trends: {
          issuesCreated: trendsData.issuesCreated,
          issuesResolved: trendsData.issuesResolved,
          productsAdded: trendsData.productsAdded,
          shipmentsCreated: trendsData.shipmentsCreated,
          resolutionTime: issueAnalysis.averageResolutionTime,
        },
        statusDistribution: {
          products: dashboardStats.productsByStatus,
          issues: dashboardStats.issuesByStatus,
          shipments: {
            'PREPARING': 20, // TODO: Get from shipments data
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
          priority: activity.priority || ''
        })),
        performance: {
          averageResolutionTime: performanceReport.teamPerformance.averageResolutionTime,
          customerSatisfaction: performanceReport.teamPerformance.customerSatisfaction,
          systemUptime: 99.8, // TODO: Calculate from monitoring data
          responseTime: 245, // TODO: Get from performance monitoring
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'Yüksek Arıza Oranı',
            message: 'Son 24 saatte 5 yeni arıza kaydı oluşturuldu',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'info',
            title: 'Sistem Güncellemesi',
            message: 'Yeni özellikler eklendi: Gelişmiş raporlama ve analitik',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      };

      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Analitikleri
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              label="Zaman Aralığı"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Son 24 Saat</MenuItem>
              <MenuItem value="7d">Son 7 Gün</MenuItem>
              <MenuItem value="30d">Son 30 Gün</MenuItem>
              <MenuItem value="90d">Son 90 Gün</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Toplam Ürün"
            value={data.overview.totalProducts.toLocaleString()}
            change={data.trends.productsAdded}
            changeType="increase"
            icon={<ProductIcon />}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Aktif Arızalar"
            value={data.overview.totalIssues}
            change={data.trends.issuesCreated}
            changeType="increase"
            icon={<IssueIcon />}
            color="#d32f2f"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Sevkiyatlar"
            value={data.overview.totalShipments}
            change={data.trends.shipmentsCreated}
            changeType="increase"
            icon={<ShipmentIcon />}
            color="#388e3c"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Firmalar"
            value={data.overview.totalCompanies}
            icon={<CompanyIcon />}
            color="#f57c00"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Kullanıcılar"
            value={data.overview.totalUsers}
            icon={<UserIcon />}
            color="#7b1fa2"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Performance and Status Distribution */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PerformanceMetrics performance={data.performance} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusProgress
            title="Ürün Durumu Dağılımı"
            data={data.statusDistribution.products}
            colors={{
              active: '#4caf50',
              inactive: '#9e9e9e',
              maintenance: '#ff9800',
              retired: '#f44336',
            }}
          />
        </Grid>
      </Grid>

      {/* Issues and Shipments Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <StatusProgress
            title="Arıza Durumu Dağılımı"
            data={data.statusDistribution.issues}
            colors={{
              open: '#f44336',
              in_progress: '#ff9800',
              resolved: '#4caf50',
              closed: '#9e9e9e',
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusProgress
            title="Sevkiyat Durumu Dağılımı"
            data={data.statusDistribution.shipments}
            colors={{
              preparing: '#ff9800',
              shipped: '#2196f3',
              delivered: '#4caf50',
              returned: '#f44336',
            }}
          />
        </Grid>
      </Grid>

      {/* Recent Activity and Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivity activities={data.recentActivity} />
        </Grid>
        <Grid item xs={12} md={4}>
          <AlertsPanel alerts={data.alerts} />
        </Grid>
      </Grid>
    </Box>
  );
}
