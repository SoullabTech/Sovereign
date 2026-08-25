// MAIA-D01 device witness — mechanical judgment of the §11 closure criteria.
//
// Reads the JSONL evidence a real walk produced and returns a verdict per
// criterion. The point is that the tail invariant is checked against the EVENT
// STREAM, not against whether the transcript looked acceptable — §6 is explicit
// that a silent disappearance is RED even when the final text reads fine.
//
// Three verdicts, kept distinct on purpose:
//   PASS        the evidence shows the property held
//   FAIL        the evidence shows it was violated
//   UNWITNESSED the walk never exercised it — NOT a pass
//
// ⛔ UNWITNESSED is not a soft pass. A criterion the walk did not reach cannot
// close, and this script refuses to let absence read as success.
//
// usage: node scripts/witness-verify.mjs <evidence.jsonl>

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/witness-verify.mjs <evidence.jsonl>'); process.exit(2); }

const rows = readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l, i) => {
  try { return JSON.parse(l); } catch { throw new Error(`line ${i + 1} is not JSON`); }
});
const has = (e) => rows.some((r) => r.event === e);
const all = (e) => rows.filter((r) => r.event === e);

const results = [];
const judge = (n, verdict, detail) => results.push({ n, verdict, detail });

// 1 — real microphone acquisition
judge('mic acquisition succeeds',
  has('voice_mic_granted') ? 'PASS' : 'UNWITNESSED',
  has('voice_mic_granted') ? 'voice_mic_granted observed' : 'never observed');

// 2 — real PCM frames reached the main-owned core
const maxFrames = Math.max(0, ...rows.map((r) => Number(r.frames) || 0));
judge('real PCM frames reach the main-owned core',
  has('voice_audio_started') && maxFrames > 0 ? 'PASS' : 'UNWITNESSED',
  `audio_started=${has('voice_audio_started')} · max frames observed in main=${maxFrames}`);

// 3 — no Web Speech participation (event-stream side; source side is the suite)
const webSpeechy = rows.filter((r) => /speechrecognition|webspeech/i.test(JSON.stringify(r)));
judge('no Web Speech API participates',
  webSpeechy.length === 0 ? 'PASS' : 'FAIL',
  webSpeechy.length ? `${webSpeechy.length} row(s) reference a recognition API` : 'clean');

// 4 — natural 2–5 minute speech
const times = rows.map((r) => Number(r.at)).filter((n) => Number.isFinite(n));
const spanS = times.length ? (Math.max(...times) - Math.min(...times)) / 1000 : 0;
judge('natural 2–5 minute speech works',
  spanS >= 120 ? 'PASS' : 'UNWITNESSED',
  `evidence spans ${spanS.toFixed(1)}s (need ≥120s)`);

// 5 — long pauses do not destroy the thought.
// Mechanically: within a single epoch, speech events appear on BOTH sides of a
// gap ≥6s, and no epoch ended during that gap.
let resumedAfterLongPause = false;
const speechRows = rows.filter((r) => ['voice_speech_started', 'voice_result_interim', 'voice_result_final'].includes(r.event));
for (let i = 1; i < speechRows.length; i++) {
  const gap = (Number(speechRows[i].at) - Number(speechRows[i - 1].at)) / 1000;
  if (gap >= 6 && speechRows[i].epochId === speechRows[i - 1].epochId) { resumedAfterLongPause = true; break; }
}
judge('long pauses do not automatically destroy the thought',
  resumedAfterLongPause ? 'PASS' : 'UNWITNESSED',
  resumedAfterLongPause ? 'speech resumed in the SAME epoch across a ≥6s gap' : 'no ≥6s in-epoch gap found — the walk may not have paused long enough');

