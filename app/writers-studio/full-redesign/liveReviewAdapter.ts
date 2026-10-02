import type { ReviewView } from '@/app/writers-studio/flagship/DevelopReview';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type {
  Pc3LiveReviewData, Pc3LiveReviewFinding, Pc3LiveReviewLens,
} from './LiveReviewRoom';

const LENS_LABEL: Readonly<Record<string, string>> = {
  structure: 'Structure',
  development: 'Development',
  continuity: 'Continuity',
  arc: 'Arc',
  voice: 'Voice',
  coherence: 'Coherence',
  reader: 'Reader perspective',
};

function lensState(
  availability: ReviewView['lenses'][number]['availability'],
): Pc3LiveReviewLens['state'] {
  switch (availability.kind) {
    case 'read': case 'partially-read': return 'read';
    case 'read-nothing-noticed': return 'read-nothing-noticed';
    case 'not-read': return 'not-read';
  }
}function lensCount(availability: ReviewView['lenses'][number]['availability']): number {
  switch (availability.kind) {
    case 'read': case 'partially-read': return availability.found;
    default: return 0;
  }
}

function lensOfFinding(finding: ReviewView['findings'][number]): string {
  if (finding.provenance.kind === 'maia-observation') {
    return finding.provenance.lens;
  }
  return finding.domain;
}

export function projectPc3LiveReview(input: {
  view: ReviewView;
  sections: readonly RebuildSection[];
  chapterRootSectionId: string;
  heroSrc: string | null;
}): Pc3LiveReviewData {
  const { view } = input;
  const headings = input.sections.filter((section) =>
    Boolean(section.heading?.trim()) && section.headingDepth === 1);
  const railSource = headings.length > 0
    ? headings
    : input.sections.filter((section) => Boolean(section.heading?.trim()));  const rail = railSource.map((section, index) => ({
    id: section.draftSectionId,
    index: index + 1,
    heading: section.heading!.trim(),
    current: section.draftSectionId === input.chapterRootSectionId,
  }));

  const lenses: Pc3LiveReviewLens[] = view.lenses.map(({ id, availability }) => ({
    id,
    label: LENS_LABEL[id] ?? id,
    count: lensCount(availability),
    state: lensState(availability),
  }));

  const findings: Pc3LiveReviewFinding[] = view.findings.map((finding) => {
    const lens = lensOfFinding(finding);
    return {
      id: finding.id,
      title: finding.label,
      body: finding.description,
      location: finding.returnTo.label,
      sectionId: finding.returnTo.sectionId,
      lens,
      lensLabel: LENS_LABEL[lens] ?? lens,
      evidence: [...finding.evidence],
      hypothesis: finding.domain === 'reader'
        || finding.doesNotEstablish.includes('reader-effect'),
    };
  });  const total = Math.max(0, view.coverage.total);
  const read = Math.max(0, Math.min(view.coverage.read, total || view.coverage.read));
  const percent = total > 0 ? Math.round((read / total) * 100) : 0;
  const scopeLabel = view.scope.kind === 'chapter'
    ? view.scope.label
    : 'Whole Work';

  return {
    workTitle: view.work,
    workKind: view.kind,
    scopeLabel,
    rail,
    heroSrc: input.heroSrc,
    findings,
    lenses,
    coverage: {
      read,
      total,
      percent,
      depth: view.coverage.depth,
      when: view.coverage.when,
    },
    ...(view.selectedFindingId ? { selectedFindingId: view.selectedFindingId } : {}),
  };
}
