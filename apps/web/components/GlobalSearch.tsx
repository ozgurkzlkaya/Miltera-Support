'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Avatar,
  Tooltip,
  Fade,
  Popper,
  ClickAwayListener
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface SearchResult {
  id: string;
  type: 'product' | 'issue' | 'company' | 'warehouse' | 'shipment' | 'user';
  title: string;
  subtitle: string;
  description?: string;
  status?: string;
  icon: React.ReactNode;
  url: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  maxResults?: number;
  debounceMs?: number;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
  placeholder = "Tüm sistemde ara...",
  maxResults = 10,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Debounced search
  const debouncedQuery = useMemo(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    debouncedQuery();
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Parallel search across all modules
      const searchPromises = [
        searchProducts(searchQuery, headers),
        searchIssues(searchQuery, headers),
        searchCompanies(searchQuery, headers),
        searchWarehouse(searchQuery, headers),
        searchShipments(searchQuery, headers),
        searchUsers(searchQuery, headers)
      ];

      const searchResults = await Promise.allSettled(searchPromises);
      const allResults: SearchResult[] = [];

      searchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value);
        }
      });

      // Sort by relevance and limit results
      const sortedResults = allResults
        .sort((a, b) => {
          // Prioritize exact matches
          const aExact = a.title.toLowerCase().includes(searchQuery.toLowerCase());
          const bExact = b.title.toLowerCase().includes(searchQuery.toLowerCase());
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return 0;
        })
        .slice(0, maxResults);

      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  // Search functions for each module
  const searchProducts = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/products?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((product: any) => ({
        id: product.id,
        type: 'product' as const,
        title: product.serialNumber || 'Seri Numarası Yok',
        subtitle: product.productModel?.name || 'Model Yok',
        description: `${product.manufacturer?.name || 'Üretici Yok'} - ${product.status || 'Durum Yok'}`,
        status: product.status,
        icon: <BuildIcon />,
        url: `/dashboard/products`,
        metadata: { product }
      }));
    } catch {
      return [];
    }
  };

  const searchIssues = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/issues?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((issue: any) => ({
        id: issue.id,
        type: 'issue' as const,
        title: issue.issueNumber || 'Arıza Numarası Yok',
        subtitle: issue.customerDescription || 'Açıklama Yok',
        description: `${issue.company?.name || 'Şirket Yok'} - ${issue.priority || 'Öncelik Yok'}`,
        status: issue.status,
        icon: <AssignmentIcon />,
        url: `/dashboard/issues`,
        metadata: { issue }
      }));
    } catch {
      return [];
    }
  };

  const searchCompanies = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/companies?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((company: any) => ({
        id: company.id,
        type: 'company' as const,
        title: company.name,
        subtitle: company.email || 'E-posta Yok',
        description: `${company.phone || 'Telefon Yok'} - ${company.industry || 'Sektör Yok'}`,
        status: company.isManufacturer ? 'Üretici' : 'Müşteri',
        icon: <BusinessIcon />,
        url: `/dashboard/companies`,
        metadata: { company }
      }));
    } catch {
      return [];
    }
  };

  const searchWarehouse = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/warehouse?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((location: any) => ({
        id: location.id,
        type: 'warehouse' as const,
        title: location.name,
        subtitle: location.description || 'Açıklama Yok',
        description: `Kapasite: ${location.capacity || 0} - Mevcut: ${location.currentCount || 0}`,
        status: location.status,
        icon: <InventoryIcon />,
        url: `/dashboard/warehouse`,
        metadata: { location }
      }));
    } catch {
      return [];
    }
  };

  const searchShipments = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/shipments?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((shipment: any) => ({
        id: shipment.id,
        type: 'shipment' as const,
        title: shipment.shipmentNumber || 'Sevkiyat Numarası Yok',
        subtitle: shipment.trackingNumber || 'Takip Numarası Yok',
        description: `${shipment.shipmentType || 'Tip Yok'} - ${shipment.status || 'Durum Yok'}`,
        status: shipment.status,
        icon: <ShippingIcon />,
        url: `/dashboard/shipments`,
        metadata: { shipment }
      }));
    } catch {
      return [];
    }
  };

  const searchUsers = async (query: string, headers: any): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:3015/api/v1/users?search=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).map((user: any) => ({
        id: user.id,
        type: 'user' as const,
        title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'İsim Yok',
        subtitle: user.email || 'E-posta Yok',
        description: `${user.role || 'Rol Yok'} - ${user.isActive ? 'Aktif' : 'Pasif'}`,
        status: user.isActive ? 'Aktif' : 'Pasif',
        icon: <PersonIcon />,
        url: `/dashboard/users`,
        metadata: { user }
      }));
    } catch {
      return [];
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      setOpen(true);
      setAnchorEl(event.currentTarget);
    } else {
      setOpen(false);
      setResults([]);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default behavior: navigate to the result
      window.location.href = result.url;
    }
    setOpen(false);
    setQuery('');
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'aktif':
      case 'completed':
      case 'delivered':
      case 'success':
        return 'success';
      case 'inactive':
      case 'pasif':
      case 'pending':
      case 'waiting':
        return 'warning';
      case 'error':
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Ürün';
      case 'issue': return 'Arıza';
      case 'company': return 'Şirket';
      case 'warehouse': return 'Depo';
      case 'shipment': return 'Sevkiyat';
      case 'user': return 'Kullanıcı';
      default: return type;
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        />

        <Popper
          open={open && results.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Aranıyor...
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {results.map((result, index) => (
                      <Box key={result.id}>
                        <ListItem
                          button
                          onClick={() => handleResultClick(result)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {result.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle2" noWrap>
                                  {result.title}
                                </Typography>
                                <Chip
                                  label={getTypeLabel(result.type)}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {result.status && (
                                  <Chip
                                    label={result.status}
                                    size="small"
                                    color={getStatusColor(result.status) as any}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {result.subtitle}
                                </Typography>
                                {result.description && (
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {result.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < results.length - 1 && <Divider />}
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

export default GlobalSearch;
