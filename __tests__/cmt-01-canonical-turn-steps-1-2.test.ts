/**
 * CMT-01 — STEPS 1–2 CERTIFICATION: INVOCATION CLASS + SHADOW CONSTRUCTOR
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §1, §3, §4, §5, §7
 *
 * ── WHAT STEPS 1–2 ARE, AND ARE NOT ─────────────────────────────────────────
 *
 * Step 1 gives the class of a cognition invocation a TYPE. Step 2 builds the
 * one place a member turn is assembled — with NO authoritative caller. Nothing
 * in this suite touches `getMaiaResponse`; the strongest assertion here is that
 * nothing does. Rollback for both steps is deletion.
 *
 * ── THE THREE THINGS THIS SUITE PINS ────────────────────────────────────────
 *
 *   1. A member turn is UNCONSTRUCTABLE outside the constructor (brand not
 *      exported; one branding site; casts detected — Grade B arm, stated).
 *   2. A SYSTEM_COGNITION_PROBE cannot select a member-scoped provider — by
 *      registry scope at the type level, not only by the absence of a memberId.
 *   3. The constructor honours the shared participation boundary and never
 *      upgrades: upstream EXCLUDED stays excluded; LEGACY_UNCERTIFIED composes
 *      only under a legacy profile; the manifest carries no bodies and reports
 *      failure as failure.
 */

import * as fs from 'fs';
import * as path from 'path';

jest.mock('@/lib/maia/consentGates', () => ({
  readConsentGate: jest.fn(async () => true),
}));
jest.mock('@/lib/maia/memoryAtomsLoader', () => ({
  loadMemberMemoryAtomsForPrompt: jest.fn(async () => [
    { id: 'atom-1', sourceType: 'journal', title: 'kept', body: 'MEMBER ATOM BODY' },
    { id: 'atom-2', sourceType: 'practitioner_observation', title: 'obs', body: 'PRACTITIONER OBSERVATION BODY' },
  ]),
}));
jest.mock('@/lib/maia/memoryLoaders', () => ({
  loadPriorCrossSessionExchanges: jest.fn(async () => [
    { session_id: 's-old', role: 'user', created_at: new Date(), content: 'MEMBER PRIOR WORDS' },
    { session_id: 's-old', role: 'assistant', created_at: new Date(), content: 'MAIA PRIOR WORDS' },
  ]),
  loadRecentMarkedEpisodes: jest.fn(async () => [
    { episode_id: 'ep-1', verbatim_text: 'MEMBER MARKED EPISODE', source_turn_id: null, source_session_id: null, created_at: new Date() },
  ]),
  loadRecentDevelopmentalMemories: jest.fn(async () => [
    { participation: 'excluded', exclusionReason: 'uncertified_provenance' },
  ]),
  loadRecentThemeSignals: jest.fn(async () => [
    { participation: 'excluded', exclusionReason: 'uncertified_provenance' },
  ]),
}));
jest.mock('@/lib/memory/RelationshipMemoryService', () => ({
  loadRelationshipMemory: jest.fn(async () => ({ essence: {}, summary: 'RECURRENCE SUMMARY', themes: [], breakthroughs: [], emergingPatterns: [] })),
  certifyRelationshipMemory: jest.fn((m: { summary: string }) => ({ summary: m.summary, hasEssence: true, excluded: { themes: 0, breakthroughs: 0, patterns: 0 } })),
}));
jest.mock('@/lib/consciousness/RelationshipAnamnesis', () => ({
  loadRelationshipEssence: jest.fn(async () => ({ presenceQuality: 'MACHINE ESSENCE' })),
}));
jest.mock('@/lib/memory/MemberLiveContext', () => ({
  buildMemberLiveContext: jest.fn(async () => ({})),
  certifyMemberWeb: jest.fn(() => ({ journal: [{ createdAt: new Date(), content: 'MEMBER JOURNAL' }], excluded: { patterns: 1, sessions: 1, themes: 1, fieldState: true } })),
}));
jest.mock('@/lib/anchor/loadRecentAnchors', () => ({
  loadRecentAnchors: jest.fn(async () => [{ date: '2026-09-01', promptShown: 'SYSTEM PROMPT', response: 'MEMBER ANCHOR WORDS', createdAt: '' }]),
}));
jest.mock('@/lib/memory/SignificantMomentsService', () => ({
  loadSignificantMoments: jest.fn(async () => ({
    captures: [{ text: 'MEMBER CAPTURE' }],
    journals: [],
    breakthroughs: [
      { id: 'b1', participation: 'excluded', exclusionReason: 'uncertified_provenance', integrated: false, timestamp: new Date(), relatedThemes: [] },
    ],
    summary: {},
  })),
}));
jest.mock('@/lib/memory/breakthroughParticipation', () => ({
  admittedBreakthroughs: jest.fn((xs: Array<{ participation: string }>) => xs.filter((x) => x.participation === 'admitted')),
}));
jest.mock('@/lib/memory/MemoryBundle', () => ({
  MemoryBundleService: { build: jest.fn(async () => ({ memoryBullets: [{ id: 'bullet-1', content: 'BULLET' }], recentContinuity: 'CONTINUITY' })) },
}));
jest.mock('@/lib/memory/selflet/SelfletIntegration', () => ({
  loadSelfletContext: jest.fn(async () => ({ promptInjection: 'SELFLET INJECTION', context: null, pendingReflection: null, shouldSurfaceReflection: false })),
}));
jest.mock('@/lib/ain/knowledge/RetrievalService', () => ({
  retrieveForMode: jest.fn(async () => [{ chunkId: 'k1', chunkText: 'AIN CHUNK' }]),
}));
jest.mock('@/lib/memory/MemoryOrchestrator', () => ({
  memoryOrchestrator: {
    getSessionRecallContext: jest.fn(async () => ({
      relationshipContext: { conversationHistorySummary: 'MACHINE RELATIONSHIP CONTEXT' },
      recentTurns: [{ role: 'user', content: 'RECALL MEMBER WORDS', createdAt: '' }],
      recentBreakthroughs: [],
    })),
  },
}));

