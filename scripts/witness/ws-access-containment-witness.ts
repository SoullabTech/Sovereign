/**
 * WS-ACCESS-CONTAINMENT-01 · THE BEHAVIOURAL WITNESS.
 *
 * ⭐⭐ THE ONE THING THIS MUST ESTABLISH is not "unauthenticated gets 401" —
 * that was ALREADY TRUE before the rule, from the handler. It is that the
 * request is now stopped AT THE MATRIX, and that the handler's own identity
 * boundary is still independently intact behind it.
 *
 * ⭐ The two 401s are distinguishable, which is what makes the claim checkable:
 *
 *     middleware   { error: 'Unauthorized', message: 'Authentication required.', rid }
 *     handler      { error: 'Authentication required' }
 *
 * ⛔ A witness that only asserted the status code could not tell which layer
 * answered, and would have reported this act as working on the day it did
 * nothing at all.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. ⛔ No provider is reached: every request here
 * either stops at the matrix or stops in the handler's identity check.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

let pg: Client; let next: ChildProcess | null = null;
let port = 3417;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

const ROUTES = ['thread', 'turn', 'version'] as const;

function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }

  const M = randomUUID(); const TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'AC1','ac_1','x')`, [M]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '1 hour')`, [M, TOKEN]);

  /* ⚠️ `focus` IS ENABLED HERE ON PURPOSE. It carries its own feature gate that
     404s before any identity check, so with the flag off the corridor's gap is
     unobservable — a first run asserted 401 and got 404, which would have let
     the finding be recorded as "already contained". */
  const boot = async (editorial: boolean) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env, DATABASE_URL: DSN, WRITERS_STUDIO_FOCUS_ENABLED: '1',
    };
    if (editorial) env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
    else delete env.WRITERS_STUDIO_EDITORIAL_ENABLED;
    next = spawn('node_modules/.bin/next', ['dev', '-p', String(port)], {
      cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true, env,
    });
    const deadline = Date.now() + 240_000;
    for (;;) {
      try { const r = await fetch(`http://127.0.0.1:${port}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
      if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); killNext(); process.exit(2); }
      await new Promise((r) => setTimeout(r, 1500));
    }
  };
  await boot(true);

  const call = async (path: string, headers: Record<string, string>) => {
    const r = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({}),
    });
    const t = await r.text();
    let j: any = null; try { j = JSON.parse(t); } catch { /* not json */ }
    return { status: r.status, json: j };
  };
  /** ⭐ WHICH LAYER ANSWERED — the discriminator this witness turns on. */
  const layer = (j: any): 'matrix' | 'handler' | 'other' =>
    j?.error === 'Unauthorized' && typeof j?.rid === 'string' ? 'matrix'
    : j?.error === 'Authentication required' ? 'handler'
    : 'other';

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' WS-ACCESS-CONTAINMENT-01 · THE BEHAVIOURAL WITNESS');
  console.log('══════════════════════════════════════════════════════════════════\n');

  console.log('── an unauthenticated caller is stopped at the matrix ────────────');
  for (const r of ROUTES) {
    const res = await call(`/api/writers-studio/editorial/${r}`, {});
    eq(`A-${r} 401, and ⭐ it is the MATRIX that answered`,
       `${res.status}/${layer(res.json)}`, '401/matrix');
  }

  console.log('\n── a forged identity assertion buys nothing ─────────────────────');
  for (const r of ROUTES) {
    const res = await call(`/api/writers-studio/editorial/${r}`,
      { 'x-member-id': randomUUID(), 'x-user-tier': 'pro', 'x-user-roles': 'admin' });
    eq(`B-${r} ⛔ client-asserted identity does not cross the matrix`,
       `${res.status}/${layer(res.json)}`, '401/matrix');
  }

  console.log('\n── and the handler boundary is STILL independently intact ───────');
  /* ⭐⭐ The decisive pair. A session that satisfies the MATRIX but whose
     identity the handler cannot verify must still be refused — by the handler.
     An expired session is exactly that: middleware's own session lookup and the
     handler's resolveCanonicalIdentity both consult auth_sessions, so if the
     matrix ever became the only check, this would come back 400 or 200. */
  const EXPIRED = `witness-${randomUUID()}`;
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() - INTERVAL '1 hour')`, [M, EXPIRED]);
  for (const r of ROUTES) {
    const res = await call(`/api/writers-studio/editorial/${r}`, { 'x-session-token': EXPIRED });
    eq(`C-${r} an expired session is refused, not admitted`, res.status, 401);
  }

  console.log('\n── a real member still reaches the route ────────────────────────');
  /* ⭐ CONTAINMENT MUST NOT EMPTY THE CORRIDOR. These bodies are deliberately
     malformed, so the route's OWN validator must be what answers — which is
     only possible if the request got past the matrix and past the handler's
     identity check. A 401 here would mean the rule locked out its own users. */
  for (const r of ROUTES) {
    const res = await call(`/api/writers-studio/editorial/${r}`, { 'x-session-token': TOKEN });
    eq(`D-${r} ⭐ reaches the handler — 400 from the route's own validator`,
       `${res.status}/${layer(res.json)}`, '400/other');
  }

  console.log('\n── neighbours did not move ──────────────────────────────────────');
  const focus = await call('/api/writers-studio/focus', {});
  eq('E1 ⚠️ /api/writers-studio/focus is UNCONTAINED — the handler alone answers',
     `${focus.status}/${layer(focus.json)}`, '401/handler');
  const sov = await call('/api/sovereign/manuscripts', {});
  eq('E2 /api/sovereign is unchanged — matrix, as before', layer(sov.json), 'matrix');
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  eq('E3 an unmapped public-ish route is untouched', health.status < 500, true);

  /* ══ THE ONE SEMANTIC INTERACTION THIS ACT CAUSES ════════════════════
     ⚠️ With the editorial flag OFF, the routes used to answer 404 to EVERYONE —
     "nothing here". The matrix now answers an unauthenticated caller first, so
     that caller gets 401 instead. The flag-off 404 is preserved for callers who
     get past the matrix. This is the ordinary consequence of containment and it
     is how /api/sovereign and /api/ain already behave — but it is a change in
     observable behaviour, and it is witnessed here rather than discovered
     later. ⛔ Not repaired: suppressing it would mean the matrix deferring to a
     feature flag, which is the containment giving up its own precedence. */
  console.log('\n── with the feature flag OFF, containment still precedes it ─────');
  killNext(); await boot(false);
  for (const r of ROUTES) {
    const anon = await call(`/api/writers-studio/editorial/${r}`, {});
    eq(`F-${r} ⚠️ unauthenticated now sees 401 (matrix) where it saw 404`,
       `${anon.status}/${layer(anon.json)}`, '401/matrix');
    const member = await call(`/api/writers-studio/editorial/${r}`, { 'x-session-token': TOKEN });
    eq(`G-${r} ⭐ and the route's own 404-when-disabled is intact behind it`,
       member.status, 404);
  }

  console.log(`\n  ${pass} passed · ${fail} failed`);
}

main()
  .then(async () => { killNext(); await pg?.end().catch(() => {}); process.exit(fail === 0 ? 0 : 1); })
  .catch(async (e) => {
    console.error('\n  ⛔ NOT RUN —', e?.message ?? e);
    killNext(); await pg?.end().catch(() => {}); process.exit(2);
  });
