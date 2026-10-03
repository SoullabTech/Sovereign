/**
 * FIELD-MONITOR-UUID-01 — the persistence contract for `field_monitor_turns`.
 *
 * The table had never received a row. Two independent cast failures, both
 * swallowed by the same fire-and-forget catch, partitioned the traffic between
 * them:
 *
 *   authenticated turn    → session_id uuid   ← 'voice-<uuid>' is not a UUID
 *   memberless turn       → member_id  uuid   ← '' is not a UUID
 *
 * Repairing either alone leaves the other. This suite pins both, plus the
 * schema custody that made the migration necessary in the first place: the
 * live DDL was created out-of-band and existed in no migration directory, so a
 * clean environment could not construct the table at all.
 *
 * ⭐ WHY THESE READ SOURCE. There is no database in this suite, and the route's
 * emission is an inline call inside a streaming handler. Both are pinned at the
 * call site directly, following the precedent set by the F10 Sanctuary boundary
 * proof and VOICE-MIC-LABEL-01.
 *
 * ⛔ THE CONTRACT IS TWO DIFFERENT IDENTITIES.
 *      member_id  = the person.   A real member UUID, NOT NULL, preserved.
 *      session_id = the encounter. An opaque text key.
 *   Ruled out and asserted against below: prefix stripping, UUID extraction, a
 *   synthesized replacement UUID, and weakening member_id to nullable. Three of
 *   the five session-id mint sites contain no UUID to recover, so a normalizing
 *   repair could only have invented one.
 */

import fs from 'fs';
import path from 'path';

const ROUTE = path.join(process.cwd(), 'app/api/voice/stream-conversation/route.ts');
const TELEMETRY = path.join(process.cwd(), 'lib/consciousness/fieldMonitorTelemetry.ts');
const MIGRATION = path.join(
  process.cwd(),
  'database/migrations/20260828000001_field_monitor_turns_session_id_text.sql',
);

/**
 * Strip comments before matching.
 *
 * Both files deliberately quote the pre-repair code in prose explaining why it
 * is gone. Without this, that explanation would fail the test it exists to
 * document — and a future author could satisfy the test by deleting the
 * reasoning rather than keeping the code correct.
 */
const stripTs = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const stripSql = (s: string) => s.replace(/^\s*--[^\n]*$/gm, '');

const routeSrc = () => stripTs(fs.readFileSync(ROUTE, 'utf8'));
const migrationSrc = () => fs.readFileSync(MIGRATION, 'utf8');

/** The `if (...) { fireAndForgetFieldMonitor({...}); }` block, braces walked. */
function readFieldMonitorBlock(): string {
  const src = routeSrc();
  const call = src.indexOf('fireAndForgetFieldMonitor({');
  expect(call).toBeGreaterThan(-1); // the writer must still exist at all

  // Walk back to the `if (` that guards it.
  const guard = src.lastIndexOf('if (', call);
  expect(guard).toBeGreaterThan(-1);

  let depth = 0;
  for (let i = src.indexOf('{', guard); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(guard, i + 1);
    }
  }
  throw new Error('unterminated field-monitor block');
}

/** The CREATE TABLE body for field_monitor_turns, parens walked. */
function readCreateTableBody(): string {
  const sql = stripSql(migrationSrc());
  const start = sql.indexOf('CREATE TABLE IF NOT EXISTS public.field_monitor_turns');
  expect(start).toBeGreaterThan(-1);

  let depth = 0;
  for (let i = sql.indexOf('(', start); i < sql.length; i++) {
    if (sql[i] === '(') depth++;
    else if (sql[i] === ')') {
      depth--;
      if (depth === 0) return sql.slice(start, i + 1);
    }
  }
  throw new Error('unterminated CREATE TABLE');
}

