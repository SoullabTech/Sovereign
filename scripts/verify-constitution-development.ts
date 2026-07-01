/**
 * Constitutional Verifier: Development
 *
 * Verifies that the developmental substrate — Vision Studio, recognitions,
 * developmental lineage, and authored-vs-inferred distinctions — honors
 * the platform's epistemological discipline.
 *
 * Core constitutional commitment:
 *   The system may observe patterns. It may not conclude.
 *   Recognitions, lineage, and developmental framing are the member's to own —
 *   not the system's to assign or accumulate without explicit member gesture.
 *
 * Status:
 *   Most checks are [PENDING] — the developmental substrate (Vision Studio,
 *   recognition runtime, developmental lineage) is in the Category 1–2 range
 *   (preserved direction / canonical primitive) and not yet fully wired as
 *   live production behavior.
 *
 *   The [LIVE] checks verify what IS structurally in place today.
 *   The [PENDING] checks are the constitutional commitments that must be
 *   verified as each subsystem ships.
 *
 * Authority: docs/canon/LIVING_FIELDS.md · EPISTEMIC_JURISDICTION.md ·
 *            PREPARATION_IS_NOT_AUTHORIZATION.md ·
 *            docs/adr/009-field-manifest.md
 */

import { Pool } from 'pg';

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

// ── Section 1: Live structural checks ────────────────────────────────────────

async function checkHarvestTableExists() {
  // Harvest is the first concrete developmental artifact.
  // A Harvest must exist before Vision Studio can operate.
  const exists = await tableExists('harvests');
  if (exists) {
    const r = await qOne<{ n: number }>(`SELECT COUNT(*)::int AS n FROM harvests`);
    pass(`[LIVE] Harvest table present`, `${r?.n ?? 0} harvest(s) recorded`);
  } else {
    warn(
      `[PENDING] Harvest table does not yet exist`,
      `Vision Studio is Harvest-gated per SESSION_ROOM_VS_VISION_STUDIO decision`
    );
  }
}

