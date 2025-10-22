"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Toolbar
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DeleteSweep as DeleteSweepIcon,
  GetApp as GetAppIcon
} from "@mui/icons-material";

// Issue interface
interface Issue {
  id: string;
  issueNumber: string;
  productId?: string;
  productSerialNumber?: string;
  productModelName?: string;
  customerId?: string;
  issueTypeId?: string;
  source: 'CUSTOMER' | 'TSP' | 'FIRST_PRODUCTION';
  status: 'OPEN' | 'IN_PROGRESS' | 'REPAIRED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty?: boolean;
  estimatedCost?: number;
  actualCost?: number;
  issueDate: string;
  reportedAt?: string;
  company?: {
    id: string;
    name: string;
  };
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form state
  const [issueForm, setIssueForm] = useState({
    issueNumber: '',
    productId: '',
    customerId: '',
    issueTypeId: '',
    description: '',
    source: 'CUSTOMER',
    status: 'OPEN',
    priority: 'MEDIUM',
    isUnderWarranty: false,
    estimatedCost: 0,
    actualCost: 0,
    issueDate: new Date().toISOString().split('T')[0],
  });
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Selection states
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [issuesRes, companiesRes, categoriesRes, productsRes] = await Promise.all([
          fetch('http://localhost:3015/api/v1/issues', { headers }),
          fetch('http://localhost:3015/api/v1/companies', { headers }),
          fetch('http://localhost:3015/api/v1/categories', { headers }),
          fetch('http://localhost:3015/api/v1/products', { headers }),
        ]);

