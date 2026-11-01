/**
 * Conforming reference: a TEST DOUBLE, never a seed for the real store (ACAD-1 §8.3).
 * Primitives are exported with REQUIRED explicit option objects so a defeat candidate can swap
 * exactly one decision (no `undefined`-defaults that silently supply the evidence under test).
 */
import type { AcademyCore, Idea, Moment, OfferArgs, OfferResult, Ratification, Review, Session, Check } from './contract';

export const FORBIDDEN_IDEA_KEYS = [
  'level', 'difficulty', 'skill', 'competence', 'rank', 'score', 'severity', 'priority',
  'recommended', 'quality', 'good', 'bad', 'progress', 'completed', 'streak', 'certificate',
  'prerequisite', 'approved', 'status', 'admitted',
] as const;
export const FORBIDDEN_REVIEW_KEYS = ['passageText', 'passage', 'excerpt', 'quote', 'text', 'passageContent'] as const;

export interface ShapeOpts { rejectForbidden: boolean; rejectReviewText: boolean }
export function checkIdeaShape(raw: Record<string, unknown>, o: ShapeOpts): Check {
  if (o.rejectForbidden) {
    for (const k of Object.keys(raw)) {
      if ((FORBIDDEN_IDEA_KEYS as readonly string[]).includes(k.toLowerCase())) return { ok: false, reason: `forbidden field ${k}` };
    }
  }
  const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  if (!str(raw.ideaId)) return { ok: false, reason: 'ideaId required' };
  if (raw.tier !== 'in-work' && raw.tier !== 'room') return { ok: false, reason: 'tier invalid' };
  if (!str(raw.technique)) return { ok: false, reason: 'technique required' };
  if (!str(raw.source)) return { ok: false, reason: 'source required' };
  const a = raw.anchorRequirement;
  if (!Array.isArray(a) || a.length === 0 || !a.every(str)) return { ok: false, reason: 'anchorRequirement required' };
  if (!Array.isArray(raw.linkedIdeaIds)) return { ok: false, reason: 'linkedIdeaIds required' };
  if (!Array.isArray(raw.reviews)) return { ok: false, reason: 'reviews required' };
  if (o.rejectReviewText) {
    for (const r of raw.reviews as Record<string, unknown>[]) {
      for (const k of Object.keys(r)) {
        if ((FORBIDDEN_REVIEW_KEYS as readonly string[]).includes(k)) return { ok: false, reason: `review carries passage content (${k})` };
      }
    }
  }
  return { ok: true };
}

export interface LibraryOpts { dangling: boolean; symmetry: boolean; oppositeTiers: boolean; sharedSource: boolean }
export function checkLibrary(ideas: readonly Idea[], o: LibraryOpts): Check {
  const byId = new Map(ideas.map((i) => [i.ideaId, i] as const));
  if (byId.size !== ideas.length) return { ok: false, reason: 'duplicate ideaId' };
  for (const i of ideas) {
    for (const t of i.linkedIdeaIds) {
      const other = byId.get(t);
      if (!other) { if (o.dangling) return { ok: false, reason: `dangling link ${i.ideaId}->${t}` }; continue; }
      if (o.symmetry && !other.linkedIdeaIds.includes(i.ideaId)) return { ok: false, reason: `one-way link ${i.ideaId}->${t}` };
      if (o.oppositeTiers && other.tier === i.tier) return { ok: false, reason: `same-tier link ${i.ideaId}-${t}` };
      if (o.sharedSource && other.source !== i.source) return { ok: false, reason: `linked pair diverges in source ${i.ideaId}/${t}` };
    }
  }
  return { ok: true };
}

export interface AdmitOpts { requireBeta: boolean }
export function admitted(idea: Idea, rats: readonly Ratification[], o: AdmitOpts): boolean {
  const rat = rats.filter((r) => r.ideaId === idea.ideaId).map((r) => r.date).sort().pop();
  if (!rat) return false;
  if (o.requireBeta && !idea.reviews.some((r: Review) => r.role === 'beta-writer' && r.verdict === 'describes')) return false;
  if (idea.reviews.some((r) => r.verdict === 'prescribes' && r.date > rat)) return false; // reopened
  return true;
}

export function selectIdeas(a: OfferArgs, isOfferable: (i: Idea) => boolean): Idea[] {
  const have = new Set(a.observation.anchors);
  return a.library
    .filter((i) => isOfferable(i) && i.anchorRequirement.every((x) => have.has(x)))
    .sort((x, y) => (x.ideaId < y.ideaId ? -1 : x.ideaId > y.ideaId ? 1 : 0));
}
export function toMoment(i: Idea, a: OfferArgs): Moment {
  return {
    ideaId: i.ideaId, technique: i.technique, source: i.source, anchor: a.observation.observationId,
    depth: a.facet === 'learning' ? 'expanded' : 'brief', canDecline: true, canReturn: true,
  };
}

export function makeReference(): AcademyCore {
  const core: AcademyCore = {
    validateIdea: (raw) => checkIdeaShape(raw, { rejectForbidden: true, rejectReviewText: true }),
    validateLibrary: (ideas) => checkLibrary(ideas, { dangling: true, symmetry: true, oppositeTiers: true, sharedSource: true }),
    offerable: (idea, rats) => admitted(idea, rats, { requireBeta: true }),
    offer: (a): OfferResult => ({
      moments: selectIdeas(a, (i) => core.offerable(i, a.ratifications)).map((i) => toMoment(i, a)),
      proposalAdditions: [],
    }),
    decline: (s: Session) => ({ reading: [...s.reading], proposals: [...s.proposals] }),
    reviewSummary: (idea) => ({ entries: idea.reviews.map((r) => ({ ...r })) }),
  };
  return core;
}
