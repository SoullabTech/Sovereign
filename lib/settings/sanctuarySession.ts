/**
 * SANCTUARY-SESSION-INIT-01 — where a conversation's Sanctuary state comes from.
 *
 * Three things were conflated in `maia_settings.sanctuary`, and the conflation
 * is why a member could select Default Memory Mode → Sanctuary and still be
 * served an ordinary, remembering conversation:
 *
 *   account default        how a conversation BEGINS
 *   conversation state     what THIS conversation became
 *   browser persistence    where that happens to be stored
 *
 * `OracleConversation` initialized exclusively from browser-local
 * `maia_settings.sanctuary`, so the account default reached it only by
 * accident — via a one-shot bridge in three other components, guarded on
 * `maia_settings` not yet existing. Once that key existed in a browser, the
 * account default was permanently inert there, and it never crossed to a second
 * device at all because nothing on the conversation path read the server
 * preference.
 *
 * This module separates the three:
 *
 *   account default   → resolved here, server-backed, per member
 *   conversation state → recorded here, keyed by conversation identity
 *   maia_settings      → compatibility only; it no longer decides what a NEW
 *                        conversation means
 *
 * ⛔ NOT AN OVERRIDE STORE. The conversation record is not an exception to the
 * default — it is the missing persistence for the live conversation authority
 * that already existed in memory and was lost on every remount.
 *
 * ⛔ `consentSummary.sanctuaryDefault` is deliberately NOT wired here. Its
 * semantics are unresolved; sharing a word with Sanctuary is not a contract.
 */

/** Conversation identity. Shared with the voice hook so both agree what "this conversation" is. */
export const CONVERSATION_ID_KEY = 'maia_conversation_id';

/**
 * The current conversation's Sanctuary state.
 *
 * A single record rather than a map keyed by id: the record is only valid for
 * the conversation named inside it, so a rotation invalidates it implicitly and
 * nothing accumulates. A map would grow for the life of the browser and would
 * need pruning logic that could itself lose a member's state.
 */
export const CONVERSATION_SANCTUARY_KEY = 'maia_conversation_sanctuary';

/**
 * Initialization state for a conversation's Sanctuary value.
 *
 * `resolving` is deliberately NOT modelled as `sanctuary`. "We know this
 * conversation is private" and "we do not yet know what it should be" are
 * different facts, and collapsing them would make the observability lie in
 * exactly the place we most need it to be honest. Dispatch permission is
 * derived from this state; enforcement reads the resolved Sanctuary value.
 */
export type SanctuaryInitState = 'resolving' | 'sanctuary' | 'standard';

/** Where a resolved value came from. Kept so a failure never masquerades as a member's choice. */
export type SanctuaryInitSource =
  /** This conversation already had a state — a member's explicit choice, restored. */
  | 'conversation'
  /** Seeded from the member's server-backed account default. */
  | 'account-server'
  /** Seeded from browser-local account settings (no member id available). */
  | 'account-local'
  /** The preference lookup failed. Failed CLOSED to Sanctuary. Not a member selection. */
  | 'resolution-failed';

export interface SanctuaryResolution {
  state: SanctuaryInitState;
  sanctuary: boolean;
  source: SanctuaryInitSource;
  conversationId: string;
}

interface ConversationSanctuaryRecord {
  conversationId: string;
  sanctuary: boolean;
}

