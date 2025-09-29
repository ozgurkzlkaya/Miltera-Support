'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  FormControlLabel,
  Switch,
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

export interface SearchOptions {
  query: string;
  entityTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  priority: string[];
  assignedTo: string[];
  companyId: string[];
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
  exactMatch: boolean;
}

interface AdvancedSearchProps {
  onSearch: (options: SearchOptions) => void;
  onSaveSearch?: (name: string, options: SearchOptions) => void;
  loading?: boolean;
  savedSearches?: Array<{ id: string; name: string; options: SearchOptions }>;
  onLoadSavedSearch?: (searchId: string) => void;
}

const defaultOptions: SearchOptions = {
    query: '',
  entityTypes: ['issue', 'product', 'service_operation', 'shipment', 'company', 'user'],
  dateRange: {
    start: '',
    end: '',
  },
    status: [],
    priority: [],
    assignedTo: [],
  companyId: [],
  tags: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  includeArchived: false,
  exactMatch: false,
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSaveSearch,
  loading = false,
  savedSearches = [],
  onLoadSavedSearch,
}) => {
  const [options, setOptions] = useState<SearchOptions>(defaultOptions);
  const [expanded, setExpanded] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchOptions[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  const handleSearch = () => {
    onSearch(options);
    
    // Save to recent searches
    const newRecent = [options, ...recentSearches.filter((search, index) => 
      JSON.stringify(search) !== JSON.stringify(options) && index < 9
    )];
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const handleClear = () => {
    setOptions(defaultOptions);
  };

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      onSaveSearch(searchName.trim(), options);
      setSaveDialogOpen(false);
      setSearchName('');
    }
  };

  const handleLoadRecentSearch = (search: SearchOptions) => {
    setOptions(search);
    onSearch(search);
  };

  const handleLoadSavedSearch = (searchId: string) => {
    if (onLoadSavedSearch) {
      onLoadSavedSearch(searchId);
    }
  };

  const updateOptions = (updates: Partial<SearchOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const entityTypeOptions = [
    { value: 'issue', label: 'Arızalar' },
    { value: 'product', label: 'Ürünler' },
    { value: 'service_operation', label: 'Servis Operasyonları' },
    { value: 'shipment', label: 'Sevkiyatlar' },
    { value: 'company', label: 'Şirketler' },
    { value: 'user', label: 'Kullanıcılar' },
  ];

  const statusOptions = [
    { value: 'OPEN', label: 'Açık' },
    { value: 'IN_PROGRESS', label: 'İşlemde' },
    { value: 'REPAIRED', label: 'Tamir Edildi' },
    { value: 'CLOSED', label: 'Kapalı' },
    { value: 'DELIVERED', label: 'Teslim Edildi' },
    { value: 'PENDING', label: 'Beklemede' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Düşük' },
    { value: 'MEDIUM', label: 'Orta' },
    { value: 'HIGH', label: 'Yüksek' },
    { value: 'CRITICAL', label: 'Kritik' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Oluşturulma Tarihi' },
    { value: 'updatedAt', label: 'Güncellenme Tarihi' },
    { value: 'title', label: 'Başlık' },
    { value: 'status', label: 'Durum' },
    { value: 'priority', label: 'Öncelik' },
  ];

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
        {/* Main Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
            placeholder="Arama yapın... (arıza numarası, ürün adı, şirket adı, vb.)"
            value={options.query}
            onChange={(e) => updateOptions({ query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Ara
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ borderRadius: 2 }}
          >
            Filtreler
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {options.entityTypes.length > 0 && (
            <Chip
              label={`Türler: ${options.entityTypes.length}`}
              size="small"
              onDelete={() => updateOptions({ entityTypes: [] })}
            />
          )}
          {options.status.length > 0 && (
            <Chip
              label={`Durumlar: ${options.status.length}`}
              size="small"
              onDelete={() => updateOptions({ status: [] })}
            />
          )}
          {options.priority.length > 0 && (
            <Chip
              label={`Öncelikler: ${options.priority.length}`}
              size="small"
              onDelete={() => updateOptions({ priority: [] })}
            />
          )}
          {options.dateRange.start && (
            <Chip
              label={`Tarih: ${options.dateRange.start} - ${options.dateRange.end || 'Bugün'}`}
              size="small"
              onDelete={() => updateOptions({ dateRange: { start: '', end: '' } })}
            />
          )}
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            sx={{ ml: 'auto' }}
          >
            Temizle
          </Button>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {/* Entity Types */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Arama Türleri</InputLabel>
                <Select
                    multiple
                    value={options.entityTypes}
                    onChange={(e) => updateOptions({ entityTypes: e.target.value as string[] })}
                    label="Arama Türleri"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={entityTypeOptions.find(opt => opt.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {entityTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    multiple
                    value={options.status}
                    onChange={(e) => updateOptions({ status: e.target.value as string[] })}
                    label="Durum"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={statusOptions.find(opt => opt.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
          </Grid>

              {/* Priority */}
                  <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                      multiple
                    value={options.priority}
                    onChange={(e) => updateOptions({ priority: e.target.value as string[] })}
                    label="Öncelik"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={priorityOptions.find(opt => opt.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sıralama</InputLabel>
                  <Select
                    value={options.sortBy}
                    onChange={(e) => updateOptions({ sortBy: e.target.value })}
                    label="Sıralama"
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={options.dateRange.start}
                  onChange={(e) => updateOptions({ 
                    dateRange: { ...options.dateRange, start: e.target.value }
                  })}
                  InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  type="date"
                  value={options.dateRange.end}
                  onChange={(e) => updateOptions({ 
                    dateRange: { ...options.dateRange, end: e.target.value }
                  })}
                  InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

              {/* Options */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.includeArchived}
                        onChange={(e) => updateOptions({ includeArchived: e.target.checked })}
                      />
                    }
                    label="Arşivlenmiş kayıtları dahil et"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.exactMatch}
                        onChange={(e) => updateOptions({ exactMatch: e.target.checked })}
                      />
                    }
                    label="Tam eşleşme"
                      />
                </Box>
                  </Grid>
                      </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={!options.query.trim()}
                    >
                Arama Kaydet
                    </Button>
                    <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Gelişmiş Arama
                    </Button>
                  </Box>
              </Box>
            </Collapse>

        {/* Recent Searches */}
                {recentSearches.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon fontSize="small" />
                Son Aramalar
                    </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {recentSearches.slice(0, 5).map((search, index) => (
                          <Chip
                            key={index}
                  label={search.query || 'Boş arama'}
                  size="small"
                  onClick={() => handleLoadRecentSearch(search)}
                  sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
          </Box>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Kayıtlı Aramalar
              </Typography>
            <List dense>
              {savedSearches.map((search) => (
                    <ListItem
                  key={search.id}
                  button
                  onClick={() => handleLoadSavedSearch(search.id)}
                  sx={{ borderRadius: 1 }}
                >
                    <ListItemText
                    primary={search.name}
                    secondary={search.options.query || 'Boş arama'}
                    />
                    </ListItem>
                  ))}
                </List>
          </Box>
        )}
        </CardContent>

      {/* Save Search Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Arama Kaydet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Arama Adı"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSaveSearch}
            disabled={!searchName.trim()}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      </Card>
  );
};

export default AdvancedSearch;
