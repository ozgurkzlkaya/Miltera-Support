"use client";

import { Box, Grid, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { Layout } from "./Layout";
import { CustomerWelcomeSection } from "./customer/CustomerWelcomeSection";
import { CustomerStatsGrid } from "./customer/CustomerStatsGrid";
import { CreateIssueModal } from "./customer/CreateIssueModal";
import { RecentIssuesList } from "./customer/RecentIssuesList";
import { QuickActionsGrid } from "./customer/QuickActionsGrid";

// Mock customer data
const customerInfo = {
  companyName: "ABC Enerji Ltd. Şti.",
  contactPerson: "Ali Veli",
  accountManager: "Mehmet Kurnaz",
  phone: "+90 532 123 4567",
  email: "ali@abcenerji.com.tr",
  memberSince: "2023-01-15",
};

const initialStats = {
  totalProducts: 12,
  activeIssues: 2,
  completedIssues: 18,
  productsUnderWarranty: 10,
};

const initialIssues = [
  {
    id: "ARZ-2024-001",
    product: "Gateway-2000",
    serialNumber: "GW001234",
    description: "Bağlantı sorunu yaşanıyor",
    status: "In Progress",
    priority: "High",
    createdDate: "2024-06-01",
    estimatedCompletion: "2024-06-05",
    assignedTechnician: "Ahmet Yılmaz",
  },
  {
    id: "ARZ-2024-002",
    product: "Energy Analyzer",
    serialNumber: "EA005678",
    description: "Kalibrasyon gerekli",
    status: "Completed",
    priority: "Medium",
    createdDate: "2024-05-28",
    completedDate: "2024-06-02",
    assignedTechnician: "Fatma Özer",
  },
];

export default function CustomerPortalPage() {
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [issues, setIssues] = useState(initialIssues);
  const [stats, setStats] = useState(initialStats);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const handleCreateIssue = (issueData: any) => {
    setIssues((prev) => [issueData, ...prev]);
    setStats((prev) => ({ ...prev, activeIssues: prev.activeIssues + 1 }));
    setSnackbar({
      open: true,
      message:
        "Arıza kaydınız başarıyla oluşturuldu! Teknik ekibimiz en kısa sürede değerlendirip size geri dönüş yapacaktır.",
      severity: "success",
    });
  };

  const handleStatClick = (statType: string) => {
    if (statType === "totalProducts" || statType === "productsUnderWarranty") {
      window.location.href = "/customer-portal/products";
      return;
    }

    if (statType === "completedIssues") {
      setSnackbar({
        open: true,
        message: "Tamamlanan arıza kayıtları görüntüleniyor...",
        severity: "info",
      });
      return;
    }

    const messages = {
      activeIssues:
        "Aktif arıza kayıtlarınızı görüntüleme sayfasına yönlendiriliyorsunuz...",
    };

    setSnackbar({
      open: true,
      message:
        messages[statType as keyof typeof messages] || "Detaylar açılıyor...",
      severity: "info",
    });
  };

  const handleViewIssue = (issueId: string) => {
    setSnackbar({
      open: true,
      message: `${issueId} numaralı arıza kaydı detayları açılıyor...`,
      severity: "info",
    });
  };

  const handleContactTechnician = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    setSnackbar({
      open: true,
      message: `${issue?.assignedTechnician} ile iletişime geçiliyor...`,
      severity: "info",
    });
  };

  const handleQuickActions = {
    createIssue: () => setCreateIssueOpen(true),
    trackShipments: () =>
      setSnackbar({
        open: true,
        message: "Sevkiyat takip sayfasına yönlendiriliyorsunuz...",
        severity: "info",
      }),
    downloadReports: () =>
      setSnackbar({
        open: true,
        message: "Raporlarınız hazırlanıyor ve indirilecek...",
        severity: "info",
      }),
    contactSupport: () =>
      setSnackbar({
        open: true,
        message: "Teknik destek ile iletişime geçiliyor...",
        severity: "info",
      }),
    scheduleService: () =>
      setSnackbar({
        open: true,
        message: "Servis randevu sistemi açılıyor...",
        severity: "info",
      }),
    viewNotifications: () =>
      setSnackbar({
        open: true,
        message: "Bildirimler sayfası açılıyor...",
        severity: "info",
      }),
    viewProducts: () => {
      window.location.href = "/customer-portal/products";
    },
    viewServiceOperations: () => {
      setSnackbar({
        open: true,
        message:
          "Servis işlemleri arıza kayıtları içerisinde görüntülenebilir.",
        severity: "info",
      });
    },
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Layout title="Overview">
        {/* Welcome Section */}
        <CustomerWelcomeSection customerInfo={customerInfo} />

        {/* Stats Grid */}
        <CustomerStatsGrid stats={stats} onStatClick={handleStatClick} />

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Issues */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <RecentIssuesList
              issues={issues}
              onCreateNew={handleQuickActions.createIssue}
              onViewAll={() =>
                setSnackbar({
                  open: true,
                  message:
                    "Tüm arıza kayıtları sayfasına yönlendiriliyorsunuz...",
                  severity: "info",
                })
              }
              onViewIssue={handleViewIssue}
              onContactTechnician={handleContactTechnician}
            />
          </Grid>

          {/* Quick Actions */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <QuickActionsGrid
              onCreateIssue={handleQuickActions.createIssue}
              onTrackShipments={handleQuickActions.trackShipments}            
            />
          </Grid>
        </Grid>

        {/* Create Issue Modal */}
        <CreateIssueModal
          open={createIssueOpen}
          onClose={() => setCreateIssueOpen(false)}
          onSubmit={handleCreateIssue}
          products={[]}
        />
    </Layout>
  );
}
