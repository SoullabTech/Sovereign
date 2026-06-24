/**
 * text-ramp.ts — conversation-turn concurrency load test against the live sovereign route.
 *
 * SAFETY:
 *   - Uses meta.sanctuary=true → NO memory writes (only content-free runtime_events rows).
 *   - Requires a dedicated load-test MEMBER_ID (never a real member).
 *   - Requires --yes to actually fire (build/inspect is safe by default).
 *   - Real Claude calls: 1+5+10+25+50 = 91 total ≈ pennies. Run off-hours.
 *
 * Run:
 *   MEMBER_ID=<load-test-uuid> npx tsx scripts/load/text-ramp.ts --yes
 *   BASE_URL=https://soullab.life LEVELS=1,5,10,25,50 MEMBER_ID=... npx tsx scripts/load/text-ramp.ts --yes
 */
import { execSync } from 'node:child_process';

const BASE = process.env.BASE_URL || 'https://soullab.life';
const ROUTE = process.env.ROUTE || '/api/sovereign/app/maia/list';
const MEMBER = process.env.MEMBER_ID || '';
const LEVELS = (process.env.LEVELS || '1,5,10,25,50').split(',').map(Number);
const GO = process.argv.includes('--yes');

const MESSAGES = [
  'I keep circling the same decision and I am not sure why.',
  'Something felt different this morning and I want to name it.',
  'I am noticing resistance to a conversation I know I need to have.',
  'Help me sit with a tension I have been avoiding.',
  'There is a pattern I keep repeating and I would like to see it more clearly.',
];

function pct(arr: number[], p: number): number {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

function sampleDbConns(): string {
  try {
    const out = execSync(
      `ssh -o ConnectTimeout=8 soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "select count(*) from pg_stat_activity"'`,
      { encoding: 'utf8', timeout: 15000 }
    );
    return out.trim();
  } catch {
    return '?';
  }
}

async function oneTurn(i: number) {
  const body = JSON.stringify({
    message: MESSAGES[i % MESSAGES.length],
    meta: { sanctuary: true },
  });
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
  if (!MEMBER) {
    console.error('Refusing to run: set MEMBER_ID to a dedicated load-test member uuid.');
    process.exit(1);
  }
  if (!GO) {
    console.error('Dry run. This fires REAL Claude calls at ' + BASE + ' (sanctuary). Re-run with --yes to execute.');
    process.exit(0);
  }
  console.log(`target=${BASE}${ROUTE} member=${MEMBER.slice(0, 8)}… levels=${LEVELS.join(',')} (sanctuary)`);
  console.log('conc |  ok err 429 |    p50      p95      max |  dbConns');
  for (const c of LEVELS) {
    const res = await Promise.all(Array.from({ length: c }, (_, i) => oneTurn(i)));
    const oks = res.filter((r) => r.ok);
    const lat = oks.map((r) => r.ms);
    const e429 = res.filter((r) => r.status === 429).length;
    const errs = res.length - oks.length;
    const db = sampleDbConns();
    console.log(
      `${String(c).padStart(4)} | ${String(oks.length).padStart(3)} ${String(errs).padStart(3)} ${String(e429).padStart(3)} | ` +
      `${pct(lat, 50).toFixed(0).padStart(7)}ms ${pct(lat, 95).toFixed(0).padStart(6)}ms ${Math.max(0, ...lat).toFixed(0).padStart(6)}ms | ${db.padStart(7)}`
    );
  }
  console.log('\nCleanup reminder: delete sanctuary rows + load-test member (see runbook §2).');
})();
