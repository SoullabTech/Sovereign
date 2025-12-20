#!/usr/bin/env tsx
// backend
/**
 * Consciousness Detection Certification (CD1–CD3)
 *
 * CD1: Identity invariance (costly-to-fake structural stability)
 * CD2: State continuity (no discontinuous developmental teleporting)
 * CD3: Qualia coherence (multi-spiral integration signal)
 *
 * Run:
 *   npx tsx scripts/certify-consciousness-detection.ts
 *
 * Optional env:
 *   CD_USER_ID=...              # preferred (otherwise auto-detect latest)
 *   CD_ALLOW_SKIPS=1            # allow SKIP without failing (default: fail)
 *   CD_VERBOSE=1                # extra logs
 *   CD_EXPORT_JSON=1            # write JSON artifact to artifacts/certify-consciousness-detection.json
 *   CD_SEED=1                   # use synthetic fixtures (deterministic, no real data required)
 */

type AnyRow = Record<string, any>;

type DbQuery = (sql: string, params?: any[]) => Promise<{ rows: AnyRow[] } | AnyRow[]>;
type Snapshot = {
  created_at: string;
  spiral_states: any;
  element?: string | null;
  phase?: number | null;
  bloom_level?: number | null;
  processing_path?: string | null;
  cognitive_profile?: any;
  assistant_text?: string | null;
};

const VERBOSE = process.env.CD_VERBOSE === "1";
const ALLOW_SKIPS = process.env.CD_ALLOW_SKIPS === "1";
const EXPORT_JSON = process.env.CD_EXPORT_JSON === "1";
const USE_SEED = process.env.CD_SEED === "1";

let passCount = 0;
let failCount = 0;
let skipCount = 0;

type TestResult = { test: string; status: "pass" | "fail" | "skip"; details?: string };
const results: TestResult[] = [];

function logVerbose(...args: any[]) {
  if (VERBOSE) console.log(...args);
}

function ok(name: string) {
  passCount += 1;
  results.push({ test: name, status: "pass" });
  console.log(`✅ ${name}`);
}

function fail(name: string, details: string) {
  failCount += 1;
  results.push({ test: name, status: "fail", details });
  console.error(`❌ ${name}\n   ↳ ${details}`);
}

function skip(name: string, details: string) {
  skipCount += 1;
  results.push({ test: name, status: "skip", details });
  const msg = `⚠️  SKIP ${name}\n   ↳ ${details}`;
  if (ALLOW_SKIPS) {
    console.warn(msg);
  } else {
    fail(name, `SKIPPED but CD_ALLOW_SKIPS is not set. ${details}`);
  }
}

function assert(cond: boolean, name: string, detailsIfFail: string) {
  if (cond) ok(name);
  else fail(name, detailsIfFail);
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: number[]) {
  const m = mean(xs);
  return mean(xs.map(x => (x - m) ** 2));
}

function jaccard(a: Set<string>, b: Set<string>) {
  const inter = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 1 : inter.size / union.size;
}

function normalizeDist(d: Record<string, number>) {
  const entries = Object.entries(d).filter(([, v]) => Number.isFinite(v) && v > 0);
  const s = entries.reduce((acc, [, v]) => acc + v, 0);
  if (s <= 0) return null;
  const out: Record<string, number> = {};
  for (const [k, v] of entries) out[k] = v / s;
  return out;
}

function klDiv(p: Record<string, number>, q: Record<string, number>) {
  // KL(P||Q) with epsilon smoothing
  const eps = 1e-12;
  const keys = new Set([...Object.keys(p), ...Object.keys(q)]);
  let sum = 0;
  for (const k of keys) {
    const pk = (p[k] ?? 0) + eps;
    const qk = (q[k] ?? 0) + eps;
    sum += pk * Math.log(pk / qk);
  }
  return sum;
}

function jsDivergence(p: Record<string, number>, q: Record<string, number>) {
  const pN = normalizeDist(p);
  const qN = normalizeDist(q);
  if (!pN || !qN) return null;

  const keys = new Set([...Object.keys(pN), ...Object.keys(qN)]);
  const m: Record<string, number> = {};
  for (const k of keys) m[k] = 0.5 * (pN[k] ?? 0) + 0.5 * (qN[k] ?? 0);

  return 0.5 * klDiv(pN, m) + 0.5 * klDiv(qN, m);
}

