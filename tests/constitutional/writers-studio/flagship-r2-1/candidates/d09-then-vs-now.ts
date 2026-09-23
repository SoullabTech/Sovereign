export * from '../contract';
import * as ref from '../contract';
export function admitPosture(posture: string): any {
  if (posture === 'THEN_VS_NOW') return { admitted: true };
  return ref.admitPosture(posture);
}
