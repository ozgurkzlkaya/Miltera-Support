/**
 * Miltera Fixlog Frontend - Global Providers
 * 
 * Bu dosya, tüm uygulama genelinde kullanılan provider'ları tanımlar.
 * React Context API kullanarak global state yönetimi sağlar.
 * 
 * Provider'lar (içten dışa sıralama):
 * 1. QueryClientProvider: React Query için data fetching ve caching
 * 2. AppRouterCacheProvider: Material-UI SSR cache yönetimi
 * 3. AuthProvider: Authentication state yönetimi
 * 4. ThemeProvider: Material-UI tema yönetimi
 * 5. WebSocketProvider: Real-time bağlantı yönetimi
 * 6. AdvancedNotificationProvider: Bildirim sistemi
 * 7. NextIntlClientProvider: Internationalization (i18n)
 * 
 * Hydration sorunlarını önlemek için client-side rendering kontrolü yapılır.
 */

"use client";

// React Query - server state yönetimi
import { QueryClientProvider } from "@tanstack/react-query";
// Material-UI Next.js entegrasyonu
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
// Internationalization
import { NextIntlClientProvider } from "next-intl";
// Material-UI tema sistemi
import { ThemeProvider, createTheme } from "@mui/material/styles";
// Custom provider'lar
import { getQueryClient } from "../lib/react-query";
import { AuthProvider } from "../features/auth/AuthProvider";
import { WebSocketProvider } from "../components/providers/WebSocketProvider";
import { AdvancedNotificationProvider } from "../components/notifications/AdvancedNotificationSystem";
import { useState, useEffect } from "react";

interface ProvidersProps {
  locale: string;        // Kullanıcının dil tercihi
  children: React.ReactNode;
}

// Material-UI default tema yapılandırması
const defaultTheme = createTheme({
  palette: {
    mode: 'light',                    // Light mode (dark mode gelecekte eklenebilir)
    primary: {
      main: '#1976d2',               // Mavi ana renk
    },
    secondary: {
      main: '#dc004e',               // Pembe ikincil renk
    },
  },
});

/**
 * Ana Providers Component
 * 
 * Bu component:
 * 1. Client-side hydration kontrolü yapar
 * 2. QueryClient'i initialize eder
 * 3. Tüm provider'ları sarmalar
 * 4. Loading state gösterir
 * 5. Error handling yapar
 */
export default function Providers({ locale, children }: ProvidersProps) {
  // Client-side rendering kontrolü için state'ler
  const [queryClient, setQueryClient] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Component mount olduğunda client-side işlemleri yap
  useEffect(() => {
    setIsClient(true);
    try {
      // React Query client'ini oluştur
      const client = getQueryClient();
      setQueryClient(client);
    } catch (error) {
      console.error('Failed to create query client:', error);
      // Fallback query client oluştur
      const { QueryClient } = require('@tanstack/react-query');
      setQueryClient(new QueryClient());
    }
  }, []);

  // Client-side hydration tamamlanana kadar loading göster
  if (!isClient || !queryClient) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Tüm provider'ları sarmala - sıralama önemli!
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <AuthProvider>
          <ThemeProvider theme={defaultTheme}>
            <WebSocketProvider>
              <AdvancedNotificationProvider>
                <NextIntlClientProvider locale={locale}>
                  {children}
                </NextIntlClientProvider>
              </AdvancedNotificationProvider>
            </WebSocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
