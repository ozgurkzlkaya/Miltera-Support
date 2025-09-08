"use client";

import { Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { CustomerWelcomeSection } from "./customer/CustomerWelcomeSection";
import { CustomerStatsGrid } from "./customer/CustomerStatsGrid";
import { CreateIssueModal } from "./customer/CreateIssueModal";
import { RecentIssuesList } from "./customer/RecentIssuesList";
import { QuickActionsGrid } from "./customer/QuickActionsGrid";
import { useCompany } from "../features/companies/company.service";
import { useAuthenticatedAuth } from "../features/auth/useAuth";
import { apiClient } from "../lib/api";

interface CustomerStats {
  totalProducts: number;
  activeIssues: number;
  completedIssues: number;
  productsUnderWarranty: number;
}

interface CustomerIssue {
  id: string;
  issueNumber: string;
  product: string;
  serialNumber: string;
  description: string;
  status: string;
  priority: string;
  createdDate: string;
  estimatedCompletion?: string;
  completedDate?: string;
  assignedTechnician?: string;
}

export default function CustomerPortalPage() {
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [issues, setIssues] = useState<CustomerIssue[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalProducts: 0,
    activeIssues: 0,
    completedIssues: 0,
    productsUnderWarranty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const { user } = useAuthenticatedAuth();
  const { data: company } = useCompany(user.companyId);

  useEffect(() => {
    if (user.companyId) {
      fetchCustomerData();
    }
  }, [user.companyId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customerIssues, customerProducts] = await Promise.all([
        apiClient.getCustomerIssues(user.companyId),
        apiClient.getCustomerProducts(user.companyId),
      ]);

      // İstatistikleri hesapla
      const activeIssues = customerIssues.filter((issue: any) => 
        ['OPEN', 'IN_PROGRESS'].includes(issue.status)
      ).length;
      
      const completedIssues = customerIssues.filter((issue: any) => 
        issue.status === 'RESOLVED'
      ).length;

      const productsUnderWarranty = customerProducts.filter((product: any) => {
        if (!product.warrantyStartDate) return false;
        const warrantyEnd = new Date(product.warrantyStartDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + (product.warrantyPeriodMonths || 0));
        return warrantyEnd > new Date();
      }).length;

      setStats({
        totalProducts: customerProducts.length,
        activeIssues,
        completedIssues,
        productsUnderWarranty,
      });

      // Arıza verilerini formatla
      const formattedIssues: CustomerIssue[] = customerIssues.map((issue: any) => ({
        id: issue.id,
        issueNumber: issue.issueNumber,
        product: issue.product?.serialNumber || 'Bilinmeyen Ürün',
        serialNumber: issue.product?.serialNumber || '',
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        createdDate: new Date(issue.createdAt).toLocaleDateString('tr-TR'),
        estimatedCompletion: issue.estimatedCompletion 
          ? new Date(issue.estimatedCompletion).toLocaleDateString('tr-TR')
          : undefined,
        completedDate: issue.resolvedAt
          ? new Date(issue.resolvedAt).toLocaleDateString('tr-TR')
          : undefined,
        assignedTechnician: issue.assignedTechnician?.firstName 
          ? `${issue.assignedTechnician.firstName} ${issue.assignedTechnician.lastName}`
          : undefined,
      }));

      setIssues(formattedIssues);
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (issueData: any) => {
    try {
      const newIssue = await apiClient.createCustomerIssue({
        ...issueData,
        customerId: user.companyId,
        status: 'OPEN',
        priority: issueData.priority || 'MEDIUM',
      });

      // Yeni arıza kaydını listeye ekle
      const formattedIssue: CustomerIssue = {
        id: newIssue.id,
        issueNumber: newIssue.issueNumber,
        product: issueData.product || 'Bilinmeyen Ürün',
        serialNumber: issueData.serialNumber || '',
        description: issueData.description,
        status: 'OPEN',
        priority: issueData.priority || 'MEDIUM',
        createdDate: new Date().toLocaleDateString('tr-TR'),
      };

      setIssues((prev) => [formattedIssue, ...prev]);
      setStats((prev) => ({ ...prev, activeIssues: prev.activeIssues + 1 }));
      
      setSnackbar({
        open: true,
        message: "Arıza kaydınız başarıyla oluşturuldu! Teknik ekibimiz en kısa sürede değerlendirip size geri dönüş yapacaktır.",
        severity: "success",
      });

      setCreateIssueOpen(false);
    } catch (err) {
      console.error('Error creating issue:', err);
      setSnackbar({
        open: true,
        message: "Arıza kaydı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
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

  const customerInfo = {
    companyName: company?.name || "Bilinmeyen Şirket",
    phone: company?.phone || "Bilinmeyen Telefon",
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
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
    </>
  );
}
