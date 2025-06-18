"use client";

import {
  Box,
  Chip,
  Avatar,
  Typography,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton,
  Divider,
  Tab,
  Tabs,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { Layout } from "../../../components/Layout";
import {
  DataTable,
  TableColumn,
  FormField,
  BulkAction,
} from "../../../components/DataTable";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { ServiceOperationsManager } from "../../../components/ServiceOperationsManager";
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
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Science as TestIcon,
  CheckCircle as QualityIcon,
  Assessment as InitialIcon,
  Timer as TimerIcon,
  Inventory as PartsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Link from "next/link";

const initialIssues = [
  {
    id: 1,
    issueNumber: "ARZ-2024-001",
    products: [
      {
        id: 1,
        name: "Gateway-2000-001",
        serial: "SN123456",
        warrantyStartDate: "2024-01-01T00:00:00Z",
        warrantyPeriodMonths: 24,
      },
    ],
    companyId: 1,
    companyName: "ABC Enerji Ltd.",
    issueTypeId: 1,
    issueTypeName: "NET_CONN: Network Connection",
    title: "Gateway Connection Timeout",
    description:
      "Gateway device experiencing frequent connection timeouts with remote servers",
    status: "IN_PROGRESS",
    priority: "HIGH",
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
        date: "2024-06-02",
        productId: 1,
      },
    ],
  },
  {
    id: 2,
    issueNumber: "ARZ-2024-002",
    products: [
      {
        id: 2,
        name: "EA-100-005",
        serial: "SN654321",
        warrantyStartDate: "2023-06-01T00:00:00Z",
        warrantyPeriodMonths: 36,
      },
      {
        id: 4,
        name: "SM-300-003",
        serial: "SN456789",
        warrantyStartDate: "2023-08-01T00:00:00Z",
        warrantyPeriodMonths: 24,
      },
    ],
    companyId: 2,
    companyName: "XYZ Elektrik A.Ş.",
    issueTypeId: 3,
    issueTypeName: "CAL_SENSOR: Sensor Calibration",
    title: "Energy Analyzer Calibration Required",
    description:
      "Device showing inconsistent readings, requires professional calibration",
    status: "WAITING_PARTS",
    priority: "MEDIUM",
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
        date: "2024-06-03",
        productId: 2,
      },
      {
        id: 4,
        operationType: "REPAIR",
        performedBy: "Jane Smith",
        description: "Secondary unit sensor calibration",
        findings: "Sensors within acceptable range",
        date: "2024-06-04",
        productId: 4,
      },
    ],
  },
  {
    id: 3,
    issueNumber: "ARZ-2024-003",
    products: [
      {
        id: 3,
        name: "VR-500-012",
        serial: "SN987654",
        warrantyStartDate: "2022-03-01T00:00:00Z",
        warrantyPeriodMonths: 12,
      },
    ],
    companyId: 3,
    companyName: "DEF Teknoloji",
    issueTypeId: 5,
    issueTypeName: "SW_UPDATE: Software Update",
    title: "VPN Router Firmware Update",
    description:
      "Router requires firmware update to fix security vulnerabilities",
    status: "REPAIRED",
    priority: "CRITICAL",
    assignedTspId: 3,
    assignedTspName: "Mike Johnson",
    estimatedResolutionDate: "2024-06-08",
    actualResolutionDate: "2024-06-07",
    location: "İzmir Depo",
    urgencyLevel: "Critical",
    customerImpact: "Low",
    rootCause: "Outdated firmware version",
    resolutionSummary:
      "Firmware updated to latest version, security patches applied",
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
        date: "2024-06-07",
        productId: 3,
      },
    ],
  },
];

// Mock data for category mapping
const externalCategories = [
  { id: 1, name: "Connection Issues", description: "Network and connectivity problems" },
  { id: 2, name: "Calibration", description: "Device calibration requirements" },
  { id: 3, name: "Software Update", description: "Firmware and software updates" },
  { id: 4, name: "Hardware Malfunction", description: "Physical hardware problems" },
  { id: 5, name: "Data Synchronization", description: "Data sync and reporting issues" },
];

