'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Menu,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';
import ExportImportDialog from '../../../components/ExportImportDialog';

interface Product {
  id: string;
  serialNumber: string | null;
  status: string;
  productionDate: string;
  warrantyStatus: string;
  productModel: {
    id: string;
    name: string;
  };
  productType: {
    id: string;
    name: string;
  };
  manufacturer: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  } | null;
  owner: {
    id: string;
    name: string;
  } | null;
}

interface ProductFilter {
  status?: string;
  search?: string;
  manufacturer?: string;
  productModel?: string;
  location?: string;
  warrantyStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'FIRST_PRODUCTION':
      return 'default';
    case 'FIRST_PRODUCTION_ISSUE':
      return 'error';
    case 'FIRST_PRODUCTION_SCRAPPED':
      return 'error';
    case 'READY_FOR_SHIPMENT':
      return 'success';
    case 'SHIPPED':
      return 'info';
    case 'ISSUE_CREATED':
      return 'warning';
    case 'RECEIVED':
      return 'warning';
    case 'PRE_TEST_COMPLETED':
      return 'info';
    case 'UNDER_REPAIR':
      return 'warning';
    case 'SERVICE_SCRAPPED':
      return 'error';
    case 'DELIVERED':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'FIRST_PRODUCTION':
      return 'İlk Üretim';
    case 'FIRST_PRODUCTION_ISSUE':
      return 'İlk Üretim Arıza';
    case 'FIRST_PRODUCTION_SCRAPPED':
      return 'İlk Üretim Hurda';
    case 'READY_FOR_SHIPMENT':
      return 'Sevkiyat Hazır';
    case 'SHIPPED':
      return 'Sevk Edildi';
    case 'ISSUE_CREATED':
      return 'Arıza Kaydı Oluşturuldu';
    case 'RECEIVED':
      return 'Cihaz Teslim Alındı';
    case 'PRE_TEST_COMPLETED':
      return 'Servis Ön Testi Yapıldı';
    case 'UNDER_REPAIR':
      return 'Cihaz Tamir Edilmekte';
    case 'SERVICE_SCRAPPED':
      return 'Servis Hurda';
    case 'DELIVERED':
      return 'Teslim Edildi';
    default:
      return status;
  }
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openHardwareDialog, setOpenHardwareDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hardwareForm, setHardwareForm] = useState({
    serialNumber: '',
    warrantyStartDate: '',
    warrantyDuration: 12
  });

  // NEW: create form state and options
  const [createForm, setCreateForm] = useState({
    productModelId: '',
    quantity: 1,
    productionDate: '',
    locationId: '',
  });
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  // Location quick-change menu state
  const [locationMenuAnchor, setLocationMenuAnchor] = useState<null | HTMLElement>(null);
  const [locationMenuProductId, setLocationMenuProductId] = useState<string | null>(null);

  // Advanced filtering state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ProductFilter>({
    status: '',
    search: '',
    manufacturer: '',
    productModel: '',
    location: '',
    warrantyStatus: '',
    sortBy: 'serialNumber',
    sortOrder: 'asc'
  });
  const [manufacturers, setManufacturers] = useState<Array<{ id: string; name: string }>>([]);
  const [productModels, setProductModels] = useState<Array<{ id: string; name: string }>>([]);

  // Export/Import state
  const [openExportImportDialog, setOpenExportImportDialog] = useState(false);

  // Load options from API
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // product models
        try {
          const res = await fetch('http://localhost:3015/api/v1/product-models', { headers });
          if (res.ok) {
            const data = await res.json();
            setModels((data?.data ?? []).map((m: any) => ({ id: m.id, name: m.name })));
          }
        } catch {}

        // locations
        try {
          const res = await fetch('http://localhost:3015/api/v1/locations', { headers });
          if (res.ok) {
            const data = await res.json();
            setLocations((data?.data ?? []).map((l: any) => ({ id: l.id, name: l.name })));
          }
        } catch {}
      } catch {}
    };
    loadOptions();
  }, []);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('http://localhost:3015/api/v1/products', {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(data.data || []);
        } else {
          console.error('Failed to load products:', await res.text());
          // API başarısız olduğunda boş veri
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
      setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load manufacturers and product models for filtering
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Load manufacturers
        try {
          const res = await fetch('http://localhost:3015/api/v1/companies?isManufacturer=true', { headers });
          if (res.ok) {
            const data = await res.json();
            setManufacturers((data?.data ?? []).map((m: any) => ({ id: m.id, name: m.name })));
          }
        } catch {}

        // Load product models
        try {
          const res = await fetch('http://localhost:3015/api/v1/product-models', { headers });
          if (res.ok) {
            const data = await res.json();
            setProductModels((data?.data ?? []).map((m: any) => ({ id: m.id, name: m.name })));
          }
        } catch {}
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Advanced filtering and sorting logic with useMemo for performance
  const filteredAndSortedProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !advancedFilters.search || 
        product.serialNumber?.toLowerCase().includes(advancedFilters.search.toLowerCase()) ||
        product.productModel.name.toLowerCase().includes(advancedFilters.search.toLowerCase()) ||
        product.manufacturer.name.toLowerCase().includes(advancedFilters.search.toLowerCase());
      
      const matchesStatus = !advancedFilters.status || product.status === advancedFilters.status;
      const matchesManufacturer = !advancedFilters.manufacturer || product.manufacturer.id === advancedFilters.manufacturer;
      const matchesProductModel = !advancedFilters.productModel || product.productModel.id === advancedFilters.productModel;
      const matchesLocation = !advancedFilters.location || product.location?.id === advancedFilters.location;
      const matchesWarrantyStatus = !advancedFilters.warrantyStatus || product.warrantyStatus === advancedFilters.warrantyStatus;

      return matchesSearch && matchesStatus && matchesManufacturer && matchesProductModel && matchesLocation && matchesWarrantyStatus;
    }).sort((a, b) => {
      if (!advancedFilters.sortBy) return 0;
      
      let aValue: any = a[advancedFilters.sortBy as keyof Product];
      let bValue: any = b[advancedFilters.sortBy as keyof Product];
      
      // Handle nested objects
      if (advancedFilters.sortBy === 'manufacturer') {
        aValue = a.manufacturer.name;
        bValue = b.manufacturer.name;
      } else if (advancedFilters.sortBy === 'productModel') {
        aValue = a.productModel.name;
        bValue = b.productModel.name;
      } else if (advancedFilters.sortBy === 'location') {
        aValue = a.location?.name || '';
        bValue = b.location?.name || '';
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return advancedFilters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return advancedFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, advancedFilters]);

  const handleCreateProduct = () => {
    setOpenCreateDialog(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
  };

  // Advanced filtering handlers with useCallback for performance
  const handleFilterChange = useCallback((field: keyof ProductFilter, value: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setAdvancedFilters({
      status: '',
      search: '',
      manufacturer: '',
      productModel: '',
      location: '',
      warrantyStatus: '',
      sortBy: 'serialNumber',
      sortOrder: 'asc'
    });
  }, []);

  const handleSortChange = useCallback((field: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Export/Import handlers
  const handleExport = useCallback(async (format: string, filters?: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await fetch(`http://localhost:3015/api/v1/products/export?${queryParams.toString()}`, {
        headers,
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_export.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export işlemi başarısız');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }, []);

  const handleImport = useCallback(async (file: File, format: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);

      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/products/import', {
        method: 'POST',
        headers,
        body: formData
      });

      if (response.ok) {
        // Reload products after successful import
        const refreshRes = await fetch('http://localhost:3015/api/v1/products', { headers });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setProducts(data.data || []);
        }
      } else {
        throw new Error('Import işlemi başarısız');
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }, []);

  // Status update handler for interactive status chips
  const handleStatusUpdate = async (productId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Define status progression
      const statusProgression = [
        'FIRST_PRODUCTION',
        'READY_FOR_SHIPMENT', 
        'SHIPPED',
        'DELIVERED'
      ];

      const currentIndex = statusProgression.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % statusProgression.length;
      const newStatus = statusProgression[nextIndex];

      const payload = {
        status: newStatus,
        updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Admin user ID
      };

      const res = await fetch(`http://localhost:3015/api/v1/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Update the product in the local state
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
        setSnackbarMessage(`Ürün durumu "${getStatusLabel(newStatus)}" olarak güncellendi`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        console.log(`Product ${productId} status updated to ${newStatus}`);
      } else {
        const errorText = await res.text();
        console.error('Failed to update product status:', errorText);
        setSnackbarMessage('Ürün durumu güncellenirken hata oluştu');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      setSnackbarMessage('Ürün durumu güncellenirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // NEW: save handler
  const handleSubmitCreate = async () => {
    try {
      if (!createForm.productModelId || !createForm.productionDate) {
        setError('Lütfen zorunlu alanları doldurun');
        return;
      }
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        productModelId: createForm.productModelId,
        quantity: Number(createForm.quantity) || 1,
        // Force yyyy-MM-dd format which backend accepts and can be parsed reliably
        productionDate: (createForm.productionDate || '').slice(0, 10),
        locationId: createForm.locationId || undefined,
        createdBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
      };

      const res = await fetch('http://localhost:3015/api/v1/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Product creation error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Ürün oluşturulamadı');
      }

      // Refresh the product list
      setOpenCreateDialog(false);
      setCreateForm({ productModelId: '', quantity: 1, productionDate: '', locationId: '' });
      setError(null);
      
      // Reload products from API
      const refreshToken = localStorage.getItem('auth_token');
      const refreshHeaders: any = {};
      if (refreshToken) refreshHeaders['Authorization'] = `Bearer ${refreshToken}`;

      const refreshRes = await fetch('http://localhost:3015/api/v1/products', {
        headers: refreshHeaders,
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProducts(refreshData.data || []);
      } else {
        console.error('Failed to refresh products:', await refreshRes.text());
      }
    } catch (e: any) {
      setError(e?.message || 'Ürün kaydedilirken hata oluştu');
    }
  };

  // Delete handler
  const handleDeleteProduct = async (productId: string) => {
    try {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Bu ürünü silmek istediğinize emin misiniz?') : true;
      if (!confirmed) return;

      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:3015/api/v1/products/delete/${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Product delete error:', errorText);
        setSnackbarMessage('Ürün silinirken hata oluştu');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSnackbarMessage('Ürün başarıyla silindi');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (e) {
      console.error('Error deleting product:', e);
      setSnackbarMessage('Ürün silinirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Open location selection menu
  const handleOpenLocationMenu = (productId: string, anchorEl: HTMLElement) => {
    setLocationMenuProductId(productId);
    setLocationMenuAnchor(anchorEl);
  };

  const handleCloseLocationMenu = () => {
    setLocationMenuAnchor(null);
    setLocationMenuProductId(null);
  };

  // Select new location and update backend
  const handleSelectLocation = async (locationId: string | null) => {
    if (!locationMenuProductId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload: any = {
        locationId: locationId || undefined,
      };

      const res = await fetch(`http://localhost:3015/api/v1/products/${locationMenuProductId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to update product location:', errorText);
        setSnackbarMessage('Konum güncellenemedi');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setProducts(prev => prev.map(p => p.id === locationMenuProductId ? {
          ...p,
          location: locationId ? { id: locationId, name: (locations.find(l => l.id === locationId)?.name || p.location?.name || '') } : null,
        } : p));
        setSnackbarMessage('Konum güncellendi');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (e) {
      console.error('Error updating product location:', e);
      setSnackbarMessage('Konum güncellenemedi');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      handleCloseLocationMenu();
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCreateForm({
      productModelId: product.productModel?.id || '',
      quantity: 1,
      productionDate: product.productionDate ? product.productionDate.split('T')[0] : '',
      locationId: product.location?.id || '',
    });
    setOpenEditDialog(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingProduct) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        productModelId: createForm.productModelId,
        productionDate: createForm.productionDate ? new Date(createForm.productionDate).toISOString() : undefined,
        locationId: createForm.locationId || undefined,
      };

      const res = await fetch(`http://localhost:3015/api/v1/products/${editingProduct.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Product update error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Ürün güncellenemedi');
      }

      setOpenEditDialog(false);
      setEditingProduct(null);
      setError(null);
      
      // Reload products from API
      const refreshRes = await fetch('http://localhost:3015/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProducts(refreshData.data || []);
      } else {
        console.error('Failed to refresh products after edit:', await refreshRes.text());
      }
    } catch (e: any) {
      setError(e?.message || 'Ürün güncellenirken hata oluştu');
    }
  };

  const handleHardwareVerification = (product: Product) => {
    setSelectedProduct(product);
    setHardwareForm({
      serialNumber: product.serialNumber || '',
      warrantyStartDate: '',
      warrantyDuration: 12
    });
    setOpenHardwareDialog(true);
  };

  const handleCompleteHardwareVerification = async () => {
    if (!selectedProduct || !hardwareForm.serialNumber) {
      setError('Seri numara gereklidir');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        serialNumber: hardwareForm.serialNumber,
        warrantyStartDate: hardwareForm.warrantyStartDate || undefined,
        warrantyDuration: hardwareForm.warrantyDuration,
        status: 'READY_FOR_SHIPMENT',
        updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35'
      };

      const res = await fetch(`http://localhost:3015/api/v1/products/hardware-verification/${selectedProduct.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Hardware verification error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Donanım doğrulama tamamlanamadı');
      }

      setOpenHardwareDialog(false);
      setError(null);
      
      // Reload products from API
      const refreshRes = await fetch('http://localhost:3015/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProducts(refreshData.data || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Donanım doğrulama tamamlanırken hata oluştu');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter.status && product.status !== filter.status) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        product.serialNumber?.toLowerCase().includes(search) ||
        product.productModel.name.toLowerCase().includes(search) ||
        product.productType.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

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
            Ürün Yönetimi
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => setOpenExportImportDialog(true)}
            >
              Dışa/İçe Aktar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProduct}
            >
              Yeni Ürün Ekle
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Advanced Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filtreler ve Arama</Typography>
            <Box>
              <Button
                startIcon={<FilterIcon />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant={showAdvancedFilters ? "contained" : "outlined"}
                size="small"
                sx={{ mr: 1 }}
              >
                Gelişmiş Filtreler
              </Button>
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                variant="outlined"
                size="small"
                color="secondary"
              >
                Temizle
              </Button>
            </Box>
          </Box>

          {/* Basic Search */}
          <Grid container spacing={2} alignItems="center" mb={showAdvancedFilters ? 2 : 0}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Arama"
                placeholder="Seri numara, model, üretici..."
                value={advancedFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={advancedFilters.status || ''}
                  label="Durum"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION_ISSUE">İlk Üretim Arıza</MenuItem>
                  <MenuItem value="READY_FOR_SHIPMENT">Sevkiyat Hazır</MenuItem>
                  <MenuItem value="SHIPPED">Sevk Edildi</MenuItem>
                  <MenuItem value="UNDER_REPAIR">Tamir Edilmekte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sıralama</InputLabel>
                <Select
                  value={advancedFilters.sortBy || 'serialNumber'}
                  label="Sıralama"
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <MenuItem value="serialNumber">Seri Numara</MenuItem>
                  <MenuItem value="productModel">Model</MenuItem>
                  <MenuItem value="manufacturer">Üretici</MenuItem>
                  <MenuItem value="location">Konum</MenuItem>
                  <MenuItem value="productionDate">Üretim Tarihi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom>
                Gelişmiş Filtreler
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Üretici</InputLabel>
                    <Select
                      value={advancedFilters.manufacturer || ''}
                      label="Üretici"
                      onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {manufacturers.map((manufacturer) => (
                        <MenuItem key={manufacturer.id} value={manufacturer.id}>
                          {manufacturer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Ürün Modeli</InputLabel>
                    <Select
                      value={advancedFilters.productModel || ''}
                      label="Ürün Modeli"
                      onChange={(e) => handleFilterChange('productModel', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {productModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Konum</InputLabel>
                    <Select
                      value={advancedFilters.location || ''}
                      label="Konum"
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="null">Müşteride</MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Garanti Durumu</InputLabel>
                    <Select
                      value={advancedFilters.warrantyStatus || ''}
                      label="Garanti Durumu"
                      onChange={(e) => handleFilterChange('warrantyStatus', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="IN_WARRANTY">Garanti Kapsamında</MenuItem>
                      <MenuItem value="OUT_OF_WARRANTY">Garanti Dışı</MenuItem>
                      <MenuItem value="WARRANTY_EXPIRED">Garanti Süresi Dolmuş</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Ürün Tablosu */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Seri Numara</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Üretici</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Üretim Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.serialNumber || (
                      <Chip label="Henüz atanmadı" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>{product.productModel.name}</TableCell>
                  <TableCell>{product.productType.name}</TableCell>
                  <TableCell>{product.manufacturer.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(product.status)}
                      color={getStatusColor(product.status) as any}
                      size="small"
                      onClick={() => handleStatusUpdate(product.id, product.status)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      title="Durumu değiştirmek için tıklayın"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.location?.name || 'Müşteride'}
                      size="small"
                      color={product.location ? 'default' as any : 'info' as any}
                      onClick={(e) => handleOpenLocationMenu(product.id, e.currentTarget)}
                      sx={{ cursor: 'pointer' }}
                      title="Konumu değiştirmek için tıklayın"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(product.productionDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleHardwareVerification(product)}
                      disabled={product.status !== 'FIRST_PRODUCTION'}
                      title="Donanım Doğrulama"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton size="small" title="Görüntüle" onClick={() => handleViewProduct(product)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" title="Düzenle" onClick={() => handleEditProduct(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" title="Sil" onClick={() => handleDeleteProduct(product.id)} sx={{ color: 'error.main' }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Yeni Ürün Ekleme Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Yeni Ürün Ekle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ürün Modeli</InputLabel>
                  <Select
                    label="Ürün Modeli"
                    value={createForm.productModelId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, productModelId: String(e.target.value) }))}
                  >
                    {models.length === 0 && (
                    <MenuItem value="1">Gateway-2000</MenuItem>
                    )}
                    {models.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Adet"
                  type="number"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm((s) => ({ ...s, quantity: Number(e.target.value) }))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Üretim Tarihi"
                  type="date"
                  value={createForm.productionDate}
                  onChange={(e) => setCreateForm((s) => ({ ...s, productionDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Konum</InputLabel>
                  <Select
                    label="Konum"
                    value={createForm.locationId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, locationId: String(e.target.value) }))}
                  >
                    {locations.length === 0 && (
                    <MenuItem value="1">Depo A</MenuItem>
                    )}
                    {locations.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSubmitCreate}>Ekle</Button>
          </DialogActions>
        </Dialog>

        {/* Location selection menu */}
        <Menu
          anchorEl={locationMenuAnchor}
          open={Boolean(locationMenuAnchor)}
          onClose={handleCloseLocationMenu}
        >
          <MenuItem onClick={() => handleSelectLocation(null)}>Müşteride</MenuItem>
          {locations.map((l) => (
            <MenuItem key={l.id} onClick={() => handleSelectLocation(l.id)}>{l.name}</MenuItem>
          ))}
        </Menu>

        {/* Edit Product Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Ürün Düzenle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ürün Modeli</InputLabel>
                  <Select
                    label="Ürün Modeli"
                    value={createForm.productModelId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, productModelId: String(e.target.value) }))}
                  >
                    {models.length === 0 && (
                      <MenuItem value="1">Gateway-2000</MenuItem>
                    )}
                    {models.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Üretim Tarihi"
                  type="date"
                  value={createForm.productionDate}
                  onChange={(e) => setCreateForm((s) => ({ ...s, productionDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Konum</InputLabel>
                  <Select
                    label="Konum"
                    value={createForm.locationId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, locationId: String(e.target.value) }))}
                  >
                    {locations.length === 0 && (
                      <MenuItem value="1">Depo A</MenuItem>
                    )}
                    {locations.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSubmitEdit}>Kaydet</Button>
          </DialogActions>
        </Dialog>

        {/* Donanım Doğrulama Dialog */}
        <Dialog open={openHardwareDialog} onClose={() => setOpenHardwareDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Donanım Doğrulama ve Konfigürasyon</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ürün: {selectedProduct.productModel.name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Seri Numara"
                    required
                    value={hardwareForm.serialNumber}
                    onChange={(e) => setHardwareForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Garanti Başlangıç Tarihi"
                    type="date"
                    value={hardwareForm.warrantyStartDate}
                    onChange={(e) => setHardwareForm(prev => ({ ...prev, warrantyStartDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Garanti Süresi (Ay)"
                    type="number"
                    value={hardwareForm.warrantyDuration}
                    onChange={(e) => setHardwareForm(prev => ({ ...prev, warrantyDuration: Number(e.target.value) }))}
                    inputProps={{ min: 0, max: 120 }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHardwareDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleCompleteHardwareVerification}>Tamamla</Button>
          </DialogActions>
        </Dialog>

        {/* View Product Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Ürün Detayları</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Seri Numara
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.serialNumber || 'Henüz atanmadı'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.productModel.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tür
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.productType.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Üretici
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.manufacturer.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Durum
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedProduct.status)}
                    color={getStatusColor(selectedProduct.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Konum
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.location?.name || 'Müşteride'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Üretim Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProduct.productionDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Garanti Durumu
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.warrantyStatus}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for status update feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Export/Import Dialog */}
        <ExportImportDialog
          open={openExportImportDialog}
          onClose={() => setOpenExportImportDialog(false)}
          dataType="products"
          data={products}
          onExport={handleExport}
          onImport={handleImport}
        />
      </Box>
    </Layout>
  );
}
