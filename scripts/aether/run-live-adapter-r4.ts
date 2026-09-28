import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { admitLiveInputToShadow } from '../../lib/ain/aether/live/liveInputContract';
import { projectFixtureShadowToSyntheticRuntime } from '../../lib/ain/aether/live/shadowRuntimeCompatibility';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r4');
mkdirSync(OUT,{recursive:true});

const consent={
  consentRef:'consent:r4:witness',
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

const shadow=admitLiveInputToShadow({
  inputRef:'live-fixture:r4',
  memberRef:'member:fixture',
  source:'member_authored',
  domain:'work',
  observation:'Work feels more open this week.',
  temporalStanding:'is_being',
  confidence:.81,
  consentRef:consent.consentRef,
},consent).shadow;

if(!shadow) throw new Error('R4_SHADOW_NOT_ADMITTED');

const attestation={
  fixtureRef:'fixture-attestation:r4:witness',
  fixtureOnly:true as const,
  memberRef:shadow.memberRef,
  consentRef:shadow.consentRef,
};

const projected=projectFixtureShadowToSyntheticRuntime(shadow,attestation);
const refusedWithoutAttestation=projectFixtureShadowToSyntheticRuntime(shadow,null);

const evidence={
  generatedAt:new Date().toISOString(),
  parentLiveR3:'24706ae0d7e693c41ce3a9ae5218a1e96b7a4982',
  projected,
  refusedWithoutAttestation,
};

writeFileSync(OUT+'/r4-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r4-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentLiveR3:evidence.parentLiveR3,
  projected:evidence.projected.projected,
  runtimeSource:evidence.projected.runtimeEvent?.source??null,
  runtimeConfidence:evidence.projected.runtimeEvent?.confidence??null,
  runtimeTemporalStanding:evidence.projected.runtimeEvent?.temporalStanding??null,
  fixtureOnly:evidence.projected.provenance?.fixtureOnly??null,
  liveDataProjected:evidence.projected.provenance?.liveDataProjected??null,
  confidenceIncreased:evidence.projected.provenance?.confidenceIncreased??null,
  temporalStandingStrengthened:evidence.projected.provenance?.temporalStandingStrengthened??null,
  authorityEscalated:evidence.projected.provenance?.authorityEscalated??null,
  persistenceAuthority:evidence.projected.provenance?.persistenceAuthority??null,
  deliveryAuthority:evidence.projected.provenance?.deliveryAuthority??null,
  promptMutationAuthority:evidence.projected.provenance?.promptMutationAuthority??null,
  productionAuthority:evidence.projected.provenance?.productionAuthority??null,
  genuineLiveProjectionRefused:evidence.refusedWithoutAttestation.projected===false,
  genuineLiveProjectionErrors:evidence.refusedWithoutAttestation.errors,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r4-summary.json','utf8')),null,2));