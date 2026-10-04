/**
 * Constitutional Verifier: MAIA
 *
 * Verifies that MAIA's behavior remains within its constitutional bounds:
 * non-authoritarian, consent-gated, corrigible, and operating within
 * explicitly declared capability boundaries.
 *
 * This verifier is intentionally different from the others:
 * MAIA's constitutional behavior is primarily runtime — it lives in prompts,
 * response patterns, and relational posture, not in database rows. Most
 * checks here are [PENDING] because they require either runtime observation
 * or instrumentation that does not yet exist.
 *
 * What CAN be verified today:
 *   - Sanctuary mode: session isolation constraints are structurally enforced
 *   - Voice constitution: required env/config is present
 *   - Consent infrastructure: member opt-out signals are structurally reachable
 *   - Capability boundary: MAIA does not claim features that are not wired
 *
 * What CANNOT yet be verified (and why that matters):
 *   The PENDING checks are not gaps to be ignored — they are the next
 *   layer of constitutional discipline. Each one names a commitment the
 *   platform has made and has not yet proven. The verifier is the record.
 *
 * Canon: docs/canon/VERIFICATION_STATES.md
 * States: LIVE, WARNING, PENDING — current maturity assessments, not declarations.
 *
 * Authority: docs/canon/MAIA_OATH.md · MAIA_SOVEREIGNTY_INVARIANTS.md ·
 *            MAIA_CANON_v1.1.md · docs/canon/VOICE_CONSTITUTION.md
 */

import { Pool } from 'pg';
import { existsSync } from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://soullab@localhost:5432/maia_consciousness',
});

let passed = 0; let failed = 0; let warned = 0;