// ───────────────────────────────────────────────────────────────────────────
describe('A. member contract — a memberless turn is not written', () => {
  it('FALSIFIES: the writer is guarded on userId', () => {
    // Pre-repair this read `if (!sanctuary && fullResponse.trim())`, which let a
    // memberless turn through to a uuid NOT NULL column.
    expect(readFieldMonitorBlock()).toMatch(/if\s*\(\s*userId\s*&&/);
  });

  it('FALSIFIES: memberId is the real id, never a placeholder', () => {
    const block = readFieldMonitorBlock();
    expect(block).toMatch(/memberId:\s*userId\s*,/);
    expect(block).not.toMatch(/memberId:\s*userId\s*\|\|/);
  });

  it('pins the exact pre-repair line as forbidden', () => {
    // Negative control. If this string returns, the defect returned with it.
    expect(routeSrc()).not.toContain("memberId: userId || ''");
  });

  it('substitutes no placeholder identity of any shape', () => {
    // A generated uuid, an 'anonymous' sentinel or a nullish coalesce would all
    // satisfy the column while recording a person who does not exist.
    const block = readFieldMonitorBlock();
    for (const forbidden of [/randomUUID/i, /anonymous/i, /memberId:\s*userId\s*\?\?/]) {
      expect(block).not.toMatch(forbidden);
    }
  });

  it('PRESERVES: Sanctuary and empty-response gating are untouched', () => {
    // The repair must not be achievable by disabling the writer.
    const block = readFieldMonitorBlock();
    expect(block).toMatch(/!sanctuary/);
    expect(block).toMatch(/fullResponse\.trim\(\)/);
    expect(block).toMatch(/route:\s*'stream'/);
  });

  it('member_id stays uuid NOT NULL — the caller was wrong, not the column', () => {
    const body = readCreateTableBody();
    expect(body).toMatch(/member_id\s+UUID\s+NOT NULL/i);
    // Weakening to nullable would have admitted the anonymous row this unit
    // exists to refuse.
    expect(body).not.toMatch(/member_id\s+UUID\s*,/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('B. session contract — an opaque encounter key, not a UUID', () => {
  it('FALSIFIES: session_id is created as TEXT', () => {
    expect(readCreateTableBody()).toMatch(/session_id\s+TEXT/i);
  });

  it('FALSIFIES: an existing uuid column is altered, guarded on its current type', () => {
    const sql = stripSql(migrationSrc());
    expect(sql).toMatch(/data_type\s*=\s*'uuid'/);
    expect(sql).toMatch(/ALTER COLUMN session_id TYPE TEXT USING session_id::text/i);
  });

  it('the caller still sends the key unchanged — no normalization anywhere', () => {
    // Ruled out by the census: three of five mint sites produce no UUID at all
    // (`voice-${Date.now()}`, and the route's own 'default' fallback), so a
    // strip or extraction could only have invented an identity.
    const block = readFieldMonitorBlock();
    expect(block).toMatch(/sessionId:\s*effectiveSessionId\s*,/);
    for (const forbidden of [/replace\(/, /slice\(/, /substring\(/, /randomUUID/i]) {
      expect(block).not.toMatch(forbidden);
    }
  });

  it('records the contract on the column itself', () => {
    expect(migrationSrc()).toMatch(
      /COMMENT ON COLUMN public\.field_monitor_turns\.session_id/i,
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('C. schema custody — the table must be constructible from this repo', () => {
  it('the migration exists at all (the live DDL was out-of-band)', () => {
    // `fieldMonitorTelemetry.ts` cites `migrations/025_field_monitor_turns.sql`,
    // which exists in none of the five migration directories. Before this file,
    // a clean environment could not create the table.
    expect(fs.existsSync(MIGRATION)).toBe(true);
  });

  it('is idempotent in both states', () => {
    const sql = stripSql(migrationSrc());
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS/i);
    expect((sql.match(/CREATE INDEX IF NOT EXISTS/gi) || []).length).toBe(4);
  });

  it('reproduces every captured index', () => {
    const sql = stripSql(migrationSrc());
    for (const idx of [
      'idx_field_monitor_created',
      'idx_field_monitor_framework',
      'idx_field_monitor_member',
      'idx_field_monitor_member_time',
    ]) {
      expect(sql).toContain(idx);
    }
  });

  it('reproduces the captured table comment verbatim', () => {
    expect(migrationSrc()).toContain(
      'Per-turn telemetry for field monitoring, quality tracking, and mono-modal collapse detection. Fire-and-forget writes.',
    );
  });

  it('invents no constraint the live table does not have', () => {
    // Production carries no foreign keys and no CHECK constraints. `route` is an
    // unconstrained varchar there, and the 'oracle' | 'stream' union is a
    // TypeScript claim only — reconstructing it as a CHECK would be inventing
    // schema under cover of restoring it.
    const body = readCreateTableBody();
    expect(body).not.toMatch(/REFERENCES/i);
    expect(body).not.toMatch(/CHECK\s*\(/i);
    expect(body).toMatch(/route\s+VARCHAR\s+NOT NULL/i);
  });

  it('preserves the NOT NULL defaults D6 depends on', () => {
    // M1.5's D6 reasoning rests on these being NOT NULL with defaults; a
    // reconstruction that dropped them would silently break that cut.
    const body = readCreateTableBody();
    expect(body).toMatch(/memory_layers_hit\s+JSONB\s+NOT NULL DEFAULT '\{\}'::jsonb/i);
    expect(body).toMatch(/memory_layer_count\s+INTEGER\s+NOT NULL DEFAULT 0/i);
    expect(body).toMatch(/frameworks_detected\s+JSONB\s+NOT NULL DEFAULT '\[\]'::jsonb/i);
    expect(body).toMatch(/mono_modal_alert\s+BOOLEAN\s+NOT NULL DEFAULT FALSE/i);
  });

  it('fails loudly rather than half-applying', () => {
    const sql = stripSql(migrationSrc());
    expect(sql).toMatch(/RAISE EXCEPTION[\s\S]*session_id is/i);
    expect(sql).toMatch(/RAISE EXCEPTION[\s\S]*member_id is/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('D. the telemetry module needed no change — recorded, not assumed', () => {
  it('its binding and read model were already correct for TEXT', () => {
    // `lib/consciousness/fieldMonitorTelemetry.ts` was deliberately NOT leased.
    // These two facts are why: the insert already binds a nullable string, and
    // the read model already types the column as one. If either changes, the
    // no-change decision has to be revisited rather than silently inherited.
    const telemetry = fs.readFileSync(TELEMETRY, 'utf8');
    expect(telemetry).toMatch(/sessionId\s*\?\?\s*null/);
    expect(telemetry).toMatch(/session_id:\s*string \| null/);
  });
});
