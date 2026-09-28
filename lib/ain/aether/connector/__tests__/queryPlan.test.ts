import { createAetherConnectorDeclaration } from '../connectorContract';
import { createSourceManifest } from '../sourceManifest';
import { adjudicateQueryPlan } from '../queryPlan';

const connector=createAetherConnectorDeclaration('connector:r3',[
  'member_authored_text',
]);

const manifest=createSourceManifest('manifest:r3',[{
  sourceClass:'member_authored_text',
  fields:[
    {field:'recordRef',purpose:'identify_source',required:true},
    {field:'memberRef',purpose:'bind_member_scope',required:true},
    {field:'text',purpose:'represent_observation',required:true},
    {field:'createdAt',purpose:'represent_time',required:true},
    {field:'domain',purpose:'represent_domain',required:true},
  ],
}]);

const consent={
  consentRef:'consent:r3',
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

function plan(){
  return {
    queryRef:'query:r3',
    connectorRef:'connector:r3',
    manifestRef:'manifest:r3',
    memberRef:'member:fixture',
    consentRef:'consent:r3',
    sourceClass:'member_authored_text' as const,
    fields:['recordRef','memberRef','text','createdAt','domain'],
    startTime:'2026-09-01T00:00:00-04:00',
    endTime:'2026-09-29T00:00:00-04:00',
    maxRecords:25,
    wildcard:false as const,
    paginationAllowed:false as const,
    execute:false as const,
  };
}

describe('AIN-AETHER-CONNECTOR-01R3 query plan',()=>{
  test('admits a fully bounded zero-execution query plan',()=>{
    const result=adjudicateQueryPlan(connector,manifest,consent,plan());
    expect(result.allowed).toBe(true);
    expect(result.plan?.maxRecords).toBe(25);
    expect(result.zeroExecution).toBe(true);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses wildcard, pagination, or execution',()=>{
    const result=adjudicateQueryPlan(connector,manifest,consent,{
      ...plan(),
      wildcard:true as false,
      paginationAllowed:true as false,
      execute:true as false,
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'wildcard_forbidden',
      'pagination_forbidden_in_r3',
      'query_execution_forbidden_in_r3',
    ]));
  });

  test('refuses cardinality above hard ceiling',()=>{
    const result=adjudicateQueryPlan(connector,manifest,consent,{
      ...plan(),
      maxRecords:101,
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toContain('max_records_exceeds_r3_ceiling');
  });

  test('refuses invalid or reversed time windows',()=>{
    expect(adjudicateQueryPlan(connector,manifest,consent,{
      ...plan(),
      startTime:'not-a-time',
    }).errors).toContain('invalid_start_time');

    expect(adjudicateQueryPlan(connector,manifest,consent,{
      ...plan(),
      startTime:'2026-09-30T00:00:00-04:00',
      endTime:'2026-09-29T00:00:00-04:00',
    }).errors).toContain('time_window_invalid');
  });

  test('refuses non-allowlisted field inside otherwise valid plan',()=>{
    const result=adjudicateQueryPlan(connector,manifest,consent,{
      ...plan(),
      fields:[...plan().fields,'email'],
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toContain('field_manifest:field_not_allowlisted:email');
  });

  test('query plan grants no side-effect authority',()=>{
    const result=adjudicateQueryPlan(connector,manifest,consent,plan());
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
