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
  FormHelperText,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  FileDownload as Icon,
  Refresh as RefreshIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useState, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash-es";

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
import {
  useForm,
  Controller,
  type FieldValues,
  type ControllerRenderProps,
  type FieldError,
  set,
} from "react-hook-form";
import {
  UseQueryResult,
  UseMutationResult,
  useQuery,
  QueryKey,
  QueryFunction,
  type QueryOptions,
} from "@tanstack/react-query";
import {
  type Query,
  type PaginationResult,
} from "@miltera/helpers/query-builder";
import { get } from "lodash-es";

interface TableColumn {
  id: string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?:
    | "text"
    | "select"
    | "date"
    | "datetime"
    | "dateRange"
    | "dateTimeRange"
    | "number"
    | "boolean"
    | "multiselect"
    | "range"
    | "contains"
    | "startsWith"
    | "endsWith";
  filterOperator?:
    | "$eq"
    | "$eqi"
    | "$ne"
    | "$nei"
    | "$lt"
    | "$lte"
    | "$gt"
    | "$gte"
    | "$in"
    | "$notIn"
    | "$contains"
    | "$notContains"
    | "$containsi"
    | "$notContainsi"
    | "$null"
    | "$notNull"
    | "$between"
    | "$startsWith"
    | "$startsWithi"
    | "$endsWith"
    | "$endsWithi";
  filterOptions?: Array<{ value: string; label: string }>;
  filterDebounceMs?: number; // Custom debounce time per column
}

interface FormField {
  id: string;
  accessorKey?: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "autocomplete"
    | "date"
    | "datetime-local"
    | "multiselect"
    | "custom";
  required?: boolean;
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  validation?: {
    required?: string | boolean;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    min?: {
      value: number;
      message: string;
    };
    max?: {
      value: number;
      message: string;
    };
    validate?: (value: any) => string | boolean;
  };
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
  // Custom field properties (for type: "custom")
  customDisplayValue?: (value: any) => string; // Function to format display value
  onCustomClick?: (
    currentValue: any,
    onValueChange: (value: any) => void
  ) => void; // Click handler for custom fields
}

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  action: (selectedIds: (string | number)[]) => void;
  confirmMessage?: string;
}

