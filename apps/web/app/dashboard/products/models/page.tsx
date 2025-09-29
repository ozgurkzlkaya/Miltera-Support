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
  const query = {
    page: 1,
    limit: 20,
    sort: '',
    filter: '',
    search: ''
  };

  const productModelsQueryResult = useProductModels();

  const productTypesQueryResult = useProductTypes();

  const companiesQueryResult = useCompanies();

  const { data: { data: companies } = { data: [] } } = companiesQueryResult;
  const { data: { data: productTypes } = { data: [] } } = productTypesQueryResult;

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
      label: "Product Type",
      type: "autocomplete",
      required: true,
      options: productTypes?.map((productType: any) => ({
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
      layout: { row: 2, column: 0 }, // Second row, first column
    },
    {
      id: "manufacturerId",
      label: "Manufacturer",
      type: "autocomplete",
      required: true,
      options: companies?.map((company: any) => ({
        label: company.name,
        value: company.id,
      })),
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
        onAdd={(data) => createMutation.mutate(data)}
        onEdit={(id, data) => updateMutation.mutate({ id, data })}
        onDelete={(id) => deleteMutation.mutate(id)}
        addButtonText="Add Product Model"
        selectable={true}
      />
    </Box>
  );
}
