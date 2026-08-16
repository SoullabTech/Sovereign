#!/usr/bin/env node
/**
 * LIVING SPIRAL — SLICE 1 PERFORMED-DERIVATION HARNESS
 *
 * Purpose (and the whole of it): convert SPECIFIED_DERIVATION into
 * PERFORMED_DERIVATION for a named, finite assertion set.
 *
 *   docs/architecture/JARVIS_LIVING_SPIRAL_BOUNDED_IMPLEMENTATION_PROPOSAL_2026-08-16.md
 *   docs/governance/JARVIS_LIVING_SPIRAL_PROGRAMME_DIRECTIVE_2026-08-16.md  §2.7
 *
 * Read-only. No persistence, no schema, no telemetry, no UI, no network, no DB.
 * Every assertion is computed at read time from a tracked file and thrown away.
 *
 * VOCABULARY IS BORROWED, NEVER INVENTED. Only values from the ACCEPTED semantic
 * contract (JARVIS_LIVING_SPIRAL_SEMANTIC_CONTRACT_2026-08-16.md) appear on the
 * primary axes. The two additive axes the directive proposes (`ecology`,
 * `maia_relation`) are rendered in a SEPARATE block and labelled PROPOSED, so
 * that adopting them remains a founder act and cannot happen by implementation.
 *
 * ⛔ This harness resolves none of the four RULING_REQUIRED collisions (C2/C3/C7/C8).
 *    It emits no health value, no lifecycle value, no error class, no scalar.
 *
 * Usage:
 *   node scripts/builder/living-spiral-derive.mjs
 *   node scripts/builder/living-spiral-derive.mjs --json
 *   node scripts/builder/living-spiral-derive.mjs --subject <path>   # decoy / F-tests
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// ============================================================================
// ACCEPTED VOCABULARY — contract §2, §7, §8, §9. Do not extend here.
// ============================================================================

const OPERATIONAL_ELEMENT = ['transformation', 'conveyance', 'consolidation', 'discrimination', 'composition'];
const PRESENCE_VALUE = ['present', 'zero', 'none', 'unknown'];
const OBSERVATION_STATUS = ['observed', 'unobserved', 'not_applicable'];
const TEMPORAL_STATUS = ['current', 'stale', 'historical'];
const EPISTEMIC_STATUS = ['ambiguous', 'contradicted', 'emerging', 'established', 'provisional', 'superseded', 'unknown'];

/** Directive §11 — the only three verdicts congruence may take. */
const CONGRUENCE = ['CONGRUENT', 'DIVERGENT', 'CANNOT_ESTABLISH'];

// ============================================================================
// ASSERTION CONSTRUCTOR — enforces the contract so a wrong one cannot be built
// ============================================================================

function assertion(a) {
  const oneOf = (field, allowed) => {
    if (!allowed.includes(a[field])) {
      throw new Error(`INADMISSIBLE ${field}='${a[field]}' (allowed: ${allowed.join(' · ')})`);
    }
  };
  oneOf('presence_value', PRESENCE_VALUE);
  oneOf('observation_status', OBSERVATION_STATUS);
  oneOf('temporal_status', TEMPORAL_STATUS);
  oneOf('epistemic_status', EPISTEMIC_STATUS);

  for (const el of a.operational_element ?? []) {
    if (!OPERATIONAL_ELEMENT.includes(el)) throw new Error(`INADMISSIBLE operational_element='${el}'`);
  }

  // Contract §7.1 — the binding rule. This is the single most load-bearing
  // invariant in the whole grammar: an observer's blindness may never be
  // written down as a condition of the observed.
  if (a.observation_status !== 'observed' && a.presence_value !== 'unknown') {
    throw new Error(
      `CONTRACT §7.1 VIOLATION: presence_value='${a.presence_value}' requires ` +
      `observation_status='observed', got '${a.observation_status}'`
    );
  }

  // Every assertion must state its own competence boundary. Directive §2.2.
  for (const req of ['id', 'establishes', 'doesNotEstablish', 'failingImplementation', 'provenance']) {
    if (!a[req]) throw new Error(`assertion '${a.id ?? '?'}' missing required field '${req}'`);
  }
  return a;
}

