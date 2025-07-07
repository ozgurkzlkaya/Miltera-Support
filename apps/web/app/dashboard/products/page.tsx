"use client";

import {
  Box,
  Chip,
  Avatar,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
} from "@mui/material";
import { Layout } from "../../../components/Layout";
import {
  DataTable,
  TableColumn,
  BulkAction,
  useDataTableQuery,
} from "../../../components/data-table";
import BulkProductCreationModal from "../../../features/products/components/BulkProductCreationModal";
import { ServiceOperationsManager } from "../../../components/ServiceOperationsManager";
import { ProductHistoryDialog } from "../../../features/products/components/ProductHistoryDialog";
import { useState } from "react";
import {
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ModelTraining as ModelIcon,
  BugReport as BugIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  useCreateBulkProduct,
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useProducts,
  useUpdateProduct,
} from "../../../features/products/services/product.service";
import { useAuthenticatedAuth } from "../../../features/auth/useAuth";
import { FormField } from "../../../components/form/types";
import { ProductStatuses } from "../../../features/products/data/product";
import { loadOptions } from "../../../features/products/helpers/loadOptions";

import { ProductCards } from "../../../features/products/components/ProductCards";
import { ProductViewDialog } from "../../../features/products/components/ProductViewDialog";
import { useProductModel } from "../../../features/products/services/product-model.service";
import { useProductWithRelations } from "../../../features/products/services/product-relations.service";
import ProductBulkCreateDialog from "../../../features/products/components/ProductBulkCreateDialog";
import { keepPreviousData } from "@tanstack/react-query";

const formFields: FormField[] = [
  {
    id: "serialNumber",
    label: "Serial Number",
    type: "text",
    required: true,
    placeholder: "e.g., SN123456",
    layout: { row: 0, column: 0 }, // First row, first column
    validation: {
      minLength: 6,
    },
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    required: true,
    options: Object.entries(ProductStatuses).map(([value, label]) => ({
      value,
      label,
    })),
    layout: { row: 0, column: 1 }, // First row, second column
  },
  {
    id: "productModelId",
    accessorKey: "productModel.id",
    label: "Product Model",
    type: "autocomplete",
    loadOptions: (query) => loadOptions("productModel", query),
    required: true,
    layout: { row: 1, column: 0 }, // Second row, full width
  },
  {
    id: "ownerId",
    accessorKey: "owner.id",
    label: "Customer Company",
    type: "autocomplete",
    loadOptions: (query) => loadOptions("company", query),
    required: false,
    helperText: "Leave empty for stock items",
    layout: { row: 2, column: 0 }, // Third row, first column
  },
  {
    id: "locationId",
    accessorKey: "location.id",
    label: "Location",
    type: "autocomplete",
    loadOptions: (query) => loadOptions("location", query),
    required: false,
    helperText:
      "Required for stock items (leave empty for customer-owned products)",
    layout: { row: 2, column: 1 }, // Third row, second column
  },
  {
    id: "productionDate",
    label: "Production Date",
    type: "date",
    required: true,
    layout: { row: 3, column: 0 },
  },
  {
    id: "warrantyStartDate",
    label: "Warranty Start Date",
    type: "date",
    required: false,
    helperText: "Leave empty for stock items",
    layout: { row: 3, column: 1 }, // Fourth row, second column
  },
  {
    id: "warrantyPeriodMonths",
    label: "Warranty Period (Months)",
    type: "number",
    required: true,
    placeholder: "24",
    layout: { row: 3, column: 2 }, // Fourth row, third column
    validation: {
      min: 1,
      max: 120,
    },
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "success";
    case "IN_SERVICE":
      return "primary";
    case "SHIPPED":
      return "info";
    case "IN_REPAIR":
      return "warning";
    case "TESTING":
      return "secondary";
    case "REPLACED":
    case "DISPOSED":
      return "error";
    default:
      return "default";
  }
};

const getIssueStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "WAITING_PARTS":
      return "secondary";
    case "REPAIRED":
      return "success";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "CRITICAL":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    case "LOW":
      return "success";
    default:
      return "default";
  }
};

