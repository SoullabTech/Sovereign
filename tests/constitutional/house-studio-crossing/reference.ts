/**
 * Conforming reference — a TEST DOUBLE that proves the laws are mutually
 * satisfiable. ⛔ Evidence, never a seed: the real intake must be written to
 * the suite, not copied from this file.
 */
import type { IntakeResolver } from './contract';

export const referenceResolver: IntakeResolver = ({ phase, works, liveManuscriptIds, requestedWorkId }) => {
  if (requestedWorkId === null || requestedWorkId === '') return { kind: 'absent' };
  if (phase !== 'ready') return { kind: 'wait' };
  const work = works.find((w) => w.id === requestedWorkId);
  if (!work) return { kind: 'refused' };
  const live = new Set(liveManuscriptIds);
  const ids = work.manuscriptIds.filter((id, i, all) => live.has(id) && all.indexOf(id) === i);
  if (ids.length === 0) return { kind: 'no-writing', workId: work.id };
  if (ids.length === 1) return { kind: 'open', workId: work.id, manuscriptId: ids[0] as string };
  return { kind: 'choose', workId: work.id, manuscriptIds: ids };
};
