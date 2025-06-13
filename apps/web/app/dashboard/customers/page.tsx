"use client";

import { Box, Chip } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";

const initialCustomers = [
  { 
    id: 1, 
    name: "Ali Veli", 
    email: "ali@example.com", 
    company: "ABC Enerji", 
    status: "Active",
    phone: "+90 532 123 4567",
    address: "Istanbul, Turkey"
  },
  { 
    id: 2, 
    name: "Ayşe Yılmaz", 
    email: "ayse@example.com", 
    company: "XYZ Elektrik", 
    status: "Inactive",
    phone: "+90 533 234 5678",
    address: "Ankara, Turkey"
  },
  { 
    id: 3, 
    name: "Mehmet Can", 
    email: "mehmet@example.com", 
    company: "Miltera", 
    status: "Active",
    phone: "+90 534 345 6789",
    address: "Izmir, Turkey"
  },
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const columns: TableColumn[] = [
  { id: "name", label: "Customer Name", width: 150, sortable: true, filterable: true },
  { id: "email", label: "Email", width: 180, sortable: true, filterable: true },
  { id: "company", label: "Company", width: 150, sortable: true, filterable: true },
  { id: "phone", label: "Phone", width: 130, sortable: true, filterable: true },
  { id: "address", label: "Address", width: 150, sortable: true, filterable: true },
  {
    id: "status",
    label: "Status",
    width: 100,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value}
        color={value === "Active" ? "success" : "default"}
        size="small"
      />
    ),
  },
];

const formFields: FormField[] = [
  { 
    id: "name", 
    label: "Customer Name", 
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
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return null;
    }
  },
  { 
    id: "company", 
    label: "Company", 
    type: "text", 
    required: true,
    layout: { row: 1, column: 0 }, // Second row, first column
  },
  { 
    id: "phone", 
    label: "Phone", 
    type: "text", 
    required: true,
    layout: { row: 1, column: 1 }, // Second row, second column
    validation: (value) => {
      if (value && value.length < 10) {
        return "Phone number must be at least 10 characters";
      }
      return null;
    }
  },
  { 
    id: "address", 
    label: "Address", 
    type: "text", 
    required: true,
    layout: { row: 2, column: 0 }, // Third row, first column
  },
  { 
    id: "status", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: statusOptions,
    layout: { row: 2, column: 1 }, // Third row, second column
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  const handleAdd = (data: any) => {
    const newCustomer = {
      ...data,
      id: Math.max(...customers.map(c => c.id)) + 1,
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleEdit = (id: string | number, data: any) => {
    setCustomers(customers.map(customer => 
      customer.id === Number(id) 
        ? { ...customer, ...data }
        : customer
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const customer = customers.find(c => c.id === Number(id));
    if (customer) {
      setDeleteDialog({ open: true, id: Number(id), name: customer.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setCustomers(customers.filter(customer => customer.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  return (
    <Layout title="Customers">
      <Box sx={{ p: 3 }}>
        <DataTable
          title="Customers"
          columns={columns}
          data={customers}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          addButtonText="Add Customer"
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 