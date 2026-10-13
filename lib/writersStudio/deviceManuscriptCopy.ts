/**
 * WRITER-DEVICE-COPY-01 · Portable copies are explicit writer acts.
 *
 * No network request, upload, mutation, credential, browser storage, or AI
 * interpretation belongs here. The member's in-tab bodyOf is newer than an
 * as-yet-unacknowledged autosave; never silently substitute a server read.
 *
 * TXT preserves each stored heading prefix plus the exact latest body.
 * Markdown creates an editable reading copy with structural headings.
 * JSON preserves section boundaries and the exact prefix/body for future
 * independent custody, NOT a promise that Studio can import this archive yet.
 */
import type { RebuildSection } from './rebuild/model';

export type DeviceCopyFormat = 'txt' | 'md' | 'json';

export interface DeviceCopyInput {
  manuscriptId: string;
  title: string | null;
  workTitle?: string | null;
  version: number;
  sections: readonly RebuildSection[];
  latestBody: (sectionId: string) => string;
  unsavedInStudio: boolean;
  exportedAt: string;
}
export interface PreparedDeviceCopy {
  filename: string;
  mime: string;
  contents: string;
  sections: number;
}

function portableFilename(title: string | null, format: DeviceCopyFormat): string {
  const name = (title ?? '').normalize('NFC')
    .replace(/[\\/\\:*?"<>|\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ').replace(/^[ .]+|[ .]+$/g, '').slice(0, 96).trim();
  const stem = name && name !== '..' ? name : 'Untitled Work';
  return `${stem}-writer-copy.${format}`;
}

function normalizedSections(input: DeviceCopyInput) {
  const sorted = [...input.sections].sort((a, b) => a.position - b.position);
  const ids = new Set<string>();
  return sorted.map(s => {
    if (!s.draftSectionId || ids.has(s.draftSectionId) || !Number.isFinite(s.position)) {
      throw new Error('This manuscript cannot be copied until its section identity is resolved.');
    }
    ids.add(s.draftSectionId);
    const body = input.latestBody(s.draftSectionId);
    if (typeof body !== 'string') throw new Error('A section body is unavailable. Nothing was downloaded.');
    // Empty prefix is authoritative: an uneditable/source heading may already
    // be inside the stored body, and synthesizing one would duplicate words.
    const prefix = typeof s.headingPrefix === 'string' ? s.headingPrefix
      : s.heading ? `${s.heading}\n\n` : '';
    return {
      id: s.draftSectionId,
      sourceSectionId: s.sourceSectionId,
      position: s.position,
      heading: s.heading,
      headingDepth: s.headingDepth,
      headingSignal: s.headingSignal,
      editable: s.editable,
      prefix,
      body,
    };
  });
}

/** Joins separate database rows without trimming or rewriting any authored body. */
function joinSegments(chunks: readonly string[]): string {
  let whole = '';
  for (const chunk of chunks) {
    if (!chunk) continue;
    if (whole) whole += whole.endsWith('\n\n') ? '' : whole.endsWith('\n') ? '\n' : '\n\n';
    whole += chunk;
  }
  return whole;
}

export function prepareDeviceManuscriptCopy(
  input: DeviceCopyInput,
  format: DeviceCopyFormat,
): PreparedDeviceCopy {
  if (!input.manuscriptId || !['txt', 'md', 'json'].includes(format)) {
    throw new Error('A complete manuscript identity and a supported format are required.');
  }
  const sections = normalizedSections(input);
  if (!sections.length) throw new Error('No manuscript sections are available to copy.');
  let contents = '';
  let mime = 'text/plain;charset=utf-8';
  if (format === 'txt') {
    contents = joinSegments(sections.map(s => s.prefix + s.body));
  } else if (format === 'md') {
    mime = 'text/markdown;charset=utf-8';
    contents = joinSegments(sections.map(s => {
      // Markdown adds heading syntax for portability, never modifies body.
      // Unlabelled slices remain unlabelled, including poetry and dialogue.
      if (!s.heading?.trim()) return s.body;
      const depth = Math.min(6, Math.max(1, s.headingDepth ?? 1));
      return `${'#'.repeat(depth)} ${s.heading}\n\n${s.body}`;
    }));
  } else {
    mime = 'application/json;charset=utf-8';
    contents = JSON.stringify({
      kind: 'soullab.writer-owned-manuscript-copy',
      schemaVersion: 1,
      manuscriptId: input.manuscriptId,
      title: input.title,
      workTitle: input.workTitle ?? null,
      observedServerVersion: input.version,
      containsUnacknowledgedStudioEdits: input.unsavedInStudio,
      exportedAt: input.exportedAt,
      sections,
    }, null, 2) + '\n';
  }
  return { filename: portableFilename(input.title ?? input.workTitle ?? null, format), mime, contents, sections: sections.length };
}
