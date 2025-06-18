"use client";

import { Box, Chip, Avatar, Typography, Card, CardContent, Button, Stack } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { BulkProductCreator } from "../../../components/BulkProductCreator";
import { useState } from "react";
import { 
  Delete as DeleteIcon, 
  Category as CategoryIcon,
  ModelTraining as ModelIcon,
  Add as AddIcon,
  PostAdd as BulkAddIcon,
} from "@mui/icons-material";
import Link from "next/link";

const initialProducts = [
  {
    id: 1,
    name: "Gateway-2000-001",
    serial: "SN123456",
    productTypeId: 1,
    productTypeName: "Gateway",
    productModelId: 1,
    productModelName: "GW-2000",
    manufacturer: "Miltera",
    currentStatus: "ACTIVE",
    warrantyStartDate: "2024-01-15",
    warrantyPeriodMonths: 24,
    productionDate: "2024-01-10",
    companyId: 1,
    companyName: "ABC Enerji",
    stockLocationId: 1,
    stockLocationName: "Ana Depo",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "EA-100-005",
    serial: "SN654321",
    productTypeId: 2,
    productTypeName: "Energy Analyzer",
    productModelId: 2,
    productModelName: "EA-100",
    manufacturer: "Miltera",
    currentStatus: "IN_SERVICE",
    warrantyStartDate: "2024-02-01",
    warrantyPeriodMonths: 36,
    productionDate: "2024-01-25",
    companyId: 2,
    companyName: "XYZ Elektrik",
    stockLocationId: null, // Customer-owned product
    stockLocationName: null,
    createdAt: "2024-02-01T14:20:00Z",
  },
  {
    id: 3,
    name: "VR-500-012",
    serial: "SN987654",
    productTypeId: 3,
    productTypeName: "VPN Router",
    productModelId: 3,
    productModelName: "VR-500",
    manufacturer: "Miltera",
    currentStatus: "SHIPPED",
    warrantyStartDate: "2024-02-15",
    warrantyPeriodMonths: 12,
    productionDate: "2024-02-10",
    companyId: 3,
    companyName: "DEF Teknoloji",
    stockLocationId: 6,
    stockLocationName: "İkincil Depo",
    createdAt: "2024-02-15T09:15:00Z",
  },
  {
    id: 4,
    name: "SM-300-003",
    serial: "SN456789",
    productTypeId: 4,
    productTypeName: "Smart Meter",
    productModelId: 4,
    productModelName: "SM-300",
    manufacturer: "Miltera",
    currentStatus: "IN_REPAIR",
    warrantyStartDate: "2023-12-01",
    warrantyPeriodMonths: 60,
    productionDate: "2023-11-20",
    companyId: 1,
    companyName: "ABC Enerji",
    stockLocationId: 4,
    stockLocationName: "Servis Merkezi",
    createdAt: "2023-12-01T16:45:00Z",
  },
];

// Mock data - these would typically come from API calls
const productTypeOptions = [
  { value: 1, label: "Gateway" },
  { value: 2, label: "Energy Analyzer" },
  { value: 3, label: "VPN Router" },
  { value: 4, label: "Smart Meter" },
];

const productModelOptions = [
  { value: 1, label: "GW-2000" },
  { value: 2, label: "EA-100" },
  { value: 3, label: "VR-500" },
  { value: 4, label: "SM-300" },
];

const companyOptions = [
  { value: 1, label: "ABC Enerji" },
  { value: 2, label: "XYZ Elektrik" },
  { value: 3, label: "DEF Teknoloji" },
  { value: 4, label: "GHI Enerji" },
];

const manufacturerOptions = [
  { value: "Miltera", label: "Miltera" },
  { value: "Partner Corp", label: "Partner Corporation" },
  { value: "Tech Solutions", label: "Tech Solutions Ltd." },
];

const stockLocationOptions = [
  { value: 1, label: "Ana Depo" },
  { value: 2, label: "Raf A-1" },
  { value: 3, label: "Raf A-2" },
  { value: 4, label: "Servis Merkezi" },
  { value: 5, label: "Onarım Masası 1" },
  { value: 6, label: "İkincil Depo" },
];

