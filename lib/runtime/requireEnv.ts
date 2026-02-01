/**
 * Runtime environment variable helper
 * Use INSIDE handlers only (not at module scope) to avoid build-time errors
 */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Optional env var with default
 */
export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Check if we're in production
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}
