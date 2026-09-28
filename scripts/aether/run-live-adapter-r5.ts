import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runFixtureEndToEndReplay } from '../../lib/ain/aether/live/fixtureEndToEndReplay';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r5');
mkdirSync(OUT,{recursive:true});

const grant={
  consentRef:'consent:r5:witness',
  memberRef:'member:fixture',
  scope:'aether_session_read' as const,
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
  sessionRef:'session:r5:witness',
};

const sources=[
  {
    sourceRef:'fixture:r5:witness:work',
    memberRef:'member:fixture',
    source:'member_authored' as const,
    domain:'work',
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being' as const,
    confidence:.82,
  },
  {
    sourceRef:'fixture:r5:witness:creative',
    memberRef:'member:fixture',
    source:'system_observed' as const,
    domain:'creative',
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being' as const,
    confidence:.64,
  },
];

const replay=runFixtureEndToEndReplay({
  replayRef:'fixture-replay:r5:witness',
  memberRef:'member:fixture',
  sessionRef:'session:r5:witness',
  now:'2026-09-28T16:30:00-04:00',
  consentGrant:grant,
  consentLifecycle:lifecycle,
  sources,
  sourceRefs:[
    'fixture:r5:witness:work',
    'fixture:r5:witness:creative',
  ],
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentLiveR4:'3f07a8c40aee030fd354157a5cc3385d52da0d1a',
  replay,
};

writeFileSync(OUT+'/r5-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r5-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentLiveR4:evidence.parentLiveR4,
  replayed:evidence.replay.replayed,
  shadowCount:evidence.replay.shadowCount,
  projectedCount:evidence.replay.projectedCount,
  adaptedCount:evidence.replay.adaptedCount,
  fieldDerived:evidence.replay.fieldDerived,
  reflectionGenerated:evidence.replay.reflectionGenerated,
  humanGatePassed:evidence.replay.humanGatePassed,
  noOpSimulationPassed:evidence.replay.noOpSimulationPassed,
  sessionLifecycleUnchanged:JSON.stringify(evidence.replay.consentLifecycleBefore)===JSON.stringify(evidence.replay.consentLifecycleAfter),
  liveSourceConnected:evidence.replay.liveSourceConnected,
  realMemberDataRead:evidence.replay.realMemberDataRead,
  persisted:evidence.replay.persisted,
  memberFacingContacted:evidence.replay.memberFacingContacted,
  deliveryExecuted:evidence.replay.deliveryExecuted,
  maiaPromptMutated:evidence.replay.maiaPromptMutated,
  networkSideEffect:evidence.replay.networkSideEffect,
  productionAuthority:evidence.replay.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r5-summary.json','utf8')),null,2));