function aperture(ap) {
  for (const req of ['domain', 'missingObservation', 'whyItMatters', 'possibleInstrument', 'authorityToInstrument', 'thereforeNotClaimable']) {
    if (!ap[req]) throw new Error(`aperture '${ap.domain ?? '?'}' missing required field '${req}'`);
  }
  return ap;
}

// ============================================================================
// SUBJECT BINDING — docs/ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md
//
// "Never accept a health classification until the identity of the subject it
//  observes has been independently proven. SUBJECT -> STATE -> INTERPRETATION."
//
// Instance #3 of that record is the class this guards: a candidate root that
// satisfies every structural marker and is nonetheless the wrong repository.
// Structural markers prove well-formedness, NEVER intendedness. So the subject
// is bound by REMOTE-INDEPENDENT REPOSITORY IDENTITY (the root-commit SHA),
// which a sibling worktree of the same repo shares and an unrelated checkout
// does not — plus the resolved path and the reason it resolved.
// ============================================================================

// Read from this repository, not assumed: `git rev-list --max-parents=0 HEAD`.
const CANONICAL_ROOT_COMMIT = 'd0a99cabc129b9ba2c292ed7df6799f0fa379fbb';
const KNOWN_LOCAL_DEFAULT = '/Users/soullab/MAIA-SOVEREIGN';

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function bindSubject(argv) {
  const flagIdx = argv.indexOf('--subject');
  const explicit = flagIdx !== -1 ? argv[flagIdx + 1] : null;

  // The tree this process was actually invoked inside. This is the only
  // candidate that cannot be silently redirected by ambient state.
  const cwdRoot = git(process.cwd(), ['rev-parse', '--show-toplevel']);

  const resolvedPath = path.resolve(explicit ?? process.env.JARVIS_REPO_ROOT ?? cwdRoot ?? KNOWN_LOCAL_DEFAULT);
  const why = explicit
    ? 'EXPLICIT_FLAG'
    : process.env.JARVIS_REPO_ROOT
      ? 'ENV'
      : cwdRoot
        ? 'INVOCATION_CWD'
        : 'KNOWN_LOCAL_DEFAULT';

  const subject = {
    resolvedPath,
    why,
    invocationCwdRoot: cwdRoot,
    bound: false,
    refusal: null,
    headSha: null,
    branch: null,
    detached: null,
    dirtyCount: null,
    rootCommit: null,
  };

  // Instance #3 of the record: an ENV-supplied root that satisfies every
  // structural marker, and is a different checkout than the one in hand. Same
  // repository is NOT the same subject — sibling worktrees share a root commit
  // and differ in HEAD, branch, and working state. Ambient redirection is
  // therefore refused unless it was named explicitly on the command line.
  if (why === 'ENV' && cwdRoot && path.resolve(cwdRoot) !== resolvedPath) {
    subject.refusal =
      `SUBJECT DIVERGENCE: JARVIS_REPO_ROOT points at ${resolvedPath}, but this process was invoked inside ` +
      `${cwdRoot}. These are different checkouts. Ambient environment is not proof of the intended subject — ` +
      `pass --subject explicitly to override.`;
    return subject;
  }

  if (!fs.existsSync(resolvedPath)) {
    subject.refusal = `subject path does not exist: ${resolvedPath}`;
    return subject;
  }
  if (!git(resolvedPath, ['rev-parse', '--git-dir'])) {
    subject.refusal = `subject path is not a git repository: ${resolvedPath}`;
    return subject;
  }

  subject.headSha = git(resolvedPath, ['rev-parse', '--short', 'HEAD']);
  subject.branch = git(resolvedPath, ['rev-parse', '--abbrev-ref', 'HEAD']);
  subject.detached = subject.branch === 'HEAD';
  const porcelain = git(resolvedPath, ['status', '--porcelain']);
  subject.dirtyCount = porcelain ? porcelain.split('\n').filter(Boolean).length : 0;

  // Repository identity, not path identity. Names are not identity.
  const roots = git(resolvedPath, ['rev-list', '--max-parents=0', 'HEAD']);
  subject.rootCommit = roots ? roots.split('\n').pop().trim() : null;

  if (subject.rootCommit !== CANONICAL_ROOT_COMMIT) {
    subject.refusal =
      `subject is a DIFFERENT REPOSITORY than the one this harness is written about. ` +
      `root-commit ${subject.rootCommit ?? 'UNRESOLVABLE'} != canonical ${CANONICAL_ROOT_COMMIT}. ` +
      `Structural markers (a git dir, a scripts/builder tree, a docs/ tree) prove well-formedness, never intendedness.`;
    return subject;
  }

  subject.bound = true;
  return subject;
}

