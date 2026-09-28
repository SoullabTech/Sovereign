import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAetherInputFromField } from '../../lib/ain/source-fabric/benchmark/aetherBuilder';
import {
  ablateSynthesisCandidate,
  generateAetherCandidates,
  validateSynthesisFalsification,
} from '../../lib/ain/source-fabric/benchmark/aetherSynthesis';

const ROOT = resolve(__dirname, '../..');
const OUT = resolve(ROOT, 'docs/programme/AIN-SOURCE-FABRIC-02/r6');
mkdirSync(OUT, { recursive: true });

const r4g = JSON.parse(readFileSync(
  resolve(ROOT, 'docs/programme/AIN-SOURCE-FABRIC-02/r4g/r4g-results.json'),
  'utf8',
));

function refsFor(id: string): string[] {
  const row = r4g.methods.final_with_abstention.rows.find((entry: any) => entry.id === id);
  if (!row) throw new Error('R4G_QUERY_NOT_FOUND:' + id);
  return row.retrieved.map((entry: any) => entry.sourceRef);
}

function witness(id: string, temporalNeed: 'current' | 'historical' | 'prospective' | 'mixed') {
  const input = buildAetherInputFromField(id, refsFor(id), temporalNeed);
  const candidates = generateAetherCandidates(input);
  const admitted = candidates.filter((candidate) => candidate.disposition === 'admitted_provisional');
  const ablations = admitted.flatMap((candidate) =>
    candidate.criticalSupportRefs.map((sourceRef) =>
      ablateSynthesisCandidate(input, candidate, sourceRef),
    ),
  );
  return {
    inquiryRef: id,
    sourceRefs: refsFor(id),
    candidateCount: candidates.length,
    admittedCount: admitted.length,
    refusedCount: candidates.length - admitted.length,
    validation: validateSynthesisFalsification(input, candidates),
    allCriticalAblationsDisappear: ablations.every(
      (row) => row.critical && row.relationInvalidated && row.after === 'absent',
    ),
    candidates,
    ablations,
  };
}

const evidence = {
  generatedAt: new Date().toISOString(),
  parentR5: 'e33b6b6638c290049487bfdb8710f0eaae7da06b',
  p4: witness('P4', 'mixed'),
  t5: witness('T5', 'current'),
  governance: {
    wholePersonConclusions: false,
    persistenceAuthority: false,
    causalAuthority: false,
    predictionAuthority: false,
    identityAuthority: false,
    diagnosticAuthority: false,
    thirdPartyInteriorityAuthority: false,
  },
};

writeFileSync(OUT + '/r6-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(OUT + '/r6-summary.json', JSON.stringify({
  generatedAt: evidence.generatedAt,
  parentR5: evidence.parentR5,
  p4CandidateCount: evidence.p4.candidateCount,
  p4AdmittedCount: evidence.p4.admittedCount,
  p4Valid: evidence.p4.validation.valid,
  p4CriticalAblationsDisappear: evidence.p4.allCriticalAblationsDisappear,
  t5CandidateCount: evidence.t5.candidateCount,
  t5AdmittedCount: evidence.t5.admittedCount,
  t5Valid: evidence.t5.validation.valid,
  t5CriticalAblationsDisappear: evidence.t5.allCriticalAblationsDisappear,
  governance: evidence.governance,
}, null, 2) + '\n');

console.log(readFileSync(OUT + '/r6-summary.json', 'utf8'));
