'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Sms as SmsIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface SMSNotificationProps {
  entityType?: 'issue' | 'product' | 'service_operation' | 'shipment';
  entityId?: string;
  onSend?: (result: any) => void;
}

interface SMSHistoryItem {
  id: string;
  to: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  cost?: string;
  error?: string;
}

export const SMSNotification: React.FC<SMSNotificationProps> = ({
  entityType,
  entityId,
  onSend,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [history, setHistory] = useState<SMSHistoryItem[]>([]);
  const [settings, setSettings] = useState({
    enabled: true,
    autoSend: false,
    includeTracking: true,
    includePriority: true,
    maxLength: 160,
  });

  const templates = [
    {
      id: 'issue_notification',
      name: 'Arıza Bildirimi',
      message: 'Yeni arıza bildirimi: {issueNumber}\nÖncelik: {priority}\nDetaylar için sisteme giriş yapın.',
    },
    {
      id: 'service_completion',
      name: 'Servis Tamamlandı',
      message: 'Servis operasyonunuz tamamlandı. Detaylar için sisteme giriş yapabilirsiniz.',
    },
    {
      id: 'shipment_notification',
      name: 'Sevkiyat Bildirimi',
      message: 'Sevkiyatınız yola çıktı. Takip numarası: {trackingNumber}\nDetaylar için sisteme giriş yapın.',
    },
    {
      id: 'system_alert',
      name: 'Sistem Uyarısı',
      message: 'Sistem Uyarısı: {alertMessage}\nLütfen sistemi kontrol edin.',
    },
    {
      id: 'custom',
      name: 'Özel Mesaj',
      message: '',
    },
  ];

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smsSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading SMS settings:', error);
      }
    }
  }, []);

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/sms/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error loading SMS history:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setMessage(selectedTemplate.message);
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      setError('Telefon numarası ve mesaj gereklidir');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Geçersiz telefon numarası formatı');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          entityType,
          entityId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('SMS başarıyla gönderildi');
        setPhoneNumber('');
        setMessage('');
        setTemplate('');
        loadHistory();
        
        if (onSend) {
          onSend(result);
        }
      } else {
        setError(result.error || 'SMS gönderilemedi');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      setError('SMS gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
      return `+90${cleaned}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('05')) {
      return `+90${cleaned.substring(1)}`;
    }
    
    return phone;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return <MessageIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const saveSettings = () => {
    localStorage.setItem('smsSettings', JSON.stringify(settings));
    setOpenSettings(false);
    setSuccess('Ayarlar kaydedildi');
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmsIcon />
              SMS Bildirimi
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => setOpenHistory(true)}
                size="small"
              >
                Geçmiş
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setOpenSettings(true)}
                size="small"
              >
                Ayarlar
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="Örnek: +90 555 123 45 67"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Şablon</InputLabel>
                <Select
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  label="Şablon"
                >
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mesaj"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="SMS mesajınızı buraya yazın..."
                helperText={`${message.length}/${settings.maxLength} karakter`}
                inputProps={{
                  maxLength: settings.maxLength,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    />
                  }
                  label="SMS Bildirimleri Aktif"
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSendSMS}
                  disabled={loading || !settings.enabled}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Gönderiliyor...' : 'SMS Gönder'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>SMS Ayarları</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                />
              }
              label="SMS Bildirimleri Aktif"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSend}
                  onChange={(e) => setSettings({ ...settings, autoSend: e.target.checked })}
                />
              }
              label="Otomatik Gönderim"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.includeTracking}
                  onChange={(e) => setSettings({ ...settings, includeTracking: e.target.checked })}
                />
              }
              label="Takip Numarası Dahil Et"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.includePriority}
                  onChange={(e) => setSettings({ ...settings, includePriority: e.target.checked })}
                />
              }
              label="Öncelik Bilgisi Dahil Et"
            />
            <TextField
              fullWidth
              label="Maksimum Mesaj Uzunluğu"
              type="number"
              value={settings.maxLength}
              onChange={(e) => setSettings({ ...settings, maxLength: parseInt(e.target.value) || 160 })}
              helperText="SMS mesajının maksimum karakter sayısı"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>İptal</Button>
          <Button variant="contained" onClick={saveSettings}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>SMS Geçmişi</DialogTitle>
        <DialogContent>
          {history.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SmsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz SMS gönderilmedi
              </Typography>
            </Paper>
          ) : (
            <List>
              {history.map((item) => (
                <ListItem key={item.id} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getStatusIcon(item.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{item.to}</Typography>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {item.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.sentAt).toLocaleString('tr-TR')}
                          {item.cost && ` • ${item.cost}`}
                        </Typography>
                        {item.error && (
                          <Typography variant="caption" color="error" display="block">
                            Hata: {item.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Messages */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default SMSNotification;
