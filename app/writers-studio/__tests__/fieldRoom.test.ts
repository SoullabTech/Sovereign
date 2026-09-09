import * as fs from 'fs';
import * as path from 'path';
import { TYPE } from '../studioTheme';

const FIELD = path.join(__dirname, '..', 'field');
const files = () =>
  fs.readdirSync(FIELD).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
const raw = (f: string) => fs.readFileSync(path.join(FIELD, f), 'utf8');
/** Prose explains the rules and therefore quotes the banned words. Assertions
 *  about what the CODE does must read the code, not the rationale beside it. */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

describe('the Field room', () => {
  /**
   * ⭐ THE TRAP THIS CAUGHT ON ITS FIRST RUN. `TYPE` is a
   * `Record<string, TypeRole>`, so `role="workTitle"` typechecks perfectly and
   * then reads `.family` off `undefined` at render. The type system cannot see
   * it; this can.
   */
  it('every named type role actually exists', () => {
    for (const f of files()) {
      const roles = [...raw(f).matchAll(/role="([A-Za-z]+)"/g)].map((m) => m[1]);
      for (const r of roles) {
        expect(Object.keys(TYPE)).toContain(r);
      }
    }
  });

  /**
   * ⭐ Every orbit is fixed. This is what makes the centre of gravity provably
   * unchanged: nothing an orbit does can reach the Work's layout.
   */
  it('draws its orbits fixed, never as columns in a row', () => {
    const src = strip(raw('FieldRoom.tsx'));
    expect(src).toContain('structureBox()');
    expect(src).toContain('maiaBox()');
    /* The canonical room is a flex row of panels that push the writing field.
       That is precisely the law this room replaces, so it may not reappear. */
    expect(src).not.toContain("flexDirection: 'row'");
  });

  /** Arrival is the quiet room: nothing open, nothing restored. */
  it('arrives with every orbit closed and reads nothing from storage', () => {
    const src = strip(raw('FieldRoom.tsx'));
    expect(src).toContain('useState<OrbitState>(CLOSED)');
    expect(src).not.toContain('localStorage');
    expect(src).not.toContain('sessionStorage');
  });

  /** No counts, no badges, no indicators anywhere in the room. */
  it('the rail says "I am here", never "use me"', () => {
    const src = strip(raw('FieldRoom.tsx'));
    expect(src).not.toMatch(/badge/i);
    expect(src).not.toMatch(/\bcount\b/i);
    expect(src).not.toMatch(/unread/i);
  });

  /**
   * ⛔ THE FIXTURE RESPONDER DOES NOT COME ACROSS. The prototype answered from
   * a canned table of four observations. The room may hold no cognition of its
   * own, canned or otherwise — the Ask MAIA gesture reaches the existing Canvas
   * conversation path, and improving that path is a different lane.
   */
  it('carries no cognition of its own', () => {
    for (const f of files()) {
      const src = strip(raw(f));
      expect(src).not.toContain('respond(');
      expect(src).not.toContain('provisional(');
      expect(src).not.toMatch(/\bfetch\(/);
      expect(src).not.toContain('apiFetch');
    }
  });

  /** The prototype's ten-section corpus is real book text and stays out of git. */
  it('carries no manuscript corpus', () => {
    for (const f of files()) {
      const src = raw(f);
      expect(src).not.toContain('SECS');
      expect(src).not.toMatch(/Elemental Alchemy/);
    }
  });

  /**
   * The thread is subordinate to the Focus: it lives in MAIA's orbit and never
   * touches the Work. The room must not paint a second accent-coloured mark
   * into the prose alongside the Focus.
   */
  it('gives the Work exactly one accent-carrying mark', () => {
    const src = strip(raw('FieldRoom.tsx'));
    const focusVars = [...src.matchAll(/--field-focus-color/g)];
    expect(focusVars.length).toBeGreaterThan(0);
    expect(src).not.toContain('--field-thread-color');
  });
});
