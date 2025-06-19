"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import {
  Close as CloseIcon,
  Factory as FactoryIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Engineering as ServiceIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useState } from "react";

export interface ProductHistoryEntry {
  id: string;
  timestamp: string;
  event: string;
  status?: string;
  description: string;
  performedBy: string;
  location?: string;
  details?: Record<string, any>;
  type: 'production' | 'test' | 'shipping' | 'service' | 'status_change' | 'issue' | 'other';
}

interface ProductHistoryModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

// Mock history data generator
const generateMockHistory = (product: any): ProductHistoryEntry[] => {
  const baseDate = new Date(product?.productionDate || '2024-01-01');
  const history: ProductHistoryEntry[] = [];

  // Production phase
  history.push({
    id: '1',
    timestamp: baseDate.toISOString(),
    event: 'Product Created',
    status: 'IN_PRODUCTION',
    description: 'Product manufactured and initial quality checks completed',
    performedBy: 'Production Team',
    location: 'Miltera Factory - Line A',
    type: 'production',
    details: {
      batchNumber: 'B-2024-001',
      qualityScore: 98.5,
      inspector: 'Ali Yılmaz'
    }
  });

  // Testing phase
  const testDate = new Date(baseDate);
  testDate.setDate(testDate.getDate() + 2);
  history.push({
    id: '2',
    timestamp: testDate.toISOString(),
    event: 'Fabrication Test Started',
    status: 'UNDER_TEST',
    description: 'Comprehensive hardware and software testing initiated',
    performedBy: 'Mehmet Kaya (TSP)',
    location: 'Test Laboratory',
    type: 'test',
    details: {
      testPlan: 'TP-2024-045',
      estimatedDuration: '4 hours',
      testCategories: ['Hardware', 'Software', 'Performance']
    }
  });

  const testCompleteDate = new Date(testDate);
  testCompleteDate.setHours(testCompleteDate.getHours() + 6);
  history.push({
    id: '3',
    timestamp: testCompleteDate.toISOString(),
    event: 'Fabrication Test Completed',
    status: 'READY_FOR_SHIPMENT',
    description: 'All tests passed successfully. Product ready for shipment',
    performedBy: 'Mehmet Kaya (TSP)',
    location: 'Test Laboratory',
    type: 'test',
    details: {
      testResults: 'PASS',
      overallScore: 96.8,
      failedTests: 0,
      report: 'TR-2024-789'
    }
  });

  // Shipping phase
  const shipDate = new Date(testCompleteDate);
  shipDate.setDate(shipDate.getDate() + 1);
  history.push({
    id: '4',
    timestamp: shipDate.toISOString(),
    event: 'Shipment Created',
    status: 'SHIPPED',
    description: 'Product added to shipment and dispatched to customer',
    performedBy: 'Fatma Demir (TSP)',
    location: 'Warehouse',
    type: 'shipping',
    details: {
      shipmentNumber: 'SH-2024-156',
      trackingNumber: 'TR123456789',
      carrier: 'MNG Kargo',
      destination: product?.companyName || 'Customer Location'
    }
  });

  // Customer delivery
  const deliveryDate = new Date(shipDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  history.push({
    id: '5',
    timestamp: deliveryDate.toISOString(),
    event: 'Delivered to Customer',
    status: 'ACTIVE',
    description: 'Product successfully delivered and activated at customer site',
    performedBy: 'System (Automatic)',
    location: product?.companyName || 'Customer Site',
    type: 'shipping',
    details: {
      deliveryConfirmation: 'DC-2024-456',
      receivedBy: 'Ahmet Özkan',
      installationStatus: 'Installed',
      activationDate: deliveryDate.toISOString()
    }
  });

  // Service operations (if any issues exist)
  if (product?.issues && product.issues.length > 0) {
    const serviceDate = new Date(deliveryDate);
    serviceDate.setMonth(serviceDate.getMonth() + 2);
    
    history.push({
      id: '6',
      timestamp: serviceDate.toISOString(),
      event: 'Service Issue Reported',
      status: 'UNDER_SERVICE',
      description: 'Customer reported connectivity issues. Service request created',
      performedBy: 'Customer Support',
      location: 'Customer Site',
      type: 'issue',
      details: {
        issueId: 'ISS-2024-789',
        priority: 'High',
        category: 'Connectivity',
        customerReference: 'CR-2024-123'
      }
    });

    const repairDate = new Date(serviceDate);
    repairDate.setDate(repairDate.getDate() + 2);
    history.push({
      id: '7',
      timestamp: repairDate.toISOString(),
      event: 'On-Site Service Completed',
      status: 'ACTIVE',
      description: 'Network configuration updated and connectivity restored',
      performedBy: 'Okan Şahin (TSP)',
      location: 'Customer Site',
      type: 'service',
      details: {
        serviceType: 'On-site Repair',
        duration: '2 hours',
        partsReplaced: ['Network Module'],
        testResult: 'PASS',
        customerSatisfaction: 'Excellent'
      }
    });
  }

  // Regular maintenance (if product is old enough)
  const now = new Date();
  const monthsSinceDelivery = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsSinceDelivery > 6) {
    const maintenanceDate = new Date(deliveryDate);
    maintenanceDate.setMonth(maintenanceDate.getMonth() + 6);
    
    history.push({
      id: '8',
      timestamp: maintenanceDate.toISOString(),
      event: 'Scheduled Maintenance',
      description: 'Routine maintenance and firmware update performed',
      performedBy: 'Maintenance Team',
      location: 'Customer Site',
      type: 'service',
      details: {
        maintenanceType: 'Preventive',
        firmwareVersion: 'v2.1.4',
        batteryLevel: '95%',
        signalStrength: 'Excellent',
        nextMaintenance: new Date(maintenanceDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000)).toISOString()
      }
    });
  }

  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'production': return <FactoryIcon />;
    case 'test': return <BuildIcon />;
    case 'shipping': return <ShippingIcon />;
    case 'service': return <ServiceIcon />;
    case 'issue': return <WarningIcon />;
    case 'status_change': return <InfoIcon />;
    default: return <EventIcon />;
  }
};