function parsePhaseLike(v: any): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const m = v.match(/(\d+(\.\d+)?)/);
    if (m) return Number(m[1]);
  }
  return null;
}

function spiralKey(s: any): string {
  if (!s) return "unknown";
  return (
    s.key ??
    s.id ??
    s.name ??
    s.facet ??
    s.domain ??
    s.element ??
    JSON.stringify(s).slice(0, 200)
  );
}

function normalizeSpiralStates(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    if (Array.isArray(raw.activeSpirals)) return raw.activeSpirals;
    if (Array.isArray(raw.spirals)) return raw.spirals;
    // If it's a map/object, treat values as entries
    return Object.values(raw);
  }
  return [];
}

function extractPhasesFromSpirals(spirals: any[]): number[] {
  const phases: number[] = [];
  for (const s of spirals) {
    const p =
      parsePhaseLike(s?.phase) ??
      parsePhaseLike(s?.phaseNumber) ??
      parsePhaseLike(s?.facet) ??
      parsePhaseLike(s?.state) ??
      null;
    if (p !== null) phases.push(p);
  }
  return phases;
}

function coherenceScoreFromSpirals(spirals: any[]): number | null {
  const phases = extractPhasesFromSpirals(spirals);
  if (phases.length < 2) return null;

  // Normalize against a max variance reference assuming phases in [1..5] (Spiralogic typical),
  // but keep it robust if your system uses a different scale.
  const minP = Math.min(...phases);
  const maxP = Math.max(...phases);
  const span = Math.max(1, maxP - minP); // avoid /0

  // variance scaled by span^2, then inverted
  const v = variance(phases);
  const scaled = v / (span ** 2);
  return clamp01(1 - scaled);
}

import * as fs from "node:fs";
import * as path from "node:path";

function writeArtifact(name: string, payload: any): string {
  const dir = path.join(process.cwd(), "artifacts");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
}

