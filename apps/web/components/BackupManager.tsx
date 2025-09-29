"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  tables: string[];
  recordCounts: Record<string, number>;
}

interface BackupOptions {
  includeUsers: boolean;
  includeAuditLogs: boolean;
  includePerformanceMetrics: boolean;
  compression: boolean;
}

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeUsers: false,
    includeAuditLogs: false,
    includePerformanceMetrics: false,
    compression: true,
  });
  const [cleanupDays, setCleanupDays] = useState(30);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/backup/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      } else {
        throw new Error('Failed to load backups');
      }
    } catch (error) {
      console.error('Error loading backups:', error);
      showSnackbar('Yedekler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createFullBackup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/backup/full', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: backupOptions }),
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar('Yedek başarıyla oluşturuldu', 'success');
        setShowCreateDialog(false);
        loadBackups();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showSnackbar('Yedek oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createTableBackup = async (tableName: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/backup/table/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: backupOptions }),
      });

      if (response.ok) {
        showSnackbar(`${tableName} tablosu için yedek oluşturuldu`, 'success');
        loadBackups();
      } else {
        throw new Error('Failed to create table backup');
      }
    } catch (error) {
      console.error('Error creating table backup:', error);
      showSnackbar('Tablo yedeği oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/backup/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSnackbar('Yedek silindi', 'success');
        loadBackups();
      } else {
        throw new Error('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      showSnackbar('Yedek silinirken hata oluştu', 'error');
    }
  };

  const cleanupOldBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/backup/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keepDays: cleanupDays }),
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(`${data.deletedCount} eski yedek temizlendi`, 'success');
        setShowCleanupDialog(false);
        loadBackups();
      } else {
        throw new Error('Failed to cleanup backups');
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error);
      showSnackbar('Eski yedekler temizlenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('tr-TR');
  };

  const tables = [
    'products',
    'issues',
    'serviceOperations',
    'shipments',
    'companies',
    'users',
    'comments',
    'mentions',
    'notifications',
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          Yedek Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={loadBackups} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setShowCreateDialog(true)}
            disabled={loading}
          >
            Yeni Yedek
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setShowCleanupDialog(true)}
            disabled={loading}
          >
            Temizle
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BackupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {backups.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Yedek
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Boyut
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {backups.filter(b => new Date(b.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Son 24 Saat
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InfoIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {tables.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tablo Sayısı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Backups Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Yedek Listesi
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Dosya Adı</TableCell>
                  <TableCell>Boyut</TableCell>
                  <TableCell>Oluşturulma Tarihi</TableCell>
                  <TableCell>Tablolar</TableCell>
                  <TableCell>Kayıt Sayıları</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {backup.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>{formatDate(backup.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {backup.tables.slice(0, 3).map((table) => (
                          <Chip key={table} label={table} size="small" />
                        ))}
                        {backup.tables.length > 3 && (
                          <Chip label={`+${backup.tables.length - 3}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Object.values(backup.recordCounts).reduce((a, b) => a + b, 0)} kayıt
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="İndir">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            onClick={() => deleteBackup(backup.filename)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Yeni Yedek Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Yedek Seçenekleri
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupOptions.includeUsers}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeUsers: e.target.checked }))}
                />
              }
              label="Kullanıcıları dahil et"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupOptions.includeAuditLogs}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeAuditLogs: e.target.checked }))}
                />
              }
              label="Audit loglarını dahil et"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupOptions.includePerformanceMetrics}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includePerformanceMetrics: e.target.checked }))}
                />
              }
              label="Performans metriklerini dahil et"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupOptions.compression}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, compression: e.target.checked }))}
                />
              }
              label="Sıkıştırma kullan"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tablo Yedekleri
            </Typography>
            <Grid container spacing={1}>
              {tables.map((table) => (
                <Grid item xs={12} sm={6} md={4} key={table}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => createTableBackup(table)}
                    disabled={loading}
                    sx={{ width: '100%' }}
                  >
                    {table}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={createFullBackup}
            disabled={loading}
          >
            Tam Yedek Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cleanup Dialog */}
      <Dialog
        open={showCleanupDialog}
        onClose={() => setShowCleanupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eski Yedekleri Temizle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Kaç günlük yedekleri sakla"
              type="number"
              value={cleanupDays}
              onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
              inputProps={{ min: 1, max: 365 }}
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              Bu işlem geri alınamaz. {cleanupDays} günden eski tüm yedekler silinecektir.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCleanupDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={cleanupOldBackups}
            disabled={loading}
          >
            Temizle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BackupManager;
