import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { compileClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/claimPlan';
import { renderClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/renderer';
import { auditRenderedRoundTrip } from '../../../lib/maia/prospectiveClaimPlan/roundTrip';
import type { ClaimDraft, RenderedClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/types';

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const drafts: ClaimDraft[] = [
  {
    proposition: 'Silver Cedar is the adopted guardian image.',
    surfaceText: 'The Silver Cedar is the guardian image you already chose for this work.',
    speechAct: 'GROUNDED', standing: 'established', evidenceRefs: ['E5', 'E6'], relationRefs: ['R5'],
  },
  {
    proposition: 'Resilience may be part of the symbol significance.',
    surfaceText: 'I wonder whether resilience is part of what the image is beginning to carry.',
    speechAct: 'CANDIDATE', standing: 'provisional', evidenceRefs: ['E5'],
  },
  {
    proposition: 'How might the guardian relation affect concrete practice or design?',
    surfaceText: 'How might that guardian relationship begin to affect the actual design of the work?',
    speechAct: 'QUESTION', standing: 'open', questionIntent: 'open_edge',
  },
];

const plan = compileClaimPlan('p6-deterministic-roundtrip', drafts);
const rendered = renderClaimPlan(plan);
const audit = auditRenderedRoundTrip(plan, rendered);

const extra: RenderedClaimPlan = {
  ...rendered,
  text: `${rendered.text} This sentence was never planned.`,
};
const merged: RenderedClaimPlan = {
  planId: rendered.planId,
  text: rendered.text.replace(' I wonder', 'I wonder'),
  spans: rendered.spans,
};

const output = {
  schema: 'PROSPECTIVE_CLAIM_PLAN_P6_ROUNDTRIP_V1',
  authority: 'deterministic research/shadow evidence only',
  planHash: hash(plan.planId),
  renderedHash: hash(rendered.text),
  prospectiveClaimCount: plan.claims.length,
  retrospectiveClaimCount: audit.retrospectiveClaimIds.length,
  droppedClaimCount: audit.droppedClaimCount,
  unplannedUnitCount: audit.unplannedUnitCount,
  roundTripOk: audit.ok,
  reason: audit.reason,
  mappings: audit.mappings,
  tamperChecks: {
    extraProse: auditRenderedRoundTrip(plan, extra),
    mergedSurface: auditRenderedRoundTrip(plan, merged),
  },
};

const out = path.join(
  process.cwd(),
  'docs/programme/evidence/prospective-claim-plan/P6_DETERMINISTIC_ROUNDTRIP_2026-09-16.json',
);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
