import type { LiveShadowObservation } from '../../live/liveInputContract';
import { replayExecutorOriginShadows } from '../executorOriginRuntimeReplay';

function shadow(inputRef:string,domain:string):LiveShadowObservation{
  return {
    inputRef,
    memberRef:'member:fixture',
    source:'member_authored',
    domain,
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    confidence:.8,
    consentRef:'consent:executor:r3',
    readOnly:true,
    persisted:false,
    delivered:false,
    maiaPromptMutated:false,
    productionAuthority:false,
    identityAuthority:false,
    diagnosticAuthority:false,
    predictiveAuthority:false,
    destinyAuthority:false,
    soulRepresentationAuthority:false,
    finalMeaningAuthority:'member',
  };
}

function input(recordRef:string,receiptRef:string,transportRef:string,domain:string){
  return {
    shadow:shadow('shadow:'+recordRef,domain),
    origin:{
      recordRef,
      executorReceiptRef:receiptRef,
      transportRef,
      transportKind:'local_fixture_only' as const,
      externalNetworkCall:false as const,
      productionReachable:false as const,
    },
  };
}

describe('AIN-AETHER-EXECUTOR-01R3 executor-origin runtime replay',()=>{
  test('replays two executor-origin shadows through frozen runtime and no-op sink',()=>{
    const result=replayExecutorOriginShadows('executor-r3',[
      input('record:work','receipt:work','transport:fixture:work','work'),
      input('record:creative','receipt:creative','transport:fixture:creative','creative'),
    ]);
    expect(result.replayed).toBe(true);
    expect(result.projectedCount).toBe(2);
    expect(result.adaptedCount).toBe(2);
    expect(result.fieldDerived).toBe(true);
    expect(result.reflectionGenerated).toBe(true);
    expect(result.humanGatePassed).toBe(true);
    expect(result.noOpSimulationPassed).toBe(true);
  });

  test('preserves executor origin record, receipt, and transport refs',()=>{
    const result=replayExecutorOriginShadows('executor-r3',[
      input('record:work','receipt:work','transport:fixture:work','work'),
      input('record:creative','receipt:creative','transport:fixture:creative','creative'),
    ]);
    expect(result.originRecordsPreserved).toEqual(['record:work','record:creative']);
    expect(result.originReceiptsPreserved).toEqual(['receipt:work','receipt:creative']);
    expect(result.originTransportsPreserved).toEqual(['transport:fixture:work','transport:fixture:creative']);
  });

  test('refuses non-local executor origin before runtime replay',()=>{
    const bad=input('record:bad','receipt:bad','transport:bad','work');
    (bad.origin as any).transportKind='remote';
    const result=replayExecutorOriginShadows('executor-r3',[
      bad,
      input('record:ok','receipt:ok','transport:ok','creative'),
    ]);
    expect(result.replayed).toBe(false);
    expect(result.errors).toContain('origin_transport_not_local_fixture_only');
    expect(result.projectedCount).toBe(0);
  });

  test('replay has zero external effect',()=>{
    const result=replayExecutorOriginShadows('executor-r3',[
      input('record:work','receipt:work','transport:fixture:work','work'),
      input('record:creative','receipt:creative','transport:fixture:creative','creative'),
    ]);
    expect(result.externalNetworkCall).toBe(false);
    expect(result.persisted).toBe(false);
    expect(result.memberFacingContacted).toBe(false);
    expect(result.deliveryExecuted).toBe(false);
    expect(result.maiaPromptMutated).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
