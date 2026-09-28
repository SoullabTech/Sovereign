import { runFixtureEndToEndReplay } from '../fixtureEndToEndReplay';

const grant={
  consentRef:'consent:r5',
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
  consentRef:'consent:r5',
  grantedAt:'2026-09-28T16:00:00-04:00',
  expiresAt:'2026-09-28T17:00:00-04:00',
  sessionRef:'session:r5',
};

const sources=[
  {
    sourceRef:'fixture:r5:work',
    memberRef:'member:fixture',
    source:'member_authored' as const,
    domain:'work',
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being' as const,
    confidence:.82,
  },
  {
    sourceRef:'fixture:r5:creative',
    memberRef:'member:fixture',
    source:'system_observed' as const,
    domain:'creative',
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being' as const,
    confidence:.64,
  },
];

function input(){
  return {
    replayRef:'fixture-replay:r5',
    memberRef:'member:fixture',
    sessionRef:'session:r5',
    now:'2026-09-28T16:30:00-04:00',
    consentGrant:grant,
    consentLifecycle:lifecycle,
    sources,
    sourceRefs:['fixture:r5:work','fixture:r5:creative'],
  };
}

describe('AIN-AETHER-LIVE-ADAPTER-01R5 fixture end-to-end replay',()=>{
  test('replays full fixture path through no-op delivery',()=>{
    const result=runFixtureEndToEndReplay(input());
    expect(result.replayed).toBe(true);
    expect(result.shadowCount).toBe(2);
    expect(result.projectedCount).toBe(2);
    expect(result.adaptedCount).toBe(2);
    expect(result.fieldDerived).toBe(true);
    expect(result.reflectionGenerated).toBe(true);
    expect(result.humanGatePassed).toBe(true);
    expect(result.noOpSimulationPassed).toBe(true);
  });

  test('session consent remains unconsumed during valid fixture replay',()=>{
    const result=runFixtureEndToEndReplay(input());
    expect(result.consentLifecycleAfter).toEqual(result.consentLifecycleBefore);
  });

  test('replay has zero live external effect',()=>{
    const result=runFixtureEndToEndReplay(input());
    expect(result.liveSourceConnected).toBe(false);
    expect(result.realMemberDataRead).toBe(false);
    expect(result.persisted).toBe(false);
    expect(result.memberFacingContacted).toBe(false);
    expect(result.deliveryExecuted).toBe(false);
    expect(result.maiaPromptMutated).toBe(false);
    expect(result.networkSideEffect).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });

  test('fails closed if one fixture source is missing',()=>{
    const bad=input();
    bad.sourceRefs=['fixture:r5:work','fixture:r5:missing'];
    const result=runFixtureEndToEndReplay(bad);
    expect(result.replayed).toBe(false);
    expect(result.errors).toContain('shadow_read:fixture_source_not_found');
    expect(result.realMemberDataRead).toBe(false);
    expect(result.persisted).toBe(false);
  });

  test('fails closed on wrong session before replaying sources',()=>{
    const bad=input();
    bad.sessionRef='session:wrong';
    const result=runFixtureEndToEndReplay(bad);
    expect(result.replayed).toBe(false);
    expect(result.errors).toContain('shadow_read:session_ref_mismatch');
    expect(result.shadowCount).toBe(0);
    expect(result.projectedCount).toBe(0);
  });
});
