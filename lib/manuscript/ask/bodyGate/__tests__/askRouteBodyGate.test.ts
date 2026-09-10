/**
 * S3 · P1 — R1–R4 AGAINST THE ACTUAL REPAIRED ROUTE.
 *
 *   ⭐⭐ The lawful reference proved the obligations discriminate. This file
 *       proves the REAL developmental Ask route satisfies them.
 *
 * ⛔ ORDER IS ASSERTED, NOT ONLY OUTCOME. A route that crossed twice and cleaned
 * up afterwards would return a correct-looking response, so every case inspects
 * the trace of which canonical operations were actually reached.
 *
 * The seams below are mocked so the route's OWN control flow is the subject.
 * ⛔ Nothing here re-implements the gate; the gate under test is the route.
 */

import { NextRequest } from 'next/server';

const trace: string[] = [];
const push = (s: string) => { trace.push(s); return s; };

const MEMBER = 'member-1';
const WORK = 'work-1';
const THREAD = 'thread-1';
const READING = 'reading-1';
const OBS = 'obs-1';
const S = 'section-S';
const T = 'section-T';
const PENDING = 'pending-ref-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

/* ── the mutable scenario each test sets ──────────────────────────────────── */
const scenario = {
  evidenceRefs: [] as any[],
  recovered: [] as { sectionId: string; text: string }[],
  unverifiable: false,
  claim: 'claimed' as 'claimed' | 'already_consumed',
  completion: 'completed' as 'completed' | 'incomplete',
  boundary: 'may_cross' as 'may_cross' | 'refused',
  boundaryFailsAt: null as string | null,
};

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: async () => MEMBER,
}));
jest.mock('@/lib/manuscript/ask/frozenReading', () => ({
  memberOwnsWork: async () => true,
  loadFrozenReading: async () => null,
  loadSectionHeads: async () => [],
  measureNow: async () => ({}),
}));
jest.mock('@/lib/manuscript/ask/frozenDevelopmentalReading', () => ({
  loadFrozenDevelopmentalReading: async () => ({
    id: READING,
    readState: { draftId: 'draft-1', revisionNumber: 3, inputFingerprint: 'fp', sections: {} },
    scope: { commissionedLens: 'lens', withStructure: false },
    provenance: { reader: {}, frozenAt: '2026-09-10T00:00:00Z' },
    observations: [],
  }),
}));
jest.mock('@/lib/manuscript/ask/developmentalAnchor', () => ({
  checkObservationAnchor: () => ({ ok: true, anchor: { on: 'observation', readingId: READING, observationKey: OBS } }),
  selectObservation: () => ({
    key: OBS, observation: 'an observation', evidenceRefs: scenario.evidenceRefs,
    doesNotEstablish: [], structureDependency: 'none',
  }),
}));
jest.mock('@/lib/manuscript/structure/canonicalFingerprint', () => ({
  canonicalFingerprint: async () => 'canon-1',
}));
jest.mock('@/lib/manuscript/development/capture', () => ({
  loadLiveWork: async () => ({ sections: null, structure: null }),
  loadRevisionContent: async () => { push('load'); return 'the whole revision'; },
}));
jest.mock('@/lib/manuscript/development/resolve', () => ({
  observationLocation: () => ({ state: 'unmeasured' }),
}));
jest.mock('@/lib/manuscript/ask/developmentalContext', () => ({
  assembleDevelopmentalContext: () => ({
    readState: { revisionNumber: 3 },
    reading: { readingId: READING, lens: 'lens', frozenAt: 'x', withStructure: false },
    observation: { key: OBS, text: 'o', doesNotEstablish: [], structureDependency: 'none' },
    location: { state: 'unmeasured' },
    evidence: scenario.unverifiable
      ? [{ kind: 'unverifiable', ref: { kind: 'section', sectionId: S }, refusal: 'revision_integrity_failure', detail: '' }]
      : scenario.recovered.map((r) => ({
          kind: 'verified', ref: { kind: 'section', sectionId: r.sectionId },
          recovered: { kind: 'text', sectionId: r.sectionId, range: { start: 0, end: 1 }, text: r.text },
        })),
  }),
  developmentalStaleness: () => ({}),
  stalenessFrom: () => ({}),
  hasUnverifiableEvidence: (ctx: any) => ctx.evidence.some((e: any) => e.kind === 'unverifiable'),
}));
jest.mock('@/lib/manuscript/ask/threadStore', () => ({
  openThread: async () => THREAD,
  appendTurn: async () => undefined,
  loadThread: async () => ({ id: THREAD, manuscriptId: WORK, turns: [] }),
  threadsOnAnchor: async () => [],
}));
jest.mock('@/lib/manuscript/ask/developmentalAskReader', () => ({
  askMaiaDevelopmental: async (ctx: any) => {
    push('cognition');
    crossed.push(...ctx.evidence.filter((e: any) => e.kind === 'verified').map((e: any) => e.recovered.sectionId));
    return { ok: true, answer: 'an answer', provenance: {} };
  },
}));
jest.mock('@/lib/manuscript/ask/bodyGate/sectionRecognition', () => ({
  /* ⭐ Recognition is a database read; the route's own control flow is the
     subject here. The shape is what matters: heading may be null, label never. */
  recognizeSections: async (_draftId: string, ids: readonly string[]) =>
    ids.map((sectionId, i) => ({
      sectionId,
      heading: sectionId === 'section-S' ? 'The Lighthouse Keeper' : null,
      label: sectionId === 'section-S' ? 'The Lighthouse Keeper' : `Section ${i + 1}`,
    })),
}));
jest.mock('@/lib/manuscript/ask/pendingAsk/pendingAskStore', () => ({
  createPendingAsk: async () => { push('create_pending'); return PENDING; },
}));
jest.mock('@/lib/manuscript/ask/pendingAsk/pendingAskClaimant', () => ({
  createPendingAskClaimant: () => ({
    async claim() {
      push('claim');
      return scenario.claim === 'claimed'
        ? { kind: 'claimed', coordinates: { memberId: MEMBER, manuscriptId: WORK, threadId: THREAD, readingId: READING, observationKey: OBS } }
        : { kind: 'already_consumed', completion: scenario.completion };
    },
    async recordCompleted() { push('record_completed'); },
  }),
}));
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: async (input: any) => {
    push('boundary');
    const sec = input.disclosure.sectionRef as string;
    /* ⭐ The `attempted` receipt is minted at the boundary, before the outcome. */
    attempted.push({ section: sec, requestRef: input.requestId });
    if (scenario.boundary === 'refused' || scenario.boundaryFailsAt === sec) {
      return { kind: 'receipt_refused', outcome: { kind: 'unavailable' } };
    }
    push('may_cross');
    const disclosureId = `d-${sec}`;
    minted.set(disclosureId, sec);
    return { kind: 'may_cross', disclosureId, receiptId: `r-${sec}` };
  },
  mayCrossBoundary: (o: any) => o.kind === 'may_cross',
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: async (id: string) => { push('receipt'); confirmed.push(minted.get(id)!); return true; },
}));

