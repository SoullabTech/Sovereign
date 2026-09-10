/**
 * S3 · P1 — FALSIFYING R1–R4 BEFORE ANY ROUTE IS WIRED.
 *
 *   ⭐⭐ instrument passes lawful reference + known-bad variant fails = evidence
 *
 * ⛔ THE LAWFUL REFERENCE HERE IS NOT THE ROUTE. The route repair is a later
 * authorized act; this reference exists so the red results below prove
 * discrimination rather than a suite that fails everything.
 */

import { runBodyGateObligations, failedObligations } from '../bodyGateObligations';
import type { AskBodyGate, EvidenceSlice } from '../bodyGateContract';

/* ── ✅ THE LAWFUL REFERENCE ───────────────────────────────────────────────── */

const lawful: AskBodyGate = async (input, d) => {
  /* 1 · The requirement is resolved WITHOUT prose. Nothing has been loaded. */
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };

  /* 2 · No present act → the lawful intermediate state. ⛔ Not an error, and
         ⛔ never the verification-failure shape. The loader stays unreachable. */
  if (input.authorizes.length === 0) {
    return { kind: 'BODY_AUTHORITY_REQUIRED', sections: input.requiredSections };
  }

  /* 3 · ALL-OR-NONE at the answer contract. */
  const outstanding = input.requiredSections.filter((s) => !input.authorizes.includes(s));
  if (outstanding.length > 0) return { kind: 'BODY_SCOPE_INCOMPLETE', outstanding };

  /* 4 · ⭐ The atomic claim PRECEDES the boundary. */
  const claim = await d.claim(input.pendingRef!);
  if (claim.kind === 'already_consumed') {
    return { kind: 'ALREADY_CONSUMED', completion: claim.completion };
  }

  /* 5 · One boundary per authorized section; any refusal ends the turn. */
  for (const section of input.authorizes) {
    if (await d.establishBoundary(section) !== 'may_cross') {
      return { kind: 'BODY_UNVERIFIABLE', refusal: 'boundary_unavailable' };
    }
  }

  /* 6 · Only now. W1 may be wider than W2 where integrity requires it. */
  const revision = await d.loadRevision();
  const recovered = await d.recover(revision);
  if (!Array.isArray(recovered)) {
    return { kind: 'BODY_UNVERIFIABLE', refusal: (recovered as { refusal: string }).refusal };
  }

  /* 7 · ⭐⭐ THE W2 FILTER — positive enforcement of the authority boundary, and
         NOT redundant bookkeeping. It must hold even where a downstream
         selection object erroneously names a section nobody authorized. */
  d.trace.push('filter');
  const disclosed: EvidenceSlice[] = (recovered as EvidenceSlice[])
    .filter((s) => input.authorizes.includes(s.sectionId));

  await d.cognition(disclosed);
  await d.confirmCrossing();
  return { kind: 'BODY_AUTHORIZED', disclosed };
};

/* ── ⛔ THE PROHIBITED VARIANTS ────────────────────────────────────────────── */

/** V-R1 · CANONICAL: no boundary anywhere; the revision is loaded regardless. */
const canonicalShaped: AskBodyGate = async (input, d) => {
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };
  const revision = await d.loadRevision();              // ⛔ unconditional
  const recovered = await d.recover(revision);
  if (!Array.isArray(recovered)) return { kind: 'BODY_UNVERIFIABLE', refusal: (recovered as { refusal: string }).refusal };
  await d.cognition(recovered as EvidenceSlice[]);
  return { kind: 'BODY_AUTHORIZED', disclosed: recovered as EvidenceSlice[] };
};

/** V-R2 · THE CHEAPEST REPAIR: withhold the load, pass null, report unverifiable. */
const nullAsUnverifiable: AskBodyGate = async (input, d) => {
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };
  if (input.authorizes.length === 0) {
    const recovered = await d.recover(null);            // ⛔ absence dressed as failure
    return { kind: 'BODY_UNVERIFIABLE', refusal: Array.isArray(recovered) ? 'revision_content_required' : recovered.refusal };
  }
  return lawful(input, d);
};

