/**
 * Class A Member Access recovery: isolated from legacy plaintext-token flows.
 * Secrets are generated server-side, SHA-256 only is stored in PostgreSQL.
 * Link fragments are not sent in HTTP GET request URLs or ordinary access logs.
 */
import { createHash, randomBytes } from 'node:crypto';

export const ADMIN_RECOVERY_MAX_PASSWORD_BYTES = 72;
export const ADMIN_RECOVERY_MIN_PASSWORD_CODEPOINTS = 12;
export const ADMIN_RECOVERY_EMAIL_LIFETIME_MINUTES = 30;

// Initial beta supports only email. Private handoff requires a separate
// Class A review, migration and explicit founder authorization.
export type RecoveryMode = 'email';
export type RecoveryReason = 'member_requested';

export function validRecoveryPassword(password: unknown): password is string {
  return typeof password === 'string'
    && Array.from(password).length >= ADMIN_RECOVERY_MIN_PASSWORD_CODEPOINTS
    && Buffer.byteLength(password, 'utf8') <= ADMIN_RECOVERY_MAX_PASSWORD_BYTES
    && !password.includes('\0');
}

export function secureRecoveryOrigin(origin: string | null): boolean {
  if (!origin || origin === 'null') return false;
  const accepted = ['https://soullab.life', 'https://www.soullab.life'];
  if (process.env.NODE_ENV !== 'production') accepted.push('http://localhost:3000');
  return accepted.includes(origin);
}

export function generateRecoveryToken(): string {
  return randomBytes(32).toString('hex');
}

export function digestRecoveryToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function recoveryTokenShape(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
}

export function buildRecoveryLink(token: string): string {
  if (!recoveryTokenShape(token)) throw new Error('Invalid generated recovery token');
  return `https://soullab.life/member-recovery#token=${token}`;
}