const crossed: string[] = [];
const attempted: { section: string; requestRef: string }[] = [];
const confirmed: string[] = [];
const minted = new Map<string, string>();

import { POST } from '@/app/api/sovereign/manuscripts/[id]/ask/route';

const post = async (body: unknown) => {
  const req = new NextRequest('http://localhost/api/sovereign/manuscripts/work-1/ask', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  });
  const res = await POST(req, { params: Promise.resolve({ id: WORK }) });
  return { status: res.status, json: await res.json() as any };
};

const ask = (extra: Record<string, unknown> = {}) => ({
  question: 'what did you mean by that?',
  anchor: { on: 'observation', readingId: READING, observationKey: OBS },
  ...extra,
});

const bodyRef = (sectionId: string) => ({ kind: 'passage', sectionId, range: { start: 0, end: 5 } });
const structureRef = () => ({ kind: 'structure-topology' });

beforeEach(() => {
  trace.length = 0; crossed.length = 0;
  attempted.length = 0; confirmed.length = 0; minted.clear();
  scenario.evidenceRefs = [bodyRef(S)];
  scenario.recovered = [{ sectionId: S, text: 'S characters' }];
  scenario.unverifiable = false;
  scenario.claim = 'claimed';
  scenario.completion = 'completed';
  scenario.boundary = 'may_cross';
  scenario.boundaryFailsAt = null;
});

