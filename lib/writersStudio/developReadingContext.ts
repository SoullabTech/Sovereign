import { sectionIdsOf, type EvidenceRef } from '@/lib/manuscript/development/evidenceRef';

export type ReadingPresentationScope = 'work' | 'chapter' | 'passage';

export interface ObservationEvidenceSource {
  key: string;
  evidenceRefs: readonly EvidenceRef[];
}

export function observationSectionIdsByKey(
  observations: readonly ObservationEvidenceSource[],
): Map<string, readonly string[]> {
  const out = new Map<string, readonly string[]>();
  for (const observation of observations) {
    const ids: string[] = [];
    for (const ref of observation.evidenceRefs) {
      for (const sectionId of sectionIdsOf(ref)) {
        if (!ids.includes(sectionId)) ids.push(sectionId);
      }
    }
    out.set(observation.key, ids);
  }
  return out;
}

export function visibleObservationKeys({
  observationKeys,
  observationSectionIds,
  scope,
  chapterSectionIds = [],
  passageObservationKey = null,
}: {
  observationKeys: readonly string[];
  observationSectionIds: ReadonlyMap<string, readonly string[]>;
  scope: ReadingPresentationScope;
  chapterSectionIds?: readonly string[];
  passageObservationKey?: string | null;
}): Set<string> {
  if (scope === 'work') return new Set(observationKeys);
  if (scope === 'passage') {
    return passageObservationKey ? new Set([passageObservationKey]) : new Set();
  }
  const chapterIds = new Set(chapterSectionIds);
  const visible = new Set<string>();
  for (const key of observationKeys) {
    const sectionIds = observationSectionIds.get(key) ?? [];
    if (sectionIds.some((sectionId) => chapterIds.has(sectionId))) visible.add(key);
  }
  return visible;
}

export function settleReadingPresentationScope(
  current: ReadingPresentationScope,
  {
    chapterAvailable,
    passageAvailable,
  }: {
    chapterAvailable: boolean;
    passageAvailable: boolean;
  },
): ReadingPresentationScope {
  if (current === 'passage' && !passageAvailable) return chapterAvailable ? 'chapter' : 'work';
  if (current === 'chapter' && !chapterAvailable) return 'work';
  return current;
}
