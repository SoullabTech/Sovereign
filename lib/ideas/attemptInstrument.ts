/**
 * IDEAS — Fault-Localization Instrument, T1 (structured stage log).
 *
 * Specification: docs/specs/IDEAS_CUT02_FAULT_LOCALIZATION_INSTRUMENT.md
 * Base:          2c7f7e329a9bd8df3f50f5a83c410e683dcb4744
 *
 * T1 ONLY. One JSON line per record to stdout under `[ideas/attempt]`. This
 * closes STAGE-LOCALIZATION. It does NOT close DURABILITY — stdout is exactly
 * the store that dies with the restart which repeatedly precedes a successful
 * retry (§5). ⛔ This file must not be cited as having closed the defect.
 *
 * THE UNIT IS THE MEMBER ACT, NOT THE REQUEST (§1). One act — write, choose
 * Distill, ask — crosses two HTTP requests, and no server-side identifier
 * spanned them. `attempt_id` does; `request_id` separates the executions inside
 * it.
 *
 * ⛔ ALLOWLIST-ONLY CONSTRUCTION (§4.0). A record is assembled field by field
 * from §3's list. There is no path from a raw object to a record: no
 * `JSON.stringify(error)`, no error spread, no `error.message`. Those are
 * ABSENT FROM THE DESIGN rather than discouraged in it, because redaction is a
 * review activity that fails silently while an allowlist fails closed.
 *
 * ⛔ NOTHING REACHES THE MEMBER (§4.3). No stage, class, or identifier appears
 * in any response body or header. The instrument is operator-only by
 * construction.
 */

import { createHash } from 'crypto';

// ═══════════════════════════════════════════════════════════════
// §3.3 Taxonomy version
//
// Stage names and error classes will be amended as `unknown` faults are
// discovered. Without a version, records from before and after an amendment
// silently mean different things while looking identical.
// ⛔ Any change to STAGES or ERROR_CLASSES increments this.
// ═══════════════════════════════════════════════════════════════

export const TAXONOMY_VERSION = 1;

// ═══════════════════════════════════════════════════════════════
// §2.2 Stage map — CLOSED
//
// A new seam requires an amendment to the spec table, not an ad-hoc string.
//
// `model_client_init`, `model_call` and `model_parse` are separated
// DELIBERATELY: they are three of INV-2's ranked candidates (C1, C2, C3) and
// are today indistinguishable at the boundary. ⛔ Collapsing them, or the four
// `context_read_*` seams, destroys the discrimination this lane exists for.
// ═══════════════════════════════════════════════════════════════

export const STAGES = [
  'attempt_open',
  'autosave_write',
  'session_resolve',
  'idea_fetch',
  'context_read_blocks',
  'context_read_decision',
  'context_read_reflections',
  'context_read_count',
  'model_client_init',
  'model_call',
  'model_parse',
  'recognition',
  'persist_reflection',
  'touch_idea',
  'attempt_close',
] as const;
export type Stage = (typeof STAGES)[number];

/** The outer bracket. The twelve seams between them emit paired events (§2.1). */
export const OUTER_STAGES: readonly Stage[] = ['attempt_open', 'attempt_close'];
export const SEAM_STAGES: readonly Stage[] = STAGES.filter(
  (s) => !OUTER_STAGES.includes(s),
);

export type StageEventName = 'entered' | 'completed' | 'failed';

// ═══════════════════════════════════════════════════════════════
// §3.1 Error classification — CLOSED
//
// Assigned AT THE SEAM THAT RAISED, never inferred later. `unknown` is a real
// outcome, not a placeholder: a fault landing there is a gap in this table and
// an amendment trigger, and an amendment increments TAXONOMY_VERSION.
// ═══════════════════════════════════════════════════════════════

export const ERROR_CLASSES = [
  'auth',
  'not_found',
  'validation',
  'db_read',
  'db_write',
  'model_config',
  'model_upstream',
  'model_parse',
  'recognition',
  'unknown',
] as const;
export type ErrorClass = (typeof ERROR_CLASSES)[number];

// ═══════════════════════════════════════════════════════════════
// §1.1 Two identifiers, two authorities
// ═══════════════════════════════════════════════════════════════

export const ATTEMPT_ID_HEADER = 'x-idea-attempt-id';

