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

  it('a division tag with no region opens the DIVISION, never a fabricated region', () => {
    /* rs.length === 0 with tags present must not mint a regionIndex. */
    expect(REVIEW).toMatch(
      /rs\.length === 0 && unit\.uncertainty\.length > 0[\s\S]{0,220}on: 'division'/);
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
    expect(ROUTE).toMatch(/stored:\s*existing\?\.reading/);
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
