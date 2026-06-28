// Runtime proof for the Center of Inquiry frame (Vision Studio + Legacy Field).
//
// Sends the SAME opening to the SAME engine with center='person' vs center='project'.
// If the recognition primitive is real, the only difference is configuration — and the
// two replies should differ in FRAMING (the person's life vs. the work), not in engine.
//
// Run:  CENTER_TOKEN=<session> node scripts/repro/centerswap_proof.mjs

const BASE = process.env.BASE || 'http://localhost:3200';
const TOK = process.env.CENTER_TOKEN;

function timed(url, opts = {}, ms = 30000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { ...opts, signal: ac.signal }).finally(() => clearTimeout(t));
}
const turn = (center, content) =>
  timed(`${BASE}/api/maia/field-lab/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-token': TOK },
    body: JSON.stringify({ mode: 'turn', center, history: [{ role: 'user', content }] }),
  }, 45000).then(async (r) => ({ status: r.status, reply: (await r.json().catch(() => ({}))).reply || '' }));

async function waitReady(ms = 150000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await timed(`${BASE}/api/maia/field-lab/field-note`, { headers: { 'x-session-token': TOK } }, 8000);
      if (r.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

async function main() {
  if (!TOK) { console.log('NO CENTER_TOKEN'); process.exit(2); }
  if (!(await waitReady())) { console.log('SERVER NOT READY on ' + BASE); process.exit(1); }

  const opening =
    "I keep circling the same thing: I want what I'm making to matter, and I'm not sure if I mean that to people or to me.";

  const person = await turn('person', opening);
  const project = await turn('project', opening);

  console.log(JSON.stringify({
    sameEngine: true,
    sameOpening: opening,
    person:  { status: person.status,  replyPreview: person.reply.slice(0, 260) },
    project: { status: project.status, replyPreview: project.reply.slice(0, 260) },
  }, null, 2));
  process.exit(person.status === 200 && project.status === 200 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
