import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should display welcome screen for new users', async ({ page }) => {
    // Check for onboarding/welcome content
    const isOnboarding = await page.locator('[data-testid="onboarding-screen"]').isVisible();

    if (isOnboarding) {
      await expect(page.locator('[data-testid="onboarding-screen"]')).toBeVisible();
      await expect(page.locator('[data-testid="onboarding-title"]')).toBeVisible();
    }
  });

  test('should complete onboarding flow', async ({ page }) => {
    const onboardingScreen = page.locator('[data-testid="onboarding-screen"]');

    if (await onboardingScreen.isVisible()) {
      // Look for next/continue buttons
      const nextButton = page.locator('[data-testid="onboarding-next"], button:has-text("Next"), button:has-text("Continue")').first();

      let steps = 0;
      const maxSteps = 10; // Safety limit

      while (steps < maxSteps) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          steps++;
        } else {
          break;
        }
      }

      // Should redirect to main app
      await expect(page).toHaveURL(/\/(maia|oracle|dashboard)/, { timeout: 10000 });
    }
  });
});