/** The same shape the routes already validate ids with. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AttemptIdSource = 'client' | 'server';

function randomUuidV4(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  const b = require('crypto').randomBytes(16) as Buffer;
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Client-minted, once per member act, before the autosave. */
export function newAttemptId(): string {
  return randomUuidV4();
}

/** Server-minted, once per HTTP request. */
export function newRequestId(): string {
  return randomUuidV4();
}

/**
 * Resolve the attempt id for one request.
 *
 * A malformed correlation header MUST NEVER FAIL A MEMBER'S REQUEST (§1.1.1).
 * It is rejected silently: the attempt proceeds, and the record is written with
 * a SERVER-MINTED id marked `attempt_id_source: 'server'`, so a rejection is
 * visible in the evidence rather than indistinguishable from absence.
 *
 * ⛔ NEVER LOAD-BEARING (§1.1.2). The returned value is a join key for reading
 * records after the fact. It is never used for authorization, ownership, row
 * lookup, or any control-flow decision — and nothing in this module accepts a
 * member id or an idea id from it.
 */
export function resolveAttemptId(headerValue: string | null | undefined): {
  attemptId: string;
  source: AttemptIdSource;
} {
  if (typeof headerValue === 'string' && UUID_RE.test(headerValue)) {
    return { attemptId: headerValue, source: 'client' };
  }
  return { attemptId: newAttemptId(), source: 'server' };
}

// ═══════════════════════════════════════════════════════════════
// §3.3 Runtime revision — composite, not a SHA
//
// A SHA does not uniquely identify a local-dev runtime. A dev server executes
// whatever is on disk, and Fast Refresh replaces modules inside a live process,
// so it can report the last committed SHA while running code that commit never
// contained. The only occurrence in evidence — the witnessed 500 — happened on
// exactly that runtime class.
// ═══════════════════════════════════════════════════════════════

export type SourceState = 'clean' | 'dirty' | 'unknown';
export type DigestScope = 'emission' | 'process_start';
export type DigestSubject = 'disk_tree' | 'loaded_modules';

export interface RuntimeRevision {
  git_commit: string;
  source_state: SourceState;
  build_digest: string | null;
  source_digest: string | null;
  digest_scope: DigestScope | null;
  digest_subject: DigestSubject | null;
  /** Pinned hash + enumerated input-set identifier, e.g. `sha256/src-v1`. */
  digest_alg: string | null;
}

/**
 * Whether this runtime replaces modules inside a live process.
 *
 * Fast Refresh is the case the amendment was written for. Absence of module
 * replacement proves STABILITY, NOT EQUIVALENCE (§3.3.4) — a stable process
 * still executes compiled artifacts whose bytes differ from the source tree.
 */
function hasHotReplacement(): boolean {
  return process.env.NODE_ENV !== 'production';
}

const UNKNOWN = 'unknown';

function tokenOrNull(raw: string | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t && /^[A-Za-z0-9_.:@\/-]{1,128}$/.test(t) ? t : null;
}

/**
 * The composite identity of the code that actually executed.
 *
 * ⛔ NOTHING IS FABRICATED. A field that cannot be established honestly is
 * `unknown` or `null`. An event bound to a guessed revision would appear
 * ADMISSIBLY bound to code it did not run, which is the precise failure the
 * evidence-integrity amendment exists to prevent.
 *
 * In production the deploy lane already supplies the identity; the instrument
 * READS it and does not introduce a second provenance mechanism. The composite
 * exists for the runtimes the deploy lane does not govern.
 */
export function runtimeRevision(): RuntimeRevision {
  const digest = sourceDigest();
  return {
    git_commit: tokenOrNull(process.env.GIT_COMMIT) ?? UNKNOWN,
    source_state: sourceState(),
    build_digest: tokenOrNull(process.env.BUILD_DIGEST),
    source_digest: digest?.digest ?? null,
    digest_scope: digest ? digest.scope : null,
    digest_subject: digest ? digest.subject : null,
    digest_alg: digest ? digest.alg : null,
  };
}

function sourceState(): SourceState {
  const raw = (process.env.SOURCE_STATE ?? '').trim();
  return raw === 'clean' || raw === 'dirty' ? raw : UNKNOWN;
}

