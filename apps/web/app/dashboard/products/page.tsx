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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface Product {
  id: string;
  serialNumber: string | null;
  status: string;
  productionDate: string;
  warrantyStatus: string;
  productModel: {
    name: string;
  };
  productType: {
    name: string;
  };
  manufacturer: {
    name: string;
  };
  location: {
    name: string;
  } | null;
  owner: {
    name: string;
  } | null;
}

interface ProductFilter {
  status?: string;
  search?: string;
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
  const [openHardwareDialog, setOpenHardwareDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mock data - gerçek API'den gelecek
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        serialNumber: 'SN001',
        status: 'FIRST_PRODUCTION',
        productionDate: '2025-01-15',
        warrantyStatus: 'PENDING',
        productModel: { name: 'Gateway-2000' },
        productType: { name: 'Ağ Geçidi' },
        manufacturer: { name: 'Miltera' },
        location: { name: 'Depo A' },
        owner: null,
      },
      {
        id: '2',
        serialNumber: 'SN002',
        status: 'READY_FOR_SHIPMENT',
        productionDate: '2025-01-10',
        warrantyStatus: 'IN_WARRANTY',
        productModel: { name: 'Energy Analyzer' },
        productType: { name: 'Enerji Analizörü' },
        manufacturer: { name: 'Miltera' },
        location: { name: 'Depo B' },
        owner: null,
      },
      {
        id: '3',
        serialNumber: 'SN003',
        status: 'SHIPPED',
        productionDate: '2025-01-05',
        warrantyStatus: 'IN_WARRANTY',
        productModel: { name: 'VPN Router' },
        productType: { name: 'VPN Router' },
        manufacturer: { name: 'Miltera' },
        location: null,
        owner: { name: 'ABC Şirketi' },
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateProduct = () => {
    setOpenCreateDialog(true);
  };

  const handleHardwareVerification = (product: Product) => {
    setSelectedProduct(product);
    setOpenHardwareDialog(true);
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProduct}
          >
            Yeni Ürün Ekle
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Arama"
                placeholder="Seri numara, model, tür..."
                value={filter.search || ''}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filter.status || ''}
                  label="Durum"
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
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
          </Grid>
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
              {filteredProducts.map((product) => (
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
                    />
                  </TableCell>
                  <TableCell>
                    {product.location?.name || (
                      <Chip label="Müşteride" size="small" color="info" />
                    )}
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
                    <IconButton size="small" title="Görüntüle">
                      <ViewIcon />
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

        {/* Yeni Ürün Ekleme Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Yeni Ürün Ekle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ürün Modeli</InputLabel>
                  <Select label="Ürün Modeli">
                    <MenuItem value="1">Gateway-2000</MenuItem>
                    <MenuItem value="2">Energy Analyzer</MenuItem>
                    <MenuItem value="3">VPN Router</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Adet"
                  type="number"
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Üretim Tarihi"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Konum</InputLabel>
                  <Select label="Konum">
                    <MenuItem value="1">Depo A</MenuItem>
                    <MenuItem value="2">Depo B</MenuItem>
                    <MenuItem value="3">Depo C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained">Ekle</Button>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Garanti Başlangıç Tarihi"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Garanti Süresi (Ay)"
                    type="number"
                    inputProps={{ min: 0, max: 120 }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHardwareDialog(false)}>İptal</Button>
            <Button variant="contained">Tamamla</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
