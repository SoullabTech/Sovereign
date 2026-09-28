import type { AetherConnectorQueryPlan } from '../connector/queryPlan';
import type { ConnectorExecutionToken } from '../connector/executionToken';
import {
  consumeExecutionTokenWithoutExecution,
  validateExecutionTokenForNextGate,
} from '../connector/executionToken';

export interface LocalFixtureRecord {
  recordRef:string;
  memberRef:string;
  text:string;
  createdAt:string;
  domain:string;
}

export interface LocalFixtureTransport {
  transportRef:string;
  transportKind:'local_fixture_only';
  productionReachable:false;
  networkEnabled:false;
  records:LocalFixtureRecord[];
}

export interface LocalFixtureExecutionReceipt {
  receiptRef:string;
  tokenRef:string;
  queryRef:string;
  transportRef:string;
  transportKind:'local_fixture_only';
  recordCountRead:1;
  connectorIoAttempted:true;
  externalNetworkCall:false;
  productionReachable:false;
  persisted:false;
  memberFacingDelivery:false;
  maiaPromptMutated:false;
  productionAuthority:false;
}

export interface LocalFixtureExecutionResult {
  executed:boolean;
  errors:string[];
  record:LocalFixtureRecord|null;
  consumedToken:ConnectorExecutionToken|null;
  receipt:LocalFixtureExecutionReceipt|null;
}

function inWindow(record:LocalFixtureRecord,plan:AetherConnectorQueryPlan){
  const t=Date.parse(record.createdAt);
  const start=Date.parse(plan.startTime);
  const end=Date.parse(plan.endTime);
  return Number.isFinite(t)&&Number.isFinite(start)&&Number.isFinite(end)&&t>=start&&t<end;
}

export function executeOneLocalFixtureRecord(
  transport:LocalFixtureTransport,
  token:ConnectorExecutionToken,
  plan:AetherConnectorQueryPlan,
  now:string,
):LocalFixtureExecutionResult{
  const errors:string[]=[];

  if(transport.transportKind!=='local_fixture_only') errors.push('transport_not_local_fixture_only');
  if(transport.productionReachable!==false) errors.push('production_reachability_forbidden');
  if(transport.networkEnabled!==false) errors.push('network_enabled_forbidden');
  if(plan.maxRecords!==1) errors.push('executor_r1_requires_max_records_1');
  if(plan.execute!==false) errors.push('plan_execute_flag_must_remain_false');

  const tokenValidation=validateExecutionTokenForNextGate(token,plan,now);
  if(!tokenValidation.usable){
    errors.push(...tokenValidation.errors.map(e=>'token:'+e));
  }

  if(errors.length>0){
    return {
      executed:false,
      errors:[...new Set(errors)],
      record:null,
      consumedToken:null,
      receipt:null,
    };
  }

  const candidates=transport.records.filter(record=>
    record.memberRef===plan.memberRef &&
    inWindow(record,plan)
  );

  if(candidates.length===0){
    return {
      executed:false,
      errors:['fixture_record_not_found'],
      record:null,
      consumedToken:null,
      receipt:null,
    };
  }

  const record={...candidates[0]};
  const consumedToken=consumeExecutionTokenWithoutExecution(token);

  return {
    executed:true,
    errors:[],
    record,
    consumedToken,
    receipt:{
      receiptRef:'aether-local-fixture-read:'+token.tokenRef,
      tokenRef:token.tokenRef,
      queryRef:plan.queryRef,
      transportRef:transport.transportRef,
      transportKind:'local_fixture_only',
      recordCountRead:1,
      connectorIoAttempted:true,
      externalNetworkCall:false,
      productionReachable:false,
      persisted:false,
      memberFacingDelivery:false,
      maiaPromptMutated:false,
      productionAuthority:false,
    },
  };
}
