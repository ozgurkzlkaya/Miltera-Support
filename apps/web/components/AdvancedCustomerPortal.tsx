"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Alert,
  Snackbar,
  Badge,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as IssueIcon,
  Inventory as ProductIcon,
  LocalShipping as ShipmentIcon,
  Support as SupportIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuthenticatedAuth } from '../features/auth/useAuth';
import { useCompany } from '../features/companies/company.service';
import { apiClient } from '../lib/api';

interface CustomerStats {
  totalProducts: number;
  activeIssues: number;
  completedIssues: number;
  productsUnderWarranty: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  totalSpent: number;
  lastServiceDate: string;
}

interface CustomerIssue {
  id: string;
  issueNumber: string;
  product: string;
  serialNumber: string;
  description: string;
  status: string;
  priority: string;
  createdDate: string;
  estimatedCompletion?: string;
  completedDate?: string;
  assignedTechnician?: string;
  technicianRating?: number;
  customerRating?: number;
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface CustomerProduct {
  id: string;
  serialNumber: string;
  model: string;
  type: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyPeriodMonths: number;
  status: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceHistory: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    technician: string;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`customer-tabpanel-${index}`}
    aria-labelledby={`customer-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdvancedCustomerPortal: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CustomerIssue | null>(null);
  const [issues, setIssues] = useState<CustomerIssue[]>([]);
  const [products, setProducts] = useState<CustomerProduct[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalProducts: 0,
    activeIssues: 0,
    completedIssues: 0,
    productsUnderWarranty: 0,
    averageResolutionTime: 0,
    customerSatisfaction: 0,
    totalSpent: 0,
    lastServiceDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const { user } = useAuthenticatedAuth();
  const { data: company } = useCompany(user.companyId);

  useEffect(() => {
    if (user.companyId) {
      fetchCustomerData();
    }
  }, [user.companyId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customerIssues, customerProducts] = await Promise.all([
        apiClient.getCustomerIssues(user.companyId),
        apiClient.getCustomerProducts(user.companyId),
      ]);

      // İstatistikleri hesapla
      const activeIssues = customerIssues.filter((issue: any) => 
        ['OPEN', 'IN_PROGRESS'].includes(issue.status)
      ).length;
      
      const completedIssues = customerIssues.filter((issue: any) => 
        issue.status === 'RESOLVED'
      ).length;

      const productsUnderWarranty = customerProducts.filter((product: any) => {
        if (!product.warrantyStartDate) return false;
        const warrantyEnd = new Date(product.warrantyStartDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + (product.warrantyPeriodMonths || 0));
        return warrantyEnd > new Date();
      }).length;

      const averageResolutionTime = customerIssues
        .filter((issue: any) => issue.completedDate)
        .reduce((acc: number, issue: any) => {
          const created = new Date(issue.createdDate);
          const completed = new Date(issue.completedDate);
          return acc + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedIssues || 0;

      const customerSatisfaction = customerIssues
        .filter((issue: any) => issue.customerRating)
        .reduce((acc: number, issue: any) => acc + issue.customerRating, 0) / 
        customerIssues.filter((issue: any) => issue.customerRating).length || 0;

      setStats({
        totalProducts: customerProducts.length,
        activeIssues,
        completedIssues,
        productsUnderWarranty,
        averageResolutionTime,
        customerSatisfaction,
        totalSpent: 0, // TODO: Calculate from service operations
        lastServiceDate: customerIssues[0]?.completedDate || '',
      });

      // Arıza verilerini formatla
      const formattedIssues: CustomerIssue[] = customerIssues.map((issue: any) => ({
        id: issue.id,
        issueNumber: issue.issueNumber,
        product: issue.product?.serialNumber || 'Bilinmeyen Ürün',
        serialNumber: issue.product?.serialNumber || '',
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        createdDate: issue.createdDate,
        estimatedCompletion: issue.estimatedCompletion,
        completedDate: issue.completedDate,
        assignedTechnician: issue.assignedTechnician,
        technicianRating: issue.technicianRating,
        customerRating: issue.customerRating,
        notes: issue.notes,
        attachments: issue.attachments || [],
      }));

      // Ürün verilerini formatla
      const formattedProducts: CustomerProduct[] = customerProducts.map((product: any) => ({
        id: product.id,
        serialNumber: product.serialNumber,
        model: product.model?.name || 'Bilinmeyen Model',
        type: product.type?.name || 'Bilinmeyen Tip',
        purchaseDate: product.purchaseDate,
        warrantyStartDate: product.warrantyStartDate,
        warrantyPeriodMonths: product.warrantyPeriodMonths,
        status: product.status,
        lastServiceDate: product.lastServiceDate,
        nextServiceDate: product.nextServiceDate,
        serviceHistory: product.serviceHistory || [],
      }));

      setIssues(formattedIssues);
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateIssue = async (issueData: any) => {
    try {
      await apiClient.createCustomerIssue(user.companyId, issueData);
      setSnackbar({
        open: true,
        message: 'Arıza kaydı başarıyla oluşturuldu',
        severity: 'success',
      });
      setCreateIssueOpen(false);
      fetchCustomerData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Arıza kaydı oluşturulurken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleRateService = async (issueId: string, rating: number) => {
    try {
      // TODO: Implement rating API
      setSnackbar({
        open: true,
        message: 'Değerlendirme başarıyla kaydedildi',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Değerlendirme kaydedilirken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'cancelled': return 'default';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const speedDialActions = [
    {
      icon: <AddIcon />,
      name: 'Yeni Arıza',
      onClick: () => setCreateIssueOpen(true),
    },
    {
      icon: <ChatIcon />,
      name: 'Destek',
      onClick: () => setContactSupportOpen(true),
    },
    {
      icon: <PhoneIcon />,
      name: 'Ara',
      onClick: () => window.open('tel:+905551234567'),
    },
    {
      icon: <EmailIcon />,
      name: 'E-posta',
      onClick: () => window.open('mailto:destek@miltera.com.tr'),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Veriler yükleniyor...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Box>
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

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Müşteri Portalı
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Hoş geldiniz, {user.firstName} {user.lastName}
            </Typography>
            {company && (
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                {company.name}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<NotificationIcon />}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Bildirimler
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SettingsIcon />}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Ayarlar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Toplam Ürün
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.totalProducts}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <ProductIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Aktif Arızalar
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.activeIssues}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <IssueIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Garantili Ürün
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.productsUnderWarranty}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <CheckIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Memnuniyet
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={stats.customerSatisfaction} readOnly size="small" />
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {stats.customerSatisfaction.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <StarIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer portal tabs">
              <Tab label="Arızalarım" icon={<IssueIcon />} />
              <Tab label="Ürünlerim" icon={<ProductIcon />} />
              <Tab label="Hizmet Geçmişi" icon={<TimelineIcon />} />
              <Tab label="Destek" icon={<SupportIcon />} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Arızalarım</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateIssueOpen(true)}
              >
                Yeni Arıza
              </Button>
            </Box>

            <List>
              {issues.map((issue, index) => (
                <React.Fragment key={issue.id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {issue.issueNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {issue.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={issue.status}
                            color={getStatusColor(issue.status) as any}
                            size="small"
                          />
                          <Chip
                            label={issue.priority}
                            color={getPriorityColor(issue.priority) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(issue.createdDate), { addSuffix: true, locale: tr })}
                        </Typography>
                        {issue.assignedTechnician && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Teknisyen: {issue.assignedTechnician}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {issue.status === 'RESOLVED' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Hizmet Değerlendirmesi
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Rating
                            value={issue.customerRating || 0}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                handleRateService(issue.id, newValue);
                              }
                            }}
                            emptyIcon={<StarBorderIcon />}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Hizmeti değerlendirin
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        Detaylar
                      </Button>
                      {issue.attachments && issue.attachments.length > 0 && (
                        <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
                          Ekler ({issue.attachments.length})
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  {index < issues.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Ürünlerim
            </Typography>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} md={6} key={product.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {product.serialNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.model} - {product.type}
                          </Typography>
                        </Box>
                        <Chip
                          label={product.status}
                          color={getStatusColor(product.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Satın Alma: {format(new Date(product.purchaseDate), 'dd.MM.yyyy', { locale: tr })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Garanti: {format(new Date(product.warrantyStartDate), 'dd.MM.yyyy', { locale: tr })} - 
                          {format(new Date(new Date(product.warrantyStartDate).setMonth(
                            new Date(product.warrantyStartDate).getMonth() + product.warrantyPeriodMonths
                          )), 'dd.MM.yyyy', { locale: tr })}
                        </Typography>
                      </Box>

                      {product.serviceHistory && product.serviceHistory.length > 0 && (
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2">
                              Hizmet Geçmişi ({product.serviceHistory.length})
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {product.serviceHistory.map((service, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={service.type}
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          {format(new Date(service.date), 'dd.MM.yyyy', { locale: tr })} - {service.technician}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {service.description}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Hizmet Geçmişi
            </Typography>
            <Timeline>
              {issues.filter(issue => issue.status === 'RESOLVED').map((issue, index) => (
                <TimelineItem key={issue.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {format(new Date(issue.createdDate), 'dd.MM.yyyy HH:mm', { locale: tr })}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <IssueIcon />
                    </TimelineDot>
                    {index < issues.filter(issue => issue.status === 'RESOLVED').length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" component="span">
                          {issue.issueNumber}
                        </Typography>
                        <Typography color="text.secondary">
                          {issue.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={issue.status} color="success" size="small" />
                          <Chip label={issue.priority} size="small" variant="outlined" />
                        </Box>
                        {issue.customerRating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={issue.customerRating} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              Müşteri Değerlendirmesi
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Destek
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      İletişim Bilgileri
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Telefon"
                          secondary="+90 555 123 45 67"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="E-posta"
                          secondary="destek@miltera.com.tr"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ChatIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Canlı Destek"
                          secondary="7/24 Hizmet"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hızlı İşlemler
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateIssueOpen(true)}
                        fullWidth
                      >
                        Yeni Arıza Kaydı
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ChatIcon />}
                        onClick={() => setContactSupportOpen(true)}
                        fullWidth
                      >
                        Canlı Destek
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        fullWidth
                      >
                        Rapor İndir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Customer actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Create Issue Dialog */}
      <Dialog open={createIssueOpen} onClose={() => setCreateIssueOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Arıza Kaydı</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Ürün</InputLabel>
              <Select
                value=""
                label="Ürün"
                onChange={() => {}}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.serialNumber} - {product.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value=""
                label="Öncelik"
                onChange={() => {}}
              >
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="critical">Kritik</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Arıza Açıklaması"
              multiline
              rows={4}
              placeholder="Arızanın detaylı açıklamasını yazın..."
            />
            <TextField
              fullWidth
              label="Ek Notlar"
              multiline
              rows={2}
              placeholder="Ek bilgiler, notlar..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateIssueOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={() => handleCreateIssue({})}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Destek İletişim</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Konu"
              placeholder="Destek konusu..."
            />
            <TextField
              fullWidth
              label="Mesaj"
              multiline
              rows={4}
              placeholder="Mesajınızı yazın..."
            />
            <TextField
              fullWidth
              label="İletişim Tercihi"
              select
              defaultValue="email"
            >
              <MenuItem value="email">E-posta</MenuItem>
              <MenuItem value="phone">Telefon</MenuItem>
              <MenuItem value="chat">Canlı Sohbet</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactSupportOpen(false)}>İptal</Button>
          <Button variant="contained">Gönder</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedCustomerPortal;
