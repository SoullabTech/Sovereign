/**
 * PRACTITIONER INTEGRATIONS SERVICE
 * =================================
 * Email is managed by Soullab's sovereign SMTP transport.
 */

import { query } from '@/lib/db/postgres';

export type IntegrationType = 'email' | 'sms' | 'calendar' | 'payments';
export type EmailProvider = 'managed';
export type IntegrationStatus = 'disconnected' | 'connected' | 'error';

export interface ManagedEmailConfig {
  mode: 'managed';
}

export type EmailIntegrationConfig = ManagedEmailConfig;

export interface EmailIntegrationResult {
  provider: EmailProvider;
  config: EmailIntegrationConfig;
  status?: IntegrationStatus;
  lastError?: string | null;
}
export async function getEmailIntegration(practitionerId: string): Promise<EmailIntegrationResult> {
  const { rows } = await query<{
    status: string;
    last_error: string | null;
  }>(
    `SELECT status, last_error
       FROM practitioner_integrations
      WHERE practitioner_id = $1 AND integration_type = 'email'
      LIMIT 1`,
    [practitionerId]
  );

  return {
    provider: 'managed',
    config: { mode: 'managed' },
    status: (rows[0]?.status as IntegrationStatus | undefined) ?? 'connected',
    lastError: rows[0]?.last_error ?? null,
  };
}

export async function upsertEmailIntegration(
  practitionerId: string,
  _config: EmailIntegrationConfig = { mode: 'managed' }
): Promise<{ ok: boolean; error?: string }> {
  await query(
    `INSERT INTO practitioner_integrations
       (practitioner_id, integration_type, provider, config_encrypted, status, updated_at)
     VALUES ($1, 'email', 'managed', NULL, 'connected', NOW())
     ON CONFLICT (practitioner_id, integration_type)
     DO UPDATE SET provider = 'managed',
                   config_encrypted = NULL,
                   status = 'connected',
                   last_error = NULL,
                   updated_at = NOW()`,
    [practitionerId]
  );
  return { ok: true };
}
export async function disconnectEmailIntegration(practitionerId: string): Promise<{ ok: boolean }> {
  await query(
    `DELETE FROM practitioner_integrations
      WHERE practitioner_id = $1 AND integration_type = 'email'`,
    [practitionerId]
  );
  return { ok: true };
}

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

export async function getEmailIntegrationSummary(practitionerId: string): Promise<{
  provider: EmailProvider;
  status: IntegrationStatus;
  lastError?: string | null;
}> {
  const integration = await getEmailIntegration(practitionerId);
  return {
    provider: 'managed',
    status: integration.status || 'connected',
    lastError: integration.lastError,
  };
}
