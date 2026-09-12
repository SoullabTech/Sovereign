import * as fs from 'fs';
import * as path from 'path';

/**
 * ⛔ THE INTEGRATION MAY NOT REPAIR PRODUCT FINDING A.
 *
 * Finding A — clicking a far section in the rail highlights its row but does
 * not bring that section into view — lives at exactly the two call sites the
 * Field + Substrate integration is authorized to build a new room around.
 *
 *   REPLACE / RECOMPOSE   rail presentation, navigation placement
 *   DO NOT                solve the known navigation defect opportunistically
 *
 * Both can be true only if the integration CARRIES the navigation mechanism
 * unchanged, defect included, and changes only what surrounds it. A rewrite of
 * the jump — however well-intentioned — either silently repairs Finding A,
 * destroying the repair lane's subject, or silently re-breaks it somewhere new,
 * destroying the census's diagnosis. Either way both lanes become
 * unfalsifiable.
 *
 * ⭐ A regression is a defect PLUS the absence of a guard. Finding B was fixed
 * once and lost because nothing guarded it. This is the guard for the
 * constraint, not for the behaviour: it asserts the mechanism is still the one
 * the census diagnosed, so that when Finding A is re-censused on the integrated
 * subject, the thing being re-censused is the same thing.
 *
 * ⚠️ THIS TEST IS EXPECTED TO FAIL when the repair lane is finally authorized.
 * That is its purpose. It is not a claim that the current behaviour is correct
 * — it is a claim that changing it is a decision, taken deliberately, in a lane
 * that owns it. Delete or amend it in that lane, never in this one.
 *
 * ── ⭐ AMENDED 2026-09-12, BY THE LANE THAT OWNS IT ────────────────────────
 *
 * The guard fired exactly as designed, and the sentence above is the reason it
 * may be amended here: `b9f7a676b` (WRITERS_STUDIO_CANVAS_SCROLL_JUMP) is the
 * authorized repair lane, witnessed and recorded. This amendment is made under
 * that authority and nowhere else — ⛔ NOT by the Field + Focus recovery, which
 * is forbidden to touch the navigation mechanism and did not.
 *
 * ⭐ WHAT CHANGED IS THE SCOPE OF THE SCROLL, NOT THE NAVIGATION. `scrollIntoView`
 * scrolls EVERY scrollable ancestor including the document; `revealWithin`
 * scrolls the NEAREST one and returns without acting when nothing between the
 * node and the document scrolls. Same node, same `block`, same call site, same
 * destination reached.
 *
 * ⭐⭐ SO FINDING A IS STILL THE SUBJECT IT WAS. The guard's constraint — that
 * the integration CARRIES the navigation mechanism rather than opportunistically
 * repairing it — is intact: the mechanism was carried, and the only lane that
 * altered it is the one constituted to. The assertions below are RE-POINTED at
 * the call that supersedes, ⛔ never loosened: still exactly one call per file,
 * still the literal, so a future rewrite is caught the same way.
 */

const CANVAS = path.join(__dirname, '..', 'canvas');
const read = (f: string) => fs.readFileSync(path.join(CANVAS, f), 'utf8');

describe('the navigation mechanism the integration must not touch', () => {
  it('StructuredOutline reveals the active row with exactly one unscoped call', () => {
    const src = read('StructuredOutline.tsx');
    const calls = src.match(/revealWithin\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(src).toContain("revealWithin(el, 'center');");
    /* ⛔ And the superseded call may not come back alongside it. */
    expect(src).not.toMatch(/scrollIntoView/);
  });

  it('WholeManuscriptSurface reaches the destination with exactly one unscoped call', () => {
    const src = read('WholeManuscriptSurface.tsx');
    const calls = src.match(/revealWithin\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(src).toContain("revealWithin(node, 'start');");
    expect(src).not.toMatch(/scrollIntoView/);
  });

  /**
   * ⭐ The container geometry is part of the subject, not scenery.
   *
   * The Finding A census established that check 5 of the whole-manuscript
   * falsifier measures `|el.offsetTop - sc.scrollTop|` — where the destination
   * sits INSIDE this scroller, never where this scroller sits in the viewport.
   * Change the scroller and the census's open question ("is the page the real
   * scroller?") is answered by accident rather than by measurement.
   */
  it('the manuscript scroller box is unchanged', () => {
    const src = read('WholeManuscriptSurface.tsx');
    expect(src).toContain(
      "style={{ position: 'relative', height: '100%', overflowY: 'auto' }}",
    );
    expect(src).toContain('data-whole-manuscript');
  });

  /**
   * The room may not grow its own second way to move the writer. If navigation
   * is ever wanted in the Field room, it goes through the substrate's `jumpTo`
   * seam — the one the outline already uses — so there stays exactly one
   * mechanism to diagnose.
   */
  it('the Field room introduces no navigation mechanism of its own', () => {
    const dir = path.join(__dirname, '..', 'field');
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.ts') && !f.endsWith('.tsx')) continue;
      const src = fs.readFileSync(path.join(dir, f), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');
      expect(src).not.toContain('scrollIntoView');
      expect(src).not.toContain('scrollTo(');
      expect(src).not.toContain('scrollTop =');
    }
  });
});

/**
 * ⭐ THE PRESENTATION SEAM CONFERS NO AUTHORITY.
 *
 * A narrow seam into the preserved surface was authorized so a room may draw a
 * read-only mark over the writer's held focus. These assertions are the limits
 * it was authorized under. A seam that could be typed into, saved from, or
 * navigated by would be a second manuscript wearing a mark's clothes.
 */
describe('the focus presentation seam', () => {
  const surface = read('WholeManuscriptSurface.tsx');
  const overlay = fs.readFileSync(
    path.join(__dirname, '..', 'field', 'FocusOverlay.tsx'), 'utf8',
  );
  const bare = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

  it('the textarea remains the sole editable manuscript control', () => {
    expect((bare(surface).match(/<textarea/g) ?? [])).toHaveLength(1);
    expect(bare(surface)).not.toContain('contentEditable');
    expect(bare(overlay)).not.toContain('contentEditable');
    expect(bare(overlay)).not.toContain('<textarea');
    expect(bare(overlay)).not.toContain('<input');
  });

  it('the overlay is inert: no handlers, no focus, no pointer', () => {
    const src = bare(overlay);
    expect(src).toContain("aria-hidden=\"true\"");
    expect(src).toContain("pointerEvents: 'none'");
    expect(src).not.toMatch(/\son[A-Z]\w+=/);
    expect(src).not.toContain('tabIndex');
    expect(src).not.toContain('useState');
    expect(src).not.toContain('useEffect');
  });

  /** Derived from the current body, never a copy it keeps. */
  it('the overlay stores nothing and owns no capture', () => {
    const src = bare(overlay);
    expect(src).not.toContain('captureForUnmount');
    expect(src).not.toContain('editSection');
    expect(src).not.toContain('useRef');
    expect(src).toContain('body: string');
  });

  /** It moves nobody. Finding A's mechanism stays the only way to travel. */
  it('the overlay navigates nothing', () => {
    const src = bare(overlay);
    expect(src).not.toContain('scrollIntoView');
    expect(src).not.toContain('scrollTo');
  });

  /**
   * ⛔ AN UNUSED SEAM CHANGES NOTHING. Without a room that draws, the surface
   * renders exactly as it did — same wrapper, same editor metrics. The
   * canonical room passes no renderer, so this is the assertion that keeps its
   * appearance byte-for-byte what it was.
   */
  it('is inert when no room draws through it', () => {
    const src = bare(surface);
    expect(src).toContain("renderSectionOverlay ? { position: 'relative' } : undefined");
    expect(src).toContain('...(renderSectionOverlay ? { padding: 0, margin: 0 } : null)');
  });

  /** The seam is presentation. It may not be handed anything that writes. */
  it('is given a section id and a body, and nothing that writes', () => {
    expect(surface).toContain(
      'renderSectionOverlay?: (sectionId: string, body: string) => React.ReactNode;',
    );
  });
});

