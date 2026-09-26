/**
 * WRITERS-STUDIO-V10-RECOVERY-01 — pure live-runtime → exact V10 Write projection.
 *
 * No fetch, persistence, identity minting or model work. This module projects
 * facts the live host already owns into presentation-only V10 props.
 */
import type {
  RebuildEditorialThread, RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type {
  AlternativeSet, RevisionEvent,
} from '@/lib/writersStudio/studio/machine';
import type {
  MaiaCopy, VersionEntry, WritePresentationPhase,
} from '@/app/writers-studio/flagship/WriteRoom';

export interface LiveWriteProjectionInput {
  readonly panelOpen: boolean;
  readonly thread: RebuildEditorialThread | null;
  readonly heldSectionId: string | null;
  readonly previewVersionId: string | null;
  readonly selectedVersionId: string | null;
  readonly undoConfirmed: boolean;
}

const purposeLabel = (version: RebuildEditorialVersion): string => {
  const purpose = version.rationale?.match(/^Editorial purpose:\s*([^\n]+)/i)?.[1]?.trim();
  if (purpose) return purpose.split(/[.\n—]/)[0]!.trim().slice(0, 80);
  return version.author === 'member' ? 'Your revision' : 'Alternative';
};

const rationaleFor = (version: RebuildEditorialVersion): string => {
  if (version.rationale?.trim()) return version.rationale.trim();
  return version.author === 'member'
    ? 'Your saved wording in this conversation.'
    : 'MAIA offered this wording for you to consider.';
};

export function alternativesFromThread(thread: RebuildEditorialThread | null): AlternativeSet | null {
  if (!thread || thread.versions.length === 0) return null;
  return {
    items: [
      {
        id: 'keep-original',
        name: 'Keep my original',
        text: null,
        rationale: 'Leave this passage exactly as you wrote it.',
      },
      ...thread.versions.map((version) => ({
        id: version.id,
        name: purposeLabel(version),
        text: version.wording,
        rationale: rationaleFor(version),
      })),
    ],
  };
}

const appliedEvent = (
  thread: RebuildEditorialThread,
  version: RebuildEditorialVersion,
): RevisionEvent | null => {
  const application = thread.application;
  if (!application || application.versionId !== version.id) return null;
  return {
    kind: 'apply',
    version: application.resultingVersion,
    sectionId: thread.targetSectionId ?? '',
    alternativeId: version.id,
    alternativeName: purposeLabel(version),
  };
};

export function presentationPhase(input: LiveWriteProjectionInput): WritePresentationPhase {
  if (!input.panelOpen) return { name: 'writing' };
  const thread = input.thread;
  if (!thread) return { name: 'passage-held' };

  const candidates = alternativesFromThread(thread);
  if (!candidates) return { name: 'conversation' };

  const application = thread.application;
  if (application?.undone) {
    return { name: 'undone', candidates, selected: application.versionId };
  }
  if (application && !application.undone) {
    const version = thread.versions.find((v) => v.id === application.versionId);
    const applied = version ? appliedEvent(thread, version) : null;
    if (applied) return { name: 'applied', candidates, applied };
  }
  if (input.previewVersionId && candidates.items.some((a) => a.id === input.previewVersionId)) {
    return { name: 'context-review', candidates, selected: input.previewVersionId };
  }
  return {
    name: 'alternatives',
    candidates,
    selected: input.selectedVersionId && candidates.items.some((a) => a.id === input.selectedVersionId)
      ? input.selectedVersionId
      : null,
  };
}

export function maiaCopyFromThread(thread: RebuildEditorialThread | null): MaiaCopy {
  if (!thread) return { opening: '' };
  const turns = [...thread.turns];
  const latestMaia = turns.reverse().find((turn) => turn.speaker === 'maia')?.body ?? '';
  const latestAuthor = [...thread.turns].reverse().find((turn) => turn.speaker === 'author')?.body;
  return {
    ...(latestAuthor ? { memberAsk: latestAuthor } : {}),
    opening: latestMaia,
  };
}

export function versionHistoryFromThread(thread: RebuildEditorialThread | null): readonly VersionEntry[] {
  if (!thread) return [];
  return thread.versions.map((version) => ({
    when: version.author === 'member' ? 'Your saved revision' : 'Saved alternative',
    time: '',
    what: purposeLabel(version),
    current: version.id === thread.headVersionId,
  }));
}

export function latestMaiaReply(thread: RebuildEditorialThread | null): string | null {
  if (!thread) return null;
  return [...thread.turns].reverse().find((turn) => turn.speaker === 'maia')?.body ?? null;
}
