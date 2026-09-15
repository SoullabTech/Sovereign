/**
 * L1 · C1 REPAIR — the RECURRENCE falsifier.
 *
 * Authority: founder ruling 2026-09-15, on the production witness at `e57ca1baa`.
 * Witness:   docs/programme/L1-CURRENT-SESSION-RECOVERY-01_ACCEPTANCE_2026-09-15.md §7
 *
 * ⭐⭐ WHY THIS FIXTURE EXISTS. The original falsifier was proven lethal against two
 * wrong implementations and STILL passed what production failed, because its fixture
 * mentions the marker ONCE. Production mentioned it three times and MAIA echoed it
 * back, and that recurrence is what decided the outcome.
 *
 *   ⭐ MUTATION LETHALITY IS EVIDENCE ONLY FOR PROPERTIES REPRESENTED IN THE FIXTURE.
 *
 * GOVERNING INVARIANT (founder):
 *   Within a member session, recurrence of a member-originated marker may INCREASE or
 *   PRESERVE its recovery significance; it must NEVER REDUCE that significance merely
 *   because it recurred.
 *
 * ⛔ That is not "frequency wins". A common conversational word repeated twenty times
 *    must not dominate retrieval. The narrow claim is that the distinctiveness
 *    mechanism may not convert recurrence itself into NEGATIVE evidence.
 *
 * ⛔ AND THE REPAIR MAY NOT CHEAT. C1 is the OPAQUE case. A fix that works because the
 *    marker text reaches the query, the prompt, a candidate hint or any new lexical
 *    bridge does not satisfy this — the witness established the failure precisely under
 *    ABSENCE of lexical overlap. Nor may the candidate window be widened so the target
 *    merely happens to appear.
 */
import {
  recoverDisplacedExchanges,
  type DisplacedExchange,
} from '../../../lib/maia/continuity/sessionRecovery';

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); }
};

// ── FIXTURE · shaped from the production session that failed ────────────────
const ex: DisplacedExchange[] = [];
const push = (member: string, maia: string) => {
  const index = ex.length;
  ex.push({
    exchangeKey: `k${index}`, index,
    timestamp: new Date(1_700_000_000_000 + index * 60_000).toISOString(),
    userMessage: member, maiaResponse: maia,
  });
};

push('Morning. Ready to work.', 'Good morning. Where would you like to begin?');
push('Not much, just finishing the writer platform bits.', 'The finishing stretch. What is the last piece?');
// ⚠️ UNRELATED ONE-OFF MATERIAL — dense, rare vocabulary. This is what presently WINS.
push('We are getting the developmental editing down and that entails a lot of functionalities for my editor developer writer support.',
     'That is substantial infrastructure. What would make it feel complete?');
push('I could upload my Elemental Alchemy manuscript and get incredible insights from the editor developer.',
     'A real capability unlock. What matters most about that?');
push('Mostly having a thinking partner who knows the material.', 'That is a different kind of collaboration.');
for (let i = 0; i < 16; i++) {
  push(`We kept working through the section ordering, round ${i + 1}.`,
       `Understood — the ordering question again. What shifted this time?`);
}
// ⭐ THE MARKER — planted naturally by the member, far outside any aperture.
const MARKER_IDX = ex.length;
push('Silver cedar is an image that has been on my mind today.',
     'Tell me more about that image — what does the cedar carry for you?');   // ← MAIA ECHO
push('It felt like something wanted attention.', 'Worth staying with, then.');
// ⭐ MEMBER RETURNS to the marker. This is the recurrence production had.
push('Oh it is a beautiful old cedar, its bark gnarled, rich texture, and that silver aura about it.',
     'The silver on the cedar — that detail seems to matter to you.');        // ← MAIA ECHO
for (let i = 0; i < 12; i++) {
  push(`Back to the deadline question, pass ${i + 1}.`,
       `The deadline again. What is the smallest next move?`);
}
push('It felt incredible, like I was really being seen in this, and that is very special to me.',
     'Being seen is its own kind of threshold.');
