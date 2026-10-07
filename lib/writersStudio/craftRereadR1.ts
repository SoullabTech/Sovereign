import { fetchReading, requestDevelopmentalReading, type ReadingPayload } from './developClient';
import { LENS_ORDER, readingView } from './developPresentation';
import { craftReadingContext, craftReadingScope, craftZoomLabel, detectCraftRereadIntent } from './craftScopeR1';
import type { RebuildSection } from './rebuild/model';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';

export interface CraftRereadDependencies {
  commission: typeof requestDevelopmentalReading;
  fetch: typeof fetchReading;
}
export interface CraftRereadInput {
  request: string;
  manuscriptId: string;
  sections: readonly RebuildSection[];
  activeSectionId: string;
  revisionNumber: number;
  /** Recheck the originating Work, passage, draft and privacy before each call. */
  stillCurrent: () => boolean;
  onProgress?: (message: string) => void;
}
export type CraftRereadOutcome =
  | { kind: 'local'; notice: string }
  | { kind: 'stopped'; notice: string }
  | { kind: 'read'; coverage: 'complete' | 'partial'; notice: string; context: string; readingIds: readonly string[] };

function requestedSections(scope: ReadingScope, sections: readonly RebuildSection[]): string[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position).map(s => s.draftSectionId);
  if (scope.kind === 'whole') return ordered;
  if (scope.kind === 'section') return ordered.includes(scope.sectionId) ? [scope.sectionId] : [];
  const first = ordered.indexOf(scope.fromSectionId);
  const last = ordered.indexOf(scope.toSectionId);
  return first >= 0 && last >= first ? ordered.slice(first, last + 1) : [];
}

function verifiedPayload(
  payload: ReadingPayload, input: CraftRereadInput, lens: DevelopmentalLens,
  readingId: string, ids: readonly string[],
): boolean {
  const r = payload.reading;
  const body = r?.scope?.bodyScope;
  return Boolean(r && r.id === readingId && r.manuscriptId === input.manuscriptId
    && r.scope.commissionedLens === lens && r.readState?.revisionNumber === input.revisionNumber
    && payload.assessment?.reading?.state === 'current'
    && Array.isArray(body) && body.length === ids.length && new Set(body).size === ids.length
    && ids.every(id => body.includes(id) && r.coverage?.sections?.[id] === 'body'));
}

/** Compose the existing governed reading APIs; never a second reader or a
 * prose-upload path. A mention cannot commission; a failed/partial run cannot
 * claim full coverage; a changed context cannot inherit an earlier request.
 */
export async function runCraftReread(
  input: CraftRereadInput,
  deps: CraftRereadDependencies = { commission: requestDevelopmentalReading, fetch: fetchReading },
): Promise<CraftRereadOutcome> {
  const stopped = (notice: string): CraftRereadOutcome => ({ kind: 'stopped', notice });
  const moved = () => stopped('The writing place or privacy choice changed while MAIA was reading. No further reading or editorial reply was sent.');
  if (!input.stillCurrent()) return moved();
  const intent = detectCraftRereadIntent(input.request);
  if (!intent || intent.zoom === 'passage') return {
    kind: 'local', notice: 'No fresh wider reading was commissioned for this turn.',
  };
  if (!input.sections.some(s => s.draftSectionId === input.activeSectionId)) {
    return stopped('The current passage is not in this manuscript. No wider reading was started.');
  }
  const scope = craftReadingScope(intent.zoom, input.sections, input.activeSectionId);
  if (!scope) return stopped('MAIA could not establish that reading scope here. No wider reading was started.');
  const ids = requestedSections(scope, input.sections);
  if (ids.length === 0) return stopped('No authored sections establish that reading scope. Nothing was read.');
  const lenses: readonly DevelopmentalLens[] = intent.lens ? [intent.lens] : LENS_ORDER;
  const label = craftZoomLabel(intent.zoom);
  const completed: { lens: DevelopmentalLens; payload: ReadingPayload; context: string }[] = [];
  let failure = '';

  for (const lens of lenses) {
    if (!input.stillCurrent()) return moved();
    input.onProgress?.(`Reading the ${label} · ${completed.length}/${lenses.length} lenses complete · ${lens}…`);
    try {
      const commissioned = await deps.commission(input.manuscriptId, lens, scope);
      if (!input.stillCurrent()) return moved();
      if (!commissioned.ok) { failure = commissioned.refusal; break; }
      const fetched = await deps.fetch(input.manuscriptId, commissioned.readingId);
      if (!input.stillCurrent()) return moved();
      if (!fetched.ok) { failure = fetched.refusal; break; }
      if (!verifiedPayload(fetched.payload, input, lens, commissioned.readingId, ids)
        || completed.some(item => item.payload.reading.id === commissioned.readingId)) {
        failure = 'reading identity, revision or coverage could not be verified';
        break;
      }
      const view = readingView(fetched.payload.reading, fetched.payload.assessment, fetched.payload.sections);
      completed.push({ lens, payload: fetched.payload, context: craftReadingContext(view) });
    } catch {
      failure = 'reading service interrupted';
      break;
    }
  }
  if (!input.stillCurrent()) return moved();
  if (completed.length === 0) return stopped(`The ${label} reread did not complete (${failure || 'no verified reading'}). Your manuscript is unchanged.`);
  const missing = lenses.filter(lens => !completed.some(item => item.lens === lens));
  const complete = missing.length === 0 && !failure;
  const status = complete ? 'Complete' : 'Partial';
  const notice = `${status} ${label} reread: ${completed.length}/${lenses.length} editorial lenses; ${ids.length}/${ids.length} requested sections read in each completed lens.`
    + (missing.length ? ` Not completed: ${missing.join(', ')}.` : '')
    + ' Saved manuscript only; your working copy is compared separately.';
  return {
    kind: 'read', coverage: complete ? 'complete' : 'partial', notice,
    readingIds: completed.map(item => item.payload.reading.id),
    context: [
      `READING STATUS: ${status.toUpperCase()}. ${notice}`,
      failure ? `Interrupted because: ${failure}. Do not claim the missing lenses were read.` : '',
      'The governed reread reflects the canonical manuscript state. It does NOT include unsaved Craft wording.',
      'Compare the current working copy separately. Do not claim the whole revised chapter or book was reread.',
      ...completed.map(item => `Reading ${item.payload.reading.id}; revision ${input.revisionNumber}; lens ${item.lens}.\n${item.context}`),
    ].filter(Boolean).join('\n\n'),
  };
}
