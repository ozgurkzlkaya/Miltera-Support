"use client";

import { Box, Chip, Avatar, Typography, Card, CardContent, Stack } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn, FormField, BulkAction } from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useState } from "react";
import { 
  Delete as DeleteIcon,
  Assignment as IssueIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Build as RepairIcon,
  Schedule as ScheduleIcon,
  Engineering as ServiceIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

const initialIssues = [
  { 
    id: 1, 
    issueNumber: "ARZ-2024-001", 
    productId: 1,
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    customerId: 1,
    customerName: "ABC Enerji",
    customerCompany: "ABC Enerji Ltd.",
    issueTypeId: 1,
    issueTypeName: "Connection Issues",
    title: "Gateway Connection Timeout",
    description: "Gateway device experiencing frequent connection timeouts with remote servers",
    status: "IN_PROGRESS", 
    priority: "HIGH",
    warrantyStatus: "IN_WARRANTY",
    assignedTspId: 1,
    assignedTspName: "John Doe",
    estimatedResolutionDate: "2024-06-15",
    actualResolutionDate: null,
    location: "İstanbul Fabrika - Ana Bina",
    urgencyLevel: "Normal",
    customerImpact: "Medium",
    rootCause: null,
    resolutionSummary: null,
    customerSatisfaction: null,
    followUpRequired: true,
    createdAt: "2024-06-01T10:30:00Z",
    updatedAt: "2024-06-03T14:20:00Z",
    createdBy: "Customer Portal",
    lastUpdatedBy: "John Doe",
    attachments: ["gateway_logs.txt", "network_config.json"],
    serviceOperations: [
      { 
        id: 1, 
        operationType: "INITIAL_TEST", 
        performedBy: "John Doe", 
        description: "Initial diagnostic test completed",
        findings: "Network configuration issues detected",
        date: "2024-06-02"
      }
    ]
  },
  { 
    id: 2, 
    issueNumber: "ARZ-2024-002", 
    productId: 2,
    productName: "EA-100-005",
    productSerial: "SN654321",
    customerId: 2,
    customerName: "Jane Smith",
    customerCompany: "XYZ Elektrik A.Ş.",
    issueTypeId: 2,
    issueTypeName: "Calibration",
    title: "Energy Analyzer Calibration Required",
    description: "Device showing inconsistent readings, requires professional calibration",
    status: "WAITING_PARTS", 
    priority: "MEDIUM",
    warrantyStatus: "IN_WARRANTY",
    assignedTspId: 2,
    assignedTspName: "Jane Smith",
    estimatedResolutionDate: "2024-06-12",
    actualResolutionDate: null,
    location: "Ankara Sahası",
    urgencyLevel: "High",
    customerImpact: "High",
    rootCause: "Sensor drift due to environmental conditions",
    resolutionSummary: null,
    customerSatisfaction: null,
    followUpRequired: false,
    createdAt: "2024-06-01T14:20:00Z",
    updatedAt: "2024-06-04T09:15:00Z",
    createdBy: "Customer Portal",
    lastUpdatedBy: "Jane Smith",
    attachments: ["calibration_report.pdf"],
    serviceOperations: [
      { 
        id: 2, 
        operationType: "REPAIR", 
        performedBy: "Jane Smith", 
        description: "Calibration sensors replaced",
        findings: "Old sensors were beyond tolerance",
        date: "2024-06-03"
      }
    ]
  },
  { 
    id: 3, 
    issueNumber: "ARZ-2024-003", 
    productId: 3,
    productName: "VR-500-012",
    productSerial: "SN987654",
    customerId: 3,
    customerName: "Mike Johnson",
    customerCompany: "DEF Teknoloji",
    issueTypeId: 3,
    issueTypeName: "Software Update",
    title: "VPN Router Firmware Update",
    description: "Router requires firmware update to fix security vulnerabilities",
    status: "REPAIRED", 
    priority: "CRITICAL",
    warrantyStatus: "OUT_OF_WARRANTY",
    assignedTspId: 3,
    assignedTspName: "Mike Johnson",
    estimatedResolutionDate: "2024-06-08",
    actualResolutionDate: "2024-06-07",
    location: "İzmir Depo",
    urgencyLevel: "Critical",
    customerImpact: "Low",
    rootCause: "Outdated firmware version",
    resolutionSummary: "Firmware updated to latest version, security patches applied",
    customerSatisfaction: 5,
    followUpRequired: false,
    createdAt: "2024-06-01T09:15:00Z",
    updatedAt: "2024-06-07T16:45:00Z",
    createdBy: "Customer Portal",
    lastUpdatedBy: "Mike Johnson",
    attachments: ["firmware_update_log.txt"],
    serviceOperations: [
      { 
        id: 3, 
        operationType: "FINAL_TEST", 
        performedBy: "Mike Johnson", 
        description: "Final testing completed successfully",
        findings: "All systems operational",
        date: "2024-06-07"
      }
    ]
  },
];

// Options for dropdowns
const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_PARTS", label: "Waiting Parts" },
  { value: "REPAIRED", label: "Repaired" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const warrantyStatusOptions = [
  { value: "IN_WARRANTY", label: "In Warranty" },
  { value: "OUT_OF_WARRANTY", label: "Out of Warranty" },
  { value: "PENDING", label: "Pending" },
];

const urgencyLevelOptions = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const customerImpactOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const issueTypeOptions = [
  { value: 1, label: "Connection Issues" },
  { value: 2, label: "Calibration" },
  { value: 3, label: "Software Update" },
  { value: 4, label: "Hardware Malfunction" },
  { value: 5, label: "Performance Issues" },
];

const productOptions = [
  { value: 1, label: "Gateway-2000-001 (SN123456)" },
  { value: 2, label: "EA-100-005 (SN654321)" },
  { value: 3, label: "VR-500-012 (SN987654)" },
  { value: 4, label: "SM-300-003 (SN456789)" },
];

const customerOptions = [
  { value: 1, label: "ABC Enerji Ltd." },
  { value: 2, label: "XYZ Elektrik A.Ş." },
  { value: 3, label: "DEF Teknoloji" },
  { value: 4, label: "GHI Enerji" },
];

const tspOptions = [
  { value: 1, label: "John Doe" },
  { value: 2, label: "Jane Smith" },
  { value: 3, label: "Mike Johnson" },
  { value: 4, label: "Sarah Wilson" },
];

// Helper functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN": return "default";
    case "IN_PROGRESS": return "info";
    case "WAITING_PARTS": return "warning";
    case "REPAIRED": return "success";
    case "CLOSED": return "success";
    case "CANCELLED": return "error";
    default: return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW": return "default";
    case "MEDIUM": return "info";
    case "HIGH": return "warning";
    case "CRITICAL": return "error";
    default: return "default";
  }
};

