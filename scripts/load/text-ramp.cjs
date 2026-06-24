/**
 * text-ramp.cjs — conversation-turn concurrency ramp, run INSIDE the maia-sovereign container.
 * Hits http://localhost:3000 directly (bypasses Caddy) → measures app + route + Claude + DB.
 * Body uses meta.sanctuary=true → NO memory writes (only content-free runtime_events rows).
 * Driven by run-text-ramp.sh (which handles member create, resource sampling, cleanup).
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ROUTE = process.env.ROUTE || '/api/sovereign/app/maia/list';
const MEMBER = process.env.MEMBER_ID;
const LEVELS = (process.env.LEVELS || '1,5,10,25,50').split(',').map(Number);

const MESSAGES = [
  'I keep circling the same decision and I am not sure why.',
  'Something felt different this morning and I want to name it.',
  'I am noticing resistance to a conversation I know I need to have.',
  'Help me sit with a tension I have been avoiding.',
  'There is a pattern I keep repeating and I would like to see it more clearly.',
];

function pct(arr, p) {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

async function oneTurn(i) {
  const body = JSON.stringify({ message: MESSAGES[i % MESSAGES.length], meta: { sanctuary: true } });
  const t0 = performance.now();
  try {
    const r = await fetch(`${BASE}${ROUTE}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-member-id': MEMBER },
      body,
    });
    const txt = await r.text(); // read to end = full turn
    return { ok: r.ok, status: r.status, ms: performance.now() - t0, len: txt.length };
  } catch (e) {
    return { ok: false, status: 0, ms: performance.now() - t0, err: String(e).slice(0, 80) };
  }
}

(async () => {
  if (!MEMBER) { console.error('MEMBER_ID required'); process.exit(1); }

  // PREFLIGHT: one empty-body POST → expect 400 NO_MESSAGE. Validates auth+path+reachability, NO Claude call.
  if (process.env.PREFLIGHT) {
    const t0 = performance.now();
    const r = await fetch(`${BASE}${ROUTE}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-member-id': MEMBER },
      body: '{}',
    });
    const txt = await r.text();
    console.log(`PREFLIGHT status=${r.status} ms=${(performance.now() - t0).toFixed(0)} body=${txt.slice(0, 160).replace(/\s+/g, ' ')}`);
    console.log(r.status === 400 ? 'PREFLIGHT_OK (400 = expected NO_MESSAGE; route+auth reachable, no Claude call)' : `PREFLIGHT_UNEXPECTED status=${r.status} (wanted 400)`);
    process.exit(0);
  }

  console.log(`target=${BASE}${ROUTE} member=${MEMBER.slice(0, 8)} levels=${LEVELS.join(',')} (sanctuary)`);
  for (const c of LEVELS) {
    const startIso = new Date().toISOString();
    const t0 = performance.now();
    const res = await Promise.all(Array.from({ length: c }, (_, i) => oneTurn(i)));
    const wall = performance.now() - t0;
    const oks = res.filter((r) => r.ok);
    const lat = oks.map((r) => r.ms);
    const s429 = res.filter((r) => r.status === 429).length;
    const s5xx = res.filter((r) => r.status >= 500 && r.status < 600).length;
    const sOther = res.filter((r) => !r.ok && r.status !== 429 && !(r.status >= 500 && r.status < 600)).length;
    console.log(
      `LEVEL conc=${c} start=${startIso} ok=${oks.length} 429=${s429} 5xx=${s5xx} other=${sOther} ` +
      `p50=${pct(lat, 50).toFixed(0)}ms p95=${pct(lat, 95).toFixed(0)}ms max=${Math.max(0, ...lat).toFixed(0)}ms wall=${wall.toFixed(0)}ms`
    );
    // brief settle between levels so resource samples separate cleanly
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log('RAMP_DONE');
})();
