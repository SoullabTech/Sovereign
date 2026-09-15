/**
 * AIN-CONTEXT-01 · A6 · F1c — SERVING-PATH REACH WITNESS
 *
 * Authority: founder adjudication 2026-09-15, R6 items 2, 3 and 4.
 *   2. demonstrate A6 reaches FAST
 *   3. demonstrate the ACTUAL standing of A6 on DEEP
 *   4. verify getMaiaResponse threads the carrier used by those paths
 *
 * ⛔ ACCEPTANCE WITNESS ONLY. Not authorization to redesign retrieval, widen apertures,
 *    alter DEEP architecture, or repair unrelated context machinery. If DEEP does not
 *    receive A6, this witness REPORTS that and stops — it does not fix it.
 *
 * METHOD — a loopback stub AT THE WIRE, downstream of all prompt assembly.
 *   A local HTTP server implements Ollama's POST /api/chat and records every payload.
 *   OLLAMA_BASE_URL points at it and MAIA_TEXT_PROVIDER=local selects that branch.
 *   ⛔ NO SOURCE IS MODIFIED. ⛔ NO PROVIDER IS CALLED. Real getMaiaResponse, real
 *   router, real tier functions, real prompt assembly — only the transport is replaced.
 *
 * ⭐ R3 DISCIPLINE: this witness proves DELIVERY TO THE WIRE. It does not prove
 *   compilation of untouched files, nor behaviour of paths the router did not select.
 *   Whatever the router did not exercise is reported as NOT EXERCISED, never as passing.
 *
 * Fixture prose is synthetic. Reported values are counts, booleans and identities.
 */

import { createServer, type Server } from 'http';
import { randomUUID } from 'crypto';

const STUB_PORT = 51434;

type WirePayload = { system: string; user: string; at: number };
const wire: WirePayload[] = [];

function startStub(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        if (req.url === '/api/version') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ version: 'f1c-stub' }));
        }
        try {
          const parsed = JSON.parse(body || '{}');
          const msgs: Array<{ role: string; content: string }> = parsed.messages ?? [];
          wire.push({
            system: msgs.find((m) => m.role === 'system')?.content ?? '',
            user: msgs.find((m) => m.role === 'user')?.content ?? '',
            at: Date.now(),
          });
        } catch { /* record nothing rather than guess */ }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: { content: 'F1C-STUB-REPLY' }, done: true }));
      });
    });
    server.listen(STUB_PORT, '127.0.0.1', () => resolve(server));
  });
}

// Env must be set BEFORE the modules under test are imported, because both the
// provider selection and the Ollama base URL are read at module load.
process.env.OLLAMA_BASE_URL = `http://127.0.0.1:${STUB_PORT}`;
process.env.MAIA_TEXT_PROVIDER = 'local';
process.env.MAIA_INFERENCE_MODE = '';
process.env.MAIA_ENABLE_MULTI_ENGINE = 'false';
delete process.env.ANTHROPIC_API_KEY;

const DEPTH = 200;

/** Parse A6's own block out of whatever reached the wire. */
function readContinuity(text: string): { depth: number; represented: number; absent: number } | null {
  if (!/SESSION CONTINUITY/.test(text)) return null;
  const d = text.match(/holds (\d+) completed exchanges on record/);
  const r = text.match(/(\d+) of them are present in your working context/);
  const a = text.match(/(\d+) completed exchanges of THIS SAME conversation are on record/);
  if (!d) return null;
  return {
    depth: Number(d[1]),
    represented: r ? Number(r[1]) : (/All (\d+) of them are present/.test(text) ? Number(RegExp.$1) : 0),
    absent: a ? Number(a[1]) : 0,
  };
}

type Check = { id: string; ok: boolean; detail: string };
const checks: Check[] = [];
const check = (id: string, ok: boolean, detail: string) => checks.push({ id, ok, detail });