const columns = (setIssuesDialog: any): TableColumn[] => [
  {
    id: "name",
    label: "Product",
    width: 180,
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.productModel.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.serialNumber}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: "productModel.productType.name",
    label: "Type",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "select",
    // filterOptions: productTypeOptions.map((opt) => ({
    //   value: opt.label,
    //   label: opt.label,
    // })),
    render: (value) => (
      <Chip label={value} color="primary" size="small" variant="outlined" />
    ),
  },
  {
    id: "productModel.name",
    label: "Model",
    width: 100,
    sortable: true,
    filterable: true,
    filterType: "select",
    // filterOptions: productModelOptions.map((opt) => ({
    //   value: opt.label,
    //   label: opt.label,
    // })),
  },
  {
    id: "owner.name",
    label: "Company",
    width: 130,
    sortable: true,
    filterable: true,
    filterType: "select",
    // filterOptions: companyOptions.map((opt) => ({
    //   value: opt.label,
    //   label: opt.label,
    // })),
  },
  {
    id: "status",
    label: "Status",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "select",
    // filterOptions: statusOptions.map((opt) => ({
    //   value: opt.value,
    //   label: opt.label,
    // })),
    render: (value) => (
      <Chip
        label={value ? value.replace("_", " ") : "Unknown"}
        color={getStatusColor(value || "") as any}
        size="small"
      />
    ),
  },
  {
    id: "location.name",
    label: "Location",
    width: 140,
    sortable: true,
    filterable: true,
    filterType: "select",
    // filterOptions: [
    //   { value: "", label: "Customer-owned" },
    //   ...stockLocationOptions.map((opt) => ({
    //     value: opt.label,
    //     label: opt.label,
    //   })),
    // ],
    render: (value, row) =>
      value ? (
        <Chip label={value} color="info" size="small" variant="outlined" />
      ) : row.ownerId ? (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Customer-owned
        </Typography>
      ) : null,
  },

  {
    id: "warrantyStartDate",
    label: "Warranty Start",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "date",
    format: (value) => new Date(value).toLocaleDateString(),
  },
  {
    id: "productionDate",
    label: "Production",
    width: 120,
    sortable: true,
    filterable: true,
    filterType: "date",
    format: (value) => new Date(value).toLocaleDateString(),
  },
  {
    id: "issues",
    label: "Issues",
    width: 120,
    sortable: false,
    filterable: false,
    render: (value, row) => {
      // const productIssues = getProductIssues(row.id);
      // const activeIssues = productIssues.filter(
      //   (issue) => issue.status !== "CLOSED" && issue.status !== "REPAIRED"
      // );

      const productIssues = [];
      const activeIssues = [];

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={`Click to view ${productIssues.length} issues`}>
            <IconButton
              size="small"
              onClick={() => setIssuesDialog({ open: true, product: row })}
              sx={{ p: 0 }}
            >
              <Badge badgeContent={activeIssues.length} color="error">
                <BugIcon
                  color={activeIssues.length > 0 ? "error" : "disabled"}
                />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
  },
];

const ProductsPage = ({ products: _products }: { products: any }) => {
  const auth = useAuthenticatedAuth();

  const {
    query,
    handlePaginationChange,
    handleSortingChange,
    handleFilterChange,
    handleGlobalFilterChange,
  } = useDataTableQuery();

  const productsQueryResult = useProducts({
    query,
    config: {
      placeholderData: keepPreviousData,
    },
  });

  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const {
    productQueryResult,
    productModelQueryResult,
    productTypeQueryResult,
    productLocationQueryResult,
    productOwnerCompanyQueryResult,
    isLoading,
  } = useProductWithRelations({
    id: currentProductId ?? null,
  });

  const currentProduct = productQueryResult.data?.data;
  const currentProductType = productTypeQueryResult.data?.data;
  const currentProductModel = productModelQueryResult.data?.data;
  const currentProductLocation = productLocationQueryResult.data?.data;
  const currentProductOwnerCompany = productOwnerCompanyQueryResult.data?.data;

  const createMutation = useCreateProduct();
  const createBulkMutation = useCreateBulkProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <DeleteIcon />,
      color: "error",
      action: () => {},
      confirmMessage:
        "Are you sure you want to delete the selected products? This action cannot be undone.",
    },
  ];

  return (
    <>
      {" "}
      <Box sx={{ p: 3 }}>
        {/* Quick Actions */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            {/* <ProductCards /> */}

            {auth.user.role !== "customer" ? (
              <Stack spacing={1} sx={{ minWidth: 200 }}>
                <Link href="/dashboard/products/types" passHref>
                  <Button
                    variant="outlined"
                    startIcon={<CategoryIcon />}
                    fullWidth
                  >
                    Manage Product Types
                  </Button>
                </Link>
                <Link href="/dashboard/products/models" passHref>
                  <Button
                    variant="outlined"
                    startIcon={<ModelIcon />}
                    fullWidth
                  >
                    Manage Product Models
                  </Button>
                </Link>
              </Stack>
            ) : null}
          </Stack>
        </Box>

        <DataTable
          title="Products"
          columns={columns({})}
          queryResult={productsQueryResult}
          formFields={formFields}
          {...(auth.user.role !== "customer"
            ? {
                onAdd: (data) => createMutation.mutateAsync({ payload: data }),
                onEdit: (id, data) =>
                  updateMutation.mutateAsync({ id, payload: data }),
                onDelete: (id) => deleteMutation.mutateAsync({ id }),
              }
            : {})}
          onView={(id) => {
            setCurrentProductId(id);
            setIsViewDialogOpen(true);
          }}
          addButtonText="Add Product"
          bulkAddButton={
            auth.user.role !== "customer"
              ? {
                  text: "Bulk Add Products",
                  onClick: () => setIsBulkCreateDialogOpen(true),
                }
              : undefined
          }
          selectable={true}
          bulkActions={bulkActions}
        />
      </Box>
      <ProductViewDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        isLoading={isLoading}
        product={currentProduct}
        productModel={currentProductModel}
        productType={currentProductType}
        productLocation={currentProductLocation}
        productOwnerCompany={currentProductOwnerCompany}
      />
      <ProductBulkCreateDialog
        open={isBulkCreateDialogOpen}
        onClose={() => setIsBulkCreateDialogOpen(false)}
        onSubmit={(body) => createBulkMutation.mutateAsync({ payload: body })}
      />
    </>
  );
};

export default ProductsPage;
