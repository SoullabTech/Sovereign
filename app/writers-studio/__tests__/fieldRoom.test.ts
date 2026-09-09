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

describe('the study is opt-in and inert by default', () => {
  const page = fs.readFileSync(
    path.join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8',
  );

  /**
   * ⛔ ABSENT MEANS ABSENT. With no `?field=` parameter — which is every member,
   * every session, today — the canvas returns exactly the shell it always
   * returned. A study that changed the room for people who did not ask to be in
   * it would be a deployment wearing a study's clothes.
   */
  it('the Field room is reached only by an explicit route parameter', () => {
    expect(page).toContain("parseTreatment(searchParams?.get('field') ?? null)");
    expect(page).toContain('if (fieldTreatment) {');
    /* The canonical shell is still the fall-through, not a branch of the room. */
    expect(page).toContain('<WriterStudioShell');
  });

  /**
   * The room receives what this page already resolved. If it ever called
   * `useSectionWriting` itself it would be a second implementation of the
   * engine, which is the one thing the integration was told not to build.
   */
  it('the room re-derives no part of the engine', () => {
    for (const f of files()) {
      expect(strip(raw(f))).not.toContain('useSectionWriting');
    }
  });
});

describe('the held focus increment, at its boundaries', () => {
  /**
   * ⛔ FRAMING IS NOT ASKING. Nothing may be sent, and no conversation opened,
   * because the writer selected text. The gesture is the writer's.
   */
  it('sends nothing and opens nothing on its own', () => {
    for (const f of files()) {
      const src = strip(raw(f));
      expect(src).not.toMatch(/method:\s*'POST'/);
      expect(src).not.toContain('/api/');
    }
    /* The strip receives the act; it does not perform it. */
    expect(strip(raw('FocusStrip.tsx'))).toContain('onAsk: () => void');
  });

  /** No new persistence and no new memory destination. */
  it('persists nothing', () => {
    for (const f of files()) {
      const src = strip(raw(f));
      expect(src).not.toContain('localStorage');
      expect(src).not.toContain('sessionStorage');
      expect(src).not.toContain('indexedDB');
    }
  });

  /**
   * ⛔ THE FOCUS IS RELEASED, NEVER RELOCATED. A model that searched for its
   * captured text would find it most confidently in exactly the case where the
   * writer had just changed their mind on the page.
   */
  it('never searches for the captured text somewhere else', () => {
    const src = strip(raw('heldFocus.ts'));
    expect(src).not.toContain('indexOf(focus.capturedText');
    expect(src).not.toContain('.includes(focus.capturedText');
    expect(src).not.toMatch(/similar/i);
    /* Validity is a comparison, and it is the only question asked. */
    expect(src).toContain('return textOf(focus, bodyOf) === focus.capturedText;');
  });

  /**
   * The ladder is structural. A rung that asked what a passage was ABOUT would
   * make the aperture MAIA's opinion rather than the writer's act.
   */
  it('widens on paragraph breaks and section boundaries only', () => {
    const src = strip(raw('heldFocus.ts'));
    expect(src).toContain('lastIndexOf(JOIN');
    expect(src).not.toMatch(/embedding|semantic|classif/i);
  });

  /**
   * ⚠️ RECORDED, NOT HIDDEN. The mark on the Work is section-level because the
   * substrate renders each editable section as a <textarea>, whose value no
   * highlight API can address. The focus MODEL is character-exact; only the
   * paint is coarse, and making it exact needs an overlay seam in a preserved
   * component — a separate decision.
   */
  it('says plainly that the paint is section-level', () => {
    const src = raw('FieldRoom.tsx');
    expect(src).toContain('SECTION-LEVEL PAINT, AND SAID SO');
    expect(strip(src)).toContain('focusedSectionIds');
  });

  /** The room does not claim the conversation it opens is CanonicalTurn. */
  it('claims nothing about the cognition path it reaches', () => {
    for (const f of files()) {
      expect(strip(raw(f))).not.toContain('CanonicalTurn');
    }
  });
});