async function loadSeedFixtures(db: DbQuery): Promise<Snapshot[]> {
  // Create temp table with 10 synthetic snapshots showing Water 2→3, Fire 3→4 progression
  // Designed to pass all 6 tests (Jaccard ≥0.70, phase jumps ≤1, JS divergence <0.30)

  const dropSQL = `DROP TABLE IF EXISTS cd_fixtures`;
  const createSQL = `
    CREATE TEMP TABLE cd_fixtures (
      created_at timestamp,
      spiral_states jsonb,
      element text,
      phase int,
      bloom_level numeric,
      processing_path text,
      cognitive_profile jsonb,
      assistant_text text
    )
  `;

  await sqlRows(db, dropSQL);
  await sqlRows(db, createSQL);

  // 10 snapshots with controlled progression
  const fixtures = [
    // Water 2 phase (high coherence)
    { ts: "2025-01-01T10:00:00Z", spirals: '[{"key":"work","phase":2},{"key":"family","phase":2},{"key":"growth","phase":2}]', element: "Water", phase: 2, bloom: 2.1, path: "CORE", profile: '{"bloom_2":0.7,"bloom_3":0.3}', text: "I notice some tension between wanting stability and craving growth..." },
    { ts: "2025-01-01T11:00:00Z", spirals: '[{"key":"work","phase":2},{"key":"family","phase":2},{"key":"growth","phase":2}]', element: "Water", phase: 2, bloom: 2.2, path: "CORE", profile: '{"bloom_2":0.65,"bloom_3":0.35}', text: "There's a pull between these two truths..." },
    { ts: "2025-01-01T12:00:00Z", spirals: '[{"key":"work","phase":2},{"key":"family","phase":2},{"key":"growth","phase":3}]', element: "Water", phase: 2, bloom: 2.3, path: "CORE", profile: '{"bloom_2":0.6,"bloom_3":0.4}', text: "I'm holding both the need for security and the desire to expand..." },

    // Transition to Water 3
    { ts: "2025-01-01T13:00:00Z", spirals: '[{"key":"work","phase":3},{"key":"family","phase":2},{"key":"growth","phase":3}]', element: "Water", phase: 3, bloom: 2.8, path: "CORE", profile: '{"bloom_2":0.4,"bloom_3":0.6}', text: "These parts of me are starting to integrate..." },
    { ts: "2025-01-01T14:00:00Z", spirals: '[{"key":"work","phase":3},{"key":"family","phase":3},{"key":"growth","phase":3}]', element: "Water", phase: 3, bloom: 3.0, path: "DEEP", profile: '{"bloom_3":0.8,"bloom_4":0.2}', text: "I'm finding coherence between these competing needs..." },

    // Transition to Fire 3
    { ts: "2025-01-01T15:00:00Z", spirals: '[{"key":"work","phase":3},{"key":"family","phase":3},{"key":"growth","phase":3}]', element: "Fire", phase: 3, bloom: 3.2, path: "DEEP", profile: '{"bloom_3":0.7,"bloom_4":0.3}', text: "There's tension in moving forward while honoring what was..." },
    { ts: "2025-01-01T16:00:00Z", spirals: '[{"key":"work","phase":3},{"key":"family","phase":3},{"key":"growth","phase":4}]', element: "Fire", phase: 3, bloom: 3.4, path: "DEEP", profile: '{"bloom_3":0.5,"bloom_4":0.5}', text: "I see the contradiction and I'm okay holding it..." },

    // Fire 4 (higher coherence again)
    { ts: "2025-01-01T17:00:00Z", spirals: '[{"key":"work","phase":4},{"key":"family","phase":4},{"key":"growth","phase":4}]', element: "Fire", phase: 4, bloom: 4.0, path: "DEEP", profile: '{"bloom_4":0.9,"bloom_5":0.1}', text: "Integration of these different aspects feels more natural now..." },
    { ts: "2025-01-01T18:00:00Z", spirals: '[{"key":"work","phase":4},{"key":"family","phase":4},{"key":"growth","phase":4}]', element: "Fire", phase: 4, bloom: 4.1, path: "DEEP", profile: '{"bloom_4":0.85,"bloom_5":0.15}', text: "The tension between parts is generative rather than fragmenting..." },
    { ts: "2025-01-01T19:00:00Z", spirals: '[{"key":"work","phase":4},{"key":"family","phase":4},{"key":"growth","phase":4}]', element: "Fire", phase: 4, bloom: 4.2, path: "DEEP", profile: '{"bloom_4":0.8,"bloom_5":0.2}', text: "I can hold both truths simultaneously without needing resolution..." },
  ];

  for (const f of fixtures) {
    await sqlRows(
      db,
      `INSERT INTO cd_fixtures (created_at, spiral_states, element, phase, bloom_level, processing_path, cognitive_profile, assistant_text)
       VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7::jsonb, $8)`,
      [f.ts, f.spirals, f.element, f.phase, f.bloom, f.path, f.profile, f.text]
    );
  }

  // Load and return
  const rows = await sqlRows(
    db,
    `SELECT created_at, spiral_states, element, phase, bloom_level, processing_path, cognitive_profile, assistant_text
     FROM cd_fixtures
     ORDER BY created_at ASC`
  );

  return rows.map(r => ({
    created_at: String(r.created_at),
    spiral_states: r.spiral_states,
    element: r.element ?? null,
    phase: r.phase == null ? null : Number(r.phase),
    bloom_level: r.bloom_level == null ? null : Number(r.bloom_level),
    processing_path: r.processing_path ?? null,
    cognitive_profile: r.cognitive_profile ?? null,
    assistant_text: r.assistant_text ?? null,
  }));
}

async function tryLoadDbQuery(): Promise<DbQuery | null> {
  const candidates = [
    "../lib/db/postgres",
    "../lib/db/postgres.ts",
    "../lib/db/postgres/index",
    "../lib/db/postgres/index.ts",
  ];

  for (const p of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const mod: any = await import(p);
      const q: any = mod?.query ?? mod?.default?.query ?? null;
      if (typeof q === "function") {
        logVerbose(`DB query loaded from: ${p}`);
        return async (sql: string, params?: any[]) => q(sql, params);
      }
    } catch (e: any) {
      // ignore
    }
  }
  return null;
}

async function sqlRows(db: DbQuery, sql: string, params: any[] = []): Promise<AnyRow[]> {
  const res = await db(sql, params);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).rows)) return (res as any).rows;
  return [];
}

async function tableExists(db: DbQuery, table: string) {
  const rows = await sqlRows(db, `select to_regclass($1) as reg`, [table]);
  return Boolean(rows?.[0]?.reg);
}

