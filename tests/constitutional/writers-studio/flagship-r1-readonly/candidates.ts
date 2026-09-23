import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapRealReview, type RealReviewInput, type RealReviewOutcome } from '@/lib/writersStudio/studio/realReview';
import type { Subject } from './laws';
import { READY_INPUT } from './fixtures';

const FILE = 'lib/writersStudio/studio/realReview.ts';
export const REFERENCE: Subject = { name: 'REFERENCE', map: mapRealReview, mapperFile: FILE };

const mapReady = (input: RealReviewInput): RealReviewOutcome => mapRealReview(input);
const mutateReady = (input: RealReviewInput, fn: (r: Extract<RealReviewOutcome, { kind: 'ready' }>) => RealReviewOutcome) => {
  const r = mapRealReview(input); return r.kind === 'ready' ? fn(r) : r;
};

const D1: Subject = { ...REFERENCE, name: 'R1-D1-commissions-on-open', sourceAppend: '\nrequestDevelopmentalReading();' };
const D2: Subject = { ...REFERENCE, name: 'R1-D2-cognition-on-load', sourceAppend: '\nrunStructured();' };
const D3: Subject = { ...REFERENCE, name: 'R1-D3-ui-local-observation-id', map: (i) => mutateReady(i, (r) => ({
  ...r, view: { ...r.view, findings: r.view.findings.map((f, n) => ({ ...f, id: `row-${n}` })) },
})) };
const D4: Subject = { ...REFERENCE, name: 'R1-D4-fixture-fallback', sourceAppend: "\nimport { REVIEW } from 'scripts/witness/flagship/fixtures.tsx';" };
const D5: Subject = { ...REFERENCE, name: 'R1-D5-reranks-observations', map: (i) => mutateReady(i, (r) => ({
  ...r, view: { ...r.view, findings: [...r.view.findings].reverse() },
})) };
const D6: Subject = { ...REFERENCE, name: 'R1-D6-missing-becomes-empty', map: (i) => {
  if (i.summaries.length !== 0) return mapReady(i);
  const base = mapRealReview(READY_INPUT);
  return base.kind === 'ready' ? { ...base, view: { ...base.view, findings: [] } } : base;
} };
const D7: Subject = { ...REFERENCE, name: 'R1-D7-fabricated-staleness', map: (i) => mutateReady(i, (r) => ({
  ...r, view: { ...r.view, freshness: { kind: 'stale', when: 'guessed', changedSince: 2 } },
})) };
const D8: Subject = { ...REFERENCE, name: 'R1-D8-mutates-standing', sourceAppend: '\nrecordStanding(); /standings' };
const D9: Subject = { ...REFERENCE, name: 'R1-D9-member-act-storage', sourceAppend: '\nappendEditorialNote();' };
const D10: Subject = { ...REFERENCE, name: 'R1-D10-frozen-presentation-mutation', frozenMutationPaths: ['app/writers-studio/flagship/DevelopReview.tsx'] };
const D11: Subject = { ...REFERENCE, name: 'R1-D11-wrong-work-reading', map: (i) => mapRealReview({ ...i, host: { ...i.host, manuscriptId: (i.payload as any)?.reading?.manuscriptId ?? i.host.manuscriptId } }) };
const D12: Subject = { ...REFERENCE, name: 'R1-D12-silent-partial-payload', map: (i) => {
  if ((i.payload as any)?.reading?.scope) return mapRealReview(i);
  return mapRealReview(READY_INPUT);
} };

export const DEFEAT_CANDIDATES = [D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11,D12] as const;
export const NAMED_KILL: Readonly<Record<string,string>> = {
  'R1-D1-commissions-on-open':'R1-0-L1-no-commission-on-load',
  'R1-D2-cognition-on-load':'R1-0-L2-no-cognition-on-load',
  'R1-D3-ui-local-observation-id':'R1-0-L3-durable-identities-preserved',
  'R1-D4-fixture-fallback':'R1-0-L4-no-fixture-fallback',
  'R1-D5-reranks-observations':'R1-0-L5-canonical-manuscript-order',
  'R1-D6-missing-becomes-empty':'R1-0-L6-no-reading-distinct-from-read-nothing',
  'R1-D7-fabricated-staleness':'R1-0-L7-staleness-never-fabricated',
  'R1-D8-mutates-standing':'R1-0-L8-load-does-not-mutate-standing',
  'R1-D9-member-act-storage':'R1-0-L9-load-does-not-create-member-acts',
  'R1-D10-frozen-presentation-mutation':'R1-0-L10-frozen-presentation-untouched',
  'R1-D11-wrong-work-reading':'R1-0-L11-wrong-work-reading-refused',
  'R1-D12-silent-partial-payload':'R1-0-L12-partial-payload-refused',
};

void readFileSync; void join;
