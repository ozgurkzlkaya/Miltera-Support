"use client";

import { useState } from "react";
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

// Get product issues from API
const getProductIssues = async (productId: string) => {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`http://localhost:3015/api/v1/issues?productId=${productId}`, { headers });
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching product issues:', error);
    return [];
  }
};

const ProductIssuesDialog = () => {
  const [issuesDialog, setIssuesDialog] = useState<{ open: boolean; product: any }>({ open: false, product: null });
  
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
              return Array.isArray(productIssues) && productIssues.length > 0 ? (
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
                                color="primary"
                                size="small"
                              />
                              <Chip
                                label={issue.priority}
                                color="secondary"
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
