"use client";

import { Box, Chip, Avatar, Typography, Card, CardContent, Stack } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";
import { 
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

const initialShipments = [
  { 
    id: 1, 
    shipmentNumber: "SHP-2024-001", 
    type: "SALES", 
    status: "SHIPPED", 
    estimatedDelivery: "2024-06-10",
    actualDelivery: null,
    companyId: 1,
    companyName: "ABC Enerji",
    productCount: 3,
    trackingNumber: "TRK123456789",
    carrier: "MNG Kargo",
    notes: "Urgent delivery requested",
    createdAt: "2024-06-05T10:30:00Z",
    createdBy: "Mehmet Kurnaz",
    shipmentItems: [
      { productId: 1, productName: "Gateway-2000-001", quantity: 1 },
      { productId: 2, productName: "EA-100-005", quantity: 1 },
      { productId: 3, productName: "VR-500-012", quantity: 1 },
    ]
  },
  { 
    id: 2, 
    shipmentNumber: "SHP-2024-002", 
    type: "SERVICE_RETURN", 
    status: "PREPARING", 
    estimatedDelivery: "2024-06-12",
    actualDelivery: null,
    companyId: 2,
    companyName: "XYZ Elektrik",
    productCount: 1,
    trackingNumber: "TRK987654321",
    carrier: "Yurtiçi Kargo",
    notes: "Repair completed, returning to customer",
    createdAt: "2024-06-06T14:20:00Z",
    createdBy: "Ali Veli",
    shipmentItems: [
      { productId: 4, productName: "SM-300-003", quantity: 1 },
    ]
  },
  { 
    id: 3, 
    shipmentNumber: "SHP-2024-003", 
    type: "SERVICE_SEND", 
    status: "DELIVERED", 
    estimatedDelivery: "2024-06-08",
    actualDelivery: "2024-06-08",
    companyId: 3,
    companyName: "DEF Teknoloji",
    productCount: 2,
    trackingNumber: "TRK456789123",
    carrier: "Aras Kargo",
    notes: "Replacement units for defective products",
    createdAt: "2024-06-03T09:15:00Z",
    createdBy: "Fatma Özkan",
    shipmentItems: [
      { productId: 2, productName: "EA-100-005", quantity: 1 },
      { productId: 3, productName: "VR-500-012", quantity: 1 },
    ]
  },
];

// Mock data - these would typically come from API calls
const typeOptions = [
  { value: "SALES", label: "Sales Shipment" },
  { value: "SERVICE_RETURN", label: "Service Return" },
  { value: "SERVICE_SEND", label: "Service Send" },
  { value: "REPLACEMENT", label: "Replacement" },
  { value: "WARRANTY", label: "Warranty" },
];

const statusOptions = [
  { value: "PREPARING", label: "Preparing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];

const companyOptions = [
  { value: 1, label: "ABC Enerji" },
  { value: 2, label: "XYZ Elektrik" },
  { value: 3, label: "DEF Teknoloji" },
  { value: 4, label: "GHI Enerji" },
];

const carrierOptions = [
  { value: "MNG Kargo", label: "MNG Kargo" },
  { value: "Yurtiçi Kargo", label: "Yurtiçi Kargo" },
  { value: "Aras Kargo", label: "Aras Kargo" },
  { value: "UPS", label: "UPS" },
  { value: "DHL", label: "DHL" },
];

const productOptions = [
  { value: 1, label: "Gateway-2000-001 (SN123456)" },
  { value: 2, label: "EA-100-005 (SN654321)" },
  { value: 3, label: "VR-500-012 (SN987654)" },
  { value: 4, label: "SM-300-003 (SN456789)" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED": return "success";
    case "SHIPPED": 
    case "IN_TRANSIT": return "info";
    case "PREPARING": return "warning";
    case "RETURNED": return "secondary";
    case "CANCELLED": return "error";
    default: return "default";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "SALES": return "primary";
    case "SERVICE_RETURN": return "warning";
    case "SERVICE_SEND": return "info";
    case "REPLACEMENT": return "secondary";
    case "WARRANTY": return "success";
    default: return "default";
  }
};

const columns: TableColumn[] = [
  { 
    id: "shipmentNumber", 
    label: "Shipment", 
    width: 150, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          <ShippingIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.trackingNumber}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: "type",
    label: "Type",
    width: 140,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value ? value.replace("_", " ") : "Unknown"}
        color={getTypeColor(value || "") as any}
        size="small"
        variant="outlined"
      />
    ),
  },
  { 
    id: "companyName", 
    label: "Company", 
    width: 150, 
    sortable: true, 
    filterable: true,
    render: (value) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon fontSize="small" color="action" />
        {value}
      </Box>
    ),
  },
  { 
    id: "productCount", 
    label: "Items", 
    width: 80,
    align: "center",
    sortable: true, 
    filterable: true,
    render: (value) => (
      <Chip
        label={value}
        color="default"
        size="small"
        icon={<InventoryIcon />}
      />
    ),
  },

  { 
    id: "carrier", 
    label: "Carrier", 
    width: 120, 
    sortable: true, 
    filterable: true,
  },
  {
    id: "status",
    label: "Status",
    width: 120,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value.replace("_", " ")}
        color={getStatusColor(value) as any}
        size="small"
      />
    ),
  },
  { 
    id: "estimatedDelivery", 
    label: "Est. Delivery", 
    width: 120, 
    sortable: true, 
    filterable: true,
    format: (value) => new Date(value).toLocaleDateString(),
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
    id: "shipmentNumber", 
    label: "Shipment Number", 
    type: "text", 
    required: true,
    placeholder: "e.g., SHP-2024-001",
    layout: { row: 0, column: 0 }, // First row, first column
    validation: (value) => {
      if (value && !/^SHP-\d{4}-\d{3}$/.test(value)) {
        return "Shipment number format should be SHP-YYYY-XXX";
      }
      return null;
    }
  },
  { 
    id: "type", 
    label: "Shipment Type", 
    type: "select", 
    required: true, 
    options: typeOptions,
    layout: { row: 0, column: 1 }, // First row, second column
  },
  { 
    id: "status", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: statusOptions,
    layout: { row: 0, column: 2 }, // First row, third column
  },
  { 
    id: "companyId", 
    label: "Company", 
    type: "autocomplete", 
    required: true, 
    options: companyOptions,
    searchable: true,
    layout: { row: 1, column: 0 }, // Second row, first column
  },
  { 
    id: "carrier", 
    label: "Carrier", 
    type: "autocomplete", 
    required: true, 
    options: carrierOptions,
    searchable: true,
    layout: { row: 1, column: 1 }, // Second row, second column
  },
  { 
    id: "trackingNumber", 
    label: "Tracking Number", 
    type: "text", 
    required: false,
    placeholder: "e.g., TRK123456789",
    helperText: "Leave empty if not yet assigned",
    layout: { row: 1, column: 2 }, // Second row, third column
  },
  { 
    id: "productIds", 
    label: "Products", 
    type: "multiselect", 
    required: true, 
    options: productOptions,
    helperText: "Select one or more products for this shipment",
    layout: { row: 2, column: 0 }, // Third row, full width
  },
  { 
    id: "estimatedDelivery", 
    label: "Estimated Delivery", 
    type: "date", 
    required: true,
    layout: { row: 3, column: 0 }, // Fourth row, first column
  },
  { 
    id: "actualDelivery", 
    label: "Actual Delivery", 
    type: "date", 
    required: false,
    helperText: "Fill when shipment is delivered",
    layout: { row: 3, column: 1 }, // Fourth row, second column
  },
  { 
    id: "notes", 
    label: "Notes", 
    type: "text", 
    required: false,
    placeholder: "Additional notes about the shipment",
    layout: { row: 4, column: 0 }, // Fifth row, full width
  },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState(initialShipments);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    number: string;
  }>({ open: false, id: null, number: "" });

  // Helper function to calculate shipment totals
  const calculateShipmentTotals = (productIds: number[]) => {
    const selectedProducts = productOptions.filter(p => productIds.includes(p.value));
    return {
      productCount: selectedProducts.length,
    };
  };

  const handleAdd = (data: any) => {
    const company = companyOptions.find(c => c.value === parseInt(data.companyId));
    const { productCount } = calculateShipmentTotals(data.productIds || []);
    
    // Create mock shipment items
    const shipmentItems = (data.productIds || []).map((productId: number) => {
      const product = productOptions.find(p => p.value === productId);
      return {
        productId,
        productName: product?.label.split(' (')[0] || "Unknown",
        quantity: 1,
      };
    });

    const newShipment = {
      ...data,
      id: Math.max(...shipments.map(s => s.id)) + 1,
      companyId: parseInt(data.companyId),
      companyName: company?.label || "Unknown",
      productCount,
      shipmentItems,
      actualDelivery: data.actualDelivery || null,
      createdAt: new Date().toISOString(),
      createdBy: "Current User", // Would come from auth context
    };
    
    // Remove productIds from the final object as it's not part of the data model
    delete newShipment.productIds;
    
    setShipments([...shipments, newShipment]);
  };

  const handleEdit = (id: string | number, data: any) => {
    const company = companyOptions.find(c => c.value === parseInt(data.companyId));
    const { productCount } = calculateShipmentTotals(data.productIds || []);
    
    // Create mock shipment items
    const shipmentItems = (data.productIds || []).map((productId: number) => {
      const product = productOptions.find(p => p.value === productId);
      return {
        productId,
        productName: product?.label.split(' (')[0] || "Unknown",
        quantity: 1,
      };
    });

    setShipments(shipments.map(shipment => 
      shipment.id === Number(id) 
        ? { 
            ...shipment, 
            ...data, 
            companyId: parseInt(data.companyId),
            companyName: company?.label || "Unknown",
            productCount,
            shipmentItems,
            actualDelivery: data.actualDelivery || null,
          }
        : shipment
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const shipment = shipments.find(s => s.id === Number(id));
    if (shipment) {
      setDeleteDialog({ open: true, id: Number(id), number: shipment.shipmentNumber });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setShipments(shipments.filter(shipment => shipment.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setShipments(shipments.filter(s => !numIds.includes(s.id)));
  };

  const handleBulkStatusChange = (ids: (string | number)[], newStatus: string) => {
    const numIds = ids.map(id => Number(id));
    const updateData: any = { status: newStatus };
    
    // If marking as delivered, set actual delivery date
    if (newStatus === "DELIVERED") {
      updateData.actualDelivery = new Date().toISOString().split('T')[0];
    }

    setShipments(shipments.map(s => 
      numIds.includes(s.id) ? { ...s, ...updateData } : s
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected shipments? This action cannot be undone.",
    },
    {
      id: "mark-shipped",
      label: "Mark as Shipped",
      action: (ids) => handleBulkStatusChange(ids, "SHIPPED"),
    },
    {
      id: "mark-in-transit",
      label: "Mark as In Transit",
      action: (ids) => handleBulkStatusChange(ids, "IN_TRANSIT"),
    },
    {
      id: "mark-delivered",
      label: "Mark as Delivered",
      action: (ids) => handleBulkStatusChange(ids, "DELIVERED"),
      confirmMessage: "Mark selected shipments as delivered? This will set the actual delivery date to today.",
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = shipments.map(shipment => 
      columns.map(col => {
        const value = shipment[col.id as keyof typeof shipment];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = shipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Layout title="Shipments">
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Shipments
                </Typography>
                <Typography variant="h4" color="primary">
                  {shipments.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivered
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statusCounts.DELIVERED || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  In Transit
                </Typography>
                <Typography variant="h4" color="info.main">
                  {(statusCounts.SHIPPED || 0) + (statusCounts.IN_TRANSIT || 0)}
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Box>

        {/* Shipments DataTable */}
        <DataTable
          title="Shipments"
          columns={columns}
          data={shipments}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onExport={handleExport}
          addButtonText="Create Shipment"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Shipment"
          message={`Are you sure you want to delete shipment "${deleteDialog.number}"? This action cannot be undone and may affect tracking records.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 