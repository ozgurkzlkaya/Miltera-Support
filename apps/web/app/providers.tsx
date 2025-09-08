"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@miltera/ui/ThemeProvider";
import { getQueryClient } from "../lib/react-query";
import { AuthProvider } from "../features/auth/AuthProvider";
import { WebSocketProvider } from "../components/providers/WebSocketProvider";
import { AdvancedNotificationProvider } from "../components/notifications/AdvancedNotificationSystem";
import { useState, useEffect } from "react";

interface ProvidersProps {
  locale: string;
  children: React.ReactNode;
}

export default function Providers({ locale, children }: ProvidersProps) {
  const [queryClient, setQueryClient] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const client = getQueryClient();
      setQueryClient(client);
    } catch (error) {
      console.error('Failed to create query client:', error);
      // Create a fallback query client
      const { QueryClient } = require('@tanstack/react-query');
      setQueryClient(new QueryClient());
    }
  }, []);

  if (!isClient || !queryClient) {
    // Return a loading state or fallback
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <AuthProvider>
          <ThemeProvider>
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
