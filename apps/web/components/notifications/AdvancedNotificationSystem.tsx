'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Avatar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Tooltip,
  Fade,
  Slide,
  Zoom,
  Collapse,
  Paper,
  Stack,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  BugReport as IssueIcon,
  Inventory as ProductIcon,
  LocalShipping as ShipmentIcon,
  Business as CompanyIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PushPin as PushPinIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiClient } from '../../lib/api';

export interface AdvancedNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  pinned: boolean;
  starred: boolean;
  action?: {
    label: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  category: 'system' | 'issue' | 'product' | 'shipment' | 'user' | 'security' | 'performance' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  metadata?: {
    issueId?: string;
    productId?: string;
    shipmentId?: string;
    userId?: string;
    companyId?: string;
    [key: string]: any;
  };
  channels: ('in-app' | 'email' | 'sms' | 'push')[];
  expiresAt?: Date;
  tags?: string[];
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    system: boolean;
    issue: boolean;
    product: boolean;
    shipment: boolean;
    user: boolean;
    security: boolean;
    performance: boolean;
    maintenance: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface NotificationContextType {
  notifications: AdvancedNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<AdvancedNotification, 'id' | 'timestamp' | 'read' | 'archived' | 'pinned' | 'starred'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  unarchiveNotification: (id: string) => void;
  pinNotification: (id: string) => void;
  unpinNotification: (id: string) => void;
  starNotification: (id: string) => void;
  unstarNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getNotificationsByCategory: (category: string) => AdvancedNotification[];
  getNotificationsByPriority: (priority: string) => AdvancedNotification[];
  searchNotifications: (query: string) => AdvancedNotification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useAdvancedNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useAdvancedNotifications must be used within an AdvancedNotificationProvider');
  }
  return context;
};

interface AdvancedNotificationProviderProps {
  children: React.ReactNode;
}

