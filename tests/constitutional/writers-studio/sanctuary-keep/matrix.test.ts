/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — lethality matrix + live-route proof.
 *
 *   npm run matrix:ws-sanctuary-keep
 *
 * Section A  reference doubles satisfy every law (the laws are satisfiable).
 * Section B  every defeat candidate dies on its NAMED law; collateral is
 *            CLASSIFIED or the matrix fails; a stale classification fails.
 * Section C  the LIVE route and the LIVE caller seam satisfy the same laws.
 *            ⛔ Before the S1 repair this section is RED by construction —
 *            that run is the known-bad reproduction, recorded in the S1 record.
 * Section D  static guards on the live sources: order of the gate, no
 *            session-table access, posture read inside the gesture handler.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import * as liveRoute from '@/app/api/sovereign/manuscripts/[id]/keeps/route';
import { makeHarness, makeRecorder, makeRecorderQuery } from './harness';
import { runServerLaws, runCallerLaws, type LawResult } from './laws';
import {
  REFERENCE_SERVER, SERVER_CANDIDATES, SERVER_NAMED_KILL, SERVER_CLASSIFIED,
  REFERENCE_CALLER, CALLER_CANDIDATES, CALLER_NAMED_KILL, CALLER_CLASSIFIED,
} from './candidates';

const auth = { current: null as string | null };
const rec = makeRecorder();
(getMemberIdFromRequest as jest.Mock).mockImplementation(async () => auth.current);
(query as jest.Mock).mockImplementation(makeRecorderQuery(rec));

const lines: string[] = [];
const line = (s: string) => lines.push(s);
const failed = (rs: LawResult[]) => rs.filter((r) => !r.ok);

let logSpy: jest.SpyInstance, errSpy: jest.SpyInstance;
beforeAll(() => {
  // contentWritable logs its (metadata-only) refusals; keep the matrix output legible.
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  logSpy.mockRestore();
  errSpy.mockRestore();
  process.stdout.write(['', '── SANCTUARY-MANUSCRIPT-KEEP-01 / S1 · LETHALITY ─────────────────', ...lines, ''].join('\n') + '\n');
});

function freshRec() {
  rec.reset();
  rec.all.length = 0;
}

function lethality(
  kind: 'server' | 'caller',
  run: (name: string) => Promise<LawResult[]> | LawResult[],
  candidates: string[],
  named: Record<string, string>,
  classified: Record<string, string[]>,
) {
  for (const name of candidates) {
    it(`${name} dies on ${named[name]}`, async () => {
      const results = await run(name);
      const dead = failed(results).map((r) => r.id);
      const target = named[name];
      expect(target).toBeDefined();
      expect(dead).toContain(target);
      const collateral = dead.filter((id) => id !== target);
      const allowed = classified[name] ?? [];
      const unclassified = collateral.filter((id) => !allowed.includes(id));
      const stale = allowed.filter((id) => !collateral.includes(id));
      line(`  DEAD   ${kind.padEnd(6)} ${name.padEnd(38)} → ${target}${collateral.length ? `   collateral: ${collateral.join(', ')}` : ''}`);
      expect({ unclassified, stale }).toEqual({ unclassified: [], stale: [] });
    });
  }
}

describe('A · reference doubles', () => {
  it('server reference satisfies every server law', async () => {
    freshRec();
    const rs = await runServerLaws(makeHarness(REFERENCE_SERVER, rec, auth));
    line(`  reference server     ${rs.length - failed(rs).length}/${rs.length}`);
    expect(failed(rs)).toEqual([]);
  });
  it('caller reference satisfies every caller law', () => {
    const rs = runCallerLaws(REFERENCE_CALLER);
    line(`  reference caller     ${rs.length - failed(rs).length}/${rs.length}`);
    expect(failed(rs)).toEqual([]);
  });
});

describe('B · defeat candidates', () => {
  lethality(
    'server',
    async (name) => {
      freshRec();
      return runServerLaws(makeHarness(SERVER_CANDIDATES[name]!, rec, auth));
    },
    Object.keys(SERVER_CANDIDATES),
    SERVER_NAMED_KILL,
    SERVER_CLASSIFIED,
  );
  lethality('caller', (name) => runCallerLaws(CALLER_CANDIDATES[name]!), Object.keys(CALLER_CANDIDATES), CALLER_NAMED_KILL, CALLER_CLASSIFIED);
});

describe('C · LIVE route + LIVE caller seam', () => {
  it('the live keeps route satisfies every server law', async () => {
    freshRec();
    const rs = await runServerLaws(makeHarness(liveRoute as never, rec, auth));
    line(`  LIVE route           ${rs.length - failed(rs).length}/${rs.length}${failed(rs).length ? '   ⛔ ' + failed(rs).map((r) => r.id).join(', ') : ''}`);
    expect(failed(rs)).toEqual([]);
  });
});

describe('D · static guards on live sources', () => {
  const root = join(__dirname, '..', '..', '..', '..');
  const route = readFileSync(join(root, 'app/api/sovereign/manuscripts/[id]/keeps/route.ts'), 'utf8');
  const page = readFileSync(join(root, 'app/press/manuscript/page.tsx'), 'utf8');
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const r = strip(route);

  it('G-1 the route gates with contentWritable before the ownership SELECT and the INSERT', () => {
    const gate = r.indexOf("contentWritable(posture, 'manuscript_keeps')");
    const sel = r.indexOf('FROM manuscript_sections');
    const ins = r.indexOf('INSERT INTO manuscript_keeps');
    expect(gate).toBeGreaterThan(-1);
    expect(sel).toBeGreaterThan(gate);
    expect(ins).toBeGreaterThan(sel);
  });
  it('G-2 the route requires an explicit boolean before minting posture, and never resolves from an empty object', () => {
    const check = r.indexOf("typeof sanctuary !== 'boolean'");
    const mint = r.indexOf('TurnPosture.resolve(');
    expect(check).toBeGreaterThan(-1);
    expect(mint).toBeGreaterThan(check);
    expect(r).not.toMatch(/TurnPosture\.resolve\(\s*\{\s*\}\s*\)/);
  });
  it('G-3 the route reads no session or settings table', () => {
    expect(r).not.toMatch(/maia_sessions|auth_sessions|maia_settings|member_settings/);
  });
  it('G-4 the DELETE handler carries no posture logic', () => {
    const del = r.slice(r.indexOf('export async function DELETE'));
    expect(del).not.toMatch(/TurnPosture|contentWritable|sanctuary/);
  });
  it('G-5 the Press page reads the current posture inside keepCurrent, and nowhere else', () => {
    const start = page.indexOf('const keepCurrent = async () => {');
    expect(start).toBeGreaterThan(-1);
    const end = page.indexOf('\n  };', start);
    const body = page.slice(start, end);
    expect(body).toContain('readCurrentSanctuaryPosture(');
    expect(body).toContain('buildKeepRequestBody(');
    const total = (page.match(/readCurrentSanctuaryPosture\(/g) ?? []).length;
    const inside = (body.match(/readCurrentSanctuaryPosture\(/g) ?? []).length;
    expect(total).toBe(inside);
    expect(page).not.toMatch(/useState\([^)]*readCurrentSanctuaryPosture/);
    expect(page).not.toMatch(/memberConfirmed/);
  });
});
