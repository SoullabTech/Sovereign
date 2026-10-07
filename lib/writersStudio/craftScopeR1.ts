import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { chapterSpanFor } from '@/lib/writersStudio/rebuild/model';
import type { ReadingView } from '@/lib/writersStudio/developPresentation';

export type CraftZoom = 'passage' | 'section' | 'chapter' | 'whole';

export interface CraftRereadIntent {
  readonly zoom: CraftZoom;
  /** null means the writer asked for a broad look, so the governed multi-lens review is appropriate. */
  readonly lens: DevelopmentalLens | null;
  readonly explicit: true;
}

const scopes: readonly { zoom: CraftZoom; pattern: RegExp }[] = [
  { zoom: 'whole', pattern: /\b(?:(?:the\s+)?(?:whole|entire)\s+(?:book|manuscript|work)|(?:book|manuscript|work)\s+as\s+a\s+whole|across\s+(?:the\s+)?(?:book|manuscript|work))\b/i },
  { zoom: 'chapter', pattern: /\b(?:(?:this|the|whole|entire)\s+chapter|chapter\s+as\s+a\s+whole)\b/i },
  { zoom: 'section', pattern: /\b(?:(?:this|the|whole|entire)\s+section|section\s+as\s+a\s+whole)\b/i },
  { zoom: 'passage', pattern: /\b(?:this\s+(?:passage|paragraph|sentence|phrase)|these\s+words)\b/i },
];

