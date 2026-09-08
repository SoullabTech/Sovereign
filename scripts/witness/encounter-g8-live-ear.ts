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
 *   ENCOUNTER_G8_CONFIRM=1 npx tsx scripts/witness/encounter-g8-live-ear.ts <manuscriptId> <memberId>
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

const [manuscriptId, memberId] = process.argv.slice(2);
if (!manuscriptId || !memberId) {
  console.error('usage: encounter-g8-live-ear.ts <manuscriptId> <memberId>');
  process.exit(2);
}

async function main() {
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

  console.log(`\nG8 LIVE EAR WITNESS`);
  console.log(`configured model : ${encounterModel()}`);
  console.log(`snapshot         : rev ${captured.snapshot.revisionNumber} · ${captured.snapshot.length} code points`);
  console.log(`digest           : ${captured.snapshot.wholeDraftDigest}`);
  console.log(`windows          : ${traversal.windows.length}\n`);

  let surviving = 0;
  let rejected = 0;

  for (const [i, w] of traversal.windows.entries()) {
    const outcome = await runStructured(renderWindowRequest(captured.snapshot, w));
    if (!outcome.ok) {
      /* C7: cognition did not complete. Not silence. */
      console.error(`WINDOW ${i + 1}: COGNITION UNAVAILABLE — ${outcome.refusal}: ${outcome.detail ?? ''}`);
      process.exit(1);
    }

    console.log(`── WINDOW ${i + 1} (${w.contextStartCodePoint}..${w.endCodePoint}) ─────────────`);
    console.log(`raw provenance : ${JSON.stringify(outcome.result.stopReason)}`);
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
