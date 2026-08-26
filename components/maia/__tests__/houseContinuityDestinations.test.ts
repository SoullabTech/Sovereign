/**
 * House continuity — where Continue and Kept actually go, pinned at the source.
 *
 * MLX-06 Unit 5. The continuity block is the only part of the House that is
 * built from the member's own material rather than from the destination
 * registry, so it is the only part that can invent a door. This guard exists
 * to stop that.
 *
 * WHAT THIS PROVES:
 *   - Continue re-enters the conversation surface (/maia), which resumes the
 *     member's persistent session. It is a way back in, not a history row.
 *   - Kept opens the Keeps room, and that room is a registered House
 *     destination — not a path invented for this block.
 *   - Neither row fabricates a per-session or per-atom deep link. Those
 *     substrates do not exist (see the unit report): /maia does not accept a
 *     session id, and /maia/keep-capture reads no search params. A title that
 *     looked tappable would promise a destination there is no code for.
 *
 * WHAT IT DOES NOT PROVE: nothing about production behaviour, live rows, or
 * what a member sees. It is a source-shape guard; the runtime walk is the
 * acceptance test.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { HOUSE_DESTINATIONS } from '@/lib/navigation/houseDestinations';

const REPO = path.resolve(__dirname, '../../..');
const SHEET = 'components/maia/MaiaHouseSheet.tsx';

/** Comments describe intent; code is what ships. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const src = stripComments(readFileSync(path.join(REPO, SHEET), 'utf8'));

/** The continuity block only — everything else routes through the registry. */
function continuityBlock(): string {
  const start = src.indexOf('continuity.continue');
  const end = src.indexOf('Your Center');
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return src.slice(start, end);
}

/** Literal paths the continuity block navigates to, in source order. */
function pushedPaths(): string[] {
  return [...continuityBlock().matchAll(/router\.push\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);
}

describe('Continue', () => {
  it('re-enters the conversation surface rather than a history view', () => {
    expect(pushedPaths()[0]).toBe('/maia');
  });
});

describe('Kept', () => {
  it('opens a destination the House registry actually declares', () => {
    const keptPath = pushedPaths()[1];
    const registered = HOUSE_DESTINATIONS.map((d) => d.route);
    expect(registered).toContain(keptPath);
  });

  it('opens the Keeps room', () => {
    expect(pushedPaths()[1]).toBe('/maia/keep-capture');
  });
});

describe('no invented deep links', () => {
  it('navigates only to whole rooms — never to a constructed per-item path', () => {
    expect(continuityBlock()).not.toMatch(/router\.push\(\s*`/);
  });

  it('does not make an individual kept title or session id navigable', () => {
    const block = continuityBlock();
    // `key={k.id}` is React reconciliation, not navigation, so the claim is
    // asserted against what the handlers and links actually carry.
    const handlers = [...block.matchAll(/onClick=\{([^}]*\}[^}]*)\}/g)].map((m) => m[1]);
    expect(handlers.length).toBeGreaterThan(0);
    for (const h of handlers) expect(h).not.toMatch(/\.id\b|sessionId/);
    expect(block).not.toMatch(/\bhref=/);
    // No id is interpolated into any path-shaped string in this block.
    expect(block).not.toMatch(/\/maia[^`'"\s]*\$\{/);
  });
});
