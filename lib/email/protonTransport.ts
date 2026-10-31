/**
 * AUTH-RETURN-01 — managed SMTP configuration.
 *
 * Production credentials must come from an owner-only file. The transport does
 * not know or use a Resend API key, and there is no fallback provider. Explicit
 * constructor configuration remains available for the network-isolated fake
 * Proton witness.
 */

import { closeSync, constants, fstatSync, openSync, readFileSync } from 'node:fs';
import { MANAGED_AUTH_MAILBOX } from './senderCapacity';

export interface ManagedSmtpConfig {
  host: string;
  user: string;
  password: string;
  port: number;
  secure: boolean;
  managedMailbox: string;
}

function readOwnerOnlySecret(path: string): string {
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.size > 16_384) throw new Error('SMTP_PASSWORD_FILE is not a bounded regular file');
    if ((stat.mode & 0o077) !== 0) {
      throw new Error('SMTP_PASSWORD_FILE must not be readable by group or other users');
    }
    if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) {
      throw new Error('SMTP_PASSWORD_FILE must be owned by the running user');
    }
    const value = readFileSync(descriptor, 'utf8').trim();
    if (!value) throw new Error('SMTP_PASSWORD_FILE is empty');
    return value;
  } finally {
    closeSync(descriptor);
  }
}

export function resolveManagedSmtpConfig(): ManagedSmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim().toLowerCase();
  const passwordFile = process.env.SMTP_PASSWORD_FILE?.trim();
  const passwordEnv = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
  if (!host && !user && !passwordFile && !passwordEnv) return null;

  if (!host || !user) {
    throw new Error('SMTP_HOST and SMTP_USER are both required');
  }
  if (user !== MANAGED_AUTH_MAILBOX) {
    throw new Error(`Managed SMTP identity must be ${MANAGED_AUTH_MAILBOX}`);
  }
  if (passwordFile && passwordEnv) {
    throw new Error('Configure exactly one of SMTP_PASSWORD_FILE or SMTP_PASSWORD');
  }
  if (process.env.NODE_ENV === 'production' && !passwordFile) {
    throw new Error('Production SMTP credentials require SMTP_PASSWORD_FILE');
  }
  if (process.env.NODE_ENV === 'production' && host.toLowerCase() !== 'smtp.protonmail.ch') {
    throw new Error('Production managed SMTP must use the approved Proton submission host');
  }

  const password = passwordFile ? readOwnerOnlySecret(passwordFile) : passwordEnv?.trim();
  if (!password) throw new Error('SMTP credential is required');

  const parsedPort = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('SMTP_PORT is invalid');
  }
  const secure =
    process.env.SMTP_SECURE === 'true'
      ? true
      : process.env.SMTP_SECURE === 'false'
        ? false
        : parsedPort === 465;

  return {
    host,
    user,
    password,
    port: parsedPort,
    secure,
    managedMailbox: MANAGED_AUTH_MAILBOX,
  };
}