/**
 * §3.3.6 — the digest must be canonical and reproducible.
 *
 * A digest that cannot be recomputed is an identifier, not evidence. This
 * implementation therefore declares, in `digest_alg`:
 *
 *   HASH FUNCTION      sha256, pinned.
 *   COVERED INPUT SET  `ideas-attempt-path-v1` — the EXPLICITLY ENUMERATED
 *                      files below, and nothing else. Not "the repo".
 *   PATH TREATMENT     repo-relative, never absolute; sorted by byte order;
 *                      each entry hashed as `path\0<bytes>\0`.
 *   BYTE-EXACTNESS     file content is hashed as bytes. Line endings are NOT
 *                      normalized — a normalized digest would describe a
 *                      RENDERING of the tree rather than the tree, and two
 *                      different executions could then share one digest.
 *   REPRODUCIBILITY    the same files yield the same digest on any machine,
 *                      OS, or checkout path, at any later date.
 *
 * ⛔ WHAT THE INPUT SET EXCLUDES IS PART OF THE CLAIM. It does not cover
 * `node_modules`, the lockfile, or the environment. C2's rankability turns on
 * which error classes the SDK retries — DEPENDENCY behavior, not source
 * behavior — so a record produced under this digest cannot support a
 * dependency-level claim. That refusal is enforced in `admissibility()`, not
 * left to the reader.
 *
 * ⛔ THE SUBJECT IS `disk_tree`, ALWAYS. This digests FILES ON DISK. It is
 * never a digest of the modules actually loaded or served, and §3.3.4 forbids
 * describing it as one.
 *
 * Opt-in via IDEAS_ATTEMPT_SOURCE_DIGEST=1, and computed ONCE per process —
 * hence `digest_scope: 'process_start'`, which §3.3.4 caps below full
 * admissibility on a dev runtime no matter how clean the tree was at boot.
 */
export const DIGEST_INPUT_SET: readonly string[] = [
  'app/api/ideas/[id]/ask-maia/route.ts',
  'app/api/ideas/[id]/blocks/route.ts',
  'app/maia/ideas/[id]/page.tsx',
  'lib/team/maiaThreadReflection.ts',
  'lib/ideas/attemptInstrument.ts',
];

export const DIGEST_ALG = 'sha256/ideas-attempt-path-v1';

interface ComputedDigest {
  digest: string;
  scope: DigestScope;
  subject: DigestSubject;
  alg: string;
}

let digestMemo: ComputedDigest | null | undefined;

export function computeSourceDigest(
  read: (path: string) => Buffer | null,
  inputSet: readonly string[] = DIGEST_INPUT_SET,
): string | null {
  const h = createHash('sha256');
  /* Sorted by byte order of the repo-relative path so the digest does not
     depend on the order this array happens to be written in. */
  for (const path of [...inputSet].sort()) {
    const bytes = read(path);
    /* A missing input makes the digest describe a different input set than the
       one `digest_alg` names. Refusing is the only honest answer. */
    if (bytes === null) return null;
    h.update(Buffer.from(`${path}\0`, 'utf8'));
    h.update(bytes);
    h.update(Buffer.from('\0', 'utf8'));
  }
  return h.digest('hex');
}

function sourceDigest(): ComputedDigest | null {
  if (digestMemo !== undefined) return digestMemo;
  if (process.env.IDEAS_ATTEMPT_SOURCE_DIGEST !== '1') {
    digestMemo = null;
    return null;
  }
  try {
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { readFileSync } = require('fs');
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { join } = require('path');
    const root = process.cwd();
    const digest = computeSourceDigest((p: string) => {
      try {
        return readFileSync(join(root, p)) as Buffer;
      } catch {
        return null;
      }
    });
    digestMemo = digest
      ? { digest, scope: 'process_start', subject: 'disk_tree', alg: DIGEST_ALG }
      : null;
  } catch {
    digestMemo = null;
  }
  return digestMemo;
}

/** Test seam. Not reachable from the request path. */
export function __resetDigestMemoForTests(): void {
  digestMemo = undefined;
}

// ═══════════════════════════════════════════════════════════════
// §3.3.3 / §3.3.4 / §3.3.5 Admissibility ladder
//
// An inadmissible or partially admissible revision must be SURFACED AS SUCH at
// the point of use — reported, not silently ranked. Evidence that cannot
// support a runtime claim must never be quietly counted as though it could.
// ═══════════════════════════════════════════════════════════════

