/**
 * PROVIDER SELECTION — explicit, validated, and never silently downgraded.
 *
 * AUTH-RETURN-01 uses SMTP only for managed identity mail. `memory` is a
 * capture-only fictional/test provider and is refused in production. Resend is
 * intentionally not registered here, so an SMTP failure cannot fall through to
 * a vendor API.
 */

import type { EmailProvider } from './types';
import { MemoryProvider } from './MemoryProvider';
import { SmtpProvider } from './SmtpProvider';

export type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';
export { MemoryProvider } from './MemoryProvider';
export { SmtpProvider } from './SmtpProvider';

export const SUPPORTED_PROVIDERS = ['smtp', 'memory'] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function resolveProviderName(): SupportedProvider {
  const raw = (process.env.EMAIL_PROVIDER ?? 'smtp').trim().toLowerCase();
  if (!(SUPPORTED_PROVIDERS as readonly string[]).includes(raw)) {
    throw new Error(
      `[MAIA/email] EMAIL_PROVIDER="${raw}" is not supported. ` +
      `Supported: ${SUPPORTED_PROVIDERS.join(', ')}. Refusing silent fallback.`,
    );
  }
  if (raw === 'memory' && isProduction()) {
    throw new Error(
      '[MAIA/email] EMAIL_PROVIDER="memory" is refused in production. ' +
      'The capture transport contacts no server.',
    );
  }
  return raw as SupportedProvider;
}

let cached: EmailProvider | null = null;
let cachedFor: string | null = null;

function construct(name: SupportedProvider): EmailProvider {
  switch (name) {
    case 'smtp':
      return new SmtpProvider();
    case 'memory':
      return new MemoryProvider();
  }
}

export function getEmailProvider(): EmailProvider {
  const name = resolveProviderName();
  if (cached && cachedFor === name) return cached;
  cached = construct(name);
  cachedFor = name;
  return cached;
}

export function __setEmailProviderForTests(provider: EmailProvider | null): void {
  cached = provider;
  cachedFor = provider ? provider.name : null;
}
