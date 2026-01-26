/**
 * QR Login Service
 *
 * Handles QR code-based cross-device authentication:
 * 1. Desktop shows QR code with unique request ID
 * 2. Mobile (already logged in) scans QR
 * 3. Mobile approves login via Face ID/Touch ID
 * 4. Desktop receives session token
 */

import { randomBytes } from 'crypto';

/**
 * QR login request time-to-live in seconds
 * 90 seconds is a good balance between usability and security
 */
export const QR_LOGIN_TTL_SECONDS = 90;

/**
 * How often to poll for status (milliseconds)
 */
export const QR_STATUS_POLL_INTERVAL_MS = 2000;

/**
 * Generate a URL-friendly request ID
 * 12 hex characters = 48 bits of entropy (sufficient for short-lived tokens)
 */
export function generateRequestId(): string {
  return randomBytes(6).toString('hex');
}

/**
 * Build the QR code payload URL
 * This is what gets encoded in the QR code
 */
export function buildQrPayload(requestId: string, baseUrl: string = 'https://soullab.life'): string {
  return `${baseUrl}/qr-login/${requestId}`;
}

/**
 * Parse a QR login URL to extract the request ID
 */
export function parseQrPayload(url: string): string | null {
  const match = url.match(/\/qr-login\/([a-f0-9]{12})$/i);
  return match ? match[1] : null;
}

/**
 * QR login request status
 */
export type QrLoginStatus = 'pending' | 'approved' | 'consumed' | 'expired';

/**
 * QR login request data structure
 */
export interface QrLoginRequest {
  id: string;
  requestId: string;
  status: QrLoginStatus;
  approvingMemberId?: string;
  approvingDeviceId?: string;
  sessionToken?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  approvedAt?: Date;
  consumedAt?: Date;
  expiresAt: Date;
}

/**
 * Calculate expiry time for a new QR login request
 */
export function calculateExpiryTime(): Date {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + QR_LOGIN_TTL_SECONDS);
  return expiresAt;
}

/**
 * Check if a QR login request has expired
 */
export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(expiresAt: Date): string {
  const now = new Date();
  const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  if (remaining === 0) return 'Expired';
  if (remaining === 1) return '1 second';
  if (remaining < 60) return `${remaining} seconds`;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (minutes === 1 && seconds === 0) return '1 minute';
  if (seconds === 0) return `${minutes} minutes`;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