import { readConsentGate } from '@/lib/maia/consentGates';
import { loadMemberMemoryAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';
import { constructCanonicalTurn, adjudicateCandidates } from '@/lib/maia/turn/constructCanonicalTurn';
import { STAGE1_PROVIDER_REGISTRY, probeSafeProviders, type TurnFrame, type ProviderId } from '@/lib/maia/turn/providers';
import { TURN_PROFILES, LEGACY_PROFILE_A, LEGACY_PROFILE_C, CANONICAL_PROFILE } from '@/lib/maia/turn/profiles';
import { isMemberTurn, type CognitionInvocation, type SystemProbe } from '@/lib/maia/turn/invocation';

// Mock call records accumulate across tests. A "was not called" assertion made
// against a mock another test already exercised would fail for the wrong
// reason — or pass for the wrong reason if the order changed. Clear per test.
beforeEach(() => jest.clearAllMocks());

const REPO = path.resolve(__dirname, '..');
const TURN_DIR = path.join(REPO, 'lib/maia/turn');
const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');
const SKIP = /__tests__|\.test\.ts|node_modules|\.next/;

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (p: string): void => {
    let st: fs.Stats;
    try { st = fs.statSync(p); } catch { return; }
    if (st.isDirectory()) { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (!SKIP.test(q)) walk(q); } return; }
    if (/\.tsx?$/.test(p) && !SKIP.test(p)) out.push(path.relative(REPO, p));
  };
  walk(path.join(REPO, 'lib')); walk(path.join(REPO, 'app')); walk(path.join(REPO, 'components'));
  return out;
}
const FILES = sourceFiles();
const strip = (s: string) => s.replace(/^import\s[\s\S]*?from\s+'[^']+';/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const frame = (over: Partial<TurnFrame> = {}): TurnFrame => ({
  identity: { memberId: '11111111-1111-1111-1111-111111111111', credentialPath: 'session_cookie' },
  encounter: { sessionId: 'sess-current', input: 'what do you remember', mode: 'talk', modality: 'text', sanctuary: false },
  surface: { surface: 'desktop' },
  profile: 'legacy:A',
  ...over,
});

