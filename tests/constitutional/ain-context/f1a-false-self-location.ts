/**
 * AIN-CONTEXT-01 · A6 · F1a — FALSE SELF-LOCATION FALSIFIER
 *
 * Authority: founder act 2026-09-15 — "A6 OPEN → F1a ONLY".
 * Record:    docs/programme/AIN-CONTEXT-01_ACT2_ADDENDUM_FOUNDER_RULINGS_2026-09-15.md §3.3
 *
 * PROPOSITION UNDER TEST (must go RED against untouched source):
 *
 *   In a sufficiently long ACTIVE session, authoritative session depth exceeds the
 *   prompt-visible conversational window, yet cognition is given a shallow effective
 *   turn count and no explicit accounting of the displaced current-session material.
 *
 * ⛔ THIS FILE CHANGES NO SERVING BEHAVIOUR. It imports production modules and calls
 *    them; it does not modify, monkey-patch, or wrap them.
 *
 * ⛔ THE RED MAY NOT DEPEND ON CROSS-SESSION MEMORY. The fixture creates exactly ONE
 *    session for the member and asserts (G3) that no other session exists. Every
 *    cross-session carrier is therefore empty by construction, and the failure — if
 *    present — belongs to the active session alone.
 *
 * EVIDENCE DISCIPLINE (carried from the S3 lane):
 *   WITNESSED  a value produced by executing production code on this run.
 *   ENTAILED   a production source expression, read from the file on this run, and
 *              evaluated against WITNESSED input. Honest evidence; NOT witness.
 *
 * CONTENT DISCIPLINE: fixture prose is synthetic and generated here. No member text
 *   exists in this run. Reported values are counts, booleans and identities only.
 */

import { pool, query } from '@/lib/db/postgres';
import {
  ensureSession,
  incrementTurnCount,
  getConversationHistory,
  initializeSessionTable,
} from '@/lib/sovereign/sessionManager';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { buildMaiaWisePrompt, type MaiaContext } from '@/lib/sovereign/maiaVoice';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const DEPTHS = [25, 50, 100, 150, 200];

/** The window the serving path asks for. Read from source, never assumed — see G1. */
const SERVING_HISTORY_LIMIT = 10;

type Row = {
  requested_exchanges: number;
  authoritative_depth: number;      // M1 WITNESSED
  durable_turns: number;            // M2 WITNESSED
  selected_exchanges: number;       // M3 WITNESSED
  exchanges_in_core_prompt: number; // M5 WITNESSED
  self_location_value: number;      // M6 ENTAILED
  depth_signal_in_prompt: boolean;  // M7 WITNESSED
  absence_signal_in_prompt: boolean;// M7 WITNESSED
  displaced_exchanges: number;      // derived
};

// ─────────────────────────────────────────────────────────────────────────────
// G1 — the serving path's history limit, read from source rather than assumed.
// ─────────────────────────────────────────────────────────────────────────────
function readServingHistoryLimit(repoRoot: string): number {
  const src = readFileSync(join(repoRoot, 'lib/sovereign/maiaService.ts'), 'utf8');
  const m = src.match(/getConversationHistory\(\s*sessionId\s*,\s*(\d+)\s*\)/);
  if (!m) throw new Error('G1 INSTRUMENT FAILURE: serving history limit not found in source');
  return Number(m[1]);
}