push('Yes. Something shifted there.', 'It sounds like it did.');

const APERTURE = 3;                       // FAST, as production served
const displaced = ex.slice(0, ex.length - APERTURE);
const recover = (utterance: string) =>
  recoverDisplacedExchanges({ utterance, displaced, corpus: ex });

// ── FIXTURE PROPERTIES · the ruling's minimum list ──────────────────────────
console.log('\n── FIXTURE · has the property production exposed ──');
const markerMentions = ex.filter(e => /cedar/i.test(e.userMessage)).length;
const maiaEchoes     = ex.filter(e => /cedar/i.test(e.maiaResponse)).length;
ok('marker planted naturally by the member', /Silver cedar is an image/.test(ex[MARKER_IDX]!.userMessage));
ok('member RETURNS to the marker (recurrence present)', markerMentions >= 2, `${markerMentions} member mentions`);
ok('MAIA echoes the marker', maiaEchoes >= 2, `${maiaEchoes} echoes`);
ok('unrelated dense one-off material present', /Elemental Alchemy/.test(ex[3]!.userMessage));
ok('target is displaced, not in the aperture',
   MARKER_IDX < ex.length - APERTURE);
ok('target is NOT in the easy transcript tail', MARKER_IDX < ex.length - 10,
   `marker at ${MARKER_IDX} of ${ex.length}`);

// ── THE PROBE · opaque, zero lexical overlap with the marker ────────────────
console.log('\n── C1 · opaque reference must recover the RECURRING marker ──');
const PROBE = 'can you remember the phrase I shared with you earlier';
ok('probe shares NO content word with the marker exchange',
   !/cedar|silver|image/i.test(PROBE));

const got = recover(PROBE);
console.log(`     recovered indices: [${got.map(e => e.index).join(', ')}]  (marker is ${MARKER_IDX})`);
ok('C1 · recovers the SILVER CEDAR exchange',
   got.some(e => e.index === MARKER_IDX),
   `got [${got.map(e => e.index).join(',')}], marker at ${MARKER_IDX}`);

// ── THE GOVERNING INVARIANT, stated directly ────────────────────────────────
console.log('\n── INVARIANT · recurrence must not reduce significance ──');
const solo: DisplacedExchange[] = displaced.map(e =>
  /beautiful old cedar/i.test(e.userMessage)
    ? { ...e, userMessage: 'Oh it is a lovely thing, worth sitting with.',
              maiaResponse: 'Worth sitting with indeed.' }
    : e);
const soloRank = recoverDisplacedExchanges({
  utterance: PROBE,
  displaced: solo,
  corpus: solo,
}).findIndex(e => e.index === MARKER_IDX);
const recurRank = got.findIndex(e => e.index === MARKER_IDX);
// ⚠️ VACUITY GUARD. If neither variant recovers the marker, "not worse" is trivially
// true and proves nothing. A check that can only pass is not a check.
if (soloRank < 0 && recurRank < 0) {
  fail++;
  console.log('  ❌ recurrence-vs-single comparison is VACUOUS — neither variant ' +
              'recovers the marker, so this assertion cannot discriminate');
} else {
  ok('recurrence does not RANK the marker worse than a single mention',
     !(soloRank >= 0 && recurRank < 0) && !(soloRank >= 0 && recurRank > soloRank),
     `single-mention rank ${soloRank}, recurring rank ${recurRank}`);
}

// ── NO-CHEAT GUARDS ─────────────────────────────────────────────────────────
console.log('\n── NO-CHEAT · the repair may not bridge lexically or widen ──');
ok('probe text contains no marker vocabulary', !/cedar|silver/i.test(PROBE));
ok('recovery still returns at most 3', got.length <= 3, `got ${got.length}`);
ok('aperture unchanged at 3', APERTURE === 3);

console.log(`\n${'─'.repeat(60)}\nL1 RECURRENCE FALSIFIER: ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
