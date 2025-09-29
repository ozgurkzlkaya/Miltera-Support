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
  Avatar,
  LinearProgress,
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
  cost?: string | number;
  duration?: number;
  operationDate: string;
  issue?: {
    id: string;
    issueNumber: string;
    status: string;
  };
  performedBy?: string;
  performedByUser?: {
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
  issueDate?: string;
  createdAt: string;
  company?: {
    name: string;
  };
  products?: Array<{
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
  const [openViewOperationDialog, setOpenViewOperationDialog] = useState(false);
  const [openViewIssueDialog, setOpenViewIssueDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<ServiceOperation | null>(null);
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

  // Calculate performance from operations data
  const calculatePerformance = async (operationsData: any[]) => {
    try {
      console.log('Performance calculation - operations data:', operationsData.length);
      const technicianStats = new Map();
      
      operationsData.forEach((op: any) => {
        // performedBy kullan, yoksa technicianId kullan
        const techId = op.performedBy || op.technicianId;
        if (!techId) return;
        
        if (!technicianStats.has(techId)) {
          // Teknisyen ismini daha iyi al
          let technicianName = 'Bilinmeyen Teknisyen';
          if (op.performedBy) {
            // performedBy bir ID ise, isim mapping yap
            if (op.performedBy === '3383f9bf-1b18-4174-b080-6a114bf457e5') {
              technicianName = 'Test User 6';
            } else if (op.performedBy === 'ce2a6761-82e3-48ba-af33-2f49b4b73e35') {
              technicianName = 'Test User 6 (Alt)';
            } else if (op.performedBy === '0834d1d1-98e6-4de2-962d-efbd596eecc6') {
              technicianName = 'Teknisyen 1';
            } else {
              technicianName = `Teknisyen ${op.performedBy.slice(-4)}`;
            }
          } else if (op.technicianId === 'ce2a6761-82e3-48ba-af33-2f49b4b73e35') {
            technicianName = 'Test User 6';
          } else if (op.technicianId === '0834d1d1-98e6-4de2-962d-efbd596eecc6') {
            technicianName = 'Teknisyen 1';
          } else {
            technicianName = `Teknisyen ${op.technicianId.slice(-4)}`;
          }
          
          technicianStats.set(techId, {
            technicianId: techId,
            technicianName: technicianName,
            totalOperations: 0,
            completedOperations: 0,
            totalCost: 0,
            totalDuration: 0
          });
        }
        
        const stats = technicianStats.get(techId);
        stats.totalOperations++;
        if (op.status === 'COMPLETED') {
          stats.completedOperations++;
        }
        stats.totalCost += op.cost || 0;
        stats.totalDuration += op.duration || 0;
      });
      
      const performanceData = Array.from(technicianStats.values()).map(stats => ({
        ...stats,
        averageDuration: stats.totalOperations > 0 ? Math.round(stats.totalDuration / stats.totalOperations) : 0
      }));
      
      console.log('Calculated performance data:', performanceData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Error calculating technician performance:', error);
      setPerformance([]);
    }
  };

  // Load data from API
  const loadData = async () => {
      try {
        setLoading(true);
        
        // localStorage'dan yükleme kaldırıldı - sadece API'den yükle
        
        // Geçerli token'ı kullan
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzODNmOWJmLTFiMTgtNDE3NC1iMDgwLTZhMTE0YmY0NTdlNSIsImVtYWlsIjoidGVzdHVzZXI2QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU4OTExMDg4LCJleHAiOjE3NTk1MTU4ODh9.qA2LYT0G1GmoOp4Z94F0TfodUA4m8OsjDWEOqzPbifU';
        localStorage.setItem('auth_token', validToken);
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        };

        // Load service operations
        const operationsResponse = await fetch('http://localhost:3015/api/v1/service-operations', { headers });
        let operationsData = [];
        if (operationsResponse.ok) {
          const operationsDataResponse = await operationsResponse.json();
          operationsData = operationsDataResponse.data || [];
          setOperations(operationsData);
          console.log('Service operations loaded from API:', operationsData.length);
        } else {
          console.error('Failed to load service operations from API');
          setOperations([]);
        }

        // Load issues for dropdown
        const issuesResponse = await fetch('http://localhost:3015/api/v1/issues', { headers });
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json();
          setIssues(issuesData.data || []);
        }

        // Load technician performance - Calculate from existing operations
        await calculatePerformance(operationsData);

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
      setLoading(false);
      }
    };

  // Load data on component mount
  useEffect(() => {
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

        const response = await fetch(`http://localhost:3015/api/v1/service-operations/${operationId}`, {
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
        issueId: formData.issueId || null,
      operationType: formData.operationType,
      description: formData.description,
        findings: formData.findings || "",
        actionsTaken: formData.actionsTaken || "",
      isUnderWarranty: formData.isUnderWarranty,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
        performedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Admin user ID
      };

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

        const response = await fetch('http://localhost:3015/api/v1/service-operations', {
        method: 'POST',
        headers,
        body: JSON.stringify(operationData)
      });

      if (response.ok) {
        const newOperation = await response.json();
        const newOperations = [newOperation.data, ...operations];
        setOperations(newOperations);
        // localStorage'a kaydet
        localStorage.setItem('service_operations', JSON.stringify(newOperations));
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

  // Hızlı operasyon türü güncelleme
  const handleQuickOperationTypeUpdate = async (operationId: string, newOperationType: string) => {
    try {
      console.log('Updating operation type:', { operationId, newOperationType });
      
      // Geçerli token'ı kullan
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNlMmE2NzYxLTgyZTMtNDhiYS1hZjMzLTJmNDliNGI3M2UzNSIsImVtYWlsIjoidGVzdHVzZXI2QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNzc5NzQ1MCwiZXhwIjoxNzM3ODg0MjUwfQ.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8';
      localStorage.setItem('auth_token', validToken);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      };
      
      console.log('Headers:', headers);
      console.log('Operation ID:', operationId);
      console.log('New Operation Type:', newOperationType);
      console.log('Request Body:', JSON.stringify({
        operationType: newOperationType,
        updatedBy: auth?.user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
      }));

      const url = `http://localhost:3015/api/v1/service-operations/${operationId}`;
      console.log('Request URL:', url);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          operationType: newOperationType,
          updatedBy: auth?.user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const updatedOperation = await response.json();
        const newOperations = operations.map(op => 
          op.id === operationId ? updatedOperation.data : op
        );
        setOperations(newOperations);
        // localStorage'ı güncelle
        localStorage.setItem('service_operations', JSON.stringify(newOperations));
        setSnackbar({
          open: true,
          message: 'Operasyon türü güncellendi',
          severity: 'success'
        });
      } else {
        throw new Error('Operasyon türü güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating operation type:', error);
      setSnackbar({
        open: true,
        message: 'Operasyon türü güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  // İş akışını başlat
  const handleStartWorkflow = async () => {
    console.log('handleStartWorkflow called, selectedIssue:', selectedIssue);
    
    if (!selectedIssue) {
      console.error('No selected issue found');
      setSnackbar({
        open: true,
        message: 'Arıza seçilmedi',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Starting workflow for issue:', selectedIssue.id);
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // İlk operasyonu oluştur
      const workflowData = {
        issueId: selectedIssue.id,
        operationType: 'HARDWARE_VERIFICATION',
        description: 'İş akışı başlatıldı - Donanım Doğrulama',
        findings: 'İş akışı otomatik olarak başlatıldı',
        actionsTaken: 'Donanım doğrulama adımı başlatıldı',
        duration: 30,
        cost: 0,
        performedBy: auth?.user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
      };

      const response = await fetch('http://localhost:3015/api/v1/service-operations', {
        method: 'POST',
        headers,
        body: JSON.stringify(workflowData)
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const newOperation = await response.json();
        console.log('New operation created:', newOperation);
        const newOperations = [newOperation.data, ...operations];
        setOperations(newOperations);
        // localStorage'a kaydet
        localStorage.setItem('service_operations', JSON.stringify(newOperations));
        
        // Arıza durumunu güncelle (IN_PROGRESS olarak)
        if (selectedIssue) {
          const updateIssueResponse = await fetch(`http://localhost:3015/api/v1/issues/${selectedIssue.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              ...selectedIssue,
              status: 'IN_PROGRESS'
            })
          });
          
          if (updateIssueResponse.ok) {
            console.log('Issue status updated to IN_PROGRESS');
            // Issues listesini yenile
            loadData();
          } else {
            console.error('Failed to update issue status:', await updateIssueResponse.text());
          }
        }
        
        setOpenWorkflowDialog(false);
        setSnackbar({
          open: true,
          message: 'İş akışı başarıyla başlatıldı',
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`İş akışı başlatılamadı: ${response.status}`);
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      setSnackbar({
        open: true,
        message: 'İş akışı başlatılırken hata oluştu',
        severity: 'error'
      });
    }
  };

  // Hızlı status güncelleme
  const handleQuickStatusUpdate = async (operationId: string, newStatus: string) => {
    try {
      console.log('Updating status:', { operationId, newStatus });
      
      // Geçerli token'ı kullan
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNlMmE2NzYxLTgyZTMtNDhiYS1hZjMzLTJmNDliNGI3M2UzNSIsImVtYWlsIjoidGVzdHVzZXI2QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNzc5NzQ1MCwiZXhwIjoxNzM3ODg0MjUwfQ.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8';
      localStorage.setItem('auth_token', validToken);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      };
      
      console.log('Headers:', headers);
      console.log('Operation ID:', operationId);
      console.log('New Status:', newStatus);
      console.log('Request Body:', JSON.stringify({
        status: newStatus,
        updatedBy: auth?.user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
      }));

      const url = `http://localhost:3015/api/v1/service-operations/${operationId}`;
      console.log('Request URL:', url);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: newStatus,
          updatedBy: auth?.user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const updatedOperation = await response.json();
        const newOperations = operations.map(op => 
          op.id === operationId ? updatedOperation.data : op
        );
        setOperations(newOperations);
        // localStorage'ı güncelle
        localStorage.setItem('service_operations', JSON.stringify(newOperations));
        setSnackbar({
          open: true,
          message: 'Operasyon durumu güncellendi',
          severity: 'success'
        });
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Durum güncellenirken hata oluştu',
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

      const response = await fetch(`http://localhost:3015/api/v1/service-operations/${editingOperation.id}`, {
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
    console.log('Creating workflow for issue:', issue);
    setSelectedIssue(issue);
    setOpenWorkflowDialog(true);
  };

  const handleViewOperation = (operation: ServiceOperation) => {
    setSelectedOperation(operation);
    setOpenViewOperationDialog(true);
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenViewIssueDialog(true);
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
                            onClick={() => {
                              // Operasyon türü cycle: HARDWARE_VERIFICATION -> CONFIGURATION -> PRE_TEST -> REPAIR -> FINAL_TEST -> QUALITY_CHECK
                              const operationTypeCycle = ['HARDWARE_VERIFICATION', 'CONFIGURATION', 'PRE_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'];
                              const currentIndex = operationTypeCycle.indexOf(operation.operationType);
                              const nextIndex = (currentIndex + 1) % operationTypeCycle.length;
                              const nextOperationType = operationTypeCycle[nextIndex];
                              handleQuickOperationTypeUpdate(operation.id, nextOperationType);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(operation.status)}
                            color={getStatusColor(operation.status) as any}
                            size="small"
                            onClick={() => {
                              // Status cycle: PENDING -> IN_PROGRESS -> COMPLETED -> CANCELLED
                              const statusCycle = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
                              const currentIndex = statusCycle.indexOf(operation.status);
                              const nextIndex = (currentIndex + 1) % statusCycle.length;
                              const nextStatus = statusCycle[nextIndex];
                              handleQuickStatusUpdate(operation.id, nextStatus);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {operation.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {operation.performedByUser?.firstName} {operation.performedByUser?.lastName}
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
                          <IconButton 
                            size="small" 
                            title="Görüntüle"
                            onClick={() => handleViewOperation(operation)}
                          >
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
                          {new Date(issue.issueDate || issue.createdAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(issue.products) ? issue.products.length : (issue.products ? 1 : 0)} ürün
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleCreateWorkflow(issue)}
                            title="Servis İş Akışı"
                          >
                            <BuildIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            title="Görüntüle"
                            onClick={() => handleViewIssue(issue)}
                          >
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
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Teknisyen Performans Raporu
              </Typography>
              
              <Grid container spacing={3}>
                {performance?.map((tech) => (
                  <Grid item xs={12} md={6} lg={4} key={tech.technicianId}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {tech.technicianName.charAt(0)}
                          </Avatar>
                          <Typography variant="h6" component="div">
                          {tech.technicianName}
                        </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                              Toplam Operasyon
                            </Typography>
                              <Typography variant="h5" color="primary.main">
                              {tech.totalOperations}
                            </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                              Tamamlanan
                            </Typography>
                              <Typography variant="h5" color="success.dark">
                              {tech.completedOperations}
                            </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                              Toplam Maliyet
                            </Typography>
                              <Typography variant="h6" color="warning.dark">
                                {tech.totalCost?.toLocaleString('tr-TR')} ₺
                            </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                              Ortalama Süre
                            </Typography>
                              <Typography variant="h6" color="info.dark">
                              {tech.averageDuration} dk
                            </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Başarı Oranı
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={(tech.completedOperations / tech.totalOperations) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {Math.round((tech.completedOperations / tech.totalOperations) * 100)}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {performance?.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    Henüz teknisyen performans verisi bulunmuyor
                  </Typography>
                </Box>
              )}
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
                  Müşteri: {selectedIssue.company?.name || 'Bilinmeyen Şirket'}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Açıklama: {selectedIssue.customerDescription}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Ürünler
                </Typography>
                <List>
                  {selectedIssue.products && selectedIssue.products.length > 0 ? (
                    selectedIssue.products.map((product) => (
                    <ListItem key={product.id}>
                      <ListItemText
                        primary={`Seri No: ${product.serialNumber}`}
                        secondary={`Durum: ${getStatusLabel(product.status)}`}
                      />
                    </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="Ürün bulunamadı" />
                    </ListItem>
                  )}
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
            <Button variant="contained" onClick={handleStartWorkflow}>İş Akışını Başlat</Button>
          </DialogActions>
        </Dialog>

        {/* View Operation Dialog */}
        <Dialog open={openViewOperationDialog} onClose={() => setOpenViewOperationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Operasyon Detayları</DialogTitle>
          <DialogContent>
            {selectedOperation && (
              <Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Operasyon Türü</Typography>
                    <Chip
                      label={getOperationTypeLabel(selectedOperation.operationType)}
                      color={getOperationTypeColor(selectedOperation.operationType) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Durum</Typography>
                    <Chip
                      label={getStatusLabel(selectedOperation.status)}
                      color={getStatusColor(selectedOperation.status) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body2">{selectedOperation.description}</Typography>
                  </Grid>
                  {selectedOperation.findings && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Bulgular</Typography>
                      <Typography variant="body2">{selectedOperation.findings}</Typography>
                    </Grid>
                  )}
                  {selectedOperation.actionsTaken && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Yapılan İşlemler</Typography>
                      <Typography variant="body2">{selectedOperation.actionsTaken}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Teknisyen</Typography>
                    <Typography variant="body2">
                      {selectedOperation.performedByUser?.firstName} {selectedOperation.performedByUser?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tarih</Typography>
                    <Typography variant="body2">
                      {new Date(selectedOperation.operationDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Grid>
                  {selectedOperation.duration && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Süre</Typography>
                      <Typography variant="body2">{selectedOperation.duration} dakika</Typography>
                    </Grid>
                  )}
                  {selectedOperation.cost && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Maliyet</Typography>
                      <Typography variant="body2">{selectedOperation.cost} ₺</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Garanti Kapsamında</Typography>
                    <Typography variant="body2">
                      {selectedOperation.isUnderWarranty ? 'Evet' : 'Hayır'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewOperationDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* View Issue Dialog */}
        <Dialog open={openViewIssueDialog} onClose={() => setOpenViewIssueDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Arıza Detayları - {selectedIssue?.issueNumber}</DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Arıza Numarası</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedIssue.issueNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Durum</Typography>
                    <Chip
                      label={getStatusLabel(selectedIssue.status)}
                      color={getStatusColor(selectedIssue.status) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Müşteri</Typography>
                    <Typography variant="body2">{selectedIssue.company?.name || 'Bilinmeyen Şirket'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body2">{selectedIssue.customerDescription}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tarih</Typography>
                    <Typography variant="body2">
                      {new Date(selectedIssue.issueDate || selectedIssue.createdAt).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Ürün Sayısı</Typography>
                    <Typography variant="body2">{Array.isArray(selectedIssue.products) ? selectedIssue.products.length : (selectedIssue.products ? 1 : 0)} ürün</Typography>
                  </Grid>
                  {selectedIssue.products && selectedIssue.products.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Ürünler</Typography>
                      <List dense>
                        {selectedIssue.products.map((product) => (
                          <ListItem key={product.id}>
                            <ListItemText
                              primary={`Seri No: ${product.serialNumber}`}
                              secondary={`Durum: ${getStatusLabel(product.status)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewIssueDialog(false)}>Kapat</Button>
            <Button 
              variant="contained" 
              startIcon={<BuildIcon />}
              onClick={() => {
                setOpenViewIssueDialog(false);
                handleCreateWorkflow(selectedIssue!);
              }}
            >
              İş Akışını Başlat
            </Button>
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
