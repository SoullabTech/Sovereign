/**
 * CONNECTOR TYPE SYSTEM
 *
 * Capability-based connector architecture for MAIA.
 * Connectors are resolved by capability ('send_email', 'export_markdown'),
 * not by provider name.
 *
 * Three connector classes:
 * - oauth: Delegated cloud connectors (Google, Apple)
 * - credential: Configured secure transport (Proton Bridge, CalDAV)
 * - local: Sovereign data connectors (Obsidian vault, filesystem)
 * - webhook: User-controlled endpoints
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectorClass = 'oauth' | 'credential' | 'local' | 'webhook';

export type ConnectorStatus = 'connected' | 'disconnected' | 'configuring' | 'error';

/** Capability-based routing — MAIA resolves by capability, not provider */
export type ConnectorCapability =
  | 'send_email'
  | 'read_email'
  | 'create_calendar_event'
  | 'read_calendar'
  | 'read_contacts'
  | 'export_markdown'
  | 'export_transcript'
  | 'send_webhook';

/** Exhaustive list of known providers */
export type ConnectorProvider =
  | 'google'
  | 'apple'
  | 'proton_bridge'
  | 'obsidian'
  | 'smtp_custom'
  | 'caldav'
  | 'carddav'
  | 'webhook';

// ─────────────────────────────────────────────────────────────────────────────
// Definitions (static registry entries)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'path' | 'password' | 'select' | 'toggle';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  defaultValue?: string | boolean;
  options?: { value: string; label: string }[];
}

export interface ConnectorDefinition {
  id: ConnectorProvider;
  name: string;
  class: ConnectorClass;
  description: string;
  capabilities: ConnectorCapability[];
  icon: string;                         // Lucide icon name
  configFields?: ConfigField[];
  statusEndpoint: string;               // GET — check connection status
  connectEndpoint?: string;             // POST — initiate connection or save config
  disconnectEndpoint?: string;          // POST — disconnect/remove
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-member connector instance (matches service_connectors DB row)
// ─────────────────────────────────────────────────────────────────────────────

export interface MemberConnector {
  id: string;
  memberId: string;
  provider: ConnectorProvider;
  connectorClass: ConnectorClass;
  status: ConnectorStatus;
  displayName: string | null;
  capabilities: ConnectorCapability[];
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  lastConnectedAt: string | null;
  lastUsedAt: string | null;
  lastError: string | null;
  isEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Capability resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the first enabled, connected connector that supports a given capability.
 */
export function findConnectorForCapability(
  connectors: MemberConnector[],
  capability: ConnectorCapability
): MemberConnector | null {
  return connectors.find(
    (c) => c.isEnabled && c.status === 'connected' && c.capabilities.includes(capability)
  ) ?? null;
}

/**
 * Find all connectors that support a given capability (regardless of status).
 */
export function findAllForCapability(
  connectors: MemberConnector[],
  capability: ConnectorCapability
): MemberConnector[] {
  return connectors.filter((c) => c.capabilities.includes(capability));
}
