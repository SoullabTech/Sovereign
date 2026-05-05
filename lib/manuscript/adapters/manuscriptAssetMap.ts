/**
 * Manuscript asset bridge — image-placeholder ↔ asset resolution
 *
 * Phase 1, Step 1.5. Lets the renderer treat images as opaque
 * referenced resources without ever knowing how they were
 * sourced (Media Studio, local SDXL, image API, human designer).
 * Sovereign + model-agnostic by construction.
 *
 * Flow:
 *
 *   1. extractAssetCandidates(m)
 *      → one candidate per (chapterId, ref) pair, with chapter
 *        context (title, element). Default role: 'unknown'.
 *
 *   2. (caller-side, OUT OF SCOPE here)
 *      → resolve candidates into AssetResolutions by whatever
 *        means is appropriate: Media Studio lookup, generation
 *        request, manual asset selection. The bridge does not
 *        prescribe the resolver.
 *
 *   3. applyAssetResolutions(m, resolutions)
 *      → promotes image-placeholder blocks to image blocks where
 *        a resolution exists. Unresolved placeholders survive
 *        unchanged so the renderer can decide whether to skip,
 *        slot a stub, or warn.
 *
 *   4. getAssetResolutionStatus(m, resolutions)
 *      → total / resolved / unresolved counts and IDs for
 *        telemetry, admin UI, or readiness gating.
 *
 * Constraints honored:
 *   - no I/O, no model assumptions
 *   - no migrations
 *   - no Paged.js
 *   - no modification of existing runtime pages
 */

import type {
  Block,
  Chapter,
  Element,
  ImageRole,
  Manuscript,
  Part,
} from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Role classification for a candidate. Mirrors `ImageRole` from
 * types.ts plus an explicit 'unknown' bucket for honest deferral.
 *
 * The bridge defaults every newly extracted candidate to 'unknown';
 * promotion to a real `ImageRole` is the caller's responsibility
 * (typically Media Studio when the asset is tagged, or the human
 * reviewing the candidate).
 */
export type AssetCandidateRole = ImageRole | 'unknown';

/**
 * One unresolved image placeholder, attached to its chapter context.
 *
 * `placeholderId` is the stable lookup key (composite of chapterId
 * and ref). The same `ref` appearing in two different chapters
 * yields two candidates (chapter-1:image8, chapter-2:image8) so
 * each can be reviewed in its own context.
 */
export interface ManuscriptAssetCandidate {
  /** Composite ID: `${chapterId}:${ref}`. Stable across re-extraction. */
  placeholderId: string;
  /** Derived: chapter.id ?? `chapter-${chapter.number}`. */
  chapterId: string;
  chapterTitle: string;
  element?: Element;
  /**
   * Defaults to 'unknown'. Caller / Media Studio assigns the real
   * `ImageRole` ('diagram' | 'archetype' | 'instructional' |
   * 'atmospheric') when the asset is bound.
   */
  role: AssetCandidateRole;
  /** Original markdown ref (e.g. 'image8'), preserved for lookup. */
  ref: string;
  /** Number of image-placeholder blocks this candidate represents. */
  occurrenceCount: number;
}

/**
 * One bound asset, ready to replace its placeholder block(s).
 *
 * The bridge does not care WHERE `assetId` came from — Media
 * Studio, a generation pipeline, or a human upload. That sovereignty
 * decision lives outside this file.
 */
export interface AssetResolution {
  placeholderId: string;
  assetId: string;
  /** Real ImageRole — 'unknown' is not allowed at resolution time. */
  role: ImageRole;
  caption?: string;
}

