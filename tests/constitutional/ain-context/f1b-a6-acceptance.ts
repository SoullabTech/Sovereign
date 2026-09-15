/**
 * AIN-CONTEXT-01 · A6 · F1b — ACCEPTANCE WITNESS
 *
 * Authority: founder ruling 2026-09-15, R6.
 * Counterpart: tests/constitutional/ain-context/f1a-false-self-location.ts (RED, pre-repair).
 *
 * ⭐ F1a CANNOT BE RE-RUN AGAINST THE REPAIRED SOURCE and must not be. Its G2 guard
 *    pins the expression `effectiveHistory.length + 1`, which A6 removed; re-running it
 *    now yields INSTRUMENT FAILURE by design. F1a stays historical evidence of what
 *    canonical did before the repair. This file is the NEW post-repair witness.
 *
 * ⭐ A7 below uses the SAME depth and absence probes as F1a, against the SAME production
 *    prompt builder, so RED and GREEN are commensurable rather than two different tests.
 *
 * Fixture prose is synthetic. No member text exists in this run. Reported values are
 * counts, booleans and identities only.
 */

import { pool, query } from '@/lib/db/postgres';
import {
  ensureSession,
  incrementTurnCount,
  getSessionContinuityWindow,
  initializeSessionTable,
} from '@/lib/sovereign/sessionManager';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { buildMaiaWisePrompt, type MaiaContext, CORE_PROMPT_HISTORY_APERTURE } from '@/lib/sovereign/maiaVoice';
import {
  deriveSessionContinuity,
  formatSessionContinuityForPrompt,
} from '@/lib/maia/continuity/sessionContinuity';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const SERVING_HISTORY_LIMIT = 10;
/** 1 and 4 are the R6 shallow cases (4 == the aperture exactly). */
const DEPTHS = [1, 4, 5, 25, 200];