/**
 * The provenance mechanisms THIS BUILD ACTUALLY IMPLEMENTS, keyed by the
 * `digest_alg` each one stamps.
 *
 * ⛔ THIS TABLE — NOT A FIELD VALUE — IS WHAT PERMITS PROMOTION.
 * `digest_subject: 'loaded_modules'` is a LABEL, exactly as `build_digest` is a
 * label. Treating it as proof that loaded modules were digested is the same
 * self-assertion one level over: a record can claim any subject, and a claim is
 * not a mechanism. Promotion therefore requires an entry here, whose declared
 * subject must MATCH the record's, and whose `canPromote` is true.
 *
 * Today exactly one mechanism exists, and it digests FILES ON DISK. There is no
 * loaded-modules digest implementation in this codebase, and no verifier that
 * binds a tree to an executed artifact. Consequently:
 *
 *     T1 HAS NO PATH TO `deployed_runtime` ADMISSIBILITY.
 *
 * That is the honest state of the instrument. `DEPLOYED_RUNTIME_REACHABLE` below
 * is DERIVED from this table rather than asserted, which is what prevents a
 * record's own field values from synthesizing an execution claim.
 *
 * ⛔ THE DERIVATION IS NOT AN AUTHORIZATION. It stops self-assertion; it does
 * not make adding a row automatic or approved. A promotable registry entry is a
 * GOVERNED PROVENANCE CHANGE and requires its own proof before landing — the
 * mechanism must exist, must produce the digest it names, and must be shown to
 * cover what actually executed. An entry added without that proof reintroduces
 * exactly the self-assertion this table was built to refuse, one level further
 * out.
 */
interface DigestMechanism {
  /** The subject this mechanism actually digests. */
  subject: DigestSubject;
  /** Whether its output can support a claim about the executed runtime. */
  canPromote: boolean;
  /** Why, in operator-facing words. */
  note: string;
}

export const IMPLEMENTED_DIGEST_MECHANISMS: Readonly<Record<string, DigestMechanism>> = {
  [DIGEST_ALG]: {
    subject: 'disk_tree',
    canPromote: false,
    note: 'digests five enumerated source files on disk; it does not cover the '
      + 'executable artifacts the process loaded',
  },
};

/**
 * Whether ANY implemented mechanism can currently reach `deployed_runtime`.
 * Derived, never asserted. `false` today.
 */
export const DEPLOYED_RUNTIME_REACHABLE: boolean =
  Object.values(IMPLEMENTED_DIGEST_MECHANISMS).some((m) => m.canPromote);

export type Admissibility =
  /** Claims about a committed or deployed runtime. */
  | 'deployed_runtime'
  /** Claims about THAT DIGEST only — never about a committed or deployed runtime. */
  | 'digest_only'
  /** Honest evidence about a tree; not evidence about an execution. */
  | 'disk_tree_only'
  /** May guide a live investigation; may support no runtime claim. */
  | 'diagnosis_only';

export interface AdmissibilityVerdict {
  level: Admissibility;
  /** Operator-facing sentence. Reported at the point of use, per §3.3.5. */
  reason: string;
  /** §3.3.6 / P19 — may a dependency-level claim (e.g. C2 retry classes) be made? */
  supportsDependencyClaim: false;
  dependencyRefusal: string;
}