/** Telemetry/readiness summary returned by getAssetResolutionStatus. */
export interface AssetResolutionStatus {
  total: number;
  resolved: number;
  unresolved: number;
  unresolvedIds: string[];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Walk the manuscript and emit one candidate per unique
 * (chapterId, ref) pair. Order is stable (chapters visited in
 * order, refs in first-occurrence order within each chapter).
 *
 * Pure. No I/O.
 */
export function extractAssetCandidates(
  m: Manuscript,
): ManuscriptAssetCandidate[] {
  const byId = new Map<string, ManuscriptAssetCandidate>();

  for (const ch of iterChapters(m)) {
    const cId = chapterIdOf(ch);
    const blocks = ch.blocks ?? [];
    for (const b of blocks) {
      if (b.type !== 'image-placeholder') continue;
      const id = makePlaceholderId(cId, b.ref);
      const existing = byId.get(id);
      if (existing !== undefined) {
        existing.occurrenceCount += 1;
        continue;
      }
      byId.set(id, {
        placeholderId: id,
        chapterId: cId,
        chapterTitle: ch.title,
        element: ch.element,
        role: 'unknown',
        ref: b.ref,
        occurrenceCount: 1,
      });
    }
  }

  return Array.from(byId.values());
}

/**
 * Replace image-placeholder blocks with image blocks for every
 * placeholder that has a resolution. Unresolved placeholders pass
 * through unchanged.
 *
 * Caption precedence: resolution.caption (if defined) > placeholder.caption.
 *
 * Reference-stable: returns the input manuscript unchanged when
 * there are zero resolutions, and reuses chapter / part references
 * where no nested transform actually fired.
 *
 * Pure. No I/O.
 */
export function applyAssetResolutions(
  m: Manuscript,
  resolutions: readonly AssetResolution[],
): Manuscript {
  if (resolutions.length === 0) return m;

  const byId = new Map<string, AssetResolution>();
  for (const r of resolutions) byId.set(r.placeholderId, r);

  const transformChapter = (ch: Chapter): Chapter => {
    if (!ch.blocks || ch.blocks.length === 0) return ch;
    const cId = chapterIdOf(ch);
    const transformed = ch.blocks.map((b) => transformBlock(b, cId, byId));
    const unchanged = transformed.every((b, i) => b === ch.blocks![i]);
    if (unchanged) return ch;
    return { ...ch, blocks: transformed };
  };

  const next: Manuscript = { ...m };
  if (m.chapters) {
    next.chapters = m.chapters.map(transformChapter);
  }
  if (m.parts) {
    next.parts = m.parts.map(
      (p): Part => ({
        ...p,
        chapters: p.chapters.map(transformChapter),
      }),
    );
  }
  return next;
}

/**
 * Snapshot of how many placeholders are still unresolved. Useful
 * for renderer gating ("don't ship a PDF with > N unresolved
 * images") and admin telemetry.
 */
export function getAssetResolutionStatus(
  m: Manuscript,
  resolutions: readonly AssetResolution[],
): AssetResolutionStatus {
  const candidates = extractAssetCandidates(m);
  const resolvedSet = new Set(resolutions.map((r) => r.placeholderId));
  const unresolvedIds: string[] = [];
  for (const c of candidates) {
    if (!resolvedSet.has(c.placeholderId)) {
      unresolvedIds.push(c.placeholderId);
    }
  }
  return {
    total: candidates.length,
    resolved: candidates.length - unresolvedIds.length,
    unresolved: unresolvedIds.length,
    unresolvedIds,
  };
}

// ---------------------------------------------------------------------------
// Helpers (pure, exported for tests + potential downstream use)
// ---------------------------------------------------------------------------

/**
 * Stable chapter identity — uses Chapter.id when present, otherwise
 * derives `chapter-${number}`.
 */
export function chapterIdOf(ch: Chapter): string {
  return ch.id ?? `chapter-${ch.number}`;
}

/** Composite placeholder ID. Used as the lookup key for resolutions. */
export function makePlaceholderId(chapterId: string, ref: string): string {
  return `${chapterId}:${ref}`;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function* iterChapters(m: Manuscript): Generator<Chapter> {
  if (m.chapters) {
    for (const c of m.chapters) yield c;
  }
  if (m.parts) {
    for (const p of m.parts) {
      for (const c of p.chapters) yield c;
    }
  }
}

function transformBlock(
  b: Block,
  chapterId: string,
  resolutions: ReadonlyMap<string, AssetResolution>,
): Block {
  if (b.type !== 'image-placeholder') return b;
  const id = makePlaceholderId(chapterId, b.ref);
  const r = resolutions.get(id);
  if (r === undefined) return b;
  const caption = r.caption ?? b.caption;
  return caption !== undefined
    ? { type: 'image', assetId: r.assetId, role: r.role, caption }
    : { type: 'image', assetId: r.assetId, role: r.role };
}
