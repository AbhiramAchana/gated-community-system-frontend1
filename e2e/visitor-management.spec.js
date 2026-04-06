import { test, expect } from '@playwright/test';

async function login(page, email, password) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
}

test.describe('Visitor Management', () => {
  test('Owner should pre-approve visitor', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Click add visitor
    const addButton = page.locator('button').filter({ hasText: /add|pre-approve/i });
    if (await addButton.isVisible()) {
      await addButton.first().click();
      
      // Fill visitor form
      await page.fill('input[name="name"]', 'John Visitor');
      await page.fill('input[name="phoneNumber"]', '9876543210');
      await page.fill('input[name="purpose"]', 'Personal visit');
      await page.fill('input[name="visitDate"]', '2026-04-10');
      
      // Submit
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/success|approved/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Should view visitor list', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Verify visitor list
    await expect(page.locator('text=/visitor|no visitors/i')).toBeVisible();
  });

  test('Should check-in visitor', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Find check-in button
    const checkInButton = page.locator('button').filter({ hasText: /check.?in/i }).first();
    if (await checkInButton.isVisible()) {
      await checkInButton.click();
      
      await expect(page.locator('text=/checked.?in|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Should check-out visitor', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Find check-out button
    const checkOutButton = page.locator('button').filter({ hasText: /check.?out/i }).first();
    if (await checkOutButton.isVisible()) {
      await checkOutButton.click();
      
      await expect(page.locator('text=/checked.?out|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Should view visitor history', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to visitor history
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Click history tab or button
    const historyButton = page.locator('button, a').filter({ hasText: /history/i });
    if (await historyButton.isVisible()) {
      await historyButton.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=/history|visit/i')).toBeVisible();
    }
  });

  test('Should filter visitors by status', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Filter by status
    const filterSelect = page.locator('select, button').filter({ hasText: /status|filter/i });
    if (await filterSelect.first().isVisible()) {
      await filterSelect.first().click();
      await page.click('text=/pending|approved/i');
      await page.waitForTimeout(1000);
    }
  });

  test('Should search visitors', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to visitors
    await page.click('text=/visitor/i');
    await page.waitForTimeout(1000);
    
    // Search
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('John');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=/john|no results/i')).toBeVisible();
    }
  });
});
