"use client";

import {
  Toolbar,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Stack,
  MenuProps,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  SelectAll as SelectAllIcon,
  PostAdd as BulkAddIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useMemo } from "react";
import { debounce } from "lodash-es";

interface DataTableToolbarProps {
  title: string;
  searchable?: boolean;
  addButtonText?: string;
  bulkAddButtonText?: string;
  isLoading?: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onAddClick: () => void;
  onBulkAddClick?: () => void;
  onRefresh?: () => void;
  selectedCount: number;

  setBulkMenuAnchor: (anchor: HTMLElement | null) => void;
  setFilterMenuAnchor: (anchor: HTMLElement | null) => void;
}

const DataTableToolbar = ({
  title,
  searchable = true,
  addButtonText = "Add New",
  bulkAddButtonText = "Bulk Add",
  globalFilter,
  isLoading = false,
  onGlobalFilterChange,
  onAddClick,
  onBulkAddClick,
  onRefresh,
  selectedCount,
  setBulkMenuAnchor,
  setFilterMenuAnchor,
}: DataTableToolbarProps) => {
  // Debounced search handler
  const debouncedGlobalFilterChange = useMemo(
    () => debounce(onGlobalFilterChange, 300),
    [onGlobalFilterChange]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedGlobalFilterChange(event.target.value);
  };

  const isSelecting = selectedCount > 0;

  return (
    <Toolbar
      sx={{
        minHeight: 75,
        p: 2,
        ...(selectedCount > 0 && {
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? "rgba(25, 118, 210, 0.12)"
              : "rgba(144, 202, 249, 0.16)",
        }),
      }}
    >
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" id="tableTitle" component="div">
            {title}
          </Typography>
          {selectedCount > 0 ? (
            <Typography color="inherit" variant="subtitle1" component="div">
              {selectedCount} selected
            </Typography>
          ) : null}
        </Box>

        <Box display="flex">
          <Box mx={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Bulk Actions */}
              {isSelecting ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<SelectAllIcon />}
                    onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions ({selectedCount})
                  </Button>
                </>
              ) : null}

              {searchable && (
                <TextField
                  placeholder="Search..."
                  variant="outlined"
                  size="small"
                  onChange={handleSearchChange}
                  sx={{ minWidth: 200 }}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    },
                  }}
                />
              )}

              <Tooltip title="Filter">
                <IconButton
                  disabled={isLoading}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>

              {!isSelecting && onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton onClick={onRefresh} disabled={isLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {isSelecting ? null : (
            <Stack direction="column" spacing={2}>
              {onBulkAddClick && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<BulkAddIcon />}
                  onClick={onBulkAddClick}
                  disabled={isLoading}
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {bulkAddButtonText}
                </Button>
              )}

              {onAddClick && (
                <Button
                  variant="contained"
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                  startIcon={<AddIcon />}
                  onClick={onAddClick}
                  disabled={isLoading}
                >
                  {addButtonText}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Toolbar>
  );
};

export { DataTableToolbar };
export type { DataTableToolbarProps };
