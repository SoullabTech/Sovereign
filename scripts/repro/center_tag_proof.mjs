// Runtime proof for the Center-of-Inquiry persistence tag (provenance, not interpretation).
//
// Saves one authored thread under center='person' and one under center='project', then
// proves the GET filter keeps them separate — Legacy Field and Vision Studio do not blur
// in storage.
//
// Run:  CENTER_TOKEN=<session> node scripts/repro/center_tag_proof.mjs

const BASE = process.env.BASE || 'http://localhost:3200';
const TOK = process.env.CENTER_TOKEN;
const stamp = Date.now().toString().slice(-6);
const PERSON_MARK = `legacy-marker-${stamp}`;
const PROJECT_MARK = `vision-marker-${stamp}`;
const SR = `centertag-${stamp}`;

function timed(url, opts = {}, ms = 30000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { ...opts, signal: ac.signal }).finally(() => clearTimeout(t));
}
const H = (method, path, body) =>
  timed(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-session-token': TOK },
    body: body ? JSON.stringify(body) : undefined,
  }, 30000).then(async (r) => ({ status: r.status, json: await r.json().catch(() => ({})) }));

async function waitReady(ms = 150000) {
  const s = Date.now();
  while (Date.now() - s < ms) {
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

  const consent = { remembered: true, protocolVersion: 'recognition-continuity-v1' };
  const savePerson = await H('POST', '/api/maia/field-lab/field-note', { center: 'person', created: [PERSON_MARK], sessionRef: SR, consent });
  const saveProject = await H('POST', '/api/maia/field-lab/field-note', { center: 'project', created: [PROJECT_MARK], sessionRef: SR, consent });

  const gp = await H('GET', '/api/maia/field-lab/field-note?center=person');
  const gpr = await H('GET', '/api/maia/field-lab/field-note?center=project');
  const tP = (gp.json?.threads || []).map((t) => t.title);
  const tPr = (gpr.json?.threads || []).map((t) => t.title);
  const centersP = [...new Set((gp.json?.threads || []).map((t) => t.center))];
  const centersPr = [...new Set((gpr.json?.threads || []).map((t) => t.center))];

  const personOK = tP.includes(PERSON_MARK) && !tP.includes(PROJECT_MARK) && centersP.every((c) => c === 'person');
  const projectOK = tPr.includes(PROJECT_MARK) && !tPr.includes(PERSON_MARK) && centersPr.every((c) => c === 'project');

  console.log(JSON.stringify({
    savePerson: savePerson.status,
    saveProject: saveProject.status,
    getPersonFilter:  { centersReturned: centersP,  hasLegacyMark: tP.includes(PERSON_MARK),  hasVisionMark: tP.includes(PROJECT_MARK) },
    getProjectFilter: { centersReturned: centersPr, hasVisionMark: tPr.includes(PROJECT_MARK), hasLegacyMark: tPr.includes(PERSON_MARK) },
    DO_NOT_BLUR: personOK && projectOK,
    sessionRef: SR,
  }, null, 2));
  process.exit(personOK && projectOK ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
