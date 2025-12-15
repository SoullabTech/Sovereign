import { test, expect } from '@playwright/test';

test.describe('Oracle Conversation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/oracle');
  });

  test('should display oracle conversation interface', async ({ page }) => {
    await expect(page.locator('[data-testid="oracle-conversation"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    // Type message
    await messageInput.fill('Hello MAIA');

    // Send message
    await sendButton.click();

    // Wait for user message to appear
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Hello MAIA');

    // Wait for MAIA response (with timeout)
    await expect(page.locator('[data-testid="maia-response"]').last()).toBeVisible({ timeout: 30000 });

    // Verify response has content
    const responseContent = await page.locator('[data-testid="maia-response"]').last().textContent();
    expect(responseContent).toBeTruthy();
    expect(responseContent!.length).toBeGreaterThan(10);
  });

  test('should display Opus Axiom status', async ({ page }) => {
    // Send a message first
    await page.locator('[data-testid="message-input"]').fill('Test message');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response
    await page.locator('[data-testid="maia-response"]').last().waitFor({ timeout: 30000 });

    // Check for Opus status indicator
    const opusStatus = page.locator('[data-testid="opus-status"]').last();
    if (await opusStatus.isVisible()) {
      // If Opus status is shown, verify it has valid state
      await expect(opusStatus).toHaveAttribute('data-status', /gold|warning|violation/);
    }
  });

  test('should handle rapid messages', async ({ page }) => {
    const messages = ['First message', 'Second message', 'Third message'];

    for (const message of messages) {
      await page.locator('[data-testid="message-input"]').fill(message);
      await page.locator('[data-testid="send-button"]').click();
      await page.waitForTimeout(500); // Small delay between messages
    }

    // Verify all messages sent
    const userMessages = page.locator('[data-testid="user-message"]');
    await expect(userMessages).toHaveCount(3, { timeout: 10000 });
  });

  test('should persist conversation on page reload', async ({ page }) => {
    // Send a message
    await page.locator('[data-testid="message-input"]').fill('Test persistence');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response
    await page.locator('[data-testid="maia-response"]').last().waitFor({ timeout: 30000 });

    // Reload page
    await page.reload();

    // Verify message persisted
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Test persistence');
  });
});