// ─────────────────────────────────────────────────────────────────────────────
// M6 — the CORE self-location expression, extracted from production source and
// evaluated on WITNESSED input. ENTAILED, never reported as witness.
//
// Source site: lib/sovereign/maiaService.ts — the MaiaContext `summary` assigned on
// the CORE path. Cited as an OPERATION, not a line number (discipline D1).
// ─────────────────────────────────────────────────────────────────────────────
function readSelfLocationExpression(repoRoot: string): {
  expression: string;
  evaluate: (historyLength: number) => number;
} {
  const src = readFileSync(join(repoRoot, 'lib/sovereign/maiaService.ts'), 'utf8');
  const m = src.match(/summary:\s*`Conversation:[^`]*?\$\{(effectiveHistory\.length \+ 1)\}\s*turns`/);
  if (!m) {
    throw new Error(
      'M6 INSTRUMENT FAILURE: the CORE summary self-location expression was not found ' +
      'in its expected shape. The finding may have been repaired, or the site moved. ' +
      'Re-establish before reporting any verdict.'
    );
  }
  const expr = m[1];
  if (expr !== 'effectiveHistory.length + 1') {
    throw new Error(`M6 INSTRUMENT FAILURE: unexpected expression "${expr}"`);
  }
  return { expression: expr, evaluate: (h: number) => h + 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// M7 — does the assembled CORE prompt carry ANY depth or absence signal?
//
// Deliberately GENEROUS: any of these firing counts as the signal being PRESENT,
// so a false RED is hard to manufacture. The falsifier is only satisfied by
// absence across every probe.
// ─────────────────────────────────────────────────────────────────────────────
const DEPTH_PROBES: RegExp[] = [
  /\b\d{2,}\s*turns\b/i,                       // any two-digit-or-more turn count
  /\bconversation depth\b/i,
  /\bturn\s*(?:count|index|number)\s*[:=]/i,
  /\bsession depth\b/i,
];

const ABSENCE_PROBES: RegExp[] = [
  /\bnot (?:represented|included|present|loaded|assembled)\b/i,
  /\bearlier (?:material|turns|exchanges)[^.!?]{0,60}\b(?:absent|missing|not)\b/i,
  /\b(?:displaced|omitted|withheld|truncated|elided)\b/i,
  /\bknown absence\b/i,
  /\bout of (?:view|aperture|scope)\b/i,
  /\bonly .{0,30}\bof\b.{0,30}\b(?:turns|exchanges)\b/i,
];

function anyMatch(text: string, probes: RegExp[]): boolean {
  return probes.some((p) => p.test(text));
}

function countExchangesInRecentBlock(prompt: string): number {
  const marker = '🔄 RECENT CONVERSATION';
  const i = prompt.indexOf(marker);
  if (i < 0) return 0;
  const tail = prompt.slice(i);
  const end = tail.indexOf('\n\nIMPORTANT:');
  const block = end > 0 ? tail.slice(0, end) : tail;
  return (block.match(/^User: /gm) ?? []).length;
}

// ─────────────────────────────────────────────────────────────────────────────

async function seedActiveSession(memberId: string, exchanges: number): Promise<string> {
  const session = await ensureSession(`session_f1a_${randomUUID()}`);
  // Real posture object. A plain literal is refused by contentWritable's
  // `instanceof` check (fail-closed), which silently yields an EMPTY history and
  // a vacuous RED. G4 below exists because that is exactly what happened on the
  // first attempt of this witness.
  const posture = TurnPosture.resolve({ sanctuary: false });

  for (let i = 0; i < exchanges; i++) {
    // Real production writer. Byte-identical call shape to sessionManager.saveExchange.
    await TurnsStore.addExchange(
      posture,
      memberId,
      session.id,
      `F1A-MEMBER-${i}`,
      `F1A-MAIA-${i}`,
      randomUUID(),
    );
    // Real production counter — the route calls this once per served turn.
    await incrementTurnCount(session.id);
  }
  return session.id;
}

async function measure(repoRoot: string, memberId: string, exchanges: number): Promise<Row> {
  const sessionId = await seedActiveSession(memberId, exchanges);

  // M1 — authoritative depth, read from the durable session record.
  const depthRes = await query<{ turn_count: number }>(
    `SELECT turn_count FROM maia_sessions WHERE id = $1`, [sessionId],
  );
  const authoritative_depth = Number(depthRes.rows[0]?.turn_count ?? 0);

  // M2 — durable turns actually retained.
  const turnRes = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM conversation_turns WHERE session_id = $1`, [sessionId],
  );
  const durable_turns = Number(turnRes.rows[0]?.n ?? 0);

  // ── G4 · FIXTURE GUARD (⭐ the trap this witness already fell into once) ──
  // An empty or short history yields self_location = 1 and depth > self_location,
  // which the verdict would score RED — on a fixture that stored nothing. A RED
  // must mean "material was displaced", never "material was never written".
  // ⛔ No verdict may be computed unless the fixture is exactly what was asked for.
  if (durable_turns !== exchanges * 2) {
    throw new Error(
      `G4 INSTRUMENT FAILURE: requested ${exchanges} exchanges (${exchanges * 2} turns), ` +
      `durable_turns = ${durable_turns}. The fixture did not persist. No architectural ` +
      `evidence. ⛔ Do NOT score this run.`
    );
  }
  if (durable_turns <= SERVING_HISTORY_LIMIT * 2) {
    throw new Error(
      `G4 INSTRUMENT FAILURE: fixture depth ${durable_turns} turns does not exceed the ` +
      `serving window (${SERVING_HISTORY_LIMIT} exchanges). Nothing is displaced, so the ` +
      `proposition is untestable at this depth.`
    );
  }

  // M3 — what the serving path selects. REAL production function, REAL limit.
  const selected = await getConversationHistory(sessionId, SERVING_HISTORY_LIMIT);

  // ── G5 · the window must actually be SATURATED, or the finding is about a short
  // conversation rather than about displacement.
  if (selected.length !== SERVING_HISTORY_LIMIT) {
    throw new Error(
      `G5 INSTRUMENT FAILURE: window not saturated — selected ${selected.length} of ` +
      `${SERVING_HISTORY_LIMIT} from ${durable_turns} durable turns. ⛔ Do NOT score this run.`
    );
  }

  // M6 — source-extracted self-location expression evaluated on M3. ENTAILED.
  const { evaluate } = readSelfLocationExpression(repoRoot);
  const self_location_value = evaluate(selected.length);

  // M4/M5/M7 — REAL prompt builder, given the REAL selected history.
  // The summary string is the source-extracted expression's own output, so the
  // prompt's depth statement is the one production would have produced.
  const ctx: MaiaContext = {
    sessionId,
    summary: `Conversation: earth element, ${self_location_value} turns`,
    // NOTE: MaiaContext declares `turnCount?: number`. Production never assigns the
    // authoritative value to it and buildMaiaWisePrompt never reads it. Left unset
    // here so the prompt is the one production would build.
  };
  const prompt = buildMaiaWisePrompt(ctx, 'F1A-PROBE-INPUT', selected as any[]);

  return {
    requested_exchanges: exchanges,
    authoritative_depth,
    durable_turns,
    selected_exchanges: selected.length,
    exchanges_in_core_prompt: countExchangesInRecentBlock(prompt),
    self_location_value,
    depth_signal_in_prompt: anyMatch(prompt, DEPTH_PROBES),
    absence_signal_in_prompt: anyMatch(prompt, ABSENCE_PROBES),
    displaced_exchanges: Math.max(0, Math.floor(durable_turns / 2) - selected.length),
  };
}

