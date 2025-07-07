"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@miltera/ui/ThemeProvider";
import { getQueryClient } from "../lib/react-query";
import { AuthProvider } from "../features/auth/AuthProvider";

interface ProvidersProps {
  locale: string;
  children: React.ReactNode;
}

export default function Providers({ locale, children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <AuthProvider>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale}>
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