const newConversationId = (): string =>
  `conv-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`}`;

/** Get the current conversation identity, creating one if this browser has none. */
export function getConversationId(): string {
  if (typeof window === 'undefined') return newConversationId();
  try {
    const existing = localStorage.getItem(CONVERSATION_ID_KEY);
    if (existing) return existing;
  } catch {
    return newConversationId();
  }
  const created = newConversationId();
  try {
    localStorage.setItem(CONVERSATION_ID_KEY, created);
  } catch {
    /* storage unavailable — the id is still returned for this page's lifetime */
  }
  return created;
}

/**
 * Begin a genuinely new conversation.
 *
 * Rotating the identity is the point. Before this, "New Conversation" cleared
 * the transcript but kept `maia_conversation_id` forever, so anything keyed by
 * conversation — Sanctuary state included — silently belonged to a conversation
 * the member believed they had ended.
 */
export function rotateConversationId(): string {
  const created = newConversationId();
  try {
    localStorage.setItem(CONVERSATION_ID_KEY, created);
    // The prior conversation's state belongs to a conversation that no longer
    // exists. Leaving it would let it be adopted by the new one.
    localStorage.removeItem(CONVERSATION_SANCTUARY_KEY);
  } catch {
    /* storage unavailable */
  }
  return created;
}

/** This conversation's recorded Sanctuary state, or null if it has none yet. */
export function readConversationSanctuary(conversationId: string): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONVERSATION_SANCTUARY_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as ConversationSanctuaryRecord;
    // A record naming a different conversation is stale, not applicable.
    if (record?.conversationId !== conversationId) return null;
    return record.sanctuary === true;
  } catch {
    return null;
  }
}

/** Record this conversation's Sanctuary state. Called on an explicit member change, and on seeding. */
export function writeConversationSanctuary(conversationId: string, sanctuary: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const record: ConversationSanctuaryRecord = { conversationId, sanctuary };
    localStorage.setItem(CONVERSATION_SANCTUARY_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — live state still governs this page */
  }
}

/**
 * The member's account default, server-first so it follows them across devices.
 *
 * Fails CLOSED. A lookup that errors, times out or returns something
 * unparseable yields Sanctuary with source `resolution-failed`, never standard
 * memory — and the source is preserved so the caller can tell a failure from a
 * member who actually chose privacy.
 */
export async function resolveAccountDefaultSanctuary(
  memberId?: string | null,
): Promise<{ sanctuary: boolean; source: SanctuaryInitSource }> {
  if (memberId) {
    try {
      const res = await fetch(`/api/members/settings?memberId=${encodeURIComponent(memberId)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`settings lookup ${res.status}`);
      const data = await res.json();
      const mode = data?.maia?.defaultMemoryMode;
      if (mode !== 'sanctuary' && mode !== 'continuity') {
        throw new Error(`unrecognized defaultMemoryMode: ${String(mode)}`);
      }
      return { sanctuary: mode === 'sanctuary', source: 'account-server' };
    } catch (err) {
      console.warn(
        '[Sanctuary] Preference resolution FAILED — failing closed to Sanctuary. ' +
          'This is not a member selection.',
        err,
      );
      return { sanctuary: true, source: 'resolution-failed' };
    }
  }

  // No member id: nobody to look up. This is a known state, not a failure, so
  // it does not fail closed — it reads the browser's own account settings.
  try {
    const { getAccountSettings } = await import('./accountSettings');
    return {
      sanctuary: getAccountSettings().defaultMemoryMode === 'sanctuary',
      source: 'account-local',
    };
  } catch (err) {
    console.warn('[Sanctuary] Local account settings unreadable — failing closed.', err);
    return { sanctuary: true, source: 'resolution-failed' };
  }
}

/**
 * Resolve the Sanctuary state a mounting conversation should use.
 *
 * An existing conversation restores what it became and is NEVER re-seeded — so
 * changing the account default cannot reach behind a member into a conversation
 * they are already having. Only a conversation with no state of its own is
 * seeded from the account default, and the seed is recorded immediately so the
 * next mount restores rather than re-resolves.
 */
export async function resolveInitialSanctuary(
  memberId?: string | null,
): Promise<SanctuaryResolution> {
  const conversationId = getConversationId();

  const existing = readConversationSanctuary(conversationId);
  if (existing !== null) {
    return {
      state: existing ? 'sanctuary' : 'standard',
      sanctuary: existing,
      source: 'conversation',
      conversationId,
    };
  }

  const { sanctuary, source } = await resolveAccountDefaultSanctuary(memberId);
  writeConversationSanctuary(conversationId, sanctuary);
  return { state: sanctuary ? 'sanctuary' : 'standard', sanctuary, source, conversationId };
}

/**
 * May a retention-bearing turn be dispatched yet?
 *
 * While `resolving` we do not know whether this conversation is private, and
 * sending anyway is the exact failure this unit exists to prevent.
 */
export function mayDispatch(state: SanctuaryInitState): boolean {
  return state !== 'resolving';
}
