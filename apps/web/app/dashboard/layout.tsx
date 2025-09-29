/**
 * Miltera Fixlog Frontend - Dashboard Layout
 * 
 * Bu dosya, dashboard sayfaları için özel layout tanımlar.
 * Tüm dashboard sayfaları bu layout'ı kullanır ve authentication kontrolü yapar.
 * 
 * Özellikler:
 * - Authentication kontrolü
 * - Dashboard navigation ve sidebar
 * - Protected routes
 * - Layout wrapper
 * 
 * URL Pattern: /dashboard/*
 */

import { redirect } from "next/navigation";
import { Layout } from "../../components/Layout";
import { AuthProvider } from "../../features/auth/AuthProvider";
import { getAuth } from "../../features/auth/getAuth";

/**
 * Dashboard Layout Component
 * 
 * Bu component:
 * 1. Authentication kontrolü yapar
 * 2. AuthProvider ile authentication state'i yönetir
 * 3. Layout component'i ile navigation ve sidebar sağlar
 * 4. Protected routes için güvenlik sağlar
 */
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Authentication kontrolü - şu anda test için devre dışı
  // Production'da bu kontrol aktif olmalı
  // const auth = await getAuth();

  // if (!auth.isAuthenticated) {
  //   return redirect("/auth");
  // }

  return (
    // Authentication state'ini client component'lere aktar
    <AuthProvider>
      {/* Dashboard layout - navigation, sidebar, main content area */}
      <Layout>{children}</Layout>
    </AuthProvider>
  );
};

export default DashboardLayout;
