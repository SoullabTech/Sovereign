/**
 * Transit report parser — DATA ONLY.
 *
 * Extracts the astronomical facts from a professional 12-month transit report
 * (Astrograph / Henry Seltzer format): transiting body, aspect type, natal
 * point, begin/end dates, exact dates (including retrograde passes), and house
 * ingresses. NOTHING ELSE.
 *
 * HARD CONSTRAINT (constitutional + legal): the report's interpretive prose is
 * copyright Henry Seltzer / Astrograph. It must never be copied, closely
 * paraphrased, or passed to a model — not even as style reference. This parser
 * enforces that boundary STRUCTURALLY: it recognizes only transit-header lines
 * and the date lines immediately following them; every other line is discarded
 * unread. The raw report text must never be persisted or forwarded — only the
 * ParsedTransit facts leave this module. Precedent: portraits/andrea.ts
 * ("DATA only; all prose written fresh").
 */

export interface ExactPass {
  /** Raw date string as printed in the report, e.g. "April 2, 2026". */
  date: string;
  /** True when the report marks this pass as a retrograde pass. */
  retrograde: boolean;
}

export interface ParsedTransit {
  /** 1-based ID used to cite this transit in prompts and validate references. */
  id: number;
  kind: 'aspect' | 'ingress';
  /** Transiting body, e.g. "Pluto". */
  body: string;
  /** Aspect type for kind 'aspect', e.g. "opposition", "trine", "conjunction". */
  aspect?: string;
  /** Natal point for kind 'aspect', e.g. "Jupiter", "Midheaven", "North Node". */
  natalPoint?: string;
  /** House number 1–12 for kind 'ingress'. */
  house?: number;
  /** Period begin/end as printed, when the report gives a range. */
  beginDate?: string;
  endDate?: string;
  /** Exact dates, in report order, including retrograde passes. */
  exactDates: ExactPass[];
}

export interface ParsedTransitReport {
  transits: ParsedTransit[];
  /** Non-fatal notes, e.g. a header line with no parseable dates. */
  warnings: string[];
}

// Full names first so the alternation prefers "September" over "Sep(t)".
const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December|' +
  'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec';
/** "April 2, 2026" · "April 2nd 2026" · "2 April 2026" · "Apr. 2, 2026" */
const DATE_RE = new RegExp(
  `(?:\\b(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\.?),?\\s+\\d{4}`,
  'gi',
);

const ASPECTS: Record<string, string> = {
  conjunction: 'conjunction',
  conjunct: 'conjunction',
  opposition: 'opposition',
  opposite: 'opposition',
  trine: 'trine',
  square: 'square',
  sextile: 'sextile',
  quincunx: 'quincunx',
  inconjunct: 'quincunx',
  'semi-square': 'semi-square',
  semisquare: 'semi-square',
  'semi-sextile': 'semi-sextile',
  semisextile: 'semi-sextile',
  sesquiquadrate: 'sesquiquadrate',
  'sesqui-square': 'sesquiquadrate',
  sesquisquare: 'sesquiquadrate',
};

const HOUSES: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '6th': 6,
  '7th': 7, '8th': 8, '9th': 9, '10th': 10, '11th': 11, '12th': 12,
};

const HOUSE_ORDINAL: Record<number, string> = {
  1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth',
  7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth', 11: 'Eleventh', 12: 'Twelfth',
};

/**
 * "Transiting Pluto in opposition with natal Jupiter" (with/to · natal optional).
 * End anchor tolerates ONLY a trailing ":" and/or a parenthesized date range
 * ("… natal Jupiter (May 1, 2026 - December 3, 2026)") — the same tolerance
 * INGRESS_HEADER_RE already has. The parenthetical must contain a month name so
 * arbitrary trailing prose still fails the anchor (copyright boundary).
 */
const ASPECT_HEADER_RE = new RegExp(
  `^\\s*Transiting\\s+([A-Za-z][A-Za-z ]{1,20}?)\\s+in\\s+(${Object.keys(ASPECTS).join('|')})\\s+(?:with|to)\\s+(?:your\\s+)?(?:natal\\s+)?([A-Za-z][A-Za-z -]{1,20}?)\\s*:?\\s*(\\([^()]*\\b(?:${MONTHS})\\.?[^()]*\\))?\\s*:?\\s*$`,
  'i',
);

