"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Badge,
  Chip,
  Typography,
  Pagination,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";

// Interfaces
export interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedProductIds: number[];
  onSelectionChange: (productIds: number[]) => void;
  title?: string;
}

interface ProductSearchParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  serialRangeStart?: string;
  serialRangeEnd?: string;
}

interface ProductSearchResult {
  products: Array<{
    value: number;
    label: string;
    serial?: string;
    status?: string;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Helper function to parse serial number ranges
const parseSerialRange = (
  rangeInput: string
): { start: string; end: string } | null => {
  // Normalize the input by removing spaces and converting to uppercase
  const normalized = rangeInput.trim().toUpperCase();

  // Must contain a dash to be valid
  if (!normalized.includes('-')) return null;

  // Match patterns like "SN050-SN099", "050-099", "SN050 - SN099", etc.
  const rangePattern = /^(?:SN)?(\d+)\s*-\s*(?:SN)?(\d+)$/;
  const match = normalized.match(rangePattern);

  if (!match) return null;

  const [, start, end] = match;
  
  // Both start and end must be valid numbers
  if (!start || !end || isNaN(Number(start)) || isNaN(Number(end))) return null;
  
  // Start must be less than or equal to end
  if (Number(start) > Number(end)) return null;

  return {
    start: start,
    end: end,
  };
};

// Helper function to check if a serial number is in range
const isSerialInRange = (
  serial: string,
  startRange: string,
  endRange: string
): boolean => {
  const serialNum = serial.replace(/^SN/, "");
  return serialNum >= startRange && serialNum <= endRange;
};

// Helper function to generate serial numbers in range
const generateSerialRange = (
  startRange: string,
  endRange: string
): string[] => {
  const start = parseInt(startRange);
  const end = parseInt(endRange);
  const serials: string[] = [];

  for (let i = start; i <= end && serials.length < 1000; i++) {
    // Cap at 1000 for performance
    serials.push(`SN${String(i)}`);
  }

  return serials;
};

// Real API function for searching products with pagination
const searchProducts = async (
  params: ProductSearchParams
): Promise<ProductSearchResult> => {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.pageSize.toString(),
    });

    if (params.searchQuery) {
      queryParams.append('search', params.searchQuery);
    }

    const response = await fetch(`http://localhost:3015/api/v1/products?${queryParams.toString()}`, { headers });
    
    if (response.ok) {
      const data = await response.json();
      const products = (data.data || []).map((product: any) => ({
        value: product.id,
        label: `${product.serialNumber} (${product.status})`,
        serial: product.serialNumber,
        status: product.status,
      }));

      return {
        products,
        totalCount: data.pagination?.total || products.length,
        totalPages: data.pagination?.totalPages || Math.ceil(products.length / params.pageSize),
        currentPage: params.page,
      };
    }

    // Fallback to empty result if API fails
    return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.page,
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.page,
    };
  }
};

