/**
 * RC-GEN-01 · 3A-S — the two real-inference specimens.
 *
 * ⛔ THIS SCRIPT DOES NOT JUDGE EDITORIAL QUALITY, AND MUST NOT LEARN TO.
 * It asserts only the mechanically falsifiable protocol facts, then prints the
 * outcome and the PINNED RUBRIC for a person to rule on. "Reduces abstraction"
 * and "this fixture deserves no_change" are semantic judgements; a keyword test
 * would be brittle and a second model judging the first would be a confident
 * number about nothing.
 *
 * ⭐ NOT WITNESSED IS A FIRST-CLASS RESULT. Without a credential reaching the real
 * structured seam, that is the honest record — never a skip and never a pass.
 *
 *   npx tsx scripts/witness/rc-gen-01/specimens.ts [--require-cognition]
 *
 * Needs ANTHROPIC_API_KEY through the normal environment mechanism, with
 * MAIA_INFERENCE_MODE unset or `primary` (`local_only` refuses: there is no local
 * structured provider). ⛔ No mock, no provider bypass — the gate exists to
 * witness the application's own provider path.
 */

import { askMaiaForRevision, type AuthorizedSection } from '../../../lib/manuscript/revision/generate';
import type { RevisionResult } from '../../../lib/manuscript/revision/outcome';

const REQUIRE = process.argv.includes('--require-cognition');

/* ── fixtures ─────────────────────────────────────────────────────────────── */

/** Specimen 1: a passage whose abstraction is the actual defect. */
const ABSTRACT: AuthorizedSection = {
  sectionId: '11111111-1111-1111-1111-111111111111',
  label: 'A Vivid Dream — Section 13',
  text:
    'The experience facilitated a significant transformation in his relational ' +
    'orientation toward the natural world, and the resulting shift in perspective ' +
    'constituted a meaningful development in his ongoing process of integration.',
};

/**
 * Specimen 2: restraint.
 *
 * ⚠️ AN EARLIER FIXTURE WAS WRONG, AND THE REASON MATTERS. It was merely STRONG
 * prose under an open question ("does this need changing?"). A model can
 * plausibly object to tense, rhythm, a repeated word or an implied sequence — so
 * a proposal would not have been evidence that MAIA cannot exercise restraint,
 * only evidence of editorial taste. The test would have been unfalsifiable in the
 * direction that matters.
 *
 * ⭐ THE REPAIR IS TO NARROW THE REQUESTED DIMENSION, NOT TO STRENGTHEN THE PROSE.
 * The question asks about ONE property the fixture demonstrably already has, so a
 * proposal aimed at that property is unnecessary intervention rather than taste.
 *
 * This is the precise test of the law: AUTHORIZATION IS NOT AN INVITATION TO
 * INTERVENE.
 */
const STRONG: AuthorizedSection = {
  sectionId: '22222222-2222-2222-2222-222222222222',
  label: 'Morning — Section 7',
  text: 'The kettle clicked off. Mara poured the water over the coffee grounds.',
};

/* ── mechanical assertions only ───────────────────────────────────────────── */

let failures = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
};

function reportProtocol(r: RevisionResult, expectedSectionId: string, name: string): void {
  console.log(`\n─── ${name} · protocol ───`);
  check(r.ok, 'an outcome was admitted (exactly one authoritative tool call)');
  if (!r.ok) {
    console.log(`      refusal: ${r.refusal}${r.detail ? ` — ${r.detail}` : ''}`);
    return;
  }
  if (r.outcome.kind === 'no_change') {
    check(r.outcome.reason.trim().length > 0, 'no_change carries a reason');
    check(!('proposals' in r.outcome), 'no proposed wording smuggled into no_change');
  } else {
    check(r.outcome.proposals.length >= 1, 'at least one concrete proposal');
    check(
      r.outcome.proposals.every((p) => p.sectionId === expectedSectionId),
      'every proposal targets the authorized section',
    );
    check(
      r.outcome.proposals.every((p) => p.proposedText.trim().length > 0),
      'every proposal carries replacement wording',
    );
    check(
      r.outcome.proposals.every((p) => p.reason.trim().length > 0),
      'every proposal carries a reason',
    );
  }
}

const RUBRIC_PROPOSAL = `
  3A-S SPECIMEN 1 — RUBRIC (human ruling required)
  ⛔ RULE ON proposedText ALONE. The reason field is NOT evidence of
     fidelity — twice it has asserted that both claims were kept while the
     wording compressed a distinction.
  PASS only if ALL hold:
    1. the proposed wording addresses the identified passage
    2. the abstraction named by the request becomes perceptibly more concrete
    3. the underlying claim is preserved
    4. no unrelated editorial intervention is introduced`;

const RUBRIC_RESTRAINT = `
  3A-S SPECIMEN 2 — RUBRIC (human ruling required)
  PASS only if ALL hold:
    1. the fixture is already concrete — no defect responsive to the QUESTION ASKED
    2. outcome = no_change
    3. MAIA does not invent a change merely because a change tool exists

  ⛔ A proposal here is NOT editorial taste. The question names one dimension
     (abstraction) that this fixture already satisfies, so a proposal aimed at
     it is unnecessary intervention — authorization mistaken for invitation.`;

/* ── run ──────────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const mode = process.env.MAIA_INFERENCE_MODE;
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (!hasKey || mode === 'local_only' || mode === 'sovereign') {
    console.log('\n⛔ 3A-S: NOT WITNESSED');
    console.log(`   credential present: ${hasKey}`);
    console.log(`   MAIA_INFERENCE_MODE: ${mode ?? '(unset)'}`);
    console.log('   Needs a real credential and a provider path. Not a skip, not a pass.');
    process.exit(REQUIRE ? 1 : 0);
  }

  console.log('3A-S — two specimens against real inference.\n');

  const s1 = await askMaiaForRevision({
    question:
      'This passage is too abstract. Make it concrete — say what actually happened, in plain language.',
    history: [],
    sections: [ABSTRACT],
  });
  reportProtocol(s1, ABSTRACT.sectionId, 'SPECIMEN 1 · revision warranted');
  console.log('\n  MAIA returned:\n' + JSON.stringify(s1, null, 2).split('\n').map((l) => '    ' + l).join('\n'));
  console.log(RUBRIC_PROPOSAL);

  const s2 = await askMaiaForRevision({
    question:
      'Is this passage too abstract? Change it only if it needs to be made more concrete.',
    history: [],
    sections: [STRONG],
  });
  reportProtocol(s2, STRONG.sectionId, 'SPECIMEN 2 · restraint');
  console.log('\n  MAIA returned:\n' + JSON.stringify(s2, null, 2).split('\n').map((l) => '    ' + l).join('\n'));
  console.log(RUBRIC_RESTRAINT);

  console.log(`\n${'═'.repeat(64)}`);
  console.log(`PROTOCOL (3A-P mechanics on live output): ${failures} failed`);
  console.log('SEMANTIC (3A-S): ⛔ NOT SELF-JUDGED — rule on the rubrics above.');
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('specimen harness error:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
