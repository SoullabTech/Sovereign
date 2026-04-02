/**
 * QuranService — Legacy accessor, now delegates to SacredTextRegistry.
 *
 * Kept for backward compatibility. New code should use SacredTextRegistry directly.
 */

import { SacredTextRegistry } from './SacredTextRegistry';
import { QURAN_DISCLAIMER } from './quran';
import type { SacredPassage } from './types';
import { toSacredPassage } from './types';

export type { SacredPassage };

export const QuranService = {
  getAll(): SacredPassage[] {
    return SacredTextRegistry.getByTradition('quran').map(toSacredPassage);
  },

  getById(id: string): SacredPassage | undefined {
    const entry = SacredTextRegistry.getByTradition('quran').find(e => e.id === id);
    return entry ? toSacredPassage(entry) : undefined;
  },

  getDisclaimer() {
    return QURAN_DISCLAIMER;
  },

  count(): number {
    return SacredTextRegistry.getByTradition('quran').length;
  },
} as const;
