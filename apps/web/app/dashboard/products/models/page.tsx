"use client";

import { Box, Chip, Avatar } from "@mui/material";
import { Layout } from "../../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../../components/DataTable";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { useState } from "react";
import { Delete as DeleteIcon, Business as BusinessIcon } from "@mui/icons-material";

const initialProductModels = [
  {
    id: 1,
    name: "GW-2000",
    fullName: "Gateway 2000 Series",
    productTypeId: 1,
    productTypeName: "Gateway",
    manufacturer: "Miltera",
    modelNumber: "MLT-GW-2000",
    specifications: "2.4GHz WiFi, Ethernet, RS485",
    isActive: true,
    releaseDate: "2024-01-15",
    endOfLife: null,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "EA-100",
    fullName: "Energy Analyzer Professional",
    productTypeId: 2,
    productTypeName: "Energy Analyzer",
    manufacturer: "Miltera",
    modelNumber: "MLT-EA-100",
    specifications: "3-Phase, CT/VT, Harmonic Analysis",
    isActive: true,
    releaseDate: "2024-01-20",
    endOfLife: null,
    createdAt: "2024-01-20T14:20:00Z",
  },
  {
    id: 3,
    name: "VR-500",
    fullName: "VPN Router 500 Series",
    productTypeId: 3,
    productTypeName: "VPN Router",
    manufacturer: "Miltera",
    modelNumber: "MLT-VR-500",
    specifications: "IPSec VPN, 4G/5G, Firewall",
    isActive: true,
    releaseDate: "2024-02-01",
    endOfLife: null,
    createdAt: "2024-02-01T09:15:00Z",
  },
  {
    id: 4,
    name: "SM-300",
    fullName: "Smart Meter 300 Series",
    productTypeId: 4,
    productTypeName: "Smart Meter",
    manufacturer: "Miltera",
    modelNumber: "MLT-SM-300",
    specifications: "AMI, DLMS/COSEM, LoRaWAN",
    isActive: false,
    releaseDate: "2023-12-01",
    endOfLife: "2024-12-31",
    createdAt: "2023-12-01T16:45:00Z",
  },
];

// This would typically come from an API call to get product types
const productTypeOptions = [
  { value: 1, label: "Gateway" },
  { value: 2, label: "Energy Analyzer" },
  { value: 3, label: "VPN Router" },
  { value: 4, label: "Smart Meter" },
];

const manufacturerOptions = [
  { value: "Miltera", label: "Miltera" },
  { value: "Partner Corp", label: "Partner Corporation" },
  { value: "Tech Solutions", label: "Tech Solutions Ltd." },
];

const columns: TableColumn[] = [
  { 
    id: "name", 
    label: "Model", 
    width: 120, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          {value.substring(0, 2)}
        </Avatar>
        <Box>
          <div style={{ fontWeight: 'bold' }}>{value}</div>
          <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.modelNumber}</div>
        </Box>
      </Box>
    ),
  },
  { id: "fullName", label: "Full Name", width: 200, sortable: true, filterable: true },
  { 
    id: "productTypeName", 
    label: "Product Type", 
    width: 120, 
    sortable: true, 
    filterable: true,
    render: (value) => (
      <Chip
        label={value}
        color="primary"
        size="small"
        variant="outlined"
      />
    ),
  },
  { 
    id: "manufacturer", 
    label: "Manufacturer", 
    width: 120, 
    sortable: true, 
    filterable: true,
    render: (value) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon fontSize="small" color="action" />
        {value}
      </Box>
    ),
  },
  { id: "specifications", label: "Specifications", width: 250, sortable: false, filterable: true },

  {
    id: "isActive",
    label: "Status",
    width: 100,
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <Chip
        label={value ? "Active" : (row.endOfLife ? "EOL" : "Inactive")}
        color={value ? "success" : (row.endOfLife ? "error" : "default")}
        size="small"
      />
    ),
  },
  { 
    id: "releaseDate", 
    label: "Release Date", 
    width: 120, 
    sortable: true, 
    filterable: true,
    format: (value) => new Date(value).toLocaleDateString(),
  },
];

