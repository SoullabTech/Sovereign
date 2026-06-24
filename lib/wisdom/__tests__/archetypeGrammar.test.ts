/**
 * Archetype grammar socket — proves the renderer renders the SHAPE and that the
 * injectability gate is `function` (the mode of attention), not content. The socket
 * carries no doctrine; these tests use throwaway fixtures, never authored values.
 */
import {
  renderArchetypeStandingSource,
  isInjectable,
  PROPHET,
  type Archetype,
} from '../archetypeGrammar';

describe('archetype grammar socket (content-free seam for Phase 2)', () => {
  test('unauthored Prophet placeholder injects nothing — no function, no body', () => {
    // The safety property: an unauthored socket is not injectable and renders to just
    // its header. Doctrine has somewhere to land, but supplies nothing until authored.
    expect(isInjectable(PROPHET)).toBe(false);
    expect(renderArchetypeStandingSource(PROPHET)).toBe('🧭 ARCHETYPAL STANDING SOURCE — Prophet');
  });

  test('renders the shape — function first, empty fields omitted', () => {
    const a: Archetype = { name: 'Test', function: 'attends to X', gift: 'G', distortion: 'D', practice: 'P' };
    expect(renderArchetypeStandingSource(a).split('\n')).toEqual([
      '🧭 ARCHETYPAL STANDING SOURCE — Test',
      'Function: attends to X',
      'Gift: G',
      'Distortion Watch: D',
      'Practice: P',
    ]);
    expect(isInjectable(a)).toBe(true);
  });

  test('the injectability gate is `function`, not content (the Vedic lesson)', () => {
    // Content-rich but no function → nothing to attend WITH → not injectable.
    const contentOnly: Archetype = { name: 'Content-only', gift: 'illumination', practice: 'ritual' };
    expect(isInjectable(contentOnly)).toBe(false);
    // Function alone → injectable (a mode of attention is the real payload).
    expect(isInjectable({ name: 'X', function: 'consecrates attention' })).toBe(true);
    // Whitespace-only function does not count.
    expect(isInjectable({ name: 'X', function: '   ' })).toBe(false);
  });

  test('held-by renders in its semantic place — right after the distortion it checks', () => {
    const out = renderArchetypeStandingSource({
      name: 'P', function: 'f', distortion: 'd', heldBy: 'Steward / Earth',
    });
    expect(out).toContain('Distortion Watch: d\nHeld by: Steward / Earth');
  });
});
