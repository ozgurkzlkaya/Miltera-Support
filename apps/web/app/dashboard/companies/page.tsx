"use client";

import { Box } from "@mui/material";
import { Layout } from "../../../components/Layout";
import {
  DataTable,
  TableColumn,
  FormField,
} from "../../../components/DataTable";

import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "../../../features/companies/company.service";
import { useDataTableQuery } from "../../../components/DataTable";
import { keepPreviousData } from "@tanstack/react-query";

const columns: TableColumn[] = [
  {
    id: "name",
    label: "Name",
    width: 150,
    sortable: true,
    filterable: true,
  },
  { id: "email", label: "Email", width: 180, sortable: true, filterable: true },
  {
    id: "phone",
    label: "Phone",
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    id: "address",
    label: "Address",
    width: 150,
    sortable: true,
    filterable: true,
  },
];

const formFields: FormField[] = [
  {
    id: "name",
    label: "Company Name",
    type: "text",
    required: true,
    layout: { row: 0, column: 0 }, // First row, first column
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    layout: { row: 0, column: 1 }, // First row, second column
    validation: {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
    },
  },
  {
    id: "phone",
    label: "Phone",
    type: "text",
    required: true,
    layout: { row: 1, column: 1 }, // Second row, second column
    validation: {
      required: "Phone number is required",
      minLength: {
        value: 10,
        message: "Phone number must be at least 10 characters",
      },
    },
  },
  {
    id: "address",
    label: "Address",
    type: "text",
    required: true,
    layout: { row: 2, column: 0 }, // Third row, first column
  },
];

export default function CompaniesPage() {
  const {
    query,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  } = useDataTableQuery();

  const companiesQueryResult = useCompanies({
    query,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  return (
    <Box sx={{ p: 3 }}>
      <DataTable
        title="Companies"
        columns={columns}
        queryResult={companiesQueryResult}
        formFields={formFields}
        addButtonText="Add Company"
        onAdd={(data) => createMutation.mutate({ payload: data })}
        onEdit={(id, data) => updateMutation.mutate({ id, payload: data })}
        onDelete={(id) => deleteMutation.mutate({ id })}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onFilterChange={handleFilterChange}
        onGlobalFilterChange={handleGlobalFilterChange}
      />
    </Box>
  );
}
