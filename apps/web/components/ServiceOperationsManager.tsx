"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { DataTable, TableColumn, FormField, BulkAction } from "./DataTable";
import { ConfirmDialog } from "./ConfirmDialog";
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
  Add as AddIcon,
} from "@mui/icons-material";

// Service Operations helper functions
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

const formatDuration = (minutes?: number) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Sample options (would come from props or API in real implementation)
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
  { value: "1", label: "John Doe" },
  { value: "2", label: "Jane Smith" },
  { value: "3", label: "Mike Johnson" },
  { value: "4", label: "Sarah Wilson" },
];

interface ServiceOperationsManagerProps {
  issue: any;
  operations: any[];
  onOperationsChange: (operations: any[]) => void;
  tabValue: number;
}

export const ServiceOperationsManager = ({
  issue,
  operations,
  onOperationsChange,
  tabValue,
}: ServiceOperationsManagerProps) => {
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    operation: any | null;
  }>({ open: false, operation: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    operationId: number | null;
    operationType: string;
  }>({ open: false, operationId: null, operationType: "" });

  // Filter operations based on tab
  const filteredOperations = tabValue === 0 
    ? operations 
    : operations.filter(op => op.operationType === ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'][tabValue - 1]);

  // Create product options from issue products
  const productOptions = issue.products.map((product: any) => ({
    value: product.id,
    label: `${product.name} (${product.serial})`,
  }));

  const columns: TableColumn[] = [
    {
      id: "operationType",
      label: "Operation Type",
      width: 160,
      render: (value) => (
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
            {value?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2">
              {value || 'Unassigned'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.performedByRole || 'TSP'}
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
          onClick={() => setDetailsDialog({ open: true, operation: { description: value } })}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "operationDate",
      label: "Date",
      width: 120,
      // format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
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

  const formFields: FormField[] = [
    {
      id: "productId",
      label: "Product",
      type: "autocomplete",
      required: true,
      options: productOptions,
      // searchable: true,
      layout: { row: 0, column: 0 },
    },
    {
      id: "operationType",
      label: "Operation Type",
      type: "select",
      required: true,
      options: operationTypeOptions,
      layout: { row: 0, column: 1 },
    },
    {
      id: "performedById",
      label: "Performed By",
      type: "autocomplete",
      required: true,
      options: tspOptions,
      // searchable: true,
      layout: { row: 0, column: 2 },
    },
    {
      id: "operationDate",
      label: "Operation Date",
      type: "datetime-local",
      required: true,
      layout: { row: 1, column: 0 },
    },
    {
      id: "duration",
      label: "Duration (minutes)",
      type: "number",
      required: false,
      // helperText: "Duration in minutes",
      layout: { row: 1, column: 1 },
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      required: true,
      options: statusOptions,
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
  ];

  const handleAdd = (data: any) => {
    const product = productOptions.find((p: any) => p.value === parseInt(data.productId));
    const performer = tspOptions.find(t => t.value === data.performedById);

    const newOperation = {
      ...data,
      id: Math.max(0, ...operations.map(o => o.id || 0)) + 1,
      issueId: issue.id,
      productId: parseInt(data.productId),
      productName: product?.label.split(' (')[0] || "Unknown",
      productSerial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
      performedById: parseInt(data.performedById),
      performedByName: performer?.label || "Unknown",
      performedByRole: "TSP",
      duration: parseInt(data.duration) || 0,
      partsUsed: [],
      testResults: {},
      createdAt: new Date().toISOString(),
    };

    onOperationsChange([...operations, newOperation]);
  };

  const handleEdit = (id: string | number, data: any) => {
    const product = productOptions.find((p: any) => p.value === parseInt(data.productId));
    const performer = tspOptions.find(t => t.value === data.performedById);

    const updatedOperations = operations.map(operation =>
      operation.id === Number(id)
        ? {
            ...operation,
            ...data,
            productId: parseInt(data.productId),
            productName: product?.label.split(' (')[0] || operation.productName,
            productSerial: product?.label.match(/\((.*)\)$/)?.[1] || operation.productSerial,
            performedById: parseInt(data.performedById),
            performedByName: performer?.label || operation.performedByName,
            duration: parseInt(data.duration) || operation.duration,
          }
        : operation
    );

    onOperationsChange(updatedOperations);
  };

  const handleDeleteRequest = (id: string | number) => {
    const operation = operations.find(o => o.id === Number(id));
    if (operation) {
      setDeleteDialog({
        open: true,
        operationId: Number(id),
        operationType: `${operation.operationType} operation`,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.operationId) {
      const updatedOperations = operations.filter(op => op.id !== deleteDialog.operationId);
      onOperationsChange(updatedOperations);
    }
    setDeleteDialog({ open: false, operationId: null, operationType: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, operationId: null, operationType: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    const updatedOperations = operations.filter(o => !numIds.includes(o.id));
    onOperationsChange(updatedOperations);
  };

  const handleViewDetails = (operation: any) => {
    setDetailsDialog({ open: true, operation });
  };

  const bulkActions: BulkAction[] = [
    {
      label: "Delete Selected",
      action: handleBulkDelete,
    },
  ];

  // Enhanced columns with click handlers
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

  return (
    <Box>
      <DataTable
        title="Service Operations"
        columns={enhancedColumns}
        queryResult={{ data: filteredOperations, isLoading: false, error: null }}
        formFields={formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        // onBulkDelete={handleBulkDelete}
        // searchable={true}
        // selectable={true}
        addButtonText="Add Operation"
        bulkActions={bulkActions}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Service Operation"
        message={`Are you sure you want to delete the ${deleteDialog.operationType}? This action cannot be undone.`}
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
        <DialogTitle>Service Operation Details</DialogTitle>
        <DialogContent>
          {detailsDialog.operation && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Basic Info */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Operation Type</Typography>
                      <Chip
                        icon={getOperationTypeIcon(detailsDialog.operation.operationType)}
                        label={detailsDialog.operation.operationType?.replace('_', ' ')}
                        color={getOperationTypeColor(detailsDialog.operation.operationType)}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Product</Typography>
                      <Typography variant="body1">
                        {detailsDialog.operation.productName} ({detailsDialog.operation.productSerial})
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Performed By</Typography>
                      <Typography variant="body1">{detailsDialog.operation.performedByName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {detailsDialog.operation.operationDate ? 
                          new Date(detailsDialog.operation.operationDate).toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1">
                        {formatDuration(detailsDialog.operation.duration)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Description and Findings */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Description & Findings</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                      <Typography variant="body1">{detailsDialog.operation.description || 'N/A'}</Typography>
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

              {/* Parts Used and Test Results */}
              {(detailsDialog.operation.partsUsed?.length > 0 || 
                (detailsDialog.operation.testResults && Object.keys(detailsDialog.operation.testResults).length > 0)) && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Additional Information</Typography>
                    
                    {detailsDialog.operation.partsUsed?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Parts Used</Typography>
                        {detailsDialog.operation.partsUsed.map((part: any, index: number) => (
                          <Typography key={index} variant="body2">
                            • {part.partName} (Qty: {part.quantity})
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {detailsDialog.operation.testResults && Object.keys(detailsDialog.operation.testResults).length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Test Results</Typography>
                        <Grid container spacing={2}>
                          {Object.entries(detailsDialog.operation.testResults).map(([key, value]) => (
                            <Grid item xs={6} key={key}>
                              <Typography variant="body2" color="text.secondary">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Typography>
                              <Typography variant="body1">{String(value)}</Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
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
  );
}; 
