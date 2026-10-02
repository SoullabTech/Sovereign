/** Public editorial context only. No member identity, private content or model input. */
export interface PassingQuote {
  readonly id: string;
  readonly kind: 'quote';
  readonly audience: 'public';
  readonly text: string;
  readonly author: string;
  readonly work: string;
  readonly locator: string;
  readonly sourceUrl: string;
  readonly verifiedOn: string;
  readonly displayFrom: string;
  readonly displayUntil: string;
}
const keys = ['id', 'kind', 'audience', 'text', 'author', 'work', 'locator',
  'sourceUrl', 'verifiedOn', 'displayFrom', 'displayUntil'] as const;
const allowedKeys = new Set<string>(keys);
const sourceHosts = new Set(['www.gutenberg.org', 'poets.org']);
const DAY = 86_400_000;
const FIRST_DAY = Date.UTC(2026, 8, 25) / DAY;
function utcDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
}
function admit(raw: unknown, now: number): PassingQuote | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (Object.keys(record).some(k => !allowedKeys.has(k))) return null;
  if (keys.some(k => typeof record[k] !== 'string' || !(record[k] as string).trim())) return null;
  if (record.kind !== 'quote' || record.audience !== 'public') return null;
  // Every field is now present, nonempty and public. Additional fields were refused.
  const item = record as unknown as PassingQuote;
  if (item.text.length > 320) return null;
  try {
    const url = new URL(item.sourceUrl);
    if (url.protocol !== 'https:' || !sourceHosts.has(url.hostname) || url.username || url.password) return null;
  } catch { return null; }
  const verified = utcDay(item.verifiedOn), from = utcDay(item.displayFrom), until = utcDay(item.displayUntil);
  if (![verified, from, until].every(Number.isFinite) || verified > now || from > now || until <= now || until <= from) return null;
  return { ...item };
}
/** Stable shared UTC-day choice. Display-window expiry is not a judgment that words became false. */
export function selectPassingQuote(candidates: readonly unknown[], now: Date, enabled = true): PassingQuote | null {
  const time = now.getTime();
  if (!enabled || !Number.isFinite(time)) return null;
  const eligible = candidates.map(raw => admit(raw, time)).filter((q): q is PassingQuote => q !== null);
  if (!eligible.length || new Set(eligible.map(q => q.id)).size !== eligible.length) return null;
  const day = Math.floor(time / DAY) - FIRST_DAY;
  return eligible[((day % eligible.length) + eligible.length) % eligible.length] ?? null;
}
