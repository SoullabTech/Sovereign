/**
 * SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — laws.
 *
 * SERVER (E1-L*): over the three POST boundaries + the GET.
 * CALLER (E1-C*): over a caller factory — posture read at the gesture, sent
 *   as an explicit boolean, never invented when unresolved.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, makeStorage, type Caller, type CallerFactory, type ServerHarness, type Transport } from './harness';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const MALFORMED: readonly unknown[] = ['true', 'false', 1, 0, null, 'yes', {}, []];

const passageBody = (extra: Record<string, unknown> = {}) => ({ sectionId: FIX.sectionId, range: FIX.range, revisionNumber: FIX.revision, ...extra });
const sectionBody = (extra: Record<string, unknown> = {}) => ({ sectionId: FIX.sectionId, ...extra });
const turnBody = (extra: Record<string, unknown> = {}) => ({ threadId: FIX.threadId, act: { act: 'discourse', text: FIX.text, refersTo: null }, ...extra });
const wrote = (calls: readonly string[], prefix: string) => calls.filter((c) => c.startsWith(prefix)).length;

export async function runServerLaws(h: ServerHarness): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const refusal409 = (r: { status: number; json: Record<string, unknown> }) => r.status === 409 && r.json['error'] === 'sanctuary_unavailable' && r.json['persisted'] === false;
  const refusal400 = (r: { status: number; json: Record<string, unknown> }) => r.status === 400 && r.json['error'] === 'posture_required' && r.json['persisted'] === false;

  // L1 · passage-open under Sanctuary: refused, nothing opened
  h.reset(); const r1 = await h.passageOpen(passageBody({ sanctuary: true }));
  out.push(must('E1-L1-passage-open-sanctuary-zero-write', refusal409(r1) && h.calls().length === 0, `status=${r1.status} error=${String(r1.json['error'])} libCalls=${h.calls().length}`));

  // L2 · passage-open missing/malformed: 400 posture_required, nothing opened
  { const bad: string[] = [];
    h.reset(); const r = await h.passageOpen(passageBody()); if (!refusal400(r) || h.calls().length) bad.push(`missing→${r.status}/${h.calls().length}`);
    for (const v of MALFORMED) { h.reset(); const rr = await h.passageOpen(passageBody({ sanctuary: v })); if (!refusal400(rr) || h.calls().length) bad.push(`${JSON.stringify(v)}→${rr.status}/${h.calls().length}`); }
    out.push(must('E1-L2-passage-open-unresolved-fails-closed', bad.length === 0, bad.length ? bad.join(' ') : 'missing + 8 malformed all refused, zero opens')); }

  // L3 · section-open under Sanctuary
  h.reset(); const r3 = await h.sectionOpen(sectionBody({ sanctuary: true }));
  out.push(must('E1-L3-section-open-sanctuary-zero-write', refusal409(r3) && h.calls().length === 0, `status=${r3.status} error=${String(r3.json['error'])} libCalls=${h.calls().length}`));

  // L4 · section-open missing/malformed
  { const bad: string[] = [];
    h.reset(); const r = await h.sectionOpen(sectionBody()); if (!refusal400(r) || h.calls().length) bad.push(`missing→${r.status}/${h.calls().length}`);
    for (const v of MALFORMED) { h.reset(); const rr = await h.sectionOpen(sectionBody({ sanctuary: v })); if (!refusal400(rr) || h.calls().length) bad.push(`${JSON.stringify(v)}→${rr.status}/${h.calls().length}`); }
    out.push(must('E1-L4-section-open-unresolved-fails-closed', bad.length === 0, bad.length ? bad.join(' ') : 'missing + 8 malformed all refused, zero opens')); }

  // L5 · turn under Sanctuary: refused before the member act persists
  h.reset(); const r5 = await h.turn(turnBody({ sanctuary: true }));
  out.push(must('E1-L5-turn-sanctuary-zero-write', refusal409(r5) && h.calls().length === 0, `status=${r5.status} error=${String(r5.json['error'])} libCalls=${h.calls().length}`));

  // L6 · turn missing/malformed
  { const bad: string[] = [];
    h.reset(); const r = await h.turn(turnBody()); if (!refusal400(r) || h.calls().length) bad.push(`missing→${r.status}/${h.calls().length}`);
    for (const v of MALFORMED) { h.reset(); const rr = await h.turn(turnBody({ sanctuary: v })); if (!refusal400(rr) || h.calls().length) bad.push(`${JSON.stringify(v)}→${rr.status}/${h.calls().length}`); }
    out.push(must('E1-L6-turn-unresolved-fails-closed', bad.length === 0, bad.length ? bad.join(' ') : 'missing + 8 malformed all refused, zero persists')); }

  // L7 · ordinary paths unchanged: each opens/persists exactly once with the same arguments
  { h.reset(); const a = await h.passageOpen(passageBody({ sanctuary: false }));
    const aOk = a.status === 200 && a.json['threadId'] === FIX.threadId && wrote(h.calls(), 'open-passage:') === 1 && h.calls()[0]!.includes(`"revisionNumber":${FIX.revision}`) && h.calls()[0]!.includes(`"start":${FIX.range.start}`);
    h.reset(); const b = await h.sectionOpen(sectionBody({ sanctuary: false }));
    const bOk = b.status === 200 && b.json['threadId'] === FIX.threadId && wrote(h.calls(), 'open-section:') === 1;
    h.reset(); const c = await h.turn(turnBody({ sanctuary: false }));
    const cOk = c.status === 200 && c.json['memberTurnIndex'] === 1 && c.json['maiaTurnIndex'] === 2 && wrote(h.calls(), 'persist-act:') === 1 && wrote(h.calls(), 'run-turn') === 1 && h.calls()[0]!.startsWith('persist-act:');
    out.push(must('E1-L7-ordinary-paths-unchanged', aOk && bOk && cOk, `passage=${a.status}/${aOk} section=${b.status}/${bOk} turn=${c.status}/${cOk}`)); }

  // L8 · GET thread stays readable, hint or no hint
  h.reset(); const r8 = await h.threadGet({ sanctuaryHint: true });
  out.push(must('E1-L8-thread-read-not-gated', r8.status === 200 && r8.json['threadId'] === FIX.threadId && wrote(h.calls(), 'read:') === 1, `status=${r8.status} reads=${wrote(h.calls(), 'read:')}`));

  // L9 · refusals distinguishable and content-free
  { h.reset(); const s = await h.turn(turnBody({ sanctuary: true })); h.reset(); const m = await h.turn(turnBody({ sanctuary: 'false' }));
    const distinct = s.status !== m.status && s.json['error'] !== m.json['error'];
    const leak = [s, m].some((r) => JSON.stringify(r.json).includes(FIX.text));
    out.push(must('E1-L9-refusals-distinct-and-content-free', distinct && !leak, `sanctuary=${s.status}/${String(s.json['error'])} malformed=${m.status}/${String(m.json['error'])} leak=${leak}`)); }

  return out;
}

const LIVE = 'maia_settings'; const ACCOUNT = 'maia_account_settings';

export function makeTransport(canned: () => Response): Transport & { last: Record<string, unknown> | null } {
  const t = {
    last: null as Record<string, unknown> | null,
    async capture<T>(run: () => Promise<T>) { t.last = null; const result = await run(); return { body: t.last, result }; },
  };
  void canned;
  return t;
}

export async function runCallerLaws(make: CallerFactory, transport: Transport): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const sanct = (p: Awaited<ReturnType<Caller['openPassage']>>) => (p.posted ? p.body['sanctuary'] : 'unresolved');

  // C1 · posture read at the gesture, every gesture
  { const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: false }) }); const c = make(st, transport);
    const a = sanct(await c.openPassage()); st.set(LIVE, JSON.stringify({ sanctuary: true })); const b = sanct(await c.sendTurn()); st.set(LIVE, JSON.stringify({ sanctuary: false })); const d = sanct(await c.openSection());
    out.push(must('E1-C1-reads-posture-at-gesture', a === false && b === true && d === false, `sequence=${String(a)},${String(b)},${String(d)}`)); }

  // C2 · explicit boolean on all three bodies, plus the existing fields intact
  { const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: true }) }); const c = make(st, transport);
    const p = await c.openPassage(); const s = await c.openSection(); const t = await c.sendTurn();
    const ok = p.posted && typeof p.body['sanctuary'] === 'boolean' && p.body['sectionId'] === FIX.sectionId && p.body['revisionNumber'] === FIX.revision
      && s.posted && typeof s.body['sanctuary'] === 'boolean' && s.body['sectionId'] === FIX.sectionId
      && t.posted && typeof t.body['sanctuary'] === 'boolean' && (t.body['act'] as Record<string, unknown>)['text'] === FIX.text;
    out.push(must('E1-C2-explicit-boolean-on-every-body', ok, `passage=${p.posted} section=${s.posted} turn=${t.posted}`)); }

  // C3 · unresolved (no live key, account default present) → no POST
  { const st = makeStorage({ [ACCOUNT]: JSON.stringify({ defaultMemoryMode: 'continuity' }) }); const c = make(st, transport);
    const p = await c.openPassage(); const s = await c.openSection(); const t = await c.sendTurn();
    const ok = !p.posted && !s.posted && !t.posted && [p, s, t].every((x) => !x.posted && x.reason === 'posture_unresolved');
    out.push(must('E1-C3-unresolved-never-posts', ok, `passage=${JSON.stringify(p)} section=${JSON.stringify(s)} turn=${JSON.stringify(t)}`)); }

  // C4 · malformed live setting → unresolved
  { const bad: string[] = [];
    for (const raw of ['{not json', JSON.stringify({ sanctuary: 'true' }), JSON.stringify({})]) { const st = makeStorage({ [LIVE]: raw }); const c = make(st, transport); const p = await c.sendTurn(); if (p.posted) bad.push(`${raw}→posted`); }
    const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: false }) }); st.failReads(true); const p = await make(st, transport).sendTurn(); if (p.posted) bad.push('storage-failure→posted');
    out.push(must('E1-C4-malformed-or-unavailable-never-posts', bad.length === 0, bad.length ? bad.join(' ') : 'all unresolved')); }

  return out;
}

/** Static guards on product callers: posture read INSIDE the gesture handler. */
export function runStaticLaws(root = process.cwd()): LawResult[] {
  const out: LawResult[] = [];
  const src = (p: string) => readFileSync(join(root, p), 'utf8');
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const routes = ['app/api/writers-studio/rebuild/editorial/thread/route.ts', 'app/api/writers-studio/editorial/thread/route.ts', 'app/api/writers-studio/editorial/turn/route.ts'].map((p) => strip(src(p)));
  out.push(must('E1-S1-routes-read-no-session-or-settings-store', routes.every((r) => !/maia_sessions|auth_sessions|maia_settings|member_settings|defaultMemoryMode/.test(r)), 'no session/settings table in any route'));
  out.push(must('E1-S2-routes-never-resolve-from-empty', routes.every((r) => !/TurnPosture\.resolve\(\s*\{\s*\}\s*\)/.test(r)), 'no resolve({})'));
  const helper = strip(src('lib/writersStudio/rebuild/editorialCollaboration.ts'));
  out.push(must('E1-S3-helpers-require-posture', /openBoundEditorialThread\([^)]*posture: CurrentPostureRead/.test(helper) && /openBoundEditorialPassage\([\s\S]*?posture: CurrentPostureRead/.test(helper) && /sendBoundEditorialTurn\([\s\S]*?posture: CurrentPostureRead/.test(helper) && !/posture\?:|posture: CurrentPostureRead\s*=/.test(helper), 'all three helpers take a required posture'));
  const callers: Array<[string, string[]]> = [
    ['app/writers-studio/rebuild/RebuildStudioClient.tsx', ['const startNewEditorial = useCallback', 'const sendEditorial = useCallback']],
    ['app/writers-studio/canvas/CanvasClient.tsx', ['const openEditorialConversation = useCallback']],
    ['app/writers-studio/canvas/EditorialConversation.tsx', ['const send = async ()']],
  ];
  const bad: string[] = [];
  for (const [file, handlers] of callers) {
    const s = strip(src(file));
    if (/useState\([^)]*readCurrentSanctuaryPosture|useMemo\([^)]*readCurrentSanctuaryPosture/.test(s)) bad.push(`${file}: snapshot`);
    for (const h of handlers) { const i = s.indexOf(h); const body = i >= 0 ? s.slice(i, s.indexOf('\n  }', i) > 0 ? s.indexOf('\n  }', i) : i + 4000) : ''; if (!body.includes('readCurrentSanctuaryPosture(')) bad.push(`${file}: ${h.slice(6, 40)} reads no posture`); }
  }
  out.push(must('E1-S4-product-callers-read-posture-in-the-gesture', bad.length === 0, bad.length ? bad.join('; ') : 'every gesture handler reads posture at the gesture, none at mount'));
  return out;
}
