export * from '../contract';
import * as ref from '../contract';
export function buildR21Act(o: unknown): any {
  const a: any = ref.buildR21Act(o);
  return {
    ...a,
    threadPolicy: { ...a.threadPolicy, continuationAuthorized: true },
  };
}
