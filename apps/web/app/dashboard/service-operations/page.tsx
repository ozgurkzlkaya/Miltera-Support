"use client";

import { Box, Chip, Avatar, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent, Stack, Tab, Tabs } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";
import { 
  Delete as DeleteIcon,
  Build as RepairIcon,
  Science as TestIcon,
  CheckCircle as QualityIcon,
  Assessment as InitialIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Inventory as PartsIcon,
} from "@mui/icons-material";

// Sample service operations data
const initialServiceOperations = [
  {
    id: 1,
    issueId: 1,
    issueNumber: "ARZ-2024-001",
    productId: 1,
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    customerName: "ABC Enerji",
    operationType: "INITIAL_TEST",
    performedById: 1,
    performedByName: "John Doe",
    performedByRole: "TSP",
    description: "Initial diagnostic test performed on gateway device",
    findings: "Network configuration issues detected, firewall blocking specific ports",
    actionsTaken: "Reconfigured network settings, opened required ports 8080, 8443",
    partsUsed: [
      { partId: "P001", partName: "Network Cable CAT6", quantity: 2 },
      { partId: "P002", partName: "Ethernet Port", quantity: 1 }
    ],
    testResults: {
      networkLatency: "12ms",
      throughput: "950 Mbps",
      connectionStability: "98%",
      errorRate: "0.01%"
    },
    operationDate: "2024-06-02T10:30:00Z",
    duration: 120,
    status: "COMPLETED",
    createdAt: "2024-06-02T10:30:00Z",
  },
  {
    id: 2,
    issueId: 1,
    issueNumber: "ARZ-2024-001",
    productId: 1,
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    customerName: "ABC Enerji",
    operationType: "REPAIR",
    performedById: 1,
    performedByName: "John Doe",
    performedByRole: "TSP",
    description: "Firmware update and hardware component replacement",
    findings: "Outdated firmware version 2.1.0, faulty ethernet port identified",
    actionsTaken: "Updated firmware to version 2.3.1, replaced faulty ethernet port",
    partsUsed: [
      { partId: "P003", partName: "Ethernet Port Module", quantity: 1 },
      { partId: "P004", partName: "Thermal Paste", quantity: 1 }
    ],
    testResults: {
      firmwareVersion: "2.3.1",
      portFunctionality: "100%",
      signalStrength: "-45dBm",
      temperature: "42°C"
    },
    operationDate: "2024-06-03T14:20:00Z",
    duration: 180,
    status: "COMPLETED",
    createdAt: "2024-06-03T14:20:00Z",
  },
];

// Helper functions
const getOperationTypeColor = (type: string) => {
  switch (type) {
    case "INITIAL_TEST": return "info";
    case "REPAIR": return "warning";
    case "FINAL_TEST": return "success";
    case "QUALITY_CHECK": return "secondary";
    default: return "default";
  }
};

const getOperationTypeIcon = (type: string) => {
  switch (type) {
    case "INITIAL_TEST": return <InitialIcon />;
    case "REPAIR": return <RepairIcon />;
    case "FINAL_TEST": return <TestIcon />;
    case "QUALITY_CHECK": return <QualityIcon />;
    default: return <AssignmentIcon />;
  }
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const columns: TableColumn[] = [
  { 
    id: "issueNumber", 
    label: "Issue Number", 
    width: 140,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    ),
  },
  { 
    id: "operationType", 
    label: "Operation Type", 
    width: 160,
    render: (value, row) => (
      <Chip
        icon={getOperationTypeIcon(value)}
        label={value.replace('_', ' ')}
        color={getOperationTypeColor(value)}
        size="small"
        variant="outlined"
      />
    ),
  },
  { 
    id: "productName", 
    label: "Product", 
    width: 200,
    render: (value, row) => (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          S/N: {row.productSerial}
        </Typography>
      </Box>
    ),
  },
  { 
    id: "performedByName", 
    label: "Performed By", 
    width: 150,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
          {value.split(' ').map((n: string) => n[0]).join('')}
        </Avatar>
        <Box>
          <Typography variant="body2">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.performedByRole}
          </Typography>
        </Box>
      </Box>
    ),
  },
  { 
    id: "description", 
    label: "Description", 
    width: 250,
    render: (value) => (
      <Typography variant="body2" sx={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {value}
      </Typography>
    ),
  },
  { 
    id: "operationDate", 
    label: "Date", 
    width: 120,
    format: (value) => new Date(value).toLocaleDateString(),
  },
  { 
    id: "duration", 
    label: "Duration", 
    width: 100,
    render: (value) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2">
          {formatDuration(value)}
        </Typography>
      </Box>
    ),
  },
];

