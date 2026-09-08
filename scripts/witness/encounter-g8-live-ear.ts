/**
 * WS2-ENCOUNTER-01 · G8 — the live semantic-ear witness.
 *
 * Founder ruling 2026-09-08. Everything up to here has been driven by fixtures,
 * which proves the pipeline and not the model's ear:
 *
 *   Built is not perceived.
 *
 * This runs the REAL structured-inference seam against a real Work and prints
 * enough for a person to adjudicate. It is acceptance evidence, not a gate, and
 * it is deliberately NOT a judge model — an automated adjudicator would need its
 * own constitution and its own negative controls before its verdict could carry
 * any authority.
 *
 *   MAIA_INFERENCE_MODE=primary ANTHROPIC_API_KEY=... \
 *   MAIA_ENCOUNTER_MODEL=<pinned> DATABASE_URL=... \
 *   ENCOUNTER_G8_CONFIRM=1 ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST=1 \
 *   npx tsx scripts/witness/encounter-g8-live-ear.ts <manuscriptId> <memberId>
 *
 * TWO GUARDS, TWO DIFFERENT ACTS — deliberately not collapsed:
 *
 *   ENCOUNTER_G8_CONFIRM                 I intend to execute cognition
 *                                        (a real, paid inference call)
 *   ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST  I attest, as a person, that this
 *                                        execution context is the
 *                                        product-authorized one
 *
 * ⛔ DO NOT RUN THIS FROM THE AUTHORING-SESSION ENVIRONMENT, even if a key
 * appears there. Its transparent proxy presents at the canonical origin, which
 * makes that context unsuitable for acceptance evidence unless its channel is
 * separately constituted as product-authorized — which has not occurred.
 *
 * READ-ONLY: it captures a draft, calls the seam, and prints. It writes nothing
 * to the database and nothing to the vault.
 *
 * ── WHAT THE ADJUDICATOR IS ASKED ─────────────────────────────────────────
 *
 * For every notice that SURVIVES the mechanical screen:
 *
 *   1. Does this help the writer recognize what is present, or has it begun
 *      establishing what the Work wants, lacks, owes, should do, does to a
 *      reader, or ought to become?
 *   2. Does the cited text actually GROUND the observation, rather than merely
 *      exist at the stated coordinates?
 *
 * SHA-256 proves identity. It cannot prove that the observation arises from that
 * evidence. That second question is the whole reason this witness exists.
 *
 * ⛔ If the model cannot produce reliable coordinates, RETURN THAT FINDING. Do
 * not repair coordinates by fuzzy search, quote matching, nearest-span selection
 * or another model pass — that would alter the evidence constitution and needs a
 * ruling.
 */
import { captureDraft } from '@/lib/manuscript/encounter/read';
import { traverseWhole } from '@/lib/manuscript/encounter/traversal';
import { renderWindowRequest, encounterModel } from '@/lib/manuscript/encounter/render';
import { parseNoticeBlocks } from '@/lib/manuscript/encounter/parse';
import { bindProposals } from '@/lib/manuscript/encounter/bind';
import { screenCandidate } from '@/lib/manuscript/encounter/vocabulary';
import { runStructured } from '@/lib/ai/structured/router';

if (!process.env.ENCOUNTER_G8_CONFIRM) {
  console.error('Refusing to run without ENCOUNTER_G8_CONFIRM=1 (this calls a real model).');
  process.exit(2);
}

/**
 * ── CHANNEL PROVENANCE, BEFORE ANY INFERENCE ──────────────────────────────
 *
 * Founder ruling 2026-09-08. Three facts, and no two may be collapsed:
 *
 *   REQUESTED   what we intended to invoke
 *   REPORTED    what the provider says answered
 *   AUTHORIZED  whether we invoked it through the constituted channel
 *
 * A matching model name proves nothing about the channel: correct model + wrong
 * inference authority = wrong act. So the origin is checked BEFORE the first
 * call — a borrowed proxy must not get to answer at all.
 *
 * ⛔ The credential itself is never printed, hashed, fingerprinted or derived
 * from. And the witness deliberately does NOT claim to know where the key came
 * from: a process can observe that an environment variable is set; it cannot
 * determine the human provenance of the bytes in it. That last fact is the
 * operator's attestation, not a machine-derived boolean.
 */
const CANONICAL_ORIGIN = 'https://api.anthropic.com';

