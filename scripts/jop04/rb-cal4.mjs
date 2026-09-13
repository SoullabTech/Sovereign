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
      cal4d: unmet('RB-CAL-4d', 'reload stress — N fresh router instances'),
    };
  }

  // ── HOST-SHAPED LOADING, exactly as jarvis-desktop/src/main.js does ───────
  //    router cache-busted; eligibility INDEPENDENTLY cache-busted.
  const hostRouter = await import(url(subjectDir, ROUTER_REL, true));
  const hostMinted = hostElig.declareRoutingEligibility({
    satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-host-shaped',
  });
  const crossDecision = hostRouter.route({ capability: CAPABILITY }, hostMinted);

  const cal4a = {
    id: 'RB-CAL-4a',
    label: 'a legitimately minted object survives the production loading path',
    observed: accepted(crossDecision) ? 'GREEN' : 'RED',
    precondition: {
      requirement: 'REQUIRED', state: 'REACHED',
      evidence: {
        loading_discipline: 'PRODUCTION-SHAPED — router cache-busted, eligibility INDEPENDENTLY cache-busted',
        mirrors: 'jarvis-desktop/src/main.js submit-task',
        minted_by: 'host-shaped cache-busted eligibility instance',
        tested_by: "the instance router.mjs's static import resolves to",
      },
      provenance: 'two independent dynamic imports, as the host performs them',
    },
    evidence: { lane: crossDecision.execution_lane, status: crossDecision.status, reason: crossDecision.reason },
    note: accepted(crossDecision)
      ? 'a legitimately minted object crossed the production loading path and was recognized'
      : '🔴 a LEGITIMATELY minted object was refused because producer and consumer hold different identity lineages',
  };

  // ── SAME-LINEAGE POSITIVE CONTROL — the brand itself works ────────────────
  const lineageElig = await import(url(subjectDir, ELIG_REL, false)); // the instance router resolves to
  const sameMinted = lineageElig.declareRoutingEligibility({
    satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-same-lineage',
  });
  const sameDecision = hostRouter.route({ capability: CAPABILITY }, sameMinted);
  const cal4b = {
    id: 'RB-CAL-4b',
    label: 'same-lineage positive control — mint and test through one identity lineage',
    observed: accepted(sameDecision) ? 'GREEN' : 'RED',
    precondition: { requirement: 'REQUIRED', state: 'REACHED',
      evidence: { lineage: 'unqueried module URL — the one the router statically imports' },
      provenance: 'single identity lineage by construction' },
    evidence: { lane: sameDecision.execution_lane, status: sameDecision.status },
    note: accepted(sameDecision)
      ? '⭐ the brand mechanism itself works — the defect is lineage, not design'
      : 'the brand rejects even a same-lineage object — the mechanism itself is broken',
  };

  // ── FORGERY NEGATIVE CONTROL — identical VISIBLE fields, no lineage ───────
  const forged = { satisfied: true, basis: 'operator_submission', declared_by: 'rb-cal4-forgery', declared_at: new Date().toISOString() };
  const forgedDecision = hostRouter.route({ capability: CAPABILITY }, forged);
  const cal4c = {
    id: 'RB-CAL-4c',
    label: 'forgery negative control — a caller-shaped lookalike is refused',
    observed: accepted(forgedDecision) ? 'RED' : 'GREEN',
    precondition: { requirement: 'REQUIRED', state: 'REACHED',
      evidence: { forged_fields: Object.keys(forged), matches_visible_shape_of_legitimate_object: true },
      provenance: 'plain object literal carrying every visible field of a legitimate one' },
    evidence: { lane: forgedDecision.execution_lane, status: forgedDecision.status },
    note: accepted(forgedDecision)
      ? '🔴 an unbranded lookalike was accepted — unforgeability lost'
      : '⭐ unforgeability holds: identical visible fields are not identity',
  };

  // ── RELOAD STRESS — the host deliberately reloads routing code ────────────
  const N = 5;
  const reloads = [];
  for (let i = 0; i < N; i++) {
    const r = await import(url(subjectDir, ROUTER_REL, true));
    reloads.push({ i, accepted: accepted(r.route({ capability: CAPABILITY }, hostMinted)) });
  }
  const allAccept = reloads.every((r) => r.accepted);
  const cal4d = {
    id: 'RB-CAL-4d',
    label: 'reload stress — N fresh router instances all recognize the authoritative producer',
    observed: allAccept ? 'GREEN' : 'RED',
    precondition: { requirement: 'REQUIRED', state: 'REACHED',
      evidence: { fresh_router_instances: N, value_source: 'the producer the HOST obtains' },
      provenance: 'N independent cache-busted router imports, mirroring host reload behaviour' },
    evidence: { reloads, all_accept: allAccept },
    note: allAccept
      ? 'the repair survives host reload behaviour, not merely one startup'
      : '🔴 fresh router instances reject the value the host mints — the fracture is not a startup accident',
  };

  return { cal4a, cal4b, cal4c, cal4d };
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
    uses_global_symbol_registry: /Symbol\.for\s*\(/.test(src),
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
    router_calls_producer: /declareRoutingEligibility\s*\(/.test(src),
    evidence_class: 'STRUCTURAL (supplementary; ⛔ discharges nothing)',
    law: 'the router may make the producer AVAILABLE to the trusted host; it may never mint from facts it derives itself — that would repair the lineage fracture while reintroducing RB-6A\'s original constitutional defect',
    discharges: false,
  };
}
