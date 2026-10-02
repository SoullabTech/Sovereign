import type { Presence } from '@/lib/writersStudio/studio/developObservation';
import type { WorkThemeProvenance, WorkThemeStanding } from './store';

export type ThemeSourceState = 'current' | 'superseded' | 'unmeasured' | 'not-evidenced';

export interface LiveThemeSection {
  sectionId: string;
  label: string;
  position: number;
}

export interface LiveThemeCell {
  sectionId: string;
  label: string;
  state: 'known' | 'unknown';
  occurrenceCount: number | null;
  presence: Presence | null;
}

export interface LiveThemeTrajectoryPoint {
  sectionId: string;
  label: string;
  sectionPosition: number;
  occurrenceCount: number;
  presence: Exclude<Presence, 0>;
}

export interface LiveGovernedTheme {
  id: string;
  label: string;
  provenance: WorkThemeProvenance;
  standing: WorkThemeStanding;
  sourceState: ThemeSourceState;
  sourceReadingId: string | null;
  sourceObservationId: string | null;
  frozenAt: string | null;
  evidence: readonly LiveThemeCandidateEvidence[];
  projection: {
    cells: readonly LiveThemeCell[];
    trajectory: readonly LiveThemeTrajectoryPoint[];
    coverage: { read: number; total: number; wholeCurrentWork: boolean };
    historicalUnmappedOccurrenceCount: number;
  } | null;
}

export interface LiveThemeCandidateEvidence {
  sectionId: string;
  label: string;
  range: { start: number; end: number } | null;
  currentAddress: boolean;
}

export interface LiveThemeCandidate {
  readingId: string;
  observationId: string;
  observationKey: string;
  label: string;
  observation: string;
  frozenAt: string;
  sourceState: Exclude<ThemeSourceState, 'not-evidenced'>;
  evidence: readonly LiveThemeCandidateEvidence[];
  coverage: { read: number; total: number };
}

export interface LiveThemesPayload {
  manuscriptId: string;
  sections: readonly LiveThemeSection[];
  themes: readonly LiveGovernedTheme[];
  candidates: readonly LiveThemeCandidate[];
}

export type ThemeMutation =
  | { action: 'accept-candidate'; readingId: string; observationId: string }
  | { action: 'rename-candidate'; readingId: string; observationId: string; label: string }
  | { action: 'reject-candidate'; readingId: string; observationId: string }
  | { action: 'declare'; label: string }
  | { action: 'rename-theme'; themeId: string; label: string }
  | { action: 'reject-theme'; themeId: string }
  | { action: 'restore-theme'; themeId: string };
