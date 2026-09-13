/**
 * EDITORIAL-WRITE-01A — CS-1 · CS-2 · CS-7 · CS-8, the route and surface laws.
 *
 * ⭐⭐ THE ROUTE LAW:
 *
 *   The browser does not send the edit back. It sends an id in the path and
 *   nothing in the body. Member identity comes from the authenticated session.
 *
 * ⛔ WHY THIS IS NOT MERELY TIDY. If the client could supply
 * `proposalId + replacementText`, "accept this proposal" would quietly become
 * "write whatever this request says", and every guarantee underneath would be
 * describing a change the member never saw.
 *
 * ⛔ These read CODE, never prose — the C21 discipline. This programme has
 * matched its own comments as violations four times.
 */

import * as fs from 'fs';
import * as path from 'path';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ACCEPT = 'app/api/writers-studio/revision-proposal/[id]/accept/route.ts';
const PREVIEW = 'app/api/writers-studio/revision-proposal/[id]/route.ts';
const SURFACE = 'app/writers-studio/ProposedChange.tsx';

describe('CS-1 — the accept request carries ONLY the id', () => {
  it('⭐⭐ the route never reads the request body', () => {
    const src = CODE(ACCEPT);
    /* Not parsed, not validated, not ignored field-by-field. There is nothing
       for a field to arrive in. */
    expect(src).not.toMatch(/request\.json\(\)|request\.text\(\)|await request\.body/);
  });

  it('⭐ and the client sends no body at all', () => {
    const src = CODE(SURFACE);
    expect(src).toMatch(/\{ method: 'POST' \}/);
    expect(src).not.toMatch(/body: JSON\.stringify/);
  });

  it('⛔ the surface holds no replacement, target or version to send', () => {
    const src = CODE(SURFACE);
    for (const f of [/replacementText/, /targetSectionId/, /baseVersion/, /expectedText/]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-2 — identity is the session’s, never the request’s', () => {
  it('both routes resolve a verified identity and use ITS member id', () => {
    for (const rel of [ACCEPT, PREVIEW]) {
      const src = CODE(rel);
      expect(src).toMatch(/resolveCanonicalIdentity\(request\)/);
      expect(src).toMatch(/identity\.status !== 'verified'/);
      expect(src).toMatch(/identity\.memberId/);
      /* ⛔ No memberId may be taken from anywhere else. */
      expect(src).not.toMatch(/memberId\s*=\s*(body|params|searchParams)/);
    }
  });
});

describe('CS-7 — the surface does not exist until it is constituted', () => {
  it('both routes 404 when the flag is off, and 401 without identity', () => {
    for (const rel of [ACCEPT, PREVIEW]) {
      const src = CODE(rel);
      expect(src).toMatch(/WRITERS_STUDIO_WRITE_ENABLED === '1'/);
      expect(src).toMatch(/status: 404/);
      expect(src).toMatch(/status: 401/);
    }
  });

  it('⛔ an unknown proposal is a 404, indistinguishable from another member’s', () => {
    expect(CODE(ACCEPT)).toMatch(/proposal_unknown' \? 404 : 409/);
  });

  it('⛔ the accept response echoes no prose — only a version', () => {
    const src = CODE(ACCEPT);
    expect(src).toMatch(/resultingVersion/);
    for (const f of [/\btext\b\s*:/, /body\s*:\s*outcome/, /sectionText/]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-8 — the gesture exists in exactly one state', () => {
  it('⭐ ACCEPT CHANGES is disabled unless the preview is acceptable', () => {
    const src = CODE(SURFACE);
    expect(src).toMatch(/const mayAccept = \(p: ProposalPreview\) => p\.state === 'acceptable'/);
    expect(src).toMatch(/disabled=\{!mayAccept\(preview\)/);
  });

  it('⛔ and the surface offers no retry or repair when it no longer matches', () => {
    const src = CODE(SURFACE);
    for (const f of [/retry/i, /regenerat/i, /try again/i, /fix/i]) {
      expect(src).not.toMatch(f);
    }
  });

  it('⭐ `Keep unchanged` is offered as a real answer', () => {
    expect(CODE(SURFACE)).toMatch(/Keep unchanged/);
  });

  it('⛔ the write route is the ONLY place the surface can reach', () => {
    const src = CODE(SURFACE);
    const calls = src.match(/apiFetch\(\s*`?[^`)]*/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('/accept');
  });
});

/* ══ CS-10 · CS-11 — the narrow mount in the real Canvas ═══════════════ */

const CANVAS = 'app/writers-studio/canvas/page.tsx';
const MOUNT = 'app/writers-studio/useProposedChange.ts';
const IDENTITY = 'app/writers-studio/canvasIdentity.ts';

describe('CS-10 — ONE proposal enters the existing workspace', () => {
  it('⭐ the Canvas is pointed at it by ID, through the shared param contract', () => {
    const canvas = CODE(CANVAS);
    expect(canvas).toMatch(/requestedProposalId\(searchParams\)/);
    /* ⛔ The param name is never inlined — the producer's and the consumer's
       must not be able to drift apart. A link is not a binding. */
    expect(canvas).not.toMatch(/get\(['"]proposal['"]\)/);
    expect(CODE(IDENTITY)).toMatch(/CANVAS_PROPOSAL_PARAM = 'proposal'/);
  });

  it('⛔ no proposal inbox, no new mode, no generic changes system', () => {
    const canvas = CODE(CANVAS);
    for (const f of [/proposals\.map/, /ProposalList/, /ChangesPanel/, /pendingProposals/]) {
      expect(canvas).not.toMatch(f);
    }
  });

  it('⛔ the URL carries an id and nothing that could describe the change', () => {
    const src = CODE(IDENTITY) + CODE(MOUNT);
    for (const f of [/expectedText/, /replacementText/, /targetSection/, /baseVersion/]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-11 — after acceptance the UI rereads the Work FROM the Work', () => {
  it('⭐⭐ the displayed manuscript is never patched from the accept response', () => {
    const src = CODE(MOUNT);
    expect(src).toMatch(/window\.location\.reload\(\)/);
    /* ⛔ Nothing takes prose from the reply and puts it on the screen. */
    for (const f of [/setSections\(/, /setText\(/, /applied/, /newBody/]) {
      expect(src).not.toMatch(f);
    }
  });

  it('⭐ the proposal id stays in the URL, so the confirmation is itself a reread', () => {
    const src = CODE(MOUNT);
    /* The preview is fetched again after the reload and the SERVER reports
       already_accepted — the member's confirmation comes from the record, not
       from the reply to their click. */
    expect(src).not.toMatch(/delete\s*\(?searchParams|params\.delete\(/);
  });

  it('⭐ `Keep unchanged` is local only and changes no proposal state', () => {
    const src = CODE(MOUNT);
    expect(src).toMatch(/const dismiss = useCallback\(\(\) => setMount\(\{ state: 'none' \}\)/);
    /* ⛔ Durable rejection is a different thing and needs its own ruling. */
    expect(src).not.toMatch(/reject|decline|dismissed_at/i);
  });

  it('⛔ an unserved proposal does not render an empty surface', () => {
    const src = CODE(MOUNT);
    expect(src).toMatch(/if \(!res\.ok\) return setMount\(\{ state: 'unavailable' \}\)/);
    expect(CODE(CANVAS)).toMatch(/proposed\.mount\.state === 'ready'/);
  });
});

/* ══ EW-F1 · F1-1 … F1-9 — informed consent ═══════════════════════════ */

const PREVIEW_SRC = 'lib/manuscript/revisionProposal/preview.ts';

describe('F1-4 — ⭐⭐ the panel carries NO manuscript prose', () => {
  it('the preview transports coordinates and a decision, never text', () => {
    const src = CODE(PREVIEW_SRC);
    for (const f of [/contextBefore/, /contextAfter/, /readonly removed/, /replacementText:/]) {
      expect(src).not.toMatch(f);
    }
    expect(src).toMatch(/readonly sectionId: string/);
    expect(src).toMatch(/readonly range: SpacedRange/);
  });

  it('⛔ and the panel renders no prose field', () => {
    const src = CODE(SURFACE);
    for (const f of [/change\.removed/, /change\.contextBefore/, /change\.contextAfter/]) {
      expect(src).not.toMatch(f);
    }
    expect(src).toMatch(/Remove one exact passage/);
  });

  it('⭐ so the consent channel carries LESS of the Work than before', () => {
    /**
     * ⛔ THE FIRST DRAFT BANNED `split.body.slice` OVER THE WHOLE FILE and
     * failed — on the line that computes the OFFSET of the match. That is not
     * prose transport, it is arithmetic, and a ban on a string pattern cannot
     * tell the two apart. The law is about what the preview RETURNS, and the
     * behavioural assertion in revisionProposal.test.ts owns it.
     */
    const src = CODE(PREVIEW_SRC);
    expect(src).not.toMatch(/removed:\s*proposal\.expectedText/);
    expect(src).not.toMatch(/contextBefore:|contextAfter:/);
  });
});

describe('F1-8 — ⭐ the target range carries its coordinate space', () => {
  it('projected_section_body, explicitly', () => {
    expect(CODE(PREVIEW_SRC)).toMatch(/space: 'projected_section_body'/);
  });

  it('⛔⭐ and the units change is explicit where it meets the overlay', () => {
    /* projected_section_body offsets are CODE POINTS; FocusOverlay clamps with
       body.length and therefore indexes UTF-16 CODE UNITS. Unconverted, that is
       FOCUS-W3 again — and wrong only where the writer used an astral
       character, the worst possible failure distribution. */
    const src = CODE(CANVAS);
    expect(src).toMatch(/codePointBoundaries\(body\)/);
    expect(src).not.toMatch(/start=\{proposalTarget\.range\.start\}/);
  });
});

describe('F1-1 · F1-5 · F1-6 — orientation, once, and never the Work', () => {
  /**
   * ⛔⭐ THIS TEST USED TO PIN THE DEFECT. It required
   * `setJumpTo(proposalTarget.sectionId)` — the Whole-manuscript scroll
   * command — and passed green while the founder, in Section view, was shown
   * the copyright page beside a panel naming Section 23. A passing test is a
   * specification, and this one specified the substitution.
   *
   * It is replaced by its inverse, the same way `canvasParamPin` replaced the
   * assertion that pinned `manuscripts[0]`: the DECISION moved to
   * `proposalMove`, where it is a value, and the room performs it.
   */
  it('⭐ a proposal moves the view to its section ONCE, in the view it is in', () => {
    const src = CODE(CANVAS);
    /* The once-guard is spent by ARRIVAL, never by the render that learned the
       target — in Section view the editor does not exist at that moment. */
    expect(src).toMatch(/if \(!moveToProposal\(\)\) return;\s*\n\s*jumpedFor\.current = proposalTarget\.sectionId;/);
    /* The room performs the decision; it does not make it.
       ⛔ SCOPED TO THE BLOCK. The first draft banned `session?.view === 'whole'`
       across the whole file and failed on `outlineSelect`, which has routed
       outline clicks by view since Whole view shipped and is correct. A ban
       asserted over a file is the C21 shape; this asks whether THIS block
       re-decides what `proposalMove` already decided. */
    const block = src.match(/const moveToProposal = useCallback[\s\S]{0,600}?\}, \[proposalTarget, session\?\.view, writing\]\);/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/const move = proposalMove\(/);
    expect(block![0]).not.toMatch(/=== 'whole'|=== 'section'/);
  });

  it('⭐ `Show change` returns attention when the WRITER asks', () => {
    expect(CODE(CANVAS)).toMatch(/const showProposedChange = useCallback/);
    expect(CODE(SURFACE)).toMatch(/onShowChange\?\.\(\)/);
    expect(CODE(SURFACE)).toMatch(/Show change/);
  });

  it('⛔ F1-6 · navigation moves the writer and never the manuscript', () => {
    /**
     * ⛔⭐ THE FIRST DRAFT ASSERTED PROXIMITY AND FAILED ON AN UNRELATED LINE:
     * `setWriting`, in a `useState` declaration that merely sits within 200
     * characters of a `proposalTarget` occurrence in a 1200-line file. A
     * proximity scan tests ADJACENCY, not behaviour — the C21 class again.
     *
     * ⭐ AND ITS SECOND DRAFT WAS TOO NARROW IN THE OTHER DIRECTION. It
     * required the blocks to do nothing but `setJumpTo`, which made the
     * Whole-only jump a rule rather than a defect. In Section view moving the
     * writer IS opening the section — the same act as clicking the outline,
     * carrying the same capture seam. That is navigation, not authorship: it
     * flushes what the writer already wrote where they already were, and
     * touches nothing in the section the proposal names.
     *
     * So this asserts the boundary that actually matters: the proposal path
     * may navigate, and may not write, accept, or reach the network.
     */
    const src = CODE(CANVAS);
    const move = src.match(/const moveToProposal = useCallback[\s\S]{0,600}?\}, \[proposalTarget, session\?\.view, writing\]\);/);
    const show = src.match(/const showProposedChange = useCallback\([\s\S]{0,200}?\);/);
    expect(move).not.toBeNull();
    expect(show).not.toBeNull();
    for (const block of [move![0], show![0]]) {
      /* ⛔ Nothing but navigation. No save, no write-state change, no accept,
         no manuscript mutation, no network. */
      expect(block).not.toMatch(/save|setWriteState|mutate|apiFetch|accept/i);
    }
    /* And the only two things the move performs are the two navigations. */
    expect(move![0]).toMatch(/setJumpTo\(move\.sectionId\)/);
    expect(move![0]).toMatch(/writing\?\.goToSection\(move\.sectionId\)/);
  });

  it('⛔ the target comes from the server, never from the URL', () => {
    const src = CODE(CANVAS);
    expect(src).toMatch(/proposed\.mount\.preview\.state === 'acceptable'/);
    expect(src).not.toMatch(/searchParams[\s\S]{0,80}(start|end|range)/);
  });
});

describe('F1-2 · F1-9 — marked in the Work, and only when it resolves', () => {
  it('⭐⭐ the mark is drawn through the overlay the Focus lane owns', () => {
    const src = CODE(CANVAS);
    expect(src).toMatch(/proposalTarget\.sectionId === sectionId[\s\S]{0,400}<FocusOverlay/);
    /* ⛔ Not a second marking mechanism. */
    const overlays = (src.match(/<FocusOverlay/g) ?? []).length;
    expect(overlays).toBe(2);   // the proposal's, and the held focus's
  });

  it('⭐⭐ F1-2 · the mark draws WITHOUT the field-study parameter', () => {
    /**
     * ⛔ CAUGHT BEFORE THE WITNESS, NOT BY IT. The branch required
     * `fieldTreatment`, which is null unless `?field=A|B|C` is in the URL — and
     * a proposal URL carries no such parameter. The writer would have arrived
     * at the right section and seen nothing marked.
     *
     * A study parameter may gate a study. It may not gate the evidence a member
     * is being asked to consent to.
     */
    const src = CODE(CANVAS);
    expect(src).toMatch(/const treatment = fieldTreatment \?\? PROPOSAL_MARK/);
    expect(src).not.toMatch(/proposalTarget\.sectionId === sectionId && fieldTreatment/);
  });

  it('⛔ F1-9 · no acceptable preview means no target and no gesture', () => {
    const src = CODE(CANVAS);
    expect(src).toMatch(/\? proposed\.mount\.preview\.change : null/);
    expect(CODE(SURFACE)).toMatch(/disabled=\{!mayAccept\(preview\)/);
  });
});
