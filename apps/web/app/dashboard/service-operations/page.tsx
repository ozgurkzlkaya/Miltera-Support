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
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';
import { useAuth } from '../../../features/auth/useAuth';

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
  const auth = useAuth();
  const [operations, setOperations] = useState<ServiceOperation[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [performance, setPerformance] = useState<TechnicianPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openOperationDialog, setOpenOperationDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editingOperation, setEditingOperation] = useState<ServiceOperation | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    operationType: '',
    issueId: '',
    description: '',
    findings: '',
    actionsTaken: '',
    duration: '',
    cost: '',
    isUnderWarranty: true
  });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Load service operations
          const operationsResponse = await fetch('http://localhost:3011/api/v1/service-operations', { headers });
        if (operationsResponse.ok) {
          const operationsData = await operationsResponse.json();
          setOperations(operationsData.data?.operations || []);
        }

        // Load issues for dropdown
          const issuesResponse = await fetch('http://localhost:3011/api/v1/issues', { headers });
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json();
          setIssues(issuesData.data || []);
        }

        // Load technician performance - temporarily disabled
        // const performanceResponse = await fetch('http://localhost:3011/api/v1/service-operations/technician-performance', { headers });
        // if (performanceResponse.ok) {
        //   const performanceData = await performanceResponse.json();
        //   setPerformance(performanceData.data || []);
        // }
        setPerformance([]); // Set empty array for now

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const handleCreateOperation = () => {
    setFormData({
      operationType: '',
      issueId: '',
      description: '',
      findings: '',
      actionsTaken: '',
      duration: '',
      cost: '',
      isUnderWarranty: true
    });
    setEditingOperation(null);
    setOpenOperationDialog(true);
  };

  const handleEditOperation = (operation: ServiceOperation) => {
    setEditingOperation(operation);
    setFormData({
      operationType: operation.operationType,
      issueId: operation.issue?.id || '',
      description: operation.description,
      findings: operation.findings || '',
      actionsTaken: operation.actionsTaken || '',
      duration: operation.duration?.toString() || '',
      cost: operation.cost?.toString() || '',
      isUnderWarranty: operation.isUnderWarranty
    });
    setOpenEditDialog(true);
  };

  const handleDeleteOperation = async (operationId: string) => {
    if (window.confirm('Bu operasyonu silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`http://localhost:3011/api/v1/service-operations/${operationId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.ok) {
          setOperations(prev => prev.filter(op => op.id !== operationId));
          setSnackbar({
            open: true,
            message: 'Operasyon başarıyla silindi',
            severity: 'success'
          });
        } else {
          throw new Error('Operasyon silinemedi');
        }
      } catch (error) {
        console.error('Error deleting operation:', error);
        setSnackbar({
          open: true,
          message: 'Operasyon silinirken hata oluştu',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveOperation = async () => {
    if (!formData.operationType || !formData.description) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const operationData = {
        // issueId'yi tamamen kaldıralım - backend'de handle ediliyor
        operationType: formData.operationType,
        description: formData.description,
        findings: formData.findings || "",
        actionsTaken: formData.actionsTaken || "",
        isUnderWarranty: formData.isUnderWarranty,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        performedBy: 'e7459941-79d4-4870-bd7f-7a42867b4d29'
      };

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

        const response = await fetch('http://localhost:3011/api/v1/service-operations', {
        method: 'POST',
        headers,
        body: JSON.stringify(operationData)
      });

      if (response.ok) {
        const newOperation = await response.json();
        setOperations(prev => [newOperation.data, ...prev]);
        setOpenOperationDialog(false);
        setSnackbar({
          open: true,
          message: 'Yeni operasyon başarıyla oluşturuldu',
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to create operation:', errorText);
        throw new Error('Operasyon oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating operation:', error);
      setSnackbar({
        open: true,
        message: 'Operasyon oluşturulurken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleUpdateOperation = async () => {
    if (!editingOperation || !formData.operationType || !formData.description) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const operationData = {
        status: 'COMPLETED',
        description: formData.description,
        findings: formData.findings || undefined,
        actionsTaken: formData.actionsTaken || undefined,
        isUnderWarranty: formData.isUnderWarranty,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        updatedBy: auth?.user?.id || 'e7459941-79d4-4870-bd7f-7a42867b4d29'
      };

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(`http://localhost:3011/api/v1/service-operations/${editingOperation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(operationData)
      });

      if (response.ok) {
        const updatedOperation = await response.json();
        setOperations(prev => prev.map(op => 
          op.id === editingOperation.id ? updatedOperation.data : op
        ));
        setOpenEditDialog(false);
        setEditingOperation(null);
        setSnackbar({
          open: true,
          message: 'Operasyon başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to update operation:', errorText);
        throw new Error('Operasyon güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating operation:', error);
      setSnackbar({
        open: true,
        message: 'Operasyon güncellenirken hata oluştu',
        severity: 'error'
      });
    }
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
                    {operations?.map((operation) => (
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
                          <IconButton 
                            size="small" 
                            title="Düzenle"
                            onClick={() => handleEditOperation(operation)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            title="Sil"
                            onClick={() => handleDeleteOperation(operation.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
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
                    {issues?.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.issueNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{issue.company?.name || 'Bilinmeyen Şirket'}</TableCell>
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
                          {issue.products?.length || 0} ürün
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
                {performance?.map((tech) => (
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
                  <Select 
                    label="Operasyon Türü"
                    value={formData.operationType || ''}
                    onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                  >
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
                  <InputLabel>Arıza Kaydı (Opsiyonel)</InputLabel>
                  <Select 
                    label="Arıza Kaydı (Opsiyonel)"
                    value={formData.issueId || ''}
                    onChange={(e) => setFormData({ ...formData, issueId: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Arıza kaydı seçin (opsiyonel)</em>
                    </MenuItem>
                    {issues?.map((issue) => (
                      <MenuItem key={issue.id} value={issue.id}>
                        {issue.issueNumber} - {issue.company?.name || 'Bilinmeyen Şirket'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama *"
                  multiline
                  rows={3}
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bulgular"
                  multiline
                  rows={2}
                  value={formData.findings || ''}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yapılan İşlemler"
                  multiline
                  rows={2}
                  value={formData.actionsTaken || ''}
                  onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Süre (dakika)"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maliyet (₺)"
                  type="number"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOperationDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveOperation}>Oluştur</Button>
          </DialogActions>
        </Dialog>

        {/* Operasyon Düzenleme Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Operasyon Düzenle - {editingOperation?.id}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Operasyon Türü</InputLabel>
                  <Select 
                    label="Operasyon Türü"
                    value={formData.operationType || ''}
                    onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                  >
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
                  <InputLabel>Arıza Kaydı (Opsiyonel)</InputLabel>
                  <Select 
                    label="Arıza Kaydı (Opsiyonel)"
                    value={formData.issueId || ''}
                    onChange={(e) => setFormData({ ...formData, issueId: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Arıza kaydı seçin (opsiyonel)</em>
                    </MenuItem>
                    {issues?.map((issue) => (
                      <MenuItem key={issue.id} value={issue.id}>
                        {issue.issueNumber} - {issue.company?.name || 'Bilinmeyen Şirket'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama *"
                  multiline
                  rows={3}
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bulgular"
                  multiline
                  rows={2}
                  value={formData.findings || ''}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yapılan İşlemler"
                  multiline
                  rows={2}
                  value={formData.actionsTaken || ''}
                  onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Süre (dakika)"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maliyet (₺)"
                  type="number"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleUpdateOperation}>Güncelle</Button>
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
}
