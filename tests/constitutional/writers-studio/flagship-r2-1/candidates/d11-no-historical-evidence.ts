export * from '../contract';
import * as ref from '../contract';
export function buildR21Act(o: any): any {
  const a: any = ref.buildR21Act(o);
  const { then: _then, ...object } = a.object;
  return { ...a, object };
}
