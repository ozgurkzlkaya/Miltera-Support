/**
 * Miltera Fixlog Frontend - Ana Layout Component
 * 
 * Bu component, tüm dashboard sayfaları için ortak layout sağlar.
 * Navigation, sidebar, header ve main content area'yı yönetir.
 * 
 * Özellikler:
 * - Responsive sidebar navigation
 * - User profile menu
 * - Breadcrumb navigation
 * - Mobile-friendly design
 * - Theme integration
 * - Authentication integration
 * 
 * Kullanım: Tüm dashboard sayfaları bu layout'ı kullanır
 */

"use client";

// Material-UI components - layout elemanları için
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton,
  useTheme,
  CircularProgress,
  Container,
  useMediaQuery,
} from "@mui/material";

// Material-UI icons - navigation ve user menu için
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  CorporateFare,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  Person as CustomerIcon,
  Engineering as ServiceIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  BuildCircle as BuildCircleIcon,
} from "@mui/icons-material";

// React hooks ve Next.js navigation
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import AdvancedNotificationBell from "./AdvancedNotificationBell";
import { useAuth } from "../features/auth/useAuth";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "../features/auth/auth.service";
import { NotificationCenter } from "./notifications/NotificationCenter";

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

const drawerWidth = 240;

export const Layout = ({ title, children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Rol bazlı navigation menüsü
  const getNavigationItems = () => {
    const userRole = auth.user?.role;
    
    const baseItems = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    ];

    switch (userRole) {
      case 'ADMIN':
        return [
          ...baseItems,
          { text: "Kullanıcı Yönetimi", icon: <PeopleIcon />, path: "/dashboard/users" },
          { text: "Sistem Ayarları", icon: <SettingsIcon />, path: "/dashboard/settings" },
          { text: "Raporlama", icon: <AssessmentIcon />, path: "/dashboard/reports" },
          { text: "Güvenlik", icon: <SettingsIcon />, path: "/dashboard/security" },
          { text: "Backup", icon: <SettingsIcon />, path: "/dashboard/backup" },
          { text: "Monitoring", icon: <TrendingUpIcon />, path: "/dashboard/monitoring" },
        ];
      
      case 'TSP':
        return [
          ...baseItems,
          { text: "Ürün Ekleme", icon: <InventoryIcon />, path: "/dashboard/products" },
          { text: "Fabrikasyon Testi", icon: <BuildIcon />, path: "/dashboard/testing" },
          { text: "Sevkiyat", icon: <ShippingIcon />, path: "/dashboard/shipments" },
          { text: "Arıza Çözümü", icon: <BuildCircleIcon />, path: "/dashboard/issues" },
          { text: "Servis Operasyonları", icon: <ServiceIcon />, path: "/dashboard/service-operations" },
          { text: "Performans", icon: <TrendingUpIcon />, path: "/dashboard/tsp/performance" },
        ];
      
      case 'CUSTOMER':
        return [
          ...baseItems,
          { text: "Arıza Kaydı", icon: <BuildCircleIcon />, path: "/dashboard/customer/create-issue" },
          { text: "Durum Takibi", icon: <TrendingUpIcon />, path: "/dashboard/customer/track-issues" },
          { text: "Ürün Geçmişi", icon: <InventoryIcon />, path: "/dashboard/customer/product-history" },
          { text: "Destek Talepleri", icon: <ServiceIcon />, path: "/dashboard/customer/support" },
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut().then(() => {
      router.push("/auth");
    });
    handleAvatarClose();
  };

  // Eğer oturum yoksa: token yoksa login'e yönlendir, token varsa AuthProvider senkronize olana kadar kısa loading göster
  useEffect(() => {
    if (!auth.isAuthenticated) {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('authToken')) : null;
      if (!token) {
        router.replace('/auth');
      }
    }
  }, [auth.isAuthenticated, router]);

  // Auth kontrolü - dashboard'a erişimi kontrol et
  if (auth.isLoading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Kimlik doğrulanıyor...
        </Typography>
      </Container>
    );
  }

  if (!auth.isAuthenticated) {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('authToken')) : null;
    // Token varsa AuthProvider state oturana kadar kısa bir bekleme ekranı göster
    if (token) {
      return (
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Oturum doğrulanıyor...
          </Typography>
        </Container>
      );
    }
    // Token yoksa, useEffect yönlendirme yapacak
    return null;
  }

  // Rol bazlı navigation items kullan
  const menuItems = navigationItems;

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Link href="/dashboard">
          <Image
            src="/miltera-logo.png"
            alt="Miltera Logo"
            width={150}
            height={26}
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "100%",
            }}
            priority
          />
        </Link>
      </Toolbar>
      <List>
        {menuItems.filter(Boolean).map((item, index) => (
          <ListItemButton
            key={index}
            component={Link}
            href={item.path}
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <Typography variant="h6" noWrap component="div">
                {pathname}
                {title}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, justifyContent: "center", maxWidth: 600 }}>
              <GlobalSearch 
                placeholder="Tüm sistemde ara..."
                onResultClick={(result) => {
                  router.push(result.url);
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AdvancedNotificationBell />
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {auth?.user?.name || "User"}
              </Typography>
              <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                <Avatar
                  alt={auth?.user?.name || "User"}
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: "14px",
                  }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleAvatarClose}
                onClick={handleAvatarClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 24,
                      height: 24,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleAvatarClose}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {auth?.user?.name || "User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {auth?.user?.email || "user@example.com"}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      }
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
