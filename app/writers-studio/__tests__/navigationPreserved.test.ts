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
 */

const CANVAS = path.join(__dirname, '..', 'canvas');
const read = (f: string) => fs.readFileSync(path.join(CANVAS, f), 'utf8');

describe('the navigation mechanism the integration must not touch', () => {
  it('StructuredOutline reveals the active row with exactly one unscoped call', () => {
    const src = read('StructuredOutline.tsx');
    const calls = src.match(/scrollIntoView/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(src).toContain("el.scrollIntoView({ block: 'center' });");
  });

  it('WholeManuscriptSurface reaches the destination with exactly one unscoped call', () => {
    const src = read('WholeManuscriptSurface.tsx');
    const calls = src.match(/scrollIntoView/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(src).toContain("node.scrollIntoView({ block: 'start' });");
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
