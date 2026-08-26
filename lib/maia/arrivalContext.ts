/**
 * Arrival context — what the member brought, carried across the handoff into MAIA.
 *
 * MLX-06 Unit 2. This exists so MAIA's first contact can answer what the member
 * actually said rather than greeting context-blind.
 *
 * CONSTITUTIONAL SHAPE (MLX-01 §0.1, ruling MLX-R3):
 *
 *   A doorway is ENCOUNTER, not Recognition. At most it means "the member
 *   intentionally entered through doorway X". It may contextualize MAIA's
 *   opening. It is NOT psychological evidence.
 *
 * Therefore this context is deliberately:
 *
 *   SESSION-SCOPED   sessionStorage, not localStorage and not the database.
 *                    It frames the opening turn and dies with the tab.
 *   NON-DURABLE      no member fact is written. Nothing here may be persisted,
 *                    aggregated, or read back as a claim about the person.
 *   OFF THE URL      the member's own words never ride a query string
 *                    (precedent: the Now What? room passes an opaque id).
 *   NOT SPIRAL STATE it may never write member_spiral_state. A click is not
 *                    evidence of an element; the conductor earns that from
 *                    actual conversation, with hysteresis.
 *
 * If a future unit wants durable doorway history, that is a separate ruling
 * with its own consent surface — not an extension of this module.
 */

const KEY = 'maia_arrival_context';

/** The ruled doorway set. Language is fixed by the frozen stimulus (c137e44). */
export const DOORWAYS = [
  { id: 'mind', label: 'Something is on my mind' },
  { id: 'change', label: "I'm going through a change" },
  { id: 'self', label: 'I want to understand myself' },
  { id: 'decision', label: 'I need clarity about a decision' },
  { id: 'relation', label: 'Something in a relationship' },
  { id: 'making', label: "I'm making something" },
] as const;

/** The always-available way in for someone who cannot name it yet. */
export const DOORWAY_UNSURE = { id: 'dunno', label: "I don't know where to begin" } as const;

export type DoorwayId = (typeof DOORWAYS)[number]['id'] | typeof DOORWAY_UNSURE.id;

export interface ArrivalContext {
  /** The member's own words. Never interpreted here, never sent to a URL. */
  attention: string;
  /** Which door they chose to come in through. Encounter-layer only. */
  doorway: DoorwayId;
  /** When they crossed. For staleness only — not a behavioural signal. */
  at: number;
}

/** Context older than this is ignored: it belonged to a different sitting. */
const MAX_AGE_MS = 60 * 60 * 1000;

export function writeArrivalContext(attention: string, doorway: DoorwayId): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx: ArrivalContext = { attention: attention.trim(), doorway, at: Date.now() };
    window.sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    /* A member with storage disabled still arrives; they just arrive unframed. */
  }
}

export function readArrivalContext(): ArrivalContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ArrivalContext>;
    if (typeof parsed?.doorway !== 'string' || typeof parsed?.at !== 'number') return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    return {
      attention: typeof parsed.attention === 'string' ? parsed.attention : '',
      doorway: parsed.doorway as DoorwayId,
      at: parsed.at,
    };
  } catch {
    return null;
  }
}

/** Consumed once. The frame orients the opening; it does not persist behind it. */
export function clearArrivalContext(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
