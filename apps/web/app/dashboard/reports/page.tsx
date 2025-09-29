"use client";

import React, { useState, useEffect } from "react";
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Stack
} from "@mui/material";
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon
} from "@mui/icons-material";
import { useRouter } from 'next/navigation';
import { ExportService } from "../../../lib/export";
import { 
  useGetDashboardStats,
  useGetCompaniesCount,
  useGetUsersCount,
  useGetRecentActivity,
  useGetTrendsData,
  useGetProductAnalysis,
  useGetIssueAnalysis,
  useGetPerformanceReport
} from "../../../features/reports/reports.service";
import { usePerformanceMonitor } from "../../../lib/performance-monitor";
import { useErrorHandler } from "../../../lib/error-handler";

type UserRole = 'CUSTOMER' | 'TSP' | 'ADMIN' | 'USER';
const getCurrentUserRole = (): UserRole | null => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.role ?? null;
  } catch {
    return null;
  }
};

// Data interfaces
interface DashboardStats {
  totalProducts: number;
  activeIssues: number;
  completedRepairs: number;
  totalShipments: number;
  totalServiceOperations: number;
  totalCompanies: number;
  totalUsers: number;
  productsByStatus: Record<string, number>;
  issuesByStatus: Record<string, number>;
  serviceOperationsByStatus: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    products: number;
    issues: number;
    repairs: number;
    serviceOperations: number;
    shipments: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'issue' | 'product' | 'service' | 'shipment';
    title: string;
    description: string;
    timestamp: string;
    status: string;
    priority?: string;
  }>;
}

interface ProductAnalysis {
  totalProducts: number;
  productsByType: Record<string, number>;
  productsByStatus: Record<string, number>;
  warrantyStatus: Record<string, number>;
  monthlyProduction: Array<{
    month: string;
    count: number;
  }>;
}

interface IssueAnalysis {
  totalIssues: number;
  issuesByCategory: Record<string, number>;
  issuesByPriority: Record<string, number>;
  averageResolutionTime: number;
  issuesByMonth: Array<{
    month: string;
    count: number;
  }>;
}

interface PerformanceReport {
  technicianPerformance: Array<{
    technicianId: string;
    technicianName: string;
    totalOperations: number;
    completedOperations: number;
    averageDuration: number;
    successRate: number;
  }>;
  teamPerformance: {
    totalOperations: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
  };
}





