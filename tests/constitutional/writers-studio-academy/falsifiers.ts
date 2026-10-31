/**
 * ACAD-2 falsifiers AF0..AF16. Each returns null (holds) or a failure string.
 * Fixtures state every field explicitly; nothing is supplied by a helper default.
 */
import type { AcademyCore, Idea, Facet, Ratification, Review, Session, OfferArgs } from './contract';

export interface Falsifier { id: string; law: string; run(core: AcademyCore): string | null }

const FACETS: Facet[] = ['guided', 'learning', 'direct'];
const beta = (verdict: Review['verdict'], date: string): Review =>
  ({ reviewer: 'beta_1', role: 'beta-writer', date, verdict, passageRef: 'ref:passage-1' });
const founderRev = (verdict: Review['verdict'], date: string): Review =>
  ({ reviewer: 'founder', role: 'founder', date, verdict, passageRef: 'ref:passage-1' });
const idea = (p: Partial<Idea> & Pick<Idea, 'ideaId' | 'tier' | 'anchorRequirement' | 'reviews' | 'linkedIdeaIds'>): Idea =>
  ({ technique: 'A withheld ending leaves the question open for the reader.', source: 'src-craft-1', ...p });

const A = idea({ ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: ['idea_b'], reviews: [beta('describes', '2026-11-01')] });
const B = idea({ ideaId: 'idea_b', tier: 'room', anchorRequirement: ['dialogue'], linkedIdeaIds: ['idea_a'], reviews: [beta('describes', '2026-11-01')] });
const RAT: Ratification[] = [{ ideaId: 'idea_a', date: '2026-11-02' }, { ideaId: 'idea_b', date: '2026-11-02' }];
const OBS = { observationId: 'obs_1', anchors: ['dialogue'] };
const args = (core: AcademyCore, over: Partial<OfferArgs>): OfferArgs =>
  ({ library: [A, B], ratifications: RAT, observation: OBS, facet: 'guided', ...over });
const rawOf = (i: Idea): Record<string, unknown> => JSON.parse(JSON.stringify(i));

