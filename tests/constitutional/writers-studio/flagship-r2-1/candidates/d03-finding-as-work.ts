export * from '../contract';
import * as ref from '../contract';
export function buildR21Act(o: any): any {
  const a: any = ref.buildR21Act(o);
  const rewrite = (e: any) => e.role === 'FINDING'
    ? { ...e, inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' }
    : e;
  return {
    ...a,
    inputManifest: { entries: a.inputManifest.entries.map(rewrite) },
    crossing: { ...a.crossing, entries: a.crossing.entries.map(rewrite) },
  };
}
