import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

export function declaredManuscriptsForWork(
  work: LivingWork,
  manuscripts: readonly CurrentManuscript[],
): CurrentManuscript[] {
  const declaredIds = new Set(
    work.expressions
      .filter((expression) => expression.expressionType === 'manuscript')
      .map((expression) => expression.expressionId),
  );

  return manuscripts.filter((manuscript) => declaredIds.has(manuscript.id));
}

export function explicitWorkForArrival(
  works: readonly LivingWork[],
  manuscripts: readonly CurrentManuscript[],
  workId: string | null,
) {
  if (!workId) return null;

  const work = works.find((candidate) => candidate.id === workId) ?? null;
  if (!work) return null;

  return {
    work,
    manuscripts: declaredManuscriptsForWork(work, manuscripts),
  };
}
