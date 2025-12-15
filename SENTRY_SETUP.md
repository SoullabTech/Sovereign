# Sentry Crash Reporting Setup Guide

This guide explains how to set up Sentry for crash reporting and error monitoring across all MAIA platforms (Web, iOS, Android, PWA).

## Prerequisites

1. Create a Sentry account at https://sentry.io
2. Create a new project for MAIA (select Next.js as the platform)
3. Get your DSN from Project Settings → Client Keys (DSN)

## Installation

### 1. Install Sentry SDK

```bash
npm install @sentry/nextjs @sentry/capacitor --save
```

### 2. Configure Environment Variables

Add to `.env.local` (development):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

Add to `.env.production` (production):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@your-org.ingest.sentry.io/your-project-id
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### 3. Add to GitHub Secrets

For CI/CD deployments, add these secrets:
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

## Configuration Files

All Sentry configuration files are already created:

| File | Purpose |
|------|---------|
| `lib/monitoring/sentry.ts` | Core Sentry configuration |
| `sentry.client.config.ts` | Client-side initialization |
| `sentry.server.config.ts` | Server-side initialization |
| `sentry.edge.config.ts` | Edge runtime initialization |

## Usage

### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- Console errors
- API errors (fetch/XHR)
- User interactions (breadcrumbs)

### Manual Error Capture

```typescript
import { captureError, captureMessage } from '@/lib/monitoring/sentry';

// Capture an error
try {
  // risky code
} catch (error) {
  captureError(error as Error, {
    context: 'oracle-conversation',
    userId: user.id
  });
}

// Capture a message
captureMessage('User completed onboarding', 'info');
```

### User Context

```typescript
import { setUser, clearUser } from '@/lib/monitoring/sentry';

// On login
setUser({
  id: user.id,
  email: user.email,
  username: user.name
});

// On logout
clearUser();
```

### Custom Context

```typescript
import { addContext, addBreadcrumb } from '@/lib/monitoring/sentry';

// Add custom context
addContext('consciousness', {
  level: 5,
  phase: 'NIGREDO',
  element: 'WATER'
});

// Add breadcrumb
addBreadcrumb(
  'Oracle conversation started',
  'user-action',
  'info',
  { sessionId: session.id }
);
```

### Error Boundary HOC

```typescript
import { withErrorBoundary } from '@/lib/monitoring/sentry';

const riskyFunction = withErrorBoundary(
  async (data) => {
    // Your code
  },
  'oracle-processing'
);
```

## Mobile Configuration (Capacitor)

### iOS Setup

1. Add Sentry to your iOS app in `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ... existing config
  plugins: {
    SentryCapacitor: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      enableNative: true,
      enableNativeCrashHandling: true
    }
  }
};

export default config;
```

2. Sync Capacitor:
```bash
npx cap sync ios
```

### Android Setup

Same configuration as iOS, then sync:
```bash
npx cap sync android
```

## Testing

### Test Error Capture

```typescript
// In browser console or React component
import { captureMessage, captureError } from '@/lib/monitoring/sentry';

// Test message
captureMessage('Test message from MAIA', 'info');

// Test error
try {
  throw new Error('Test error from MAIA');
} catch (error) {
  captureError(error as Error, { test: true });
}
```

### Verify in Sentry Dashboard

1. Go to https://sentry.io/your-org/your-project/issues/
2. You should see the test error appear within seconds
3. Click to view full stack trace, breadcrumbs, and context

## Error Filtering

The configuration automatically filters:
- Development environment errors (console only, not sent)
- ResizeObserver errors (benign browser quirk)
- Browser extension errors
- Third-party script errors

To customize filtering, edit `lib/monitoring/sentry.ts`:

```typescript
beforeSend(event, hint) {
  // Add custom filtering logic
  if (shouldIgnoreError(event)) {
    return null;
  }
  return event;
}
```

## Performance Monitoring

Sentry automatically tracks:
- Page load performance
- API request latency
- Component render time
- Navigation speed

Sample rates (configurable in `lib/monitoring/sentry.ts`):
- Production: 10% of transactions
- Development: 100% of transactions

## Source Maps

Source maps are automatically uploaded to Sentry during build (configured in CI/CD).

To manually upload source maps:

```bash
npx @sentry/wizard --integration nextjs
```

## Alerts

Configure alerts in Sentry Dashboard:
1. Project Settings → Alerts
2. Create alert rules (e.g., "Error rate exceeds 10/minute")
3. Add notification channels (email, Slack, PagerDuty)

## Privacy

Sentry configuration respects user privacy:
- No PII is sent by default
- User identifiers are hashed
- Sensitive data is scrubbed from events
- Session replay is opt-in (via beforeSend)

To enable session replay:

```typescript
// In lib/monitoring/sentry.ts
replaysSessionSampleRate: 0.1, // 10% of sessions
replaysOnErrorSampleRate: 1.0, // 100% of error sessions
```

## Troubleshooting

### "Sentry not capturing errors"

1. Check DSN is set: `console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)`
2. Check initialization: Look for "[Sentry] Initialized" in console
3. Check environment: Sentry is disabled in development by default
4. Check error filtering: Review `beforeSend` logic

### "Source maps not working"

1. Verify `SENTRY_AUTH_TOKEN` is set in environment
2. Check `.sentryclirc` configuration
3. Ensure build includes `sentry-cli`
4. Check Sentry project settings for uploaded source maps

### "Too many events"

1. Reduce sample rates in `lib/monitoring/sentry.ts`
2. Add more aggressive filtering in `beforeSend`
3. Upgrade Sentry plan or request quota increase

## Best Practices

✅ **DO:**
- Use meaningful error messages
- Add context to errors
- Set user context on login
- Clear user context on logout
- Test in production-like environments
- Review Sentry dashboard weekly

❌ **DON'T:**
- Send PII or sensitive data
- Ignore breadcrumbs (they help debug)
- Set sample rate to 100% in production
- Capture expected errors (use try/catch instead)
- Send duplicate errors for the same issue

## Next Steps

1. ✅ Set up Sentry account and get DSN
2. ✅ Add DSN to environment variables
3. ✅ Test error capture in development
4. ✅ Deploy to staging and verify
5. ✅ Set up alerts for critical errors
6. ✅ Add Sentry to CI/CD pipeline
7. ✅ Train team on error monitoring

---

**Last Updated:** December 14, 2025
**Configuration:** `lib/monitoring/sentry.ts`
**Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