/** Every string that could only have come from a candidate body. */
const BODY_MARKERS = [
  'MEMBER ATOM BODY', 'PRACTITIONER OBSERVATION BODY', 'MEMBER PRIOR WORDS', 'MAIA PRIOR WORDS',
  'MEMBER MARKED EPISODE', 'RECURRENCE SUMMARY', 'MACHINE ESSENCE', 'MEMBER JOURNAL', 'MEMBER ANCHOR WORDS',
  'MEMBER CAPTURE', 'BULLET', 'CONTINUITY', 'SELFLET INJECTION', 'AIN CHUNK', 'MACHINE RELATIONSHIP CONTEXT',
  'RECALL MEMBER WORDS', 'SYSTEM PROMPT',
];

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('CMT-01 §0 — the instrument found its subject', () => {
  it('the registry is nonzero and every id resolves', () => {
    const ids = Object.keys(STAGE1_PROVIDER_REGISTRY) as ProviderId[];
    expect(ids.length).toBe(14);
    for (const id of ids) expect(STAGE1_PROVIDER_REGISTRY[id].id).toBe(id);
  });

  it('the constructor actually runs providers and composes something', async () => {
    const t = await constructCanonicalTurn(frame());
    const invoked = t.manifest.providers.filter((p) => p.invoked);
    expect(invoked.length).toBeGreaterThan(5);
    expect(Object.keys(t.bundle).length).toBeGreaterThan(3);
  });

  it('the source scan reaches a real module set', () => {
    expect(FILES.length).toBeGreaterThan(1000);
    expect(FILES).toContain('lib/maia/turn/constructCanonicalTurn.ts');
  });
});

// ── §1 — STEP 1: THE INVOCATION CLASS ────────────────────────────────────────

