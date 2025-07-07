"use client";

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
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  CorporateFare,
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
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../features/auth/useAuth";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "../features/auth/auth.service";

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

  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  if (auth.isLoading || !auth.isAuthenticated) {
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
      </Container>
    );
  }

  const menuItems = [
    {
      icon: <DashboardIcon />,
      text: "Overview",
      path: "/dashboard",
    },
    {
      icon: <BuildIcon />,
      text: "Products",
      path: "/dashboard/products",
    },
    {
      icon: <AssignmentIcon />,
      text: "Issues",
      path: "/dashboard/issues",
    },
    {
      icon: <ShippingIcon />,
      text: "Shipments",
      path: "/dashboard/shipments",
    },

    // {
    //   icon: <AssessmentIcon />,
    //   text: "Reports",
    //   path: "/dashboard/reports",
    // },

    ...(auth.user.role !== "CUSTOMER"
      ? [
          {
            icon: <BusinessIcon />,
            text: "Companies",
            path: "/dashboard/companies",
          },
          {
            icon: <PeopleIcon />,
            text: "Users",
            path: "/dashboard/users",
          },
        ]
      : []),
  ];

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
              maxWidth: "100%",
              height: "auto",
            }}
            priority
          />
        </Link>
      </Toolbar>
      <List>
        {menuItems.filter(Boolean).map((item, index) => (
          <ListItem
            key={index}
            onClick={() => handleNavigation(item.path)}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {auth.user.name}
              </Typography>
              <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                <Avatar
                  alt={auth.user.name}
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
                      {auth.user.name || "User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {auth.user.email || "user@example.com"}
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
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: 3,
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
