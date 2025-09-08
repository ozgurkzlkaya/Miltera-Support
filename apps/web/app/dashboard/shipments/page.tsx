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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
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

  // Mock data for demonstration
  const mockShipments: Shipment[] = [
    {
      id: '1',
      shipmentNumber: '250602-01',
      type: 'SALES',
      status: 'SHIPPED',
      company: { id: '1', name: 'ABC Elektrik Ltd.' },
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2025-06-05T10:00:00Z',
      itemCount: 3,
      createdBy: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' },
      createdAt: '2025-06-02T09:00:00Z',
      updatedAt: '2025-06-02T14:30:00Z',
    },
    {
      id: '2',
      shipmentNumber: '250602-02',
      type: 'SERVICE_RETURN',
      status: 'PREPARING',
      company: { id: '2', name: 'XYZ Teknoloji A.Ş.' },
      itemCount: 1,
      createdBy: { id: '2', firstName: 'Mehmet', lastName: 'Kaya' },
      createdAt: '2025-06-02T11:00:00Z',
      updatedAt: '2025-06-02T11:00:00Z',
    },
    {
      id: '3',
      shipmentNumber: '250602-03',
      type: 'SERVICE_SEND',
      status: 'DELIVERED',
      company: { id: '3', name: 'Delta Enerji Ltd.' },
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2025-06-03T15:00:00Z',
      actualDelivery: '2025-06-03T14:30:00Z',
      itemCount: 2,
      createdBy: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' },
      createdAt: '2025-06-02T13:00:00Z',
      updatedAt: '2025-06-03T14:30:00Z',
    },
  ];

  const mockStats: ShipmentStats = {
    totalShipments: 3,
    preparingShipments: 1,
    shippedShipments: 1,
    deliveredShipments: 1,
    cancelledShipments: 0,
    salesShipments: 1,
    serviceShipments: 2,
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setShipments(mockShipments);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredShipments = shipments.filter((shipment) => {
    if (filters.status && shipment.status !== filters.status) return false;
    if (filters.type && shipment.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        shipment.shipmentNumber.toLowerCase().includes(searchLower) ||
        shipment.company.name.toLowerCase().includes(searchLower) ||
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
                <Typography variant="h4">{stats.totalShipments}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Hazırlanan</Typography>
                <Typography variant="h4">{stats.preparingShipments}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Sevk Edilen</Typography>
                <Typography variant="h4">{stats.shippedShipments}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Teslim Edilen</Typography>
                <Typography variant="h4">{stats.deliveredShipments}</Typography>
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
              {filteredShipments.map((shipment) => (
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
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(shipment.status)}
                      size="small"
                      color={getStatusColor(shipment.status) as any}
                    />
                  </TableCell>
                  <TableCell>{shipment.company.name}</TableCell>
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
                  <TableCell>{shipment.itemCount}</TableCell>
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
                    {shipment.createdBy.firstName} {shipment.createdBy.lastName}
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
                          <IconButton size="small" title="Sil" color="error">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bu özellik henüz geliştirme aşamasındadır.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained" disabled>
              Oluştur
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ShipmentsPage;
