import { admitLiveInputToShadow } from '../liveInputContract';
import { projectFixtureShadowToSyntheticRuntime } from '../shadowRuntimeCompatibility';

const consent={
  consentRef:'consent:r4',
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

function shadow(source:'member_authored'|'member_confirmed_import'|'system_observed'='member_authored'){
  const result=admitLiveInputToShadow({
    inputRef:'live-fixture:r4',
    memberRef:'member:fixture',
    source,
    domain:'work',
    observation:'Work feels more open this week.',
    temporalStanding:'is_being',
    confidence:.81,
    consentRef:consent.consentRef,
  },consent);
  if(!result.shadow) throw new Error('shadow not admitted');
  return result.shadow;
}

function attestation(){
  return {
    fixtureRef:'fixture-attestation:r4',
    fixtureOnly:true as const,
    memberRef:'member:fixture',
    consentRef:'consent:r4',
  };
}

describe('AIN-AETHER-LIVE-ADAPTER-01R4 shadow runtime compatibility',()=>{
  test('projects live-shaped fixture shadow into closed synthetic runtime membrane',()=>{
    const result=projectFixtureShadowToSyntheticRuntime(shadow(),attestation());
    expect(result.projected).toBe(true);
    expect(result.runtimeEvent?.synthetic).toBe(true);
    expect(result.runtimeEvent?.source).toBe('synthetic_member_authored');
    expect(result.runtimeEvent?.confidence).toBe(.81);
    expect(result.runtimeEvent?.temporalStanding).toBe('is_being');
  });

  test('preserves source mapping without upgrading to hypothesis authority',()=>{
    expect(projectFixtureShadowToSyntheticRuntime(
      shadow('member_confirmed_import'),attestation(),
    ).runtimeEvent?.source).toBe('synthetic_imported');

    expect(projectFixtureShadowToSyntheticRuntime(
      shadow('system_observed'),attestation(),
    ).runtimeEvent?.source).toBe('synthetic_system_observed');
  });

  test('requires explicit fixture attestation and refuses genuine live projection path',()=>{
    const result=projectFixtureShadowToSyntheticRuntime(shadow(),null);
    expect(result.projected).toBe(false);
    expect(result.errors).toContain('fixture_attestation_required');
    expect(result.runtimeEvent).toBeNull();
  });

  test('refuses member or consent attestation mismatch',()=>{
    const result=projectFixtureShadowToSyntheticRuntime(shadow(),{
      ...attestation(),
      memberRef:'member:other',
      consentRef:'consent:other',
    });
    expect(result.projected).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'fixture_member_mismatch',
      'fixture_consent_mismatch',
    ]));
  });

  test('compatibility provenance proves no live-data projection or authority escalation',()=>{
    const result=projectFixtureShadowToSyntheticRuntime(shadow(),attestation());
    expect(result.provenance?.fixtureOnly).toBe(true);
    expect(result.provenance?.liveDataProjected).toBe(false);
    expect(result.provenance?.confidenceIncreased).toBe(false);
    expect(result.provenance?.temporalStandingStrengthened).toBe(false);
    expect(result.provenance?.authorityEscalated).toBe(false);
    expect(result.provenance?.persistenceAuthority).toBe(false);
    expect(result.provenance?.deliveryAuthority).toBe(false);
    expect(result.provenance?.promptMutationAuthority).toBe(false);
    expect(result.provenance?.productionAuthority).toBe(false);
  });
});
