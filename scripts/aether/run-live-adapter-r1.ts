import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { admitLiveInputToShadow } from '../../lib/ain/aether/live/liveInputContract';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r1');
mkdirSync(OUT,{recursive:true});

const consent={
  consentRef:'consent:r1:fixture',
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

const admitted=admitLiveInputToShadow({
  inputRef:'live-fixture:r1',
  memberRef:'member:fixture',
  source:'member_authored',
  domain:'work',
  observation:'Work feels more open this week.',
  temporalStanding:'is_being',
  confidence:.81,
  consentRef:consent.consentRef,
},consent);

const noConsent=admitLiveInputToShadow({
  inputRef:'live-fixture:r1:no-consent',
  memberRef:'member:fixture',
  source:'member_authored',
  domain:'work',
  observation:'Work feels more open this week.',
  temporalStanding:'is_being',
  confidence:.81,
  consentRef:'missing',
},null);

const authoritySmuggle=admitLiveInputToShadow({
  inputRef:'live-fixture:r1:authority',
  memberRef:'member:fixture',
  source:'member_authored',
  domain:'work',
  observation:'Your soul wants you to follow this destiny.',
  temporalStanding:'may_become',
  confidence:.9,
  consentRef:consent.consentRef,
  predictiveAuthority:true,
  destinyAuthority:true,
  soulRepresentationAuthority:true,
  persistenceAuthority:true,
  deliveryAuthority:true,
  promptMutationAuthority:true,
  productionAuthority:true,
  finalMeaningAuthority:'system',
},consent);

const evidence={
  generatedAt:new Date().toISOString(),
  parentSyntheticClosure:'170c0b00a1467423a1f426a7ca0e23ea68929ba9',
  admitted,
  noConsent,
  authoritySmuggle,
};

writeFileSync(OUT+'/r1-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r1-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentSyntheticClosure:evidence.parentSyntheticClosure,
  admitted:evidence.admitted.admitted,
  readOnly:evidence.admitted.shadow?.readOnly??null,
  persisted:evidence.admitted.shadow?.persisted??null,
  delivered:evidence.admitted.shadow?.delivered??null,
  maiaPromptMutated:evidence.admitted.shadow?.maiaPromptMutated??null,
  finalMeaningAuthority:evidence.admitted.shadow?.finalMeaningAuthority??null,
  noConsentRefused:evidence.noConsent.admitted===false,
  authoritySmuggleRefused:evidence.authoritySmuggle.admitted===false,
  persistenceAuthorized:evidence.admitted.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.admitted.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.admitted.maiaPromptMutationAuthorized,
  productionAuthority:evidence.admitted.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r1-summary.json','utf8')),null,2));