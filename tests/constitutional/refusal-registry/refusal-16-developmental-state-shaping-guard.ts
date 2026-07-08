import type { RefusalCheck } from './harness';

/**
 * Refusal 16 — No response-shaping subsystem may consume persisted INFERRED
 * developmental state (a system-inferred read of the person's developmental
 * level/competence — never member-marked) unless it passes an explicit admission
 * boundary that authorizes it as member-marked or produced in-encounter.
 *
 * The concrete violation this guards (latent, dormant route): `member_spiral_state`
 * carries `relational_phase` / `autonomy_streak`, inferred from conductor hysteresis.
 * `lib/relational/relationalStance.ts` reads them to force SEASONAL_RETURN / RELEASE
 * (holdLevel/brevity — "diminish centrality"), and `app/api/oracle/conversation`
 * fed it the *raw* persisted state. That is interpretation-of-the-person shaping
 * treatment (Developmental-Ecology principle 5, Type A). This refusal closes it
 * BEFORE any live-path activation, so the dormant route cannot become a regression trap.
 *
 * Class-level, not field-level: the admission boundary strips the whole
 * INFERRED_DEVELOPMENTAL_FIELDS class, so the rule still fires for future fields
 * (development_level, integration_score, awakening_phase, attachment_style_estimate…).
 *
 * Grade B — a code chokepoint, not absence-of-code: the fields still exist and the
 * shaping engine still reads them from its *input*; what is refused is handing that
 * input persisted inferred state un-admitted. A fork defeats it only by passing raw
 * state to shaping, emptying the class list, or letting the engine self-fetch — all
 * visible diffs. Behavioral facts (return_count) are intentionally NOT in the class.
 */

const ADMISSION = 'lib/relational/developmentalStateAdmission.ts';
const CONSUMER = 'app/api/oracle/conversation/route.ts';
const ENGINE = 'lib/relational/relationalStance.ts';

// The class list literal + the two known inferred-developmental fields.
const CLASS_RE = /INFERRED_DEVELOPMENTAL_FIELDS\s*=\s*\[([\s\S]*?)\]/;
// The boundary function that strips the class under the unauthorized default.
const ADMIT_FN_RE = /export function admitPersistedStateForShaping/;
const STRIP_RE = /for\s*\(const \w+ of INFERRED_DEVELOPMENTAL_FIELDS\)[\s\S]{0,60}?delete\b/;

