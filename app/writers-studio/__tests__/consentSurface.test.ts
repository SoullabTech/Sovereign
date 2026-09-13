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
  it('⭐ a proposal jumps the view to its section ONCE', () => {
    const src = CODE(CANVAS);
    expect(src).toMatch(/jumpedFor\.current === proposalTarget\.sectionId\) return/);
    expect(src).toMatch(/setJumpTo\(proposalTarget\.sectionId\)/);
  });

  it('⭐ `Show change` returns attention when the WRITER asks', () => {
    expect(CODE(CANVAS)).toMatch(/const showProposedChange = useCallback/);
    expect(CODE(SURFACE)).toMatch(/onShowChange\?\.\(\)/);
    expect(CODE(SURFACE)).toMatch(/Show change/);
  });

  it('⛔ F1-6 · navigation moves the viewport and never the manuscript', () => {
    /**
     * ⛔⭐ THE FIRST DRAFT ASSERTED PROXIMITY AND FAILED ON AN UNRELATED LINE:
     * `setWriting`, in a `useState` declaration that merely sits within 200
     * characters of a `proposalTarget` occurrence in a 1200-line file. A
     * proximity scan tests ADJACENCY, not behaviour — the C21 class again.
     *
     * So this reads the two places the proposal path actually acts, and
     * asserts that the ONLY thing either of them does is set a jump target.
     */
    const src = CODE(CANVAS);
    const effect = src.match(/jumpedFor\.current = proposalTarget\.sectionId;[\s\S]{0,120}?\}, \[proposalTarget\]\);/);
    const show = src.match(/const showProposedChange = useCallback\([\s\S]{0,200}?\}, \[proposalTarget\]\);/);
    expect(effect).not.toBeNull();
    expect(show).not.toBeNull();
    for (const block of [effect![0], show![0]]) {
      expect(block).toMatch(/setJumpTo\(/);
      /* ⛔ Nothing else. No save, no write-state change, no manuscript touch. */
      expect(block).not.toMatch(/save|setWriting|setWriteState|mutate|apiFetch/i);
    }
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

  it('⛔ F1-9 · no acceptable preview means no target and no gesture', () => {
    const src = CODE(CANVAS);
    expect(src).toMatch(/\? proposed\.mount\.preview\.change : null/);
    expect(CODE(SURFACE)).toMatch(/disabled=\{!mayAccept\(preview\)/);
  });
});