interface ToolbarButton {
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

// React Query integration types
interface DataTableQuery<TData = any> {
  queryResult: UseQueryResult<{
    data: TData[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  }>;
  createMutation?: UseMutationResult<any, Error, any>;
  updateMutation?: UseMutationResult<
    any,
    Error,
    { id: string | number; payload: any }
  >;
  deleteMutation?: UseMutationResult<any, Error, { id: string | number }>;
  bulkDeleteMutation?: UseMutationResult<
    any,
    Error,
    { ids: (string | number)[] }
  >;
}

interface DataTableProps {
  title: string;
  columns: TableColumn[];
  formFields: FormField[];
  data?: any[];
  queryResult: UseQueryResult<any>;
  onAdd?: (data: any) => void;
  onEdit?: (id: string, data: any) => void;
  onView?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onRefresh?: () => void;
  on?: () => void;
  searchable?: boolean;
  selectable?: boolean;
  addButtonText?: string;
  idField?: string;
  loading?: boolean;
  error?: string;
  bulkActions?: BulkAction[];
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (globalFilter: string) => void;
  customToolbarButtons?: ToolbarButton[];
  toolbarButtonsLayout?: "horizontal" | "vertical";
  onConfirmDialogRef?: (
    showConfirmDialog: (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        severity?: "error" | "warning" | "info";
      }
    ) => void
  ) => void;
}

const DataTable = ({
  title,
  columns,
  formFields,
  data: _data,
  queryResult,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  onRefresh,
  on,
  searchable = true,
  selectable = false,
  addButtonText = "Add New",
  idField = "id",
  loading = false,
  error,
  bulkActions = [],
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  onGlobalFilterChange,
  customToolbarButtons = [],
  toolbarButtonsLayout = "horizontal",
  onConfirmDialogRef,
}: DataTableProps) => {
  const data = _data || queryResult?.data?.data || [];

  const serverPagination = queryResult?.data?.meta.pagination || {
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 0,
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Debounced filter state
  const [debouncedFilters, setDebouncedFilters] = useState<ColumnFiltersState>(
    []
  );
  const [filterTimeouts, setFilterTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  // LoadOptions state management
  const [loadedOptions, setLoadedOptions] = useState<
    Map<string, Array<{ value: string | number; label: string }>>
  >(new Map());
  const [loadingOptions, setLoadingOptions] = useState<Set<string>>(new Set());
  const [optionQueries, setOptionQueries] = useState<Map<string, string>>(
    new Map()
  );
  const [debouncedLoadFunctions, setDebouncedLoadFunctions] = useState<
    Map<string, any>
  >(new Map());

  // Initialize pagination state based on server meta or defaults
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: serverPagination.page - 1,
    pageSize: serverPagination.pageSize,
  });

  // Sync pagination state when server meta changes
  useEffect(() => {
    setPagination({
      pageIndex: serverPagination.page - 1,
      pageSize: serverPagination.pageSize,
    });
  }, [serverPagination.page, serverPagination.pageSize]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Derive loading and error states from queryResult if provided
  const isLoading =
    queryResult?.isLoading || queryResult?.isFetching || loading;
  const queryError = queryResult?.error;
  const finalError = error || (queryError ? String(queryError) : undefined);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      filterTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [filterTimeouts]);

  // Expose confirm dialog function to parent component
  useEffect(() => {
    if (onConfirmDialogRef) {
      onConfirmDialogRef(showConfirmDialog);
    }
  }, [onConfirmDialogRef]);

  // LoadOptions handler with lodash debouncing
  const handleLoadOptions = useCallback(
    (
      fieldId: string,
      query: string,
      loadOptionsFn: (
        query: string
      ) => Promise<Array<{ value: string | number; label: string }>>
    ) => {
      // Update query state immediately
      setOptionQueries((prev) => {
        const newMap = new Map(prev);
        newMap.set(fieldId, query);
        return newMap;
      });

      // Get or create debounced function for this field
      let debouncedFn = debouncedLoadFunctions.get(fieldId);
      if (!debouncedFn) {
        // Create the debounced function
        const loadOptionsInternal = async (searchQuery: string) => {
          try {
            // Set loading state
            setLoadingOptions((prev) => new Set(prev).add(fieldId));

            // Load options
            const options = await loadOptionsFn(searchQuery);

            // Update loaded options
            setLoadedOptions((prev) => {
              const newMap = new Map(prev);
              newMap.set(fieldId, options);
              return newMap;
            });
          } catch (error) {
            console.error(`Error loading options for ${fieldId}:`, error);
            // Clear options on error
            setLoadedOptions((prev) => {
              const newMap = new Map(prev);
              newMap.set(fieldId, []);
              return newMap;
            });
          } finally {
            // Clear loading state
            setLoadingOptions((prev) => {
              const newSet = new Set(prev);
              newSet.delete(fieldId);
              return newSet;
            });
          }
        };

        debouncedFn = debounce(loadOptionsInternal, 300);
        setDebouncedLoadFunctions((prev) => {
          const newMap = new Map(prev);
          newMap.set(fieldId, debouncedFn);
          return newMap;
        });
      }

      // Call the debounced function
      debouncedFn(query);
    },
    [debouncedLoadFunctions]
  );

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedLoadFunctions.forEach((debouncedFn) => debouncedFn.cancel());
    };
  }, [debouncedLoadFunctions]);

  // Initialize loadOptions fields with empty query on mount
  useEffect(() => {
    formFields.forEach((field) => {
      if (field.loadOptions && !loadedOptions.has(field.id)) {
        // Load initial options with empty query
        handleLoadOptions(field.id, "", field.loadOptions);
      }
    });
  }, [formFields, loadedOptions, handleLoadOptions]);

  // Helper function to format date for display
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Helper function to format datetime for display
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    severity?: "error" | "warning" | "info";
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Create default values for react-hook-form
  const createDefaultValues = useCallback(
    (item?: any) => {
      const defaultValues: FieldValues = {};
      formFields.forEach((field) => {
        const fieldValue = get(item, field.accessorKey || field.id);
        set(defaultValues, field.id, fieldValue);
      });
      return defaultValues;
    },
    [formFields]
  );

  // Memoize validation rules to avoid recalculation
  const validationRulesMap = useMemo(() => {
    const rulesMap = new Map<string, any>();

    formFields.forEach((field) => {
      const rules: any = {};

      if (field.validation) {
        if (field.validation.required) {
          rules.required =
            typeof field.validation.required === "string"
              ? field.validation.required
              : `${field.label} is required`;
        }

        if (field.validation.pattern) {
          rules.pattern = field.validation.pattern;
        }

        if (field.validation.minLength) {
          rules.minLength = field.validation.minLength;
        }

        if (field.validation.maxLength) {
          rules.maxLength = field.validation.maxLength;
        }

        if (field.validation.min) {
          rules.min = field.validation.min;
        }

        if (field.validation.max) {
          rules.max = field.validation.max;
        }

        if (field.validation.validate) {
          rules.validate = field.validation.validate;
        }
      }

      // Fallback for legacy required field
      if (field.required && !rules.required) {
        rules.required = `${field.label} is required`;
      }

      rulesMap.set(field.id, rules);
    });

    return rulesMap;
  }, [formFields]);

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    defaultValues: createDefaultValues(),
    mode: "onBlur", // Only validate on blur to reduce lag
  });

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
      setDebouncedFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [columnFilters, onFilterChange]
  );

  // Debounced filter change handler
  const handleDebouncedFilterChange = useCallback(
    (columnId: string, value: any, debounceMs: number = 300) => {
      // Clear existing timeout for this column
      const existingTimeout = filterTimeouts.get(columnId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Update immediate UI state
      const newFilters = columnFilters.filter((f) => f.id !== columnId);
      if (value && value !== "") {
        newFilters.push({
          id: columnId,
          value: String(value),
        });
      }
      setColumnFilters(newFilters);

      // Set new timeout for debounced update
      const timeout = setTimeout(() => {
        setDebouncedFilters(newFilters);
        onFilterChange?.(newFilters);
        setFilterTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(columnId);
          return newMap;
        });
      }, debounceMs);

      // Store the timeout
      setFilterTimeouts((prev) => {
        const newMap = new Map(prev);
        newMap.set(columnId, timeout);
        return newMap;
      });
    },
    [columnFilters, onFilterChange, filterTimeouts]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      onGlobalFilterChange?.(value);
    },
    [onGlobalFilterChange]
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
      const allActionsDefined = Boolean(onEdit && onView && onDelete);

      cols.push({
        id: "actions",
        accessorKey: "actions",
        header: () => (
          <Box
            sx={{
              display: "flex",
              justifyContent: allActionsDefined ? "center" : "end",
              mr: allActionsDefined ? undefined : 2,
            }}
          >
            Actions
          </Box>
        ),
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
                  onClick={() => {
                    const item = row.original;
                    const itemName = item.name || item.title || item[idField];
                    showConfirmDialog(
                      "Delete Item",
                      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
                      () => onDelete(item[idField]),
                      {
                        confirmText: "Delete",
                        severity: "error",
                      }
                    );
                  }}
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
      columnFilters: debouncedFilters, // Use debounced filters for server communication
      globalFilter,
      pagination,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: serverPagination.total,
    enableRowSelection: selectable,
    getRowId: (row) => row[idField],
  });

  // Form submission handler
  const onSubmit = (data: FieldValues) => {
    if (editingItem) {
      onEdit?.(editingItem[idField], data);
    } else {
      onAdd?.(data);
    }
    handleCloseModal();
  };

  const handleAdd = () => {
    setEditingItem(null);
    reset(createDefaultValues());
    setOpenModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    reset(createDefaultValues(item));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setEditingItem(null);
      reset(createDefaultValues());
    }, TRANSITION_DURATION);
  };

  // Confirm dialog helpers
  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      severity?: "error" | "warning" | "info";
    }
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      severity: options?.severity || "warning",
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmDialogConfirm = () => {
    confirmDialog.onConfirm();
    handleConfirmDialogClose();
  };

  const renderFormField = useCallback(
    (field: FormField) => {
      const isEdit = !!editingItem;

      // Check visibility conditions
      const showInCreateMode = field.showInCreateMode !== false;
      const showInEditMode = field.showInEditMode !== false;

      if (!isEdit && !showInCreateMode) return null;
      if (isEdit && !showInEditMode) return null;

      // Calculate disabled state (only get values when needed)
      const isDisabled =
        typeof field.disabled === "function"
          ? field.disabled(isEdit, getValues())
          : field.disabled || false;

      const validationRules = validationRulesMap.get(field.id) || {};

      return (
        <Controller
          key={field.id}
          name={field.id}
          control={control}
          rules={validationRules}
          render={({
            field: controllerField,
            fieldState,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
            fieldState: { error?: FieldError };
          }) => {
            const commonProps = {
              fullWidth: true,
              margin: "normal" as const,
              error: !!fieldState.error,
              helperText: fieldState.error?.message || field.helperText,
              label: field.label,
              required: field.required || !!validationRules.required,
              disabled: isDisabled,
            };

            switch (field.type) {
              case "autocomplete":
              case "multiselect":
                // Determine which options to use
                const currentOptions = field.loadOptions
                  ? loadedOptions.get(field.id) || []
                  : field.options || [];

                const isLoadingCurrentField = loadingOptions.has(field.id);
                const currentQuery = optionQueries.get(field.id) || "";

                return (
                  <Autocomplete
                    multiple={field.type === "multiselect"}
                    options={currentOptions}
                    getOptionLabel={(option: any) => option.label}
                    disabled={isDisabled}
                    loading={isLoadingCurrentField}
                    value={
                      field.type === "multiselect"
                        ? currentOptions.filter((opt) =>
                            (controllerField.value || []).includes(opt.value)
                          )
                        : currentOptions.find(
                            (opt) => opt.value === controllerField.value
                          ) || null
                    }
                    onChange={(_, newValue) => {
                      if (!isDisabled) {
                        if (field.type === "multiselect") {
                          controllerField.onChange(
                            Array.isArray(newValue)
                              ? newValue.map((v) => v.value)
                              : []
                          );
                        } else {
                          controllerField.onChange(
                            newValue ? newValue.value : ""
                          );
                        }
                      }
                    }}
                    onInputChange={(_, newInputValue) => {
                      if (field.loadOptions && !isDisabled) {
                        handleLoadOptions(
                          field.id,
                          newInputValue,
                          field.loadOptions
                        );
                      }
                    }}
                    filterOptions={(options) => {
                      // If using loadOptions, don't filter client-side
                      if (field.loadOptions) {
                        return options;
                      }
                      // Otherwise, use default filtering
                      return options.filter((option) =>
                        option.label
                          .toLowerCase()
                          .includes(currentQuery.toLowerCase())
                      );
                    }}
                    noOptionsText={
                      field.loadOptions
                        ? isLoadingCurrentField
                          ? "Loading..."
                          : currentQuery.length === 0
                            ? "Type to search..."
                            : "No options found"
                        : "No options"
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        {...commonProps}
                        placeholder={
                          field.placeholder ||
                          (field.loadOptions ? "Type to search..." : "")
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingCurrentField && (
                                <CircularProgress color="inherit" size={20} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                );

              case "select":
                return (
                  <FormControl {...commonProps}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      {...controllerField}
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
                    {fieldState.error && (
                      <FormHelperText>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                );

              case "number":
                return (
                  <TextField
                    {...controllerField}
                    {...commonProps}
                    type="number"
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
                      controllerField.onChange(value);
                    }}
                  />
                );

              case "date":
              case "datetime-local":
                return (
                  <TextField
                    {...controllerField}
                    {...commonProps}
                    // TODO: date-fns YYYY-MM-DD mui format
                    type={field.type}
                    InputLabelProps={{ shrink: true }}
                    value={new Date(controllerField.value)}
                  />
                );

              case "custom":
                const displayValue = field.customDisplayValue
                  ? field.customDisplayValue(controllerField.value)
                  : controllerField.value?.toString() ||
                    field.placeholder ||
                    "";

                return (
                  <TextField
                    {...commonProps}
                    value={displayValue}
                    onClick={() => {
                      if (!isDisabled && field.onCustomClick) {
                        field.onCustomClick(
                          controllerField.value,
                          (newValue) => {
                            controllerField.onChange(newValue);
                          }
                        );
                      }
                    }}
                    InputProps={{
                      readOnly: true,
                      sx: { cursor: "pointer" },
                    }}
                  />
                );

              default:
                return (
                  <TextField
                    {...controllerField}
                    {...commonProps}
                    type={field.type}
                    placeholder={field.placeholder}
                  />
                );
            }
          }}
        />
      );
    },
    [editingItem, control, validationRulesMap, getValues]
  );

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

        return (
          <Box
            key={`row-${row}`}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${totalFields}, 1fr)`,
              gap: 2,
              mb: 1,
            }}
          >
            {fieldsInRow.map((field) => (
              <Box key={field.id}>{renderFormField(field)}</Box>
            ))}
          </Box>
        );
      });
  };

  const handleBulkActionClick = (action: BulkAction) => {
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id]
    );
    if (selectedIds.length === 0) return;

    setBulkMenuAnchor(null);

    if (action.confirmMessage) {
      showConfirmDialog(
        `${action.label}`,
        action.confirmMessage.replace("{count}", selectedIds.length.toString()),
        () => action.action(selectedIds),
        {
          confirmText: action.label,
          severity: action.color === "error" ? "error" : "warning",
        }
      );
    } else {
      action.action(selectedIds);
    }
  };

  // Calculate selected rows count
  const selectedRows = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

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
              onChange={(e) => handleGlobalFilterChange(String(e.target.value))}
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
              <IconButton onClick={onRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          {on && (
            <Tooltip title="">
              <IconButton onClick={on}>
                <Icon />
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
                    disabled={button.disabled || isLoading}
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
                    disabled={isLoading}
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
                  disabled={button.disabled || isLoading}
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
                  disabled={isLoading}
                >
                  {addButtonText}
                </Button>
              )}
            </>
          )}
        </Stack>
      </Toolbar>

      {/* Table */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = columns.find((col) => col.id === header.id);
                  return (
                    <TableCell
                      key={header.id}
                      align={column?.align || "left"}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={
                            header.column.getIsSorted() === "desc"
                              ? "desc"
                              : "asc"
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
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {finalError ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Alert severity="error" sx={{ justifyContent: "center" }}>
                    {finalError}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <CircularProgress size={40} />
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
                        style={{
                          maxWidth: columns.find(
                            (col) => col.id === cell.column.id
                          )?.width,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
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

      {!isLoading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={serverPagination.total || 0}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
        />
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        transitionDuration={TRANSITION_DURATION}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingItem
              ? `Edit ${title.slice(0, -1)}`
              : `Add New ${title.slice(0, -1)}`}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>{renderFormLayout()}</Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
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
            {filterTimeouts.size > 0 && (
              <Chip
                label={`${filterTimeouts.size} pending`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {columns
            .filter((col) => col.filterable !== false)
            .map((column) => {
              const currentFilter = columnFilters.find(
                (f) => f.id === column.id
              );
              const filterValue = currentFilter?.value || "";

              const handleColumnFilterChange = (
                value: any,
                useDebounce = true
              ) => {
                const debounceMs = column.filterDebounceMs || 300;

                if (
                  useDebounce &&
                  (column.filterType === "text" ||
                    column.filterType === "contains" ||
                    column.filterType === "startsWith" ||
                    column.filterType === "endsWith" ||
                    column.filterType === "number")
                ) {
                  handleDebouncedFilterChange(column.id, value, debounceMs);
                } else {
                  const newFilters = columnFilters.filter(
                    (f) => f.id !== column.id
                  );
                  if (value && value !== "") {
                    newFilters.push({
                      id: column.id,
                      value: String(value),
                    });
                  }
                  handleFiltersChange(newFilters);
                }
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
                        onChange={(e) =>
                          handleColumnFilterChange(e.target.value, false)
                        }
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

                case "multiselect":
                  return (
                    <FormControl
                      key={column.id}
                      size="small"
                      fullWidth
                      margin="dense"
                    >
                      <InputLabel>{column.label}</InputLabel>
                      <Select
                        multiple
                        value={
                          filterValue ? String(filterValue).split(",") : []
                        }
                        onChange={(e) =>
                          handleColumnFilterChange(
                            Array.isArray(e.target.value)
                              ? e.target.value.join(",")
                              : e.target.value,
                            false
                          )
                        }
                        label={column.label}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {column.filterOptions?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Checkbox
                              checked={
                                filterValue
                                  ? String(filterValue)
                                      .split(",")
                                      .includes(String(option.value))
                                  : false
                              }
                            />
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );

                case "boolean":
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
                        onChange={(e) =>
                          handleColumnFilterChange(e.target.value, false)
                        }
                        label={column.label}
                      >
                        <MenuItem value="">
                          <em>All</em>
                        </MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
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
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                    />
                  );

                case "range":
                  const [minValue, maxValue] = filterValue
                    ? String(filterValue).split(",")
                    : ["", ""];
                  return (
                    <Box key={column.id} sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        label={`${column.label} Min`}
                        margin="dense"
                        value={minValue}
                        onChange={(e) =>
                          handleColumnFilterChange(
                            `${e.target.value},${maxValue}`
                          )
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label={`${column.label} Max`}
                        margin="dense"
                        value={maxValue}
                        onChange={(e) =>
                          handleColumnFilterChange(
                            `${minValue},${e.target.value}`
                          )
                        }
                      />
                    </Box>
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
                      onChange={(e) =>
                        handleColumnFilterChange(e.target.value, false)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  );

                case "datetime":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      type="datetime-local"
                      label={column.label}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) =>
                        handleColumnFilterChange(e.target.value, false)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  );

                case "dateRange":
                  const [fromDate, toDate] = filterValue
                    ? String(filterValue).split(",")
                    : ["", ""];
                  return (
                    <Box
                      key={column.id}
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <TextField
                        size="small"
                        type="date"
                        label={`${column.label} From`}
                        margin="dense"
                        value={formatDateForInput(fromDate || "")}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // Clear 'to' date if 'from' date is after it
                          const newToDate =
                            newValue &&
                            toDate &&
                            new Date(newValue) > new Date(toDate)
                              ? ""
                              : toDate;
                          handleColumnFilterChange(
                            `${newValue},${newToDate || ""}`,
                            false
                          );
                        }}
                        InputLabelProps={{ shrink: true }}
                        helperText={
                          fromDate &&
                          toDate &&
                          new Date(fromDate) > new Date(toDate)
                            ? "From date must be before To date"
                            : ""
                        }
                        error={Boolean(
                          fromDate &&
                            toDate &&
                            new Date(fromDate) > new Date(toDate)
                        )}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label={`${column.label} To`}
                        margin="dense"
                        value={formatDateForInput(toDate || "")}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // Clear 'from' date if 'to' date is before it
                          const newFromDate =
                            newValue &&
                            fromDate &&
                            new Date(fromDate) > new Date(newValue)
                              ? ""
                              : fromDate;
                          handleColumnFilterChange(
                            `${newFromDate || ""},${newValue}`,
                            false
                          );
                        }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={
                          fromDate ? { min: formatDateForInput(fromDate) } : {}
                        }
                      />
                    </Box>
                  );

                case "dateTimeRange":
                  const [fromDateTime, toDateTime] = filterValue
                    ? String(filterValue).split(",")
                    : ["", ""];
                  return (
                    <Box
                      key={column.id}
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <TextField
                        size="small"
                        type="datetime-local"
                        label={`${column.label} From`}
                        margin="dense"
                        value={formatDateTimeForInput(fromDateTime || "")}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const newToDateTime =
                            newValue &&
                            toDateTime &&
                            new Date(newValue) > new Date(toDateTime)
                              ? ""
                              : toDateTime;
                          handleColumnFilterChange(
                            `${newValue},${newToDateTime || ""}`,
                            false
                          );
                        }}
                        InputLabelProps={{ shrink: true }}
                        helperText={
                          fromDateTime &&
                          toDateTime &&
                          new Date(fromDateTime) > new Date(toDateTime)
                            ? "From date must be before To date"
                            : ""
                        }
                        error={Boolean(
                          fromDateTime &&
                            toDateTime &&
                            new Date(fromDateTime) > new Date(toDateTime)
                        )}
                      />
                      <TextField
                        size="small"
                        type="datetime-local"
                        label={`${column.label} To`}
                        margin="dense"
                        value={formatDateTimeForInput(toDateTime || "")}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const newFromDateTime =
                            newValue &&
                            fromDateTime &&
                            new Date(fromDateTime) > new Date(newValue)
                              ? ""
                              : fromDateTime;
                          handleColumnFilterChange(
                            `${newFromDateTime || ""},${newValue}`,
                            false
                          );
                        }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={
                          fromDateTime
                            ? { min: formatDateTimeForInput(fromDateTime) }
                            : {}
                        }
                      />
                    </Box>
                  );

                case "contains":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      label={`${column.label} (contains)`}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      placeholder="Search..."
                    />
                  );

                case "startsWith":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      label={`${column.label} (starts with)`}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      placeholder="Starts with..."
                    />
                  );

                case "endsWith":
                  return (
                    <TextField
                      key={column.id}
                      size="small"
                      fullWidth
                      label={`${column.label} (ends with)`}
                      margin="dense"
                      value={filterValue}
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      placeholder="Ends with..."
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
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      placeholder="Search..."
                    />
                  );
              }
            })}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                handleFiltersChange([]);
                handleGlobalFilterChange("");
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {confirmDialog.severity === "error" && <DeleteIcon color="error" />}
          {confirmDialog.severity === "warning" && (
            <WarningIcon color="warning" />
          )}
          {confirmDialog.severity === "info" && <WarningIcon color="info" />}
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="inherit">
            {confirmDialog.cancelText}
          </Button>
          <Button
            onClick={handleConfirmDialogConfirm}
            variant="contained"
            color={confirmDialog.severity === "error" ? "error" : "primary"}
            autoFocus
          >
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// Custom hook for managing DataTable query parameters
const useDataTableQuery = (initialQuery?: Query) => {
  const [query, setQuery] = useState<Query>(initialQuery ?? {});

  const handlePaginationChange = useCallback((pagination: PaginationState) => {
    setQuery((prev) => ({
      ...prev,
      pagination: {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      },
    }));
  }, []);

  const handleSortingChange = useCallback((sorting: SortingState) => {
    setQuery((prev) => ({
      ...prev,
      sort: sorting.map((sort) => ({
        field: sort.id,
        order: sort.desc ? "desc" : "asc",
      })),
    }));
  }, []);

  const handleFilterChange = useCallback(
    (filters: ColumnFiltersState, columns?: TableColumn[]) => {
      const newFilters: Record<string, Record<string, any>> = {};

      filters.forEach((filter) => {
        if (filter.value && filter.value !== "") {
          const column = columns?.find((col) => col.id === filter.id);
          const operator = column?.filterOperator || "$containsi"; // Default operator

          // Handle different filter types
          switch (column?.filterType) {
            case "multiselect":
              newFilters[filter.id] = {
                $in: String(filter.value).split(","),
              };
              break;
            case "range":
              const [min, max] = String(filter.value).split(",");
              if (min && max) {
                newFilters[filter.id] = {
                  $between: [Number(min), Number(max)],
                };
              } else if (min) {
                newFilters[filter.id] = { $gte: Number(min) };
              } else if (max) {
                newFilters[filter.id] = { $lte: Number(max) };
              }
              break;
            case "dateRange":
            case "dateTimeRange":
              const [fromDate, toDate] = String(filter.value).split(",");
              if (fromDate && toDate) {
                // Both dates provided - use between
                newFilters[filter.id] = {
                  $between: [fromDate, toDate],
                };
              } else if (fromDate) {
                // Only from date - greater than or equal
                newFilters[filter.id] = { $gte: fromDate };
              } else if (toDate) {
                // Only to date - less than or equal
                newFilters[filter.id] = { $lte: toDate };
              }
              break;
            case "boolean":
              newFilters[filter.id] = {
                $eq: filter.value === "true",
              };
              break;
            case "startsWith":
              newFilters[filter.id] = {
                $startsWithi: filter.value,
              };
              break;
            case "endsWith":
              newFilters[filter.id] = {
                $endsWithi: filter.value,
              };
              break;
            case "contains":
              newFilters[filter.id] = {
                $containsi: filter.value,
              };
              break;
            case "number":
              newFilters[filter.id] = {
                [operator]: Number(filter.value),
              };
              break;
            case "date":
            case "datetime":
              newFilters[filter.id] = {
                [operator]: filter.value,
              };
              break;
            default: // text and others
              newFilters[filter.id] = {
                [operator]: filter.value,
              };
          }
        }
      });

      setQuery((prev) => ({
        ...prev,
        filters: newFilters,
      }));
    },
    []
  );

  const handleGlobalFilterChange = useCallback((globalFilter: string) => {
    setQuery((prev) => ({
      ...prev,
      pagination: {
        page: 1,
        pageSize: prev.pagination?.pageSize || 10,
      },
    }));
  }, []);

  return {
    query,
    setQuery,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  };
};

const TRANSITION_DURATION = 200;

export { DataTable, useDataTableQuery };
export type {
  DataTableQuery,
  TableColumn,
  FormField,
  BulkAction,
  ToolbarButton,
};
