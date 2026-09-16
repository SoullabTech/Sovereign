import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { compileClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/claimPlan';
import { renderClaimPlan, verifyRenderedPlan } from '../../../lib/maia/prospectiveClaimPlan/renderer';
import { bindGestureToPlan } from '../../../lib/maia/prospectiveClaimPlan/gestureBinding';
import type { ClaimDraft } from '../../../lib/maia/prospectiveClaimPlan/types';

const hash = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const claims: ClaimDraft[] = [
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
    proposition: 'Does the resilience candidate fit?',
    surfaceText: 'Does that possibility fit what you mean?',
    speechAct: 'QUESTION', standing: 'open', questionIntent: 'confirm', targetOrdinals: [1],
  },
  {
    proposition: 'How might the guardian relation affect concrete practice or design?',
    surfaceText: 'How might that guardian relationship begin to affect the actual design of the work?',
    speechAct: 'QUESTION', standing: 'open', questionIntent: 'open_edge',
  },
];

const plan = compileClaimPlan('silver-cedar-prospective-v1', claims);
const rendered = renderClaimPlan(plan);
const confirmPlan = compileClaimPlan('silver-cedar-confirm-v1', claims.slice(0, 3));
const results = {
  schema: 'PROSPECTIVE_CLAIM_PLAN_OFFLINE_V1',
  planHash: hash(plan.planId),
  claimCount: plan.claims.length,
  claimIds: plan.claims.map((c) => c.claimId),
  speechActs: plan.claims.map((c) => c.speechAct),
  standings: plan.claims.map((c) => c.standing),
  renderVerified: verifyRenderedPlan(plan, rendered),
  renderedHash: hash(rendered.text),
  spans: rendered.spans,
  gestures: {
    confirm: bindGestureToPlan('that is exactly it. MAIA!', confirmPlan),
    correct: bindGestureToPlan("no, that's not it", confirmPlan),
    opaque: bindGestureToPlan('what was that phrase I mentioned earlier?', plan),
    restart: bindGestureToPlan('I already told you', compileClaimPlan('restart-v1', [claims[0]!, claims[3]!])),
  },
};
const out = path.join(process.cwd(), 'docs/programme/evidence/prospective-claim-plan/P4-P5_OFFLINE_ROUNDTRIP_2026-09-16.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
