/**
 * System Settings Helper
 *
 * Reads from system_settings table for admin-controlled flags.
 */

import { query } from '@/lib/db/postgres';

export async function getSystemSetting<T = any>(
  key: string
): Promise<T | null> {
  try {
    const r = await query(`SELECT value FROM system_settings WHERE key = $1`, [
      key,
    ]);
    return (r.rows[0]?.value as T) ?? null;
  } catch {
    return null;
  }
}

export async function isMaintenanceEnabled(): Promise<{
  enabled: boolean;
  message: string;
}> {
  const v = await getSystemSetting<any>('maintenance_mode');
  const enabled = Boolean(v?.enabled);
  const message =
    typeof v?.message === 'string' && v.message.trim().length > 0
      ? v.message.trim()
      : 'MAIA is taking a brief pause. Back soon.';
  return { enabled, message };
}

export async function getGlobalBanner(): Promise<{
  enabled: boolean;
  text: string;
  level: 'info' | 'warn';
  dismissible: boolean;
} | null> {
  const v = await getSystemSetting<any>('global_banner');
  if (!v?.enabled) return null;
  return {
    enabled: true,
    text: v.text || '',
    level: v.level || 'info',
    dismissible: v.dismissible !== false,
  };
}

export async function isFeatureEnabled(feature: string): Promise<boolean> {
  const v = await getSystemSetting<boolean>(feature);
  // Default to true if not set (fail-open for features)
  return v !== false;
}