// The known consumer: decideRelationalHint must receive persistedState THROUGH the
// admission boundary, never the raw persisted spiralState.
const GUARDED_CALL_RE =
  /decideRelationalHint\(\{[\s\S]*?persistedState:\s*admitPersistedStateForShaping\(/;
// Scoped to the stance consumer specifically — NOT any `persistedState:` (the conductor
// legitimately receives a derived { dominant_element, phase }, which is not the class).
const RAW_CALL_RE = /decideRelationalHint\(\{[\s\S]*?persistedState:\s*spiralState\b/;

// The shaping engine must not self-fetch persisted state (no bypass around the chokepoint).
const ENGINE_SELF_FETCH_RE = /loadSpiralState|member_spiral_state|spiralStatePersistence/;

export const check: RefusalCheck = {
  id: 'R16',
  refusal:
    'No response-shaping subsystem may consume persisted inferred developmental state (relational_phase/autonomy_streak + class) unless admitted as member-marked or in-encounter; the raw persisted read cannot reach relational stance',
  grade: 'B',
  enforcedBy:
    'lib/relational/developmentalStateAdmission.ts — admitPersistedStateForShaping() strips INFERRED_DEVELOPMENTAL_FIELDS under kind:"none"; app/api/oracle/conversation feeds decideRelationalHint through it; relationalStance.ts reads only from its input (no self-fetch)',
  evidence: [
    `${ADMISSION}: INFERRED_DEVELOPMENTAL_FIELDS includes relational_phase + autonomy_streak (+ future fields); admitPersistedStateForShaping strips the class by default`,
    `${CONSUMER}: decideRelationalHint receives persistedState via admitPersistedStateForShaping(), not raw spiralState`,
    `${ENGINE}: relationalStance reads persisted fields only from its typed input — never loads them itself`,
  ].join(' | '),
  violationAttempted: [
    '(1) is the admission boundary / class list missing or empty (no chokepoint)?',
    '(2) does the known consumer pass RAW persisted spiralState to decideRelationalHint (un-admitted)?',
    '(3) does the shaping engine self-fetch persisted developmental state, bypassing the chokepoint?',
  ].join('; '),
  passingAuthorizes:
    'the claim that persisted inferred developmental state cannot reach the relational-stance response-shaping path except stripped/authorized via the admission boundary — so activating the dormant oracle/conversation route cannot introduce the Type-A violation, and the same boundary refuses future inferred-developmental fields',
  passingDoesNotAuthorize:
    'that EVERY response-shaping subsystem everywhere is covered (a NEW subsystem that directly queries member_spiral_state would be a new violation requiring the same admission pattern — the boundary is the correct mechanism, but this check enforces it only at the known consumer + the engine no-self-fetch), that relational stance is live (it is dormant), or that member_spiral_state should be deleted (persistence is fine; consumption for shaping is what is gated)',
  hostileForkMustChange:
    'pass raw spiralState to decideRelationalHint instead of admitPersistedStateForShaping() (visible diff), empty/remove fields from INFERRED_DEVELOPMENTAL_FIELDS (visible diff), or make relationalStance import a persisted-state loader and self-fetch (visible diff)',

  run(io) {
    // ── 1: admission boundary + class exist and strip the class ──
    const adm = io.read(ADMISSION);
    const cls = CLASS_RE.exec(adm);
    const classBody = cls?.[1] ?? '';
    const hasPhase = /'relational_phase'/.test(classBody);
    const hasStreak = /'autonomy_streak'/.test(classBody);
    if (cls && hasPhase && hasStreak && ADMIT_FN_RE.test(adm) && STRIP_RE.test(adm)) {
      io.pass(
        'admission boundary strips the inferred-developmental class by default',
        `INFERRED_DEVELOPMENTAL_FIELDS has relational_phase + autonomy_streak; admitPersistedStateForShaping deletes the class under kind:'none'`,
      );
    } else {
      io.fail(
        'admission chokepoint absent or does not strip the class',
        `classFound=${!!cls} phase=${hasPhase} streak=${hasStreak} admitFn=${ADMIT_FN_RE.test(adm)} strips=${STRIP_RE.test(adm)}`,
      );
    }

    // ── 2: the known consumer routes persisted state THROUGH the boundary ──
    const consumer = io.read(CONSUMER);
    if (GUARDED_CALL_RE.test(consumer) && !RAW_CALL_RE.test(consumer)) {
      io.pass(
        'decideRelationalHint receives persisted state via the admission boundary',
        'no raw `persistedState: spiralState` reaches relational stance',
      );
    } else {
      io.fail(
        'persisted inferred developmental state reaches relational stance un-admitted',
        `guarded=${GUARDED_CALL_RE.test(consumer)} rawPresent=${RAW_CALL_RE.test(consumer)} — raw persisted state shapes stance/hold/brevity`,
      );
    }

    // ── 3: the shaping engine cannot bypass the chokepoint ──
    const engine = io.read(ENGINE);
    if (!ENGINE_SELF_FETCH_RE.test(engine)) {
      io.pass(
        'relationalStance reads persisted fields only from its input (no self-fetch)',
        'the admission boundary is the only path in — cannot be bypassed by the engine',
      );
    } else {
      io.fail(
        'relationalStance self-fetches persisted developmental state',
        'the engine loads persisted state directly, bypassing the admission boundary',
      );
    }
  },
};
