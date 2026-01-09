/**
 * Second Brain Writer
 *
 * Implements the "Filing Cabinet" + "Receipt" + "Bouncer" patterns from Nate's architecture.
 * Writes classified items to Obsidian vault via Local REST API.
 */

import { ObsidianRestClient, getObsidianClient } from '@/lib/obsidian/ObsidianRestClient';
import { buildNoteMarkdown, slugify, timestampSlug } from './secondBrainMarkdown';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type SB_Bucket = 'person' | 'project' | 'idea' | 'admin';
export type SB_Status = 'active' | 'waiting' | 'blocked' | 'someday' | 'done' | 'needs_review';
export type SB_Source = 'quickadd' | 'voice' | 'maia' | 'manual' | 'claude-code';

export interface SB_Entities {
  people?: string[];
  projects?: string[];
}

/**
 * Classified second brain item (output from the Sorter/Classifier)
 */
export interface SB_Classified {
  bucket: SB_Bucket;
  title: string;
  body: string;
  next_action?: string;
  tags?: string[];
  entities?: SB_Entities;
  confidence: number; // 0..1
  needs_clarification?: boolean;
  clarification_question?: string;
  sb_id: string;
  captured_at_iso: string;
  source?: SB_Source;
}

/**
 * Raw capture before classification
 */
export interface SB_RawCapture {
  text: string;
  source?: SB_Source;
  captured_at?: Date;
}

/**
 * Result from writing to the vault
 */
