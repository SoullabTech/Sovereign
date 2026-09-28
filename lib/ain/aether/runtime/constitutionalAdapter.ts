export const AETHER_BENCHMARK_CLOSURE_COMMIT=
  '297edbade3d1deab9311b93023852961797e23b2' as const;

export interface AetherRuntimeConstitution {
  programme:'AIN-AETHER-01';
  sourceCommit:typeof AETHER_BENCHMARK_CLOSURE_COMMIT;
  standing:'closed_for_benchmark_scope';
  runtimeAuthority:false;
  personDefinitionAuthority:false;
  soulRepresentationAuthority:false;
  finalMeaningAuthority:'member';
  laws:readonly string[];
}

export type RuntimeIntegrationCapability=
  | 'read_constitution'
  | 'read_benchmark_contracts'
  | 'evaluate_candidate_against_constitution'
  | 'bind_live_member_data'
  | 'persist_member_field'
  | 'mutate_maia_prompt'
  | 'activate_production_route'
  | 'write_back_to_benchmark_corpus';

export interface RuntimeIntegrationIntent {
  intentRef:string;
  requestedCapabilities:RuntimeIntegrationCapability[];
}

export interface RuntimeIntegrationAdjudication {
  intentRef:string;
  allowed:boolean;
  allowedCapabilities:RuntimeIntegrationCapability[];
  refusedCapabilities:RuntimeIntegrationCapability[];
  reasons:string[];
  liveBindingAuthorized:false;
  benchmarkMutationAuthorized:false;
  productionAuthority:false;
}

const READ_ONLY_CAPABILITIES=new Set<RuntimeIntegrationCapability>([
  'read_constitution',
  'read_benchmark_contracts',
  'evaluate_candidate_against_constitution',
]);

const CONSTITUTION:AetherRuntimeConstitution=Object.freeze({
  programme:'AIN-AETHER-01',
  sourceCommit:AETHER_BENCHMARK_CLOSURE_COMMIT,
  standing:'closed_for_benchmark_scope',
  runtimeAuthority:false,
  personDefinitionAuthority:false,
  soulRepresentationAuthority:false,
  finalMeaningAuthority:'member',
  laws:Object.freeze([
    'The system serves the dance; it does not become the dancer.',
    'Aether reflects the member-in-field; it does not define the member.',
    'Member correction has priority over field interpretation.',
    'Aetheric gestalt is a partial field pattern, never the whole person.',
    'Relation may reveal where to look; relation does not itself establish causation.',
    'Humility is not vagueness. Depth is not authority.',
    'Interpretation may change; lineage may only grow.',
    'Memory may remain uncertain rather than become reconstructed fiction.',
    'Temporal precision does not equal temporal authority.',
    'Final meaning authority remains with the member.',
    'Soul remains outside computational representation authority.',
  ]),
});

export function createReadOnlyAetherRuntimeAdapter(){
  return Object.freeze({
    constitution:CONSTITUTION,
    adjudicate(intent:RuntimeIntegrationIntent):RuntimeIntegrationAdjudication{
      const allowedCapabilities=intent.requestedCapabilities
        .filter(cap=>READ_ONLY_CAPABILITIES.has(cap));
      const refusedCapabilities=intent.requestedCapabilities
        .filter(cap=>!READ_ONLY_CAPABILITIES.has(cap));

      const reasons:string[]=[];
      for(const cap of refusedCapabilities){
        if(cap==='bind_live_member_data'){
          reasons.push('live_member_binding_not_authorized');
        } else if(cap==='persist_member_field'){
          reasons.push('member_field_persistence_not_authorized');
        } else if(cap==='mutate_maia_prompt'){
          reasons.push('maia_prompt_mutation_not_authorized');
        } else if(cap==='activate_production_route'){
          reasons.push('production_route_activation_not_authorized');
        } else if(cap==='write_back_to_benchmark_corpus'){
          reasons.push('benchmark_corpus_is_frozen');
        }
      }

      return {
        intentRef:intent.intentRef,
        allowed:refusedCapabilities.length===0,
        allowedCapabilities,
        refusedCapabilities,
        reasons,
        liveBindingAuthorized:false,
        benchmarkMutationAuthorized:false,
        productionAuthority:false,
      };
    },
  });
}