export const ProductSelectionModal = ({
  open,
  onClose,
  selectedProductIds,
  onSelectionChange,
  title = "Select Products",
}: ProductSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [serialRange, setSerialRange] = useState("");
  const [tempSelectedIds, setTempSelectedIds] =
    useState<number[]>(selectedProductIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ProductSearchResult>({
    products: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  });

  // Debounced search effect
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const performSearch = async (
    query: string,
    page: number,
    size: number,
    rangeInput?: string
  ) => {
    setLoading(true);
    try {
      let searchParams: ProductSearchParams = {
        searchQuery: query,
        page,
        pageSize: size,
      };

      // Check if we have a serial range input
      if (rangeInput) {
        const parsedRange = parseSerialRange(rangeInput);
        if (parsedRange) {
          searchParams.serialRangeStart = parsedRange.start;
          searchParams.serialRangeEnd = parsedRange.end;
          searchParams.searchQuery = ""; // Clear regular search when using range
        } else {
          // If range input exists but is invalid, show no results
          setSearchResult({
            products: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
          });
          return;
        }
      }

      const result = await searchProducts(searchParams);
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset selection and page when modal opens
  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedProductIds);
      setCurrentPage(1);
      setSearchQuery("");
      setSerialRange("");
      performSearch("", 1, pageSize);
    }
  }, [open, selectedProductIds, pageSize]);

  // Handle page and page size changes
  useEffect(() => {
    if (open) {
      performSearch(searchQuery, currentPage, pageSize, serialRange);
    }
  }, [currentPage, pageSize]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      performSearch(searchQuery, 1, pageSize, serialRange);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery, serialRange]);

  const filteredProducts = searchResult.products;

  const handleToggleProduct = (productId: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    // Add current page products to selection (preserve existing selections)
    const currentPageIds = filteredProducts.map((p) => p.value);
    const newSelection = [...new Set([...tempSelectedIds, ...currentPageIds])];
    setTempSelectedIds(newSelection);
  };

  const handleDeselectAll = () => {
    setTempSelectedIds([]);
  };

  const handleSelectByRange = async () => {
    const parsedRange = parseSerialRange(serialRange);
    if (!parsedRange) return;

    // Generate serial numbers in the range
    const serialsInRange = generateSerialRange(
      parsedRange.start,
      parsedRange.end
    );

    // Create product IDs based on the serial range
    // Products are created with serial format SN000001, SN000002, etc.
    // and the product ID matches the serial number (e.g., SN000001 has ID 1)
    const productIdsInRange: number[] = [];
    
    for (const serial of serialsInRange) {
      // Extract the numeric part from serial (e.g., "SN000001" -> 1)
      const numericPart = serial.replace(/^SN0*/, '');
      const productId = parseInt(numericPart);
      if (!isNaN(productId) && productId > 0) {
        productIdsInRange.push(productId);
      }
    }

    // Add the range products to selection
    const updatedSelection = [
      ...new Set([...tempSelectedIds, ...productIdsInRange]),
    ];
    setTempSelectedIds(updatedSelection);
  };

  const handleSave = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedProductIds); // Reset to original selection
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge
              color="primary"
              badgeContent={tempSelectedIds.length}
              max={999}
            >
              <Chip
                label={`${tempSelectedIds.length} selected`}
                color="primary"
                size="small"
              />
            </Badge>
            <IconButton onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search Bar */}
        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products by name or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!!serialRange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Serial Range Selection */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterIcon fontSize="small" />
            Serial Number Range Selection
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="e.g., SN000001-SN000005"
              value={serialRange}
              onChange={(e) => setSerialRange(e.target.value)}
              disabled={!!searchQuery}
              size="small"
              sx={{ flexGrow: 1 }}      
              helperText="Enter range like 'SN000001-SN000005' to select 5 products"
            />
            <Tooltip title="Select all products in the specified serial range">
              <Button
                variant="contained"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectByRange}
                disabled={!serialRange || !parseSerialRange(serialRange)}
                size="small"
              >
                Select Range
              </Button>
            </Tooltip>
          </Stack>
        </Paper>

        {/* Results Info and Actions */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {loading
                ? "Searching..."
                : `Showing ${Math.min(filteredProducts.length, pageSize)} of ${searchResult.totalCount} products (Page ${searchResult.currentPage} of ${searchResult.totalPages})`}
            </Typography>
            {serialRange && parseSerialRange(serialRange) && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Filtered by serial range: {serialRange.toUpperCase()}(
                {(() => {
                  const range = parseSerialRange(serialRange);
                  return range
                    ? `${parseInt(range.end) - parseInt(range.start) + 1} serials`
                    : "";
                })()}
                )
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAll}
              disabled={filteredProducts.length === 0 || loading}
            >
              Select All ({filteredProducts.length})
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeselectAll}
              disabled={tempSelectedIds.length === 0}
            >
              Deselect All
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Products List */}
        <Box sx={{ position: "relative", minHeight: 300 }}>
          {loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {filteredProducts.map((product) => {
              const isSelected = tempSelectedIds.includes(product.value);
              return (
                <ListItem
                  key={product.value}
                  dense
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleToggleProduct(product.value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={product.label}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          ID: {product.value} | Serial: {product.serial}
                        </Typography>
                        <Chip
                          label={product.status}
                          size="small"
                          variant="outlined"
                          color={
                            product.status === "ACTIVE" ? "success" : "default"
                          }
                        />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          {!loading && filteredProducts.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No products found matching "{searchQuery}"
            </Typography>
          )}
        </Box>

        {/* Pagination and Page Size Controls */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          {/* Left spacer for layout balance */}
          <Box sx={{ minWidth: 120 }} />

          {/* Center: Pagination */}
          <Box display="flex" justifyContent="center" flex={1}>
            {searchResult.totalPages > 1 && (
              <Pagination
                count={searchResult.totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
              />
            )}
          </Box>

          {/* Right: Per Page selector */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              label="Per Page"
              size="small"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={tempSelectedIds.length === 0}
        >
          Save Selection ({tempSelectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