export const AdvancedNotificationProvider: React.FC<AdvancedNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdvancedNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
    categories: {
      system: true,
      issue: true,
      product: true,
      shipment: true,
      user: true,
      security: true,
      performance: true,
      maintenance: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    frequency: 'immediate',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  // WebSocket bağlantısı için
  useEffect(() => {
    // TODO: WebSocket bağlantısı kurulacak
    const connectWebSocket = () => {
      // WebSocket bağlantısı
    };

    connectWebSocket();
  }, []);

  // Örnek bildirimler ekle
  useEffect(() => {
    const sampleNotifications: AdvancedNotification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Yüksek Arıza Oranı',
        message: 'Son 24 saatte 5 yeni arıza kaydı oluşturuldu',
        description: 'Sistem performansını kontrol etmek için dashboard\'u inceleyin.',
        timestamp: new Date(),
        read: false,
        archived: false,
        pinned: false,
        starred: false,
        category: 'issue',
        priority: 'high',
        source: 'Sistem',
        channels: ['in-app', 'email'],
        tags: ['performance', 'issues'],
        action: {
          label: 'Dashboard\'a Git',
          onClick: () => window.location.href = '/dashboard',
          color: 'primary',
        },
      },
      {
        id: '2',
        type: 'info',
        title: 'Sistem Güncellemesi',
        message: 'Yeni özellikler eklendi: Gelişmiş raporlama ve analitik',
        description: 'Dashboard\'da yeni analitik araçları kullanabilirsiniz.',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        archived: false,
        pinned: true,
        starred: false,
        category: 'system',
        priority: 'medium',
        source: 'Geliştirme Ekibi',
        channels: ['in-app'],
        tags: ['update', 'features'],
      },
      {
        id: '3',
        type: 'critical',
        title: 'Kritik Sistem Hatası',
        message: 'Veritabanı bağlantısında sorun tespit edildi',
        description: 'Sistem yöneticisi ile iletişime geçin.',
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        archived: false,
        pinned: false,
        starred: true,
        category: 'security',
        priority: 'critical',
        source: 'Sistem',
        channels: ['in-app', 'email', 'sms'],
        tags: ['critical', 'database'],
        action: {
          label: 'Teknik Destek',
          onClick: () => window.open('mailto:destek@miltera.com.tr'),
          color: 'error',
        },
      },
      {
        id: '4',
        type: 'success',
        title: 'Arıza Çözüldü',
        message: 'Arıza #12345 başarıyla çözüldü',
        description: 'Müşteri memnuniyet anketi gönderildi.',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        archived: false,
        pinned: false,
        starred: false,
        category: 'issue',
        priority: 'medium',
        source: 'Teknisyen: Ahmet Yılmaz',
        channels: ['in-app', 'email'],
        tags: ['resolved', 'customer'],
        metadata: {
          issueId: '12345',
          technicianId: 'tech-001',
        },
      },
    ];

    setNotifications(sampleNotifications);
  }, []);

  const addNotification = useCallback((notification: Omit<AdvancedNotification, 'id' | 'timestamp' | 'read' | 'archived' | 'pinned' | 'starred'>) => {
    const newNotification: AdvancedNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      archived: false,
      pinned: false,
      starred: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Snackbar göster
    if (settings.inApp) {
      setSnackbar({
        open: true,
        message: notification.message,
        severity: notification.type,
      });
    }

    // Diğer kanallara gönder
    if (settings.email && notification.channels.includes('email')) {
      // TODO: Email gönder
    }
    if (settings.sms && notification.channels.includes('sms')) {
      // TODO: SMS gönder
    }
    if (settings.push && notification.channels.includes('push')) {
      // TODO: Push notification gönder
    }
  }, [settings]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
  }, []);

  const unarchiveNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: false } : n)
    );
  }, []);

  const pinNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, pinned: true } : n)
    );
  }, []);

  const unpinNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, pinned: false } : n)
    );
  }, []);

  const starNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, starred: true } : n)
    );
  }, []);

  const unstarNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, starred: false } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category && !n.archived);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: string) => {
    return notifications.filter(n => n.priority === priority && !n.archived);
  }, [notifications]);

  const searchNotifications = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return notifications.filter(n => 
      !n.archived && (
        n.title.toLowerCase().includes(lowercaseQuery) ||
        n.message.toLowerCase().includes(lowercaseQuery) ||
        n.description?.toLowerCase().includes(lowercaseQuery) ||
        n.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  }, [notifications]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    archiveNotification,
    unarchiveNotification,
    pinNotification,
    unpinNotification,
    starNotification,
    unstarNotification,
    clearAll,
    updateSettings,
    getNotificationsByCategory,
    getNotificationsByPriority,
    searchNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

interface AdvancedNotificationBellProps {
  className?: string;
}

export const AdvancedNotificationBell: React.FC<AdvancedNotificationBellProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    archiveNotification,
    pinNotification,
    unpinNotification,
    starNotification,
    unstarNotification,
    getNotificationsByCategory,
    getNotificationsByPriority,
    searchNotifications,
  } = useAdvancedNotifications();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications.filter(n => showArchived ? true : !n.archived);

    if (searchQuery) {
      filtered = searchNotifications(searchQuery);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(n => n.category === filterCategory);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Pinned notifications first, then by timestamp
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'issue': return <IssueIcon />;
      case 'product': return <ProductIcon />;
      case 'shipment': return <ShipmentIcon />;
      case 'user': return <PersonIcon />;
      case 'security': return <SecurityIcon />;
      case 'performance': return <AssessmentIcon />;
      case 'maintenance': return <TimelineIcon />;
      default: return <InfoIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'critical': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        className={className}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Bildirimler</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
              <IconButton size="small" onClick={markAllAsRead}>
                <MarkReadIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={filterCategory}
                label="Kategori"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="system">Sistem</MenuItem>
                <MenuItem value="issue">Arıza</MenuItem>
                <MenuItem value="product">Ürün</MenuItem>
                <MenuItem value="shipment">Kargo</MenuItem>
                <MenuItem value="user">Kullanıcı</MenuItem>
                <MenuItem value="security">Güvenlik</MenuItem>
                <MenuItem value="performance">Performans</MenuItem>
                <MenuItem value="maintenance">Bakım</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={filterPriority}
                label="Öncelik"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="critical">Kritik</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="low">Düşük</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            size="small"
            placeholder="Bildirim ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Bildirim bulunamadı'}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.pinned ? '4px solid' : 'none',
                      borderLeftColor: notification.pinned ? 'primary.main' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {getCategoryIcon(notification.category)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </Typography>
                          {notification.pinned && <PushPinIcon fontSize="small" color="primary" />}
                          {notification.starred && <StarIcon fontSize="small" color="warning" />}
                          <Chip
                            label={notification.priority}
                            color={getPriorityColor(notification.priority) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: tr })}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title={notification.starred ? 'Yıldızı Kaldır' : 'Yıldızla'}>
                                <IconButton
                                  size="small"
                                  onClick={() => notification.starred ? unstarNotification(notification.id) : starNotification(notification.id)}
                                >
                                  {notification.starred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={notification.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}>
                                <IconButton
                                  size="small"
                                  onClick={() => notification.pinned ? unpinNotification(notification.id) : pinNotification(notification.id)}
                                >
                                  <PushPinIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Arşivle">
                                <IconButton
                                  size="small"
                                  onClick={() => archiveNotification(notification.id)}
                                >
                                  <ArchiveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => removeNotification(notification.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(notification.type)}
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      )}
                    </Box>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setShowArchived(!showArchived);
            }}
          >
            {showArchived ? 'Aktif Bildirimler' : 'Arşivlenmiş Bildirimler'}
          </Button>
        </Box>
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bildirim Ayarları</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Bildirim Kanalları
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Uygulama İçi Bildirimler"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="E-posta Bildirimleri"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="SMS Bildirimleri"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Push Bildirimleri"
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Kategori Ayarları
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Sistem Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Arıza Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Ürün Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Kargo Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Kullanıcı Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Güvenlik Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Performans Bildirimleri" />
                <FormControlLabel control={<Switch defaultChecked />} label="Bakım Bildirimleri" />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Sessiz Saatler
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Sessiz Saatleri Etkinleştir"
                />
                <TextField
                  size="small"
                  type="time"
                  label="Başlangıç"
                  defaultValue="22:00"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="time"
                  label="Bitiş"
                  defaultValue="08:00"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Bildirim Sıklığı
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Bildirim Sıklığı</InputLabel>
                <Select defaultValue="immediate" label="Bildirim Sıklığı">
                  <MenuItem value="immediate">Anında</MenuItem>
                  <MenuItem value="hourly">Saatlik</MenuItem>
                  <MenuItem value="daily">Günlük</MenuItem>
                  <MenuItem value="weekly">Haftalık</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>İptal</Button>
          <Button variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
