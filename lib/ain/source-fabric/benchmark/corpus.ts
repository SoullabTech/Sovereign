import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type BenchmarkSourceClass =
  | 'canon'
  | 'design_contract'
  | 'research'
  | 'programme_constitution'
  | 'programme_witness'
  | 'manuscript'
  | 'architecture'
  | 'benchmark_contract';

export type BenchmarkEpistemicRole =
  | 'governing_law'
  | 'experience_contract'
  | 'research_hypothesis'
  | 'research_landscape'
  | 'technical_witness'
  | 'author_source'
  | 'implementation_architecture'
  | 'benchmark_governance';

export interface BenchmarkCorpusSource {
  sourceRef: string;
  path: string;
  sourceClass: BenchmarkSourceClass;
  domain: string;
  epistemicRole: BenchmarkEpistemicRole;
  temporalStanding: 'current' | 'historical_context' | 'supersession_record';
  authorityRole: 'governing' | 'descriptive' | 'evidence' | 'author_source';
  tags: string[];
  snapshotOrigin?: string;
  expectedSha256?: string;
}
export const BENCHMARK_CORPUS: readonly BenchmarkCorpusSource[] = [
  {
    sourceRef:'authority-law',
    path:'docs/canon/REPRESENTATION_AUTHORITY_LAW.md',
    sourceClass:'canon',
    domain:'authority',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['authority','representation','selection','grant','attestation','similarity'],
  },
  {
    sourceRef:'interface-humility',
    path:'docs/canon/INTERFACE_HUMILITY.md',
    sourceClass:'canon',
    domain:'epistemic-posture',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['humility','representation','person','orientation','non-possession'],
  },
  {
    sourceRef:'remain-unpossessed',
    path:'docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md',
    sourceClass:'canon',
    domain:'memory-sovereignty',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['memory','non-formation','opacity','refusal','temporal-sovereignty'],
  },
  {
    sourceRef:'direction-authority',
    path:'docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md',
    sourceClass:'canon',
    domain:'authority',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['authority','member','development','constitutional','maia-role'],
  },
  {
    sourceRef:'memory-consent',
    path:'docs/design/contracts/memory-consent.md',
    sourceClass:'design_contract',
    domain:'memory',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['memory','consent','writing','recall','member-control'],
  },
  {
    sourceRef:'facet-crossings',
    path:'docs/design/contracts/facet-crossings.md',
    sourceClass:'design_contract',
    domain:'house-relations',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['crossing','provenance','source-identity','return','authorship','relation'],
  },
  {
    sourceRef:'dream-object',
    path:'docs/design/contracts/dream-canonical-object.md',
    sourceClass:'design_contract',
    domain:'dream',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['dream','imaginal','similarity','member-owned','canonical-object','prospective'],
  },
  {
    sourceRef:'astrology-contract',
    path:'docs/design/contracts/astrology.md',
    sourceClass:'design_contract',
    domain:'astrology',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['astrology','symbolic','prediction','identity','orientation','birth-chart'],
  },
  {
    sourceRef:'divination-return',
    path:'docs/design/contracts/divination-saved-readings.md',
    sourceClass:'design_contract',
    domain:'divination',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['divination','returnability','exact-return','symbolic','provenance'],
  },
  {
    sourceRef:'writers-studio',
    path:'docs/design/contracts/writers-studio-rebuild.md',
    sourceClass:'design_contract',
    domain:'writing',
    epistemicRole:'experience_contract',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['writing','voice','authorship','editorial','manuscript','guide'],
  },
  {
    sourceRef:'rgr-note',
    path:'docs/research/relational-geometry/RELATIONAL_GEOMETRY_PRELIMINARY_NOTE_2026-09-15.md',
    sourceClass:'research',
    domain:'relational-geometry',
    epistemicRole:'research_hypothesis',
    temporalStanding:'current',
    authorityRole:'descriptive',
    tags:['relation','typed-relation','similarity','geometry','astrology','grammar'],
  },
  {
    sourceRef:'rgr-constitution',
    path:'docs/programme/RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION_2026-09-18.md',
    sourceClass:'programme_constitution',
    domain:'relational-geometry',
    epistemicRole:'research_landscape',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['relation','meaning','model','hypothesis','prediction','geometry','provenance'],
  },
  {
    sourceRef:'teaching-constitution',
    path:'docs/programme/MAIA-TEACHING-INTELLIGENCE-01_T0_TEACHING_CONSTITUTION_2026-09-18.md',
    sourceClass:'programme_constitution',
    domain:'teaching',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['teaching','learner-sovereignty','presence','source-fidelity','assessment'],
  },
  {
    sourceRef:'ea-canon',
    path:'docs/specs/ELEMENTAL_ALCHEMY_FOUNDER_CANON_SPEC_2026-07-27.md',
    sourceClass:'architecture',
    domain:'elemental-alchemy',
    epistemicRole:'implementation_architecture',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['elemental-alchemy','provenance','author-only','similarity-threshold','retrieval'],
  },
  {
    sourceRef:'ea-manuscript',
    path:'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md',
    sourceClass:'manuscript',
    domain:'elemental-alchemy',
    epistemicRole:'author_source',
    temporalStanding:'current',
    authorityRole:'author_source',
    tags:['elemental-alchemy','lambspring','edinger','jung','individuation','alchemy'],
  },
  {
    sourceRef:'j9-adjudication',
    path:'docs/programme/J9_REPRESENTATION_AUTHORITY_ADJUDICATION_2026-09-17.md',
    sourceClass:'programme_witness',
    domain:'authority',
    epistemicRole:'technical_witness',
    temporalStanding:'historical_context',
    authorityRole:'evidence',
    tags:['authority','representation','adjudication','historical'],
  },
  {
    sourceRef:'j11-reconciliation',
    path:'docs/programme/J11_CANONICAL_TRANSFER_RECONCILIATION_2026-09-17.md',
    sourceClass:'programme_witness',
    domain:'authority',
    epistemicRole:'technical_witness',
    temporalStanding:'supersession_record',
    authorityRole:'evidence',
    tags:['authority','reconciliation','supersession','retrieval','historical'],
  },
  {
    sourceRef:'library-adr',
    path:'docs/adr/004-converge-on-single-knowledge-engine.md',
    sourceClass:'architecture',
    domain:'retrieval',
    epistemicRole:'implementation_architecture',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['library','retrieval','one-engine','pgvector','full-text','consent'],
  },
  {
    sourceRef:'source-fabric',
    path:'docs/programme/AIN-SOURCE-FABRIC-01/SOURCE_FABRIC_CONTRACT_2026-09-28.md',
    sourceClass:'programme_constitution',
    domain:'retrieval-governance',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['permission','retrieval','epistemic-standing','temporal','graph','counterevidence'],
  },
  {
    sourceRef:'source-fabric-census',
    path:'docs/programme/AIN-SOURCE-FABRIC-01/SUBSTRATE_CENSUS_2026-09-28.md',
    sourceClass:'programme_witness',
    domain:'retrieval',
    epistemicRole:'technical_witness',
    temporalStanding:'current',
    authorityRole:'evidence',
    tags:['library','semantic','full-text','hybrid','census','current-state'],
  },
  {
    sourceRef:'benchmark-contract',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/BENCHMARK_CONTRACT_2026-09-28.md',
    sourceClass:'benchmark_contract',
    domain:'retrieval-benchmark',
    epistemicRole:'benchmark_governance',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['analytic','associative','corpus-callosum','aether','benchmark','diversity'],
  },
  {
    sourceRef:'indra-grammar',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/corpus-snapshots/indras-web/SOURCE_RELATION_GRAMMAR_2026-09-27.md',
    sourceClass:'programme_constitution',
    domain:'indras-web',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['source','relation','jewel','gestalt','permeability','correction'],
    snapshotOrigin:'AIN-INDRAS-WEB-01/SOURCE_RELATION_GRAMMAR_2026-09-27.md',
    expectedSha256:'b5a2ebd5f9ce9ec13d4bbaec9babd934e4475478d385951feaa63d1abe59ff14',
  },
  {
    sourceRef:'indra-permeability',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/corpus-snapshots/indras-web/FACET_CENTER_PERMEABILITY_CONTEXT_DISCLOSURE_2026-09-27.md',
    sourceClass:'programme_constitution',
    domain:'indras-web',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['permission','admission','speakable','disclosed','facet-open','revocation'],
    snapshotOrigin:'AIN-INDRAS-WEB-01/FACET_CENTER_PERMEABILITY_CONTEXT_DISCLOSURE_2026-09-27.md',
    expectedSha256:'412fe23021f31ebbd6e93c2b796659d8e76e1ac4f762b2d4830688d5aef48e71',
  },
  {
    sourceRef:'indra-composer',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/corpus-snapshots/indras-web/PURE_CENTER_COMPOSER_CONTRACT_2026-09-27.md',
    sourceClass:'programme_constitution',
    domain:'indras-web',
    epistemicRole:'governing_law',
    temporalStanding:'current',
    authorityRole:'governing',
    tags:['center','composer','gestalt','member-authority','provenance'],
    snapshotOrigin:'AIN-INDRAS-WEB-01/PURE_CENTER_COMPOSER_CONTRACT_2026-09-27.md',
    expectedSha256:'9aff9ac384d9990b01d998059ef5301005a84ae7b27297175a6aa3c6b3f94087',
  },
  {
    sourceRef:'indra-validation',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/corpus-snapshots/indras-web/WB16_TECHNICAL_RELATIONAL_VALIDATION_2026-09-27.md',
    sourceClass:'programme_witness',
    domain:'indras-web',
    epistemicRole:'technical_witness',
    temporalStanding:'current',
    authorityRole:'evidence',
    tags:['ablation','permutation','counterfactual','relation-type','symbolic-standing'],
    snapshotOrigin:'AIN-INDRAS-WEB-01/WB16_TECHNICAL_RELATIONAL_VALIDATION_2026-09-27.md',
    expectedSha256:'d620a57f842d5cab430ffcd9b8d4e3f613c41f0133beb9c49f0144bc3905f71e',
  },
  {
    sourceRef:'indra-topology',
    path:'docs/programme/AIN-SOURCE-FABRIC-02/corpus-snapshots/indras-web/WB19_LIVE_TOPOLOGY_AWARE_RENDER_WITNESS_2026-09-28.md',
    sourceClass:'programme_witness',
    domain:'indras-web',
    epistemicRole:'technical_witness',
    temporalStanding:'current',
    authorityRole:'evidence',
    tags:['topology','weighting','revocation','gestalt','semantic-leak','hierarchy'],
    snapshotOrigin:'AIN-INDRAS-WEB-01/WB19_LIVE_TOPOLOGY_AWARE_RENDER_WITNESS_2026-09-28.md',
    expectedSha256:'a0ad13484324661417b178544e95fd226923ff212323e956dd9364c3ca977551',
  },
];

