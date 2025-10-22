"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { useAuth } from "../../../features/auth/useAuth";
import { Layout } from "../../../components/Layout";

const MonitoringPage = () => {
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
    <Layout title="Monitoring">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistem İzleme
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerçek zamanlı sistem metrikleri, servis durumları ve performans.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  API Sağlık Durumu
                </Typography>
                <Typography variant="body2">Durum: Çevrimiçi</Typography>
                <Typography variant="body2">Ortalama Yanıt: 120ms</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  WebSocket Bağlantısı
                </Typography>
                <Typography variant="body2">Durum: Bağlı</Typography>
                <Typography variant="body2">Aktif Oturum: 3</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Veritabanı
                </Typography>
                <Typography variant="body2">Bağlantı: Sağlıklı</Typography>
                <Typography variant="body2">Aktif İşlemler: 5</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default MonitoringPage;


