import { UseQueryResult } from "@tanstack/react-query";
import { type FormField } from "../form/types";
import {
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";

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
  filterDebounceMs?: number;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  action: (selectedIds: (string | number)[]) => void;
  confirmMessage?: string;
}

interface DataTableProps<TData = any, TError = any> {
  queryResult: UseQueryResult<TData, TError>;
  title: string;
  addButtonText?: string;
  bulkAddButton?: {
    text: string;
    onClick: () => void;
  };

  columns: TableColumn[];
  formFields: FormField[];

  idField?: string;

  searchable?: boolean;
  selectable?: boolean;

  bulkActions?: BulkAction[];

  onAdd?: (data: any) => Promise<void>;
  onEdit?: (id: string, data: any) => Promise<void>;
  onView?: (id: string, data: any) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  onBulkAction?: (action: BulkAction) => Promise<void>;

  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (globalFilter: string) => void;
}

export type { TableColumn, DataTableProps, BulkAction };
