/**
 * Client side of the Sanctuary keep gate (founder ruling 2026-11-09, third). Every request that asks MAIA to keep something
 * carries the member's declared posture; a refused write leaves the writer's text where it was and says why.
 */
import { declaredSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';

/** The request body, with the Sanctuary posture declared (an explicit posture already in `body` is kept). */
export function withKeepPosture<T extends Record<string, unknown>>(body: T): T & ReturnType<typeof declaredSanctuaryPosture> {
  return { ...declaredSanctuaryPosture(), ...body };
}

export const KEEP_REFUSAL_COPY: Record<'sanctuary_not_kept' | 'posture_undeclared', string> = {
  sanctuary_not_kept: 'Sanctuary is on, so this isn’t kept. What you wrote is still here; turn Sanctuary off to keep it.',
  posture_undeclared: 'Your Sanctuary setting couldn’t be read on this device, so nothing was kept. What you wrote is still here; reload and try again.',
};

export function keepRefusalCopy(refusal: string | null | undefined): string | null {
  return refusal === 'sanctuary_not_kept' || refusal === 'posture_undeclared' ? KEEP_REFUSAL_COPY[refusal] : null;
}
