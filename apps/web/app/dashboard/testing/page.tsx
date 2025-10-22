"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Layout } from "../../../components/Layout";
import { useAuth } from "../../../features/auth/useAuth";

interface ProductItem {
  id: string;
  serialNumber: string | null;
  status: string;
  productionDate: string;
  productModel: { id: string; name: string };
  productType?: { id: string; name: string };
}

const TestingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [form, setForm] = useState({
    serialNumber: "",
    findings: "",
    actionsTaken: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({ open: false, msg: "", sev: "success" });
  const [actionLoading, setActionLoading] = useState<null | "pass" | "fail">(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const token = useMemo(() => localStorage.getItem("auth_token") || localStorage.getItem("token") || "", []);

  const authHeaders = useMemo(() => {
    const h: any = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3015/api/v1/products", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Ürünler alınamadı");
        const data = await res.json();
        const items: ProductItem[] = (data.data?.products || data.data || []).filter((p: any) => p.status === "FIRST_PRODUCTION");
        setProducts(items);
      } catch (e: any) {
        setError(e?.message || "Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [token]);

  const refreshList = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("http://localhost:3015/api/v1/products", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Ürünler alınamadı");
      const data = await res.json();
      const items: ProductItem[] = (data.data?.products || data.data || []).filter((p: any) => p.status === "FIRST_PRODUCTION");
      setProducts(items);
    } catch (e: any) {
      setSnackbar({ open: true, msg: e?.message || 'Yenileme başarısız', sev: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const generateSerialNumber = (p: ProductItem) => {
    const model = (p.productModel?.name || 'MODEL').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${model}-${ts}-${rand}`;
  };

  const handleAssignSerial = async (p: ProductItem) => {
    try {
      const newSN = generateSerialNumber(p);
      const upRes = await fetch(`http://localhost:3015/api/v1/products/${p.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ serialNumber: newSN })
      });
      if (!upRes.ok) {
        const t = await upRes.text();
        throw new Error(t || 'Seri numarası atanamadı');
      }
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, serialNumber: newSN } : x));
      setSnackbar({ open: true, msg: `Seri numarası atandı: ${newSN}` , sev: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, msg: e?.message || 'Seri numarası atanamadı', sev: 'error' });
    }
  };

  const startTest = (product: ProductItem) => {
    setSelectedProduct(product);
    setForm({ serialNumber: product.serialNumber || "", findings: "", actionsTaken: "" });
    setFormError(null);
    setOpenTestDialog(true);
  };

  const handlePass = async () => {
    if (!selectedProduct) return;
    try {
      setFormError(null);
      if (!form.serialNumber || form.serialNumber.trim().length < 3) {
        setFormError("Seri numarası gerekli");
        return;
      }
      setActionLoading("pass");
      // 1) Hardware verification (API tanımı: POST /products/:id/hardware-verification)
      const hvRes = await fetch(`http://localhost:3015/api/v1/products/${selectedProduct.id}/hardware-verification`, {
        method: "POST",
        headers: authHeaders,
        // Backend controller ProductController.hardwareVerification serialNumber & updatedBy bekliyor
        body: JSON.stringify({
          serialNumber: form.serialNumber || undefined,
          findings: form.findings || undefined,
          actionsTaken: form.actionsTaken || undefined,
          status: "READY_FOR_SHIPMENT",
          updatedBy: user?.id,
        }),
      });
      if (!hvRes.ok) throw new Error("Donanım doğrulama başarısız");

      // 2) Seri numarası + durum güncellemesi -> READY_FOR_SHIPMENT
      const upRes = await fetch(`http://localhost:3015/api/v1/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ serialNumber: form.serialNumber || undefined, status: "READY_FOR_SHIPMENT" }),
      });
      if (!upRes.ok) throw new Error("Ürün durumu güncellenemedi");

      // UI güncelle
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setSnackbar({ open: true, msg: "Test başarıyla tamamlandı ve ürün sevkiyata hazır!", sev: "success" });
      setOpenTestDialog(false);
    } catch (e: any) {
      setSnackbar({ open: true, msg: e?.message || "İşlem başarısız", sev: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFail = async () => {
    if (!selectedProduct) return;
    try {
      setFormError(null);
      setActionLoading("fail");
      // 1) Hardware verification kayıt (FAILED)
      const hvRes = await fetch(`http://localhost:3015/api/v1/products/${selectedProduct.id}/hardware-verification`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          serialNumber: form.serialNumber || undefined,
          findings: form.findings || undefined,
          actionsTaken: form.actionsTaken || undefined,
          status: "FAILED",
          updatedBy: user?.id,
        }),
      });
      if (!hvRes.ok) throw new Error("Test kaydı oluşturulamadı");

      // 2) Durum: FIRST_PRODUCTION_ISSUE
      const upRes = await fetch(`http://localhost:3015/api/v1/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status: "FIRST_PRODUCTION_ISSUE" }),
      });
      if (!upRes.ok) throw new Error("Durum güncellenemedi");

      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setSnackbar({ open: true, msg: "Test başarısız; ürün arıza akışına alındı.", sev: "success" });
      setOpenTestDialog(false);
    } catch (e: any) {
      setSnackbar({ open: true, msg: e?.message || "İşlem başarısız", sev: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
        <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fabrikasyon Testi
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

          <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Ara (seri no / model)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Chip size="small" color="info" label={`Bekleyen: ${products.length}`} />
              <Button size="small" variant="outlined" onClick={refreshList} disabled={refreshing}>
                {refreshing ? 'Yenileniyor...' : 'Yenile'}
              </Button>
          </Box>
          <Typography variant="h6" gutterBottom>
            Test Bekleyen Ürünler
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Seri No</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Üretim Tarihi</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .filter(p => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (p.serialNumber || '').toLowerCase().includes(q) || (p.productModel?.name || '').toLowerCase().includes(q);
                })
                .map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.serialNumber ? (
                      p.serialNumber
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip size="small" color="warning" label="SN Yok" />
                        <Button size="small" variant="text" onClick={() => handleAssignSerial(p)}>Seri No Ata</Button>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{p.productModel?.name}</TableCell>
                  <TableCell>
                    <Chip size="small" color="default" label="İlk Üretim" />
                  </TableCell>
                  <TableCell>{new Date(p.productionDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" size="small" onClick={() => startTest(p)}>Test Et</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Test Dialog */}
        <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Donanım Testi</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Seri Numarası"
                  value={form.serialNumber}
                  onChange={(e) => setForm(s => ({ ...s, serialNumber: e.target.value }))}
                  error={!!formError}
                  helperText={formError || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Bulgular"
                  value={form.findings}
                  onChange={(e) => setForm(s => ({ ...s, findings: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Yapılan İşlemler"
                  value={form.actionsTaken}
                  onChange={(e) => setForm(s => ({ ...s, actionsTaken: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTestDialog(false)} disabled={actionLoading !== null}>İptal</Button>
            <Button variant="outlined" color="error" onClick={handleFail} disabled={actionLoading !== null}>
              {actionLoading === 'fail' ? 'İşleniyor...' : 'Başarısız'}
            </Button>
            <Button variant="contained" onClick={handlePass} disabled={actionLoading !== null}>
              {actionLoading === 'pass' ? 'İşleniyor...' : 'Başarılı'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.sev} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.msg}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default TestingPage;


