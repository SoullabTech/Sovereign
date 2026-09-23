export * from '../contract';
import * as ref from '../contract';
export function composeResponseEnvelope(act: any, answer: any): any {
  return {
    ...ref.composeResponseEnvelope(act, answer),
    provenanceAuthority: 'MODEL',
  };
}
