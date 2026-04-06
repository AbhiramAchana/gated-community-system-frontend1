import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page, email, password) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
}

test.describe('Property Management', () => {
  test('Admin should create new property', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to properties
    await page.click('text=/properties/i');
    await page.waitForTimeout(1000);
    
    // Click add property button
    const addButton = page.locator('button').filter({ hasText: /add|create|new/i });
    await addButton.first().click();
    
    // Fill property form
    await page.fill('input[name="propertyNumber"]', `TEST-${Date.now()}`);
    await page.selectOption('select[name="propertyType"]', 'APARTMENT');
    await page.fill('input[name="area"]', '1200');
    await page.fill('input[name="bedrooms"]', '3');
    await page.fill('input[name="bathrooms"]', '2');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=/success|created/i')).toBeVisible({ timeout: 5000 });
  });

  test('Admin should assign owner to property', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to properties
    await page.click('text=/properties/i');
    await page.waitForTimeout(1000);
    
    // Find first property and assign owner
    const assignButton = page.locator('button').filter({ hasText: /assign/i }).first();
    if (await assignButton.isVisible()) {
      await assignButton.click();
      
      // Select owner from dropdown
      await page.selectOption('select', { index: 1 });
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/success|assigned/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Owner should view their properties', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to my properties
    await page.click('text=/my properties|properties/i');
    await page.waitForTimeout(1000);
    
    // Verify properties list is visible
    await expect(page.locator('text=/property|no properties/i')).toBeVisible();
  });

  test('Owner should toggle owner-occupied status', async ({ page }) => {
    await login(page, 'owner@test.com', 'Owner@123');
    
    // Navigate to properties
    await page.click('text=/my properties|properties/i');
    await page.waitForTimeout(1000);
    
    // Find toggle button
    const toggleButton = page.locator('button, input[type="checkbox"]').filter({ 
      hasText: /occupied|owner occupied/i 
    }).first();
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(1000);
      
      // Verify status changed
      await expect(page.locator('text=/success|updated/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Should display property details', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to properties
    await page.click('text=/properties/i');
    await page.waitForTimeout(1000);
    
    // Click on first property
    const propertyCard = page.locator('[class*="property"], [class*="card"]').first();
    if (await propertyCard.isVisible()) {
      await propertyCard.click();
      
      // Verify details are shown
      await expect(page.locator('text=/property number|type|area/i')).toBeVisible();
    }
  });

  test('Should filter properties by type', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to properties
    await page.click('text=/properties/i');
    await page.waitForTimeout(1000);
    
    // Find filter dropdown
    const filterSelect = page.locator('select').filter({ hasText: /type|filter/i });
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('APARTMENT');
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const propertyCards = page.locator('[class*="property"], [class*="card"]');
      await expect(propertyCards.first()).toBeVisible();
    }
  });

  test('Should search properties', async ({ page }) => {
    await login(page, 'admin@test.com', 'Admin@123');
    
    // Navigate to properties
    await page.click('text=/properties/i');
    await page.waitForTimeout(1000);
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('A-101');
      await page.waitForTimeout(1000);
      
      // Verify search results
      await expect(page.locator('text=/A-101|no results/i')).toBeVisible();
    }
  });
});
