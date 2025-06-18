"use client";

import { Box, Chip, Avatar, Typography, Card, CardContent, Stack } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";
import { 
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Warehouse as WarehouseIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

const initialLocations = [
  { 
    id: 1, 
    locationCode: "LOC-001", 
    name: "Istanbul Warehouse",
    type: "WAREHOUSE",
    address: "Atatürk Mahallesi, Ikitelli Caddesi No:123, Ikitelli, Istanbul",
    city: "Istanbul",
    country: "Turkey",
    postalCode: "34490",
    contactPerson: "Mehmet Kurnaz",
    contactPhone: "+90 212 555 0123",
    contactEmail: "mehmet@miltera.com",
    capacity: 1000,
    currentStock: 450,
    status: "ACTIVE",
    notes: "Main distribution center for Istanbul region",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-06-01T14:30:00Z"
  },
  { 
    id: 2, 
    locationCode: "LOC-002", 
    name: "Ankara Service Center",
    type: "SERVICE_CENTER",
    address: "Çankaya Mahallesi, Eskişehir Yolu Caddesi No:456, Ankara",
    city: "Ankara",
    country: "Turkey",
    postalCode: "06500",
    contactPerson: "Ali Veli",
    contactPhone: "+90 312 555 0456",
    contactEmail: "ali@miltera.com",
    capacity: 200,
    currentStock: 85,
    status: "ACTIVE",
    notes: "Regional service and repair center",
    createdAt: "2024-02-10T11:15:00Z",
    updatedAt: "2024-05-20T16:45:00Z"
  },
  { 
    id: 3, 
    locationCode: "LOC-003", 
    name: "Izmir Office",
    type: "OFFICE",
    address: "Konak Mahallesi, Atatürk Caddesi No:789, Izmir",
    city: "Izmir",
    country: "Turkey",
    postalCode: "35250",
    contactPerson: "Fatma Özkan",
    contactPhone: "+90 232 555 0789",
    contactEmail: "fatma@miltera.com",
    capacity: 50,
    currentStock: 15,
    status: "ACTIVE",
    notes: "Sales and support office for Aegean region",
    createdAt: "2024-03-05T13:20:00Z",
    updatedAt: "2024-06-10T10:15:00Z"
  },
  { 
    id: 4, 
    locationCode: "LOC-004", 
    name: "Bursa Warehouse",
    type: "WAREHOUSE",
    address: "Osmangazi Mahallesi, Sanayi Caddesi No:321, Bursa",
    city: "Bursa",
    country: "Turkey",
    postalCode: "16160",
    contactPerson: "Ahmet Yılmaz",
    contactPhone: "+90 224 555 0321",
    contactEmail: "ahmet@miltera.com",
    capacity: 750,
    currentStock: 220,
    status: "MAINTENANCE",
    notes: "Undergoing facility upgrade",
    createdAt: "2024-04-12T08:30:00Z",
    updatedAt: "2024-06-08T12:00:00Z"
  },
];

// Mock data - these would typically come from API calls
const typeOptions = [
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "SERVICE_CENTER", label: "Service Center" },
  { value: "OFFICE", label: "Office" },
  { value: "RETAIL", label: "Retail Store" },
  { value: "DEPOT", label: "Depot" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Under Maintenance" },
  { value: "CLOSED", label: "Closed" },
];

const cityOptions = [
  { value: "Istanbul", label: "Istanbul" },
  { value: "Ankara", label: "Ankara" },
  { value: "Izmir", label: "Izmir" },
  { value: "Bursa", label: "Bursa" },
  { value: "Antalya", label: "Antalya" },
  { value: "Adana", label: "Adana" },
];

const countryOptions = [
  { value: "Turkey", label: "Turkey" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE": return "success";
    case "INACTIVE": return "default";
    case "MAINTENANCE": return "warning";
    case "CLOSED": return "error";
    default: return "default";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "WAREHOUSE": return "primary";
    case "SERVICE_CENTER": return "info";
    case "OFFICE": return "secondary";
    case "RETAIL": return "success";
    case "DEPOT": return "warning";
    default: return "default";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "WAREHOUSE": return <WarehouseIcon />;
    case "SERVICE_CENTER": return <LocationIcon />;
    case "OFFICE": return <BusinessIcon />;
    default: return <LocationIcon />;
  }
};

const columns: TableColumn[] = [
  { 
    id: "name", 
    label: "Location", 
    width: 200, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          {getTypeIcon(row.type)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.locationCode}
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
    id: "city", 
    label: "City", 
    width: 120, 
    sortable: true, 
    filterable: true,
  },
  { 
    id: "contactPerson", 
    label: "Contact Person", 
    width: 150, 
    sortable: true, 
    filterable: true,
  },
  { 
    id: "contactPhone", 
    label: "Phone", 
    width: 130, 
    sortable: true, 
    filterable: true,
  },
  { 
    id: "capacity", 
    label: "Capacity", 
    width: 100,
    align: "center",
    sortable: true, 
    filterable: true,
  },
  { 
    id: "currentStock", 
    label: "Current Stock", 
    width: 120,
    align: "center",
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body2" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.capacity ? `${Math.round((value / row.capacity) * 100)}% used` : 'N/A'}
        </Typography>
      </Box>
    ),
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
];

const formFields: FormField[] = [
  { 
    id: "locationCode", 
    label: "Location Code", 
    type: "text", 
    required: true,
    placeholder: "e.g., LOC-001",
    layout: { row: 0, column: 0 },
    validation: (value) => {
      if (value && !/^LOC-\d{3}$/.test(value)) {
        return "Location code format should be LOC-XXX";
      }
      return null;
    }
  },
  { 
    id: "name", 
    label: "Location Name", 
    type: "text", 
    required: true,
    placeholder: "e.g., Istanbul Warehouse",
    layout: { row: 0, column: 1 },
  },
  { 
    id: "type", 
    label: "Location Type", 
    type: "select", 
    required: true, 
    options: typeOptions,
    layout: { row: 0, column: 2 },
  },
  { 
    id: "address", 
    label: "Address", 
    type: "text", 
    required: true,
    placeholder: "Full street address",
    layout: { row: 1, column: 0 },
  },
  { 
    id: "city", 
    label: "City", 
    type: "autocomplete", 
    required: true, 
    options: cityOptions,
    searchable: true,
    layout: { row: 2, column: 0 },
  },
  { 
    id: "postalCode", 
    label: "Postal Code", 
    type: "text", 
    required: true,
    placeholder: "e.g., 34490",
    layout: { row: 2, column: 1 },
  },
  { 
    id: "country", 
    label: "Country", 
    type: "autocomplete", 
    required: true, 
    options: countryOptions,
    searchable: true,
    layout: { row: 2, column: 2 },
  },
  { 
    id: "contactPerson", 
    label: "Contact Person", 
    type: "text", 
    required: true,
    placeholder: "Name of responsible person",
    layout: { row: 3, column: 0 },
  },
  { 
    id: "contactPhone", 
    label: "Contact Phone", 
    type: "text", 
    required: true,
    placeholder: "+90 XXX XXX XXXX",
    layout: { row: 3, column: 1 },
  },
  { 
    id: "contactEmail", 
    label: "Contact Email", 
    type: "email", 
    required: true,
    placeholder: "contact@example.com",
    layout: { row: 3, column: 2 },
  },
  { 
    id: "capacity", 
    label: "Capacity", 
    type: "number", 
    required: false,
    placeholder: "Maximum storage capacity",
    helperText: "Number of items this location can hold",
    layout: { row: 4, column: 0 },
  },
  { 
    id: "status", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: statusOptions,
    layout: { row: 4, column: 1 },
  },
  { 
    id: "notes", 
    label: "Notes", 
    type: "text", 
    required: false,
    placeholder: "Additional notes about this location",
    layout: { row: 5, column: 0 },
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState(initialLocations);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  const handleAdd = (data: any) => {
    const newLocation = {
      ...data,
      id: Math.max(...locations.map(l => l.id)) + 1,
      currentStock: 0, // New locations start with 0 stock
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLocations([...locations, newLocation]);
  };

  const handleEdit = (id: string | number, data: any) => {
    setLocations(locations.map(location => 
      location.id === Number(id) 
        ? { 
            ...location, 
            ...data, 
            updatedAt: new Date().toISOString(),
          }
        : location
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const location = locations.find(l => l.id === Number(id));
    if (location) {
      setDeleteDialog({ open: true, id: Number(id), name: location.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setLocations(locations.filter(location => location.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setLocations(locations.filter(l => !numIds.includes(l.id)));
  };

  const handleBulkStatusChange = (ids: (string | number)[], newStatus: string) => {
    const numIds = ids.map(id => Number(id));
    setLocations(locations.map(l => 
      numIds.includes(l.id) ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected locations? This action cannot be undone.",
    },
    {
      id: "mark-active",
      label: "Mark as Active",
      action: (ids) => handleBulkStatusChange(ids, "ACTIVE"),
    },
    {
      id: "mark-inactive",
      label: "Mark as Inactive",
      action: (ids) => handleBulkStatusChange(ids, "INACTIVE"),
    },
    {
      id: "mark-maintenance",
      label: "Mark as Under Maintenance",
      action: (ids) => handleBulkStatusChange(ids, "MAINTENANCE"),
      confirmMessage: "Mark selected locations as under maintenance?",
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = locations.map(location => 
      columns.map(col => {
        const value = location[col.id as keyof typeof location];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = locations.reduce((acc, location) => {
      acc[location.status] = (acc[location.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const getTotalCapacity = () => {
    return locations.reduce((sum, location) => sum + (location.capacity || 0), 0);
  };

  const getTotalStock = () => {
    return locations.reduce((sum, location) => sum + (location.currentStock || 0), 0);
  };

  const statusCounts = getStatusCounts();
  const totalCapacity = getTotalCapacity();
  const totalStock = getTotalStock();

  return (
    <Layout title="Locations">
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Locations
                </Typography>
                <Typography variant="h4" color="primary">
                  {locations.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Locations
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statusCounts.ACTIVE || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Capacity
                </Typography>
                <Typography variant="h4" color="info.main">
                  {totalCapacity.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Stock
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {totalStock.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalCapacity > 0 ? `${Math.round((totalStock / totalCapacity) * 100)}% utilized` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Locations DataTable */}
        <DataTable
          title="Locations"
          columns={columns}
          data={locations}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onExport={handleExport}
          addButtonText="Add Location"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Location"
          message={`Are you sure you want to delete location "${deleteDialog.name}"? This action cannot be undone and may affect inventory records.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 