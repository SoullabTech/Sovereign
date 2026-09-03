/**
 * CMT-01 — STEP 3b CERTIFICATION (PART 2): THE SHADOW WIRING IN /list
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4.1
 *
 * Part 1 certified the comparator. This suite certifies how the comparator is
 * ATTACHED to the live route — which is where a shadow becomes a second
 * architecture if nobody is watching:
 *
 *     OFF by default          env unset → no construction, no log, no read
 *     bounded witness mode    CMT_SHADOW_WITNESS=1 exactly; '0', 'true', '' do not enable
 *     after the response      the call sits after cognition and is `void`, never `await`
 *     nothing on the path     the route never READS its capture; only the witness does
 *     read-only               every provider profile A invokes is declared read-only, and
 *                             the declaration is checked against source — a provider whose
 *                             module writes cannot be declared read-only
 *     failure is failure      a legacy loader that threw is recorded as an error, never as empty
 *     never throws            constructor failure → logged, null, member unaffected
 *     no bodies               the logged record carries digests, never member text
 *
 * Text is not code: every source assertion runs over stripped executable text.
 */

import * as fs from 'fs';
import * as path from 'path';

jest.mock('@/lib/maia/turn/constructCanonicalTurn', () => ({ constructCanonicalTurn: jest.fn() }));
jest.mock('@/lib/maia/turn/profiles', () => {
  const actual = jest.requireActual('@/lib/maia/turn/profiles');
  return { ...actual, LEGACY_PROFILE_A: { ...actual.LEGACY_PROFILE_A, providers: { ...actual.LEGACY_PROFILE_A.providers } } };
});

import { constructCanonicalTurn } from '@/lib/maia/turn/constructCanonicalTurn';
import { LEGACY_PROFILE_A } from '@/lib/maia/turn/profiles';
import {
  runShadowWitness,
  shadowWitnessEnabled,
  shadowWriteRisk,
  SHADOW_PROVIDER_SIDE_EFFECTS,
  SHADOW_WITNESS_ENV,
  SHADOW_WITNESS_LOG,
} from '@/lib/maia/turn/shadowWitness';
import { STAGE1_PROVIDER_REGISTRY, type ProviderId, type TurnFrame } from '@/lib/maia/turn/providers';
import { legacyDigestFromListAssembly, type LegacyListAssembly } from '@/lib/maia/turn/legacyDigest';
import type { CanonicalTurn } from '@/lib/maia/turn/invocation';

const REPO = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');
const ROUTE = 'app/api/sovereign/app/maia/list/route.ts';
const WITNESS = 'lib/maia/turn/shadowWitness.ts';

