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

  // NEW: create form state and options
  const [createForm, setCreateForm] = useState({
    productModelId: '',
    quantity: 1,
    productionDate: '',
    locationId: '',
  });
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);

  // Load options from API
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // product models
        try {
          const res = await fetch('http://localhost:3011/api/v1/product-models', { headers });
          if (res.ok) {
            const data = await res.json();
            setModels((data?.data ?? []).map((m: any) => ({ id: m.id, name: m.name })));
          }
        } catch {}

        // locations
        try {
          const res = await fetch('http://localhost:3011/api/v1/locations', { headers });
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

        const res = await fetch('http://localhost:3011/api/v1/products', {
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

  const handleCreateProduct = () => {
    setOpenCreateDialog(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
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
        productionDate: createForm.productionDate,
        locationId: createForm.locationId || undefined,
        createdBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
      };

      const res = await fetch('http://localhost:3011/api/v1/products', {
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

      const refreshRes = await fetch('http://localhost:3011/api/v1/products', {
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCreateForm({
      productModelId: product.productModel?.id || '',
      quantity: 1,
      productionDate: product.productionDate,
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
        productionDate: createForm.productionDate,
        locationId: createForm.locationId || undefined,
        updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
      };

      const res = await fetch(`http://localhost:3011/api/v1/products/${editingProduct.id}`, {
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
      const refreshRes = await fetch('http://localhost:3011/api/v1/products', {
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
                    <IconButton size="small" title="Görüntüle" onClick={() => handleViewProduct(product)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" title="Düzenle" onClick={() => handleEditProduct(product)}>
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
      </Box>
    </Layout>
  );
}