export function admissibility(rev: RuntimeRevision): AdmissibilityVerdict {
  /* The covered input set is source-only in every configuration this module
     offers, so a dependency-level claim is refused unconditionally. A lockfile
     would not lift it either: declared resolution is not loaded identity. */
  const dependencyRefusal =
    'the covered input set is source-only; it does not cover installed '
    + 'dependencies, and a lockfile alone would not suffice — declared '
    + 'resolution is not loaded identity';

  const base = { supportsDependencyClaim: false as const, dependencyRefusal };
  const hot = hasHotReplacement();

  /* ── Does this record carry a digest that is EVIDENCE at all? ──────────
     §3.3.6: a digest that cannot be recomputed is an identifier, not evidence.
     So a digest counts only when all three hold:
       - an actual digest value is present
       - its `digest_alg` names a mechanism this build implements
       - the record's `digest_subject` matches what that mechanism digests
     A record claiming a subject its algorithm does not produce is describing a
     mechanism rather than reporting one, and is disregarded. */
  const mechanism = rev.digest_alg
    ? IMPLEMENTED_DIGEST_MECHANISMS[rev.digest_alg] ?? null
    : null;
  const digestIsEvidence =
    rev.source_digest !== null
    && mechanism !== null
    && mechanism.subject === rev.digest_subject;

  /* ── Promotion ────────────────────────────────────────────────────────
     Requires a real implemented mechanism whose output can support a claim
     about the executed runtime. No combination of self-reported fields —
     `build_digest`, `digest_subject: 'loaded_modules'`, or any flag — can
     substitute for one. Today no such mechanism exists, so this branch is
     unreachable, and the tests assert that it is. */
  if (digestIsEvidence && mechanism!.canPromote && rev.source_state === 'clean' && !hot) {
    return { ...base, level: 'deployed_runtime',
      reason: `clean, stable runtime digested by ${rev.digest_alg}, whose covered `
        + 'input set includes what actually executed' };
  }

  /* A subject claimed without an implementing mechanism behind it. Reported as
     the unsubstantiated claim it is, rather than silently downgraded. */
  if (rev.digest_subject === 'loaded_modules' && !digestIsEvidence) {
    return { ...base, level: 'diagnosis_only',
      reason: mechanism === null
        ? 'the record claims a loaded_modules subject, but its digest_alg names '
          + 'no mechanism this build implements — a claimed subject is not a '
          + 'digest of loaded modules'
        : `digest_alg ${rev.digest_alg} digests ${mechanism.subject}, not `
          + 'loaded_modules; the record describes a mechanism rather than '
          + 'reporting one' };
  }

  const cleanAndVerifiable =
    rev.source_state === 'clean'
    && (rev.build_digest !== null || rev.git_commit !== UNKNOWN);

  if (cleanAndVerifiable && !hot) {
    /* ⛔ A BUILD DIGEST IS A LABEL, NOT AN ATTESTATION. It proves the image was
       TAGGED with that identity, not that its bytes derive from the digested
       tree; the post-swap deploy verify compares that same label, so it cannot
       supply the binding either. Absence of module replacement proves
       stability, not equivalence. Fails closed to a disk-tree claim. */
    return { ...base, level: 'disk_tree_only',
      reason: rev.build_digest !== null
        ? 'stable runtime with a build_digest LABEL, which is a claim about '
          + 'provenance rather than a verified binding from this tree to the '
          + 'executed artifact; capped until such a binding exists'
        : 'stable runtime, but the executed artifacts are not inside the '
          + 'covered input set and no attestation binds this tree to the executed '
          + 'build; absence of module replacement proves stability, not equivalence' };
  }

  if (hot && rev.digest_subject === 'disk_tree') {
    return { ...base, level: 'diagnosis_only',
      reason: 'hot-replacement runtime with a disk_tree digest: honest evidence '
        + 'about a tree, not about an execution' };
  }

  if (digestIsEvidence) {
    if (rev.digest_scope === 'process_start' && hot) {
      return { ...base, level: 'diagnosis_only',
        reason: 'process_start digest on a hot-replacement runtime establishes '
          + 'what the process started as, not what it ran' };
    }
    return { ...base, level: 'digest_only',
      reason: 'dirty or unverifiable tree with an exact source_digest: the '
        + 'digest is the referent, not the branch it sat on' };
  }

  if (rev.source_digest !== null) {
    return { ...base, level: 'diagnosis_only',
      reason: 'a digest is present but cannot be recomputed — its digest_alg '
        + 'names no mechanism this build implements, so it is an identifier '
        + 'rather than evidence' };
  }

  return { ...base, level: 'diagnosis_only',
    reason: 'dirty or unknown runtime with no digest: may guide a live '
      + 'investigation; supports no claim about committed or deployed code' };
}

// ═══════════════════════════════════════════════════════════════
// §4.5 Sanitized stack evidence
//
// A raw stack is NEVER persisted. Two derived artifacts are permitted, both
// computed at the raising seam. Neither may contain an error message, an
// argument value, or interpolated text.
// ═══════════════════════════════════════════════════════════════

