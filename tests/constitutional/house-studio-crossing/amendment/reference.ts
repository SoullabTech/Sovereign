/** Conforming reference — a test double. ⛔ Evidence, never a seed. */
import type { CtxResolver } from './contract';

export const referenceCtx: CtxResolver = (phase, works, manuscriptId, explicitWorkId = null) => {
  if (phase !== 'ready') return { kind: 'unknown' };
  if (!manuscriptId) return { kind: 'none' };
  const declaring = works.filter((w) =>
    w.expressions.some((e) => e.expressionType === 'manuscript' && e.expressionId === manuscriptId));
  if (explicitWorkId) {
    const chosen = declaring.find((w) => w.id === explicitWorkId);
    if (chosen) return { kind: 'work', work: chosen };
  }
  if (declaring.length === 0) return { kind: 'none' };
  if (declaring.length === 1) return { kind: 'work', work: declaring[0]! };
  return { kind: 'ambiguous', works: declaring };
};
