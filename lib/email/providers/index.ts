/**
 * PROVIDER SELECTION — explicit, validated, and never silently downgraded.
 * =======================================================================
 *
 * Configuration:
 *   EMAIL_PROVIDER=resend | memory      (default: resend)
 *
 * Two rules govern this file:
 *
 *   1. An unknown provider name FAILS LOUDLY. Falling back to a default when
 *      an operator asked for something specific means the deploy is not running
 *      what the deploy said it was running.
 *
 *   2. The capture-only provider is REFUSED in production. Never fall from a
 *      real provider to a development transport — that produces mail which
 *      reports success and never leaves, which is the exact class of bug this
 *      subsystem exists to make impossible.
 *
 * SES and Postmark are not registered here. Adding them is an adapter file plus
 * one line below; ACTIVATING one is a separate operational act requiring
 * credentials, domain authentication and DNS, and is not authorised by this
 * change. See §29/§30 of the readiness notes in docs/ops/SOULLAB_MAIL.md.
 */

import type { EmailProvider } from './types';
import { ResendProvider } from './ResendProvider';
import { MemoryProvider } from './MemoryProvider';

export type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';
export { ResendProvider } from './ResendProvider';
export { MemoryProvider } from './MemoryProvider';

export const SUPPORTED_PROVIDERS = ['resend', 'memory'] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Read and validate EMAIL_PROVIDER. Throws on anything we cannot honour. */
export function resolveProviderName(): SupportedProvider {
  const raw = (process.env.EMAIL_PROVIDER ?? 'resend').trim().toLowerCase();

  if (!(SUPPORTED_PROVIDERS as readonly string[]).includes(raw)) {
    throw new Error(
      `[MAIA/email] EMAIL_PROVIDER="${raw}" is not a supported provider. ` +
        `Supported: ${SUPPORTED_PROVIDERS.join(', ')}. ` +
        `Refusing to fall back to a default — an unasked-for provider is a silent deploy divergence.`
    );
  }

  if (raw === 'memory' && isProduction()) {
    throw new Error(
      '[MAIA/email] EMAIL_PROVIDER="memory" is refused in production. ' +
        'The capture transport contacts no vendor: every send would report success and never leave.'
    );
  }

  return raw as SupportedProvider;
}

let cached: EmailProvider | null = null;
let cachedFor: string | null = null;

function construct(name: SupportedProvider): EmailProvider {
  switch (name) {
    case 'resend':
      return new ResendProvider();
    case 'memory':
      return new MemoryProvider();
  }
}

/**
 * The active provider for managed (Soullab-account) sends.
 *
 * Cached per resolved name so tests can flip EMAIL_PROVIDER between cases
 * without a stale instance surviving the change.
 */
export function getEmailProvider(): EmailProvider {
  const name = resolveProviderName();
  if (cached && cachedFor === name) return cached;
  cached = construct(name);
  cachedFor = name;
  return cached;
}

/** Test seam: force a provider instance. Pass null to return to configuration. */
export function __setEmailProviderForTests(provider: EmailProvider | null): void {
  cached = provider;
  cachedFor = provider ? provider.name : null;
}