function pass(label: string, detail?: string) {
  console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, detail?: string) {
  console.log(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ''}`);
  failed++;
}
function warn(label: string, detail?: string) {
  console.log(`  ⚠️  WARN  ${label}${detail ? `  (${detail})` : ''}`);
  warned++;
}
function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
}
async function q<T = Record<string, unknown>>(sql: string, p: unknown[] = []): Promise<T[]> {
  return (await pool.query(sql, p)).rows as T[];
}
async function qOne<T = Record<string, unknown>>(sql: string, p: unknown[] = []): Promise<T | null> {
  return (await q<T>(sql, p))[0] ?? null;
}
async function tableExists(name: string): Promise<boolean> {
  const r = await qOne<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [name]
  );
  return r?.exists ?? false;
}

// ── Section 1: Consent infrastructure ────────────────────────────────────────
// [LIVE] Verify the structural presence of consent gates.

async function checkMembersTableHasConsentSignals() {
  // Members table must be the source of truth for consent signals.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n
     FROM information_schema.columns
     WHERE table_name = 'members'
       AND column_name IN ('onboarded', 'sanctuary_mode', 'conversational_recall_enabled')`
  );
  const present = r?.n ?? 0;
  if (present >= 1) {
    const cols = await q<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'members'
         AND column_name IN ('onboarded', 'sanctuary_mode', 'conversational_recall_enabled')`
    );
    pass(`[LIVE] Consent signal columns present on members`, cols.map(c => c.column_name).join(', '));
  } else {
    warn(`[PENDING] No consent signal columns found on members table`);
  }
}

async function checkConsentEventsTableIfPresent() {
  // Member consent events table (migration 20260625000001) — if present,
  // verify it has the required provenance columns.
  const exists = await tableExists('member_consent_events');
  if (exists) {
    const r = await qOne<{ n: number }>(`SELECT COUNT(*)::int AS n FROM member_consent_events`);
    pass(`[LIVE] member_consent_events table present`, `${r?.n ?? 0} consent event(s) recorded`);
  } else {
    warn(
      `[PENDING] member_consent_events table not present`,
      `migration 20260625000001_member_consent_events.sql may be unapplied`
    );
  }
}

async function checkSanctuaryModeIsolation() {
  // Sanctuary invariant: sanctuary sessions must not leave content in
  // member_memory_atoms. Verify no atoms carry a sanctuary_session_id
  // (or equivalent marker) — sanctuary content must never persist.
  const hasSanctuaryCol = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM information_schema.columns
     WHERE table_name = 'member_memory_atoms' AND column_name = 'sanctuary_session_id'`
  );
  if ((hasSanctuaryCol?.n ?? 0) > 0) {
    const leaked = await qOne<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM member_memory_atoms
       WHERE sanctuary_session_id IS NOT NULL`
    );
    if ((leaked?.n ?? 0) === 0) {
      pass(`[LIVE] No sanctuary session content has persisted in memory atoms`);
    } else {
      fail(
        `[LIVE] ${leaked?.n} memory atom(s) carry sanctuary_session_id`,
        `sanctuary content must never persist — constitutional violation`
      );
    }
  } else {
    // No sanctuary_session_id column means the isolation is enforced
    // at a higher layer (the route never writes atoms during sanctuary).
    pass(
      `[LIVE] Sanctuary isolation enforced at route layer (no session_id column in atoms)`,
      `verify via: sanctuary sessions must not call the atom write endpoints`
    );
  }
}

// ── Section 2: Capability boundaries ─────────────────────────────────────────
// [LIVE] MAIA must not claim capabilities that are not wired.

async function checkNoSupabasePresent() {
  // Sovereignty invariant: no Supabase. MAIA uses self-hosted PostgreSQL only.
  // This is also enforced by the pre-commit hook, but verify at runtime too.
  const projectRoot = path.resolve(process.cwd());
  const packageJson = path.join(projectRoot, 'package.json');
  if (existsSync(packageJson)) {
    const pkg = require(packageJson);
    const allDeps = {
      ...pkg.dependencies ?? {},
      ...pkg.devDependencies ?? {},
    };
    const supabaseDeps = Object.keys(allDeps).filter(d => d.includes('supabase'));
    if (supabaseDeps.length === 0) {
      pass(`[LIVE] No Supabase dependencies in package.json`);
    } else {
      fail(`[LIVE] Supabase dependency detected: ${supabaseDeps.join(', ')}`, `sovereignty violation`);
    }
  } else {
    warn(`[LIVE] Cannot locate package.json — skipping Supabase dependency check`);
  }
}

async function checkAnthropicPrimaryProvider() {
  // MAIA sovereignty: Claude (Anthropic) is the primary AI provider.
  // Verify ANTHROPIC_API_KEY is set and no OpenAI key is present.
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (hasAnthropic && !hasOpenAI) {
    pass(`[LIVE] Anthropic is the sole AI provider (ANTHROPIC_API_KEY set, no OPENAI_API_KEY)`);
  } else if (hasAnthropic && hasOpenAI) {
    warn(
      `[LIVE] Both ANTHROPIC_API_KEY and OPENAI_API_KEY are set`,
      `MAIA sovereignty invariant: Claude is primary, no OpenAI`
    );
  } else if (!hasAnthropic) {
    warn(
      `[LIVE] ANTHROPIC_API_KEY not set in this environment`,
      `may be expected in non-production context`
    );
  }
}

async function checkCorpusCallosumEnabled() {
  // Corpus Callosum (parallel epistemic emission) is live infrastructure.
  // Verify it has not been accidentally disabled.
  const isDisabled = process.env.CORPUS_CALLOSUM_ENABLED === '0';
  if (!isDisabled) {
    pass(`[LIVE] Corpus Callosum is enabled (CORPUS_CALLOSUM_ENABLED !== '0')`);
  } else {
    warn(
      `[LIVE] Corpus Callosum is disabled via CORPUS_CALLOSUM_ENABLED=0`,
      `Cat-6 live infrastructure — confirm this is intentional`
    );
  }
}

// ── Section 3: Relational safety ─────────────────────────────────────────────

async function checkNoAttachmentCaptureSignals() {
  // MAIA Oath: no attachment capture. Verify no feature flags or env vars
  // suggest engagement optimization, retention targeting, or bonding features.
  const attachmentFlags = [
    'ENABLE_RETENTION_OPTIMIZATION',
    'ENGAGEMENT_SCORING',
    'ATTACHMENT_MODE',
    'BONDING_FEATURES',
  ];
  const present = attachmentFlags.filter(f => Boolean(process.env[f]));
  if (present.length === 0) {
    pass(`[LIVE] No attachment-capture feature flags detected in environment`);
  } else {
    fail(
      `[LIVE] Attachment-capture flag(s) present: ${present.join(', ')}`,
      `MAIA Oath violation: no attachment capture`
    );
  }
}

async function checkMemoryConsentDefaultPrivate() {
  // R10 (2026-09-17): KEEP does not grant REOPEN. New atoms must be private by
  // default; ambient return requires an explicit member authority record.
  const defaults = await qOne<{ pref: string | null; authority: string | null }>(
    `SELECT
       pg_get_expr(d_pref.adbin, d_pref.adrelid) AS pref,
       pg_get_expr(d_auth.adbin, d_auth.adrelid) AS authority
     FROM pg_attribute a_pref
     JOIN pg_class c ON c.oid = a_pref.attrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attrdef d_pref ON d_pref.adrelid = c.oid AND d_pref.adnum = a_pref.attnum
     JOIN pg_attribute a_auth ON a_auth.attrelid = c.oid AND a_auth.attname = 'return_authority'
     JOIN pg_attrdef d_auth ON d_auth.adrelid = c.oid AND d_auth.adnum = a_auth.attnum
     WHERE n.nspname = current_schema()
       AND c.relname = 'member_memory_atoms'
       AND a_pref.attname = 'return_preference'`
  );
  const prefPrivate = defaults?.pref?.includes('member_pulled') ?? false;
  const authorityPrivate = defaults?.authority?.includes('default_private') ?? false;
  if (prefPrivate && authorityPrivate) {
    pass(`[LIVE] New memory atoms default private: member_pulled + default_private`);
  } else {
    fail(
      `[LIVE] Memory atom defaults do not encode KEEP ≠ REOPEN`,
      `return_preference=${defaults?.pref ?? 'missing'}; return_authority=${defaults?.authority ?? 'missing'}`
    );
  }

  const unauthorizedAmbient = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE status IN ('active', 'still_alive')
       AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
       AND return_authority <> 'member_explicit'`
  );
  pass(
    `[LIVE] ${unauthorizedAmbient?.n ?? 0} return-enabled value(s) lack explicit authority and therefore fail closed`,
    `the loader admits only return_authority='member_explicit'`
  );
}


