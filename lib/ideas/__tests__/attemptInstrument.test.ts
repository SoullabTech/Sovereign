/**
 * Ideas Fault-Localization Instrument — evidence-integrity obligations.
 *
 * P16 · P18 · P19 live here rather than at the route, because they are claims
 * about what a record MAY BE CITED FOR — the ladder in §3.3.3 as amended by
 * §3.3.4 and §3.3.6. The route tests prove the fields are present; these prove
 * the fields are not allowed to overclaim.
 *
 * This is the half a bare `GIT_COMMIT` string cannot express, and the reason
 * the composite exists.
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  DIGEST_ALG, DIGEST_INPUT_SET, ERROR_CLASSES, STAGES, TAXONOMY_VERSION,
  admissibility, buildRecord, computeSourceDigest, resolveAttemptId,
  runtimeRevision, sourceFrames, stackFingerprint, upstreamFields,
  __resetDigestMemoForTests, type AttemptContext, type RuntimeRevision,
} from '../attemptInstrument';

const ctx = (): AttemptContext => ({
  attemptId: '44444444-4444-4444-8444-444444444444',
  attemptIdSource: 'client',
  requestId: '55555555-5555-4555-8555-555555555555',
  memberId: null, ideaId: null, stance: null,
  now: () => 1_000,
});

const rev = (o: Partial<RuntimeRevision> = {}): RuntimeRevision => ({
  git_commit: 'deadbee', source_state: 'clean', build_digest: null,
  source_digest: null, digest_scope: null, digest_subject: null,
  digest_alg: null, ...o,
});

const prodEnv = () => { process.env.NODE_ENV = 'production'; };
const devEnv = () => { process.env.NODE_ENV = 'development'; };

const priorNodeEnv = process.env.NODE_ENV;
afterEach(() => { process.env.NODE_ENV = priorNodeEnv; __resetDigestMemoForTests(); });

// ═══════════════════════════════════════════════════════════════
// Closed vocabularies
// ═══════════════════════════════════════════════════════════════

describe('closed vocabularies', () => {
  it('holds exactly the fifteen ratified stages, in order', () => {
    expect([...STAGES]).toEqual([
      'attempt_open', 'autosave_write', 'session_resolve', 'idea_fetch',
      'context_read_blocks', 'context_read_decision', 'context_read_reflections',
      'context_read_count', 'model_client_init', 'model_call', 'model_parse',
      'recognition', 'persist_reflection', 'touch_idea', 'attempt_close',
    ]);
  });

  it('keeps the four context reads and the three model seams separate', () => {
    // The collapse this instrument exists to prevent.
    expect(STAGES.filter((s) => s.startsWith('context_read_'))).toHaveLength(4);
    expect(STAGES.filter((s) => s.startsWith('model_'))).toHaveLength(3);
  });

  it('holds exactly the ten ratified error classes', () => {
    expect([...ERROR_CLASSES]).toEqual([
      'auth', 'not_found', 'validation', 'db_read', 'db_write',
      'model_config', 'model_upstream', 'model_parse', 'recognition', 'unknown',
    ]);
  });

  it('versions the taxonomy so pre- and post-amendment records cannot be confused', () => {
    expect(TAXONOMY_VERSION).toBe(1);
    expect(buildRecord(ctx(), 'model_call', 'entered').taxonomy_version).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// §1.1 attempt id
// ═══════════════════════════════════════════════════════════════

describe('§1.1 — attempt_id is shape-validated and silently replaced', () => {
  it('accepts a UUIDv4 from the client', () => {
    const r = resolveAttemptId('44444444-4444-4444-8444-444444444444');
    expect(r.source).toBe('client');
    expect(r.attemptId).toBe('44444444-4444-4444-8444-444444444444');
  });

  it('replaces anything else with a server-minted id, marked', () => {
    for (const bad of ['', 'nope', null, undefined, 'x'.repeat(80),
                       '44444444-4444-4444-8444-444444444444 OR 1=1']) {
      const r = resolveAttemptId(bad as string | null);
      expect(r.source).toBe('server');
      expect(r.attemptId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    }
  });

  it('mints v4 identifiers that do not collide', () => {
    const a = resolveAttemptId(null).attemptId;
    const b = resolveAttemptId(null).attemptId;
    expect(a).not.toBe(b);
  });
});

// ═══════════════════════════════════════════════════════════════
// P16 / P18 — the admissibility ladder
// ═══════════════════════════════════════════════════════════════

describe('P16 — the ladder is enforced, not left to the reader', () => {
  it('admits a clean production runtime only when the digest covers what executed', () => {
    prodEnv();
    expect(admissibility(rev({
      source_state: 'clean', digest_subject: 'loaded_modules',
    })).level).toBe('deployed_runtime');
    // A label-only runtime is honest evidence about a tree, and no more.
    expect(admissibility(rev({
      source_state: 'clean', build_digest: 'sha256:abc',
    })).level).toBe('disk_tree_only');
  });

  it('caps a dirty tree WITH an exact digest at claims about that digest only', () => {
    prodEnv();
    const v = admissibility(rev({
      source_state: 'dirty', source_digest: 'abc123',
      digest_scope: 'emission', digest_subject: 'loaded_modules', digest_alg: DIGEST_ALG,
    }));
    expect(v.level).toBe('digest_only');
    expect(v.reason).toContain('the digest is the referent');
  });

  it('caps a dirty or unknown tree with NO digest at diagnosis only', () => {
    prodEnv();
    for (const state of ['dirty', 'unknown'] as const) {
      const v = admissibility(rev({ source_state: state }));
      expect(v.level).toBe('diagnosis_only');
      expect(v.reason).toContain('supports no claim about committed or deployed code');
    }
  });

  it('never silently ranks an inadmissible revision — every verdict carries a reason', () => {
    for (const r of [rev(), rev({ source_state: 'dirty' }), rev({ source_state: 'unknown' })]) {
      expect(admissibility(r).reason.length).toBeGreaterThan(20);
    }
  });
});

describe('P18 — digest_subject is recorded and enforced', () => {
  it('caps a disk_tree digest at diagnosis-only on a hot-replacement runtime', () => {
    devEnv();
    const v = admissibility(rev({
      source_state: 'clean', source_digest: 'abc', digest_subject: 'disk_tree',
      digest_scope: 'emission', digest_alg: DIGEST_ALG,
    }));
    expect(v.level).toBe('diagnosis_only');
    expect(v.reason).toContain('not about an execution');
  });

  it('caps process_start scope below full admissibility on a dev runtime, however clean', () => {
    devEnv();
    const v = admissibility(rev({
      source_state: 'clean', source_digest: 'abc',
      digest_scope: 'process_start', digest_subject: 'loaded_modules', digest_alg: DIGEST_ALG,
    }));
    expect(v.level).toBe('diagnosis_only');
    expect(v.reason).toContain('what the process started as, not what it ran');
  });

  it('THE NEGATIVE CASE — a stable runtime is capped at disk-tree claims only', () => {
    // Absence of module replacement proves STABILITY, NOT EQUIVALENCE. A stable
    // process still executes compiled artifacts whose bytes differ from source.
    prodEnv();
    const v = admissibility(rev({
      source_state: 'clean', build_digest: null,
      source_digest: 'abc', digest_scope: 'emission',
      digest_subject: 'disk_tree', digest_alg: DIGEST_ALG,
    }));
    expect(v.level).toBe('disk_tree_only');
    expect(v.reason).toContain('stability, not equivalence');
  });

  it('THE NEGATIVE CONTROL — a build_digest LABEL does not promote a disk_tree subject', () => {
    // The ratified amendment: an image/build label is not itself a verified
    // binding from the source tree to the executed artifact. The post-swap
    // deploy verify compares that same label, so it cannot supply the binding.
    prodEnv();
    const v = admissibility(rev({
      source_state: 'clean',
      build_digest: 'sha256:img',
      digest_subject: 'disk_tree',
      source_digest: 'abc',
      digest_scope: 'emission',
      digest_alg: DIGEST_ALG,
    }));
    expect(v.level).not.toBe('deployed_runtime');
    expect(v.level).toBe('disk_tree_only');
    expect(v.reason).toContain('rather than a verified binding');
  });

  it('promotes ONLY on loaded_modules — the one binding that exists today', () => {
    prodEnv();
    expect(admissibility(rev({
      source_state: 'clean', digest_subject: 'loaded_modules',
    })).level).toBe('deployed_runtime');
    // And a label alone never reaches it, with or without a source digest.
    for (const r of [
      rev({ source_state: 'clean', build_digest: 'sha256:img' }),
      rev({ source_state: 'clean', build_digest: 'sha256:img', digest_subject: 'disk_tree' }),
    ]) {
      expect(admissibility(r).level).toBe('disk_tree_only');
    }
  });

  it('offers no self-asserted escape hatch — no env flag can promote a disk_tree subject', () => {
    // Guards against "fixing" the ceiling by moving the unsupported assertion
    // one field over.
    prodEnv();
    for (const flag of ['ATTESTED', 'BUILD_ATTESTED', 'IDEAS_ATTEMPT_ATTESTED']) {
      process.env[flag] = '1';
    }
    expect(admissibility(rev({
      source_state: 'clean', build_digest: 'sha256:img', digest_subject: 'disk_tree',
    })).level).toBe('disk_tree_only');
    for (const flag of ['ATTESTED', 'BUILD_ATTESTED', 'IDEAS_ATTEMPT_ATTESTED']) {
      delete process.env[flag];
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// P19 — the digest is canonical, reproducible, and bounded
// ═══════════════════════════════════════════════════════════════

describe('P19 — digest_alg names a pinned hash and an enumerated input set', () => {
  const read = (m: Record<string, string>) => (p: string) =>
    p in m ? Buffer.from(m[p], 'utf8') : null;

  it('names the algorithm and the input set, not "the repo"', () => {
    expect(DIGEST_ALG).toMatch(/^sha256\//);
    expect(DIGEST_INPUT_SET.length).toBeGreaterThan(0);
    for (const p of DIGEST_INPUT_SET) {
      expect(p.startsWith('/')).toBe(false); // repo-relative, never absolute
    }
  });

  it('is reproducible — the same inputs give the same digest, order-independently', () => {
    const files = { 'a.ts': 'alpha', 'b.ts': 'beta' };
    const d1 = computeSourceDigest(read(files), ['a.ts', 'b.ts']);
    const d2 = computeSourceDigest(read(files), ['b.ts', 'a.ts']);
    expect(d1).toMatch(/^[0-9a-f]{64}$/);
    expect(d2).toBe(d1);
  });

  it('is byte-exact — line endings are not normalized', () => {
    const crlf = computeSourceDigest(read({ 'a.ts': 'x\r\ny' }), ['a.ts']);
    const lf = computeSourceDigest(read({ 'a.ts': 'x\ny' }), ['a.ts']);
    expect(crlf).not.toBe(lf);
  });

  it('binds content to its path — moving content between files changes the digest', () => {
    const d1 = computeSourceDigest(read({ 'a.ts': 'x', 'b.ts': 'y' }), ['a.ts', 'b.ts']);
    const d2 = computeSourceDigest(read({ 'a.ts': 'y', 'b.ts': 'x' }), ['a.ts', 'b.ts']);
    expect(d1).not.toBe(d2);
  });

  it('refuses rather than describing a different input set than digest_alg names', () => {
    expect(computeSourceDigest(read({ 'a.ts': 'x' }), ['a.ts', 'missing.ts'])).toBeNull();
  });

  it('THE NEGATIVE CASE — a dependency claim is refused, and a lockfile would not lift it', () => {
    // C2's rankability turns on which classes the SDK retries: dependency
    // behavior, not source behavior. Declared resolution is not loaded identity.
    prodEnv();
    for (const r of [
      rev({ source_state: 'clean', digest_subject: 'loaded_modules' }),
      rev({ source_state: 'clean', build_digest: 'sha256:img' }),
      rev({ source_state: 'dirty', source_digest: 'abc', digest_alg: DIGEST_ALG }),
    ]) {
      const v = admissibility(r);
      expect(v.supportsDependencyClaim).toBe(false);
      expect(v.dependencyRefusal).toContain('lockfile alone would not suffice');
    }
  });

  it('does not cover node_modules or the lockfile — the exclusion is part of the claim', () => {
    for (const p of DIGEST_INPUT_SET) {
      expect(p).not.toContain('node_modules');
      expect(p).not.toContain('package-lock.json');
    }
  });
});

describe('runtime_revision is never fabricated', () => {
  it('reports unknown for an unstamped commit rather than guessing', () => {
    const prior = process.env.GIT_COMMIT;
    delete process.env.GIT_COMMIT;
    expect(runtimeRevision().git_commit).toBe('unknown');
    process.env.GIT_COMMIT = '   ';
    expect(runtimeRevision().git_commit).toBe('unknown');
    process.env.GIT_COMMIT = 'not a sha at all';
    expect(runtimeRevision().git_commit).toBe('unknown');
    if (prior === undefined) delete process.env.GIT_COMMIT; else process.env.GIT_COMMIT = prior;
  });

  it('labels the digest disk_tree — never as the modules actually loaded', () => {
    process.env.IDEAS_ATTEMPT_SOURCE_DIGEST = '1';
    __resetDigestMemoForTests();
    const r = runtimeRevision();
    delete process.env.IDEAS_ATTEMPT_SOURCE_DIGEST;
    if (r.source_digest !== null) {
      expect(r.digest_subject).toBe('disk_tree');
      expect(r.digest_subject).not.toBe('loaded_modules');
      expect(r.digest_alg).toBe(DIGEST_ALG);
    }
  });

  it('omits the digest entirely when it was not opted into', () => {
    delete process.env.IDEAS_ATTEMPT_SOURCE_DIGEST;
    __resetDigestMemoForTests();
    const r = runtimeRevision();
    expect(r.source_digest).toBeNull();
    expect(r.digest_scope).toBeNull();
    expect(r.digest_subject).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// §4.0 / §4.5 — allowlist construction and sanitized stack evidence
// ═══════════════════════════════════════════════════════════════

describe('§4.0 — construction is allowlist-only', () => {
  it('ignores any field a caller invents', () => {
    const r = buildRecord(ctx(), 'model_call', 'failed', {
      error_class: 'model_upstream',
      // @ts-expect-error — the point of the test: an off-list field has no path in
      member_text: 'the thing I am working through',
      raw_error: new Error('secret'),
    });
    expect('member_text' in r).toBe(false);
    expect('raw_error' in r).toBe(false);
  });

  it('sets error_class only on failure', () => {
    expect(buildRecord(ctx(), 'model_call', 'completed',
      { error_class: 'model_upstream' }).error_class).toBeNull();
    expect(buildRecord(ctx(), 'model_call', 'failed').error_class).toBe('unknown');
  });

  it('never carries a duration on entered', () => {
    expect(buildRecord(ctx(), 'model_call', 'entered',
      { duration_ms: 99 }).duration_ms).toBeNull();
  });
});

describe('§4.5 — sanitized stack evidence only', () => {
  it('drops frames outside the repository and inside node_modules', () => {
    const e = new Error('x');
    e.stack = [
      'Error: x',
      '    at f (/somewhere/else/secret.ts:1:1)',
      `    at g (${process.cwd()}/node_modules/@anthropic-ai/sdk/core.js:2:2)`,
      `    at h (${process.cwd()}/lib/team/maiaThreadReflection.ts:3:3)`,
    ].join('\n');
    expect(sourceFrames(e)).toEqual(['lib/team/maiaThreadReflection.ts:3']);
  });

  it('yields null rather than a partial dump when no frame normalizes', () => {
    // Every frame is outside the repository. Both artifacts refuse rather than
    // emitting a partial record — §4.5 forbids the partial dump specifically.
    const e = new Error('x');
    e.stack = 'Error: x\n    at f (/elsewhere/secret.ts:1:1)';
    expect(sourceFrames(e)).toBeNull();
    expect(stackFingerprint(e)).toBeNull();
  });

  it('fingerprints the same site alike whatever the message says', () => {
    const mk = (msg: string) => {
      const e = new Error(msg);
      e.stack = `Error: ${msg}\n    at h (${process.cwd()}/lib/a.ts:3:3)`;
      return e;
    };
    expect(stackFingerprint(mk('one'))).toBe(stackFingerprint(mk('two')));
  });

  it('collapses node_modules frames to their package name', () => {
    const e = new Error('x');
    e.stack = `Error: x\n    at g (${process.cwd()}/node_modules/@anthropic-ai/sdk/core.js:2:2)`;
    const fp = stackFingerprint(e);
    expect(fp).toMatch(/^[0-9a-f]{32}$/);
    expect(fp).not.toContain('core.js');
  });

  it('reads only named upstream properties — never the message', () => {
    const f = upstreamFields(Object.assign(new Error('SECRET MESSAGE'), {
      status: 429, request_id: 'req_x', error: { error: { type: 'rate_limit_error' } },
    }));
    expect(f).toEqual({
      upstream_status: 429, upstream_request_id: 'req_x',
      upstream_error_type: 'rate_limit_error', retryable: true,
    });
    expect(JSON.stringify(f)).not.toContain('SECRET MESSAGE');
  });
});
