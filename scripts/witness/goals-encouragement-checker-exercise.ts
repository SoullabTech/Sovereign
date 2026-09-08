/**
 * GOALS SUPPORT · PHASE 1 — checker exercise.
 *
 * Answers one question that does NOT need a model, and which decides how a
 * keyed witness can fail:
 *
 *     Can warm language survive the FR-16 checker at all?
 *
 * If nothing warm passes, the architecture is safe and the product has failed —
 * the writer chose support and receives permanent silence. If flat, dead
 * language passes while human language is refused, same result.
 *
 * Run:  npx tsx scripts/witness/goals-encouragement-checker-exercise.ts
 *
 * FOUND BY THIS EXERCISE, not by any test: "That is a wonderful goal." passed
 * the declaration check, because the rule enumerated phrases ("great goal",
 * "excellent") instead of forbidding the CLASS. Enumerating the ways to approve
 * of something is a losing game; there is always another adjective.
 */
import { checkEncouragement, type EncourageableAct } from '../../lib/writersStudio/goalEncouragement';

const CANDIDATES: Array<[EncourageableAct, string]> = [
  // DECLARE — warm, plain, no approval
  ['declared', 'Held.'],
  ['declared', 'That is written down now, in your words.'],
  ['declared', 'Noted, exactly as you said it.'],
  ['declared', 'It has a place here now.'],
  ['declared', 'That is a wonderful goal.'],                     // expect refuse
  ['declared', 'Ambitious. I think you can do it.'],             // expect refuse
  // MET — celebrate the work, let it close
  ['met', 'The chapter you set out to finish is finished.'],
  ['met', 'Three thousand words on the Torus chapter, done.'],
  ['met', 'That is the whole of what you said you would do.'],
  ['met', 'Finished. It stands.'],
  ['met', 'What you wanted to write is written.'],
  ['met', 'Done — what shall we tackle next?'],                  // expect refuse
  ['met', "You're doing so well."],                              // expect refuse
  // RELEASE — respected, no leverage
  ['released', 'Let go.'],
  ['released', 'Set down, and that is yours to decide.'],
  ['released', 'Released. The work is still yours.'],
  ['released', 'That one is closed.'],
  ['released', 'Released — you were so close, though.'],         // expect refuse
  ['released', 'Set aside. It will be here when you are ready.'],// expect refuse
];

let pass = 0, refused = 0;
for (const [act, text] of CANDIDATES) {
  const r = checkEncouragement(text, act);
  if (r.ok) { pass++; console.log(`  ACCEPT  ${act.padEnd(9)} "${text}"`); }
  else { refused++; console.log(`  refuse  ${act.padEnd(9)} ${String(r.refusal).padEnd(22)} "${text}"`); }
}
console.log(`\n  accepted ${pass} · refused ${refused} of ${CANDIDATES.length}`);
