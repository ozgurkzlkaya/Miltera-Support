import fs from 'fs';
import path from 'path';

interface TestMetrics {
  timestamp: string;
  category: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  duration: number;
  coverage: number;
}

interface DashboardData {
  lastUpdate: string;
  overall: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    averageDuration: number;
    totalCoverage: number;
  };
  categories: {
    [key: string]: {
      tests: number;
      passed: number;
      failed: number;
      successRate: number;
      duration: number;
      coverage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  recentTests: TestMetrics[];
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export class TestDashboardService {
  private metricsFile: string;
  private dashboardFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.metricsFile = path.join(dataDir, 'test-metrics.json');
    this.dashboardFile = path.join(dataDir, 'dashboard-data.json');
  }

  async recordTestMetrics(metrics: TestMetrics): Promise<void> {
    try {
      let allMetrics: TestMetrics[] = [];
      
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf-8');
        allMetrics = JSON.parse(data);
      }

      allMetrics.push(metrics);
      
      // Keep only last 1000 records
      if (allMetrics.length > 1000) {
        allMetrics = allMetrics.slice(-1000);
      }

      fs.writeFileSync(this.metricsFile, JSON.stringify(allMetrics, null, 2));
      
      // Update dashboard
      await this.updateDashboard();
    } catch (error) {
      console.error('Error recording test metrics:', error);
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      if (fs.existsSync(this.dashboardFile)) {
        const data = fs.readFileSync(this.dashboardFile, 'utf-8');
        return JSON.parse(data);
      }
      
      return this.getDefaultDashboard();
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return this.getDefaultDashboard();
    }
  }

  private async updateDashboard(): Promise<void> {
    try {
      let allMetrics: TestMetrics[] = [];
      
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf-8');
        allMetrics = JSON.parse(data);
      }

      if (allMetrics.length === 0) {
        return;
      }

      // Calculate overall metrics
      const totalTests = allMetrics.reduce((sum, m) => sum + m.totalTests, 0);
      const passedTests = allMetrics.reduce((sum, m) => sum + m.passedTests, 0);
      const failedTests = allMetrics.reduce((sum, m) => sum + m.failedTests, 0);
      const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      const averageDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length;
      const totalCoverage = allMetrics.reduce((sum, m) => sum + m.coverage, 0) / allMetrics.length;

      // Calculate category metrics
      const categories: { [key: string]: any } = {};
      const categoryGroups = this.groupByCategory(allMetrics);

      for (const [category, metrics] of Object.entries(categoryGroups)) {
        const catTotal = metrics.reduce((sum, m) => sum + m.totalTests, 0);
        const catPassed = metrics.reduce((sum, m) => sum + m.passedTests, 0);
        const catFailed = metrics.reduce((sum, m) => sum + m.failedTests, 0);
        const catSuccessRate = catTotal > 0 ? (catPassed / catTotal) * 100 : 0;
        const catDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
        const catCoverage = metrics.reduce((sum, m) => sum + m.coverage, 0) / metrics.length;

        categories[category] = {
          tests: catTotal,
          passed: catPassed,
          failed: catFailed,
          successRate: catSuccessRate,
          duration: catDuration,
          coverage: catCoverage,
          trend: this.calculateTrend(metrics)
        };
      }

      // Get recent tests (last 10)
      const recentTests = allMetrics.slice(-10);

      // Generate alerts
      const alerts = this.generateAlerts({
        overall: { totalTests, passedTests, failedTests, successRate, averageDuration, totalCoverage },
        categories,
        recentTests
      });

      const dashboardData: DashboardData = {
        lastUpdate: new Date().toISOString(),
        overall: {
          totalTests,
          passedTests,
          failedTests,
          successRate,
          averageDuration,
          totalCoverage
        },
        categories,
        recentTests,
        alerts
      };

      fs.writeFileSync(this.dashboardFile, JSON.stringify(dashboardData, null, 2));
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }

  private groupByCategory(metrics: TestMetrics[]): { [key: string]: TestMetrics[] } {
    return metrics.reduce((groups, metric) => {
      const category = metric.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(metric);
      return groups;
    }, {} as { [key: string]: TestMetrics[] });
  }

  private calculateTrend(metrics: TestMetrics[]): 'up' | 'down' | 'stable' {
    if (metrics.length < 2) return 'stable';

    const recent = metrics.slice(-5);
    const older = metrics.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.successRate, 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'up';
    if (recentAvg < olderAvg - 5) return 'down';
    return 'stable';
  }

  private generateAlerts(data: any): Array<{ type: 'error' | 'warning' | 'info'; message: string; timestamp: string }> {
    const alerts: Array<{ type: 'error' | 'warning' | 'info'; message: string; timestamp: string }> = [];
    const timestamp = new Date().toISOString();

    // Check overall success rate
    if (data.overall.successRate < 80) {
      alerts.push({
        type: 'error',
        message: `Low overall success rate: ${data.overall.successRate.toFixed(2)}%`,
        timestamp
      });
    } else if (data.overall.successRate < 95) {
      alerts.push({
        type: 'warning',
        message: `Success rate below target: ${data.overall.successRate.toFixed(2)}%`,
        timestamp
      });
    }

    // Check failed tests
    if (data.overall.failedTests > 0) {
      alerts.push({
        type: 'error',
        message: `${data.overall.failedTests} tests are currently failing`,
        timestamp
      });
    }

    // Check performance
    if (data.overall.averageDuration > 300000) {
      alerts.push({
        type: 'warning',
        message: `Slow test execution: ${(data.overall.averageDuration / 1000).toFixed(2)}s average`,
        timestamp
      });
    }

    // Check coverage
    if (data.overall.totalCoverage < 80) {
      alerts.push({
        type: 'warning',
        message: `Low test coverage: ${data.overall.totalCoverage.toFixed(2)}%`,
        timestamp
      });
    }

    // Check category trends
    for (const [category, metrics] of Object.entries(data.categories)) {
      const catMetrics = metrics as any;
      if (catMetrics.trend === 'down') {
        alerts.push({
          type: 'warning',
          message: `${category} tests showing downward trend`,
          timestamp
        });
      }
    }

    // Add success message if everything is good
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        message: 'All tests passing! System is healthy.',
        timestamp
      });
    }

    return alerts;
  }

  private getDefaultDashboard(): DashboardData {
    return {
      lastUpdate: new Date().toISOString(),
      overall: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
        averageDuration: 0,
        totalCoverage: 0
      },
      categories: {},
      recentTests: [],
      alerts: [{
        type: 'info',
        message: 'No test data available yet',
        timestamp: new Date().toISOString()
      }]
    };
  }

  async exportReport(format: 'json' | 'html' | 'markdown' = 'markdown'): Promise<string> {
    const data = await this.getDashboardData();

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    if (format === 'html') {
      return this.generateHTMLReport(data);
    }

    return this.generateMarkdownReport(data);
  }

  private generateMarkdownReport(data: DashboardData): string {
    let report = '# 📊 Real-Time Test Dashboard Report\n\n';
    report += `**Last Update:** ${new Date(data.lastUpdate).toLocaleString()}\n\n`;

    report += '## 📈 Overall Metrics\n\n';
    report += '| Metric | Value |\n';
    report += '|--------|-------|\n';
    report += `| Total Tests | ${data.overall.totalTests} |\n`;
    report += `| Passed Tests | ${data.overall.passedTests} |\n`;
    report += `| Failed Tests | ${data.overall.failedTests} |\n`;
    report += `| Success Rate | ${data.overall.successRate.toFixed(2)}% |\n`;
    report += `| Average Duration | ${(data.overall.averageDuration / 1000).toFixed(2)}s |\n`;
    report += `| Total Coverage | ${data.overall.totalCoverage.toFixed(2)}% |\n\n`;

    report += '## 📊 Test Categories\n\n';
    for (const [category, metrics] of Object.entries(data.categories)) {
      const trendIcon = metrics.trend === 'up' ? '📈' : metrics.trend === 'down' ? '📉' : '➡️';
      report += `### ${category.toUpperCase()} ${trendIcon}\n`;
      report += `- Tests: ${metrics.tests}\n`;
      report += `- Passed: ${metrics.passed}\n`;
      report += `- Failed: ${metrics.failed}\n`;
      report += `- Success Rate: ${metrics.successRate.toFixed(2)}%\n`;
      report += `- Duration: ${(metrics.duration / 1000).toFixed(2)}s\n`;
      report += `- Coverage: ${metrics.coverage.toFixed(2)}%\n\n`;
    }

    if (data.alerts.length > 0) {
      report += '## 🚨 Alerts\n\n';
      data.alerts.forEach(alert => {
        const icon = alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
        report += `${icon} **${alert.type.toUpperCase()}**: ${alert.message}\n`;
      });
      report += '\n';
    }

    return report;
  }

  private generateHTMLReport(data: DashboardData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50; }
    .metric-value { font-size: 24px; font-weight: bold; color: #333; }
    .metric-label { color: #666; font-size: 14px; }
    .alert { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .alert-error { background: #ffebee; border-left: 4px solid #f44336; }
    .alert-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
    .alert-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Real-Time Test Dashboard</h1>
    <p>Last Update: ${new Date(data.lastUpdate).toLocaleString()}</p>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${data.overall.totalTests}</div>
        <div class="metric-label">Total Tests</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.overall.passedTests}</div>
        <div class="metric-label">Passed Tests</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.overall.successRate.toFixed(2)}%</div>
        <div class="metric-label">Success Rate</div>
      </div>
    </div>

    <h2>Alerts</h2>
    ${data.alerts.map(alert => `
      <div class="alert alert-${alert.type}">
        <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;
  }
}

export const testDashboardService = new TestDashboardService();
