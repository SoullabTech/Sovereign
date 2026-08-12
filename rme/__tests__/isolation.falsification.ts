/**
 * RME-001 — Adversarial falsification of the one-way boundary.
 *
 * These are not architecture-review assertions. Each case is an ATTACK: a plausible
 * route by which RME material could reach MAIA. The suite passes only if every
 * attack is refused.
 *
 * Invariant under test:
 *   RME may learn about MAIA from encounters. MAIA may not learn about members from RME.
 *
 * Run:  npx tsx rme/__tests__/isolation.falsification.ts
 */

import {
  quarantine,
  reveal,
  withEvaluationBoundary,
  egressLedger,
  resetLedgerForTest,
  BoundaryViolation,
  FORBIDDEN_SINKS,
  type EvaluationCapability,
  type Quarantined,
} from '../boundary/isolation';
import { executeConditionB, buildConditionCSpec, buildConditionBSpec, assertBIsCompetent, corBClosed } from '../conditionB/competentB';
import { composite, tallyWithinEncounter, DIMENSIONS } from '../rubric/dimensions';
import { authorizeInspection, sendFeedbackSurface, CONTACT_ENABLED } from '../consent/cohort';
import { B_MUST_RETAIN, CONTAMINATION_SURFACES, validateBPlan } from '../conditionB/contamination';
import { FORBIDDEN_DERIVATIONS, longitudinalSequence, renderJudgment } from '../schema/derivation';

let passed = 0;
let failed = 0;

function attack(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(
      () => {
        passed++;
        console.log(`  ✓ ${name}`);
      },
      (err) => {
        failed++;
        console.log(`  ✗ ${name}\n      ${err?.message ?? err}`);
      },
    );
}

function expectRefused(fn: () => unknown, why: string): void {
  try {
    fn();
  } catch {
    return; // refused, as required
  }
  throw new Error(`NOT REFUSED — ${why}`);
}