const formFields: FormField[] = [
  { 
    id: "name", 
    label: "Model Name", 
    type: "text", 
    required: true,
    placeholder: "e.g., GW-2000",
    layout: { row: 0, column: 0 }, // First row, first column
    validation: (value) => {
      if (value && value.length < 2) {
        return "Model name must be at least 2 characters";
      }
      return null;
    }
  },
  { 
    id: "fullName", 
    label: "Full Name", 
    type: "text", 
    required: true,
    placeholder: "e.g., Gateway 2000 Series",
    layout: { row: 0, column: 1 }, // First row, second column
  },
  { 
    id: "productTypeId", 
    label: "Product Type", 
    type: "autocomplete", 
    required: true, 
    options: productTypeOptions,
    searchable: true,
    layout: { row: 1, column: 0 }, // Second row, first column
  },
  { 
    id: "manufacturer", 
    label: "Manufacturer", 
    type: "autocomplete", 
    required: true, 
    options: manufacturerOptions,
    searchable: true,
    layout: { row: 1, column: 1 }, // Second row, second column
  },
  { 
    id: "modelNumber", 
    label: "Model Number", 
    type: "text", 
    required: true,
    placeholder: "e.g., MLT-GW-2000",
    layout: { row: 2, column: 0 }, // Third row, first column
    validation: (value) => {
      if (value && !/^[A-Z0-9-]+$/.test(value)) {
        return "Model number should contain only uppercase letters, numbers, and hyphens";
      }
      return null;
    }
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
    layout: { row: 2, column: 1 }, // Third row, second column
  },
  { 
    id: "specifications", 
    label: "Specifications", 
    type: "text", 
    required: true,
    placeholder: "Key technical specifications",
    layout: { row: 3, column: 0 }, // Fourth row, full width
  },
  { 
    id: "releaseDate", 
    label: "Release Date", 
    type: "date", 
    required: true,
    layout: { row: 4, column: 0 }, // Fifth row, first column
  },
  { 
    id: "endOfLife", 
    label: "End of Life Date", 
    type: "date", 
    required: false,
    helperText: "Leave empty if product is still active",
    layout: { row: 4, column: 1 }, // Fifth row, second column
  },
];

export default function ProductModelsPage() {
  const [productModels, setProductModels] = useState(initialProductModels);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  const handleAdd = (data: any) => {
    // Find the product type name for display
    const productType = productTypeOptions.find(pt => pt.value === parseInt(data.productTypeId));
    
    const newProductModel = {
      ...data,
      id: Math.max(...productModels.map(pm => pm.id)) + 1,
      productTypeId: parseInt(data.productTypeId),
      productTypeName: productType?.label || "Unknown",
      isActive: data.isActive === "true" || data.isActive === true,
      endOfLife: data.endOfLife || null,
      createdAt: new Date().toISOString(),
    };
    setProductModels([...productModels, newProductModel]);
  };

  const handleEdit = (id: string | number, data: any) => {
    // Find the product type name for display
    const productType = productTypeOptions.find(pt => pt.value === parseInt(data.productTypeId));
    
    setProductModels(productModels.map(productModel => 
      productModel.id === Number(id) 
        ? { 
            ...productModel, 
            ...data, 
            productTypeId: parseInt(data.productTypeId),
            productTypeName: productType?.label || "Unknown",
            isActive: data.isActive === "true" || data.isActive === true,
            endOfLife: data.endOfLife || null,
          }
        : productModel
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const productModel = productModels.find(pm => pm.id === Number(id));
    if (productModel) {
      setDeleteDialog({ open: true, id: Number(id), name: productModel.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setProductModels(productModels.filter(productModel => productModel.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setProductModels(productModels.filter(pm => !numIds.includes(pm.id)));
  };

  const handleToggleStatus = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setProductModels(productModels.map(pm => 
      numIds.includes(pm.id) ? { ...pm, isActive: !pm.isActive } : pm
    ));
  };

  const handleMarkEOL = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    const today = new Date().toISOString().split('T')[0];
    setProductModels(productModels.map(pm => 
      numIds.includes(pm.id) ? { ...pm, isActive: false, endOfLife: today as string | null } : pm
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected product models? This action cannot be undone.",
    },
    {
      id: "toggle-status",
      label: "Toggle Status",
      action: handleToggleStatus,
    },
    {
      id: "mark-eol",
      label: "Mark as End of Life",
      action: handleMarkEOL,
      confirmMessage: "Mark selected models as End of Life? This will also deactivate them.",
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = productModels.map(model => 
      columns.map(col => {
        const value = model[col.id as keyof typeof model];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-models.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Product Models">
      <Box sx={{ p: 3 }}>
        <DataTable
          title="Product Models"
          columns={columns}
          data={productModels}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onExport={handleExport}
          addButtonText="Add Product Model"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Product Model"
          message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and may affect related products and service records.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 