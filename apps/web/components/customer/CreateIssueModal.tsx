"use client";

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
} from "@mui/material";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  serialNumber: string;
}

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (issueData: any) => void;
  products: Product[];
}

export const CreateIssueModal = ({ open, onClose, onSubmit, products }: CreateIssueModalProps) => {
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    description: "",
    priority: "Medium",
    category: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = [
    { value: "Low", label: "Düşük" },
    { value: "Medium", label: "Orta" },
    { value: "High", label: "Yüksek" },
    { value: "Critical", label: "Kritik" },
  ];

  const categories = [
    { value: "connection", label: "Bağlantı Sorunu" },
    { value: "calibration", label: "Kalibrasyon" },
    { value: "hardware", label: "Donanım Arızası" },
    { value: "software", label: "Yazılım Sorunu" },
    { value: "maintenance", label: "Bakım Talebi" },
    { value: "other", label: "Diğer" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) newErrors.productId = "Lütfen bir ürün seçin";
    if (!formData.title.trim()) newErrors.title = "Başlık zorunludur";
    if (!formData.description.trim()) newErrors.description = "Açıklama zorunludur";
    if (!formData.category) newErrors.category = "Kategori seçimi zorunludur";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find(p => p.id === Number(formData.productId));
      const issueData = {
        ...formData,
        productName: selectedProduct?.name,
        serialNumber: selectedProduct?.serialNumber,
        createdDate: new Date().toISOString(),
        status: "Pending",
        id: `ARZ-${Date.now()}`,
      };

      await onSubmit(issueData);
      
      // Reset form
      setFormData({
        productId: "",
        title: "",
        description: "",
        priority: "Medium",
        category: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: "",
      title: "",
      description: "",
      priority: "Medium",
      category: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Yeni Arıza Kaydı Oluştur</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <Alert severity="info">
            Arıza kaydınız oluşturulduktan sonra, teknik ekibimiz en kısa sürede değerlendirip size geri dönüş yapacaktır.
          </Alert>

          <FormControl fullWidth error={!!errors.productId}>
            <InputLabel>Ürün Seçimi</InputLabel>
            <Select
              value={formData.productId}
              label="Ürün Seçimi"
              onChange={(e) => handleInputChange("productId", e.target.value)}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} - {product.serialNumber}
                </MenuItem>
              ))}
            </Select>
            {errors.productId && (
              <Typography variant="caption" color="error">
                {errors.productId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Arıza Kategorisi</InputLabel>
            <Select
              value={formData.category}
              label="Arıza Kategorisi"
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error">
                {errors.category}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Arıza Başlığı"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            placeholder="Örn: Cihaz açılmıyor, Bağlantı kopuyor"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Arıza Açıklaması"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Lütfen yaşadığınız sorunu detaylı olarak açıklayın..."
          />

          <FormControl fullWidth>
            <InputLabel>Öncelik Durumu</InputLabel>
            <Select
              value={formData.priority}
              label="Öncelik Durumu"
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  {priority.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Oluşturuluyor..." : "Arıza Kaydı Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 