/**
 * Repo-relative `path:line` frames only.
 *
 * Absolute paths, home directories, and any frame outside the repository are
 * DROPPED, NOT REWRITTEN. A stack whose frames cannot be normalized yields
 * `null`, never a partial dump.
 */
export function sourceFrames(err: unknown): string[] | null {
  if (!(err instanceof Error) || typeof err.stack !== 'string') return null;
  const root = process.cwd();
  const out: string[] = [];
  for (const line of err.stack.split('\n')) {
    /* Only the location is read out of the frame. The function name is left
       behind with the message: a name can carry interpolated text. */
    const m = /\(?((?:\/|[A-Za-z]:\\)[^()\s]+?):(\d+):\d+\)?\s*$/.exec(line);
    if (!m) continue;
    const [, file, lineNo] = m;
    if (file.includes('node_modules')) continue;
    if (!file.startsWith(root)) continue;
    const rel = file.slice(root.length).replace(/^[/\\]/, '');
    if (!rel || rel.startsWith('..')) continue;
    out.push(`${rel}:${lineNo}`);
  }
  return out.length > 0 ? out : null;
}

/**
 * A stable hash over the normalized top frames, with `node_modules` frames
 * collapsed to their package name.
 *
 * Answers "is this the same fault as last time?" without carrying what the
 * fault said. ⛔ The message is not an input — two different messages from the
 * same site must fingerprint alike, and a message must never be recoverable
 * from the hash.
 */
export function stackFingerprint(err: unknown): string | null {
  if (!(err instanceof Error) || typeof err.stack !== 'string') return null;
  const root = process.cwd();
  const frames: string[] = [];
  for (const line of err.stack.split('\n')) {
    const m = /\(?((?:\/|[A-Za-z]:\\)[^()\s]+?):(\d+):\d+\)?\s*$/.exec(line);
    if (!m) continue;
    const [, file, lineNo] = m;
    const pkg = /node_modules[/\\](@[^/\\]+[/\\][^/\\]+|[^/\\]+)/.exec(file);
    if (pkg) {
      frames.push(`node_modules:${pkg[1].replace(/\\/g, '/')}`);
    } else if (file.startsWith(root)) {
      frames.push(`${file.slice(root.length).replace(/^[/\\]/, '')}:${lineNo}`);
    }
    if (frames.length === 8) break;
  }
  if (frames.length === 0) return null;
  /* The error's constructor name is a fixed class identifier, not text the
     fault composed, so it discriminates without carrying content. */
  return createHash('sha256')
    .update(`${err.name}\n${frames.join('\n')}`)
    .digest('hex')
    .slice(0, 32);
}

// ═══════════════════════════════════════════════════════════════
// §3.2 Upstream fields — what makes C2 decidable
//
// INV-2 §4.2 C2 is held unranked precisely because the SDK retries only
// PARTICULAR error classes, and the witnessed error's class was never captured.
// ═══════════════════════════════════════════════════════════════

/**
 * Error classes the Anthropic SDK retries internally.
 * ⛔ This is a DECLARATION about dependency behavior, and `admissibility()`
 * refuses dependency-level claims from a source-only digest. It is recorded so
 * a future occurrence is decidable, not so it may be ranked today.
 */
const SDK_RETRIED_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

export interface UpstreamFields {
  upstream_status: number | null;
  upstream_request_id: string | null;
  upstream_error_type: string | null;
  retryable: boolean | null;
}

/**
 * Read the structured upstream fields off a provider error.
 *
 * ⛔ Field-by-field, from named properties only. The error is never
 * serialized, spread, or stringified, and `message` is never read.
 */
export function upstreamFields(err: unknown): UpstreamFields {
  const empty: UpstreamFields = {
    upstream_status: null,
    upstream_request_id: null,
    upstream_error_type: null,
    retryable: null,
  };
  if (!err || typeof err !== 'object') return empty;
  const e = err as {
    status?: unknown;
    request_id?: unknown;
    requestID?: unknown;
    error?: { error?: { type?: unknown } };
  };

  const status = typeof e.status === 'number' && Number.isInteger(e.status) ? e.status : null;
  const rid = tokenOrNull(
    typeof e.request_id === 'string' ? e.request_id
      : typeof e.requestID === 'string' ? e.requestID : undefined);
  const type = tokenOrNull(
    typeof e.error?.error?.type === 'string' ? e.error.error.type : undefined);

  return {
    upstream_status: status,
    upstream_request_id: rid,
    upstream_error_type: type,
    retryable: status === null ? null : SDK_RETRIED_STATUSES.has(status),
  };
}

