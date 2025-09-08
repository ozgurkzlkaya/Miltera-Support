'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Breadcrumbs,
  Link,
  Fade,
  Zoom,
  Slide,
  Backdrop,
  Modal,
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
  Person as PersonIcon,
  Business as CompanyIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewComfy as ViewComfyIcon,
  Tune as TuneIcon,
  SearchOff as SearchOffIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { apiClient } from '../lib/api';

interface SearchFilters {
  query: string;
  type: 'all' | 'products' | 'issues' | 'shipments' | 'users' | 'companies';
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
  tags: string[];
  location: string[];
  technician: string[];
  customer: string[];
  priceRange: [number, number];
  rating: number;
  customFields: Record<string, any>;
}

interface SearchResult {
  id: string;
  type: 'product' | 'issue' | 'shipment' | 'user' | 'company';
  title: string;
  description: string;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  score: number;
  highlights: string[];
  relatedItems: string[];
  tags: string[];
  category: string;
  assignedTo?: string;
  company?: string;
  location?: string;
  rating?: number;
  price?: number;
  warranty?: {
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
  lastUsed: string;
  isStarred: boolean;
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'category';
  count: number;
  icon: React.ReactNode;
}

interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  searchPerformance: {
    averageResponseTime: number;
    successRate: number;
    noResultsRate: number;
  };
  userBehavior: {
    mostUsedFilters: string[];
    averageFiltersPerSearch: number;
    searchToActionRate: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`search-tabpanel-${index}`}
    aria-labelledby={`search-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UltraAdvancedSearch: React.FC = () => {
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
    tags: [],
    location: [],
    technician: [],
    customer: [],
    priceRange: [0, 10000],
    rating: 0,
    customFields: {},
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'card'>('list');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title' | 'status'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{
    query: string;
    filters: SearchFilters;
    timestamp: Date;
    resultCount: number;
  }>>([]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((searchFilters: SearchFilters) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(searchFilters);
    }, 300);

    setSearchTimeout(timeout);
  }, [searchTimeout]);

  useEffect(() => {
    if (filters.query.length > 2) {
      debouncedSearch(filters);
    }
  }, [filters, debouncedSearch]);

  const performSearch = async (searchFilters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        query: searchFilters.query,
        type: searchFilters.type,
        filters: {
          status: searchFilters.status,
          priority: searchFilters.priority,
          category: searchFilters.category,
          assignedTo: searchFilters.assignedTo,
          company: searchFilters.company,
          warrantyStatus: searchFilters.warrantyStatus,
          tags: searchFilters.tags,
          location: searchFilters.location,
          technician: searchFilters.technician,
          customer: searchFilters.customer,
          priceRange: searchFilters.priceRange,
          rating: searchFilters.rating,
          customFields: searchFilters.customFields,
        },
        dateRange: searchFilters.dateRange,
        pagination: {
          page: currentPage,
          limit: itemsPerPage,
        },
        sorting: {
          field: sortBy,
          order: sortOrder,
        },
      };

      const response = await apiClient.search(searchParams);
      
      setResults(response.results || []);
      setTotalResults(response.total || 0);
      
      // Update search history
      setSearchHistory(prev => [{
        query: searchFilters.query,
        filters: searchFilters,
        timestamp: new Date(),
        resultCount: response.total || 0,
      }, ...prev.slice(0, 9)]);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(filters);
  };

  const handleClearFilters = () => {
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
      tags: [],
      location: [],
      technician: [],
      customer: [],
      priceRange: [0, 10000],
      rating: 0,
      customFields: {},
    });
    setResults([]);
    setTotalResults(0);
  };

  const handleSaveSearch = () => {
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: `Arama ${savedSearches.length + 1}`,
      filters: filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      tags: [],
      usageCount: 0,
      lastUsed: new Date().toISOString(),
      isStarred: false,
    };
    
    setSavedSearches(prev => [newSearch, ...prev]);
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setTabValue(0);
  };

  const handleStarSearch = (searchId: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === searchId 
          ? { ...search, isStarred: !search.isStarred }
          : search
      )
    );
  };

  const handleDeleteSavedSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectResult = (resultId: string) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === results.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(results.map(result => result.id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <ProductIcon />;
      case 'issue': return <IssueIcon />;
      case 'shipment': return <ShipmentIcon />;
      case 'user': return <PersonIcon />;
      case 'company': return <CompanyIcon />;
      default: return <SearchIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredResults = useMemo(() => {
    return results.sort((a, b) => {
      if (sortBy === 'relevance') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      if (sortBy === 'title') {
        return sortOrder === 'desc' 
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [results, sortBy, sortOrder]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Gelişmiş Arama
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Güçlü filtreleme ve analitik özellikleri ile arama yapın
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Search Panel */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Arama Filtreleri
                  </Typography>

                  {/* Main Search */}
                  <TextField
                    fullWidth
                    label="Arama Terimi"
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: filters.query && (
                        <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, query: '' }))}>
                          <ClearIcon />
                        </IconButton>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Search Type */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Arama Türü</InputLabel>
                    <Select
                      value={filters.type}
                      label="Arama Türü"
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <MenuItem value="all">Tümü</MenuItem>
                      <MenuItem value="products">Ürünler</MenuItem>
                      <MenuItem value="issues">Arızalar</MenuItem>
                      <MenuItem value="shipments">Kargolar</MenuItem>
                      <MenuItem value="users">Kullanıcılar</MenuItem>
                      <MenuItem value="companies">Şirketler</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Quick Filters */}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={() => setExpandedFilters(!expandedFilters)}
                      endIcon={expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      Gelişmiş Filtreler
                    </Button>
                  </Box>

                  {/* Expanded Filters */}
                  <Collapse in={expandedFilters}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Status Filter */}
                      <FormControl fullWidth>
                        <InputLabel>Durum</InputLabel>
                        <Select
                          multiple
                          value={filters.status}
                          label="Durum"
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as string[] }))}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="active">Aktif</MenuItem>
                          <MenuItem value="inactive">Pasif</MenuItem>
                          <MenuItem value="pending">Beklemede</MenuItem>
                          <MenuItem value="completed">Tamamlandı</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Priority Filter */}
                      <FormControl fullWidth>
                        <InputLabel>Öncelik</InputLabel>
                        <Select
                          multiple
                          value={filters.priority}
                          label="Öncelik"
                          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as string[] }))}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="critical">Kritik</MenuItem>
                          <MenuItem value="high">Yüksek</MenuItem>
                          <MenuItem value="medium">Orta</MenuItem>
                          <MenuItem value="low">Düşük</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Date Range */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Tarih Aralığı
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <DatePicker
                              label="Başlangıç"
                              value={filters.dateRange.startDate}
                              onChange={(date) => setFilters(prev => ({ 
                                ...prev, 
                                dateRange: { ...prev.dateRange, startDate: date } 
                              }))}
                              slotProps={{ textField: { size: 'small' } }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <DatePicker
                              label="Bitiş"
                              value={filters.dateRange.endDate}
                              onChange={(date) => setFilters(prev => ({ 
                                ...prev, 
                                dateRange: { ...prev.dateRange, endDate: date } 
                              }))}
                              slotProps={{ textField: { size: 'small' } }}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Price Range */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Fiyat Aralığı: {filters.priceRange[0]} - {filters.priceRange[1]} TL
                        </Typography>
                        <Slider
                          value={filters.priceRange}
                          onChange={(_, newValue) => setFilters(prev => ({ 
                            ...prev, 
                            priceRange: newValue as [number, number] 
                          }))}
                          valueLabelDisplay="auto"
                          min={0}
                          max={10000}
                          step={100}
                        />
                      </Box>

                      {/* Rating */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Minimum Değerlendirme: {filters.rating}
                        </Typography>
                        <Slider
                          value={filters.rating}
                          onChange={(_, newValue) => setFilters(prev => ({ 
                            ...prev, 
                            rating: newValue as number 
                          }))}
                          valueLabelDisplay="auto"
                          min={0}
                          max={5}
                          step={0.5}
                        />
                      </Box>
                    </Box>
                  </Collapse>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={handleSearch}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Aranıyor...' : 'Ara'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                    >
                      Temizle
                    </Button>
                  </Box>

                  {/* Save Search */}
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSearch}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Aramayı Kaydet
                  </Button>
                </CardContent>
              </Card>

              {/* Saved Searches */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kayıtlı Aramalar
                  </Typography>
                  <List dense>
                    {savedSearches.map((search) => (
                      <ListItem key={search.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <IconButton
                            size="small"
                            onClick={() => handleStarSearch(search.id)}
                          >
                            {search.isStarred ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText
                          primary={search.name}
                          secondary={`${search.usageCount} kullanım`}
                          onClick={() => handleLoadSavedSearch(search)}
                          sx={{ cursor: 'pointer' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSavedSearch(search.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Results Panel */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  {/* Results Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Arama Sonuçları ({totalResults.toLocaleString()})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sırala</InputLabel>
                        <Select
                          value={sortBy}
                          label="Sırala"
                          onChange={(e) => setSortBy(e.target.value as any)}
                        >
                          <MenuItem value="relevance">İlgililik</MenuItem>
                          <MenuItem value="date">Tarih</MenuItem>
                          <MenuItem value="title">Başlık</MenuItem>
                          <MenuItem value="status">Durum</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        size="small"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      >
                        <SortIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setViewMode(prev => 
                          prev === 'list' ? 'grid' : prev === 'grid' ? 'card' : 'list'
                        )}
                      >
                        {viewMode === 'list' ? <ViewListIcon /> : 
                         viewMode === 'grid' ? <ViewModuleIcon /> : <ViewComfyIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Results */}
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Alert severity="error">{error}</Alert>
                  ) : paginatedResults.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Arama sonucu bulunamadı
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Farklı anahtar kelimeler veya filtreler deneyin
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Results List */}
                      <List>
                        {paginatedResults.map((result) => (
                          <ListItem
                            key={result.id}
                            sx={{
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: selectedResults.includes(result.id) ? 'action.selected' : 'transparent',
                            }}
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {getTypeIcon(result.type)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
                                      color={getPriorityColor(result.priority) as any}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                  <Chip
                                    label={`%${Math.round(result.score * 100)}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {result.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {result.tags.map((tag) => (
                                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true, locale: tr })}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleSelectResult(result.id)}
                              >
                                {selectedResults.includes(result.id) ? <CheckCircleIcon /> : <CheckCircleIcon />}
                              </IconButton>
                              <IconButton size="small">
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ))}
                      </List>

                      {/* Pagination */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={(_, page) => setCurrentPage(page)}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default UltraAdvancedSearch;
