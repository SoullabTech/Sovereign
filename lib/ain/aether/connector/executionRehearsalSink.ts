import type { AetherConnectorQueryPlan } from './queryPlan';
import {
  consumeExecutionTokenWithoutExecution,
  validateExecutionTokenForNextGate,
  type ConnectorExecutionToken,
} from './executionToken';
import { fingerprintQueryPlan } from './planReviewCustody';

export interface ExecutionRehearsalReceipt {
  receiptRef:string;
  tokenRef:string;
  queryRef:string;
  fingerprintDigest:string;
  tokenConsumed:true;
  sink:'zero_io_rehearsal';
  connectorIoAttempted:false;
  externalNetworkCall:false;
  executionOccurred:false;
  recordReadExecuted:false;
  recordCountRead:0;
  persisted:false;
  memberFacingDelivery:false;
  maiaPromptMutated:false;
  productionAuthority:false;
  auditNote:string;
}

export interface ExecutionRehearsalResult {
  rehearsed:boolean;
  errors:string[];
  consumedToken:ConnectorExecutionToken|null;
  receipt:ExecutionRehearsalReceipt|null;
}

export function rehearseExecutionWithoutIo(
  token:ConnectorExecutionToken,
  plan:AetherConnectorQueryPlan,
  now:string,
):ExecutionRehearsalResult{
  const validation=validateExecutionTokenForNextGate(token,plan,now);
  if(!validation.usable){
    return {
      rehearsed:false,
      errors:[...validation.errors],
      consumedToken:null,
      receipt:null,
    };
  }

  const fingerprint=fingerprintQueryPlan(plan);
  const consumedToken=consumeExecutionTokenWithoutExecution(token);

  return {
    rehearsed:true,
    errors:[],
    consumedToken,
    receipt:{
      receiptRef:'aether-exec-rehearsal:'+token.tokenRef,
      tokenRef:token.tokenRef,
      queryRef:plan.queryRef,
      fingerprintDigest:fingerprint.digest,
      tokenConsumed:true,
      sink:'zero_io_rehearsal',
      connectorIoAttempted:false,
      externalNetworkCall:false,
      executionOccurred:false,
      recordReadExecuted:false,
      recordCountRead:0,
      persisted:false,
      memberFacingDelivery:false,
      maiaPromptMutated:false,
      productionAuthority:false,
      auditNote:'One-shot execution token consumed by inert rehearsal sink; no connector I/O or record read occurred.',
    },
  };
}
