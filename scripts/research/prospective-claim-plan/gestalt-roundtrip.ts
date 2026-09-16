import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { compileClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/claimPlan';
import { renderClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/renderer';
import { auditRenderedRoundTrip } from '../../../lib/maia/prospectiveClaimPlan/roundTrip';
import type { ClaimDraft } from '../../../lib/maia/prospectiveClaimPlan/types';

const hash = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const guardian: ClaimDraft = {
  proposition: 'Silver Cedar is the adopted guardian image.',
  surfaceText: 'The Silver Cedar is the guardian image you already chose for this work.',
  speechAct: 'GROUNDED', standing: 'established', evidenceRefs: ['E5','E6'], relationRefs: ['R5'],
};
const candidate: ClaimDraft = {
  proposition: 'The symbol may function as an orienting bridge.',
  surfaceText: 'Perhaps the image is functioning as an orienting bridge between those values and the work.',
  speechAct: 'CANDIDATE', standing: 'provisional', evidenceRefs: ['E3','E4','E5'],
};
const open: ClaimDraft = {
  proposition: 'How might the guardian relation affect concrete practice or design?',
  surfaceText: 'How might that guardian relationship begin to affect the actual design of the work?',
  speechAct: 'QUESTION', standing: 'open', questionIntent: 'open_edge',
};

const plan = compileClaimPlan('gestalt-continuity-shadow-v1', [guardian, candidate, open]);
const rendered = renderClaimPlan(plan);
const audit = auditRenderedRoundTrip(plan, rendered);
let reopenRejected = false;
let launderingRejected = false;
try {
  compileClaimPlan('bad-reopen', [guardian, {
    proposition: 'What does Silver Cedar mean?', surfaceText: 'What does the Silver Cedar mean to you?',
    speechAct: 'QUESTION', standing: 'open', questionIntent: 'reopen', targetOrdinals: [0],
  }]);
} catch { reopenRejected = true; }
try {
  compileClaimPlan('bad-launder', [{
    proposition: 'Resilience is established.', surfaceText: 'Resilience is what the symbol means to you.',
    speechAct: 'CANDIDATE', standing: 'provisional', evidenceRefs: ['E5'],
  }]);
} catch { launderingRejected = true; }

const output = {
  schema: 'PROSPECTIVE_CLAIM_PLAN_GESTALT_ROUNDTRIP_V1',
  planHash: hash(plan.planId),
  claimCount: plan.claims.length,
  speechActs: plan.claims.map((c) => c.speechAct),
  standings: plan.claims.map((c) => c.standing),
  claimIds: plan.claims.map((c) => c.claimId),
  renderedHash: hash(rendered.text),
  roundTrip: audit,
  invalidCases: { establishedMeaningReopenRejected: reopenRejected, candidateLaunderingRejected: launderingRejected },
};
const out = path.join(process.cwd(), 'docs/programme/evidence/prospective-claim-plan/P6_GESTALT_ROUNDTRIP_2026-09-16.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
