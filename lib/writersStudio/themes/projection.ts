/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C4
 * Pure Themes occurrence -> presence/trajectory projection.
 */
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';
import type { Presence } from '@/lib/writersStudio/studio/developObservation';
import type { WorkTheme, WorkThemeOccurrence } from './store';

export interface ThemeProjectionSection {
  readonly sectionId: string;
  readonly label: string;
}

export type ThemeCellState = 'unknown' | 'known';

export interface ThemePresenceCell {
  readonly sectionId: string;
  readonly label: string;
  readonly state: ThemeCellState;
  readonly occurrenceCount: number | null;
  readonly presence: Presence | null;
}

export interface ThemeTrajectoryPoint {
  readonly sectionId: string;
  readonly label: string;
  readonly sectionPosition: number;
  readonly occurrenceCount: number;
  readonly presence: Exclude<Presence, 0>;
}

export interface ThemeProjection {
  readonly themeId: string;
  readonly label: string;
  readonly provenance: WorkTheme['provenance'];
  readonly standing: WorkTheme['standing'];
  readonly cells: readonly ThemePresenceCell[];
  readonly trajectory: readonly ThemeTrajectoryPoint[];
  readonly coverage: {
    readonly read: number;
    readonly total: number;
    readonly wholeCurrentWork: boolean;
  };
  readonly historicalUnmappedOccurrenceCount: number;
}

export function presenceFromOccurrenceCount(count: number): Presence {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
}

function sourceMatchesTheme(
  theme: WorkTheme,
  reading: DevelopmentalReading | null,
): reading is DevelopmentalReading {
  if (!reading || !theme.sourceReadingId) return false;
  return reading.id === theme.sourceReadingId
    && reading.manuscriptId === theme.manuscriptId
    && reading.scope.commissionedLens === 'themes';
}

export function projectThemePresence(input: {
  readonly theme: WorkTheme;
  readonly occurrences: readonly WorkThemeOccurrence[];
  readonly sourceReading: DevelopmentalReading | null;
  readonly currentSections: readonly ThemeProjectionSection[];
}): ThemeProjection {
  const { theme, occurrences, sourceReading, currentSections } = input;
  const matchingReading = sourceMatchesTheme(theme, sourceReading) ? sourceReading : null;
  const currentIds = new Set(currentSections.map((section) => section.sectionId));

  const counts = new Map<string, number>();
  for (const occurrence of occurrences) {
    if (occurrence.themeId !== theme.id || occurrence.manuscriptId !== theme.manuscriptId) continue;
    counts.set(occurrence.sectionId, (counts.get(occurrence.sectionId) ?? 0) + 1);
  }

  let read = 0;
  const cells = currentSections.map((section): ThemePresenceCell => {
    const known = matchingReading?.coverage.sections[section.sectionId] === 'body'
      && matchingReading.readState.sectionTopology.includes(section.sectionId);
    if (!known) {
      return {
        sectionId: section.sectionId,
        label: section.label,
        state: 'unknown',
        occurrenceCount: null,
        presence: null,
      };
    }
    read += 1;
    const occurrenceCount = counts.get(section.sectionId) ?? 0;
    return {
      sectionId: section.sectionId,
      label: section.label,
      state: 'known',
      occurrenceCount,
      presence: presenceFromOccurrenceCount(occurrenceCount),
    };
  });

  const trajectory: ThemeTrajectoryPoint[] = [];
  cells.forEach((cell, sectionPosition) => {
    if (cell.state !== 'known' || cell.occurrenceCount === null || cell.occurrenceCount <= 0 || cell.presence === null || cell.presence === 0) {
      return;
    }
    trajectory.push({
      sectionId: cell.sectionId,
      label: cell.label,
      sectionPosition,
      occurrenceCount: cell.occurrenceCount,
      presence: cell.presence,
    });
  });

  const historicalUnmappedOccurrenceCount = occurrences.filter(
    (occurrence) =>
      occurrence.themeId === theme.id
      && occurrence.manuscriptId === theme.manuscriptId
      && !currentIds.has(occurrence.sectionId),
  ).length;

  return {
    themeId: theme.id,
    label: theme.currentLabel,
    provenance: theme.provenance,
    standing: theme.standing,
    cells,
    trajectory,
    coverage: {
      read,
      total: currentSections.length,
      wholeCurrentWork: currentSections.length > 0 && read === currentSections.length,
    },
    historicalUnmappedOccurrenceCount,
  };
}
