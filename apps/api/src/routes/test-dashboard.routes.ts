import { Hono } from 'hono';
import { testDashboardService } from '../services/test-dashboard.service';

const app = new Hono();

// Get dashboard data
app.get('/dashboard', async (c) => {
  try {
    const data = await testDashboardService.getDashboardData();
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get dashboard data'
    }, 500);
  }
});

// Export dashboard report
app.get('/dashboard/export', async (c) => {
  try {
    const format = c.req.query('format') as 'json' | 'html' | 'markdown' || 'markdown';
    const report = await testDashboardService.exportReport(format);
    
    const contentTypes = {
      json: 'application/json',
      html: 'text/html',
      markdown: 'text/markdown'
    };

    return c.text(report, 200, {
      'Content-Type': contentTypes[format]
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to export report'
    }, 500);
  }
});

// Record test metrics (for CI/CD integration)
app.post('/dashboard/metrics', async (c) => {
  try {
    const metrics = await c.req.json();
    await testDashboardService.recordTestMetrics(metrics);
    
    return c.json({
      success: true,
      message: 'Metrics recorded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to record metrics'
    }, 500);
  }
});

export default app;
