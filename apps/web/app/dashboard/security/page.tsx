"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Grid, Card, CardContent, Switch, FormControlLabel } from "@mui/material";
import { useAuth } from "../../../features/auth/useAuth";
import { Layout } from "../../../components/Layout";

const SecurityPage = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && (!auth.isAuthenticated || auth.user?.role !== "ADMIN")) {
      router.replace("/auth");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, router]);

  if (auth.isLoading || !auth.isAuthenticated || auth.user?.role !== "ADMIN") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography variant="h6">Yükleniyor veya yetkisiz erişim...</Typography>
      </Box>
    );
  }

  return (
    <Layout title="Security">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Güvenlik Ayarları
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uygulama genelindeki güvenlik politikalarını yönetin.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Oturum Yönetimi
                </Typography>
                <FormControlLabel control={<Switch defaultChecked />} label="Zorunlu 2FA" />
                <FormControlLabel control={<Switch />} label="IP Bazlı Erişim Kısıtlama" />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  API Koruma
                </Typography>
                <FormControlLabel control={<Switch defaultChecked />} label="Rate Limiting" />
                <FormControlLabel control={<Switch defaultChecked />} label="CORS Koruması" />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Günlükleme
                </Typography>
                <FormControlLabel control={<Switch defaultChecked />} label="Audit Log" />
                <FormControlLabel control={<Switch />} label="Hassas Alan Maskeleme" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default SecurityPage;


