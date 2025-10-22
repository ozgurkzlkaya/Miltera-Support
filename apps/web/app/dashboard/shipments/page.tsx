'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Box,
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
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';
import { useAuth } from '../../../features/auth/useAuth';

interface Shipment {
  id: string;
  shipmentNumber: string;
  type: 'SALES' | 'SERVICE_RETURN' | 'SERVICE_SEND';
  status: 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  company: {
    id: string;
    name: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  totalCost?: number;
  itemCount: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  products: Array<{ id: string; serialNumber: string | null; productModel: { name: string } }>;
}

interface ShipmentStats {
  totalShipments: number;
  preparingShipments: number;
  shippedShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
  salesShipments: number;
  serviceShipments: number;
}

interface CompanyOption { id: string; name: string }
interface ProductOption { id: string; label: string }

const ShipmentsPage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    type: 'SALES' as 'SALES' | 'SERVICE_RETURN' | 'SERVICE_SEND',
    companyId: '',
    productIds: [] as string[],
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProductLabels, setSelectedProductLabels] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Gerçek veri çekme

  useEffect(() => {
    fetchShipments();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Trigger fetch when filters change
  useEffect(() => {
    setPage(1); // Reset to first page when filters change
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.type]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.search) params.set('q', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.type) params.set('type', filters.type);
      let response = await fetch(`http://localhost:3015/api/v1/shipments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok && response.status === 400) {
        // Backend paginasyon/arama parametrelerini desteklemiyorsa basit endpoint'e düş
        response = await fetch('http://localhost:3015/api/v1/shipments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.ok) {
        const data = await response.json();
        setShipments(data.data.shipments || data.data || []);
        
        // Update pagination state if available from API
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        } else {
          // Fallback: calculate pagination from current data
          const totalItems = data.data.shipments?.length || data.data?.length || 0;
          setPagination({
            total: totalItems,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalItems / limit),
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Sevkiyat verileri yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError('Ağ bağlantısı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:3015/api/v1/shipments/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API'den gelen veri yapısını frontend'e uygun hale getir
        setStats({
          totalShipments: data.data.total || 0,
          preparingShipments: data.data.preparing || 0,
          shippedShipments: data.data.shipped || 0,
          deliveredShipments: data.data.delivered || 0,
          cancelledShipments: data.data.cancelled || 0,
          salesShipments: 0, // Bu bilgi API'de yok, hesaplanabilir
          serviceShipments: 0, // Bu bilgi API'de yok, hesaplanabilir
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch('http://localhost:3015/api/v1/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyOptions((data.data || []).map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch {}
  };

  const fetchShipmentEligibleProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch('http://localhost:3015/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items: ProductOption[] = (data.data?.products || data.data || [])
          .filter((p: any) => p.status === 'READY_FOR_SHIPMENT')
          .map((p: any) => ({ id: p.id, label: `${p.serialNumber || 'SN-YOK'} • ${p.productModel?.name || ''}` }));
        setProductOptions(items);
        const map: Record<string, string> = {};
        items.forEach(i => { map[i.id] = i.label; });
        setSelectedProductLabels(map);
      }
    } catch {}
  };

  // Open create dialog loader
  useEffect(() => {
    if (openCreateDialog) {
      fetchCompanies();
      fetchShipmentEligibleProducts();
    }
  }, [openCreateDialog]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return 'warning';
      case 'SHIPPED':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return 'Hazırlanıyor';
      case 'SHIPPED':
        return 'Sevk Edildi';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SALES':
        return 'Satış';
      case 'SERVICE_RETURN':
        return 'Servis Dönüş';
      case 'SERVICE_SEND':
        return 'Servis Gönderim';
      default:
        return type;
    }
  };

  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setOpenViewDialog(true);
  };

  const handleCreateShipment = () => {
    setOpenCreateDialog(true);
  };

  const handleSubmitCreate = async () => {
    try {
      if (!createForm.companyId || createForm.productIds.length === 0) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Firma ve en az bir ürün seçmelisiniz');
        setSnackbarOpen(true);
        return;
      }
      if (createForm.trackingNumber && createForm.trackingNumber.length < 6) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Kargo takip numarası en az 6 karakter olmalı');
        setSnackbarOpen(true);
        return;
      }

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        type: createForm.type,
        companyId: createForm.companyId,
        productIds: createForm.productIds,
        trackingNumber: createForm.trackingNumber || undefined,
        estimatedDelivery: createForm.estimatedDelivery ? new Date(createForm.estimatedDelivery).toISOString() : undefined,
        notes: createForm.notes || undefined,
      };

      const res = await fetch('http://localhost:3015/api/v1/shipments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || 'Sevkiyat oluşturulamadı');
      }

      setOpenCreateDialog(false);
      setCreateForm({ type: 'SALES', companyId: '', productIds: [], trackingNumber: '', estimatedDelivery: '', notes: '' });
      setSnackbarSeverity('success');
      setSnackbarMessage('Sevkiyat oluşturuldu');
      setSnackbarOpen(true);
      // Seçilen ürünleri oluşturma sonrası seçeneklerden düşür
      setProductOptions(prev => prev.filter(p => !payload.productIds.includes(p.id)));
      fetchShipments();
      fetchStats();
    } catch (e: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(e?.message || 'Sevkiyat oluşturulamadı');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    try {
      const confirmDelete = typeof window !== 'undefined' ? window.confirm('Sevkiyatı silmek istiyor musunuz?') : true;
      if (!confirmDelete) return;

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch(`http://localhost:3015/api/v1/shipments/${shipmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Sevkiyat silinemedi');
      setShipments(prev => prev.filter(s => s.id !== shipmentId));
      setSnackbarSeverity('success');
      setSnackbarMessage('Sevkiyat silindi');
      setSnackbarOpen(true);
      fetchStats();
    } catch (e: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(e?.message || 'Sevkiyat silinemedi');
      setSnackbarOpen(true);
    }
  };

  // Status update handler
  const handleStatusUpdate = async (shipmentId: string, currentStatus: string) => {
    try {
      if (updatingStatusId) return; // prevent double clicks
      setUpdatingStatusId(shipmentId);
      const statusProgression = ['PREPARING', 'SHIPPED', 'DELIVERED'];
      const currentIndex = statusProgression.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % statusProgression.length;
      const newStatus = statusProgression[nextIndex];

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        const nextShipments = shipments.map((shipment: Shipment) =>
          shipment.id === shipmentId
            ? { ...shipment, status: newStatus as any }
            : shipment
        );
        setShipments(nextShipments);

        // Optimistically recompute stats from local data if stats loaded
        if (stats) {
          const recomputed = {
            totalShipments: nextShipments.length,
            preparingShipments: nextShipments.filter(s => s.status === 'PREPARING').length,
            shippedShipments: nextShipments.filter(s => s.status === 'SHIPPED').length,
            deliveredShipments: nextShipments.filter(s => s.status === 'DELIVERED').length,
            cancelledShipments: nextShipments.filter(s => s.status === 'CANCELLED').length,
            salesShipments: stats.salesShipments,
            serviceShipments: stats.serviceShipments,
          } as typeof stats;
          setStats(recomputed);
        }
        
        setSnackbarMessage(`Sevkiyat durumu "${getStatusText(newStatus)}" olarak güncellendi`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh stats
        fetchStats();
      } else {
        let msg = 'Durum güncellenirken hata oluştu';
        try { msg = (await response.json())?.message || msg; } catch { msg = await response.text() || msg; }
        setSnackbarMessage(msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
      setSnackbarMessage('Durum güncellenirken bağlantı hatası');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally { setUpdatingStatusId(null); }
  };

  // Type update handler
  const handleTypeUpdate = async (shipmentId: string, currentType: string) => {
    try {
      const typeProgression = ['SALES', 'SERVICE_RETURN', 'SERVICE_SEND'];
      const currentIndex = typeProgression.indexOf(currentType);
      const nextIndex = (currentIndex + 1) % typeProgression.length;
      const newType = typeProgression[nextIndex];

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/shipments/${shipmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ type: newType }),
      });

      if (response.ok) {
        // Update local state
        setShipments(prevShipments =>
          prevShipments.map(shipment =>
            shipment.id === shipmentId
              ? { ...shipment, type: newType as any }
              : shipment
          )
        );
        
        setSnackbarMessage(`Sevkiyat türü "${getTypeText(newType)}" olarak güncellendi`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.message || 'Tür güncellenirken hata oluştu');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating shipment type:', error);
      setSnackbarMessage('Tür güncellenirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleExport = () => {
    try {
      // CSV formatında veri hazırla
      const csvData = [
        ['Sevkiyat No', 'Tür', 'Durum', 'Müşteri', 'Takip No', 'Tahmini Teslimat', 'Gerçek Teslimat', 'Oluşturulma Tarihi'],
        ...filteredShipments.map(shipment => [
          shipment.shipmentNumber,
          getTypeText(shipment.type),
          getStatusText(shipment.status),
          shipment.toCompany?.name || 'N/A',
          shipment.trackingNumber || 'N/A',
          shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('tr-TR') : 'N/A',
          shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleDateString('tr-TR') : 'N/A',
          new Date(shipment.createdAt).toLocaleDateString('tr-TR')
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
      link.setAttribute('download', `sevkiyat-raporu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarMessage('Sevkiyat raporu başarıyla dışa aktarıldı');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Export error:', error);
      setSnackbarMessage('Dışa aktarma sırasında hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    if (filters.status && shipment.status !== filters.status) return false;
    if (filters.type && shipment.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        shipment.shipmentNumber.toLowerCase().includes(searchLower) ||
        shipment.company?.name?.toLowerCase().includes(searchLower) ||
        (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(searchLower))
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Sevkiyat Yönetimi
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchShipments();
                fetchStats();
              }}
              disabled={loading}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleExport}
              sx={{ ml: 1 }}
            >
              DIŞA AKTAR
            </Button>
            {(user?.role === 'TSP' || user?.role === 'ADMIN') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateShipment}
              >
                Yeni Sevkiyat
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Toplam Sevkiyat</Typography>
                <Typography variant="h4">{stats?.totalShipments || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Hazırlanan</Typography>
                <Typography variant="h4">{stats?.preparingShipments || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Sevk Edilen</Typography>
                <Typography variant="h4">{stats?.shippedShipments || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Teslim Edilen</Typography>
                <Typography variant="h4">{stats?.deliveredShipments || 0}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Arama"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filters.status}
                  label="Durum"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="PREPARING">Hazırlanıyor</MenuItem>
                  <MenuItem value="SHIPPED">Sevk Edildi</MenuItem>
                  <MenuItem value="DELIVERED">Teslim Edildi</MenuItem>
                  <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tür</InputLabel>
                <Select
                  value={filters.type}
                  label="Tür"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="SALES">Satış</MenuItem>
                  <MenuItem value="SERVICE_RETURN">Servis Dönüş</MenuItem>
                  <MenuItem value="SERVICE_SEND">Servis Gönderim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Sevkiyat Tablosu */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sevkiyat No</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Müşteri</TableCell>
                <TableCell>Kargo Takip</TableCell>
                <TableCell>Ürün Sayısı</TableCell>
                <TableCell>Tahmini Teslimat</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Sevkiyat verileri yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz sevkiyat bulunmamaktadır.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {shipment.shipmentNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeText(shipment.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={() => handleTypeUpdate(shipment.id, shipment.type)}
                      sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, transition: 'opacity 0.2s' }}
                      title="Türü Değiştir"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(shipment.status)}
                      size="small"
                      color={getStatusColor(shipment.status) as any}
                      onClick={() => handleStatusUpdate(shipment.id, shipment.status)}
                      sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, transition: 'opacity 0.2s' }}
                      title="Durumu Değiştir"
                      disabled={updatingStatusId === shipment.id}
                    />
                  </TableCell>
                  <TableCell>{shipment.company?.name || 'Müşteri bilgisi yok'}</TableCell>
                  <TableCell>
                    {shipment.trackingNumber ? (
                      <Typography variant="body2" color="primary">
                        {shipment.trackingNumber}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>
                    {shipment.estimatedDelivery ? (
                      new Date(shipment.estimatedDelivery).toLocaleDateString('tr-TR')
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {shipment.createdBy?.firstName} {shipment.createdBy?.lastName}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewShipment(shipment)}
                      title="Görüntüle"
                    >
                      <ViewIcon />
                    </IconButton>
                    {(user?.role === 'TSP' || user?.role === 'ADMIN') && (
                      <>
                        <IconButton size="small" title="Düzenle">
                          <EditIcon />
                        </IconButton>
                        {user?.role === 'ADMIN' && (
                          <IconButton size="small" title="Sil" color="error" onClick={() => handleDeleteShipment(shipment.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sayfa Boyutu</InputLabel>
            <Select 
              label="Sayfa Boyutu" 
              value={limit} 
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to first page when changing limit
              }}
            >
              <MenuItem value={5}>5 / sayfa</MenuItem>
              <MenuItem value={10}>10 / sayfa</MenuItem>
              <MenuItem value={20}>20 / sayfa</MenuItem>
              <MenuItem value={50}>50 / sayfa</MenuItem>
            </Select>
          </FormControl>
          
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>

        {/* Sevkiyat Detay Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Sevkiyat Detayı - {selectedShipment?.shipmentNumber}
          </DialogTitle>
          <DialogContent>
            {selectedShipment && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sevkiyat Numarası
                  </Typography>
                  <Typography variant="body1">{selectedShipment.shipmentNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tür
                  </Typography>
                  <Chip
                    label={getTypeText(selectedShipment.type)}
                    size="small"
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Durum
                  </Typography>
                  <Chip
                    label={getStatusText(selectedShipment.status)}
                    size="small"
                    color={getStatusColor(selectedShipment.status) as any}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Müşteri
                  </Typography>
                  <Typography variant="body1">{selectedShipment.company.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kargo Takip No
                  </Typography>
                  <Typography variant="body1">
                    {selectedShipment.trackingNumber || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ürün Sayısı
                  </Typography>
                  <Typography variant="body1">{selectedShipment.itemCount}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tahmini Teslimat
                  </Typography>
                  <Typography variant="body1">
                    {selectedShipment.estimatedDelivery
                      ? new Date(selectedShipment.estimatedDelivery).toLocaleDateString('tr-TR')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gerçek Teslimat
                  </Typography>
                  <Typography variant="body1">
                    {selectedShipment.actualDelivery
                      ? new Date(selectedShipment.actualDelivery).toLocaleDateString('tr-TR')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Toplam Maliyet
                  </Typography>
                  <Typography variant="body1">
                    {selectedShipment.totalCost
                      ? `${selectedShipment.totalCost.toLocaleString('tr-TR')} ₺`
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Oluşturan
                  </Typography>
                  <Typography variant="body1">
                    {selectedShipment.createdBy.firstName} {selectedShipment.createdBy.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Oluşturma Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedShipment.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Yeni Sevkiyat Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Yeni Sevkiyat Oluştur</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tür</InputLabel>
                  <Select
                    label="Tür"
                    value={createForm.type}
                    onChange={(e) => setCreateForm((s) => ({ ...s, type: e.target.value as any }))}
                  >
                    <MenuItem value="SALES">Satış</MenuItem>
                    <MenuItem value="SERVICE_RETURN">Servis Dönüş</MenuItem>
                    <MenuItem value="SERVICE_SEND">Servis Gönderim</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Firma</InputLabel>
                  <Select
                    label="Firma"
                    value={createForm.companyId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, companyId: String(e.target.value) }))}
                  >
                    {companyOptions.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Ürünler</InputLabel>
                  <Select
                    multiple
                    label="Ürünler"
                    value={createForm.productIds}
                    onChange={(e) => setCreateForm((s) => ({ ...s, productIds: (e.target.value as string[]) }))}
                    renderValue={(selected) => selected.map(id => selectedProductLabels[id] || id).join(', ')}
                  >
                    {productOptions.map((p) => {
                      const chosen = createForm.productIds.includes(p.id);
                      return (
                        <MenuItem key={p.id} value={p.id} disabled={chosen}>
                          {p.label} {chosen ? ' (seçildi)' : ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kargo Takip No"
                  value={createForm.trackingNumber}
                  onChange={(e) => setCreateForm((s) => ({ ...s, trackingNumber: e.target.value }))}
                  inputProps={{ maxLength: 20 }}
                  helperText={createForm.trackingNumber && createForm.trackingNumber.length < 6 ? 'En az 6 karakter' : ' '}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tahmini Teslimat"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={createForm.estimatedDelivery}
                  onChange={(e) => setCreateForm((s) => ({ ...s, estimatedDelivery: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  minRows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((s) => ({ ...s, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSubmitCreate}>
              Oluştur
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
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
      </Box>
    </Layout>
  );
};

export default ShipmentsPage;
