/** D15 — when the section has changed, an AS_READ discussion helpfully becomes THEN_VS_NOW and loads the current text. */
export * from '../contract';
import type { Posture, CurrentLocationState } from '../contract';
export function postureUnderLocation(declared: Posture, location: CurrentLocationState): Posture {
  return declared === 'AS_READ' && location.state === 'superseded' ? 'THEN_VS_NOW' : declared;
}
