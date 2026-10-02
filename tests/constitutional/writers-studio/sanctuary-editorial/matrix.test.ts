/**
 * SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — lethality matrix + live proof.
 *   npm run matrix:ws-sanctuary-editorial
 * A · conforming doubles satisfy every law · B · candidates die on their named
 * law · C · the LIVE routes and LIVE helpers satisfy the same laws (⛔ RED before
 * the repair — the known-bad reproduction) · D · static guards.
 */
jest.mock('@/lib/maia/canonical-turn', () => ({ resolveCanonicalIdentity: jest.fn() }));
jest.mock('@/lib/manuscript/editorialRuntime/thread', () => ({ openEditorialRelationship: jest.fn(), openEditorialRelationshipAtSelection: jest.fn(), readEditorialThread: jest.fn() }));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({ persistMemberEditorialAct: jest.fn() }));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({ runEditorialTurn: jest.fn() }));
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import * as threadLib from '@/lib/manuscript/editorialRuntime/thread';
import * as actLib from '@/lib/manuscript/editorialRuntime/memberAct';
import * as turnLib from '@/lib/manuscript/editorialRuntime/turn';
import { apiFetch } from '@/lib/http/apiBase';
import * as passageRoute from '@/app/api/writers-studio/rebuild/editorial/thread/route';
import * as sectionRoute from '@/app/api/writers-studio/editorial/thread/route';
import * as turnRoute from '@/app/api/writers-studio/editorial/turn/route';
import { openBoundEditorialPassage, openBoundEditorialThread, sendBoundEditorialTurn } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { FIX, IDENTITY, makeLibs, makeRecorder, makeServerHarness, type CallerFactory, type Posted, type Transport } from './harness';
import { runServerLaws, runCallerLaws, runStaticLaws, type LawResult } from './laws';
import { REFERENCE_SERVER, SERVER_CANDIDATES, SERVER_NAMED_KILL, SERVER_CLASSIFIED, REFERENCE_CALLER, CALLER_CANDIDATES, CALLER_NAMED_KILL, CALLER_CLASSIFIED } from './candidates';

process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
const rec = makeRecorder(); const libs = makeLibs(rec);
(resolveCanonicalIdentity as jest.Mock).mockImplementation(async () => IDENTITY);
(threadLib.openEditorialRelationshipAtSelection as jest.Mock).mockImplementation(libs.openEditorialRelationshipAtSelection);
(threadLib.openEditorialRelationship as jest.Mock).mockImplementation(libs.openEditorialRelationship);
(threadLib.readEditorialThread as jest.Mock).mockImplementation(libs.readEditorialThread);
(actLib.persistMemberEditorialAct as jest.Mock).mockImplementation(libs.persistMemberEditorialAct);
(turnLib.runEditorialTurn as jest.Mock).mockImplementation(libs.runEditorialTurn);

/* transport for the LIVE helpers: records the first POST body per capture window, answers canned */
let firstPost: Record<string, unknown> | null = null; let inWindow = false;
(apiFetch as jest.Mock).mockImplementation(async (url: string, init?: RequestInit) => {
  if (init?.method === 'POST' && inWindow && firstPost === null) firstPost = JSON.parse(String(init.body));
  if (init?.method === 'POST' && /\/thread$/.test(url)) return new Response(JSON.stringify({ threadId: FIX.threadId, chainId: FIX.chainId }), { status: 200, headers: { 'content-type': 'application/json' } });
  if (init?.method === 'POST' && /\/turn$/.test(url)) return new Response(JSON.stringify({ version: null }), { status: 200, headers: { 'content-type': 'application/json' } });
  return new Response(JSON.stringify({ threadId: FIX.threadId, chainId: FIX.chainId, locusText: 'far bank', targetSectionId: FIX.sectionId, sectionLabel: null, legacyLocus: false, turns: [], versions: [], headVersionId: null }), { status: 200, headers: { 'content-type': 'application/json' } });
});
const transport: Transport = { async capture(run) { firstPost = null; inWindow = true; try { const result = await run(); return { body: firstPost, result }; } finally { inWindow = false; } } };
const posted = (body: Record<string, unknown> | null, result: { ok: boolean; reason?: string }): Posted => body ? { posted: true, body } : { posted: false, reason: result.ok ? 'posted_nothing' : (result.reason ?? 'unknown') };

