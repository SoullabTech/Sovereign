import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { SectionStatus } from '@/lib/writersStudio/sectionSaveQueue';
import type { WriteChapterView, WriteRoomData } from './WriteRoom';

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
  return body.length === 0 ? [''] : body.split(/\n{2,}/);
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

  const currentForward = navigable.slice(index, index + 7);
  const conflicted = navigable.filter(
    (section) => input.statusOf(section.draftSectionId) === 'conflict'
      && !currentForward.some((shown) => shown.draftSectionId === section.draftSectionId),
  );
  const visible = [...currentForward, ...conflicted];
  const chapters: WriteChapterView[] = visible.map((section) => {
    const status = rowStatus(input.statusOf(section.draftSectionId));
    return {
      id: section.draftSectionId,
      ...exactDisplay(section),
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
      ...(rowStatus(input.statusOf(active.draftSectionId)) ? { activeStatus: rowStatus(input.statusOf(active.draftSectionId)) } : {}),
      saveState: pc3SaveState(statuses),
      unsaved: 'Unsaved',
    },
    previousId,
    nextId,
  };
}
