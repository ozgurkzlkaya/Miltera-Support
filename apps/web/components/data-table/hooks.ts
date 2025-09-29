import { useCallback, useState } from "react";
import {
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { type TableColumn } from "./types";

interface Query {
  pagination?: { page: number; pageSize: number };
  sorting?: SortingState;
  filters?: Record<string, Record<string, any>>;
  globalFilter?: string;
}

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

const useDataTableState = (initialState?: {
  isModalOpen?: boolean;
  modalMode?: "create" | "edit" | "view";
  currentItem?: any;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(
    initialState?.isModalOpen || false
  );
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    initialState?.modalMode || "create"
  );
  const [currentItem, setCurrentItem] = useState<any>(
    initialState?.currentItem || null
  );

  return {
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    currentItem,
    setCurrentItem,
  };
};

export { useDataTableQuery, useDataTableState };
