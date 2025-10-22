"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Layout } from "../../../components/Layout";
import { useAuth } from "../../../features/auth/useAuth";
import { GetApp as GetAppIcon } from "@mui/icons-material";

interface ServiceOperation {
  id: string;
  issueId?: string;
  productId?: string;
  operationType: 'INITIAL_TEST' | 'FABRICATION_TEST' | 'HARDWARE_VERIFICATION' | 'CONFIGURATION' | 'PRE_TEST' | 'REPAIR' | 'FINAL_TEST' | 'QUALITY_CHECK';
  description?: string;
  findings?: string;
  performedById?: string;
  createdAt: string;
  duration?: number;
}

const ServiceOperationsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ServiceOperation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRow, setEditRow] = useState<ServiceOperation | null>(null);
  const [form, setForm] = useState({
    issueId: '',
    productId: '',
    operationType: 'HARDWARE_VERIFICATION' as ServiceOperation['operationType'],
    description: '',
    findings: '',
    duration: 60,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' });

  // Operation type labels and filtering state
  const TYPE_LABELS: Record<ServiceOperation['operationType'], string> = {
    INITIAL_TEST: 'İlk Test',
    FABRICATION_TEST: 'Fabrikasyon Testi',
    HARDWARE_VERIFICATION: 'Donanım Doğrulama',
    CONFIGURATION: 'Konfigürasyon',
    PRE_TEST: 'Ön Test',
    REPAIR: 'Tamir',
    FINAL_TEST: 'Final Test',
    QUALITY_CHECK: 'Kalite Kontrolü',
  };

  const getTypeLabel = (t: ServiceOperation['operationType']) => TYPE_LABELS[t] || t;

  const [selectedType, setSelectedType] = useState<'ALL' | ServiceOperation['operationType']>('ALL');

  const token = useMemo(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || '', []);
  const authHeaders = useMemo(() => {
    const h: any = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3015/api/v1/service-operations', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Kayıtlar alınamadı');
        const data = await res.json();
        setRows(data.data?.items || data.data || []);
      } catch (e: any) {
        setError(e?.message || 'Veriler yüklenemedi');
      } finally { setLoading(false); }
    };
    load();
  }, [token]);

  const displayedRows = useMemo(() => {
    if (selectedType === 'ALL') return rows;
    return rows.filter(r => r.operationType === selectedType);
  }, [rows, selectedType]);

  const handleOpen = (row?: ServiceOperation) => {
    if (row) {
      setEditRow(row);
      setForm({
        issueId: row.issueId || '',
        productId: row.productId || '',
        operationType: row.operationType,
        description: row.description || '',
        findings: row.findings || '',
        duration: row.duration || 60,
      });
    } else {
      setEditRow(null);
      setForm({ issueId: '', productId: '', operationType: 'HARDWARE_VERIFICATION', description: '', findings: '', duration: 60 });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      let payload: any;
      
      if (editRow) {
        // Update payload - backend ServiceOperationUpdateSchema'ya uygun
        payload = {
          operationType: form.operationType,
          description: form.description || undefined,
          findings: form.findings || undefined,
          duration: Number(form.duration) || undefined,
          updatedBy: user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Default user ID
        };
      } else {
        // Create payload - backend ServiceOperationCreateSchema'ya uygun
        payload = {
          issueId: form.issueId || undefined,
          productId: form.productId || undefined,
          operationType: form.operationType,
          description: form.description || undefined,
          findings: form.findings || undefined,
          duration: Number(form.duration) || undefined,
          performedBy: user?.id || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Default user ID
        };
      }
      
      const url = editRow ? `http://localhost:3015/api/v1/service-operations/${editRow.id}` : 'http://localhost:3015/api/v1/service-operations';
      const method = editRow ? 'PUT' : 'POST';
      
      console.log('Sending payload:', payload);
      console.log('URL:', url);
      console.log('Method:', method);
      
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', errorText);
        throw new Error(`Kaydetme başarısız: ${res.status} - ${errorText}`);
      }
      
      setOpenDialog(false);
      
      // refresh
      const r = await fetch('http://localhost:3015/api/v1/service-operations', { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setRows(data.data?.items || data.data || []);
      setSnackbar({ open: true, msg: editRow ? 'Operasyon güncellendi' : 'Operasyon oluşturuldu', sev: 'success' });
    } catch (e: any) {
      console.error('Save error:', e);
      setSnackbar({ open: true, msg: e?.message || 'Kaydedilemedi', sev: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const ok = typeof window !== 'undefined' ? window.confirm('Silmek istediğinize emin misiniz?') : true;
      if (!ok) return;
      const res = await fetch(`http://localhost:3015/api/v1/service-operations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Silinemedi');
      setRows(prev => prev.filter(x => x.id !== id));
      setSnackbar({ open: true, msg: 'Operasyon silindi', sev: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, msg: e?.message || 'Silinemedi', sev: 'error' });
    }
  };

  const handleExport = () => {
    try {
      // CSV formatında veri hazırla
      const csvData = [
        ['Operasyon ID', 'Operasyon Türü', 'Açıklama', 'Bulgular', 'Süre (dk)', 'Oluşturulma Tarihi'],
        ...displayedRows.map(op => [
          op.id,
          getTypeLabel(op.operationType),
          op.description || 'N/A',
          op.findings || 'N/A',
          op.duration?.toString() || 'N/A',
          new Date(op.createdAt).toLocaleDateString('tr-TR')
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
      link.setAttribute('download', `servis-operasyonlari-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({ open: true, msg: 'Servis operasyonları raporu başarıyla dışa aktarıldı', sev: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({ open: true, msg: 'Dışa aktarma sırasında hata oluştu', sev: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Servis Operasyonları</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<GetAppIcon />} onClick={handleExport}>
              DIŞA AKTAR
            </Button>
            <Button variant="contained" onClick={() => handleOpen()}>Yeni Operasyon</Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2 }}>
          {/* Type filter chips */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Tümü"
              color={selectedType === 'ALL' ? 'primary' : 'default'}
              variant={selectedType === 'ALL' ? 'filled' : 'outlined'}
              onClick={() => setSelectedType('ALL')}
            />
            {(
              [
                'INITIAL_TEST',
                'FABRICATION_TEST',
                'HARDWARE_VERIFICATION',
                'CONFIGURATION',
                'PRE_TEST',
                'REPAIR',
                'FINAL_TEST',
                'QUALITY_CHECK',
              ] as ServiceOperation['operationType'][]
            ).map((t) => (
              <Chip
                key={t}
                label={getTypeLabel(t)}
                color={selectedType === t ? 'primary' : 'default'}
                variant={selectedType === t ? 'filled' : 'outlined'}
                onClick={() => setSelectedType(t)}
              />
            ))}
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tür</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Bulgular</TableCell>
                <TableCell>Süre (dk)</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRows.map((op) => (
                <TableRow key={op.id} hover>
                  <TableCell>
                    <Chip size="small" label={getTypeLabel(op.operationType)}
                      color={
                        op.operationType === 'REPAIR' ? 'warning' : 
                        op.operationType === 'FINAL_TEST' ? 'success' : 
                        op.operationType === 'HARDWARE_VERIFICATION' ? 'primary' :
                        op.operationType === 'CONFIGURATION' ? 'secondary' :
                        op.operationType === 'QUALITY_CHECK' ? 'info' :
                        'default'
                      }
                      onClick={() => setSelectedType(op.operationType)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>{op.description || '-'}</TableCell>
                  <TableCell>{op.findings || '-'}</TableCell>
                  <TableCell>{op.duration || '-'}</TableCell>
                  <TableCell>{new Date(op.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleOpen(op)}>Düzenle</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(op.id)}>Sil</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editRow ? 'Operasyon Düzenle' : 'Yeni Operasyon'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tür</InputLabel>
                  <Select label="Tür" value={form.operationType} onChange={(e) => setForm(s => ({ ...s, operationType: e.target.value as any }))}>
                    <MenuItem value="INITIAL_TEST">İlk Test</MenuItem>
                    <MenuItem value="FABRICATION_TEST">Fabrikasyon Testi</MenuItem>
                    <MenuItem value="HARDWARE_VERIFICATION">Donanım Doğrulama</MenuItem>
                    <MenuItem value="CONFIGURATION">Konfigürasyon</MenuItem>
                    <MenuItem value="PRE_TEST">Ön Test</MenuItem>
                    <MenuItem value="REPAIR">Tamir</MenuItem>
                    <MenuItem value="FINAL_TEST">Final Test</MenuItem>
                    <MenuItem value="QUALITY_CHECK">Kalite Kontrolü</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Açıklama" value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Bulgular" multiline minRows={2} value={form.findings} onChange={(e) => setForm(s => ({ ...s, findings: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Süre (dk)" value={form.duration} onChange={(e) => setForm(s => ({ ...s, duration: Number(e.target.value) }))} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSave}>Kaydet</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.sev} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.msg}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

// End of simple CRUD implementation for service operations
export default ServiceOperationsPage;