        if (issuesRes.ok) {
          const data = await issuesRes.json();
          setIssues(data.data || []);
        } else {
          console.error('Failed to load issues:', await issuesRes.text());
          setIssues([]);
        }

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data.data || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data || []);
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Veriler yüklenirken hata oluştu');
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getIssueStats = () => {
    return {
      open: issues.filter(i => i.status === 'OPEN').length,
      inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
      repaired: issues.filter(i => i.status === 'REPAIRED').length,
      closed: issues.filter(i => i.status === 'CLOSED').length,
    };
  };

  const stats = getIssueStats();

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !searchTerm ||
      issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.customerDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.company?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || issue.status === (statusFilter as any);
    const matchesSource = !sourceFilter || issue.source === (sourceFilter as any);
    const matchesPriority = !priorityFilter || issue.priority === (priorityFilter as any);

    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setIssueForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (name: string, value: unknown) => {
    setIssueForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateIssue = () => {
    setIssueForm({
      issueNumber: '',
      productId: '',
      customerId: '',
      issueTypeId: '',
      description: '',
      source: 'CUSTOMER',
      status: 'OPEN',
      priority: 'MEDIUM',
      isUnderWarranty: false,
      estimatedCost: 0,
      actualCost: 0,
      issueDate: new Date().toISOString().split('T')[0],
    });
    setOpenCreateDialog(true);
  };

  const generateIssueNumber = async () => {
    const today = new Date();
    const year = today.getFullYear().toString().substring(2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const token = localStorage.getItem('auth_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:3015/api/v1/issues?issueNumberPrefix=${year}${month}${day}`, { headers });
    const data = await res.json();
    const existingCount = (data.data || []).filter((issue: Issue) =>
      issue.issueNumber.startsWith(`${year}${month}${day}`)
    ).length;

    return `${year}${month}${day}-${(existingCount + 1).toString().padStart(2, '0')}`;
  };

  const handleSubmitCreate = async () => {
    try {
      setError(null);
      const newIssueNumber = await generateIssueNumber();
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        productId: issueForm.productId || null,
        companyId: issueForm.customerId || null, // API companyId bekliyor
        title: 'Arıza Kaydı', // Zorunlu alan
        description: issueForm.description || '',
        customerDescription: issueForm.description || '',
        priority: issueForm.priority,
        source: issueForm.source,
        estimatedCost: Number(issueForm.estimatedCost) || null,
        actualCost: Number(issueForm.actualCost) || null,
        reportedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
      };

      const response = await fetch('http://localhost:3015/api/v1/issues', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newIssue = await response.json();
        setIssues((prev) => [...prev, newIssue.data]);
        setOpenCreateDialog(false);
        setSnackbar({
          open: true,
          message: `Yeni arıza başarıyla oluşturuldu: ${newIssue.data.issueNumber}`,
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Arıza oluşturulamadı');
      }
    } catch (err: any) {
      console.error('Error creating issue:', err);
      setError(err.message || 'Arıza kaydedilirken hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Arıza kaydedilirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleViewIssue = (issue: Issue) => {
    try {
      console.log('Viewing issue:', issue);
    setSelectedIssue(issue);
      setOpenViewDialog(true);
    } catch (error) {
      console.error('Error in handleViewIssue:', error);
      setError('Arıza detayları açılırken hata oluştu');
    }
  };

  const handleEditIssue = (issue: Issue) => {
    try {
      console.log('Editing issue:', issue);
      console.log('Issue productId:', issue.productId);
      console.log('Available products:', products.map(p => ({ id: p.id, serialNumber: p.serialNumber, model: p.productModel?.name })));
      
      setEditingIssue(issue);
      setIssueForm({
        issueNumber: issue.issueNumber,
        productId: issue.productId || '',
        customerId: issue.customerId || '',
        issueTypeId: issue.issueTypeId || '',
        description: issue.customerDescription || '',
      source: issue.source,
        status: issue.status,
      priority: issue.priority,
        isUnderWarranty: issue.isUnderWarranty || false,
        estimatedCost: issue.estimatedCost || 0,
        actualCost: issue.actualCost || 0,
        issueDate: issue.issueDate ? issue.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setOpenEditDialog(true);
    } catch (error) {
      console.error('Error in handleEditIssue:', error);
      setError('Arıza düzenleme formu açılırken hata oluştu');
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingIssue) return;
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        status: issueForm.status,
        priority: issueForm.priority,
        source: issueForm.source,
        description: issueForm.description,
        customerDescription: issueForm.description, // customerDescription'ı description ile aynı yap
        estimatedCost: issueForm.estimatedCost ? issueForm.estimatedCost.toString() : null,
        actualCost: issueForm.actualCost ? issueForm.actualCost.toString() : null,
        // companyId'yi göndermiyoruz çünkü database hatası veriyor
      };

      const response = await fetch(`http://localhost:3015/api/v1/issues/${editingIssue.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map((issue) => (issue.id === editingIssue.id ? updatedIssue.data : issue)));
        setOpenEditDialog(false);
      setSnackbar({
        open: true,
          message: `Arıza başarıyla güncellendi: ${updatedIssue.data.issueNumber}`,
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Arıza güncellenemedi');
      }
    } catch (err: any) {
      console.error('Error updating issue:', err);
      setError(err.message || 'Arıza güncellenirken hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Arıza güncellenirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleDeleteIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIssue) return;
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/issues/${selectedIssue.id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setIssues((prev) => prev.filter((issue) => issue.id !== selectedIssue.id));
        setOpenDeleteDialog(false);
    setSnackbar({
      open: true,
          message: `Arıza başarıyla silindi: ${selectedIssue.issueNumber}`,
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Arıza silinemedi');
      }
    } catch (err: any) {
      console.error('Error deleting issue:', err);
      setError(err.message || 'Arıza silinirken hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Arıza silinirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/issues/${issueId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: newStatus,
          resolvedAt: newStatus === 'CLOSED' ? new Date().toISOString() : undefined,
          updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
        }),
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map((issue) => {
          if (issue.id === issueId) {
            // Mevcut issue bilgilerini koru, sadece güncellenen alanları değiştir
            return {
              ...issue,
              ...updatedIssue.data,
              // Müşteri bilgisini koru
              company: issue.company || updatedIssue.data.company
            };
          }
          return issue;
        }));
    setSnackbar({
      open: true,
          message: `Arıza durumu başarıyla güncellendi: ${updatedIssue.data.issueNumber}`,
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Durum güncellenemedi');
      }
    } catch (err: any) {
      console.error('Durum güncelleme hatası:', err);
      setError(err.message || 'Durum güncellenirken hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Durum güncellenirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleUpdatePriority = async (issueId: string, newPriority: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/issues/${issueId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          priority: newPriority,
          updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
        }),
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map((issue) => {
          if (issue.id === issueId) {
            // Mevcut issue bilgilerini koru, sadece güncellenen alanları değiştir
            return {
        ...issue, 
              ...updatedIssue.data,
              // Müşteri bilgisini koru
              company: issue.company || updatedIssue.data.company
            };
          }
          return issue;
        }));
    setSnackbar({
      open: true,
          message: `Arıza önceliği başarıyla güncellendi: ${updatedIssue.data.issueNumber}`,
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Öncelik güncellenemedi');
      }
    } catch (err: any) {
      console.error('Öncelik güncelleme hatası:', err);
      setError(err.message || 'Öncelik güncellenirken hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Öncelik güncellenirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleSelectIssue = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(filteredIssues.map(issue => issue.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.length === 0) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Delete each selected issue and check responses
      const deletePromises = selectedIssues.map(async (issueId) => {
        const response = await fetch(`http://localhost:3015/api/v1/issues/${issueId}`, {
          method: 'DELETE',
          headers,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Issue ${issueId} silinemedi: ${errorData.error?.message || errorData.message || 'Bilinmeyen hata'}`);
        }
        
        return { issueId, success: true };
      });

      const results = await Promise.allSettled(deletePromises);
      
      // Check which deletions were successful
      const successfulDeletions = results
        .filter((result): result is PromiseFulfilledResult<{ issueId: string; success: boolean }> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.issueId);
      
      const failedDeletions = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      // Only remove successfully deleted issues from state
      if (successfulDeletions.length > 0) {
        setIssues(prev => prev.filter(issue => !successfulDeletions.includes(issue.id)));
        setSelectedIssues([]);
        setSelectAll(false);
      }
      
      // Show appropriate message
      if (failedDeletions.length === 0) {
        setSnackbar({
          open: true,
          message: `${successfulDeletions.length} arıza başarıyla silindi`,
          severity: 'success',
        });
      } else if (successfulDeletions.length === 0) {
        setSnackbar({
          open: true,
          message: `Hiçbir arıza silinemedi: ${failedDeletions[0]}`,
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: `${successfulDeletions.length} arıza silindi, ${failedDeletions.length} arıza silinemedi`,
          severity: 'warning',
        });
      }
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      setError(err.message || 'Toplu silme işleminde hata oluştu');
      setSnackbar({
        open: true,
        message: err.message || 'Toplu silme işleminde hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleExport = () => {
    try {
      // CSV formatında veri hazırla
      const csvData = [
        ['Arıza No', 'Ürün Seri No', 'Müşteri', 'Durum', 'Öncelik', 'Kaynak', 'Garanti', 'Tahmini Maliyet', 'Gerçek Maliyet', 'Arıza Tarihi'],
        ...filteredIssues.map(issue => [
          issue.issueNumber,
          issue.productSerialNumber || 'N/A',
          issue.company?.name || 'N/A',
          issue.status,
          issue.priority,
          issue.source,
          issue.isUnderWarranty ? 'Evet' : 'Hayır',
          issue.estimatedCost?.toString() || 'N/A',
          issue.actualCost?.toString() || 'N/A',
          new Date(issue.issueDate).toLocaleDateString('tr-TR')
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
      link.setAttribute('download', `ariza-raporu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: 'Arıza raporu başarıyla dışa aktarıldı',
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Arıza Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<GetAppIcon />} onClick={handleExport}>
            DIŞA AKTAR
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateIssue}>
            Yeni Arıza Ekle
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="info.main">
                    {stats.open}
                  </Typography>
          <Typography variant="body2">Açık</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="warning.main">
                    {stats.inProgress}
                  </Typography>
          <Typography variant="body2">Devam Eden</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main">
                    {stats.repaired}
                  </Typography>
          <Typography variant="body2">Tamir Edildi</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
                    {stats.closed}
                  </Typography>
          <Typography variant="body2">Kapatıldı</Typography>
        </Paper>
                </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
            label="Arama"
                  variant="outlined"
                  size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="OPEN">Açık</MenuItem>
              <MenuItem value="IN_PROGRESS">Devam Eden</MenuItem>
                  <MenuItem value="REPAIRED">Tamir Edildi</MenuItem>
              <MenuItem value="CLOSED">Kapatıldı</MenuItem>
                </Select>
              </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Öncelik"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="LOW">Düşük</MenuItem>
              <MenuItem value="MEDIUM">Orta</MenuItem>
              <MenuItem value="HIGH">Yüksek</MenuItem>
              <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
        </Box>
      </Paper>

      {/* Issues Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          {selectedIssues.length > 0 && (
            <Toolbar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
                {selectedIssues.length} arıza seçildi
              </Typography>
              <Button
                color="inherit"
                startIcon={<DeleteSweepIcon />}
                onClick={handleBulkDelete}
                sx={{ ml: 2 }}
              >
                Toplu Sil
              </Button>
            </Toolbar>
          )}
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedIssues.length > 0 && selectedIssues.length < filteredIssues.length}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Arıza No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Öncelik</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kaynak</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Aksiyonlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {issues.length === 0 ? 'Henüz arıza bulunmamaktadır.' : 'Filtre kriterlerine uygun arıza bulunamadı.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} hover selected={selectedIssues.includes(issue.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIssues.includes(issue.id)}
                        onChange={() => handleSelectIssue(issue.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {issue.issueNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {issue.customerDescription || 'Açıklama yok'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {issue.company?.name || 'N/A'}
                  </Typography>
                    </TableCell>
                    <TableCell>
                    <Chip 
                        label={issue.status}
                        color={
                          issue.status === 'OPEN' ? 'info' :
                          issue.status === 'IN_PROGRESS' ? 'warning' :
                          issue.status === 'REPAIRED' ? 'success' : 'default'
                        }
                      size="small"
                        clickable
                      onClick={() => {
                        const statuses = ['OPEN', 'IN_PROGRESS', 'REPAIRED', 'CLOSED'];
                        const currentIndex = statuses.indexOf(issue.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        handleUpdateStatus(issue.id, nextStatus);
                      }}
                        title="Durumu güncellemek için tıklayın"
                    />
                    </TableCell>
                    <TableCell>
                    <Chip 
                        label={issue.priority}
                        color={
                          issue.priority === 'CRITICAL' ? 'error' :
                          issue.priority === 'HIGH' ? 'warning' :
                          issue.priority === 'MEDIUM' ? 'info' : 'default'
                        }
                      size="small"
                        clickable
                        onClick={() => {
                          const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                          const currentIndex = priorities.indexOf(issue.priority);
                          const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                          handleUpdatePriority(issue.id, nextPriority);
                        }}
                        title="Önceliği güncellemek için tıklayın"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {issue.source === 'CUSTOMER' ? 'Müşteri' :
                         issue.source === 'TSP' ? 'TSP' : 'İlk Üretim'}
                  </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(issue.reportedAt || issue.issueDate).toLocaleDateString('tr-TR')}
                    </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewIssue(issue)} title="Görüntüle">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditIssue(issue)} title="Düzenle">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteIssue(issue)} title="Sil">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Issue Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Arıza Ekle</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kaynak</InputLabel>
                <Select 
                  label="Kaynak"
                  value={issueForm.source}
                  onChange={(e) => handleSelectChange('source', e.target.value)}
                >
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select 
                  label="Öncelik"
                  value={issueForm.priority}
                  onChange={(e) => handleSelectChange('priority', e.target.value)}
                >
                  <MenuItem value="LOW">Düşük</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ürün</InputLabel>
                <Select 
                  label="Ürün"
                  value={issueForm.productId}
                  onChange={(e) => handleSelectChange('productId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ürün Seçin</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.serialNumber || 'Seri No Yok'} - {product.productModel?.name || product.productModelName || 'Model'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Müşteri</InputLabel>
                <Select 
                  label="Müşteri"
                  value={issueForm.customerId}
                  onChange={(e) => handleSelectChange('customerId', e.target.value)}
                >
                  {companies.map((company) => (
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
                label="Açıklama"
                multiline
                rows={3}
                value={issueForm.description}
                onChange={handleInputChange}
                name="description"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tahmini Maliyet"
                type="number"
                value={issueForm.estimatedCost}
                onChange={handleInputChange}
                name="estimatedCost"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Arıza Tarihi"
                type="date"
                value={issueForm.issueDate}
                onChange={handleInputChange}
                name="issueDate"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSubmitCreate}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Arıza Düzenle</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kaynak</InputLabel>
                <Select 
                  label="Kaynak"
                  value={issueForm.source}
                  onChange={(e) => handleSelectChange('source', e.target.value)}
                >
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select 
                  label="Durum"
                  value={issueForm.status}
                  onChange={(e) => handleSelectChange('status', e.target.value)}
                >
                  <MenuItem value="OPEN">Açık</MenuItem>
                  <MenuItem value="IN_PROGRESS">Devam Eden</MenuItem>
                  <MenuItem value="REPAIRED">Tamir Edildi</MenuItem>
                  <MenuItem value="CLOSED">Kapatıldı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select 
                  label="Öncelik"
                  value={issueForm.priority}
                  onChange={(e) => handleSelectChange('priority', e.target.value)}
                >
                  <MenuItem value="LOW">Düşük</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ürün</InputLabel>
                <Select 
                  label="Ürün"
                  value={issueForm.productId}
                  onChange={(e) => handleSelectChange('productId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ürün Seçin</em>
                  </MenuItem>
                  {editingIssue?.productId && (
                    <MenuItem value={editingIssue.productId}>
                      {editingIssue.productSerialNumber || 'Seri No Yok'} - {editingIssue.productModelName || 'Model'} (Mevcut)
                    </MenuItem>
                  )}
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.serialNumber || 'Seri No Yok'} - {product.productModel?.name || product.productModelName || 'Model'}
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
                value={issueForm.description}
                onChange={handleInputChange}
                name="description"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tahmini Maliyet"
                type="number"
                value={issueForm.estimatedCost}
                onChange={handleInputChange}
                name="estimatedCost"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gerçek Maliyet"
                type="number"
                value={issueForm.actualCost}
                onChange={handleInputChange}
                name="actualCost"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* View Issue Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Arıza Detayları</DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Arıza Numarası:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedIssue.issueNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Durum:</Typography>
                      <Chip 
                  label={selectedIssue.status}
                  color={
                    selectedIssue.status === 'OPEN' ? 'info' :
                    selectedIssue.status === 'IN_PROGRESS' ? 'warning' :
                    selectedIssue.status === 'REPAIRED' ? 'success' : 'default'
                  }
                        size="small"
                      />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Öncelik:</Typography>
                      <Chip 
                  label={selectedIssue.priority}
                  color={
                    selectedIssue.priority === 'CRITICAL' ? 'error' :
                    selectedIssue.priority === 'HIGH' ? 'warning' :
                    selectedIssue.priority === 'MEDIUM' ? 'info' : 'default'
                  }
                        size="small"
                      />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Kaynak:</Typography>
                <Typography variant="body1">
                  {selectedIssue.source === 'CUSTOMER' ? 'Müşteri' :
                   selectedIssue.source === 'TSP' ? 'TSP' : 'İlk Üretim'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Açıklama:</Typography>
                <Typography variant="body1">{selectedIssue.customerDescription || 'Açıklama yok'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Müşteri:</Typography>
                <Typography variant="body1">{selectedIssue.company?.name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Tarih:</Typography>
                <Typography variant="body1">
                  {new Date(selectedIssue.reportedAt || selectedIssue.issueDate).toLocaleDateString('tr-TR')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Tahmini Maliyet:</Typography>
                <Typography variant="body1">{selectedIssue.estimatedCost || 'Belirtilmemiş'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Gerçek Maliyet:</Typography>
                <Typography variant="body1">{selectedIssue.actualCost || 'Belirtilmemiş'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          {selectedIssue && (
            <Button variant="contained" onClick={() => {
              setOpenViewDialog(false);
              // Ensure selectedIssue has all required properties
              const issueToEdit: Issue = {
                ...selectedIssue,
                issueDate: selectedIssue.issueDate || selectedIssue.reportedAt || new Date().toISOString(),
                isUnderWarranty: selectedIssue.isUnderWarranty || false,
              };
              handleEditIssue(issueToEdit);
            }}>
            Düzenle
          </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Arıza Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedIssue?.issueNumber}" numaralı arızayı silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
