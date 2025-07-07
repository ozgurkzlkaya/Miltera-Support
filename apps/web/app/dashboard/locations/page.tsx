"use client";

import {
  Box,
  Chip,
  Avatar,
  Typography,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { Layout } from "../../../components/Layout";
import {
  DataTable,
  TableColumn,
  FormField,
  BulkAction,
} from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";
import {
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Warehouse as WarehouseIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import {
  useCreateLocation,
  useDeleteLocation,
  useUpdateLocation,
  useLocations,
} from "../../../features/shipments/location.service";

const columns: TableColumn[] = [
  {
    id: "name",
    label: "Location",
    width: 200,
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {value}
          </Typography>
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
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    id: "address",
    label: "Address",
    width: 200,
    sortable: true,
    filterable: true,
    render: (value) => <Typography variant="body2">{value}</Typography>,
  },
];

const formFields: FormField[] = [
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
    options: [
      { label: "Warehouse", value: "WAREHOUSE" },
      { label: "Shelf", value: "SHELF" },
      { label: "Service Area", value: "SERVICE_AREA" },
    ],
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
    id: "notes",
    label: "Notes",
    type: "text",
    required: false,
    placeholder: "Additional notes about this location",
    layout: { row: 5, column: 0 },
  },
];

export default function LocationsPage() {
  const locationsQueryResult = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Stats */}
      {/* <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
        </Box> */}

      {/* Locations DataTable */}
      <DataTable
        title="Locations"
        columns={columns}
        queryResult={locationsQueryResult}
        formFields={formFields}
        onAdd={(data) => createMutation.mutate({ payload: data })}
        onEdit={(id, data) => updateMutation.mutate({ id, payload: data })}
        onDelete={(id) => deleteMutation.mutate({ id })}
        addButtonText="Add Location"
        selectable={true}
      />
    </Box>
  );
}
