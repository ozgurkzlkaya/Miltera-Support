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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
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
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Gerçek API'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // API çağrıları burada yapılacak
        // Şimdilik mock data kullanıyoruz
        const mockLocations: Location[] = [
          {
            id: '1',
            name: 'Ana Depo',
            type: 'WAREHOUSE',
            address: 'Fabrika Binası, Kat 1',
            notes: 'Ana üretim deposu',
          },
          {
            id: '2',
            name: 'Servis Alanı A',
            type: 'SERVICE_AREA',
            address: 'Fabrika Binası, Kat 2',
            notes: 'Teknik servis alanı',
          },
          {
            id: '3',
            name: 'Test Laboratuvarı',
            type: 'TESTING_AREA',
            address: 'Fabrika Binası, Kat 1',
            notes: 'Ürün test alanı',
          },
          {
            id: '4',
            name: 'Sevkiyat Alanı',
            type: 'SHIPPING_AREA',
            address: 'Fabrika Binası, Giriş',
            notes: 'Sevkiyat hazırlık alanı',
          },
        ];

        const mockInventory: InventoryItem[] = [
          {
            locationId: '1',
            locationName: 'Ana Depo',
            locationType: 'WAREHOUSE',
            status: 'FIRST_PRODUCTION',
            count: 45,
          },
          {
            locationId: '1',
            locationName: 'Ana Depo',
            locationType: 'WAREHOUSE',
            status: 'READY_FOR_SHIPMENT',
            count: 23,
          },
          {
            locationId: '2',
            locationName: 'Servis Alanı A',
            locationType: 'SERVICE_AREA',
            status: 'UNDER_REPAIR',
            count: 8,
          },
          {
            locationId: '3',
            locationName: 'Test Laboratuvarı',
            locationType: 'TESTING_AREA',
            status: 'FIRST_PRODUCTION_ISSUE',
            count: 3,
          },
        ];

        const mockStats: WarehouseStats = {
          totalLocations: 4,
          usedLocations: 3,
          totalStockProducts: 79,
          totalCustomerProducts: 156,
          statusStats: [
            { status: 'FIRST_PRODUCTION', count: 45 },
            { status: 'READY_FOR_SHIPMENT', count: 23 },
            { status: 'UNDER_REPAIR', count: 8 },
            { status: 'FIRST_PRODUCTION_ISSUE', count: 3 },
          ],
        };

        const mockAlerts: StockAlert[] = [
          {
            type: 'READY_FOR_SHIPMENT',
            message: '23 ürün sevkiyata hazır',
            details: [
              { locationName: 'Ana Depo', count: 23 },
            ],
          },
          {
            type: 'DEFECTIVE_PRODUCTS',
            message: '3 arızalı ürün',
            details: [
              { locationName: 'Test Laboratuvarı', count: 3 },
            ],
          },
        ];

        // TODO: Gerçek API çağrıları
        // const locationsResponse = await warehouseAPI.getLocations();
        // const inventoryResponse = await warehouseAPI.getInventory();
        // const statsResponse = await warehouseAPI.getStats();
        // const alertsResponse = await warehouseAPI.getStockAlerts();

        setLocations(mockLocations);
        setInventory(mockInventory);
        setStats(mockStats);
        setAlerts(mockAlerts);
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
    setOpenLocationDialog(true);
  };

  const handleViewInventory = (location: Location) => {
    setSelectedLocation(location);
    setOpenInventoryDialog(true);
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
                      <IconButton size="small" title="Düzenle">
                        <EditIcon />
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
                      <IconButton size="small" title="Detay Görüntüle">
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
                  label="Konum Adı"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Konum Türü</InputLabel>
                  <Select label="Konum Türü">
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLocationDialog(false)}>İptal</Button>
            <Button variant="contained">Ekle</Button>
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
      </Box>
    </Layout>
  );
}
