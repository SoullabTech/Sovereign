/**
 * JOP-04 · RB-CAL-4 — HOST-LOADER IDENTITY CONTINUITY
 *
 * FROZEN LAW (2026-09-13)
 *   Identity-bearing modules may not be independently re-instantiated across a
 *   trust boundary that expects their private identities to interoperate.
 *
 *     STATELESS MODULE        may be independently cache-busted
 *     IDENTITY-BEARING MODULE must have ONE authoritative identity lineage for
 *                             every producer/consumer that exchanges its values
 *
 * FROZEN SEMANTIC REQUIREMENT — ⛔ NOT an assertion about `Symbol`:
 *   Legitimately minted routing eligibility survives production-equivalent
 *   module reloads WITHOUT becoming forgeable.
 *   ⭐ The implementation stays free to replace the branding mechanism without
 *      rewriting the law.
 *
 * ⭐ THIS PROBE REPRODUCES THE PRODUCTION LOADING DISCIPLINE, not the favourable
 *    test discipline. Every earlier probe minted and tested inside one module
 *    graph and therefore passed a fractured system.
 *
 * ⭐⭐ IDENTITY PRINCIPLE (frozen 2026-09-13, post-Option-B):
 *   Unforgeability does not require every GENUINE token to be accepted. It
 *   requires acceptance ONLY of tokens minted within the AUTHORIZED identity
 *   lineage. Option B does not make independently instantiated brands
 *   interoperable — it removes independent instantiation from the authorized
 *   production lineage.
 *
 * THE AUTHORITATIVE TOPOLOGY under Option B:
 *   host → fresh router graph → { route, re-exported producer }
 *                                     ↓
 *                          one static identity-bearing dependency
 *
 * ⛔ "production-shaped" is NOT derived from host source. A future broken host
 *    must never be able to teach its own judge that the breakage is correct.
 *    The architectural contract is stated here; the structural canary only asks
 *    whether the host still conforms; the real IPC witness is the final truth.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ELIG_REL = ['scripts', 'builder', 'routing-eligibility.mjs'];
const ROUTER_REL = ['scripts', 'builder', 'router.mjs'];
const CAPABILITY = 'git.rev_parse';
const url = (subjectDir, rel, bust) =>
  `file://${path.join(subjectDir, ...rel)}${bust ? `?t=${Date.now()}${Math.random()}` : ''}`;

const accepted = (d) => d && d.execution_lane === 'C0';

export async function runCal4(subjectDir) {
  // Does an identity-bearing eligibility module exist at all?
  let hostElig = null;
  try { hostElig = await import(url(subjectDir, ELIG_REL, true)); } catch { hostElig = null; }
  if (!hostElig || typeof hostElig.declareRoutingEligibility !== 'function') {
    const unmet = (id, label) => ({
      id, label, observed: 'PRECONDITION-UNMET',
      precondition: { requirement: 'REQUIRED', state: 'UNREACHED',
        evidence: { identity_bearing_module_present: false },
        provenance: 'no routing-eligibility producer exists in this subject' },
      evidence: { reason: 'there is no identity-bearing module whose continuity could fracture' },
      note: '⛔ PRECONDITION-UNMET — no identity lineage exists to test',
    });
    return {
      cal4a: unmet('RB-CAL-4a', 'legitimate CROSS-LOADER object is recognized'),
      cal4b: unmet('RB-CAL-4b', 'same-lineage positive control'),
      cal4c: unmet('RB-CAL-4c', 'forgery negative control'),
      cal4d: unmet('RB-CAL-4d', 'reload stability — N fresh authoritative router graphs all accept'),
      cal4e: unmet('RB-CAL-4e', 'NON-AUTHORITATIVE LINEAGE control'),
    };
  }

  // ── Does an AUTHORITATIVE lineage exist? (Option B: router re-exports it) ─
  const hostRouterA = await import(url(subjectDir, ROUTER_REL, true));
  const authoritative = typeof hostRouterA.declareRoutingEligibility === 'function';
  const noAuthority = (id, label) => ({
    id, label, observed: 'PRECONDITION-UNMET',
    precondition: { requirement: 'REQUIRED', state: 'UNREACHED',
      evidence: { router_re_exports_producer: false },
      provenance: 'the router does not expose the producer, so no authoritative lineage exists to mint within' },
    evidence: { reason: 'the authoritative identity topology this probe is specified against does not exist in this subject' },
    note: '⛔ PRECONDITION-UNMET — no authoritative lineage; the historical pre-repair specimens remain the record for that topology',
  });

  // ── CAL-4a · AUTHORITATIVE LINEAGE CROSSING ──────────────────────────────
  //    mint through router graph A → test through router graph B (independent
  //    cache-busted instances) → must ACCEPT.
  let cal4a;
  if (!authoritative) {
    cal4a = noAuthority('RB-CAL-4a', 'authoritative lineage crossing — router graph A mints, router graph B accepts');
  } else {
    const hostRouterB = await import(url(subjectDir, ROUTER_REL, true));
    const mintedA = hostRouterA.declareRoutingEligibility({
      satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-graph-A',
    });
    const dec = hostRouterB.route({ capability: CAPABILITY }, mintedA);
    cal4a = {
      id: 'RB-CAL-4a',
      label: 'authoritative lineage crossing — router graph A mints, router graph B accepts',
      observed: accepted(dec) ? 'GREEN' : 'RED',
      precondition: { requirement: 'REQUIRED', state: 'REACHED',
        evidence: { topology: 'host → fresh router graph → { route, re-exported producer }',
          graph_a_and_b_independently_cache_busted: true, minted_by: 'graph A', tested_by: 'graph B' },
        provenance: 'two independent cache-busted router imports, as the host reloads routing code' },
      evidence: { lane: dec.execution_lane, status: dec.status, reason: dec.reason },
      note: accepted(dec)
        ? '⭐ legitimately minted eligibility is recognized across the production identity topology'
        : '🔴 a value minted in the authoritative lineage was refused by another instance of it',
    };
  }

  // ── CAL-4b · same-lineage positive control ───────────────────────────────
  const lineageElig = await import(url(subjectDir, ELIG_REL, false));
  const sameMinted = lineageElig.declareRoutingEligibility({
    satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-same-lineage',
  });
  const sameDecision = hostRouterA.route({ capability: CAPABILITY }, sameMinted);
  const cal4b = {
    id: 'RB-CAL-4b',
    label: 'same-lineage positive control — mint and test through one identity lineage',
    observed: accepted(sameDecision) ? 'GREEN' : 'RED',
    precondition: { requirement: 'REQUIRED', state: 'REACHED',
      evidence: { lineage: 'unqueried module URL — the one the router statically imports' },
      provenance: 'single identity lineage by construction' },
    evidence: { lane: sameDecision.execution_lane, status: sameDecision.status },
    note: accepted(sameDecision)
      ? '⭐ the brand mechanism itself works — any defect is lineage, not design'
      : 'the brand rejects even a same-lineage object — the mechanism itself is broken',
  };

  // ── CAL-4c · NO IDENTITY — structural counterfeit ────────────────────────
  const forged = { satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-forgery', declared_at: new Date().toISOString() };
  const forgedDecision = hostRouterA.route({ capability: CAPABILITY }, forged);
  const cal4c = {
    id: 'RB-CAL-4c',
    label: 'NO IDENTITY — an unbranded structural counterfeit is refused',
    observed: accepted(forgedDecision) ? 'RED' : 'GREEN',
    precondition: { requirement: 'REQUIRED', state: 'REACHED',
      evidence: { forged_fields: Object.keys(forged), matches_visible_shape_of_legitimate_object: true },
      provenance: 'plain object literal carrying every visible field of a legitimate one' },
    evidence: { lane: forgedDecision.execution_lane, status: forgedDecision.status },
    note: accepted(forgedDecision)
      ? '🔴 an unbranded lookalike was accepted — unforgeability lost'
      : '⭐ identical visible fields are not identity',
  };

  // ── CAL-4d · reload stability within the authoritative lineage ───────────
  let cal4d;
  if (!authoritative) {
    cal4d = noAuthority('RB-CAL-4d', 'reload stability — N fresh authoritative router graphs all accept');
  } else {
    const minted = hostRouterA.declareRoutingEligibility({
      satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-reload',
    });
    const N = 5;
    const reloads = [];
    for (let i = 0; i < N; i++) {
      const r = await import(url(subjectDir, ROUTER_REL, true));
      reloads.push({ i, accepted: accepted(r.route({ capability: CAPABILITY }, minted)) });
    }
    const allAccept = reloads.every((r) => r.accepted);
    cal4d = {
      id: 'RB-CAL-4d',
      label: 'reload stability — N fresh authoritative router graphs all accept',
      observed: allAccept ? 'GREEN' : 'RED',
      precondition: { requirement: 'REQUIRED', state: 'REACHED',
        evidence: { fresh_router_graphs: N, minted_once_through: 'the authoritative router graph' },
        provenance: 'N independent cache-busted router imports, mirroring host reload behaviour' },
      evidence: { reloads, all_accept: allAccept },
      note: allAccept
        ? '⭐ legitimately minted eligibility survives production-equivalent module reloads'
        : '🔴 fresh authoritative graphs reject a value minted within the lineage',
    };
  }

  // ── CAL-4e · NON-AUTHORITATIVE LINEAGE CONTROL ───────────────────────────
  //    ⭐ The pre-repair specimen, repurposed. Genuinely branded, minted OUTSIDE
  //    the authorized graph → must be REFUSED. ⛔ "non-authoritative", not
  //    "stale": the defect is provenance of identity, not age.
  let cal4e;
  if (!authoritative) {
    cal4e = noAuthority('RB-CAL-4e', 'NON-AUTHORITATIVE LINEAGE — a genuine brand minted outside the authorized graph is refused');
  } else {
    const outsideElig = await import(url(subjectDir, ELIG_REL, true));
    const outsideMinted = outsideElig.declareRoutingEligibility({
      satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-non-authoritative',
    });
    const dec = hostRouterA.route({ capability: CAPABILITY }, outsideMinted);
    cal4e = {
      id: 'RB-CAL-4e',
      label: 'NON-AUTHORITATIVE LINEAGE — a genuine brand minted outside the authorized graph is refused',
      observed: accepted(dec) ? 'RED' : 'GREEN',
      precondition: { requirement: 'REQUIRED', state: 'REACHED',
        evidence: { minted_by: 'an independently cache-busted eligibility module — a REAL producer, outside the authorized graph',
          tested_by: 'the authoritative router graph', token_is_genuine: true },
        provenance: 'independent dynamic import of the identity-bearing module' },
      evidence: { lane: dec.execution_lane, status: dec.status },
      note: accepted(dec)
        ? '🔴 a token minted outside the authorized lineage was accepted — the lineage boundary is not enforced'
        : '⭐ unforgeability does not mean accepting every genuine token — only those minted within the authorized lineage',
    };
  }

  return { cal4a, cal4b, cal4c, cal4d, cal4e };
}

/** Strip block and line comments before scanning source. ⭐ Same discipline C21
 *  has used since R4, and for the same reason: a prose ban must never read as
 *  the banned behaviour returning. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * SOURCE CANARY — ⛔ a tripwire, never the proof.
 * Forbids the known dangerous repair: a globally forgeable brand.
 */
