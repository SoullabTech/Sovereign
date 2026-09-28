import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFixtureLiveSourceReader, executeShadowReadTransaction } from '../../lib/ain/aether/live/shadowReadTransaction';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r3');
mkdirSync(OUT,{recursive:true});

const grant={
  consentRef:'consent:r3:witness',
  memberRef:'member:fixture',
  scope:'aether_read_once' as const,
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};
const lifecycle={
  consentRef:grant.consentRef,
  grantedAt:'2026-09-28T16:00:00-04:00',
  expiresAt:'2026-09-28T17:00:00-04:00',
};
const reader=createFixtureLiveSourceReader([{
  sourceRef:'fixture:r3:work',
  memberRef:'member:fixture',
  source:'member_authored',
  domain:'work',
  observation:'Work feels more open this week.',
  temporalStanding:'is_being',
  confidence:.81,
}]);

const success=executeShadowReadTransaction(reader,{
  transactionRef:'tx:r3:success',
  sourceRef:'fixture:r3:work',
  inputRef:'shadow:r3:work',
  consentGrant:grant,
  consentLifecycle:lifecycle,
  consentUse:{
    memberRef:grant.memberRef,
    consentRef:grant.consentRef,
    now:'2026-09-28T16:30:00-04:00',
  },
});

const failure=executeShadowReadTransaction(reader,{
  transactionRef:'tx:r3:missing',
  sourceRef:'fixture:r3:missing',
  inputRef:'shadow:r3:missing',
  consentGrant:grant,
  consentLifecycle:lifecycle,
  consentUse:{
    memberRef:grant.memberRef,
    consentRef:grant.consentRef,
    now:'2026-09-28T16:30:00-04:00',
  },
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentLiveR2:'07c666b980923c6b783d6b62041feb9d300b3182',
  success,
  failure,
};
writeFileSync(OUT+'/r3-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentLiveR2:evidence.parentLiveR2,
  successCommitted:evidence.success.committed,
  successShadowCreated:Boolean(evidence.success.shadow),
  successConsentConsumed:evidence.success.consentConsumed,
  successConsumedAt:evidence.success.consentLifecycleAfter.consumedAt??null,
  failureCommitted:evidence.failure.committed,
  failureShadowCreated:Boolean(evidence.failure.shadow),
  failureConsentConsumed:evidence.failure.consentConsumed,
  failureLifecycleUnchanged:JSON.stringify(evidence.failure.consentLifecycleBefore)===JSON.stringify(evidence.failure.consentLifecycleAfter),
  persistenceAuthorized:evidence.success.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.success.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.success.maiaPromptMutationAuthorized,
  productionAuthority:evidence.success.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r3-summary.json','utf8')),null,2));