import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  consumeReadOnceConsent,
  evaluateLiveConsent,
  revokeLiveConsent,
} from '../../lib/ain/aether/live/consentLifecycle';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r2');
mkdirSync(OUT,{recursive:true});

const baseGrant={
  consentRef:'consent:r2:witness',
  memberRef:'member:fixture',
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};

const readOnceGrant={...baseGrant,scope:'aether_read_once' as const};
const readOnceLifecycle={
  consentRef:readOnceGrant.consentRef,
  grantedAt:'2026-09-28T16:00:00-04:00',
  expiresAt:'2026-09-28T17:00:00-04:00',
};
const readOnceBefore=evaluateLiveConsent(readOnceGrant,readOnceLifecycle,{
  memberRef:readOnceGrant.memberRef,
  consentRef:readOnceGrant.consentRef,
  now:'2026-09-28T16:30:00-04:00',
});
const readOnceConsumed=consumeReadOnceConsent(
  readOnceGrant,
  readOnceLifecycle,
  '2026-09-28T16:31:00-04:00',
);
const readOnceAfter=evaluateLiveConsent(readOnceGrant,readOnceConsumed,{
  memberRef:readOnceGrant.memberRef,
  consentRef:readOnceGrant.consentRef,
  now:'2026-09-28T16:32:00-04:00',
});

const sessionGrant={...baseGrant,scope:'aether_session_read' as const};
const sessionLifecycle={
  consentRef:sessionGrant.consentRef,
  grantedAt:'2026-09-28T16:00:00-04:00',
  expiresAt:'2026-09-28T17:00:00-04:00',
  sessionRef:'session:fixture',
};
const sessionValid=evaluateLiveConsent(sessionGrant,sessionLifecycle,{
  memberRef:sessionGrant.memberRef,
  consentRef:sessionGrant.consentRef,
  sessionRef:'session:fixture',
  now:'2026-09-28T16:30:00-04:00',
});
const sessionWrong=evaluateLiveConsent(sessionGrant,sessionLifecycle,{
  memberRef:sessionGrant.memberRef,
  consentRef:sessionGrant.consentRef,
  sessionRef:'session:wrong',
  now:'2026-09-28T16:31:00-04:00',
});
const expired=evaluateLiveConsent(readOnceGrant,readOnceLifecycle,{
  memberRef:readOnceGrant.memberRef,
  consentRef:readOnceGrant.consentRef,
  now:'2026-09-28T17:00:00-04:00',
});
const revokedLifecycle=revokeLiveConsent(
  sessionLifecycle,
  '2026-09-28T16:20:00-04:00',
);
const revoked=evaluateLiveConsent(sessionGrant,revokedLifecycle,{
  memberRef:sessionGrant.memberRef,
  consentRef:sessionGrant.consentRef,
  sessionRef:'session:fixture',
  now:'2026-09-28T16:30:00-04:00',
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentLiveR1:'73a59e9dec61173ee735ebaa134d2cc0fdfa0bc8',
  readOnceBefore,
  readOnceAfter,
  sessionValid,
  sessionWrong,
  expired,
  revoked,
};

writeFileSync(OUT+'/r2-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r2-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentLiveR1:evidence.parentLiveR1,
  readOnceInitiallyValid:evidence.readOnceBefore.valid,
  readOnceConsumeOnUse:evidence.readOnceBefore.consumeOnUse,
  readOnceReusable:evidence.readOnceBefore.reusable,
  readOnceAfterState:evidence.readOnceAfter.state,
  sessionValid:evidence.sessionValid.valid,
  sessionReusable:evidence.sessionValid.reusable,
  wrongSessionRefused:evidence.sessionWrong.valid===false,
  expiredState:evidence.expired.state,
  revokedState:evidence.revoked.state,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r2-summary.json','utf8')),null,2));