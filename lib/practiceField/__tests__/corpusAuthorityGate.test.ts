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
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// The live path (buildPracticeFieldContext) reads the DB; the room path does not.
// Mocked here so BOTH guarded boundaries can be proven by the same fixture.
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  transaction: jest.fn(),
}));

import {
  corpusIsComposable,
  formatFieldContextForRoom,
  buildPracticeFieldContext,
  formatPracticeFieldContextForPrompt,
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

/**
 * The SECOND guarded boundary.
 *
 * `corpusIsComposable` gates two composition sites. Until now only the room
 * path had a proof; the live path was correct by inspection alone. That
 * asymmetry mattered because the live path is the one that composes the
 * current field — a regression there would have left the room-path suite green.
 *
 * Same invariant, same fixture, same two assertions. Both halves are required:
 * a system that simply stopped composing would satisfy the negative and fail
 * the positive.
 *
 * ⚠️ The positive control must come from the SAME query as the corpus.
 * `buildPracticeFieldContext` issues two: (1) getSnapshotForSpace, which
 * supplies about/how-we-work/how-MAIA-supports, and (2) the live
 * practice_fields join, which supplies active_field_content. Asserting the
 * snapshot fields proves query 1 ran — it says nothing about query 2. Verified
 * empirically: with mock 2 returning `{ rows: [] }`, `liveField` is null,
 * `activeContent` is null, and every assertion below still passed — the gate
 * never executed. `maia_guidance` is read off that same liveField object, so
 * asserting it SURVIVES is what makes `active_field_content: null` meaningful
 * absence rather than a fixture that never arrived.
 */
describe('buildPracticeFieldContext — the live path', () => {
  const snapshot = {
    space_id: 's0000000-0000-4000-8000-000000000000',
    about_practice: 'About this practice.',
    how_we_work_together: 'How we work.',
    how_maia_supports: 'How MAIA supports.',
    resources: [],
    orientation_style: 'guided',
  };

  // Carried on the live row alongside the corpus — the participation witness.
  const GUIDANCE = { tone: 'warm, unhurried; few words' };

  beforeEach(() => {
    mockQuery.mockReset();
    // 1) getSnapshotForSpace  2) the live practice_fields join
    mockQuery
      .mockResolvedValueOnce({ rows: [snapshot] } as never)
      .mockResolvedValueOnce({ rows: [field({ maia_guidance: GUIDANCE })] } as never);
  });

  it('proves the live query participated — guidance survives from the same row', async () => {
    const ctx = await buildPracticeFieldContext(snapshot.space_id, 'The practitioner');

    // If this fails, the live row never arrived and the two tests below are
    // asserting absence against a fixture that was never there.
    expect(ctx!.maia_guidance).toEqual(GUIDANCE);
  });

  it('withholds the corpus while still carrying the identity layers', async () => {
    const ctx = await buildPracticeFieldContext(snapshot.space_id, 'The practitioner');
    expect(ctx).not.toBeNull();

    // The live row arrived — so the null below is the gate, not a missing row.
    expect(ctx!.maia_guidance).toEqual(GUIDANCE);

    // Forbidden path blocked — the corpus never reaches the context object.
    expect(ctx!.active_field_content).toBeNull();

    // Legitimate identity remains available — this half is what prevents a
    // silent system from passing.
    expect(ctx!.about_practice).toBe('About this practice.');
    expect(ctx!.how_we_work_together).toBe('How we work.');
    expect(ctx!.how_maia_supports).toBe('How MAIA supports.');
  });

  it('composes a prompt block with no corpus and intact self-description', async () => {
    const ctx = await buildPracticeFieldContext(snapshot.space_id, 'The practitioner');
    const block = formatPracticeFieldContextForPrompt(ctx!);

    // This is the actual invariant: corpus does not enter prompt context.
    expect(block).not.toContain('FIELD CORPUS');
    expect(block).not.toContain(CORPUS);
    expect(block).not.toContain('composed in full from');
    expect(block).not.toContain('Current practitioner emphasis');

    // Same-row witness: guidance came off the live field beside the corpus, so
    // the absences above are the gate acting, not an empty query result.
    expect(block).toContain('warm, unhurried; few words');

    expect(block).toContain('About this practice.');
    expect(block).toContain('How we work.');
    expect(block).toContain('How MAIA supports.');
  });
});