describe('S3 · P1 · the real Ask route', () => {
  it('R0 · structure-sufficient touches no prose and mints no receipt', async () => {
    scenario.evidenceRefs = [structureRef()];
    scenario.recovered = [];
    const { json } = await post(ask());
    expect(json.result).toBeUndefined();          // the existing lawful path
    expect(trace).not.toContain('load');
    expect(trace).not.toContain('boundary');
    expect(trace).not.toContain('receipt');
  });

  it('⭐⭐ R1 · body required with NO authority reaches nothing', async () => {
    const { status, json } = await post(ask());
    expect(status).toBe(200);
    expect(json.result).toBe('BODY_AUTHORITY_REQUIRED');
    expect(json.sections).toEqual([
      { sectionId: S, heading: 'The Lighthouse Keeper', label: 'The Lighthouse Keeper' },
    ]);
    /* ⛔ A member is never asked to authorize a string they cannot read. */
    expect(JSON.stringify(json.sections)).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
    expect(json.pendingAskRef).toBe(PENDING);
    for (const forbidden of ['load', 'boundary', 'may_cross', 'cognition', 'receipt']) {
      expect(trace).not.toContain(forbidden);
    }
    expect(crossed).toEqual([]);
  });

  it('⭐ R2 · absent authority is never BODY_UNVERIFIABLE', async () => {
    const { json } = await post(ask());
    expect(json.result).toBe('BODY_AUTHORITY_REQUIRED');
    expect(json.result).not.toBe('BODY_UNVERIFIABLE');
    expect(json.refusal).toBeUndefined();
  });

  it('⭐ R2b · a recovery failure AFTER may_cross is BODY_UNVERIFIABLE', async () => {
    scenario.unverifiable = true;
    const { json } = await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(json.result).toBe('BODY_UNVERIFIABLE');
    expect(trace).toContain('may_cross');
    expect(trace).toContain('load');
    expect(trace).not.toContain('cognition');
  });

  it('⭐⭐ R3 · authority for S admits S and refuses T', async () => {
    scenario.recovered = [{ sectionId: S, text: 'S characters' }, { sectionId: T, text: 'T characters' }];
    const { json } = await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(json.result).toBe('BODY_AUTHORIZED');
    expect(crossed).toEqual([S]);
    expect(crossed).not.toContain(T);
    expect(json.withheldSections).toEqual([T]);
  });

  it('R3b · partial authorization yields BODY_SCOPE_INCOMPLETE and crosses nothing', async () => {
    scenario.evidenceRefs = [bodyRef(S), bodyRef(T)];
    const { json } = await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(json.result).toBe('BODY_SCOPE_INCOMPLETE');
    expect(json.outstanding.map((o: { sectionId: string }) => o.sectionId)).toEqual([T]);
    for (const forbidden of ['claim', 'boundary', 'load', 'cognition', 'receipt']) {
      expect(trace).not.toContain(forbidden);
    }
  });

  it('⭐⭐ R4 · a replay after a completed crossing re-executes nothing', async () => {
    scenario.claim = 'already_consumed';
    const { json } = await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(json.result).toBe('ALREADY_CONSUMED');
    expect(json.completion).toBe('completed');
    expect(trace).toContain('claim');
    for (const forbidden of ['boundary', 'may_cross', 'load', 'cognition', 'receipt']) {
      expect(trace).not.toContain(forbidden);
    }
    expect(crossed).toEqual([]);
  });

  it('⭐⭐ the claim precedes every disclosure operation', async () => {
    await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(trace.indexOf('claim')).toBeLessThan(trace.indexOf('boundary'));
    expect(trace.indexOf('boundary')).toBeLessThan(trace.indexOf('load'));
    expect(trace.indexOf('load')).toBeLessThan(trace.indexOf('cognition'));
    expect(trace.indexOf('cognition')).toBeLessThan(trace.indexOf('receipt'));
  });

  it('⛔ a boundary refusal after a valid member act crosses nothing', async () => {
    scenario.boundary = 'refused';
    const { status, json } = await post(ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes: [S] }));
    expect(status).toBe(503);
    expect(json.result).toBe('DISCLOSURE_UNAVAILABLE');
    expect(json.actSpent).toBe(true);
    expect(json.result).not.toBe('BODY_AUTHORITY_REQUIRED');
    expect(trace).not.toContain('load');
    expect(crossed).toEqual([]);
  });

  it('⛔ a malformed act is refused, never downgraded to an ordinary Ask', async () => {
    const { status, json } = await post(ask({ act: 'authorize_sections_and_resume', authorizes: [S] }));
    expect(status).toBe(400);
    expect(json.detail).toBe('act');
    expect(trace).toEqual([]);
  });

  /* ═══ MULTI-SECTION · A-i ═════════════════════════════════════════════════ */

  const U = 'section-U';
  const MULTI = [S, T, U];
  const multi = () => {
    scenario.evidenceRefs = MULTI.map(bodyRef);
    scenario.recovered = MULTI.map((sectionId) => ({ sectionId, text: `${sectionId} characters` }));
  };
  const resume = (authorizes: string[]) =>
    ask({ act: 'authorize_sections_and_resume', pendingAskRef: PENDING, authorizes });

  it('⭐⭐ MS1 · one act · one claim · three boundaries · ONE handoff · three receipts', async () => {
    multi();
    const { json } = await post(resume(MULTI));
    expect(json.result).toBe('BODY_AUTHORIZED');
    expect(trace.filter((t) => t === 'claim')).toHaveLength(1);
    expect(attempted.map((a) => a.section).sort()).toEqual([...MULTI].sort());
    expect(trace.filter((t) => t === 'cognition')).toHaveLength(1);
    expect(confirmed.sort()).toEqual([...MULTI].sort());
    expect(crossed.sort()).toEqual([...MULTI].sort());
    /* ⭐ THE CARDINALITY LAW, asserted: one act, one execution, one shared
       serving request, three section-scoped receipts. */
    expect(new Set(attempted.map((a) => a.requestRef)).size).toBe(1);
  });

  it('MS2 · partial authorization refuses BEFORE the claim', async () => {
    multi();
    const { json } = await post(resume([S, T]));
    expect(json.result).toBe('BODY_SCOPE_INCOMPLETE');
    expect(json.outstanding.map((o: { sectionId: string }) => o.sectionId)).toEqual([U]);
    expect(json.outstanding[0].label).toBeTruthy();
    for (const forbidden of ['claim', 'boundary', 'load', 'cognition', 'receipt']) {
      expect(trace).not.toContain(forbidden);
    }
  });

  it('⭐⭐ MS3 · a failed kth boundary crosses nothing and confirms nothing', async () => {
    multi();
    scenario.boundaryFailsAt = U;
    const { status, json } = await post(resume(MULTI));
    expect(status).toBe(503);
    expect(json.result).toBe('DISCLOSURE_UNAVAILABLE');
    expect(json.actSpent).toBe(true);
    expect(trace).not.toContain('load');
    expect(trace).not.toContain('cognition');
    expect(confirmed).toEqual([]);           // ⛔ S and T are NOT promoted
    expect(attempted.length).toBeGreaterThan(0);
    expect(crossed).toEqual([]);
  });

  it('MS4 · a spent act cannot be re-presented', async () => {
    multi();
    scenario.claim = 'already_consumed';
    scenario.completion = 'incomplete';
    const { json } = await post(resume(MULTI));
    expect(json.result).toBe('ALREADY_CONSUMED');
    expect(json.completion).toBe('incomplete');
    for (const forbidden of ['boundary', 'load', 'cognition', 'receipt']) {
      expect(trace).not.toContain(forbidden);
    }
  });

  /* ═══ DISCLOSURE_UNAVAILABLE · B-i ════════════════════════════════════════ */

  it('⭐⭐ DU1 · a boundary failure after a valid act is the sixth state, act spent', async () => {
    scenario.boundary = 'refused';
    const { json } = await post(resume([S]));
    expect(json.result).toBe('DISCLOSURE_UNAVAILABLE');
    expect(json.actSpent).toBe(true);
  });

  it('DU2 · it never masquerades as BODY_AUTHORITY_REQUIRED', async () => {
    scenario.boundary = 'refused';
    const { json } = await post(resume([S]));
    expect(json.result).not.toBe('BODY_AUTHORITY_REQUIRED');
  });

  it('DU3 · it never masquerades as BODY_UNVERIFIABLE', async () => {
    scenario.boundary = 'refused';
    const { json } = await post(resume([S]));
    expect(json.result).not.toBe('BODY_UNVERIFIABLE');
  });

  it('DU4 · it loads no authored body', async () => {
    scenario.boundary = 'refused';
    await post(resume([S]));
    expect(trace).not.toContain('load');
    expect(crossed).toEqual([]);
    expect(confirmed).toEqual([]);
  });
});
