import type { DisplacedExchange } from './sessionRecovery';

export interface ThreadSpineAnchor extends DisplacedExchange {
  kind: 'opening' | 'continuity' | 'relevant' | 'bridge';
}

const STOP = new Set([
  'the','and','for','with','that','this','from','into','have','has','had','was','were','are','you','your','our','their','they','them','what','when','where','why','how','about','just','really','very','but','not','can','could','would','should','will','then','than','there','here','like','know','think','want','said',
]);

function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function overlapScore(utterance: string, exchange: DisplacedExchange): number {
  const q = [...new Set(tokens(utterance))];
  if (q.length === 0) return 0;
  const hay = new Set(tokens(`${exchange.userMessage} ${exchange.maiaResponse}`));
  const shared = q.filter((t) => hay.has(t)).length;
  return shared / q.length;
}

function continuityOverlapScore(
  apertureText: string,
  exchange: DisplacedExchange,
  corpus: readonly DisplacedExchange[],
): number {
  const query = [...new Set(tokens(apertureText))];
  if (query.length === 0 || corpus.length === 0) return 0;

  const documentSets = corpus.map((item) =>
    new Set(tokens(`${item.userMessage} ${item.maiaResponse}`)),
  );
  const candidate = new Set(tokens(`${exchange.userMessage} ${exchange.maiaResponse}`));

  let totalWeight = 0;
  let sharedWeight = 0;

  for (const token of query) {
    const df = documentSets.reduce(
      (count, doc) => count + (doc.has(token) ? 1 : 0),
      0,
    );
    const weight = Math.log((corpus.length + 1) / (df + 1)) + 1;
    totalWeight += weight;
    if (candidate.has(token)) sharedWeight += weight;
  }

  return totalWeight > 0 ? sharedWeight / totalWeight : 0;
}

export function buildSessionThreadSpine(args: {
  utterance: string;
  allSessionExchanges: readonly DisplacedExchange[];
  apertureCount: number;
  excludeKeys?: ReadonlySet<string>;
}): ThreadSpineAnchor[] {
  const all = args.allSessionExchanges;
  const aperture = Math.max(0, Math.min(all.length, args.apertureCount));
  const displaced = all.slice(0, all.length - aperture)
    .filter((e) => !args.excludeKeys?.has(e.exchangeKey));
  if (displaced.length === 0) return [];

  const chosen = new Map<string, ThreadSpineAnchor>();
  const opening = displaced[0];
  chosen.set(opening.exchangeKey, { ...opening, kind: 'opening' });

  const bridge = displaced[displaced.length - 1];
  chosen.set(bridge.exchangeKey, { ...bridge, kind: 'bridge' });

  const apertureText = all
    .slice(all.length - aperture)
    .map((e) => `${e.userMessage} ${e.maiaResponse}`)
    .join(' ');

  // Long-session continuity: if an earlier exchange materially overlaps the
  // language still alive in the recent aperture, carry one such exchange as a
  // bridge across the temporal middle. This is deterministic lexical evidence,
  // not a summary or an inference about the member.
  if (apertureText.trim()) {
    const continuity = displaced
      .filter((e) => !chosen.has(e.exchangeKey))
      .map((e) => ({ e, score: continuityOverlapScore(apertureText, e, all) }))
      .sort((a, b) => (b.score - a.score) || (a.e.index - b.e.index))[0];

    if (continuity && continuity.score >= 0.12) {
      chosen.set(continuity.e.exchangeKey, { ...continuity.e, kind: 'continuity' });
    }
  }

  const relevant = displaced
    .filter((e) => !chosen.has(e.exchangeKey))
    .map((e) => ({ e, score: overlapScore(args.utterance, e) }))
    .sort((a, b) => (b.score - a.score) || (a.e.index - b.e.index))[0];

  if (relevant && relevant.score >= 0.18) {
    chosen.set(relevant.e.exchangeKey, { ...relevant.e, kind: 'relevant' });
  }

  return [...chosen.values()].sort((a, b) => a.index - b.index);
}

function excerpt(text: string, max = 640): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const half = Math.floor((max - 5) / 2);
  return `${clean.slice(0, half)} … ${clean.slice(-half)}`;
}

export function continuityExcerpt(text: string, max = 480): string {
  return excerpt(text, max);
}

export function formatSessionThreadSpine(anchors: readonly ThreadSpineAnchor[]): string {
  if (anchors.length === 0) return '';
  const labels: Record<ThreadSpineAnchor['kind'], string> = {
    opening: 'opening anchor',
    continuity: 'earlier continuity anchor',
    relevant: 'earlier relevant anchor',
    bridge: 'bridge into the recent window',
  };
  const body = anchors.map((a) =>
    `[exchange ${a.index + 1} · ${labels[a.kind]}]\nMember: ${excerpt(a.userMessage)}\nYou: ${excerpt(a.maiaResponse)}`
  ).join('\n\n');

  return `CURRENT-SESSION THREAD SPINE (verbatim excerpts from this conversation)\n${body}\n\nGuidance: use these only as continuity background. Do not repeat or foreground them unless relevant. The member's current words and the most recent exchanges outrank earlier material. If the thread has changed, follow the current thread.`;
}