const getEventColor = (type: string, status?: string) => {
  switch (type) {
    case 'production': return 'primary';
    case 'test': return status === 'UNDER_TEST' ? 'warning' : 'success';
    case 'shipping': return 'info';
    case 'service': return 'secondary';
    case 'issue': return 'error';
    default: return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_PRODUCTION': return 'info';
    case 'UNDER_TEST': return 'warning';
    case 'READY_FOR_SHIPMENT': return 'success';
    case 'SHIPPED': return 'primary';
    case 'ACTIVE': return 'success';
    case 'UNDER_SERVICE': return 'error';
    case 'INACTIVE': return 'default';
    default: return 'default';
  }
};

export const ProductHistoryModal = ({ open, onClose, product }: ProductHistoryModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const history = generateMockHistory(product);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Group history by type for summary view
  const historySummary = {
    production: history.filter(h => h.type === 'production').length,
    test: history.filter(h => h.type === 'test').length,
    shipping: history.filter(h => h.type === 'shipping').length,
    service: history.filter(h => h.type === 'service').length,
    issues: history.filter(h => h.type === 'issue').length,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <TimelineIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Product Lifecycle History</Typography>
              <Typography variant="body2" color="text.secondary">
                {product?.name} - {product?.serial}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={history.length} color="primary">
                  Timeline
                </Badge>
              } 
            />
            <Tab label="Summary" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ position: 'relative' }}>
            {history.map((entry, index) => (
              <Box key={entry.id} sx={{ display: 'flex', position: 'relative', mb: 3 }}>
                {/* Timeline connector line */}
                {index < history.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 27,
                      top: 56,
                      width: 2,
                      height: 'calc(100% + 12px)',
                      bgcolor: 'grey.300',
                      zIndex: 0,
                    }}
                  />
                )}
                
                {/* Timeline dot */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, zIndex: 1 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: `${getEventColor(entry.type, entry.status)}.main`,
                      color: 'white',
                    }}
                  >
                    {getEventIcon(entry.type)}
                  </Avatar>
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  {/* Timestamp */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 0 }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {entry.event}
                      </Typography>
                      {entry.status && (
                        <Chip 
                          label={entry.status.replace('_', ' ')} 
                          color={getStatusColor(entry.status) as any}
                          size="small" 
                          sx={{ mb: 1 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {entry.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption">{entry.performedBy}</Typography>
                        </Box>
                        {entry.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="caption">{entry.location}</Typography>
                          </Box>
                        )}
                      </Stack>
                      
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <DescriptionIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Details
                          </Typography>
                          {Object.entries(entry.details).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </Typography>
                              <Typography variant="caption" fontWeight="medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Lifecycle Summary
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Event Categories
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip 
                    icon={<FactoryIcon />} 
                    label={`Production (${historySummary.production})`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<BuildIcon />} 
                    label={`Testing (${historySummary.test})`} 
                    color="warning" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<ShippingIcon />} 
                    label={`Shipping (${historySummary.shipping})`} 
                    color="info" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<ServiceIcon />} 
                    label={`Service (${historySummary.service})`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<WarningIcon />} 
                    label={`Issues (${historySummary.issues})`} 
                    color="error" 
                    variant="outlined" 
                  />
                </Stack>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Key Milestones
                </Typography>
                <List dense>
                  {history
                    .filter(h => ['production', 'test', 'shipping'].includes(h.type))
                    .slice(0, 5)
                    .map((entry) => (
                      <ListItem key={entry.id}>
                        <ListItemIcon>
                          {getEventIcon(entry.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={entry.event}
                          secondary={new Date(entry.timestamp).toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                </List>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={product?.currentStatus?.replace('_', ' ') || 'Unknown'} 
                    color={getStatusColor(product?.currentStatus || '') as any}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {history[0] ? new Date(history[0].timestamp).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Lifecycle Analytics
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Timeline Metrics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Events</Typography>
                    <Typography variant="h4">{history.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Service Operations</Typography> 
                    <Typography variant="h4">{historySummary.service}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Days in Service</Typography>
                    <Typography variant="h4">
                      {Math.floor((new Date().getTime() - new Date(product?.warrantyStartDate || product?.productionDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Reliability Score</Typography>
                    <Typography variant="h4" color={historySummary.issues === 0 ? 'success.main' : historySummary.issues <= 2 ? 'warning.main' : 'error.main'}>
                      {historySummary.issues === 0 ? 'Excellent' : historySummary.issues <= 2 ? 'Good' : 'Fair'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Indicators
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Test Success Rate"
                      secondary="100% - All fabrication tests passed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ServiceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Service Response Time"
                      secondary="2 days - Within SLA requirements"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InventoryIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Warranty Status"
                      secondary={
                        product?.warrantyPeriodMonths 
                          ? `${product.warrantyPeriodMonths} months warranty - ${new Date(new Date(product.warrantyStartDate || product.productionDate).getTime() + (product.warrantyPeriodMonths * 30 * 24 * 60 * 60 * 1000)) > new Date() ? 'Active' : 'Expired'}`
                          : 'Warranty information not available'
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button variant="contained" startIcon={<TimelineIcon />}>
          Export History
        </Button>
      </DialogActions>
    </Dialog>
  );

};