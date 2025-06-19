"use client";

import {
  Box,
  Chip,
  Avatar,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
} from "@mui/material";
import { Layout } from "../../components/Layout";
import {
  DataTable,
  TableColumn,
  FormField,
  BulkAction,
  ToolbarButton,
} from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { BulkProductCreator } from "../../components/BulkProductCreator";
import { ServiceOperationsManager } from "../../components/ServiceOperationsManager";
import { ProductHistoryModal } from "../../components/ProductHistoryModal";
import { useState } from "react";
import {
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ModelTraining as ModelIcon,
  Add as AddIcon,
  PostAdd as BulkAddIcon,
  Assignment as IssueIcon,
  Visibility as ViewIcon,
  Engineering as ServiceIcon,
  Build as RepairIcon,
  Close as CloseIcon,
  BugReport as BugIcon,
  Assessment as ReportIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useProducts } from "./product.service";
import { useAuth, useAuthenticatedAuth } from "../auth/useAuth";

// Mock issues data - would typically come from API calls
const mockIssues = [
  {
    id: 1,
    issueNumber: "ARZ-2024-001",
    productId: 1,
    title: "Gateway Connection Timeout",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdAt: "2024-06-01T10:30:00Z",
    assignedTspName: "John Doe",
  },
  {
    id: 2,
    issueNumber: "ARZ-2024-002",
    productId: 2,
    title: "Energy Analyzer Calibration Required",
    status: "WAITING_PARTS",
    priority: "MEDIUM",
    createdAt: "2024-06-01T14:20:00Z",
    assignedTspName: "Jane Smith",
  },
  {
    id: 3,
    issueNumber: "ARZ-2024-003",
    productId: 3,
    title: "VPN Router Firmware Update",
    status: "REPAIRED",
    priority: "CRITICAL",
    createdAt: "2024-06-01T16:45:00Z",
    assignedTspName: "Mike Johnson",
  },
  {
    id: 4,
    issueNumber: "ARZ-2024-004",
    productId: 1,
    title: "Gateway Overheating Issue",
    status: "OPEN",
    priority: "HIGH",
    createdAt: "2024-06-05T09:15:00Z",
    assignedTspName: "John Doe",
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
    case "ACTIVE":
      return "success";
    case "IN_SERVICE":
      return "primary";
    case "SHIPPED":
      return "info";
    case "IN_REPAIR":
      return "warning";
    case "TESTING":
      return "secondary";
    case "REPLACED":
    case "DISPOSED":
      return "error";
    default:
      return "default";
  }
};

const getIssueStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "WAITING_PARTS":
      return "secondary";
    case "REPAIRED":
      return "success";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "CRITICAL":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    case "LOW":
      return "success";
    default:
      return "default";
  }
};

const getProductIssues = (productId: number) => {
  return mockIssues.filter((issue) => issue.productId === productId);
};