describe('CMT-01 §1 — a member turn is unconstructable outside the constructor', () => {
  it('the brand is declared and NOT exported', () => {
    const src = read('lib/maia/turn/invocation.ts');
    expect(src).toMatch(/^declare const CANONICAL_TURN_BRAND: unique symbol;/m);
    expect(src).not.toMatch(/export (?:const|declare const) CANONICAL_TURN_BRAND/);
  });

  it('exactly one branding site exists, and it is the constructor', () => {
    const users = FILES.filter((f) => /__brandCanonicalTurn\(/.test(strip(read(f))) && f !== 'lib/maia/turn/invocation.ts');
    expect(users).toEqual(['lib/maia/turn/constructCanonicalTurn.ts']);
  });

  it('GRADE B ARM — a cast to CanonicalTurn outside the constructor is DETECTED', () => {
    const offenders = FILES.filter((f) => {
      if (f.startsWith('lib/maia/turn/')) return false;
      return /as\s+(?:unknown\s+as\s+)?CanonicalTurn\b/.test(strip(read(f)));
    });
    expect(offenders).toEqual([]);
  });

  it('the probe arm carries no member identity field, by declaration', () => {
    const src = read('lib/maia/turn/invocation.ts');
    const probe = /export interface SystemProbe \{([\s\S]*?)\n\}/.exec(src);
    expect(probe).not.toBeNull();
    for (const f of ['memberId', 'userId', 'sessionId', 'identity', 'frame']) {
      expect({ f, declared: new RegExp(`\\n\\s+(?:readonly )?${f}[?:]`).test(probe![1]) }).toEqual({ f, declared: false });
    }
    // And at the type level: a probe object literal with a memberId is a compile
    // error, which is why this test only constructs the shape it is allowed to.
    const p: SystemProbe = { kind: 'SYSTEM_COGNITION_PROBE', purpose: 'health_check', input: 'ping' };
    const inv: CognitionInvocation = { kind: 'SYSTEM_COGNITION_PROBE', probe: p };
    expect(isMemberTurn(inv)).toBe(false);
  });

  it('STEP 1 CHANGED NO BEHAVIOUR — the cognition entry does not know these types exist', () => {
    const svc = read('lib/sovereign/maiaService.ts');
    expect(svc).not.toMatch(/lib\/maia\/turn|from '\.\.\/maia\/turn/);
    expect(svc).toMatch(/export async function getMaiaResponse\(req: MaiaRequest\)/);
  });
});

// ── §2 — STEP 2: THE REGISTRY ────────────────────────────────────────────────

describe('CMT-01 §2 — the Stage 1 provider registry', () => {
  it('every provider is member-scoped, so a probe can select NONE of them', () => {
    for (const p of Object.values(STAGE1_PROVIDER_REGISTRY)) {
      expect({ id: p.id, scope: p.scope }).toEqual({ id: p.id, scope: 'member' });
    }
    expect(probeSafeProviders()).toEqual([]);
  });

  it('the probe selector is typed over scope, not over a list', () => {
    const src = read('lib/maia/turn/providers.ts');
    expect(src).toMatch(/\(p\): p is ProbeSafeProvider => p\.scope === 'probe_safe'/);
    expect(src).toMatch(/IntelligenceProvider & \{ readonly scope: 'probe_safe' \}/);
  });

  it('exactly two providers are LEGACY_UNCERTIFIED, and they say so rather than invent a class', () => {
    const marked = Object.values(STAGE1_PROVIDER_REGISTRY).filter((p) => p.participationStatus === 'LEGACY_UNCERTIFIED').map((p) => p.id).sort();
    expect(marked).toEqual(['ain_knowledge', 'selflet']);
    for (const id of marked) {
      const p = STAGE1_PROVIDER_REGISTRY[id as ProviderId];
      expect({ id, governedBy: [...p.governedBy] }).toEqual({ id, governedBy: [] });
      expect(p.provenanceBasis).toMatch(/not inferred|No class is inferred|Not inferred/i);
    }
  });

  it('every certified provider names at least one governing gate and its write-path basis', () => {
    for (const p of Object.values(STAGE1_PROVIDER_REGISTRY)) {
      if (p.participationStatus !== 'certified') continue;
      expect({ id: p.id, gated: p.governedBy.length > 0 }).toEqual({ id: p.id, gated: true });
      expect({ id: p.id, basis: p.provenanceBasis.length > 60 }).toEqual({ id: p.id, basis: true });
    }
  });

  it('the registry wraps EXISTING loaders only — the import closed set', () => {
    const src = read('lib/maia/turn/providers.ts');
    const imports = [...src.matchAll(/from '((?:@\/|\.\.?\/)[^']+)'/g)].map((m) => m[1]).sort();
    expect(imports).toEqual(
      [
        '../participationGate',
        '../sovereignDisposition',
        '../consentGates',
        '../consentGates',
        '../memoryAtomsLoader',
        '../memoryLoaders',
        '@/lib/memory/RelationshipMemoryService',
        '@/lib/consciousness/RelationshipAnamnesis',
        '@/lib/memory/MemberLiveContext',
        '@/lib/anchor/loadRecentAnchors',
        '@/lib/memory/SignificantMomentsService',
        '@/lib/memory/breakthroughParticipation',
        '@/lib/memory/MemoryBundle',
        '@/lib/memory/selflet/SelfletIntegration',
        '@/lib/ain/knowledge/RetrievalService',
        '@/lib/memory/MemoryOrchestrator',
        './profiles',
      ].sort(),
    );
  });

  it('a provider reads no consent gate itself — the constructor does, through P2', () => {
    const src = strip(read('lib/maia/turn/providers.ts'));
    const reads = src.split('\n').filter((l) => /readConsentGate\(/.test(l));
    // One, inside `consentAllows`, which only the constructor calls.
    expect(reads).toHaveLength(1);
    expect(reads[0]).toMatch(/return readConsentGate\(memberId, gate\)/);
  });
});

// ── §3 — STEP 2: PROFILES ────────────────────────────────────────────────────

describe('CMT-01 §3 — legacy profiles are subtractive and transitional', () => {
  it('every profile provider exists in the registry', () => {
    for (const prof of Object.values(TURN_PROFILES)) {
      for (const id of Object.keys(prof.providers)) {
        expect({ profile: prof.id, id, registered: id in STAGE1_PROVIDER_REGISTRY }).toEqual({ profile: prof.id, id, registered: true });
      }
    }
  });

  it('legacy profiles carry a sunset; the canonical profile is EMPTY at Stage 1', () => {
    expect(LEGACY_PROFILE_A.sunset).toMatch(/Stage 2/);
    expect(LEGACY_PROFILE_C.sunset).toMatch(/Stage 2/);
    expect(Object.keys(CANONICAL_PROFILE.providers)).toEqual([]);
  });

  it('the two legacy profiles reproduce the topology, not each other', () => {
    const a = new Set(Object.keys(LEGACY_PROFILE_A.providers));
    const c = new Set(Object.keys(LEGACY_PROFILE_C.providers));
    // A-only, per the closure absences recorded in the topology.
    for (const id of ['atoms', 'member_web', 'anchors', 'episodes']) expect({ id, inA: a.has(id), inC: c.has(id) }).toEqual({ id, inA: true, inC: false });
    // C-only.
    for (const id of ['selflet', 'ain_knowledge', 'significant_moments', 'memory_bundle']) expect({ id, inA: a.has(id), inC: c.has(id) }).toEqual({ id, inA: false, inC: true });
  });

  it('LEGACY_UNCERTIFIED providers appear in NO profile but legacy:C', () => {
    for (const prof of Object.values(TURN_PROFILES)) {
      for (const id of ['selflet', 'ain_knowledge']) {
        const present = id in prof.providers;
        expect({ profile: prof.id, id, present }).toEqual({ profile: prof.id, id, present: prof.id === 'legacy:C' });
      }
    }
  });
});

// ── §4 — STEP 2: THE CONSTRUCTOR ─────────────────────────────────────────────

describe('CMT-01 §4 — the constructor honours the boundary and never upgrades', () => {
  it('SHADOW: cognition is never invoked', async () => {
    for (const profile of ['legacy:A', 'legacy:C', 'canonical'] as const) {
      const t = await constructCanonicalTurn(frame({ profile }));
      expect(t.manifest.mode).toBe('shadow');
      expect(t.manifest.cognition).toEqual({ kind: 'MEMBER_TURN', invoked: false });
    }
  });

  it('sanctuary holds every member provider and composes nothing', async () => {
    const t = await constructCanonicalTurn(frame({ encounter: { ...frame().encounter, sanctuary: true } }));
    expect(t.manifest.encounter.sanctuary).toBe(true);
    for (const p of t.manifest.providers) {
      expect({ id: p.id, invoked: p.invoked }).toEqual({ id: p.id, invoked: false });
      expect(['sanctuary', 'not_in_profile']).toContain(p.held?.reason);
    }
    expect(Object.keys(t.bundle)).toEqual([]);
    expect(loadMemberMemoryAtomsForPrompt).not.toHaveBeenCalled();
  });

  it('a consent gate that is OFF holds the provider, names the gate, and does not invoke it', async () => {
    (readConsentGate as jest.Mock).mockImplementationOnce(async (_m: string, g: string) => g !== 'conversational_recall_enabled');
    const t = await constructCanonicalTurn(frame());
    const conv = t.manifest.providers.find((p) => p.id === 'conversation')!;
    expect(conv.invoked).toBe(false);
    expect(conv.held).toEqual({ reason: 'consent_gate_off', gate: 'conversational_recall_enabled' });
    expect(t.bundle.conversation).toBeUndefined();
  });

  it('"held" and "returned nothing" are different answers', async () => {
    const t = await constructCanonicalTurn(frame({ profile: 'canonical' }));
    for (const p of t.manifest.providers) {
      expect(p.held).toEqual({ reason: 'not_in_profile' });
      expect(p.invoked).toBe(false);
      expect(p.returned).toBe(0);
    }
  });

  it('an upstream EXCLUDED verdict is carried, never upgraded', async () => {
    const t = await constructCanonicalTurn(frame());
    const dev = t.manifest.providers.find((p) => p.id === 'developmental')!;
    expect(dev.invoked).toBe(true);
    expect(dev.returned).toBe(1);
    expect(dev.excluded).toBe(1);
    expect(dev.excludedByReason).toEqual({ uncertified_provenance: 1 });
    expect(t.bundle.developmental).toBeUndefined();
  });

  it('a MAIA inference with no endorsement is EXCLUDED by the shared adjudicator', async () => {
    const t = await constructCanonicalTurn(frame());
    const ess = t.manifest.providers.find((p) => p.id === 'relationship_essence')!;
    expect(ess.excludedByReason).toEqual({ unendorsed_inference: 1 });
    expect(t.bundle.relationship_essence).toBeUndefined();
    // …and the EXPECTED SHADOW DIFF named in the registry: the recall block's
    // relationship_context is excluded here while legacy composes it.
    const recall = t.manifest.providers.find((p) => p.id === 'session_recall')!;
    expect(recall.excludedByReason.unendorsed_inference).toBe(1);
    expect(recall.admitted).toBe(1); // the member's own recall turn
  });

  it('member testimony and member acts are ADMITTED, with provenance classes aggregated', async () => {
    const t = await constructCanonicalTurn(frame());
    expect(t.bundle.episodes).toHaveLength(1);
    expect(t.bundle.anchors).toHaveLength(1);
    expect(t.bundle.atoms).toHaveLength(2);
    expect(t.manifest.provenanceClasses['member:testimony']).toBeGreaterThanOrEqual(3);
    expect(t.manifest.provenanceClasses['member:member_act']).toBe(1);
    expect(t.manifest.provenanceClasses['practitioner:observation']).toBe(1);
  });

  it('LEGACY_UNCERTIFIED composes under legacy:C and is REFUSED under canonical — marked, not classed', async () => {
    const c = await constructCanonicalTurn(frame({ profile: 'legacy:C' }));
    const self = c.manifest.providers.find((p) => p.id === 'selflet')!;
    expect(self.participationStatus).toBe('LEGACY_UNCERTIFIED');
    expect(self.admittedLegacyUncertified).toBe(1);
    expect(c.bundle.selflet?.[0].basis).toEqual({ kind: 'legacy_uncertified' });
    expect(c.manifest.provenanceClasses).not.toHaveProperty('maia:inference');

    // Under a profile that does not list it, it is not even invoked.
    const a = await constructCanonicalTurn(frame({ profile: 'legacy:A' }));
    expect(a.manifest.providers.find((p) => p.id === 'selflet')!.held).toEqual({ reason: 'not_in_profile' });
  });

  it('LEGACY_UNCERTIFIED is REFUSED under a non-legacy profile — the guard itself, exercised', () => {
    // Through the public constructor this branch is unreachable at Stage 1,
    // because the canonical profile lists no providers. Mutation K6 deleted the
    // guard and nothing noticed. So the guard is exercised directly, and its
    // expression is pinned so `false &&` or a dropped conjunct is a diff.
    const selflet = STAGE1_PROVIDER_REGISTRY.selflet;
    const cands = [{ id: 'x', adjudication: { kind: 'legacy_uncertified' as const }, body: 'B' }];
    const underLegacy = adjudicateCandidates(selflet, cands, true);
    const underCanonical = adjudicateCandidates(selflet, cands, false);
    expect(underLegacy.admittedLegacyUncertified).toBe(1);
    expect(underCanonical.admittedLegacyUncertified).toBe(0);
    expect(underCanonical.excludedByReason).toEqual({ uncertified_provenance: 1 });
    // And a CERTIFIED provider presenting a legacy_uncertified candidate is
    // refused even under a legacy profile: the status is the provider's, not
    // the candidate's to claim.
    const asCertified = adjudicateCandidates(STAGE1_PROVIDER_REGISTRY.atoms, cands, true);
    expect(asCertified.admittedLegacyUncertified).toBe(0);
    const src = strip(read('lib/maia/turn/constructCanonicalTurn.ts'));
    expect(src).toMatch(/if \(profileIsLegacy && provider\.participationStatus === 'LEGACY_UNCERTIFIED'\) \{/);
  });

  it('a provider failure is VISIBLE, never rendered as absence', async () => {
    (loadMemberMemoryAtomsForPrompt as jest.Mock).mockImplementationOnce(async () => { throw new Error('db down'); });
    const t = await constructCanonicalTurn(frame());
    const atoms = t.manifest.providers.find((p) => p.id === 'atoms')!;
    expect(atoms.invoked).toBe(true);
    expect(atoms.error).toBe('db down');
    expect(atoms.returned).toBe(0);
    // A failed provider does not fail the turn.
    expect(t.bundle.episodes).toHaveLength(1);
  });

  it('the manifest carries NO bodies', async () => {
    for (const profile of ['legacy:A', 'legacy:C'] as const) {
      const t = await constructCanonicalTurn(frame({ profile }));
      const json = JSON.stringify(t.manifest);
      for (const marker of BODY_MARKERS) expect({ profile, marker, leaked: json.includes(marker) }).toEqual({ profile, marker, leaked: false });
      expect(json).not.toContain('11111111-1111-1111-1111-111111111111');
      expect(t.manifest.identity.memberIdPrefix).toBe('11111111…');
    }
  });

  it('the bundle is typed by provider; there is no bag', () => {
    const src = read('lib/maia/turn/constructCanonicalTurn.ts');
    expect(src).toMatch(/CanonicalContextBundle = Readonly<Partial<Record<ProviderId, readonly ComposedItem\[\]>>>/);
    for (const f of fs.readdirSync(TURN_DIR)) {
      const body = strip(read(`lib/maia/turn/${f}`));
      expect({ f, bag: /Record<string,\s*unknown>/.test(body) }).toEqual({ f, bag: false });
    }
  });
});

// ── §5 — NO LIVE CALLER ──────────────────────────────────────────────────────

describe('CMT-01 §5 — Step 2 has no authoritative caller', () => {
  it('nothing outside lib/maia/turn/ calls the constructor yet', () => {
    const callers = FILES.filter((f) => !f.startsWith('lib/maia/turn/') && /constructCanonicalTurn\(/.test(strip(read(f))));
    expect(callers).toEqual([]);
  });

  it('nothing outside lib/maia/turn/ imports the turn package yet', () => {
    const importers = FILES.filter((f) => !f.startsWith('lib/maia/turn/') && /from '(?:@\/lib\/maia\/turn|\.\.?\/turn|\.\.\/maia\/turn)/.test(read(f)));
    expect(importers).toEqual([]);
  });
});

// ── §6 — INNOCENT AND BOUNDARY CONTROLS ─────────────────────────────────────

describe('CMT-01 §6 — controls', () => {
  it('prose naming a body marker is not a leak', () => {
    // The registry's provenanceBasis strings mention table names and gates; the
    // leak check is against candidate BODIES from the mocks, which no prose
    // could contain.
    expect(read('lib/maia/turn/providers.ts')).not.toMatch(/MEMBER ATOM BODY/);
  });

  it('a profile that lists a provider with different params still invokes it once', async () => {
    const t = await constructCanonicalTurn(frame({ profile: 'legacy:C' }));
    const rel = t.manifest.providers.find((p) => p.id === 'relationship')!;
    expect(rel.invoked).toBe(true);
    expect(rel.admittedUpstream).toBe(1);
  });

  it('the import-closed-set scan is multiline-tolerant', () => {
    const src = read('lib/maia/turn/providers.ts');
    // The participationGate import is multiline; a line-oriented scan would miss it.
    expect(/import type \{\s*\n\s*ProvenanceClaim,/.test(src)).toBe(true);
  });

  it('a renamed profile constant does not change the verdict — profiles are keyed by id', () => {
    expect(TURN_PROFILES['legacy:A'].id).toBe('legacy:A');
    expect(TURN_PROFILES.canonical.id).toBe('canonical');
  });
});
