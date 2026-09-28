import {
  AETHER_BENCHMARK_CLOSURE_COMMIT,
  createReadOnlyAetherRuntimeAdapter,
} from '../constitutionalAdapter';

describe('AIN-AETHER-RUNTIME-01R1 read-only constitutional adapter',()=>{
  test('is pinned to the exact closed benchmark commit',()=>{
    const adapter=createReadOnlyAetherRuntimeAdapter();
    expect(adapter.constitution.sourceCommit).toBe(
      '297edbade3d1deab9311b93023852961797e23b2',
    );
    expect(AETHER_BENCHMARK_CLOSURE_COMMIT).toBe(adapter.constitution.sourceCommit);
  });

  test('preserves benchmark closure authority boundaries',()=>{
    const adapter=createReadOnlyAetherRuntimeAdapter();
    expect(adapter.constitution.standing).toBe('closed_for_benchmark_scope');
    expect(adapter.constitution.runtimeAuthority).toBe(false);
    expect(adapter.constitution.personDefinitionAuthority).toBe(false);
    expect(adapter.constitution.soulRepresentationAuthority).toBe(false);
    expect(adapter.constitution.finalMeaningAuthority).toBe('member');
  });

  test('allows only read-only constitutional evaluation capabilities',()=>{
    const adapter=createReadOnlyAetherRuntimeAdapter();
    const result=adapter.adjudicate({
      intentRef:'r1:read-only',
      requestedCapabilities:[
        'read_constitution',
        'read_benchmark_contracts',
        'evaluate_candidate_against_constitution',
      ],
    });
    expect(result.allowed).toBe(true);
    expect(result.refusedCapabilities).toEqual([]);
  });

  test('refuses live member binding, persistence, prompt mutation, production, and benchmark writes',()=>{
    const adapter=createReadOnlyAetherRuntimeAdapter();
    const result=adapter.adjudicate({
      intentRef:'r1:forbidden',
      requestedCapabilities:[
        'bind_live_member_data',
        'persist_member_field',
        'mutate_maia_prompt',
        'activate_production_route',
        'write_back_to_benchmark_corpus',
      ],
    });
    expect(result.allowed).toBe(false);
    expect(result.refusedCapabilities).toHaveLength(5);
    expect(result.reasons).toContain('live_member_binding_not_authorized');
    expect(result.reasons).toContain('benchmark_corpus_is_frozen');
    expect(result.liveBindingAuthorized).toBe(false);
    expect(result.benchmarkMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });

  test('adapter and constitutional law list are frozen',()=>{
    const adapter=createReadOnlyAetherRuntimeAdapter();
    expect(Object.isFrozen(adapter)).toBe(true);
    expect(Object.isFrozen(adapter.constitution)).toBe(true);
    expect(Object.isFrozen(adapter.constitution.laws)).toBe(true);
  });
});
