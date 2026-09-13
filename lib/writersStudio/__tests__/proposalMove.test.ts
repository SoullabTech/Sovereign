/**
 * EW-F1 / F1-1 · the writer is moved to the evidence, in the view they are in.
 *
 * THE DEFECT THIS PINS. The proposal jump was written against the Whole
 * manuscript scroller alone. In Section view — the default, and the view the
 * founder was in — that command reaches a surface that is not on screen: the
 * panel named Section 23 while the Work showed section 0, the copyright page.
 * A writer asked to authorize a change to a passage they cannot see is the
 * exact condition EW-F1 was opened to repair.
 *
 * ⛔ NOTHING HERE READS SOURCE. The rule is a value; these assert the value.
 */
import { proposalMove } from '../placeInWork';

describe('proposalMove — the move a proposal asks for', () => {
  it('opens the section in Section view, where jumping does nothing', () => {
    expect(proposalMove('section', 'sec-23', true)).toEqual({ kind: 'open', sectionId: 'sec-23' });
  });

  it('scrolls in Whole view, where opening would be a real editor switch', () => {
    expect(proposalMove('whole', 'sec-23', true)).toEqual({ kind: 'scroll', sectionId: 'sec-23' });
  });

  it('waits in Section view until the editor exists', () => {
    expect(proposalMove('section', 'sec-23', false)).toEqual({ kind: 'wait' });
  });

  it('scrolls in Whole view whether or not the section editor exists', () => {
    expect(proposalMove('whole', 'sec-23', false)).toEqual({ kind: 'scroll', sectionId: 'sec-23' });
  });

  it('waits when no view is known yet rather than guessing one', () => {
    expect(proposalMove(null, 'sec-23', false)).toEqual({ kind: 'wait' });
  });

  it('never moves without a target — a proposal with no place is not a place', () => {
    for (const v of ['section', 'whole', null] as const) {
      expect(proposalMove(v, null, true)).toEqual({ kind: 'wait' });
    }
  });

  /**
   * ⭐ THE ONCE-GUARD OBLIGATION, STATED WHERE IT CAN BE CHECKED.
   *
   * The caller spends its guard on a move that HAPPENED. `wait` must therefore
   * be distinguishable from a performed move by its kind alone — an
   * implementation that returned `open` with a null editor would look like
   * arrival, burn the guard, and strand the writer with no later retry. That
   * is the second half of the runtime defect, and it is this assertion.
   */
  it('a move that cannot be performed is never reported as one', () => {
    const notYet = proposalMove('section', 'sec-23', false);
    expect(notYet.kind).toBe('wait');
    expect(notYet).not.toHaveProperty('sectionId');
  });
});
