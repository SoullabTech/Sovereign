/**
 * EW-F2 · STEP 2 — the seven obligations the founder pinned.
 *
 * ⛔ These are the LOAD-BEARING FAILURES, named before the build. Where an
 * obligation is about a value, it is asserted against the value. Where it is
 * necessarily about the room's wiring, the assertion reads COMMENT-STRIPPED
 * code and states a property — never a proximity, never a function name, never
 * a string a comment could satisfy. This lane has paid for all three.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ownsManuscriptWrite,
  authorityFromProjectability,
  isSectionAuthority,
  SECTION_AUTHORITIES,
  type SectionAuthority,
} from '@/lib/writersStudio/sectionAuthority';
import { chooseMount, sectionEngine } from '@/lib/writersStudio/writeStateClient';

const CODE = (p: string) =>
  readFileSync(join(__dirname, '..', p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

const ROOM = CODE('canvas/page.tsx');
const SECTION_SURFACE = CODE('canvas/SectionWritingSurface.tsx');
const WHOLE_SURFACE = CODE('canvas/WholeManuscriptSurface.tsx');
const WORK_SURFACE = CODE('canvas/ProposalWorkSurface.tsx');
const ROUTE = readFileSync(
  join(__dirname, '..', '..', 'api', 'sovereign', 'manuscripts', '[id]',
       'write-state', 'route.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const sec = (id: string, authority: SectionAuthority) =>
  ({ id, position: 0, heading: null, body: 'x', authority });
const target = {
  proposalId: 'p1', sectionId: 's-target', sectionLabel: 'Section 23',
  range: { space: 'projected_section_body' as const, start: 1, end: 4 },
  operation: 'delete_exact_text' as const, replacementText: '',
};

describe('PW-1 · the target section mounts no manuscript-writing control', () => {
  it('the authority that owns manuscript writing is a closed set of one', () => {
    const owning = SECTION_AUTHORITIES.filter(ownsManuscriptWrite);
    expect(owning).toEqual(['manuscript_write']);
    expect(ownsManuscriptWrite('proposal_work')).toBe(false);
  });

  it('the Section surface mounts the proposal surface INSTEAD of the editor', () => {
    /* The branch must be reached BEFORE the editor branch, or a proposal
       section falls through into a textarea. */
    const proposalAt = SECTION_SURFACE.indexOf("authority === 'proposal_work'");
    const textareaAt = SECTION_SURFACE.indexOf('<textarea');
    expect(proposalAt).toBeGreaterThan(-1);
    expect(textareaAt).toBeGreaterThan(proposalAt);
  });

  it('and Whole view honours it too — suspension is a property of the section', () => {
    expect(WHOLE_SURFACE).toContain('ownsManuscriptWrite(section.authority)');
    expect(WHOLE_SURFACE).not.toContain('section.editable');
  });

  /**
   * ⭐⭐ THE WIRE, NOT JUST THE CONSUMER — A LINK IS NOT A BINDING.
   *
   * FOUNDER-CAUGHT IN RUNTIME. The room navigated to §23 and mounted no
   * textarea, so PW-1's first half held; and the section was BLANK, because
   * `renderProposalWork` was DECLARED at three hops and PASSED at one. Both
   * forwarding lines were casualties of correcting an over-broad edit, and
   * nothing noticed: the obligation below asserts what the surface does WHEN
   * CALLED, and nothing asserted that anything calls it.
   *
   * That is the defect `canvasIdentity.ts` was written for, in a new costume —
   * the producer's name and the consumer's agreeing while no value travels
   * between them. An assertion about a consumer is not an assertion about a
   * connection.
   */
  it('⭐ the renderer actually REACHES the surface that calls it', () => {
    const bridge = ROOM.match(/<SectionSurfaceBridge[\s\S]*?\/>/);
    const surface = ROOM.match(/<SectionWritingSurface[\s\S]*?\/>/);
    expect(bridge).not.toBeNull();
    expect(surface).not.toBeNull();
    for (const el of [bridge![0], surface![0]]) {
      expect(el).toContain('renderProposalWork=');
    }
  });

  it('⛔ and nothing declares it without passing or calling it', () => {
    /* A hop that receives the renderer and forwards nothing is exactly how the
       blank section happened. Every declaration must be matched by a use. */
    const declared = (ROOM.match(/^\s*renderProposalWork,$/gm) ?? []).length;
    const passed = (ROOM.match(/renderProposalWork=\{/g) ?? []).length;
    expect(declared).toBeGreaterThan(0);
    expect(passed).toBeGreaterThanOrEqual(declared);
  });

  it('⛔ absent a proposal renderer, the target renders nothing — never the editor', () => {
    /* `?? null`, not `?? <textarea>`. A missing renderer must not become a
       fallback that offers a write the server would refuse. */
    expect(SECTION_SURFACE).toMatch(/renderProposalWork\?\.\(active\.id\) \?\? null/);
  });
});

