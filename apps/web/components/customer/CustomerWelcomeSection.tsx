"use client";

import { Typography, Grid, Paper, Avatar, useTheme } from "@mui/material";

interface CustomerInfo {
  companyName: string;
  contactPerson: string;
  accountManager: string;
  phone: string;
  email: string;
  memberSince: string;
}

interface CustomerWelcomeSectionProps {
  customerInfo: CustomerInfo;
}

export const CustomerWelcomeSection = ({
  customerInfo,
}: CustomerWelcomeSectionProps) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light || "#7fa8d3"} 100%)`,
        color: "white",
      }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h4" gutterBottom>
            Hoş Geldiniz, {customerInfo.companyName}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Miltera Teknik Servis Portalı'na hoş geldiniz. Ürünlerinizi takip
            edin, arıza kayıtlarını görüntüleyin ve destek alın.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto",
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          >
            {customerInfo.companyName.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {customerInfo.contactPerson}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
