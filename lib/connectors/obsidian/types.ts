/**
 * OBSIDIAN CONNECTOR TYPES
 *
 * Configuration and export types for the Obsidian vault connector.
 * v1 is write-only: MAIA → vault. No ingestion, no file watching, no two-way sync.
 */

/** What can be exported to the vault */
export type ExportType =
  | 'session_summary'
  | 'journal_entry'
  | 'reflection'
  | 'practitioner_note'
  | 'key_themes'
  | 'transcript';

/** Per-member Obsidian configuration (stored in service_connectors.config) */
export interface ObsidianConfig {
  vaultPath: string;
  exportFolder: string;         // subfolder within vault, default 'MAIA'
  autoExport: boolean;          // default false
  exportTypes: ExportType[];
  includeFrontmatter: boolean;  // default true
  includeTranscript: boolean;   // default false
}

export const DEFAULT_OBSIDIAN_CONFIG: Omit<ObsidianConfig, 'vaultPath'> = {
  exportFolder: 'MAIA',
  autoExport: false,
  exportTypes: ['session_summary', 'key_themes'],
  includeFrontmatter: true,
  includeTranscript: false,
};

/** Content payload for an export request */
export interface ObsidianExportPayload {
  type: ExportType;
  title: string;
  summary?: string;
  keyThemes?: string[];
  actionPoints?: string[];
  symbolicMotifs?: string[];
  transcript?: string;
  body?: string;              // free-form markdown body
  memberName?: string;
  tags?: string[];
}
