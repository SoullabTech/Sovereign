import { adjudicateCandidateAetherEvent } from '../candidateEventEnvelope';
import { adaptSyntheticEventToBenchmarkObservation } from '../benchmarkObservationAdapter';

function admitted(overrides:Record<string,unknown>={}){
  const adjudication=adjudicateCandidateAetherEvent({
    eventRef:'synthetic:event:r3',
    synthetic:true,
    source:'synthetic_member_authored',
    domain:'work',
    observation:'Work feels more open and experimental this week.',
    temporalStanding:'is_being',
    confidence:.8,
    consent:'explicit_synthetic_consent',
    ...overrides,
  } as any);
  if(!adjudication.event) throw new Error('test event not admitted');
  return adjudication.event;
}

describe('AIN-AETHER-RUNTIME-01R3 benchmark observation adapter',()=>{
  test('losslessly converts admitted synthetic event into benchmark observation plus provenance',()=>{
    const event=admitted();
    const result=adaptSyntheticEventToBenchmarkObservation(event);
    expect(result.adapted).toBe(true);
    expect(result.result?.observation).toEqual({
      observationRef:event.eventRef,
      facetRef:event.domain,
      motif:event.observation,
      temporalStanding:event.temporalStanding,
      standing:'member_named',
      qualities:[],
      note:event.observation,
    });
    expect(result.result?.provenance.sourceConfidence).toBe(.8);
    expect(result.result?.provenance.consent).toBe('explicit_synthetic_consent');
  });

  test('maps synthetic system/imported source only to source_observed, never hypothesis authority',()=>{
    for(const source of ['synthetic_system_observed','synthetic_imported'] as const){
      const event=admitted({source});
      const result=adaptSyntheticEventToBenchmarkObservation(event);
      expect(result.result?.observation.standing).toBe('source_observed');
      expect(result.result?.observation.standing).not.toBe('maia_hypothesis');
    }
  });

  test('preserves temporal standing exactly for representable values',()=>{
    for(const temporalStanding of ['has_been','is_being','may_become'] as const){
      const event=admitted({temporalStanding});
      const result=adaptSyntheticEventToBenchmarkObservation(event);
      expect(result.result?.observation.temporalStanding).toBe(temporalStanding);
      expect(result.result?.temporalStandingStrengthened).toBe(false);
    }
  });

  test('refuses unknown temporal standing rather than coercing it',()=>{
    const event=admitted({temporalStanding:'unknown'});
    const result=adaptSyntheticEventToBenchmarkObservation(event);
    expect(result.adapted).toBe(false);
    expect(result.errors).toContain('target_cannot_losslessly_represent_unknown_temporal_standing');
    expect(result.result).toBeNull();
  });

  test('preserves confidence as provenance and never upgrades authority',()=>{
    const event=admitted({confidence:.42});
    const result=adaptSyntheticEventToBenchmarkObservation(event);
    expect(result.result?.provenance.sourceConfidence).toBe(.42);
    expect(result.result?.confidenceIncreased).toBe(false);
    expect(result.result?.authorityEscalated).toBe(false);
    expect(result.result?.persistenceAuthority).toBe(false);
    expect(result.result?.provenance.finalMeaningAuthority).toBe('member');
  });
});