const columns = (
  setIssuesDialog: any,
  handleViewHistory: any,
  handleView: any
): TableColumn[] => [
  {
    id: "name",
    label: "Product Name",
    width: 180,
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
          {row.productModelName.substring(0, 2)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {value}
          </Typography>
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
    filterType: "select",
    filterOptions: productTypeOptions.map((opt) => ({
      value: opt.label,
      label: opt.label,
    })),
    render: (value) => (
      <Chip label={value} color="primary" size="small" variant="outlined" />
    ),
  },
  {
    id: "productModelName",
    label: "Model",
    width: 100,
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: productModelOptions.map((opt) => ({
      value: opt.label,
      label: opt.label,
    })),
  },
  {
    id: "companyName",
    label: "Company",
    width: 130,
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: companyOptions.map((opt) => ({
      value: opt.label,
      label: opt.label,
    })),
  },
  {
    id: "currentStatus",
    label: "Status",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: statusOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
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
    filterType: "select",
    filterOptions: [
      { value: "", label: "Customer-owned" },
      ...stockLocationOptions.map((opt) => ({
        value: opt.label,
        label: opt.label,
      })),
    ],
    render: (value, row) =>
      value ? (
        <Chip label={value} color="info" size="small" variant="outlined" />
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
    filterType: "date",
    format: (value) => new Date(value).toLocaleDateString(),
  },
  {
    id: "productionDate",
    label: "Production",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "date",
    format: (value) => new Date(value).toLocaleDateString(),
  },
  {
    id: "issues",
    label: "Issues",
    width: 120,
    sortable: false,
    filterable: false,
    render: (value, row) => {
      const productIssues = getProductIssues(row.id);
      const activeIssues = productIssues.filter(
        (issue) => issue.status !== "CLOSED" && issue.status !== "REPAIRED"
      );

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={`Click to view ${productIssues.length} issues`}>
            <IconButton
              size="small"
              onClick={() => setIssuesDialog({ open: true, product: row })}
              sx={{ p: 0 }}
            >
              <Badge badgeContent={activeIssues.length} color="error">
                <BugIcon
                  color={activeIssues.length > 0 ? "error" : "disabled"}
                />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
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
    },
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
    helperText:
      "Required for stock items (leave empty for customer-owned products)",
    layout: { row: 2, column: 1 }, // Third row, second column
  },
  {
    id: "productionDate",
    label: "Production Date",
    type: "date",
    required: true,
    layout: { row: 3, column: 0 },
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
    },
  },
];

const Products = ({ products: _products }: { products: any }) => {
  const auth = useAuthenticatedAuth();

  const [products, setProducts] = useState(_products);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  const [issuesDialog, setIssuesDialog] = useState<{
    open: boolean;
    product: any | null;
  }>({ open: false, product: null });

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    product: any | null;
  }>({ open: false, product: null });

  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    product: any | null;
  }>({ open: false, product: null });

  const handleView = (id: string | number) => {
    const product = products.find((p: any) => p.id === Number(id));
    if (product) {
      setViewDialog({ open: true, product });
    }
  };

  const handleViewHistory = (id: string | number) => {
    const product = products.find((p: any) => p.id === Number(id));
    if (product) {
      setHistoryDialog({ open: true, product });
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const columnsArray = columns(
      setIssuesDialog,
      handleViewHistory,
      handleView
    );
    const headers = columnsArray.map((col: any) => col.label).join(",");
    const rows = products.map((product: any) =>
      columnsArray
        .map((col: any) => {
          const value = product[col.id as keyof typeof product];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdd = (data: any) => {
    // Find related names for display
    const productModel = productModelOptions.find(
      (pm) => pm.value === parseInt(data.productModelId)
    );
    const company = companyOptions.find(
      (c) => c.value === parseInt(data.companyId)
    );
    const stockLocation = stockLocationOptions.find(
      (sl) => sl.value === parseInt(data.stockLocationId)
    );

    // Automatically determine product type and manufacturer based on model
    // This mapping should ideally come from your backend/database
    const modelToTypeMapping: Record<number, { id: number; name: string }> = {
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
    const manufacturer =
      modelToManufacturerMapping[parseInt(data.productModelId)];

    const newProduct = {
      ...data,
      id: Math.max(...products.map((p) => p.id)) + 1,
      productTypeId: productType?.id || 1,
      productTypeName: productType?.name || "Unknown",
      productModelId: parseInt(data.productModelId),
      productModelName: productModel?.label || "Unknown",
      manufacturer: manufacturer || "Miltera",
      companyId: data.companyId ? parseInt(data.companyId) : null,
      companyName: company?.label || null,
      stockLocationId: data.stockLocationId
        ? parseInt(data.stockLocationId)
        : null,
      stockLocationName: stockLocation?.label || null,
      warrantyPeriodMonths: parseInt(data.warrantyPeriodMonths),
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleEdit = (id: string | number, data: any) => {
    // Find related names for display
    const productModel = productModelOptions.find(
      (pm) => pm.value === parseInt(data.productModelId)
    );
    const company = companyOptions.find(
      (c) => c.value === parseInt(data.companyId)
    );
    const stockLocation = stockLocationOptions.find(
      (sl) => sl.value === parseInt(data.stockLocationId)
    );

    // Automatically determine product type and manufacturer based on model
    const modelToTypeMapping: Record<number, { id: number; name: string }> = {
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
    const manufacturer =
      modelToManufacturerMapping[parseInt(data.productModelId)];

    setProducts(
      products.map((product) =>
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
              stockLocationId: data.stockLocationId
                ? parseInt(data.stockLocationId)
                : null,
              stockLocationName: stockLocation?.label || null,
              warrantyPeriodMonths: parseInt(data.warrantyPeriodMonths),
            }
          : product
      )
    );
  };

  const handleDeleteRequest = (id: string | number) => {
    const product = products.find((p) => p.id === Number(id));
    if (product) {
      setDeleteDialog({ open: true, id: Number(id), name: product.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setProducts(products.filter((product) => product.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleBulkCreate = (bulkProducts: any[]) => {
    const modelToTypeMapping: Record<number, { id: number; name: string }> = {
      1: { id: 1, name: "Gateway" },
      2: { id: 2, name: "Energy Analyzer" },
      3: { id: 3, name: "VPN Router" },
      4: { id: 4, name: "Smart Meter" },
    };

    const modelToManufacturerMapping: Record<number, string> = {
      1: "Miltera",
      2: "Miltera",
      3: "Miltera",
      4: "Miltera",
    };

    const newProducts = bulkProducts.map((product, index) => {
      const productModel = productModelOptions.find(
        (pm) => pm.value === product.productModelId
      );
      const company = companyOptions.find((c) => c.value === product.companyId);
      const stockLocation = stockLocationOptions.find(
        (sl) => sl.value === product.stockLocationId
      );
      const productType = modelToTypeMapping[product.productModelId];
      const manufacturer = modelToManufacturerMapping[product.productModelId];

      return {
        id: Math.max(...products.map((p) => p.id)) + index + 1,
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
    const numIds = ids.map((id) => Number(id));
    setProducts(products.filter((p) => !numIds.includes(p.id)));
  };

  const handleBulkStatusChange = (
    ids: (string | number)[],
    newStatus: string
  ) => {
    const numIds = ids.map((id) => Number(id));
    setProducts(
      products.map((p) =>
        numIds.includes(p.id) ? { ...p, currentStatus: newStatus } : p
      )
    );
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage:
        "Are you sure you want to delete the selected products? This action cannot be undone.",
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

  return (
    <Layout title="Products">
      <Box sx={{ p: 3 }}>
        {/* Quick Actions */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                  {1}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  In Service
                </Typography>
                <Typography variant="h4" color="info.main">
                  {1}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  In Repair
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {1}
                </Typography>
              </CardContent>
            </Card>
            {auth.role !== "customer" ? (
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
            ) : null}
          </Stack>
        </Box>

        <BulkProductCreator
          open={bulkCreateOpen}
          onClose={() => setBulkCreateOpen(false)}
          onSubmit={handleBulkCreate}
          productModelOptions={productModelOptions}
          companyOptions={companyOptions}
          stockLocationOptions={stockLocationOptions}
          statusOptions={statusOptions}
        />

        <DataTable
          title="Products"
          columns={columns(setIssuesDialog, handleViewHistory, handleView)}
          data={products}
          formFields={formFields}
          {...(auth.role !== "customer"
            ? {
                onAdd: handleAdd,
                onEdit: handleEdit,
                onDelete: handleDeleteRequest,
              }
            : {})}
          onExport={handleExport}
          onView={handleView}
          addButtonText="Add Product"
          selectable={true}
          bulkActions={bulkActions}
          {...(auth.role !== "customer"
            ? {
                customToolbarButtons: [
                  {
                    id: "bulk-add",
                    label: "Bulk Add Products",
                    icon: <BulkAddIcon />,
                    variant: "contained",
                    color: "secondary",
                    onClick: () => setBulkCreateOpen(true),
                  },
                ],
              }
            : {})}
          toolbarButtonsLayout="vertical"
          pageSize={10}
        />
      </Box>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and may affect related service records.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
      />

      {/* Issues Dialog */}
      <Dialog
        open={issuesDialog.open}
        onClose={() => setIssuesDialog({ open: false, product: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">
                Issues for {issuesDialog.product?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Serial: {issuesDialog.product?.serial}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIssuesDialog({ open: false, product: null })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {issuesDialog.product && (
            <Box>
              {(() => {
                const productIssues = getProductIssues(issuesDialog.product.id);
                return productIssues.length > 0 ? (
                  <Stack spacing={2}>
                    {productIssues.map((issue: any) => (
                      <Card key={issue.id} variant="outlined">
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="start"
                          >
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {issue.issueNumber}: {issue.title}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Chip
                                  label={issue.status}
                                  color={
                                    getIssueStatusColor(issue.status) as any
                                  }
                                  size="small"
                                />
                                <Chip
                                  label={issue.priority}
                                  color={
                                    getPriorityColor(issue.priority) as any
                                  }
                                  size="small"
                                />
                              </Stack>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Assigned to: {issue.assignedTspName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Created:{" "}
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ViewIcon />}
                              >
                                View Details
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ServiceIcon />}
                              >
                                Manage
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <BugIcon
                      sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No issues found for this product
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This product currently has no reported issues.
                    </Typography>
                  </Box>
                );
              })()}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, product: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <CategoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Product Details</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewDialog.product?.name}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setViewDialog({ open: false, product: null })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {viewDialog.product && (
            <Box sx={{ pt: 1 }}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CategoryIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Product Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Serial Number
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.serial}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Chip
                        label={viewDialog.product.productTypeName}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Model
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.productModelName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <BusinessIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Company
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.companyName || "Stock Item"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={
                          viewDialog.product.currentStatus?.replace("_", " ") ||
                          "Unknown"
                        }
                        color={
                          getStatusColor(
                            viewDialog.product.currentStatus || ""
                          ) as any
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Production Date
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {viewDialog.product.productionDate
                            ? new Date(
                                viewDialog.product.productionDate
                              ).toLocaleDateString()
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 200 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Warranty Start
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {viewDialog.product.warrantyStartDate
                            ? new Date(
                                viewDialog.product.warrantyStartDate
                              ).toLocaleDateString()
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 150 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Warranty Period
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {viewDialog.product.warrantyPeriodMonths
                            ? `${viewDialog.product.warrantyPeriodMonths} months`
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Location & Stock */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location & Stock
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <LocationIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Stock Location
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.stockLocationName ||
                          "Customer-owned"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Manufacturer
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewDialog.product.manufacturer || "Miltera"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Product History Section */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Product History
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <TimelineIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    View complete product lifecycle and history
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    onClick={() => {
                      setHistoryDialog({
                        open: true,
                        product: viewDialog.product,
                      });
                    }}
                    sx={{ mt: 1 }}
                  >
                    View Product History
                  </Button>
                </Box>
              </Box>

              {/* Issues Summary */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Issues Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                {(() => {
                  const productIssues = getProductIssues(viewDialog.product.id);
                  const activeIssues = productIssues.filter(
                    (issue) =>
                      issue.status !== "CLOSED" && issue.status !== "REPAIRED"
                  );

                  return (
                    <>
                      <Box sx={{ minWidth: 150 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <BugIcon color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Total Issues
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {productIssues.length}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ minWidth: 150 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <ReportIcon color="error" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Active Issues
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              color="error.main"
                            >
                              {activeIssues.length}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ minWidth: 200 }}>
                        <Button
                          variant="outlined"
                          startIcon={<BugIcon />}
                          onClick={() => {
                            setViewDialog({ open: false, product: null });
                            setIssuesDialog({
                              open: true,
                              product: viewDialog.product,
                            });
                          }}
                          disabled={productIssues.length === 0}
                        >
                          View All Issues
                        </Button>
                      </Box>
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Product History Modal */}
      <ProductHistoryModal
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, product: null })}
        product={historyDialog.product}
      />
    </Layout>
  );
};

export default Products;
