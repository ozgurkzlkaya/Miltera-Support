"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface ApiVersion {
  version: string;
  deprecated: boolean;
  sunsetDate?: string;
  changelog: string[];
  breakingChanges: string[];
}

interface ApiDocumentation {
  title: string;
  description: string;
  version: string;
  contact: {
    name: string;
    email: string;
    url: string;
  };
  license: {
    name: string;
    url: string;
  };
  versions: ApiVersion[];
  endpoints: any;
  errorCodes: Record<string, string>;
  rateLimiting: any;
  webhooks: any;
}

export default function ApiDocsPage() {
  const [documentation, setDocumentation] = useState<ApiDocumentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/docs/docs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentation(data);
      } else {
        throw new Error('Failed to load API documentation');
      }
    } catch (error) {
      console.error('Error loading documentation:', error);
      setError('API dokümantasyonu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Panoya kopyalandı', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '200':
      case '201':
        return 'success';
      case '400':
      case '401':
      case '403':
        return 'warning';
      case '404':
      case '500':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'success';
      case 'POST':
        return 'primary';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>API dokümantasyonu yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDocumentation}>
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  if (!documentation) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Dokümantasyon bulunamadı</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon />
          API Dokümantasyonu
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={loadDocumentation}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => copyToClipboard(JSON.stringify(documentation, null, 2))}
          >
            JSON İndir
          </Button>
        </Box>
      </Box>

      {/* API Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {documentation.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {documentation.description}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Versiyon
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.version}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                İletişim
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.contact.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                E-posta
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.contact.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Lisans
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.license.name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* API Versions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon />
            API Versiyonları
          </Typography>
          <Grid container spacing={2}>
            {documentation.versions.map((version) => (
              <Grid item xs={12} md={6} key={version.version}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        v{version.version}
                      </Typography>
                      {version.deprecated && (
                        <Chip label="Deprecated" color="warning" size="small" />
                      )}
                    </Box>
                    {version.sunsetDate && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Sunset: {new Date(version.sunsetDate).toLocaleDateString()}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Değişiklikler:
                    </Typography>
                    <List dense>
                      {version.changelog.slice(0, 3).map((change, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={change}
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {version.breakingChanges.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                          Breaking Changes:
                        </Typography>
                        <List dense>
                          {version.breakingChanges.slice(0, 2).map((change, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={change}
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            Kimlik Doğrulama
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tüm API endpoint'leri Bearer token ile kimlik doğrulama gerektirir.
          </Alert>
          <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            Authorization: Bearer &lt;your-token&gt;
          </Box>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon />
            Rate Limiting
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {documentation.rateLimiting.description}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Kimlik Doğrulamalı
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.rateLimiting.limits.authenticated}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Kimlik Doğrulamasız
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {documentation.rateLimiting.limits.unauthenticated}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            API Endpoint'leri
          </Typography>
          
          {Object.entries(documentation.endpoints.v1.endpoints).map(([category, endpoints]: [string, any]) => (
            <Accordion key={category} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {category}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(endpoints).map(([endpoint, details]: [string, any]) => (
                  <Box key={endpoint} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={details.method || 'GET'} 
                        color={getMethodColor(details.method || 'GET')}
                        size="small"
                      />
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {endpoint}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(endpoint)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {details.description}
                    </Typography>
                    
                    {details.parameters && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Parametreler:
                        </Typography>
                        {Object.entries(details.parameters).map(([paramType, params]: [string, any]) => (
                          <Box key={paramType} sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                              {paramType}:
                            </Typography>
                            {Object.entries(params).map(([paramName, paramDetails]: [string, any]) => (
                              <Box key={paramName} sx={{ ml: 2, mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {paramName}
                                  {paramDetails.required && <span style={{ color: 'red' }}>*</span>}
                                  {paramDetails.type && ` (${paramDetails.type})`}
                                </Typography>
                                {paramDetails.description && (
                                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                    {paramDetails.description}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {details.responses && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Yanıtlar:
                        </Typography>
                        {Object.entries(details.responses).map(([statusCode, response]: [string, any]) => (
                          <Box key={statusCode} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip 
                              label={statusCode} 
                              color={getStatusColor(statusCode)}
                              size="small"
                            />
                            <Typography variant="caption">
                              {response.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hata Kodları
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Açıklama</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(documentation.errorCodes).map(([code, description]) => (
                  <TableRow key={code}>
                    <TableCell>
                      <Chip 
                        label={code} 
                        color={getStatusColor(code)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Webhooks
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {documentation.webhooks.description}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Desteklenen Olaylar:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {documentation.webhooks.events.map((event: string) => (
              <Chip key={event} label={event} size="small" variant="outlined" />
            ))}
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Kimlik Doğrulama:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {documentation.webhooks.authentication}
          </Typography>
        </CardContent>
      </Card>

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
}
