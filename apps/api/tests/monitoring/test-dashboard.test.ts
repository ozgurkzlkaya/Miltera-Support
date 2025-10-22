import { describe, it, expect } from '@jest/globals';

interface DashboardMetrics {
  timestamp: string;
  testSuite: string;
  status: 'PASS' | 'FAIL' | 'RUNNING';
  duration: number;
  coverage: number;
  trends: {
    successRate: number;
    executionTime: number;
    testCount: number;
  };
}

class TestDashboard {
  private metrics: DashboardMetrics[] = [];

  recordTestRun(metrics: DashboardMetrics): void {
    this.metrics.push(metrics);
  }

  getDashboardData(): {
    overview: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      runningTests: number;
      successRate: number;
      averageExecutionTime: number;
      totalCoverage: number;
    };
    trends: {
      last24Hours: DashboardMetrics[];
      lastWeek: DashboardMetrics[];
      lastMonth: DashboardMetrics[];
    };
    categories: {
      unit: DashboardMetrics[];
      integration: DashboardMetrics[];
      e2e: DashboardMetrics[];
      performance: DashboardMetrics[];
      security: DashboardMetrics[];
      ai: DashboardMetrics[];
    };
  } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last24HoursData = this.metrics.filter(m => new Date(m.timestamp) >= last24Hours);
    const lastWeekData = this.metrics.filter(m => new Date(m.timestamp) >= lastWeek);
    const lastMonthData = this.metrics.filter(m => new Date(m.timestamp) >= lastMonth);

    const totalTests = this.metrics.reduce((sum, m) => sum + 1, 0);
    const passedTests = this.metrics.filter(m => m.status === 'PASS').length;
    const failedTests = this.metrics.filter(m => m.status === 'FAIL').length;
    const runningTests = this.metrics.filter(m => m.status === 'RUNNING').length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const averageExecutionTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalTests || 0;
    const totalCoverage = this.metrics.reduce((sum, m) => sum + m.coverage, 0) / totalTests || 0;

    return {
      overview: {
        totalTests,
        passedTests,
        failedTests,
        runningTests,
        successRate,
        averageExecutionTime,
        totalCoverage
      },
      trends: {
        last24Hours: last24HoursData,
        lastWeek: lastWeekData,
        lastMonth: lastMonthData
      },
      categories: {
        unit: this.metrics.filter(m => m.testSuite === 'unit'),
        integration: this.metrics.filter(m => m.testSuite === 'integration'),
        e2e: this.metrics.filter(m => m.testSuite === 'e2e'),
        performance: this.metrics.filter(m => m.testSuite === 'performance'),
        security: this.metrics.filter(m => m.testSuite === 'security'),
        ai: this.metrics.filter(m => m.testSuite === 'ai')
      }
    };
  }

  generateAlerts(): string[] {
    const alerts: string[] = [];
    const data = this.getDashboardData();

    if (data.overview.successRate < 95) {
      alerts.push(`⚠️ Low success rate: ${data.overview.successRate.toFixed(2)}%`);
    }

    if (data.overview.failedTests > 0) {
      alerts.push(`❌ ${data.overview.failedTests} tests failed`);
    }

    if (data.overview.averageExecutionTime > 200000) { // 3.33 minutes
      alerts.push(`🐌 Slow test execution: ${(data.overview.averageExecutionTime / 1000).toFixed(2)}s`);
    }

    if (data.overview.totalCoverage < 80) {
      alerts.push(`📊 Low test coverage: ${data.overview.totalCoverage.toFixed(2)}%`);
    }

    return alerts;
  }

  exportReport(): string {
    const data = this.getDashboardData();
    const alerts = this.generateAlerts();

    let report = '# 📊 Test Dashboard Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    report += '## 📈 Overview\n\n';
    report += `| Metric | Value |\n`;
    report += `|---|---|\n`;
    report += `| Total Tests | ${data.overview.totalTests} |\n`;
    report += `| Passed Tests | ${data.overview.passedTests} |\n`;
    report += `| Failed Tests | ${data.overview.failedTests} |\n`;
    report += `| Running Tests | ${data.overview.runningTests} |\n`;
    report += `| Success Rate | ${data.overview.successRate.toFixed(2)}% |\n`;
    report += `| Avg Execution Time | ${(data.overview.averageExecutionTime / 1000).toFixed(2)}s |\n`;
    report += `| Total Coverage | ${data.overview.totalCoverage.toFixed(2)}% |\n\n`;

    if (alerts.length > 0) {
      report += '## 🚨 Alerts\n\n';
      alerts.forEach(alert => {
        report += `- ${alert}\n`;
      });
      report += '\n';
    }

    report += '## 📊 Test Categories\n\n';
    Object.entries(data.categories).forEach(([category, tests]) => {
      report += `### ${category.toUpperCase()}\n`;
      report += `- Total Runs: ${tests.length}\n`;
      report += `- Success Rate: ${tests.length > 0 ? (tests.filter(t => t.status === 'PASS').length / tests.length * 100).toFixed(2) : 0}%\n`;
      report += `- Avg Duration: ${tests.length > 0 ? (tests.reduce((sum, t) => sum + t.duration, 0) / tests.length / 1000).toFixed(2) : 0}s\n`;
      report += `- Avg Coverage: ${tests.length > 0 ? (tests.reduce((sum, t) => sum + t.coverage, 0) / tests.length).toFixed(2) : 0}%\n\n`;
    });

    return report;
  }
}

