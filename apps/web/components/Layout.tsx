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
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
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
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticatedAuth } from "../features/auth/useAuth";
import Image from "next/image";

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const drawerWidth = 240;

export const Layout = ({ title, children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const auth = useAuthenticatedAuth();

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
  ];

  if (auth.role !== "customer") {
    menuItems.push({
      icon: <PeopleIcon />,
      text: "Customers",
      path: "/dashboard/customers",
    });
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Image
          src="/miltera-logo.png"
          alt="Miltera Logo"
          width={80}
          height={26}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
          priority
        />
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
    </div>
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
                {title}
              </Typography>
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
