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
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface Issue {
  id: string;
  issueNumber: string;
  source: string;
  status: string;
  priority: string;
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty: boolean;
  estimatedCost?: number;
  actualCost?: number;
  issueDate: string;
  company: {
    name: string;
  } | null;
  category: {
    name: string;
  } | null;
  createdByUser: {
    firstName: string;
    lastName: string;
  };
}

interface IssueFilter {
  status?: string;
  source?: string;
  priority?: string;
  search?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'WAITING_CUSTOMER_APPROVAL':
      return 'secondary';
    case 'REPAIRED':
      return 'success';
    case 'CLOSED':
      return 'default';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'Açık';
    case 'IN_PROGRESS':
      return 'İşlemde';
    case 'WAITING_CUSTOMER_APPROVAL':
      return 'Müşteri Onayı Bekliyor';
    case 'REPAIRED':
      return 'Tamir Edildi';
    case 'CLOSED':
      return 'Kapalı';
    case 'CANCELLED':
      return 'İptal Edildi';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'Kritik';
    case 'HIGH':
      return 'Yüksek';
    case 'MEDIUM':
      return 'Orta';
    case 'LOW':
      return 'Düşük';
    default:
      return priority;
  }
};

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'CUSTOMER':
      return 'Müşteri';
    case 'TSP':
      return 'TSP';
    case 'FIRST_PRODUCTION':
      return 'İlk Üretim';
    default:
      return source;
  }
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<IssueFilter>({});
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPreInspectionDialog, setOpenPreInspectionDialog] = useState(false);
  const [openCompleteRepairDialog, setOpenCompleteRepairDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Mock data - gerçek API'den gelecek
  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        id: '1',
        issueNumber: '250117-01',
        source: 'CUSTOMER',
        status: 'OPEN',
        priority: 'HIGH',
        customerDescription: 'Cihaz çalışmıyor, güç gelmiyor',
        isUnderWarranty: true,
        issueDate: '2025-01-17',
        company: { name: 'ABC Şirketi' },
        category: { name: 'Donanım Arızası' },
        createdByUser: { firstName: 'Ahmet', lastName: 'Yılmaz' },
      },
      {
        id: '2',
        issueNumber: '250117-02',
        source: 'FIRST_PRODUCTION',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        technicianDescription: 'Fabrikasyon testinde başarısız',
        isUnderWarranty: false,
        estimatedCost: 500,
        issueDate: '2025-01-17',
        company: null,
        category: { name: 'Test Hatası' },
        createdByUser: { firstName: 'Mehmet', lastName: 'Kaya' },
      },
      {
        id: '3',
        issueNumber: '250116-03',
        source: 'CUSTOMER',
        status: 'REPAIRED',
        priority: 'LOW',
        customerDescription: 'Yazılım güncelleme gerekiyor',
        technicianDescription: 'Yazılım güncellendi, test edildi',
        isUnderWarranty: true,
        actualCost: 0,
        issueDate: '2025-01-16',
        company: { name: 'XYZ Ltd.' },
        category: { name: 'Yazılım Sorunu' },
        createdByUser: { firstName: 'Fatma', lastName: 'Demir' },
      },
    ];

    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateIssue = () => {
    setOpenCreateDialog(true);
  };

  const handlePreInspection = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenPreInspectionDialog(true);
  };

  const handleCompleteRepair = (issue: Issue) => {
    setSelectedIssue(issue);
    setOpenCompleteRepairDialog(true);
  };

  const filteredIssues = issues.filter(issue => {
    if (filter.status && issue.status !== filter.status) return false;
    if (filter.source && issue.source !== filter.source) return false;
    if (filter.priority && issue.priority !== filter.priority) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        issue.issueNumber.toLowerCase().includes(search) ||
        issue.customerDescription?.toLowerCase().includes(search) ||
        issue.technicianDescription?.toLowerCase().includes(search) ||
        issue.company?.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getIssueStats = () => {
    const stats = {
      open: issues.filter(i => i.status === 'OPEN').length,
      inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
      repaired: issues.filter(i => i.status === 'REPAIRED').length,
      closed: issues.filter(i => i.status === 'CLOSED').length,
    };
    return stats;
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

  const stats = getIssueStats();

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Arıza Yönetimi
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateIssue}
          >
            Yeni Arıza Kaydı
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* İstatistikler */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {stats.open}
              </Typography>
              <Typography variant="body2">Açık Arızalar</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2">İşlemde</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {stats.repaired}
              </Typography>
              <Typography variant="body2">Tamir Edildi</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {stats.closed}
              </Typography>
              <Typography variant="body2">Kapalı</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Arama"
                placeholder="Arıza numarası, açıklama..."
                value={filter.search || ''}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filter.status || ''}
                  label="Durum"
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="OPEN">Açık</MenuItem>
                  <MenuItem value="IN_PROGRESS">İşlemde</MenuItem>
                  <MenuItem value="WAITING_CUSTOMER_APPROVAL">Müşteri Onayı Bekliyor</MenuItem>
                  <MenuItem value="REPAIRED">Tamir Edildi</MenuItem>
                  <MenuItem value="CLOSED">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Kaynak</InputLabel>
                <Select
                  value={filter.source || ''}
                  label="Kaynak"
                  onChange={(e) => setFilter({ ...filter, source: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="TSP">TSP</MenuItem>
                  <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={filter.priority || ''}
                  label="Öncelik"
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="LOW">Düşük</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Arıza Tablosu */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Arıza No</TableCell>
                <TableCell>Kaynak</TableCell>
                <TableCell>Müşteri</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Öncelik</TableCell>
                <TableCell>Garanti</TableCell>
                <TableCell>Tahmini Maliyet</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {issue.issueNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getSourceLabel(issue.source)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {issue.company?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(issue.status)}
                      color={getStatusColor(issue.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(issue.priority)}
                      color={getPriorityColor(issue.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.isUnderWarranty ? 'Garanti' : 'Ücretli'}
                      color={issue.isUnderWarranty ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {issue.estimatedCost ? `${issue.estimatedCost} TL` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(issue.issueDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handlePreInspection(issue)}
                      disabled={issue.status !== 'OPEN'}
                      title="Ön Muayene"
                    >
                      <InfoIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCompleteRepair(issue)}
                      disabled={issue.status !== 'IN_PROGRESS'}
                      title="Tamir Tamamla"
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

        {/* Yeni Arıza Kaydı Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Yeni Arıza Kaydı</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Kaynak</InputLabel>
                  <Select label="Kaynak">
                    <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                    <MenuItem value="TSP">TSP</MenuItem>
                    <MenuItem value="FIRST_PRODUCTION">İlk Üretim</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select label="Öncelik">
                    <MenuItem value="LOW">Düşük</MenuItem>
                    <MenuItem value="MEDIUM">Orta</MenuItem>
                    <MenuItem value="HIGH">Yüksek</MenuItem>
                    <MenuItem value="CRITICAL">Kritik</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Müşteri</InputLabel>
                  <Select label="Müşteri">
                    <MenuItem value="1">ABC Şirketi</MenuItem>
                    <MenuItem value="2">XYZ Ltd.</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Arıza Kategorisi</InputLabel>
                  <Select label="Arıza Kategorisi">
                    <MenuItem value="1">Donanım Arızası</MenuItem>
                    <MenuItem value="2">Yazılım Sorunu</MenuItem>
                    <MenuItem value="3">Test Hatası</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Müşteri Açıklaması"
                  multiline
                  rows={3}
                  placeholder="Arıza detaylarını açıklayın..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tahmini Maliyet (TL)"
                  type="number"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained">Oluştur</Button>
          </DialogActions>
        </Dialog>

        {/* Ön Muayene Dialog */}
        <Dialog open={openPreInspectionDialog} onClose={() => setOpenPreInspectionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Ön Muayene</DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Arıza No: {selectedIssue.issueNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teknisyen Açıklaması"
                    multiline
                    rows={4}
                    placeholder="Ön muayene bulgularını ve yapılacak işlemleri açıklayın..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Garanti Kapsamında mı?</InputLabel>
                    <Select label="Garanti Kapsamında mı?">
                      <MenuItem value="true">Evet</MenuItem>
                      <MenuItem value="false">Hayır</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tahmini Maliyet (TL)"
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPreInspectionDialog(false)}>İptal</Button>
            <Button variant="contained">Tamamla</Button>
          </DialogActions>
        </Dialog>

        {/* Tamir Tamamlama Dialog */}
        <Dialog open={openCompleteRepairDialog} onClose={() => setOpenCompleteRepairDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Tamir Tamamlama</DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Arıza No: {selectedIssue.issueNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teknisyen Açıklaması"
                    multiline
                    rows={4}
                    placeholder="Yapılan işlemleri ve sonuçları açıklayın..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gerçek Maliyet (TL)"
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCompleteRepairDialog(false)}>İptal</Button>
            <Button variant="contained">Tamamla</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
