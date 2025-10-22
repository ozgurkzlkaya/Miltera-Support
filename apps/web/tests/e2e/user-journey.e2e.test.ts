import { test, expect } from '@playwright/test';

test.describe('User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth');
  });

  test('Complete Admin User Journey', async ({ page }) => {
    // Login as admin
    await page.fill('input[name="email"]', 'admin@miltera.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Navigate to products page
    await page.click('a[href="/dashboard/products"]');
    await expect(page).toHaveURL('http://localhost:3000/dashboard/products');

    // Create new product
    await page.click('button:has-text("Yeni Ürün")');
    await page.fill('input[name="serialNumber"]', 'E2E-TEST-001');
    await page.selectOption('select[name="productModelId"]', 'model-123');
    await page.fill('input[name="productionDate"]', '2024-01-01');
    await page.selectOption('select[name="status"]', 'IN_PRODUCTION');
    await page.click('button:has-text("Kaydet")');

    // Verify product was created
    await expect(page.locator('text=E2E-TEST-001')).toBeVisible();

    // Update product location
    await page.click('tr:has-text("E2E-TEST-001") button:has-text("Konum Değiştir")');
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');

    // Verify location update
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();

    // Navigate to users page
    await page.click('a[href="/dashboard/users"]');
    await expect(page).toHaveURL('http://localhost:3000/dashboard/users');

    // Export users data
    await page.click('button:has-text("Dışa Aktar")');
    // Verify download started (this would need actual file download verification)

    // Navigate to admin dashboard
    await page.click('a[href="/dashboard/admin"]');
    await expect(page).toHaveURL('http://localhost:3000/dashboard/admin');

    // Verify admin dashboard loads with statistics
    await expect(page.locator('text=Toplam Ürün')).toBeVisible();
    await expect(page.locator('text=Toplam Kullanıcı')).toBeVisible();
  });

  test('TSP User Journey - Location Updates', async ({ page }) => {
    // Login as TSP user
    await page.fill('input[name="email"]', 'tsp@miltera.com');
    await page.fill('input[name="password"]', 'tsp123');
    await page.click('button[type="submit"]');

    // Navigate to products
    await page.click('a[href="/dashboard/products"]');

    // Find a product and update its location
    const productRow = page.locator('tr').filter({ hasText: 'TEST' }).first();
    await productRow.locator('button:has-text("Konum Değiştir")').click();

    // Select "Müşteride" (null location)
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');

    // Verify success message
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();

    // Refresh page and verify location persisted
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
  });

  test('Customer User Journey', async ({ page }) => {
    // Login as customer
    await page.fill('input[name="email"]', 'customer@miltera.com');
    await page.fill('input[name="password"]', 'customer123');
    await page.click('button[type="submit"]');

    // Should see customer dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Müşteri Paneli')).toBeVisible();

    // Should not see admin or TSP specific features
    await expect(page.locator('a[href="/dashboard/users"]')).not.toBeVisible();
    await expect(page.locator('a[href="/dashboard/admin"]')).not.toBeVisible();
  });

  test('Error Handling and Recovery', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('http://localhost:3000/dashboard/products');
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3000/auth');

    // Login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Geçersiz kimlik bilgileri')).toBeVisible();

    // Login with valid credentials
    await page.fill('input[name="email"]', 'admin@miltera.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should successfully login
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('Responsive Design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/auth');

    // Login
    await page.fill('input[name="email"]', 'admin@miltera.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify mobile navigation works
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('nav')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    // Verify layout adapts
    await expect(page.locator('main')).toBeVisible();
  });
});
