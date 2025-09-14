"use client";

import {
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";
import { useState } from "react";
import {
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from "@mui/icons-material";

// Company interface
interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  employees: number;
  industry: string;
  createdAt: string;
}

// Mock company data
const initialCompanies: Company[] = [
  {
    id: "1",
    name: "Miltera Teknoloji",
    email: "info@miltera.com",
    phone: "+90 212 555 0100",
    address: "İstanbul, Türkiye",
    isActive: true,
    employees: 25,
    industry: "Teknoloji",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Test Company",
    email: "contact@testcompany.com",
    phone: "+90 312 555 0200",
    address: "Ankara, Türkiye",
    isActive: true,
    employees: 15,
    industry: "Danışmanlık",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    name: "Service Provider Co.",
    email: "hello@serviceprovider.com", 
    phone: "+90 232 555 0300",
    address: "İzmir, Türkiye",
    isActive: false,
    employees: 8,
    industry: "Hizmet",
    createdAt: "2024-01-05"
  },
  {
    id: "4",
    name: "Tech Solutions Ltd.",
    email: "info@techsolutions.com", 
    phone: "+90 216 555 0400",
    address: "Bursa, Türkiye",
    isActive: true,
    employees: 32,
    industry: "Yazılım",
    createdAt: "2024-01-20"
  }
];

const industries = [
  "Teknoloji",
  "Yazılım", 
  "Danışmanlık",
  "Hizmet",
  "Eğitim",
  "Sağlık",
  "Finans",
  "E-ticaret"
];

const getIndustryColor = (industry: string) => {
  switch (industry) {
    case "Teknoloji":
      return "primary";
    case "Yazılım":
      return "secondary";
    case "Danışmanlık":
      return "info";
    case "Hizmet":
      return "warning";
    default:
      return "default";
  }
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    employees: 1,
    industry: "",
    isActive: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info"
  });

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        employees: company.employees,
        industry: company.industry,
        isActive: company.isActive
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        employees: 1,
        industry: "",
        isActive: true
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCompany(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      employees: 1,
      industry: "",
      isActive: true
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompany = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.industry) {
      setSnackbar({
        open: true,
        message: "Lütfen tüm gerekli alanları doldurun",
        severity: "error"
      });
      return;
    }

    if (editingCompany) {
      // Update existing company
      setCompanies(prev => prev.map(company => 
        company.id === editingCompany.id 
          ? { ...company, ...formData }
          : company
      ));
      setSnackbar({
        open: true,
        message: "Şirket başarıyla güncellendi",
        severity: "success"
      });
    } else {
      // Add new company
      const newCompany: Company = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCompanies(prev => [newCompany, ...prev]);
      setSnackbar({
        open: true,
        message: "Şirket başarıyla eklendi",
        severity: "success"
      });
    }
    
    handleCloseModal();
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("Bu şirketi silmek istediğinizden emin misiniz?")) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      setSnackbar({
        open: true,
        message: "Şirket başarıyla silindi",
        severity: "success"
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Şirket Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: 2 }}
        >
          Yeni Şirket
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Şirket
                  </Typography>
                  <Typography variant="h5" component="div">
                    {companies.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aktif Şirket
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {companies.filter(c => c.isActive).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Çalışan
                  </Typography>
                  <Typography variant="h5" component="div" color="info.main">
                    {companies.reduce((sum, c) => sum + c.employees, 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Sektörler
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main">
                    {new Set(companies.map(c => c.industry)).size}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              <input
                type="text"
                placeholder="Şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  flex: 1,
                  padding: "8px 0"
                }}
              />
            </Box>
            <Tooltip title="Filtreler">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Grid container spacing={3}>
        {filteredCompanies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.id}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                boxShadow: 1,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                "&:hover": {
                  boxShadow: 3,
                  borderColor: "primary.main"
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                      {company.name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {company.name}
                      </Typography>
                      <Chip 
                        label={company.industry} 
                        color={getIndustryColor(company.industry) as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenModal(company)}
                        sx={{ color: "primary.main" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Sil">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteCompany(company.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ space: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {company.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {company.phone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {company.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      {company.employees} çalışan
                    </Typography>
                    
                    <Chip 
                      label={company.isActive ? "Aktif" : "Pasif"} 
                      color={company.isActive ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCompanies.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: "center", p: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Arama kriterlerinize uygun şirket bulunamadı
          </Typography>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingCompany ? "Şirket Düzenle" : "Yeni Şirket Ekle"}
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Şirket Adı"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Çalışan Sayısı"
                type="number"
                value={formData.employees}
                onChange={(e) => handleInputChange("employees", parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sektör</InputLabel>
                <Select
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  label="Sektör"
                  required
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.value === "true")}
                  label="Durum"
                >
                  <MenuItem value="true">Aktif</MenuItem>
                  <MenuItem value="false">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleSaveCompany} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ borderRadius: 2 }}
          >
            {editingCompany ? "Güncelle" : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompaniesPage;