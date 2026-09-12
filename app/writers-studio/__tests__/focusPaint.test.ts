import { TREATMENTS, TREATMENT_KEYS, resolve } from '../field/fieldTreatments';
import { bearingProperty, focusPaint } from '../field/focusPaint';

/**
 * ⭐ THE RENDERER-CONFORMANCE GUARD.
 *
 * The collision falsifier compares DECLARATIONS. This compares what the writer
 * would actually see. Without it, the study can pass its own specification
 * while showing one treatment three times — which is exactly what the room did
 * before this module existed.
 */
describe('the rendered focus implements its declared form', () => {
  it.each(TREATMENT_KEYS)('treatment %s paints the form it declares', (k) => {
    const mark = resolve(TREATMENTS[k], 'focus');
    const style = focusPaint(mark);
    expect(style).not.toBeNull();
    const bearing = bearingProperty(mark.form)!;
    expect(Object.keys(style!)).toContain(bearing);
    expect(String(style![bearing])).toContain(mark.color);
  });

  /**
   * A and C declare a frame, B declares an inset. If the paint did not
   * distinguish them, this is the assertion that fails — and it fails on the
   * thing the writer sees, not on the tokens.
   */
  it('a frame and an inset are not the same picture', () => {
    const a = focusPaint(resolve(TREATMENTS.A, 'focus'))!;
    const b = focusPaint(resolve(TREATMENTS.B, 'focus'))!;
    expect(a).not.toEqual(b);
    expect(a.boxShadow).toBeDefined();
    expect(a.borderLeft).toBeUndefined();
    expect(b.borderLeft).toBeDefined();
    expect(b.boxShadow).toBeUndefined();
  });

  it('every declared focus form is one the renderer knows', () => {
    for (const k of TREATMENT_KEYS) {
      const form = TREATMENTS[k].marks.focus.form;
      expect(bearingProperty(form)).not.toBeNull();
    }
  });

  /**
   * ⛔ NO SILENT FALLBACK. A form the renderer does not know paints nothing
   * rather than borrowing another treatment's look, because a fallback is how
   * three treatments quietly become one.
   */
  it('an unknown form paints nothing rather than something else', () => {
    expect(focusPaint({ color: '#fff', weight: 1, form: 'row', placement: 'work' })).toBeNull();
    expect(focusPaint({ color: '#fff', weight: 1, form: 'edge', placement: 'work' })).toBeNull();
  });

  /** A wrapped run must keep its edges on every line, not only the first. */
  it('clones the decoration across line fragments', () => {
    for (const k of TREATMENT_KEYS) {
      const style = focusPaint(resolve(TREATMENTS[k], 'focus'))!;
      expect(style.boxDecorationBreak).toBe('clone');
    }
  });
});
