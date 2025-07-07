"use client";

import {
  Box,
  Chip,
  Avatar,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import {
  Category as CategoryIcon,
  Close as CloseIcon,
  BugReport as BugIcon,
  Assessment as ReportIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

interface ProductViewDialogProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  product: any;
  productType: any;
  productModel: any;
  productLocation: any;
  productOwnerCompany: any;
}

const ProductViewDialog = ({
  open,
  onClose,
  isLoading: _isLoading,
  product,
  productType,
  productModel,
  productLocation,
  productOwnerCompany,
}: ProductViewDialogProps) => {
  const isLoading = _isLoading || !product || !productType || !productModel;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Product Details</Typography>
              {!isLoading && (
                <Typography variant="body2" color="text.secondary">
                  {product.name}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {!isLoading ? (
          <Box sx={{ pt: 1 }}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <CategoryIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Product Model
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {productModel.name}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Serial Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {product.serialNumber}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 350 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip
                      label={productType.name}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <BusinessIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {productOwnerCompany?.name}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={product.status}
                      //   color={getStatusColor(product.currentStatus || "") as any}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Production Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {product.productionDate
                          ? new Date(
                              product.productionDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Warranty Start
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {product.warrantyStartDate
                          ? new Date(
                              product.warrantyStartDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 150 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Warranty Period
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {product.warrantyPeriodMonths
                          ? `${product.warrantyPeriodMonths} months`
                          : "Not specified"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Location & Stock */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Location & Stock
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <LocationIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Stock Location
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {productLocation?.name ??
                        (product.ownerId ? "Customer-owned" : "")}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Manufacturer
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {product.manufacturer || "Miltera"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Product History Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Product History
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <TimelineIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  View complete product lifecycle and history
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  //   onClick={() => {
                  //     setHistoryDialog({
                  //       open: true,
                  //       product: product,
                  //     });
                  //   }}
                  sx={{ mt: 1 }}
                >
                  View Product History
                </Button>
              </Box>
            </Box>

            {/* Issues Summary */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Issues Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
              {(() => {
                const productIssues = [];
                const activeIssues = [];

                // const productIssues = getProductIssues(product.id);
                // const activeIssues = productIssues.filter(
                //   (issue) =>
                //     issue.status !== "CLOSED" && issue.status !== "REPAIRED"
                // );

                return (
                  <>
                    <Box sx={{ minWidth: 150 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <BugIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Issues
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {productIssues.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ minWidth: 150 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <ReportIcon color="error" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Active Issues
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            color="error.main"
                          >
                            {activeIssues.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ minWidth: 200 }}>
                      <Button
                        variant="outlined"
                        startIcon={<BugIcon />}
                        onClick={() => {
                          onClose();

                          //   setIssuesDialog({
                          //     open: true,
                          //     product: product,
                          //   });
                        }}
                        disabled={productIssues.length === 0}
                      >
                        View All Issues
                      </Button>
                    </Box>
                  </>
                );
              })()}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ProductViewDialog };
