"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Refresh,
  GetApp,
  Download,
  Inventory,
  Build,
  LocalShipping,
  Person,
  CheckCircle
} from '@mui/icons-material';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalIssues: number;
    totalOperations: number;
    totalShipments: number;
    activeUsers: number;
    systemHealth: number;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const [productsRes, issuesRes, opsRes, shipmentsRes] = await Promise.all([
        fetch('http://localhost:3015/api/v1/products', { headers }),
        fetch('http://localhost:3015/api/v1/issues', { headers }),
        fetch('http://localhost:3015/api/v1/service-operations', { headers }),
        fetch('http://localhost:3015/api/v1/shipments', { headers })
      ]);
      
      const safeJson = async (res: Response) => {
        try {
          return await res.json();
        } catch {
          return { data: [] };
        }
      };
      
      const [products, issues, ops, shipments] = await Promise.all([
        safeJson(productsRes),
        safeJson(issuesRes),
        safeJson(opsRes),
        safeJson(shipmentsRes)
      ]);
      
      const arrP = Array.isArray(products.data) ? products.data : [];
      const arrI = Array.isArray(issues.data) ? issues.data : [];
      const arrO = Array.isArray(ops.data) ? ops.data : [];
      const arrS = Array.isArray(shipments.data) ? shipments.data : [];
      
      const analyticsData: AnalyticsData = {
        overview: {
          totalProducts: arrP.length,
          totalIssues: arrI.length,
          totalOperations: arrO.length,
          totalShipments: arrS.length,
          activeUsers: 1,
          systemHealth: 100
        }
      };
      
      setAnalyticsData(analyticsData);
      setSnackbar({
        open: true,
        message: 'Analytics verileri başarıyla yüklendi',
        severity: 'success'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analytics verileri yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyticsData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAnalyticsData}>
            Tekrar Dene
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!analyticsData) {
    return (
      <Box p={3}>
        <Alert severity="info">Analytics verileri yüklenemedi.</Alert>
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sistem performansı ve iş analitikleri
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">Otomatik Yenile</Typography>
            <Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Zaman Aralığı">
              <MenuItem value="1d">Son 1 Gün</MenuItem>
              <MenuItem value="7d">Son 7 Gün</MenuItem>
              <MenuItem value="30d">Son 30 Gün</MenuItem>
              <MenuItem value="90d">Son 90 Gün</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<GetApp />} size="small">PDF</Button>
          <Button variant="outlined" startIcon={<Download />} size="small">EXCEL</Button>
          <IconButton onClick={fetchAnalyticsData} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Toplam Ürün</Typography>
                  <Typography variant="h4">{analyticsData.overview.totalProducts}</Typography>
                </Box>
                <Inventory color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Aktif Arıza</Typography>
                  <Typography variant="h4">{analyticsData.overview.totalIssues}</Typography>
                </Box>
                <Build color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Operasyon</Typography>
                  <Typography variant="h4">{analyticsData.overview.totalOperations}</Typography>
                </Box>
                <Build color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Sevkiyat</Typography>
                  <Typography variant="h4">{analyticsData.overview.totalShipments}</Typography>
                </Box>
                <LocalShipping color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Aktif Kullanıcı</Typography>
                  <Typography variant="h4">{analyticsData.overview.activeUsers}</Typography>
                </Box>
                <Person color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>Sistem Sağlığı</Typography>
                  <Typography variant="h4">{analyticsData.overview.systemHealth}%</Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
