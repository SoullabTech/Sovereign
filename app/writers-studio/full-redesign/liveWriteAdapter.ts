import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { explicitRole } from '@/lib/writersStudio/focus/outlineTree';
import type { SectionStatus } from '@/lib/writersStudio/sectionSaveQueue';
import type { WriteChapterView, WriteRoomData } from './WriteRoom';
import { typesetManuscriptBody, typesetParagraphs } from './manuscriptTypesetting';

export type Pc3WriteProjection = {
  data: WriteRoomData;
  previousId: string | null;
  nextId: string | null;
};

export function pc3SaveState(statuses: readonly SectionStatus[]): string {
  if (statuses.includes('conflict')) return 'Needs attention';
  if (statuses.includes('error')) return 'Save unavailable';
  if (statuses.includes('dirty')) return 'Unsaved';
  if (statuses.includes('saving')) return 'Saving…';
  return 'Saved';
}

export function pc3Paragraphs(body: string): string[] {
  return typesetParagraphs(body);
}
function exactDisplay(section: RebuildSection): Pick<WriteChapterView, 'label' | 'title'> {
  const heading = section.heading?.trim();
  if (!heading) return { label: `Section ${section.position + 1}` };
  const m = heading.match(/^(Chapter\s+\S+)\s*[:—–-]\s*(.+)$/i);
  return m ? { label: m[1]!, title: m[2]! } : { label: heading };
}

function rowStatus(status: SectionStatus): WriteChapterView['status'] {
  if (status === 'conflict') return 'conflict';
  if (status === 'error') return 'error';
  return undefined;
}

export function projectPc3LiveWrite(input: {
  sections: readonly RebuildSection[];
  activeId: string | null;
  bodyOf: (sectionId: string) => string;
  statusOf: (sectionId: string) => SectionStatus;
  workTitle: string | null;
  manuscriptTitle: string | null;
}): Pc3WriteProjection | null {
  const ordered = [...input.sections].sort((a, b) => a.position - b.position);
  const navigable = ordered.filter((s) => s.editable);
  const active = input.activeId
    ? navigable.find((s) => s.draftSectionId === input.activeId) ?? null
    : null;
  if (!active) return null;
  const index = navigable.findIndex((s) => s.draftSectionId === active.draftSectionId);
  const previousId = index > 0 ? navigable[index - 1]!.draftSectionId : null;
  const nextId = index >= 0 && index + 1 < navigable.length
    ? navigable[index + 1]!.draftSectionId
    : null;

  // The manuscript rail is an orientation surface, not a seven-section viewport.
  // Keep the whole editable manuscript visible so a member can understand where
  // they are in the Work and move anywhere without the Studio appearing to have
  // lost the rest of the manuscript.
  const visible = navigable;
  const chapters: WriteChapterView[] = visible.map((section) => {
    const status = rowStatus(input.statusOf(section.draftSectionId));
    const explicit = explicitRole(section.heading);
    const role: WriteChapterView['role'] = explicit !== 'other' && section.headingDepth === 1
      ? explicit
      : section.headingDepth === 2 || section.headingDepth === 3
        ? 'section'
        : 'other';
    return {
      id: section.draftSectionId,
      ...exactDisplay(section),
      role,
      depth: section.headingDepth === 1 || section.headingDepth === 2 || section.headingDepth === 3
        ? section.headingDepth : null,
      ...(status ? { status } : {}),
    };
  });

  const statuses = ordered.map((s) => input.statusOf(s.draftSectionId));
  const identity = input.workTitle ?? input.manuscriptTitle ?? '';
  const place = active.heading ?? undefined;
  const title = active.heading ?? undefined;

  return {
    data: {
      work: identity,
      heading: 'Manuscript',
      chapters,
      currentChapterId: active.draftSectionId,
      place: place ?? '',
      title: title ?? '',
      paragraphs: pc3Paragraphs(input.bodyOf(active.draftSectionId)),
      blocks: typesetManuscriptBody(input.bodyOf(active.draftSectionId)),
      ...(rowStatus(input.statusOf(active.draftSectionId)) ? { activeStatus: rowStatus(input.statusOf(active.draftSectionId)) } : {}),
      saveState: pc3SaveState(statuses),
      unsaved: 'Unsaved',
    },
    previousId,
    nextId,
  };
}