export function symbolForCanary(subjectDir) {
  let src = '';
  try { src = readFileSync(path.join(subjectDir, ...ELIG_REL), 'utf8'); } catch { return { readable: false, discharges: false }; }
  return {
    id: 'RB-CANARY-SYMBOL-FOR',
    readable: true,
    uses_global_symbol_registry: /Symbol\.for\s*\(/.test(stripComments(src)),
    scanned: 'comment-stripped source — a file documenting the ban must not read as the ban being violated',
    evidence_class: 'CANARY (supplementary; ⛔ discharges nothing)',
    why: 'Symbol.for keys a GLOBAL registry — anyone can forge the brand. Restoring routability that way would trade a proven property for a convenience.',
    discharges: false,
  };
}

/**
 * STRUCTURAL TRIPWIRE for the Option-B anti-auto-mint law.
 *   same graph        YES
 *   router self-mints NO      ← this checks that
 *   caller mints      NO
 */
export function routerSelfMintTripwire(subjectDir) {
  let src = '';
  try { src = readFileSync(path.join(subjectDir, ...ROUTER_REL), 'utf8'); } catch { return { readable: false, discharges: false }; }
  return {
    id: 'RB-TRIPWIRE-ROUTER-SELF-MINT',
    readable: true,
    router_calls_producer: /declareRoutingEligibility\s*\(/.test(stripComments(src)),
    router_binds_producer_locally: /import\s*\{[^}]*declareRoutingEligibility[^}]*\}\s*from/.test(stripComments(src)),
    pure_re_export: /export\s*\{\s*declareRoutingEligibility\s*\}\s*from/.test(stripComments(src)),
    scanned: 'comment-stripped source',
    evidence_class: 'STRUCTURAL (supplementary; ⛔ discharges nothing)',
    law: 'the router may make the producer AVAILABLE to the trusted host; it may never mint from facts it derives itself — that would repair the lineage fracture while reintroducing RB-6A\'s original constitutional defect',
    discharges: false,
  };
}
