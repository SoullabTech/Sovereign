export * from '../contract';
import * as ref from '../contract';
export function buildR21Act(o: unknown): any {
  const a: any = ref.buildR21Act(o);
  return {
    ...a,
    object: {
      ...a.object,
      now: {
        role: 'NOW',
        inputClass: 'MEMBER_WORK_TEXT',
        text: 'current prose',
      },
    },
  };
}