export function benchmarkSourceByRef(sourceRef: string): BenchmarkCorpusSource {
  const source = BENCHMARK_CORPUS.find(s => s.sourceRef === sourceRef);
  if (!source) throw new Error('UNKNOWN_BENCHMARK_SOURCE:'+sourceRef);
  return source;
}

export function sourceSha256(repoRoot: string, source: BenchmarkCorpusSource): string {
  const bytes = readFileSync(resolve(repoRoot, source.path));
  return createHash('sha256').update(bytes).digest('hex');
}
export function verifyBenchmarkCorpus(repoRoot: string): {
  count: number;
  snapshotChecks: Array<{ sourceRef: string; expected: string; actual: string; matches: boolean }>;
} {
  const refs = new Set<string>();
  const snapshotChecks: Array<{ sourceRef: string; expected: string; actual: string; matches: boolean }> = [];

  for (const source of BENCHMARK_CORPUS) {
    if (refs.has(source.sourceRef)) throw new Error('DUPLICATE_BENCHMARK_SOURCE:'+source.sourceRef);
    refs.add(source.sourceRef);
    const actual = sourceSha256(repoRoot, source);
    if (source.expectedSha256) {
      snapshotChecks.push({
        sourceRef: source.sourceRef,
        expected: source.expectedSha256,
        actual,
        matches: actual === source.expectedSha256,
      });
      if (actual !== source.expectedSha256) {
        throw new Error('BENCHMARK_SNAPSHOT_DRIFT:'+source.sourceRef);
      }
    }
  }

  return { count: BENCHMARK_CORPUS.length, snapshotChecks };
}