/**
 * ⚠ WHAT THIS VALUE IS, AND WHAT IT IS NOT.
 *
 * It is the CONFIGURED BASE URL ORIGIN — read from `ANTHROPIC_BASE_URL`, or the
 * canonical default when unset. It is **not** proof of the network channel, and
 * it must never be described as a resolved endpoint or as channel identity.
 *
 * This lane learned the difference the hard way: the authoring session's own
 * transparent proxy presents AT `https://api.anthropic.com`. So this check
 * catches an OBSERVABLY foreign endpoint (SP-4A) and cannot catch a transparent
 * one (SP-4B). A machine can tell us what endpoint was configured; it cannot, in
 * this architecture, tell us who authorized the channel that actually carried
 * the request.
 */
function configuredBaseUrlOrigin(): string {
  const raw = process.env.ANTHROPIC_BASE_URL;
  if (!raw || raw.trim() === '') return CANONICAL_ORIGIN;
  try {
    const u = new URL(raw);
    return u.port ? `${u.protocol}//${u.hostname}:${u.port}` : `${u.protocol}//${u.hostname}`;
  } catch {
    return `<unparseable: ${raw.slice(0, 40)}>`;
  }
}

const [manuscriptId, memberId] = process.argv.slice(2);
if (!manuscriptId || !memberId) {
  console.error('usage: encounter-g8-live-ear.ts <manuscriptId> <memberId>');
  process.exit(2);
}

