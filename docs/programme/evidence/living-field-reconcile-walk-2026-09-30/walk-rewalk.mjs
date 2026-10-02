// Fixture walk of the MOUNTED Living Field (R1R3) at /maia/living-field?from=house.
// Real Next dev server + real page; /api/** answered from fixtures (no DB here).
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = new URL('.', import.meta.url).pathname;
const BASE = 'http://localhost:3000';
const MEMBER = '5b0c1f7e-2a4d-4c3b-9e21-7f00a1b2c3d4';
const now = new Date('2026-09-30T12:00:00Z').toISOString();

const fields = [
  { id: 'f1', field_key: 'current_questions', label: 'Current Questions', current_expression: 'What wants to be finished before it can begin again?', status: 'active', updated_at: now, sources_count: 2, gathered_count: 1 },
  { id: 'f2', field_key: 'relationships', label: 'Relationships', current_expression: null, status: 'gathering', updated_at: null, sources_count: 0, gathered_count: 0 },
  { id: null, field_key: 'calling', label: 'Calling', current_expression: null, status: 'gathering', updated_at: null, sources_count: 0, gathered_count: 0 },
];
const livingField = { fields, keep_denominator: 12, spiral_state: { dominant_element: 'water', phase: 4, motion: null, intensity: 0.5, relational_phase: 2, autonomy_streak: 1, return_count: 2 }, active_spirals: [], recent_states: [] };
const node = (id, domain, label, authorship) => ({ projectionId: id, domain, sourceType: domain === 'living_field' ? 'living_field_expression' : domain === 'vision_studio' ? 'vision_thread' : 'practice_field', sourceId: id, label, excerpt: null, authorship, standing: 'current', privacy: 'member_private', createdAt: now, updatedAt: now, source: { table: 't', sourceSurface: 's' } });
const constellation = { memberCenter: { projectionId: 'member:center', label: 'You', kind: 'orientation_only' }, nodes: [
  node('n1', 'living_field', 'Current Questions', 'member_authored'),
  node('n2', 'living_field', 'Grief, held longer than expected', 'maia_candidate'),
  node('n3', 'vision_studio', 'The book on thresholds', 'member_confirmed'),
  node('n4', 'practice_field', 'Tuesday circle', 'member_authored'),
], partial: false, warnings: [], generatedAt: now };
const endpoint = (facet, label) => ({ facet, refId: facet + '1', label, href: '/maia/' + facet });
const flows = { flows: [{ id: 'fl1', crossingId: 'c1', source: endpoint('journal', 'Morning pages, 28 Sept'), target: endpoint('decisions', 'Say no to the second project'), createdAt: now }] };
const evidence = { evidence: { flowId: 'fl1', crossingId: 'c1', source: { ...endpoint('journal', 'Morning pages, 28 Sept'), excerpt: 'I keep saying yes out of fear.' }, target: { ...endpoint('decisions', 'Say no to the second project'), excerpt: 'Decline by Friday.' }, createdAt: now } };
const detail = { versions: [
  { id: 'v2', expression: 'What wants to be finished before it can begin again?', change_note: null, authored_by: 'member', created_at: now },
  { id: 'v1', expression: 'A question about endings seems to be gathering.', change_note: 'accepted draft', authored_by: 'maia_candidate', created_at: now },
], sources: [], consents: [] };

function router(fail) {
  const seen = [];
  const handler = async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname, m = route.request().method();
    seen.push(`${m} ${p}${url.search}`);
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    const f = (k) => fail.includes(k);
    if (p === '/api/maia/living-field') return json(200, livingField);
    if (p === '/api/maia/living-constellation') return f('constellation') ? json(500, { error: 'x' }) : json(200, fail.includes('partial') ? { ...constellation, partial: true } : constellation);
    if (p === '/api/house/facet-flows') return f('flows') ? json(500, { error: 'x' }) : json(200, flows);
    if (p === '/api/house/facet-flow-evidence') return f('evidence') ? json(500, {}) : json(200, evidence);
    if (/\/gathering$/.test(p)) return json(200, { field_key: 'current_questions', gathered: [], gathered_count: 0, denominator: 12, criterion: 'register match' });
    if (/\/encounter$/.test(p)) return f('encounter') ? json(500, {}) : json(200, { encounter_id: 'e1', greeting: null });
    if (/\/refine$/.test(p)) {
      if (f('refine-abort')) return route.abort('failed');
      if (f('refine-500')) return json(500, { error: 'Internal server error' });
      if (f('refine-decline')) return json(200, { candidate_expression: null, sources_used: [], rationale: 'Not enough has gathered in this field yet to draft from. You can write directly, speak, or explore it with MAIA.' });
      return json(200, { candidate_expression: null });
    }
    if (/^\/api\/maia\/living-field\/[^/]+$/.test(p)) return f('detail') ? json(500, {}) : json(200, detail);
    return json(404, { error: 'unfixtured' });
  };
  return { handler, seen };
}

