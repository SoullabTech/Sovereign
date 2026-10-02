export * from '../contract';
import * as ref from '../contract';
export function composeResponseEnvelope(act: any, answer: any): any {
  const e: any = ref.composeResponseEnvelope(act, answer);
  const {
    authorizationRef: _a,
    inputManifest: _i,
    historicalEvidence: _h,
    ...rest
  } = e;
  return rest;
}