async function main() {
  const origin = configuredBaseUrlOrigin();
  const keyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  const attested = Boolean(process.env.ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST);

  console.log(`\nG8 LIVE EAR WITNESS`);
  console.log(`inference mode      : ${process.env.MAIA_INFERENCE_MODE ?? '<unset>'}`);
  console.log(`configured model    : ${encounterModel()}`);
  console.log(`configured base URL : ${origin}`);
  console.log(`  (the CONFIGURED origin — not proof of the network channel; a transparent`);
  console.log(`   proxy can present at the canonical origin.)`);
  console.log(`ANTHROPIC_API_KEY   : ${keyPresent ? 'present' : 'ABSENT'}`);
  console.log(`product-channel     : ${attested ? 'OPERATOR ATTESTED' : 'NOT ATTESTED'}`);
  console.log(`  (human attestation, NOT machine verification: this process can see that a`);
  console.log(`   variable is set; it cannot determine the provenance of the bytes in it.)\n`);

  /* SP-4A — machine-observable foreign origin. Refused BEFORE any inference, so
     a borrowed endpoint never gets to answer, and a matching model name could
     not rescue it. */
  if (origin !== CANONICAL_ORIGIN) {
    console.error(`⛔ G8 CHANNEL FAILURE — configured base URL origin is ${origin}, not ${CANONICAL_ORIGIN}.`);
    console.error('   No inference is performed. Correct model + wrong inference authority');
    console.error('   is still the wrong act.');
    process.exit(1);
  }

  /* SP-4B — the fact no machine here can supply. Made an explicit act rather
     than left implicit in whoever happens to run the command, because it now
     carries real acceptance authority: with a transparent proxy, this is the
     ONLY thing between a real witness and a plausible-looking counterfeit. */
  if (!attested) {
    console.error('⛔ G8 STOP — product-channel attestation absent.');
    console.error('   Set ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST=1 to attest, as a person, that');
    console.error('   this process is using the PRODUCT-AUTHORIZED inference credential and');
    console.error('   channel. A canonical configured origin is NECESSARY evidence and is NOT');
    console.error('   SUFFICIENT: a transparent proxy presents at the canonical origin too.');
    console.error('   ⛔ Do not set this from the authoring-session environment.');
    process.exit(1);
  }
  if (!keyPresent) {
    console.error('⛔ ANTHROPIC_API_KEY absent — G8 cannot run. This is not a product defect.');
    process.exit(1);
  }

  const captured = await captureDraft(manuscriptId, memberId);
  if (!captured) {
    console.error('No Working Draft for that Work and member. (Source is not read.)');
    process.exit(1);
  }
  const traversal = traverseWhole(captured.text);
  if (!traversal.complete) {
    console.error('Traversal incomplete — refusing rather than sampling.');
    process.exit(1);
  }

  console.log(`snapshot            : rev ${captured.snapshot.revisionNumber} · ${captured.snapshot.length} code points`);
  console.log(`digest              : ${captured.snapshot.wholeDraftDigest}`);
  console.log(`windows             : ${traversal.windows.length}\n`);

  let surviving = 0;
  let rejected = 0;

  for (const [i, w] of traversal.windows.entries()) {
    const outcome = await runStructured(renderWindowRequest(captured.snapshot, w));
    if (!outcome.ok) {
      /* C7: cognition did not complete. Not silence. */
      console.error(`WINDOW ${i + 1}: COGNITION UNAVAILABLE — ${outcome.refusal}: ${outcome.detail ?? ''}`);
      process.exit(1);
    }

    /* PROVENANCE IS WHAT THE SEAM RETURNS, not the stop reason. The first draft
       of this witness printed `stopReason` under the label "raw provenance",
       which is a record saying something it does not know: a stop reason
       describes how the completion ended, and says nothing about which provider
       or which model actually answered. The distinction between the CONFIGURED
       model and the model REPORTED BACK is exactly what a provenance witness
       exists to expose. */
    const prov = outcome.result.provenance;
    console.log(`── WINDOW ${i + 1} (${w.contextStartCodePoint}..${w.endCodePoint}) ─────────────`);
    console.log(`provider       : ${prov.provider}`);
    console.log(`requested/sent : ${prov.model}`);
    console.log(`reported model : ${prov.reportedModel ?? '<unreported>'}`);
    console.log(`model agreement: ${prov.modelAgreement}`);
    console.log(`latencyMs      : ${prov.latencyMs}`);

    /* MODEL ACCEPTANCE, before any semantic adjudication. */
    if (prov.reportedModel === null) {
      console.error('\n⛔ G8 STOP — provenance incomplete: the provider reported no model identity.');
      console.error('   Nothing is adjudicated on an unreported act.');
      process.exit(1);
    }
    if (prov.modelAgreement === 'differs') {
      console.error(`\n⛔ G8 STOP — MODEL PROVENANCE FINDING: requested ${prov.model}, reported ${prov.reportedModel}.`);
      console.error('   If another model performed the act, the constituted act is not the act');
      console.error('   we thought we were witnessing. Return this; do not adjudicate.');
      process.exit(1);
    }
    if (prov.model !== encounterModel()) {
      console.error(`\n⛔ G8 STOP — the model SENT (${prov.model}) is not the CONFIGURED Encounter model (${encounterModel()}).`);
      process.exit(1);
    }
    console.log(`stop reason    : ${JSON.stringify(outcome.result.stopReason)}`);
    console.log(`tokens         : in=${outcome.result.usage.inputTokens} out=${outcome.result.usage.outputTokens}`);
    console.log(`raw blocks     : ${JSON.stringify(outcome.result.content)}\n`);

    const parsed = parseNoticeBlocks(outcome.result.content);
    if (!parsed.ok) {
      console.error(`  ⛔ CONTRACT FAILURE (${parsed.reason}) — this is a refusal, not silence.`);
      process.exit(1);
    }
    if (parsed.proposals.length === 0) {
      console.log('  (declared silence — a complete answer)\n');
      continue;
    }

    const bound = bindProposals(captured.text, parsed.proposals, {
      visibleStart: w.contextStartCodePoint,
      visibleEnd: w.endCodePoint,
    });
    if (bound.length < parsed.proposals.length) {
      console.log(`  ⚠ ${parsed.proposals.length - bound.length} proposal(s) did NOT bind — invented, mis-ranged, or outside what this call saw. Coordinates are NOT repaired.`);
    }

    for (const c of bound) {
      const violations = screenCandidate(c);
      const points = Array.from(captured.text);
      console.log(`  family     : ${c.family}`);
      console.log(`  notice     : ${c.text}`);
      for (const a of c.anchors) {
        console.log(`  anchor     : ${a.startCodePoint}..${a.endCodePoint}  digest ${a.spanDigest.slice(0, 12)}…`);
        console.log(`  cited text : ${JSON.stringify(points.slice(a.startCodePoint, a.endCodePoint).join(''))}`);
      }
      if (violations.length > 0) {
        rejected += 1;
        console.log(`  SCREEN     : REJECTED (${violations.join(', ')}) — never reaches the writer\n`);
      } else {
        surviving += 1;
        console.log(`  SCREEN     : SURVIVES → ADJUDICATE THIS ONE`);
        console.log(`               (a) recognition, or the beginning of a case?`);
        console.log(`               (b) does the cited text GROUND it, or merely exist there?\n`);
      }
    }
  }

  console.log(`\n${surviving} notice(s) survived the screen and need human adjudication.`);
  console.log(`${rejected} rejected mechanically (retained above for diagnosis; these do not fail G8).`);
  if (surviving === 0) {
    console.log('\n⚠ EVERY LIVE CASE YIELDED SILENCE. Nothing is necessarily wrong with the');
    console.log('  product — but G8 has NOT demonstrated perception. Try another Work.');
  }
  console.log('\nG8 FAILS if any surviving notice reads as developmental to the human ear.');
}

main().catch((e) => { console.error(e); process.exit(1); });
