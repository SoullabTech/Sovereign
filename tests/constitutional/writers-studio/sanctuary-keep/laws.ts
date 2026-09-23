/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — the laws.
 *
 * SERVER (SK-*): observed over a KeepHarness — reply + recorded statements.
 * CALLER (CK-*): observed over a "keeper" — a function that, when the member
 *   presses Keep, produces the request body (or refuses to).
 *
 * Every law is written against the founder's S1 contract, not against any
 * implementation. Malformed posture values are enumerated so that the two
 * values a coercing implementation would most plausibly accept — the string
 * 'false' and the number 0 — are each tested to NOT become an ordinary write.
 */

import type { KeepHarness, TestStorage } from './harness';
import { FIX } from './harness';
import type { KeepRequest } from '@/app/press/manuscript/keepRequest';

export interface LawResult {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

const MALFORMED: readonly unknown[] = ['true', 'false', 1, 0, null, 'yes', {}, []];

function has(ss: readonly string[], re: RegExp): boolean {
  return ss.some((s) => re.test(s));
}
function count(ss: readonly string[], re: RegExp): number {
  return ss.filter((s) => re.test(s)).length;
}
const INSERT = /INSERT INTO manuscript_keeps/;
const SELECT_SECTION = /SELECT s\.id, s\.body FROM manuscript_sections/;
const DELETE_KEEP = /DELETE FROM manuscript_keeps/;
const SESSION_TABLES = /maia_sessions|auth_sessions|maia_settings|member_settings/;

const ordinary = { sectionId: FIX.sectionId, text: FIX.text, sanctuary: false };
const sanctuary = { sectionId: FIX.sectionId, text: FIX.text, sanctuary: true };
const missing = { sectionId: FIX.sectionId, text: FIX.text };

export async function runServerLaws(h: KeepHarness): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const law = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });

  // SK-1 sanctuary:true → 200 non-content receipt
  h.reset();
  const r1 = await h.post(sanctuary);
  law(
    'SK-1-sanctuary-refused-with-receipt',
    r1.status === 200 && r1.json['success'] === true && r1.json['sanctuary'] === true && r1.json['persisted'] === false,
    `status=${r1.status} json=${JSON.stringify(r1.json)}`,
  );
  // SK-2 sanctuary:true → zero query calls (no SELECT, no INSERT, nothing)
  law('SK-2-sanctuary-touches-no-store', h.statements().length === 0, `statements=${h.statements().length}`);

  // SK-3 sanctuary:false → existing SELECT then exactly one INSERT, 201
  h.reset();
  const r3 = await h.post(ordinary);
  const ss3 = h.statements();
  const selIdx = ss3.findIndex((s) => SELECT_SECTION.test(s));
  const insIdx = ss3.findIndex((s) => INSERT.test(s));
  law(
    'SK-3-ordinary-writes-exactly-once',
    r3.status === 201 &&
      typeof (r3.json['keep'] as Record<string, unknown> | undefined)?.['id'] === 'string' &&
      count(ss3, INSERT) === 1 &&
      selIdx >= 0 &&
      insIdx > selIdx,
    `status=${r3.status} inserts=${count(ss3, INSERT)} selIdx=${selIdx} insIdx=${insIdx}`,
  );

  // SK-4 missing posture → 400 posture_required, zero statements
  h.reset();
  const r4 = await h.post(missing);
  law(
    'SK-4-missing-posture-fails-closed',
    r4.status === 400 && r4.json['error'] === 'posture_required' && r4.json['persisted'] === false && h.statements().length === 0,
    `status=${r4.status} json=${JSON.stringify(r4.json)} statements=${h.statements().length}`,
  );

  // SK-5 malformed posture → 400 posture_required, zero statements — each value
  const bad: string[] = [];
  for (const v of MALFORMED) {
    h.reset();
    const r = await h.post({ ...missing, sanctuary: v });
    const ok = r.status === 400 && r.json['error'] === 'posture_required' && h.statements().length === 0;
    if (!ok) bad.push(`${JSON.stringify(v)}→${r.status}/${h.statements().length}stmt`);
  }
  law('SK-5-malformed-posture-fails-closed', bad.length === 0, bad.length ? bad.join(' ') : 'all malformed refused');

  // SK-6 the two refusals are distinguishable
  law(
    'SK-6-refusals-distinguishable',
    r1.status !== r4.status && r4.json['sanctuary'] !== true && r1.json['error'] !== 'posture_required',
    `sanctuary=${r1.status} posture_required=${r4.status}`,
  );

  // SK-7 no refusal carries the submitted passage or a keep identity
  h.reset();
  const r7 = await h.post({ ...missing, sanctuary: 'false' });
  const leaks = [r1, r4, r7].filter((r) => JSON.stringify(r.json).includes(FIX.text) || 'keep' in r.json);
  law('SK-7-refusal-carries-no-content', leaks.length === 0, `leaking replies=${leaks.length}`);

  // SK-8 contradictory signals fail closed (resolver law preserved)
  h.reset();
  const r8 = await h.post({ ...ordinary, meta: { sanctuary: true } });
  law(
    'SK-8-contradiction-fails-closed',
    r8.status !== 201 && !has(h.statements(), INSERT),
    `status=${r8.status} inserts=${count(h.statements(), INSERT)}`,
  );

  // SK-9 DELETE reachable irrespective of Sanctuary
  h.reset();
  const r9 = await h.del(FIX.keepId, { sanctuaryHint: true });
  law(
    'SK-9-delete-reachable-under-sanctuary',
    r9.status === 200 && r9.json['removed'] === true && has(h.statements(), DELETE_KEEP),
    `status=${r9.status} deleteIssued=${has(h.statements(), DELETE_KEEP)}`,
  );

  // SK-10 existing ownership + verbatim checks preserved on the ordinary path
  h.reset();
  const r10a = await h.post({ ...ordinary, sectionId: '99999999-9999-4999-8999-999999999999' });
  const ins10a = has(h.statements(), INSERT);
  h.reset();
  const r10b = await h.post({ ...ordinary, text: 'words the section does not contain' });
  const ins10b = has(h.statements(), INSERT);
  law(
    'SK-10-ordinary-checks-preserved',
    r10a.status === 404 && !ins10a && r10b.status === 422 && !ins10b,
    `notFound=${r10a.status}/${ins10a} notVerbatim=${r10b.status}/${ins10b}`,
  );

  // SK-11 no session-state substitution anywhere in the run
  law(
    'SK-11-no-session-substitution',
    !has(h.allStatements(), SESSION_TABLES),
    has(h.allStatements(), SESSION_TABLES) ? 'a session/settings table was queried' : 'no session table touched',
  );

  // SK-12 unauthenticated → 401, zero statements
  h.reset();
  const r12 = await h.post(ordinary, { auth: false });
  law('SK-12-unauthenticated-refused', r12.status === 401 && h.statements().length === 0, `status=${r12.status}`);

  return out;
}

