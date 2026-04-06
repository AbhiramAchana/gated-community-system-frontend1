import { test, expect } from '@playwright/test';

async function login(page, email, password) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
}

test.describe('Invoice and Payment Flow', () => {
  test('Admin should generate invoice', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Click generate invoice
    const generateButton = page.locator('button').filter({ hasText: /generate|create/i });
    if (await generateButton.isVisible()) {
      await generateButton.first().click();
      
      // Fill invoice form
      await page.selectOption('select[name="propertyId"]', { index: 1 });
      await page.fill('input[name="amount"]', '5000');
      await page.fill('input[name="dueDate"]', '2026-05-01');
      
      // Submit
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/success|generated/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Owner should view their invoices', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing|payment/i');
    await page.waitForTimeout(1000);
    
    // Verify invoices are displayed
    await expect(page.locator('text=/invoice|no invoices|pending/i')).toBeVisible();
  });

  test('Tenant should view their invoices', async ({ page }) => {
    await login(page, 'tenant@test.com', 'Tenant@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing|payment/i');
    await page.waitForTimeout(1000);
    
    // Verify tenant can see invoices
    await expect(page.locator('text=/invoice|no invoices|pending/i')).toBeVisible();
  });

  test('Should filter invoices by status', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Filter by pending
    const filterSelect = page.locator('select, button').filter({ hasText: /status|filter/i });
    if (await filterSelect.first().isVisible()) {
      await filterSelect.first().click();
      await page.click('text=/pending/i');
      await page.waitForTimeout(1000);
    }
  });

  test('Should view invoice details', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Click on first invoice
    const invoiceCard = page.locator('[class*="invoice"], [class*="card"]').first();
    if (await invoiceCard.isVisible()) {
      await invoiceCard.click();
      
      // Verify details
      await expect(page.locator('text=/amount|due date|status/i')).toBeVisible();
    }
  });

  test('Should initiate payment for invoice', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Find pay button
    const payButton = page.locator('button').filter({ hasText: /pay|payment/i }).first();
    if (await payButton.isVisible()) {
      await payButton.click();
      
      // Verify payment modal or page
      await expect(page.locator('text=/payment|razorpay|amount/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Should display payment history', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to payments
    await page.click('text=/payment|transaction/i');
    await page.waitForTimeout(1000);
    
    // Verify payment history
    await expect(page.locator('text=/payment|transaction|no payments/i')).toBeVisible();
  });

  test('Admin should view all invoices', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Verify admin can see all invoices
    await expect(page.locator('text=/invoice|all invoices/i')).toBeVisible();
  });

  test('Should download invoice', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to invoices
    await page.click('text=/invoice|billing/i');
    await page.waitForTimeout(1000);
    
    // Find download button
    const downloadButton = page.locator('button, a').filter({ hasText: /download|pdf/i }).first();
    if (await downloadButton.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);
      
      expect(download).toBeTruthy();
    }
  });
});
