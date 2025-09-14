"use client";

import { useState } from "react";
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
  Tooltip
} from "@mui/material";
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";

// Mock data interfaces
interface DashboardStats {
  totalProducts: number;
  activeIssues: number;
  completedRepairs: number;
  totalShipments: number;
  productsByStatus: Record<string, number>;
  issuesByStatus: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    products: number;
    issues: number;
    repairs: number;
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

// Mock data
const mockDashboardStats: DashboardStats = {
  totalProducts: 1247,
  activeIssues: 23,
  completedRepairs: 189,
  totalShipments: 156,
  productsByStatus: {
    "Aktif": 892,
    "Bakımda": 45,
    "Arızalı": 23,
    "Garantide": 287
  },
  issuesByStatus: {
    "Açık": 15,
    "İşlemde": 8,
    "Çözüldü": 156,
    "İptal": 4
  },
  monthlyTrend: [
    { month: "Ocak", products: 98, issues: 12, repairs: 87 },
    { month: "Şubat", products: 112, issues: 8, repairs: 94 },
    { month: "Mart", products: 134, issues: 15, repairs: 102 },
    { month: "Nisan", products: 145, issues: 18, repairs: 118 },
    { month: "Mayıs", products: 167, issues: 22, repairs: 134 },
    { month: "Haziran", products: 189, issues: 19, repairs: 156 }
  ]
};

const mockProductAnalysis: ProductAnalysis = {
  totalProducts: 1247,
  productsByType: {
    "Laptop": 456,
    "Desktop": 234,
    "Tablet": 189,
    "Telefon": 298,
    "Diğer": 70
  },
  productsByStatus: {
    "Yeni": 892,
    "İkinci El": 287,
    "Refurbished": 68
  },
  warrantyStatus: {
    "Garantili": 934,
    "Garanti Dışı": 313
  },
  monthlyProduction: [
    { month: "Ocak", count: 98 },
    { month: "Şubat", count: 112 },
    { month: "Mart", count: 134 },
    { month: "Nisan", count: 145 },
    { month: "Mayıs", count: 167 },
    { month: "Haziran", count: 189 }
  ]
};

const mockIssueAnalysis: IssueAnalysis = {
  totalIssues: 183,
  issuesByCategory: {
    "Donanım": 67,
    "Yazılım": 89,
    "Ağ": 15,
    "Güç": 12
  },
  issuesByPriority: {
    "Yüksek": 23,
    "Orta": 98,
    "Düşük": 62
  },
  averageResolutionTime: 2.4,
  issuesByMonth: [
    { month: "Ocak", count: 28 },
    { month: "Şubat", count: 22 },
    { month: "Mart", count: 34 },
    { month: "Nisan", count: 31 },
    { month: "Mayıs", count: 38 },
    { month: "Haziran", count: 30 }
  ]
};

const mockPerformanceReport: PerformanceReport = {
  technicianPerformance: [
    {
      technicianId: "1",
      technicianName: "Ahmet Yılmaz",
      totalOperations: 45,
      completedOperations: 42,
      averageDuration: 1.8,
      successRate: 93.3
    },
    {
      technicianId: "2",
      technicianName: "Mehmet Demir",
      totalOperations: 38,
      completedOperations: 35,
      averageDuration: 2.1,
      successRate: 92.1
    },
    {
      technicianId: "3",
      technicianName: "Ayşe Kaya",
      totalOperations: 52,
      completedOperations: 48,
      averageDuration: 1.9,
      successRate: 92.3
    },
    {
      technicianId: "4",
      technicianName: "Fatma Özkan",
      totalOperations: 41,
      completedOperations: 38,
      averageDuration: 2.3,
      successRate: 92.7
    }
  ],
  teamPerformance: {
    totalOperations: 176,
    averageResolutionTime: 2.0,
    customerSatisfaction: 94.2
  }
};

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
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    
    try {
      // Get current tab data
      let data = {};
      let filename = '';
      
      switch (activeTab) {
        case 0: // Dashboard Overview
          data = {
            title: "Dashboard Genel Bakış Raporu",
            generatedAt: new Date().toLocaleString('tr-TR'),
            metrics: {
              totalProducts: mockDashboardStats.totalProducts,
              activeIssues: mockDashboardStats.activeIssues,
              completedRepairs: mockDashboardStats.completedRepairs,
              totalShipments: mockDashboardStats.totalShipments
            },
            productsByStatus: mockDashboardStats.productsByStatus,
            issuesByStatus: mockDashboardStats.issuesByStatus,
            monthlyTrend: mockDashboardStats.monthlyTrend
          };
          filename = `dashboard-raporu-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 1: // Product Analysis
          data = {
            title: "Ürün Analizi Raporu",
            generatedAt: new Date().toLocaleString('tr-TR'),
            totalProducts: mockProductAnalysis.totalProducts,
            productsByType: mockProductAnalysis.productsByType,
            productsByStatus: mockProductAnalysis.productsByStatus,
            warrantyStatus: mockProductAnalysis.warrantyStatus,
            monthlyProduction: mockProductAnalysis.monthlyProduction
          };
          filename = `urun-analizi-raporu-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 2: // Issue Analysis
          data = {
            title: "Sorun Analizi Raporu",
            generatedAt: new Date().toLocaleString('tr-TR'),
            totalIssues: mockIssueAnalysis.totalIssues,
            issuesByCategory: mockIssueAnalysis.issuesByCategory,
            issuesByPriority: mockIssueAnalysis.issuesByPriority,
            averageResolutionTime: mockIssueAnalysis.averageResolutionTime,
            issuesByMonth: mockIssueAnalysis.issuesByMonth
          };
          filename = `sorun-analizi-raporu-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 3: // Performance Report
          data = {
            title: "Performans Raporu",
            generatedAt: new Date().toLocaleString('tr-TR'),
            technicianPerformance: mockPerformanceReport.technicianPerformance,
            teamPerformance: mockPerformanceReport.teamPerformance
          };
          filename = `performans-raporu-${new Date().toISOString().split('T')[0]}`;
          break;
          
        default:
          data = { title: "Genel Rapor", generatedAt: new Date().toLocaleString('tr-TR') };
          filename = `rapor-${new Date().toISOString().split('T')[0]}`;
      }
      
      if (format === 'pdf') {
        exportToPDF(data, filename);
      } else if (format === 'excel') {
        exportToExcel(data, filename);
      } else if (format === 'csv') {
        exportToCSV(data, filename);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Rapor indirme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {mockDashboardStats.totalProducts.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Ürün
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +12.5%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h4" color="error" sx={{ fontWeight: 700, mb: 1 }}>
                {mockDashboardStats.activeIssues}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif Sorun
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="error.main">
                  -5.2%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                {mockDashboardStats.completedRepairs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tamamlanan Onarım
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +8.7%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                {mockDashboardStats.totalShipments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Sevkiyat
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +15.3%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" />
                Ürünler Duruma Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(mockDashboardStats.productsByStatus).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={status} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                Sorunlar Duruma Göre
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(mockDashboardStats.issuesByStatus).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={status} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
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
            {mockDashboardStats.monthlyTrend.map((month) => (
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
                {Object.entries(mockProductAnalysis.productsByType).map(([type, count]) => (
                  <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{type}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
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
                {Object.entries(mockProductAnalysis.warrantyStatus).map(([status, count]) => (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={status} 
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
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
                {Object.entries(mockIssueAnalysis.issuesByCategory).map(([category, count]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{category}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
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
                {Object.entries(mockIssueAnalysis.issuesByPriority).map(([priority, count]) => (
                  <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={priority} 
                      color={getStatusColor(priority) as any}
                      size="small"
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ortalama Çözüm Süresi
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {mockIssueAnalysis.averageResolutionTime} gün
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
                {mockPerformanceReport.technicianPerformance.map((tech) => (
                  <Box key={tech.technicianId} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {tech.technicianName}
                      </Typography>
                      <Chip 
                        label={`%${tech.successRate}`} 
                        color={tech.successRate >= 93 ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Toplam İşlem</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{tech.totalOperations}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Tamamlanan</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{tech.completedOperations}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Ortalama Süre</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{tech.averageDuration} gün</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Başarı Oranı</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>%{tech.successRate}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
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
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
            sx={{ borderRadius: 2 }}
          >
            PDF İndir
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
    </Box>
  );
}