describe('Test Dashboard System', () => {
  let dashboard: TestDashboard;

  beforeEach(() => {
    dashboard = new TestDashboard();
  });

  it('should record test run metrics', () => {
    const metrics: DashboardMetrics = {
      timestamp: new Date().toISOString(),
      testSuite: 'unit',
      status: 'PASS',
      duration: 5000,
      coverage: 85,
      trends: {
        successRate: 100,
        executionTime: 5000,
        testCount: 11
      }
    };

    dashboard.recordTestRun(metrics);
    
    const data = dashboard.getDashboardData();
    expect(data.overview.totalTests).toBe(1);
    expect(data.overview.passedTests).toBe(1);
    expect(data.overview.failedTests).toBe(0);
  });

  it('should generate dashboard data', () => {
    // Record multiple test runs
    const testRuns = [
      {
        timestamp: new Date().toISOString(),
        testSuite: 'unit',
        status: 'PASS' as const,
        duration: 5000,
        coverage: 85,
        trends: { successRate: 100, executionTime: 5000, testCount: 11 }
      },
      {
        timestamp: new Date().toISOString(),
        testSuite: 'integration',
        status: 'PASS' as const,
        duration: 3000,
        coverage: 70,
        trends: { successRate: 100, executionTime: 3000, testCount: 5 }
      },
      {
        timestamp: new Date().toISOString(),
        testSuite: 'e2e',
        status: 'FAIL' as const,
        duration: 10000,
        coverage: 60,
        trends: { successRate: 80, executionTime: 10000, testCount: 5 }
      }
    ];

    testRuns.forEach(run => dashboard.recordTestRun(run));

    const data = dashboard.getDashboardData();
    
    expect(data.overview.totalTests).toBe(3);
    expect(data.overview.passedTests).toBe(2);
    expect(data.overview.failedTests).toBe(1);
    expect(data.overview.successRate).toBeCloseTo(66.67, 1);
    expect(data.categories.unit.length).toBe(1);
    expect(data.categories.integration.length).toBe(1);
    expect(data.categories.e2e.length).toBe(1);
  });

  it('should generate alerts for issues', () => {
    // Record test runs with issues
    const testRuns = [
      {
        timestamp: new Date().toISOString(),
        testSuite: 'unit',
        status: 'FAIL' as const,
        duration: 5000,
        coverage: 50, // Low coverage
        trends: { successRate: 50, executionTime: 5000, testCount: 11 }
      },
      {
        timestamp: new Date().toISOString(),
        testSuite: 'integration',
        status: 'PASS' as const,
        duration: 400000, // Slow execution
        coverage: 70,
        trends: { successRate: 100, executionTime: 400000, testCount: 5 }
      }
    ];

    testRuns.forEach(run => dashboard.recordTestRun(run));

    const alerts = dashboard.generateAlerts();
    
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some(alert => alert.includes('Low success rate'))).toBe(true);
    expect(alerts.some(alert => alert.includes('tests failed'))).toBe(true);
    expect(alerts.some(alert => alert.includes('Slow test execution'))).toBe(true);
    expect(alerts.some(alert => alert.includes('Low test coverage'))).toBe(true);
  });

  it('should export dashboard report', () => {
    // Record test runs
    const testRuns = [
      {
        timestamp: new Date().toISOString(),
        testSuite: 'unit',
        status: 'PASS' as const,
        duration: 5000,
        coverage: 85,
        trends: { successRate: 100, executionTime: 5000, testCount: 11 }
      },
      {
        timestamp: new Date().toISOString(),
        testSuite: 'integration',
        status: 'PASS' as const,
        duration: 3000,
        coverage: 70,
        trends: { successRate: 100, executionTime: 3000, testCount: 5 }
      }
    ];

    testRuns.forEach(run => dashboard.recordTestRun(run));

    const report = dashboard.exportReport();
    
    expect(report).toContain('# 📊 Test Dashboard Report');
    expect(report).toContain('## 📈 Overview');
    expect(report).toContain('## 📊 Test Categories');
    expect(report).toContain('Total Tests');
    expect(report).toContain('Success Rate');
  });
});