const statusOptions = [
  { value: "PRODUCTION", label: "Production" },
  { value: "TESTING", label: "Testing" },
  { value: "ACTIVE", label: "Active" },
  { value: "IN_SERVICE", label: "In Service" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "IN_REPAIR", label: "In Repair" },
  { value: "REPLACED", label: "Replaced" },
  { value: "DISPOSED", label: "Disposed" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE": return "success";
    case "IN_SERVICE": return "primary";
    case "SHIPPED": return "info";
    case "IN_REPAIR": return "warning";
    case "TESTING": return "secondary";
    case "REPLACED": 
    case "DISPOSED": return "error";
    default: return "default";
  }
};

const columns: TableColumn[] = [
  { 
    id: "name", 
    label: "Product Name", 
    width: 180, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          {row.productModelName.substring(0, 2)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.serial}
          </Typography>
        </Box>
      </Box>
    ),
  },
  { 
    id: "productTypeName", 
    label: "Type", 
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
    id: "productModelName", 
    label: "Model", 
    width: 100, 
    sortable: true, 
    filterable: true,
  },
  { 
    id: "companyName", 
    label: "Company", 
    width: 130, 
    sortable: true, 
    filterable: true,
  },
  {
    id: "currentStatus",
    label: "Status",
    width: 120,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value ? value.replace("_", " ") : "Unknown"}
        color={getStatusColor(value || "") as any}
        size="small"
      />
    ),
  },
  { 
    id: "stockLocationName", 
    label: "Stock Location", 
    width: 140, 
    sortable: true, 
    filterable: true,
    render: (value, row) => value ? (
      <Chip
        label={value}
        color="info"
        size="small"
        variant="outlined"
      />
    ) : (
      <Typography variant="caption" color="text.secondary" fontStyle="italic">
        Customer-owned
      </Typography>
    ),
  },

  { 
    id: "warrantyStartDate", 
    label: "Warranty Start", 
    width: 120, 
    sortable: true, 
    filterable: true,
    format: (value) => new Date(value).toLocaleDateString(),
  },
  { 
    id: "productionDate", 
    label: "Production", 
    width: 120, 
    sortable: true, 
    filterable: true,
    format: (value) => new Date(value).toLocaleDateString(),
  },
];

