/**
 * OBSIDIAN EXPORT
 *
 * Writes markdown files with frontmatter to a member's Obsidian vault.
 * v1: write-only, server-side only. No vault ingestion or two-way sync.
 */

import fs from 'fs/promises';
import path from 'path';
import type { ObsidianConfig, ObsidianExportPayload } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Frontmatter builder
// ─────────────────────────────────────────────────────────────────────────────

function buildFrontmatter(payload: ObsidianExportPayload, config: ObsidianConfig): string {
  if (!config.includeFrontmatter) return '';

  const date = new Date().toISOString().split('T')[0];
  const tags = ['maia', ...(payload.tags ?? [])];

  // Map export type to a clean Obsidian type tag
  const typeMap: Record<string, string> = {
    session_summary: 'maia-session',
    journal_entry: 'maia-journal',
    reflection: 'maia-reflection',
    practitioner_note: 'maia-practitioner',
    key_themes: 'maia-themes',
    transcript: 'maia-transcript',
  };

  const lines = [
    '---',
    `title: "${payload.title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `type: ${typeMap[payload.type] ?? 'maia-note'}`,
  ];

  if (payload.memberName) {
    lines.push(`member: ${payload.memberName}`);
  }

  lines.push(`tags: [${tags.join(', ')}]`);
  lines.push('source: soullab');
  lines.push('---');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Body builder
// ─────────────────────────────────────────────────────────────────────────────

function buildBody(payload: ObsidianExportPayload, config: ObsidianConfig): string {
  const sections: string[] = [];

  if (payload.summary) {
    sections.push(`## Summary\n\n${payload.summary}`);
  }

  if (payload.keyThemes?.length) {
    sections.push(`## Key Themes\n\n${payload.keyThemes.map((t) => `- ${t}`).join('\n')}`);
  }

  if (payload.actionPoints?.length) {
    sections.push(`## Action Points\n\n${payload.actionPoints.map((a) => `- [ ] ${a}`).join('\n')}`);
  }

  if (payload.symbolicMotifs?.length) {
    sections.push(`## Symbolic Motifs\n\n${payload.symbolicMotifs.map((m) => `- ${m}`).join('\n')}`);
  }

  if (payload.body) {
    sections.push(payload.body);
  }

  if (config.includeTranscript && payload.transcript) {
    sections.push(`## Transcript\n\n${payload.transcript}`);
  }

  return sections.join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Filename builder
// ─────────────────────────────────────────────────────────────────────────────

function buildFilename(payload: ObsidianExportPayload): string {
  const date = new Date().toISOString().split('T')[0];
  const slug = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return `${date}-${payload.type.replace(/_/g, '-')}-${slug}.md`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate that a vault path exists and the export folder is writable.
 * Creates the export folder if it doesn't exist.
 */
export async function validateVaultPath(
  vaultPath: string,
  exportFolder: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check vault root exists
    const vaultStat = await fs.stat(vaultPath);
    if (!vaultStat.isDirectory()) {
      return { valid: false, error: 'Vault path is not a directory.' };
    }

    // Create export folder if needed
    const exportPath = path.join(vaultPath, exportFolder);
    await fs.mkdir(exportPath, { recursive: true });

    // Test write access
    const testFile = path.join(exportPath, '.maia-write-test');
    await fs.writeFile(testFile, 'write-test');
    await fs.unlink(testFile);

    return { valid: true };
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return { valid: false, error: 'Vault path does not exist.' };
    }
    if (err.code === 'EACCES') {
      return { valid: false, error: 'No write permission to vault path.' };
    }
    return { valid: false, error: err.message ?? 'Unknown error validating vault path.' };
  }
}

/**
 * Export content as a markdown file to the member's Obsidian vault.
 * Returns the full path to the written file.
 */
export async function exportToObsidian(
  config: ObsidianConfig,
  payload: ObsidianExportPayload
): Promise<{ filePath: string; fileName: string }> {
  const exportPath = path.join(config.vaultPath, config.exportFolder);

  // Ensure export folder exists
  await fs.mkdir(exportPath, { recursive: true });

  const fileName = buildFilename(payload);
  const filePath = path.join(exportPath, fileName);

  const frontmatter = buildFrontmatter(payload, config);
  const body = buildBody(payload, config);
  const content = frontmatter ? `${frontmatter}\n\n${body}\n` : `${body}\n`;

  await fs.writeFile(filePath, content, 'utf-8');

  return { filePath, fileName };
}

/**
 * Write a test connection file to verify the vault path works.
 */
export async function writeTestFile(
  config: ObsidianConfig
): Promise<{ filePath: string; fileName: string }> {
  return exportToObsidian(config, {
    type: 'session_summary',
    title: 'MAIA Connection Test',
    summary: 'This file confirms that MAIA can write to your Obsidian vault. You can safely delete it.',
    tags: ['test', 'connection'],
  });
}
