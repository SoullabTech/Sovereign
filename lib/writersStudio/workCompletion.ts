/**
 * WRITERS-STUDIO-EA-COMPLETION-01 · Ready the Work
 *
 * Editorially settled, review-copy ready, and publication ready are distinct.
 */
export type CompletionDimensionStanding = 'clear' | 'open' | 'blocked' | 'not-run';

export type CompletionDimensionId =
  | 'editorial-integrity'
  | 'continuity'
  | 'recovery'
  | 'source-provenance'
  | 'permissions-rights'
  | 'page-proof'
  | 'front-back-matter'
  | 'publication-target';

export interface CompletionDimension {
  readonly id: CompletionDimensionId;
  readonly standing: CompletionDimensionStanding;
  readonly note?: string;
}

export type WorkCompletionState =
  | 'BLOCKED'
  | 'IN_PROGRESS'
  | 'EDITORIALLY_SETTLED'
  | 'REVIEW_COPY_READY'
  | 'PUBLICATION_READY';

export interface WorkCompletionView {
  readonly state: WorkCompletionState;
  readonly dimensions: readonly CompletionDimension[];
  readonly blockers: readonly CompletionDimension[];
  readonly open: readonly CompletionDimension[];
}

const byId = (dimensions: readonly CompletionDimension[]) =>
  new Map(dimensions.map((x) => [x.id, x] as const));

const clear = (
  map: ReadonlyMap<CompletionDimensionId, CompletionDimension>,
  id: CompletionDimensionId,
) => map.get(id)?.standing === 'clear';

export function workCompletion(
  dimensions: readonly CompletionDimension[],
): WorkCompletionView {
  const blockers = dimensions.filter((x) => x.standing === 'blocked');
  const open = dimensions.filter((x) => x.standing === 'open' || x.standing === 'not-run');
  if (blockers.length > 0) return { state: 'BLOCKED', dimensions, blockers, open };

  const map = byId(dimensions);
  const editorial =
    clear(map, 'editorial-integrity') &&
    clear(map, 'continuity') &&
    clear(map, 'recovery');

  const reviewCopy =
    editorial &&
    clear(map, 'source-provenance') &&
    clear(map, 'front-back-matter');

  const publication =
    reviewCopy &&
    clear(map, 'permissions-rights') &&
    clear(map, 'page-proof') &&
    clear(map, 'publication-target');

  const state: WorkCompletionState =
    publication ? 'PUBLICATION_READY'
    : reviewCopy ? 'REVIEW_COPY_READY'
    : editorial ? 'EDITORIALLY_SETTLED'
    : 'IN_PROGRESS';

  return { state, dimensions, blockers, open };
}

export const WORK_COMPLETION_LAW = [
  'A Work is never simply “ready”.',
  'Editorially settled does not imply review-copy ready.',
  'Review-copy ready does not imply publication ready.',
  'Source provenance and publication permissions are distinct dimensions.',
  'Publication readiness requires permissions/rights, page-proof, and a publication target.',
  'Any blocking dimension makes the whole state BLOCKED without erasing clear dimensions.',
  'Not-run and open remain visible; absence is never treated as green.',
] as const;