function unquotedRequest(text: string): string {
  return text
    .replace(/```[\s\S]*?(?:```|$)/g, ' ')
    .replace(/^\s*>.*$/gm, ' ')
    .replace(/`[^`]*(?:`|$)/g, ' ')
    .replace(/"[^"\n]*"|“[^”\n]*”|‘[^’\n]*’/g, ' ')
    .replace(/(^|[\s(:])'[^'\n]*'(?=[\s).,!?;:]|$)/g, '$1 ')
    .replace(/’/g, "'");
}

// This is a conservative command grammar, not a claim to general intent
// understanding. An uncertain sentence stays local and may be clarified in
// conversation. Only affirmative present requests can spend a wider reading.
const requestedAct = /^(?:(?:please|now|just|then|also)\s+)*(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?|i\s+(?:want|would\s+like)\s+you\s+to\s+)?(?:re-?read|read|review|look\s+at|examine|check|compare|evaluate|assess|help\s+with)\b/i;
const requestedAttention = /^(?:(?:please|now|just|then|also)\s+)*(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?|i\s+(?:want|would\s+like)\s+you\s+to\s+)?(?:find|identify|show\s+me)\s+(?:(?:other|the\s+next|next|another|any|some)\s+)?(?:areas?|places?|passages?|sections?|paragraphs?)\b/i;
const deferred = /\b(?:later|tomorrow|not\s+yet|not\s+now|next\s+(?:week|time)|if\s+(?:necessary|needed)|when\s+i\s+finish)\b/i;
const refusal = /\b(?:do\s+not|don't|never|avoid|stop|no\s+need|not\s+(?:the|this|a|my|any)|without\s+(?:reading|reviewing))\b/i;

function explicitLensFrom(text: string): DevelopmentalLens | null {
  if (/\b(?:arc|journey|movement\s+of\s+(?:the\s+)?(?:chapter|book|work))\b/i.test(text)) return 'arc';
  if (/\b(?:structure|sequence|order|belongs?\s+here|shape(?:d)?)\b/i.test(text)) return 'structure';
  if (/\b(?:theme|motif|recurs?|returning)\b/i.test(text)) return 'themes';
  if (/\b(?:voice|register|sounds?\s+like\s+me|tone)\b/i.test(text)) return 'voice';
  if (/\b(?:continuity|carry\s+through|setup|payoff)\b/i.test(text)) return 'continuity';
  if (/\b(?:coherence|consistent|contradict|holds?\s+together)\b/i.test(text)) return 'coherence';
  if (/\b(?:reader|orientation|confus|follow|reader\s+experience)\b/i.test(text)) return 'reader';
  if (/\b(?:development|developing|overexpl|underdevelop|repeat|repetition|thin|dense)\b/i.test(text)) return 'development';
  return null;
}

/** A scope mention is never, by itself, a request to read that scope. */
export function detectCraftRereadIntent(text: string): CraftRereadIntent | null {
  const request = unquotedRequest(text);
  if (deferred.test(request)) return null;
  const clauses = request.split(/[.!?;\n]+|\b(?:but|and\s+then|then)\b/i)
    .map(clause => clause.trim()).filter(Boolean);
  const prohibited = new Set<CraftZoom>();
  for (const clause of clauses) {
    const at = clause.search(refusal);
    if (at >= 0) {
      const denied = clause.slice(at);
      for (const scope of scopes) if (scope.pattern.test(denied)) prohibited.add(scope.zoom);
    }
  }
  const candidates: CraftRereadIntent[] = [];
  for (const clause of clauses) {
    const attention = requestedAttention.exec(clause);
    if (attention && /\b(?:if|unless|when|only\s+after)\b/i.test(clause)) continue;
    const act = requestedAct.exec(clause) ?? attention;
    if (!act) continue;
    const end = clause.search(refusal);
    const affirmative = end >= 0 ? clause.slice(0, end) : clause;
    const object = affirmative.slice(act[0].length);
    const target = scopes.map(scope => ({ ...scope, match: scope.pattern.exec(object) }))
      .filter(scope => scope.match !== null)
      .sort((a, b) => a.match!.index - b.match!.index)[0];
    if (!target || prohibited.has(target.zoom)) continue;
    candidates.push({ zoom: target.zoom, lens: explicitLensFrom(affirmative) ?? (attention ? 'reader' : null), explicit: true });
  }
  // A later explicitly requested focus governs the next act. Never take the
  // widest phrase found anywhere in the writer's message.
  return candidates.at(-1) ?? null;
}

/**
 * Natural language can itself be the writer's explicit authorization for a
 * bounded wording proposal. This is independent of the standing preference
 * that lets MAIA volunteer wording without being asked.
 */
export { craftProposalRequested } from './craftSuggestionPolicyR1';

export function craftReadingScope(
  zoom: CraftZoom,
  sections: readonly RebuildSection[],
  activeSectionId: string,
): ReadingScope | null {
  if (zoom === 'passage') return null;
  if (zoom === 'whole') return { kind: 'whole' };
  if (zoom === 'section') return { kind: 'section', sectionId: activeSectionId };

  const chapter = chapterSpanFor(sections, activeSectionId);
  if (!chapter || chapter.sections.length === 0) return null;
  const first = chapter.sections[0]!.draftSectionId;
  const last = chapter.sections[chapter.sections.length - 1]!.draftSectionId;
  return { kind: 'range', fromSectionId: first, toSectionId: last };
}

export function craftZoomLabel(zoom: CraftZoom): string {
  switch (zoom) {
    case 'whole': return 'whole manuscript';
    case 'chapter': return 'chapter';
    case 'section': return 'section';
    case 'passage': return 'passage';
  }
}

/**
 * Carry only what the governed reread actually established. Observation prose
 * stays verbatim and every line retains its non-conclusion boundary.
 */
export function craftReadingContext(view: ReadingView): string {
  const lines: string[] = [
    `Fresh governed reread · ${view.lens} · ${view.coverage.sentence}`,
  ];
  if (view.outcome === 'none' || view.observations.length === 0) {
    lines.push('MAIA recorded no developmental observation under this lens.');
    return lines.join('\n');
  }
  for (const observation of view.observations) {
    lines.push('');
    lines.push(`Observation ${observation.key}: ${observation.observation}`);
    if (observation.evidence.length > 0) {
      lines.push(`Evidence: ${observation.evidence.join(' | ')}`);
    }
    if (observation.limits.length > 0) {
      lines.push(`Does not establish: ${observation.limits.map((limit) => limit.name).join(', ')}`);
    }
  }
  return lines.join('\n');
}
