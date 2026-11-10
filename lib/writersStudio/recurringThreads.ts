/**
 * WS-DEVELOP-STUDIO · M3 — what RECURS across a book's chapters. Counted, never interpreted.
 *
 * A thread here is a word that appears in more than one chapter and is not so common that it carries no information. That is all it claims.
 * ⛔ It is not MAIA's reading, not a theme, not a claim about meaning: the stage labels it "words that recur (counted, not interpreted)".
 * Pure, deterministic, no model, no network, no storage. The writer's own words in, the writer's own words out.
 */

const STOP = new Set((
  'about above after again against almost along already also although always among another because been before being below between both could did does doing down during each ' +
  'either else even ever every from further have having here hers herself himself his how however into itself just least less like made make many might more most much must ' +
  'myself never next none nor not nothing now once only onto other others ought our ours ourselves out over own perhaps rather said same should since some something still such ' +
  'than that their theirs them themselves then there these they this those though through thus too toward under until upon very want was were what when where whether which while ' +
  'who whom whose will with within without would yet you your yours yourself yourselves she her him its and the for but are can had has not one two three also came come went ' +
  'back around away came know known knew than then them there they thing things think thought told took turned used way well ' +
  'who why how may got get see saw say off own new old yet any all day man men use let put its who too nor per via'
).split(/\s+/));

export interface ThreadSection { readonly id: string; readonly text: string }
export interface Thread { readonly term: string; readonly chapterIds: readonly string[]; readonly count: number }

const tokens = (text: string): string[] => (text.toLowerCase().match(/[\p{L}][\p{L}'’-]*/gu) ?? [])
  .map((w) => w.replace(/['’]s$/, '').replace(/^['’-]+|['’-]+$/g, ''))
  .filter((w) => w.length >= 3 && !STOP.has(w));

/**
 * Words that recur in at least two chapters, are not in nearly every chapter, and are spread rather than packed into one.
 * Ranked by how many chapters carry them, then by total count, then alphabetically (so the order is stable).
 */
export function recurringThreads(sections: readonly ThreadSection[], limit = 8): Thread[] {
  const n = sections.length;
  if (n < 2) return [];
  const perChapter = sections.map((s) => { const m = new Map<string, number>(); for (const t of tokens(s.text)) m.set(t, (m.get(t) ?? 0) + 1); return m; });
  const all = new Map<string, { ids: string[]; count: number }>();
  perChapter.forEach((m, i) => { for (const [term, c] of m) { const e = all.get(term) ?? { ids: [], count: 0 }; e.ids.push(sections[i]!.id); e.count += c; all.set(term, e); } });
  // a word in EVERY chapter says nothing about any one of them; a word in most chapters (a book's central term) is exactly the thread worth seeing
  const ceiling = n <= 2 ? n : n - 1;
  return [...all.entries()]
    .filter(([, e]) => e.ids.length >= 2 && e.ids.length <= ceiling)
    .sort((a, b) => b[1].ids.length - a[1].ids.length || b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, e]) => ({ term, chapterIds: e.ids, count: e.count }));
}

/** Split a paragraph into plain and marked pieces for a term (whole word, case-insensitive). */
export function markTerm(paragraph: string, term: string | null): { text: string; hit: boolean }[] {
  if (!term) return [{ text: paragraph, hit: false }];
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${esc}(?:['’]s)?)(?=$|[^\\p{L}\\p{N}])`, 'giu');
  const out: { text: string; hit: boolean }[] = [];
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(paragraph)) !== null) {
    const start = m.index + (m[1]?.length ?? 0);
    if (start > last) out.push({ text: paragraph.slice(last, start), hit: false });
    out.push({ text: m[2]!, hit: true });
    last = start + m[2]!.length;
  }
  if (last < paragraph.length) out.push({ text: paragraph.slice(last), hit: false });
  return out.length ? out : [{ text: paragraph, hit: false }];
}

/** A short, honest excerpt: the opening of a chapter, cut at a word, never padded. */
export function excerptOf(text: string, max = 260): { text: string; cut: boolean } {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return { text: t, cut: false };
  const slice = t.slice(0, max);
  return { text: slice.slice(0, Math.max(slice.lastIndexOf(' '), 40)).trimEnd(), cut: true };
}
