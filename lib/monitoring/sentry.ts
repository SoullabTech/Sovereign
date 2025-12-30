// @ts-nocheck
/**
 * Sentry Configuration for MAIA
 * Crash reporting and error monitoring across all platforms
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] No DSN configured, error reporting disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,

    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay (web only)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (ENVIRONMENT === 'development') {
        console.log('[Sentry] Development error:', event);
        return null; // Don't send to Sentry in development
      }

      // Filter out known third-party errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Skip ResizeObserver errors (benign browser quirk)
        if (message.includes('ResizeObserver')) {
          return null;
        }

        // Skip extension errors
        if (message.includes('extension')) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy console logs
      if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
        return null;
      }

      return breadcrumb;
    },

    // Integrations
    integrations: [
      // Automatically capture unhandled promise rejections
      new Sentry.Integrations.InboundFilters({
        allowUrls: [
          /https:\/\/soullab\.life/,
          /http:\/\/localhost/
        ]
      }),

      // Capture user interactions leading to errors
      new Sentry.Integrations.Breadcrumbs({
        console: false, // Too noisy
        dom: true,
        fetch: true,
        history: true,
        sentry: true,
        xhr: true
      })
    ]
  });

  console.log('[Sentry] Initialized for environment:', ENVIRONMENT);
}

/**
 * Capture a custom error
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add custom context
 */
export function addContext(key: string, data: Record<string, any>) {
  Sentry.setContext(key, data);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });
}

/**
 * Wrap async function with error boundary
 */
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, { context, args });
          throw error;
        });
      }
      return result;
    } catch (error) {
      captureError(error as Error, { context, args });
      throw error;
    }
  }) as T;
}
