"use client";

import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  TableSortLabel,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useState, useMemo } from "react";

export type CustomerProduct = {
  id: number;
  name: string;
  serialNumber: string;
  installationDate: string;
  warrantyExpiry: string;
  status: "Operational" | "Under Service" | "Inactive" | "Maintenance Required";
  location: string;
  lastService: string;
};

type CustomerProductsGridProps = {
  products: CustomerProduct[];
  onViewProduct?: (productId: number) => void;
  onRequestService?: (productId: number) => void;
  onViewDetails?: (productId: number) => void;
  onExportProducts?: () => void;
  onBulkService?: (productIds: number[]) => void;
};

const getStatusColor = (status: CustomerProduct["status"]) => {
  switch (status) {
    case "Operational":
      return "success";
    case "Under Service":
      return "warning";
    case "Inactive":
      return "error";
    case "Maintenance Required":
      return "info";
    default:
      return "default";
  }
};

const isWarrantyActive = (warrantyExpiry: string) => {
  return new Date(warrantyExpiry) > new Date();
};

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof CustomerProduct;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'name', label: 'Ürün Adı', numeric: false, sortable: true },
  { id: 'serialNumber', label: 'Seri No', numeric: false, sortable: true },
  { id: 'status', label: 'Durum', numeric: false, sortable: true },
  { id: 'location', label: 'Lokasyon', numeric: false, sortable: true },
  { id: 'installationDate', label: 'Kurulum Tarihi', numeric: false, sortable: true },
  { id: 'warrantyExpiry', label: 'Garanti', numeric: false, sortable: true },
  { id: 'lastService', label: 'Son Servis', numeric: false, sortable: true },
];

interface EnhancedTableHeadProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof CustomerProduct) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof CustomerProduct) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all products',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
        <TableCell align="right">İşlemler</TableCell>
      </TableRow>
    </TableHead>
  );
}

export function CustomerProductsGrid({
  products,
  onViewProduct,
  onRequestService,
  onViewDetails,
  onExportProducts,
  onBulkService,
}: CustomerProductsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [warrantyFilter, setWarrantyFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof CustomerProduct>('name');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  // Statistics and filtering logic
  const statistics = useMemo(() => {
    const total = products.length;
    const operational = products.filter(p => p.status === "Operational").length;
    const underService = products.filter(p => p.status === "Under Service").length;
    const inactive = products.filter(p => p.status === "Inactive").length;
    const maintenanceRequired = products.filter(p => p.status === "Maintenance Required").length;
    const warrantyActive = products.filter(p => isWarrantyActive(p.warrantyExpiry)).length;
    const warrantyExpired = total - warrantyActive;

    return {
      total,
      operational,
      underService,
      inactive,
      maintenanceRequired,
      warrantyActive,
      warrantyExpired,
    };
  }, [products]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    return [...new Set(products.map(p => p.location))];
  }, [products]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesLocation = locationFilter === "all" || product.location === locationFilter;
      
      let matchesWarranty = true;
      if (warrantyFilter === "active") {
        matchesWarranty = isWarrantyActive(product.warrantyExpiry);
      } else if (warrantyFilter === "expired") {
        matchesWarranty = !isWarrantyActive(product.warrantyExpiry);
      }

      return matchesSearch && matchesStatus && matchesLocation && matchesWarranty;
    });
  }, [products, searchTerm, statusFilter, locationFilter, warrantyFilter]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const isAsc = order === 'asc';
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle date sorting
      if (orderBy === 'installationDate' || orderBy === 'warrantyExpiry' || orderBy === 'lastService') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) {
        return isAsc ? -1 : 1;
      }
      if (aValue > bValue) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProducts, order, orderBy]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof CustomerProduct) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    
    // Set filters based on tab
    switch (newValue) {
      case 0: // All
        setStatusFilter("all");
        setWarrantyFilter("all");
        break;
      case 1: // Operational
        setStatusFilter("Operational");
        setWarrantyFilter("all");
        break;
      case 2: // Under Service
        setStatusFilter("Under Service");
        setWarrantyFilter("all");
        break;
      case 3: // Maintenance Required
        setStatusFilter("Maintenance Required");
        setWarrantyFilter("all");
        break;
      case 4: // Warranty Issues
        setWarrantyFilter("expired");
        setStatusFilter("all");
        break;
      default:
        setStatusFilter("all");
        setWarrantyFilter("all");
    }
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedProducts.length) : 0;

  const visibleRows = useMemo(
    () => sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedProducts, page, rowsPerPage]
  );

  if (products.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Henüz kayıtlı ürününüz bulunmuyor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Satın aldığınız ürünler burada görünecektir.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header with Statistics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" component="h2">
            Şirket Ürünleri
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onExportProducts}
              size="small"
            >
              Dışa Aktar
            </Button>
            {selected.length > 0 && (
              <Button
                variant="contained"
                startIcon={<BuildIcon />}
                onClick={() => onBulkService?.(selected as number[])}
                size="small"
              >
                Toplu Servis ({selected.length})
              </Button>
            )}
          </Box>
        </Box>

        {/* Statistics Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab 
            label={
              <Badge badgeContent={statistics.total} color="primary">
                Tümü
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.operational} color="success">
                Çalışıyor
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.underService} color="warning">
                Serviste
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.maintenanceRequired} color="info">
                Bakım Gerekli
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.warrantyExpired} color="error">
                Garanti Süresi Dolmuş
              </Badge>
            } 
          />
        </Tabs>

        {/* Search and Filter Controls */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Ürün ara (isim, seri no, lokasyon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
            size="small"
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
          >
            Filtreler
          </Button>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ display: "flex", gap: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Lokasyon</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label="Lokasyon"
              >
                <MenuItem value="all">Tümü</MenuItem>
                {uniqueLocations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Garanti Durumu</InputLabel>
              <Select
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                label="Garanti Durumu"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="expired">Süresi Dolmuş</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredProducts.length} ürün bulundu (toplam {products.length})
        </Typography>
      </Box>

      {/* Data Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={visibleRows.length}
            />
            <TableBody>
              {visibleRows.map((product, index) => {
                const isItemSelected = isSelected(product.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, product.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={product.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="normal">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {product.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="disabled" />
                        <Typography variant="body2" noWrap>
                          {product.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">
                          {formatDate(product.installationDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">
                          {formatDate(product.warrantyExpiry)}
                        </Typography>
                        {isWarrantyActive(product.warrantyExpiry) ? (
                          <CheckCircleIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(product.lastService)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Detaylar">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails?.(product.id);
                            }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProduct?.(product.id);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Servis Talep Et">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestService?.(product.id);
                            }}
                            color="secondary"
                          >
                            <BuildIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Box>
  );
} 