/**
 * CONNECTOR DB ACCESS LAYER
 *
 * CRUD operations for the service_connectors table.
 * Uses lib/db/postgres.ts — no Supabase.
 */

import { query } from '@/lib/db/postgres';
import type {
  ConnectorProvider,
  ConnectorClass,
  ConnectorCapability,
  ConnectorStatus,
  MemberConnector,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Row → MemberConnector mapper
// ─────────────────────────────────────────────────────────────────────────────

function rowToConnector(row: any): MemberConnector {
  return {
    id: row.id,
    memberId: row.member_id,
    provider: row.provider as ConnectorProvider,
    connectorClass: row.connector_class as ConnectorClass,
    status: row.status as ConnectorStatus,
    displayName: row.display_name ?? null,
    capabilities: (row.capabilities ?? []) as ConnectorCapability[],
    config: row.config ?? {},
    configEncrypted: row.config_encrypted ?? {},
    metadata: row.metadata ?? {},
    lastConnectedAt: row.last_connected_at?.toISOString?.() ?? row.last_connected_at ?? null,
    lastUsedAt: row.last_used_at?.toISOString?.() ?? row.last_used_at ?? null,
    lastError: row.last_error ?? null,
    isEnabled: row.is_enabled ?? true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/** Get all connectors for a member */
export async function getConnectors(memberId: string): Promise<MemberConnector[]> {
  const result = await query(
    `SELECT * FROM service_connectors WHERE member_id = $1 ORDER BY provider`,
    [memberId]
  );
  return result.rows.map(rowToConnector);
}

/** Get a specific connector for a member */
export async function getConnector(
  memberId: string,
  provider: ConnectorProvider
): Promise<MemberConnector | null> {
  const result = await query(
    `SELECT * FROM service_connectors WHERE member_id = $1 AND provider = $2`,
    [memberId, provider]
  );
  return result.rows[0] ? rowToConnector(result.rows[0]) : null;
}

/** Find the first enabled, connected connector with a given capability */
export async function findByCapability(
  memberId: string,
  capability: ConnectorCapability
): Promise<MemberConnector | null> {
  const result = await query(
    `SELECT * FROM service_connectors
     WHERE member_id = $1
       AND is_enabled = true
       AND status = 'connected'
       AND capabilities @> $2::jsonb
     LIMIT 1`,
    [memberId, JSON.stringify([capability])]
  );
  return result.rows[0] ? rowToConnector(result.rows[0]) : null;
}

/** Upsert a connector (create or update) */
export async function upsertConnector(
  memberId: string,
  provider: ConnectorProvider,
  update: {
    connectorClass: ConnectorClass;
    status?: ConnectorStatus;
    displayName?: string | null;
    capabilities?: ConnectorCapability[];
    config?: Record<string, unknown>;
    configEncrypted?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    lastError?: string | null;
    isEnabled?: boolean;
  }
): Promise<MemberConnector> {
  const result = await query(
    `INSERT INTO service_connectors (
        member_id, provider, connector_class, status, display_name,
        capabilities, config, config_encrypted, metadata,
        last_error, is_enabled, last_connected_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        CASE WHEN $4 = 'connected' THEN NOW() ELSE NULL END
     )
     ON CONFLICT (member_id, provider)
     DO UPDATE SET
        connector_class = COALESCE($3, service_connectors.connector_class),
        status = COALESCE($4, service_connectors.status),
        display_name = COALESCE($5, service_connectors.display_name),
        capabilities = COALESCE($6, service_connectors.capabilities),
        config = CASE WHEN $7::jsonb = '{}'::jsonb THEN service_connectors.config ELSE $7 END,
        config_encrypted = CASE WHEN $8::jsonb = '{}'::jsonb THEN service_connectors.config_encrypted ELSE $8 END,
        metadata = CASE WHEN $9::jsonb = '{}'::jsonb THEN service_connectors.metadata ELSE $9 END,
        last_error = $10,
        is_enabled = COALESCE($11, service_connectors.is_enabled),
        last_connected_at = CASE WHEN $4 = 'connected' THEN NOW() ELSE service_connectors.last_connected_at END,
        updated_at = NOW()
     RETURNING *`,
    [
      memberId,
      provider,
      update.connectorClass,
      update.status ?? 'disconnected',
      update.displayName ?? null,
      JSON.stringify(update.capabilities ?? []),
      JSON.stringify(update.config ?? {}),
      JSON.stringify(update.configEncrypted ?? {}),
      JSON.stringify(update.metadata ?? {}),
      update.lastError ?? null,
      update.isEnabled ?? true,
    ]
  );
  return rowToConnector(result.rows[0]);
}

/** Update last_used_at timestamp (fire-and-forget) */
export function touchLastUsed(memberId: string, provider: ConnectorProvider): void {
  query(
    `UPDATE service_connectors SET last_used_at = NOW(), updated_at = NOW()
     WHERE member_id = $1 AND provider = $2`,
    [memberId, provider]
  ).catch((err) => {
    console.error(`[Connectors] Failed to touch last_used for ${provider}:`, err.message);
  });
}

/** Delete a connector */
export async function deleteConnector(
  memberId: string,
  provider: ConnectorProvider
): Promise<boolean> {
  const result = await query(
    `DELETE FROM service_connectors WHERE member_id = $1 AND provider = $2`,
    [memberId, provider]
  );
  return (result.rowCount ?? 0) > 0;
}
