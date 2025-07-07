import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { FormRenderer } from "../../../components/form/FormRenderer";
import { useForm } from "../../../components/form/useForm";
import type { FormField } from "../../../components/form/types";
import { ProductStatuses } from "../data/product";
import { loadOptions } from "../helpers/loadOptions";

// Define form fields configuration
const fields: FormField[] = [
  {
    id: "productModelId",
    label: "Product Model",
    type: "autocomplete",
    required: true,
    layout: { row: 0, column: 0 },
    loadOptions: (query) => loadOptions("productModelId", query),
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
    layout: { row: 0, column: 1 },
  },
  {
    id: "ownerId",
    label: "Company",
    type: "autocomplete",
    layout: { row: 1, column: 0 },
    loadOptions: (query) => loadOptions("ownerId", query),
  },
  {
    id: "locationId",
    label: "Location",
    type: "autocomplete",
    layout: { row: 1, column: 1 },
    loadOptions: (query) => loadOptions("locationId", query),
  },
  {
    id: "productionDate",
    label: "Production Date",
    type: "date",
    required: true,
    layout: { row: 2, column: 0 },
  },
  {
    id: "warrantyStartDate",
    label: "Warranty Start Date",
    type: "date",
    layout: { row: 2, column: 1 },
  },
  {
    id: "warrantyPeriodMonths",
    label: "Warranty Period (Months)",
    type: "number",
    required: true,
    validation: { min: 1, max: 120 },
    layout: { row: 2, column: 2 },
  },
];

interface ProductBulkCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (products: any[]) => void;
}

const ProductBulkCreateDialog: React.FC<ProductBulkCreateDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [_serialNumbers, _setSerialNumbers] = useState<string[]>([""]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const serialNumbers = _serialNumbers.filter((sn) => sn.trim() !== "");

  const form = useForm({
    fields,
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    _setSerialNumbers([""]);
    setBulkErrors([]);
    // setBulkTextMode(false);
    // setBulkText("");
    form.reset();
    onClose();
  };

  const submitHandler = (formData: any) => {
    // if (!validateSerialNumbers()) return;
    const validSerialNumbers = serialNumbers
      .filter((sn) => sn.trim() !== "")
      .map((sn) => sn.trim());

    const common = {
      ...formData,
    };

    const resources = validSerialNumbers.map((serial) => ({
      serialNumber: serial,
    }));

    const body = {
      common,
      resources,
    };

    return onSubmit(body);
    // handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Bulk Product Creation</Typography>
        </Box>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        {bulkErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {bulkErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Product Template Section */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Product Template
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These settings will be applied to all products
            </Typography>

            <FormRenderer mode="create" form={form} onSubmit={submitHandler} />
          </Paper>

          <SerialNumbersSection
            serialNumbers={_serialNumbers}
            setSerialNumbers={_setSerialNumbers}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={form.handleSubmit(submitHandler)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? `Creating...`
            : `Create ${serialNumbers.length} Products`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductBulkCreateDialog;

interface SerialNumbersSectionProps {
  serialNumbers: string[];
  setSerialNumbers: (serialNumbers: string[]) => void;
}

const SerialNumbersSection: React.FC<SerialNumbersSectionProps> = ({
  serialNumbers,
  setSerialNumbers,
}) => {
  const [bulkTextMode, setBulkTextMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const addSerialNumberField = () => {
    setSerialNumbers([...serialNumbers, ""]);
  };

  const removeSerialNumberField = (index: number) => {
    const newSerialNumbers = serialNumbers.filter((_, i) => i !== index);
    setSerialNumbers(newSerialNumbers.length > 0 ? newSerialNumbers : [""]);
  };

  const updateSerialNumber = (index: number, value: string) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const validateSerialNumbers = () => {
    const newErrors: string[] = [];

    const validSerialNumbers = serialNumbers.filter((sn) => sn.trim() !== "");
    if (validSerialNumbers.length === 0) {
      newErrors.push("At least one serial number is required");
    }

    const duplicates = validSerialNumbers.filter(
      (sn, index) => validSerialNumbers.indexOf(sn) !== index
    );
    if (duplicates.length > 0) {
      newErrors.push(
        `Duplicate serial numbers found: ${duplicates.join(", ")}`
      );
    }

    setBulkErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    setSerialNumbers(lines.length > 0 ? lines : [""]);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">Serial Numbers</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={bulkTextMode ? "contained" : "outlined"}
            onClick={() => setBulkTextMode(!bulkTextMode)}
          >
            {bulkTextMode ? "Individual Mode" : "Bulk Text Mode"}
          </Button>
          {/* <input
            accept=".csv,.txt"
            style={{ display: "none" }}
            id="csv-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-upload">
            <Button
              size="small"
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
            >
              Upload CSV
            </Button>
          </label>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={generateSampleCSV}
          >
            Sample CSV
          </Button> */}
        </Stack>
      </Box>

      {bulkTextMode ? (
        <TextField
          multiline
          rows={10}
          fullWidth
          placeholder="Enter serial numbers, one per line..."
          value={bulkText}
          onChange={(e) => handleBulkTextChange(e.target.value)}
          helperText={`${serialNumbers.filter((sn) => sn.trim() !== "").length} serial numbers entered`}
        />
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 1,
            }}
          >
            {serialNumbers.map((serial, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder={`Serial ${index + 1}`}
                  value={serial}
                  onChange={(e) => updateSerialNumber(index, e.target.value)}
                />
                {serialNumbers.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeSerialNumberField(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSerialNumberField}
            >
              Add Serial Number ({serialNumbers.length})
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

// const generateSampleCSV = () => {
//     const csvContent = `Serial Number,Product Name
// SN001,Gateway-001
// SN002,Gateway-002
// SN003,Gateway-003`;

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "bulk_products_template.csv";
//     link.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const text = e.target?.result;
//       if (typeof text === "string") {
//         const lines = text.split("\n").slice(1);
//         const serialNumbers = lines
//           .map((line) => {
//             const parts = line.split(",");
//             return parts[0]?.trim();
//           })
//           .filter((sn): sn is string => Boolean(sn && sn !== ""));
//         setSerialNumbers(serialNumbers.length > 0 ? serialNumbers : [""]);
//       }
//     };
//     reader.readAsText(file);
//   };
