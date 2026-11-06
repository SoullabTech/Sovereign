/** LISTEN-01 · Listening Room — "Listen to someone": the performer catalog and its fail-closed gate.
 *
 * A performer card is a POINTER to music that already lives on the performer's own platform.
 * Soullab hosts no audio or video, copies no provider metadata or artwork, and never treats a
 * provider's metadata as a licence (AUDIO-PLATFORM-01 canon; LISTEN-01 #1979 §4: unknown rights
 * => not shown). Nothing here is evidence of consent, rights or endorsement. This is only the gate
 * a SIGNED-OFF entry must pass before it is shown, and every failure HIDES the entry.
 *
 * The shipped catalog is EMPTY (performerCatalogData.ts). Adding an entry is a named human
 * signer's act, never a code convenience. Claude and JARVIS prepare entries and never sign them.
 *
 * Erasable TypeScript only (no enums / parameter properties): the review tests run this file under
 * Node's type stripping.
 */

export type PerformerProvider = 'youtube' | 'spotify';
export type LinkKind = 'youtube' | 'spotify' | 'tidal' | 'apple-music' | 'bandcamp' | 'soundcloud' | 'site';

export interface PerformerLink { kind: LinkKind; url: string }
export interface PerformerEmbed { provider: PerformerProvider; ref: string }
export interface PerformerRights {
  /** The only admitted value: Soullab points to provider-hosted media and hosts none. */
  hosting: 'provider-hosted-pointer';
  /** The platform allowed embedding when last checked. */
  embedPermitted: boolean;
  embedCheckedOn: string;
  /** The entry is HIDDEN after this date until it is re-checked and re-signed. */
  nextCheckBy: string;
  /** A named human. Never an assistant, a placeholder or a system. */
  signedOffBy: string;
  signedOffOn: string;
  /** Sacred or lineage-held music is never a Tier 1 spotlight (needs the keepers' participation). */
  lineageHeld: boolean;
}
export interface PerformerTierTwo {
  /** Date the performer's one-time grant was received. */
  grantOnFile: string;
  /** The performer's own words, shown as theirs and attributed. */
  ownIntroduction: string;
  /** Required when the music is lineage-held: how its keepers take part. */
  keepersParticipation?: string;
}
export interface PerformerEntry {
  id: string;
  /** S1 admits Soullab's choices only; the Members shelf is a later slice. */
  shelf: 'picks';
  /** Credited as the performer credits themselves. */
  name: string;
  /** Soullab's own words — never copied provider text. */
  ownWords: string;
  links: ReadonlyArray<PerformerLink>;
  embed?: PerformerEmbed;
  rights: PerformerRights;
  tierTwo?: PerformerTierTwo;
}

export interface RuleContext { today: string }
export interface PerformerRule { id: string; check: (raw: unknown, ctx: RuleContext) => string[] }
export type PerformerVerdict = { ok: true; entry: PerformerEntry } | { ok: false; reasons: string[] };

export const MAX_OWN_WORDS = 280;
export const MAX_INTRODUCTION = 600;
/** Ceiling only: the signer may set a tighter next-check date. */
export const MAX_CHECK_WINDOW_DAYS = 366;

