"use client";

import { useState, useEffect } from "react";
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert
} from "@mui/material";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Layout } from "../../../components/Layout";
import { useAuth } from "../../../features/auth/useAuth";

interface DashboardStats {
  totalProducts: number;
  activeIssues: number;
  completedRepairs: number;
  totalShipments: number;
  productsByStatus: Record<string, number>;
  issuesByStatus: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [issueAnalysis, setIssueAnalysis] = useState<IssueAnalysis | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setDashboardStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductAnalysis = async () => {
    try {
      const response = await fetch('/api/v1/reports/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product analysis');
      }
      
      const data = await response.json();
      setProductAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchIssueAnalysis = async () => {
    try {
      const response = await fetch('/api/v1/reports/issues', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch issue analysis');
      }
      
      const data = await response.json();
      setIssueAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchPerformanceReport = async () => {
    try {
      const response = await fetch('/api/v1/reports/performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance report');
      }
      
      const data = await response.json();
      setPerformanceReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Fetch data based on tab
    switch (newValue) {
      case 1:
        if (!productAnalysis) fetchProductAnalysis();
        break;
      case 2:
        if (!issueAnalysis) fetchIssueAnalysis();
        break;
      case 3:
        if (!performanceReport) fetchPerformanceReport();
        break;
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/v1/reports/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          reportType: activeTab === 0 ? 'dashboard' : 
                     activeTab === 1 ? 'products' : 
                     activeTab === 2 ? 'issues' : 'performance',
          dateRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const data = await response.json();
      
      // Download the report
      const downloadResponse = await fetch(`/api/v1/reports/${data.data.reportId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download report');
      }
      
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  if (loading) {
    return (
      <Layout title="Reports & Analytics">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading reports...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Reports & Analytics">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchDashboardStats}>
            Retry
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Reports & Analytics">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Reports & Analytics
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => exportReport('pdf')}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => exportReport('excel')}
              sx={{ mr: 1 }}
            >
              Export Excel
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => exportReport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Dashboard Overview" />
          <Tab label="Product Analysis" />
          <Tab label="Issue Analysis" />
          <Tab label="Performance Report" />
        </Tabs>

        {activeTab === 0 && dashboardStats && (
          <Box>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {dashboardStats.totalProducts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Products
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error">
                      {dashboardStats.activeIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Issues
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {dashboardStats.completedRepairs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Repairs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {dashboardStats.totalShipments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Shipments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Products by Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardStats.productsByStatus).map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(dashboardStats.productsByStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Issues by Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(dashboardStats.issuesByStatus).map(([key, value]) => ({
                      status: key,
                      count: value,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && productAnalysis && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Products by Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(productAnalysis.productsByType).map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(productAnalysis.productsByType).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Production
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productAnalysis.monthlyProduction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && issueAnalysis && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Issues by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(issueAnalysis.issuesByCategory).map(([key, value]) => ({
                      category: key,
                      count: value,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Issues by Priority
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(issueAnalysis.issuesByPriority).map(([key, value]) => ({
                      priority: key,
                      count: value,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && performanceReport && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Technician Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={performanceReport.technicianPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="technicianName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalOperations" fill="#8884d8" name="Total Operations" />
                      <Bar dataKey="completedOperations" fill="#82ca9d" name="Completed Operations" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Layout>
  );
} 