const getWarrantyColor = (warrantyStatus: string) => {
  switch (warrantyStatus) {
    case "IN_WARRANTY": return "success";
    case "OUT_OF_WARRANTY": return "error";
    case "PENDING": return "warning";
    default: return "default";
  }
};

const columns: TableColumn[] = [
  { 
    id: "issueNumber", 
    label: "Issue Number", 
    width: 150, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          <IssueIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.title}
          </Typography>
        </Box>
      </Box>
    ),
  },
  { 
    id: "productName", 
    label: "Product", 
    width: 150, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box>
        <Typography variant="body2" fontWeight="bold">{value}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.productSerial}
        </Typography>
      </Box>
    ),
  },
  { 
    id: "customerCompany", 
    label: "Customer", 
    width: 140, 
    sortable: true, 
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon fontSize="small" color="action" />
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customerName}
          </Typography>
        </Box>
      </Box>
    ),
  },
  { 
    id: "assignedTspName", 
    label: "Assigned TSP", 
    width: 120, 
    sortable: true, 
    filterable: true,
    render: (value) => value ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon fontSize="small" color="action" />
        {value}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">Unassigned</Typography>
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
        label={value ? value.replace("_", " ") : "Unknown"}
        color={getStatusColor(value || "") as any}
        size="small"
      />
    ),
  },
  {
    id: "priority",
    label: "Priority",
    width: 100,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value}
        color={getPriorityColor(value || "") as any}
        size="small"
      />
    ),
  },
  {
    id: "warrantyStatus",
    label: "Warranty",
    width: 110,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Chip
        label={value ? value.replace("_", " ") : "Unknown"}
        color={getWarrantyColor(value || "") as any}
        size="small"
        variant="outlined"
      />
    ),
  },

  {
    id: "serviceOperations",
    label: "Operations",
    width: 120,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ServiceIcon fontSize="small" color="action" />
        <Typography variant="body2">
          {value?.length || 0} ops
        </Typography>
        {value?.length > 0 && (
          <ViewIcon 
            fontSize="small" 
            sx={{ cursor: 'pointer', color: 'primary.main' }} 
            onClick={() => {
              // Navigate to service operations filtered by this issue
              window.open(`/dashboard/service-operations?issue=${row.issueNumber}`, '_blank');
            }}
          />
        )}
      </Box>
    ),
  },
  { 
    id: "location", 
    label: "Location", 
    width: 140, 
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
    id: "issueNumber", 
    label: "Issue Number", 
    type: "text", 
    required: false,
    showInCreateMode: false, // Hide in create mode since it's auto-generated
    showInEditMode: true, // Show in edit mode
    disabled: true, // Always disabled/read-only
    layout: { row: 0, column: 0 }, // First row, first column
  },
  { 
    id: "status", 
    label: "Status", 
    type: "select", 
    required: true, 
    options: statusOptions,
    layout: { row: 0, column: 1 }, // First row, second column
  },
  { 
    id: "priority", 
    label: "Priority", 
    type: "select", 
    required: true, 
    options: priorityOptions,
    layout: { row: 0, column: 2 }, // First row, third column
  },
  { 
    id: "urgencyLevel", 
    label: "Urgency Level", 
    type: "select", 
    required: true, 
    options: urgencyLevelOptions,
    layout: { row: 2, column: 0 }, // Third row, first column
  },
  { 
    id: "productId", 
    label: "Product", 
    type: "autocomplete", 
    required: true, 
    options: productOptions,
    searchable: true,
    layout: { row: 1, column: 0 }, // Second row, first column
  },
  { 
    id: "customerId", 
    label: "Customer", 
    type: "autocomplete", 
    required: true, 
    options: customerOptions,
    searchable: true,
    layout: { row: 1, column: 1 }, // Second row, second column
  },
  { 
    id: "issueTypeId", 
    label: "Issue Type", 
    type: "select", 
    required: true, 
    options: issueTypeOptions,
    layout: { row: 1, column: 2 }, // Second row, third column
  },
  { 
    id: "title", 
    label: "Issue Title", 
    type: "text", 
    required: true,
    placeholder: "Brief description of the issue",
    layout: { row: 3, column: 0 }, // Fourth row, full width
  },
  { 
    id: "description", 
    label: "Detailed Description", 
    type: "text", 
    required: true,
    placeholder: "Detailed description of the problem",
    layout: { row: 4, column: 0 }, // Fifth row, full width
  },
  { 
    id: "customerImpact", 
    label: "Customer Impact", 
    type: "select", 
    required: true, 
    options: customerImpactOptions,
    layout: { row: 5, column: 0 }, // Sixth row, first column
  },
  { 
    id: "warrantyStatus", 
    label: "Warranty Status", 
    type: "select", 
    required: true, 
    options: warrantyStatusOptions,
    layout: { row: 5, column: 1 }, // Sixth row, second column
  },
  { 
    id: "assignedTspId", 
    label: "Assign to TSP", 
    type: "autocomplete", 
    required: false, 
    options: tspOptions,
    searchable: true,
    helperText: "Leave empty to assign later",
    layout: { row: 6, column: 0 }, // Seventh row, first column
  },
  { 
    id: "location", 
    label: "Location", 
    type: "text", 
    required: true,
    placeholder: "e.g., İstanbul Fabrika - Ana Bina",
    layout: { row: 6, column: 1 }, // Seventh row, second column
  },
  { 
    id: "estimatedResolutionDate", 
    label: "Estimated Resolution Date", 
    type: "date", 
    required: false,
    helperText: "Expected completion date",
    layout: { row: 7, column: 0 }, // Eighth row, first column
  },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    number: string;
  }>({ open: false, id: null, number: "" });

  // Helper function to generate issue number
  const generateIssueNumber = () => {
    const currentYear = new Date().getFullYear();
    const currentYearPrefix = `ARZ-${currentYear}`;
    
    // Get all issue numbers for the current year
    const existingNumbers = issues
      .filter(issue => {
        const issueNumber = issue.issueNumber;
        return issueNumber != null && issueNumber.startsWith(currentYearPrefix);
      })
      .map(issue => {
        const issueNumber = issue.issueNumber!; // We know it's not null from the filter
        const match = issueNumber.match(/ARZ-\d{4}-(\d{3})$/);
        return match ? parseInt(match[1]) : 0;
      });
    
    // Get the highest number for this year
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    
    // Generate next number with padding
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    return `${currentYearPrefix}-${nextNumber}`;
  };

  const handleAdd = (data: any) => {
    // Find related names for display
    const product = productOptions.find(p => p.value === parseInt(data.productId));
    const customer = customerOptions.find(c => c.value === parseInt(data.customerId));
    const issueType = issueTypeOptions.find(it => it.value === parseInt(data.issueTypeId));
    const tsp = tspOptions.find(t => t.value === parseInt(data.assignedTspId));

    const newIssue = {
      ...data,
      id: Math.max(...issues.map(i => i.id)) + 1,
      issueNumber: generateIssueNumber(), // Auto-generate issue number
      productId: parseInt(data.productId),
      productName: product?.label.split(' (')[0] || "Unknown",
      productSerial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
      customerId: parseInt(data.customerId),
      customerName: customer?.label || "Unknown",
      customerCompany: customer?.label || "Unknown",
      issueTypeId: parseInt(data.issueTypeId),
      issueTypeName: issueType?.label || "Unknown",
      assignedTspId: data.assignedTspId ? parseInt(data.assignedTspId) : null,
      assignedTspName: tsp?.label || null,
      actualResolutionDate: null,
      rootCause: null,
      resolutionSummary: null,
      customerSatisfaction: null,
      followUpRequired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Current User",
      lastUpdatedBy: "Current User",
      attachments: [],
      serviceOperations: [],
    };

    setIssues([...issues, newIssue]);
  };

  const handleEdit = (id: string | number, data: any) => {
    // Find related names for display
    const product = productOptions.find(p => p.value === parseInt(data.productId));
    const customer = customerOptions.find(c => c.value === parseInt(data.customerId));
    const issueType = issueTypeOptions.find(it => it.value === parseInt(data.issueTypeId));
    const tsp = tspOptions.find(t => t.value === parseInt(data.assignedTspId));

    setIssues(issues.map(issue => 
      issue.id === Number(id) 
        ? { 
            ...issue, 
            ...data, 
            productId: parseInt(data.productId),
            productName: product?.label.split(' (')[0] || "Unknown",
            productSerial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
            customerId: parseInt(data.customerId),
            customerName: customer?.label || "Unknown",
            customerCompany: customer?.label || "Unknown",
            issueTypeId: parseInt(data.issueTypeId),
            issueTypeName: issueType?.label || "Unknown",
            assignedTspId: data.assignedTspId ? parseInt(data.assignedTspId) : null,
            assignedTspName: tsp?.label || null,
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: "Current User",
          }
        : issue
    ));
  };

  const handleDeleteRequest = (id: string | number) => {
    const issue = issues.find(i => i.id === Number(id));
    if (issue) {
      setDeleteDialog({ open: true, id: Number(id), number: issue.issueNumber });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setIssues(issues.filter(issue => issue.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map(id => Number(id));
    setIssues(issues.filter(i => !numIds.includes(i.id)));
  };

  const handleBulkStatusChange = (ids: (string | number)[], newStatus: string) => {
    const numIds = ids.map(id => Number(id));
    const updateData: any = { status: newStatus, updatedAt: new Date().toISOString(), lastUpdatedBy: "Current User" };
    
    // If marking as repaired/closed, set actual resolution date
    if (newStatus === "REPAIRED" || newStatus === "CLOSED") {
      updateData.actualResolutionDate = new Date().toISOString().split('T')[0];
    }

    setIssues(issues.map(i => 
      numIds.includes(i.id) ? { ...i, ...updateData } : i
    ));
  };

  const handleBulkAssign = (ids: (string | number)[], tspId: string) => {
    const numIds = ids.map(id => Number(id));
    const tsp = tspOptions.find(t => t.value === parseInt(tspId));
    
    setIssues(issues.map(i => 
      numIds.includes(i.id) ? { 
        ...i, 
        assignedTspId: parseInt(tspId),
        assignedTspName: tsp?.label || "Unknown",
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: "Current User",
      } : i
    ));
  };

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage: "Are you sure you want to delete the selected issues? This action cannot be undone.",
    },
    {
      id: "mark-in-progress",
      label: "Mark as In Progress",
      action: (ids) => handleBulkStatusChange(ids, "IN_PROGRESS"),
    },
    {
      id: "mark-waiting-parts",
      label: "Mark as Waiting Parts",
      action: (ids) => handleBulkStatusChange(ids, "WAITING_PARTS"),
    },
    {
      id: "mark-repaired",
      label: "Mark as Repaired",
      action: (ids) => handleBulkStatusChange(ids, "REPAIRED"),
      confirmMessage: "Mark selected issues as repaired? This will set the actual resolution date to today.",
    },
    {
      id: "mark-closed",
      label: "Mark as Closed",
      action: (ids) => handleBulkStatusChange(ids, "CLOSED"),
      confirmMessage: "Mark selected issues as closed? This will set the actual resolution date to today.",
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.label).join(',');
    const rows = issues.map(issue => 
      columns.map(col => {
        const value = issue[col.id as keyof typeof issue];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issues.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();
  const avgResolutionTime = issues.filter(i => i.actualResolutionDate).length;

  return (
    <Layout title="Issues">
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Issues
                </Typography>
                <Typography variant="h4" color="primary">
                  {issues.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Issues
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {(statusCounts.OPEN || 0) + (statusCounts.IN_PROGRESS || 0)}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Critical Priority
                </Typography>
                <Typography variant="h4" color="error.main">
                  {priorityCounts.CRITICAL || 0}
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Box>

        {/* Issues DataTable */}
        <DataTable
          title="Issues"
          columns={columns}
          data={issues}
          formFields={formFields}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onExport={handleExport}
          addButtonText="Create Issue"
          selectable={true}
          bulkActions={bulkActions}
          pageSize={10}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Issue"
          message={`Are you sure you want to delete issue "${deleteDialog.number}"? This action cannot be undone and may affect related service records.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText="Delete"
        />
      </Box>
    </Layout>
  );
} 