// ═══════════════════════════════════════════════════════════════
// §3 Record shape + emission
// ═══════════════════════════════════════════════════════════════

export const ATTEMPT_MARKER = '[ideas/attempt]';

export interface AttemptRecord {
  attempt_id: string;
  attempt_id_source: AttemptIdSource;
  request_id: string | null;
  member_id: string | null;
  idea_id: string | null;
  stage: Stage;
  event: StageEventName;
  error_class: ErrorClass | null;
  upstream_status: number | null;
  upstream_request_id: string | null;
  upstream_error_type: string | null;
  retryable: boolean | null;
  stack_fingerprint: string | null;
  source_frames: string[] | null;
  runtime_revision: RuntimeRevision;
  taxonomy_version: number;
  duration_ms: number | null;
  stance: string | null;
  prompt_chars: number | null;
  occurred_at: string;
}

/**
 * The context one execution carries.
 *
 * ⛔ `memberId` and `ideaId` are SERVER-RESOLVED ONLY. They are set from
 * `getCurrentSession()` and the ownership-checked idea, never from a header,
 * and never from `attemptId`.
 */
export interface AttemptContext {
  attemptId: string;
  attemptIdSource: AttemptIdSource;
  /** Null on the client, where there is no server request. */
  requestId: string | null;
  memberId: string | null;
  ideaId: string | null;
  stance: string | null;
  /** Injectable for tests. Defaults to console.log. */
  sink?: (line: string) => void;
  /** Injectable for tests. Defaults to Date.now. */
  now?: () => number;
}

/** Optional measures a seam may attach. All are numbers, booleans, or enums. */
export interface StageFields {
  error_class?: ErrorClass;
  duration_ms?: number;
  prompt_chars?: number;
  upstream?: UpstreamFields;
  stack_fingerprint?: string | null;
  source_frames?: string[] | null;
}

const nowIso = (ctx: AttemptContext) =>
  new Date(ctx.now ? ctx.now() : Date.now()).toISOString();

/**
 * Assemble a record, field by field, from §3's list.
 *
 * ⛔ THE ALLOWLIST IS THIS FUNCTION BODY. Every field is written explicitly.
 * There is no spread of caller input, no dynamic key assignment, and no branch
 * that copies an unknown object in. A field that is not named here has no way
 * to be written.
 */
export function buildRecord(
  ctx: AttemptContext,
  stage: Stage,
  event: StageEventName,
  fields: StageFields = {},
): AttemptRecord {
  const up = fields.upstream;
  return {
    attempt_id: ctx.attemptId,
    attempt_id_source: ctx.attemptIdSource,
    request_id: ctx.requestId,
    member_id: ctx.memberId,
    idea_id: ctx.ideaId,
    stage,
    event,
    /* Set only when the event failed. A class on a completed seam would make a
       success indistinguishable from a recovered failure. */
    error_class: event === 'failed' ? fields.error_class ?? 'unknown' : null,
    upstream_status: up?.upstream_status ?? null,
    upstream_request_id: up?.upstream_request_id ?? null,
    upstream_error_type: up?.upstream_error_type ?? null,
    retryable: up?.retryable ?? null,
    stack_fingerprint: fields.stack_fingerprint ?? null,
    source_frames: fields.source_frames ?? null,
    runtime_revision: runtimeRevision(),
    taxonomy_version: TAXONOMY_VERSION,
    /* null on `entered` — a duration before the work has run would be a fiction. */
    duration_ms: event === 'entered' ? null : fields.duration_ms ?? null,
    stance: ctx.stance,
    prompt_chars: fields.prompt_chars ?? null,
    occurred_at: nowIso(ctx),
  };
}

/**
 * Emit one record as one JSON line under the marker.
 *
 * ⛔ INSTRUMENT FAILURE MUST NOT ALTER THE MEMBER'S REQUEST OUTCOME (§4.0).
 * A sink that throws is swallowed here: not the status, not the body, not
 * whether the note persisted, not whether a reflection was produced.
 */