// Same probes as F1a — deliberately generous, so GREEN is not manufactured by a
// narrower instrument than the one that produced RED.
// ⚠️ EXTENDED from F1a's set, and the extension is declared rather than quiet.
// F1a's probes were written for the shape of the signal A6 REPLACED ("N turns").
// A6 states depth in the pinned unit, so recognising it needs one more probe. The
// four original probes are unchanged and still present.
// ⛔ The ABSENCE probe set below is NOT extended — it is byte-identical to F1a's,
//    which is where the decisive RED → GREEN comparison lives.
const DEPTH_PROBES: RegExp[] = [
  /\b\d{2,}\s*turns\b/i,
  /\bconversation depth\b/i,
  /\bturn\s*(?:count|index|number)\s*[:=]/i,
  /\bsession depth\b/i,
  /\b\d+\s+completed exchanges on record\b/i,   // A6's unit (added 2026-09-15)
];
const ABSENCE_PROBES: RegExp[] = [
  /\bnot (?:represented|included|present|loaded|assembled)\b/i,
  /\bearlier (?:material|turns|exchanges)[^.!?]{0,60}\b(?:absent|missing|not)\b/i,
  /\b(?:displaced|omitted|withheld|truncated|elided)\b/i,
  /\bknown absence\b/i,
  /\bout of (?:view|aperture|scope)\b/i,
  /\bonly .{0,30}\bof\b.{0,30}\b(?:turns|exchanges)\b/i,
];
// A6's own carrier — the probe F1a had no way to satisfy.
const CONTINUITY_PROBES: RegExp[] = [
  /\bSESSION CONTINUITY\b/,
  /\bcompleted exchanges\b/i,
  /\bon record\b/i,
];
// R6: nothing may imply omitted material never existed.
const NONEXISTENCE_PROBES: RegExp[] = [
  /\b(?:never|did not|didn'?t)\s+(?:happen|exist|occur|take place)\b/i,
  /\bno (?:earlier|prior|previous) (?:conversation|history|exchanges?)\b/i,
  /\bthis is (?:our|the) first\b/i,
];

const anyMatch = (t: string, ps: RegExp[]) => ps.some((p) => p.test(t));

/**
 * ⭐ C21 DISCIPLINE (ratified in this repository, I0.5 2026-09-07):
 * "a prose ban must never read as the banned behavior returning — an instrument that
 *  scans prose can fail on a file precisely because that file documents its own
 *  compliance."
 *
 * The A6 continuity block's guidance line must NAME the inference it forbids
 * ("do not treat its absence as evidence that it did not happen"). Scanning for a
 * nonexistence CLAIM must therefore exclude the line that PROHIBITS one, exactly as
 * memoryCanonGuard blanks quoted spans before matching so that quoting is not read as
 * asserting. The exclusion is structural — the `Guidance:` prefix — never a guess at
 * wording, and it removes ONLY that line.
 */
function stripGuidanceLines(text: string): string {
  return text.split('\n').filter((l) => !/^Guidance:/.test(l.trim())).join('\n');
}

type Check = { id: string; ok: boolean; detail: string };
const checks: Check[] = [];
const check = (id: string, ok: boolean, detail: string) => { checks.push({ id, ok, detail }); };

async function seed(memberId: string, exchanges: number): Promise<string> {
  const session = await ensureSession(`session_f1b_${randomUUID()}`);
  const posture = TurnPosture.resolve({ sanctuary: false });
  for (let i = 0; i < exchanges; i++) {
    await TurnsStore.addExchange(posture, memberId, session.id, `F1B-MEMBER-${i}`, `F1B-MAIA-${i}`, randomUUID());
    await incrementTurnCount(session.id);
  }
  return session.id;
}

async function main() {
  const repoRoot = process.cwd();
  console.log('AIN-CONTEXT-01 · A6 · F1b — ACCEPTANCE WITNESS');
  console.log('='.repeat(78));

  await initializeSessionTable();
  const enc = await query<{ enc: string }>(`SELECT current_setting('server_encoding') AS enc`);
  console.log(`shadow server_encoding = ${enc.rows[0]?.enc}`);
  if (enc.rows[0]?.enc !== 'UTF8') throw new Error('STOP: shadow is not UTF8');
  console.log(`CORE_PROMPT_HISTORY_APERTURE (from production source) = ${CORE_PROMPT_HISTORY_APERTURE}`);

  // ── A1 · the false expression is gone, and the window read did not widen ────
  const svc = readFileSync(join(repoRoot, 'lib/sovereign/maiaService.ts'), 'utf8');
  check('A1a  window-derived depth statement removed',
    !/summary:\s*`Conversation:[^`]*?\$\{effectiveHistory\.length \+ 1\}\s*turns`/.test(svc),
    'the CORE summary no longer states the window length as the turn count');
  check('A1b  DEEP sessionMetadata no longer window-derived',
    !/turnCount:\s*effectiveHistory\.length \+ 1,/.test(svc),
    'DEEP consultation turnCount is not the window length');
  check('A1c  serving window NOT widened (R5)',
    /getSessionContinuityWindow\(sessionId,\s*10\)/.test(svc),
    'server read remains 10 exchanges');
  check('A1d  CORE aperture NOT widened (R5)',
    CORE_PROMPT_HISTORY_APERTURE === 4,
    `aperture is ${CORE_PROMPT_HISTORY_APERTURE}`);

  const selfLoc: number[] = [];
  console.log('');
  console.log('depth | durable | window | represented | absent | continuity | depth-sig | absence-sig | nonexistence');
  console.log('-'.repeat(104));

  for (const n of DEPTHS) {
    const memberId = `f1b_member_${n}_${randomUUID()}`;
    const sessionId = await seed(memberId, n);

    // Real production reader.
    const win = await getSessionContinuityWindow(sessionId, SERVING_HISTORY_LIMIT);

    // ── A2 · the durable total is exact, and the window is unchanged ──────────
    check(`A2-${n}  durable total exact`, win.durableCompletedExchanges === n,
      `durable=${win.durableCompletedExchanges} expected=${n}`);
    check(`A2-${n}  window unchanged`, win.exchanges.length === Math.min(SERVING_HISTORY_LIMIT, n),
      `window=${win.exchanges.length} expected=${Math.min(SERVING_HISTORY_LIMIT, n)}`);

    // Real production derivation, at the real CORE aperture (R1).
    const represented = Math.min(CORE_PROMPT_HISTORY_APERTURE, win.exchanges.length);
    const facts = deriveSessionContinuity({
      durableCompletedExchanges: win.durableCompletedExchanges,
      representedExchanges: represented,
    });
    const block = formatSessionContinuityForPrompt(facts);
    selfLoc.push(facts.depth);

    // ── A3 · arithmetic, in one unit ─────────────────────────────────────────
    check(`A3-${n}  facts consistent`,
      facts.depth === n && facts.represented === represented && facts.absent === n - represented,
      `depth=${facts.depth} represented=${facts.represented} absent=${facts.absent}`);
    check(`A3-${n}  unit pinned + current request excluded`,
      facts.unit === 'completed exchanges' && facts.currentRequestIncluded === false,
      `unit=${facts.unit} currentIncluded=${facts.currentRequestIncluded}`);

    // Real production prompt builder, carrying the block through the real addenda channel.
    const ctx: MaiaContext = {
      sessionId,
      summary: `Conversation: earth element, ${facts.depth} ${facts.unit} on record`,
      sessionContinuityAddendum: block || undefined,
    };
    const prompt = buildMaiaWisePrompt(ctx, 'F1B-PROBE-INPUT', win.exchanges as any[]);

    const hasContinuity = anyMatch(prompt, CONTINUITY_PROBES);
    const hasDepth = anyMatch(prompt, DEPTH_PROBES);
    const hasAbsence = anyMatch(prompt, ABSENCE_PROBES);
    const hasNonexistence = anyMatch(stripGuidanceLines(prompt), NONEXISTENCE_PROBES);

    // ── A4 · the carrier actually reaches the prompt via the shared channel ──
    check(`A4-${n}  continuity carrier reaches prompt`, hasContinuity,
      'SESSION CONTINUITY block present in the assembled CORE prompt');

    // ── A5 · shallow case — no false absence claim ───────────────────────────
    if (n <= CORE_PROMPT_HISTORY_APERTURE) {
      check(`A5-${n}  shallow: absent === 0`, facts.absent === 0, `absent=${facts.absent}`);
      check(`A5-${n}  shallow: NO absence claim in prompt`, !hasAbsence,
        'a session that fits the aperture is never told history is missing');
      check(`A5-${n}  shallow: states nothing missing`, /Nothing from this conversation is missing/.test(prompt),
        'explicit positive statement of completeness');
    } else {
      // ── A6 · long case — absence stated, and stated as ABSENT not nonexistent ──
      check(`A6-${n}  long: absent > 0`, facts.absent === n - represented && facts.absent > 0,
        `absent=${facts.absent}`);
      check(`A6-${n}  long: absence reaches prompt`, hasAbsence,
        'the same probe set that returned false at every depth in F1a');
      check(`A6-${n}  long: absence is of THIS conversation, on record`,
        /THIS SAME conversation are on record and are NOT present/.test(prompt),
        'omitted material named as existing');
      check(`A6-${n}  long: absent-from-view, not absent-from-what-happened`,
        /absent from your present view, not absent from what happened/.test(prompt),
        'R3: ABSENT, never UNCERTAIN, never nonexistent');
    }

    // ── R6 · no claim may imply the omitted material never existed ───────────
    check(`A7-${n}  no nonexistence claim`, !hasNonexistence, 'no "never happened" language');
    // Depth signal must be present AND true.
    check(`A7-${n}  true depth reaches prompt`,
      hasDepth && prompt.includes(`${facts.depth} ${facts.unit} on record`),
      `depth statement must carry the authoritative ${facts.depth}`);

    console.log(
      `${String(n).padStart(5)} | ${String(win.durableCompletedExchanges).padStart(7)} | ` +
      `${String(win.exchanges.length).padStart(6)} | ${String(facts.represented).padStart(11)} | ` +
      `${String(facts.absent).padStart(6)} | ${String(hasContinuity).padStart(10)} | ` +
      `${String(hasDepth).padStart(9)} | ${String(hasAbsence).padStart(11)} | ${String(hasNonexistence).padStart(12)}`,
    );
  }

  // ── A8 · self-location must NOT saturate with the window ───────────────────
  const distinct = new Set(selfLoc);
  check('A8  self-location does not saturate',
    distinct.size === DEPTHS.length && selfLoc.every((v, i) => v === DEPTHS[i]),
    `values=${selfLoc.join(',')} expected=${DEPTHS.join(',')}`);
  check('A8  self-location tracks actual depth beyond the window',
    selfLoc[selfLoc.length - 1] === 200,
    'at 200 completed exchanges the reported depth is 200, not 11');

  console.log('');
  let failed = 0;
  for (const c of checks) {
    if (!c.ok) { failed++; console.log(`  FAIL  ${c.id} — ${c.detail}`); }
  }
  console.log(`F1b: ${checks.length - failed} passed · ${failed} failed`);
  console.log(failed === 0
    ? 'F1b VERDICT: GREEN — A6 acceptance conditions R6 satisfied.'
    : 'F1b VERDICT: NOT GREEN — acceptance NOT established.');

  await pool.end();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('F1b INSTRUMENT FAILURE — no acceptance evidence:', err?.message ?? err);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(2);
});
