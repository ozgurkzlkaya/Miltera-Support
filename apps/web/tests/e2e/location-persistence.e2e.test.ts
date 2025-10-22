import { test, expect } from '@playwright/test';

test.describe('Location Persistence E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as TSP user
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', 'tsp@miltera.com');
    await page.fill('input[name="password"]', 'tsp123');
    await page.click('button[type="submit"]');
    await page.goto('http://localhost:3000/dashboard/products');
  });

  test('Location Update Persistence - Button Method', async ({ page }) => {
    // Find first product with a location
    const productRow = page.locator('tr').filter({ hasText: 'TEST' }).first();
    const initialLocation = await productRow.locator('td:nth-child(5)').textContent();
    
    // Click location update button
    await productRow.locator('button:has-text("Konum Değiştir")').click();
    
    // Select "Müşteride" (null location)
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    
    // Verify success message
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    
    // Refresh page and verify location persisted
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
    
    // Verify location changed from initial value
    expect(initialLocation).not.toBe('Müşteride');
  });

  test('Location Update Persistence - Edit Modal Method', async ({ page }) => {
    // Find first product
    const productRow = page.locator('tr').filter({ hasText: 'TEST' }).first();
    
    // Click edit button
    await productRow.locator('button:has-text("Düzenle")').click();
    
    // Change location in edit modal
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    
    // Verify success message
    await expect(page.locator('text=Ürün güncellendi')).toBeVisible();
    
    // Refresh page and verify location persisted
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
  });

  test('Multiple Location Updates Persistence', async ({ page }) => {
    // Update location to "Müşteride"
    const productRow = page.locator('tr').filter({ hasText: 'TEST' }).first();
    await productRow.locator('button:has-text("Konum Değiştir")').click();
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    
    // Refresh and verify
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
    
    // Update to a specific location
    await productRow.locator('button:has-text("Konum Değiştir")').click();
    await page.selectOption('select[name="locationId"]', 'location-1');
    await page.click('button:has-text("Güncelle")');
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    
    // Refresh and verify
    await page.reload();
    await expect(productRow.locator('text=Depo A')).toBeVisible();
    
    // Update back to "Müşteride"
    await productRow.locator('button:has-text("Konum Değiştir")').click();
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    
    // Final refresh and verify
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
  });

  test('Location Update with Network Interruption', async ({ page }) => {
    // Start location update
    const productRow = page.locator('tr').filter({ hasText: 'TEST' }).first();
    await productRow.locator('button:has-text("Konum Değiştir")').click();
    await page.selectOption('select[name="locationId"]', '');
    
    // Simulate network interruption
    await page.context().setOffline(true);
    await page.click('button:has-text("Güncelle")');
    
    // Should show error message
    await expect(page.locator('text=Konum güncellenemedi')).toBeVisible();
    
    // Restore network
    await page.context().setOffline(false);
    
    // Retry the update
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    
    // Verify persistence
    await page.reload();
    await expect(productRow.locator('text=Müşteride')).toBeVisible();
  });

  test('Concurrent Location Updates', async ({ page, context }) => {
    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/auth');
    await page2.fill('input[name="email"]', 'tsp@miltera.com');
    await page2.fill('input[name="password"]', 'tsp123');
    await page2.click('button[type="submit"]');
    await page2.goto('http://localhost:3000/dashboard/products');
    
    // Update location in first tab
    const productRow1 = page.locator('tr').filter({ hasText: 'TEST' }).first();
    await productRow1.locator('button:has-text("Konum Değiştir")').click();
    await page.selectOption('select[name="locationId"]', '');
    await page.click('button:has-text("Güncelle")');
    
    // Update location in second tab
    const productRow2 = page2.locator('tr').filter({ hasText: 'TEST' }).first();
    await productRow2.locator('button:has-text("Konum Değiştir")').click();
    await page2.selectOption('select[name="locationId"]', 'location-1');
    await page2.click('button:has-text("Güncelle")');
    
    // Wait for both updates to complete
    await expect(page.locator('text=Konum güncellendi')).toBeVisible();
    await expect(page2.locator('text=Konum güncellendi')).toBeVisible();
    
    // Verify final state in both tabs
    await page.reload();
    await page2.reload();
    
    // At least one should show the final location
    const location1 = await productRow1.locator('td:nth-child(5)').textContent();
    const location2 = await productRow2.locator('td:nth-child(5)').textContent();
    
    expect(['Müşteride', 'Depo A']).toContain(location1);
    expect(['Müşteride', 'Depo A']).toContain(location2);
    
    await page2.close();
  });
});
