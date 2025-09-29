'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TableChart as TableIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'timeline' | 'map';
  title: string;
  dataSource: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  config: Record<string, any>;
}

interface CustomDashboardProps {
  userId?: string;
  onSave?: (dashboard: any) => void;
  onLoad?: (dashboardId: string) => void;
}

const widgetTypes = [
  { id: 'chart', name: 'Grafik', icon: <BarChartIcon />, description: 'Veri görselleştirme grafiği' },
  { id: 'table', name: 'Tablo', icon: <TableIcon />, description: 'Veri tablosu' },
  { id: 'metric', name: 'Metrik', icon: <AssessmentIcon />, description: 'Sayısal değer göstergesi' },
  { id: 'timeline', name: 'Zaman Çizelgesi', icon: <TimelineIcon />, description: 'Zaman bazlı veri görünümü' },
  { id: 'map', name: 'Harita', icon: <MapIcon />, description: 'Coğrafi veri görünümü' },
];

const dataSources = [
  { id: 'issues', name: 'Arızalar', icon: <BugReportIcon /> },
  { id: 'products', name: 'Ürünler', icon: <InventoryIcon /> },
  { id: 'service_operations', name: 'Servis Operasyonları', icon: <BuildIcon /> },
  { id: 'shipments', name: 'Sevkiyatlar', icon: <ShippingIcon /> },
  { id: 'companies', name: 'Şirketler', icon: <BusinessIcon /> },
  { id: 'users', name: 'Kullanıcılar', icon: <PeopleIcon /> },
];

export const CustomDashboard: React.FC<CustomDashboardProps> = ({
  userId,
  onSave,
  onLoad,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [openAddWidget, setOpenAddWidget] = useState(false);
  const [openEditWidget, setOpenEditWidget] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [newWidget, setNewWidget] = useState<Partial<DashboardWidget>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dashboardName, setDashboardName] = useState('Özel Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('');

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/dashboards/custom${userId ? `?userId=${userId}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWidgets(data.widgets || []);
        setDashboardName(data.name || 'Özel Dashboard');
        setDashboardDescription(data.description || '');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Dashboard yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const dashboardData = {
        name: dashboardName,
        description: dashboardDescription,
        widgets,
        userId: userId || 'current',
      };

      const response = await fetch('http://localhost:3015/api/v1/dashboards/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dashboardData),
      });

      if (response.ok) {
        setSuccess('Dashboard başarıyla kaydedildi');
        if (onSave) {
          onSave(dashboardData);
        }
      } else {
        throw new Error('Dashboard kaydedilemedi');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      setError('Dashboard kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addWidget = () => {
    if (!newWidget.type || !newWidget.title || !newWidget.dataSource) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    const widget: DashboardWidget = {
      id: crypto.randomUUID(),
      type: newWidget.type as any,
      title: newWidget.title,
      dataSource: newWidget.dataSource,
      position: { x: 0, y: 0 },
      size: { width: 4, height: 3 },
      visible: true,
      config: newWidget.config || {},
    };

    setWidgets(prev => [...prev, widget]);
    setNewWidget({});
    setOpenAddWidget(false);
    setSuccess('Widget eklendi');
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const deleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    setSuccess('Widget silindi');
  };

  const toggleWidgetVisibility = (id: string) => {
    updateWidget(id, { visible: !widgets.find(w => w.id === id)?.visible });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const dataSourceInfo = dataSources.find(ds => ds.id === widget.dataSource);
    
    return (
      <Card
        key={widget.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: widget.visible ? 1 : 0.5,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {dataSourceInfo?.icon}
              <Typography variant="h6">{widget.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => toggleWidgetVisibility(widget.id)}
                title={widget.visible ? 'Gizle' : 'Göster'}
              >
                {widget.visible ? <ViewIcon /> : <HideIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedWidget(widget);
                  setOpenEditWidget(true);
                }}
                title="Düzenle"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => deleteWidget(widget.id)}
                title="Sil"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              {widgetTypes.find(wt => wt.id === widget.type)?.icon}
              <Typography variant="body2" color="text.secondary">
                {widget.type} - {dataSourceInfo?.name}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon />
                {dashboardName}
              </Typography>
              {dashboardDescription && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {dashboardDescription}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setOpenSettings(true)}
              >
                Ayarlar
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddWidget(true)}
              >
                Widget Ekle
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveDashboard}
                disabled={loading}
              >
                Kaydet
              </Button>
            </Box>
          </Box>

          {widgets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz widget yok
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Dashboard'ınızı özelleştirmek için widget ekleyin.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddWidget(true)}
              >
                İlk Widget'ı Ekle
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {widgets.map((widget, index) => (
                <Grid
                  key={widget.id}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <Box>
                    <DragIcon sx={{ color: 'text.secondary', mb: 1 }} />
                  </Box>
                  {renderWidget(widget)}
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add Widget Dialog */}
      <Dialog open={openAddWidget} onClose={() => setOpenAddWidget(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Widget Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Widget Başlığı"
              value={newWidget.title || ''}
              onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Widget Türü</InputLabel>
              <Select
                value={newWidget.type || ''}
                onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as any })}
                label="Widget Türü"
              >
                {widgetTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      <Box>
                        <Typography variant="body2">{type.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Veri Kaynağı</InputLabel>
              <Select
                value={newWidget.dataSource || ''}
                onChange={(e) => setNewWidget({ ...newWidget, dataSource: e.target.value })}
                label="Veri Kaynağı"
              >
                {dataSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {source.icon}
                      {source.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddWidget(false)}>İptal</Button>
          <Button variant="contained" onClick={addWidget}>
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Widget Dialog */}
      <Dialog open={openEditWidget} onClose={() => setOpenEditWidget(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Widget Düzenle</DialogTitle>
        <DialogContent>
          {selectedWidget && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Widget Başlığı"
                value={selectedWidget.title}
                onChange={(e) => setSelectedWidget({ ...selectedWidget, title: e.target.value })}
              />
              
              <FormControl fullWidth>
                <InputLabel>Widget Türü</InputLabel>
                <Select
                  value={selectedWidget.type}
                  onChange={(e) => setSelectedWidget({ ...selectedWidget, type: e.target.value as any })}
                  label="Widget Türü"
                >
                  {widgetTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Veri Kaynağı</InputLabel>
                <Select
                  value={selectedWidget.dataSource}
                  onChange={(e) => setSelectedWidget({ ...selectedWidget, dataSource: e.target.value })}
                  label="Veri Kaynağı"
                >
                  {dataSources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {source.icon}
                        {source.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedWidget.visible}
                    onChange={(e) => setSelectedWidget({ ...selectedWidget, visible: e.target.checked })}
                  />
                }
                label="Görünür"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditWidget(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedWidget) {
                updateWidget(selectedWidget.id, selectedWidget);
                setOpenEditWidget(false);
                setSuccess('Widget güncellendi');
              }
            }}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dashboard Ayarları</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Dashboard Adı"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={dashboardDescription}
              onChange={(e) => setDashboardDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>İptal</Button>
          <Button variant="contained" onClick={() => setOpenSettings(false)}>
            Kaydet
          </Button>
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

export default CustomDashboard;
