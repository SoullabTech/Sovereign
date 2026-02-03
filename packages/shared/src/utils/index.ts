/**
 * Shared Utilities for MAIA Platform
 *
 * NOTE: Password hashing is NOT in this file.
 * Use @/lib/auth/passwordUtils for all password operations (bcrypt).
 */

import { randomBytes } from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// ID Generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a random request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

/**
 * Generate a random API key
 */
export function generateApiKey(): string {
  return `sk_${randomBytes(24).toString('hex')}`;
}

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Slug Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert a string to a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Date Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format a date as ISO string
 */
export function toISOString(date: Date | string | number): string {
  return new Date(date).toISOString();
}

/**
 * Get current timestamp as ISO string
 */
export function now(): string {
  return new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Validation Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate passkey format (SOULLAB-NAME or special keys)
 */
export function isValidPasskey(passkey: string): boolean {
  // Allow SOULLAB-NAME format or special keys
  return /^SOULLAB-[A-Z]+$/.test(passkey) || passkey.startsWith('BETA-') || passkey.startsWith('GIFT-');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Environment Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Get required environment variable or throw
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}
