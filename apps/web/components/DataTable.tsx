"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Toolbar,
  Tooltip,
  TableSortLabel,
  TablePagination,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  Divider,
  Stack,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";

export interface TableColumn {
  id: string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "date" | "number";
  filterOptions?: Array<{ value: string; label: string }>;
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "autocomplete"
    | "date"
    | "datetime-local"
    | "multiselect";
  required?: boolean;
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  validation?: (value: any) => string | null;
  placeholder?: string;
  helperText?: string;
  multiple?: boolean;
  searchable?: boolean;
  loadOptions?: (
    query: string
  ) => Promise<Array<{ value: string | number; label: string }>>;
  // Layout configuration for multiple inputs per row
  layout?: {
    row: number; // Which row this field belongs to (0-based)
    column: number; // Which column in the row (0-based)
    width?: number; // Grid width (1-12, defaults to equal distribution)
  };
  // Field state
  disabled?: boolean | ((isEdit: boolean, formData: any) => boolean); // Can be static or dynamic
  showInCreateMode?: boolean; // Whether to show in create mode (default: true)
  showInEditMode?: boolean; // Whether to show in edit mode (default: true)
  // Custom properties
  isProductSelector?: boolean; // Custom flag for product selector field
  onProductSelectorClick?: (
    currentValue: any,
    onSelectionChange: (value: any) => void
  ) => void;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  action: (selectedIds: (string | number)[]) => void;
  confirmMessage?: string;
}

export interface ToolbarButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "text" | "outlined" | "contained";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  onClick: () => void;
  disabled?: boolean;
}

interface DataTableProps {
  title: string;
  columns: TableColumn[];
  data: any[];
  formFields: FormField[];
  onAdd?: (data: any) => void;
  onEdit?: (id: string | number, data: any) => void;
  onView?: (id: string | number, data: any) => void;
  onDelete?: (id: string | number) => void;
  onBulkDelete?: (ids: (string | number)[]) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  searchable?: boolean;
  selectable?: boolean;
  addButtonText?: string;
  idField?: string;
  pageSize?: number;
  loading?: boolean;
  error?: string;
  bulkActions?: BulkAction[];
  totalCount?: number;
  serverSide?: boolean;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  customToolbarButtons?: ToolbarButton[];
  toolbarButtonsLayout?: "horizontal" | "vertical";
}

