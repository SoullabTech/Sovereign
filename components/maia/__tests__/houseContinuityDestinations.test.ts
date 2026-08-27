/**
 * House continuity — where Continue and Kept actually go.
 *
 * MLX-06 Unit 5 opened this file to stop the continuity block inventing deep
 * links. Unit 7A widens it, because the block broke a second contract the first
 * version did not think to check.
 *
 * WHAT WENT WRONG. The continuity block is the one part of the House built from
 * the member's own material rather than from the destination registry, so it is
 * the one part that can offer a door the platform does not have. It did: Kept
 * was wired to `router.push('/maia/keep-capture')` directly. Keeps is
 * `nativeReady: false`, so on the native build `classifyReachability` returns
 * 'hidden' and the House correctly withholds Keeps from My Contribution — while
 * the Kept block, bypassing all of that, would still have offered it. The route
 * is in neither the runtime mobile allowlist nor the Capacitor bundle
 * (MOBILE_MAIA_KEEP is empty), so a member on an iPhone would have tapped a row
 * in the House and landed nowhere.
 *
 * The Unit 5 guard passed throughout. It asked whether the path was REGISTERED.
 * Registered is not reachable.
 *
 * WHAT THIS PROVES NOW: for each platform, what the real dispatcher does with
 * the real registry entry behind each continuity row — and, at the source, that
 * no row can go back to pushing a path of its own.
 *
 * WHAT IT DOES NOT PROVE: nothing about production, and nothing about the
 * Capacitor shell — 'native' here is the dispatcher's own flag, not a device.
 * Physical-device evidence belongs to Unit 7.
 */
import { readFileSync } from 'fs';
import path from 'path';
import {
  HOUSE_DESTINATIONS,
  classifyReachability,
  dispatchHouseDestination,
  WEB_BRIDGE_ROUTE,
  type HouseDestination,
  type HouseSheetId,
} from '@/lib/navigation/houseDestinations';

const REPO = path.resolve(__dirname, '../../..');
const SHEET = 'components/maia/MaiaHouseSheet.tsx';

/** Comments describe intent; code is what ships. */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const src = strip(readFileSync(path.join(REPO, SHEET), 'utf8'));

/** The continuity block only — every other row already comes from the registry. */
function continuityBlock(): string {
  const start = src.indexOf('continuity && (');
  const end = src.indexOf('Your Center');
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return src.slice(start, end);
}

/**
 * The rows the continuity block offers, and the registry id each resolves to.
 *
 * Held as a list because the block is authored, not generated. The source
 * guards below are what stop a NEW row appearing that this list does not know
 * about: a row may only dispatch via `go(...)`, and nothing in the block may
 * push a path.
 */
const CONTINUITY_ROWS = [
  { row: 'Continue', id: 'maia', gate: 'showContinue' },
  { row: 'Kept', id: 'keeps', gate: 'showKept' },
] as const;

function find(id: string): HouseDestination {
  const d = HOUSE_DESTINATIONS.find((x) => x.id === id);
  if (!d) throw new Error(`no destination ${id}`);
  return d;
}

function harness(isNative: boolean) {
  const pushed: string[] = [];
  const sheets: HouseSheetId[] = [];
  let closed = 0;
  return {
    pushed,
    sheets,
    get closed() { return closed; },
    ctx: {
      isNative,
      push: (p: string) => pushed.push(p),
      openSheet: (s: HouseSheetId) => sheets.push(s),
      onClose: () => { closed += 1; },
    },
  };
}

/** Each `onClick={…}` expression, brace-matched — handlers vary in shape. */
function onClickHandlers(block: string): string[] {
  const out: string[] = [];
  const re = /onClick=\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    let depth = 0;
    let i = m.index + m[0].length - 1;
    for (; i < block.length; i++) {
      if (block[i] === '{') depth += 1;
      else if (block[i] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    out.push(block.slice(m.index + m[0].length, i));
  }
  return out;
}

describe('every continuity row resolves to a real House destination', () => {
  for (const { row, id } of CONTINUITY_ROWS) {
    it(`${row} → ${id} is in the registry`, () => {
      expect(find(id).kind).toBe('route');
      expect(typeof find(id).route).toBe('string');
    });
  }
});

describe('what the dispatcher actually does, per platform', () => {
  it('Continue re-enters the conversation surface on both platforms', () => {
    for (const isNative of [true, false]) {
      const h = harness(isNative);
      dispatchHouseDestination(find('maia'), h.ctx);
      expect(h.pushed).toEqual(['/maia']);
      expect(h.pushed[0]).not.toContain(WEB_BRIDGE_ROUTE);
      expect(h.closed).toBe(1); // the House closes behind the member
    }
  });

  it('Kept opens the Keeps room on web', () => {
    const h = harness(false);
    dispatchHouseDestination(find('keeps'), h.ctx);
    expect(h.pushed).toEqual(['/maia/keep-capture']);
  });

  it('Keeps is hidden on native, so the row must not be offered there', () => {
    // Not an assertion that Keeps SHOULD be hidden — that is the registry's
    // call, and this reads it. It is an assertion that the block honours it.
    expect(classifyReachability(find('keeps'), true)).toBe('hidden');
    expect(find('keeps').nativeReady).toBe(false);
  });
});

describe('the block withholds what the platform withholds', () => {
  const block = () => continuityBlock();

  it('gates each row on a reachability-derived flag', () => {
    for (const { gate } of CONTINUITY_ROWS) {
      expect(block()).toMatch(new RegExp(`\\{${gate}\\s*&&`));
    }
  });

  it('derives those flags from classifyReachability, not from a platform check', () => {
    // A hand-rolled `!isNative` would be a native-only special case, and would
    // silently stop tracking the registry the day a room becomes nativeReady.
    expect(src).toMatch(/const reachable = \(d\?: HouseDestination\) =>[\s\S]{0,120}classifyReachability/);
    expect(src).toMatch(/showContinue\s*=\s*Boolean\(continuity\?\.continue\)\s*&&\s*reachable\(/);
    expect(src).toMatch(/showKept\s*=\s*Boolean\(continuity\?\.kept\.length\)\s*&&\s*reachable\(/);
  });

  it('opens no empty section when every row is withheld', () => {
    expect(block()).toMatch(/continuity && \(showContinue \|\| showKept\)/);
  });
});

describe('no row navigates on its own', () => {
  it('dispatches only through the canonical dispatcher', () => {
    const block = continuityBlock();
    expect(block).toMatch(/onClick=\{\(\) => go\(/);
    // The defect, exactly: a path pushed from inside the block.
    expect(block).not.toMatch(/router\.push/);
    expect(block).not.toMatch(/['"`]\/maia/);
  });

  it('constructs no per-item path', () => {
    const block = continuityBlock();
    expect(block).not.toMatch(/router\.push\(\s*`/);
    expect(onClickHandlers(block).length).toBeGreaterThan(0);
    for (const h of onClickHandlers(block)) expect(h).not.toMatch(/\.id\b|sessionId/);
    expect(block).not.toMatch(/\bhref=/);
  });

  it('makes no individual kept title navigable', () => {
    // `key={k.id}` is React reconciliation, not navigation.
    expect(continuityBlock()).not.toMatch(/\/maia[^`'"\s]*\$\{/);
  });
});
