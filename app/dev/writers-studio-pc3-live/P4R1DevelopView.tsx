'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Shell, ChevronDown } from '@/app/writers-studio/full-redesign/Shell';
import { WriteManuscriptRail } from '@/app/writers-studio/full-redesign/WriteRoom';
import { outlineTree } from '@/lib/writersStudio/focus/outlineTree';
import { STATE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { IMAGES } from '@/app/writers-studio/full-redesign/fixtures';
import ObservationDialogue from '@/app/writers-studio/develop/ObservationDialogue';
import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';
import P4R1WorkMaterialsDoor from './P4R1WorkMaterialsDoor';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingView } from '@/lib/writersStudio/developPresentation';
import type { ReadingSummary } from '@/lib/writersStudio/developClient';
import type { LiveThemesPayload, LiveGovernedTheme, LiveThemeCandidate } from '@/lib/writersStudio/themes/liveTypes';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { DevelopPreparation } from '@/lib/writersStudio/developPreparationClient';
import type { WholeManuscriptAttentionMap, AttentionItem } from '@/lib/writersStudio/studio/attentionMap';
import type { WriterUnderstanding, WriterUnderstandingDraft } from '@/lib/writersStudio/writerUnderstanding';
import type { IntellectualLineageOrientation } from '@/lib/writersStudio/intellectualLineageOrientation';
import { requestStructureReading } from '@/lib/writersStudio/reviewClient';
import type {
  ChapterLineageCandidate,
  ChapterLineageScan,
} from '@/lib/writersStudio/intellectualLineageChapter';
import type { DevelopmentalOrientation } from '@/lib/writersStudio/developmentalOrientation';
import { observeTextExtent } from '@/lib/writersStudio/workMaturity';
import { nextMoveOptions, type WriterNextMove } from '@/lib/writersStudio/writerNextMoves';
import { lineageProcessForState } from '@/lib/writersStudio/intellectualLineageProcess';
import {
  sourceVerificationOptions,
  verificationStanding,
} from '@/lib/writersStudio/sourceVerification';
import P4R1WriterUnderstanding from './P4R1WriterUnderstanding';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';
import {
  DEFAULT_WORKING_STYLE,
  EXPLANATION_COPY,
  EXPLANATION_VALUES,
  PACE_COPY,
  PACE_VALUES,
  readWorkingStyle,
  writeWorkingStyle,
  type ExplanationDepth,
  type WorkingPace,
} from '@/lib/writersStudio/workingStyle';

export const DEVELOP_FIELDS = [
  'overview',
  'development',
  'structure',
  'arc',
  'themes',
  'voice',
  'coherence',
  'continuity',
  'reader',
] as const;
export type DevelopField = (typeof DEVELOP_FIELDS)[number];

export const DEVELOP_INTENTS = [
  'feels-off',
  'shape',
  'thread',
  'voice',
  'chapter-role',
  'recurrence',
  'reader',
  'help-look',
] as const;
export type DevelopIntentKey = (typeof DEVELOP_INTENTS)[number];

const LABEL: Record<DevelopField, string> = {
  overview: 'Overview',
  development: 'Development',
  structure: 'Structure',
  arc: 'Arc',
  themes: 'Themes',
  voice: 'Voice',
  coherence: 'Coherence',
  continuity: 'Continuity',
  reader: 'Reader Perspective',
};

const NAV_LABEL: Record<DevelopField, string> = {
  ...LABEL,
  reader: 'Reader',
};

const QUESTION: Record<Exclude<DevelopField, 'overview'>, string> = {
  development: 'How is the work developing across what MAIA read?',
  structure: 'How are the parts arranged, repeated, missing, or out of sequence?',
  arc: 'How does the work move, locally and across the larger journey?',
  themes: 'What recurs, where does it recur, and how does its presence change?',
  voice: 'Where does the voice of this Work hold, shift, or depart from itself?',
  coherence: 'Where do the parts hold together, change meaning, or contradict?',
  continuity: 'What carries through, what drops, and what later has already happened?',
  reader: 'What does the reader already know here, and where might orientation be lost?',
};

const FRIENDLY_PHENOMENON: Record<string, { title: string; lead: string }> = {
  recurrence: {
    title: 'Something is returning here',
    lead: 'MAIA noticed an idea, image, phrase, or gesture coming back. The useful question is what changes each time it returns — not whether repetition is automatically a problem.',
  },
  'unresolved thread': {
    title: 'Something may still be open',
    lead: 'MAIA noticed something introduced here that is not yet taken up again in what she read. That can be intentional. It is worth asking whether the openness feels alive or unfinished to you.',
  },
  'register shift': {
    title: 'The way the chapter speaks changes here',
    lead: 'MAIA noticed a change in voice, distance, tense, or mode of telling. The question is whether the change serves the movement you want.',
  },
  'prospective reference': {
    title: 'The text points forward',
    lead: 'MAIA noticed language that asks the reader to hold something for later. It may be useful to see whether that promise feels clear and well placed.',
  },
  're-explanation / first-mention': {
    title: 'An idea may be arriving twice',
    lead: 'MAIA noticed something being introduced or explained in a way that may overlap with an earlier moment. The question is whether the second arrival deepens the idea or simply repeats it.',
  },
  movement: {
    title: 'The chapter changes direction here',
    lead: 'MAIA noticed a shift in what the section is doing. We can look at what opens, what closes, and whether that movement feels true to the chapter.',
  },
  'term drift': {
    title: 'A word may be changing meaning',
    lead: 'MAIA noticed a term carrying a different sense here than elsewhere. That may be growth, nuance, or confusion; the manuscript itself has to decide which.',
  },
  'positional asymmetry': {
    title: 'The weight is uneven across the chapter',
    lead: 'MAIA noticed that something is concentrated in one part of the chapter more than another. That is not a flaw by itself; it may reveal where the chapter is doing its deepest work.',
  },
};

function friendlyObservation(phenomenonLabel: string | null | undefined) {
  const key = (phenomenonLabel ?? '').trim().toLowerCase();
  return FRIENDLY_PHENOMENON[key] ?? {
    title: 'There is something here worth looking at together',
    lead: 'MAIA noticed a pattern in this reading. You do not need to accept it as a verdict. The useful next move is to see whether it helps you understand what this part of the Work is doing.',
  };
}

export type DevelopScopeChoice =
  | { kind: 'whole' }
  | { kind: 'section'; sectionId: string; label: string }
  | { kind: 'chapter'; label: string; fromSectionId: string; toSectionId: string }
  | { kind: 'range'; fromIndex: number; toIndex: number };

export interface P4R1DevelopViewProps {
  manuscriptId: string;
  work: LivingWork | null;
  workTitle: string;
  appearance: Appearance;
  field: DevelopField;
  intent: DevelopIntentKey | null;
  sections: readonly RebuildSection[];
  currentSectionId: string | null;
  summaries: readonly ReadingSummary[];
  summariesLoading: boolean;
  reading: ReadingView | null;
  readingLoading: boolean;
  readingError: string | null;
  observationTargets: Readonly<Record<string, string>>;
  observationWorkTargets: Readonly<Record<string, string>>;
  prep: DevelopPreparation | null;
  prepError: string | null;
  preparing: boolean;
  commissioning: boolean;
  commissionError: string | null;
  attentionMap: WholeManuscriptAttentionMap | null;
  attentionBusy: boolean;
  attentionError: string | null;
  attentionProgress: string | null;
  selectedAttentionItemId: string | null;
  chapterReview: WholeManuscriptAttentionMap | null;
  chapterReviewBusy: boolean;
  chapterNeedsCheckpoint: boolean;
  chapterReviewError: string | null;
  chapterReviewProgress: string | null;
  chapterProtect: WholeManuscriptAttentionMap | null;
  chapterProtectBusy: boolean;
  chapterProtectError: string | null;
  chapterScorecard: WholeManuscriptAttentionMap | null;
  previousChapterScorecard: WholeManuscriptAttentionMap | null;
  previousChapterScoreRevision: number | null;
  chapterScoreBusy: boolean;
  chapterScoreError: string | null;
  chapterMinimalPath: WholeManuscriptAttentionMap | null;
  chapterMinimalPathBusy: boolean;
  chapterMinimalPathError: string | null;
  chapterBookFit: WholeManuscriptAttentionMap | null;
  chapterBookFitBusy: boolean;
  chapterBookFitError: string | null;
  chapterMovement: WholeManuscriptAttentionMap | null;
  chapterMovementBusy: boolean;
  chapterMovementError: string | null;
  writerUnderstanding: WriterUnderstanding | null;
  writerUnderstandingBusy: boolean;
  writerUnderstandingError: string | null;
  developmentalOrientation: DevelopmentalOrientation | null;
  developmentalOrientationBusy: boolean;
  developmentalOrientationError: string | null;
  selectedDevelopmentalMovementId: string | null;
  lineageOrientation: IntellectualLineageOrientation | null;
  lineageBusy: boolean;
  lineageError: string | null;
  chapterLineage: ChapterLineageScan | null;
  chapterLineageBusy: boolean;
  chapterLineageError: string | null;
  selectedLineageCandidateId: string | null;
  scope: DevelopScopeChoice;
  sectionScope: Extract<DevelopScopeChoice, { kind: 'section' }> | null;
  chapterScope: Extract<DevelopScopeChoice, { kind: 'chapter' }> | null;
  themes: LiveThemesPayload | null | undefined;
  themeBusy: boolean;
  themeError: string | null;
  onField: (field: DevelopField) => void;
  onIntent: (intent: DevelopIntentKey, field: Exclude<DevelopField, 'overview'>) => void;
  onMode: (mode: 'home' | 'write' | 'develop' | 'review') => void;
  onOpenCraft: () => void;
  onSection: (sectionId: string) => void;
  onReading: (readingId: string) => void;
  onScope: (scope: DevelopScopeChoice) => void;
  onCommission: () => void;
  onReadChapter: () => void;
  onCheckpointAndReadChapter: () => void;
  onReadChapterInBook: () => void;
  onProtectChapter: () => void;
  onReadChapterMovement: () => void;
  onScoreChapter: () => void;
  onMinimalPathChapter: () => void;
  onCommissionAttentionMap: () => void;
  onShowAttentionItem: (itemId: string, sectionId: string) => void;
  onWorkWithAttentionItem: (
    itemId: string,
    sectionId: string,
    source: 'chapter-review' | 'minimal-path' | 'attention-map',
    craftFromConversation?: {
      sourceThreadId: string;
      sourceMaiaTurnIndex: number;
      sourceMaiaTurnBody: string;
    },
  ) => void;
  onCraftFromConversation: (
    sectionId: string,
    carry: {
      sourceThreadId: string;
      sourceMaiaTurnIndex: number;
      sourceMaiaTurnBody: string;
    },
  ) => void;
  onDiscussAttentionItem: (item: AttentionItem) => void;
  onSaveWriterUnderstanding: (draft: WriterUnderstandingDraft) => void;
  onReflectDevelopmentalProcess: () => void;
  onDevelopmentalMovement: (movementId: string | null) => void;
  onScanLineage: () => void;
  onInvestigateChapterLineage: (chapterRootId: string) => void;
  onSelectLineageCandidate: (chapterRootId: string, candidateId: string) => void;
  onShowLineageCandidate: (chapterRootId: string, candidateId: string, sectionId: string) => void;
  onPrepare: () => void;
  onGoToObservation: (readingId: string, observationKey: string, sectionId: string) => void;
  onWorkWithObservation: (readingId: string, observationKey: string, sectionId: string) => void;
  onThemeMutation: (mutation:
    | { action: 'accept-candidate'; readingId: string; observationId: string }
    | { action: 'rename-candidate'; readingId: string; observationId: string; label: string }
    | { action: 'reject-candidate'; readingId: string; observationId: string }
    | { action: 'declare'; label: string }
    | { action: 'rename-theme'; themeId: string; label: string }
    | { action: 'reject-theme'; themeId: string }
    | { action: 'restore-theme'; themeId: string }
  ) => void;
}

function DevelopMark() {
  return (
    <div className="fr-dev-mark" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M11 20v-9" /><path d="M11 12c-.4-3.6-2.8-5.8-6-6 .2 3.4 2.6 5.8 6 6z" />
        <path d="M11 12c.4-3.6 2.8-5.8 6-6-.2 3.4-2.6 5.8-6 6z" /><path d="M11 9.5c-1.6-1.8-1.6-4.2 0-6 1.6 1.8 1.6 4.2 0 6z" />
      </svg>
    </div>
  );
}

function ManuscriptRail({ sections, currentSectionId, onSection }: {
  sections: readonly RebuildSection[];
  currentSectionId: string | null;
  onSection: (id: string) => void;
}) {
  // The same navigable outline as Write, projected from stored heading evidence.
  // Include deeper and unnamed sections; duplicate headings retain distinct IDs.
  const tree = outlineTree(sections.map(section => ({
    draftSectionId: section.draftSectionId, position: section.position,
    heading: section.heading, depth: section.headingDepth,
  })));
  const flatten = (nodes: typeof tree): typeof tree => nodes.flatMap(node => [node, ...flatten(node.children)]);
  return <WriteManuscriptRail fixture={{
    heading: 'Manuscript', currentChapterId: currentSectionId ?? '',
    chapters: flatten(tree).map(node => ({id: node.draftSectionId,
      label: node.heading?.trim() || 'Untitled section', role: node.role, depth: node.depth})),
  }} onOpenChapter={onSection} />;
}

function SavedReadings({ field, summaries, loading, onReading }: {
  field: DevelopField;
  summaries: readonly ReadingSummary[];
  loading: boolean;
  onReading: (id: string) => void;
}) {
  const matches = field === 'overview' ? summaries : summaries.filter((s) => s.commissionedLens === field);
  if (loading) return <p className="p4r1-empty">Opening saved readings…</p>;
  if (matches.length === 0) return <p className="p4r1-empty">No saved reading here yet.</p>;
  return (
    <div className="p4r1-saved-list">
      {matches.map((summary) => (
        <button key={summary.id} type="button" onClick={() => onReading(summary.id)}>
          <span>{new Date(summary.frozenAt).toLocaleDateString()}</span>
          <b>{summary.commissionedLens}</b>
          <small>{summary.outcome === 'none' ? 'complete · nothing noticed' : `${summary.observationCount} observation${summary.observationCount === 1 ? '' : 's'}`}</small>
        </button>
      ))}
    </div>
  );
}