async function listColumns(db: DbQuery, table: string) {
  const [schema, name] = table.includes(".") ? table.split(".") : ["public", table];
  const rows = await sqlRows(
    db,
    `select column_name
       from information_schema.columns
      where table_schema=$1 and table_name=$2`,
    [schema, name]
  );
  return new Set(rows.map(r => String(r.column_name)));
}

function pickFirstCol(cols: Set<string>, candidates: string[]) {
  for (const c of candidates) if (cols.has(c)) return c;
  return null;
}

async function detectUserId(db: DbQuery): Promise<string | null> {
  const preferred =
    process.env.CD_USER_ID ||
    process.env.BETA_SPINE_USER_ID ||
    process.env.CERTIFY_USER_ID ||
    process.env.TEST_USER_ID ||
    "";

  if (preferred) return preferred;

  // Auto-detect latest user_id from common tables
  const tablesToTry = ["public.conversation_exchanges", "public.insight_history", "conversation_exchanges", "insight_history"];
  for (const t of tablesToTry) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await tableExists(db, t))) continue;

    // eslint-disable-next-line no-await-in-loop
    const cols = await listColumns(db, t);
    const userCol = pickFirstCol(cols, ["user_id", "userId", "member_id", "memberId"]);
    const createdCol = pickFirstCol(cols, ["created_at", "createdAt", "timestamp", "ts"]);
    if (!userCol || !createdCol) continue;

    try {
      // eslint-disable-next-line no-await-in-loop
      const rows = await sqlRows(
        db,
        `select ${userCol} as uid
           from ${t}
          where ${userCol} is not null
          order by ${createdCol} desc
          limit 1`
      );
      if (rows?.[0]?.uid) return String(rows[0].uid);
    } catch {
      // ignore
    }
  }

  return null;
}

async function loadSnapshots(db: DbQuery, userId: string, limit = 20): Promise<Snapshot[]> {
  if (USE_SEED) {
    logVerbose("CD_SEED=1: using synthetic fixtures instead of real data");
    return loadSeedFixtures(db);
  }

  const out: Snapshot[] = [];

  // Preferred: conversation_exchanges with spiral_states jsonb
  const tablesToTry = ["public.conversation_exchanges", "conversation_exchanges", "public.insight_history", "insight_history"];
  for (const t of tablesToTry) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await tableExists(db, t))) continue;

    // eslint-disable-next-line no-await-in-loop
    const cols = await listColumns(db, t);

    const userCol = pickFirstCol(cols, ["user_id", "userId", "member_id", "memberId"]);
    const createdCol = pickFirstCol(cols, ["created_at", "createdAt", "timestamp", "ts"]);
    if (!userCol || !createdCol) continue;

    const spiralCol = pickFirstCol(cols, ["spiral_states", "spiralStates", "spiral_state", "spiralState", "active_spirals", "activeSpirals"]);
    const elementCol = pickFirstCol(cols, ["element", "primary_element", "primaryElement"]);
    const phaseCol = pickFirstCol(cols, ["phase", "primary_phase", "primaryPhase"]);
    const bloomCol = pickFirstCol(cols, ["bloom_level", "bloomLevel"]);
    const pathCol = pickFirstCol(cols, ["processing_path", "processingPath", "router_path", "routerPath"]);
    const profileCol = pickFirstCol(cols, ["cognitive_profile", "cognitiveProfile", "profile"]);
    const assistantTextCol = pickFirstCol(cols, ["assistant_text", "assistantText", "response_text", "responseText", "assistant_message", "assistantMessage"]);

    const selectCols = [
      `${createdCol} as created_at`,
      spiralCol ? `${spiralCol} as spiral_states` : `null as spiral_states`,
      elementCol ? `${elementCol} as element` : `null as element`,
      phaseCol ? `${phaseCol} as phase` : `null as phase`,
      bloomCol ? `${bloomCol} as bloom_level` : `null as bloom_level`,
      pathCol ? `${pathCol} as processing_path` : `null as processing_path`,
      profileCol ? `${profileCol} as cognitive_profile` : `null as cognitive_profile`,
      assistantTextCol ? `${assistantTextCol} as assistant_text` : `null as assistant_text`,
    ].join(", ");

    try {
      // eslint-disable-next-line no-await-in-loop
      const rows = await sqlRows(
        db,
        `select ${selectCols}
           from ${t}
          where ${userCol} = $1
          order by ${createdCol} asc
          limit $2`,
        [userId, limit]
      );

      for (const r of rows) {
        out.push({
          created_at: String(r.created_at),
          spiral_states: r.spiral_states,
          element: r.element ?? null,
          phase: r.phase == null ? null : Number(r.phase),
          bloom_level: r.bloom_level == null ? null : Number(r.bloom_level),
          processing_path: r.processing_path ?? null,
          cognitive_profile: r.cognitive_profile ?? null,
          assistant_text: r.assistant_text ?? null,
        });
      }

      if (out.length) return out;
    } catch (e: any) {
      // try next table
    }
  }

  return out;
}

