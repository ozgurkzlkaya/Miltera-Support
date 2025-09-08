'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface ServiceOperation {
  id: string;
  operationType: string;
  status: string;
  description: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty: boolean;
  cost?: number;
  duration?: number;
  operationDate: string;
  issue: {
    id: string;
    issueNumber: string;
    status: string;
  };
  performedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  issueProduct?: {
    id: string;
    product: {
      id: string;
      serialNumber: string;
    };
  };
}

interface Issue {
  id: string;
  issueNumber: string;
  status: string;
  customerDescription: string;
  issueDate: string;
  company: {
    name: string;
  };
  products: Array<{
    id: string;
    serialNumber: string;
    status: string;
  }>;
}

interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  totalOperations: number;
  completedOperations: number;
  totalCost: number;
  totalDuration: number;
  averageDuration: number;
}

const getOperationTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'HARDWARE_VERIFICATION': 'Donanım Doğrulama',
    'CONFIGURATION': 'Konfigürasyon',
    'PRE_TEST': 'Ön Test',
    'REPAIR': 'Tamir',
    'FINAL_TEST': 'Final Test',
    'QUALITY_CHECK': 'Kalite Kontrol',
  };
  return types[type] || type;
};

const getOperationTypeColor = (type: string) => {
  switch (type) {
    case 'HARDWARE_VERIFICATION':
      return 'primary';
    case 'CONFIGURATION':
      return 'secondary';
    case 'PRE_TEST':
      return 'info';
    case 'REPAIR':
      return 'warning';
    case 'FINAL_TEST':
      return 'success';
    case 'QUALITY_CHECK':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'default';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  const statusLabels: { [key: string]: string } = {
    'PENDING': 'Bekliyor',
    'IN_PROGRESS': 'İşlemde',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal Edildi',
  };
  return statusLabels[status] || status;
};

export default function ServiceOperationsPage() {
  const [operations, setOperations] = useState<ServiceOperation[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [performance, setPerformance] = useState<TechnicianPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openOperationDialog, setOpenOperationDialog] = useState(false);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Mock data - gerçek API'den gelecek
  useEffect(() => {
    const mockOperations: ServiceOperation[] = [
      {
        id: '1',
        operationType: 'HARDWARE_VERIFICATION',
        status: 'COMPLETED',
        description: 'Donanım doğrulama testleri tamamlandı',
        findings: 'Tüm bileşenler çalışır durumda',
        actionsTaken: 'Seri numarası atandı',
        isUnderWarranty: true,
        duration: 45,
        operationDate: '2025-01-15T10:30:00',
        issue: {
          id: '1',
          issueNumber: 'ARZ-2025-001',
          status: 'IN_PROGRESS',
        },
        performedBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
        },
        issueProduct: {
          id: '1',
          product: {
            id: '1',
            serialNumber: 'SN001',
          },
        },
      },
      {
        id: '2',
        operationType: 'REPAIR',
        status: 'COMPLETED',
        description: 'Güç kaynağı değişimi yapıldı',
        findings: 'Güç kaynağı arızalı',
        actionsTaken: 'Yeni güç kaynağı takıldı',
        isUnderWarranty: false,
        cost: 250,
        duration: 120,
        operationDate: '2025-01-14T14:20:00',
        issue: {
          id: '2',
          issueNumber: 'ARZ-2025-002',
          status: 'REPAIRED',
        },
        performedBy: {
          id: '2',
          firstName: 'Fatma',
          lastName: 'Özer',
        },
        issueProduct: {
          id: '2',
          product: {
            id: '2',
            serialNumber: 'SN002',
          },
        },
      },
      {
        id: '3',
        operationType: 'PRE_TEST',
        status: 'IN_PROGRESS',
        description: 'Ön test işlemleri başlatıldı',
        findings: 'Başlangıç testleri yapılıyor',
        isUnderWarranty: true,
        duration: 30,
        operationDate: '2025-01-16T09:15:00',
        issue: {
          id: '3',
          issueNumber: 'ARZ-2025-003',
          status: 'IN_PROGRESS',
        },
        performedBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
        },
      },
    ];

    const mockIssues: Issue[] = [
      {
        id: '1',
        issueNumber: 'ARZ-2025-001',
        status: 'IN_PROGRESS',
        customerDescription: 'Cihaz açılmıyor',
        issueDate: '2025-01-15T08:00:00',
        company: {
          name: 'ABC Şirketi',
        },
        products: [
          {
            id: '1',
            serialNumber: 'SN001',
            status: 'UNDER_REPAIR',
          },
        ],
      },
      {
        id: '2',
        issueNumber: 'ARZ-2025-002',
        status: 'REPAIRED',
        customerDescription: 'Güç sorunu yaşanıyor',
        issueDate: '2025-01-14T10:00:00',
        company: {
          name: 'XYZ Şirketi',
        },
        products: [
          {
            id: '2',
            serialNumber: 'SN002',
            status: 'READY_FOR_SHIPMENT',
          },
        ],
      },
    ];

    const mockPerformance: TechnicianPerformance[] = [
      {
        technicianId: '1',
        technicianName: 'Ahmet Yılmaz',
        totalOperations: 15,
        completedOperations: 14,
        totalCost: 1250,
        totalDuration: 720,
        averageDuration: 48,
      },
      {
        technicianId: '2',
        technicianName: 'Fatma Özer',
        totalOperations: 12,
        completedOperations: 11,
        totalCost: 890,
        totalDuration: 540,
        averageDuration: 45,
      },
    ];

    setTimeout(() => {
      setOperations(mockOperations);
      setIssues(mockIssues);
      setPerformance(mockPerformance);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateOperation = () => {
    setOpenOperationDialog(true);
  };

  const handleCreateWorkflow = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenWorkflowDialog(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
            Servis Operasyonları
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOperation}
          >
            Yeni Operasyon
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Ana İçerik */}
        <Paper sx={{ width: '100%' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Operasyonlar" />
            <Tab label="Arıza Kayıtları" />
            <Tab label="Teknisyen Performansı" />
          </Tabs>

          {/* Operasyonlar Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Operasyon Türü</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Teknisyen</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Süre (dk)</TableCell>
                      <TableCell>Maliyet</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>
                          <Chip
                            label={getOperationTypeLabel(operation.operationType)}
                            color={getOperationTypeColor(operation.operationType) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(operation.status)}
                            color={getStatusColor(operation.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {operation.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {operation.performedBy.firstName} {operation.performedBy.lastName}
                        </TableCell>
                        <TableCell>
                          {new Date(operation.operationDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          {operation.duration || '-'}
                        </TableCell>
                        <TableCell>
                          {operation.cost ? `${operation.cost} ₺` : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" title="Görüntüle">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" title="Düzenle">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Arıza Kayıtları Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Arıza No</TableCell>
                      <TableCell>Müşteri</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Ürünler</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.issueNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{issue.company.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {issue.customerDescription}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(issue.status)}
                            color={getStatusColor(issue.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(issue.issueDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          {issue.products.length} ürün
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleCreateWorkflow(issue)}
                            title="Servis İş Akışı"
                          >
                            <BuildIcon />
                          </IconButton>
                          <IconButton size="small" title="Görüntüle">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Teknisyen Performansı Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {performance.map((tech) => (
                  <Grid item xs={12} md={6} key={tech.technicianId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {tech.technicianName}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Toplam Operasyon
                            </Typography>
                            <Typography variant="h6">
                              {tech.totalOperations}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Tamamlanan
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              {tech.completedOperations}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Toplam Maliyet
                            </Typography>
                            <Typography variant="h6">
                              {tech.totalCost} ₺
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Ortalama Süre
                            </Typography>
                            <Typography variant="h6">
                              {tech.averageDuration} dk
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Yeni Operasyon Dialog */}
        <Dialog open={openOperationDialog} onClose={() => setOpenOperationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Yeni Servis Operasyonu</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Operasyon Türü</InputLabel>
                  <Select label="Operasyon Türü">
                    <MenuItem value="HARDWARE_VERIFICATION">Donanım Doğrulama</MenuItem>
                    <MenuItem value="CONFIGURATION">Konfigürasyon</MenuItem>
                    <MenuItem value="PRE_TEST">Ön Test</MenuItem>
                    <MenuItem value="REPAIR">Tamir</MenuItem>
                    <MenuItem value="FINAL_TEST">Final Test</MenuItem>
                    <MenuItem value="QUALITY_CHECK">Kalite Kontrol</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Arıza Kaydı</InputLabel>
                  <Select label="Arıza Kaydı">
                    {issues.map((issue) => (
                      <MenuItem key={issue.id} value={issue.id}>
                        {issue.issueNumber} - {issue.company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bulgular"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yapılan İşlemler"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Süre (dakika)"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maliyet (₺)"
                  type="number"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOperationDialog(false)}>İptal</Button>
            <Button variant="contained">Oluştur</Button>
          </DialogActions>
        </Dialog>

        {/* Servis İş Akışı Dialog */}
        <Dialog open={openWorkflowDialog} onClose={() => setOpenWorkflowDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            Servis İş Akışı - {selectedIssue?.issueNumber}
          </DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Arıza Detayları
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Müşteri: {selectedIssue.company.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Açıklama: {selectedIssue.customerDescription}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Ürünler
                </Typography>
                <List>
                  {selectedIssue.products.map((product) => (
                    <ListItem key={product.id}>
                      <ListItemText
                        primary={`Seri No: ${product.serialNumber}`}
                        secondary={`Durum: ${getStatusLabel(product.status)}`}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Operasyon Adımları
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Servis iş akışı adımları burada tanımlanacak...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWorkflowDialog(false)}>Kapat</Button>
            <Button variant="contained">İş Akışını Başlat</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