async function run(name, fail, steps) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, extraHTTPHeaders: { 'x-capacitor-app': 'true' } });
  await ctx.addInitScript(([id]) => { localStorage.setItem('memberId', id); localStorage.setItem('beta_user', JSON.stringify({ id, onboarded: true, name: 'Walk' })); }, [MEMBER]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const { handler, seen } = router(fail);
  await page.route('**/api/**', handler);
  await page.goto(BASE + '/maia/living-field?from=house', { waitUntil: 'networkidle', timeout: 240000 });
  await page.waitForTimeout(1500);
  const result = { name, fail, finalUrl: page.url(), notes: {} };
  await steps(page, result);
  const text = await page.locator('body').innerText();
  fs.writeFileSync(`${OUT}${name}.txt`, text);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: true });
  result.apiCalls = [...new Set(seen)];
  result.pageErrors = errors;
  await browser.close();
  return result;
}

const has = async (page, s) => (await page.getByText(s, { exact: false }).count()) > 0;

const results = [];
const openDim = async (page) => { await page.getByRole('button', { name: /Open Current Questions dimension/ }).click(); await page.waitForTimeout(1200); };
const refineNote = async (page) => { await page.getByRole('button', { name: /Refine with MAIA/ }).click(); await page.waitForTimeout(1200);
  return page.getByText(/draft did not return|Not enough has gathered|fresh draft/).first().innerText().catch(() => null); };

results.push(await run('R-B-failures', ['constellation', 'flows', 'detail'], async (page, r) => {
  r.notes['constellation'] = await page.getByText(/wider field is unavailable/i).first().innerText().catch(() => null);
  r.notes['flows'] = await page.getByText(/Threads failed to load|quiet/).first().innerText().catch(() => null);
  await openDim(page);
  r.notes['dimension-open'] = await page.getByText(/open this dimension/).first().innerText().catch(() => null);
}));
results.push(await run('R-D-encounter', ['encounter'], async (page, r) => {
  await openDim(page);
  r.notes['encounter'] = await page.getByText(/Could not (open|reach)|could not respond/).first().innerText().catch(() => null);
}));
results.push(await run('R-C-partial', ['partial'], async (page, r) => {
  r.notes['partial'] = await page.getByText(/what is shown is partial/).first().innerText().catch(() => null);
}));
results.push(await run('R-E-evidence', ['evidence'], async (page, r) => {
  await page.getByRole('button', { name: /Explore this thread/ }).first().click(); await page.waitForTimeout(400);
  await page.getByRole('group', { name: /Choose a lens/ }).getByRole('button').first().click(); await page.waitForTimeout(1000);
  r.notes['lens evidence'] = await page.getByText(/evidence failed to load|revisited/).first().innerText().catch(() => null);
}));
for (const [name, flag] of [['R-F-refine-empty', []], ['R-G-refine-500', ['refine-500']], ['R-H-refine-abort', ['refine-abort']], ['R-I-refine-decline', ['refine-decline']]]) {
  results.push(await run(name, flag, async (page, r) => { await openDim(page); r.notes['refine'] = await refineNote(page); }));
}
fs.writeFileSync(`${OUT}results-rewalk.json`, JSON.stringify(results, null, 2));
for (const r of results) console.log(r.name.padEnd(20), JSON.stringify(r.notes), 'pageErrors=' + r.pageErrors.length);
