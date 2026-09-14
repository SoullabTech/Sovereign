import pg from 'pg';
import { readFileSync } from 'fs';

const F = JSON.parse(readFileSync(process.env.FIXTURE, 'utf8'));
const BASE = 'http://127.0.0.1:3999';
const URL_ = `${BASE}/api/sovereign/manuscripts/${F.workId}/ask`;
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const counts = async () => {
  const q = async (sql) => Number((await c.query(sql)).rows[0].n);
  return {
    ask_threads: await q('SELECT count(*) n FROM ask_threads'),
    ask_turns: await q('SELECT count(*) n FROM ask_turns'),
    ask_authorization_acts: await q('SELECT count(*) n FROM ask_authorization_acts'),
    ask_authorization_consumptions: await q('SELECT count(*) n FROM ask_authorization_consumptions'),
    context_disclosure_receipts: await q('SELECT count(*) n FROM context_disclosure_receipts'),
  };
};

const post = async (body) => {
  const res = await globalThis.fetch(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-session-token': F.token },
    body: JSON.stringify(body),
  });
  const bytes = Buffer.from(await res.arrayBuffer());
  return { status: res.status, bytes, text: bytes.toString('utf8') };
};

const out = { fixture: { required: F.required, expectedOrdinals: F.expectedOrdinals } };

/* ── ARM 1 · BODY_AUTHORITY_REQUIRED ─────────────────────────────────────── */
const a1 = await post({
  anchor: { on: 'observation', readingId: F.orientable, observationKey: 'o1' },
  question: 'What is this observation resting on?',
});
out.arm1 = { status: a1.status, byteLength: a1.bytes.length, body: a1.text };

/* ── ARM 2 · BODY_SCOPE_INCOMPLETE — one section short, same frozen reading ─ */
let a2 = null;
try {
  const p = JSON.parse(a1.text);
  if (p.pendingAskRef) {
    const r = await post({
      threadId: p.threadId,
      question: 'What is this observation resting on?',
      act: 'authorize_sections_and_resume',
      pendingAskRef: p.pendingAskRef,
      authorizes: [F.required[0]],
    });
    a2 = { status: r.status, byteLength: r.bytes.length, body: r.text };
  }
} catch (e) { a2 = { error: String(e) }; }
out.arm2 = a2;

/* ── ARM 3 · unlocatable required section — before/after mutation proof ───── */
const before = await counts();
const a3 = await post({
  anchor: { on: 'observation', readingId: F.unorientable, observationKey: 'o1' },
  question: 'A question that must not survive an unorientable preflight.',
});
const after = await counts();
out.arm3 = {
  status: a3.status, byteLength: a3.bytes.length, body: a3.text,
  before, after,
  deltas: Object.fromEntries(Object.keys(before).map((k) => [k, after[k] - before[k]])),
};

await c.end();
console.log(JSON.stringify(out, null, 2));
