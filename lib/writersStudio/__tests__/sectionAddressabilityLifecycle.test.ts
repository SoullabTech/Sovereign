/**
 * WS2-NAV-01 — the lifecycle the pilot depends on:
 * import stays unconverted · the member act converts · navigation follows · reload keeps it.
 *
 * These are unit + structural assertions. Clicking a real row in a browser is a
 * production witness, not something this suite can claim to have done.
 */
import fs from 'fs';
import path from 'path';
import { chooseMount, type WriteState } from '../writeStateClient';

const REPO = path.resolve(__dirname, '../../..');
/**
 * ⚠️ THE C21 CLASS, EIGHTH OCCURRENCE IN THIS PROGRAMME — and three times in
 * this one file. A prohibition scanned against raw source fires on the comment
 * that STATES the prohibition: the notice names `planConversion` while
 * explaining it must not re-implement it, the route names
 * `sections/convertDraft` while explaining it does not import it, and the copy
 * says ⛔ NOT "conversion failed" while forbidding that phrase. Comments are
 * stripped before every prohibition scan, the remedy this programme has used
 * since C6.
 */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8');

describe('import alone does NOT make a Work section-addressable', () => {
  const ingestPaths = [
    'app/api/sovereign/manuscripts/route.ts',
    'app/api/sovereign/manuscripts/ingest/route.ts',
  ];

  it.each(ingestPaths)('%s never sets section_addressable_at', (p) => {
    expect(read(p)).not.toMatch(/section_addressable_at\s*=/);
  });

  it.each(ingestPaths)('%s never issues the convert command', (p) => {
    expect(read(p)).not.toMatch(/convert\s*:\s*true/);
  });

  it('an imported Work therefore mounts as worktable, not sections', () => {
    const imported: WriteState = {
      mode: 'continuous',
      version: 1,
      content: '# Chapter 1\n\ntext',
      notice: { title: 't', body: 'b' },
    };
    expect(chooseMount('ready', imported).mount).toBe('worktable');
  });
});

