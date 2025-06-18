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

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const drawerWidth = 240;

export const Layout = ({ title, children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      icon: <HomeIcon />,
      text: "Home",
      path: "/",
    },
    {
      icon: <DashboardIcon />,
      text: "Dashboard",
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
    {
      icon: <PeopleIcon />,
      text: "Customers",
      path: "/dashboard/customers",
    },
    {
      icon: <AssessmentIcon />,
      text: "Reports",
      path: "/dashboard/reports",
    },
    {
      icon: <CustomerIcon />,
      text: "Customer Portal",
      path: "/customer-portal",
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item, index) => (
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
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
