import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — the reminder system may know that a member asked for a future
 * delivery. It may not know whether the member has been absent.
 *
 * SELF-ADDRESSED-RETURN-01 Tier 1 exists because MAIA must never chase
 * (RIGHT_TO_REMAIN_UNPOSSESSED §3: no nudges, no notifications keyed to
 * absence, no automated re-initiation, no inference of concern from absence).
 * The member authors both the meaning and the time; delivery is fulfillment of
 * that authored act, not a judgement that contact is warranted.
 *
 * That claim is only worth anything if it is structural. This check proves the
 * unit cannot acquire an absence read:
 *
 *   1. the due-selection query is three predicates, one table, no JOIN;
 *   2. the one permitted second lookup is identity/delivery-address ONLY,
 *      asserted by SHAPE (`SELECT email FROM members WHERE id = $1`) rather
 *      than merely by the absence of forbidden words — otherwise the seam is a
 *      hole shaped like whatever a future patch selects (spec §6.4);
 *   3. no absence-derived identifier appears anywhere in the unit;
 *   4. no model/LLM import exists on the delivery path (F2 mechanically);
 *   5. the NEGATIVE CONTROL fixture, which deliberately reads last_seen, is
 *      CAUGHT. Without (5) a PASS could mean only that the detector broke.
 */

const UNIT = [
  'database/migrations/20260904000002_member_reminders.sql',
  'lib/reminders/cancelToken.ts',
  'lib/reminders/source.ts',
  'lib/reminders/types.ts',
  'app/api/reminders/route.ts',
  'app/api/reminders/[id]/route.ts',
  'app/api/reminders/cancel/route.ts',
  'scripts/run-member-reminders-worker.ts',
];

const WORKER = 'scripts/run-member-reminders-worker.ts';
const MIGRATION = 'database/migrations/20260904000002_member_reminders.sql';
const NEGATIVE_CONTROL = 'tests/constitutional/refusal-registry/fixtures/r32-negative-control.ts.txt';

/**
 * Absence-derived reads. Word-bounded so prose in comments naming the refusal
 * ("never reads last_seen") does not trip the check — only code-shaped usage.
 */
const ABSENCE_IDENTIFIERS = [
  /\blast_seen\b/,
  /\blast_active\b/,
  /\blast_activity\b/,
  /\blast_conversation\b/,
  /\blast_login\b/,
  /\bdays_since\b/,
  /\bdays_absent\b/,
  /\bsession_recency\b/,
  /\bengagement_score\b/,
  /\breturn_status\b/,
  /\bopened_then_returned\b/,
  // camelCase forms. The tempting considerate implementation is written in
  // application code, not SQL — `member.lastActiveAt > reminder.createdAt` —
  // and a snake_case-only detector would wave it straight through.
  /\blastActiveAt\b/,
  /\blastSeenAt?\b/,
  /\blastLoginAt?\b/,
  /\blastVisitAt?\b/,
  /\bdaysSince[A-Z]\w*/,
  /\blastActivityAt?\b/,
  /\bmember_already_returned\b/,
  /\bmemberAlreadyReturned\b/,
];

/**
 * R32-C: delivery outcome must never become engagement evidence. The worker may
 * write attempt count, delivered_at, and a typed failure code. Nothing else.
 */
const ENGAGEMENT_TELEMETRY = [
  /\bopened\b\s*[=:]/,
  /\bclicked\b\s*[=:]/,
  /\bvisited_after\b/,
  /\bvisitedAfter\b/,
  /\breturned_after\b/,
  /\bresponse_to_reminder\b/,
  /\bresponseToReminder\b/,
  /\bconversion\w*/i,
  /\bengagement_delta\b/,
  /\bengagementDelta\b/,
];

/** Tables whose presence in this unit would mean it can see the member's life. */
const FORBIDDEN_TABLES = [
  /\bFROM\s+sessions\b/i,
  /\bJOIN\s+sessions\b/i,
  /\bFROM\s+conversations\b/i,
  /\bJOIN\s+conversations\b/i,
  /\bFROM\s+auth_sessions\b/i,
  /\bJOIN\s+auth_sessions\b/i,
  /\bFROM\s+agent_runs\b/i,
];

