/**
 * Corpus authority gate — regression tests for the 2026-08-03 incident.
 *
 * Production field `now-what-demo` carried 63,861 chars of `active_field_content`
 * that composed in full into every room resolving that slug. The content was a
 * Soullab candidate representation whose own header claimed it was "composed in
 * full from Larry Closs's program documents" — a false SOURCE attribution (the
 * authorship line was honest). The content was contained by a direct DB write;
 * these tests cover the pathway, which the containment did not close.
 *
 * The gate is deliberately absolute: `corpusIsComposable` returns false for every
 * field until a real ratification model exists. Readiness `status` may NOT stand
 * in for authority — it is computed from four text fields being non-empty, so
 * gating on it would mean "composable once someone finishes typing."
 *
 * The practitioner-authored identity layers keep composing. They are
 * self-descriptive, low-risk, and were not the failure vector.
 */
import { describe, it, expect } from '@jest/globals';
import {
  corpusIsComposable,
  formatFieldContextForRoom,
} from '@/lib/practiceField/practiceFieldService';
import type { PracticeField } from '@/lib/types/practiceField';

const CORPUS = [
  '═══ FIELD CORPUS — steward-held ═══',
  "Provenance: composed in full from Larry Closs's program documents by the",
  'platform steward (Kelly Nezat), 2026-07-10, pending Larry’s own authoring act.',
].join('\n');

function field(overrides: Partial<PracticeField> = {}): PracticeField {
  return {
    id: 'f0000000-0000-4000-8000-000000000000',
    practitioner_member_id: 'm0000000-0000-4000-8000-000000000000',
    field_slug: 'now-what-demo',
    status: 'live',
    status_reason: null,
    welcome_message: 'Welcome.',
    about_practice: 'About this practice.',
    how_we_work_together: 'How we work.',
    how_maia_supports: 'How MAIA supports.',
    professional_practice: 'The practitioner.',
    active_field_content: CORPUS,
    maia_guidance: null,
    ...overrides,
  } as PracticeField;
}

describe('corpusIsComposable', () => {
  it('is false even for a field whose readiness status is "live"', () => {
    expect(corpusIsComposable(field({ status: 'live' }))).toBe(false);
  });

  it('is false regardless of readiness status — status is not authority', () => {
    for (const status of ['pending', 'warning', 'live'] as const) {
      expect(corpusIsComposable(field({ status }))).toBe(false);
    }
  });
});

describe('formatFieldContextForRoom', () => {
  it('omits the corpus while still composing the identity layers', () => {
    const block = formatFieldContextForRoom(field());

    expect(block).not.toContain('FIELD CORPUS');
    expect(block).not.toContain(CORPUS);
    // The specific false source attribution from the incident.
    expect(block).not.toContain('composed in full from');

    expect(block).toContain('About this practice.');
    expect(block).toContain('How we work.');
    expect(block).toContain('How MAIA supports.');
    expect(block).toContain('The practitioner.');
  });

  it('composes nothing when the corpus is the only content', () => {
    const block = formatFieldContextForRoom(
      field({
        about_practice: null,
        how_we_work_together: null,
        how_maia_supports: null,
        professional_practice: null,
        maia_guidance: null,
      })
    );

    // A corpus alone must not drag in the knowledge-stance header, which tells
    // MAIA it KNOWS this practice. Without composable material that claim is
    // unsupported, so the whole block is empty.
    expect(block).toBe('');
  });

  it('returns empty for a null field', () => {
    expect(formatFieldContextForRoom(null)).toBe('');
  });
});
