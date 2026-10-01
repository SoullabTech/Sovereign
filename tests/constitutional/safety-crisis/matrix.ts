/**
 * SAFETY-CRISIS-01 lethality matrix.
 *
 *   node --experimental-strip-types tests/constitutional/safety-crisis/matrix.ts
 *   (npm run matrix:safety-crisis)
 *
 * The reference (`assessCrisis`) must match every corpus case. Each DEFEAT
 * CANDIDATE is a plausible, wrong detector, and it must DIE: it must misclassify
 * at least one case of the kind it is named for. A candidate that survives means
 * the corpus cannot tell a right detector from that wrong one, and the CORPUS is
 * repaired. The candidate is never weakened to make it die.
 *
 * Exit 0 only when the reference is clean AND every candidate dies on its named kind.
 */
import { assessCrisis, crisisLogLine, CRISIS_REFERRAL, CRISIS_ADDENDUM, type CrisisTier } from '../../../lib/safety/crisisAssessment.ts';
import { ALL_CASES, MUST_BE_CLEAR, MUST_BE_AMBIGUOUS, MUST_BE_NONE, type CorpusCase } from '../../../lib/safety/__fixtures__/crisisCorpus.ts';

type Detector = (text: string) => CrisisTier;

// ─── Defeat candidates ──────────────────────────────────────────────────────

