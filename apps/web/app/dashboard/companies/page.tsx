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
  Alert,
  CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";
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

// Company interface updated to match API
interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPersonName?: string;
  contactPersonSurname?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  isManufacturer?: boolean;
  createdAt: string;
}

// sektör alanı backend'de olmadığı için kaldırıldı

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    isManufacturer: false,
    contactPersonName: "",
    contactPersonSurname: "",
    contactPersonEmail: "",
    contactPersonPhone: ""
  });
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info"
  });

  // Load companies from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const [companiesRes, usersRes] = await Promise.all([
          fetch('http://localhost:3011/api/v1/companies', { headers }),
          fetch('http://localhost:3011/api/v1/users', { headers }).catch(() => null)
        ]);

        if (companiesRes?.ok) {
          const companiesJson = await companiesRes.json();
          const list = companiesJson.data || [];
          setCompanies(list);

          // kullanıcıları isteğe bağlı çek: yetki yoksa 0 kalır
          if (usersRes && usersRes.ok) {
            const usersJson = await usersRes.json();
            const counts: Record<string, number> = {};
            (Array.isArray(usersJson.data) ? usersJson.data : []).forEach((u: any) => {
              const cid = u.companyId;
              if (!cid) return;
              counts[cid] = (counts[cid] || 0) + 1;
            });
            setEmployeeCounts(counts);
          } else {
            setEmployeeCounts({});
          }
        } else {
          throw new Error('Şirketler yüklenemedi');
        }
      } catch (error) {
        console.error('Error loading companies:', error);
        setError('Şirketler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Durum toggle backend'de olmadığı için kaldırıldı

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        isManufacturer: company.isManufacturer ?? false,
        contactPersonName: company.contactPersonName || "",
        contactPersonSurname: company.contactPersonSurname || "",
        contactPersonEmail: company.contactPersonEmail || "",
        contactPersonPhone: company.contactPersonPhone || ""
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        isManufacturer: false,
        contactPersonName: "",
        contactPersonSurname: "",
        contactPersonEmail: "",
        contactPersonPhone: ""
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
      isManufacturer: false,
      contactPersonName: "",
      contactPersonSurname: "",
      contactPersonEmail: "",
      contactPersonPhone: ""
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompany = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setSnackbar({
        open: true,
        message: "Lütfen tüm gerekli alanları doldurun",
        severity: "error"
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      if (editingCompany) {
        // Update existing company
        const response = await fetch(`http://localhost:3011/api/v1/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedCompany = await response.json();
          setCompanies(prev => prev.map(company => 
            company.id === editingCompany.id ? updatedCompany.data : company
          ));
          setSnackbar({
            open: true,
            message: "Şirket başarıyla güncellendi",
            severity: "success"
          });
        } else {
          throw new Error('Şirket güncellenemedi');
        }
      } else {
        // Add new company
        const response = await fetch('http://localhost:3011/api/v1/companies', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const newCompany = await response.json();
          setCompanies(prev => [newCompany.data, ...prev]);
          setSnackbar({
            open: true,
            message: "Yeni şirket başarıyla eklendi",
            severity: "success"
          });
        } else {
          throw new Error('Şirket oluşturulamadı');
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving company:', error);
      setSnackbar({
        open: true,
        message: 'Şirket kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm("Bu şirketi silmek istediğinizden emin misiniz?")) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`http://localhost:3011/api/v1/companies/${companyId}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          setCompanies(prev => prev.filter(company => company.id !== companyId));
          setSnackbar({
            open: true,
            message: "Şirket başarıyla silindi",
            severity: "success"
          });
        } else {
          throw new Error('Şirket silinemedi');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        setSnackbar({
          open: true,
          message: 'Şirket silinirken hata oluştu',
          severity: 'error'
        });
      }
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry || "").toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

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
                    Üretici Firma
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {companies.filter(c => c.isManufacturer).length}
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
                    {companies.reduce((sum, c) => sum + (employeeCounts[c.id] || 0), 0)}
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
                    {new Set(companies.map(c => c.industry).filter(Boolean)).size}
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
      {!loading && (
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
                      {(company.name || "").charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {company.name}
                      </Typography>
                      {company.isManufacturer && (
                        <Chip label="Üretici" color="primary" size="small" sx={{ mt: 0.5 }} />
                      )}
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
                      {(employeeCounts[company.id] || 0)} çalışan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {!loading && filteredCompanies.length === 0 && (
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
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Üretici</InputLabel>
                <Select
                  value={formData.isManufacturer ? 'true' : 'false'}
                  onChange={(e) => handleInputChange("isManufacturer", e.target.value === 'true')}
                  label="Üretici"
                >
                  <MenuItem value="false">Hayır</MenuItem>
                  <MenuItem value="true">Evet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlgili Kişi Adı"
                value={formData.contactPersonName}
                onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlgili Kişi Soyadı"
                value={formData.contactPersonSurname}
                onChange={(e) => handleInputChange("contactPersonSurname", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlgili Kişi E-posta"
                value={formData.contactPersonEmail}
                onChange={(e) => handleInputChange("contactPersonEmail", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlgili Kişi Telefon"
                value={formData.contactPersonPhone}
                onChange={(e) => handleInputChange("contactPersonPhone", e.target.value)}
                sx={{ mb: 2 }}
              />
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