/**
 * WRITERS-STUDIO-CANVAS-PRESENCE-01 question C — the material obligations.
 *
 * ⭐ Choose the room. Choose the page.
 *
 * Two of these are pure-function tests of the migration; the rest are source
 * assertions, because what they forbid is decidable statically and the
 * dangerous states are about WHICH FILE holds what, not about a rendered
 * pixel. Comments are stripped before scanning: these files document the bans
 * they honour, and an instrument that reads prose will otherwise fail a file
 * precisely because that file explains its own compliance.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CANVAS_MATERIALS,
  CANVAS_MATERIAL_KEY,
  CANVAS_TYPE,
  DEFAULT_MATERIAL,
  MATERIAL_ORDER,
  resolveMaterial,
} from '@/lib/writersStudio/canvasMaterial';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const WORKTABLE = 'canvas/Worktable.tsx';
const SECTIONED = 'canvas/SectionWritingSurface.tsx';
const CONTROL = 'canvas/CanvasAppearance.tsx';
const MODULE = join(root, '..', '..', 'lib/writersStudio/canvasMaterial.ts');

describe('C1 — material belongs to the writer, never to the Work', () => {
  it('the stored key names no manuscript', () => {
    expect(CANVAS_MATERIAL_KEY).not.toMatch(/\$\{|manuscript/i);
    expect(CANVAS_MATERIAL_KEY).toBe('writers_studio:canvas_material');
  });

  it('an existing Canvas-level preference wins outright', () => {
    expect(
      resolveMaterial({ canvas: 'ivory', legacyWork: 'white', legacyGlobal: 'midnight' }),
    ).toEqual({ material: 'ivory', seededFromLegacy: false });
  });

  it("the current Work's legacy value seeds the Canvas preference once", () => {
    expect(
      resolveMaterial({ canvas: null, legacyWork: 'white', legacyGlobal: 'midnight' }),
    ).toEqual({ material: 'white', seededFromLegacy: true });
  });

  it('falls through legacy global, then to the default', () => {
    expect(resolveMaterial({ canvas: null, legacyWork: null, legacyGlobal: 'midnight' }))
      .toEqual({ material: 'midnight', seededFromLegacy: true });
    expect(resolveMaterial({ canvas: null, legacyWork: null, legacyGlobal: null }))
      .toEqual({ material: DEFAULT_MATERIAL, seededFromLegacy: false });
  });

  it('refuses a stored value that is not a material', () => {
    expect(resolveMaterial({ canvas: 'parchment', legacyWork: '', legacyGlobal: 'null' }))
      .toEqual({ material: DEFAULT_MATERIAL, seededFromLegacy: false });
  });

  it('never writes a key derived from a manuscript id', () => {
    const src = readFileSync(MODULE, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const writes = src.match(/localStorage\.setItem\(([^,]+),/g) ?? [];
    expect(writes.length).toBeGreaterThan(0);
    for (const w of writes) expect(w).toContain('CANVAS_MATERIAL_KEY');
  });
});

describe('C2 — one control, reachable from BOTH writing surfaces', () => {
  it('the continuous surface mounts it', () => {
    expect(code(WORKTABLE)).toContain('<CanvasAppearance');
  });

  it('the section-addressable surface mounts it — the surface a long book renders as', () => {
    expect(code(SECTIONED)).toContain('<CanvasAppearance');
  });

  it('both read the same stored preference through the same hook', () => {
    for (const f of [WORKTABLE, SECTIONED]) {
      expect(code(f)).toContain('useCanvasMaterial(manuscriptId)');
    }
  });

  it('there is exactly ONE materials table in the repo', () => {
    for (const f of [WORKTABLE, SECTIONED, CONTROL, 'canvas/WritingSurface.tsx']) {
      expect(code(f)).not.toMatch(/Ivory Paper|White Paper|Midnight'/);
      expect(code(f)).toContain("from '@/lib/writersStudio/canvasMaterial'");
    }
  });
});

describe('the page is not the room', () => {
  it('the sectioned surface paints no Studio ground token onto the page', () => {
    expect(code(SECTIONED)).not.toContain('GROUND.');
  });

  it('the control reaches no shell surface', () => {
    const src = code(CONTROL);
    expect(src).not.toMatch(/GROUND\.|StudioShell|Rail|dock/i);
  });

  it('appearance never reaches the work', () => {
    const src = code(CONTROL);
    expect(src).not.toMatch(/apiFetch|\bfetch\(|checkpointServerDraft|putDraft/);
    expect(src).not.toMatch(/localStorage/);
  });
});

describe('few choices, derived behaviour', () => {
  it('offers four materials and no fifth axis', () => {
    expect(MATERIAL_ORDER).toHaveLength(4);
    expect([...MATERIAL_ORDER].sort()).toEqual(Object.keys(CANVAS_MATERIALS).sort());
  });

  it('type answers the viewport rather than the member', () => {
    expect(CANVAS_TYPE.size).toMatch(/^clamp\(/);
    for (const f of [WORKTABLE, SECTIONED]) {
      const src = code(f);
      expect(src).toContain('CANVAS_TYPE.size');
      expect(src).not.toMatch(/text-\[17px\]|fontSize: '?\d+px/);
    }
  });

  it('no member-facing size control was smuggled in', () => {
    expect(code(CONTROL)).not.toMatch(/fontSize|larger|smaller|text size/i);
  });
});