/** The LIVE caller: the real helpers, posture read at each gesture with the real reader. */
const LIVE_CALLER: CallerFactory = (storage) => ({
  openPassage: async () => { const { body, result } = await transport.capture(() => openBoundEditorialPassage(FIX.sectionId, FIX.range, FIX.revision, readCurrentSanctuaryPosture(storage))); return posted(body, result as never); },
  openSection: async () => { const { body, result } = await transport.capture(() => openBoundEditorialThread(FIX.sectionId, readCurrentSanctuaryPosture(storage))); return posted(body, result as never); },
  sendTurn: async () => { const { body, result } = await transport.capture(() => sendBoundEditorialTurn(FIX.threadId, FIX.sectionId, FIX.text, readCurrentSanctuaryPosture(storage))); return posted(body, result as never); },
});

const lines: string[] = []; const line = (s: string) => lines.push(s);
const failed = (rs: LawResult[]) => rs.filter((r) => !r.ok);
let logSpy: jest.SpyInstance, errSpy: jest.SpyInstance;
beforeAll(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); errSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { logSpy.mockRestore(); errSpy.mockRestore(); process.stdout.write(['', '── SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 · LETHALITY ──────────────', ...lines, ''].join('\n') + '\n'); });

function lethality(kind: string, names: string[], run: (n: string) => Promise<LawResult[]>, named: Record<string, string>, classified: Record<string, string[]>) {
  for (const name of names) it(`${name} dies on ${named[name]}`, async () => {
    const dead = failed(await run(name)).map((r) => r.id); const target = named[name]!;
    expect(dead).toContain(target);
    const collateral = dead.filter((id) => id !== target); const allowed = classified[name] ?? [];
    line(`  DEAD   ${kind.padEnd(6)} ${name.padEnd(44)} → ${target}${collateral.length ? `   collateral: ${collateral.join(', ')}` : ''}`);
    expect({ unclassified: collateral.filter((id) => !allowed.includes(id)), stale: allowed.filter((id) => !collateral.includes(id)) }).toEqual({ unclassified: [], stale: [] });
  });
}

describe('A · conforming doubles', () => {
  it('server double satisfies every server law', async () => { rec.reset(); const rs = await runServerLaws(makeServerHarness(REFERENCE_SERVER, rec)); line(`  reference server     ${rs.length - failed(rs).length}/${rs.length}`); expect(failed(rs)).toEqual([]); });
  it('caller double satisfies every caller law', async () => { const rs = await runCallerLaws(REFERENCE_CALLER, transport); line(`  reference caller     ${rs.length - failed(rs).length}/${rs.length}`); expect(failed(rs)).toEqual([]); });
});
describe('B · defeat candidates', () => {
  lethality('server', SERVER_CANDIDATES.map((c) => c.name), async (n) => { rec.reset(); return runServerLaws(makeServerHarness(SERVER_CANDIDATES.find((c) => c.name === n)!.routes, rec)); }, SERVER_NAMED_KILL, SERVER_CLASSIFIED);
  lethality('caller', Object.keys(CALLER_CANDIDATES), (n) => runCallerLaws(CALLER_CANDIDATES[n]!, transport), CALLER_NAMED_KILL, CALLER_CLASSIFIED);
});
describe('C · LIVE routes + LIVE helpers', () => {
  it('the live routes satisfy every server law', async () => {
    rec.reset();
    const rs = await runServerLaws(makeServerHarness({ passageOpen: passageRoute.POST, sectionOpen: sectionRoute.POST, sectionGet: sectionRoute.GET, turn: turnRoute.POST }, rec));
    line(`  LIVE routes          ${rs.length - failed(rs).length}/${rs.length}${failed(rs).length ? '   ⛔ ' + failed(rs).map((r) => r.id).join(', ') : ''}`);
    expect(failed(rs)).toEqual([]);
  });
  it('the live helpers satisfy every caller law', async () => {
    const rs = await runCallerLaws(LIVE_CALLER, transport);
    line(`  LIVE helpers         ${rs.length - failed(rs).length}/${rs.length}${failed(rs).length ? '   ⛔ ' + failed(rs).map((r) => r.id).join(', ') : ''}`);
    expect(failed(rs)).toEqual([]);
  });
});
describe('D · static guards', () => {
  for (const r of runStaticLaws()) it(r.id, () => { line(`  ${r.ok ? 'PASS' : 'FAIL'}   static ${r.id} — ${r.detail}`); expect(r.ok).toBe(true); });
});