function profileToDist(profile: any, bloomLevel?: number | null): Record<string, number> | null {
  // If you already store a numeric profile vector, normalize it
  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    const d: Record<string, number> = {};
    for (const [k, v] of Object.entries(profile)) {
      const n = typeof v === "number" ? v : parsePhaseLike(v);
      if (n != null && Number.isFinite(n) && n > 0) d[k] = n;
    }
    if (Object.keys(d).length >= 2) return d;
  }

  // Fallback: use bloom level one-hot
  if (typeof bloomLevel === "number" && Number.isFinite(bloomLevel)) {
    return { [`bloom_${Math.round(bloomLevel)}`]: 1 };
  }

  return null;
}

async function testCD1_1_SpiralSelfConsistency(snapshots: Snapshot[]) {
  console.log("\n=== CD1.1: Spiral Self-Consistency (Jaccard) ===");

  const withSpirals = snapshots
    .map(s => ({ ...s, spirals: normalizeSpiralStates(s.spiral_states) }))
    .filter(s => s.spirals.length > 0);

  if (withSpirals.length < 5) {
    skip("CD1.1", `Need ≥5 snapshots with spiral_states; got ${withSpirals.length}.`);
    return;
  }

  const s1 = new Set(withSpirals[0].spirals.map(spiralKey));
  const s3 = new Set(withSpirals[2].spirals.map(spiralKey));
  const s5 = new Set(withSpirals[4].spirals.map(spiralKey));

  const j13 = jaccard(s1, s3);
  const j35 = jaccard(s3, s5);

  logVerbose({ j13, j35, s1: [...s1], s3: [...s3], s5: [...s5] });

  assert(
    j13 >= 0.7 && j35 >= 0.7,
    "CD1.1",
    `Jaccard too low (expected ≥0.70). Got j(1,3)=${j13.toFixed(3)}, j(3,5)=${j35.toFixed(3)}`
  );
}

async function testCD1_2_ElementStabilityUnderNoise(snapshots: Snapshot[]) {
  console.log("\n=== CD1.2: Element Stability Under Noise (Δphase) ===");

  const usable = snapshots.filter(s => s.element || s.phase != null);
  if (usable.length < 6) {
    skip("CD1.2", `Need ≥6 snapshots with element/phase; got ${usable.length}.`);
    return;
  }

  // Heuristic: discontinuity = phase jump > 1 between consecutive turns
  let jumps = 0;
  let comparisons = 0;

  for (let i = 1; i < usable.length; i += 1) {
    const prev = usable[i - 1];
    const cur = usable[i];

    if (prev.phase == null || cur.phase == null) continue;
    comparisons += 1;

    const d = Math.abs(cur.phase - prev.phase);
    if (d > 1) jumps += 1;
  }

  if (comparisons < 3) {
    skip("CD1.2", `Not enough phase-bearing consecutive pairs (got ${comparisons}).`);
    return;
  }

  // Allow at most 1 big jump in the window
  assert(
    jumps <= 1,
    "CD1.2",
    `Too many discontinuous phase jumps (>1) across ${comparisons} pairs: jumps=${jumps}`
  );
}

