"use client";

import { Box, Chip } from "@mui/material";
import { Layout } from "../../../../components/Layout";

import {
  useCreateProductType,
  useDeleteProductType,
  useProductTypes,
  useUpdateProductType,
} from "../../../../features/products/services/product-type.service";
import { keepPreviousData } from "@tanstack/react-query";
import { FormField } from "../../../../components/form/types";
import {
  DataTable,
  useDataTableQuery,
} from "../../../../components/data-table";

const columns: TableColumn[] = [
  {
    id: "name",
    label: "Type Name",
    width: 200,
    sortable: true,
    filterable: true,
  },
  {
    id: "description",
    label: "Description",
    width: 275,
    sortable: true,
    filterable: true,
  },
  // {
  //   id: "createdAt",
  //   label: "Created",
  //   width: 120,
  //   sortable: true,
  //   filterable: true,
  //   filterType: "dateRange",
  //   format: (value) => new Date(value).toLocaleString(),
  // },
];

const formFields: FormField[] = [
  {
    id: "name",
    label: "Type Name",
    type: "text",
    required: true,
    placeholder: "Enter product type name",
    layout: { row: 0, column: 0 },
    validation: {
      minLength: 3,
      maxLength: 255,
    },
  },
  {
    id: "description",
    label: "Description",
    type: "text",
    required: true,
    placeholder: "Enter detailed description",
    layout: { row: 1, column: 0 },
  },
];

export default function ProductTypesPage() {
  const {
    query,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  } = useDataTableQuery();

  const productTypesQueryResult = useProductTypes({
    query,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const createMutation = useCreateProductType();
  const updateMutation = useUpdateProductType();
  const deleteMutation = useDeleteProductType();

  return (
    <Box sx={{ p: 3 }}>
      <DataTable
        title="Product Types"
        columns={columns}
        formFields={formFields}
        queryResult={productTypesQueryResult}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onFilterChange={(filters) => handleFilterChange(filters, columns)}
        onGlobalFilterChange={handleGlobalFilterChange}
        onAdd={(data) => createMutation.mutateAsync({ payload: data })}
        onEdit={(id, data) => updateMutation.mutateAsync({ id, payload: data })}
        onDelete={(id) => deleteMutation.mutateAsync({ id })}
        // onRefresh={() => productTypesQueryResult.refetch()}
      />
    </Box>
  );
}