describe('PW-2 · the client cannot create proposal_work by assertion', () => {
  it('the room sends a selector and reads back a resolved authority', () => {
    /* ⭐ EVERY read, not merely the first. This assertion was written as "at
       least one call carries it" and its first run found that the room's
       re-read path — its own comment calls it "the single way this page
       re-reads write authority" — dropped the selector. A refresh would have
       silently left proposal work and handed the target section an editor
       back. Counting is the property; one example is not. */
    const calls = ROOM.match(/fetchWriteState\([\s\S]*?\);/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call).toContain('proposalId');
    /* ⛔ The room never concludes read-only from the presence of a proposal. */
    expect(ROOM).not.toMatch(/proposal[\s\S]{0,40}(readOnly|read_only)/i);
  });

  it('the server resolves the target against the authenticated member', () => {
    const resolveAt = ROUTE.indexOf('resolveProposalWork(');
    const memberAt = ROUTE.indexOf('memberId');
    expect(resolveAt).toBeGreaterThan(-1);
    expect(memberAt).toBeGreaterThan(-1);
    expect(memberAt).toBeLessThan(resolveAt);
    /* The only thing taken from the query string is the id. */
    expect(ROUTE).toMatch(/searchParams\.get\('proposal'\)/);
    expect(ROUTE).not.toMatch(/searchParams\.get\('(section|range|start|end|text)'/);
  });

  it('a mount carries its target or is not that mount at all', () => {
    const m = chooseMount('ready', {
      mode: 'proposal_work', version: 3, rows: [],
      sections: [sec('s-target', 'proposal_work')], target,
    });
    expect(m.mount).toBe('proposal_work');
    expect(sectionEngine(m)?.target).toEqual(target);
  });
});

describe('PW-3 · non-target sections retain their existing authority', () => {
  it('the ordinary mount has no target at all', () => {
    const m = chooseMount('ready', {
      mode: 'section_aware', version: 3, rows: [],
      sections: [sec('a', 'manuscript_write')],
    });
    expect(sectionEngine(m)?.target).toBeNull();
  });

  it('only the resolved section is offered the proposal surface', () => {
    /* The guard is an identity comparison against the SERVER's target, so no
       other section can be rendered by it even if it asks. */
    expect(ROOM).toMatch(/sectionId !== target\.sectionId\) return null/);
  });

  it('projectability still decides every other section, unchanged', () => {
    expect(authorityFromProjectability(true)).toBe('manuscript_write');
    expect(authorityFromProjectability(false)).toBe('unprojectable');
  });
});

