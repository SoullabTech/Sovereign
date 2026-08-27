import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_MODE,
  STUDIO_MODES,
  STUDIO_MODE_PARAM,
  modeById,
  realizedModes,
  resolveMode,
} from '../shell/studioModes';

/**
 * The five creative distances, and the rule that keeps the navigation honest.
 *
 * WS2-01. The reference (04-writing-field-wide.png) shows all five modes in the
 * top bar. Only WRITE is built. The danger in shipping that navigation is
 * obvious and worth pinning: a door that looks live and opens nothing teaches
 * the writer the product lies about itself.
 */
describe('the five creative distances', () => {
  it('is exactly the five the reference shows, in the reference order', () => {
    expect(STUDIO_MODES.map((m) => m.id)).toEqual([
      'write',
      'develop',
      'explore',
      'review',
      'publish',
    ]);
  });

  it('every mode says what it is for, so an unbuilt one is legible not mysterious', () => {
    for (const m of STUDIO_MODES) {
      expect(m.purpose.trim().length).toBeGreaterThan(0);
      expect(m.unit).toMatch(/^WS2-\d\d$/);
    }
  });

  it('WS2-01 realizes WRITE and nothing else', () => {
    expect(realizedModes().map((m) => m.id)).toEqual(['write']);
    expect(DEFAULT_MODE).toBe('write');
  });
});

describe('resolveMode — a mode that is not open is SAID, never swallowed', () => {
  it('opens a realized mode', () => {
    const r = resolveMode('write');
    expect(r.kind).toBe('open');
  });

  it('reports an unbuilt mode as not-yet, naming what was asked for', () => {
    const r = resolveMode('develop');
    expect(r.kind).toBe('not-yet');
    if (r.kind !== 'not-yet') throw new Error('unreachable');
    /* The requested mode is carried through, not discarded — the room shows
       the writer which distance they asked for and which they are in. Silently
       handing back `write` is the same defect class as D-010: substituting for
       a named thing rather than saying it cannot be opened. */
    expect(r.requested.id).toBe('develop');
    expect(r.fallback.id).toBe('write');
  });

  it('reports an unknown mode distinctly from an unbuilt one', () => {
    const r = resolveMode('nonsense');
    expect(r.kind).toBe('unknown');
    if (r.kind !== 'unknown') throw new Error('unreachable');
    expect(r.requested).toBe('nonsense');
  });

  it('an absent mode is not an error — it is the default distance', () => {
    expect(resolveMode(null).kind).toBe('open');
  });

  it('never returns a mode that is not realized, by any path', () => {
    for (const asked of [null, 'write', 'develop', 'explore', 'review', 'publish', 'junk']) {
      const r = resolveMode(asked);
      const landed = r.kind === 'open' ? r.mode : r.fallback;
      expect(landed.realized).toBe(true);
    }
  });

  it('realized can never be true for a mode with no field — checked against the shell', () => {
    /* The flag is only worth having if it cannot be set ahead of the build.
       WriteField.tsx is the only field that exists; if a second mode is marked
       realized, its field has to exist too. */
    const built = readFileSync(
      join(__dirname, '..', 'canvas', 'WriteField.tsx'),
      'utf8',
    );
    expect(built.length).toBeGreaterThan(0);
    expect(realizedModes()).toHaveLength(1);
  });
});

describe('the shell renders the model rather than restating it', () => {
  const shell = readFileSync(join(__dirname, '..', 'shell', 'StudioShell.tsx'), 'utf8');

  it('imports the modes instead of writing five labels into the JSX', () => {
    expect(shell).toMatch(/import\s*\{[^}]*\bSTUDIO_MODES\b[^}]*\}\s*from\s*'\.\/studioModes'/);
    /* The room being replaced had its three tabs as a string union and a
       ternary at the point of render. Adding a mode meant editing a ternary. */
    for (const label of ['Develop', 'Explore', 'Review', 'Publish']) {
      expect(shell).not.toContain(`>${label}<`);
    }
  });

  it('an unrealized mode is not a link', () => {
    /* It renders as a <span> with aria-disabled, carrying its purpose and unit
       in the title — visible, named, and plainly not a control. */
    expect(shell).toMatch(/if\s*\(!m\.realized\)/);
    expect(shell).toContain('aria-disabled="true"');
  });

  it('a rail entry with no destination is not a link either', () => {
    expect(shell).toMatch(/item\.href \?/);
  });
});

describe('the room reads the mode reactively', () => {
  const room = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
  const code = room.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('never freezes the mode in a useState initializer — D-009, third instance', () => {
    expect(code).not.toMatch(/useState\([^)]*searchParams/);
    expect(code).toContain(`searchParams?.get(STUDIO_MODE_PARAM)`);
  });

  it('moving between distances keeps the manuscript identity', () => {
    /* A mode link that dropped ?m= would lose which writing the writer is in —
       the exact failure WS2-01A exists to prevent, reintroduced by navigation. */
    expect(code).toContain('canvasForManuscript(CANVAS_HREF, manuscript.id)');
    expect(code).toContain('hrefForMode');
  });

  it('the parameter name is imported, never hand-written', () => {
    expect(room).toMatch(/import\s*\{[^}]*\bSTUDIO_MODE_PARAM\b/);
    expect(STUDIO_MODE_PARAM).toBe('mode');
    expect(modeById('write')?.realized).toBe(true);
  });
});
