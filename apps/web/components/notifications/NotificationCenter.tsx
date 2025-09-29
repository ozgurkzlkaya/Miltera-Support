'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
  Fade,
  Zoom,
  Collapse,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  PriorityHigh as PriorityHighIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useWebSocket, requestNotificationPermission } from '../../lib/websocket';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Priority icon mapping
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent':
      return <PriorityHighIcon color="error" />;
    case 'high':
      return <WarningIcon color="warning" />;
    case 'medium':
      return <InfoIcon color="info" />;
    case 'low':
      return <CheckCircleIcon color="success" />;
    default:
      return <InfoIcon color="info" />;
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

// Type icon mapping
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'issue_status_change':
      return <ErrorIcon />;
    case 'product_status_change':
      return <InfoIcon />;
    case 'shipment_update':
      return <CheckCircleIcon />;
    case 'system_alert':
      return <WarningIcon />;
    default:
      return <InfoIcon />;
  }
};

interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  autoArchive: boolean;
  archiveAfterDays: number;
}

export const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [criticalCount, setCriticalCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    browserNotifications: true,
    soundEnabled: true,
    autoArchive: true,
    archiveAfterDays: 30,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearNotifications,
  } = useWebSocket();

  const open = Boolean(anchorEl);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
    
    // Check notification permission on mount
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  }, []);

  // Update critical count
  useEffect(() => {
    const critical = notifications.filter(n => 
      n.priority === 'urgent' && !n.read
    ).length;
    setCriticalCount(critical);
  }, [notifications]);

  // Play notification sound
  const playNotificationSound = (priority: string) => {
    if (!settings.soundEnabled) return;
    
    try {
      const audio = new Audio();
      switch (priority) {
        case 'critical':
          audio.src = '/sounds/critical.mp3';
          break;
        case 'high':
          audio.src = '/sounds/high.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.data?.id || notification.timestamp);
    
    // Play sound for critical notifications
    if (notification.priority === 'critical') {
      playNotificationSound('critical');
    }
    
    // Handle navigation based on notification type
    if (notification.data?.issueId) {
      // Navigate to issue detail
      window.location.href = `/dashboard/issues/${notification.data.issueId}`;
    } else if (notification.data?.productId) {
      // Navigate to product detail
      window.location.href = `/dashboard/products/${notification.data.productId}`;
    } else if (notification.data?.shipmentId) {
      // Navigate to shipment detail
      window.location.href = `/dashboard/shipments/${notification.data.shipmentId}`;
    }
    
    handleClose();
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      // Mark all notifications as read
      notifications.forEach(notification => {
        if (!notification.read) {
          markAsRead(notification.data?.id || notification.timestamp);
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Bildirimler işaretlenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveAll = () => {
    // Archive all read notifications
    const archivedNotifications = notifications.filter(n => n.read);
    // This would typically call an API to archive notifications
    console.log('Archiving notifications:', archivedNotifications);
    
    setSnackbar({
      open: true,
      message: 'Okunmuş bildirimler arşivlendi',
      severity: 'success',
    });
  };

  const handleClearAll = () => {
    clearNotifications();
    setSnackbar({
      open: true,
      message: 'Tüm bildirimler temizlendi',
      severity: 'success',
    });
    handleClose();
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Refresh notifications from server
      // This would typically call an API to fetch latest notifications
      console.log('Refreshing notifications...');
      
      setSnackbar({
        open: true,
        message: 'Bildirimler yenilendi',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Bildirimler yenilenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: tr 
      });
    } catch {
      return 'Az önce';
    }
  };

  const visibleNotifications = expanded ? notifications : notifications.slice(0, 10);

  return (
    <>
      <Tooltip title={`${unreadCount} okunmamış bildirim${unreadCount !== 1 ? '' : ''}`}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ position: 'relative' }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color={criticalCount > 0 ? "error" : "primary"}
            max={99}
          >
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Bildirimler
              {criticalCount > 0 && (
                <Chip
                  label={`${criticalCount} Kritik`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Yenile">
                <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                  {loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Ayarlar">
                <IconButton size="small" onClick={() => setShowSettings(!showSettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                Tümünü Okundu İşaretle
              </Button>
            )}
            {notifications.length > 0 && (
              <>
                <Button 
                  size="small" 
                  startIcon={<ArchiveIcon />}
                  onClick={handleArchiveAll}
                >
                  Arşivle
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={handleClearAll}
                >
                  Temizle
                </Button>
              </>
            )}
          </Box>
          
          {notificationPermission !== 'granted' && (
            <Alert 
              severity="info" 
              sx={{ mt: 1 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRequestPermission}
                >
                  İzin Ver
                </Button>
              }
            >
              Tarayıcı bildirimlerini etkinleştirin
            </Alert>
          )}
        </Box>

        {showSettings && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Bildirim Ayarları
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                size="small"
                variant={settings.browserNotifications ? "contained" : "outlined"}
                onClick={() => {
                  const newSettings = { ...settings, browserNotifications: !settings.browserNotifications };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                Tarayıcı Bildirimleri
              </Button>
              <Button
                size="small"
                variant={settings.soundEnabled ? "contained" : "outlined"}
                onClick={() => {
                  const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                Ses Bildirimleri
              </Button>
            </Box>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {visibleNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Bildirim yok"
                secondary="Yeni bildirimler burada görünecek"
              />
            </ListItem>
          ) : (
            visibleNotifications.map((notification, index) => (
              <React.Fragment key={notification.timestamp}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                    borderLeft: notification.priority === 'urgent' ? 3 : 0,
                    borderColor: 'error.main',
                  }}
                >
                  <ListItemIcon>
                    {getPriorityIcon(notification.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < visibleNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>

        {notifications.length > 10 && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? 'Daha Az Göster' : `${notifications.length - 10} Daha Fazla`}
            </Button>
          </Box>
        )}
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
