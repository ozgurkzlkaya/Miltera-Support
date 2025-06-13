"use client";

import { Typography, Grid, Card, CardContent } from "@mui/material";
import { Build as RepairIcon, Warning as WarningIcon, CheckCircle as CompletedIcon } from "@mui/icons-material";

interface CustomerStats {
  totalProducts: number;
  activeIssues: number;
  completedIssues: number;
  productsUnderWarranty: number;
}

interface CustomerStatsGridProps {
  stats: CustomerStats;
  onStatClick?: (statType: string) => void;
}

export const CustomerStatsGrid = ({ stats, onStatClick }: CustomerStatsGridProps) => {
  const statItems = [
    {
      key: "totalProducts",
      icon: <RepairIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />,
      value: stats.totalProducts,
      label: "Toplam Ürün",
      color: "primary"
    },
    {
      key: "activeIssues",
      icon: <WarningIcon sx={{ fontSize: 40, color: "#f57c00", mb: 1 }} />,
      value: stats.activeIssues,
      label: "Aktif Arıza",
      color: "warning.main"
    },
    {
      key: "completedIssues",
      icon: <CompletedIcon sx={{ fontSize: 40, color: "#388e3c", mb: 1 }} />,
      value: stats.completedIssues,
      label: "Tamamlanan Servis",
      color: "success.main"
    },
    {
      key: "productsUnderWarranty",
      icon: <CompletedIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />,
      value: stats.productsUnderWarranty,
      label: "Garanti Altında",
      color: "primary"
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {statItems.map((item) => (
        <Grid key={item.key} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            sx={{ 
              textAlign: "center", 
              height: "100%",
              cursor: onStatClick ? "pointer" : "default",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": onStatClick ? {
                transform: "translateY(-4px)",
                boxShadow: 3,
              } : {}
            }}
            onClick={() => onStatClick?.(item.key)}
          >
            <CardContent>
              {item.icon}
              <Typography variant="h4" color={item.color as any}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 