/** "Transiting Jupiter enters your Twelfth House" / "... entering the 12th House" */
const INGRESS_HEADER_RE = new RegExp(
  `^\\s*Transiting\\s+([A-Za-z][A-Za-z ]{1,20}?)\\s+enter(?:s|ing)?\\s+(?:your\\s+|the\\s+)?(${Object.keys(HOUSES).join('|')})\\s+House\\b.*$`,
  'i',
);

function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Does this line carry only period/exactness data (never interpretation)? */
function isDateLine(line: string): boolean {
  const s = line.trim();
  if (!s || s.length > 220) return false;
  DATE_RE.lastIndex = 0;
  if (!DATE_RE.test(s)) return false;
  // Strip every date + the connective vocabulary a data line is made of; if
  // anything substantial remains, the line is prose and must be discarded.
  const residue = s
    .replace(new RegExp(DATE_RE.source, 'gi'), ' ')
    .replace(
      /\b(this\s+transit\s+is|in\s+effect|from|until|to|through|and|again|on|exact|exactly|peak(?:s|ing)?|retrograde|direct|stationary|entering\s+retrogradation|R|Rx)\b/gi,
      ' ',
    )
    .replace(/[–—\-,.;:()·]/g, ' ')
    .replace(/\d{1,2}:\d{2}\s*(?:AM|PM)?/gi, ' ')
    .trim();
  return residue.split(/\s+/).filter(Boolean).length <= 2;
}

function extractDates(line: string): string[] {
  DATE_RE.lastIndex = 0;
  return (line.match(DATE_RE) || []).map((d) => d.replace(/\s+/g, ' ').trim());
}

/** Attach a data line's dates to the transit (range first, then exact passes). */
function attachDates(t: ParsedTransit, line: string): void {
  const isExact = /\bexact|\bagain\b|\bpeak/i.test(line);
  const dates = extractDates(line);
  if (dates.length === 0) return;

  if (!isExact && !t.beginDate && /until|through|\bto\b|[–—]|\s-\s/i.test(line) && dates.length >= 2) {
    t.beginDate = dates[0];
    t.endDate = dates[dates.length - 1];
    return;
  }
  if (!isExact && !t.beginDate && dates.length === 1 && t.kind === 'ingress') {
    t.beginDate = dates[0];
    return;
  }
  // Exact passes: attribute each retrograde marker to its date by position.
  // A marker between two dates is a suffix of the earlier date when it comes
  // before the separator ("Sep 8, 2026 (R), and…"), otherwise a prefix of the
  // later one ("…, and again (R) Sep 8, 2026").
  const RETRO = /\bretrograde\b|\(\s*Rx?\s*\)|\bRx\b/i;
  const matches = [...line.matchAll(new RegExp(DATE_RE.source, 'gi'))];
  const retro = matches.map(() => false);
  for (let i = 0; i <= matches.length; i++) {
    const gapStart = i === 0 ? 0 : matches[i - 1].index! + matches[i - 1][0].length;
    const gapEnd = i < matches.length ? matches[i].index! : line.length;
    const gap = line.slice(gapStart, gapEnd);
    const m = gap.match(RETRO);
    if (!m || matches.length === 0) continue;
    if (i === 0) retro[0] = true;
    else if (i === matches.length) retro[i - 1] = true;
    else {
      const sep = gap.search(/,|\band\b/i);
      if (sep !== -1 && (m.index ?? 0) < sep) retro[i - 1] = true;
      else retro[i] = true;
    }
  }
  matches.forEach((m, i) => {
    t.exactDates.push({ date: m[0].replace(/\s+/g, ' ').trim(), retrograde: retro[i] });
  });
}

/**
 * Parse a pasted transit report into transit FACTS. All interpretive prose is
 * discarded unread — only header lines and their immediate date lines are kept.
 */
