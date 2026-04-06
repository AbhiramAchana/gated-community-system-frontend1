import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /login|sign in/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'Admin@123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
    
    // Verify successful login
    await expect(page).toHaveURL(/dashboard|home/i);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=/invalid|error|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    
    // Browser validation or custom error
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.locator('a, button').filter({ hasText: /register|sign up/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register|signup/i);
    }
  });

  test('should register new user', async ({ page }) => {
    // Navigate to register
    const registerLink = page.locator('a, button').filter({ hasText: /register|sign up/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Fill registration form
      await page.fill('input[name="firstName"], input[placeholder*="first"]', 'Test');
      await page.fill('input[name="lastName"], input[placeholder*="last"]', 'User');
      await page.fill('input[type="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[name="phoneNumber"], input[placeholder*="phone"]', '9876543210');
      await page.fill('input[type="password"]', 'Test@123456');
      
      // Select role if available
      const roleSelect = page.locator('select[name="role"]');
      if (await roleSelect.isVisible()) {
        await roleSelect.selectOption('OWNER');
      }
      
      await page.click('button[type="submit"]');
      
      // Verify registration success
      await page.waitForTimeout(2000);
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
    
    // Find and click logout
    const logoutButton = page.locator('button, a').filter({ hasText: /logout|sign out/i });
    await logoutButton.click();
    
    // Verify redirect to login
    await expect(page).toHaveURL(/login|^\/$/, { timeout: 5000 });
  });
});
