import { readFileSync } from 'node:fs';
import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { type StandingEvidence } from './standing-envelope';
import { renderWithStructuralRecovery } from './structural-recovery';

interface FrozenRow {
  seed: number;
  status: 'rendered' | 'refused';
  rawPlan: unknown;
  rawPlanSha256: string;
  rendered?: { digest: string; text: string };
  refusal?: string;
}
interface FrozenArtifact { rows: FrozenRow[] }

const sourcePath = 'docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT1_S4_2026-09-16.json';
const frozen = JSON.parse(readFileSync(sourcePath, 'utf8')) as FrozenArtifact;

const evidence: StandingEvidence[] = [
  { id: 'E-OLD', text: 'I think autonomy is the center of this for me.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'M-OLD', text: 'Autonomy seems to be the organizing center of what is happening.', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', derivedFromEvidenceIds: ['E-OLD'] },
  { id: 'E-NOW', text: 'Actually, grief is the center. Autonomy is how I have been organizing around it.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];
const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: 'organizing-center', evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: 'organizing-center', evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];
const standing = resolveClaimStanding(evidence, acts);

const rows = frozen.rows.map((row) => {
  const result = renderWithStructuralRecovery(evidence, row.rawPlan, standing);
  const unchangedFrozenRender = row.status === 'rendered'
    ? result.status === 'rendered' && result.rendered.digest === row.rendered?.digest
    : null;
  return {
    seed: row.seed,
    inheritedRawPlanSha256: row.rawPlanSha256,
    originalStatus: row.status,
    originalRefusal: row.refusal ?? null,
    resultStatus: result.status,
    modelCalls: 0,
    unchangedFrozenRender,
    recovery: result.recovery,
    rendered: result.rendered,
    synthesisUnchangedFromRawPlan: JSON.stringify(result.plan.synthesis) === JSON.stringify((row.rawPlan as any).synthesis),
    questionUnchangedFromRawPlan: JSON.stringify(result.plan.question) === JSON.stringify((row.rawPlan as any).question),
  };
});

console.log(JSON.stringify({
  programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
  act: 'ACT 2 frozen-plan structural recovery replay',
  sourceArtifact: sourcePath,
  modelCalls: 0,
  rows,
}, null, 2));
