'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Autocomplete,
  Slider,
  FormControlLabel,
  Checkbox,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as ProductIcon,
  BugReport as IssueIcon,
  LocalShipping as ShipmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { apiClient } from '../lib/api';

interface SearchFilters {
  query: string;
  type: 'all' | 'products' | 'issues' | 'shipments';
  status: string[];
  priority: string[];
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  category: string[];
  assignedTo: string[];
  company: string[];
  warrantyStatus: string[];
  serialNumber: string;
  issueNumber: string;
  shipmentNumber: string;
}

interface SearchResult {
  id: string;
  type: 'product' | 'issue' | 'shipment';
  title: string;
  description: string;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    status: [],
    priority: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    category: [],
    assignedTo: [],
    company: [],
    warrantyStatus: [],
    serialNumber: '',
    issueNumber: '',
    shipmentNumber: '',
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);

  // Mock data for dropdowns
  const statusOptions = [
    'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED',
    'READY_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];

  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const categoryOptions = ['Hardware', 'Software', 'Network', 'Calibration', 'Other'];
  const warrantyOptions = ['IN_WARRANTY', 'OUT_OF_WARRANTY', 'NO_WARRANTY'];

  useEffect(() => {
    loadSavedSearches();
    loadRecentSearches();
  }, []);

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveSearch = () => {
    const name = prompt('Arama adını girin:');
    if (name) {
      const newSearch: SavedSearch = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      };

      const updated = [...savedSearches, newSearch];
      setSavedSearches(updated);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
    }
  };

  const loadSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
  };

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const performSearch = async () => {
    if (!filters.query.trim() && filters.type === 'all') {
      setError('Lütfen en az bir arama kriteri girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let searchResults: SearchResult[] = [];

      // API çağrıları
      if (filters.type === 'all' || filters.type === 'products') {
        const productResults = await apiClient.searchProducts({
          query: filters.query,
          status: filters.status,
          warrantyStatus: filters.warrantyStatus,
          serialNumber: filters.serialNumber,
          dateRange: filters.dateRange.startDate && filters.dateRange.endDate ? {
            startDate: filters.dateRange.startDate.toISOString(),
            endDate: filters.dateRange.endDate.toISOString(),
          } : undefined,
        });

        searchResults.push(...productResults.map((product: any) => ({
          id: product.id,
          type: 'product' as const,
          title: `Ürün: ${product.serialNumber}`,
          description: `${product.productType?.name} - ${product.productModel?.name}`,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          metadata: product,
        })));
      }

      if (filters.type === 'all' || filters.type === 'issues') {
        const issueResults = await apiClient.searchIssues({
          query: filters.query,
          status: filters.status,
          priority: filters.priority,
          category: filters.category,
          issueNumber: filters.issueNumber,
          dateRange: filters.dateRange.startDate && filters.dateRange.endDate ? {
            startDate: filters.dateRange.startDate.toISOString(),
            endDate: filters.dateRange.endDate.toISOString(),
          } : undefined,
        });

        searchResults.push(...issueResults.map((issue: any) => ({
          id: issue.id,
          type: 'issue' as const,
          title: `Arıza: ${issue.issueNumber}`,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          metadata: issue,
        })));
      }

      if (filters.type === 'all' || filters.type === 'shipments') {
        const shipmentResults = await apiClient.searchShipments({
          query: filters.query,
          status: filters.status,
          shipmentNumber: filters.shipmentNumber,
          dateRange: filters.dateRange.startDate && filters.dateRange.endDate ? {
            startDate: filters.dateRange.startDate.toISOString(),
            endDate: filters.dateRange.endDate.toISOString(),
          } : undefined,
        });

        searchResults.push(...shipmentResults.map((shipment: any) => ({
          id: shipment.id,
          type: 'shipment' as const,
          title: `Sevkiyat: ${shipment.shipmentNumber}`,
          description: `${shipment.type} - ${shipment.status}`,
          status: shipment.status,
          createdAt: shipment.createdAt,
          updatedAt: shipment.updatedAt,
          metadata: shipment,
        })));
      }

      // Sonuçları tarihe göre sırala
      searchResults.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setResults(searchResults);
      setSearchHistory(prev => [...searchResults, ...prev].slice(0, 50));

      // Son aramaları kaydet
      if (filters.query.trim()) {
        const updated = [filters.query, ...recentSearches.filter(q => q !== filters.query)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('Arama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      status: [],
      priority: [],
      dateRange: {
        startDate: null,
        endDate: null,
      },
      category: [],
      assignedTo: [],
      company: [],
      warrantyStatus: [],
      serialNumber: '',
      issueNumber: '',
      shipmentNumber: '',
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ProductIcon />;
      case 'issue':
        return <IssueIcon />;
      case 'shipment':
        return <ShipmentIcon />;
      default:
        return <SearchIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'READY_FOR_SHIPMENT':
        return 'primary';
      case 'IN_PROGRESS':
      case 'SHIPPED':
        return 'warning';
      case 'RESOLVED':
      case 'DELIVERED':
        return 'success';
      case 'CLOSED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gelişmiş Arama
        </Typography>

        {/* Ana Arama Alanı */}
        <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                  placeholder="Ürün, arıza, sevkiyat ara..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
              />
            </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Arama Türü</InputLabel>
                <Select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    label="Arama Türü"
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="products">Ürünler</MenuItem>
                    <MenuItem value="issues">Arızalar</MenuItem>
                    <MenuItem value="shipments">Sevkiyatlar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
              <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                    onClick={performSearch}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  fullWidth
                >
                    Ara
                </Button>
                  <Tooltip title="Filtreleri Göster/Gizle">
                <IconButton
                      onClick={() => setShowFilters(!showFilters)}
                      color={showFilters ? 'primary' : 'default'}
                >
                      {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                  </Tooltip>
              </Box>
            </Grid>
          </Grid>

            {/* Gelişmiş Filtreler */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {/* Durum Filtreleri */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={statusOptions}
                      value={filters.status}
                      onChange={(_, newValue) => setFilters(prev => ({ ...prev, status: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Durum" placeholder="Durum seçin" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            color={getStatusColor(option) as any}
                            variant="outlined"
                          />
                        ))
                      }
                    />
                  </Grid>

                  {/* Öncelik Filtreleri */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={priorityOptions}
                      value={filters.priority}
                      onChange={(_, newValue) => setFilters(prev => ({ ...prev, priority: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Öncelik" placeholder="Öncelik seçin" />
                      )}
                    />
                  </Grid>

                  {/* Tarih Aralığı */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <DatePicker
                        label="Başlangıç Tarihi"
                        value={filters.dateRange.startDate}
                        onChange={(date) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, startDate: date }
                        }))}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                      <DatePicker
                        label="Bitiş Tarihi"
                        value={filters.dateRange.endDate}
                        onChange={(date) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, endDate: date }
                        }))}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                </Box>
                  </Grid>

                  {/* Kategori Filtreleri */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={categoryOptions}
                      value={filters.category}
                      onChange={(_, newValue) => setFilters(prev => ({ ...prev, category: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Kategori" placeholder="Kategori seçin" />
                      )}
                    />
                      </Grid>

                  {/* Özel Numaralar */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Seri Numarası"
                      value={filters.serialNumber}
                      onChange={(e) => setFilters(prev => ({ ...prev, serialNumber: e.target.value }))}
                    />
                      </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Arıza Numarası"
                      value={filters.issueNumber}
                      onChange={(e) => setFilters(prev => ({ ...prev, issueNumber: e.target.value }))}
                    />
                      </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Sevkiyat Numarası"
                      value={filters.shipmentNumber}
                      onChange={(e) => setFilters(prev => ({ ...prev, shipmentNumber: e.target.value }))}
                    />
                      </Grid>

                  {/* Garanti Durumu */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={warrantyOptions}
                      value={filters.warrantyStatus}
                      onChange={(_, newValue) => setFilters(prev => ({ ...prev, warrantyStatus: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Garanti Durumu" placeholder="Garanti durumu seçin" />
                      )}
                    />
                    </Grid>

                  {/* Temizle ve Kaydet */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                        onClick={clearFilters}
                        startIcon={<ClearIcon />}
                    >
                        Temizle
                    </Button>
                    <Button
                      variant="outlined"
                        onClick={saveSearch}
                        startIcon={<SaveIcon />}
                    >
                        Aramayı Kaydet
                    </Button>
                  </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Hata Mesajı */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Kaydedilen Aramalar */}
        {savedSearches.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kaydedilen Aramalar
                    </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {savedSearches.map((search) => (
                  <Chip
                    key={search.id}
                    label={search.name}
                    onClick={() => loadSearch(search)}
                    onDelete={() => deleteSavedSearch(search.id)}
                    variant="outlined"
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Son Aramalar */}
                {recentSearches.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son Aramalar
                    </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {recentSearches.map((query, index) => (
                          <Chip
                            key={index}
                    label={query}
                    onClick={() => setFilters(prev => ({ ...prev, query }))}
                            variant="outlined"
                    clickable
                          />
                        ))}
                      </Box>
            </CardContent>
          </Card>
        )}

        {/* Arama Sonuçları */}
        {results.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Arama Sonuçları ({results.length})
              </Typography>
              <List>
                {results.map((result) => (
                    <ListItem
                    key={result.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getResultIcon(result.type)}
                      </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {result.title}
                          </Typography>
                          <Chip
                            label={result.status}
                            color={getStatusColor(result.status) as any}
                            size="small"
                          />
                          {result.priority && (
                            <Chip
                              label={result.priority}
                              color={result.priority === 'HIGH' || result.priority === 'CRITICAL' ? 'error' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Güncellenme: {new Date(result.updatedAt).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      }
                    />
                    </ListItem>
                  ))}
                </List>
            </CardContent>
          </Card>
        )}

        {/* Sonuç Yok */}
        {!loading && results.length === 0 && filters.query && (
          <Card>
            <CardContent>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Arama kriterlerinize uygun sonuç bulunamadı
              </Typography>
        </CardContent>
      </Card>
        )}
    </Box>
    </LocalizationProvider>
  );
};

export default AdvancedSearch;