async function main() {
  console.log('\nRME-001 boundary falsification\n');
  resetLedgerForTest();

  const bResponse = quarantine('condition_b_response', 'a response the member never received');

  // --- Attack group 1: direct delivery to every enumerated MAIA sink -------------
  console.log('[1] direct delivery to MAIA sinks');
  await withEvaluationBoundary('falsification', async (cap) => {
    for (const sink of FORBIDDEN_SINKS) {
      await attack(`refuses ${sink}`, () => {
        expectRefused(() => reveal(bResponse, cap, sink), `${sink} accepted RME artifact`);
      });
    }
    // Unenumerated MAIA surface — prefix defence must catch it.
    await attack('refuses an unenumerated maia.* sink', () => {
      expectRefused(
        () => reveal(bResponse, cap, 'maia.some_future_subsystem'),
        'unenumerated maia.* sink accepted RME artifact',
      );
    });
  });

  // --- Attack group 2: capability smuggling -------------------------------------
  console.log('\n[2] capability smuggling');
  let smuggled: EvaluationCapability | null = null;
  await withEvaluationBoundary('smuggler', async (cap) => {
    smuggled = cap; // captured by a closure, as an attacker would
  });
  await attack('a capability captured from an exited scope is dead', () => {
    expectRefused(
      () => reveal(bResponse, smuggled as unknown as EvaluationCapability, 'rme.report'),
      'expired capability still unwrapped an artifact',
    );
  });
  await attack('a forged capability object is rejected', () => {
    const forged = { scopeId: 'forged', live: true } as unknown as EvaluationCapability;
    expectRefused(() => reveal(bResponse, forged, 'rme.report'), 'forged capability accepted');
  });

  // --- Attack group 3: reading the artifact without the boundary at all ---------
  console.log('\n[3] reading without the boundary');
  await attack('the artifact exposes no readable payload property', () => {
    const leaked = JSON.stringify(bResponse);
    if (leaked.includes('never received')) {
      throw new Error(`payload serialized out of the handle: ${leaked}`);
    }
    const props = Object.values(bResponse as unknown as Record<string, unknown>);
    if (props.some((v) => typeof v === 'string' && v.includes('never received'))) {
      throw new Error('payload readable via own enumerable properties');
    }
  });
  await attack('String()/template interpolation does not surface the payload', () => {
    const s = `${String(bResponse)}`;
    if (s.includes('never received')) throw new Error(`payload surfaced via coercion: ${s}`);
  });

  // --- Attack group 4: the ledger must witness every legitimate egress ----------
  console.log('\n[4] egress is witnessed');
  resetLedgerForTest();
  await withEvaluationBoundary('report', async (cap) => {
    const v = reveal(bResponse, cap, 'rme.evaluator_surface');
    if (!v.includes('never received')) throw new Error('legitimate read did not return the value');
  });
  await attack('legitimate egress is recorded in the ledger', () => {
    const l = egressLedger();
    if (l.length !== 1) throw new Error(`expected 1 egress record, saw ${l.length}`);
    if (l[0].sink !== 'rme.evaluator_surface') throw new Error('ledger recorded the wrong sink');
  });
  await attack('no egress to any maia.* sink is present in the ledger', () => {
    const bad = egressLedger().filter((r) => r.sink.startsWith('maia.'));
    if (bad.length) throw new Error(`ledger contains MAIA-bound egress: ${JSON.stringify(bad)}`);
  });

  // --- Attack group 5: COR-B and condition C ------------------------------------
  console.log('\n[5] execution gates');
  await attack('COR-B is not closed', () => {
    if (corBClosed()) throw new Error('COR-B reports closed; it must be closed by founder ruling only');
  });
  await attack('executeConditionB refuses while COR-B is open', async () => {
    let refused = false;
    try {
      await executeConditionB({} as never);
    } catch {
      refused = true;
    }
    if (!refused) throw new Error('condition B executed with COR-B open');
  });
  await attack('condition C is not constructible', () => {
    expectRefused(() => buildConditionCSpec(), 'condition C was constructed');
  });
  await attack('an encounter with unestablished posture is INELIGIBLE, not guessed', () => {
    const spec = buildConditionBSpec({
      encounterId: 'E1',
      memberMessage: 'hello',
      originalPosture: null,
      experimentalBoundaryTurnId: 10,
      sameTurnContextAvailable: true,
    });
    if (spec.eligibility !== 'INELIGIBLE_FOR_COUNTERFACTUAL') {
      throw new Error(`expected INELIGIBLE_FOR_COUNTERFACTUAL, got ${spec.eligibility}`);
    }
  });
  await attack('a weakened B is refused by assertBIsCompetent', () => {
    const spec = buildConditionBSpec({
      encounterId: 'E2',
      memberMessage: 'hello',
      originalPosture: 'normal',
      experimentalBoundaryTurnId: 10,
      sameTurnContextAvailable: false, // present-turn context withheld = weakened
    });
    expectRefused(() => assertBIsCompetent(spec), 'a weakened B passed the competence check');
  });

  // --- Attack group 6: member-level aggregation and composite scoring -----------
  console.log('\n[6] aggregation refusals');
  await attack('composite relationship scoring is refused', () => {
    expectRefused(() => composite([]), 'a composite relationship score was produced');
  });
  await attack('within-encounter tally preserves dimensions (no single number)', () => {
    const t = tallyWithinEncounter([
      { dimension: 'presence', favours: 'A', note: '' },
      { dimension: 'presumption', favours: 'B', note: '' },
    ]);
    if (typeof (t as unknown as number) === 'number') throw new Error('tally collapsed to a scalar');
    if (DIMENSIONS.length !== 9) throw new Error(`expected 9 preserved dimensions, saw ${DIMENSIONS.length}`);
  });

  // --- Attack group 7: inspection and contact authority separation --------------
  console.log('\n[7] authority separation');
  await attack('inspection refused without opt-in', () => {
    expectRefused(
      () => authorizeInspection({ consent: null, role: 'founder_evaluator' }),
      'inspection allowed without member opt-in',
    );
  });
  await attack('inspection refused for a general repo agent', () => {
    const consent = {
      cohortRef: 'c1' as never,
      consentedToInspection: true,
      consentedToContact: true,
      statementVersion: 'v1',
      recordedAt: '2026-08-12',
    };
    expectRefused(
      () => authorizeInspection({ consent, role: 'general_repo_agent' }),
      'a general repo agent was allowed to read member content',
    );
  });
  await attack('consent to inspection does not enable contact', () => {
    if (CONTACT_ENABLED) throw new Error('member contact is enabled; it must be separately authorized');
    expectRefused(() => sendFeedbackSurface('c1' as never), 'feedback surface sent while contact disabled');
  });

  // --- Attack group 8: Q2 — implicit member profile via aggregation ------------
  console.log('\n[8] implicit member profiles (Q2)');
  const cohort = 'c1' as never;
  const judgments = [
    { encounterId: 'E1', evaluatorRef: 'ev', dimension: 'presumption' as const, favours: 'B' as const, note: '' },
    { encounterId: 'E2', evaluatorRef: 'ev', dimension: 'presence' as const, favours: 'A' as const, note: '' },
  ];
  for (const [name, fn] of Object.entries(FORBIDDEN_DERIVATIONS)) {
    await attack(`refuses per-member derivation: ${name}`, () => {
      expectRefused(() => (fn as (a: never, b: unknown) => unknown)(cohort, judgments), `${name} produced a member value`);
    });
  }
  await attack('longitudinal reading is permitted and stays encounter-shaped', () => {
    const seq = longitudinalSequence([
      { encounterId: 'E2', cohortRef: cohort, occurredAt: '2026-02-01', epoch: { id: 'ep2' } as never, situation: 'previously_unfinished', eligibility: 'ELIGIBLE', conditions: [], judgments: [], memberFeedback: [] } as never,
      { encounterId: 'E1', cohortRef: cohort, occurredAt: '2026-01-01', epoch: { id: 'ep1' } as never, situation: 'corrected_misunderstanding', eligibility: 'ELIGIBLE', conditions: [], judgments: [], memberFeedback: [] } as never,
    ]);
    if (seq.encounters[0].encounterId !== 'E1') throw new Error('temporal ordering not preserved');
    const anyScalar = Object.values(seq).some((v) => typeof v === 'number');
    if (anyScalar) throw new Error('longitudinal object carries a scalar');
  });

  // --- Attack group 9: Q3 — B contamination and Q5 — judgment-as-fact ----------
  console.log('\n[9] B contamination (Q3) and judgment framing (Q5)');
  const cleanPlan = {
    encounterId: 'E1',
    retained: [...B_MUST_RETAIN],
    excludedSurfaces: CONTAMINATION_SURFACES.filter((s) => s.mustBeExcludedFromB).map((s) => s.id),
    historyTruncatedAtTurnId: 10,
  };
  await attack('a clean B plan validates', () => validateBPlan(cleanPlan as never));
  await attack('B missing present-turn context is refused as weakened', () => {
    expectRefused(
      () => validateBPlan({ ...cleanPlan, retained: cleanPlan.retained.filter((r) => r !== 'present_turn_member_message') } as never),
      'a contextless B validated',
    );
  });
  await attack('B retaining rollingAverage is refused as contaminated', () => {
    expectRefused(
      () => validateBPlan({ ...cleanPlan, excludedSurfaces: cleanPlan.excludedSurfaces.filter((s) => s !== 'cognitive_profile_rolling_average') } as never),
      'B validated while inheriting the 20-turn accumulated judgment',
    );
  });
  await attack('B with untruncated detector history is refused', () => {
    expectRefused(
      () => validateBPlan({ ...cleanPlan, historyTruncatedAtTurnId: null } as never),
      'B validated with history reaching past the experimental boundary',
    );
  });
  await attack('a judgment phrased as a member fact is refused at render', () => {
    expectRefused(
      () => renderJudgment({ encounterId: 'E1', evaluatorRef: 'ev', dimension: 'restraint', favours: 'B', note: 'This member needs less memory.' }),
      'a person-claim was rendered as evidence',
    );
  });
  await attack('an encounter-scoped judgment renders with its scope attached', () => {
    const s = renderJudgment({ encounterId: 'E1', evaluatorRef: 'ev', dimension: 'presumption', favours: 'B', note: 'A assumed the move was still wanted.' });
    if (!s.startsWith('In encounter E1,')) throw new Error(`scope not attached: ${s}`);
  });

  console.log(`\n${passed} refused/asserted, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

void main();
