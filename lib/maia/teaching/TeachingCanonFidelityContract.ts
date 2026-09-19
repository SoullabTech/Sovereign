/**
 * MAIA-TEACHING-INTELLIGENCE-01 — Teaching Canon Fidelity Contract (tcf-1).
 *
 * Bounded remediation produced by the Founder Production Experience Witness.
 * This contract does not create a new teaching architecture, retrieve sources,
 * call a model, persist learner state, or widen T8 authority. It constrains how
 * already-active teaching may represent selected Soullab canon/research domains.
 */
export const TEACHING_CANON_FIDELITY_VERSION = 'tcf-1' as const;

export type TeachingCanonFidelityDomain =
  | 'relational_geometry'
  | 'elemental_alchemy'
  | 'spiralogic'
  | 'systems_complexity';

export interface TeachingCanonReference {
  sourceId: string;
  locator: string;
  standing: 'soullab_research' | 'soullab_canon' | 'founder_ruling';
}

export interface TeachingCanonFidelityRecord {
  contractVersion: typeof TEACHING_CANON_FIDELITY_VERSION;
  standing: 'SERVER_CANON_FIDELITY_BOUNDARY';
  domainKeys: readonly TeachingCanonFidelityDomain[];
  laws: readonly string[];
  references: readonly TeachingCanonReference[];
  authorityEffect: 'REPRESENTATION_CONSTRAINT_ONLY';
  mayRetrieve: false;
  mayBrowse: false;
  mayCallModel: false;
  mayPersistLearnerState: false;
  mayChangeTeachingAuthority: false;
}

const RGR_REFERENCES: readonly TeachingCanonReference[] = [
  {
    sourceId: 'rgr-00-research-constitution',
    locator: 'docs/programme/RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION_2026-09-18.md',
    standing: 'soullab_research',
  },
  {
    sourceId: 'rgr-02-formal-comparison',
    locator: 'docs/programme/RGR-02_FORMAL_COMPARISON_MATRIX_2026-09-18.md',
    standing: 'soullab_research',
  },
  {
    sourceId: 'rgr-03-minimal-transfer-hypothesis',
    locator: 'docs/programme/RGR-03_MINIMAL_RELATIONAL_TRANSFER_HYPOTHESIS_2026-09-18.md',
    standing: 'soullab_research',
  },
  {
    sourceId: 'rgr-04-benchmark-constitution',
    locator: 'docs/programme/RGR-04_SYNTHETIC_RELATIONAL_BENCHMARK_CONSTITUTION_2026-09-18.md',
    standing: 'soullab_research',
  },
  {
    sourceId: 'rgr-05-feasibility-gate',
    locator: 'git:a826d5ae77f52c443ee29693d745275918906ff4',
    standing: 'soullab_research',
  },
];

const ONTOLOGY_REFERENCES: readonly TeachingCanonReference[] = [
  {
    sourceId: 'elemental-alchemy-founder-canon',
    locator: 'docs/specs/ELEMENTAL_ALCHEMY_FOUNDER_CANON_SPEC_2026-07-27.md',
    standing: 'soullab_canon',
  },
  {
    sourceId: 'spiralogic-canonical-reference',
    locator: 'docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md',
    standing: 'soullab_canon',
  },
  {
    sourceId: 'founder-production-witness',
    locator: 'docs/programme/MAIA-TEACHING-INTELLIGENCE-01_FOUNDER_PRODUCTION_EXPERIENCE_WITNESS_2026-09-19.md',
    standing: 'founder_ruling',
  },
];

function norm(text: string): string {
  return text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}

function uniqueReferences(refs: readonly TeachingCanonReference[]): TeachingCanonReference[] {
  return [...new Map(refs.map((ref) => [ref.sourceId, ref])).values()];
}

