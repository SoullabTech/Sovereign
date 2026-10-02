export * from '../contract';
import * as ref from '../contract';
export function admitPosture(posture: string): any {
  if (posture === 'CURRENT_TEXT_ONLY') return { admitted: true };
  return ref.admitPosture(posture);
}