/** V-R3 · TRUSTS `required === authorized` and never filters. */
const trustsUpstream: AskBodyGate = async (input, d) => {
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };
  if (input.authorizes.length === 0) return { kind: 'BODY_AUTHORITY_REQUIRED', sections: input.requiredSections };
  const outstanding = input.requiredSections.filter((s) => !input.authorizes.includes(s));
  if (outstanding.length > 0) return { kind: 'BODY_SCOPE_INCOMPLETE', outstanding };
  const claim = await d.claim(input.pendingRef!);
  if (claim.kind === 'already_consumed') return { kind: 'ALREADY_CONSUMED', completion: claim.completion };
  for (const s of input.authorizes) await d.establishBoundary(s);
  const recovered = await d.recover(await d.loadRevision());
  if (!Array.isArray(recovered)) return { kind: 'BODY_UNVERIFIABLE', refusal: (recovered as { refusal: string }).refusal };
  await d.cognition(recovered as EvidenceSlice[]);      // ⛔ no filter
  await d.confirmCrossing();
  return { kind: 'BODY_AUTHORIZED', disclosed: recovered as EvidenceSlice[] };
};

/** V-R4 · Re-executes the disclosure on retry, then reports it as consumed. */
const reExecutesOnRetry: AskBodyGate = async (input, d) => {
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };
  if (input.authorizes.length === 0) return { kind: 'BODY_AUTHORITY_REQUIRED', sections: input.requiredSections };
  const outstanding = input.requiredSections.filter((s) => !input.authorizes.includes(s));
  if (outstanding.length > 0) return { kind: 'BODY_SCOPE_INCOMPLETE', outstanding };
  for (const s of input.authorizes) await d.establishBoundary(s);   // ⛔ before the claim
  const recovered = await d.recover(await d.loadRevision());
  const claim = await d.claim(input.pendingRef!);
  const disclosed = Array.isArray(recovered)
    ? (recovered as EvidenceSlice[]).filter((s) => input.authorizes.includes(s.sectionId)) : [];
  await d.cognition(disclosed);
  await d.confirmCrossing();
  if (claim.kind === 'already_consumed') return { kind: 'ALREADY_CONSUMED', completion: claim.completion };
  return { kind: 'BODY_AUTHORIZED', disclosed };
};

/** V-R0 · Silent degradation: answers anyway when body is required. */
const silentlyDegrades: AskBodyGate = async (input, d) => {
  if (!input.bodyRequired) return { kind: 'STRUCTURE_SUFFICIENT' };
  if (input.authorizes.length === 0) {
    await d.cognition([]);                              // ⛔ answers from the observation alone
    return { kind: 'STRUCTURE_SUFFICIENT' };
  }
  return lawful(input, d);
};

describe('S3 · P1 · R1–R4 route-level instruments', () => {
  it('⭐ DISCRIMINATES: the lawful reference passes every obligation', async () => {
    const results = await runBodyGateObligations(lawful);
    expect(results).toHaveLength(7);
    expect(failedObligations(results)).toEqual([]);
  });

  const variants: { name: string; gate: AskBodyGate; mustFail: string }[] = [
    { name: 'V-R1 · canonical: loads the revision with no authority', gate: canonicalShaped, mustFail: 'R1' },
    { name: 'V-R2 · routes absent authority into BODY_UNVERIFIABLE', gate: nullAsUnverifiable, mustFail: 'R2' },
    { name: 'V-R3 · trusts required === authorized and never filters W2', gate: trustsUpstream, mustFail: 'R3' },
    { name: 'V-R4 · re-executes the disclosure on retry', gate: reExecutesOnRetry, mustFail: 'R4' },
    { name: 'V-R0 · answers anyway when body is required', gate: silentlyDegrades, mustFail: 'R1' },
  ];

  it.each(variants)('⛔ $name → RED at $mustFail', async ({ gate, mustFail }) => {
    expect(failedObligations(await runBodyGateObligations(gate))).toContain(mustFail);
  });

  it('⛔ the canonical shape crosses authored characters it never had authority for', async () => {
    const results = await runBodyGateObligations(canonicalShaped);
    const r1 = results.find((r) => r.id === 'R1')!;
    expect(r1.ok).toBe(false);
    expect(r1.detail).toMatch(/slice\(s\) crossed/);
    expect(r1.detail).toMatch(/load/);
  });
});