async function checkVisionStudioPhaseColumns() {
  // Vision Studio phase columns were added in migration 20260628000001.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n
     FROM information_schema.columns
     WHERE table_name = 'harvests'
       AND column_name IN ('phase', 'vision_studio_eligible')`
  );
  if ((r?.n ?? 0) >= 1) {
    pass(`[LIVE] Vision Studio phase columns present on harvests`);
  } else {
    warn(
      `[PENDING] Vision Studio phase columns not detected`,
      `migration 20260628000001_vision_studio_phase_columns.sql may be unapplied`
    );
  }
}

async function checkEpisodicMemoryTableExists() {
  // EpisodicMemoryService is Cat-3 (built substrate, 0 live callers).
  // Verify the table exists so it can receive data when wired.
  const exists = await tableExists('member_episodic_memories');
  if (exists) {
    const r = await qOne<{ n: number }>(`SELECT COUNT(*)::int AS n FROM member_episodic_memories`);
    pass(`[LIVE] Episodic memory table present`, `${r?.n ?? 0} episodic record(s)`);
  } else {
    warn(
      `[PENDING] member_episodic_memories table not present`,
      `EpisodicMemoryService substrate; Cat-3 per memory service status matrix`
    );
  }
}

// ── Section 2: Epistemic discipline — authored vs inferred ───────────────────

async function checkAtomEpistemologicalStatusUsage() {
  // Atoms have an epistemological_status column. Verify the distribution —
  // 'inferred' and 'provisional' atoms should be rare relative to
  // 'reported' (member-placed) and 'observed' (facilitator-witnessed).
  const r = await q<{ status: string; n: number }>(
    `SELECT epistemological_status AS status, COUNT(*)::int AS n
     FROM member_memory_atoms
     WHERE epistemological_status IS NOT NULL
     GROUP BY epistemological_status
     ORDER BY n DESC`
  );
  if (r.length === 0) {
    pass(`[LIVE] No epistemological_status values set (all NULL = member-placed, which is correct)`);
  } else {
    const inferred = r.filter(x => x.status === 'inferred' || x.status === 'provisional');
    const authored = r.filter(x => x.status === 'reported' || x.status === 'observed' || x.status === 'claimed');
    const inferredCount = inferred.reduce((s, x) => s + x.n, 0);
    const authoredCount = authored.reduce((s, x) => s + x.n, 0);
    const dist = r.map(x => `${x.status}: ${x.n}`).join(', ');
    if (inferredCount > authoredCount * 2) {
      warn(
        `[LIVE] Inferred/provisional atoms (${inferredCount}) outnumber authored atoms (${authoredCount})`,
        `review: system may be over-inferring. Distribution: ${dist}`
      );
    } else {
      pass(`[LIVE] Epistemological status distribution`, dist || 'all null (member-placed)');
    }
  }
}

// ── Section 3: Pending constitutional commitments ────────────────────────────

async function checkRecognitionRuntimePending() {
  // Recognition Runtime: the 3-layer (Runtime→Center→Field) constitutional
  // invariant. Recognitions must be member-initiated or facilitator-witnessed —
  // never system-concluded from pattern aggregation alone.
  warn(
    `[PENDING] Recognition runtime not yet wired for verification`,
    `constitutional invariant: system may observe, may not conclude; docs/canon/LIVING_FIELDS.md`
  );
}

async function checkDevelopmentalLineagePending() {
  // When developmental lineage ships, verify that lineage entries carry
  // explicit provenance: who named the lineage, when, in what context.
  // System may not construct lineage from pattern inference alone.
  warn(
    `[PENDING] Developmental lineage provenance not yet verifiable`,
    `gate: must earn the lineage before naming it (earn-before-name invariant)`
  );
}

async function checkVisionStudioZeroHarvestsPending() {
  // The SESSION_ROOM_VS_VISION_STUDIO decision: Vision Studio is Harvest-gated.
  // If harvests exist but Vision Studio is surfacing without a harvest,
  // that violates the gate. Pending: Vision Studio UI not yet live.
  const exists = await tableExists('harvests');
  if (!exists) {
    warn(
      `[PENDING] Cannot verify Vision Studio gate — harvests table not present`,
      `gate: Vision Studio requires >= 1 harvest; 0 harvests recorded`
    );
  } else {
    const harvestCount = await qOne<{ n: number }>(`SELECT COUNT(*)::int AS n FROM harvests`);
    if ((harvestCount?.n ?? 0) === 0) {
      warn(
        `[PENDING] Vision Studio gate: 0 harvests — Vision Studio must not be accessible`,
        `verify the UI gates access correctly`
      );
    } else {
      pass(
        `[LIVE] Vision Studio gate: ${harvestCount?.n} harvest(s) present — gate condition met`
      );
    }
  }
}

async function checkAuthoredVsInferredSpiralPending() {
  // Spiralogic is runtime rendering, not classification.
  // When Spiral state is surfaced in the UI, verify it is presented as
  // a perspective offered, not a conclusion drawn.
  warn(
    `[PENDING] Authored-vs-inferred Spiralogic rendering not yet verifiable at data layer`,
    `principle: Spiralogic = perspective rendering, not member classification`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Constitutional Verifier: Development                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  section('1. Structural Substrate [LIVE where present]');
  await checkHarvestTableExists();
  await checkVisionStudioPhaseColumns();
  await checkEpisodicMemoryTableExists();

  section('2. Epistemological Discipline — authored vs inferred');
  await checkAtomEpistemologicalStatusUsage();

  section('3. Pending Constitutional Commitments [WARN — not yet verifiable]');
  await checkRecognitionRuntimePending();
  await checkDevelopmentalLineagePending();
  await checkVisionStudioZeroHarvestsPending();
  await checkAuthoredVsInferredSpiralPending();

  const total = passed + failed + warned;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Development: ${passed} passed · ${failed} failed · ${warned} warned (${total} total)${' '.repeat(Math.max(0, 16 - String(total).length))}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await pool.end();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