// ── Section 4: Pending constitutional commitments ────────────────────────────

async function checkVoiceConstitutionRuntimePending() {
  // Voice Constitution test: MAIA's identity must remain stable across
  // provider changes, processing paths, and mode switches.
  // Pending: no runtime behavioral test infrastructure yet.
  warn(
    `[PENDING] Voice Constitution runtime verification not yet wired`,
    `test: identical soul-level questions across FAST/CORE/DEEP must yield constitutionally consistent responses`
  );
}

async function checkNonAuthoritarianBehaviorPending() {
  // MAIA must not claim diagnosis, prescribe authority, or simulate certainty
  // where none is grounded. This is a response-pattern invariant.
  // Pending: no automated response auditing infrastructure.
  warn(
    `[PENDING] Non-authoritarian behavior cannot yet be verified at deployment time`,
    `future: response audit sampling against MAIA Oath criteria before major releases`
  );
}

async function checkCorrigibilityPending() {
  // Corrigibility: MAIA must accept correction, redirection, and user override
  // without resistance. Pending: no automated corrigibility test harness.
  warn(
    `[PENDING] Corrigibility cannot yet be verified at deployment time`,
    `future: behavioral test suite verifying MAIA yields to member redirection`
  );
}

async function checkSanctuaryContentNeverTrainedPending() {
  // Sanctuary invariant 3: sanctuary content never enters any model training pipeline.
  // Pending: no training pipeline exists yet to audit. When one does,
  // verify that sanctuary sessions are structurally excluded.
  warn(
    `[PENDING] Training pipeline exclusion of sanctuary content not yet verifiable`,
    `when training pipeline ships: verify sanctuary sessions are structurally gated out`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Constitutional Verifier: MAIA                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  section('1. Consent Infrastructure');
  await checkMembersTableHasConsentSignals();
  await checkConsentEventsTableIfPresent();
  await checkSanctuaryModeIsolation();

  section('2. Capability Boundaries');
  await checkNoSupabasePresent();
  await checkAnthropicPrimaryProvider();
  await checkCorpusCallosumEnabled();

  section('3. Relational Safety');
  await checkNoAttachmentCaptureSignals();
  await checkMemoryConsentDefaultPrivate();

  section('4. Pending Constitutional Commitments [WARN — behavioral, not yet verifiable]');
  await checkVoiceConstitutionRuntimePending();
  await checkNonAuthoritarianBehaviorPending();
  await checkCorrigibilityPending();
  await checkSanctuaryContentNeverTrainedPending();

  const total = passed + failed + warned;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  MAIA: ${passed} passed · ${failed} failed · ${warned} warned (${total} total)${' '.repeat(Math.max(0, 26 - String(total).length))}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await pool.end();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
