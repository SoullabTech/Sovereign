/**
 * PRACTITIONER INTEGRATIONS SERVICE
 * =================================
 * CRUD for practitioner integration configurations
 *
 * Currently supports:
 * - Email: managed (Soullab Resend) | resend (BYO key)
 *
 * Future:
 * - SMS: managed | twilio | telnyx
 * - Calendar: google | outlook
 * - Payments: stripe
 */

import { query } from '@/lib/db/postgres';
import {
  encryptIntegrationConfig,
  decryptIntegrationConfig,
  isIntegrationEncryptionConfigured,
} from '@/lib/security/integrationSecrets';

// ============================================================================
// TYPES
// ============================================================================

export type IntegrationType = 'email' | 'sms' | 'calendar' | 'payments';
export type EmailProvider = 'managed' | 'resend';
export type IntegrationStatus = 'disconnected' | 'connected' | 'error';

export interface ManagedEmailConfig {
  mode: 'managed';
}

export interface ResendEmailConfig {
  mode: 'resend';
  apiKey: string;
  fromEmail: string;   // e.g. hello@loralee.com
  fromName?: string;   // e.g. "Loralee Astrology"
  replyTo?: string;
}

export type EmailIntegrationConfig = ManagedEmailConfig | ResendEmailConfig;

export interface EmailIntegrationResult {
  provider: EmailProvider;
  config: EmailIntegrationConfig | null;
  status?: IntegrationStatus;
  lastError?: string | null;
}

// ============================================================================
// EMAIL INTEGRATION
// ============================================================================

/**
 * Get email integration for a practitioner
 * Returns managed by default if no integration is configured
 */
export async function getEmailIntegration(practitionerId: string): Promise<EmailIntegrationResult> {
  const { rows } = await query<{
    provider: string;
    config_encrypted: string | null;
    status: string;
    last_error: string | null;
  }>(
    `SELECT provider, config_encrypted, status, last_error
     FROM practitioner_integrations
     WHERE practitioner_id = $1 AND integration_type = 'email'
     LIMIT 1`,
    [practitionerId]
  );

  // Default to managed if not configured
  if (!rows[0]) {
    return {
      provider: 'managed',
      config: { mode: 'managed' },
    };
  }

  const provider = rows[0].provider as EmailProvider;

  // Managed mode - no encrypted config
  if (provider === 'managed' || !rows[0].config_encrypted) {
    return {
      provider: 'managed',
      config: { mode: 'managed' },
      status: rows[0].status as IntegrationStatus,
      lastError: rows[0].last_error,
    };
  }

  // Decrypt BYO config
  try {
    const config = decryptIntegrationConfig<EmailIntegrationConfig>(rows[0].config_encrypted);
    return {
      provider,
      config,
      status: rows[0].status as IntegrationStatus,
      lastError: rows[0].last_error,
    };
  } catch (err) {
    console.error('[Integrations] Failed to decrypt email config:', err);
    return {
      provider,
      config: null,
      status: 'error',
      lastError: 'Failed to decrypt configuration',
    };
  }
}

/**
 * Save or update email integration for a practitioner
 */
export async function upsertEmailIntegration(
  practitionerId: string,
  config: EmailIntegrationConfig
): Promise<{ ok: boolean; error?: string }> {
  const provider: EmailProvider = config.mode === 'resend' ? 'resend' : 'managed';

  // For resend mode, we need encryption
  let encrypted: string | null = null;
  if (config.mode === 'resend') {
    if (!isIntegrationEncryptionConfigured()) {
      return { ok: false, error: 'Integration encryption is not configured' };
    }
    encrypted = encryptIntegrationConfig(config);
  }

  await query(
    `INSERT INTO practitioner_integrations
      (practitioner_id, integration_type, provider, config_encrypted, status, updated_at)
     VALUES
      ($1, 'email', $2, $3, 'connected', NOW())
     ON CONFLICT (practitioner_id, integration_type)
     DO UPDATE SET
       provider = EXCLUDED.provider,
       config_encrypted = EXCLUDED.config_encrypted,
       status = 'connected',
       last_error = NULL,
       updated_at = NOW()`,
    [practitionerId, provider, encrypted]
  );

  return { ok: true };
}

/**
 * Disconnect/remove email integration for a practitioner
 * Reverts to managed mode
 */
export async function disconnectEmailIntegration(practitionerId: string): Promise<{ ok: boolean }> {
  await query(
    `DELETE FROM practitioner_integrations
     WHERE practitioner_id = $1 AND integration_type = 'email'`,
    [practitionerId]
  );

  return { ok: true };
}

/**
 * Update integration status (e.g., after send failure)
 */
export async function updateIntegrationStatus(
  practitionerId: string,
  integrationType: IntegrationType,
  status: IntegrationStatus,
  lastError?: string
): Promise<void> {
  await query(
    `UPDATE practitioner_integrations
     SET status = $3,
         last_error = $4,
         last_checked_at = NOW(),
         updated_at = NOW()
     WHERE practitioner_id = $1 AND integration_type = $2`,
    [practitionerId, integrationType, status, lastError || null]
  );
}

/**
 * Get a safe summary of email integration for admin UI
 * Does NOT expose API keys, only shows configured/not + masked key
 */
export async function getEmailIntegrationSummary(practitionerId: string): Promise<{
  provider: EmailProvider;
  status: IntegrationStatus;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  apiKeyMasked?: string;
  lastError?: string | null;
}> {
  const integration = await getEmailIntegration(practitionerId);

  if (integration.provider === 'managed' || !integration.config || integration.config.mode === 'managed') {
    return {
      provider: 'managed',
      status: integration.status || 'connected',
      lastError: integration.lastError,
    };
  }

  const config = integration.config as ResendEmailConfig;
  return {
    provider: 'resend',
    status: integration.status || 'connected',
    fromEmail: config.fromEmail,
    fromName: config.fromName,
    replyTo: config.replyTo,
    apiKeyMasked: config.apiKey ? `re_...${config.apiKey.slice(-6)}` : undefined,
    lastError: integration.lastError,
  };
}
