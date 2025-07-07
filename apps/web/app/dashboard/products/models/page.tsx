"use client";

import { Box, Chip, Avatar } from "@mui/material";
import { Layout } from "../../../../components/Layout";
import {
  DataTable,
  TableColumn,
  FormField,
  BulkAction,
  useDataTableQuery,
} from "../../../../components/DataTable";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { useState } from "react";
import {
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import {
  useCreateProductModel,
  useDeleteProductModel,
  useProductModels,
  useUpdateProductModel,
} from "../../../../features/products/services/product-model.service";
import { keepPreviousData } from "@tanstack/react-query";
import { useProductTypes } from "../../../../features/products/services/product-type.service";
import { useCompanies } from "../../../../features/companies/company.service";

const columns: TableColumn[] = [
  {
    id: "name",
    label: "Model",
    width: 120,
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            fontSize: "0.75rem",
          }}
        >
          {value.substring(0, 2)}
        </Avatar>
        <Box>
          <div style={{ fontWeight: "bold" }}>{value}</div>
          <div style={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {row.modelNumber}
          </div>
        </Box>
      </Box>
    ),
  },
  {
    id: "productType.name",
    label: "Product Type",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    id: "description",
    label: "Description",
    width: 375,
    sortable: true,
    filterable: true,
  },
  {
    id: "manufacturer.name",
    label: "Manufacturer",
    width: 120,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BusinessIcon fontSize="small" color="action" />
        {value}
      </Box>
    ),
  },
];

export default function ProductModelsPage() {
  const {
    query,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  } = useDataTableQuery();

  const productModelsQueryResult = useProductModels({
    query,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const {
    query: productTypeQuery,
    handleFilterChange: handleProductTypeFilterChange,
  } = useDataTableQuery();

  const { data: { data: productTypes } = { data: [] } } = useProductTypes({
    query: productTypeQuery,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const { query: companyQuery, handleFilterChange: handleCompanyFilterChange } =
    useDataTableQuery();

  const { data: { data: companies } = { data: [] } } = useCompanies({
    query: companyQuery,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const createMutation = useCreateProductModel();
  const updateMutation = useUpdateProductModel();
  const deleteMutation = useDeleteProductModel();

  const formFields: FormField[] = [
    {
      id: "name",
      label: "Model Name",
      type: "text",
      required: true,
      placeholder: "e.g., GW-2000",
      layout: { row: 0, column: 0 }, // First row, first column
      validation: {
        required: "Model name is required",
        minLength: {
          value: 2,
          message: "Model name must be at least 2 characters",
        },
      },
    },
    {
      id: "description",
      label: "Description",
      type: "text",
      placeholder: "e.g., GW-2000 is a high-performance wireless gateway",
      layout: { row: 1, column: 0 }, // First row, second column
    },
    {
      id: "productTypeId",
      accessorKey: "productType.id",
      label: "Product Type",
      type: "autocomplete",
      required: true,
      options: productTypes?.map((productType) => ({
        label: productType.name,
        value: productType.id,
      })),
      // loadOptions: async (input) => {
      //   handleProductTypeFilterChange(
      //     [
      //       {
      //         id: "name",
      //         value: input,
      //       },
      //     ],
      //     columns
      //   );

      //   return productTypes?.map((productType) => ({
      //     label: productType.name,
      //     value: productType.id,
      //   }));
      // },
      searchable: true,
      layout: { row: 2, column: 0 }, // Second row, first column
    },
    {
      id: "manufacturerId",
      accessorKey: "manufacturer.id",
      label: "Manufacturer",
      type: "autocomplete",
      required: true,
      options: companies?.map((company) => ({
        label: company.name,
        value: company.id,
      })),
      searchable: true,
      layout: { row: 2, column: 1 }, // Second row, second column
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <DataTable
        title="Product Models"
        columns={columns}
        queryResult={productModelsQueryResult}
        formFields={formFields}
        onAdd={(data) => createMutation.mutate({ payload: data })}
        onEdit={(id, data) => updateMutation.mutate({ id, payload: data })}
        onDelete={(id) => deleteMutation.mutate({ id })}
        addButtonText="Add Product Model"
        selectable={true}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onFilterChange={handleFilterChange}
        onGlobalFilterChange={handleGlobalFilterChange}
      />
    </Box>
  );
}