function sectionWordCount(section: RebuildSection): number {
  let body = section.body ?? '';
  const heading = section.heading?.trim();
  if (heading && body.trimStart().startsWith(heading)) {
    body = body.trimStart().slice(heading.length);
  }
  return body.trim() ? body.trim().split(/\s+/).length : 0;
}

function openingEpigraph(section: RebuildSection): string | null {
  let body = section.body ?? '';
  const heading = section.heading?.trim();
  if (heading && body.trimStart().startsWith(heading)) {
    body = body.trimStart().slice(heading.length);
  }
  const opening = body.trim().split(/\n\s*\n+/)[0]?.trim() ?? '';
  if (!opening || opening.length > 900) return null;
  return /^[“"‘']/.test(opening) ? opening : null;
}

function ChapterShape({ manuscriptId, sections, scope }: {
  manuscriptId: string;
  sections: readonly RebuildSection[];
  scope: Extract<DevelopScopeChoice, { kind: 'chapter' }>;
}) {
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const from = sections.findIndex((section) => section.draftSectionId === scope.fromSectionId);
  const to = sections.findIndex((section) => section.draftSectionId === scope.toSectionId);
  if (from < 0 || to < from) return null;

  const chapter = sections.slice(from, to + 1);
  const root = chapter[0] ?? null;
  const epigraph = root ? openingEpigraph(root) : null;
  const chapterWords = chapter.reduce((sum, section) => sum + sectionWordCount(section), 0);

  // Only an explicit heading depth is structural evidence. Generic ALL-CAPS
  // cuts are useful ingestion coordinates, but they are not authored hierarchy.
  const explicit = chapter
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.heading?.trim()) && section.headingDepth !== null)
    .filter(({ section }) => section.draftSectionId !== root?.draftSectionId);

  const detectedOnly = chapter
    .filter((section) => Boolean(section.heading?.trim()) && section.headingDepth === null);

  const wordsInExplicitSpan = (index: number, depth: number): number => {
    let end = chapter.length;
    for (let i = index + 1; i < chapter.length; i += 1) {
      const nextDepth = chapter[i]?.headingDepth;
      if (nextDepth !== null && nextDepth !== undefined && nextDepth <= depth) {
        end = i;
        break;
      }
    }
    return chapter.slice(index, end)
      .reduce((sum, section) => sum + sectionWordCount(section), 0);
  };

  return (
    <section className="fr-card p4r1-chapter-shape" aria-label="Chapter shape from the manuscript">
      <span className="p4r1-eyebrow">The chapter as it is</span>
      <h3>{scope.label}</h3>
      <p>
        {chapterWords.toLocaleString()} words in this chapter span. Writer’s Studio separates structure the
        manuscript explicitly preserved from headings the import merely detected, so an ingestion cut is never
        presented as an authored section.
      </p>
      {epigraph ? (
        <blockquote className="p4r1-chapter-epigraph">
          <span>Opening epigraph</span>
          <p>{epigraph}</p>
        </blockquote>
      ) : null}

      {explicit.length > 0 ? (
        <>
          <span className="p4r1-eyebrow">Explicit structure preserved by the manuscript</span>
          <ol className="p4r1-chapter-outline">
            {explicit.map(({ section, index }) => (
              <li key={section.draftSectionId} data-depth={section.headingDepth ?? undefined}>
                <span>{section.heading?.trim()}</span>
                <small>
                  {wordsInExplicitSpan(index, section.headingDepth ?? 3).toLocaleString()} words
                </small>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p>
          No subchapter hierarchy survived this import with enough evidence to call it authored structure.
          MAIA should not infer one from storage boundaries.
        </p>
      )}

      {detectedOnly.length > 0 ? (
        <div className="p4r1-structure-recovery" data-structure-recovery>
          <b>Some of this chapter’s hierarchy was lost in import.</b>
          <p>
            Writer’s Studio can see the headings, but some of their levels were lost in import.
            MAIA can suggest the chapter’s shape. You can correct it before anything changes.
          </p>
          <button
            type="button"
            disabled={recovering}
            onClick={async () => {
              if (recovering) return;
              setRecovering(true);
              setRecoveryError(null);
              const result = await requestStructureReading(manuscriptId);
              setRecovering(false);
              if (!result.ok) {
                setRecoveryError('MAIA could not prepare a structure proposal just now. Nothing changed.');
                return;
              }
              window.location.assign(result.reviewPath);
            }}
          >
            {recovering ? 'Reading the manuscript…' : 'Restore chapter structure'}
          </button>
          {recoveryError ? <p role="status">{recoveryError}</p> : null}
        </div>
      ) : null}

      {detectedOnly.length > 0 ? (
        <details className="p4r1-chapter-detected">
          <summary>Import details</summary>
          <p>
            {detectedOnly.length} headings were detected whose level was not preserved. They remain visible
            without being treated as chapters or numbered sections.
          </p>
          <ol className="p4r1-chapter-outline">
            {detectedOnly.map((section) => (
              <li key={section.draftSectionId}>
                <span>{section.heading?.trim()}</span>
                <small>level unconfirmed</small>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </section>
  );
}

function ScopeChooser({ scope, sections, sectionScope, chapterScope, onScope }: {
  scope: DevelopScopeChoice;
  sections: readonly RebuildSection[];
  sectionScope: Extract<DevelopScopeChoice, { kind: 'section' }> | null;
  chapterScope: Extract<DevelopScopeChoice, { kind: 'chapter' }> | null;
  onScope: (scope: DevelopScopeChoice) => void;
}) {
  const from = scope.kind === 'range' ? scope.fromIndex : 0;
  const to = scope.kind === 'range' ? scope.toIndex : Math.max(0, sections.length - 1);
  return (
    <div className="p4r1-scope" aria-label="Where MAIA reads">
      <span className="p4r1-scope-label">Read</span>
      {sectionScope ? (
        <button type="button" aria-pressed={scope.kind === 'section'} onClick={() => onScope(sectionScope)}>
          Current section
        </button>
      ) : null}
      {chapterScope ? (
        <button type="button" aria-pressed={scope.kind === 'chapter'} onClick={() => onScope(chapterScope)}>
          Current chapter
        </button>
      ) : null}
      <button type="button" aria-pressed={scope.kind === 'whole'} onClick={() => onScope({ kind: 'whole' })}>Whole Work</button>
      <button type="button" aria-pressed={scope.kind === 'range'} onClick={() => onScope({ kind: 'range', fromIndex: from, toIndex: to })}>Choose a range</button>
      {scope.kind === 'range' ? (
        <div className="p4r1-range">
          <select value={from} onChange={(e) => {
            const n = Number(e.target.value);
            onScope({ kind: 'range', fromIndex: n, toIndex: Math.max(n, to) });
          }}>
            {sections.map((s, i) => <option key={s.draftSectionId} value={i}>{s.heading ?? `Section ${i + 1}`}</option>)}
          </select>
          <span>to</span>
          <select value={to} onChange={(e) => onScope({ kind: 'range', fromIndex: from, toIndex: Number(e.target.value) })}>
            {sections.map((s, i) => <option key={s.draftSectionId} value={i} disabled={i < from}>{s.heading ?? `Section ${i + 1}`}</option>)}
          </select>
        </div>
      ) : null}
    </div>
  );
}

function ReadingField({
  reading,
  field,
  selectedObservationKey,
  onSelectObservation,
  onTalkObservation,
  onTeachObservation,
  onDeepObservation,
  onGoToObservation,
  onWorkWithObservation,
  targets,
  workTargets,
}: {
  reading: ReadingView;
  field: DevelopField;
  selectedObservationKey: string | null;
  onSelectObservation: (key: string) => void;
  onTalkObservation: (key: string) => void;
  onTeachObservation: (key: string) => void;
  onDeepObservation: (key: string) => void;
  onGoToObservation: (readingId: string, observationKey: string, sectionId: string) => void;
  onWorkWithObservation: (readingId: string, observationKey: string, sectionId: string) => void;
  targets: Readonly<Record<string, string>>;
  workTargets: Readonly<Record<string, string>>;
}) {
  if (reading.outcome === 'none') {
    return (
      <div className="p4r1-reading-field">
        <div className="p4r1-reading-meta">
          <span>{reading.coverage.sentence}</span>
          <span>Read {new Date(reading.frozenAt).toLocaleDateString()}</span>
          <span>{reading.stateLabel}</span>
        </div>
        <div className="fr-card p4r1-reading-none">
          <span className="p4r1-eyebrow">MAIA completed this reading</span>
          <h4>Nothing admissible stood out here.</h4>
          <p>
            MAIA read this scope for {LABEL[field].toLowerCase()} and did not find an observation
            she could support with the evidence available.
          </p>
        </div>
      </div>
    );
  }

  const observations = reading.observations;
  const selectedIndex = Math.max(
    0,
    observations.findIndex((observation) => observation.key === selectedObservationKey),
  );
  const observation = observations[selectedIndex] ?? observations[0]!;
  const sectionId = targets[observation.key];
  const workSectionId = workTargets[observation.key];

  return (
    <div className="p4r1-reading-field">
      <div className="p4r1-reading-meta">
        <span>{reading.coverage.sentence}</span>
        <span>Read {new Date(reading.frozenAt).toLocaleDateString()}</span>
        <span>{reading.stateLabel}</span>
      </div>

      <section className="p4r1-discovery">
        <div className="p4r1-discovery-top">
          <div>
            <span className="p4r1-eyebrow">One thing MAIA noticed</span>
            <span className="p4r1-discovery-count">
              {selectedIndex + 1} of {observations.length}
            </span>
          </div>
          <span className="p4r1-discovery-kind">
            {observation.phenomenonLabel ?? LABEL[field]}
          </span>
        </div>

        {(() => {
          const friendly = friendlyObservation(observation.phenomenonLabel);
          return (
            <div className="p4r1-discovery-human">
              <h4>{friendly.title}</h4>
              <p>{friendly.lead}</p>
              <details>
                <summary>See the saved reading in full</summary>
                <blockquote>{observation.observation}</blockquote>
              </details>
            </div>
          );
        })()}

        <div className="p4r1-discovery-plain">
          <b>You do not have to decide what this means alone</b>
          <p>
            MAIA can put the reading into ordinary language, show you the exact places she was responding to,
            and stay with the question while you decide whether anything here matters for your Work.
          </p>
        </div>

        <div className="p4r1-discovery-actions">
          {workSectionId ? (
            <button
              type="button"
              className="p4r1-discovery-primary"
              onClick={() => onWorkWithObservation(reading.id, observation.key, workSectionId)}
            >
              Stay with this in Write
            </button>
          ) : null}
          {sectionId ? (
            <button
              type="button"
              onClick={() => onGoToObservation(reading.id, observation.key, sectionId)}
            >
              Show me in the manuscript
            </button>
          ) : null}
          <button type="button" onClick={() => onTalkObservation(observation.key)}>
            Talk with MAIA
          </button>
          <button type="button" onClick={() => onTeachObservation(observation.key)}>
            Help me understand
          </button>
          <button type="button" onClick={() => onDeepObservation(observation.key)}>
            Go deeper
          </button>
        </div>

        {observations.length > 1 ? (
          <div className="p4r1-discovery-nav">
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => onSelectObservation(observations[Math.max(0, selectedIndex - 1)]!.key)}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={selectedIndex >= observations.length - 1}
              onClick={() => onSelectObservation(observations[Math.min(observations.length - 1, selectedIndex + 1)]!.key)}
            >
              See another
            </button>
          </div>
        ) : null}

        <details className="p4r1-discovery-detail">
          <summary>See the evidence and limits</summary>
          <div>
            <h5>What this rests on</h5>
            {observation.evidence.map((evidence) => <p key={evidence}>{evidence}</p>)}
            <h5>What this does not establish</h5>
            {observation.limits.map((limit) => (
              <p key={limit.name}><b>{limit.name}</b> — {limit.meaning}</p>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}

function ThemeField({ payload, busy, error, onMutation, onTalkCandidate }: {
  payload: LiveThemesPayload | null | undefined;
  busy: boolean;
  error: string | null;
  onMutation: P4R1DevelopViewProps['onThemeMutation'];
  onTalkCandidate: (candidate: LiveThemeCandidate) => void;
}) {
  const [draft, setDraft] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [pace, setPace] = useState<WorkingPace>(DEFAULT_WORKING_STYLE.pace);
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>(DEFAULT_WORKING_STYLE.explanation);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [held, setHeld] = useState<ReadonlySet<string>>(new Set());
  const [rested, setRested] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      const style = readWorkingStyle();
      setPace(style.pace);
      setExplanationDepth(style.explanation);
    };
    sync();
    window.addEventListener('writers-studio-working-style-changed', sync as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('writers-studio-working-style-changed', sync as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!payload || typeof window === 'undefined') return;
    const key = `writers-studio:noticings:${payload.manuscriptId}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { held?: string[]; rested?: string[] };
      setHeld(new Set(Array.isArray(parsed.held) ? parsed.held : []));
      setRested(new Set(Array.isArray(parsed.rested) ? parsed.rested : []));
    } catch {
      // A presentation preference failure must never block the reading.
    }
  }, [payload?.manuscriptId]);

  if (payload === undefined) return <p className="p4r1-empty">Opening Themes…</p>;
  if (payload === null) return <p className="p4r1-empty">Themes are unavailable just now. Nothing has changed.</p>;

  const selected = payload.themes.find((theme) => theme.id === selectedThemeId) ?? payload.themes[0] ?? null;
  const updateWorkingStyle = (next: { pace?: WorkingPace; explanation?: ExplanationDepth }) => {
    writeWorkingStyle({
      pace: next.pace ?? pace,
      explanation: next.explanation ?? explanationDepth,
    });
  };
  const noticingKey = (candidate: LiveThemeCandidate) => `${candidate.readingId}:${candidate.observationId}`;
  const availableCandidates = payload.candidates.filter((candidate) => !rested.has(noticingKey(candidate)));
  const safeIndex = availableCandidates.length === 0 ? 0 : Math.min(candidateIndex, availableCandidates.length - 1);
  const shownCandidates = pace === 'mapped'
    ? availableCandidates
    : pace === 'guided'
      ? availableCandidates.slice(0, 3)
      : availableCandidates.slice(safeIndex, safeIndex + 1);

  const persistNoticings = (nextHeld: ReadonlySet<string>, nextRested: ReadonlySet<string>) => {
    setHeld(nextHeld);
    setRested(nextRested);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`writers-studio:noticings:${payload.manuscriptId}`, JSON.stringify({
        held: [...nextHeld], rested: [...nextRested],
      }));
    } catch {
      // Incubation state is supportive UI, never a prerequisite for writing.
    }
  };

  const keepNearby = (candidate: LiveThemeCandidate) => {
    const key = noticingKey(candidate);
    const nextHeld = new Set(held); nextHeld.add(key);
    const nextRested = new Set(rested); nextRested.delete(key);
    persistNoticings(nextHeld, nextRested);
  };

  const letRest = (candidate: LiveThemeCandidate) => {
    const key = noticingKey(candidate);
    const nextHeld = new Set(held); nextHeld.delete(key);
    const nextRested = new Set(rested); nextRested.add(key);
    persistNoticings(nextHeld, nextRested);
    if (pace === 'intimate' && availableCandidates.length > 1) {
      setCandidateIndex((safeIndex + 1) % Math.max(1, availableCandidates.length - 1));
    }
  };

  return (
    <>
      <div className="fr-hero" data-landmark="hero">
        <img src={IMAGES.heroThemes} alt="" />
      </div>
      <div className="fr-sec-h">
        <div>
          <h3>Themes</h3>
          <p>Themes you have chosen to carry in this Work. MAIA’s noticings stay provisional until you decide otherwise.</p>
        </div>
      </div>

      <details className="p4r1-theme-working-style">
        <summary>Working style · {PACE_COPY[pace].label} · {EXPLANATION_COPY[explanationDepth].label}</summary>
        <div className="p4r1-theme-working-style-body">
          <label>
            <span><b>How much MAIA shows at once</b><em>{PACE_COPY[pace].description}</em></span>
            <input type="range" min={0} max={PACE_VALUES.length - 1} step={1}
              value={PACE_VALUES.indexOf(pace)} aria-valuetext={PACE_COPY[pace].label}
              onChange={(event) => updateWorkingStyle({ pace: PACE_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.pace })} />
          </label>
          <div className="p4r1-theme-style-scale p4r1-theme-style-scale-three" aria-hidden="true">
            {PACE_VALUES.map((value) => <span key={value}>{PACE_COPY[value].label}</span>)}
          </div>
          <label>
            <span><b>How MAIA explains what she sees</b><em>{EXPLANATION_COPY[explanationDepth].description}</em></span>
            <input type="range" min={0} max={EXPLANATION_VALUES.length - 1} step={1}
              value={EXPLANATION_VALUES.indexOf(explanationDepth)} aria-valuetext={EXPLANATION_COPY[explanationDepth].label}
              onChange={(event) => updateWorkingStyle({ explanation: EXPLANATION_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.explanation })} />
          </label>
          <div className="p4r1-theme-style-scale" aria-hidden="true">
            {EXPLANATION_VALUES.map((value) => <span key={value}>{EXPLANATION_COPY[value].label}</span>)}
          </div>
          <div className="p4r1-theme-style-preview">
            <span>MAIA would say</span>
            <p>{EXPLANATION_COPY[explanationDepth].preview}</p>
          </div>
        </div>
      </details>

      {error ? <p className="p4r1-error" role="status">{error}</p> : null}

      <div className="p4r1-theme-declare">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Name a theme you want to hold…" />
        <button type="button" disabled={busy || !draft.trim()} onClick={() => {
          const label = draft.trim();
          if (!label) return;
          onMutation({ action: 'declare', label });
          setDraft('');
        }}>Add your theme</button>
      </div>

      {payload.themes.length === 0 ? (
        <p className="p4r1-empty">No governed themes yet. You can name one yourself or commission a Themes reading.</p>
      ) : (
        <div className="fr-themes">
          {payload.themes.map((theme) => (
            <button key={theme.id} type="button" className="fr-theme"
              aria-pressed={selected?.id === theme.id} onClick={() => setSelectedThemeId(theme.id)}>
              <span className="p4r1-theme-orb" aria-hidden="true" />
              <span className="fr-theme-text">
                <b>{theme.label}</b>
                <span>{theme.provenance === 'member-declared' ? 'Named by you' : 'Accepted from a MAIA reading'} · {theme.sourceState}</span>
              </span>
              <span className="fr-range">
                {theme.projection ? `${theme.projection.coverage.read}/${theme.projection.coverage.total}` : '—'}
              </span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}

      {payload.candidates.length > 0 ? (
        <section className="fr-card p4r1-theme-candidates">
          <h4>Noticings</h4>
          <p className="fr-sub">Interesting things MAIA sees. You do not need to decide what they mean yet.</p>
          <p className="p4r1-noticing-pace">
            {pace === 'intimate'
              ? 'Showing one at a time.'
              : pace === 'guided'
                ? 'Showing a few at a time.'
                : 'Showing the wider field.'}
          </p>
          {shownCandidates.map((candidate) => {
            const key = noticingKey(candidate);
            return (
              <div key={key} className="p4r1-theme-candidate p4r1-noticing">
                <div>
                  <div className="p4r1-noticing-title">
                    <b>{candidate.label}</b>
                    {held.has(key) ? <span>kept nearby</span> : null}
                  </div>
                  <p>{candidate.observation}</p>
                </div>
                <div className="p4r1-noticing-actions">
                  <button type="button" disabled={busy} onClick={() => onTalkCandidate(candidate)}>Talk about this</button>
                  <button type="button" disabled={busy || held.has(key)} onClick={() => keepNearby(candidate)}>
                    {held.has(key) ? 'Kept nearby' : 'Keep nearby'}
                  </button>
                  <button type="button" disabled={busy} onClick={() => letRest(candidate)}>Let rest</button>
                  <details>
                    <summary>More</summary>
                    <div>
                      <button type="button" disabled={busy}
                        onClick={() => onMutation({ action: 'accept-candidate', readingId: candidate.readingId, observationId: candidate.observationId })}>Add to Themes</button>
                      <button type="button" disabled={busy}
                        onClick={() => onMutation({ action: 'reject-candidate', readingId: candidate.readingId, observationId: candidate.observationId })}>Dismiss</button>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
          {pace === 'intimate' && availableCandidates.length > 1 ? (
            <button type="button" className="p4r1-noticing-next"
              onClick={() => setCandidateIndex((safeIndex + 1) % availableCandidates.length)}>
              See another noticing
            </button>
          ) : null}
          {availableCandidates.length === 0 ? (
            <p className="p4r1-empty">Nothing else needs your attention here right now.</p>
          ) : null}
        </section>
      ) : null}

      {selected ? (
        <div className="fr-lower">
          <section className="fr-card">
            <h4>{selected.label} across the Work</h4>
            <p className="fr-sub">
              {selected.projection
                ? `Evidence mapped across ${selected.projection.coverage.read} of ${selected.projection.coverage.total} sections.`
                : selected.sourceState === 'current'
                  ? 'No admitted occurrences are mapped yet.'
                  : 'This theme’s evidence is historical or not currently measured.'}
            </p>
            {selected.projection?.trajectory.length ? (
              <ol className="p4r1-trajectory">
                {selected.projection.trajectory.map((point) => (
                  <li key={point.sectionId}>
                    <span>{point.label}</span><b>{point.occurrenceCount}</b>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
          <section className="fr-card">
            <h4>Theme authority</h4>
            <p className="fr-sub">{selected.provenance === 'member-declared' ? 'This theme is yours.' : 'This theme came from a frozen MAIA observation you accepted.'}</p>
            <div className="p4r1-theme-govern">
              {selected.standing === 'rejected' ? (
                <button type="button" disabled={busy} onClick={() => onMutation({ action: 'restore-theme', themeId: selected.id })}>Restore</button>
              ) : (
                <button type="button" disabled={busy} onClick={() => onMutation({ action: 'reject-theme', themeId: selected.id })}>Set aside</button>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function PreparationNotice({ prep, error, preparing, onPrepare }: {
  prep: DevelopPreparation | null;
  error: string | null;
  preparing: boolean;
  onPrepare: () => void;
}) {
  if (error) return <div className="fr-card p4r1-prep"><p>Whether this Work is ready for Develop could not be established. Nothing has changed.</p></div>;
  if (!prep || prep.kind === 'ready') return null;
  const canPrepare = prep.kind === 'exact' || prep.kind === 'diverged' || prep.kind === 'no_draft';
  return (
    <div className="fr-card p4r1-prep">
      <h4>Prepare this Work for Develop</h4>
      <p>
        {prep.kind === 'no_source' ? 'There is nothing here to read yet.'
          : prep.kind === 'unresolvable' ? 'The draft cannot be divided safely without guessing.'
            : prep.kind === 'indeterminate' ? 'The draft could not be measured just now.'
              : 'This Work needs a section-addressable draft before MAIA can read it developmentally.'}
      </p>
      {canPrepare ? <button type="button" disabled={preparing} onClick={onPrepare}>{preparing ? 'Preparing…' : prep.kind === 'diverged' ? 'Review and confirm' : 'Prepare for Develop'}</button> : null}
    </div>
  );
}

const INTENT_STARTERS: ReadonlyArray<{
  key: DevelopIntentKey;
  label: string;
  detail: string;
  field: Exclude<DevelopField, 'overview'>;
  reflection: string;
  proposal: string;
}> = [
  {
    key: 'feels-off',
    label: 'Something feels off',
    detail: 'Start with what feels different, confusing, flat, rushed, or hard to name.',
    field: 'development',
    reflection: 'You do not have to name the problem yet.',
    proposal: 'I can start with what I have already noticed about how this part of the Work is developing, then we can decide whether I need to read anything more.',
  },
  {
    key: 'shape',
    label: 'Help me see the shape',
    detail: 'See how this chapter or Work is put together and where its movements connect.',
    field: 'structure',
    reflection: 'You want to see the shape before deciding what, if anything, needs changing.',
    proposal: 'I can begin with the structure I have already read and show you one concrete pattern in how the parts are arranged.',
  },
  {
    key: 'thread',
    label: "I'm losing the thread",
    detail: 'Follow an idea, image, question, or line of movement through the Work.',
    field: 'continuity',
    reflection: 'You are trying to follow something that feels as though it may be dropping out or changing.',
    proposal: 'I can begin with continuity evidence I already have and show you where that thread appears, disappears, or returns.',
  },
  {
    key: 'voice',
    label: "This doesn't sound like me",
    detail: 'Look at shifts in voice, cadence, distance, and language.',
    field: 'voice',
    reflection: 'You are hearing a change in the writing and want to understand what changed on the page.',
    proposal: 'I can start with the voice observations I already have and take you to one exact place where the writing shifts.',
  },
  {
    key: 'chapter-role',
    label: "I'm not sure what this chapter is doing",
    detail: 'Stay with the chapter and see how its movement relates to the larger Work.',
    field: 'arc',
    reflection: 'You are wondering what movement this chapter contributes to the larger Work.',
    proposal: 'I can start with what I already read about this part of the arc and show you one place where its direction becomes visible.',
  },
  {
    key: 'recurrence',
    label: 'Show me what keeps appearing',
    detail: 'See recurring images, phrases, places, or themes without forcing a pattern.',
    field: 'themes',
    reflection: 'You want to see recurrence without being told what it has to mean.',
    proposal: 'I can show you what has already been admitted as recurring evidence, and keep candidates separate from themes you have actually chosen.',
  },
  {
    key: 'reader',
    label: 'Where might a reader lose me?',
    detail: 'Look at what a reader may know here and where orientation could become uncertain.',
    field: 'reader',
    reflection: 'You want to check orientation from a possible reader point of view, not receive a verdict about the writing.',
    proposal: 'I can begin with the reader-perspective observations I already have and keep them explicitly hypothetical.',
  },
  {
    key: 'help-look',
    label: "I don't know — help me look",
    detail: 'Begin with one concrete thing MAIA can support with evidence.',
    field: 'development',
    reflection: 'You do not need a diagnosis to begin.',
    proposal: 'I can start with one concrete observation I can support from what I already read, and you can decide whether it is worth following.',
  },
];

function intentStarter(key: DevelopIntentKey | null) {
  return key ? INTENT_STARTERS.find((starter) => starter.key === key) ?? null : null;
}

function readingsForField(
  field: Exclude<DevelopField, 'overview'>,
  summaries: readonly ReadingSummary[],
): ReadingSummary[] {
  return summaries.filter((summary) => summary.commissionedLens === field);
}

function latestForField(
  field: Exclude<DevelopField, 'overview'>,
  summaries: readonly ReadingSummary[],
): ReadingSummary | null {
  return readingsForField(field, summaries)[0] ?? null;
}

function ReadingSummaryButton({
  summary,
  onReading,
  prominent = false,
}: {
  summary: ReadingSummary;
  onReading: (id: string) => void;
  prominent?: boolean;
}) {
  return (
    <button
      type="button"
      className={prominent ? 'p4r1-reading-summary p4r1-reading-summary--prominent' : 'p4r1-reading-summary'}
      onClick={() => onReading(summary.id)}
    >
      <span className="p4r1-reading-summary-date">{new Date(summary.frozenAt).toLocaleDateString()}</span>
      <b>{summary.outcome === 'none' ? 'Complete reading · nothing admissible noticed' : `${summary.observationCount} observation${summary.observationCount === 1 ? '' : 's'}`}</b>
      <span>{prominent ? 'Open this reading' : (LABEL[summary.commissionedLens as Exclude<DevelopField, 'overview'>] ?? summary.commissionedLens)}</span>
    </button>
  );
}

function ReadingHistory({
  field,
  summaries,
  loading,
  onReading,
}: {
  field: DevelopField;
  summaries: readonly ReadingSummary[];
  loading: boolean;
  onReading: (id: string) => void;
}) {
  if (loading) {
    return <p className="p4r1-history-state">Opening saved readings…</p>;
  }
  const matches = field === 'overview'
    ? summaries
    : summaries.filter((summary) => summary.commissionedLens === field);
  if (matches.length === 0) return null;

  return (
    <details className="p4r1-reading-history-disclosure">
      <summary>
        {field === 'overview'
          ? `${matches.length} saved reading${matches.length === 1 ? '' : 's'}`
          : `${matches.length} earlier ${LABEL[field]} reading${matches.length === 1 ? '' : 's'}`}
      </summary>
      <div className="p4r1-reading-history-list">
        {matches.map((summary) => (
          <ReadingSummaryButton key={summary.id} summary={summary} onReading={onReading} />
        ))}
      </div>
    </details>
  );
}

function FieldContinue({
  field,
  summaries,
  loading,
  onReading,
}: {
  field: Exclude<DevelopField, 'overview'>;
  summaries: readonly ReadingSummary[];
  loading: boolean;
  onReading: (id: string) => void;
}) {
  if (loading) {
    return <div className="fr-card p4r1-latest-reading"><p>Opening what MAIA has already read…</p></div>;
  }
  const latest = latestForField(field, summaries);
  if (!latest) {
    return (
      <div className="fr-card p4r1-latest-reading p4r1-latest-reading--empty">
        <span>Not read yet</span>
        <h4>MAIA hasn’t read this Work for {LABEL[field]} yet.</h4>
        <p>You can choose exactly what she reads below.</p>
      </div>
    );
  }
  return (
    <div className="fr-card p4r1-latest-reading">
      <span>Continue from what MAIA already read</span>
      <h4>{new Date(latest.frozenAt).toLocaleDateString()} · {LABEL[field]}</h4>
      <p>
        {latest.outcome === 'none'
          ? `MAIA completed this reading and did not find a ${LABEL[field].toLowerCase()} observation she could support with evidence.`
          : `${latest.observationCount} observation${latest.observationCount === 1 ? '' : 's'} are saved with this frozen reading.`}
      </p>
      <ReadingSummaryButton summary={latest} onReading={onReading} prominent />
    </div>
  );
}

function IntellectualLineagePanel({
  orientation,
  busy,
  error,
  sections,
  manuscriptState,
  developmentalLens,
  chapterBusy,
  onScan,
  onInvestigateChapter,
}: {
  orientation: IntellectualLineageOrientation | null;
  busy: boolean;
  error: string | null;
  sections: readonly RebuildSection[];
  manuscriptState: LivingWork['manuscriptState'];
  developmentalLens: { label: string; questionForWriter: string } | null;
  chapterBusy: boolean;
  onScan: () => void;
  onInvestigateChapter: (chapterRootId: string) => void;
}) {
  const labelBySection = new Map(
    sections.map((section) => [
      section.draftSectionId,
      section.heading?.trim() || 'Chapter',
    ] as const),
  );
  const process = lineageProcessForState(manuscriptState);
  const processLabel = manuscriptState === 'existing-manuscript'
    ? 'Existing-manuscript research'
    : manuscriptState === 'partial-manuscript'
      ? 'Partial-manuscript research'
      : manuscriptState === 'pre-manuscript'
        ? 'Pre-manuscript exploration'
        : 'Research orientation';
  const processSummary = manuscriptState === 'existing-manuscript'
    ? 'Trace the intellectual field across the whole manuscript, then move into chapters and exact claims only when useful.'
    : manuscriptState === 'partial-manuscript'
      ? 'Keep what is already written separate from what is planned. Research may support unwritten areas prospectively without becoming manuscript evidence.'
      : manuscriptState === 'pre-manuscript'
        ? 'Begin with Sources, Ideas, questions, and distinctions. Explore the intellectual field without pretending a manuscript position already exists.'
        : 'First establish what kind of Work this is before making manuscript-wide lineage claims.';
  if (!orientation) {
    return (
      <section className="fr-card p4r1-lineage-panel" data-lineage-panel>
        <span className="p4r1-eyebrow">Sources · research · intellectual lineage</span>
        <h3>What intellectual world is this Work moving through?</h3>
        {developmentalLens ? (
          <div className="p4r1-lineage-developmental-context">
            <span>Carried developmental lens</span>
            <b>{developmentalLens.label}</b>
            <p>{developmentalLens.questionForWriter}</p>
            <button
              type="button"
              onClick={() => document.querySelector('[data-developmental-orientation]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Return to larger question
            </button>
          </div>
        ) : null}
        <div className="p4r1-lineage-process">
          <span>{processLabel}</span>
          <p>{processSummary}</p>
          <small>{process.claimBoundary}</small>
        </div>
        {manuscriptState === 'pre-manuscript' ? (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.assign('/writers-studio/sources');
            }}
          >
            Explore Sources and Ideas
          </button>
        ) : manuscriptState === null ? (
          <p className="p4r1-lineage-process-note">
            Declare whether this is a pre-manuscript, partial manuscript, or existing manuscript before MAIA makes a whole-Work lineage orientation.
          </p>
        ) : (
          <button type="button" disabled={busy} onClick={onScan}>
            {busy
              ? 'Orienting to the intellectual field…'
              : manuscriptState === 'partial-manuscript'
                ? 'Orient to written and planned intellectual fields'
                : 'Orient to the whole intellectual field'}
          </button>
        )}
        {error ? <p className="p4r1-error" role="status">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="fr-card p4r1-lineage-panel" data-lineage-panel>
      <span className="p4r1-eyebrow">Intellectual lineage · whole-field orientation</span>
      <h3>{orientation.terrains.length} intellectual terrain{orientation.terrains.length === 1 ? '' : 's'} to explore</h3>
      {developmentalLens ? (
        <div className="p4r1-lineage-developmental-context">
          <span>Carried developmental lens</span>
          <b>{developmentalLens.label}</b>
          <p>{developmentalLens.questionForWriter}</p>
          <button
            type="button"
            onClick={() => document.querySelector('[data-developmental-orientation]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Return to larger question
          </button>
        </div>
      ) : null}
      <p>
        Oriented from {orientation.readingIds.length} current whole-manuscript readings and {orientation.bibliographyEntries.length} bibliography entries.
        These are directions for investigation, not attribution verdicts.
      </p>
      <div className="p4r1-lineage-candidates">
        {orientation.terrains.map((terrain) => (
          <details key={terrain.id}>
            <summary>
              <b>{terrain.label}</b>
              <span>
                {terrain.chapterSectionIds.length} chapter locus{terrain.chapterSectionIds.length === 1 ? '' : 'es'}
                {' · '}
                {terrain.bibliographyKeys.length} bibliography lead{terrain.bibliographyKeys.length === 1 ? '' : 's'}
              </span>
            </summary>
            <p>{terrain.description}</p>
            {terrain.uncertainty ? <p><b>Uncertainty:</b> {terrain.uncertainty}</p> : null}
            {terrain.chapterSectionIds.length > 0 ? (
              <div className="p4r1-lineage-chapter-choices">
                <span>Choose a chapter to investigate</span>
                <div>
                  {terrain.chapterSectionIds.map((chapterRootId) => (
                    <button
                      key={chapterRootId}
                      type="button"
                      disabled={chapterBusy}
                      onClick={() => onInvestigateChapter(chapterRootId)}
                    >
                      {labelBySection.get(chapterRootId) ?? 'Chapter'}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </details>
        ))}
      </div>
      <div className="p4r1-lineage-questions">
        <b>Questions worth investigating next</b>
        <ul>
          {orientation.questionsToInvestigate.map((question) => <li key={question}>{question}</li>)}
        </ul>
      </div>
    </section>
  );
}

function ChapterLineagePanel({
  scan,
  busy,
  error,
  developmentalLens,
  selectedCandidateId,
  sourceIntakeHref,
  onShowCandidate,
  onDiscussCandidate,
}: {
  scan: ChapterLineageScan | null;
  busy: boolean;
  error: string | null;
  developmentalLens: { label: string; questionForWriter: string } | null;
  selectedCandidateId: string | null;
  sourceIntakeHref: string;
  onShowCandidate: (chapterRootId: string, candidateId: string, sectionId: string) => void;
  onDiscussCandidate: (candidate: ChapterLineageCandidate) => void;
}) {
  if (!scan && !busy && !error) return null;

  if (busy && !scan) {
    return (
      <section className="fr-card p4r1-chapter-lineage" data-chapter-lineage>
        <span className="p4r1-eyebrow">Chapter investigation</span>
        <h3>Reading this chapter in the context of the whole Work…</h3>
        <p>MAIA is examining actual chapter prose, bibliography leads, and the larger intellectual field.</p>
      </section>
    );
  }

  if (!scan) {
    return (
      <section className="fr-card p4r1-chapter-lineage" data-chapter-lineage>
        <span className="p4r1-eyebrow">Chapter investigation</span>
        <p className="p4r1-error">{error}</p>
      </section>
    );
  }

  const lineageGroups: ReadonlyArray<{
    kind: ChapterLineageCandidate['kind'];
    label: string;
    description: string;
  }> = [
    { kind: 'quotation', label: 'Quotations', description: 'Wording presented as borrowed text that needs source/location custody.' },
    { kind: 'source-derived-claim', label: 'Source-derived claims', description: 'Claims that appear to stand in an identifiable intellectual lineage.' },
    { kind: 'writer-synthesis', label: 'Your syntheses', description: 'Places where inherited material appears to be combined into the Work’s own framework.' },
    { kind: 'writer-original', label: 'Writer-original material', description: 'Material the manuscript presents as originating in this Work or your own teaching practice.' },
    { kind: 'paraphrase', label: 'Paraphrases', description: 'Restatements whose relationship to source wording or your own prior formulation deserves clarity.' },
    { kind: 'uncertain-attribution', label: 'Uncertain attribution', description: 'Relationships worth checking before treating them as sourced or original.' },
  ];

  return (
    <section className="fr-card p4r1-chapter-lineage" data-chapter-lineage>
      <div className="p4r1-chapter-lineage-head">
        <div>
          <span className="p4r1-eyebrow">Chapter lineage · actual prose</span>
          <h3>{scan.chapterHeading}</h3>
          <p>
            {scan.candidates.length} candidate relationship{scan.candidates.length === 1 ? '' : 's'}
            {' · '}
            {scan.sectionIds.length} chapter section{scan.sectionIds.length === 1 ? '' : 's'} read.
          </p>
        </div>
        <div className="p4r1-chapter-lineage-return">
          <button
            type="button"
            onClick={() => document.querySelector('[data-lineage-panel]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Return to whole intellectual field
          </button>
          {developmentalLens ? (
            <button
              type="button"
              onClick={() => document.querySelector('[data-developmental-orientation]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Return to larger question
            </button>
          ) : null}
        </div>
      </div>
      {developmentalLens ? (
        <div className="p4r1-lineage-developmental-context">
          <span>Still carrying</span>
          <b>{developmentalLens.label}</b>
          <p>{developmentalLens.questionForWriter}</p>
        </div>
      ) : null}

      <div className="p4r1-lineage-groups" data-lineage-groups>
        {lineageGroups.map((group) => {
          const candidates = scan.candidates.filter((candidate) => candidate.kind === group.kind);
          if (candidates.length === 0) return null;
          const containsSelected = candidates.some((candidate) => candidate.id === selectedCandidateId);
          return (
            <details
              key={group.kind}
              className="p4r1-lineage-group"
              open={containsSelected || undefined}
              data-lineage-kind={group.kind}
            >
              <summary>
                <div>
                  <b>{group.label}</b>
                  <span>{group.description}</span>
                </div>
                <em>{candidates.length}</em>
              </summary>
              <div className="p4r1-lineage-candidates">
                {candidates.map((candidate) => {
                  const selected = candidate.id === selectedCandidateId;
                  const firstSectionId = candidate.sectionIds[0] ?? null;
                  return (
                    <details
                      key={candidate.id}
                      open={selected || undefined}
                      data-lineage-candidate={candidate.id}
                      data-selected={selected ? 'true' : undefined}
                    >
                      <summary>
                        <b>{candidate.statement}</b>
                        <span>{candidate.kind.replaceAll('-', ' ')}</span>
                      </summary>
                      <p><b>Why MAIA noticed this:</b> {candidate.why}</p>
                      {candidate.uncertainty ? <p><b>Uncertainty:</b> {candidate.uncertainty}</p> : null}
                      <p className="p4r1-lineage-meta">
                        {candidate.sectionIds.length} manuscript locus{candidate.sectionIds.length === 1 ? '' : 'es'}
                        {' · '}
                        {candidate.bibliographyKeys.length} bibliography lead{candidate.bibliographyKeys.length === 1 ? '' : 's'}
                      </p>
                      <div className="p4r1-lineage-candidate-actions">
                        {firstSectionId ? (
                          <button
                            type="button"
                            onClick={() => onShowCandidate(scan.chapterRootId, candidate.id, firstSectionId)}
                          >
                            Show me where
                          </button>
                        ) : null}
                        <button type="button" onClick={() => onDiscussCandidate(candidate)}>
                          Talk this through
                        </button>
                      </div>
                      {selected && candidate.bibliographyKeys.length > 0 ? (
                        <details className="p4r1-source-verification" open>
                          <summary>
                            <span>Source verification</span>
                            <b>{verificationStanding({
                              hasBibliographyLead: true,
                              attachedSourceCount: 0,
                              reviewedSourceAvailable: false,
                              verifiedEvidencePresent: false,
                              externalResearchAvailable: false,
                            }).replaceAll('-', ' ')}</b>
                          </summary>
                          <p>
                            The manuscript and bibliography establish a source lead. They do not yet establish
                            that the source says exactly what this passage attributes to it.
                          </p>
                          <div className="p4r1-source-verification-state">
                            <span>Manuscript attribution <b>present</b></span>
                            <span>Bibliography lead <b>present</b></span>
                            <span>Reviewed source text <b>not connected</b></span>
                            <span>External research <b>not connected yet</b></span>
                          </div>
                          <div className="p4r1-source-verification-options">
                            {sourceVerificationOptions({
                              hasBibliographyLead: true,
                              attachedSourceCount: 0,
                              reviewedSourceAvailable: false,
                              verifiedEvidencePresent: false,
                              externalResearchAvailable: false,
                            }).map((option) => {
                              if (option.id === 'leave-unresolved') {
                                return (
                                  <div key={option.id} className="p4r1-source-verification-option" data-current="true">
                                    <b>{option.label}</b>
                                    <span>{option.description}</span>
                                  </div>
                                );
                              }
                              if (option.id === 'bring-source') {
                                return (
                                  <Link
                                    key={option.id}
                                    href={sourceIntakeHref}
                                    className="p4r1-source-verification-link"
                                  >
                                    <b>{option.label}</b>
                                    <span>{option.description}</span>
                                  </Link>
                                );
                              }
                              if (option.id === 'talk-through') {
                                return (
                                  <button key={option.id} type="button" onClick={() => onDiscussCandidate(candidate)}>
                                    <b>{option.label}</b>
                                    <span>{option.description}</span>
                                  </button>
                                );
                              }
                              return (
                                <button key={option.id} type="button" disabled={!option.available}>
                                  <b>{option.label}</b>
                                  <span>{option.description}</span>
                                </button>
                              );
                            })}
                          </div>
                        </details>
                      ) : null}
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {scan.questionsToInvestigate.length > 0 ? (
        <div className="p4r1-lineage-questions">
          <b>Questions worth researching or discussing next</b>
          <ul>
            {scan.questionsToInvestigate.map((question) => <li key={question}>{question}</li>)}
          </ul>
        </div>
      ) : null}
      {error ? <p className="p4r1-error" role="status">{error}</p> : null}
    </section>
  );
}

export function ChapterReviewPanel({
  map,
  busy,
  needsCheckpoint,
  progress,
  error,
  onRead,
  onCheckpointAndRead,
  onField,
  onWrite,
  onEdit,
  protect,
  protectBusy,
  protectError,
  scorecard,
  previousScorecard,
  previousScoreRevision,
  scoreBusy,
  scoreError,
  minimalPath,
  minimalPathBusy,
  minimalPathError,
  bookFit,
  bookFitBusy,
  bookFitError,
  movement,
  movementBusy,
  movementError,
  onBookFit,
  onProtect,
  onMovement,
  onScore,
  onMinimalPath,
  onTalkAbout,
}: {
  map: WholeManuscriptAttentionMap | null;
  busy: boolean;
  needsCheckpoint: boolean;
  progress: string | null;
  error: string | null;
  onRead: () => void;
  onCheckpointAndRead: () => void;
  onField: (field: DevelopField) => void;
  onWrite: () => void;
  onEdit: (itemId: string, sectionId: string, source: 'chapter-review' | 'minimal-path') => void;
  protect: WholeManuscriptAttentionMap | null;
  protectBusy: boolean;
  protectError: string | null;
  scorecard: WholeManuscriptAttentionMap | null;
  previousScorecard: WholeManuscriptAttentionMap | null;
  previousScoreRevision: number | null;
  scoreBusy: boolean;
  scoreError: string | null;
  minimalPath: WholeManuscriptAttentionMap | null;
  minimalPathBusy: boolean;
  minimalPathError: string | null;
  bookFit: WholeManuscriptAttentionMap | null;
  bookFitBusy: boolean;
  bookFitError: string | null;
  movement: WholeManuscriptAttentionMap | null;
  movementBusy: boolean;
  movementError: string | null;
  onBookFit: () => void;
  onProtect: () => void;
  onMovement: () => void;
  onScore: () => void;
  onMinimalPath: () => void;
  onTalkAbout: (item: AttentionItem, kind: 'protect' | 'movement' | 'strengthen') => void;
}) {
  const [activeExpansion, setActiveExpansion] = useState<'book-fit' | null>(null);

  useEffect(() => {
    /* A new chapter reading is a new subject. Never leave a controller looking
       selected because a previous chapter had that exploration open. */
    setActiveExpansion(null);
  }, [map?.manuscriptId, map?.revisionNumber, map?.commissionedAt]);

  const openBookFit = () => {
    if (activeExpansion === 'book-fit') {
      setActiveExpansion(null);
      return;
    }
    setActiveExpansion('book-fit');
    if (!bookFit && !bookFitBusy) onBookFit();
  };
  if (!map) {
    return (
      <section className="fr-card p4r1-chapter-review" data-chapter-review="empty">
        <span className="p4r1-eyebrow">Start here</span>
        <h3>Let MAIA read this chapter.</h3>
        <p>
          She’ll begin by reflecting what she sees working, alive, inspiring, and worth protecting — then, only after that, where she thinks attention could help. Nothing changes.
        </p>
        {needsCheckpoint ? (
          <div className="p4r1-chapter-read-snapshot">
            <p>
              This chapter has changed since the last reading snapshot. Save the current draft so
              MAIA reads exactly what is on the page now. Your words will not change.
            </p>
            <button
              type="button"
              className="p4r1-commission"
              disabled={busy}
              onClick={onCheckpointAndRead}
            >
              {busy ? (progress ?? 'Saving the current draft…') : 'Save current draft & read'}
            </button>
          </div>
        ) : (
          <button type="button" className="p4r1-commission" disabled={busy} onClick={onRead}>
            {busy ? (progress ?? 'MAIA is reading the chapter…') : 'Read this chapter'}
          </button>
        )}
        {error ? <p className="p4r1-error" role="status">{error}</p> : null}
      </section>
    );
  }

  const byBand = (band: string) => map.items.find((item) => item.band === band) ?? null;
  const strength = byBand('begin-here');
  const grasp = byBand('next');
  const friction = byBand('later');

  return (
    <section className="fr-card p4r1-chapter-review" data-chapter-review="ready">
      <span className="p4r1-eyebrow">MAIA read the chapter</span>
      {strength ? (
        <div className="p4r1-chapter-review-lead">
          <span className="p4r1-chapter-review-reflection-label">What feels alive here</span>
          <h3>{strength.label}</h3>
          <p>{strength.notice}</p>
          <small>{strength.whyItMatters}</small>
        </div>
      ) : null}

      {grasp ? (
        <div className="p4r1-chapter-review-point">
          <b>What I think this chapter is doing</b>
          <p>{grasp.notice}</p>
        </div>
      ) : null}

      <p className="p4r1-chapter-review-invitation">
        These are places to begin a conversation, not conclusions. Choose one and MAIA will meet you in the field at right.
      </p>
      <div className="p4r1-chapter-review-actions" data-chapter-conversation-starters>
        {grasp ? (
          <button type="button" onClick={() => onTalkAbout(grasp, 'movement')}>
            Talk with MAIA about the movement
          </button>
        ) : null}
        {strength ? (
          <button type="button" onClick={() => onTalkAbout(strength, 'protect')}>
            Talk with MAIA about what to protect
          </button>
        ) : null}
        {friction ? (
          <button type="button" onClick={() => onTalkAbout(friction, 'strengthen')}>
            Talk with MAIA about what may need strengthening
          </button>
        ) : null}
        <button type="button" className="p4r1-chapter-review-secondary-write" onClick={onWrite}>Open this chapter in Write</button>
      </div>

      <details className="p4r1-chapter-review-secondary">
        <summary>More ways to look</summary>
        <div className="p4r1-chapter-review-secondary-actions">
          <button type="button" disabled={bookFitBusy} aria-pressed={activeExpansion === 'book-fit'} onClick={openBookFit}>
            {bookFitBusy ? 'Reading the book around this chapter…' : 'How does this chapter fit the book?'}
          </button>
        </div>
      </details>

      {activeExpansion === 'book-fit' && bookFitError ? <p className="p4r1-error" role="status">{bookFitError}</p> : null}
      {activeExpansion === 'book-fit' && bookFit ? (
        <section className="p4r1-chapter-expansion" data-chapter-book-fit>
          <span className="p4r1-eyebrow">In the book</span>
          {bookFit.items.map((item) => (
            <div key={item.id}>
              <b>{item.label}</b>
              <p>{item.notice}</p>
            </div>
          ))}
          <details><summary>Why MAIA thinks this</summary>{bookFit.items.map((item) => <p key={item.id}>{item.whyItMatters}</p>)}</details>
        </section>
      ) : null}

      {activeExpansion === null ? (
        <details className="p4r1-chapter-review-details">
          <summary>Why MAIA thinks this</summary>
          {map.items.map((item) => (
            <div key={item.id}>
              <b>{item.label}</b>
              <p>{item.whyItMatters}</p>
            </div>
          ))}
        </details>
      ) : null}

      {error ? <p className="p4r1-error" role="status">{error}</p> : null}
    </section>
  );
}

function AttentionMapPanel({
  map,
  busy,
  progress,
  error,
  selectedItemId,
  onCommission,
  onShow,
  onWork,
  onDiscuss,
}: {
  map: WholeManuscriptAttentionMap | null;
  busy: boolean;
  progress: string | null;
  error: string | null;
  selectedItemId: string | null;
  onCommission: () => void;
  onShow: (itemId: string, sectionId: string) => void;
  onWork: (itemId: string, sectionId: string) => void;
  onDiscuss: (item: AttentionItem) => void;
}) {
  const [pace, setPace] = useState<WorkingPace>(DEFAULT_WORKING_STYLE.pace);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const sync = () => setPace(readWorkingStyle().pace);
    sync();
    window.addEventListener('writers-studio-working-style-changed', sync as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('writers-studio-working-style-changed', sync as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setCursor(0);
  }, [map?.commissionedAt]);

  if (!map) {
    return (
      <section className="fr-card p4r1-attention-map p4r1-editorial-pass" data-editorial-pass="empty">
        <span className="p4r1-eyebrow">Edit with MAIA</span>
        <h3>Let MAIA go through the manuscript with you.</h3>
        <p>
          MAIA can read the whole current manuscript, find the places where an edit may help,
          and bring them to you in order. She can offer revision directions and alternate wording.
          You decide what, if anything, to use.
        </p>
        <button type="button" className="p4r1-commission p4r1-editorial-pass-start" disabled={busy} onClick={onCommission}>
          {busy ? (progress ?? 'MAIA is reading through the manuscript…') : 'Start an editorial pass'}
        </button>
        <p className="p4r1-editorial-pass-boundary">
          Nothing is changed or applied while she reads. Your Revision latitude still governs how far any proposed edit may go.
        </p>
        {error ? <p className="p4r1-error" role="status">{error}</p> : null}
      </section>
    );
  }

  const items = map.items.filter((item) => item.sectionIds.length > 0);
  const safeCursor = items.length === 0 ? 0 : Math.min(cursor, items.length - 1);
  const windowSize = pace === 'guided' ? 3 : 1;
  const shownItems = pace === 'mapped'
    ? items
    : items.slice(safeCursor, safeCursor + windowSize);
  const canAdvance = pace !== 'mapped' && items.length > windowSize;

  const advance = () => {
    if (items.length === 0) return;
    const step = pace === 'guided' ? 3 : 1;
    setCursor((current) => (current + step) % items.length);
  };

  return (
    <section className="fr-card p4r1-attention-map p4r1-editorial-pass" data-editorial-pass="ready">
      <div className="p4r1-editorial-pass-head">
        <div>
          <span className="p4r1-eyebrow">Editorial pass</span>
          <h3>Work through the manuscript, one edit at a time.</h3>
          <p>
            MAIA has read across the current manuscript. Open any suggestion to see the exact passage
            and ask for edit options. Nothing changes until you explicitly apply a version.
          </p>
        </div>
        <span className="p4r1-editorial-pass-pace">{PACE_COPY[pace].label}</span>
      </div>

      {items.length === 0 ? (
        <p className="p4r1-empty">MAIA did not find an evidenced place to bring forward for editing in this pass.</p>
      ) : (
        <div className="p4r1-editorial-pass-items">
          {shownItems.map((item, shownIndex) => {
            const sectionId = item.sectionIds[0]!;
            const absoluteIndex = pace === 'mapped' ? items.indexOf(item) : safeCursor + shownIndex;
            return (
              <article
                key={item.id}
                id={'attention-' + item.id}
                className="p4r1-editorial-pass-item"
                data-attention-item={item.id}
                data-attention-return={selectedItemId === item.id ? 'true' : undefined}
              >
                <span className="p4r1-eyebrow">Suggestion {absoluteIndex + 1} of {items.length}</span>
                <h4>{item.label}</h4>
                <p>{item.notice}</p>
                <div className="p4r1-editorial-pass-actions">
                  <button type="button" className="p4r1-editorial-pass-primary" onClick={() => onWork(item.id, sectionId)}>
                    Show edit options
                  </button>
                  <button type="button" onClick={() => onDiscuss(item)}>Talk first</button>
                  <button type="button" onClick={() => onShow(item.id, sectionId)}>See in manuscript</button>
                </div>
                <details className="p4r1-attention-evidence">
                  <summary>Why MAIA brought this forward</summary>
                  <div>
                    <p>{item.whyItMatters}</p>
                    {item.uncertainty ? <p><b>What remains uncertain:</b> {item.uncertainty}</p> : null}
                    <details>
                      <summary>Evidence · {item.evidence.length}</summary>
                      <div className="p4r1-attention-evidence-list">
                        {item.evidence.map((ref) => (
                          <blockquote key={`${ref.readingId}:${ref.observationKey}`}>
                            <span>{ref.lens}</span>
                            <p>{ref.observation}</p>
                          </blockquote>
                        ))}
                      </div>
                    </details>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}

      {canAdvance ? (
        <button type="button" className="p4r1-noticing-next p4r1-editorial-pass-next" onClick={advance}>
          {pace === 'intimate' ? 'Next edit suggestion' : 'Next suggestions'}
        </button>
      ) : null}

      <details className="p4r1-editorial-pass-map">
        <summary>See the full editorial map</summary>
        <div>
          {([
            ['begin-here', 'Begin here'],
            ['next', 'Next'],
            ['later', 'Later'],
            ['watch', 'Watch'],
          ] as const).map(([bandId, label]) => {
            const bandItems = items.filter((item) => item.band === bandId);
            if (bandItems.length === 0) return null;
            return (
              <div key={bandId} className="p4r1-attention-band">
                <h4>{label}</h4>
                {bandItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const index = items.findIndex((candidate) => candidate.id === item.id);
                      setCursor(Math.max(0, index));
                    }}
                  >
                    <b>{item.label}</b>
                    <span>{item.scale.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}

type ChapterDialogueKind = 'protect' | 'movement' | 'strengthen';

interface ChapterDialogueSeed {
  readingId: string;
  observationKey: string;
  about: string;
  initialQuestion: string;
  kind: ChapterDialogueKind;
  itemId: string;
  sectionId: string | null;
}

export default function P4R1DevelopView(props: P4R1DevelopViewProps) {
  const livePathname = usePathname() ?? '/dev/writers-studio-p4r1';
  const liveSearchParams = useSearchParams();
  const liveSearch = liveSearchParams?.toString() ?? '';
  const sourceIntakeHref = '/writers-studio/sources?returnTo=' + encodeURIComponent(
    livePathname + (liveSearch ? '?' + liveSearch : ''),
  );
  const [selectedObservationKey, setSelectedObservationKey] = useState<string | null>(
    props.reading?.observations[0]?.key ?? null,
  );
  const [talking, setTalking] = useState(false);
  const [dialoguePrompt, setDialoguePrompt] = useState('');
  const [chapterDialogue, setChapterDialogue] = useState<ChapterDialogueSeed | null>(null);
  const [workTalking, setWorkTalking] = useState(false);
  const [attentionConversationDraft, setAttentionConversationDraft] = useState('');
  const [railSelectionId, setRailSelectionId] = useState<string | null>(null);

  /* The URL/current manuscript locus survives navigation; component-local state does not.
     Reconstitute the relational locus after a section jump so selecting a section
     cannot look like a no-op merely because the route remounted Develop. Chapter
     roots remain owned by the chapter-level review surface. */
  useEffect(() => {
    const sectionId = props.currentSectionId;
    if (!sectionId) { setRailSelectionId(null); return; }
    const chapter = chapterSpanFor(props.sections, sectionId);
    setRailSelectionId(chapter?.root.draftSectionId === sectionId ? null : sectionId);
  }, [props.currentSectionId, props.sections]);

  useEffect(() => {
    setSelectedObservationKey(props.reading?.observations[0]?.key ?? null);
    setTalking(false);
    setDialoguePrompt('');
    setChapterDialogue(null);
  }, [props.reading?.id]);

  const selectedObservation = props.reading?.observations.find(
    (observation) => observation.key === selectedObservationKey,
  ) ?? null;

  const selectedRailSection = props.sections.find(
    (section) => section.draftSectionId === railSelectionId,
  ) ?? null;
  const selectedRailLabel = selectedRailSection?.heading?.trim() || 'Selected place';
  const selectedRailChapter = selectedRailSection
    ? chapterSpanFor(props.sections, selectedRailSection.draftSectionId)
    : null;
  const selectedRailIsChapterRoot = Boolean(selectedRailSection
    && selectedRailChapter?.root.draftSectionId === selectedRailSection.draftSectionId);
  const selectedRailKind = selectedRailIsChapterRoot ? 'chapter' : 'section';

  const selectManuscriptLocus = (sectionId: string) => {
    const chapter = chapterSpanFor(props.sections, sectionId);
    const selectsChapterRoot = chapter?.root.draftSectionId === sectionId;

    /* A chapter root is already a complete Develop subject. Let the canonical
       ChapterReviewPanel own it so completed analysis is not covered by the
       generic relational locus overlay. Subsections still use that overlay. */
    setRailSelectionId(selectsChapterRoot ? null : sectionId);
    setTalking(false);
    setDialoguePrompt('');
    setChapterDialogue(null);
    setAttentionConversationDraft('');
    /* The rail selection itself should visibly orient Develop. Conversation
       remains one more explicit act; the writer should not have to read a
       generic whole-Work dashboard to discover that the selection mattered. */
    setWorkTalking(false);
    props.onSection(sectionId);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-region="work"]')?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    }
  };

  const activeField = props.field === 'overview'
    ? null
    : props.field as Exclude<DevelopField, 'overview'>;
  const activeIntent = intentStarter(props.intent);

  const observedMaturity = useMemo(
    () => observeTextExtent(props.sections.map((section) => ({
      draftSectionId: section.draftSectionId,
      body: section.body,
    }))),
    [props.sections],
  );
  const declaredState = props.work?.manuscriptState ?? null;
  const selectedMovement = props.developmentalOrientation?.movements.find(
    (movement) => movement.id === props.selectedDevelopmentalMovementId,
  ) ?? null;
  const guidedOptions = useMemo(
    () => nextMoveOptions(declaredState, 'whole-work', selectedMovement?.movement ?? null),
    [declaredState, selectedMovement],
  );
  const movementSuggestedMoves = useMemo(
    () => new Set<WriterNextMove>(selectedMovement?.suggestedMoves ?? []),
    [selectedMovement],
  );
  const maturityLabel = declaredState === 'existing-manuscript'
    ? 'Existing manuscript'
    : declaredState === 'partial-manuscript'
      ? 'Partial manuscript'
      : declaredState === 'pre-manuscript'
        ? 'Pre-manuscript'
        : 'Manuscript state not yet declared';
  const extentLabel = observedMaturity.observedExtent === 'substantial'
    ? 'Substantial written material is present'
    : observedMaturity.observedExtent === 'some'
      ? 'Some written material is present'
      : 'No manuscript prose is present yet';

  const beginWholeConversation = (prompt: string) => {
    setChapterDialogue(null);
    setAttentionConversationDraft(prompt);
    setTalking(false);
    setWorkTalking(true);
  };

  const beginChapterDialogue = (item: AttentionItem, kind: ChapterDialogueKind) => {
    const evidence = item.evidence[0];
    if (!evidence) {
      beginWholeConversation('I want to talk with you about this chapter. Stay relational and help me understand what you see before suggesting anything.');
      return;
    }
    const initialQuestion = kind === 'protect'
      ? [
          'I want to stay with what is alive and worth protecting in this chapter before we revise anything.',
          'Reflect what you genuinely see here, then ask me what feels essential to preserve.',
          'Please make this a conversation, not a report or checklist. Let my Working with MAIA setting govern how actively you move toward suggestions.',
        ].join('\n\n')
      : kind === 'movement'
        ? [
            'Talk with me about the movement of this chapter rather than giving me a structural report.',
            'Begin in ordinary language with what you see happening, then ask me what experience I want the reader to have.',
            'Let my Working with MAIA setting govern how active you are after that.',
          ].join('\n\n')
        : [
            'I want to think with you about what may need strengthening here.',
            'Begin by reflecting what is already carrying the chapter, then ask me one question about my intention before suggesting changes.',
            'Please do not give me a checklist. Let my Working with MAIA setting govern how active you are.',
          ].join('\n\n');

    setChapterDialogue({
      readingId: evidence.readingId,
      observationKey: evidence.observationKey,
      about: evidence.observation,
      initialQuestion,
      kind,
      itemId: item.id,
      sectionId: item.sectionIds[0] ?? null,
    });
    setAttentionConversationDraft('');
    setTalking(false);
    setDialoguePrompt('');
    setWorkTalking(false);
  };

  const handleGuidedMove = (move: WriterNextMove) => {
    switch (move) {
      case 'whole-work-conversation':
        beginWholeConversation([
          'I want to begin with the whole Work before we move into details.',
          'Help me see the book as a book: its overall movement, what is alive, what may be unresolved, and what developmental process seems to be happening.',
          'Stay at the whole-Work scale until I choose to go closer.',
        ].join('\n'));
        return;
      case 'see-attention-map':
        document.querySelector('.p4r1-attention-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      case 'explore-part-or-chapter':
      case 'begin-writing':
        props.onMode('write');
        return;
      case 'trace-source-or-lineage':
        document.querySelector('[data-lineage-panel]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      case 'explore-ideas-and-sources':
      case 'research-planned-area':
        if (typeof window !== 'undefined') window.location.assign('/writers-studio/sources');
        return;
      case 'develop-existing-text':
        props.onField('development');
        return;
      case 'map-written-and-planned':
        beginWholeConversation([
          'Help me map what is actually written, what is still planned, and what remains open.',
          'Keep those states visibly distinct. Do not treat planned material as manuscript evidence.',
        ].join('\n'));
        return;
      case 'clarify-central-question':
        beginWholeConversation('Help me stay with the central question of this Work before we decide structure or prose.');
        return;
      case 'sketch-possible-structure':
        beginWholeConversation([
          'Help me explore possible shapes for this Work.',
          'Treat every structure as a possibility, not as something already authored or decided.',
        ].join('\n'));
        return;
      case 'stay-at-this-scale':
        beginWholeConversation('I want to stay at the current scale and keep thinking before we move closer.');
        return;
      case 'descend-one-scale':
        props.onMode('write');
        return;
      case 'something-else':
        setAttentionConversationDraft('');
        setTalking(false);
        setWorkTalking(true);
        return;
    }
  };

  const discussAttentionItem = (item: AttentionItem) => {
    const lenses = [...new Set(item.evidence.map((evidence) => evidence.lens))];
    setAttentionConversationDraft([
      'I want to talk through this whole-manuscript Attention Map observation:',
      `“${item.label}”`,
      '',
      'What MAIA noticed:',
      item.notice,
      '',
      'Why it may matter:',
      item.whyItMatters,
      ...(item.uncertainty ? ['', 'What remains uncertain:', item.uncertainty] : []),
      '',
      `This synthesis rests on ${item.evidence.length} frozen observation${item.evidence.length === 1 ? '' : 's'} across: ${lenses.join(', ')}.`,
      '',
      'Help me think this through. Start by distinguishing what the evidence establishes from what remains interpretive. Do not suggest edits unless I ask.',
    ].join('\n'));
    props.onDiscussAttentionItem(item);
    setTalking(false);
    setWorkTalking(true);
  };

  const discussLineageCandidate = (candidate: ChapterLineageCandidate) => {
    if (!props.chapterLineage) return;
    const bibliography = new Map(
      props.chapterLineage.bibliographyEntries.map((entry) => [entry.key, entry.raw] as const),
    );
    const sourceLeads = candidate.bibliographyKeys
      .map((key) => bibliography.get(key))
      .filter((value): value is string => Boolean(value));
    setAttentionConversationDraft([
      `I want to talk through this intellectual-lineage question in ${props.chapterLineage.chapterHeading}.`,
      '',
      `Candidate relationship: ${candidate.kind.replaceAll('-', ' ')}`,
      candidate.statement,
      '',
      'Why MAIA noticed it:',
      candidate.why,
      ...(candidate.uncertainty ? ['', 'What remains uncertain:', candidate.uncertainty] : []),
      ...(sourceLeads.length ? ['', 'Source leads currently filed with this chapter:', ...sourceLeads.map((source) => `- ${source}`)] : []),
      ...(selectedMovement ? [
        '',
        `Larger developmental question still in view: ${selectedMovement.label}`,
        selectedMovement.questionForWriter,
      ] : []),
      '',
      'Help me distinguish what the manuscript establishes, what the bibliography only suggests, and what would require source verification. Do not insert citations or rewrite prose unless I explicitly ask.',
    ].join('\n'));
    props.onSelectLineageCandidate(props.chapterLineage.chapterRootId, candidate.id);
    setTalking(false);
    setWorkTalking(true);
  };

  const title = props.field === 'overview' ? 'See more of your Work' : LABEL[props.field];
  const subtitle = props.field === 'overview'
    ? 'What are you trying to understand?'
    : QUESTION[props.field];

  const center = (
    <div className="fr-dev">
      <div className="fr-dev-head">
        <DevelopMark />
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button type="button" className="p4r1-open-craft" onClick={props.onOpenCraft}>
          Open Craftsman’s Table — work directly with the writing
        </button>
      </div>

      <div className="fr-tabs p4r1-develop-fields-nav" role="tablist" aria-label="Ways to explore the Work">
        {DEVELOP_FIELDS.map((field) => (
          <button
            key={field}
            type="button"
            role="tab"
            aria-selected={props.field === field}
            onClick={() => props.onField(field)}
          >
            {NAV_LABEL[field]}
          </button>
        ))}
      </div>

      {props.field === 'overview' ? (
        railSelectionId && selectedRailSection ? (
          <div className="p4r1-locus-arrival" data-develop-locus={selectedRailSection.draftSectionId}>
            <section className="fr-card p4r1-locus-primary">
              <span className="p4r1-eyebrow">
                {selectedRailIsChapterRoot ? 'Chapter selected' : 'Section selected'}
              </span>
              <h3>{selectedRailLabel}</h3>
              <p>
                I’m with you here. We can begin by talking about what this {selectedRailKind} is trying to become,
                or you can ask me to look through one particular lens. You do not need to translate your question into editorial language first.
              </p>
              <div className="p4r1-develop-locus-actions">
                <button
                  type="button"
                  className="p4r1-talk"
                  onClick={() => beginWholeConversation([
                    `I selected “${selectedRailLabel}” in Develop.`,
                    `Stay with this exact ${selectedRailKind}.`,
                    'Help me understand what it is doing, what may be alive or unresolved here, and ask me one useful question before suggesting changes.',
                  ].join('\n\n'))}
                >
                  Talk with MAIA
                </button>
                <button type="button" onClick={() => props.onMode('write')}>Open in Write</button>
              </div>
            </section>

            <section className="p4r1-locus-lenses" aria-label="Ways to examine the selected place">
              <span className="p4r1-eyebrow">Look at this place through</span>
              <div className="p4r1-locus-lens-grid">
                {([
                  ['structure', 'How is this shaped?', 'See how the parts fit, repeat, or may be carrying too much.'],
                  ['arc', 'Where is this going?', 'Follow the movement of the chapter and what changes as it unfolds.'],
                  ['themes', 'What keeps returning?', 'Notice recurring ideas, images, questions, or gestures.'],
                  ['voice', 'How does it sound?', 'Listen for where the voice holds, shifts, or changes distance.'],
                  ['coherence', 'Does it hold together?', 'Look for places where meaning strengthens, drifts, or contradicts itself.'],
                  ['continuity', 'What carries through?', 'Notice what is picked up, dropped, promised, or already happened.'],
                  ['reader', 'How might a reader meet this?', 'Look at orientation, timing, and what the reader knows at each point.'],
                ] as const).map(([field, label, detail]) => (
                  <button key={field} type="button" onClick={() => props.onField(field)}>
                    <b>{label}</b>
                    <span>{detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <button
              type="button"
              className="p4r1-locus-whole"
              onClick={() => {
                setRailSelectionId(null);
                props.onScope({ kind: 'whole' });
              }}
            >
              Return to the whole Work
            </button>
          </div>
        ) : (
        <div className="p4r1-intent-arrival">
          <ChapterReviewPanel
            map={props.chapterReview}
            busy={props.chapterReviewBusy}
            needsCheckpoint={props.chapterNeedsCheckpoint}
            progress={props.chapterReviewProgress}
            error={props.chapterReviewError}
            onRead={props.onReadChapter}
            onCheckpointAndRead={props.onCheckpointAndReadChapter}
            onField={props.onField}
            onWrite={() => props.onMode('write')}
            onEdit={props.onWorkWithAttentionItem}
            protect={props.chapterProtect}
            protectBusy={props.chapterProtectBusy}
            protectError={props.chapterProtectError}
            scorecard={props.chapterScorecard}
            previousScorecard={props.previousChapterScorecard}
            previousScoreRevision={props.previousChapterScoreRevision}
            scoreBusy={props.chapterScoreBusy}
            scoreError={props.chapterScoreError}
            minimalPath={props.chapterMinimalPath}
            minimalPathBusy={props.chapterMinimalPathBusy}
            minimalPathError={props.chapterMinimalPathError}
            bookFit={props.chapterBookFit}
            bookFitBusy={props.chapterBookFitBusy}
            bookFitError={props.chapterBookFitError}
            movement={props.chapterMovement}
            movementBusy={props.chapterMovementBusy}
            movementError={props.chapterMovementError}
            onBookFit={props.onReadChapterInBook}
            onProtect={props.onProtectChapter}
            onMovement={props.onReadChapterMovement}
            onScore={props.onScoreChapter}
            onMinimalPath={props.onMinimalPathChapter}
            onTalkAbout={beginChapterDialogue}
          />

          <details className="p4r1-develop-more">
            <summary>More ways to explore</summary>
            <div className="p4r1-develop-more-body">
          <AttentionMapPanel
            map={props.attentionMap}
            busy={props.attentionBusy}
            progress={props.attentionProgress}
            error={props.attentionError}
            selectedItemId={props.selectedAttentionItemId}
            onCommission={props.onCommissionAttentionMap}
            onShow={props.onShowAttentionItem}
            onWork={(itemId, sectionId) => props.onWorkWithAttentionItem(itemId, sectionId, 'attention-map')}
            onDiscuss={discussAttentionItem}
          />

          <section className="fr-card p4r1-developmental-orientation" data-developmental-orientation>
            <div className="p4r1-developmental-head">
              <span className="p4r1-eyebrow">The Work in process</span>
              <h3>Begin with the whole. Choose how you want to move.</h3>
              <p>
                MAIA can guide from the broadest meaningful view into chapters, sections,
                passages, and language. Nothing moves closer until you choose it.
              </p>
            </div>
            <div className="p4r1-developmental-state">
              <div>
                <span>Writer-declared state</span>
                <b>{maturityLabel}</b>
              </div>
              <div>
                <span>What is actually here</span>
                <b>{extentLabel}</b>
              </div>
            </div>
            <p className="p4r1-developmental-process-note">
              Development is not a staircase. Different parts of a Work can be emerging,
              organizing, deepening, integrating, or refining at the same time. MAIA can
              help you notice that process without deciding it for you.
            </p>

            {props.developmentalOrientation ? (
              <div className="p4r1-developmental-reflections" data-developmental-reflections>
                <div className="p4r1-developmental-reflections-head">
                  <div>
                    <span className="p4r1-eyebrow">MAIA’s whole-Work reflection</span>
                    <h4>What may be moving in the Work right now</h4>
                  </div>
                  {selectedMovement ? (
                    <button type="button" onClick={() => props.onDevelopmentalMovement(null)}>
                      Clear lens
                    </button>
                  ) : null}
                </div>
                <p className="p4r1-developmental-reflections-boundary">
                  These are evidence-bound possibilities, not stages or verdicts. Choose one
                  only if it helps you see the Work more clearly.
                </p>
                <div className="p4r1-developmental-movements">
                  {props.developmentalOrientation.movements.map((movement) => {
                    const selected = movement.id === props.selectedDevelopmentalMovementId;
                    return (
                      <article
                        key={movement.id}
                        className="p4r1-developmental-movement"
                        data-selected={selected ? 'true' : undefined}
                      >
                        <button
                          type="button"
                          className="p4r1-developmental-movement-choice"
                          aria-pressed={selected}
                          onClick={() => props.onDevelopmentalMovement(selected ? null : movement.id)}
                        >
                          <span>{movement.movement}</span>
                          <b>{movement.label}</b>
                          <p>{movement.reflection}</p>
                          <em>{selected ? 'Using this lens' : 'Explore this movement'}</em>
                        </button>
                        {selected ? (
                          <div className="p4r1-developmental-movement-detail">
                            <p><b>Why it may matter:</b> {movement.whyItMayMatter}</p>
                            {movement.uncertainty ? (
                              <p><b>What remains open:</b> {movement.uncertainty}</p>
                            ) : null}
                            <blockquote>{movement.questionForWriter}</blockquote>
                            <div className="p4r1-developmental-movement-actions">
                              <button
                                type="button"
                                onClick={() => beginWholeConversation([
                                  `I want to stay with this possible developmental movement: “${movement.label}”.`,
                                  '',
                                  movement.reflection,
                                  '',
                                  `Why it may matter: ${movement.whyItMayMatter}`,
                                  ...(movement.uncertainty ? ['', `What remains open: ${movement.uncertainty}`] : []),
                                  '',
                                  `Question to hold: ${movement.questionForWriter}`,
                                  '',
                                  'Help me think about this at the whole-Work scale. Do not move into chapters or edits until I choose to.',
                                ].join('\n'))}
                              >
                                Talk this through
                              </button>
                              <details>
                                <summary>See the evidence · {movement.evidence.length}</summary>
                                <div>
                                  {movement.evidence.map((evidence) => (
                                    <blockquote key={`${evidence.readingId}:${evidence.observationKey}`}>
                                      <span>{evidence.lens}</span>
                                      <p>{evidence.observation}</p>
                                    </blockquote>
                                  ))}
                                </div>
                              </details>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : observedMaturity.observedExtent !== 'none' && declaredState !== 'pre-manuscript' ? (
              <div className="p4r1-developmental-reflect-action">
                <button
                  type="button"
                  disabled={props.developmentalOrientationBusy}
                  onClick={props.onReflectDevelopmentalProcess}
                >
                  {props.developmentalOrientationBusy
                    ? 'MAIA is reflecting on the whole Work…'
                    : 'Ask MAIA what seems to be developing'}
                </button>
                <span>Uses the current whole-manuscript readings. Nothing is edited or commissioned beyond this reflection.</span>
              </div>
            ) : null}

            {props.developmentalOrientationError ? (
              <p className="p4r1-error" role="status">{props.developmentalOrientationError}</p>
            ) : null}

            <div className="p4r1-developmental-options-head">
              <span className="p4r1-eyebrow">
                {selectedMovement ? 'Given this lens' : 'Ways forward'}
              </span>
              <h4>{selectedMovement ? 'How would you like to follow this?' : 'How would you like to proceed?'}</h4>
              <p>These are suggestions, not a workflow. You can stay here, choose another path, or tell MAIA something else.</p>
            </div>
            <div className="p4r1-developmental-options" aria-label="Ways to continue with this Work">
              {guidedOptions.map((option) => {
                const suggestedHere = selectedMovement
                  ? movementSuggestedMoves.has(option.id)
                  : false;
                return (
                  <button
                    key={option.id}
                    type="button"
                    data-suggested={suggestedHere ? 'true' : undefined}
                    onClick={() => handleGuidedMove(option.id)}
                  >
                    {suggestedHere ? <small>Fits this lens</small> : null}
                    <b>{option.label}</b>
                    <span>{option.description}</span>
                    <em aria-hidden="true">›</em>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="p4r1-intent-primary">
            <span className="p4r1-eyebrow">Or begin with what you are wondering</span>
            <h3>What are you trying to understand?</h3>
            <p>
              Start with the thing you can feel, see, or cannot quite name yet.
              MAIA can help you find the editorial language later.
            </p>
            <div className="p4r1-intent-grid">
              {INTENT_STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  className="p4r1-intent-card"
                  onClick={() => {
                    setWorkTalking(true);
                    props.onIntent(starter.key, starter.field);
                  }}
                >
                  <b>{starter.label}</b>
                  <span>{starter.detail}</span>
                  <em aria-hidden="true">›</em>
                </button>
              ))}
            </div>
          </section>

          {props.writerUnderstanding ? (
            <P4R1WriterUnderstanding
              value={props.writerUnderstanding}
              busy={props.writerUnderstandingBusy}
              error={props.writerUnderstandingError}
              onSave={props.onSaveWriterUnderstanding}
            />
          ) : props.writerUnderstandingError ? (
            <section className="fr-card p4r1-writer-understanding">
              <span className="p4r1-eyebrow">Author-declared context</span>
              <h3>MAIA’s understanding of your writing</h3>
              <p className="p4r1-error">{props.writerUnderstandingError}</p>
            </section>
          ) : null}

          <IntellectualLineagePanel
            orientation={props.lineageOrientation}
            busy={props.lineageBusy}
            error={props.lineageError}
            sections={props.sections}
            manuscriptState={props.work?.manuscriptState ?? null}
            developmentalLens={selectedMovement ? {
              label: selectedMovement.label,
              questionForWriter: selectedMovement.questionForWriter,
            } : null}
            chapterBusy={props.chapterLineageBusy}
            onScan={props.onScanLineage}
            onInvestigateChapter={props.onInvestigateChapterLineage}
          />

          <ChapterLineagePanel
            scan={props.chapterLineage}
            busy={props.chapterLineageBusy}
            error={props.chapterLineageError}
            developmentalLens={selectedMovement ? {
              label: selectedMovement.label,
              questionForWriter: selectedMovement.questionForWriter,
            } : null}
            selectedCandidateId={props.selectedLineageCandidateId}
            sourceIntakeHref={sourceIntakeHref}
            onShowCandidate={props.onShowLineageCandidate}
            onDiscussCandidate={discussLineageCandidate}
          />

          <section className="p4r1-existing-evidence">
            <div>
              <span className="p4r1-eyebrow">What is already here</span>
              {props.summariesLoading ? (
                <p>Opening what MAIA has already read…</p>
              ) : props.summaries.length > 0 ? (
                <p>
                  {props.summaries.length} frozen reading{props.summaries.length === 1 ? '' : 's'} remain available.
                  Start with your question; you do not need to browse the archive first.
                </p>
              ) : (
                <p>MAIA has not made a developmental reading of this Work yet.</p>
              )}
            </div>
            <ReadingHistory
              field="overview"
              summaries={props.summaries}
              loading={props.summariesLoading}
              onReading={props.onReading}
            />
          </section>
            </div>
          </details>
        </div>
        )
      ) : (
        <>
          {activeIntent && activeField ? (
            <section className="p4r1-intent-bridge">
              <span className="p4r1-eyebrow">You came here asking</span>
              <h3>“{activeIntent.label}”</h3>
              <p>{activeIntent.reflection}</p>
              <div className="p4r1-intent-maia">
                <span>MAIA</span>
                <p>{activeIntent.proposal}</p>
              </div>
              {!props.summariesLoading && latestForField(activeField, props.summaries) ? (
                <button
                  type="button"
                  className="p4r1-intent-next"
                  onClick={() => props.onReading(latestForField(activeField, props.summaries)!.id)}
                >
                  Show me what you already noticed
                </button>
              ) : !props.summariesLoading ? (
                <p className="p4r1-intent-no-read">
                  I don’t have a saved reading for this question yet. You can choose exactly what I may read below.
                </p>
              ) : null}
            </section>
          ) : null}

          {activeField === 'structure' && props.scope.kind === 'chapter' ? (
            <ChapterShape manuscriptId={props.manuscriptId} sections={props.sections} scope={props.scope} />
          ) : null}

          {railSelectionId && selectedRailSection && activeField ? (
            <section className="fr-card p4r1-selected-place">
              <span className="p4r1-eyebrow">You’re here</span>
              <h3>{selectedRailLabel}</h3>
              <p>
                We can stay with this {selectedRailKind} as a whole.
                Choosing it did not trigger a new reading. {props.scope.kind === 'chapter' && !selectedRailIsChapterRoot
                  ? 'A formal lens reading from here currently covers its containing chapter.'
                  : `If you want MAIA to read this ${selectedRailKind} for ${LABEL[activeField].toLowerCase()}, ask directly here.`}
              </p>
              <div className="p4r1-selected-place-actions">
                <button type="button" onClick={() => beginWholeConversation([
                  `I’m in “${selectedRailLabel}”.`,
                  `I’m looking at it through ${LABEL[activeField].toLowerCase()}, but I want to begin conversationally.`,
                  'Help me understand what I am seeing before you turn it into an analysis. Ask me one useful question first.',
                ].join('\n\n'))}>Talk with MAIA first</button>
                <button
                  type="button"
                  className="p4r1-commission"
                  disabled={props.commissioning || props.prep?.kind !== 'ready'}
                  onClick={props.onCommission}
                >
                  {props.commissioning
                    ? 'MAIA is reading…'
                    : `${props.scope.kind === 'chapter' && !selectedRailIsChapterRoot ? 'Read containing chapter' : `Read this ${selectedRailKind}`} for ${LABEL[activeField]}`}
                </button>
                <button type="button" onClick={() => props.onMode('write')}>Open the text</button>
              </div>
              <p className="fr-also">You can change the lens at any time. Nothing is edited by reading.</p>
            </section>
          ) : null}

          <PreparationNotice
            prep={props.prep}
            error={props.prepError}
            preparing={props.preparing}
            onPrepare={props.onPrepare}
          />

          {props.field === 'themes' ? (
            <ThemeField
              payload={props.themes}
              busy={props.themeBusy}
              error={props.themeError}
              onMutation={props.onThemeMutation}
              onTalkCandidate={(candidate) => {
                setSelectedObservationKey(candidate.observationKey);
                setDialoguePrompt('');
                setTalking(true);
                if (props.reading?.id !== candidate.readingId) props.onReading(candidate.readingId);
              }}
            />
          ) : null}

          {props.readingLoading ? <p className="p4r1-empty">Opening the saved reading…</p> : null}
          {props.readingError ? <p className="p4r1-error">{props.readingError}</p> : null}

          {props.reading ? (
            <ReadingField
              reading={props.reading}
              field={props.field}
              selectedObservationKey={selectedObservationKey}
              onSelectObservation={(key) => {
                setSelectedObservationKey(key);
                setTalking(false);
              }}
              onTalkObservation={(key) => {
                setSelectedObservationKey(key);
                setDialoguePrompt('');
                setTalking(true);
              }}
              onTeachObservation={(key) => {
                setSelectedObservationKey(key);
                setDialoguePrompt('Teach me the one writing or craft idea most at work in this observation. Explain it in plain language first and show me in my own words. Do not suggest replacement wording unless I ask.');
                setTalking(true);
              }}
              onDeepObservation={(key) => {
                setSelectedObservationKey(key);
                setDialoguePrompt('Go deeper on this observation. Use the full editorial vocabulary, evidence, provenance, tradeoffs, and uncertainty. Keep the claim exactly within what the evidence supports. Do not propose replacement wording unless I ask.');
                setTalking(true);
              }}
              onGoToObservation={props.onGoToObservation}
              onWorkWithObservation={props.onWorkWithObservation}
              targets={props.observationTargets}
              workTargets={props.observationWorkTargets}
            />
          ) : activeField ? (
            <FieldContinue
              field={activeField}
              summaries={props.summaries}
              loading={props.summariesLoading}
              onReading={props.onReading}
            />
          ) : null}

          <details className="p4r1-new-reading">
            <summary>
              {activeField && latestForField(activeField, props.summaries)
                ? 'Read somewhere else'
                : `Read this Work for ${activeField ? LABEL[activeField] : 'this question'}`}
            </summary>
            <div className="p4r1-new-reading-body">
              <p>
                Choose what MAIA may read. Opening this field never reads more of your Work.
              </p>
              <div className="p4r1-develop-command">
                <ScopeChooser
                  scope={props.scope}
                  sections={props.sections}
                  sectionScope={props.sectionScope}
                  chapterScope={props.chapterScope}
                  onScope={props.onScope}
                />
                <button
                  type="button"
                  className="p4r1-commission"
                  disabled={props.commissioning || props.prep?.kind !== 'ready'}
                  onClick={props.onCommission}
                >
                  {props.commissioning
                    ? 'MAIA is reading…'
                    : `Read for ${activeField ? LABEL[activeField] : 'this question'}`}
                </button>
              </div>
              {props.commissionError ? <p className="p4r1-error" role="status">{props.commissionError}</p> : null}
            </div>
          </details>

          <ReadingHistory
            field={props.field}
            summaries={props.summaries}
            loading={props.summariesLoading}
            onReading={props.onReading}
          />
        </>
      )}
    </div>
  );

  const maia = (
    <div className="fr-maia-inner">
      <div className="fr-maia-head">
        <div className="fr-orb" aria-hidden="true" />
        <div className="fr-maia-name">
          <h2>MAIA</h2>
          <span>
            {chapterDialogue
              ? 'With this chapter question'
              : selectedObservation
                ? 'With this observation'
                : railSelectionId && selectedRailSection
                ? `In relation to ${selectedRailLabel}`
                : 'In relation to your Work'}
          </span>
        </div>
        <span className="fr-dots" aria-hidden="true">•••</span>
      </div>
      <div className="fr-mbody p4r1-develop-maia">
        <P4R1WorkMaterialsDoor
          work={props.work}
          exploreMode="prefill"
          maxContextChars={4000}
          onExplore={(context) => beginWholeConversation(context)}
        />
        {chapterDialogue && props.work ? (
          <div className="p4r1-chapter-conversation" data-chapter-conversation data-chapter-context="whole-work-aware">
            <div className="p4r1-observation-conversation-anchor">
              <span className="p4r1-eyebrow">Beginning from this noticing</span>
              <p>{chapterDialogue.about}</p>
              <small>MAIA is also carrying this chapter’s verified place in the Work, prior book readings, and your declared writing context.</small>
            </div>
            <WorkConversation
              key={`${chapterDialogue.readingId}:${chapterDialogue.initialQuestion}`}
              work={props.work}
              manuscriptId={props.manuscriptId}
              sectionId={props.currentSectionId}
              chapterReadingId={chapterDialogue.readingId}
              initialDraft={chapterDialogue.initialQuestion}
              autoSendInitialDraft
              afterMaiaTurn={({ threadId, lastMaiaTurnIndex, lastMaiaTurnBody }) => {
                const sectionId = chapterDialogue.sectionId ?? props.currentSectionId;
                if (!sectionId) return null;
                const carry = {
                  sourceThreadId: threadId,
                  sourceMaiaTurnIndex: lastMaiaTurnIndex,
                  sourceMaiaTurnBody: lastMaiaTurnBody,
                };
                return (
                  <button
                    type="button"
                    className="p4r1-conversation-next"
                    onClick={() => props.onWorkWithAttentionItem(
                    chapterDialogue.itemId,
                    chapterDialogue.sectionId ?? sectionId,
                    'chapter-review',
                    carry,
                  )}
                  >
                    Work this into the writing →
                  </button>
                );
              }}
              onClose={() => setChapterDialogue(null)}
            />
          </div>
        ) : selectedObservation && props.reading && talking ? (
          <>
            <div className="p4r1-observation-conversation-anchor">
              <span className="p4r1-eyebrow">We’re talking about</span>
              <p>{selectedObservation.observation}</p>
              <details>
                <summary>See the evidence and limits</summary>
                <div className="p4r1-maia-evidence">
                  <b>What this rests on</b>
                  {selectedObservation.evidence.map((evidence) => <p key={evidence}>{evidence}</p>)}
                </div>
                <div className="p4r1-maia-limits">
                  <b>What this does not establish</b>
                  {selectedObservation.limits.map((limit) => <p key={limit.name}>{limit.name} — {limit.meaning}</p>)}
                </div>
              </details>
            </div>
            <ObservationDialogue
              key={`${selectedObservation.key}:${dialoguePrompt}`}
              manuscriptId={props.manuscriptId}
              readingId={props.reading.id}
              observationKey={selectedObservation.key}
              about={selectedObservation.observation}
              superseded={selectedObservation.state === 'superseded'}
              initialQuestion={dialoguePrompt}
              autoSendInitialQuestion={Boolean(dialoguePrompt)}
              afterMaiaTurn={({ threadId, lastMaiaTurnIndex, lastMaiaTurnBody }) => {
                const sectionId = props.observationWorkTargets[selectedObservation.key]
                  ?? props.currentSectionId;
                if (!sectionId) return null;
                return (
                  <button
                    type="button"
                    className="p4r1-conversation-next"
                    onClick={() => props.onCraftFromConversation(sectionId, {
                      sourceThreadId: threadId,
                      sourceMaiaTurnIndex: lastMaiaTurnIndex,
                      sourceMaiaTurnBody: lastMaiaTurnBody,
                    })}
                  >
                    Work this into the writing →
                  </button>
                );
              }}
              onClose={() => {
                setTalking(false);
                setDialoguePrompt('');
              }}
            />
          </>
        ) : selectedObservation && props.reading ? (
          <div className="p4r1-observation-maia-ready">
            <span className="p4r1-eyebrow">I’m here with this</span>
            <h3>{friendlyObservation(selectedObservation.phenomenonLabel).title}</h3>
            <p>{friendlyObservation(selectedObservation.phenomenonLabel).lead}</p>
            <div className="p4r1-observation-ready-actions">
              <button type="button" onClick={() => {
                setDialoguePrompt('Put this observation into ordinary language for me. Start with what you actually noticed in my writing, why it may matter here, and one question that would help me decide what I think. No technical editorial vocabulary unless I ask for it.');
                setTalking(true);
              }}>Explain it plainly</button>
              <button type="button" onClick={() => {
                setDialoguePrompt('Stay with this observation with me. Do not turn it into a verdict or a repair task. Help me understand what you saw and ask me what I make of it.');
                setTalking(true);
              }}>Talk with me about it</button>
              <button type="button" onClick={() => {
                setDialoguePrompt('Teach me the one craft idea most relevant to this observation. Begin in plain language, show it in my own writing, and keep the technical term optional.');
                setTalking(true);
              }}>Teach me what is happening</button>
            </div>
            <details>
              <summary>See the saved reading and evidence</summary>
              <p>{selectedObservation.observation}</p>
            </details>
          </div>
        ) : props.work && workTalking ? (
          <div className="p4r1-work-conversation">
            <p className="p4r1-work-conversation-intro">
              Start with your question in your own words. This conversation stays with this Work.
              A new developmental reading still requires an explicit Read action.
            </p>
            <WorkConversation
              key={attentionConversationDraft || 'ordinary-work-conversation'}
              work={props.work}
              manuscriptId={props.manuscriptId}
              sectionId={props.currentSectionId}
              initialDraft={attentionConversationDraft}
              afterMaiaTurn={props.currentSectionId ? ({ threadId, lastMaiaTurnIndex, lastMaiaTurnBody }) => (
                <button
                  type="button"
                  className="p4r1-conversation-next"
                  onClick={() => props.onCraftFromConversation(props.currentSectionId!, {
                    sourceThreadId: threadId,
                    sourceMaiaTurnIndex: lastMaiaTurnIndex,
                    sourceMaiaTurnBody: lastMaiaTurnBody,
                  })}
                >
                  Work this into the writing →
                </button>
              ) : undefined}
              onClose={() => {
                setAttentionConversationDraft('');
                setWorkTalking(false);
              }}
            />
          </div>
        ) : railSelectionId && selectedRailSection ? (
          <div className="p4r1-locus-support" data-develop-locus-support={selectedRailSection.draftSectionId}>
            <span className="p4r1-eyebrow">
              {selectedRailIsChapterRoot ? 'Chapter selected' : 'Section selected'}
            </span>
            <h3>{selectedRailLabel}</h3>
            <p>
              I’m with you in this {selectedRailKind} now.
              We can talk before analyzing anything, or you can choose the kind of attention you want from me.
            </p>
            <div className="p4r1-develop-locus-actions p4r1-develop-locus-actions--relational">
              <button
                type="button"
                className="p4r1-talk"
                onClick={() => beginWholeConversation([
                  `I selected “${selectedRailLabel}” in Develop.`,
                  'Stay with this exact place. Help me understand what it is doing before we analyze or change anything.',
                  'Begin by asking me what I am noticing or wondering here.',
                ].join('\n\n'))}
              >
                Talk with MAIA
              </button>
              <button type="button" onClick={() => props.onField('structure')}>See how it is shaped</button>
              <button type="button" onClick={() => props.onField('arc')}>Follow its movement</button>
              <button type="button" onClick={() => props.onField('themes')}>Notice what returns</button>
              <button type="button" onClick={() => props.onField('continuity')}>See what carries through</button>
              <button type="button" onClick={() => props.onField('reader')}>Meet it as a reader</button>
              <button type="button" onClick={() => props.onMode('write')}>Open the text</button>
            </div>
            <p className="fr-also">I do not read anything new until you ask me to.</p>
          </div>
        ) : (
          <>
            <div className="fr-say">
              <p>
                {props.field === 'overview'
                  ? 'Select a chapter or section at left and I’ll orient to it immediately, or tell me what you are trying to understand about the whole Work.'
                  : `We can stay with your question about ${LABEL[props.field].toLowerCase()} and use what I have already read before asking for anything new.`}
              </p>
            </div>
            {props.work ? (
              <button type="button" className="p4r1-talk" onClick={() => setWorkTalking(true)}>
                Talk this through with MAIA
              </button>
            ) : null}
            <p className="fr-also">Nothing is read automatically.</p>
          </>
        )}
      </div>
      <div className="fr-foot">MAIA reads with you, not ahead of you.</div>
    </div>
  );

  /* Selecting a locus or saved observation is already a relational act.
     MAIA must visibly orient there before the writer starts a conversation. */
  // Keep MAIA in the same room at rest. Previously the conditional gate
  // removed the region whenever no conversation was active, leaving a large
  // blank third column precisely when the writer needed orientation.
  return (
    <Shell
      mode="develop"
      appearance={props.appearance}
      geometry={props.field === 'themes' ? STATE_GEOMETRY['develop-themes'] : STATE_GEOMETRY['develop-manuscript']}
      workTitle={props.workTitle || undefined}
      memberInitial=""
      onSelectMode={props.onMode}
      manuscript={<ManuscriptRail sections={props.sections} currentSectionId={props.currentSectionId} onSection={selectManuscriptLocus} />}
      work={center}
      maia={maia}
      manuscriptResizable
      manuscriptDefaultWidth={280}
      maiaResizable
      maiaDefaultShare={46}
    />
  );
}
