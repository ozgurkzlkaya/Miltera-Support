"use client";

import { Box } from "@mui/material";
import {
  DataTable,
  TableColumn,
  useDataTableQuery,
} from "../../../components/data-table";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../../features/users/user.service";
import { keepPreviousData } from "@tanstack/react-query";
import type { FormField } from "../../../components/form/types";
import { loadOptions } from "../../../features/products/helpers/loadOptions";

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
    id: "company.name",
    label: "Company",
    width: 130,
    sortable: true,
    filterable: true,
  },
];

const formFields: FormField[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    required: true,
    layout: { row: 1, column: 0 },
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    layout: { row: 0, column: 0 },
    validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  },
  {
    id: "password",
    label: "Password",
    type: "text",
    required: true,
    showInEditMode: false,
    layout: { row: 0, column: 1 },
  },
  {
    id: "role",
    label: "Role",
    type: "select",
    required: true,
    layout: { row: 2, column: 0 },
    options: [
      { label: "Admin", value: "ADMIN" },
      { label: "TSP", value: "TSP" },
      { label: "Customer", value: "CUSTOMER" },
    ],
  },
  {
    id: "companyId",
    label: "Company",
    type: "autocomplete",
    loadOptions: (query) => loadOptions("company", query),
    layout: { row: 2, column: 1 },
  },
];

const UsersPage = () => {
  const {
    query,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  } = useDataTableQuery();

  const usersQueryResult = useUsers({
    query,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  return (
    <Box sx={{ p: 3 }}>
      <DataTable
        title="Users"
        columns={columns}
        queryResult={usersQueryResult}
        formFields={formFields}
        addButtonText="Add User"
        onAdd={(data) => createMutation.mutateAsync({ payload: data })}
        onEdit={(id, data) => updateMutation.mutateAsync({ id, payload: data })}
        onDelete={(id) => deleteMutation.mutateAsync({ id })}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onFilterChange={handleFilterChange}
        onGlobalFilterChange={handleGlobalFilterChange}
      />
    </Box>
  );
};

export default UsersPage;
