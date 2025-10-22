/**
 * Miltera Fixlog Frontend - Ana Dashboard Sayfası (Rol Bazlı Yönlendirme)
 * 
 * Bu dosya, kullanıcıların giriş yaptıktan sonra rol bazlı dashboard'a yönlendirildiği ana sayfadır.
 * Temel kullanıcı akışına göre her rol kendi özel dashboard'ına yönlendirilir.
 * 
 * Kullanıcı Akışı:
 * 1. Kullanıcı Girişi (Yönetici/TSP/Müşteri)
 * 2. Rol Bazlı Dashboard Yönlendirme
 *    - ADMIN → /dashboard/admin (Sistem Yönetimi & Raporlama)
 *    - TSP → /dashboard/tsp (Ürün Ekleme → Fabrikasyon Testi → Sevkiyat)
 *    - CUSTOMER → /dashboard/customer (Arıza Kaydı → Durum Takibi)
 * 3. Otomatik Bildirimler ve Durum Güncellemeleri
 * 4. Geçmiş Analizi ve Raporlama
 * 
 * URL: /dashboard
 * Authentication: Gerekli
 */

"use client";

import { 
  Typography, 
  Box, 
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert
} from "@mui/material";

import { 
  AdminPanelSettings as AdminIcon,
  Build as TSPIcon,
  Person as CustomerIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";

import { useAuth } from "../../features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;

    // Authentication kontrolü
    if (!isLoading && !isAuthenticated) {
      // Token varsa AuthProvider birazdan auth'u true yapacak; hemen yönlendirme yapma
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('authToken')) : null;
      if (!token) {
        hasRedirectedRef.current = true;
        router.replace('/auth');
      }
      return;
    }

    // Rol bazlı dashboard yönlendirme (yalnızca bir kez dene)
    if (!isLoading && isAuthenticated && user?.role) {
      hasRedirectedRef.current = true;
      setRedirecting(true);

      let target = '/dashboard';
      switch (user.role) {
        case 'ADMIN':
          target = '/dashboard/admin';
          break;
        case 'TSP':
          target = '/dashboard/tsp';
          break;
        case 'CUSTOMER':
          target = '/dashboard/customer';
          break;
      }

      // Güvenilir yönlendirme
      try {
        router.replace(target);
        // Emniyet: 1.5s sonra hala aynı sayfadaysak hard redirect yap
        setTimeout(() => {
          if (window.location.pathname === '/dashboard') {
            window.location.replace(target);
          }
        }, 1500);
      } catch {
        window.location.replace(target);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Loading state
  if (isLoading || redirecting) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ p: 3 }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Dashboard yükleniyor...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rolünüze göre yönlendiriliyorsunuz
        </Typography>
      </Box>
    );
  }

  // Authentication hatası
  if (!isAuthenticated) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ p: 3 }}
      >
        <Alert severity="error">
          Giriş yapmanız gerekiyor. Yönlendiriliyorsunuz...
        </Alert>
      </Box>
    );
  }

  // Bilinmeyen rol durumu
  if (!user?.role) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
              <DashboardIcon sx={{ fontSize: 64, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" textAlign="center">
                Miltera Fixlog Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Hoş geldiniz, {user?.name || 'Kullanıcı'}!
              </Typography>
              <Alert severity="warning" sx={{ maxWidth: 500 }}>
                Rol bilginiz bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Bu noktaya ulaşılmamalı, ama güvenlik için
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ p: 3 }}
    >
      <CircularProgress />
    </Box>
  );
}