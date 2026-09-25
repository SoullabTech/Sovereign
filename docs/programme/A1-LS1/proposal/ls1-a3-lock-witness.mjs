// A1-LS1 · PROPOSED A3 addition (not frozen, not evidence): FORCED-INTERLEAVING
// witness that the observed-body comparison is made UNDER the draft row lock.
//
// The frozen A3 race (8 concurrent saves ⇒ exactly one winner) can only expose
// an outside-the-lock comparison when the saves' reads happen to interleave
// before the first commit. This witness removes the dependence on timing:
//   1. the witness takes the draft row lock itself (SELECT … FOR UPDATE);
//   2. a stale-version save carrying the digest of the CURRENT section body is
//      sent — it can read anything it likes, but must wait for the draft lock;
//   3. once that save is observed waiting on a lock, the witness changes the
//      section body (a real committed change elsewhere) and commits;
//   4. the save proceeds. A comparison made under the lock sees the new body
//      and refuses (409); a comparison against anything read before the lock
//      sees the old body and accepts — overwriting the change.
// Evidence: statuses and booleans only, never prose.
//
// Usage: node ls1-a3-lock-witness.mjs <root> <base_url> <identity.env> <out.json> [rounds]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const [ROOT, BASE, IDENTITY, OUT, ROUNDS = '3'] = process.argv.slice(2);
const require = createRequire(path.join(ROOT, 'package.json'));
const pg = require('pg');
const ident = Object.fromEntries(fs.readFileSync(IDENTITY, 'utf8').trim().split('\n').map((l) => l.split('=')));
const TOKEN = ident.LS0_SESSION_A_TOKEN;
const CONN = 'postgresql://soullab@127.0.0.1:55432/maia_consciousness';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (b) => crypto.createHash('sha256').update(b, 'utf8').digest('hex');
async function api(p, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + p, { method, headers: { cookie: `maia_session=${TOKEN}`, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch { /* none */ }
  return { status: res.status, json };
}
const filler = (tag, n) => Array.from({ length: n }, (_, i) => `Synthetic line ${i + 1} of ${tag}.`).join('\n\n');
const SPEC = [['Chapter 1: Synthetic One', 1], ['Scene 1.1', 2], ['Chapter 2: Synthetic Two', 1], ['Scene 2.1', 2]];

const db = new pg.Client({ connectionString: CONN }); await db.connect();
const holder = new pg.Client({ connectionString: CONN }); await holder.connect();
const q = async (c, sql, params) => (await c.query(sql, params)).rows;

const m = await api('/api/sovereign/manuscripts', { method: 'POST', body: { title: 'LS1 synthetic lock', sections: SPEC.map(([heading, depth]) => ({ heading, body: filler(`lock/${heading}`, 4), headingDepth: depth, headingSignal: 'markdown' })) } });
const d = await api(`/api/sovereign/manuscripts/${m.json.id}/draft`, { method: 'POST' });
const mid = m.json.id; const S = d.json.sections[3].id; // Scene 2.1

const rounds = [];
for (let r = 0; r < Number(ROUNDS); r++) {
  const snap = await api(`/api/writers-studio/rebuild/context?manuscriptId=${mid}`);
  const v = Number(snap.json.version); const body = snap.json.sections.find((x) => x.draftSectionId === S).body;
  const mark = `LS1MARKlock${r}${crypto.randomBytes(3).toString('hex')}`;
  const elsewhere = ` elsewhere-lock-${r}-${crypto.randomBytes(3).toString('hex')}`;
  await q(holder, 'BEGIN');
  const [draft] = await q(holder, 'SELECT id FROM manuscript_working_drafts WHERE manuscript_id = $1 FOR UPDATE', [mid]);
  // stale base (v - 1) + the digest of the body as it stands NOW
  const pending = api(`/api/sovereign/manuscripts/${mid}/sections/${S}`, { method: 'PUT', body: { body: `${body} ${mark}`, baseVersion: v - 1, observedBodySha256: sha(body) } });
  let waited = false;
  for (let i = 0; i < 200 && !waited; i++) {
    const [{ n }] = await q(db, `SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = 'maia_consciousness' AND wait_event_type = 'Lock' AND pid <> $1`, [holder.processID]);
    waited = n > 0; if (!waited) await sleep(50);
  }
  await q(holder, 'UPDATE manuscript_draft_sections SET text = text || $2, updated_at = now() WHERE id = $1', [S, elsewhere]);
  await q(holder, `UPDATE manuscript_working_drafts d SET version = version + 1, content = (SELECT string_agg(text, '' ORDER BY position) FROM manuscript_draft_sections WHERE draft_id = d.id) WHERE id = $1`, [draft.id]);
  await q(holder, 'COMMIT');
  const res = await pending;
  const [row] = await q(db, 'SELECT position(($2)::text in text) > 0 AS mark, position(($3)::text in text) > 0 AS elsewhere FROM manuscript_draft_sections WHERE id = $1', [S, mark, elsewhere]);
  rounds.push({ saveWaitedOnLock: waited, status: res.status, markPersisted: row.mark, elsewherePreserved: row.elsewhere });
}
await db.end(); await holder.end();
const preconditionHeld = rounds.every((x) => x.saveWaitedOnLock);
const checks = { comparisonUnderLockRefusesChangedBody: rounds.every((x) => x.status === 409 && !x.markPersisted && x.elsewherePreserved) };
const outcome = !preconditionHeld ? 'INSTRUMENT_FAILURE' : Object.values(checks).every(Boolean) ? 'GREEN' : 'RED';
fs.writeFileSync(OUT, JSON.stringify({ outcome, preconditionHeld, checks, rounds }, null, 2));
console.log(`A3-lock: ${outcome} ${JSON.stringify(rounds)}`);