const formFields: FormField[] = [
  { 
    id: "serial", 
    label: "Serial Number", 
    type: "text", 
    required: true,
    placeholder: "e.g., SN123456",
    layout: { row: 0, column: 0 }, // First row, first column
    validation: (value) => {
      if (value && value.length < 6) {
        return "Serial number must be at least 6 characters";
      }
      return null;
    }
  },
  { 
    id: "currentStatus", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: statusOptions,
    layout: { row: 0, column: 1 }, // First row, second column
  },
  { 
    id: "productModelId", 
    label: "Product Model", 
    type: "autocomplete", 
    required: true, 
    options: productModelOptions,
    searchable: true,
    layout: { row: 1, column: 0 }, // Second row, full width
  },
  { 
    id: "companyId", 
    label: "Customer Company", 
    type: "autocomplete", 
    required: false, 
    options: companyOptions,
    searchable: true,
    helperText: "Leave empty for stock items",
    layout: { row: 2, column: 0 }, // Third row, first column
  },
  { 
    id: "stockLocationId", 
    label: "Stock Location", 
    type: "autocomplete", 
    required: false,
    options: stockLocationOptions,
    searchable: true,
    helperText: "Required for stock items (leave empty for customer-owned products)",
    layout: { row: 2, column: 1 }, // Third row, second column
  },
  { 
    id: "productionDate", 
    label: "Production Date", 
    type: "date", 
    required: true,
    layout: { row: 3, column: 0 }, // Fourth row, first column
  },
  { 
    id: "warrantyStartDate", 
    label: "Warranty Start Date", 
    type: "date", 
    required: false,
    helperText: "Leave empty for stock items",
    layout: { row: 3, column: 1 }, // Fourth row, second column
  },
  { 
    id: "warrantyPeriodMonths", 
    label: "Warranty Period (Months)", 
    type: "number", 
    required: true,
    placeholder: "24",
    layout: { row: 3, column: 2 }, // Fourth row, third column
    validation: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 120) {
        return "Warranty period must be between 1 and 120 months";
      }
      return null;
    }
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);

  const handleAdd = (data: any) => {
    // Find related names for display
    const productModel = productModelOptions.find(pm => pm.value === parseInt(data.productModelId));
    const company = companyOptions.find(c => c.value === parseInt(data.companyId));
    const stockLocation = stockLocationOptions.find(sl => sl.value === parseInt(data.stockLocationId));
    
    // Automatically determine product type and manufacturer based on model
    // This mapping should ideally come from your backend/database
    const modelToTypeMapping: Record<number, { id: number, name: string }> = {
      1: { id: 1, name: "Gateway" }, // GW-2000 -> Gateway
      2: { id: 2, name: "Energy Analyzer" }, // EA-100 -> Energy Analyzer
      3: { id: 3, name: "VPN Router" }, // VR-500 -> VPN Router
      4: { id: 4, name: "Smart Meter" }, // SM-300 -> Smart Meter
    };
    
    // Automatically determine manufacturer based on model
    const modelToManufacturerMapping: Record<number, string> = {
      1: "Miltera", // GW-2000 -> Miltera
      2: "Miltera", // EA-100 -> Miltera
      3: "Miltera", // VR-500 -> Miltera
      4: "Miltera", // SM-300 -> Miltera
    };
    
    const productType = modelToTypeMapping[parseInt(data.productModelId)];
    const manufacturer = modelToManufacturerMapping[parseInt(data.productModelId)];

    const newProduct = {
      ...data,
      id: Math.max(...products.map(p => p.id)) + 1,
      productTypeId: productType?.id || 1,
      productTypeName: productType?.name || "Unknown",
      productModelId: parseInt(data.productModelId),
      productModelName: productModel?.label || "Unknown",
      manufacturer: manufacturer || "Miltera",
      companyId: data.companyId ? parseInt(data.companyId) : null,
      companyName: company?.label || null,
      stockLocationId: data.stockLocationId ? parseInt(data.stockLocationId) : null,
      stockLocationName: stockLocation?.label || null,
      warrantyPeriodMonths: parseInt(data.warrantyPeriodMonths),
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleEdit = (id: string | number, data: any) => {
    // Find related names for display
    const productModel = productModelOptions.find(pm => pm.value === parseInt(data.productModelId));
    const company = companyOptions.find(c => c.value === parseInt(data.companyId));
    const stockLocation = stockLocationOptions.find(sl => sl.value === parseInt(data.stockLocationId));
    
    // Automatically determine product type and manufacturer based on model
    const modelToTypeMapping: Record<number, { id: number, name: string }> = {
      1: { id: 1, name: "Gateway" }, // GW-2000 -> Gateway
      2: { id: 2, name: "Energy Analyzer" }, // EA-100 -> Energy Analyzer
      3: { id: 3, name: "VPN Router" }, // VR-500 -> VPN Router
      4: { id: 4, name: "Smart Meter" }, // SM-300 -> Smart Meter
    };
    
    // Automatically determine manufacturer based on model
    const modelToManufacturerMapping: Record<number, string> = {
      1: "Miltera", // GW-2000 -> Miltera
      2: "Miltera", // EA-100 -> Miltera
      3: "Miltera", // VR-500 -> Miltera
      4: "Miltera", // SM-300 -> Miltera
    };
    
    const productType = modelToTypeMapping[parseInt(data.productModelId)];
    const manufacturer = modelToManufacturerMapping[parseInt(data.productModelId)];

    setProducts(products.map(product => 
      product.id === Number(id) 
        ? { 
            ...product, 
            ...data, 
            productTypeId: productType?.id || 1,
            productTypeName: productType?.name || "Unknown",
            productModelId: parseInt(data.productModelId),
            productModelName: productModel?.label || "Unknown",
            manufacturer: manufacturer || "Miltera",
            companyId: data.companyId ? parseInt(data.companyId) : null,
            companyName: company?.label || null,
            stockLocationId: data.stockLocationId ? parseInt(data.stockLocationId) : null,
            stockLocationName: stockLocation?.label || null,
            warrantyPeriodMonths: parseInt(data.warrantyPeriodMonths),
          }
        : product
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const product = products.find(p => p.id === Number(id));
    if (product) {
      setDeleteDialog({ open: true, id: Number(id), name: product.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setProducts(products.filter(product => product.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleBulkCreate = (bulkProducts: any[]) => {
    const modelToTypeMapping: Record<number, { id: number, name: string }> = {
      1: { id: 1, name: "Gateway" },
      2: { id: 2, name: "Energy Analyzer" },
      3: { id: 3, name: "VPN Router" },
      4: { id: 4, name: "Smart Meter" },
    };
    
    const modelToManufacturerMapping: Record<number, string> = {
      1: "Miltera", 2: "Miltera", 3: "Miltera", 4: "Miltera",
    };

    const newProducts = bulkProducts.map((product, index) => {
      const productModel = productModelOptions.find(pm => pm.value === product.productModelId);
      const company = companyOptions.find(c => c.value === product.companyId);
      const stockLocation = stockLocationOptions.find(sl => sl.value === product.stockLocationId);
      const productType = modelToTypeMapping[product.productModelId];
      const manufacturer = modelToManufacturerMapping[product.productModelId];

      return {
        id: Math.max(...products.map(p => p.id)) + index + 1,
        name: product.name,
        serial: product.serial,
        productTypeId: productType?.id || 1,
        productTypeName: productType?.name || "Unknown",
        productModelId: product.productModelId,
        productModelName: productModel?.label || "Unknown",
        manufacturer: manufacturer || "Miltera",
        currentStatus: product.currentStatus,
        warrantyStartDate: product.warrantyStartDate,
        warrantyPeriodMonths: product.warrantyPeriodMonths,
        productionDate: product.productionDate,
        companyId: product.companyId,
        companyName: company?.label || null,
        stockLocationId: product.stockLocationId,
        stockLocationName: stockLocation?.label || null,
        createdAt: new Date().toISOString(),
      };
    });

    setProducts([...products, ...newProducts]);
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setProducts(products.filter(p => !numIds.includes(p.id)));
  };

  const handleBulkStatusChange = (ids: (string | number)[], newStatus: string) => {
    const numIds = ids.map(id => Number(id));
    setProducts(products.map(p => 
      numIds.includes(p.id) ? { ...p, currentStatus: newStatus } : p
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected products? This action cannot be undone.",
    },
    {
      id: "mark-shipped",
      label: "Mark as Shipped",
      action: (ids) => handleBulkStatusChange(ids, "SHIPPED"),
    },
    {
      id: "mark-in-service",
      label: "Mark as In Service",
      action: (ids) => handleBulkStatusChange(ids, "IN_SERVICE"),
    },
    {
      id: "mark-in-repair",
      label: "Mark as In Repair",
      action: (ids) => handleBulkStatusChange(ids, "IN_REPAIR"),
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = products.map(product => 
      columns.map(col => {
        const value = product[col.id as keyof typeof product];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = products.reduce((acc, product) => {
      acc[product.currentStatus] = (acc[product.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Layout title="Products">
      <Box sx={{ p: 3 }}>
        {/* Quick Actions */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4" color="primary">
                  {products.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statusCounts.ACTIVE || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  In Service
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statusCounts.IN_SERVICE || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  In Repair
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statusCounts.IN_REPAIR || 0}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 200 }}>
            <Link href="/dashboard/products/types" passHref>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                fullWidth
              >
                Manage Product Types
              </Button>
            </Link>
            <Link href="/dashboard/products/models" passHref>
              <Button
                variant="outlined"
                startIcon={<ModelIcon />}
                fullWidth
              >
                Manage Product Models
              </Button>
            </Link>
          </Stack>
        </Box>

        {/* Products DataTable */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained"
            color="secondary"
            startIcon={<BulkAddIcon />}
            onClick={() => setBulkCreateOpen(true)}
          >
            Bulk Add Products
          </Button>
        </Box>

        <DataTable
          title="Products"
          columns={columns}
          data={products}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onExport={handleExport}
          addButtonText="Add Product"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <BulkProductCreator
          open={bulkCreateOpen}
          onClose={() => setBulkCreateOpen(false)}
          onSubmit={handleBulkCreate}
          productModelOptions={productModelOptions}
          companyOptions={companyOptions}
          stockLocationOptions={stockLocationOptions}
          statusOptions={statusOptions}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and may affect related service records.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
}
