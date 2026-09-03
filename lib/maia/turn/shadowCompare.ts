/**
 * Shadow comparator — CMT-01, Step 3b.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4.1
 *
 * ── WHAT IS COMPARED, AND WHAT IS DELIBERATELY NOT ──────────────────────────
 *
 * Both sides are reduced to ONE shape, `AssemblyDigest`:
 *
 *     providers invoked / held (with reason) · returned · admitted · excluded by reason
 *     formatter suppression, when a block was withheld after admission
 *     provenance / authorship classes
 *     sovereignty gates: sanctuary, cross-session, every consent gate READ
 *     composed sections keyed by provider, each with a body digest and item count
 *     composed ORDER, over the providers both sides can observe
 *     floor digest (ordered section digests) · field digest (everything above)
 *     provider failures — visible as FAILURES, never as "returned nothing"
 *     capability profile
 *
 * Deliberately excluded: turn id, timestamps, and any other intentionally
 * unique observation metadata. Those live under `observation` and are never
 * digested. Model prose is not compared.
 *
 * ── THE INSTRUMENT IS ITSELF UNDER THE META-INVARIANT ───────────────────────
 *
 * A zero-diff that has not first been shown capable of becoming nonzero is not
 * evidence. The certification suite proves: equal → zero; withheld provider →
 * nonzero; changed disposition → nonzero; changed body → digest difference;
 * observation-only → still zero; restoration → zero again.
 */

import { createHash } from 'crypto';
import type { CanonicalTurn } from './invocation';
import { STAGE1_PROVIDER_REGISTRY, type ProviderId } from './providers';
import type { ExclusionReason } from '../participationGate';

export type DigestSide = 'legacy' | 'canonical';

export type HeldReasonDigest =
  | 'sanctuary'
  | 'consent_gate_off'
  | 'not_in_profile'
  /** Assembled inside cognition on this side; the route-level digest cannot observe it. */
  | 'unobserved:below_seam';

export interface ProviderDigest {
  invoked: boolean;
  held?: HeldReasonDigest;
  returned: number;
  admitted: number;
  excluded: number;
  excludedByReason: Partial<Record<ExclusionReason | string, number>>;
  /** authored_by × authority_class over this provider's admitted material — per provider, so an unobservable provider cannot contaminate an aggregate. */
  classes: Partial<Record<string, number>>;
  /** The certified formatter withheld the block after admission. Same vocabulary on both sides. */
  suppressed?: string;
  /** Present only when the provider FAILED. Absent ≠ empty; that distinction is load-bearing. */
  error?: string;
}

export interface SectionDigest {
  /** sha256 of the normalised composed block. Never the block. */
  digest: string;
  items: number;
}

export interface AssemblyDigest {
  side: DigestSide;
  profile: string;
  gates: {
    sanctuary: boolean;
    crossSessionAllowed: boolean;
    consent: Partial<Record<string, boolean>>;
  };
  providers: Partial<Record<ProviderId, ProviderDigest>>;
  /** Keyed by provider so a divergence names the section, not a position. */
  sections: Partial<Record<ProviderId, SectionDigest>>;
  /** Composition order over the providers that composed. Order is structure. */
  sectionOrder: ProviderId[];
  floorDigest: string;
  fieldDigest: string;
  /** Excluded from comparison by construction. */
  observation: Record<string, string | number | boolean | null | undefined>;
}