export function emit(
  ctx: AttemptContext,
  stage: Stage,
  event: StageEventName,
  fields: StageFields = {},
): void {
  if (process.env.IDEAS_ATTEMPT_LOG_DISABLED === '1') return;
  try {
    const record = buildRecord(ctx, stage, event, fields);
    const sink = ctx.sink ?? ((line: string) => console.log(line));
    sink(`${ATTEMPT_MARKER} ${JSON.stringify(record)}`);
  } catch {
    /* Deliberately empty. See above. */
  }
}

/**
 * Classify a thrown value at the seam that raised it.
 *
 * ⛔ The error object is READ, never carried. Only the derived artifacts —
 * a class enum, a fingerprint, normalized frames, and named upstream fields —
 * reach the record.
 */
export function failureFields(err: unknown, errorClass: ErrorClass): StageFields {
  return {
    error_class: errorClass,
    upstream: upstreamFields(err),
    stack_fingerprint: stackFingerprint(err),
    source_frames: sourceFrames(err),
  };
}

/**
 * Run one seam with the §2.1 lifecycle: `entered` first, then `completed` or
 * `failed`.
 *
 * A single terminal record is not sufficient — a process that dies BETWEEN two
 * calls emits nothing at all, and the seam it died in stays invisible, which is
 * the exact shape of the witnessed incident. Paired events make interruption
 * legible as interruption. (Under T2 the unresolved `entered` is what localizes
 * the interrupted seam; under T1 stdout dies with the process, which is why T1
 * does not close durability.)
 *
 * BEHAVIORAL CONTRACT: the result is returned unchanged, and a thrown error is
 * re-thrown UNCHANGED after `failed` is emitted. Nothing here alters control
 * flow or the member's outcome.
 */
export interface RunStageOptions<T> {
  /**
   * Classify a RETURNED result as a refusal.
   *
   * ⛔ THIS EXISTS TO KEEP P1 STRUCTURAL. Several seams fail by RETURNING —
   * `getCurrentSession()` resolves to `null`, an ownership query succeeds with
   * zero rows — rather than by throwing. Without this, the seam resolves
   * `completed` and the call site then emits a second `failed`, giving one seam
   * TWO resolutions and breaking the invariant that makes an unresolved
   * `entered` meaningful under T2.
   *
   * Returning an `ErrorClass` here resolves the seam as `failed` INSTEAD of
   * `completed` — never in addition to it. The result is still returned
   * unchanged, so the caller's control flow and response are untouched.
   */
  refusal?: (result: T) => ErrorClass | null;
  completedFields?: (result: T) => StageFields;
}

export async function runStage<T>(
  ctx: AttemptContext,
  stage: Stage,
  errorClass: ErrorClass,
  fn: () => Promise<T> | T,
  options?: RunStageOptions<T> | ((result: T) => StageFields),
): Promise<T> {
  const opts: RunStageOptions<T> =
    typeof options === 'function' ? { completedFields: options } : options ?? {};
  const started = ctx.now ? ctx.now() : Date.now();
  emit(ctx, stage, 'entered');
  try {
    const result = await fn();

    /* Exactly one resolution. A returned refusal resolves the seam as failed;
       it does not add a second event after a completed one. */
    let refusedAs: ErrorClass | null = null;
    try {
      refusedAs = opts.refusal ? opts.refusal(result) : null;
    } catch {
      refusedAs = null;
    }
    if (refusedAs !== null) {
      emit(ctx, stage, 'failed', {
        error_class: refusedAs,
        duration_ms: (ctx.now ? ctx.now() : Date.now()) - started,
      });
      return result;
    }

    let extra: StageFields = {};
    try {
      extra = opts.completedFields ? opts.completedFields(result) : {};
    } catch {
      extra = {};
    }
    emit(ctx, stage, 'completed', {
      ...extra,
      duration_ms: (ctx.now ? ctx.now() : Date.now()) - started,
    });
    return result;
  } catch (err) {
    emit(ctx, stage, 'failed', {
      ...failureFields(err, errorClass),
      duration_ms: (ctx.now ? ctx.now() : Date.now()) - started,
    });
    throw err;
  }
}
