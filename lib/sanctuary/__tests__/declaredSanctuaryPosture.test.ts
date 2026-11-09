/** @jest-environment node */
import { declaredSanctuaryPosture } from '../currentClientPosture';

/** Founder ruling 2026-11-09: no saved settings ⇒ ordinary (canon default); unreadable ⇒ undeclared, and the server keeps nothing. */
const store = (v: string | null | (() => never)) => ({ getItem: () => (typeof v === 'function' ? v() : v) });

describe('what a request declares about Sanctuary', () => {
  it('the saved posture, when it can be read', () => {
    expect(declaredSanctuaryPosture(store(JSON.stringify({ sanctuary: true })))).toEqual({ sanctuary: true });
    expect(declaredSanctuaryPosture(store(JSON.stringify({ sanctuary: false })))).toEqual({ sanctuary: false });
  });
  it('ordinary when no settings have ever been saved', () => {
    expect(declaredSanctuaryPosture(store(null))).toEqual({ sanctuary: false });
  });
  it('nothing when a posture exists but cannot be read, or storage is unavailable', () => {
    expect(declaredSanctuaryPosture(store('{not json'))).toEqual({});
    expect(declaredSanctuaryPosture(store(JSON.stringify({ sanctuary: 'yes' })))).toEqual({});
    expect(declaredSanctuaryPosture(store(() => { throw new Error('blocked'); }))).toEqual({});
    expect(declaredSanctuaryPosture(null)).toEqual({});
  });
});