// DC-1: the pre-stopgap voice list (canonical before #1629), frozen here. Its
// 'high' level is treated as CLEAR and every other level as AMBIGUOUS, which is
// how the client used it: any match spoke a script.
const LEGACY_HIGH = [/i'?m\s+going\s+to\s+(do\s+it|kill\s+myself)/i, /i\s+have\s+(pills|a\s+gun|a\s+knife|rope|means)/i, /i'?m\s+on\s+(a\s+bridge|the\s+roof|the\s+edge)/i, /goodbye/i, /this\s+is\s+(it|the\s+end|goodbye)/i, /i'?ve\s+(already|just)\s+(taken|swallowed|cut)/i, /tell\s+(them|everyone|my\s+family)\s+i\s+(love|loved)/i, /tonight\s+is\s+the\s+night/i, /i\s+wrote\s+(a\s+note|my\s+note|letters)/i];
const LEGACY_REST = [/i\s+want\s+to\s+die/i, /i\s+don'?t\s+want\s+to\s+live/i, /i\s+can'?t\s+live\s+(like\s+this|anymore)/i, /i'?m\s+going\s+to\s+hurt\s+myself/i, /i\s+want\s+to\s+end\s+(it|this|my\s+life)/i, /i'?ve\s+been\s+thinking\s+about\s+(suicide|killing\s+myself|ending\s+it)/i, /i\s+wish\s+i\s+(was|were)\s+dead/i, /i\s+want\s+to\s+cut/i, /i\s+need\s+to\s+hurt\s+myself/i, /i\s+need\s+to\s+feel\s+(pain|something)/i, /i\s+can'?t\s+do\s+this\s+anymore/i, /what'?s\s+the\s+point/i, /i\s+don'?t\s+want\s+to\s+be\s+here/i, /i'?m\s+so\s+tired\s+of\s+(this|everything|living)/i, /nothing\s+matters/i, /everyone\s+would\s+be\s+better\s+off/i, /i'?m\s+a\s+burden/i];
const legacyVoiceList: Detector = (t) =>
  LEGACY_HIGH.some((r) => r.test(t)) ? 'clear' : LEGACY_REST.some((r) => r.test(t)) ? 'ambiguous' : 'none';

// DC-2: the deployed stopgap (#1629, commit 56d0cd679): the same list,
// word-bounded, with bare /goodbye/ removed. Still a phrase list with no frame.
const wb = (r: RegExp) => new RegExp(`\\b${r.source}\\b`, 'i');
const STOPGAP_HIGH = LEGACY_HIGH.filter((r) => r.source !== 'goodbye').map(wb);
const STOPGAP_REST = LEGACY_REST.map(wb);
const stopgapVoiceList: Detector = (t) =>
  STOPGAP_HIGH.some((r) => r.test(t)) ? 'clear' : STOPGAP_REST.some((r) => r.test(t)) ? 'ambiguous' : 'none';

// DC-3: any signal escalates. Collapses AMBIGUOUS into CLEAR, which is the
// "switch to an emergency script on any hint" design the ruling rejects.
const anySignalIsClear: Detector = (t) => (assessCrisis(t).tier === 'none' ? 'none' : 'clear');

// DC-4: negation-blind. Reads "I'm not going to kill myself" as intent.
const negationBlind: Detector = (t) =>
  /\b(?:kill(?:ing)? myself|end(?:ing)? my (?:own )?life|take my (?:own )?life)\b/i.test(t) ? 'clear' : assessCrisis(t).tier;

// DC-5: keyword-only. Anything mentioning suicide is CLEAR.
const keywordSuicide: Detector = (t) => (/suicid/i.test(t) ? 'clear' : assessCrisis(t).tier);

// DC-6: routine medication read as an overdose.
const medsAsOverdose: Detector = (t) => (/\b(?:took|taken|swallowed)\b.*\b(?:meds|pills?|medication)\b/i.test(t) ? 'clear' : assessCrisis(t).tier);

// DC-7: means words alone escalate ("a knife for the bread").
const meansAlone: Detector = (t) => (/\b(?:knife|gun|pills|rope|bridge|roof|edge)\b/i.test(t) ? 'clear' : assessCrisis(t).tier);

// DC-8: inert. Never fires.
const inert: Detector = () => 'none';

// DC-9: under-reach. CLEAR only on the literal "kill myself"; ideation, an act
// under way and final arrangements are missed.
const killMyselfOnly: Detector = (t) => (/\bkill myself\b/i.test(t) && !/\b(?:not|never|'d|could)\b/i.test(t) ? 'clear' : assessCrisis(t).tier === 'clear' ? 'ambiguous' : assessCrisis(t).tier);

type Kind = 'false-positive' | 'miss' | 'over-escalation' | 'under-escalation';

const candidates: { id: string; name: string; dies: Kind; detector: Detector }[] = [
  { id: 'DC-1', name: 'legacy voice phrase list (pre-#1629)', dies: 'false-positive', detector: legacyVoiceList },
  { id: 'DC-2', name: 'deployed stopgap phrase list (#1629)', dies: 'false-positive', detector: stopgapVoiceList },
  { id: 'DC-3', name: 'any signal is CLEAR', dies: 'over-escalation', detector: anySignalIsClear },
  { id: 'DC-4', name: 'negation-blind intent', dies: 'over-escalation', detector: negationBlind },
  { id: 'DC-5', name: 'keyword "suicide" is CLEAR', dies: 'false-positive', detector: keywordSuicide },
  { id: 'DC-6', name: 'routine medication read as overdose', dies: 'false-positive', detector: medsAsOverdose },
  { id: 'DC-7', name: 'means word alone escalates', dies: 'false-positive', detector: meansAlone },
  { id: 'DC-8', name: 'inert (never fires)', dies: 'miss', detector: inert },
  { id: 'DC-9', name: 'CLEAR only on "kill myself"', dies: 'under-escalation', detector: killMyselfOnly },
];

function kindOf(expected: CrisisTier, got: CrisisTier): Kind | null {
  if (expected === got) return null;
  if (expected === 'none') return 'false-positive';
  if (got === 'none') return 'miss';
  return got === 'clear' ? 'over-escalation' : 'under-escalation';
}

let failed = false;

// ─── Reference ──────────────────────────────────────────────────────────────
const refFailures = ALL_CASES.filter((c) => assessCrisis(c.text).tier !== c.tier);
console.log(`REFERENCE assessCrisis: ${ALL_CASES.length - refFailures.length}/${ALL_CASES.length} cases`);
console.log(`  corpus: ${MUST_BE_CLEAR.length} clear · ${MUST_BE_AMBIGUOUS.length} ambiguous · ${MUST_BE_NONE.length} none`);
for (const c of refFailures) {
  failed = true;
  console.log(`  ✗ expected ${c.tier}, got ${assessCrisis(c.text).tier}: ${JSON.stringify(c.text)} (${c.why})`);
}

// ─── Content-free outputs ───────────────────────────────────────────────────
// The assessment and its log line must never carry member text.
for (const c of ALL_CASES.filter((x) => x.text.length > 0)) {
  const a = assessCrisis(c.text);
  const line = crisisLogLine(a, '/api/test');
  const leaked = JSON.stringify(a).toLowerCase().includes(c.text.toLowerCase()) || line.toLowerCase().includes(c.text.toLowerCase());
  if (leaked) {
    failed = true;
    console.log(`  ✗ member text leaked into assessment or log line: ${JSON.stringify(c.text)}`);
  }
}
// No copy may imply a person was notified, and the referral must say no one was.
// A sentence that mentions notification or monitoring must be a negation
// ("No one has been notified", "Never say ... has been notified").
const allCopy = [CRISIS_REFERRAL.heading, CRISIS_REFERRAL.body, CRISIS_REFERRAL.disclosure, CRISIS_ADDENDUM.ambiguous, CRISIS_ADDENDUM.clear].join('\n');
const affirmsNotification = allCopy
  .split(/(?<=[.!?])\s+|\n/)
  .some((s) => /\b(?:notified|alerted|watching|monitor(?:ed|ing)?)\b/i.test(s) && !/\b(?:never|no one|not|nobody)\b/i.test(s));
if (affirmsNotification) {
  failed = true;
  console.log('  ✗ copy implies a person was notified or is monitoring');
}
if (!/not monitored by a person/i.test(CRISIS_REFERRAL.disclosure) || !/no one has been notified/i.test(CRISIS_REFERRAL.disclosure)) {
  failed = true;
  console.log('  ✗ referral disclosure must say conversations are not monitored and no one was notified');
}
if (/988|741741/.test(CRISIS_ADDENDUM.ambiguous.split('If they confirm')[0])) {
  failed = true;
  console.log('  ✗ ambiguous addendum names a hotline before the member confirms risk');
}
console.log(`CONTENT-FREE + DISCLOSURE: ${failed ? 'see above' : 'PASS'}`);

// ─── Defeat candidates ──────────────────────────────────────────────────────
console.log('\nDEFEAT CANDIDATES');
for (const cand of candidates) {
  const deaths = ALL_CASES.map((c) => ({ c, got: cand.detector(c.text) }))
    .map(({ c, got }) => ({ c, got, kind: kindOf(c.tier, got) }))
    .filter((d) => d.kind !== null) as { c: CorpusCase; got: CrisisTier; kind: Kind }[];
  const named = deaths.filter((d) => d.kind === cand.dies);
  if (named.length === 0) {
    failed = true;
    console.log(`  ✗ ${cand.id} ${cand.name}: SURVIVED its named kind (${cand.dies}). Repair the corpus.`);
    continue;
  }
  const first = named[0];
  console.log(`  ✓ ${cand.id} ${cand.name}: DEAD on ${cand.dies} ×${named.length} — e.g. ${JSON.stringify(first.c.text)} → ${first.got} (expected ${first.c.tier})`);
}

console.log(`\n${failed ? 'FAIL' : 'LETHAL + REFERENCE CLEAN'}`);
process.exit(failed ? 1 : 0);