export const DataTable = ({
  title,
  columns,
  data,
  formFields,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  onRefresh,
  onExport,
  searchable = true,
  selectable = false,
  addButtonText = "Add New",
  idField = "id",
  pageSize = 10,
  loading = false,
  error,
  bulkActions = [],
  totalCount,
  serverSide = false,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  customToolbarButtons = [],
  toolbarButtonsLayout = "horizontal",
}: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Handle external state changes
  const handleSortingChange = useCallback(
    (updaterOrValue: any) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    [sorting, onSortingChange]
  );

  const handlePaginationChange = useCallback(
    (updaterOrValue: any) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    [pagination, onPaginationChange]
  );

  const handleFiltersChange = useCallback(
    (updaterOrValue: any) => {
      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue;
      setColumnFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [columnFilters, onFilterChange]
  );

  // Create TanStack Table columns
  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [];

    // Add selection column if selectable
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    // Add data columns
    cols.push(
      ...columns.map((column) => ({
        id: column.id,
        accessorKey: column.id,
        header: column.label,
        size: column.width,
        cell: ({ getValue, row }: any) => {
          const value = getValue();
          if (column.render) {
            return column.render(value, row.original);
          }
          if (column.format) {
            return column.format(value);
          }
          return value;
        },
        enableSorting: column.sortable !== false,
        enableColumnFilter: column.filterable !== false,
      }))
    );

    // Add actions column if needed
    if (onEdit || onView || onDelete) {
      cols.push({
        id: "actions",
        accessorKey: "actions",
        header: "Actions",
        size: 160,
        cell: ({ row }: any) => (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {onView && (
              <Tooltip title="View">
                <IconButton
                  size="small"
                  onClick={() => onView(row.original[idField], row.original)}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(row.original)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(row.original[idField])}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    return cols;
  }, [columns, onEdit, onView, onDelete, idField, selectable]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    rowCount: totalCount ?? data.length,
    enableRowSelection: selectable,
    getRowId: (row) => row[idField],
  });

  // Initialize form data
  const initializeForm = (item?: any) => {
    const initialData: any = {};
    formFields.forEach((field) => {
      initialData[field.id] = item
        ? item[field.id]
        : field.type === "multiselect"
          ? []
          : "";
    });
    setFormData(initialData);
    setFormErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors: any = {};
    formFields.forEach((field) => {
      const value = formData[field.id];

      if (
        field.required &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        errors[field.id] = `${field.label} is required`;
      }

      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          errors[field.id] = validationError;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingItem) {
      onEdit?.(editingItem[idField], formData);
    } else {
      onAdd?.(formData);
    }

    handleCloseModal();
  };

  const handleAdd = () => {
    setEditingItem(null);
    initializeForm();
    setOpenModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    initializeForm(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
    if (formErrors[fieldId]) {
      setFormErrors((prev: any) => ({ ...prev, [fieldId]: null }));
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.id];
    const error = formErrors[field.id];
    const isEdit = !!editingItem;

    // Check visibility conditions
    const showInCreateMode = field.showInCreateMode !== false;
    const showInEditMode = field.showInEditMode !== false;

    if (!isEdit && !showInCreateMode) return null;
    if (isEdit && !showInEditMode) return null;

    // Calculate disabled state
    const isDisabled =
      typeof field.disabled === "function"
        ? field.disabled(isEdit, formData)
        : field.disabled || false;

    const commonProps = {
      fullWidth: true,
      margin: "normal" as const,
      error: !!error,
      helperText: error || field.helperText,
      label: field.label,
      required: field.required,
      disabled: isDisabled,
    };

    switch (field.type) {
      case "autocomplete":
      case "multiselect":
        return (
          <Autocomplete
            key={field.id}
            multiple={field.type === "multiselect"}
            options={field.options || []}
            getOptionLabel={(option: any) => option.label}
            disabled={isDisabled}
            value={
              field.type === "multiselect"
                ? (field.options || []).filter((opt) =>
                    (value || []).includes(opt.value)
                  )
                : (field.options || []).find((opt) => opt.value === value) ||
                  null
            }
            onChange={(_, newValue) => {
              if (!isDisabled) {
                if (field.type === "multiselect") {
                  handleInputChange(
                    field.id,
                    Array.isArray(newValue) ? newValue.map((v) => v.value) : []
                  );
                } else {
                  handleInputChange(field.id, newValue ? newValue.value : "");
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...commonProps}
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case "select":
        return (
          <FormControl key={field.id} {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) =>
                !isDisabled && handleInputChange(field.id, e.target.value)
              }
              label={field.label}
              disabled={isDisabled}
            >
              {field.options?.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "number":
        return (
          <TextField
            key={field.id}
            {...commonProps}
            type="number"
            value={value}
            onChange={(e) =>
              !isDisabled && handleInputChange(field.id, e.target.value)
            }
            placeholder={field.placeholder}
          />
        );

      case "date":
      case "datetime-local":
        return (
          <TextField
            key={field.id}
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) =>
              !isDisabled && handleInputChange(field.id, e.target.value)
            }
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        // Handle product selector field
        if (field.isProductSelector) {
          const displayValue =
            Array.isArray(value) && value.length > 0
              ? `${value.length} product${value.length > 1 ? "s" : ""} selected`
              : field.placeholder || "Click to select products...";

          return (
            <TextField
              key={field.id}
              {...commonProps}
              value={displayValue}
              onClick={() => {
                if (!isDisabled && field.onProductSelectorClick) {
                  field.onProductSelectorClick(value, (newValue) => {
                    handleInputChange(field.id, newValue);
                  });
                }
              }}
              InputProps={{
                readOnly: true,
                sx: { cursor: "pointer" },
              }}
            />
          );
        }

        return (
          <TextField
            key={field.id}
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) =>
              !isDisabled && handleInputChange(field.id, e.target.value)
            }
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Render form fields with layout support
  const renderFormLayout = () => {
    const isEdit = !!editingItem;

    // Filter fields based on visibility conditions
    const visibleFields = formFields.filter((field) => {
      const showInCreateMode = field.showInCreateMode !== false;
      const showInEditMode = field.showInEditMode !== false;

      if (!isEdit && !showInCreateMode) return false;
      if (isEdit && !showInEditMode) return false;

      return true;
    });

    // Group fields by row or render as single column if no layout is specified
    const hasLayout = visibleFields.some((field) => field.layout);

    if (!hasLayout) {
      // Fallback to original single-column layout
      return visibleFields.map(renderFormField);
    }

    // Group visible fields by row
    const rowGroups: { [key: number]: FormField[] } = {};
    visibleFields.forEach((field) => {
      const row = field.layout?.row ?? 0;
      if (!rowGroups[row]) {
        rowGroups[row] = [];
      }
      rowGroups[row].push(field);
    });

    // Sort fields within each row by column
    Object.keys(rowGroups).forEach((rowKey) => {
      const row = parseInt(rowKey);
      const fieldsInRow = rowGroups[row];
      if (fieldsInRow) {
        fieldsInRow.sort(
          (a, b) => (a.layout?.column ?? 0) - (b.layout?.column ?? 0)
        );
      }
    });

    // Render each row
    return Object.keys(rowGroups)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((rowKey) => {
        const row = parseInt(rowKey);
        const fieldsInRow = rowGroups[row];

        if (!fieldsInRow || fieldsInRow.length === 0) {
          return null;
        }

        // Calculate grid sizes
        const totalFields = fieldsInRow.length;
        const hasCustomWidths = fieldsInRow.some(
          (field) => field.layout?.width
        );

        return (
          <Box
            key={`row-${row}`}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${totalFields}, 1fr)`,
              gap: 2,
              mb: 2,
              "@media (max-width: 600px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            {fieldsInRow.map((field) => (
              <Box key={field.id}>{renderFormField(field)}</Box>
            ))}
          </Box>
        );
      });
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original[idField]);

  const handleBulkActionClick = (action: BulkAction) => {
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.action(selectedIds);
        setRowSelection({});
      }
    } else {
      action.action(selectedIds);
      setRowSelection({});
    }
    setBulkMenuAnchor(null);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
          {title}
          {selectable && selectedRows.length > 0 && (
            <Badge
              badgeContent={selectedRows.length}
              color="primary"
              sx={{ ml: 2 }}
            >
              <Chip label="selected" size="small" />
            </Badge>
          )}
        </Typography>

        <Stack
          sx={{
            p: 1,
            alignItems: "center",
          }}
          direction="row"
          spacing={1}
        >
          {/* Global Search */}
          {searchable && (
            <TextField
              size="small"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {/* Bulk Actions */}
          {selectable && selectedRows.length > 0 && bulkActions.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
              >
                Actions ({selectedRows.length})
              </Button>
              <Menu
                anchorEl={bulkMenuAnchor}
                open={Boolean(bulkMenuAnchor)}
                onClose={() => setBulkMenuAnchor(null)}
              >
                {bulkActions.map((action) => (
                  <MenuItem
                    key={action.id}
                    onClick={() => handleBulkActionClick(action)}
                  >
                    {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                    <ListItemText>{action.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Action Buttons */}
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip title="Export">
              <IconButton onClick={onExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Filter">
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>

          {/* Custom Toolbar Buttons + Add Button */}
          {toolbarButtonsLayout === "vertical" ? (
            // Vertical layout: Stack buttons vertically
            customToolbarButtons.length > 0 || onAdd ? (
              <Stack
                direction="column"
                spacing={1}
                alignItems="flex-end"
                sx={{
                  pt: 2,
                  pl: 2,
                }}
              >
                {/* Custom Toolbar Buttons */}
                {customToolbarButtons.map((button) => (
                  <Button
                    key={button.id}
                    variant={button.variant || "outlined"}
                    color={button.color || "primary"}
                    startIcon={button.icon}
                    onClick={button.onClick}
                    disabled={button.disabled || loading}
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {button.label}
                  </Button>
                ))}

                {/* Add Button */}
                {onAdd && (
                  <Button
                    variant="contained"
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    disabled={loading}
                  >
                    {addButtonText}
                  </Button>
                )}
              </Stack>
            ) : null
          ) : (
            // Horizontal layout: Display buttons side by side
            <>
              {/* Custom Toolbar Buttons */}
              {customToolbarButtons.map((button) => (
                <Button
                  key={button.id}
                  variant={button.variant || "outlined"}
                  color={button.color || "primary"}
                  startIcon={button.icon}
                  onClick={button.onClick}
                  disabled={button.disabled || loading}
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {button.label}
                </Button>
              ))}

              {/* Add Button */}
              {onAdd && (
                <Button
                  variant="contained"
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  disabled={loading}
                >
                  {addButtonText}
                </Button>
              )}
            </>
          )}
        </Stack>
      </Toolbar>

      {error && (
        <Box sx={{ p: 2, bgcolor: "error.main", color: "error.contrastText" }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    align={
                      columns.find((col) => col.id === header.id)?.align ||
                      "left"
                    }
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {header.column.getCanSort() ? (
                          <TableSortLabel
                            active={header.column.getIsSorted() !== false}
                            direction={
                              header.column.getIsSorted() === false
                                ? undefined
                                : (header.column.getIsSorted() as
                                    | "asc"
                                    | "desc")
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableSortLabel>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography>No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} selected={row.getIsSelected()}>
                  {row.getVisibleCells().map((cell) => {
                    const renderedCell = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        align={
                          columns.find((col) => col.id === cell.column.id)
                            ?.align || "left"
                        }
                      >
                        {renderedCell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={
          serverSide
            ? (totalCount ?? 0)
            : table.getFilteredRowModel().rows.length
        }
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
      />

      {/* Add/Edit Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem
            ? `Edit ${title.slice(0, -1)}`
            : `Add New ${title.slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>{renderFormLayout()}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 200, maxWidth: 400 }}>
          <Typography variant="subtitle2" gutterBottom>
            Column Filters
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {columns
            .filter((col) => col.filterable !== false)
            .map((column) => {
              const currentFilter = columnFilters.find(
                (f) => f.id === column.id
              );
              const filterValue = currentFilter?.value || "";

              const handleFilterChange = (value: any) => {
                const newFilters = columnFilters.filter(
                  (f) => f.id !== column.id
                );
                if (value && value !== "") {
                  newFilters.push({
                    id: column.id,
                    value: String(value),
                  });
                }
                setColumnFilters(newFilters);
              };

              // Render based on column filterType
              switch (column.filterType) {
                case "select":
                  return (
                    <FormControl
                      key={column.id}
                      size="small"
                      fullWidth
                      margin="dense"
                    >
                      <InputLabel>{column.label}</InputLabel>
                      <Select
                        value={filterValue}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        label={column.label}
                      >
                        <MenuItem value="">
                          <em>All</em>
                        </MenuItem>
                        {column.filterOptions?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );

                case "number":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      type="number"
                      label={column.label}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleFilterChange(e.target.value)}
                    />
                  );

                case "date":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      type="date"
                      label={column.label}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  );

                default: // "text" or undefined
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      label={column.label}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleFilterChange(e.target.value)}
                    />
                  );
              }
            })}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setColumnFilters([]);
                setGlobalFilter("");
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Menu>
    </Paper>
  );
};