/** Strip line and block comments so prose cannot satisfy OR trip an assertion. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/^\s*--.*$/gm, ' ');
}

function scan(code: string, patterns: RegExp[]): string[] {
  const found: string[] = [];
  for (const re of patterns) {
    const m = code.match(re);
    if (m) found.push(m[0]);
  }
  return found;
}

function scanForAbsenceReads(code: string): string[] {
  return scan(code, [...ABSENCE_IDENTIFIERS, ...FORBIDDEN_TABLES]);
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal:
    'the reminder system may know a member asked for a future delivery; it may not know whether the member has been absent (A: due-selection · B: narrow identity seam · C: no engagement telemetry)',
  grade: 'Proposed',
  enforcedBy:
    'absence of any absence-derived read across the Tier 1 unit (migration, lib/reminders/**, app/api/reminders/**, the delivery worker), plus the asserted shape of the one permitted identity lookup',
  evidence:
    "run-member-reminders-worker.ts findDue() — three predicates, one table, no JOIN; the identity lookup is exactly `SELECT email FROM members WHERE id = $1`; migration 20260904000002 declares no presence/recency/engagement column",
  violationAttempted:
    'find any import, query, column, or derivation of member presence, recency, or engagement within the Tier 1 unit — and verify the detector still catches a deliberate last_seen read',
  passingAuthorizes: 'Tier 1 cannot read member absence',
  passingDoesNotAuthorize:
    'any claim about other MAIA surfaces, about Tiers 1.5/2, or that absence data does not exist elsewhere in the platform',
  hostileForkMustChange:
    'add a session/activity read to the unit; widen the due-selection query beyond its ratified predicates; widen the identity lookup beyond the single `email` column; or record any outcome of delivery beyond attempt count, delivered_at, and a typed failure code',

  run(io) {
    // ═══ R32-A — due selection is absence-blind ═══════════════════════════
    let unitClean = true;
    for (const path of UNIT) {
      if (!io.exists(path)) {
        io.fail('R32-A · Tier 1 unit file missing', path);
        unitClean = false;
        continue;
      }
      const hits = scanForAbsenceReads(stripComments(io.read(path)));
      if (hits.length > 0) {
        io.fail('R32-A · absence-derived read in the Tier 1 unit', `${path} → ${hits.join(', ')}`);
        unitClean = false;
      }
    }
    if (unitClean) {
      io.pass('R32-A · no absence-derived read anywhere in the unit', `${UNIT.length} files scanned`);
    }

    const worker = stripComments(io.read(WORKER));
    const due = worker.match(/FROM\s+member_reminders[\s\S]*?LIMIT\s+\$1/i)?.[0] ?? '';
    if (!due) {
      io.fail('R32-A · due-selection query not found', 'R32 cannot bound the query it exists to bound');
    } else {
      const ratified =
        /delivery_at\s*<=\s*now\(\)/i.test(due) &&
        /cancelled_at\s+IS\s+NULL/i.test(due) &&
        /delivered_at\s+IS\s+NULL/i.test(due);
      const hasJoin = /\bJOIN\b/i.test(due);
      const otherTable = /\bFROM\s+(?!member_reminders\b)\w+/i.test(due);
      if (ratified && !hasJoin && !otherTable) {
        io.pass(
          'R32-A · due-selection depends only on the reminder itself',
          'delivery_at <= now() · cancelled_at IS NULL · delivered_at IS NULL · one table · no JOIN',
        );
      } else {
        io.fail(
          'R32-A · due-selection widened',
          `ratifiedPredicates=${ratified} join=${hasJoin} otherTable=${otherTable}`,
        );
      }
    }

    // ═══ R32-B — the identity seam is narrow ══════════════════════════════
    // Pin the SELECTED COLUMN, not merely the table: `SELECT * FROM members`
    // would keep a table-name-only check cosmetically green while exposing
    // last_login, session timestamps and every state field on the row.
    const identityReads = worker.match(/SELECT[\s\S]{0,120}?FROM\s+members\b[\s\S]{0,80}?`/gi) ?? [];
    if (identityReads.length === 0) {
      io.fail('R32-B · no identity lookup found', 'the permitted seam must be present and pinned');
    } else if (identityReads.length > 1) {
      io.fail(
        'R32-B · more than one read of members',
        `${identityReads.length} found — the seam is exactly one lookup`,
      );
    } else if (/SELECT\s+\*/i.test(identityReads[0])) {
      io.fail('R32-B · identity lookup selects *', 'every column on members, not the address');
    } else if (/^\s*SELECT\s+email\s+FROM\s+members\s+WHERE\s+id\s*=\s*\$1\s*$/i.test(
        identityReads[0].replace(/`/g, '').trim())) {
      io.pass('R32-B · identity seam is the delivery address only', 'SELECT email FROM members WHERE id = $1');
    } else {
      io.fail(
        'R32-B · identity lookup is not the permitted shape',
        `must be exactly \`SELECT email FROM members WHERE id = $1\` — found: ${identityReads[0].slice(0, 90)}`,
      );
    }

    // ═══ R32-C — delivery result cannot become engagement evidence ════════
    let telemetryClean = true;
    for (const path of UNIT) {
      if (!io.exists(path)) continue;
      const hits = scan(stripComments(io.read(path)), ENGAGEMENT_TELEMETRY);
      if (hits.length > 0) {
        io.fail('R32-C · engagement telemetry in the Tier 1 unit', `${path} → ${hits.join(', ')}`);
        telemetryClean = false;
      }
    }
    if (telemetryClean) {
      io.pass(
        'R32-C · delivery outcome is operational only',
        'attempt count · delivered_at · typed failure code — nothing about opening, clicking, or returning',
      );
    }

    // No model call on the delivery path (F2, mechanically).
    if (/@anthropic-ai|\bopenai\b|getMaiaResponse|generateText|\bollama\b/i.test(worker)) {
      io.fail('model import on the delivery path', 'delivery must carry the member text verbatim');
    } else {
      io.pass('no model call at delivery', 'member text is carried, never composed');
    }

    // Absent columns stay absent from the schema.
    const migration = stripComments(io.read(MIGRATION));
    const schemaHits = [
      ...scanForAbsenceReads(migration),
      ...scan(migration, ENGAGEMENT_TELEMETRY),
    ];
    if (schemaHits.length > 0) {
      io.fail('presence or engagement column present in schema', schemaHits.join(', '));
    } else {
      io.pass('schema declares no presence, recency, or engagement column');
    }

    // ═══ NEGATIVE CONTROL — the detector must still see all three ═════════
    if (!io.exists(NEGATIVE_CONTROL)) {
      io.fail('negative control missing', 'R32 cannot demonstrate its detector works');
      return;
    }
    const control = stripComments(io.read(NEGATIVE_CONTROL));
    const caughtA = scanForAbsenceReads(control);
    const caughtB = /SELECT\s+\*\s+FROM\s+members/i.test(control);
    const caughtC = scan(control, ENGAGEMENT_TELEMETRY);
    const kind = caughtA.some((h) => /lastActiveAt/.test(h));

    if (caughtA.length > 0 && caughtB && caughtC.length > 0 && kind) {
      io.pass(
        'negative control CAUGHT on all three propositions',
        `A: ${caughtA.slice(0, 3).join(', ')} · B: SELECT * FROM members · C: ${caughtC.slice(0, 3).join(', ')}`,
      );
    } else {
      io.fail(
        'negative control NOT fully caught — R32 is blind where it matters',
        `A=${caughtA.length > 0} (considerate-suppression form: ${kind}) B=${caughtB} C=${caughtC.length > 0}; ` +
          'the fixture deliberately violates all three, so any miss means the PASSes above prove nothing',
      );
    }
  },
};
