"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
  TableSortLabel,
  TablePagination,
  Checkbox,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useState, useCallback, useEffect } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";

import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableFormDialog } from "./DataTableFormDialog";
import {
  DataTableConfirmDialog,
  DataTableConfirmDialogProps,
} from "./DataTableConfirmDialog";
import type { DataTableProps } from "./types";
import { DataTableFilterMenu } from "./DataTableFilterMenu";

const DataTable = ({
  queryResult,
  title,
  columns,
  formFields,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  searchable = true,
  selectable = false,
  addButtonText = "Add New",
  bulkAddButton,
  idField = "id",
  bulkActions = [],
  onBulkAction,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  onGlobalFilterChange,
}: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const data = queryResult.data?.data ?? [];
  const error = queryResult.error;
  const isLoading = queryResult.isLoading;

  const meta = queryResult.data?.meta;
  const serverPagination = meta?.pagination ?? {
    page: 1,
    pageSize: 10,
    total: 0,
  };

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
  const selectedRows = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

  const [currentItem, setCurrentItem] = useState<any>(null);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formDialogMode, setFormDialogMode] = useState<"create" | "edit">(
    "create"
  );

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  const closeConfirmDialogState: DataTableConfirmDialogProps = {
    open: false,
    title: "",
    message: "",
    onClose: () => {},
    onConfirm: () => Promise.resolve(),
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog((d) => ({
      ...d,
      open: false,
    }));

    setTimeout(() => {
      setConfirmDialog(closeConfirmDialogState);
      // smooth transition
    }, TRANSITION_DURATION);
  };

  const [confirmDialog, setConfirmDialog] =
    useState<DataTableConfirmDialogProps>(closeConfirmDialogState);

  const handleCloseFormDialog = () => {
    // setIsFormDialogOpen(false);
    // setCurrentItem(null);
  };

  const handleFormDialogSubmit = (data: any) => {
    if (formDialogMode === "create") {
      return onAdd?.(data).finally(() => handleCloseFormDialog());
    } else {
      return onEdit?.(currentItem[idField], data).finally(() =>
        handleCloseFormDialog()
      );
    }
  };

  const handleEditClick = (item: any) => {
    setCurrentItem(item);
    setIsFormDialogOpen(true);
    setFormDialogMode("edit");
  };

  const handleAddClick = () => {
    setCurrentItem(null);
    setIsFormDialogOpen(true);
    setFormDialogMode("create");
  };

  // Create table columns with actions
  const tableColumns: ColumnDef<any>[] = [
    ...(selectable
      ? [
          {
            id: "select",
            header: ({ table }: any) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={table.getIsSomePageRowsSelected()}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
              />
            ),
            cell: ({ row }: any) => (
              <Checkbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
              />
            ),
          },
        ]
      : []),
    ...columns.map(
      (col) =>
        ({
          id: col.id,
          accessorKey: col.id,
          header: col.label,
          cell: ({ getValue, row }) => {
            const value = getValue();
            if (col.render) {
              return col.render(value, row.original);
            }
            if (col.format) {
              return col.format(value);
            }
            return value?.toString() || "";
          },
          enableSorting: col.sortable !== false,
        }) as ColumnDef<any>
    ),
    {
      id: "actions",
      header: "Actions",
      size: 160,
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          {onView && (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(row.original[idField], row.original)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditClick(row.original)}
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

                  setConfirmDialog({
                    open: true,
                    onClose: handleCloseConfirmDialog,
                    title: "Delete Item",
                    message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
                    severity: "error",
                    onConfirm: () =>
                      onDelete(item[idField]).finally(() =>
                        handleCloseConfirmDialog()
                      ),
                  });
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
    },
  ];

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    [onSortingChange]
  );

  const handleFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue;
      setColumnFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [columnFilters, onFilterChange]
  );

  const handleGlobalFilterChange: OnChangeFn<any> = useCallback(
    (updaterOrValue) => {
      const newGlobalFilter =
        typeof updaterOrValue === "function"
          ? updaterOrValue(globalFilter)
          : updaterOrValue;
      setGlobalFilter(newGlobalFilter);
      onGlobalFilterChange?.(newGlobalFilter);
    },
    [globalFilter, onGlobalFilterChange]
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    [pagination, onPaginationChange]
  );

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

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <DataTableToolbar
        title={title}
        searchable={searchable}
        addButtonText={addButtonText}
        bulkAddButtonText={bulkAddButton?.text}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        selectedCount={selectedRows.length}
        onAddClick={handleAddClick}
        onBulkAddClick={bulkAddButton?.onClick}
        onRefresh={onRefresh}
        isLoading={isLoading}
        setFilterMenuAnchor={setFilterMenuAnchor}
        setBulkMenuAnchor={setBulkMenuAnchor}
      />

      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="medium">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <TableSortLabel
                            active={header.column.getIsSorted() !== false}
                            direction={
                              header.column.getIsSorted() === "desc"
                                ? "desc"
                                : "asc"
                            }
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} selected={row.getIsSelected()}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={serverPagination.total}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, newPageIndex) =>
          setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }))
        }
        onRowsPerPageChange={(event) => {
          setPagination({
            pageIndex: 0,
            pageSize: parseInt(event.target.value, 10),
          });
        }}
      />

      <DataTableFilterMenu
        filterMenuAnchor={filterMenuAnchor}
        setFilterMenuAnchor={setFilterMenuAnchor}
        columns={columns}
        columnFilters={columnFilters}
        handleFiltersChange={handleFiltersChange}
        handleGlobalFilterChange={handleGlobalFilterChange}
      />

      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        {bulkActions.map((action) => (
          <MenuItem key={action.id} onClick={() => onBulkAction?.(action)}>
            {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <DataTableFormDialog
        open={isFormDialogOpen}
        mode={formDialogMode}
        title={
          formDialogMode === "create" ? `Create ${title}` : `Edit ${title}`
        }
        formFields={formFields}
        initialData={currentItem}
        onClose={handleCloseFormDialog}
        onSubmit={handleFormDialogSubmit}
        dialogProps={{
          transitionDuration: TRANSITION_DURATION,
        }}
      />

      <DataTableConfirmDialog
        {...confirmDialog}
        dialogProps={{
          transitionDuration: TRANSITION_DURATION,
        }}
      />
    </Paper>
  );
};

const TRANSITION_DURATION = 200;

export { DataTable };