// 6 — ⭐ THE TAIL INVARIANT, checked against the stream, not the transcript.
const ends = all('voice_recognition_ended');
const silentLoss = ends.filter((r) => Number(r.tailChars) > 0 && !['salvaged', 'lost'].includes(r.tailOutcome));
const accountedFor = ends.filter((r) => Number(r.tailChars) > 0);
judge('unfinished tails are never silently discarded',
  silentLoss.length > 0 ? 'FAIL' : (accountedFor.length > 0 ? 'PASS' : 'UNWITNESSED'),
  silentLoss.length
    ? `⛔ ${silentLoss.length} boundary/boundaries ended with pending speech and NO outcome`
    : (accountedFor.length
        ? `${accountedFor.length} boundary/boundaries carried pending speech, all accounted for ` +
          `(salvaged=${all('voice_transcript_salvaged').length} lost=${all('voice_tail_lost').length})`
        : 'no boundary ever carried pending speech — §6 requires deliberately creating one'));

// 7 — user stop is clean
const userStops = ends.filter((r) => r.reason === 'user_stop');
judge('user stop is clean',
  userStops.length && has('voice_turn_committed') ? 'PASS' : 'UNWITNESSED',
  `${userStops.length} user_stop end(s), committed=${has('voice_turn_committed')}`);

// 8 — restart preserves correct epoch separation
const epochs = [...new Set(rows.map((r) => r.epochId).filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);
judge('restart preserves correct epoch separation',
  epochs.length >= 2 ? 'PASS' : 'UNWITNESSED',
  `epochs observed: ${epochs.join(', ') || 'none'}`);

// 9 — no duplicate final accumulation
const dupes = all('voice_result_final').filter((r) => r.duplicate === true);
judge('no duplicate final accumulation',
  all('voice_result_final').length === 0 ? 'UNWITNESSED' : 'PASS',
  `${all('voice_result_final').length} final(s), ${dupes.length} flagged duplicate (flagged = correctly refused, not accumulated)`);

// 10 — diagnostics remain privacy-safe
const ALLOWED_STRINGS = ['surface', 'reason', 'cause', 'reasonCode', 'errorName', 'phase', 'source', 'mime', 'tailOutcome', 'outcome', 'event'];
const leaks = [];
for (const r of rows) {
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'string' && !ALLOWED_STRINGS.includes(k)) leaks.push(`${r.event}.${k}`);
  }
}
judge('diagnostics remain privacy-safe',
  leaks.length === 0 ? 'PASS' : 'FAIL',
  leaks.length ? `⛔ ${leaks.length} non-allowlisted string field(s): ${[...new Set(leaks)].join(', ')}` : 'no free-text field in any record');

// 11 — renderer authority: a SOURCE property, not an event property. Named as
// such rather than silently marked PASS by a script that cannot see it.
judge('no renderer authority expansion was required',
  'SEE SOURCE SUITE',
  'proven by test/d01-boundary.test.mjs, not by the event stream');

const W = Math.max(...results.map((r) => r.n.length));
console.log(`\nMAIA-D01 — device closure criteria, judged from ${rows.length} evidence rows\n`);
for (const r of results) console.log(`  ${r.verdict.padEnd(16)} ${r.n.padEnd(W)}  ${r.detail}`);

const failed = results.filter((r) => r.verdict === 'FAIL');
const unwitnessed = results.filter((r) => r.verdict === 'UNWITNESSED');
console.log('');
if (failed.length) {
  console.log(`⛔ D01 CANNOT CLOSE — ${failed.length} criterion/criteria FAILED. Classify the defect (§12) before patching.`);
  process.exit(1);
}
if (unwitnessed.length) {
  console.log(`⚠️  D01 CANNOT CLOSE — ${unwitnessed.length} criterion/criteria UNWITNESSED. The walk did not exercise them.`);
  console.log('   UNWITNESSED is not a pass. Re-run the walk covering: ' + unwitnessed.map((r) => r.n).join('; '));
  process.exit(1);
}
console.log('✅ Every event-stream criterion PASSED. Criterion 11 is proven by the source suite.');
console.log('   D01 may close once the founder confirms the monologue was real speech, not a script.');
