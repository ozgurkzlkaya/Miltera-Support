"use client";

import { useState } from 'react';
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
  ListItemIcon
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

// Mock data interface
interface Issue {
  id: string;
  issueNumber: string;
  source: 'CUSTOMER' | 'TSP' | 'FIRST_PRODUCTION';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER_APPROVAL' | 'REPAIRED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty: boolean;
  estimatedCost?: number;
  actualCost?: number;
  issueDate: string;
  preInspectionDate?: string;
  repairDate?: string;
  company?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Mock data
const initialMockIssues: Issue[] = [
  {
    id: '1',
    issueNumber: '250117-01',
    source: 'CUSTOMER',
    status: 'OPEN',
    priority: 'HIGH',
    customerDescription: 'Cihaz çalışmıyor, güç gelmiyor',
    isUnderWarranty: true,
    estimatedCost: 500,
    issueDate: '2025-01-17',
    company: { id: '1', name: 'ABC Şirketi' },
    category: { id: '1', name: 'Donanım Arızası' },
    createdByUser: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' }
  },
  {
    id: '2',
    issueNumber: '250117-02',
    source: 'TSP',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    customerDescription: 'Ekran görüntüsü bozuk',
    technicianDescription: 'Ekran sürücü problemi tespit edildi',
    isUnderWarranty: false,
    estimatedCost: 1200,
    actualCost: 1100,
    issueDate: '2025-01-16',
    company: { id: '2', name: 'XYZ Ltd.' },
    category: { id: '2', name: 'Yazılım Sorunu' },
    createdByUser: { id: '2', firstName: 'Mehmet', lastName: 'Demir' }
  },
  {
    id: '3',
    issueNumber: '250117-03',
    source: 'FIRST_PRODUCTION',
    status: 'REPAIRED',
    priority: 'CRITICAL',
    customerDescription: 'İlk test sırasında hata',
    technicianDescription: 'Test hatası düzeltildi',
    isUnderWarranty: true,
    estimatedCost: 800,
    actualCost: 750,
    issueDate: '2025-01-15',
    company: { id: '3', name: 'Tech Solutions' },
    category: { id: '3', name: 'Test Hatası' },
    createdByUser: { id: '3', firstName: 'Ayşe', lastName: 'Kaya' }
  },
  {
    id: '4',
    issueNumber: '250117-04',
    source: 'CUSTOMER',
    status: 'CLOSED',
    priority: 'LOW',
    customerDescription: 'Küçük yazılım güncellemesi',
    technicianDescription: 'Yazılım güncellendi',
    isUnderWarranty: true,
    estimatedCost: 200,
    actualCost: 0,
    issueDate: '2025-01-14',
    company: { id: '4', name: 'Modern Corp' },
    category: { id: '2', name: 'Yazılım Sorunu' },
    createdByUser: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' }
  }
];

// Mock companies and categories
const mockCompanies = [
  { id: '1', name: 'ABC Şirketi' },
  { id: '2', name: 'XYZ Ltd.' },
  { id: '3', name: 'Tech Solutions' },
  { id: '4', name: 'Modern Corp' },
  { id: '5', name: 'Digital Systems' },
  { id: '6', name: 'Innovation Tech' }
];

const mockCategories = [
  { id: '1', name: 'Donanım Arızası' },
  { id: '2', name: 'Yazılım Sorunu' },
  { id: '3', name: 'Test Hatası' },
  { id: '4', name: 'Kalite Kontrol' },
  { id: '5', name: 'Montaj Hatası' }
];

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
  const [issues, setIssues] = useState<Issue[]>(initialMockIssues);
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

  const handleConfirmDelete = () => {
    if (selectedIssue) {
      setIssues(prev => prev.filter(issue => issue.id !== selectedIssue.id));
      setSnackbar({
        open: true,
        message: `Arıza ${selectedIssue.issueNumber} başarıyla silindi`,
        severity: 'success'
      });
      setOpenDeleteDialog(false);
      setSelectedIssue(null);
    }
  };

  const handleSaveCreate = () => {
    if (!formData.source || !formData.priority || !formData.customerDescription) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    const newIssue: Issue = {
      id: Date.now().toString(),
      issueNumber: generateIssueNumber(),
      source: formData.source as any,
      status: 'OPEN',
      priority: formData.priority as any,
      customerDescription: formData.customerDescription,
      technicianDescription: formData.technicianDescription,
      isUnderWarranty: formData.isUnderWarranty,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      issueDate: new Date().toISOString().split('T')[0],
      company: mockCompanies.find(c => c.id === formData.companyId),
      category: mockCategories.find(c => c.id === formData.categoryId),
      createdByUser: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' }
    };

    setIssues(prev => [newIssue, ...prev]);
    setOpenCreateDialog(false);
    setSnackbar({
      open: true,
      message: `Yeni arıza ${newIssue.issueNumber} başarıyla oluşturuldu`,
      severity: 'success'
    });
  };

  const handleSaveEdit = () => {
    if (!selectedIssue) return;

    const updatedIssue: Issue = {
      ...selectedIssue,
      source: formData.source as any,
      priority: formData.priority as any,
      customerDescription: formData.customerDescription,
      technicianDescription: formData.technicianDescription,
      isUnderWarranty: formData.isUnderWarranty,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      company: mockCompanies.find(c => c.id === formData.companyId),
      category: mockCategories.find(c => c.id === formData.categoryId)
    };

    setIssues(prev => prev.map(issue => 
      issue.id === selectedIssue.id ? updatedIssue : issue
    ));
    setOpenEditDialog(false);
    setSelectedIssue(null);
    setSnackbar({
      open: true,
      message: `Arıza ${selectedIssue.issueNumber} başarıyla güncellendi`,
      severity: 'success'
    });
  };

  const handleUpdateStatus = (issueId: string, newStatus: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { 
        ...issue, 
        status: newStatus as any,
        repairDate: newStatus === 'REPAIRED' ? new Date().toISOString().split('T')[0] : issue.repairDate
      } : issue
    ));
    setSnackbar({
      open: true,
      message: 'Arıza durumu başarıyla güncellendi',
      severity: 'success'
    });
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} md={4}>
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
            
            <Grid item xs={12} md={2}>
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
            
            <Grid item xs={12} md={2}>
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
            
            <Grid item xs={12} md={2}>
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
            
            <Grid item xs={12} md={2}>
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
                  
                  {issue.estimatedCost && (
                    <Typography variant="body2" color="text.secondary">
                      {issue.estimatedCost} TL
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredIssues.length === 0 && (
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Yeni Arıza Kaydı
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
                  {mockCompanies.map(company => (
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
                  {mockCategories.map(category => (
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Arıza Düzenle - {selectedIssue?.issueNumber}
          </Typography>
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
                  {mockCompanies.map(company => (
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Arıza Detayları - {selectedIssue?.issueNumber}
          </Typography>
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
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Oluşturan" 
                      secondary={selectedIssue.createdByUser ? `${selectedIssue.createdByUser.firstName} ${selectedIssue.createdByUser.lastName}` : "Belirtilmemiş"} 
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ErrorIcon color="error" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Arıza Silme Onayı
          </Typography>
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