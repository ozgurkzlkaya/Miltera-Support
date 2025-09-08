'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Inventory as ProductIcon,
  BugReport as IssueIcon,
  LocalShipping as ShipmentIcon,
  Business as CompanyIcon,
  Person as UserIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';
import { AdvancedSearch, SearchOptions } from '../../../components/AdvancedSearch';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function GlobalSearchPage() {
  const [searchResults, setSearchResults] = useState<Record<string, SearchResult[]>>({
    products: [],
    issues: [],
    shipments: [],
    companies: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchStats, setSearchStats] = useState<Record<string, number>>({});

  const handleSearch = async (options: SearchOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Arama yapılırken bir hata oluştu');
      }

      const data = await response.json();
      
      if (data.success) {
        const results = data.data;
        setSearchResults(prev => ({
          ...prev,
          [options.entityType]: results.data || [],
        }));
        setTotalResults(results.totalCount || 0);
        
        // Update search stats
        setSearchStats(prev => ({
          ...prev,
          [options.entityType]: results.totalCount || 0,
        }));

        // Set active tab to the searched entity type
        const entityTypeIndex = ['products', 'issues', 'shipments', 'companies', 'users'].indexOf(options.entityType);
        if (entityTypeIndex !== -1) {
          setActiveTab(entityTypeIndex);
        }
      } else {
        throw new Error(data.error?.message || 'Arama yapılırken bir hata oluştu');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchResults({
      products: [],
      issues: [],
      shipments: [],
      companies: [],
      users: [],
    });
    setTotalResults(0);
    setSearchStats({});
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
      case 'shipped':
        return 'success';
      case 'inactive':
      case 'closed':
      case 'delivered':
        return 'default';
      case 'maintenance':
      case 'in_progress':
      case 'preparing':
        return 'warning';
      case 'retired':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
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

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'products':
        return <ProductIcon />;
      case 'issues':
        return <IssueIcon />;
      case 'shipments':
        return <ShipmentIcon />;
      case 'companies':
        return <CompanyIcon />;
      case 'users':
        return <UserIcon />;
      default:
        return <SearchIcon />;
    }
  };

  const getEntityTitle = (type: string) => {
    switch (type) {
      case 'products':
        return 'Ürünler';
      case 'issues':
        return 'Arızalar';
      case 'shipments':
        return 'Sevkiyatlar';
      case 'companies':
        return 'Firmalar';
      case 'users':
        return 'Kullanıcılar';
      default:
        return type;
    }
  };

  const renderSearchResult = (result: SearchResult, entityType: string) => {
    return (
      <Card key={result.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getEntityIcon(entityType)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" component="div">
                  {result.title}
                </Typography>
                {result.status && (
                  <Chip
                    label={result.status}
                    size="small"
                    color={getStatusColor(result.status) as any}
                    variant="outlined"
                  />
                )}
                {result.priority && (
                  <Chip
                    label={result.priority}
                    size="small"
                    color={getPriorityColor(result.priority) as any}
                    variant="outlined"
                  />
                )}
              </Box>
              {result.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {result.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Oluşturulma: {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true, locale: tr })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Güncelleme: {formatDistanceToNow(new Date(result.updatedAt), { addSuffix: true, locale: tr })}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Navigate to detail page
                window.location.href = `/dashboard/${entityType}/${result.id}`;
              }}
            >
              Detay
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const entityTypes = ['products', 'issues', 'shipments', 'companies', 'users'];

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon />
          Gelişmiş Arama
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tüm verilerde gelişmiş arama yapın, filtreler uygulayın ve sonuçları analiz edin.
        </Typography>

        {/* Advanced Search Component */}
        <Box sx={{ mb: 3 }}>
          <AdvancedSearch
            onSearch={handleSearch}
            onClear={handleClear}
            loading={loading}
            showFilters={true}
            placeholder="Ürün, arıza, sevkiyat, firma veya kullanıcı arayın..."
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Results */}
        {totalResults > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6">
                Arama Sonuçları ({totalResults} sonuç)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {entityTypes.map((type, index) => (
                  searchStats[type] > 0 && (
                    <Chip
                      key={type}
                      label={`${getEntityTitle(type)}: ${searchStats[type]}`}
                      size="small"
                      variant="outlined"
                      onClick={() => setActiveTab(index)}
                    />
                  )
                ))}
              </Box>
            </Box>

            {/* Results Tabs */}
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {entityTypes.map((type, index) => (
                  <Tab
                    key={type}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEntityIcon(type)}
                        {getEntityTitle(type)}
                        {searchStats[type] > 0 && (
                          <Badge badgeContent={searchStats[type]} color="primary" />
                        )}
                      </Box>
                    }
                    disabled={searchStats[type] === 0}
                  />
                ))}
              </Tabs>

              {entityTypes.map((type, index) => (
                <TabPanel key={type} value={activeTab} index={index}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : searchResults[type].length > 0 ? (
                    <Box>
                      {searchResults[type].map((result) => renderSearchResult(result, type))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Bu kategoride sonuç bulunamadı.
                      </Typography>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </Paper>
          </Box>
        )}

        {/* Empty State */}
        {!loading && totalResults === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Arama yapmaya başlayın
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Yukarıdaki arama kutusunu kullanarak ürünler, arızalar, sevkiyatlar, firmalar veya kullanıcılar arasında arama yapabilirsiniz.
            </Typography>
          </Box>
        )}

        {/* Search Tips */}
        {totalResults === 0 && !loading && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Arama İpuçları
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterIcon />
                      Gelişmiş Filtreler
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durum, öncelik, tarih aralığı gibi filtreler kullanarak daha spesifik sonuçlar elde edin.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HistoryIcon />
                      Arama Geçmişi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Önceki aramalarınız otomatik olarak kaydedilir ve hızlı erişim için saklanır.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
