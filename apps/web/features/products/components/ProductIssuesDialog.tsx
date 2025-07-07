"use client";

import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";

import {
  ModelTraining as ModelIcon,
  Visibility as ViewIcon,
  Engineering as ServiceIcon,
  Close as CloseIcon,
  BugReport as BugIcon,
} from "@mui/icons-material";

// Mock issues data - would typically come from API calls
const mockIssues = [
  {
    id: 1,
    issueNumber: "ARZ-2024-001",
    productId: "e91d06bf-2782-4e41-9b53-f6930da4bc26",
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

const getProductIssues = (productId: number) => {
  return mockIssues.filter((issue) => issue.productId === productId);
};

const ProductIssuesDialog = () => {
  return (
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
                                color={getIssueStatusColor(issue.status) as any}
                                size="small"
                              />
                              <Chip
                                label={issue.priority}
                                color={getPriorityColor(issue.priority) as any}
                                size="small"
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Assigned to: {issue.assignedTspName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
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
  );
};
