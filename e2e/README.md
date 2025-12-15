# MAIA E2E Test Suite

End-to-end testing for MAIA across web, mobile, and PWA platforms.

## Setup

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Configure Environment

Create `.env.test`:
```bash
BASE_URL=http://localhost:3000
CI=false
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Test File
```bash
npx playwright test oracle-conversation.spec.ts
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
npx playwright test --project="iPad Pro"
```

### Debug Mode
```bash
npx playwright test --debug
```

### Headed Mode (see browser)
```bash
npx playwright test --headed
```

## Test Structure

```
e2e/
├── playwright.config.ts      # Playwright configuration
├── tests/
│   ├── oracle-conversation.spec.ts  # Oracle chat flow
│   ├── onboarding.spec.ts           # User onboarding
│   └── offline-functionality.spec.ts # PWA offline mode
└── README.md                  # This file
```

## Test Coverage

### Oracle Conversation
- ✅ Display conversation interface
- ✅ Send message and receive response
- ✅ Display Opus Axiom status
- ✅ Handle rapid messages
- ✅ Persist conversation on reload

### Onboarding
- ✅ Display welcome screen
- ✅ Complete onboarding flow
- ✅ Redirect to main app

### Offline Functionality
- ✅ Display offline indicator
- ✅ Queue messages when offline
- ✅ Sync queued messages when online
- ✅ Cache pages for offline viewing

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="element-id"]');

    // Act
    await element.click();

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes**
   ```tsx
   <button data-testid="send-button">Send</button>
   ```

2. **Wait for elements properly**
   ```typescript
   await page.locator('[data-testid="element"]').waitFor({ timeout: 5000 });
   ```

3. **Handle async operations**
   ```typescript
   await expect(page.locator('[data-testid="result"]')).toBeVisible({ timeout: 30000 });
   ```

4. **Clean state between tests**
   ```typescript
   test.beforeEach(async ({ page, context }) => {
     await context.clearCookies();
     await page.goto('/');
   });
   ```

## Test Data Attributes

Add these to your components for reliable test selectors:

```tsx
// Good
<div data-testid="oracle-conversation">
  <input data-testid="message-input" />
  <button data-testid="send-button">Send</button>
  <div data-testid="user-message">{message}</div>
  <div data-testid="maia-response">{response}</div>
  <div data-testid="opus-status" data-status="gold">✅</div>
</div>

// Avoid
<div className="conversation">
  <input className="input" />
  <button>Send</button>
</div>
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
- name: Upload Test Results
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### 1. View Test Report
```bash
npx playwright show-report
```

### 2. View Screenshots
Failed test screenshots are saved in `test-results/`

### 3. View Videos
Failed test videos are in `test-results/` (if enabled)

### 4. Debug Mode
```bash
npx playwright test --debug oracle-conversation.spec.ts
```

## Mobile-Specific Testing

### Test on Mobile Devices
```bash
# iPhone 13
npx playwright test --project="Mobile Safari"

# Pixel 5
npx playwright test --project="Mobile Chrome"

# iPad Pro
npx playwright test --project="iPad Pro"
```

### Test Responsive Behavior
```typescript
test('should adapt to mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/oracle');

  // Test mobile-specific UI
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});
```

## Performance Testing

```typescript
test('should load oracle page within 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/oracle');
  await page.locator('[data-testid="oracle-conversation"]').waitFor();
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000);
});
```

## Accessibility Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/oracle');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Test Metrics

Track these metrics:
- **Test Coverage**: % of user flows tested
- **Pass Rate**: % of tests passing
- **Test Duration**: Time to run full suite
- **Flakiness**: % of intermittent failures

## Troubleshooting

### Tests timing out
- Increase timeout in playwright.config.ts
- Check for slow API responses
- Verify test selectors are correct

### Tests flaky on CI
- Use explicit waits instead of timeouts
- Disable animations in test mode
- Retry failed tests (configured in playwright.config.ts)

### Elements not found
- Use data-testid instead of CSS selectors
- Wait for elements before interacting
- Check for dynamic loading

---

**Last Updated:** December 14, 2025
**Framework:** Playwright
**Coverage:** Oracle, Onboarding, Offline