// Form options
const operationTypeOptions = [
  { value: "INITIAL_TEST", label: "Initial Test" },
  { value: "REPAIR", label: "Repair" },
  { value: "FINAL_TEST", label: "Final Test" },
  { value: "QUALITY_CHECK", label: "Quality Check" },
];

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const tspOptions = [
  { value: 1, label: "John Doe" },
  { value: 2, label: "Jane Smith" },
  { value: 3, label: "Mike Johnson" },
  { value: 4, label: "Sarah Wilson" },
];

const issueOptions = [
  { value: 1, label: "ARZ-2024-001 - Gateway Connection Timeout" },
  { value: 2, label: "ARZ-2024-002 - Energy Analyzer Calibration" },
  { value: 3, label: "ARZ-2024-003 - VPN Router Firmware Update" },
];

const productOptions = [
  { value: 1, label: "Gateway-2000-001 (SN123456)" },
  { value: 2, label: "EA-100-005 (SN654321)" },
  { value: 3, label: "VR-500-012 (SN987654)" },
];

export default function ServiceOperationsPage() {
  const [serviceOperations, setServiceOperations] = useState(initialServiceOperations);
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; operation: any }>({ open: false, operation: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; operationType: string }>({ open: false, id: null, operationType: "" });
  const [tabValue, setTabValue] = useState(0);

  // Form fields for adding/editing operations
  const formFields: FormField[] = [
    { 
      id: "issueId", 
      label: "Issue", 
      type: "autocomplete", 
      required: true, 
      options: issueOptions,
      searchable: true,
      layout: { row: 0, column: 0 },
    },
    { 
      id: "productId", 
      label: "Product", 
      type: "autocomplete", 
      required: true, 
      options: productOptions,
      searchable: true,
      layout: { row: 0, column: 1 },
    },
    { 
      id: "operationType", 
      label: "Operation Type", 
      type: "select", 
      required: true, 
      options: operationTypeOptions,
      layout: { row: 0, column: 2 },
    },
    { 
      id: "performedById", 
      label: "Performed By", 
      type: "autocomplete", 
      required: true, 
      options: tspOptions,
      searchable: true,
      layout: { row: 1, column: 0 },
    },
    { 
      id: "operationDate", 
      label: "Operation Date", 
      type: "datetime-local", 
      required: true,
      layout: { row: 1, column: 1 },
    },
    { 
      id: "duration", 
      label: "Duration (minutes)", 
      type: "number", 
      required: false,
      helperText: "Duration in minutes",
      layout: { row: 1, column: 2 },
    },
    { 
      id: "description", 
      label: "Description", 
      type: "text", 
      required: true,
      placeholder: "Detailed description of the operation performed",
      layout: { row: 2, column: 0 },
    },
    { 
      id: "findings", 
      label: "Findings", 
      type: "text", 
      required: false,
      placeholder: "Key findings and observations",
      layout: { row: 3, column: 0 },
    },
    { 
      id: "actionsTaken", 
      label: "Actions Taken", 
      type: "text", 
      required: false,
      placeholder: "Specific actions and solutions implemented",
      layout: { row: 4, column: 0 },
    },
    { 
      id: "status", 
      label: "Status", 
      type: "select", 
      required: true, 
      options: statusOptions,
      layout: { row: 5, column: 0 },
    },
  ];

  const handleAdd = (data: any) => {
    // Find related names for display
    const issue = issueOptions.find(i => i.value === parseInt(data.issueId));
    const product = productOptions.find(p => p.value === parseInt(data.productId));
    const performer = tspOptions.find(t => t.value === parseInt(data.performedById));

    const newOperation = {
      ...data,
      id: Math.max(...serviceOperations.map(o => o.id)) + 1,
      issueId: parseInt(data.issueId),
      issueNumber: issue?.label.split(' - ')[0] || "Unknown",
      productId: parseInt(data.productId),
      productName: product?.label.split(' (')[0] || "Unknown",
      productSerial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
      performedById: parseInt(data.performedById),
      performedByName: performer?.label || "Unknown",
      performedByRole: "TSP", // Default role
      customerName: "Unknown", // Would be fetched from issue/product data
      partsUsed: [],
      testResults: {},
      duration: parseInt(data.duration) || 0,
      createdAt: new Date().toISOString(),
    };

    setServiceOperations([...serviceOperations, newOperation]);
  };

  const handleEdit = (id: string | number, data: any) => {
    // Find related names for display
    const issue = issueOptions.find(i => i.value === parseInt(data.issueId));
    const product = productOptions.find(p => p.value === parseInt(data.productId));
    const performer = tspOptions.find(t => t.value === parseInt(data.performedById));

    setServiceOperations(serviceOperations.map(operation => 
      operation.id === Number(id) 
        ? { 
            ...operation, 
            ...data,
            issueId: parseInt(data.issueId),
            issueNumber: issue?.label.split(' - ')[0] || operation.issueNumber,
            productId: parseInt(data.productId),
            productName: product?.label.split(' (')[0] || operation.productName,
            productSerial: product?.label.match(/\((.*)\)$/)?.[1] || operation.productSerial,
            performedById: parseInt(data.performedById),
            performedByName: performer?.label || operation.performedByName,
            duration: parseInt(data.duration) || operation.duration,
          }
        : operation
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const operation = serviceOperations.find(o => o.id === Number(id));
    if (operation) {
      setDeleteDialog({ 
        open: true, 
        id: Number(id), 
        operationType: `${operation.operationType} for ${operation.issueNumber}`
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setServiceOperations(serviceOperations.filter(operation => operation.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, operationType: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, operationType: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setServiceOperations(serviceOperations.filter(o => !numIds.includes(o.id)));
  };

  const handleViewDetails = (operation: any) => {
    setDetailsDialog({ open: true, operation });
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = serviceOperations.map(operation => 
      columns.map(col => {
        const value = operation[col.id as keyof typeof operation];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-operations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected service operations? This action cannot be undone.",
    },
  ];

  // Add click handler to view details
  const enhancedColumns = columns.map(col => {
    if (col.id === 'description') {
      return {
        ...col,
        render: (value: string, row: any) => (
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => handleViewDetails(row)}
          >
            {value}
          </Typography>
        ),
      };
    }
    return col;
  });

  // Filter operations based on selected tab
  const filteredOperations = tabValue === 0 
    ? serviceOperations 
    : serviceOperations.filter(op => op.operationType === ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'][tabValue - 1]);

  return (
    <Layout title="Service Operations">
      <Box sx={{ width: "100%", height: "100%" }}>
        {/* Header with tabs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Service Operations
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Add, manage, and track technical service operations performed on devices during repair
          </Typography>
          
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mt: 2 }}>
            <Tab label="All Operations" />
            <Tab label="Initial Tests" />
            <Tab label="Repairs" />
            <Tab label="Final Tests" />
            <Tab label="Quality Checks" />
          </Tabs>
        </Box>

        <DataTable
          title="Service Operations"
          columns={enhancedColumns}
          data={filteredOperations}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          searchable={true}
          selectable={true}
          addButtonText="Add Operation"
          bulkActions={bulkActions}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Service Operation"
          message={`Are you sure you want to delete the service operation "${deleteDialog.operationType}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Details Dialog */}
        <Dialog 
          open={detailsDialog.open} 
          onClose={() => setDetailsDialog({ open: false, operation: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Service Operation Details
          </DialogTitle>
          <DialogContent>
            {detailsDialog.operation && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Basic Info */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Issue</Typography>
                        <Typography variant="body1">{detailsDialog.operation.issueNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Product</Typography>
                        <Typography variant="body1">
                          {detailsDialog.operation.productName} ({detailsDialog.operation.productSerial})
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Operation Type</Typography>
                        <Chip
                          icon={getOperationTypeIcon(detailsDialog.operation.operationType)}
                          label={detailsDialog.operation.operationType.replace('_', ' ')}
                          color={getOperationTypeColor(detailsDialog.operation.operationType)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Performed By</Typography>
                        <Typography variant="body1">{detailsDialog.operation.performedByName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1">
                          {new Date(detailsDialog.operation.operationDate).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">
                          {formatDuration(detailsDialog.operation.duration)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Description and Findings */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Description & Findings</Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                        <Typography variant="body1">{detailsDialog.operation.description}</Typography>
                      </Box>
                      {detailsDialog.operation.findings && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Findings</Typography>
                          <Typography variant="body1">{detailsDialog.operation.findings}</Typography>
                        </Box>
                      )}
                      {detailsDialog.operation.actionsTaken && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Actions Taken</Typography>
                          <Typography variant="body1">{detailsDialog.operation.actionsTaken}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Parts Used */}
                {detailsDialog.operation.partsUsed && detailsDialog.operation.partsUsed.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PartsIcon />
                        Parts Used
                      </Typography>
                      <Stack spacing={1}>
                        {detailsDialog.operation.partsUsed.map((part: any, index: number) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{part.partName}</Typography>
                            <Chip label={`Qty: ${part.quantity}`} size="small" />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Test Results */}
                {detailsDialog.operation.testResults && Object.keys(detailsDialog.operation.testResults).length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TestIcon />
                        Test Results
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {Object.entries(detailsDialog.operation.testResults).map(([key, value]) => (
                          <Box key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Typography>
                            <Typography variant="body1">{String(value)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog({ open: false, operation: null })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 