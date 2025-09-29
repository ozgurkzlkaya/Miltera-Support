/**
 * Miltera Fixlog Frontend - Ana Layout Dosyası
 * 
 * Bu dosya, Next.js App Router'ın root layout'ını tanımlar.
 * Tüm sayfalar bu layout'ı kullanır ve global provider'ları burada tanımlarız.
 * 
 * Özellikler:
 * - Next.js App Router yapısı
 * - Internationalization (i18n) desteği
 * - Global provider'lar (Theme, Auth, Query Client)
 * - SEO metadata
 * - Responsive viewport ayarları
 * 
 * Provider'lar:
 * - ThemeProvider: Material-UI tema yönetimi
 * - QueryClient: React Query için data fetching
 * - AuthProvider: Authentication state yönetimi
 * - NotificationProvider: Bildirim sistemi
 */

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Providers from "./providers";

// SEO ve metadata ayarları
export const metadata: Metadata = {
  title: "Miltera Support",
  description: "Miltera Support Management System",
};

// Viewport ayarları - responsive tasarım için
export const viewport = {
  width: "device-width",        // Cihaz genişliğine göre ayarla
  initialScale: 1,              // Başlangıç zoom seviyesi
  maximumScale: 1,              // Maksimum zoom seviyesi
  userScalable: false,          // Kullanıcı zoom yapamaz (mobile UX için)
};

/**
 * Root Layout Component
 * 
 * Bu component:
 * 1. HTML yapısını oluşturur
 * 2. Locale'i belirler (i18n için)
 * 3. Tüm provider'ları sarmalar
 * 4. Global CSS ve font'ları yükler
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Kullanıcının dil tercihini al (i18n için)
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        {/* Tüm provider'ları sarmala - theme, auth, query client, notifications */}
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
