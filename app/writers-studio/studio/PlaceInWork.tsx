'use client';

/**
 * WS-CONVERGENCE-01 · C3 — WHERE THE WRITER IS, AND ONE WAY BACK.
 *
 * ⭐ COMPOSITION OVER EXISTING SUBSTRATE. This creates NO location system.
 * `SECTION_PARAM` (`?s=`), `locationForSection`, `readSectionParam` and
 * `STUDIO_PLACE_CHANGE_EVENT` already exist and already carry the member's
 * place; ⛔ a second address would be the parallel location system C3 forbids,
 * and the two would drift the first time one was updated without the other.
 *
 * ⛔ NO SILENT JUMP TO THE BEGINNING. `backHref` is composed from the section
 * the member is actually at. Where there is no section, it returns the Work's
 * address WITHOUT a `?s=` — ⭐ absent, never `s=<first section>`, because
 * inventing a place is how "Back to manuscript" quietly becomes "back to the
 * top" and the writer loses the thing they were looking at.
 */

import Link from 'next/link';
import { INK, RULE, SPACE } from '../studioTheme';
import { StudioText } from './StudioType';
import {
  backToManuscriptHref, placeLine, type PlaceCrumb,
} from '@/lib/writersStudio/placeCrumb';

export { backToManuscriptHref, placeLine };
export type { PlaceCrumb };

export function PlaceInWork({
  crumb, backHref, showBack = true,
}: { crumb: PlaceCrumb; backHref: string; showBack?: boolean }) {
  return (
    <div
      data-place-in-work
      style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.snug,
               borderBottom: `1px solid ${RULE.faint}`, paddingBottom: SPACE.tight }}
    >
      <StudioText role="metadata" data-place-line style={{ color: INK.soft }}>
        {placeLine(crumb)}
      </StudioText>
      {showBack && (
        <Link href={backHref} data-back-to-manuscript style={{ marginLeft: 'auto', color: INK.soft }}>
          <StudioText role="metadata">Back to manuscript</StudioText>
        </Link>
      )}
    </div>
  );
}