/** Observer identity — this file, and its own hash. Directive §2.2 / the rule's minimum provenance. */
function bindObserver() {
  const self = new URL(import.meta.url).pathname;
  const src = fs.readFileSync(self, 'utf8');
  return {
    path: path.relative(process.cwd(), self),
    sha256: crypto.createHash('sha256').update(src).digest('hex').slice(0, 16),
  };
}

// ============================================================================
// READ PRIMITIVES — every derivation goes through these, so every assertion
// can name the exact source and the exact read that produced it.
// ============================================================================

function readFile(root, rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8');
}

function findLine(content, re) {
  if (!content) return null;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return { line: i + 1, text: lines[i].trim() };
  }
  return null;
}

function tracked(root, rel) {
  return git(root, ['ls-files', '--error-unmatch', rel]) !== null;
}

const prov = (source, read, extra = {}) => ({ source, read, ...extra });

// ============================================================================
// CAPABILITY 1 — maia.identity.congruence
//
// Directive §11: distinguish who the CLIENT thinks I am, who the SERVER
// authenticates me as, and who MEMBER-SCOPED STORES resolve me as.
// ============================================================================

function deriveIdentityCongruence(root) {
  const assertions = [];
  const apertures = [];

  // --- Resolver 1: client ---------------------------------------------------
  const apiBase = readFile(root, 'lib/http/apiBase.ts');
  const clientRead = findLine(apiBase, /localStorage\.getItem\(['"]memberId['"]\)/);
  const clientFallback = findLine(apiBase, /localStorage\.getItem\(['"]beta_user['"]\)/);

  assertions.push(assertion({
    id: 'identity.resolver.client',
    capability: 'maia.identity.congruence',
    subjectOfClaim: 'the client-side member identity resolver',
    operational_element: ['discrimination'],
    presence_value: clientRead ? 'present' : 'unknown',
    observation_status: clientRead ? 'observed' : 'unobserved',
    temporal_status: 'current',
    epistemic_status: clientRead ? 'established' : 'unknown',
    provenance: prov(
      'lib/http/apiBase.ts',
      clientRead
        ? `line ${clientRead.line}: ${clientRead.text}` +
          (clientFallback ? ` | fallback line ${clientFallback.line}: ${clientFallback.text}` : '')
        : 'pattern not found',
    ),
    establishes: 'That the client derives member identity from localStorage, in this tree, as declared source.',
    doesNotEstablish: 'That any client at runtime holds a valid id; that the id is authentic; that a member exists.',
    failingImplementation:
      'A harness that did not actually read this file would report the same "present" from the capability name alone. ' +
      'The provenance line number and text are what distinguish a read from an assumption.',
  }));

  // --- Resolver 2: server ---------------------------------------------------
  const getMember = readFile(root, 'lib/auth/getMemberFromRequest.ts');
  const serverFn = findLine(getMember, /export async function getMemberIdFromRequest/);

  assertions.push(assertion({
    id: 'identity.resolver.server',
    capability: 'maia.identity.congruence',
    subjectOfClaim: 'the server-side authenticated identity resolver',
    operational_element: ['discrimination'],
    presence_value: serverFn ? 'present' : 'unknown',
    observation_status: serverFn ? 'observed' : 'unobserved',
    temporal_status: 'current',
    epistemic_status: serverFn ? 'established' : 'unknown',
    provenance: prov(
      'lib/auth/getMemberFromRequest.ts',
      serverFn ? `line ${serverFn.line}: ${serverFn.text}` : 'export not found',
    ),
    establishes: 'That a distinct server-side resolver exists and is exported.',
    doesNotEstablish: 'That every route uses it; that it is reached before member-scoped reads; runtime behaviour of any kind.',
    failingImplementation: 'Would report presence from the file existing, without confirming the export symbol.',
  }));

  // --- Resolver 3: edge (middleware) ---------------------------------------
  // The discriminating read. Does the edge accept a CLIENT-SUPPLIED header as
  // proof of authentication? Directive §11: "Never treat localStorage identity
  // as authenticated identity."
  const mw = readFile(root, 'middleware.ts');
  let edgeAcceptsRawHeader = null;
  let edgeProvenance = 'middleware.ts not readable';

  if (mw) {
    const lines = mw.split('\n');
    const hdrIdx = lines.findIndex((l) => /req\.headers\.get\(['"]x-member-id['"]\)/.test(l));
    if (hdrIdx !== -1) {
      // Look ahead a few lines for an unconditional grant on the raw header.
      const window = lines.slice(hdrIdx, hdrIdx + 3).join(' ');
      edgeAcceptsRawHeader = /return true/.test(window);
      edgeProvenance =
        `line ${hdrIdx + 1}: ${lines[hdrIdx].trim()}` +
        (edgeAcceptsRawHeader ? ` -> line ${hdrIdx + 2}: ${lines[hdrIdx + 1].trim()}` : '');
    }
  }

  assertions.push(assertion({
    id: 'identity.resolver.edge',
    capability: 'maia.identity.congruence',
    subjectOfClaim: 'what the edge accepts as proof of authenticated identity',
    operational_element: ['discrimination'],
    presence_value: edgeAcceptsRawHeader === null ? 'unknown' : 'present',
    observation_status: edgeAcceptsRawHeader === null ? 'unobserved' : 'observed',
    temporal_status: 'current',
    epistemic_status: edgeAcceptsRawHeader === null ? 'unknown' : 'established',
    provenance: prov('middleware.ts', edgeProvenance),
    establishes:
      edgeAcceptsRawHeader
        ? 'That the edge grants authenticated status on the presence of an unverified client-supplied x-member-id header.'
        : 'That no unconditional grant on the raw header was found by this read.',
    doesNotEstablish:
      'Whether a downstream route independently re-verifies identity before member-scoped reads. ' +
      'This is an edge-level read only, and a route that re-verifies would make the practical exposure narrower than the edge suggests.',
    failingImplementation:
      'A harness that grepped only for the header name would report the same finding whether or not the grant is unconditional. ' +
      'The look-ahead for `return true` is what makes this a claim about behaviour rather than about vocabulary.',
  }));

  // --- Congruence verdict ---------------------------------------------------
  // Derived, never authored. The verdict follows mechanically from the reads.
  let verdict;
  let verdictBasis;

  if (!clientRead || !serverFn || edgeAcceptsRawHeader === null) {
    verdict = 'CANNOT_ESTABLISH';
    verdictBasis = 'At least one of the three resolvers could not be read in this subject.';
  } else if (edgeAcceptsRawHeader) {
    verdict = 'DIVERGENT';
    verdictBasis =
      'The client derives identity from localStorage (apiBase.ts) and the edge grants authenticated status on the ' +
      'presence of that same client-supplied value (middleware.ts), while a separate server-side resolver exists ' +
      '(getMemberFromRequest.ts). Client-asserted identity and server-authenticated identity are therefore not the ' +
      'same relation at the edge.';
  } else {
    verdict = 'CONGRUENT';
    verdictBasis = 'No unconditional grant on a client-supplied identity header was found.';
  }

  if (!CONGRUENCE.includes(verdict)) throw new Error(`INADMISSIBLE congruence verdict '${verdict}'`);

  // --- Aperture: the third leg is genuinely not readable from source --------
  apertures.push(aperture({
    domain: 'maia.identity.congruence / member-scoped store resolution',
    missingObservation:
      'What identity member-scoped stores actually resolve for a live request. No DB read and no runtime trace was performed.',
    whyItMatters:
      'Directive §11 names three resolvers. This harness reads two and the edge. The store leg is the one where a ' +
      'divergence would actually surface as one member seeing another member\'s field.',
    possibleInstrument: 'A runtime trace correlating an authenticated request to the member_id used in the subsequent scoped query.',
    authorityToInstrument: 'NOT HELD — runtime tracing is not authorized under Slice 1.',
    thereforeNotClaimable: [
      'That member-scoped data is correctly isolated.',
      'That the DIVERGENT verdict above does or does not result in cross-member exposure.',
      'Any statement of the form "identity works" or "identity is broken" at the store layer.',
    ],
  }));

  return {
    capability: 'maia.identity.congruence',
    congruence: { verdict, basis: verdictBasis },
    assertions,
    apertures,
    proposedAxes: { ecology: 'Identity', maia_relation: 'MEMBER_AUTHORITY' },
  };
}

// ============================================================================
// CAPABILITY 2 — astrology.maia_relation
//
// Directive §10: a subsystem can be entirely healthy while MAIA cannot receive
// its field. The discriminating question is NOT "does Astrology work" but
// "does the field reach the assembled prompt".
//
// Contract §2.5 `composition` counter: "Presence in a meta object. Availability
// is not composition." So subsystem presence and context carriage are NOT
// evidence of composition; only the assembly point is.
// ============================================================================

function deriveAstrologyMaiaRelation(root) {
  const assertions = [];
  const apertures = [];

  // --- Subsystem presence ---------------------------------------------------
  const routesDir = path.join(root, 'app/api/astrology');
  let routeCount = 0;
  if (fs.existsSync(routesDir)) {
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name === 'route.ts') routeCount++;
      }
    };
    walk(routesDir);
  }

  assertions.push(assertion({
    id: 'astrology.subsystem.present',
    capability: 'astrology.maia_relation',
    subjectOfClaim: 'the Astrology subsystem as declared code',
    operational_element: ['consolidation'],
    presence_value: routeCount > 0 ? 'present' : 'none',
    observation_status: 'observed',
    temporal_status: 'current',
    epistemic_status: 'established',
    provenance: prov('app/api/astrology/**/route.ts', `${routeCount} route modules found on disk`),
    establishes: 'That astrology route modules exist in this tree.',
    doesNotEstablish: 'That any route is reachable, deployed, or ever called. That MAIA can receive any of it.',
    failingImplementation: 'Would count files and call it integration — which is precisely the conflation this capability exists to catch.',
  }));

  // --- Context carriage (NOT composition) ----------------------------------
  const buildCtx = readFile(root, 'lib/maia/context/buildMaiaContext.ts');
  const ctxImport = findLine(buildCtx, /getAstrologyContextForUser/);
  const ctxField = findLine(buildCtx, /astrologyAddendum\??:/);

  assertions.push(assertion({
    id: 'astrology.context.carried',
    capability: 'astrology.maia_relation',
    subjectOfClaim: 'carriage of an astrology addendum into the MAIA context object',
    operational_element: ['conveyance'],
    presence_value: ctxImport ? 'present' : 'unknown',
    observation_status: ctxImport ? 'observed' : 'unobserved',
    temporal_status: 'current',
    epistemic_status: ctxImport ? 'established' : 'unknown',
    provenance: prov(
      'lib/maia/context/buildMaiaContext.ts',
      ctxImport ? `line ${ctxImport.line}: ${ctxImport.text}` + (ctxField ? ` | field line ${ctxField.line}` : '') : 'not found',
    ),
    establishes: 'That an astrology addendum is produced and placed on the context object.',
    doesNotEstablish:
      '⛔ THAT IT REACHES THE PROMPT. Contract §2.5: presence in a meta object is availability, not composition. ' +
      'This assertion is deliberately NOT composition.',
    failingImplementation:
      'A harness that stopped here would report astrology as "integrated with MAIA" on the strength of a field assignment — ' +
      'the PBR-002 false-positive class named in the contract.',
  }));

  // --- Assembly point — the only admissible composition evidence -----------
  const svc = readFile(root, 'lib/sovereign/maiaService.ts');
  const readsAddendum = findLine(svc, /const astrologyAddendum\s*=/);
  // Composition requires the value to appear INSIDE an assembled prompt literal.
  const interpolation = findLine(svc, /\$\{astrologyAddendum\s*\?/);

  const composed = Boolean(interpolation);

  assertions.push(assertion({
    id: 'astrology.prompt.composed',
    capability: 'astrology.maia_relation',
    subjectOfClaim: 'whether the astrology field is composed into an assembled MAIA prompt',
    operational_element: composed ? ['composition'] : ['discrimination'],
    presence_value: composed ? 'present' : 'unknown',
    observation_status: composed ? 'observed' : 'unobserved',
    temporal_status: 'current',
    // Assembly-point evidence in SOURCE. Not runtime. Contract §2.5 says
    // composition asserted without assembly-point evidence is the single most
    // likely false positive; this has the assembly point but not the run.
    epistemic_status: composed ? 'provisional' : 'unknown',
    provenance: prov(
      'lib/sovereign/maiaService.ts',
      composed
        ? `interpolation at line ${interpolation.line}` + (readsAddendum ? ` | read at line ${readsAddendum.line}` : '')
        : 'no prompt interpolation of astrologyAddendum found',
    ),
    establishes:
      composed
        ? 'That a prompt template literal in this tier interpolates the astrology addendum — assembly-point evidence in source.'
        : 'That this read found no assembly-point interpolation.',
    doesNotEstablish:
      'That it executed for any member; that any member has stored birth data; that the addendum was non-empty at runtime; ' +
      'that other tiers compose it. `provisional`, never `established`, precisely because the assembly was not witnessed running.',
    failingImplementation:
      'A broken version would mark this `established` on source evidence alone, erasing the difference between ' +
      'a prompt that CAN carry the field and one that DID.',
  }));

  apertures.push(aperture({
    domain: 'astrology.maia_relation / runtime composition',
    missingObservation: 'Whether the astrology addendum was non-empty in any real assembled prompt.',
    whyItMatters:
      'Every assertion above is a source read. A member with no stored birth data yields an empty addendum, and the ' +
      'interpolation renders nothing — source-identical, experience-absent.',
    possibleInstrument: 'A runtime log of assembled-prompt addendum lengths, or a member-facing witness.',
    authorityToInstrument: 'NOT HELD — live telemetry is NOT AUTHORIZED; no encounter record source exists.',
    thereforeNotClaimable: [
      'That MAIA knows any member\'s chart.',
      'That the astrology→MAIA relation is live, working, or member-visible.',
      'Any tier-level claim beyond the one file read here.',
    ],
  }));

  return {
    capability: 'astrology.maia_relation',
    assertions,
    apertures,
    proposedAxes: { ecology: 'Astrology / Soul Portrait', maia_relation: composed ? 'CONTEXT_SUPPLIED' : 'VISIBLE_TO_MAIA' },
  };
}

// ============================================================================
// PROGRAMME-LEVEL APERTURES — carried from the proposal, not closed
// ============================================================================

function programmeApertures(root) {
  const fixtureRel = 'docs/ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md';
  const fixtureTracked = tracked(root, fixtureRel);

  return [
    aperture({
      domain: 'deployed referent',
      missingObservation: 'What is actually running in production. No runtime read was performed by this harness.',
      whyItMatters: 'Phase 0 §A.3 records the deployed referent as PARTIALLY BOUND — 1 of 5 criteria.',
      possibleInstrument: 'GIT_COMMIT of the running container plus the four unmet criteria.',
      authorityToInstrument: 'Read is available; this harness deliberately performs none, to stay source-only.',
      thereforeNotClaimable: ['That anything derived here describes production.', 'That any capability is deployed or working.'],
    }),
    aperture({
      domain: 'criterion-3 fixture custody',
      missingObservation: fixtureTracked
        ? null
        : `${fixtureRel} is UNTRACKED in this subject — it has no commit lineage and cannot be bound as a canonical referent.`,
      whyItMatters:
        'The Subject Identity Failure rule is the instrument this harness is measured against. An untracked instrument ' +
        'can change without trace, which is instance #1 of the very failure it names.',
      possibleInstrument: 'Bring the record into commit custody as its own authorized unit.',
      authorityToInstrument: 'NOT HELD — absorbing untracked artifacts was explicitly excluded.',
      thereforeNotClaimable: [
        'That the rule this harness implements is canonically fixed.',
        'That a future run measures against the same text.',
      ],
    }),
    aperture({
      domain: 'witness',
      missingObservation: 'Any qualifying human encounter with either capability.',
      whyItMatters: 'Directive §2.3 — witness cannot be synthesized from source activity.',
      possibleInstrument: 'An encounter record.',
      authorityToInstrument: 'NOT HELD.',
      thereforeNotClaimable: ['That WITNESS_OWED is cleared for anything here, in any form.'],
    }),
  ].filter((a) => a.missingObservation);
}

// ============================================================================
// RENDER
// ============================================================================

function renderText(out) {
  const L = [];
  const s = out.subject;

  L.push('LIVING SPIRAL — SLICE 1 PERFORMED DERIVATION');
  L.push('='.repeat(78));
  L.push('');
  L.push('SUBJECT BINDING   (proof order: SUBJECT -> STATE -> INTERPRETATION)');
  L.push(`  resolved path   ${s.resolvedPath}`);
  L.push(`  why resolved    ${s.why}`);
  L.push(`  invocation cwd  ${s.invocationCwdRoot ?? '—'}`);
  L.push(`  root commit     ${s.rootCommit ?? 'UNRESOLVABLE'}`);
  L.push(`  HEAD            ${s.headSha ?? '—'}  branch=${s.branch ?? '—'} detached=${s.detached ?? '—'} dirty=${s.dirtyCount ?? '—'}`);
  L.push(`  observer        ${out.observer.path} @ sha256:${out.observer.sha256}`);
  L.push(`  BOUND           ${s.bound ? 'YES' : 'NO'}`);
  L.push('');

  if (!s.bound) {
    L.push('⛔ SUBJECT NOT BOUND — NO ASSERTIONS EMITTED');
    L.push(`   ${s.refusal}`);
    L.push('');
    L.push('   A correct interpretation of the wrong subject is still incorrect.');
    L.push('   docs/ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md');
    return L.join('\n');
  }

  for (const cap of out.capabilities) {
    L.push('-'.repeat(78));
    L.push(`CAPABILITY  ${cap.capability}`);
    if (cap.congruence) {
      L.push(`  CONGRUENCE  ${cap.congruence.verdict}`);
      L.push(`              ${cap.congruence.basis.replace(/\s+/g, ' ')}`);
    }
    L.push('');
    for (const a of cap.assertions) {
      L.push(`  [${a.id}]`);
      L.push(`    element            ${a.operational_element.join(' + ')}`);
      L.push(`    presence           ${a.presence_value}      observation  ${a.observation_status}`);
      L.push(`    temporal           ${a.temporal_status}       epistemic    ${a.epistemic_status}`);
      L.push(`    provenance         ${a.provenance.source}`);
      L.push(`                       ${a.provenance.read}`);
      L.push(`    ESTABLISHES        ${a.establishes}`);
      L.push(`    DOES NOT ESTABLISH ${a.doesNotEstablish}`);
      L.push(`    FAILING IMPL WOULD ${a.failingImplementation}`);
      L.push('');
    }
    L.push(`  PROPOSED AXES (not accepted — founder act required to adopt)`);
    L.push(`    ecology          ${cap.proposedAxes.ecology}`);
    L.push(`    maia_relation    ${cap.proposedAxes.maia_relation}`);
    L.push('');
  }

  L.push('='.repeat(78));
  L.push('CANNOT SEE');
  L.push('');
  for (const ap of out.apertures) {
    L.push(`  ${ap.domain}`);
    L.push(`    missing        ${ap.missingObservation.replace(/\s+/g, ' ')}`);
    L.push(`    why it matters ${ap.whyItMatters.replace(/\s+/g, ' ')}`);
    L.push(`    instrument     ${ap.possibleInstrument}`);
    L.push(`    authority      ${ap.authorityToInstrument}`);
    L.push(`    THEREFORE NOT CLAIMABLE:`);
    for (const c of ap.thereforeNotClaimable) L.push(`      ⛔ ${c}`);
    L.push('');
  }

  L.push('='.repeat(78));
  L.push('⛔ No health value, lifecycle value, error class, score, ranking, or');
  L.push('   percentage appears anywhere above. None is derivable under Slice 1.');
  return L.join('\n');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');

  const subject = bindSubject(argv);
  const observer = bindObserver();

  const out = { subject, observer, capabilities: [], apertures: [] };

  if (subject.bound) {
    const root = subject.resolvedPath;
    out.capabilities = [deriveIdentityCongruence(root), deriveAstrologyMaiaRelation(root)];
    out.apertures = [
      ...out.capabilities.flatMap((c) => c.apertures),
      ...programmeApertures(root),
    ];
  }

  if (asJson) {
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } else {
    process.stdout.write(renderText(out) + '\n');
  }

  // Exit 0 on a bound subject with emitted assertions; 2 on a refusal.
  // ⛔ Never exit 1 — this harness is not a gate and decides nothing.
  process.exit(subject.bound ? 0 : 2);
}

main();