describe('PW-4 · entering and leaving proposal_work writes nothing', () => {
  it('the proposal surface has no save, no queue, no network', () => {
    expect(WORK_SURFACE).not.toMatch(/apiFetch|fetch\(|save|queue|PUT|POST/i);
  });

  it('chooseMount and sectionEngine are pure reads', () => {
    const before = JSON.stringify({
      mode: 'proposal_work', version: 3, rows: [],
      sections: [sec('s-target', 'proposal_work')], target,
    });
    const state = JSON.parse(before);
    sectionEngine(chooseMount('ready', state));
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('PW-5 · the reason is explicit, never inferred from !editable', () => {
  it('the boolean is gone from the contract entirely', () => {
    expect(ROUTE).not.toMatch(/editable:\s*s\.editable/);
    expect(ROUTE).toContain('authority: authorityOf(s)');
  });

  it('proposal_work is a distinct authority, not the absence of one', () => {
    expect(isSectionAuthority('proposal_work')).toBe(true);
    expect(SECTION_AUTHORITIES).toContain('unprojectable');
    expect(SECTION_AUTHORITIES).toContain('proposal_work');
    /* ⛔ The two must never collapse: one is "the server cannot project this",
       the other is "you are working here, just not on the manuscript". */
    expect(authorityFromProjectability(false)).not.toBe('proposal_work');
  });

  it('and the surface SAYS it rather than showing a disabled editor', () => {
    expect(WORK_SURFACE).toMatch(/read-only while you do/);
    expect(WORK_SURFACE).not.toMatch(/cannot be edited/);
  });
});

describe('PW-6 · proposed state is real prose, not a textarea mirror', () => {
  it('the proposal surface mounts no editable control', () => {
    expect(WORK_SURFACE).not.toMatch(/<textarea|contentEditable/);
  });

  it('and brings no mirroring machinery with it', () => {
    expect(WORK_SURFACE).not.toMatch(/FocusOverlay|MIRROR|position: 'absolute'/);
  });

  it('⛔ the code-point conversion is explicit — FOCUS-W3 does not recur here', () => {
    expect(WORK_SURFACE).toContain('codePointBoundaries(body)');
    /* Raw range offsets must never index the string directly. */
    expect(WORK_SURFACE).not.toMatch(/slice\(range\.start|slice\(0, range\./);
  });

  it('⛔ and a range in any other coordinate space refuses to draw', () => {
    expect(WORK_SURFACE).toMatch(/range\.space !== 'projected_section_body'/);
  });
});

describe('PW-7 · editing elsewhere may stale the proposal; never a silent rebase', () => {
  it('proposal work is entered only from an acceptable preview', () => {
    const src = readFileSync(
      join(__dirname, '..', '..', '..', 'lib', 'manuscript', 'revisionProposal',
           'proposalWork.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    expect(src).toMatch(/preview\.state !== 'acceptable'\) return null/);
    /* ⭐ AND THE GUARD MUST BE THE ONLY WAY OUT WITH A TARGET. The first draft
       asserted only that the line existed, which a resolver that ALSO returned
       a fabricated target for a stale proposal would have satisfied — the exact
       silent rebase PW-7 forbids. One constructed return, after the guard. */
    const constructed = src.match(/return \{/g) ?? [];
    expect(constructed).toHaveLength(1);
    expect(src.indexOf("preview.state !== 'acceptable'"))
      .toBeLessThan(src.indexOf('return {'));
    /* ⛔ NO REBASE. Nothing here re-derives a target, recomputes a range
       against moved text, or writes a new base version. */
    expect(src).not.toMatch(/baseVersion\s*=|UPDATE|rebase|indexOf\(/i);
  });

  it('a stale proposal simply is not a proposal-work mount', () => {
    /* previewProposal returns `no_longer_matches` on stale_base; the resolver
       maps every non-acceptable state to null, so the room mounts the ordinary
       section engine and the writer keeps writing. */
    const m = chooseMount('ready', {
      mode: 'section_aware', version: 36, rows: [],
      sections: [sec('s-target', 'manuscript_write')],
    });
    expect(m.mount).toBe('sections');
    expect(sectionEngine(m)?.target).toBeNull();
  });
});