async function main() {
  const repoRoot = process.cwd();
  // ⭐ A DISTINCT synthetic member per depth probe. Each measured session is then the
  // ONLY session its member has ever had, so every cross-session carrier is empty by
  // construction and cannot contribute to the result (G3).
  const memberFor = new Map<number, string>(DEPTHS.map((n) => [n, `f1a_member_${n}_${randomUUID()}`]));

  console.log('AIN-CONTEXT-01 · A6 · F1a — FALSE SELF-LOCATION WITNESS');
  console.log('='.repeat(78));

  await initializeSessionTable();

  const enc = await query<{ enc: string }>(`SELECT current_setting('server_encoding') AS enc`);
  console.log(`shadow server_encoding = ${enc.rows[0]?.enc}`);
  if (enc.rows[0]?.enc !== 'UTF8') throw new Error('STOP: shadow is not UTF8');

  const limitFromSource = readServingHistoryLimit(repoRoot);
  console.log(`G1  serving history limit read from source = ${limitFromSource}`);
  if (limitFromSource !== SERVING_HISTORY_LIMIT) {
    throw new Error(`G1 INSTRUMENT FAILURE: source limit ${limitFromSource} != ${SERVING_HISTORY_LIMIT}`);
  }

  const { expression } = readSelfLocationExpression(repoRoot);
  console.log(`G2  CORE self-location expression read from source = "${expression}"`);

  const rows: Row[] = [];
  for (const n of DEPTHS) rows.push(await measure(repoRoot, memberFor.get(n)!, n));

  // G3 — cross-session isolation. The RED must not depend on cross-session memory.
  const sessRes = await query<{ member: string; n: string }>(
    `SELECT user_id AS member, COUNT(DISTINCT session_id)::text AS n
       FROM conversation_turns WHERE user_id = ANY($1::text[]) GROUP BY user_id`,
    [[...memberFor.values()]],
  );
  const maxSessions = Math.max(0, ...sessRes.rows.map((r) => Number(r.n)));
  console.log(`G3  members probed = ${sessRes.rows.length} · max distinct sessions per member = ${maxSessions}`);
  if (sessRes.rows.length !== DEPTHS.length || maxSessions !== 1) {
    throw new Error(
      `G3 INSTRUMENT FAILURE: cross-session isolation not established ` +
      `(members=${sessRes.rows.length}, maxSessions=${maxSessions}). ⛔ Do NOT score this run.`
    );
  }
  // Cross-session carriers are empty by construction for EACH measured session: every
  // one of the other sessions belongs to the same synthetic member and none was read.
  // The RED, if any, is produced by the active session alone.

  console.log('');
  console.log('depth | authoritative | durable | selected | in-prompt | self-loc | depth-sig | absence-sig | displaced');
  console.log('-'.repeat(104));
  for (const r of rows) {
    console.log(
      `${String(r.requested_exchanges).padStart(5)} | ` +
      `${String(r.authoritative_depth).padStart(13)} | ` +
      `${String(r.durable_turns).padStart(7)} | ` +
      `${String(r.selected_exchanges).padStart(8)} | ` +
      `${String(r.exchanges_in_core_prompt).padStart(9)} | ` +
      `${String(r.self_location_value).padStart(8)} | ` +
      `${String(r.depth_signal_in_prompt).padStart(9)} | ` +
      `${String(r.absence_signal_in_prompt).padStart(11)} | ` +
      `${String(r.displaced_exchanges).padStart(9)}`,
    );
  }

  // ── VERDICT ────────────────────────────────────────────────────────────────
  // The proposition holds (falsifier RED) iff, at every depth where the session is
  // deeper than the window:
  //   (a) authoritative depth exceeds the self-location value given to cognition; AND
  //   (b) no absence signal reaches the prompt.
  console.log('');
  const deep = rows.filter((r) => r.authoritative_depth > SERVING_HISTORY_LIMIT + 1);
  const aFails = deep.filter((r) => r.authoritative_depth > r.self_location_value);
  const bFails = deep.filter((r) => !r.absence_signal_in_prompt);

  console.log(`(a) authoritative depth > self-location given to cognition : ${aFails.length}/${deep.length} depths`);
  console.log(`(b) NO absence accounting reaches the prompt               : ${bFails.length}/${deep.length} depths`);

  const red = deep.length > 0 && aFails.length === deep.length && bFails.length === deep.length;
  console.log('');
  console.log(red
    ? 'F1a VERDICT: RED — the proposition HOLDS against untouched source. The defect is present.'
    : 'F1a VERDICT: NOT RED — the proposition does NOT hold as stated. STOP and reconcile.');

  // Ceiling evidence: the self-location value must saturate rather than track depth.
  const distinctSelfLoc = new Set(deep.map((r) => r.self_location_value));
  console.log(`self-location distinct values across depths ${deep.map((r) => r.authoritative_depth).join('/')} : ` +
    `${[...distinctSelfLoc].join(', ')}  (saturating = ${distinctSelfLoc.size === 1})`);

  await pool.end();
  process.exit(red ? 0 : 1);
}

main().catch(async (err) => {
  console.error('F1a INSTRUMENT FAILURE — no architectural evidence:', err?.message ?? err);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(2);
});
