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
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface Location {
  id: string;
  name: string;
  type: string;
  address?: string;
  notes?: string;
}

interface InventoryItem {
  locationId: string;
  locationName: string;
  locationType: string;
  status: string;
  count: number;
}

interface WarehouseStats {
  totalLocations: number;
  usedLocations: number;
  totalStockProducts: number;
  totalCustomerProducts: number;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
}

interface StockAlert {
  type: string;
  message: string;
  details: any[];
}

const getLocationTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'WAREHOUSE': 'Depo',
    'SHELF': 'Raf',
    'SERVICE_AREA': 'Servis Alanı',
    'TESTING_AREA': 'Test Alanı',
    'SHIPPING_AREA': 'Sevkiyat Alanı',
  };
  return types[type] || type;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'FIRST_PRODUCTION':
      return 'default';
    case 'FIRST_PRODUCTION_ISSUE':
      return 'error';
    case 'READY_FOR_SHIPMENT':
      return 'success';
    case 'SHIPPED':
      return 'info';
    case 'UNDER_REPAIR':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  const statusLabels: { [key: string]: string } = {
    'FIRST_PRODUCTION': 'İlk Üretim',
    'FIRST_PRODUCTION_ISSUE': 'İlk Üretim Arıza',
    'FIRST_PRODUCTION_SCRAPPED': 'İlk Üretim Hurda',
    'READY_FOR_SHIPMENT': 'Sevkiyat Hazır',
    'SHIPPED': 'Sevk Edildi',
    'ISSUE_CREATED': 'Arıza Kaydı Oluşturuldu',
    'RECEIVED': 'Cihaz Teslim Alındı',
    'PRE_TEST_COMPLETED': 'Servis Ön Testi Yapıldı',
    'UNDER_REPAIR': 'Cihaz Tamir Edilmekte',
    'SERVICE_SCRAPPED': 'Servis Hurda',
    'DELIVERED': 'Teslim Edildi'
  };
  return statusLabels[status] || status;
};