const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "aktif":
    case "yeni":
    case "garantili":
    case "çözüldü":
      return "success";
    case "bakımda":
    case "işlemde":
    case "orta":
      return "warning";
    case "arızalı":
    case "açık":
    case "yüksek":
    case "garanti dışı":
      return "error";
    case "düşük":
      return "info";
    default:
      return "default";
  }
};

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  const [filterType, setFilterType] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Performance monitoring and error handling
  const performanceMonitor = usePerformanceMonitor();
  const errorHandler = useErrorHandler();

  // React Query hooks for data fetching
  const { data: dashboardStats, isLoading: dashboardLoading, refetch: refetchDashboard } = useGetDashboardStats();
  const { data: companiesCount } = useGetCompaniesCount();
  const { data: usersCount } = useGetUsersCount();
  const { data: recentActivity } = useGetRecentActivity(10);
  const { data: trendsData } = useGetTrendsData(7);
  const { data: productAnalysis } = useGetProductAnalysis({
    startDate: dateRange.startDate.toISOString().split('T')[0],
    endDate: dateRange.endDate.toISOString().split('T')[0]
  });
  const { data: issueAnalysis } = useGetIssueAnalysis({
    startDate: dateRange.startDate.toISOString().split('T')[0],
    endDate: dateRange.endDate.toISOString().split('T')[0]
  });
  const { data: performanceReport } = useGetPerformanceReport({
    startDate: dateRange.startDate.toISOString().split('T')[0],
    endDate: dateRange.endDate.toISOString().split('T')[0]
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch data from reports API endpoints
      const [dashboardRes, companiesRes, usersRes, activityRes, trendsRes] = await Promise.all([
        fetch('http://localhost:3015/api/v1/reports/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3015/api/v1/reports/companies-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3015/api/v1/reports/users-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3015/api/v1/reports/recent-activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3015/api/v1/reports/trends', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const safeJson = async (res: Response) => {
        if (!res.ok) return { data: [], meta: {} };
        try { return await res.json(); } catch { return { data: [], meta: {} }; }
      };

      const [dashboard, companies, users, activity, trends] = await Promise.all([
        safeJson(dashboardRes),
        safeJson(companiesRes),
        safeJson(usersRes),
        safeJson(activityRes),
        safeJson(trendsRes)
      ]);

      // Process data from reports API
      const processedStats: DashboardStats = {
        totalProducts: dashboard.data?.totalProducts || 0,
        activeIssues: dashboard.data?.activeIssues || 0,
        completedRepairs: dashboard.data?.completedRepairs || 0,
        totalShipments: dashboard.data?.totalShipments || 0,
        totalServiceOperations: dashboard.data?.totalServiceOperations || 0,
        totalCompanies: companies.data?.count || 0,
        totalUsers: users.data?.count || 0,
        productsByStatus: dashboard.data?.productsByStatus || {},
        issuesByStatus: dashboard.data?.issuesByStatus || {},
        serviceOperationsByStatus: dashboard.data?.serviceOperationsByStatus || {},
        monthlyTrend: trends.data?.monthlyTrend || [],
        recentActivity: activity.data || []
      };

      // Dashboard stats are managed by React Query

      // --------- Build Product Analysis ---------
      // Fetch real products data
      const productsRes = await fetch('http://localhost:3015/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const productsData = await safeJson(productsRes);
      const productsArray: any[] = productsData.data || [];
      const groupCount = (arr: any[], keyPickers: Array<(x: any) => string | undefined>) => {
        const map: Record<string, number> = {};
        arr.forEach((it) => {
          let key: string | undefined;
          for (const pick of keyPickers) {
            const v = pick(it);
            if (v) { key = String(v); break; }
          }
          const finalKey = key || 'Unknown';
          map[finalKey] = (map[finalKey] || 0) + 1;
        });
        return map;
      };

      const productsByType = groupCount(productsArray, [
        (p) => p.type,
        (p) => p.productType?.name,
        (p) => p.model?.name,
        (p) => p.model?.modelName,
      ]);

      const productsByStatusPA = groupCount(productsArray, [
        (p) => p.status,
        (p) => p.currentStatus,
      ]);
      const warrantyStatus = groupCount(productsArray, [
        (p) => p.isUnderWarranty === true ? 'GARANTİLİ' : (p?.isUnderWarranty === false ? 'GARANTİ DIŞI' : undefined),
        (p) => p.warrantyStatus,
      ]);

      const monthlyProduction = (() => {
        const byMonth: Record<string, number> = {};
        productsArray.forEach((p) => {
          const d = new Date(p.productionDate || p.createdAt || p.updatedAt || Date.now());
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          byMonth[k] = (byMonth[k] || 0) + 1;
        });
        return Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
      })();

      // Product analysis data is managed by React Query

      // --------- Build Issue Analysis ---------
      // Fetch real issues data
      const issuesRes = await fetch('http://localhost:3015/api/v1/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const issuesData = await safeJson(issuesRes);
      const issuesArray: any[] = issuesData.data || [];
      const issuesByCategory = groupCount(issuesArray, [
        (i) => i.issueCategory?.name,
        (i) => i.category?.name,
        (i) => i.issueCategoryId,
      ]);
      const issuesByPriority = groupCount(issuesArray, [(i) => i.priority]);
      const averageResolutionTime = (() => {
        const diffs: number[] = [];
        issuesArray.forEach((i) => {
          if (i.resolvedAt) {
            const start = new Date(i.reportedAt || i.createdAt).getTime();
            const end = new Date(i.resolvedAt).getTime();
            if (isFinite(start) && isFinite(end) && end >= start) diffs.push(end - start);
          }
        });
        if (!diffs.length) return 0;
        const avgMs = diffs.reduce((a,b) => a + b, 0) / diffs.length;
        return Math.round(avgMs / (1000 * 60 * 60 * 24)); // days
      })();
      const issuesByMonth = (() => {
        const byMonth: Record<string, number> = {};
        issuesArray.forEach((i) => {
          const d = new Date(i.reportedAt || i.createdAt || Date.now());
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          byMonth[k] = (byMonth[k] || 0) + 1;
        });
        return Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
      })();
      // Issue analysis data is managed by React Query

      // --------- Build Performance Report ---------
      // Fetch real service operations data
      const operationsRes = await fetch('http://localhost:3015/api/v1/service-operations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const operationsData = await safeJson(operationsRes);
      const opsArray: any[] = operationsData.data || [];
      const byTech: Record<string, { name: string; total: number; completed: number; durations: number[] }>
        = {};
      opsArray.forEach((op) => {
        const techId = op.performedBy || op.technicianId || 'unknown';
        let techName = 'Bilinmeyen Teknisyen';
        if (op.performedBy) {
          // performedBy bir ID ise, isim mapping yap
          if (op.performedBy === '3383f9bf-1b18-4174-b080-6a114bf457e5') {
            techName = 'Test User 6';
          } else if (op.performedBy === '0834d1d1-98e6-4de2-962d-efbd596eecc6') {
            techName = 'Teknisyen 1';
          } else {
            techName = `Teknisyen ${op.performedBy.slice(-4)}`;
          }
        } else if (op.technicianId) {
          techName = `Teknisyen ${op.technicianId.slice(-4)}`;
        }
        if (!byTech[techId]) byTech[techId] = { name: techName, total: 0, completed: 0, durations: [] };
        byTech[techId].total += 1;
        if (op.status === 'COMPLETED' || op.completedAt) byTech[techId].completed += 1;
        if (op.startedAt && op.completedAt) {
          const s = new Date(op.startedAt).getTime();
          const e = new Date(op.completedAt).getTime();
          if (isFinite(s) && isFinite(e) && e >= s) byTech[techId].durations.push(e - s);
        }
      });
      const technicianPerformance = Object.entries(byTech).map(([id, v]) => ({
        technicianId: id,
        technicianName: v.name,
        totalOperations: v.total,
        completedOperations: v.completed,
        averageDuration: v.durations.length ? Math.round((v.durations.reduce((a,b)=>a+b,0)/v.durations.length)/(1000*60)) : 0,
        successRate: v.total ? Math.round((v.completed / v.total) * 100) : 0,
      }));
      const teamPerformance = {
        totalOperations: opsArray.length,
        averageResolutionTime: (() => {
          const diffs: number[] = [];
          opsArray.forEach((op) => {
            if (op.startedAt && op.completedAt) {
              const s = new Date(op.startedAt).getTime();
              const e = new Date(op.completedAt).getTime();
              if (isFinite(s) && isFinite(e) && e >= s) diffs.push(e - s);
            }
          });
          if (!diffs.length) return 0;
          return Math.round((diffs.reduce((a,b)=>a+b,0)/diffs.length)/(1000*60)); // minutes
        })(),
        customerSatisfaction: 0,
      };
      // Performance report data is managed by React Query
    } catch (error) {
      // Suppress noisy console errors; show a user-friendly message instead
      setSnackbar({
        open: true,
        message: 'Veri yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    performanceMonitor.recordUserInteraction('refresh_reports', performance.now());
    
    // Refetch all data
    Promise.all([
      refetchDashboard(),
      // Add other refetch calls as needed
    ]).finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    });
  };

  const generateMonthlyTrend = (
    productsInput: any,
    issuesInput: any,
    serviceOpsInput: any,
    shipmentsInput: any
  ) => {
    const products: any[] = Array.isArray(productsInput) ? productsInput : [];
    const issues: any[] = Array.isArray(issuesInput) ? issuesInput : [];
    const serviceOps: any[] = Array.isArray(serviceOpsInput) ? serviceOpsInput : [];
    const shipments: any[] = Array.isArray(shipmentsInput) ? shipmentsInput : [];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => ({
      month,
      products: products.filter((p: any) => {
        const d = new Date(p.productionDate || p.createdAt || p.updatedAt || Date.now());
        return d.getMonth() === currentMonth - 5 + index;
      }).length,
      issues: issues.filter(issue => {
        const issueDate = new Date(issue.createdAt || issue.reportedAt);
        return issueDate.getMonth() === currentMonth - 5 + index;
      }).length,
      repairs: (
        issues.filter((i: any) => {
          const rd = i.resolvedAt ? new Date(i.resolvedAt) : null;
          return rd && rd.getMonth() === currentMonth - 5 + index;
        }).length +
        serviceOps.filter((op: any) => {
          const cd = op.completedAt ? new Date(op.completedAt) : null;
          return cd && cd.getMonth() === currentMonth - 5 + index;
        }).length
      ),
      serviceOperations: serviceOps.filter(op => {
        const opDate = new Date(op.createdAt || op.operationDate);
        return opDate.getMonth() === currentMonth - 5 + index;
      }).length,
      shipments: shipments.filter((shipment: any) => {
        const shipDate = new Date(shipment.createdAt || shipment.shipDate);
        return shipDate.getMonth() === currentMonth - 5 + index;
      }).length
    }));
  };

  const generateRecentActivity = (issuesInput: any, serviceOpsInput: any, shipmentsInput: any) => {
    const activities: any[] = [];
    const issues: any[] = Array.isArray(issuesInput) ? issuesInput : [];
    const serviceOps: any[] = Array.isArray(serviceOpsInput) ? serviceOpsInput : [];
    const shipments: any[] = Array.isArray(shipmentsInput) ? shipmentsInput : [];
    
    // Add recent issues
    issues.slice(0, 5).forEach((issue: any) => {
      activities.push({
        id: issue.id,
        type: 'issue' as const,
        title: `Arıza: ${issue.issueNumber || issue.title}`,
        description: issue.description || issue.customerDescription,
        timestamp: issue.createdAt || issue.reportedAt,
        status: issue.status,
        priority: issue.priority
      });
    });

    // Add recent service operations
    serviceOps.slice(0, 3).forEach((op: any) => {
      activities.push({
        id: op.id,
        type: 'service' as const,
        title: `Servis: ${op.operationType}`,
        description: op.description,
        timestamp: op.createdAt || op.operationDate,
        status: op.status
      });
    });

    // Add recent shipments
    shipments.slice(0, 2).forEach((shipment: any) => {
      activities.push({
        id: shipment.id,
        type: 'shipment' as const,
        title: `Sevkiyat: ${shipment.trackingNumber || 'Sevkiyat'}`,
        description: shipment.description,
        timestamp: shipment.createdAt || shipment.shipDate,
        status: shipment.status
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setOpenDetailDialog(true);
  };

  const handleNavigateToPage = (type: string) => {
    switch (type) {
      case 'issue':
        router.push('/dashboard/issues');
          break;
      case 'product':
        router.push('/dashboard/products');
        break;
      case 'service':
        router.push('/dashboard/service-operations');
        break;
      case 'shipment':
        router.push('/dashboard/shipments');
        break;
      case 'company':
        router.push('/dashboard/companies');
        break;
      case 'user':
        router.push('/dashboard/users');
        break;
      default:
        break;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return <WarningIcon color="error" />;
      case 'service':
        return <BuildIcon color="primary" />;
      case 'shipment':
        return <ShippingIcon color="info" />;
      case 'product':
        return <InventoryIcon color="success" />;
      default:
        return <AssessmentIcon />;
    }
  };

  // Export functions
  const exportIssuesToPDF = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const issues = data.data || [];
        
        await ExportService.exportToPDF({
          title: 'Arıza Raporu',
          filename: `ariza-raporu-${new Date().toISOString().split('T')[0]}`,
          data: issues,
          columns: [
            { key: 'issueNumber', label: 'Arıza No', width: 30 },
            { key: 'title', label: 'Başlık', width: 50 },
            { key: 'status', label: 'Durum', width: 25, formatter: ExportService.formatters.status },
            { key: 'priority', label: 'Öncelik', width: 25, formatter: ExportService.formatters.priority },
            { key: 'reportedAt', label: 'Tarih', width: 30, formatter: ExportService.formatters.date },
            { key: 'company.name', label: 'Müşteri', width: 40 },
          ],
          includeDate: true,
          includeUser: true,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Export sırasında hata oluştu',
        severity: 'error'
      });
    }
  };

  const exportProductsToExcel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const products = data.data || [];
        
        await ExportService.exportToExcel({
          title: 'Ürün Raporu',
          filename: `urun-raporu-${new Date().toISOString().split('T')[0]}`,
          data: products,
          columns: [
            { key: 'serialNumber', label: 'Seri No', width: 30 },
            { key: 'model.name', label: 'Model', width: 40 },
            { key: 'currentStatus', label: 'Durum', width: 25, formatter: ExportService.formatters.status },
            { key: 'productionDate', label: 'Üretim Tarihi', width: 30, formatter: ExportService.formatters.date },
            { key: 'isUnderWarranty', label: 'Garanti', width: 20, formatter: ExportService.formatters.boolean },
            { key: 'location.name', label: 'Konum', width: 30 },
          ],
          includeDate: true,
          includeUser: true,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Export sırasında hata oluştu',
        severity: 'error'
      });
    }
  };

  const exportServiceOperationsToCSV = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/service-operations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const operations = data.data || [];
        
        await ExportService.exportToCSV({
          title: 'Servis Operasyonları Raporu',
          filename: `servis-operasyonlari-${new Date().toISOString().split('T')[0]}`,
          data: operations,
          columns: [
            { key: 'operationType', label: 'Operasyon Türü', width: 40 },
            { key: 'status', label: 'Durum', width: 25, formatter: ExportService.formatters.status },
            { key: 'description', label: 'Açıklama', width: 60 },
            { key: 'operationDate', label: 'Tarih', width: 30, formatter: ExportService.formatters.date },
            { key: 'cost', label: 'Maliyet', width: 25, formatter: ExportService.formatters.currency },
            { key: 'duration', label: 'Süre (dk)', width: 20 },
          ],
          includeDate: true,
          includeUser: true,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Export sırasında hata oluştu',
        severity: 'error'
      });
    }
  };

  // Component mount olduğunda veri çek
  React.useEffect(() => {
    fetchDashboardStats();
    setUserRole(getCurrentUserRole());
  }, []);

  const handleExport = async (format: string) => {
    
    try {
      const token = localStorage.getItem('auth_token');
      let reportId = '';
      let filename = '';
      
      // Generate custom report first
      const reportData = {
        reportType: activeTab === 0 ? 'dashboard' : activeTab === 1 ? 'products' : activeTab === 2 ? 'issues' : 'performance',
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        filters: {},
        groupBy: []
      };
      
      const generateResponse = await fetch('http://localhost:3015/api/v1/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });
      
      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        reportId = generateData.data.reportId;
        filename = `${reportData.reportType}-raporu-${new Date().toISOString().split('T')[0]}`;
      } else {
        throw new Error('Report generation failed');
      }
      
      // Wait a moment for report to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Export the report
      const exportResponse = await fetch(`http://localhost:3015/api/v1/reports/${reportId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (exportResponse.ok) {
        const blob = await exportResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSnackbar({
          open: true,
          message: `${format.toUpperCase()} raporu başarıyla indirildi`,
          severity: 'success'
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Rapor indirilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const exportToPDF = (data: any, filename: string) => {
    // Create a simple text content for PDF (since we don't have PDF library)
    let textContent = '';
    
    // Add header
    textContent += `${data.title}\n`;
    textContent += `${'='.repeat(data.title.length)}\n\n`;
    textContent += `Oluşturulma Tarihi: ${data.generatedAt}\n`;
    textContent += `FixLog Teknik Servis Yönetim Sistemi\n\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    
    // Add content based on tab
    if (activeTab === 0) { // Dashboard
      textContent += `TEMEL METRİKLER\n`;
      textContent += `${'-'.repeat(20)}\n`;
      textContent += `Toplam Ürün: ${data.metrics.totalProducts.toLocaleString()}\n`;
      textContent += `Aktif Sorun: ${data.metrics.activeIssues}\n`;
      textContent += `Tamamlanan Onarım: ${data.metrics.completedRepairs}\n`;
      textContent += `Toplam Sevkiyat: ${data.metrics.totalShipments}\n\n`;
      
      textContent += `ÜRÜNLER DURUMA GÖRE\n`;
      textContent += `${'-'.repeat(20)}\n`;
      Object.entries(data.productsByStatus).forEach(([status, count]) => {
        textContent += `${status}: ${count}\n`;
      });
      textContent += `\n`;
      
      textContent += `SORUNLAR DURUMA GÖRE\n`;
      textContent += `${'-'.repeat(20)}\n`;
      Object.entries(data.issuesByStatus).forEach(([status, count]) => {
        textContent += `${status}: ${count}\n`;
      });
      textContent += `\n`;
      
      textContent += `AYLIK TREND ANALİZİ\n`;
      textContent += `${'-'.repeat(20)}\n`;
      data.monthlyTrend.forEach((month: any) => {
        textContent += `${month.month}: Ürün(${month.products}) Sorun(${month.issues}) Onarım(${month.repairs})\n`;
      });
    }
    
    textContent += `\n\n${'='.repeat(50)}\n`;
    textContent += `Bu rapor FixLog sistemi tarafından otomatik olarak oluşturulmuştur.\n`;
    
    // Create blob and download as .txt file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('Rapor metin formatında indirildi. PDF yazıcısı ile yazdırabilirsiniz.');
  };

  const exportToExcel = (data: any, filename: string) => {
    // Create CSV content (Excel can open CSV)
    let csvContent = '';
    
    // Add title and date
    csvContent += `${data.title}\n`;
    csvContent += `Oluşturulma Tarihi,${data.generatedAt}\n`;
    csvContent += `\n`;
    
    // Add data based on tab
    if (activeTab === 0) { // Dashboard
      csvContent += `METRİKLER\n`;
      csvContent += `Toplam Ürün,${data.metrics.totalProducts}\n`;
      csvContent += `Aktif Sorun,${data.metrics.activeIssues}\n`;
      csvContent += `Tamamlanan Onarım,${data.metrics.completedRepairs}\n`;
      csvContent += `Toplam Sevkiyat,${data.metrics.totalShipments}\n`;
      csvContent += `\n`;
      
      csvContent += `ÜRÜNLER DURUMA GÖRE\n`;
      csvContent += `Durum,Adet\n`;
      Object.entries(data.productsByStatus).forEach(([status, count]) => {
        csvContent += `${status},${count}\n`;
      });
      csvContent += `\n`;
      
      csvContent += `SORUNLAR DURUMA GÖRE\n`;
      csvContent += `Durum,Adet\n`;
      Object.entries(data.issuesByStatus).forEach(([status, count]) => {
        csvContent += `${status},${count}\n`;
      });
      csvContent += `\n`;
      
      csvContent += `AYLIK TREND\n`;
      csvContent += `Ay,Ürün Sayısı,Sorun Sayısı,Onarım Sayısı\n`;
      data.monthlyTrend.forEach((month: any) => {
        csvContent += `${month.month},${month.products},${month.issues},${month.repairs}\n`;
      });
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('Rapor CSV formatında indirildi. Excel ile açabilirsiniz.');
  };

  const exportToCSV = (data: any, filename: string) => {
    // Same as Excel export but with .csv extension
    exportToExcel(data, filename);
  };

  const generatePDFContent = (data: any): string => {
    let content = '';
    
    if (activeTab === 0) { // Dashboard
      content += `
        <div class="section">
          <h2>Temel Metrikler</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">${data.metrics.totalProducts.toLocaleString()}</div>
              <div class="metric-label">Toplam Ürün</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.metrics.activeIssues}</div>
              <div class="metric-label">Aktif Sorun</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.metrics.completedRepairs}</div>
              <div class="metric-label">Tamamlanan Onarım</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.metrics.totalShipments}</div>
              <div class="metric-label">Toplam Sevkiyat</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Ürünler Duruma Göre</h2>
          <table>
            <tr><th>Durum</th><th>Adet</th></tr>
            ${Object.entries(data.productsByStatus).map(([status, count]) => 
              `<tr><td>${status}</td><td>${count}</td></tr>`
            ).join('')}
          </table>
        </div>
        
        <div class="section">
          <h2>Sorunlar Duruma Göre</h2>
          <table>
            <tr><th>Durum</th><th>Adet</th></tr>
            ${Object.entries(data.issuesByStatus).map(([status, count]) => 
              `<tr><td>${status}</td><td>${count}</td></tr>`
            ).join('')}
          </table>
        </div>
        
        <div class="section">
          <h2>Aylık Trend Analizi</h2>
          <table>
            <tr><th>Ay</th><th>Ürün Sayısı</th><th>Sorun Sayısı</th><th>Onarım Sayısı</th></tr>
            ${data.monthlyTrend.map((month: any) => 
              `<tr><td>${month.month}</td><td>${month.products}</td><td>${month.issues}</td><td>${month.repairs}</td></tr>`
            ).join('')}
          </table>
        </div>
      `;
    }
    
    return content;
  };

  const renderDashboardOverview = () => (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleNavigateToPage('product')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardStats?.totalProducts?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Ürün
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <LinkIcon sx={{ color: 'primary.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="primary.main">
                  Detayları Gör
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleNavigateToPage('issue')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardStats?.activeIssues?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif Arıza
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <LinkIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="error.main">
                  Detayları Gör
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleNavigateToPage('service')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <BuildIcon />
              </Avatar>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardStats?.totalServiceOperations?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Servis Operasyonu
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <LinkIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  Detayları Gör
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleNavigateToPage('shipment')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <ShippingIcon />
              </Avatar>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardStats?.totalShipments?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Sevkiyat
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <LinkIcon sx={{ color: 'info.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="info.main">
                  Detayları Gör
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleNavigateToPage('company')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardStats?.totalCompanies?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Şirket
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <LinkIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="warning.main">
                  Detayları Gör
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {userRole === 'ADMIN' && (
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => handleNavigateToPage('user')}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardStats?.totalUsers?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Kullanıcı
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <LinkIcon sx={{ color: 'secondary.main', fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" color="secondary.main">
                    Detayları Gör
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color="primary" />
                Ürünler Duruma Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(dashboardStats?.productsByStatus || {}).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={status} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Number(count).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" />
                Arızalar Duruma Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(dashboardStats?.issuesByStatus || {}).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={status} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Number(count).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon color="success" />
                Servis Operasyonları
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(dashboardStats?.serviceOperationsByStatus || {}).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={status} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Number(count).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Son Aktiviteler
              </Typography>
              <List>
                {dashboardStats?.recentActivity?.slice(0, 8).map((activity: any, index: number) => (
                  <React.Fragment key={activity.id}>
                    <ListItem 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1
                      }}
                      onClick={() => handleItemClick(activity)}
                    >
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {activity.title}
                            </Typography>
                            <Chip 
                              label={activity.status} 
                              color={getStatusColor(activity.status) as any}
                              size="small"
                            />
                            {activity.priority && (
                              <Chip 
                                label={activity.priority} 
                                color={getStatusColor(activity.priority) as any}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToPage(activity.type);
                      }}>
                        <LinkIcon />
                      </IconButton>
                    </ListItem>
                    {index < dashboardStats?.recentActivity?.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                Aylık Trend
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dashboardStats?.monthlyTrend?.slice(-6).map((trend: any) => (
                  <Box key={trend.month} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {trend.month}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Ürünler:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{trend.products}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Arızalar:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{trend.issues}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Servis:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{trend.serviceOperations}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Sevkiyat:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{trend.shipments}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Trend */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Aylık Trend Analizi
          </Typography>
          <Grid container spacing={2}>
            {(dashboardStats?.monthlyTrend || []).map((month: any) => (
              <Grid item xs={6} md={2} key={month.month}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {month.month}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {month.products}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ürün
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderProductAnalysis = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ürünler Türe Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {productAnalysis && Object.keys(productAnalysis.productsByType).length > 0 ? (
                  Object.entries(productAnalysis.productsByType).map(([type, count]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{type}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{count as number}</Typography>
                  </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Garanti Durumu
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {productAnalysis && Object.keys(productAnalysis.warrantyStatus).length > 0 ? (
                  Object.entries(productAnalysis.warrantyStatus).map(([status, count]) => (
                    <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{count as number}</Typography>
                  </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderIssueAnalysis = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sorunlar Kategoriye Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {issueAnalysis && Object.keys(issueAnalysis.issuesByCategory).length > 0 ? (
                  Object.entries(issueAnalysis.issuesByCategory).map(([cat, count]) => (
                    <Box key={cat} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{cat}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{count as number}</Typography>
                  </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sorunlar Önceliğe Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {issueAnalysis && Object.keys(issueAnalysis.issuesByPriority).length > 0 ? (
                  Object.entries(issueAnalysis.issuesByPriority).map(([prio, count]) => (
                    <Box key={prio} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{prio}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{count as number}</Typography>
                  </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                )}
              </Box>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ortalama Çözüm Süresi
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {issueAnalysis ? `${issueAnalysis.averageResolutionTime} gün` : '0 gün'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPerformanceReport = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Teknik Ekip Performansı
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {performanceReport && performanceReport.technicianPerformance.length > 0 ? (
                    <Grid container spacing={2}>
                    {performanceReport.technicianPerformance.map((t: any) => (
                      <Grid item xs={12} md={4} key={t.technicianId}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.technicianName}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Toplam Operasyon</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{t.totalOperations}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Tamamlanan</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{t.completedOperations}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Başarı Oranı</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{t.successRate}%</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Ortalama Süre</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{t.averageDuration} dk</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                      </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                )}
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Takım Özeti</Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Chip label={`Toplam Operasyon: ${performanceReport?.teamPerformance.totalOperations ?? 0}`} />
                    <Chip label={`Ortalama Çözüm: ${performanceReport?.teamPerformance.averageResolutionTime ?? 0} dk`} />
                    <Chip label={`Müşteri Memnuniyeti: ${performanceReport?.teamPerformance.customerSatisfaction ?? 0}%`} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Raporlar & Analitik
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtreler">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={<PdfIcon />}
            onClick={exportIssuesToPDF}
            sx={{ borderRadius: 2 }}
          >
            PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ExcelIcon />}
            onClick={exportProductsToExcel}
            sx={{ borderRadius: 2 }}
          >
            Excel
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<CsvIcon />}
            onClick={exportServiceOperationsToCSV}
            sx={{ borderRadius: 2 }}
          >
            CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
            sx={{ borderRadius: 2 }}
          >
            Excel İndir
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
            sx={{ borderRadius: 2 }}
          >
            CSV İndir
          </Button>
        </Box>
      </Box>

      {/* Refresh indicator */}
      {isRefreshing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Raporlar yenileniyor...
          </Typography>
        </Box>
      )}

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Dashboard Genel Bakış" />
        <Tab label="Ürün Analizi" />
        <Tab label="Sorun Analizi" />
        <Tab label="Performans Raporu" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderDashboardOverview()}
      {activeTab === 1 && renderProductAnalysis()}
      {activeTab === 2 && renderIssueAnalysis()}
      {activeTab === 3 && renderPerformanceReport()}

      {/* Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedItem && getActivityIcon(selectedItem.type)}
            <Typography variant="h6">
              {selectedItem?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Açıklama
                </Typography>
                <Typography variant="body1">
                  {selectedItem.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Durum
                  </Typography>
                  <Chip 
                    label={selectedItem.status} 
                    color={getStatusColor(selectedItem.status) as any}
                    size="small"
                  />
                </Box>
                
                {selectedItem.priority && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Öncelik
                    </Typography>
                    <Chip 
                      label={selectedItem.priority} 
                      color={getStatusColor(selectedItem.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tarih
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedItem.timestamp).toLocaleString('tr-TR')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedItem) {
                handleNavigateToPage(selectedItem.type);
                setOpenDetailDialog(false);
              }
            }}
          >
            Detayları Gör
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
