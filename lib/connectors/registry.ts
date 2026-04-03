/**
 * CONNECTOR REGISTRY
 *
 * Static definitions of all known connector providers.
 * Add new providers here — they auto-appear in the Connections UI.
 */

import type {
  ConnectorDefinition,
  ConnectorProvider,
  ConnectorCapability,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Provider definitions
// ─────────────────────────────────────────────────────────────────────────────

export const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  // ── OAuth Providers ──────────────────────────────────────────────────────
  {
    id: 'google',
    name: 'Google',
    class: 'oauth',
    description: 'Send emails and manage calendar events through your Google account.',
    capabilities: ['send_email', 'create_calendar_event', 'read_calendar', 'read_contacts'],
    icon: 'Mail',
    statusEndpoint: '/api/auth/google/status',
    connectEndpoint: '/api/auth/google/connect',
    disconnectEndpoint: '/api/auth/google/disconnect',
  },

  // ── Local / Sovereign Connectors ─────────────────────────────────────────
  {
    id: 'obsidian',
    name: 'Obsidian Vault',
    class: 'local',
    description: 'Export session reflections, journal entries, and notes as markdown to your Obsidian vault.',
    capabilities: ['export_markdown', 'export_transcript'],
    icon: 'BookOpen',
    configFields: [
      {
        key: 'vaultPath',
        label: 'Vault Path',
        type: 'path',
        placeholder: '/Users/you/ObsidianVault',
        required: true,
        helpText: 'Absolute path to your Obsidian vault folder.',
      },
      {
        key: 'exportFolder',
        label: 'Export Folder',
        type: 'text',
        placeholder: 'MAIA',
        defaultValue: 'MAIA',
        helpText: 'Subfolder within the vault for MAIA exports.',
      },
      {
        key: 'autoExport',
        label: 'Auto-export after sessions',
        type: 'toggle',
        defaultValue: false,
        helpText: 'Automatically write a session summary to your vault after each conversation.',
      },
    ],
    statusEndpoint: '/api/connectors/obsidian/status',
    connectEndpoint: '/api/connectors/obsidian/configure',
    disconnectEndpoint: '/api/connectors/obsidian/configure',
  },

  // ── Credential-based Connectors ───────────────────────────────────────────
  {
    id: 'caldav',
    name: 'CalDAV Calendar',
    class: 'credential',
    description: 'Connect to Proton Calendar, Nextcloud, Fastmail, iCloud, or any CalDAV server.',
    capabilities: ['create_calendar_event', 'read_calendar'],
    icon: 'Calendar',
    configFields: [
      {
        key: 'provider',
        label: 'Calendar Service',
        type: 'select',
        required: true,
        options: [
          { value: 'proton', label: 'Proton Calendar' },
          { value: 'nextcloud', label: 'Nextcloud' },
          { value: 'fastmail', label: 'Fastmail' },
          { value: 'icloud', label: 'iCloud' },
          { value: 'other', label: 'Other CalDAV Server' },
        ],
      },
      {
        key: 'serverUrl',
        label: 'Server URL',
        type: 'text',
        required: true,
        helpText: 'CalDAV server URL. Auto-filled for known providers.',
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        helpText: 'Your email or account username.',
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        helpText: 'App-specific password recommended.',
      },
    ],
    statusEndpoint: '/api/connectors/caldav/status',
    connectEndpoint: '/api/connectors/caldav/configure',
    disconnectEndpoint: '/api/connectors/caldav/configure',
  },

  // ── Sovereign Expression ──────────────────────────────────────────────────
  {
    id: 'nostr',
    name: 'Nostr',
    class: 'credential',
    description: 'Publish reflections and field notes to your own Nostr relay. Decentralized, sovereign identity.',
    capabilities: ['publish_note'],
    icon: 'Radio',
    statusEndpoint: '/api/nostr/identity',
    connectEndpoint: '/api/nostr/register',
  },

  // ── Future: more credential-based ────────────────────────────────────────
  // proton_bridge, smtp_custom, carddav — add here when ready
];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getDefinition(provider: ConnectorProvider): ConnectorDefinition | undefined {
  return CONNECTOR_DEFINITIONS.find((d) => d.id === provider);
}

export function getProvidersForCapability(capability: ConnectorCapability): ConnectorDefinition[] {
  return CONNECTOR_DEFINITIONS.filter((d) => d.capabilities.includes(capability));
}

/** Group definitions by class for the settings UI */
export function getDefinitionsByClass(): Record<string, ConnectorDefinition[]> {
  const groups: Record<string, ConnectorDefinition[]> = {};
  for (const def of CONNECTOR_DEFINITIONS) {
    if (!groups[def.class]) groups[def.class] = [];
    groups[def.class].push(def);
  }
  return groups;
}