export default function WarehousePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    notes: ''
  });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Gerçek API'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Gerçek API çağrıları
        const locationsResponse = await fetch('http://localhost:3011/api/v1/locations', {
          headers,
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData.data || []);
        } else {
          console.error('Failed to load locations:', await locationsResponse.text());
          setLocations([]);
        }


        // Gerçek API'den inventory verilerini çek
        try {
          const inventoryResponse = await fetch('http://localhost:3011/api/v1/products', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            // Products verilerini inventory formatına dönüştür
            const inventoryItems: InventoryItem[] = inventoryData.data.map((product: any) => ({
              locationId: '1',
              locationName: 'Ana Depo',
              locationType: 'WAREHOUSE',
              status: product.status,
              count: 1,
            }));
            setInventory(inventoryItems);
          }
        } catch (error) {
          console.error('Failed to load inventory:', error);
          setInventory([]);
        }

        // Gerçek API'den stats verilerini çek
        try {
          const statsResponse = await fetch('http://localhost:3011/api/v1/reports/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const warehouseStats: WarehouseStats = {
              totalLocations: 4,
              usedLocations: 3,
              totalStockProducts: statsData.data.totalProducts || 0,
              totalCustomerProducts: statsData.data.totalProducts || 0,
              statusStats: [
                { status: 'FIRST_PRODUCTION', count: 0 },
                { status: 'READY_FOR_SHIPMENT', count: 0 },
                { status: 'UNDER_REPAIR', count: 0 },
                { status: 'FIRST_PRODUCTION_ISSUE', count: 0 },
              ],
            };
            setStats(warehouseStats);
          }
        } catch (error) {
          console.error('Failed to load stats:', error);
          setStats({
            totalLocations: 0,
            usedLocations: 0,
            totalStockProducts: 0,
            totalCustomerProducts: 0,
            statusStats: [],
          });
        }

        setAlerts([]); // Alerts için henüz API yok
      } catch (err) {
        console.error('Error fetching warehouse data:', err);
        setError('Veri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateLocation = () => {
    setFormData({
      name: '',
      type: '',
      address: '',
      notes: ''
    });
    setOpenLocationDialog(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address || '',
      notes: location.notes || ''
    });
    setOpenEditDialog(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Bu konumu silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`http://localhost:3011/api/v1/locations/${locationId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.ok) {
          setLocations(prev => prev.filter(loc => loc.id !== locationId));
          setSnackbar({
            open: true,
            message: 'Konum başarıyla silindi',
            severity: 'success'
          });
        } else {
          const errorText = await response.text();
          console.error('Failed to delete location:', errorText);
          setSnackbar({
            open: true,
            message: 'Konum silinirken hata oluştu',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        setSnackbar({
          open: true,
          message: 'Konum silinirken hata oluştu',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveLocation = async () => {
    if (!formData.name || !formData.type) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3011/api/v1/locations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          address: formData.address || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const newLocation = await response.json();
        setLocations(prev => [newLocation.data, ...prev]);
        setOpenLocationDialog(false);
        setSnackbar({
          open: true,
          message: `Konum "${formData.name}" başarıyla eklendi`,
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to create location:', errorText);
        setSnackbar({
          open: true,
          message: 'Konum oluşturulurken hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating location:', error);
      setSnackbar({
        open: true,
        message: 'Konum oluşturulurken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !formData.name || !formData.type) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3011/api/v1/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          address: formData.address || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const updatedLocationData = await response.json();
        setLocations(prev => prev.map(loc => 
          loc.id === selectedLocation.id ? updatedLocationData.data : loc
        ));
        setOpenEditDialog(false);
        setSelectedLocation(null);
        setSnackbar({
          open: true,
          message: `Konum "${formData.name}" başarıyla güncellendi`,
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to update location:', errorText);
        setSnackbar({
          open: true,
          message: 'Konum güncellenirken hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setSnackbar({
        open: true,
        message: 'Konum güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleViewInventory = (location: Location) => {
    setSelectedLocation(location);
    setOpenInventoryDialog(true);
  };

  const handleViewInventoryItem = (item: any) => {
    setSelectedInventoryItem(item);
    setOpenViewDialog(true);
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
            Depo Yönetimi
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLocation}
          >
            Yeni Konum Ekle
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Konum
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalLocations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Kullanılan Konum
                  </Typography>
                  <Typography variant="h4">
                    {stats.usedLocations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Stok Ürünler
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStockProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Müşteri Ürünleri
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCustomerProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Uyarılar */}
        {alerts.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Stok Uyarıları
            </Typography>
            <List>
              {alerts.map((alert, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.details.map((detail, i) => 
                      `${detail.locationName}: ${detail.count} ürün`
                    ).join(', ')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Konumlar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Konumlar
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Konum Adı</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Adres</TableCell>
                  <TableCell>Notlar</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getLocationTypeLabel(location.type)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{location.address || '-'}</TableCell>
                    <TableCell>{location.notes || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewInventory(location)}
                        title="Envanter Görüntüle"
                      >
                        <InventoryIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Düzenle"
                        onClick={() => handleEditLocation(location)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Sil"
                        onClick={() => handleDeleteLocation(location.id)}
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
        </Paper>

        {/* Envanter Özeti */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Envanter Özeti
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Konum</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Adet</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.locationName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getLocationTypeLabel(item.locationType)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">
                        {item.count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" title="Detay Görüntüle" onClick={() => handleViewInventoryItem(item)}>
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Yeni Konum Ekleme Dialog */}
        <Dialog open={openLocationDialog} onClose={() => setOpenLocationDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yeni Konum Ekle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Konum Adı *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Konum Türü *</InputLabel>
                  <Select 
                    label="Konum Türü *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="WAREHOUSE">Depo</MenuItem>
                    <MenuItem value="SHELF">Raf</MenuItem>
                    <MenuItem value="SERVICE_AREA">Servis Alanı</MenuItem>
                    <MenuItem value="TESTING_AREA">Test Alanı</MenuItem>
                    <MenuItem value="SHIPPING_AREA">Sevkiyat Alanı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLocationDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveLocation}>Ekle</Button>
          </DialogActions>
        </Dialog>

        {/* Konum Düzenleme Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Konum Düzenle - {selectedLocation?.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Konum Adı *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Konum Türü *</InputLabel>
                  <Select 
                    label="Konum Türü *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="WAREHOUSE">Depo</MenuItem>
                    <MenuItem value="SHELF">Raf</MenuItem>
                    <MenuItem value="SERVICE_AREA">Servis Alanı</MenuItem>
                    <MenuItem value="TESTING_AREA">Test Alanı</MenuItem>
                    <MenuItem value="SHIPPING_AREA">Sevkiyat Alanı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleUpdateLocation}>Kaydet</Button>
          </DialogActions>
        </Dialog>

        {/* Envanter Detay Dialog */}
        <Dialog open={openInventoryDialog} onClose={() => setOpenInventoryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedLocation?.name} - Envanter Detayı
          </DialogTitle>
          <DialogContent>
            {selectedLocation && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Konum Bilgileri
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Tür: {getLocationTypeLabel(selectedLocation.type)}
                </Typography>
                {selectedLocation.address && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Adres: {selectedLocation.address}
                  </Typography>
                )}
                {selectedLocation.notes && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Notlar: {selectedLocation.notes}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Ürün Listesi
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Bu konumda bulunan ürünler burada listelenecek...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInventoryDialog(false)}>Kapat</Button>
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

        {/* View Inventory Item Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Envanter Detayları</DialogTitle>
          <DialogContent>
            {selectedInventoryItem && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Konum
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventoryItem.locationName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Konum Türü
                  </Typography>
                  <Typography variant="body1">
                    {getLocationTypeLabel(selectedInventoryItem.locationType)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Durum
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedInventoryItem.status)}
                    color={getStatusColor(selectedInventoryItem.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Adet
                  </Typography>
                  <Typography variant="h6">
                    {selectedInventoryItem.count}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
