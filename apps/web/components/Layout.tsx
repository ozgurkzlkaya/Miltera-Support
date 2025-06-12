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
} from "@mui/icons-material";
import { ReactNode, useState } from "react";

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  {
    icon: <DashboardIcon />,
    text: "Dashboard",
    onClick: () => console.log("Dashboard clicked"),
  },
  {
    icon: <BuildIcon />,
    text: "Products",
    onClick: () => console.log("Products clicked"),
  },
  {
    icon: <AssignmentIcon />,
    text: "Issues",
    onClick: () => console.log("Issues clicked"),
  },
  {
    icon: <ShippingIcon />,
    text: "Shipments",
    onClick: () => console.log("Shipments clicked"),
  },
  {
    icon: <PeopleIcon />,
    text: "Customers",
    onClick: () => console.log("Customers clicked"),
  },
  {
    icon: <AssessmentIcon />,
    text: "Reports",
    onClick: () => console.log("Reports clicked"),
  },
  {
    icon: <SettingsIcon />,
    text: "Settings",
    onClick: () => console.log("Settings clicked"),
  },
  {
    icon: <NotificationsIcon />,
    text: "Notifications",
    onClick: () => console.log("Notifications clicked"),
  },
];

export const Layout = ({ title, children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            onClick={item.onClick}
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
