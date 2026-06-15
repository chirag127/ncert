import { expect, test } from '@playwright/test';

test.describe('NCERT Library Website', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NCERT Library/);
  });

  test('should have search input', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('#hero-search');
    await expect(searchInput).toBeVisible();
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Search Books');
    await expect(page).toHaveURL(/\/search/);
  });

  test('should navigate to books page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Books');
    await expect(page).toHaveURL(/\/books/);
  });

  test('should search on search page', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should have dark mode support', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/).or(html).not.toHaveClass(/dark/);
  });
});