/** A keeper: given the member's card, produce the request (or refuse). */
export type Keeper = (card: { sectionId: string; text: string }) => KeepRequest;
export type KeeperFactory = (storage: TestStorage) => Keeper;

const CARD = { sectionId: FIX.sectionId, text: FIX.text };
const LIVE = 'maia_settings';
const ACCOUNT = 'maia_account_settings';

export function runCallerLaws(make: KeeperFactory): LawResult[] {
  const out: LawResult[] = [];
  const law = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });
  const { makeStorage } = require('./harness') as typeof import('./harness');

  // CK-1 posture is read at gesture time — every gesture sees the setting as it is now
  {
    const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: false }) });
    const keeper = make(st);
    const a = keeper(CARD);
    st.set(LIVE, JSON.stringify({ sanctuary: true }));
    const b = keeper(CARD);
    st.set(LIVE, JSON.stringify({ sanctuary: false }));
    const c = keeper(CARD);
    const v = (r: KeepRequest) => (r.ok ? r.body.sanctuary : 'unresolved');
    law(
      'CK-1-reads-setting-at-gesture-time',
      v(a) === false && v(b) === true && v(c) === false,
      `sequence=${String(v(a))},${String(v(b))},${String(v(c))}`,
    );
  }

  // CK-2 sends an explicit boolean and nothing that pretends to be authority
  {
    const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: true }) });
    const r = make(st)(CARD);
    const ok =
      r.ok &&
      typeof r.body.sanctuary === 'boolean' &&
      r.body.sectionId === CARD.sectionId &&
      r.body.text === CARD.text &&
      !('memberConfirmed' in r.body);
    law('CK-2-explicit-boolean-no-authority-flag', ok, JSON.stringify(r));
  }

  // CK-3 no live settings → unresolved, even when an account default exists
  {
    const st = makeStorage({ [ACCOUNT]: JSON.stringify({ defaultMemoryMode: 'continuity' }) });
    const r = make(st)(CARD);
    law('CK-3-absence-is-unresolved', !r.ok && r.reason === 'posture_unresolved', JSON.stringify(r));
  }

  // CK-4 malformed live settings → unresolved
  {
    const bad: string[] = [];
    for (const raw of ['{not json', JSON.stringify({ sanctuary: 'true' }), JSON.stringify({}), 'null']) {
      const st = makeStorage({ [LIVE]: raw });
      const r = make(st)(CARD);
      if (r.ok) bad.push(`${raw}→${r.body.sanctuary}`);
    }
    law('CK-4-malformed-is-unresolved', bad.length === 0, bad.length ? bad.join(' ') : 'all unresolved');
  }

  // CK-5 storage failure → unresolved
  {
    const st = makeStorage({ [LIVE]: JSON.stringify({ sanctuary: false }) });
    st.failReads(true);
    const r = make(st)(CARD);
    law('CK-5-storage-failure-is-unresolved', !r.ok, JSON.stringify(r));
  }

  return out;
}
