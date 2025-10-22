"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Grid, Card, CardContent, Button, Stack } from "@mui/material";
import { useAuth } from "../../../features/auth/useAuth";
import { Layout } from "../../../components/Layout";

const BackupPage = () => {
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
    <Layout title="Backup">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistem Yedekleme
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sistem yedeklerini oluşturun, indirin ve geri yükleyin.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Yedek Oluştur
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained">Tam Yedek</Button>
                  <Button variant="outlined">Sadece Veritabanı</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Yedekleri Yönet
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined">Yedekleri Listele</Button>
                  <Button variant="outlined" color="error">Eski Yedekleri Sil</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Geri Yükleme
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined">Yedekten Yükle</Button>
                  <Button variant="outlined">Dışarı Aktar</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default BackupPage;