export function sha(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

/** Blocks are digested after whitespace normalisation, so formatting is not structure. */
export function bodyDigest(body: unknown): string {
  const text = typeof body === 'string' ? body : JSON.stringify(body ?? null);
  return sha(text.replace(/\s+/g, ' ').trim());
}

export function floorDigestOf(order: readonly ProviderId[], sections: AssemblyDigest['sections']): string {
  return sha(order.map((p) => `${p}:${sections[p]?.digest}:${sections[p]?.items}`).join('|'));
}

export function fieldDigestOf(d: Omit<AssemblyDigest, 'fieldDigest' | 'observation' | 'side'>): string {
  const sorted = <T,>(o: Partial<Record<string, T>>) => Object.keys(o).sort().map((k) => [k, o[k]]);
  return sha(JSON.stringify({
    profile: d.profile,
    gates: { sanctuary: d.gates.sanctuary, crossSessionAllowed: d.gates.crossSessionAllowed, consent: sorted(d.gates.consent) },
    providers: sorted(d.providers),
    sections: sorted(d.sections),
    order: d.sectionOrder,
    floor: d.floorDigest,
  }));
}

/** Every registry provider, so an absent row on one side is never mistaken for a held row on the other. */
export const ALL_PROVIDERS = Object.keys(STAGE1_PROVIDER_REGISTRY) as ProviderId[];

/** Reduce a CanonicalTurn to the comparable shape. */
export function digestFromCanonicalTurn(turn: CanonicalTurn): AssemblyDigest {
  const providers: AssemblyDigest['providers'] = {};
  for (const p of turn.manifest.providers) {
    providers[p.id] = {
      invoked: p.invoked,
      ...(p.held ? { held: p.held.reason as HeldReasonDigest } : {}),
      returned: p.returned,
      admitted: p.admitted,
      excluded: p.excluded,
      excludedByReason: p.excludedByReason,
      classes: p.provenanceClasses,
      ...(p.suppressed ? { suppressed: p.suppressed } : {}),
      ...(p.error ? { error: p.error } : {}),
    };
  }
  const sections: AssemblyDigest['sections'] = {};
  const sectionOrder: ProviderId[] = [];
  for (const p of turn.manifest.providers) {
    const s = turn.bundle[p.id];
    if (s && s.section.length > 0) {
      sections[p.id] = { digest: bodyDigest(s.section), items: s.items.length };
      sectionOrder.push(p.id);
    }
  }
  const partial = {
    profile: turn.manifest.profile,
    gates: {
      sanctuary: turn.manifest.encounter.sanctuary,
      crossSessionAllowed: !turn.manifest.encounter.sanctuary,
      consent: turn.manifest.consent,
    },
    providers,
    sections,
    sectionOrder,
    floorDigest: floorDigestOf(sectionOrder, sections),
  };
  return {
    side: 'canonical',
    ...partial,
    fieldDigest: fieldDigestOf(partial),
    observation: {
      constructedAt: turn.manifest.constructedAt,
      runtimeContextVersion: turn.runtimeContextVersion,
      policyVersion: turn.policyVersion,
    },
  };
}

// ── Comparison ───────────────────────────────────────────────────────────────

export interface Divergence {
  path: string;
  legacy: unknown;
  canonical: unknown;
  /** Named in advance — reported every time, not counted as a defect. */
  expected?: string;
}

export interface ShadowComparison {
  zeroDiff: boolean;
  unexpected: Divergence[];
  expected: Divergence[];
  fieldDigests: { legacy: string; canonical: string };
  floorDigests: { legacy: string; canonical: string };
  /** Providers one side cannot observe; excluded from ORDER comparison, reported under the expected rule. */
  unobservable: ProviderId[];
}

/**
 * Divergences documented in advance. A matching path is still REPORTED on
 * every comparison; it simply does not count against zero-diff. Anything not
 * listed is unexpected by definition.
 */
export const EXPECTED_DIVERGENCES: ReadonlyArray<{ path: RegExp; reason: string }> = [
  {
    path: /^(providers|sections)\.(relationship|session_recall)(\.|$)/,
    reason:
      'assembled INSIDE getMaiaResponse on the legacy side (lib/sovereign/maiaService.ts:748, :895) — below the seam, unobservable from the route; carried in profile A on the canonical side by the constructor\'s own read-only retrieval',
  },
];

type Leaf = string | number | boolean | null | undefined;
function flat(o: unknown, prefix = '', out: Record<string, Leaf> = {}): Record<string, Leaf> {
  if (o === null || typeof o !== 'object') { out[prefix] = o as Leaf; return out; }
  if (Array.isArray(o)) { out[`${prefix}.length`] = o.length; o.forEach((v, i) => flat(v, `${prefix}[${i}]`, out)); return out; }
  const obj = o as { [key: string]: unknown };
  for (const k of Object.keys(obj).sort()) flat(obj[k], prefix ? `${prefix}.${k}` : k, out);
  return out;
}

export function compareDigests(legacy: AssemblyDigest, canonical: AssemblyDigest): ShadowComparison {
  const unobservable = ALL_PROVIDERS.filter(
    (p) => legacy.providers[p]?.held === 'unobserved:below_seam' || canonical.providers[p]?.held === 'unobserved:below_seam',
  );
  // Order is compared over what BOTH sides can see. `observation`, `side` and
  // the derived digests are never walked as paths.
  const strip = (d: AssemblyDigest) => {
    const { observation: _o, side: _s, fieldDigest: _f, floorDigest: _fl, sectionOrder, ...rest } = d;
    return { ...rest, sectionOrder: sectionOrder.filter((p) => !unobservable.includes(p)) };
  };
  const L = flat(strip(legacy));
  const C = flat(strip(canonical));
  const unexpected: Divergence[] = [];
  const expected: Divergence[] = [];
  for (const p of [...new Set([...Object.keys(L), ...Object.keys(C)])].sort()) {
    if (JSON.stringify(L[p]) === JSON.stringify(C[p])) continue;
    const rule = EXPECTED_DIVERGENCES.find((r) => r.path.test(p));
    const d: Divergence = { path: p, legacy: L[p], canonical: C[p], ...(rule ? { expected: rule.reason } : {}) };
    (rule ? expected : unexpected).push(d);
  }
  // The comparable floor is the ordered section digests over what BOTH sides
  // can observe. Each side's own `floorDigest` (over its full order) is kept
  // on the digest for the record; comparing those directly would report the
  // below-seam sections as a difference the rule already documents.
  const comparableFloor = (d: AssemblyDigest) =>
    floorDigestOf(d.sectionOrder.filter((p) => !unobservable.includes(p)), d.sections);
  return {
    zeroDiff: unexpected.length === 0,
    unexpected,
    expected,
    fieldDigests: { legacy: legacy.fieldDigest, canonical: canonical.fieldDigest },
    floorDigests: { legacy: comparableFloor(legacy), canonical: comparableFloor(canonical) },
    unobservable,
  };
}