const internalCategories = [
  { id: 1, code: "NET_CONN", name: "Network Connection", defaultPriority: "HIGH", slaMinutes: 240 },
  { id: 2, code: "NET_CONFIG", name: "Network Configuration", defaultPriority: "MEDIUM", slaMinutes: 480 },
  { id: 3, code: "CAL_SENSOR", name: "Sensor Calibration", defaultPriority: "MEDIUM", slaMinutes: 720 },
  { id: 4, code: "CAL_METER", name: "Meter Calibration", defaultPriority: "HIGH", slaMinutes: 480 },
  { id: 5, code: "SW_UPDATE", name: "Software Update", defaultPriority: "LOW", slaMinutes: 1440 },
  { id: 6, code: "SW_CONFIG", name: "Software Configuration", defaultPriority: "MEDIUM", slaMinutes: 360 },
  { id: 7, code: "HW_REPLACE", name: "Hardware Replacement", defaultPriority: "CRITICAL", slaMinutes: 120 },
  { id: 8, code: "HW_REPAIR", name: "Hardware Repair", defaultPriority: "HIGH", slaMinutes: 360 },
  { id: 9, code: "DATA_SYNC", name: "Data Synchronization", defaultPriority: "MEDIUM", slaMinutes: 480 },
];

const initialCategoryMappings = [
  {
    id: 1,
    externalCategoryId: 1,
    externalCategoryName: "Connection Issues",
    internalCategories: [
      { id: 1, code: "NET_CONN", name: "Network Connection" },
      { id: 2, code: "NET_CONFIG", name: "Network Configuration" },
    ],
  },
  {
    id: 2,
    externalCategoryId: 2,
    externalCategoryName: "Calibration",
    internalCategories: [
      { id: 3, code: "CAL_SENSOR", name: "Sensor Calibration" },
      { id: 4, code: "CAL_METER", name: "Meter Calibration" },
    ],
  },
  {
    id: 3,
    externalCategoryId: 3,
    externalCategoryName: "Software Update",
    internalCategories: [
      { id: 5, code: "SW_UPDATE", name: "Software Update" },
      { id: 6, code: "SW_CONFIG", name: "Software Configuration" },
    ],
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

// Issue type options now derived from internal categories
const getIssueTypeOptions = (internalCategories: any[]) => {
  return internalCategories.map(cat => ({
    value: cat.id,
    label: `${cat.code}: ${cat.name}`,
  }));
};

const productOptions = [
  { value: 1, label: "Gateway-2000-001 (SN123456)" },
  { value: 2, label: "EA-100-005 (SN654321)" },
  { value: 3, label: "VR-500-012 (SN987654)" },
  { value: 4, label: "SM-300-003 (SN456789)" },
];

const companyOptions = [
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
    case "OPEN":
      return "default";
    case "IN_PROGRESS":
      return "info";
    case "WAITING_PARTS":
      return "warning";
    case "REPAIRED":
      return "success";
    case "CLOSED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "default";
    case "MEDIUM":
      return "info";
    case "HIGH":
      return "warning";
    case "CRITICAL":
      return "error";
    default:
      return "default";
  }
};


const formatSLA = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const columns = (setServiceOperationsDialog: any): TableColumn[] => [
  {
    id: "issueNumber",
    label: "Issue Number",
    width: 150,
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
          <IssueIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.title}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: "products",
    label: "Products",
    width: 180,
    sortable: false,
    filterable: false,
    render: (value, row) => (
      <Box>
        {row.products && row.products.length > 0 && (
          <>
            <Typography variant="body2" fontWeight="bold">
              {row.products[0].name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.products[0].serial}
            </Typography>
            {row.products.length > 1 && (
              <Typography
                variant="caption"
                color="primary.main"
                sx={{ display: "block" }}
              >
                +{row.products.length - 1} more
              </Typography>
            )}
          </>
        )}
      </Box>
    ),
  },
  {
    id: "companyName",
    label: "Company",
    width: 140,
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BusinessIcon fontSize="small" color="action" />
        <Box>
          <Typography variant="body2">{value}</Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: "issueTypeName",
    label: "Category",
    width: 160,
    sortable: true,
    filterable: true,
    render: (value) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SettingsIcon fontSize="small" color="action" />
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {value ? value.split(': ')[0] : 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {value ? value.split(': ')[1] : ''}
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
    render: (value) =>
      value ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          {value}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Unassigned
        </Typography>
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
    id: "serviceOperations",
    label: "Operations",
    width: 120,
    render: (value, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ServiceIcon fontSize="small" color="action" />
        <Typography variant="body2">{value?.length || 0} ops</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setServiceOperationsDialog({
              open: true,
              issue: row,
              tabValue: 0,
            });
          }}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          Manage
        </Button>
      </Box>
    ),
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

// Product Selection Modal Component
interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedProductIds: number[];
  onSelectionChange: (productIds: number[]) => void;
  products: Array<{ value: number; label: string }>;
}

