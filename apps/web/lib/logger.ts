// Comprehensive error logging for production debugging
// import { supabase } from './supabaseClient';
const supabase = null; // Temporarily disabled

export interface ErrorLog {
  message: string;
  stack?: string;
  context?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  environment: 'development' | 'production';
  url?: string;
  userAgent?: string;
}

/**
 * Log server-side errors to console and Supabase
 */
export async function logServerError(
  error: unknown,
  context?: string,
  metadata?: Record<string, any>
) {
  const err = error instanceof Error ? error : new Error(String(error));
  const timestamp = new Date().toISOString();
  const environment = process.env.NODE_ENV as 'development' | 'production';

  // Always log to console (visible in Vercel logs)
  console.error('💥 Spiralogic Server Error:', {
    message: err.message,
    stack: err.stack,
    context,
    metadata,
    timestamp,
    environment
  });

  // In production, persist to Supabase
  if (environment === 'production') {
    try {
      const { error: dbError } = await supabase
        .from('error_logs')
        .insert({
          message: err.message,
          stack: err.stack,
          context,
          metadata,
          timestamp,
          environment,
          url: metadata?.url,
          user_agent: metadata?.userAgent
        });

      if (dbError) {
        console.warn('⚠️ Failed to persist error to Supabase:', dbError);
      }
    } catch (persistErr) {
      console.warn('⚠️ Error logging to Supabase failed:', persistErr);
    }
  }

  // Return structured error for API responses
  return {
    error: 'Internal Server Error',
    message: environment === 'development' ? err.message : 'An error occurred',
    context: environment === 'development' ? context : undefined,
    timestamp
  };
}

/**
 * Log client-side errors from the browser
 */
export async function logClientError(
  error: unknown,
  context?: string,
  metadata?: Record<string, any>
) {
  const err = error instanceof Error ? error : new Error(String(error));

  // Send to API endpoint for logging
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: err.message,
        stack: err.stack,
        context,
        metadata,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    });
  } catch (logErr) {
    console.error('Failed to log client error:', logErr);
  }
}

/**
 * Wrap async API handlers with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      await logServerError(error, context, {
        args: JSON.stringify(args.slice(0, 2)) // Log first 2 args (usually req, res)
      });
      throw error;
    }
  }) as T;
}

/**
 * Get recent error logs from Supabase
 */
export async function getRecentErrors(limit = 50) {
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch error logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Clear old error logs (retention policy)
 */
export async function clearOldErrors(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const { error } = await supabase
    .from('error_logs')
    .delete()
    .lt('timestamp', cutoffDate.toISOString());

  if (error) {
    console.error('Failed to clear old error logs:', error);
  }
}