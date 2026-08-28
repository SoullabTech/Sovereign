/**
 * UX-02 — continuity acceptance.
 *
 * The founder's standard for this lane is not cosmetic: walk the five states in
 * order and ask whether each screen appears to REMEMBER the screen before it.
 * These assert the structural facts that make that possible, so the split
 * cannot quietly return with the next colour tweak.
 *
 * Findings under test:
 *   NOW-WHAT-DESIGN-SYSTEM-SPLIT-01  two design languages in one walk
 *   NOW-WHAT-GESTURE-HIERARCHY-01    five equal doors, no primary gesture
 *   NOW-WHAT-KEEP-CONTINUITY-01      keep succeeds, arrival not perceptible
 */

import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ARRIVE = 'app/now-what/arrive/page.tsx';
const ROOM_PAGE = 'app/now-what/room/page.tsx';
const ROOM = 'components/now-what/NowWhatRoom.tsx';
const HOME = 'components/now-what/ClientHome.tsx';
const PAPER = 'components/now-what/PaperRoom.tsx';

describe('SPLIT-01 — one material language across the walk', () => {
  it.each([ARRIVE, ROOM_PAGE])('%s renders inside the shared surface', (f) => {
    expect(read(f)).toContain('NowWhatSurface');
  });

  it.each([ARRIVE, ROOM_PAGE])('%s no longer declares its own ground', (f) => {
    expect(strip(read(f))).not.toContain('bg-[#1f1b16]');
  });

  it('the surface maps the cool ramp onto the warm tokens by role', () => {
    const src = read('components/now-what/NowWhatSurface.tsx');
    for (const role of ['--nw-ink', '--nw-ink-soft', '--nw-ink-faint', '--nw-rule']) {
      expect(src).toContain(role);
    }
    // Semantic mapping, not hex copying into a third palette.
    expect(src).toContain('NW_PALETTE_CSS');
    expect(src).not.toMatch(/#e9e2d4|#b6ac9a|#857c6c/);
  });

  it('there is ONE serif authority — no component re-declares a face', () => {
    expect(read(PAPER)).toContain('export const SERIF');
    const room = read(ROOM);
    expect(room).toContain("from '@/components/now-what/PaperRoom'");
    expect(strip(room)).not.toContain("ui-serif, 'New York'");
  });

  it('Home reads at the same measure as the rooms', () => {
    expect(read(HOME)).toContain('max-width: 46rem');
    expect(read(PAPER)).toContain('max-width: 46rem');
  });
});

describe('GESTURE-HIERARCHY-01 — one primary gesture, doors as sentences', () => {
  const home = read(HOME);

  it('the card grid is gone', () => {
    expect(strip(home)).not.toContain('grid-template-columns: repeat(3, 1fr)');
  });

  it('doors are stacked, never side by side', () => {
    expect(home).toContain('.nwh-doors { margin-top: 40px; display: flex; flex-direction: column; }');
  });

  it('doors no longer render as boxes with hover lift', () => {
    // Scope to the door rules only — the trust strip below legitimately keeps
    // its own radius and is not part of this correction.
    const css = home.slice(home.indexOf('.nwh-door {'), home.indexOf('.nwh-quote {'));
    expect(css).not.toContain('border-radius: 16px');
    expect(css).not.toContain('translateY(-2px)');
  });

  it('the primary DERIVES from the carried thread, not hard-coded prominence', () => {
    // The whole point of the founder's constraint: 02 and 05 cohere through
    // continuity. The primary block is conditional on the member's own carried
    // material — `anchor` since NW-V1-CLIENT-01, which renamed `livingQuestion`
    // when the Home stopped selecting two acts independently and started
    // selecting one. Same property, tracked through the rename, and tightened:
    // there is exactly ONE such conditional, so a second hard-coded hero
    // cannot appear beside it.
    expect(home).toMatch(/anchor \?[\s\S]{0,400}nwh-primary/);
    expect((home.match(/\{anchor \?/g) ?? []).length).toBe(1);
    expect(home).toContain('Continue thinking');
  });

  it('when nothing is carried, no hero is manufactured — The Room takes the primary', () => {
    expect(home).toContain('Nothing is waiting for you yet');
    expect(home).toContain('Think something through');
  });

  it('all five rooms remain reachable either way', () => {
    for (const route of ['/now-what/questions', '/now-what/work', '/now-what/coaching', '/now-what/field']) {
      expect(home).toContain(route);
    }
    expect(home).toContain('roomHref');
  });

  it('provenance is a plain fact about her own act, not a system judgement', () => {
    expect(home).toContain('You kept this');
    expect(home).toContain('keptWhen(');
    // No inference vocabulary on this surface.
    expect(strip(home)).not.toMatch(/seems|likely|we noticed|you should|recommended/i);
  });
});

describe('KEEP-CONTINUITY-01 — the keep arrives somewhere she can name', () => {
  const room = read(ROOM);

  it('the confirmation shows her words, not a count', () => {
    expect(room).toContain("It&apos;s in {keptRoomName(t.kind)}.");
    expect(strip(room)).not.toContain('carried into your field.');
  });

  it('the exit link names the room and routes by what she kept', () => {
    expect(room).toContain('Go to {keptRoomName(');
    expect(room).toContain('keptRoomHref(authored)');
    expect(strip(room)).not.toContain('See your field');
  });

  it('destination names match the doors Home actually shows', () => {
    const home = read(HOME);
    for (const name of ['My Question', 'My Work', 'My Story']) {
      expect(room).toContain(name);
      expect(home).toContain(name);
    }
  });

  it('"Living Field" is gone from member-facing copy', () => {
    expect(strip(room)).not.toContain('Living Field');
  });

  it('routing kinds map to real routes, and nothing new was invented', () => {
    for (const route of ['/now-what/questions', '/now-what/work', '/now-what/field']) {
      expect(room).toContain(route);
    }
  });

  it('carrying the kind adds no persistence — it is local UI state only', () => {
    expect(room).toMatch(/kind\?: ThreadKind;/);
    expect(room).toContain('adds no persistence and changes no payload');
  });
});
