// LISTEN-01 · client side of the gated Sound Studio media tickets, used only by the native iOS shell,
// whose <audio> cannot send the session header or cookie. The web keeps the plain session path.
//
// Three rules this module carries:
// 1. A ticket is fetched BEFORE the play gesture. At play time the player asks `freshUrl()`, which is
//    synchronous; it never awaits a network call between the member's tap and `play()`.
// 2. A ticket expires (15 min) long before a 49–60 minute Night Ground file ends, so a playing source
//    is refreshed at about 10 minutes and swapped in at the same position.
// 3. A refresh may keep playing what is already playing. It never starts sound after Stop, Pause,
//    an interruption or MAIA speech: `refreshMaySwap()` is the single test for that.

/** Refresh a loaded source this long after its ticket was issued. */
export const TICKET_REFRESH_AFTER_MS = 10 * 60 * 1000;
/** A cached ticket with less than this left is not used to start or resume sound. */
export const TICKET_MIN_REMAINING_MS = 3 * 60 * 1000;
/** The ticket route accepts 1–4 paths per request. */
const MAX_PATHS_PER_REQUEST = 4;

export interface MediaTicket { path: string; url: string; expiresAt: number }
type Entry = { url: string; expiresAtMs: number; fetchedAtMs: number };

export interface MediaTicketCacheOptions {
  /** POSTs {paths} to /api/listen/media-ticket with the session header and returns the tickets. */
  fetchTickets: (paths: string[]) => Promise<MediaTicket[]>;
  /** Turns the route's relative ticket URL into one the audio element can load from the native shell. */
  absolute?: (url: string) => string;
  now?: () => number;
}

export interface MediaTicketCache {
  /** Fetch tickets for paths that have none fresh. With `force`, fetch all of them anew. */
  prefetch: (paths: readonly string[], force?: boolean) => Promise<void>;
  /** Synchronous: a ticket URL with enough time left to start from, or null. */
  freshUrl: (path: string) => string | null;
  /** Milliseconds until the source for `path` should be refreshed (0 when it already should be). */
  refreshDelayMs: (path: string) => number;
  clear: () => void;
}

export function createMediaTicketCache(options: MediaTicketCacheOptions): MediaTicketCache {
  const now = options.now ?? (() => Date.now());
  const absolute = options.absolute ?? (url => url);
  const entries = new Map<string, Entry>();
  const inflight = new Map<string, Promise<void>>();

  const fresh = (path: string): Entry | null => {
    const entry = entries.get(path);
    return entry && entry.expiresAtMs - now() > TICKET_MIN_REMAINING_MS ? entry : null;
  };

  const fetchBatch = async (batch: string[]) => {
    const fetchedAtMs = now();
    const tickets = await options.fetchTickets(batch);
    for (const ticket of tickets) {
      if (!batch.includes(ticket.path) || typeof ticket.url !== 'string') continue;
      entries.set(ticket.path, { url: absolute(ticket.url), expiresAtMs: ticket.expiresAt * 1000, fetchedAtMs });
    }
  };

  return {
    async prefetch(paths, force = false) {
      const unique = [...new Set(paths.filter(Boolean))];
      const waiting: Promise<void>[] = [];
      const wanted: string[] = [];
      for (const path of unique) {
        const pending = inflight.get(path);
        if (pending) waiting.push(pending);
        else if (force || !fresh(path)) wanted.push(path);
      }
      for (let i = 0; i < wanted.length; i += MAX_PATHS_PER_REQUEST) {
        const batch = wanted.slice(i, i + MAX_PATHS_PER_REQUEST);
        const request = fetchBatch(batch).catch(() => undefined)
          .finally(() => { for (const path of batch) inflight.delete(path); });
        for (const path of batch) inflight.set(path, request);
        waiting.push(request);
      }
      await Promise.all(waiting);
    },
    freshUrl(path) {
      return fresh(path)?.url ?? null;
    },
    refreshDelayMs(path) {
      const entry = entries.get(path);
      if (!entry) return 0;
      const byAge = entry.fetchedAtMs + TICKET_REFRESH_AFTER_MS - now();
      const byExpiry = entry.expiresAtMs - TICKET_MIN_REMAINING_MS - now();
      return Math.max(0, Math.min(byAge, byExpiry));
    },
    clear() { entries.clear(); inflight.clear(); },
  };
}

/** The file path an audio element's src points at, with any ticket query removed. */
export function sourcePathOf(src: string | null | undefined): string | null {
  if (!src) return null;
  try { return new URL(src, 'http://local.invalid').pathname; } catch { return null; }
}

/**
 * May a finished ticket refresh swap the source and keep playing? Only if nothing the member or MAIA did
 * happened while the refresh was in flight, and the sound was playing when it began. Never otherwise.
 */
export function refreshMaySwap(state: {
  generationAtStart: number;
  generationNow: number;
  wasPlaying: boolean;
  pausedNow: boolean;
  maiaSpeaking: boolean;
  samePath: boolean;
}): boolean {
  return state.generationAtStart === state.generationNow && state.wasPlaying && !state.pausedNow &&
    !state.maiaSpeaking && state.samePath;
}
