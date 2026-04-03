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

  // ── Future: Credential-based ─────────────────────────────────────────────
  // proton_bridge, smtp_custom, caldav, carddav — add here when ready
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
