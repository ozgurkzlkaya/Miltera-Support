"use client";

import { Box, Chip } from "@mui/material";
import { Layout } from "../../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../../components/DataTable";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { useState } from "react";
import { Delete as DeleteIcon } from "@mui/icons-material";

const initialProductTypes = [
  {
    id: 1,
    name: "Gateway",
    description: "Network gateway devices for energy systems",
    category: "Communication",
    isActive: true,
    warrantyMonths: 24,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Energy Analyzer",
    description: "Power quality and energy measurement devices",
    category: "Measurement",
    isActive: true,
    warrantyMonths: 36,
    createdAt: "2024-01-20T14:20:00Z",
  },
  {
    id: 3,
    name: "VPN Router",
    description: "Secure networking equipment for remote access",
    category: "Communication",
    isActive: true,
    warrantyMonths: 12,
    createdAt: "2024-02-01T09:15:00Z",
  },
  {
    id: 4,
    name: "Smart Meter",
    description: "Advanced metering infrastructure components",
    category: "Measurement",
    isActive: false,
    warrantyMonths: 60,
    createdAt: "2024-02-10T16:45:00Z",
  },
];

const categoryOptions = [
  { value: "Communication", label: "Communication" },
  { value: "Measurement", label: "Measurement" },
  { value: "Control", label: "Control" },
  { value: "Protection", label: "Protection" },
  { value: "Monitoring", label: "Monitoring" },
];

const columns: TableColumn[] = [
  { id: "name", label: "Type Name", width: 200, sortable: true, filterable: true },
  { id: "description", label: "Description", width: 300, sortable: true, filterable: true },
  { 
    id: "category", 
    label: "Category", 
    width: 120, 
    sortable: true, 
    filterable: true,
    render: (value) => (
      <Chip
        label={value}
        color={
          value === "Communication" ? "primary" :
          value === "Measurement" ? "success" :
          value === "Control" ? "warning" :
          value === "Protection" ? "error" : "info"
        }
        size="small"
      />
    ),
  },
  {
    id: "isActive",
    label: "Status",
    width: 100,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value ? "Active" : "Inactive"}
        color={value ? "success" : "default"}
        size="small"
      />
    ),
  },
  { 
    id: "warrantyMonths", 
    label: "Warranty (Months)", 
    width: 140,
    align: "center",
    sortable: true,
    filterable: true,
  },
  { 
    id: "createdAt", 
    label: "Created", 
    width: 120, 
    sortable: true, 
    filterable: true,
    format: (value) => new Date(value).toLocaleDateString(),
  },
];

const formFields: FormField[] = [
  { 
    id: "name", 
    label: "Type Name", 
    type: "text", 
    required: true,
    placeholder: "Enter product type name",
    layout: { row: 0, column: 0 },
    validation: (value) => {
      if (value && value.length < 3) {
        return "Type name must be at least 3 characters";
      }
      return null;
    }
  },
  { 
    id: "category", 
    label: "Category", 
    type: "select", 
    required: true, 
    options: categoryOptions,
    layout: { row: 0, column: 1 },
  },
  { 
    id: "isActive", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
    layout: { row: 0, column: 2 },
  },
  { 
    id: "description", 
    label: "Description", 
    type: "text", 
    required: true,
    placeholder: "Enter detailed description",
    layout: { row: 1, column: 0 },
  },
  { 
    id: "warrantyMonths", 
    label: "Default Warranty (Months)", 
    type: "number", 
    required: true,
    placeholder: "Enter warranty period in months",
    layout: { row: 2, column: 0 },
    validation: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 120) {
        return "Warranty must be between 1 and 120 months";
      }
      return null;
    }
  },
];

export default function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState(initialProductTypes);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  const handleAdd = (data: any) => {
    const newProductType = {
      ...data,
      id: Math.max(...productTypes.map(pt => pt.id)) + 1,
      warrantyMonths: parseInt(data.warrantyMonths),
      isActive: data.isActive === "true" || data.isActive === true,
      createdAt: new Date().toISOString(),
    };
    setProductTypes([...productTypes, newProductType]);
  };

  const handleEdit = (id: string | number, data: any) => {
    setProductTypes(productTypes.map(productType => 
      productType.id === Number(id) 
        ? { 
            ...productType, 
            ...data, 
            warrantyMonths: parseInt(data.warrantyMonths),
            isActive: data.isActive === "true" || data.isActive === true,
          }
        : productType
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const productType = productTypes.find(pt => pt.id === Number(id));
    if (productType) {
      setDeleteDialog({ open: true, id: Number(id), name: productType.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setProductTypes(productTypes.filter(productType => productType.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setProductTypes(productTypes.filter(pt => !numIds.includes(pt.id)));
  };

  const handleToggleStatus = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setProductTypes(productTypes.map(pt => 
      numIds.includes(pt.id) ? { ...pt, isActive: !pt.isActive } : pt
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected product types? This action cannot be undone.",
    },
    {
      id: "toggle-status",
      label: "Toggle Status",
      action: handleToggleStatus,
    },
  ];

  return (
    <Layout title="Product Types">
      <Box sx={{ p: 3 }}>
        <DataTable
          title="Product Types"
          columns={columns}
          data={productTypes}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          addButtonText="Add Product Type"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Product Type"
          message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and may affect related products.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 