export interface SB_WriteResult {
  filedPath: string;
  logPath: string;
  needsReview: boolean;
  item: SB_Classified;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const SECOND_BRAIN_ROOT = 'SecondBrain';

const BUCKET_FOLDER: Record<SB_Bucket, string> = {
  person: `${SECOND_BRAIN_ROOT}/10-People`,
  project: `${SECOND_BRAIN_ROOT}/20-Projects`,
  idea: `${SECOND_BRAIN_ROOT}/30-Ideas`,
  admin: `${SECOND_BRAIN_ROOT}/40-Admin`,
};

const INBOX_FOLDER = `${SECOND_BRAIN_ROOT}/00-Inbox`;
const LOG_FILE = `${SECOND_BRAIN_ROOT}/90-Logs/Inbox Log.md`;
const DIGEST_FOLDER = `${SECOND_BRAIN_ROOT}/95-Digests`;

// Default confidence threshold for the Bouncer
const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;

// ═══════════════════════════════════════════════════════════════════════════════
// Writer Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Write a classified item to the Obsidian vault
 *
 * Implements:
 * - Filing Cabinet: routes to correct folder based on bucket
 * - Receipt: logs to Inbox Log.md
 * - Bouncer: low confidence items stay in Inbox with needs_review status
 */
export async function writeSecondBrainItem(opts: {
  obsidian?: ObsidianRestClient;
  item: SB_Classified;
  confidenceThreshold?: number;
}): Promise<SB_WriteResult> {
  const obsidian = opts.obsidian ?? getObsidianClient();
  const threshold = opts.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

  // Bouncer: check if item should be reviewed
  const needsReview = opts.item.needs_clarification || opts.item.confidence < threshold;

  // Determine destination folder
  const bucketFolder = needsReview ? INBOX_FOLDER : BUCKET_FOLDER[opts.item.bucket];

  // Generate filename
  const slug = slugify(opts.item.title) || opts.item.sb_id;
  const filename = `${bucketFolder}/${slug}.md`;

  // Build frontmatter (the "Form")
  const frontmatter = {
    sb_bucket: opts.item.bucket,
    sb_title: opts.item.title,
    sb_source: opts.item.source ?? 'maia',
    sb_captured_at: opts.item.captured_at_iso,
    sb_confidence: opts.item.confidence,
    sb_next_action: opts.item.next_action ?? null,
    sb_entities: opts.item.entities ?? {},
    sb_status: needsReview ? 'needs_review' : 'active',
    sb_id: opts.item.sb_id,
    tags: Array.from(new Set([...(opts.item.tags ?? []), 'secondbrain', opts.item.bucket])),
  };

  // Build body with clarification callout if needed
  const bodyParts: string[] = [];
  if (needsReview && opts.item.clarification_question) {
    bodyParts.push(`> [!question] Needs clarification\n> ${opts.item.clarification_question}`);
  }
  bodyParts.push(opts.item.body);

  // Build full note
  const noteMarkdown = buildNoteMarkdown({
    frontmatter,
    title: opts.item.title,
    body: bodyParts.join('\n\n'),
  });

  // Write to vault
  await obsidian.upsertNote(filename, noteMarkdown);

  // Receipt: append to log
  const logEntry =
    `- ${opts.item.captured_at_iso} | **${opts.item.title}** ` +
    `→ \`${filename}\` | bucket=${opts.item.bucket} | conf=${opts.item.confidence.toFixed(2)}` +
    `${needsReview ? ' | **NEEDS REVIEW**' : ''}\n`;

  await obsidian.appendToNote(LOG_FILE, logEntry);

  // If primary bucket is project/admin and people are mentioned, append follow-up to their notes
  if ((opts.item.bucket === 'project' || opts.item.bucket === 'admin') && !needsReview) {
    await appendFollowUpToPeople({
      obsidian,
      people: opts.item.entities?.people ?? [],
      filedPath: filename,
      title: opts.item.title,
      nextAction: opts.item.next_action,
      capturedAtIso: opts.item.captured_at_iso,
    });
  }

  console.log(`📝 SecondBrain: wrote ${filename} (conf=${opts.item.confidence.toFixed(2)}, needsReview=${needsReview})`);

  return {
    filedPath: filename,
    logPath: LOG_FILE,
    needsReview,
    item: opts.item,
  };
}

/**
 * Write a raw capture directly to the inbox (unclassified)
 * Used when the classifier fails or for quick capture without AI
 */
export async function writeRawCapture(opts: {
  obsidian?: ObsidianRestClient;
  capture: SB_RawCapture;
}): Promise<string> {
  const obsidian = opts.obsidian ?? getObsidianClient();
  const capturedAt = opts.capture.captured_at ?? new Date();
  const capturedAtIso = capturedAt.toISOString();

  const slug = `capture-${timestampSlug()}`;
  const filename = `${INBOX_FOLDER}/${slug}.md`;

  const frontmatter = {
    sb_bucket: 'unclassified',
    sb_source: opts.capture.source ?? 'manual',
    sb_captured_at: capturedAtIso,
    sb_status: 'needs_review',
    sb_id: crypto.randomUUID(),
    tags: ['secondbrain', 'unclassified'],
  };

  const noteMarkdown = buildNoteMarkdown({
    frontmatter,
    title: 'Unclassified Capture',
    body: opts.capture.text,
  });

  await obsidian.upsertNote(filename, noteMarkdown);

  // Log it
  const logEntry = `- ${capturedAtIso} | **Unclassified** → \`${filename}\` | **NEEDS CLASSIFICATION**\n`;
  await obsidian.appendToNote(LOG_FILE, logEntry);

  console.log(`📝 SecondBrain: raw capture → ${filename}`);
  return filename;
}

/**
 * Write daily digest to the vault
 */
export async function writeDailyDigest(opts: {
  obsidian?: ObsidianRestClient;
  date: Date;
  content: string;
}): Promise<string> {
  const obsidian = opts.obsidian ?? getObsidianClient();
  const dateStr = opts.date.toISOString().slice(0, 10);
  const filename = `${DIGEST_FOLDER}/Daily Digest ${dateStr}.md`;

  const frontmatter = {
    type: 'daily_digest',
    date: dateStr,
    generated_at: new Date().toISOString(),
    tags: ['secondbrain', 'digest', 'daily'],
  };

  const noteMarkdown = buildNoteMarkdown({
    frontmatter,
    title: `Daily Digest - ${dateStr}`,
    body: opts.content,
  });

  await obsidian.upsertNote(filename, noteMarkdown);
  console.log(`📅 SecondBrain: daily digest → ${filename}`);
  return filename;
}

/**
 * Write weekly review to the vault
 */
export async function writeWeeklyReview(opts: {
  obsidian?: ObsidianRestClient;
  weekStart: Date;
  content: string;
}): Promise<string> {
  const obsidian = opts.obsidian ?? getObsidianClient();
  const weekStr = opts.weekStart.toISOString().slice(0, 10);
  const filename = `${DIGEST_FOLDER}/Weekly Review ${weekStr}.md`;

  const frontmatter = {
    type: 'weekly_review',
    week_start: weekStr,
    generated_at: new Date().toISOString(),
    tags: ['secondbrain', 'digest', 'weekly'],
  };

  const noteMarkdown = buildNoteMarkdown({
    frontmatter,
    title: `Weekly Review - Week of ${weekStr}`,
    body: opts.content,
  });

  await obsidian.upsertNote(filename, noteMarkdown);
  console.log(`📆 SecondBrain: weekly review → ${filename}`);
  return filename;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Append follow-up items to People notes when a project/admin item mentions them.
 * Creates the person note and "Follow-ups" heading if they don't exist.
 */
async function appendFollowUpToPeople(opts: {
  obsidian: ObsidianRestClient;
  people: string[];
  filedPath: string;
  title: string;
  nextAction?: string;
  capturedAtIso: string;
}): Promise<void> {
  if (!opts.people?.length) return;
  if (!opts.nextAction?.trim()) return;

  const line = `- ${opts.capturedAtIso} — **${opts.nextAction.trim()}** (from [[${opts.filedPath}|${opts.title}]])\n`;

  for (const personName of opts.people) {
    const personFile = `${BUCKET_FOLDER.person}/${slugify(personName)}.md`;
    try {
      await opts.obsidian.patchNote({
        filename: personFile,
        operation: 'append',
        targetType: 'heading',
        target: 'Follow-ups',
        content: line,
        createTargetIfMissing: true,
      });
      console.log(`📎 SecondBrain: appended follow-up to ${personFile}`);
    } catch {
      // Person note doesn't exist - create it with minimal structure
      const minimal = `---
sb_bucket: person
sb_title: "${personName.replace(/"/g, '\\"')}"
sb_status: active
tags:
  - secondbrain
  - person
---

# ${personName}

## Follow-ups
`;
      await opts.obsidian.upsertNote(personFile, minimal);
      await opts.obsidian.patchNote({
        filename: personFile,
        operation: 'append',
        targetType: 'heading',
        target: 'Follow-ups',
        content: line,
        createTargetIfMissing: true,
      });
      console.log(`📎 SecondBrain: created ${personFile} and appended follow-up`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Re-exports for convenience
// ═══════════════════════════════════════════════════════════════════════════════

export { SECOND_BRAIN_ROOT, BUCKET_FOLDER, INBOX_FOLDER, LOG_FILE, DIGEST_FOLDER };
