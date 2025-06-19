import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface BulkProductCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (products: any[]) => void;
  productModelOptions: Array<{ value: number; label: string }>;
  companyOptions: Array<{ value: number; label: string }>;
  stockLocationOptions: Array<{ value: number; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
}

interface ProductTemplate {
  productModelId: number;
  companyId: number | null;
  stockLocationId: number | null;
  currentStatus: string;
  productionDate: string;
  warrantyStartDate: string;
  warrantyPeriodMonths: number;
  name: string;
}

export const BulkProductCreator: React.FC<BulkProductCreatorProps> = ({
  open,
  onClose,
  onSubmit,
  productModelOptions,
  companyOptions,
  stockLocationOptions,
  statusOptions,
}) => {
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [productTemplate, setProductTemplate] = useState<ProductTemplate>({
    productModelId: 1,
    companyId: null,
    stockLocationId: null,
          currentStatus: 'ACTIVE',
      productionDate: new Date().toISOString().split('T')[0],
      warrantyStartDate: new Date().toISOString().split('T')[0],
      warrantyPeriodMonths: 24,
      name: 'Auto-Generated',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [bulkTextMode, setBulkTextMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleClose = () => {
    setSerialNumbers(['']);
    setProductTemplate({
      productModelId: 1,
      companyId: null,
      stockLocationId: null,
      currentStatus: 'ACTIVE',
      productionDate: new Date().toISOString().split('T')[0],
      warrantyStartDate: '',
      warrantyPeriodMonths: 24,
      name: '',
    });
    setErrors([]);
    setBulkTextMode(false);
    setBulkText('');
    onClose();
  };

  const addSerialNumberField = () => {
      setSerialNumbers([...serialNumbers, '']);
  };

  const removeSerialNumberField = (index: number) => {
    const newSerialNumbers = serialNumbers.filter((_, i) => i !== index);
    setSerialNumbers(newSerialNumbers.length > 0 ? newSerialNumbers : ['']);
  };

  const updateSerialNumber = (index: number, value: string) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const lines = text.split('\n').filter(line => line.trim() !== '');
    setSerialNumbers(lines.length > 0 ? lines : ['']);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    const validSerialNumbers = serialNumbers.filter(sn => sn.trim() !== '');
    if (validSerialNumbers.length === 0) {
      newErrors.push('At least one serial number is required');
    }

    const duplicates = validSerialNumbers.filter((sn, index) => 
      validSerialNumbers.indexOf(sn) !== index
    );
    if (duplicates.length > 0) {
      newErrors.push(`Duplicate serial numbers found: ${duplicates.join(', ')}`);
    }


    if (!productTemplate.productModelId) {
      newErrors.push('Product model is required');
    }
    if (!productTemplate.productionDate) {
      newErrors.push('Production date is required');
    }
    if (!productTemplate.warrantyPeriodMonths || productTemplate.warrantyPeriodMonths < 1) {
      newErrors.push('Valid warranty period is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const validSerialNumbers = serialNumbers.filter(sn => sn.trim() !== '');
    const selectedModel = productModelOptions.find(m => m.value === productTemplate.productModelId);
    
    const products = validSerialNumbers.map((serial, index) => ({
      ...productTemplate,
      serial: serial.trim(),
      name: productTemplate.name || `${selectedModel?.label || 'Product'}-${String(index + 1).padStart(3, '0')}`,
    }));

    onSubmit(products);
    handleClose();
  };

  const generateSampleCSV = () => {
    const csvContent = `Serial Number,Product Name
SN001,Gateway-001
SN002,Gateway-002
SN003,Gateway-003`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_products_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const lines = text.split('\n').slice(1);
        const serialNumbers = lines
          .map(line => {
            const parts = line.split(',');
            return parts[0]?.trim();
          })
          .filter((sn): sn is string => Boolean(sn && sn !== ''));
      
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Bulk Product Creation</Typography>
        
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
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
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                  <InputLabel>Product Model</InputLabel>
                  <Select
                    value={productTemplate.productModelId}
                    onChange={(e) => setProductTemplate({
                      ...productTemplate,
                      productModelId: Number(e.target.value)
                    })}
                    label="Product Model"
                  >
                    {productModelOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 150, flex: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={productTemplate.currentStatus}
                    onChange={(e) => setProductTemplate({
                      ...productTemplate,
                      currentStatus: e.target.value
                    })}
                    label="Status"
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                  <InputLabel>Company (Optional)</InputLabel>
                  <Select
                    value={productTemplate.companyId || ''}
                    onChange={(e) => setProductTemplate({
                      ...productTemplate,
                      companyId: e.target.value ? Number(e.target.value) : null
                    })}
                    label="Company (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {companyOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                  <InputLabel>Stock Location (Optional)</InputLabel>
                  <Select
                    value={productTemplate.stockLocationId || ''}
                    onChange={(e) => setProductTemplate({
                      ...productTemplate,
                      stockLocationId: e.target.value ? Number(e.target.value) : null
                    })}
                    label="Stock Location (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {stockLocationOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Production Date"
                  type="date"
                  value={productTemplate.productionDate}
                  onChange={(e) => setProductTemplate({
                    ...productTemplate,
                    productionDate: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150, flex: 1 }}
                />
                
                <TextField
                  label="Warranty Start Date"
                  type="date"
                  value={productTemplate.warrantyStartDate}
                  onChange={(e) => setProductTemplate({
                    ...productTemplate,
                    warrantyStartDate: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150, flex: 1 }}
                />
                
                <TextField
                  label="Warranty Period (Months)"
                  type="number"
                  value={productTemplate.warrantyPeriodMonths}
                  onChange={(e) => setProductTemplate({
                    ...productTemplate,
                    warrantyPeriodMonths: Number(e.target.value)
                  })}
                  inputProps={{ min: 1, max: 120 }}
                  sx={{ minWidth: 150, flex: 1 }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Serial Numbers Section */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Serial Numbers
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={bulkTextMode ? 'contained' : 'outlined'}
                  onClick={() => setBulkTextMode(!bulkTextMode)}
                >
                  {bulkTextMode ? 'Individual Mode' : 'Bulk Text Mode'}
                </Button>
                <input
                  accept=".csv,.txt"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="csv-upload">
                  <Button size="small" variant="outlined" component="span" startIcon={<UploadIcon />}>
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
                </Button>
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
                helperText={`${serialNumbers.filter(sn => sn.trim() !== '').length} serial numbers entered`}
              />
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 1 
                }}>
                  {serialNumbers.map((serial, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
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
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create {serialNumbers.filter(sn => sn.trim() !== '').length} Products
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 