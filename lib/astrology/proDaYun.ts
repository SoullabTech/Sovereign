/**
 * Da Yun (ten-year luck cycles) for a Pro chart, computed on the server.
 *
 * A saved chart does not record sex, and the cycle runs forward or backward by
 * the year stem's polarity and sex, so both directions are returned and the
 * astrologer chooses (as the Pro luck pillars already do). The profiles carry
 * no birth date, time or gender: the browser never holds them.
 */
import { calculateDaYun } from './daYunCalculator';
import type { DaYunProfile, DaYunProfileView } from './types/daYun';

export interface DaYunByDirection {
  forward: DaYunProfileView;
  backward: DaYunProfileView;
}

/** Drop the person's birth details from a profile. */
export function toDaYunProfileView(profile: DaYunProfile): DaYunProfileView {
  const { birthDate: _birthDate, birthTime: _birthTime, gender: _gender, ...view } = profile;
  return view;
}

/**
 * @param instant      the birth instant
 * @param tzOffsetMin  local offset from UTC at birth, minutes
 * @param birthTime    local HH:MM (kept only inside the calculation)
 */
export function daYunByDirection(instant: Date, tzOffsetMin: number, birthTime?: string): DaYunByDirection {
  const out: Partial<DaYunByDirection> = {};
  for (const gender of ['male', 'female'] as const) {
    const profile = calculateDaYun(instant, gender, birthTime, tzOffsetMin);
    out[profile.cycleDirection] = toDaYunProfileView(profile);
  }
  if (!out.forward || !out.backward) throw new Error('DA_YUN_DIRECTION_UNRESOLVED');
  return out as DaYunByDirection;
}
