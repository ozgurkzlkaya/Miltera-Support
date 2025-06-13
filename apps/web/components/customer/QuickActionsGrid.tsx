"use client";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Assignment as IssueIcon,
  LocalShipping as ShippingIcon,
  Download as DownloadIcon,
  Phone as SupportIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  Inventory as ProductsIcon,
  Build as ServiceIcon,
} from "@mui/icons-material";

interface QuickActionsGridProps {
  onCreateIssue: () => void;
  onTrackShipments: () => void;
  onDownloadReports: () => void;
  onContactSupport: () => void;
  onScheduleService?: () => void;
  onViewNotifications?: () => void;
  onViewProducts?: () => void;
  onViewServiceOperations?: () => void;
  notificationCount?: number;
}

interface ActionItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  onClick: () => void;
  variant: "contained" | "outlined";
  color: string;
  gradient?: string;
  badge?: number;
}

export const QuickActionsGrid = ({
  onCreateIssue,
  onTrackShipments,
  onDownloadReports,
  onContactSupport,
  onScheduleService,
  onViewNotifications,
  onViewProducts,
  onViewServiceOperations,
  notificationCount = 0,
}: QuickActionsGridProps) => {
  const actions: ActionItem[] = [
    {
      key: "createIssue",
      title: "Yeni Arıza Kaydı",
      description: "Ürünlerinizle ilgili sorun bildirin",
      icon: <IssueIcon />,
      onClick: onCreateIssue,
      variant: "contained" as const,
      color: "#1976d2",
      gradient: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
    },
    {
      key: "trackShipments",
      title: "Sevkiyat Takibi",
      description: "Gönderilerinizi takip edin",
      icon: <ShippingIcon />,
      onClick: onTrackShipments,
      variant: "outlined" as const,
      color: "#f57c00",
    },
    {
      key: "downloadReports",
      title: "Raporlar",
      description: "Servis raporlarınızı indirin",
      icon: <DownloadIcon />,
      onClick: onDownloadReports,
      variant: "outlined" as const,
      color: "#388e3c",
    },
    {
      key: "contactSupport",
      title: "Destek Talebi",
      description: "Teknik destek alın",
      icon: <SupportIcon />,
      onClick: onContactSupport,
      variant: "outlined" as const,
      color: "#d32f2f",
    },
  ];

  // Add products action if provided
  if (onViewProducts) {
    actions.unshift({
      key: "viewProducts",
      title: "Ürünlerim",
      description: "Tüm ürünlerinizi görüntüleyin",
      icon: <ProductsIcon />,
      onClick: onViewProducts,
      variant: "contained" as const,
      color: "#2e7d32",
      gradient: "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)",
    });
  }

  // Add optional actions if provided
  if (onScheduleService) {
    actions.push({
      key: "scheduleService",
      title: "Servis Planla",
      description: "Bakım randevusu alın",
      icon: <ScheduleIcon />,
      onClick: onScheduleService,
      variant: "outlined" as const,
      color: "#7b1fa2",
    });
  }

  if (onViewServiceOperations) {
    actions.push({
      key: "serviceOperations",
      title: "Servis İşlemleri",
      description: "Cihazlarınıza yapılan servisleri görüntüleyin",
      icon: <ServiceIcon />,
      onClick: onViewServiceOperations,
      variant: "outlined" as const,
      color: "#9c27b0",
    });
  }

  if (onViewNotifications) {
    actions.push({
      key: "notifications",
      title: "Bildirimler",
      description: `${notificationCount} yeni bildirim`,
      icon: <NotificationIcon />,
      onClick: onViewNotifications,
      variant: "outlined" as const,
      color: "#1976d2",
      badge: notificationCount,
    });
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Hızlı İşlemler
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {actions.map((action) => (
            <Grid
              key={action.key}
              size={{ xs: 12, sm: 6, md: actions.length <= 4 ? 6 : 4 }}
              sx={{ display: "flex" }}
            >
              <Tooltip title={action.description} placement="top">
                <Button
                  fullWidth
                  variant={action.variant}
                  startIcon={
                    <Box sx={{ position: "relative" }}>
                      {action.icon}
                      {action.badge && action.badge > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            backgroundColor: "error.main",
                            color: "white",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {action.badge > 9 ? "9+" : action.badge}
                        </Box>
                      )}
                    </Box>
                  }
                  onClick={action.onClick}
                  sx={{
                    py: 1.5,
                    px: 2,
                    flex: 1, // Take full height of flex container
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    transition: "all 0.3s ease",
                    ...(action.variant === "contained"
                      ? {
                          background: action.gradient || action.color,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 4,
                            background: action.gradient
                              ? "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)"
                              : action.color,
                          },
                        }
                      : {
                          borderColor: action.color,
                          color: action.color,
                          "&:hover": {
                            backgroundColor: action.color + "10",
                            borderColor: action.color,
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                          },
                        }),
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={action.variant === "contained" ? 600 : 500}
                    sx={{
                      color:
                        action.variant === "contained" ? "white" : action.color,
                      textAlign: "center",
                    }}
                  >
                    {action.title}
                  </Typography>
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Additional Help Section */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>💡 İpucu:</strong> Acil durumlarda direkt olarak teknik
            destek hattımızı arayabilirsiniz.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Teknik Destek: +90 212 555 0123 (7/24 hizmet)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