export function resolveTeachingCanonFidelity(input: {
  domainKey: string;
  message: string;
}): TeachingCanonFidelityRecord | null {
  const t = norm(input.message);
  const relationalGeometry =
    input.domainKey === 'relational_geometry'
    || /\brelational geometry\b/.test(t)
    || (/\bgenuinely geometric\b/.test(t) && /\brelationship/.test(t))
    || /\bgeometric framing\b/.test(t)
    || (/\bdistance\b/.test(t) && /\bangle\b/.test(t) && /\bcurvature\b/.test(t));
  const systemsComparison =
    input.domainKey === 'systems_complexity'
    || /\bsystems? theory\b|\bfield theory\b/.test(t);
  const ontology =
    input.domainKey === 'elemental_alchemy'
    || input.domainKey === 'spiralogic'
    || /\belemental alchemy\b|\bspiralogic\b|\bspiral logic\b/.test(t);

  if (!relationalGeometry && !systemsComparison && !ontology) return null;

  const domainKeys: TeachingCanonFidelityDomain[] = [];
  const laws: string[] = [];
  const references: TeachingCanonReference[] = [];

  if (relationalGeometry) {
    domainKeys.push('relational_geometry');
    references.push(...RGR_REFERENCES);
    laws.push(
      'RGR RESEARCH STANDING: Relational Geometry Reasoning is an active Soullab research programme. The programme is canonical through RGR-05 pre-materialization feasibility/validator work, but its core relational-transfer hypothesis has NOT yet been empirically established.',
      'GEOMETRY BOUNDARY: RGR-00 states that relation is the object of inquiry and geometry is a candidate language, not a predetermined answer. Do not teach that human meaning, consciousness, or relationships literally ARE geometry.',
      'FORMALITY BOUNDARY: distance, angle, curvature, topology, invariants, and related geometric terms are candidate formal constructs unless an exact RGR model defines the objects, transformations, metric/topology, measurement rule, and falsification test. Do not present them as already-measured relational quantities.',
      'EVIDENCE BOUNDARY: established findings from network science, systems theory, complexity, psychology, or other fields may motivate or support component ideas; they are not by themselves empirical evidence that RGR is true as a distinct theory.',
      'BASELINE LAW: RGR-02 requires simpler vector/relational and graph/structural comparators. If those explain the target phenomenon as well as a geometric formalism, RGR may not claim geometry is necessary.',
    );
  }

  if (systemsComparison) {
    domainKeys.push('systems_complexity');
    references.push(...RGR_REFERENCES.slice(0, 2));
    laws.push(
      'ADJACENT-THEORY FAIRNESS: Do not claim that systems theory, network theory, complexity science, or field approaches treat relational position, organization, configuration, or context as irrelevant. Acknowledge genuine overlap before stating a distinction.',
      'COMPARISON DISCIPLINE: If comparing a Soullab framework with systems or field theory, distinguish the exact formal object or research question at issue. Do not manufacture novelty by weakening the comparison theory.',
      'FIELD-THEORY AMBIGUITY: "field theory" may refer to different scientific, mathematical, or psychological traditions. Disambiguate when the distinction materially affects the claim.',
    );
  }

  if (ontology) {
    if (/\belemental alchemy\b/.test(t) || input.domainKey === 'elemental_alchemy') domainKeys.push('elemental_alchemy');
    if (/\bspiralogic\b|\bspiral logic\b/.test(t) || input.domainKey === 'spiralogic') domainKeys.push('spiralogic');
    references.push(...ONTOLOGY_REFERENCES);
    laws.push(
      'SOULLAB ONTOLOGY: Elemental Alchemy, Spiralogic, and Relational Geometry are distinct, ontologically foundational, interdependent structures within Soullab. None is merely a decorative metaphor, secondary overlay, or derivative application of another.',
      'NO HIERARCHICAL REDUCTION: Do not teach that Relational Geometry is the underlying architecture while Elemental Alchemy is merely its experiential map or Spiralogic merely its application to time. Functional distinctions are allowed; ontological subordination is not.',
      'FUNCTIONAL DISTINCTION: Elemental Alchemy carries the elemental/qualitative process ontology; Spiralogic carries recursive developmental/process organization; RGR investigates whether relational structure admits useful formal representation. Their relationship is mutually informing, not a proof that one mathematically derives the others.',
      'INTERNAL-EXTERNAL DISTINCTION: Foundational standing inside Soullab is not external scientific validation. Preserve the difference between Soullab ontology/canon and empirical claims about nature, psychology, or AI.',
    );
  }

  return Object.freeze({
    contractVersion: TEACHING_CANON_FIDELITY_VERSION,
    standing: 'SERVER_CANON_FIDELITY_BOUNDARY',
    domainKeys: Object.freeze([...new Set(domainKeys)]),
    laws: Object.freeze(laws),
    references: Object.freeze(uniqueReferences(references)),
    authorityEffect: 'REPRESENTATION_CONSTRAINT_ONLY',
    mayRetrieve: false,
    mayBrowse: false,
    mayCallModel: false,
    mayPersistLearnerState: false,
    mayChangeTeachingAuthority: false,
  });
}

export function renderTeachingCanonFidelity(record: TeachingCanonFidelityRecord): string {
  return [
    'MAIA TEACHING CANON FIDELITY · CURRENT-TURN REPRESENTATION BOUNDARY',
    'This block constrains how canonical/research standing is represented. It grants no retrieval, model, learner-profile, or teaching authority.',
    ...record.laws.map((law) => '- ' + law),
    'Canonical references: ' + record.references.map((ref) => ref.sourceId + '@' + ref.locator).join('; '),
  ].join('\n');
}