describe('only the explicit member act converts', () => {
  it('the act is reachable from exactly one place, and it is a member gesture', () => {
    /* ⚠️ RELOCATED BY WRITING-STATE-ANNOUNCE-01, and STRENGTHENED rather than
       weakened. The act moved from the dismissible Outline panel to the writing
       field, so the anchor is `DraftStateNotice`. "Exactly one place" was only
       ever CLAIMED before; it is now COUNTED across both files, so a future
       re-duplication fails here instead of shipping. */
    const notice = read('app/writers-studio/canvas/DraftStateNotice.tsx');
    const room = read('app/writers-studio/canvas/CanvasClient.tsx');
    expect(notice).toMatch(/data-action="confirm-section-breaks"/);
    expect(notice).toMatch(/onClick=\{onConfirmSectionBreaks\}/);
    const occurrences =
      (notice.match(/data-action="confirm-section-breaks"/g) ?? []).length
      + (room.match(/data-action="confirm-section-breaks"/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('no automatic conversion fires on mount or on save', () => {
    const page = read('app/writers-studio/canvas/CanvasClient.tsx');
    // the command appears only inside the callback the button invokes
    const callSites = page.match(/confirmSectionBreaks\(/g) ?? [];
    expect(callSites).toHaveLength(1);
    expect(page).not.toMatch(/useEffect\([^)]*confirmSectionBreaks/);
  });

  it('conversion carries no content — the save contract is untouched', () => {
    expect(read('lib/writersStudio/confirmSectionBreaks.ts'))
      .toMatch(/JSON\.stringify\(\{\s*convert:\s*true\s*\}\)/);
  });
});

describe('after conversion the Work is navigable — and navigability comes from the server', () => {
  /* `section_aware` is the WRITE STATE the server reports; `sections` is the
     MOUNT the canvas chooses from it. Naming them apart matters — conflating
     them is what made an earlier draft of this test assert against a mode that
     does not exist. */
  const converted: WriteState = {
    mode: 'section_aware',
    version: 2,
    rows: [
      { id: 's1', heading: 'Chapter 1', position: 0 },
      { id: 's2', heading: 'Chapter 2', position: 1 },
      { id: 's3', heading: 'Chapter 3', position: 2 },
    ] as never,
    sections: [] as never,
  } as WriteState;

  it('mounts the section-addressable branch', () => {
    const m = chooseMount('ready', converted);
    expect(m.mount).toBe('sections');
    if (m.mount !== 'sections') return;
    expect(m.rows).toHaveLength(3);
  });

  it('RELOAD preserves it: the same server state yields the same mount, with no client memory', () => {
    const first = chooseMount('ready', converted);
    const afterReload = chooseMount('ready', converted); // fresh page, same GET
    expect(afterReload).toEqual(first);
    expect(afterReload.mount).toBe('sections');
  });

  it('a failed conversion leaves the Work exactly where it was', () => {
    const stillContinuous: WriteState = {
      mode: 'continuous', version: 1, content: 'x', notice: { title: 't', body: 'b' },
    };
    expect(chooseMount('ready', stillContinuous).mount).toBe('worktable');
  });
});

describe('the draft says what state it is in, where the writer is', () => {
  /* ⚠️ WRITING-STATE-ANNOUNCE-01. This used to assert that the OUTLINE explained
     the state. It did — and that was the defect: the explanation lived in a
     dismissible panel keyed on the SOURCE having sections while describing the
     DRAFT, so a Work begun in the Studio met the Worktable with no explanation
     at all. The copy and the gate are unchanged; the carrier moved. */
  it('the writing field names the state and offers the act', () => {
    const notice = read('app/writers-studio/canvas/DraftStateNotice.tsx');
    expect(notice).toMatch(/SECTION_BREAKS_COPY\.action/);
    expect(notice).toMatch(/data-draft-state=/);
  });

  it('prefers the server\'s own reason when it has one', () => {
    const notice = read('app/writers-studio/canvas/DraftStateNotice.tsx');
    expect(notice).toMatch(/writeMount\.notice\?\.title/);
    expect(notice).toMatch(/writeMount\.notice\?\.body/);
  });

  it('the outline still marks unconverted rows, and no longer owns the state', () => {
    const room = read('app/writers-studio/canvas/CanvasClient.tsx');
    expect(room).toMatch(/data-outline-state="unconverted"/);
    expect(room).not.toMatch(/SECTION_BREAKS_COPY\.action/);
  });

  it('⭐ understanding the state does not require opening anything', () => {
    const room = read('app/writers-studio/canvas/CanvasClient.tsx');
    const at = room.indexOf('<DraftStateNotice');
    expect(at).toBeGreaterThan(-1);
    expect(room.slice(Math.max(0, at - 600), at)).not.toMatch(/outlineOpen && \(/);
  });
});

describe('R1 — the act is offered only where conversion can succeed', () => {
  const page = read('app/writers-studio/canvas/DraftStateNotice.tsx');

  it('gates the button on the WRITE STATE, not on the mount', () => {
    /* ⚠️ AMENDED BY CONVERSION-AVAILABILITY-ALIGNMENT-01. The law is unchanged
       in spirit and STRICTER in fact: the gate was `mode === 'continuous'`, a
       CLASSIFICATION; it is now the member's own conversion door. The mount
       still cannot stand in for either. */
    expect(page).toMatch(/const actAvailable = offerable;/);
    expect(page).toMatch(/conversionOfferable === true/);
    expect(page).toMatch(/\{actAvailable && \(\s*<button/);
  });

  it('does not gate the button on mount alone', () => {
    const buttonIdx = page.indexOf('data-action="confirm-section-breaks"');
    expect(buttonIdx).toBeGreaterThan(-1);
    expect(page.lastIndexOf('actAvailable', buttonIdx)).toBeGreaterThan(-1);
    /* ⛔ The mount may not stand in for it: `worktable` collapses three server
       states and only one of them can convert. */
    expect(page).not.toMatch(/mount === 'worktable'[\s\S]{0,120}<button/);
  });

  it('continuous_unprovable and no_draft still mount worktable — so the mount cannot be the gate', () => {
    const unprovable: WriteState = {
      mode: 'continuous_unprovable', version: 1, content: 'x',
      notice: { title: 't', body: 'b' },
    };
    expect(chooseMount('ready', unprovable).mount).toBe('worktable');
    expect(chooseMount('ready', { mode: 'no_draft' }).mount).toBe('worktable');
  });

  it('copy for the non-convertible state does not promise an act', () => {
    const copy = read('lib/writersStudio/confirmSectionBreaks.ts');
    expect(copy).toMatch(/bodyNotConvertible/);
    expect(page).toMatch(/SECTION_BREAKS_COPY\.bodyNotConvertible/);
  });

  it('⭐⭐ the control is gated on the MEMBER\'S OWN conversion door', () => {
    /* CONVERSION-AVAILABILITY-ALIGNMENT-01. `mode === 'continuous'` says the
       draft is convertible IN PRINCIPLE; `conversionOfferable` is the door's own
       planConversion saying the act can actually succeed. ⛔ Classification
       alone never authorizes the control. */
    expect(page).toMatch(/conversionOfferable === true/);
    expect(page).toMatch(/const actAvailable = offerable;/);
  });

  it('⛔ absence of the fact is NOT permission', () => {
    /* An older server omits the field. A strict `=== true` is the difference
       between "the door said yes" and "the response was silent". */
    expect(page).not.toMatch(/conversionOfferable\s*\)/);
    expect(page).not.toMatch(/conversionOfferable !== false/);
  });

  it('⛔⛔ the UI does not RE-IMPLEMENT the predicate', () => {
    /* The defect being repaired was a gate aligned with a different
       implementation. Fixing it by copying the strict rule into the surface
       would create two identical predicates free to diverge again. The surface
       must carry no composer, no byte comparison, no classification. */
    const bare = strip(page);
    expect(bare).not.toMatch(/composeDraftSlices|classifyDraft|planConversion/);
    expect(bare).not.toMatch(/Buffer\.from|\.equals\(/);
    expect(bare).not.toMatch(/PRISTINE|LEGACY_COMPOSER_VARIANT|EDITED/);
  });

  it('⭐ and the server takes the answer from the door the member uses', () => {
    const route = read('app/api/sovereign/manuscripts/[id]/write-state/route.ts');
    /* The SAME module POST /draft imports — not sections/convertDraft.ts,
       which serves the developmental preparation path. */
    expect(route).toMatch(/from '@\/lib\/manuscript\/draftSections'/);
    expect(strip(route)).not.toMatch(/sections\/convertDraft/);
    expect(route).toMatch(/conversionOfferable: plan\.status !== 'refused'/);
  });

  it('⛔ and the refusal WORDS stay off the screen', () => {
    /* They are instrumentation. The surface needs to know WHETHER, not WHY. */
    expect(page).not.toMatch(/boundary_confirmation_required|boundary_moved/);
  });

  it('⭐ the not-offerable band gets its own truthful sentence', () => {
    expect(page).toMatch(/has section structure/);
    expect(page).toMatch(/cannot safely make/);
    /* ⛔ Not a failure, and ⛔ not an advertisement for machinery that does not
       exist — there is no member act that confirms boundaries today. */
    const bare = strip(page);
    expect(bare).not.toMatch(/conversion failed|could not convert/i);
    expect(bare).not.toMatch(/confirm the boundaries|review the boundaries/i);
  });

  it('⛔ and no_draft is announced without being offered an act', () => {
    expect(page).toMatch(/mode === 'no_draft'/);
    expect(page).toMatch(/const actAvailable = offerable;/);
  });
});