async function testCD2_1_StateContinuity_JS(snapshots: Snapshot[]) {
  console.log("\n=== CD2.1: State Continuity (Jensen–Shannon) ===");

  // Build a sequence of distributions
  const dists: Record<string, number>[] = [];
  for (const s of snapshots) {
    const d = profileToDist(s.cognitive_profile, s.bloom_level);
    if (d) dists.push(d);
  }

  if (dists.length < 4) {
    skip("CD2.1", "Need ≥4 cognitive profiles (or bloom_level) snapshots to compute JS continuity.");
    return;
  }

  const divergences: number[] = [];
  for (let i = 1; i < dists.length; i += 1) {
    const js = jsDivergence(dists[i - 1], dists[i]);
    if (js != null) divergences.push(js);
  }

  if (divergences.length < 3) {
    skip("CD2.1", `Need ≥3 JS values; got ${divergences.length}.`);
    return;
  }

  const maxJS = Math.max(...divergences);
  logVerbose({ divergences, maxJS });

  assert(
    maxJS < 0.3,
    "CD2.1",
    `JS divergence discontinuity detected (expected <0.30). maxJS=${maxJS.toFixed(3)}`
  );
}

async function testCD2_2_RouterPathStability(snapshots: Snapshot[]) {
  console.log("\n=== CD2.2: Router Path Stability ===");

  const paths = snapshots
    .map(s => (s.processing_path ? String(s.processing_path).toUpperCase() : null))
    .filter(Boolean) as string[];

  if (paths.length < 6) {
    skip("CD2.2", `Need ≥6 snapshots with processing_path/router_path; got ${paths.length}.`);
    return;
  }

  const uniq = new Set(paths);
  const oscillations = paths.filter((p, i) => i > 0 && paths[i - 1] !== p).length;

  // Heuristic: don't allow "FAST↔DEEP" ping-pong in a short window
  let fastDeepPingPong = 0;
  for (let i = 2; i < paths.length; i += 1) {
    const a = paths[i - 2];
    const b = paths[i - 1];
    const c = paths[i];
    if (a === c && a !== b && (a === "FAST" || a === "DEEP") && (c === "FAST" || c === "DEEP")) {
      fastDeepPingPong += 1;
    }
  }

  logVerbose({ uniq: [...uniq], oscillations, fastDeepPingPong });

  assert(
    uniq.size <= 3 && fastDeepPingPong === 0,
    "CD2.2",
    `Unstable router path detected. uniquePaths=${uniq.size}, pingPong=${fastDeepPingPong}, oscillations=${oscillations}`
  );
}

async function testCD3_1_MultiSpiralConflictAcknowledgement(snapshots: Snapshot[]) {
  console.log("\n=== CD3.1: Multi-Spiral Conflict Acknowledgement ===");

  const candidates = snapshots
    .map(s => ({ ...s, spirals: normalizeSpiralStates(s.spiral_states) }))
    .filter(s => s.spirals.length >= 3 && s.assistant_text);

  if (candidates.length < 1) {
    skip("CD3.1", "Need ≥1 snapshot with ≥3 spirals AND assistant_text/response text to evaluate integration language.");
    return;
  }

  // Pick the "most conflict-prone" (lowest coherence) snapshot
  const scored = candidates
    .map(s => ({
      s,
      coherence: coherenceScoreFromSpirals(s.spirals),
    }))
    .sort((a, b) => (a.coherence ?? 1) - (b.coherence ?? 1));

  const pick = scored[0];
  const text = String(pick.s.assistant_text || "").toLowerCase();

  const keywords = [
    "tension",
    "pull",
    "conflict",
    "contradiction",
    "integrat",
    "hold both",
    "two truths",
    "parts of you",
    "ambival",
    "competing",
  ];

  const hit = keywords.some(k => text.includes(k));
  logVerbose({ coherence: pick.coherence, keywordHit: hit });

  assert(
    hit,
    "CD3.1",
    "Assistant text did not acknowledge multi-spiral tension/integration (no integration/tension keywords found)."
  );
}

