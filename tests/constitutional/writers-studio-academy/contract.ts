/**
 * WRITERS-STUDIO-ACADEMY-01 · ACAD-2 · observable semantics of the craft-idea contract.
 * Types the BOUNDARY, not storage (ACAD-1 contract §0): no table, column, file format or
 * status enum. `writerProfile` is carried as an INERT payload on purpose: keying on it must
 * be buildable to be killable (same device as S3's `authoredText`).
 */
export type Tier = 'in-work' | 'room';
export type Facet = 'guided' | 'learning' | 'direct';
export type Verdict = 'describes' | 'prescribes' | 'unclear';
export type Role = 'founder' | 'beta-writer';

export interface Review {
  reviewer: string;
  role: Role;
  date: string; // ISO, compared lexically
  verdict: Verdict;
  passageRef: string; // a reference, never a copy
}
export interface Idea {
  ideaId: string;
  tier: Tier;
  technique: string;
  anchorRequirement: string[];
  source: string;
  linkedIdeaIds: string[];
  reviews: Review[];
}
export interface Ratification { ideaId: string; date: string } // founder act
export interface Observation { observationId: string; anchors: string[] } // features present in the writer's passage

export interface Moment {
  ideaId: string;
  technique: string;
  source: string;
  anchor: string; // observationId
  depth: 'brief' | 'expanded';
  canDecline: boolean;
  canReturn: boolean;
}
export interface OfferResult { moments: Moment[]; proposalAdditions: string[] }
export interface Session { reading: string[]; proposals: string[] }
export type Check = { ok: true } | { ok: false; reason: string };

export interface OfferArgs {
  library: readonly Idea[];
  ratifications: readonly Ratification[];
  observation: Observation;
  facet: Facet;
  writerProfile?: { level?: string };
}

export interface AcademyCore {
  validateIdea(raw: Record<string, unknown>): Check;
  validateLibrary(ideas: readonly Idea[]): Check;
  offerable(idea: Idea, ratifications: readonly Ratification[]): boolean;
  offer(args: OfferArgs): OfferResult;
  decline(session: Session, ideaId: string): Session;
  reviewSummary(idea: Idea): Record<string, unknown>;
}
