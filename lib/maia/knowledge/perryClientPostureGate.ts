/**
 * Glenn Perry — client-side PER-TURN source selection, dormant until UI wiring.
 *
 * This is not a general Sanctuary initializer and must not bypass the existing
 * main conversation submission contract. It only determines whether the
 * optional, still-unapproved Perry source request can be included in ONE turn.
 *
 * Call at the SEND gesture, not at mount or source-choice time. Read the live
 * current-session Sanctuary boolean from the same Quick Settings authority as
 * MAIA voice and chat. Absence, malformed content, or an active Sanctuary
 * choice refuse source selection. Never fall back to an account default,
 * cached session snapshot, or a component's initial false value.
 *
 * Client eligibility does NOT grant source permission; server source approval,
 * verified identity, posture, admission, digest and rights remain independent.
 */
import {
  readCurrentSanctuaryPosture,
  type StorageLike,
} from '@/lib/sanctuary/currentClientPosture';

/**
 * Kept literal to avoid importing the server-only Perry module into the
 * browser. Contract tests compare this ID against the server's declared ID.
 */
export const PERRY_CLIENT_SOURCE_CHOICE = 'glenn-perry-astropsychology' as const;

/** Current authored turn may itself contain an enter-Sanctuary command. */
export interface PerryCurrentTurnVeto {
  readonly sanctuaryEnteredByCurrentTurn?: boolean;
}

export type PerryClientSelectionDecision =
  | Readonly<{
      status: 'prepared';
      /** Ephemeral request fragment, valid for this gesture only. */
      request: Readonly<{
        perrySourceLens: typeof PERRY_CLIENT_SOURCE_CHOICE;
        sanctuary: false;
      }>;
    }>
  | Readonly<{
      status: 'refused';
      reason: 'not_selected' | 'posture_unresolved' | 'sanctuary_active';
    }>;

/**
 * Pure over storage when passed; uses the actual current device setting by
 * default at call time. Do not cache this result or persist it across turns.
 *
 * No call site in MAIA is wired to this function during Stage B.
 */
export function preparePerryClientSelection(
  selectedSource: unknown,
  storage?: StorageLike | null,
  turnVeto: PerryCurrentTurnVeto = {},
): PerryClientSelectionDecision {
  if (selectedSource !== PERRY_CLIENT_SOURCE_CHOICE) {
    return { status: 'refused', reason: 'not_selected' };
  }

  // Refusal-only override: a mode command can enter Sanctuary *during* this
  // very authored turn, before the live setting/React state catches up.
  // It can never authorize a turn when storage says Sanctuary or is unresolved.
  if (turnVeto.sanctuaryEnteredByCurrentTurn === true) {
    return { status: 'refused', reason: 'sanctuary_active' };
  }

  const current = readCurrentSanctuaryPosture(storage);
  if (!current.resolved) {
    return { status: 'refused', reason: 'posture_unresolved' };
  }
  if (current.sanctuary) {
    return { status: 'refused', reason: 'sanctuary_active' };
  }

  return {
    status: 'prepared',
    request: {
      perrySourceLens: PERRY_CLIENT_SOURCE_CHOICE,
      sanctuary: false,
    },
  };
}