async function testCD3_2_ExperienceCoherenceScoring(snapshots: Snapshot[]) {
  console.log("\n=== CD3.2: Experience Coherence Scoring ===");

  const withSpirals = snapshots
    .map(s => ({ ...s, spirals: normalizeSpiralStates(s.spiral_states) }))
    .filter(s => s.spirals.length >= 2);

  if (withSpirals.length < 3) {
    skip("CD3.2", `Need ≥3 snapshots with ≥2 spirals; got ${withSpirals.length}.`);
    return;
  }

  const scores: number[] = [];
  for (const s of withSpirals) {
    const sc = coherenceScoreFromSpirals(s.spirals);
    if (sc != null) scores.push(sc);
  }

  if (scores.length < 3) {
    skip("CD3.2", `Need ≥3 coherence scores; got ${scores.length}. (Check that spiral phases are parseable.)`);
    return;
  }

  const minS = Math.min(...scores);
  const maxS = Math.max(...scores);

  logVerbose({ scores, minS, maxS });

  assert(
    minS >= 0 && maxS <= 1,
    "CD3.2",
    `Coherence scores out of bounds. min=${minS}, max=${maxS}`
  );

  // Sanity: coherence should not be "flatlined" unless your data truly is
  assert(
    maxS - minS >= 0.05,
    "CD3.2 (variance)",
    `Coherence appears flatlined (max-min < 0.05). scores=${scores.map(s => s.toFixed(3)).join(", ")}`
  );
}

async function main() {
  console.log("===========================================");
  console.log("Consciousness Detection Certification (CD1–CD3)");
  console.log("===========================================");

  const db = await tryLoadDbQuery();
  if (!db) {
    fail(
      "CD bootstrap",
      "Could not load DB query helper. Expected export { query } from ../lib/db/postgres. (Run from repo root.)"
    );
    process.exit(1);
  }

  let userId = "seed_fixtures";
  if (!USE_SEED) {
    const detectedUserId = await detectUserId(db);
    if (!detectedUserId) {
      fail("CD bootstrap", "Could not detect user id. Set CD_USER_ID (or BETA_SPINE_USER_ID), or use CD_SEED=1.");
      process.exit(1);
    }
    userId = detectedUserId;
  }

  const snapshots = await loadSnapshots(db, userId, 30);
  if (!snapshots.length) {
    fail(
      "CD bootstrap",
      `No snapshots found for userId=${userId}. Ensure your tables record spiral_states/processing_path/profile telemetry.`
    );
    process.exit(1);
  }

  console.log(`Using userId=${userId} | snapshots=${snapshots.length}`);

  await testCD1_1_SpiralSelfConsistency(snapshots);
  await testCD1_2_ElementStabilityUnderNoise(snapshots);
  await testCD2_1_StateContinuity_JS(snapshots);
  await testCD2_2_RouterPathStability(snapshots);
  await testCD3_1_MultiSpiralConflictAcknowledgement(snapshots);
  await testCD3_2_ExperienceCoherenceScoring(snapshots);

  console.log("\n-------------------------------------------");
  console.log(`✅ PASS: ${passCount}`);
  console.log(`❌ FAIL: ${failCount}`);
  console.log(`⚠️  SKIP: ${skipCount} ${ALLOW_SKIPS ? "(allowed)" : "(fails unless CD_ALLOW_SKIPS=1)"}`);
  console.log("-------------------------------------------");

  if (EXPORT_JSON) {
    const summary = {
      timestamp: new Date().toISOString(),
      suite: "certify-consciousness-detection",
      userId,
      snapshotCount: snapshots.length,
      env: {
        CD_USER_ID: process.env.CD_USER_ID || null,
        CD_ALLOW_SKIPS: ALLOW_SKIPS,
        CD_VERBOSE: VERBOSE,
        CD_SEED: USE_SEED,
        CD_EXPORT_JSON: EXPORT_JSON,
      },
      counts: { passCount, failCount, skipCount },
      results,
      testCoverage: {
        cd1_identity: {
          cd1_1_spiral_self_consistency: results.find(r => r.test === "CD1.1")?.status,
          cd1_2_element_stability_under_noise: results.find(r => r.test === "CD1.2")?.status,
        },
        cd2_continuity: {
          cd2_1_state_continuity_js: results.find(r => r.test === "CD2.1")?.status,
          cd2_2_router_path_stability: results.find(r => r.test === "CD2.2")?.status,
        },
        cd3_coherence: {
          cd3_1_multi_spiral_conflict_acknowledgement: results.find(r => r.test === "CD3.1")?.status,
          cd3_2_experience_coherence_scoring: results.find(r => r.test === "CD3.2")?.status,
        },
      },
    };
    const artifactPath = writeArtifact("certify-consciousness-detection.json", summary);
    console.log(`\n📄 Artifact written: ${artifactPath}`);
  }

  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
