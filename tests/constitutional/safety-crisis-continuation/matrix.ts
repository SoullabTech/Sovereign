import fs from 'node:fs';
import path from 'node:path';

import {
  assessCrisisWithCheckIn,
  classifyCheckInAnswer,
  maiaAskedAboutSafety,
} from '../../../lib/safety/crisisAssessment';
import {
  __resetSafetyCheckIns,
  clearSafetyCheckIn,
  markSafetyCheckIn,
  takeSafetyCheckIn,
} from '../../../lib/safety/crisisCheckIn';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
let failed = false;
const ok = (id: string, condition: boolean, detail: string) => {
  console.log(`  ${condition ? '✓' : '✗'} ${id} — ${detail}`);
  if (!condition) failed = true;
};

console.log('SAFETY-CRISIS-CONTINUATION-01 — C1–C10');

const asked = maiaAskedAboutSafety('Are you safe right now?');
ok('C1', assessCrisisWithCheckIn('yes, I do', asked).tier === 'clear',
  'contextual affirmative remains governed after a direct safety question');

const route = read('app/api/sovereign/app/maia/list/route.ts');
const bodyStart = route.indexOf('const { sessionId');
const bodyEnd = route.indexOf('const userId = await resolveMemberIdentity');
const requestShape = bodyStart >= 0 && bodyEnd > bodyStart ? route.slice(bodyStart, bodyEnd) : '';
ok('C2',
  route.includes("const crisisCheckInKey = acceptedSessionId ?? '';")
    && !/(?:crisisCheckIn|crisisContinuation|continuationToken)\s*[:?]/.test(requestShape),
  'continuation authority is server-held and session-bound');

const authority = read('lib/sovereign/clientPromptAuthority.ts');
ok('C3', authority.includes('crisisSafetyAddendum') && authority.includes('systemPromptModifier'),
  'client prompt-bearing safety fields remain stripped');

__resetSafetyCheckIns();
markSafetyCheckIn('session-a', 0);
ok('C4', !takeSafetyCheckIn('session-b', 1) && takeSafetyCheckIn('session-a', 1),
  'continuation cannot replay across sessions');

__resetSafetyCheckIns();
markSafetyCheckIn('session-expire', 0);
ok('C5', !takeSafetyCheckIn('session-expire', 15 * 60 * 1000 + 1),
  'expired continuation is not authoritative');
const store = read('lib/safety/crisisCheckIn.ts');
ok('C6',
  store.includes('new Map<string')
    && !/from ['"](?:node:)?(?:fs|pg|postgres)|DATABASE_URL|INSERT\s+INTO|UPDATE\s+/i.test(store),
  'continuation state creates no durable crisis-state store');

ok('C7',
  !/deliverHumanSafetyAlert|human-alert|Twilio|Slack|notify/i.test(store),
  'continuation does not authorize human delivery');

__resetSafetyCheckIns();
markSafetyCheckIn('session-clear', 0);
clearSafetyCheckIn('session-clear');
ok('C8',
  !takeSafetyCheckIn('session-clear', 1)
    && classifyCheckInAnswer('no, I am safe right now') === 'negative',
  'continuation has explicit clear semantics');

__resetSafetyCheckIns();
markSafetyCheckIn('member-a:session-1', 0);
ok('C9', !takeSafetyCheckIn('member-b:session-1', 1),
  'one session cannot confer standing on another');

__resetSafetyCheckIns();
ok('C10',
  takeSafetyCheckIn('', 1) === false
    && assessCrisisWithCheckIn('yes, I do', false).tier === 'none',
  'missing server state fails closed to current-turn assessment');

console.log('');
console.log('DECLARED OPEN LIMITATION');
console.log('  L1 — process restart or another server instance loses the in-memory check-in.');
console.log('       This never invents escalation, but contextual continuity may be missed.');
console.log('       No signed continuation token or durable crisis metadata is authorized here.');

if (failed) {
  console.error('\nCONTINUATION MATRIX: FAILED');
  process.exit(1);
}

console.log('\nCONTINUATION MATRIX: C1–C10 PASS · L1 OPEN AND DECLARED');
