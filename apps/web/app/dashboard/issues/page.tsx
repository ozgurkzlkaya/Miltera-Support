"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
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
  Avatar,
  Tooltip,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// Issue interface
interface Issue {
  id: string;
  issueNumber: string;
  source: 'CUSTOMER' | 'TSP' | 'FIRST_PRODUCTION';
  status: 'OPEN' | 'IN_PROGRESS' | 'REPAIRED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty: boolean;
  estimatedCost?: number;
  actualCost?: number;
  issueDate: string;
  preInspectionDate?: string;
  repairDate?: string;
  resolvedAt?: string;
  company?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  reportedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'WAITING_CUSTOMER_APPROVAL':
      return 'secondary';
    case 'REPAIRED':
      return 'success';
    case 'CLOSED':
      return 'default';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'Açık';
    case 'IN_PROGRESS':
      return 'İşlemde';
    case 'WAITING_CUSTOMER_APPROVAL':
      return 'Müşteri Onayı Bekliyor';
    case 'REPAIRED':
      return 'Tamir Edildi';
    case 'CLOSED':
      return 'Kapalı';
    case 'CANCELLED':
      return 'İptal Edildi';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'Kritik';
    case 'HIGH':
      return 'Yüksek';
    case 'MEDIUM':
      return 'Orta';
    case 'LOW':
      return 'Düşük';
    default:
      return priority;
  }
};

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'CUSTOMER':
      return 'Müşteri';
    case 'TSP':
      return 'TSP';
    case 'FIRST_PRODUCTION':
      return 'İlk Üretim';
    default:
      return source;
  }
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'CUSTOMER':
      return <ErrorIcon />;
    case 'TSP':
      return <BuildIcon />;
    case 'FIRST_PRODUCTION':
      return <InfoIcon />;
    default:
      return <WarningIcon />;
  }
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    source: '',
    priority: '',
    status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'REPAIRED' | 'CLOSED',
    customerDescription: '',
    technicianDescription: '',
    isUnderWarranty: true,
    estimatedCost: '',
    actualCost: '',
    companyId: '',
    categoryId: ''
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
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Load issues
        const issuesResponse = await fetch('http://localhost:3011/api/v1/issues', { headers });
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json();
          const rawIssues = (issuesData?.data ?? []) as any[];
          const normalizedIssues: Issue[] = rawIssues.map((it) => ({
            id: it.id,
            issueNumber: it.issueNumber ?? '',
            source: (it.source ?? 'CUSTOMER') as Issue['source'],
            status: (it.status ?? 'OPEN') as Issue['status'],
            priority: (it.priority ?? 'LOW') as Issue['priority'],
            customerDescription: it.customerDescription ?? it.description ?? '',
            technicianDescription: it.technicianDescription ?? '',
            isUnderWarranty: Boolean(it.isUnderWarranty),
            estimatedCost: it.estimatedCost != null ? Number(it.estimatedCost) : undefined,
            actualCost: it.actualCost != null ? Number(it.actualCost) : undefined,
            issueDate: it.reportedAt ?? it.createdAt ?? new Date().toISOString(),
            company: it.company ? { id: it.company.id, name: it.company.name } : undefined,
            category: it.issueCategory ? { id: it.issueCategory.id, name: it.issueCategory.name } : undefined,
            reportedByUser: it.reportedByUser
              ? {
                  id: it.reportedByUser.id,
                  firstName: it.reportedByUser.firstName ?? '',
                  lastName: it.reportedByUser.lastName ?? '',
                }
              : undefined,
          }));
          setIssues(normalizedIssues);
        }

        // Load companies
        const companiesResponse = await fetch('http://localhost:3011/api/v1/companies', { headers });
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData.data || []);
        }

        // Load categories
        const categoriesResponse = await fetch('http://localhost:3011/api/v1/categories', { headers });
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.data || []);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate new issue number
  const generateIssueNumber = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const existingCount = issues.filter(issue => 
      issue.issueNumber.startsWith(`${year}${month}${day}`)
    ).length + 1;
    return `${year}${month}${day}-${existingCount.toString().padStart(2, '0')}`;
  };

  const handleCreateIssue = () => {
    setFormData({
      source: '',
      priority: '',
      status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'REPAIRED' | 'CLOSED',
      customerDescription: '',
      technicianDescription: '',
      isUnderWarranty: true,
      estimatedCost: '',
      actualCost: '',
      companyId: '',
      categoryId: ''
    });
    setOpenCreateDialog(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setFormData({
      source: issue.source,
      priority: issue.priority,
      status: issue.status,
      customerDescription: issue.customerDescription || '',
      technicianDescription: issue.technicianDescription || '',
      isUnderWarranty: issue.isUnderWarranty,
      estimatedCost: issue.estimatedCost?.toString() || '',
      actualCost: issue.actualCost?.toString() || '',
      companyId: issue.company?.id || '',
      categoryId: issue.category?.id || ''
    });
    setOpenEditDialog(true);
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenViewDialog(true);
  };

  const handleDeleteIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedIssue) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`http://localhost:3011/api/v1/issues/${selectedIssue.id}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          setIssues(prev => prev.filter(issue => issue.id !== selectedIssue.id));
          setSnackbar({
            open: true,
            message: `Arıza başarıyla silindi`,
            severity: 'success'
          });
          setOpenDeleteDialog(false);
          setSelectedIssue(null);
        } else {
          throw new Error('Arıza silinemedi');
        }
      } catch (error) {
        console.error('Error deleting issue:', error);
        setSnackbar({
          open: true,
          message: 'Arıza silinirken hata oluştu',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveCreate = async () => {
    if (!formData.source || !formData.priority || !formData.customerDescription) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const issueData = {
        status: formData.status,
        source: formData.source,
        priority: formData.priority,
        customerDescription: formData.customerDescription,
        technicianDescription: formData.technicianDescription,
        isUnderWarranty: formData.isUnderWarranty,
        estimatedCost: formData.estimatedCost && formData.estimatedCost.toString().trim() !== '' ? formData.estimatedCost.toString() : null,
        actualCost: formData.actualCost && formData.actualCost.toString().trim() !== '' ? formData.actualCost.toString() : null,
        companyId: formData.companyId,
        categoryId: formData.categoryId
      };

      const response = await fetch('http://localhost:3011/api/v1/issues', {
        method: 'POST',
        headers,
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        const payload = await response.json();
        const created = payload?.data ?? {};
        const normalized: Issue = {
          id: created.id,
          issueNumber: created.issueNumber ?? '',
          source: (created.source ?? 'CUSTOMER') as Issue['source'],
          status: (created.status ?? 'OPEN') as Issue['status'],
          priority: (created.priority ?? 'LOW') as Issue['priority'],
          customerDescription: created.customerDescription ?? created.description ?? '',
          technicianDescription: created.technicianDescription ?? '',
          isUnderWarranty: Boolean(created.isUnderWarranty),
          estimatedCost: created.estimatedCost != null ? Number(created.estimatedCost) : undefined,
          actualCost: created.actualCost != null ? Number(created.actualCost) : undefined,
          issueDate: created.reportedAt ?? created.createdAt ?? new Date().toISOString(),
          company: created.companyId ? { id: created.companyId, name: created.company?.name ?? '' } : undefined,
          category: created.issueCategoryId ? { id: created.issueCategoryId, name: created.issueCategory?.name ?? '' } : undefined,
          reportedByUser: created.reportedByUser
            ? {
                id: created.reportedByUser.id,
                firstName: created.reportedByUser.firstName ?? '',
                lastName: created.reportedByUser.lastName ?? '',
              }
            : undefined,
        };
        setIssues((prev) => [normalized, ...prev]);
        setOpenCreateDialog(false);
        setSnackbar({
          open: true,
          message: `Yeni arıza başarıyla oluşturuldu`,
          severity: 'success'
        });
      } else {
        throw new Error('Arıza oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      setSnackbar({
        open: true,
        message: 'Arıza oluşturulurken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedIssue) return;

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const issueData = {
        status: formData.status,
        source: formData.source,
        priority: formData.priority,
        customerDescription: formData.customerDescription,
        technicianDescription: formData.technicianDescription,
        isUnderWarranty: formData.isUnderWarranty,
        estimatedCost: formData.estimatedCost && formData.estimatedCost.toString().trim() !== '' ? formData.estimatedCost.toString() : null,
        actualCost: formData.actualCost && formData.actualCost.toString().trim() !== '' ? formData.actualCost.toString() : null,
        companyId: formData.companyId,
        categoryId: formData.categoryId
      };

      const response = await fetch(`http://localhost:3011/api/v1/issues/${selectedIssue.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues(prev => prev.map(issue => 
          issue.id === selectedIssue.id ? updatedIssue.data : issue
        ));
        setOpenEditDialog(false);
        setSelectedIssue(null);
        setSnackbar({
          open: true,
          message: `Arıza başarıyla güncellendi`,
          severity: 'success'
        });
      } else {
        throw new Error('Arıza güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      setSnackbar({
        open: true,
        message: 'Arıza güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3011/api/v1/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          resolvedAt: newStatus === 'CLOSED' ? new Date().toISOString() : undefined
        })
      });

      if (response.ok) {
        // Backend'den güncellenmiş veriyi al
        const updatedIssue = await response.json();
        
        // Frontend state'ini güncelle
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? { 
            ...issue, 
            status: newStatus as any,
            repairDate: newStatus === 'REPAIRED' ? new Date().toISOString().split('T')[0] : issue.repairDate,
            resolvedAt: newStatus === 'CLOSED' ? new Date().toISOString() : issue.resolvedAt
          } : issue
        ));
        
        setSnackbar({
          open: true,
          message: 'Arıza durumu başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      setSnackbar({
        open: true,
        message: 'Durum güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchTerm || 
      issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.customerDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesSource = !sourceFilter || issue.source === sourceFilter;
    const matchesPriority = !priorityFilter || issue.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  const getIssueStats = () => {
    return {
      open: issues.filter(i => i.status === 'OPEN').length,
      inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
      repaired: issues.filter(i => i.status === 'REPAIRED').length,
      closed: issues.filter(i => i.status === 'CLOSED').length,
    };
  };

  const stats = getIssueStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Arıza Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateIssue}
          sx={{ borderRadius: 2 }}
        >
          Yeni Arıza Kaydı
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} key="open-issues">
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Açık Arızalar
                  </Typography>
                  <Typography variant="h5" component="div" color="info.main">
                    {stats.open}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <ErrorIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} key="in-progress-issues">
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    İşlemde
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main">
                    {stats.inProgress}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <BuildIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} key="repaired-issues">
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tamir Edildi
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {stats.repaired}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} key="closed-issues">
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Kapalı
                  </Typography>
                  <Typography variant="h5" component="div" color="text.secondary">
                    {stats.closed}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "grey.500" }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4} key="search-field">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SearchIcon sx={{ color: "text.secondary" }} />
                <TextField
                  fullWidth
                  placeholder="Arıza numarası, açıklama, müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2} key="status-filter">
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="OPEN">Açık</MenuItem>
                  <MenuItem value="IN_PROGRESS">İşlemde</MenuItem>
                  <MenuItem value="REPAIRED">Tamir Edildi</MenuItem>
                  <MenuItem value="CLOSED">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2} key="source-filter">
              <FormControl fullWidth size="small">
                <InputLabel>Kaynak</InputLabel>
                <Select
                  value={sourceFilter}
                  label="Kaynak"
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2} key="priority-filter">
              <FormControl fullWidth size="small">
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Öncelik"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="LOW">Düşük</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2} key="clear-button">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setSourceFilter('');
                  setPriorityFilter('');
                }}
              >
                Temizle
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Issues List */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredIssues.map((issue) => (
          <Grid item xs={12} md={6} lg={4} key={issue.id}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                boxShadow: 1,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                "&:hover": {
                  boxShadow: 3,
                  borderColor: "primary.main"
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getSourceIcon(issue.source)}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {issue.issueNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {issue.company?.name || "Müşteri bilgisi yok"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Görüntüle">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewIssue(issue)}
                        sx={{ color: "primary.main" }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Düzenle">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditIssue(issue)}
                        sx={{ color: "warning.main" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Sil">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteIssue(issue)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {issue.customerDescription || "Açıklama yok"}
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                    <Chip 
                      label={getStatusLabel(issue.status)} 
                      color={getStatusColor(issue.status) as any}
                      size="small"
                      onClick={() => {
                        const statuses = ['OPEN', 'IN_PROGRESS', 'REPAIRED', 'CLOSED'];
                        const currentIndex = statuses.indexOf(issue.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        handleUpdateStatus(issue.id, nextStatus);
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label={getPriorityLabel(issue.priority)} 
                      color={getPriorityColor(issue.priority) as any}
                      size="small"
                    />
                    <Chip 
                      label={issue.isUnderWarranty ? "Garanti" : "Ücretli"} 
                      color={issue.isUnderWarranty ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(issue.issueDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    {issue.estimatedCost && (
                      <Typography variant="body2" color="primary.main" fontWeight="medium">
                        Tahmini: {issue.estimatedCost} TL
                      </Typography>
                    )}
                    {issue.actualCost && (
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        Gerçek: {issue.actualCost} TL
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {!loading && filteredIssues.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: "center", p: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Arama kriterlerinize uygun arıza bulunamadı
          </Typography>
        </Card>
      )}

      {/* Create Issue Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
          Yeni Arıza Kaydı
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} key="create-source">
              <FormControl fullWidth required>
                <InputLabel>Kaynak *</InputLabel>
                <Select 
                  label="Kaynak *"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Öncelik *</InputLabel>
                <Select 
                  label="Öncelik *"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="LOW">Düşük</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Müşteri</InputLabel>
                <Select 
                  label="Müşteri"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Arıza Kategorisi</InputLabel>
                <Select 
                  label="Arıza Kategorisi"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Müşteri Açıklaması *"
                multiline
                rows={3}
                placeholder="Arıza detaylarını açıklayın..."
                value={formData.customerDescription}
                onChange={(e) => setFormData({ ...formData, customerDescription: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teknisyen Açıklaması"
                multiline
                rows={2}
                placeholder="Teknisyen notları..."
                value={formData.technicianDescription}
                onChange={(e) => setFormData({ ...formData, technicianDescription: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Garanti Durumu</InputLabel>
                <Select 
                  label="Garanti Durumu"
                  value={formData.isUnderWarranty ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isUnderWarranty: e.target.value === 'true' })}
                >
                  <MenuItem value="true">Garanti Kapsamında</MenuItem>
                  <MenuItem value="false">Garanti Dışı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tahmini Maliyet (TL)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenCreateDialog(false)} color="inherit">
            İptal
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveCreate}
            sx={{ borderRadius: 2 }}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
          Arıza Düzenle - {selectedIssue?.issueNumber}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select 
                  label="Durum"
                  value={selectedIssue?.status || ''}
                  onChange={(e) => {
                    if (selectedIssue) {
                      handleUpdateStatus(selectedIssue.id, e.target.value);
                    }
                  }}
                >
                  <MenuItem value="OPEN">Açık</MenuItem>
                  <MenuItem value="IN_PROGRESS">İşlemde</MenuItem>
                  <MenuItem value="REPAIRED">Tamir Edildi</MenuItem>
                  <MenuItem value="CLOSED">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kaynak</InputLabel>
                <Select 
                  label="Kaynak"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select 
                  label="Öncelik"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="LOW">Düşük</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Müşteri</InputLabel>
                <Select 
                  label="Müşteri"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Müşteri Açıklaması"
                multiline
                rows={3}
                value={formData.customerDescription}
                onChange={(e) => setFormData({ ...formData, customerDescription: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teknisyen Açıklaması"
                multiline
                rows={3}
                value={formData.technicianDescription}
                onChange={(e) => setFormData({ ...formData, technicianDescription: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tahmini Maliyet (TL)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gerçek Maliyet (TL)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenEditDialog(false)} color="inherit">
            İptal
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveEdit}
            sx={{ borderRadius: 2 }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Issue Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
          Arıza Detayları - {selectedIssue?.issueNumber}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedIssue && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Arıza Numarası" 
                      secondary={selectedIssue.issueNumber} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Müşteri" 
                      secondary={selectedIssue.company?.name || "Belirtilmemiş"} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <BuildIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Kaynak" 
                      secondary={getSourceLabel(selectedIssue.source)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Arıza Tarihi" 
                      secondary={new Date(selectedIssue.issueDate).toLocaleDateString('tr-TR')} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Chip 
                        label={getStatusLabel(selectedIssue.status)} 
                        color={getStatusColor(selectedIssue.status) as any}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Durum" 
                      secondary={getStatusLabel(selectedIssue.status)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Chip 
                        label={getPriorityLabel(selectedIssue.priority)} 
                        color={getPriorityColor(selectedIssue.priority) as any}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Öncelik" 
                      secondary={getPriorityLabel(selectedIssue.priority)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tahmini Maliyet" 
                      secondary={selectedIssue.estimatedCost ? `${selectedIssue.estimatedCost} TL` : "Belirtilmemiş"} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Gerçek Maliyet" 
                      secondary={selectedIssue.actualCost ? `${selectedIssue.actualCost} TL` : "Belirtilmemiş"} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Oluşturan" 
                      secondary={selectedIssue.reportedByUser ? `${selectedIssue.reportedByUser.firstName} ${selectedIssue.reportedByUser.lastName}` : "Belirtilmemiş"} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Müşteri Açıklaması
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedIssue.customerDescription || "Açıklama yok"}
                </Typography>
                
                {selectedIssue.technicianDescription && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Teknisyen Açıklaması
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedIssue.technicianDescription}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenViewDialog(false)} color="inherit">
            Kapat
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              if (selectedIssue) {
                handleEditIssue(selectedIssue);
              }
            }}
            sx={{ borderRadius: 2 }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
          <ErrorIcon color="error" />
          Arıza Silme Onayı
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1">
            <strong>{selectedIssue?.issueNumber}</strong> numaralı arıza kaydını silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            İptal
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: 2 }}
          >
            Sil
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
  );
}