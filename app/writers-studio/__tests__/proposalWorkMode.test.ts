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
const WORK_RAW = require('node:fs').readFileSync(
  require('node:path').join(__dirname, '..', 'canvas', 'ProposalWorkSurface.tsx'), 'utf8');
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
    /* ⚠️ The first draft extracted each element with a non-greedy match to the
       first `/>`. That worked until the bridge gained a render prop containing
       nested JSX, at which point the match truncated BEFORE the prop it was
       checking — a guard that silently stops reading the thing it guards.
       `SectionWritingSurface` has no nested JSX so it still extracts cleanly;
       the bridge is asserted by span instead. */
    const surface = ROOM.match(/<SectionWritingSurface[\s\S]*?\/>/);
    expect(surface).not.toBeNull();
    expect(surface![0]).toContain('renderProposalWork=');
    expect(ROOM).toMatch(/<SectionSurfaceBridge[\s\S]{0,4000}renderProposalWork=\{target \?/);
    expect(ROOM).toMatch(/<SectionSurfaceBridge[\s\S]{0,4000}renderProposalEvidence=\{target \?/);
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
    /* The property, not the wording: it says the proposed text is NOT in the
       manuscript and that acceptance is what writes — and it never says the
       section "cannot be edited", which is the sentence most likely to mislead
       someone who is, in fact, working. */
    expect(WORK_SURFACE).toMatch(/not in your\s+manuscript yet/);
    expect(WORK_SURFACE).toMatch(/nothing is written until you accept/);
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


/**
 * ⭐⭐ PW-8 … PW-19 — the obligations the founder pinned after the runtime
 * witness, in two groups.
 *
 * CROSS-VIEW TRUTH (PW-8…PW-13). *Authority may differ by mode. Truth about
 * that authority may not.* Step 2 first scoped the proposal to Section view,
 * which left Whole view showing the target as bare prose — and silently retired
 * the EW-F1 mark Whole had drawn since that lane closed, because the overlay
 * lives only in the editable branch.
 *
 * THE COMPARISON IS THE SYSTEM'S WORK (PW-14…PW-19). EW-F1 shipped a detached
 * excerpt; step 2's first build shipped duplicate full sections. Neither shows
 * the change: both make the writer perform the comparison. That is not informed
 * consent — it is visual diff work outsourced to the person being asked to
 * consent.
 */
describe('PW-8 … PW-13 · Whole view is truthful evidence, not a second authority', () => {
  const EVIDENCE = WORK_SURFACE.slice(WORK_SURFACE.indexOf('ProposalEvidenceInWork'));

  it('PW-8 · the reason is stated in Whole view, not only in Section', () => {
    expect(EVIDENCE).toMatch(/being worked as a proposed change/);
  });

  it('PW-9 · Whole view locates the exact range, not merely the section', () => {
    expect(EVIDENCE).toContain('body.slice(0, a)');
    expect(EVIDENCE).toContain('<Locus');
    expect(EVIDENCE).toContain('body.slice(b)');
  });

  it('PW-10 · and mounts no manuscript-writing control for the target', () => {
    expect(EVIDENCE).not.toMatch(/<textarea|contentEditable/);
    expect(WHOLE_SURFACE).toMatch(/authority === 'proposal_work'/);
    /* The proposal branch must precede the editable branch, or the target
       falls through into a textarea. */
    expect(WHOLE_SURFACE.indexOf("authority === 'proposal_work'"))
      .toBeLessThan(WHOLE_SURFACE.indexOf('<textarea'));
  });

  it('PW-11 · the door is taken only when the member asks', () => {
    /* The view change is an onClick, routed through the room's one
       view-change seam — never an effect, never automatic. */
    expect(EVIDENCE).toMatch(/onClick=\{onWorkWithChange\}/);
    expect(EVIDENCE).not.toMatch(/useEffect/);
    expect(ROOM).toMatch(/renderProposalEvidence\?\.\([\s\S]{0,200}changeView\('section'/);
  });

  it('PW-12 · the mark exists whether or not the target would otherwise edit', () => {
    /* ⛔ THE REGRESSION, PINNED. The mark used to live only in the editable
       branch, so a section becoming proposal-owned silently lost it. */
    const proposalAt = WHOLE_SURFACE.indexOf("authority === 'proposal_work'");
    const editableAt = WHOLE_SURFACE.indexOf('ownsManuscriptWrite(section.authority)');
    expect(proposalAt).toBeGreaterThan(-1);
    expect(editableAt).toBeGreaterThan(proposalAt);
  });

  it('PW-13 · Whole view carries no accept and no staged authoring', () => {
    expect(EVIDENCE).not.toMatch(/accept|ACCEPT|staged|save/i);
  });

  it('⭐ and both views are built from ONE server resolution', () => {
    /* Two renderers, one `target`. They cannot disagree about what is proposed
       or where, because neither derives it. */
    const evidence = ROOM.match(/renderProposalEvidence=\{target \?[\s\S]*?\} : undefined\}/);
    const work = ROOM.match(/renderProposalWork=\{target \?[\s\S]*?\} : undefined\}/);
    expect(evidence).not.toBeNull();
    expect(work).not.toBeNull();
    for (const r of [evidence![0], work![0]]) {
      expect(r).toContain('target.range');
      expect(r).toContain('sectionId !== target.sectionId');
    }
  });
});

describe('PW-14 … PW-19 · the system performs the comparison', () => {
  const SURFACE = WORK_SURFACE.slice(
    WORK_SURFACE.indexOf('export default function ProposalWorkSurface'),
    WORK_SURFACE.indexOf('export function ProposalEvidenceInWork'));

  it('PW-14/PW-18 · the body is rendered exactly once — no duplicate blocks', () => {
    /* ⛔ THE SHAPE THAT SHIPPED AND FAILED: CURRENT then PROPOSED, each the
       whole 1334-character section, the change a thousand characters down in
       both. One body: one `slice(0, a)` and one `slice(b)`. */
    expect((SURFACE.match(/body\.slice\(0, a\)/g) ?? [])).toHaveLength(1);
    expect((SURFACE.match(/body\.slice\(b\)/g) ?? [])).toHaveLength(1);
    /* ⛔ The ban was on DUPLICATE FULL SECTIONS, and is now stated as one:
       exactly one rendering of the whole body. The affected sentence lives in
       the panel, at sentence scope, which is the comparison aid the founder
       ruled back in — not a second copy of the section. */
    expect((SURFACE.match(/body\.slice\(0, a\)/g) ?? [])).toHaveLength(1);
  });

  it('PW-15/PW-17 · the change is at the locus, and leaving text is distinguished', () => {
    expect(SURFACE).toContain('<Locus');
    expect(WORK_SURFACE).toMatch(/textDecoration: 'line-through'/);
    /* Struck AND tinted — a strike alone reads as emphasis. */
    expect(WORK_SURFACE).toMatch(/REMOVED = \{[\s\S]*?background:/);
  });

  it('PW-16 · opening the proposal brings the locus into view ONCE', () => {
    /* ⛔ THIS ASSERTION USED TO PIN THE VIOLATION. It required `scrollIntoView`
       by name — a call this room has banned since 2026-09-11, because it
       scrolls every scrollable ancestor including the document and threw the
       Studio header off-screen. Naming an API is not naming a property; the
       property is that the locus is revealed through the room's own seam,
       which moves the nearest scroller and nothing else. */
    expect(WORK_SURFACE).toContain('revealWithin(');
    expect(WORK_SURFACE).not.toContain('scrollIntoView');
    /* Keyed and spent, so a writer reading elsewhere is not dragged back. */
    expect(WORK_SURFACE).toMatch(/done\.current === key/);
    expect(WORK_SURFACE).toMatch(/done\.current = key/);
  });

  it('PW-19 · the surrounding prose stays in normal reading flow', () => {
    /* Not an excerpt: the text before and after the change is the real body,
       sliced at the locus and nowhere else. */
    expect(SURFACE).toContain('body.slice(0, a)');
    expect(SURFACE).toContain('body.slice(b)');
    /* The sentence comparison is a PANEL concern and lives in its own pure
       module; this surface renders the body and nothing derived from it. */
    expect(SURFACE).not.toMatch(/sentenceAround|sentenceComparison|excerpt|window/i);
  });

  it('⭐ the change has visible edges', () => {
    /* Founder-asked. A tint says THAT something changed; brackets say exactly
       where it starts and stops — which at 23 characters inside 1334 is the
       whole question. */
    expect(WORK_RAW).toMatch(/<span style=\{BRACKET\}>\[<\/span>/);
    expect(WORK_RAW).toMatch(/<span style=\{BRACKET\}>\]<\/span>/);
    /* ⛔ The bracket is the system speaking; striking it would read as the
       bracket itself being removed. */
    expect(WORK_SURFACE).toMatch(/BRACKET = \{[\s\S]*?textDecoration: 'none'/);
  });

  it('⛔ one visual language, both views', () => {
    /* `Locus` is defined once and used by both surfaces, so Section and Whole
       cannot drift into two vocabularies for the same fact. */
    expect((WORK_SURFACE.match(/function Locus\(/g) ?? [])).toHaveLength(1);
    expect((WORK_SURFACE.match(/<Locus/g) ?? [])).toHaveLength(2);
  });
});


/**
 * ⭐⭐ SC-1 … SC-7 — ARRIVAL AND VOLUNTARY RETURN ARE DIFFERENT ACTS.
 *
 * FOUNDER-CAUGHT. `Show change` called `moveToProposal()` and stopped there,
 * while the locus reveal sat inside the surface behind a one-shot guard keyed
 * to the locus. Automatic arrival spent that guard, so once the writer scrolled
 * away the control that exists to bring them back did nothing.
 *
 *   automatic arrival     reveal the locus ONCE
 *   explicit Show change  reveal the locus EVERY time the writer asks
 *   ordinary re-render    never drag the writer
 *
 * ⛔ THE GUARD IS NOT WEAKENED. It is correct for the first case. The repair
 * separates the acts rather than loosening the one that was right.
 *
 * ⚠️ AND THE INSTRUMENT THAT MISSED IT ASSERTED THE CALLBACK EXISTS. Naming a
 * callback is not naming arrival — the same class as asserting an API by name
 * (PW-16) and asserting proximity (F1-6). What is asserted below is that a
 * press produces a reveal, and that an ordinary render does not.
 */
describe('SC-1 … SC-7 · voluntary return to the change', () => {
  const SURFACE = WORK_SURFACE;

  it('SC-1 · arrival reveals the locus once, keyed to the locus', () => {
    expect(SURFACE).toMatch(/done\.current === key/);
    expect(SURFACE).toMatch(/done\.current = key/);
    const auto = SURFACE.slice(SURFACE.indexOf('done.current === key'));
    expect(auto.slice(0, 200)).toContain('revealWithin(');
  });

  it('SC-2/SC-3 · a press reveals again, and again', () => {
    /* ⛔ A NONCE, NOT A FLAG. A boolean cannot express "again": the second
       press would find it already true and do nothing — which is the shipped
       defect with an extra step. */
    expect(SURFACE).toMatch(/revealToken === seenToken\.current\) return/);
    expect(SURFACE).toMatch(/seenToken\.current = revealToken/);
    const voluntary = SURFACE.slice(SURFACE.indexOf('revealToken === seenToken.current'));
    expect(voluntary.slice(0, 200)).toContain('revealWithin(');
    expect(ROOM).toMatch(/setRevealToken\(\(n\) => n \+ 1\)/);
  });

  it('⭐ SC-4 · the two acts are separate effects with separate keys', () => {
    /* If one effect served both, either arrival would repeat on every render
       or the press would be swallowed by the arrival guard. */
    const effects = SURFACE.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[(key|revealToken)\]\);/g) ?? [];
    expect(effects).toHaveLength(2);
    expect(SURFACE).toMatch(/\}, \[key\]\);/);
    expect(SURFACE).toMatch(/\}, \[revealToken\]\);/);
  });

  it('⭐⭐ SC-5 · the press reveals the LOCUS, not merely the section shell', () => {
    /**
     * ⛔ THE SHIPPED SHAPE, PINNED: automatic reveal spent → writer scrolls
     * away → Show change → section top visible → locus still below the fold.
     *
     * `moveToProposal` alone only opens the section. The press must also carry
     * the token that moves the viewport to the marked range.
     */
    const show = ROOM.match(/const showProposedChange = useCallback\([\s\S]*?\}, \[moveToProposal\]\);/);
    expect(show).not.toBeNull();
    expect(show![0]).toContain('moveToProposal()');
    expect(show![0]).toContain('setRevealToken');
  });

  it('SC-6 · every reveal goes through the room\'s seam', () => {
    expect((SURFACE.match(/revealWithin\(/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(SURFACE).not.toContain('scrollIntoView');
  });

  it('SC-7 · viewport only — no write, no mode change, no proposal mutation', () => {
    const show = ROOM.match(/const showProposedChange = useCallback\([\s\S]*?\}, \[moveToProposal\]\);/);
    expect(show![0]).not.toMatch(/save|apiFetch|accept|changeView|setWriteState/i);
    /* ⭐ AND IT DOES NOT NAVIGATE TO WHERE THE WRITER ALREADY IS. Calling
       `goToSection` on the active section would run the capture seam for no
       reason — the writer's own prose written back because they asked to LOOK
       at something. */
    expect(ROOM).toMatch(/writing\.activeId !== move\.sectionId\) writing\.goToSection/);
  });

  it('⛔ and the token reaches the surface that consumes it', () => {
    /* The wire, not the declaration — this lane has paid for that once. */
    const el = ROOM.match(/<ProposalWorkSurface[\s\S]*?\/>/);
    expect(el).not.toBeNull();
    expect(el![0]).toContain('revealToken={revealToken}');
    /* FieldBody builds the renderer, so BOTH of its call sites must carry it
       or one layout silently loses voluntary return. */
    expect((ROOM.match(/revealToken=\{revealToken\}/g) ?? []).length).toBe(3);
  });
});