export const FALSIFIERS: Falsifier[] = [
  { id: 'AF0', law: 'positive control: an admitted, anchored idea IS offered (so a core that never offers cannot pass)', run: (c) => {
    const r = c.offer(args(c, {}));
    return r.moments.length >= 1 && r.moments[0]!.ideaId === 'idea_a' ? null : `expected idea_a offered, got ${JSON.stringify(r.moments.map((m) => m.ideaId))}`;
  } },
  { id: 'AF1', law: 'no anchor, no lesson: an idea needs an anchor requirement, and is offered only where the passage shows it', run: (c) => {
    const noAnchor = rawOf(A); delete noAnchor.anchorRequirement;
    if (c.validateIdea(noAnchor).ok) return 'idea without anchorRequirement accepted';
    const empty = rawOf(A); empty.anchorRequirement = [];
    if (c.validateIdea(empty).ok) return 'idea with empty anchorRequirement accepted';
    for (const anchors of [[], ['setting']]) {
      const r = c.offer(args(c, { observation: { observationId: 'obs_x', anchors } }));
      if (r.moments.length !== 0) return `offered with anchors ${JSON.stringify(anchors)}`;
    }
    return null;
  } },
  { id: 'AF2', law: 'facet parity: same observation, same idea ids and same technique text in all three facets', run: (c) => {
    const per = FACETS.map((f) => c.offer(args(c, { facet: f })).moments.map((m) => `${m.ideaId}|${m.technique}`));
    return per.every((p) => JSON.stringify(p) === JSON.stringify(per[0])) ? null : `facets diverge: ${JSON.stringify(per)}`;
  } },
  { id: 'AF3', law: 'no level/competence/ranking/progress/stored-approval field may exist on an idea', run: (c) => {
    for (const k of ['level', 'difficulty', 'skill', 'competence', 'rank', 'score', 'severity', 'priority', 'recommended', 'quality', 'good', 'bad', 'progress', 'completed', 'streak', 'certificate', 'prerequisite', 'approved', 'status', 'admitted']) {
      const raw = rawOf(A); raw[k] = 'x';
      if (c.validateIdea(raw).ok) return `field ${k} accepted`;
    }
    return null;
  } },
  { id: 'AF4a', law: 'links are symmetric: a one-way link is a defect', run: (c) => {
    const oneWay = idea({ ...B, linkedIdeaIds: [], ideaId: 'idea_b', tier: 'room', anchorRequirement: ['dialogue'], reviews: B.reviews });
    return c.validateLibrary([A, oneWay]).ok ? 'one-way link accepted' : null;
  } },
  { id: 'AF4b', law: 'links resolve: a dangling link is a defect', run: (c) => {
    const d = idea({ ...A, linkedIdeaIds: ['ghost'], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], reviews: A.reviews });
    return c.validateLibrary([d]).ok ? 'dangling link accepted' : null;
  } },
  { id: 'AF4c', law: 'a tier link joins the two tiers: a same-tier link is a defect', run: (c) => {
    const a2 = idea({ ...A, ideaId: 'idea_a2', linkedIdeaIds: ['idea_a'], tier: 'in-work', anchorRequirement: ['dialogue'], reviews: A.reviews });
    const a1 = idea({ ...A, linkedIdeaIds: ['idea_a2'], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], reviews: A.reviews });
    return c.validateLibrary([a1, a2]).ok ? 'same-tier link accepted' : null;
  } },
  { id: 'AF5', law: 'PROXY: a linked pair shares one declared source; divergence of the short form from the long form is a defect', run: (c) => {
    const b2 = idea({ ...B, source: 'different-source', ideaId: 'idea_b', tier: 'room', anchorRequirement: ['dialogue'], linkedIdeaIds: ['idea_a'], reviews: B.reviews });
    return c.validateLibrary([A, b2]).ok ? 'linked pair with divergent source accepted' : null;
  } },
  { id: 'AF6', law: 'every teaching moment shows its source', run: (c) => {
    for (const f of FACETS) for (const m of c.offer(args(c, { facet: f })).moments) {
      if (m.source !== A.source || m.source.trim() === '') return `moment for ${m.ideaId} lacks visible source in ${f}`;
    }
    return null;
  } },
  { id: 'AF7', law: 'declining changes nothing: reading and proposals are identical afterwards', run: (c) => {
    const s: Session = { reading: ['r1', 'r2'], proposals: ['p1'] };
    const before = JSON.stringify(s);
    const after = c.decline(s, 'idea_a');
    if (JSON.stringify(s) !== before) return 'decline mutated the input session';
    return JSON.stringify(after) === before ? null : `session changed: ${JSON.stringify(after)}`;
  } },
  { id: 'AF8', law: 'admission is derived: founder ratification AND an independent beta-writer read; a later prescribes read reopens; records are kept', run: (c) => {
    const rat = [{ ideaId: 'idea_a', date: '2026-11-02' }];
    const founderOnly = idea({ ...A, reviews: [founderRev('describes', '2026-11-01')], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [] });
    if (c.offerable(founderOnly, rat)) return 'admitted on founder review alone';
    if (c.offerable(A, [])) return 'admitted without founder ratification';
    if (!c.offerable(A, rat)) return 'ratified + beta describes not admitted';
    const unclear = idea({ ...A, reviews: [beta('unclear', '2026-11-01')], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [] });
    if (c.offerable(unclear, rat)) return 'admitted on an unclear read';
    const reopened = idea({ ...A, reviews: [beta('describes', '2026-11-01'), beta('prescribes', '2026-11-05')], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [] });
    if (c.offerable(reopened, rat)) return 'later prescribes read did not reopen';
    const kept = (c.reviewSummary(reopened).entries as unknown[] | undefined)?.length;
    return kept === 2 ? null : `earlier records not kept (entries=${kept})`;
  } },
  { id: 'AF9', law: 'teaching text never flows into a proposal', run: (c) => {
    const r = c.offer(args(c, {}));
    return r.proposalAdditions.length === 0 ? null : `proposal additions: ${JSON.stringify(r.proposalAdditions)}`;
  } },
  { id: 'AF10', law: 'no stored approval flag: a flag on an idea confers nothing', run: (c) => {
    const flagged = { ...idea({ ideaId: 'idea_f', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [], reviews: [] }), approved: true } as unknown as Idea;
    return c.offerable(flagged, []) ? 'stored flag admitted an idea' : null;
  } },
  { id: 'AF11', law: 'selection is non-evaluative: id order, independent of match count or input order', run: (c) => {
    const one = idea({ ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [], reviews: [beta('describes', '2026-11-01')] });
    const two = idea({ ideaId: 'idea_c', tier: 'in-work', anchorRequirement: ['dialogue', 'pov'], linkedIdeaIds: [], reviews: [beta('describes', '2026-11-01')] });
    const rat = [{ ideaId: 'idea_a', date: '2026-11-02' }, { ideaId: 'idea_c', date: '2026-11-02' }];
    const obs = { observationId: 'obs_2', anchors: ['dialogue', 'pov'] };
    for (const lib of [[one, two], [two, one]]) {
      const ids = c.offer(args(c, { library: lib, ratifications: rat, observation: obs })).moments.map((m) => m.ideaId);
      if (JSON.stringify(ids) !== JSON.stringify(['idea_a', 'idea_c'])) return `order ${JSON.stringify(ids)}`;
    }
    return null;
  } },
  { id: 'AF12', law: 'a review points at a passage; it never carries one', run: (c) => {
    for (const k of ['passageText', 'excerpt', 'quote', 'text']) {
      const raw = rawOf(A); (raw.reviews as Record<string, unknown>[])[0]![k] = 'the writer\'s sentence';
      if (c.validateIdea(raw).ok) return `review carrying ${k} accepted`;
    }
    return null;
  } },
  { id: 'AF13', law: 'disagreement stays disagreement: summary is the entries, no tally or consensus', run: (c) => {
    const mixed = idea({ ...A, reviews: [beta('describes', '2026-11-01'), beta('prescribes', '2026-11-03')], ideaId: 'idea_a', tier: 'in-work', anchorRequirement: ['dialogue'], linkedIdeaIds: [] });
    const s = c.reviewSummary(mixed);
    return JSON.stringify(Object.keys(s)) === JSON.stringify(['entries']) ? null : `summary keys ${JSON.stringify(Object.keys(s))}`;
  } },
  { id: 'AF14', law: 'writer level is inert: selection never depends on who the writer is', run: (c) => {
    const base = JSON.stringify(c.offer(args(c, {})));
    for (const p of [{ level: 'novice' }, { level: 'expert' }]) {
      if (JSON.stringify(c.offer(args(c, { writerProfile: p }))) !== base) return `output depends on writerProfile ${p.level}`;
    }
    return null;
  } },
  { id: 'AF15', law: 'MAIA writes nothing: a moment carries only library fields, verbatim, in every facet', run: (c) => {
    const allowed = ['anchor', 'canDecline', 'canReturn', 'depth', 'ideaId', 'source', 'technique'];
    for (const f of FACETS) for (const m of c.offer(args(c, { facet: f })).moments) {
      if (JSON.stringify(Object.keys(m).sort()) !== JSON.stringify(allowed)) return `moment keys ${JSON.stringify(Object.keys(m).sort())} in ${f}`;
      if (m.technique !== A.technique) return `technique text altered in ${f}`;
    }
    return null;
  } },
  { id: 'AF16', law: 'no detached lesson: every moment can be declined and returned to the passage', run: (c) => {
    for (const f of FACETS) for (const m of c.offer(args(c, { facet: f })).moments) {
      if (!m.canDecline || !m.canReturn) return `moment not declinable/returnable in ${f}`;
      if (m.anchor !== OBS.observationId) return `moment not anchored to the observation in ${f}`;
    }
    return null;
  } },
];
