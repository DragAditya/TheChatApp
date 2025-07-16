import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.getByText('NextJS Chat')).toBeVisible();
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should toggle between login and signup forms', async ({ page }) => {
    // Should show login form initially
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Click to switch to signup
    await page.getByText("Don't have an account? Sign up").click();

    // Should show signup form
    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

    // Click to switch back to login
    await page.getByText('Already have an account? Sign in').click();

    // Should show login form again
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors for invalid inputs', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Form should not submit and show HTML5 validation
    await expect(page.getByPlaceholder('Enter your email')).toBeFocused();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Enter your password');
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0);

    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await toggleButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    await toggleButton.click();

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show demo credentials', async ({ page }) => {
    await expect(page.getByText('Demo: test@example.com / password123')).toBeVisible();
  });
});