// ---------------------------------------------------------------- helpers

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function isoDay(v: unknown): boolean {
  if (typeof v !== 'string' || !ISO_DAY.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
const dayNumber = (v: string): number => {
  const [y, m, d] = v.split('-').map(Number) as [number, number, number];
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
};
export function todayUtc(now: Date): string {
  return now.toISOString().slice(0, 10);
}

const ENTRY_KEYS = ['id', 'shelf', 'name', 'ownWords', 'links', 'embed', 'rights', 'tierTwo'];
const RIGHTS_KEYS = ['hosting', 'embedPermitted', 'embedCheckedOn', 'nextCheckBy', 'signedOffBy', 'signedOffOn', 'lineageHeld'];
const TIER_TWO_KEYS = ['grantOnFile', 'ownIntroduction', 'keepersParticipation'];
const LINK_KEYS = ['kind', 'url'];
const EMBED_KEYS = ['provider', 'ref'];

function unknownKeys(o: Obj, allowed: string[], where: string): string[] {
  return Object.keys(o).filter(k => !allowed.includes(k)).map(k => `unknown-field:${where}${k}`);
}

const NOT_A_PERSON = new Set(['tbd', 'todo', 'pending', 'n/a', 'na', 'none', 'unknown', 'claude', 'jarvis',
  'ai', 'assistant', 'system', 'bot', 'automated', 'test', 'admin']);

const LINK_HOSTS: Record<Exclude<LinkKind, 'bandcamp' | 'site'>, ReadonlyArray<string>> = {
  youtube: ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'],
  spotify: ['open.spotify.com'],
  tidal: ['tidal.com', 'listen.tidal.com'],
  'apple-music': ['music.apple.com'],
  soundcloud: ['soundcloud.com', 'www.soundcloud.com'],
};
const PROVIDER_HOSTS = ['youtube.com', 'youtu.be', 'spotify.com', 'tidal.com', 'apple.com', 'soundcloud.com', 'bandcamp.com'];

function hostOk(kind: string, host: string): boolean {
  if (kind === 'bandcamp') return host === 'bandcamp.com' || host.endsWith('.bandcamp.com');
  if (kind === 'site') {
    // A performer's own site: a real, dotted host that is not an IP literal or a provider host.
    if (!host.includes('.') || /^[\d.]+$/.test(host) || host.includes(':')) return false;
    return !PROVIDER_HOSTS.some(p => host === p || host.endsWith(`.${p}`));
  }
  const allowed = (LINK_HOSTS as Record<string, ReadonlyArray<string>>)[kind];
  return !!allowed && allowed.includes(host);
}

/** Claims Soullab must never make in its own voice. A LINT, not a judgment: a false positive
 * hides the entry and the signer rewrites the sentence. */
const CLAIM_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['healing', /\bheal(s|ed|ing|er)?\b/i],
  ['cure', /\bcure[sd]?\b/i],
  ['therapy', /\btherap(y|ies|eutic|ist)\b/i],
  ['treatment', /\btreat(s|ed|ing|ment)\b/i],
  ['condition', /\b(anxiet(y|ies)|depress(ion|ed|ive)|trauma(s|tic)?|ptsd|insomnia|adhd)\b/i],
  ['detox', /\bdetox(es|ify|ification)?\b/i],
  ['stress-relief', /\bstress[- ]relief\b/i],
  ['medical', /\b(medical(ly)?|clinical(ly)?|diagnos(e|is|ed))\b/i],
  ['outcome', /\bwill (make|help) you (feel|sleep|relax|heal|focus)\b/i],
  ['guarantee', /\bguarantee[sd]?\b/i],
  ['affiliation', /\b(official|partner(s|ed|ship)?|endorse[sd]?|sponsored by|in partnership|featured)\b/i],
  ['ranking', /\b(trending|most[- ]popular|top[- ]rated|best[- ]selling|number one|#1)\b/i],
];
export function performerClaimLint(text: string): string[] {
  return CLAIM_PATTERNS.filter(([, re]) => re.test(text)).map(([label]) => label);
}

// ---------------------------------------------------------------- rules (one decision each)

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const SPOTIFY_URI = /^spotify:(track|album|playlist|artist|episode|show):[A-Za-z0-9]{22}$/;

export const PERFORMER_RULES: ReadonlyArray<PerformerRule> = [
  { id: 'shape', check: raw => (isObj(raw) ? [] : ['not-an-object']) },
  {
    id: 'no-provider-metadata',
    check: raw => {
      if (!isObj(raw)) return [];
      const out = unknownKeys(raw, ENTRY_KEYS, '');
      if (isObj(raw.rights)) out.push(...unknownKeys(raw.rights, RIGHTS_KEYS, 'rights.'));
      if (isObj(raw.tierTwo)) out.push(...unknownKeys(raw.tierTwo, TIER_TWO_KEYS, 'tierTwo.'));
      if (isObj(raw.embed)) out.push(...unknownKeys(raw.embed, EMBED_KEYS, 'embed.'));
      if (Array.isArray(raw.links)) raw.links.forEach(l => { if (isObj(l)) out.push(...unknownKeys(l, LINK_KEYS, 'links.')); });
      return out;
    },
  },
  {
    id: 'id',
    check: raw => (isObj(raw) && /^[a-z0-9][a-z0-9-]{1,63}$/.test(str(raw.id)) ? [] : ['id-invalid']),
  },
  { id: 'shelf', check: raw => (isObj(raw) && raw.shelf === 'picks' ? [] : ['shelf-not-admitted']) },
  {
    id: 'credit-name',
    check: raw => {
      if (!isObj(raw)) return [];
      const n = str(raw.name).trim();
      return n.length >= 1 && n.length <= 120 && !CONTROL.test(n) ? [] : ['name-invalid'];
    },
  },
  {
    id: 'own-words',
    check: raw => {
      if (!isObj(raw)) return [];
      const t = str(raw.ownWords).trim();
      if (!t) return ['own-words-missing'];
      const out: string[] = [];
      if (t.length > MAX_OWN_WORDS) out.push('own-words-too-long');
      if (CONTROL.test(t)) out.push('own-words-control-characters');
      return out;
    },
  },
  {
    id: 'no-claims-in-our-voice',
    check: raw => (isObj(raw) ? performerClaimLint(str(raw.ownWords)).map(c => `own-words-claim:${c}`) : []),
  },
  {
    id: 'links',
    check: raw => {
      if (!isObj(raw)) return [];
      if (!Array.isArray(raw.links) || raw.links.length === 0) return ['links-missing'];
      const out: string[] = [];
      raw.links.forEach(l => {
        if (!isObj(l)) { out.push('link-invalid'); return; }
        const kind = str(l.kind);
        let ok = false;
        try {
          const u = new URL(str(l.url));
          ok = u.protocol === 'https:' && !u.username && !u.password && u.port === '' &&
            hostOk(kind, u.hostname.toLowerCase());
        } catch { ok = false; }
        if (!ok) out.push(`link-invalid:${kind || 'unknown'}`);
      });
      return out;
    },
  },
  {
    id: 'embed-shape',
    check: raw => {
      if (!isObj(raw) || raw.embed === undefined) return [];
      if (!isObj(raw.embed)) return ['embed-invalid'];
      const { provider, ref } = raw.embed;
      if (provider === 'youtube' && typeof ref === 'string' && YT_ID.test(ref)) return [];
      if (provider === 'spotify' && typeof ref === 'string' && SPOTIFY_URI.test(ref)) return [];
      return ['embed-invalid'];
    },
  },
  {
    id: 'rights-present',
    check: raw => (isObj(raw) && isObj(raw.rights) ? [] : ['rights-missing']),
  },
  {
    id: 'pointer-only',
    check: raw => (isObj(raw) && isObj(raw.rights) && raw.rights.hosting === 'provider-hosted-pointer' ? [] : ['hosting-not-pointer']),
  },
  {
    id: 'embed-needs-permission',
    check: raw => (isObj(raw) && raw.embed !== undefined && !(isObj(raw.rights) && raw.rights.embedPermitted === true)
      ? ['embed-not-permitted'] : []),
  },
  {
    id: 'named-human-signer',
    check: raw => {
      if (!isObj(raw) || !isObj(raw.rights)) return [];
      const s = str(raw.rights.signedOffBy).trim();
      if (s.length < 3 || CONTROL.test(s) || NOT_A_PERSON.has(s.toLowerCase())) return ['signer-not-a-named-human'];
      return [];
    },
  },
  {
    id: 'dates-valid',
    check: raw => {
      if (!isObj(raw) || !isObj(raw.rights)) return [];
      const r = raw.rights;
      const out: string[] = [];
      if (!isoDay(r.signedOffOn)) out.push('signoff-date-invalid');
      if (!isoDay(r.embedCheckedOn)) out.push('embed-check-date-invalid');
      if (!isoDay(r.nextCheckBy)) out.push('next-check-date-invalid');
      return out;
    },
  },
  {
    id: 'not-from-the-future',
    check: (raw, ctx) => {
      if (!isObj(raw) || !isObj(raw.rights)) return [];
      const r = raw.rights;
      const out: string[] = [];
      if (isoDay(r.signedOffOn) && dayNumber(r.signedOffOn as string) > dayNumber(ctx.today)) out.push('signoff-in-future');
      if (isoDay(r.embedCheckedOn) && dayNumber(r.embedCheckedOn as string) > dayNumber(ctx.today)) out.push('embed-check-in-future');
      return out;
    },
  },
  {
    id: 'check-not-overdue',
    check: (raw, ctx) => {
      if (!isObj(raw) || !isObj(raw.rights)) return [];
      const n = raw.rights.nextCheckBy;
      return isoDay(n) && dayNumber(n as string) < dayNumber(ctx.today) ? ['check-overdue'] : [];
    },
  },
  {
    id: 'check-window',
    check: raw => {
      if (!isObj(raw) || !isObj(raw.rights)) return [];
      const { embedCheckedOn: c, nextCheckBy: n } = raw.rights;
      if (!isoDay(c) || !isoDay(n)) return [];
      const span = dayNumber(n as string) - dayNumber(c as string);
      if (span <= 0) return ['check-order'];
      return span > MAX_CHECK_WINDOW_DAYS ? ['check-window-too-long'] : [];
    },
  },
  {
    id: 'lineage-needs-keepers',
    check: raw => {
      if (!isObj(raw) || !isObj(raw.rights) || raw.rights.lineageHeld !== true) return [];
      const t = isObj(raw.tierTwo) ? raw.tierTwo : null;
      return t && str(t.keepersParticipation).trim() ? [] : ['lineage-held-needs-keepers'];
    },
  },
  {
    id: 'tier-two-grant',
    check: raw => {
      if (!isObj(raw) || raw.tierTwo === undefined) return [];
      if (!isObj(raw.tierTwo)) return ['tier-two-invalid'];
      const t = raw.tierTwo;
      const out: string[] = [];
      if (!isoDay(t.grantOnFile)) out.push('grant-date-invalid');
      const intro = str(t.ownIntroduction).trim();
      if (!intro) out.push('introduction-missing');
      if (intro.length > MAX_INTRODUCTION) out.push('introduction-too-long');
      if (CONTROL.test(intro)) out.push('introduction-control-characters');
      return out;
    },
  },
];

// ---------------------------------------------------------------- gate

/** Run an explicit rule list (the reference list, or a candidate's list in the lethality matrix). */
export function validateWith(rules: ReadonlyArray<PerformerRule>, raw: unknown, now: Date): PerformerVerdict {
  const ctx: RuleContext = { today: todayUtc(now) };
  const reasons: string[] = [];
  for (const rule of rules) {
    try { reasons.push(...rule.check(raw, ctx)); }
    catch { reasons.push(`rule-error:${rule.id}`); } // a rule that cannot run refuses
  }
  return reasons.length === 0 ? { ok: true, entry: raw as PerformerEntry } : { ok: false, reasons };
}

export function validatePerformerEntry(raw: unknown, now: Date): PerformerVerdict {
  return validateWith(PERFORMER_RULES, raw, now);
}

export interface CatalogReport {
  visible: PerformerEntry[];
  rejected: { id: string; reasons: string[] }[];
}

/** Everything that fails, or that is not an array, or that repeats an id, is hidden. */
export function visiblePerformers(catalog: unknown, now: Date): CatalogReport {
  const report: CatalogReport = { visible: [], rejected: [] };
  if (!Array.isArray(catalog)) return report;
  const seen = new Set<string>();
  catalog.forEach((raw, i) => {
    const id = isObj(raw) && typeof raw.id === 'string' ? raw.id : `#${i}`;
    const verdict = validatePerformerEntry(raw, now);
    if (!verdict.ok) { report.rejected.push({ id, reasons: verdict.reasons }); return; }
    if (seen.has(id)) { report.rejected.push({ id, reasons: ['duplicate-id'] }); return; }
    seen.add(id);
    report.visible.push(verdict.entry);
  });
  return report;
}
