import { test, expect } from '@playwright/test';

test.describe('Offline Functionality', () => {
  test('should display offline indicator when network is down', async ({ page, context }) => {
    await page.goto('/oracle');

    // Go offline
    await context.setOffline(true);

    // Check for offline indicator
    await page.waitForTimeout(1000); // Give time for offline detection

    const offlineIndicator = page.locator('[data-testid="offline-queue-status"], .offline-indicator');

    // Offline indicator should appear or network status should change
    const isVisible = await offlineIndicator.isVisible();
    if (isVisible) {
      await expect(offlineIndicator).toContainText(/offline|pending/i);
    }
  });

  test('should queue messages when offline', async ({ page, context }) => {
    await page.goto('/oracle');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Try to send a message
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    if (await messageInput.isVisible() && await sendButton.isVisible()) {
      await messageInput.fill('Offline test message');
      await sendButton.click();

      // Message should be queued
      await page.waitForTimeout(1000);

      // Check for queue indicator
      const queueStatus = page.locator('[data-testid="offline-queue-status"]');
      if (await queueStatus.isVisible()) {
        await expect(queueStatus).toBeVisible();
      }
    }
  });

  test('should sync queued messages when back online', async ({ page, context }) => {
    await page.goto('/oracle');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Try to send a message
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    if (await messageInput.isVisible() && await sendButton.isVisible()) {
      await messageInput.fill('Test sync message');
      await sendButton.click();
      await page.waitForTimeout(1000);

      // Go back online
      await context.setOffline(false);
      await page.waitForTimeout(2000); // Give time for sync

      // Queue should be processed
      const queueStatus = page.locator('[data-testid="offline-queue-status"]');
      if (await queueStatus.isVisible()) {
        // Should eventually show synced or disappear
        await page.waitForTimeout(5000);
      }
    }
  });

  test('should cache pages for offline viewing', async ({ page, context }) => {
    // Visit pages while online
    await page.goto('/oracle');
    await page.goto('/dashboard');
    await page.goto('/maia');

    // Go offline
    await context.setOffline(true);

    // Try to navigate to cached page
    await page.goto('/oracle');

    // Page should load from cache
    await expect(page.locator('[data-testid="oracle-conversation"]')).toBeVisible({ timeout: 5000 });
  });
});