/** Executable text only: block/line comments and string literals removed (imports kept — they are structure here). */
const strip = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
/** Comments removed, strings KEPT — for finding SQL. */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const WRITE_PATTERN = /\b(INSERT\s+INTO|UPDATE\s+[a-z_"]+\s+SET|DELETE\s+FROM)\b|\binsertOne\(|\bupdateOne\(/i;

const frame: TurnFrame = {
  identity: { memberId: '22222222-2222-2222-2222-222222222222', credentialPath: 'unknown' },
  encounter: { sessionId: 'sess-w', input: 'hello', mode: 'talk', modality: 'text', sanctuary: false, sessionTurnCount: 1 },
  surface: { surface: 'unknown' },
  profile: 'legacy:A',
};
const emptyLegacy: LegacyListAssembly = {
  isSanctuary: false, isRecognizedUser: true, allowCrossSessionMemory: true,
  certifiedWeb: null, developmental: null, themes: null, atoms: null, conversation: null, episodes: null, composed: {},
};

const SENTINEL = 'MEMBER_BODY_SENTINEL_9f1c';
function fakeTurn(): CanonicalTurn {
  const providers = (Object.keys(STAGE1_PROVIDER_REGISTRY) as ProviderId[]).map((id) => ({
    id, scope: STAGE1_PROVIDER_REGISTRY[id].scope, participationStatus: STAGE1_PROVIDER_REGISTRY[id].participationStatus,
    governedBy: STAGE1_PROVIDER_REGISTRY[id].governedBy,
    invoked: id === 'atoms', ...(id === 'atoms' ? {} : { held: { reason: 'not_in_profile' as const } }),
    returned: id === 'atoms' ? 1 : 0, excluded: 0, excludedByReason: {}, admitted: id === 'atoms' ? 1 : 0,
    admittedUpstream: 0, admittedLegacyUncertified: 0, composed: id === 'atoms' ? 1 : 0,
    provenanceClasses: id === 'atoms' ? { 'member:member_act': 1 } : {},
  }));
  return {
    frame,
    bundle: { atoms: { items: [SENTINEL], section: `## kept\n${SENTINEL}` } },
    manifest: {
      version: 'cmt-01.manifest.v1', mode: 'shadow',
      identity: { memberIdPrefix: '22222222…', credentialPath: 'unknown' },
      encounter: { sessionIdPrefix: 'sess-w', mode: 'talk', modality: 'text', sanctuary: false },
      profile: 'legacy:A', policyVersion: 'p', runtimeContextVersion: 'r',
      providers, consent: {}, provenanceClasses: { 'member:member_act': 1 },
      cognition: { kind: 'MEMBER_TURN', invoked: false }, constructedAt: '2026-09-03T00:00:00Z',
    },
    policyVersion: 'p', runtimeContextVersion: 'r',
  } as unknown as CanonicalTurn;
}

const construct = constructCanonicalTurn as jest.MockedFunction<typeof constructCanonicalTurn>;
beforeEach(() => { jest.clearAllMocks(); construct.mockResolvedValue(fakeTurn()); });

// ── §1 — OFF BY DEFAULT, ON ONLY BY THE EXACT FLAG ───────────────────────────

describe('CMT-01 step 3b wiring §1 — off by default', () => {
  it('the flag name is the documented one and the process env does not carry it here', () => {
    expect(SHADOW_WITNESS_ENV).toBe('CMT_SHADOW_WITNESS');
    expect(process.env[SHADOW_WITNESS_ENV]).toBeUndefined();
    expect(shadowWitnessEnabled()).toBe(false);
  });

  it.each([[undefined], [''], ['0'], ['true'], ['yes'], ['on'], [' 1']])('%p does not enable the witness', (v) => {
    expect(shadowWitnessEnabled({ [SHADOW_WITNESS_ENV]: v } as NodeJS.ProcessEnv)).toBe(false);
  });

  it("exactly '1' enables it", () => {
    expect(shadowWitnessEnabled({ [SHADOW_WITNESS_ENV]: '1' })).toBe(true);
  });

  it('disabled → no construction, no log, null', async () => {
    const log = jest.fn();
    const r = await runShadowWitness({ frame, legacy: emptyLegacy }, log, {});
    expect(r).toBeNull();
    expect(construct).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('the enable check in source is a strict equality against the literal, not a truthiness test', () => {
    const src = stripComments(read(WITNESS));
    expect(src).toMatch(/return env\[SHADOW_WITNESS_ENV\] === '1';/);
    expect(src).not.toMatch(/!== '0'|Boolean\(env\[|!!env\[/);
  });
});

// ── §2 — THE WITNESS ITSELF ─────────────────────────────────────────────────

describe('CMT-01 step 3b wiring §2 — the witness runs, logs the marker, never throws', () => {
  const ON = { [SHADOW_WITNESS_ENV]: '1' };

  it('enabled → constructs once with the frame, logs the marker with a record, returns it', async () => {
    const log = jest.fn();
    const r = await runShadowWitness({ frame, legacy: emptyLegacy }, log, ON);
    expect(construct).toHaveBeenCalledTimes(1);
    expect(construct).toHaveBeenCalledWith(frame);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe(SHADOW_WITNESS_LOG);
    expect(r).not.toBeNull();
    expect(r!.marker).toBe('[CMT-01] shadow-witness');
    expect(r!.profile).toBe('legacy:A');
    expect(typeof r!.zeroDiff).toBe('boolean');
    expect(r!.providersInvoked).toEqual(['atoms']);
    expect(r!.fieldDigests.legacy).toMatch(/^[0-9a-f]{16}$/);
    expect(r!.fieldDigests.canonical).toMatch(/^[0-9a-f]{16}$/);
  });

  it('the record carries digests, never bodies', async () => {
    const log = jest.fn();
    const r = await runShadowWitness({ frame, legacy: emptyLegacy }, log, ON);
    const text = JSON.stringify(r) + JSON.stringify(log.mock.calls);
    expect(text).not.toContain(SENTINEL);
    expect(text).not.toContain('22222222-2222');
  });

  it('constructor failure → FAILED marker, null, no throw', async () => {
    construct.mockRejectedValueOnce(new Error('provider registry exploded'));
    const log = jest.fn();
    await expect(runShadowWitness({ frame, legacy: emptyLegacy }, log, ON)).resolves.toBeNull();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe(`${SHADOW_WITNESS_LOG} FAILED`);
    expect(log.mock.calls[0][1]).toMatchObject({ error: 'provider registry exploded' });
  });

  it('a logger that throws does not escape either', async () => {
    const log = jest.fn(() => { throw new Error('stdout closed'); });
    // the sink threw on every call; the witness still completed and never rejected
    const r = await runShadowWitness({ frame, legacy: emptyLegacy }, log, ON);
    expect(log).toHaveBeenCalled();
    expect(r).not.toBeNull();
  });

  it('a provider error in the manifest surfaces in the record as an error, not as absence', async () => {
    const t = fakeTurn();
    (t.manifest.providers.find((p) => p.id === 'atoms') as { error?: string }).error = 'db down';
    construct.mockResolvedValueOnce(t);
    const r = await runShadowWitness({ frame, legacy: emptyLegacy }, jest.fn(), ON);
    expect(r!.providerErrors).toEqual({ atoms: 'db down' });
  });
});

// ── §3 — READ-ONLY: DECLARATION CHECKED AGAINST SOURCE ─────────────────────

describe('CMT-01 step 3b wiring §3 — every shadow-invoked provider is read-only, by declaration AND by source', () => {
  const PROFILE_A = Object.keys(LEGACY_PROFILE_A.providers) as ProviderId[];

  it('the declaration covers every registry provider (a new provider cannot be silently shadow-invoked)', () => {
    expect(Object.keys(SHADOW_PROVIDER_SIDE_EFFECTS).sort()).toEqual(Object.keys(STAGE1_PROVIDER_REGISTRY).sort());
  });

  it('profile A is non-trivial and every provider on it is declared read_only; the write risk is empty', () => {
    expect(PROFILE_A.length).toBeGreaterThanOrEqual(6);
    for (const id of PROFILE_A) expect([id, SHADOW_PROVIDER_SIDE_EFFECTS[id]]).toEqual([id, 'read_only']);
    expect(shadowWriteRisk()).toEqual([]);
  });

  it('a profile that lists a writing provider is REFUSED before construction', async () => {
    (LEGACY_PROFILE_A.providers as Record<string, unknown>).selflet = {};
    try {
      expect(shadowWriteRisk()).toEqual(['selflet']);
      const log = jest.fn();
      const r = await runShadowWitness({ frame, legacy: emptyLegacy }, log, { [SHADOW_WITNESS_ENV]: '1' });
      expect(r).toBeNull();
      expect(construct).not.toHaveBeenCalled();
      expect(log.mock.calls[0][0]).toBe(`${SHADOW_WITNESS_LOG} REFUSED`);
    } finally {
      delete (LEGACY_PROFILE_A.providers as Record<string, unknown>).selflet;
    }
    expect(shadowWriteRisk()).toEqual([]);
  });

  /** The loader modules profile A reads through. Comments stripped, strings kept: SQL lives in strings. */
  const READ_ONLY_MODULES = [
    'lib/maia/memoryAtomsLoader.ts',
    'lib/maia/memoryLoaders.ts',
    'lib/memory/MemberLiveContext.ts',
    'lib/maia/conversationalRecallBlock.ts',
    'lib/maia/episodicRecallBlock.ts',
    'lib/maia/memoryOrchestrator.ts',
    'lib/maia/consentGates.ts',
  ];
  it.each(READ_ONLY_MODULES)('%s contains no write statement at all', (rel) => {
    expect(stripComments(read(rel))).not.toMatch(WRITE_PATTERN);
  });

  /** Balanced-brace body of a named function. */
  const body = (src: string, name: string) => {
    const i = src.search(new RegExp(`(export\\s+)?(async\\s+)?function\\s+${name}\\b|\\b${name}\\s*\\(`));
    expect(i).toBeGreaterThanOrEqual(0);
    let j = src.indexOf('{', i); let depth = 0;
    for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}' && --depth === 0) return src.slice(j, k + 1); }
    throw new Error(`unbalanced: ${name}`);
  };

  it('loadRelationshipMemory calls none of its module\'s save functions', () => {
    const src = stripComments(read('lib/memory/RelationshipMemoryService.ts'));
    const b = body(src, 'loadRelationshipMemory');
    expect(b.length).toBeGreaterThan(100);
    expect(b).not.toMatch(/\bsave[A-Z]\w*\(|INSERT|UPDATE|upsert/);
    // the module does write — elsewhere — so the assertion above is about a real distinction
    expect(src).toMatch(/INSERT\s+INTO/i);
  });

  it('MemoryOrchestrator.getSessionRecallContext reads only', () => {
    const src = stripComments(read('lib/memory/MemoryOrchestrator.ts'));
    const b = body(src, 'getSessionRecallContext');
    expect(b.length).toBeGreaterThan(100);
    expect(b).not.toMatch(/\.(add\w*|save\w*|upsert\w*|record\w*|insert\w*)\(/);
  });

  it('providers declared `writes` are declared so on evidence: their module tree writes', () => {
    const closure = (rel: string, hops: number, seen = new Set<string>()): string[] => {
      if (seen.has(rel) || hops < 0) return [];
      seen.add(rel);
      const src = read(rel);
      const out = [rel];
      for (const m of src.matchAll(/from\s+'(\.{1,2}\/[^']+|@\/lib\/[^']+)'/g)) {
        const spec = m[1];
        const base = spec.startsWith('@/') ? spec.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
        for (const cand of [`${base}.ts`, `${base}/index.ts`]) if (fs.existsSync(path.join(REPO, cand))) { out.push(...closure(cand, hops - 1, seen)); break; }
      }
      return out;
    };
    const writesWithin = (rel: string) => closure(rel, 2).filter((f) => WRITE_PATTERN.test(stripComments(read(f))));
    expect(SHADOW_PROVIDER_SIDE_EFFECTS.selflet).toBe('writes');
    expect(writesWithin('lib/memory/selflet/SelfletIntegration.ts')).toEqual(expect.arrayContaining(['lib/memory/selflet/SelfletChain.ts']));
    expect(SHADOW_PROVIDER_SIDE_EFFECTS.memory_bundle).toBe('writes');
    expect(writesWithin('lib/memory/MemoryBundle.ts')).toEqual(expect.arrayContaining(['lib/memory/stores/ConversationMemoryUsesStore.ts']));
  });
});

// ── §4 — HOW /list ATTACHES IT ──────────────────────────────────────────────

describe('CMT-01 step 3b wiring §4 — the route attaches the witness after cognition, unawaited, and never reads its own capture', () => {
  const raw = read(ROUTE);
  const src = strip(raw);

  it('imports the witness entry points, and NOT the constructor (the route may not construct directly)', () => {
    expect(raw).toMatch(/import \{ runShadowWitness, shadowWitnessEnabled \} from '@\/lib\/maia\/turn\/shadowWitness';/);
    expect(raw).not.toMatch(/from '@\/lib\/maia\/turn\/constructCanonicalTurn'/);
    expect(src).not.toMatch(/\bconstructCanonicalTurn\b/);
  });

  it('exactly one call site, guarded by the enable check, discarded with `void`, never awaited', () => {
    const calls = src.match(/runShadowWitness\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(src).toMatch(/if \(shadowWitnessEnabled\(\)\) \{\s*void runShadowWitness\(\{/);
    expect(src).not.toMatch(/await\s+runShadowWitness|=\s*runShadowWitness/);
    expect(src.match(/shadowWitnessEnabled\(\)/g)).toHaveLength(1);
  });

  it('the call sits after the cognition call and before the response is shaped', () => {
    const cognition = src.indexOf("getMaiaResponse({");
    const witness = src.indexOf('void runShadowWitness(');
    // the route computes a `duration` elsewhere too; the one that matters is the first AFTER the witness
    const duration = src.indexOf('const duration = Date.now() - start;', witness);
    expect(cognition).toBeGreaterThan(0);
    expect(witness).toBeGreaterThan(cognition);
    expect(duration).toBeGreaterThan(witness);
  });

  it('passes the captured legacy assembly and a legacy:A frame built from the route\'s own resolved identity + encounter', () => {
    const start = src.indexOf('void runShadowWitness(');
    const call = src.slice(start, src.indexOf('const duration = Date.now() - start;', start));
    expect(call).toMatch(/legacy: shadowCapture,/);
    expect(call).toMatch(/memberId: effectiveUserId/);
    expect(call).toMatch(/sessionId: session\.id/);
    expect(call).toMatch(/input: message/);
    expect(call).toMatch(/sanctuary: isSanctuary/);
    expect(call).toMatch(/sessionTurnCount: session\.turn_count \?\? 0/);
    expect(raw).toMatch(/profile: 'legacy:A',\s*\},\s*legacy: shadowCapture,/);
  });

  it('the capture is declared once, typed as LegacyListAssembly, and covers every profile-A artifact the route holds', () => {
    expect(raw.match(/const shadowCapture: LegacyListAssembly = \{/g)).toHaveLength(1);
    for (const field of ['certifiedWeb', 'developmental', 'themes', 'atoms', 'conversation', 'episodes'])
      expect(src).toMatch(new RegExp(`shadowCapture\\.${field} = `));
    for (const sec of ['member_web', 'developmental', 'atoms', 'conversation', 'episodes'])
      expect(src).toMatch(new RegExp(`shadowCapture\\.composed\\.${sec} = `));
  });

  it('the route only ever WRITES its capture; the single read is the witness call — nothing on the response path consumes it', () => {
    const reads = [...src.matchAll(/\bshadowCapture\b(?!\.\w+(\.\w+)? = |\.errors \?\?= |\.(developmental|themes|atoms) === null)/g)]
      .map((m) => src.slice(m.index!, m.index! + 40));
    // declaration + the witness argument only
    expect(reads).toHaveLength(2);
    expect(reads[0]).toMatch(/^shadowCapture: LegacyListAssembly = \{/);
    expect(reads[1]).toMatch(/^shadowCapture,/);
  });

  it('every loader catch on the profile-A path records the failure into the capture (a thrown loader is never "empty")', () => {
    expect(src.match(/\(shadowCapture\.errors \?\?= \{\}\)\.conversation = /g)).toHaveLength(1);
    expect(src.match(/\(shadowCapture\.errors \?\?= \{\}\)\.episodes = /g)).toHaveLength(1);
    expect(src).toMatch(/const errs = \(shadowCapture\.errors \?\?= \{\}\);\s*if \(shadowCapture\.developmental === null\) errs\.developmental = memOrchMsg;\s*if \(shadowCapture\.themes === null\) errs\.themes = memOrchMsg;\s*if \(shadowCapture\.atoms === null\) errs\.atoms = memOrchMsg;/);
  });

  it('every capture assignment copies a value the route already computed — no new loader call is introduced for the shadow', () => {
    // The capture lines reference only identifiers that appear elsewhere in the route (the value was already held).
    const lines = raw.split('\n').filter((l) => /shadowCapture\.(\w+)(\.\w+)? = /.test(l));
    expect(lines.length).toBeGreaterThanOrEqual(11);
    for (const l of lines) expect(l).not.toMatch(/\bawait\b|\bload\w*\(/);
  });
});

// ── §5 — THE LEGACY DIGEST HONOURS A RECORDED FAILURE ───────────────────────

describe('CMT-01 step 3b wiring §5 — a recorded legacy failure digests as failure', () => {
  it('conversation error with a null capture → invoked + error, never held / never empty', () => {
    const d = legacyDigestFromListAssembly({ ...emptyLegacy, errors: { conversation: 'boom' } });
    expect(d.providers.conversation).toMatchObject({ invoked: true, returned: 0, error: 'boom' });
    expect(d.providers.conversation!.held).toBeUndefined();
  });

  it.each(['member_web', 'developmental', 'themes', 'atoms', 'episodes'] as const)('%s error → invoked + error', (id) => {
    const d = legacyDigestFromListAssembly({ ...emptyLegacy, errors: { [id]: 'x' } });
    expect(d.providers[id]).toMatchObject({ invoked: true, error: 'x' });
    expect(d.providers[id]!.held).toBeUndefined();
  });

  it('without an error the same null capture is held, not failed', () => {
    const d = legacyDigestFromListAssembly(emptyLegacy);
    expect(d.providers.conversation).toMatchObject({ invoked: false, held: 'not_in_profile' });
    expect(d.providers.conversation!.error).toBeUndefined();
  });
});
