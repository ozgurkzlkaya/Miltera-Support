"use client";

import { Box, Typography, Button, Card, CardContent, Grid, Chip, Avatar, IconButton, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon
} from "@mui/icons-material";

// Mock user data for now
const mockUsers = [
  {
    id: "1",
    name: "Ahmet Özgür Kızılkaya",
    email: "ozgurkizilkayags@gmail.com",
    role: "ADMIN",
    company: { name: "Miltera Teknoloji" },
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Test User 6",
    email: "testuser6@gmail.com",
    role: "USER",
    company: { name: "Test Company" },
    isActive: true,
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    name: "John Doe",
    email: "john.doe@example.com", 
    role: "TSP",
    company: { name: "Service Provider Co." },
    isActive: false,
    createdAt: "2024-01-05"
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "error";
    case "TSP":
      return "warning";
    case "USER":
      return "info";
    default:
      return "default";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "TSP":
      return "Teknik Servis";
    case "USER":
      return "Kullanıcı";
    default:
      return role;
  }
};

const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = () => {
    console.log("Add user clicked");
    // TODO: Implement add user functionality
  };

  const handleEditUser = (userId: string) => {
    console.log("Edit user clicked:", userId);
    // TODO: Implement edit user functionality
  };

  const handleDeleteUser = (userId: string) => {
    console.log("Delete user clicked:", userId);
    // TODO: Implement delete user functionality
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ borderRadius: 2 }}
        >
          Yeni Kullanıcı
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
                    Toplam Kullanıcı
                  </Typography>
                  <Typography variant="h5" component="div">
                    {users.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
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
                    Aktif Kullanıcı
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <PersonIcon />
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
                    Admin
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main">
                    {users.filter(u => u.role === "ADMIN").length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "error.main" }}>
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
                    Teknik Servis
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main">
                    {users.filter(u => u.role === "TSP").length}
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

      {/* Users List */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Kullanıcı Listesi
          </Typography>
          
          {users.map((user) => (
            <Card 
              key={user.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  boxShadow: 2,
                  borderColor: "primary.main"
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" component="div">
                        {user.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.company?.name || "Şirket bilgisi yok"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip 
                      label={getRoleLabel(user.role)} 
                      color={getRoleColor(user.role) as any}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                    
                    <Chip 
                      label={user.isActive ? "Aktif" : "Pasif"} 
                      color={user.isActive ? "success" : "default"}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                    
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditUser(user.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsersPage;