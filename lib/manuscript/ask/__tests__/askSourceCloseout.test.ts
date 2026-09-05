/**
 * WS2-05B-8B-02c-2 · SOURCE CLOSEOUT — one falsifying test per reviewed defect.
 *
 * Six defects were found by source review before the migration was ever applied
 * to the real book. Each is pinned here so it cannot come back quietly. The
 * source-level checks strip comments first: these modules DISCUSS the things
 * they must not do, and a check that counted prose would pass or fail for the
 * wrong reason.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { frozenSideFor, computeStaleness } from '../staleness';
import { isHeldRetry, historyFor } from '../retry';

const ROOT = join(__dirname, '..', '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const FROZEN_READING = read('lib/manuscript/ask/frozenReading.ts');
const ROUTE = read('app/api/sovereign/manuscripts/[id]/ask/route.ts');
const REVIEW = read('app/writers-studio/canvas/StructureReview.tsx');
const PANEL = read('app/writers-studio/canvas/AskMaia.tsx');

describe('defect 1 · the outline marks are functional, not inert', () => {
  it('the question mark is a control that takes itself up', () => {
    expect(REVIEW).toContain('data-mark-question');
    expect(REVIEW).toMatch(/data-mark-question[\s\S]{0,400}onMark\(node\.id, 'question'\)/);
  });

  it('the open mark is a control that takes itself up', () => {
    expect(REVIEW).toContain('data-mark-open');
    expect(REVIEW).toMatch(/data-mark-open[\s\S]{0,400}onMark\(node\.id, 'open'\)/);
  });

  it('neither mark is rendered as an inert span any more', () => {
    expect(REVIEW).not.toMatch(/<span className="ws2sr-mark">/);
    expect(REVIEW).not.toMatch(/<span className="ws2sr-mark" data-uncertainty=/);
  });

  it('the click consumes the SAME frozen set that rendered the question mark', () => {
    /* questionMarks is per-row; questionsFor is the inspector's broader overlap
       context. Using the latter let a row show one owned question while the
       click saw several and opened none. */
    expect(REVIEW).toMatch(/takeUpMark[\s\S]{0,900}questionMarks\.get\(unitId\)/);
    expect(REVIEW).not.toMatch(/takeUpMark[\s\S]{0,900}questionsFor\(unit\)/);
  });

  it('the open-tag mark opens the DIVISION and never infers a region', () => {
    /* A tag is not an UncertainRegion. The handler must not reach regionsFor at
       all — finding one overlapping region and opening it would launder a tag
       into a region it has no identity relation to. */
    const handler = REVIEW.slice(REVIEW.indexOf('const takeUpMark'));
    const body = handler.slice(0, handler.indexOf('}, [proposalId'));
    expect(body).not.toContain('regionsFor');
    expect(body).toMatch(/on: 'division'/);
  });

  it('region-specific conversation still exists where a region is named on screen', () => {
    /* The inspector lists each frozen region with its own way in. */
    expect(REVIEW).toMatch(/data-open-region[\s\S]{0,400}on: 'uncertainty'/);
  });
});

describe('defect 2 · Ask addresses sections in the identity the reading used', () => {
  it('reads the section-addressable draft identity, as the review route does', () => {
    expect(FROZEN_READING).toContain('manuscript_draft_sections');
    expect(FROZEN_READING).toContain('section_addressable_at IS NOT NULL');
  });

  it('never selects headings from a bare manuscript_sections scan', () => {
    /* The source table may only be JOINed for the heading text. */
    expect(FROZEN_READING).not.toMatch(/FROM\s+manuscript_sections\b/i);
  });

  it('still never selects a section body', () => {
    expect(FROZEN_READING).not.toMatch(/SELECT[^;]*\bs\.body\b/i);
  });
});

describe('defect 3 · reviewMoved compares the thread against now, not now against now', () => {
  const id = (rev: number) => ({
    proposalId: 'P1', interpretationInputHash: 'IH', sectionTopologyHash: 'TH',
    reviewRevision: rev,
  });

  it('prefers the thread\'s stored identity over the freshly loaded proposal', () => {
    expect(frozenSideFor({ stored: id(3), fresh: id(9) })!.reviewRevision).toBe(3);
  });

  it('falls back to the fresh proposal only when opening a new thread', () => {
    expect(frozenSideFor({ stored: null, fresh: id(9) })!.reviewRevision).toBe(9);
    expect(frozenSideFor({ stored: null, fresh: null })).toBeNull();
  });

  it('a tree edited while the thread was open reports CHANGED', () => {
    const frozen = frozenSideFor({ stored: id(3), fresh: id(9) })!;
    const s = computeStaleness({
      frozen, canonicalAtOpen: 'C', frozenProposalId: frozen.proposalId,
      now: { interpretationInputHash: 'IH', sectionTopologyHash: 'TH',
             reviewRevision: 9, newestProposalId: 'P1', canonicalFingerprint: 'C' },
    });
    expect(s.reviewMoved).toEqual({ state: 'changed', was: 3, now: 9 });
  });

  it('the route takes the frozen side through frozenSideFor', () => {
    expect(ROUTE).toContain('frozenSideFor');
    /* BUILD-07E: the stored identity became a union, so the structure path
       narrows it first. The property this test defends is unchanged — the `was`
       comes from the THREAD, not from a fresh load — so the assertion follows
       the narrowing to its source rather than being relaxed. */
    expect(ROUTE).toMatch(/const storedStructure = existing\?\.reading/);
    expect(ROUTE).toMatch(/stored:\s*storedStructure/);
  });

  it('a developmental thread never reaches the structure frozen side', () => {
    /* The narrowing is what makes that true, and it is asserted as text because
       the branch above it is what keeps a developmental identity from ever
       arriving here in the first place. */
    expect(ROUTE).toMatch(/existing\.reading\.kind !== 'developmental'/);
    expect(ROUTE.indexOf("effectiveAnchor.on === 'observation'"))
      .toBeLessThan(ROUTE.indexOf('const storedStructure'));
  });
});

describe('defect 4 · no fabricated canonical baseline', () => {
  it('the placeholder fingerprint is gone from the whole runtime', () => {
    expect(ROUTE).not.toContain('unmeasured-at-open');
    expect(FROZEN_READING).not.toContain('unmeasured-at-open');
  });

  it('opening refuses when the fingerprint cannot be taken', () => {
    expect(ROUTE).toMatch(/!existing && canonicalNow === null[\s\S]{0,200}canonical_unmeasurable/);
  });
});

describe('defect 5 · MAIA is given the evidence the prompt promises her', () => {
  it('the frozen reading loads evidence and coverage', () => {
    expect(FROZEN_READING).toMatch(/SELECT[\s\S]*p\.evidence[\s\S]*p\.coverage/);
  });

  it('the route hands both to the reader, with the author\'s own tree', () => {
    expect(ROUTE).toMatch(/evidence:\s*reading\.evidence/);
    expect(ROUTE).toMatch(/coverage:\s*reading\.coverage/);
    expect(ROUTE).toMatch(/reviewed:\s*reading\.reviewed/);
  });

  it('the reader renders them into what she is shown', () => {
    const reader = read('lib/manuscript/ask/askReader.ts');
    expect(reader).toContain('ctx.evidence');
    expect(reader).toContain('ctx.coverage');
    expect(reader).toContain('ctx.reviewed');
  });
});

describe('defect 6 · Work ownership is proved independently, for every anchor', () => {
  it('both verbs check ownership before any read or thread write', () => {
    const checks = ROUTE.match(/await memberOwnsWork\(id, memberId\)/g) ?? [];
    expect(checks.length).toBe(2);
  });

  it('ownership is checked before openThread is ever reached', () => {
    expect(ROUTE.indexOf('memberOwnsWork')).toBeLessThan(ROUTE.indexOf('openThread('));
  });

  it('memberOwnsWork scopes on member_id, not merely on the Work id', () => {
    expect(FROZEN_READING).toMatch(
      /FROM member_manuscripts WHERE id = \$1 AND member_id = \$2/);
  });
});

describe('defect 7 · a failed answer does not orphan the question', () => {
  it('the panel adopts the threadId returned with a refusal', () => {
    expect(PANEL).toMatch(/if \(r\.threadId\) setThreadId\(r\.threadId\)/);
  });

  it('a retry resumes that thread rather than sending the anchor again', () => {
    expect(PANEL).toMatch(/threadId \? \{ threadId \} : \{ anchor \}/);
  });

  it('the client surfaces threadId on the refusal path at all', () => {
    const client = read('lib/writersStudio/askClient.ts');
    expect(client).toMatch(/threadId:\s*\(json as Record<string, unknown>\)\.threadId/);
  });
});

describe('defect 8 · a retry of a held question does not duplicate it', () => {
  const held = [
    { speaker: 'author' as const, body: 'Why are you unsure?' },
    { speaker: 'maia' as const, body: 'Because the seam is ambiguous.' },
    { speaker: 'author' as const, body: 'Could you be wrong?' },
  ];

  it('recognises the unanswered question at the end of the thread', () => {
    expect(isHeldRetry(held, 'Could you be wrong?')).toBe(true);
  });

  it('does not treat a reworded question as a retry — that is new thinking', () => {
    expect(isHeldRetry(held, 'Could you be wrong about this?')).toBe(false);
  });

  it('does not treat a question as held when MAIA already answered it', () => {
    const answered = [...held, { speaker: 'maia' as const, body: 'I could be.' }];
    expect(isHeldRetry(answered, 'Could you be wrong?')).toBe(false);
  });

  it('an empty thread is never a retry', () => {
    expect(isHeldRetry([], 'anything')).toBe(false);
  });

  it('drops the held turn from history so MAIA is not asked twice', () => {
    const h = historyFor(held, 'Could you be wrong?');
    expect(h).toHaveLength(2);
    expect(h[h.length - 1].speaker).toBe('maia');
  });

  it('leaves history untouched for a genuinely new question', () => {
    expect(historyFor(held, 'Something else entirely')).toHaveLength(3);
  });

  it('the route skips the append when the question is already held', () => {
    expect(ROUTE).toMatch(/retryingHeld = isHeldRetry\(priorTurns, question\)/);
    expect(ROUTE).toMatch(/if \(!retryingHeld\) \{[\s\S]{0,200}appendTurn\(/);
  });

  it('the route replays history through historyFor, not the raw turns', () => {
    expect(ROUTE).toContain('historyFor(priorTurns');
    expect(ROUTE).not.toMatch(/\(existing\?\.turns \?\? \[\]\)\.map\(\(t\) => \(\{ speaker/);
  });
});

describe('schema custody · the branch describes the schema its routes require', () => {
  it('the draft-sections migration is present', () => {
    expect(() => readFileSync(join(ROOT,
      'database/migrations/20260830000001_manuscript_draft_sections.sql'), 'utf8'))
      .not.toThrow();
  });

  it('it establishes schema and converts no draft', () => {
    const m = readFileSync(join(ROOT,
      'database/migrations/20260830000001_manuscript_draft_sections.sql'), 'utf8')
      .replace(/--.*$/gm, '');
    expect(m).toContain('CREATE TABLE IF NOT EXISTS manuscript_draft_sections');
    expect(m).toContain('section_addressable_at');
    /* No conversion: the table is created empty and no draft is rewritten. */
    expect(m).not.toMatch(/^\s*(INSERT|UPDATE|DELETE)\s/im);
  });
});
