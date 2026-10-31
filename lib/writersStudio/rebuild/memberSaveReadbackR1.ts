import type { RebuildEditorialThread } from './editorialCollaboration';

/**
 * A client-visible acknowledgment is not durable proof of a writer's Save.
 *
 * This is a comparison of an already authorized server readback, NOT an access
 * check, consent grant, or permission to create a version. The server must
 * independently verify member identity, Work/Source custody and current
 * Sanctuary posture before any persisted mutation. Author-first Save remains
 * disabled until its separate Class A authority review is complete.
 */
export interface ExactMemberSaveReadback {
  readonly threadId: string;
  readonly workId: string;
  readonly sectionId: string;
  readonly locusText: string;
  readonly versionId: string;
  readonly supersedes: string | null;
  readonly text: string;
}

/**
 * Fail closed if the returned lineage cannot confirm precisely the writer's
 * formulation. No fallback to the newest head and no inferred predecessor.
 */
export function confirmsExactMemberSaveReadback(
  thread: RebuildEditorialThread | null,
  expected: ExactMemberSaveReadback,
): boolean {
  if (!thread
    || !expected.threadId || !expected.workId || !expected.sectionId
    || !expected.versionId
    || thread.threadId !== expected.threadId
    || thread.workId !== expected.workId
    || thread.targetSectionId !== expected.sectionId
    || thread.locusText !== expected.locusText
    || thread.headVersionId !== expected.versionId
    || !Array.isArray(thread.versions)) return false;

  const matches = thread.versions.filter(version => version.id === expected.versionId);
  if (matches.length !== 1) return false;

  const saved = matches[0]!;
  return saved.author === 'member'
    && saved.wording === expected.text
    && saved.supersedes === expected.supersedes;
}