async function main() {
  const server = await startStub();
  console.log('AIN-CONTEXT-01 · A6 · F1c — SERVING-PATH REACH WITNESS');
  console.log('='.repeat(78));
  console.log(`wire stub listening on 127.0.0.1:${STUB_PORT} (Ollama /api/chat)`);

  const { pool, query } = await import('@/lib/db/postgres');
  const { ensureSession, initializeSessionTable } = await import('@/lib/sovereign/sessionManager');
  const { TurnsStore } = await import('@/lib/memory/stores/TurnsStore');
  const { TurnPosture } = await import('@/lib/sanctuary/turnPosture');
  const { getMaiaResponse } = await import('@/lib/sovereign/maiaService');

  await initializeSessionTable();
  const enc = await query<{ enc: string }>(`SELECT current_setting('server_encoding') AS enc`);
  if (enc.rows[0]?.enc !== 'UTF8') throw new Error('STOP: shadow is not UTF8');

  const memberId = `f1c_member_${randomUUID()}`;
  const session = await ensureSession(`session_f1c_${randomUUID()}`);
  const posture = TurnPosture.resolve({ sanctuary: false });
  for (let i = 0; i < DEPTH; i++) {
    await TurnsStore.addExchange(posture, memberId, session.id, `F1C-MEMBER-${i}`, `F1C-MAIA-${i}`, randomUUID());
  }
  const seeded = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM conversation_turns WHERE session_id = $1`, [session.id]);
  if (Number(seeded.rows[0]?.n) !== DEPTH * 2) {
    throw new Error(`F1c INSTRUMENT FAILURE: fixture did not persist (${seeded.rows[0]?.n} turns)`);
  }
  console.log(`fixture: ${DEPTH} completed exchanges in ONE active session`);

  // Inputs chosen to exercise different router profiles. Whatever the router actually
  // selects is what gets reported — ⛔ the tier is observed, never asserted.
  const probes = [
    { label: 'short', input: 'ok' },
    { label: 'simple', input: 'what did I say about the blue door?' },
    { label: 'deep', input:
      'I want to go deep here. Help me understand the pattern underneath how I keep ' +
      'withdrawing when differentiation becomes necessary, across my whole life.' },
  ];

  const observed: Array<{ label: string; profile: string; delivered: boolean; facts: any; expectedDepth: number }> = [];

  for (const p of probes) {
    const before = wire.length;
    // ⚠️ getMaiaResponse PERSISTS the exchange it serves, so depth advances with every
    // probe. The first run of this witness compared against the seed constant and
    // scored a correct depth of 201 as a failure. Read the durable truth per probe.
    const d = await query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM conversation_turns WHERE session_id = $1 AND role = 'assistant'`,
      [session.id]);
    const expectedDepth = Number(d.rows[0]?.n ?? 0);
    let profile = 'unknown';
    try {
      const res: any = await getMaiaResponse({
        sessionId: session.id,
        input: p.input,
        meta: { userId: memberId, sanctuary: false },
        originRoute: '/api/sovereign/app/maia/list',
      } as any);
      profile = res?.processingProfile ?? res?.meta?.processingProfile ?? 'unreported';
    } catch (err: any) {
      profile = `ERROR:${String(err?.message ?? err).slice(0, 60)}`;
    }
    const fresh = wire.slice(before);
    // A6's block may ride in either channel depending on tier; search both.
    const hit = fresh.map((w) => readContinuity(w.user) ?? readContinuity(w.system)).find(Boolean) ?? null;
    observed.push({ label: p.label, profile, delivered: !!hit, facts: hit, expectedDepth });
    console.log(
      `probe=${p.label.padEnd(7)} profile=${String(profile).padEnd(12)} ` +
      `wireCalls=${fresh.length} expectedDepth=${expectedDepth} a6Delivered=${!!hit}` +
      (hit ? ` depth=${hit.depth} represented=${hit.represented} absent=${hit.absent}` : ''),
    );
  }

  console.log('');
  const delivered = observed.filter((o) => o.delivered);

  // ── R6-2 · A6 reaches at least one real serving path, with TRUE numbers ────
  check('F1c-1  A6 reaches the wire on a real serving path',
    delivered.length > 0, `${delivered.length}/${observed.length} probes delivered the block`);
  for (const d of delivered) {
    check(`F1c-2  ${d.label}: depth is authoritative, not the window`,
      d.facts.depth === d.expectedDepth && d.facts.depth > 11,
      `depth=${d.facts.depth} expected=${d.expectedDepth} (window-derived would be <=11)`);
    check(`F1c-3  ${d.label}: absence accounted at the aperture`,
      d.facts.absent === d.expectedDepth - d.facts.represented && d.facts.absent > 0,
      `depth=${d.expectedDepth} represented=${d.facts.represented} absent=${d.facts.absent}`);
  }

  // ── R6-4 · the threading is proved by the number itself ───────────────────
  // durableCompletedExchanges is read in getMaiaResponse and passed to the tier fn.
  // A delivered depth of 200 (not <=11) can only have come through that thread.
  check('F1c-4  getMaiaResponse threads the carrier',
    delivered.length > 0 && delivered.every((d) => d.facts.depth === d.expectedDepth && d.facts.depth > 11),
    'authoritative depth at the wire is only reachable via the threaded parameter');

  // ── R6-3 · DEEP standing is REPORTED, never asserted ──────────────────────
  const deepProbes = observed.filter((o) => /DEEP/i.test(o.profile));
  console.log('── DEEP standing ───────────────────────────────────────────────');
  if (deepProbes.length === 0) {
    console.log('  DEEP NOT EXERCISED by the router on these probes.');
    console.log('  ⛔ Reported as NOT EXERCISED. It is not evidence either way.');
  } else {
    for (const d of deepProbes) {
      console.log(`  DEEP probe "${d.label}": A6 delivered = ${d.delivered}`);
      console.log(d.delivered
        ? '  ⭐ DEEP primary DOES receive A6 — the static reading in the adjudication is WRONG and must be corrected.'
        : '  ⛔ DEEP primary does NOT receive A6 — confirms the adjudication §2. ⛔ NOT REPAIRED HERE.');
    }
  }

  console.log('');
  let failed = 0;
  for (const c of checks) if (!c.ok) { failed++; console.log(`  FAIL  ${c.id} — ${c.detail}`); }
  console.log(`F1c: ${checks.length - failed} passed · ${failed} failed`);
  console.log(failed === 0
    ? 'F1c VERDICT: reach WITNESSED for the paths the router exercised.'
    : 'F1c VERDICT: reach NOT established.');

  server.close();
  await pool.end();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('F1c INSTRUMENT FAILURE — no reach evidence:', err?.message ?? err);
  process.exit(2);
});