const ProductSelectionModal = ({
  open,
  onClose,
  selectedProductIds,
  onSelectionChange,
  products,
}: ProductSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedIds, setTempSelectedIds] =
    useState<number[]>(selectedProductIds);

  const filteredProducts = products.filter((product) =>
    product.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleProduct = (productId: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setTempSelectedIds(filteredProducts.map((p) => p.value));
  };

  const handleDeselectAll = () => {
    setTempSelectedIds([]);
  };

  const handleSave = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedProductIds);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Products</Typography>
          <IconButton onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="body2" color="textSecondary">
            {tempSelectedIds.length} of {filteredProducts.length} products
            selected
          </Typography>
          <Box>
            <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
              Select All ({filteredProducts.length})
            </Button>
            <Button size="small" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </Box>
        </Box>

        <Divider />

        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredProducts.map((product) => (
            <ListItem
              key={product.value}
              onClick={() => handleToggleProduct(product.value)}
              sx={{ cursor: "pointer" }}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  checked={tempSelectedIds.includes(product.value)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={product.label}
                secondary={`ID: ${product.value}`}
              />
            </ListItem>
          ))}
        </List>

        {filteredProducts.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No products found matching "{searchQuery}"
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Selection ({tempSelectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function IssuesPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    number: string;
  }>({ open: false, id: null, number: "" });
  const [productSelectionModal, setProductSelectionModal] = useState<{
    open: boolean;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
  }>({
    open: false,
    selectedIds: [],
    onSelectionChange: () => {},
  });
  const [serviceOperationsDialog, setServiceOperationsDialog] = useState<{
    open: boolean;
    issue: any | null;
    tabValue: number;
  }>({ open: false, issue: null, tabValue: 0 });
  const [operationDeleteDialog, setOperationDeleteDialog] = useState<{
    open: boolean;
    operationId: number | null;
    operationType: string;
  }>({ open: false, operationId: null, operationType: "" });

  const [categoryMappingDialog, setCategoryMappingDialog] = useState<{
    open: boolean;
    tabValue: number;
  }>({ open: false, tabValue: 0 });

  const [categoryMappings, setCategoryMappings] = useState(initialCategoryMappings);
  const [externalCategoriesState, setExternalCategoriesState] = useState(externalCategories);
  const [internalCategoriesState, setInternalCategoriesState] = useState(internalCategories);

  // Helper function to generate issue number
  const generateIssueNumber = () => {
    const currentYear = new Date().getFullYear();
    const currentYearPrefix = `ARZ-${currentYear}`;

    // Get all issue numbers for the current year
    const existingNumbers = issues
      .filter((issue) => {
        const issueNumber = issue.issueNumber;
        return issueNumber != null && issueNumber.startsWith(currentYearPrefix);
      })
      .map((issue) => {
        const issueNumber = issue.issueNumber;
        if (!issueNumber) return 0; // Extra safety check
        const match = issueNumber.match(/ARZ-\d{4}-(\d{3})$/);
        return match && match[1] ? parseInt(match[1]) : 0;
      });

    // Get the highest number for this year
    const maxNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

    // Generate next number with padding
    const nextNumber = (maxNumber + 1).toString().padStart(3, "0");
    return `${currentYearPrefix}-${nextNumber}`;
  };

  const handleAdd = (data: any) => {
    // Find related names for display
    const selectedProducts = (data.productIds || []).map(
      (productId: number) => {
        const product = productOptions.find((p) => p.value === productId);
        return {
          id: productId,
          name: product?.label.split(" (")[0] || "Unknown",
          serial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
          warrantyStartDate: "2024-01-01T00:00:00Z", // Default values - should come from actual product data
          warrantyPeriodMonths: 24,
        };
      }
    );

    const company = companyOptions.find(
      (c) => c.value === parseInt(data.companyId)
    );
    const issueType = internalCategoriesState.find(
      (it: any) => it.id === parseInt(data.issueTypeId)
    );
    const tsp = tspOptions.find(
      (t) => t.value === parseInt(data.assignedTspId)
    );

    const newIssue = {
      ...data,
      id: Math.max(...issues.map((i) => i.id)) + 1,
      issueNumber: generateIssueNumber(), // Auto-generate issue number
      products: selectedProducts,
      companyId: parseInt(data.companyId),
      companyName: company?.label || "Unknown",
      issueTypeId: parseInt(data.issueTypeId),
      issueTypeName: issueType ? `${issueType.code}: ${issueType.name}` : "Unknown",
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
    const selectedProducts = (data.productIds || []).map(
      (productId: number) => {
        const product = productOptions.find((p) => p.value === productId);
        return {
          id: productId,
          name: product?.label.split(" (")[0] || "Unknown",
          serial: product?.label.match(/\((.*)\)$/)?.[1] || "Unknown",
          warrantyStartDate: "2024-01-01T00:00:00Z", // Default values - should come from actual product data
          warrantyPeriodMonths: 24,
        };
      }
    );

    const company = companyOptions.find(
      (c) => c.value === parseInt(data.companyId)
    );
    const issueType = internalCategoriesState.find(
      (it: any) => it.id === parseInt(data.issueTypeId)
    );
    const tsp = tspOptions.find(
      (t) => t.value === parseInt(data.assignedTspId)
    );

    setIssues(
      issues.map((issue) =>
        issue.id === Number(id)
          ? {
              ...issue,
              ...data,
              products: selectedProducts,
              companyId: parseInt(data.companyId),
              companyName: company?.label || "Unknown",
              issueTypeId: parseInt(data.issueTypeId),
              issueTypeName: issueType ? `${issueType.code}: ${issueType.name}` : "Unknown",
              assignedTspId: data.assignedTspId
                ? parseInt(data.assignedTspId)
                : null,
              assignedTspName: tsp?.label || null,
              updatedAt: new Date().toISOString(),
              lastUpdatedBy: "Current User",
            }
          : issue
      )
    );
  };

  const handleDeleteRequest = (id: string | number) => {
    const issue = issues.find((i) => i.id === Number(id));
    if (issue) {
      setDeleteDialog({
        open: true,
        id: Number(id),
        number: issue.issueNumber || "",
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      setIssues(issues.filter((issue) => issue.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, number: "" });
  };

  const handleBulkDelete = (ids: (string | number)[]) => {
    const numIds = ids.map((id) => Number(id));
    setIssues(issues.filter((i) => !numIds.includes(i.id)));
  };

  const handleBulkStatusChange = (
    ids: (string | number)[],
    newStatus: string
  ) => {
    const numIds = ids.map((id) => Number(id));
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: "Current User",
    };

    // If marking as repaired/closed, set actual resolution date
    if (newStatus === "REPAIRED" || newStatus === "CLOSED") {
      updateData.actualResolutionDate = new Date().toISOString().split("T")[0];
    }

    setIssues(
      issues.map((i) => (numIds.includes(i.id) ? { ...i, ...updateData } : i))
    );
  };

  const handleBulkAssign = (ids: (string | number)[], tspId: string) => {
    const numIds = ids.map((id) => Number(id));
    const tsp = tspOptions.find((t) => t.value === parseInt(tspId));

    setIssues(
      issues.map((i) =>
        numIds.includes(i.id)
          ? {
              ...i,
              assignedTspId: parseInt(tspId),
              assignedTspName: tsp?.label || "Unknown",
              updatedAt: new Date().toISOString(),
              lastUpdatedBy: "Current User",
            }
          : i
      )
    );
  };

  const openProductSelectionModal = (
    currentProductIds: number[],
    onSelectionChange: (ids: number[]) => void
  ) => {
    setProductSelectionModal({
      open: true,
      selectedIds: currentProductIds,
      onSelectionChange: (ids) => {
        onSelectionChange(ids);
        setProductSelectionModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const closeProductSelectionModal = () => {
    setProductSelectionModal((prev) => ({ ...prev, open: false }));
  };

  const handleManageServiceOperations = (issue: any) => {
    setServiceOperationsDialog({
      open: true,
      issue: issue,
      tabValue: 0,
    });
  };

  const closeServiceOperationsDialog = () => {
    setServiceOperationsDialog({
      open: false,
      issue: null,
      tabValue: 0,
    });
  };

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
      id: "issueTypeId",
      label: "Issue Type",
      type: "select",
      required: true,
      options: getIssueTypeOptions(internalCategoriesState),
      layout: { row: 0, column: 1 }, // First row, second column
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      required: true,
      options: statusOptions,
      layout: { row: 1, column: 0 },
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: priorityOptions,
      layout: { row: 1, column: 1 },
    },
    {
      id: "assignedTspId",
      label: "Assign to TSP",
      type: "autocomplete",
      required: false,
      options: tspOptions,
      searchable: true,
      helperText: "Leave empty to assign later",
      layout: { row: 1, column: 2 },
    },
    {
      id: "productIds",
      label: "Products",
      type: "text",
      required: true,
      placeholder: "Click to select products...",
      layout: { row: 2, column: 0 },
      isProductSelector: true, // Custom flag to identify this field
      onProductSelectorClick: (
        currentValue: any,
        onSelectionChange: (value: any) => void
      ) => {
        openProductSelectionModal(currentValue || [], onSelectionChange);
      },
    },
    {
      id: "companyId",
      label: "Company",
      type: "autocomplete",
      required: true,
      options: companyOptions,
      searchable: true,
      layout: { row: 2, column: 1 },
    },
    {
      id: "description",
      label: "Detailed Description",
      type: "text",
      required: true,
      placeholder: "Detailed description of the problem",
      layout: { row: 3, column: 0 },
    },
  ];

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: handleBulkDelete,
      confirmMessage:
        "Are you sure you want to delete the selected issues? This action cannot be undone.",
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
      confirmMessage:
        "Mark selected issues as repaired? This will set the actual resolution date to today.",
    },
    {
      id: "mark-closed",
      label: "Mark as Closed",
      action: (ids) => handleBulkStatusChange(ids, "CLOSED"),
      confirmMessage:
        "Mark selected issues as closed? This will set the actual resolution date to today.",
    },
  ];

  const handleExport = () => {
    // Simple CSV export
    const tableColumns = columns(setServiceOperationsDialog);
    const headers = tableColumns.map((col) => col.label).join(",");
    const rows = issues.map((issue) =>
      tableColumns
        .map((col) => {
          const value = issue[col.id as keyof typeof issue];
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
    a.download = "issues.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = issues.reduce(
      (acc, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = issues.reduce(
      (acc, issue) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();
  const avgResolutionTime = issues.filter((i) => i.actualResolutionDate).length;

  return (
    <Layout title="Issues">
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
          <Stack spacing={1} sx={{ minWidth: 200 }}>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              fullWidth
              onClick={() => setCategoryMappingDialog({ open: true, tabValue: 0 })}
            >
              Manage Categories
            </Button>
          </Stack>
        </Box>

        {/* Issues DataTable */}
        <DataTable
          title="Issues"
          columns={columns(setServiceOperationsDialog)}
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

        {/* Product Selection Modal */}
        <ProductSelectionModal
          open={productSelectionModal.open}
          onClose={closeProductSelectionModal}
          selectedProductIds={productSelectionModal.selectedIds}
          onSelectionChange={productSelectionModal.onSelectionChange}
          products={productOptions}
        />

        {/* Service Operations Management Dialog */}
        <Dialog
          open={serviceOperationsDialog.open}
          onClose={closeServiceOperationsDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Service Operations - {serviceOperationsDialog.issue?.issueNumber}
              </Typography>
              <IconButton onClick={closeServiceOperationsDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {serviceOperationsDialog.issue && (
              <Box sx={{ mt: 1 }}>
                {/* Info Card */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Issue Information</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Issue Number</Typography>
                        <Typography variant="body1">{serviceOperationsDialog.issue.issueNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Customer</Typography>
                        <Typography variant="body1">{serviceOperationsDialog.issue.customerName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={serviceOperationsDialog.issue.status}
                          color={getStatusColor(serviceOperationsDialog.issue.status)}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Products</Typography>
                        <Typography variant="body1">
                          {serviceOperationsDialog.issue.products.map((p: any) => p.name).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Operations Management */}
                <Box sx={{ mb: 2 }}>
                  <Tabs
                    value={serviceOperationsDialog.tabValue}
                    onChange={(e, newValue) => setServiceOperationsDialog(prev => ({ ...prev, tabValue: newValue }))}
                  >
                    <Tab label="All Operations" />
                    <Tab label="Initial Tests" />
                    <Tab label="Repairs" />
                    <Tab label="Final Tests" />
                    <Tab label="Quality Checks" />
                  </Tabs>
                </Box>

                {/* Operations List and Form */}
                <ServiceOperationsManager
                  issue={serviceOperationsDialog.issue}
                  operations={serviceOperationsDialog.issue.serviceOperations || []}
                  onOperationsChange={(updatedOps) => {
                    // Update the issue with new operations
                    setIssues(prev => prev.map(issue => 
                      issue.id === serviceOperationsDialog.issue?.id 
                        ? { ...issue, serviceOperations: updatedOps }
                        : issue
                    ));
                    // Update the dialog state
                    setServiceOperationsDialog(prev => ({
                      ...prev,
                      issue: prev.issue ? { ...prev.issue, serviceOperations: updatedOps } : null
                    }));
                  }}
                  tabValue={serviceOperationsDialog.tabValue}
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Category Mapping Dialog */}
        <Dialog
          open={categoryMappingDialog.open}
          onClose={() => setCategoryMappingDialog({ open: false, tabValue: 0 })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Issue Category Mapping</Typography>
              <IconButton onClick={() => setCategoryMappingDialog({ open: false, tabValue: 0 })}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={categoryMappingDialog.tabValue}
                onChange={(e, newValue) => setCategoryMappingDialog(prev => ({ ...prev, tabValue: newValue }))}
                sx={{ mb: 3 }}
              >
                <Tab label="External Categories" />
                <Tab label="Internal Categories" />
                <Tab label="Category Mapping" />
              </Tabs>

              {/* External Categories Tab */}
              {categoryMappingDialog.tabValue === 0 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    External categories are shown to customers when they create issues.
                  </Alert>
                  <DataTable
                    title="External Categories"
                    columns={[
                      {
                        id: "name",
                        label: "Category Name",
                        width: 200,
                        sortable: true,
                        filterable: true,
                        render: (value) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="primary" />
                            <Typography variant="body2" fontWeight="bold">{value}</Typography>
                          </Box>
                        ),
                      },
                      {
                        id: "description",
                        label: "Description",
                        width: 300,
                        sortable: true,
                        filterable: true,
                      },
                    ]}
                    data={externalCategoriesState}
                    formFields={[
                      {
                        id: "name",
                        label: "Category Name",
                        type: "text",
                        required: true,
                      },
                      {
                        id: "description",
                        label: "Description",
                        type: "text",
                      },
                    ]}
                    onAdd={(data) => {
                      const newCategory = {
                        id: Math.max(...externalCategoriesState.map(c => c.id)) + 1,
                        name: data.name,
                        description: data.description || "",
                      };
                      setExternalCategoriesState([...externalCategoriesState, newCategory]);
                    }}
                    onEdit={(id, data) => {
                      setExternalCategoriesState(externalCategoriesState.map(cat =>
                        cat.id === Number(id) ? { ...cat, name: data.name, description: data.description || "" } : cat
                      ));
                    }}
                    onDelete={(id) => {
                      setExternalCategoriesState(externalCategoriesState.filter(cat => cat.id !== Number(id)));
                      // Also remove any mappings that reference this external category
                      setCategoryMappings(categoryMappings.filter(m => m.externalCategoryId !== Number(id)));
                    }}
                    addButtonText="Add External Category"
                    selectable={false}
                    pageSize={10}
                  />
                </Box>
              )}

              {/* Internal Categories Tab */}
              {categoryMappingDialog.tabValue === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Internal categories are used by technicians to classify and prioritize work.
                  </Alert>
                  <DataTable
                    title="Internal Categories"
                    columns={[
                      {
                        id: "code",
                        label: "Code",
                        width: 120,
                        sortable: true,
                        filterable: true,
                        render: (value) => (
                          <Chip label={value} color="secondary" size="small" />
                        ),
                      },
                      {
                        id: "name",
                        label: "Category Name",
                        width: 200,
                        sortable: true,
                        filterable: true,
                        render: (value) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SettingsIcon color="action" />
                            <Typography variant="body2" fontWeight="bold">{value}</Typography>
                          </Box>
                        ),
                      },
                    ]}
                    data={internalCategoriesState}
                    formFields={[
                      {
                        id: "code",
                        label: "Category Code",
                        type: "text",
                        required: true,
                      },
                      {
                        id: "name",
                        label: "Category Name",
                        type: "text",
                        required: true,
                      },
                  
                    ]}
                    onAdd={(data) => {
                      const newCategory = {
                        id: Math.max(...internalCategoriesState.map(c => c.id)) + 1,
                        code: data.code,
                        name: data.name,
                        defaultPriority: data.defaultPriority,
                        slaMinutes: Number(data.slaMinutes),
                      };
                      setInternalCategoriesState([...internalCategoriesState, newCategory]);
                    }}
                    onEdit={(id, data) => {
                      setInternalCategoriesState(internalCategoriesState.map(cat =>
                        cat.id === Number(id) ? {
                          ...cat,
                          code: data.code,
                          name: data.name,
                          defaultPriority: data.defaultPriority,
                          slaMinutes: Number(data.slaMinutes),
                        } : cat
                      ));
                      // Update any mappings that reference this internal category
                      setCategoryMappings(categoryMappings.map(mapping => ({
                        ...mapping,
                        internalCategories: mapping.internalCategories.map(intCat =>
                          intCat.id === Number(id) ? { ...intCat, code: data.code, name: data.name } : intCat
                        )
                      })));
                    }}
                    onDelete={(id) => {
                      setInternalCategoriesState(internalCategoriesState.filter(cat => cat.id !== Number(id)));
                      // Remove this internal category from any mappings
                      setCategoryMappings(categoryMappings.map(mapping => ({
                        ...mapping,
                        internalCategories: mapping.internalCategories.filter(intCat => intCat.id !== Number(id))
                      })).filter(mapping => mapping.internalCategories.length > 0));
                    }}
                    addButtonText="Add Internal Category"
                    selectable={false}
                    pageSize={10}
                  />
                </Box>
              )}

              {/* Category Mapping Tab */}
              {categoryMappingDialog.tabValue === 2 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Map customer-facing categories to internal technician categories.
                  </Alert>
                  <DataTable
                title="Category Mappings"
                columns={[
                  {
                    id: "externalCategoryName",
                    label: "External Category",
                    width: 200,
                    sortable: true,
                    filterable: true,
                    render: (value) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">{value}</Typography>
                      </Box>
                    ),
                  },
                  {
                    id: "internalCategories",
                    label: "Internal Categories",
                    width: 400,
                    render: (value: any[]) => (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {value.map((cat) => (
                          <Chip
                            key={cat.id}
                            label={`${cat.code}: ${cat.name}`}
                            color="secondary"
                            size="small"
                            icon={<SettingsIcon />}
                          />
                        ))}
                      </Stack>
                    ),
                  },
                  {
                    id: "mappingCount",
                    label: "Count",
                    width: 100,
                    sortable: true,
                    render: (value, row) => (
                      <Typography variant="body2" color="text.secondary">
                        {row.internalCategories.length} mapped
                      </Typography>
                    ),
                  },
                ]}
                data={categoryMappings}
                formFields={[
                  {
                    id: "externalCategoryId",
                    label: "External Category",
                    type: "select",
                    options: externalCategoriesState
                      .filter(cat => 
                        !categoryMappings.some(m => m.externalCategoryId === cat.id)
                      )
                      .map(cat => ({ value: cat.id, label: cat.name })),
                    required: true,
                  },
                  {
                    id: "internalCategoryIds",
                    label: "Internal Categories",
                    type: "multiselect",
                    options: internalCategoriesState.map(cat => ({ 
                      value: cat.id, 
                      label: `${cat.code}: ${cat.name} (${cat.defaultPriority} - ${formatSLA(cat.slaMinutes)})` 
                    })),
                    required: true,
                  },
                ]}
                onAdd={(data) => {
                  const externalCategory = externalCategoriesState.find(cat => cat.id === data.externalCategoryId);
                  const mappedInternals = internalCategoriesState.filter(cat => 
                    data.internalCategoryIds.includes(cat.id)
                  );

                  const newMapping = {
                    id: Math.max(...categoryMappings.map(m => m.id)) + 1,
                    externalCategoryId: data.externalCategoryId,
                    externalCategoryName: externalCategory?.name || "",
                    internalCategories: mappedInternals.map(cat => ({
                      id: cat.id,
                      code: cat.code,
                      name: cat.name,
                    })),
                  };

                  setCategoryMappings([...categoryMappings, newMapping]);
                }}
                onEdit={(id, data) => {
                  const mappedInternals = internalCategoriesState.filter(cat => 
                    data.internalCategoryIds.includes(cat.id)
                  );

                  const existingMapping = categoryMappings.find(m => m.id === Number(id));
                  if (existingMapping) {
                    const updatedMapping = {
                      ...existingMapping,
                      internalCategories: mappedInternals.map(cat => ({
                        id: cat.id,
                        code: cat.code,
                        name: cat.name,
                      })),
                    };

                    setCategoryMappings(categoryMappings.map(m => 
                      m.id === Number(id) ? updatedMapping : m
                    ));
                  }
                }}
                onDelete={(id) => {
                  setCategoryMappings(categoryMappings.filter(m => m.id !== Number(id)));
                }}
                addButtonText="Add Mapping"
                selectable={false}
                pageSize={10}
              />
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
