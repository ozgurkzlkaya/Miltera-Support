'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Popper,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton as ListIconButton,
  Divider,
  Box,
  Chip,
  Avatar,
  Button,
  Fade,
  ClickAwayListener,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface AdvancedNotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
  maxNotifications?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AdvancedNotificationBell: React.FC<AdvancedNotificationBellProps> = ({
  onNotificationClick,
  maxNotifications = 20,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/notifications', { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications API response:', data);
        
        // API'den gelen veri formatını kontrol et
        let notificationList = [];
        if (data.success && data.data && data.data.data && Array.isArray(data.data.data)) {
          notificationList = data.data.data.slice(0, maxNotifications);
        } else if (Array.isArray(data.data)) {
          notificationList = data.data.slice(0, maxNotifications);
        } else if (Array.isArray(data)) {
          notificationList = data.slice(0, maxNotifications);
        }
        
        setNotifications(notificationList);
        setUnreadCount(notificationList.filter((n: Notification) => !n.read).length);
      } else {
        // API'den veri gelmezse boş liste göster
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [maxNotifications]);

  // Auto-refresh notifications
  useEffect(() => {
    loadNotifications();
    
    if (autoRefresh) {
      const interval = setInterval(loadNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadNotifications, autoRefresh, refreshInterval]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`http://localhost:3015/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers
      });

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('http://localhost:3015/api/v1/notifications/mark-all-read', {
        method: 'PATCH',
        headers
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`http://localhost:3015/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        return deletedNotification && !deletedNotification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </IconButton>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          style={{ zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  width: 400,
                  maxHeight: 500,
                  overflow: 'auto',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      Bildirimler
                      {unreadCount > 0 && (
                        <Chip
                          label={unreadCount}
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Box>
                      {unreadCount > 0 && (
                        <Button
                          size="small"
                          startIcon={<MarkReadIcon />}
                          onClick={markAllAsRead}
                          sx={{ mr: 1 }}
                        >
                          Tümünü Okundu İşaretle
                        </Button>
                      )}
                      <IconButton size="small" onClick={handleClose}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Yükleniyor...
                    </Typography>
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                  </Alert>
                ) : notifications.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                    <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Henüz bildirim yok
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {notifications.map((notification, index) => (
                      <Box key={notification.id}>
                        <ListItem
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            backgroundColor: notification.read ? 'transparent' : 'action.hover',
                            '&:hover': {
                              backgroundColor: 'action.selected'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: `${getNotificationColor(notification.type)}.light`
                              }}
                            >
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: 'primary.main'
                                    }}
                                  />
                                )}
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
                          <ListItemSecondaryAction>
                            <ListIconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </ListIconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default AdvancedNotificationBell;
