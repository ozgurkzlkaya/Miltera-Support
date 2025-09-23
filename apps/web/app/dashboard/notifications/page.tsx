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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
  Badge,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    info: number;
    warning: number;
    error: number;
    success: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Yüksek';
    case 'medium':
      return 'Orta';
    case 'low':
      return 'Düşük';
    default:
      return priority;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'info':
      return 'Bilgi';
    case 'warning':
      return 'Uyarı';
    case 'error':
      return 'Hata';
    case 'success':
      return 'Başarı';
    default:
      return type;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    category: 'general'
  });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Gerçek veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Gerçek API'den bildirimleri çek
        const response = await fetch('http://localhost:3011/api/v1/notifications', { headers });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data || []);
          
          // İstatistikleri hesapla
          const notifications = data.data || [];
          const stats: NotificationStats = {
            total: notifications.length,
            unread: notifications.filter((n: Notification) => !n.isRead).length,
            byType: {
              info: notifications.filter((n: Notification) => n.type === 'info').length,
              warning: notifications.filter((n: Notification) => n.type === 'warning').length,
              error: notifications.filter((n: Notification) => n.type === 'error').length,
              success: notifications.filter((n: Notification) => n.type === 'success').length,
            },
            byPriority: {
              low: notifications.filter((n: Notification) => n.priority === 'low').length,
              medium: notifications.filter((n: Notification) => n.priority === 'medium').length,
              high: notifications.filter((n: Notification) => n.priority === 'high').length,
            }
          };
          setStats(stats);
        } else {
          // API yoksa boş veri
          setNotifications([]);
          setStats({
            total: 0,
            unread: 0,
            byType: { info: 0, warning: 0, error: 0, success: 0 },
            byPriority: { low: 0, medium: 0, high: 0 }
          });
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Bildirimler yüklenirken bir hata oluştu');
        // Hata durumunda boş veri
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          byType: { info: 0, warning: 0, error: 0, success: 0 },
          byPriority: { low: 0, medium: 0, high: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateNotification = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      category: 'general'
    });
    setOpenCreateDialog(true);
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setOpenViewDialog(true);
    
    // Mark as read
    if (!notification.isRead) {
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        unread: prev.unread - 1
      } : null);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSnackbar({
        open: true,
        message: 'Bildirim başarıyla silindi',
        severity: 'success'
      });
    }
  };

  const handleSaveNotification = () => {
    if (!formData.title || !formData.message) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      type: formData.type as any,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: formData.priority as any,
      category: formData.category,
      sender: {
        id: '1',
        name: 'Mevcut Kullanıcı'
      }
    };

    setNotifications(prev => [newNotification, ...prev]);
    setOpenCreateDialog(false);
    setSnackbar({
      open: true,
      message: `Bildirim "${newNotification.title}" başarıyla oluşturuldu`,
      severity: 'success'
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setStats(prev => prev ? { ...prev, unread: 0 } : null);
    setSnackbar({
      open: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      severity: 'success'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true; // all
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
            Bildirimler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MarkAsUnreadIcon />}
              onClick={handleMarkAllAsRead}
            >
              Tümünü Okundu İşaretle
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNotification}
            >
              Yeni Bildirim
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Toplam Bildirim
                      </Typography>
                      <Typography variant="h4">
                        {stats.total}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge badgeContent={stats.unread} color="error">
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <NotificationsActiveIcon />
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Okunmamış
                      </Typography>
                      <Typography variant="h4">
                        {stats.unread}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Yüksek Öncelik
                      </Typography>
                      <Typography variant="h4">
                        {stats.byPriority.high}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Başarılı İşlemler
                      </Typography>
                      <Typography variant="h4">
                        {stats.byType.success}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Filtrele:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filter}
                  label="Durum"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="unread">Okunmamış</MenuItem>
                  <MenuItem value="read">Okunmuş</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bildirim</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Gönderen</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow 
                    key={notification.id}
                    sx={{ 
                      backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewNotification(notification)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 300 }}>
                          {notification.message}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(notification.type)}
                        label={getTypeLabel(notification.type)}
                        color={getTypeColor(notification.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(notification.priority)}
                        color={getPriorityColor(notification.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{notification.category}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {notification.sender.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {notification.sender.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(notification.createdAt).toLocaleString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.isRead ? 'Okundu' : 'Okunmadı'}
                        color={notification.isRead ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewNotification(notification);
                        }}
                        title="Detay Görüntüle"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        sx={{ color: 'error.main' }}
                        title="Sil"
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

        {/* Create Notification Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Başlık *"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mesaj *"
                  required
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tür *</InputLabel>
                  <Select
                    label="Tür *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="info">Bilgi</MenuItem>
                    <MenuItem value="warning">Uyarı</MenuItem>
                    <MenuItem value="error">Hata</MenuItem>
                    <MenuItem value="success">Başarı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik *</InputLabel>
                  <Select
                    label="Öncelik *"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="low">Düşük</MenuItem>
                    <MenuItem value="medium">Orta</MenuItem>
                    <MenuItem value="high">Yüksek</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kategori"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveNotification}>Oluştur</Button>
          </DialogActions>
        </Dialog>

        {/* View Notification Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedNotification && getTypeIcon(selectedNotification.type)}
              {selectedNotification?.title}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedNotification && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Tür
                    </Typography>
                    <Chip
                      icon={getTypeIcon(selectedNotification.type)}
                      label={getTypeLabel(selectedNotification.type)}
                      color={getTypeColor(selectedNotification.type) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Öncelik
                    </Typography>
                    <Chip
                      label={getPriorityLabel(selectedNotification.priority)}
                      color={getPriorityColor(selectedNotification.priority) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Kategori
                    </Typography>
                    <Typography variant="body1">
                      {selectedNotification.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Gönderen
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {selectedNotification.sender.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1">
                        {selectedNotification.sender.name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Oluşturulma Tarihi
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedNotification.createdAt).toLocaleString('tr-TR')}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Mesaj
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedNotification.message}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
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
      </Box>
    </Layout>
  );
}
