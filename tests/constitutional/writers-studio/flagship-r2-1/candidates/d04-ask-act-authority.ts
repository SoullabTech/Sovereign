export * from '../contract';
import * as ref from '../contract';
export function buildR21Act(o: any): any {
  const a: any = ref.buildR21Act(o);
  return {
    ...a,
    authorization: { ...a.authorization, kind: 'ASK_AUTHORIZATION_ACT' },
  };
}