export function parseTransitReport(text: string): ParsedTransitReport {
  const transits: ParsedTransit[] = [];
  const warnings: string[] = [];
  const lines = (text || '').split(/\r?\n/);

  let current: ParsedTransit | null = null;
  let collecting = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue; // blank lines never end date collection (PDF paste artifacts)

    const aspect = line.match(ASPECT_HEADER_RE);
    const ingress = aspect ? null : line.match(INGRESS_HEADER_RE);

    if (aspect || ingress) {
      if (current && !current.beginDate && current.exactDates.length === 0) {
        warnings.push(`No dates found for: ${describeTransit(current)}`);
      }
      current = aspect
        ? {
            id: transits.length + 1,
            kind: 'aspect',
            body: titleCase(aspect[1]),
            aspect: ASPECTS[aspect[2].toLowerCase()],
            natalPoint: titleCase(aspect[3]),
            exactDates: [],
          }
        : {
            id: transits.length + 1,
            kind: 'ingress',
            body: titleCase(ingress![1]),
            house: HOUSES[ingress![2].toLowerCase()],
            exactDates: [],
          };
      transits.push(current);
      // An inline parenthesized period on the header line ("(May 1, 2026 -
      // December 3, 2026)") carries dates for this transit itself.
      if (aspect?.[4]) attachDates(current, aspect[4]);
      collecting = true;
      continue;
    }

    if (collecting && current && isDateLine(line)) {
      attachDates(current, line);
      continue;
    }
    // Anything else is interpretation — discarded unread, and it closes the
    // date-collection window so later in-prose dates can never attach.
    collecting = false;
  }

  if (current && !current.beginDate && current.exactDates.length === 0) {
    warnings.push(`No dates found for: ${describeTransit(current)}`);
  }
  return { transits, warnings };
}

// ── Deterministic rendering (the only source of phase `transits[]` strings) ──

const ASPECT_PHRASE: Record<string, (natal: string) => string> = {
  conjunction: (n) => `conjunct your ${n}`,
  opposition: (n) => `opposite your ${n}`,
  trine: (n) => `in trine with your ${n}`,
  square: (n) => `in square with your ${n}`,
  sextile: (n) => `in sextile with your ${n}`,
  quincunx: (n) => `in quincunx with your ${n}`,
  'semi-square': (n) => `in semi-square with your ${n}`,
  'semi-sextile': (n) => `in semi-sextile with your ${n}`,
  sesquiquadrate: (n) => `in sesquiquadrate with your ${n}`,
};

/**
 * The human-readable transit line used in YearAheadPhase.transits[] — always
 * rendered from parsed DATA in code, never authored by the model, so a phase
 * can only ever cite a transit that exists in the report.
 */
export function describeTransit(t: ParsedTransit): string {
  if (t.kind === 'ingress') {
    return `${t.body} entering your ${HOUSE_ORDINAL[t.house || 0] || `${t.house}th`} House`;
  }
  if (t.aspect === 'conjunction' && t.natalPoint === t.body) {
    return `${t.body} returning to your ${t.natalPoint}`;
  }
  const phrase = ASPECT_PHRASE[t.aspect || ''] || ((n: string) => `in aspect with your ${n}`);
  return `${t.body} ${phrase(t.natalPoint || '')}`;
}

/** Compact factual line for the prompt: what + when, nothing interpretive. */
function transitFactLine(t: ParsedTransit): string {
  const what =
    t.kind === 'ingress'
      ? `${t.body} enters natal ${HOUSE_ORDINAL[t.house || 0] || t.house} House`
      : `${t.body} ${t.aspect} natal ${t.natalPoint}`;
  const parts: string[] = [];
  if (t.beginDate && t.endDate) parts.push(`in effect ${t.beginDate} – ${t.endDate}`);
  else if (t.beginDate) parts.push(`from ${t.beginDate}`);
  if (t.exactDates.length) {
    parts.push(
      `exact ${t.exactDates.map((e) => (e.retrograde ? `${e.date} (retrograde pass)` : e.date)).join(', ')}`,
    );
  }
  return `T${t.id}. ${what}${parts.length ? ` — ${parts.join('; ')}` : ''}`;
}

/** The numbered transit-data block given to the model. DATA only. */
export function transitDataText(transits: ParsedTransit[]): string {
  return transits.map(transitFactLine).join('\n');
}

/** "March 2026 – February 2027" derived from the parsed dates, when parseable. */
export function deriveTimeframe(transits: ParsedTransit[]): string | undefined {
  const stamps: number[] = [];
  for (const t of transits) {
    for (const d of [t.beginDate, t.endDate, ...t.exactDates.map((e) => e.date)]) {
      if (!d) continue;
      const ms = Date.parse(d.replace(/(\d{1,2})(st|nd|rd|th)/i, '$1'));
      if (!Number.isNaN(ms)) stamps.push(ms);
    }
  }
  if (stamps.length < 2) return undefined;
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const from = fmt(Math.min(...stamps));
  const to = fmt(Math.max(...stamps));
  return from === to ? from : `${from} – ${to}`;
}
