/**
 * The canonical turn constructor — CMT-01, Step 2 → 3b. SHADOW ONLY.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4, §4.1, §7
 *
 * ── WHAT THIS IS ────────────────────────────────────────────────────────────
 *
 * The one place a member turn is assembled — and, until authoritative cutover
 * (§11 step 5), a place with NO response-producing caller. It constructs a
 * typed bundle and a Participation Manifest and hands them back. It does not
 * invoke cognition.
 *
 * ── WHAT IT OWNS ────────────────────────────────────────────────────────────
 *
 *   WHICH providers are invited      ← by profile, subtractive, IN PROFILE ORDER
 *           ↓
 *   candidate acquisition            ← providers, frame only
 *           ↓
 *   MIPA adjudication                ← the SHARED gate; verdicts carried, never upgraded
 *           ↓
 *   composition                      ← the SAME certified formatters the legacy path uses
 *           ↓
 *   participation evidence           ← the manifest
 *
 * ── WHY COMPOSITION USES THE LEGACY FORMATTERS (Step 3b) ────────────────────
 *
 * Step 2 composed raw candidate bodies. That could never be compared with the
 * legacy path, which composes FORMATTED prompt blocks — the shadow comparator's
 * block digests could not agree by construction. Composition here now means:
 * the certified formatter for that domain, applied to the admitted material,
 * in the profile's declared order. The formatter is the same function legacy
 * calls; only who calls it moved. That is what makes a zero-diff on block
 * digests a statement about construction rather than luck.
 *
 * Sanctuary is honoured HERE: a sanctuary frame invokes no member-scoped
 * provider and the manifest records every one as held.
 */

import { adjudicateParticipation } from '../participationGate';
import type { ExclusionReason, AuthoredBy, AuthorityClass } from '../participationGate';
import { formatAtomsForPrompt, type MemoryAtomSnapshot } from '../memoryAtomsLoader';
import { formatPriorExchangesForPrompt, computeLastPriorSessionMinutesAgo } from '../conversationalRecallBlock';
import { formatMarkedEpisodesForPrompt } from '../episodicRecallBlock';
import { buildMemoryInfluencePlan } from '../memoryOrchestrator';
import { formatMemberWebForPrompt, type CertifiedMemberWeb } from '@/lib/memory/MemberLiveContext';
import { formatRelationshipMemoryForPrompt, type CertifiedRelationshipMemory } from '@/lib/memory/RelationshipMemoryService';
import type { PriorExchangeSnapshot, MarkedEpisodeSnapshot } from '../memoryLoaders';
import type { DevelopmentalMemorySnapshot, ThemeSignalSnapshot } from '../types/memoryOrchestrator';

import { __brandCanonicalTurn, type CanonicalTurn } from './invocation';
import {
  STAGE1_PROVIDER_REGISTRY,
  consentAllows,
  type TurnFrame,
  type ProviderId,
  type IntelligenceProvider,
  type Candidate,
} from './providers';
import { TURN_PROFILES } from './profiles';
import { idPrefix, type ParticipationManifest, type ProviderManifestEntry } from './manifest';

export const POLICY_VERSION = 'mipa-phase0-closed-2026-09-03';
export const RUNTIME_CONTEXT_VERSION = 'cmt-01.step3b';

/** How a composed item earned its place. Auditable, never a body. */
export type AdmissionBasis =
  | { kind: 'canonical'; provenance: { authoredBy: AuthoredBy; authorityClass: AuthorityClass } }
  | { kind: 'upstream'; gate: string }
  | { kind: 'legacy_uncertified' };

export interface ComposedItem {
  id: string;
  basis: AdmissionBasis;
  body: unknown;
}

export interface ComposedSection {
  /** Admitted material, one item per admitted candidate. */
  items: readonly ComposedItem[];
  /** The formatted block, exactly as the certified formatter produced it. '' when it suppressed. */
  section: string;
  /** The formatter's own suppression verdict, when it withheld a block after admission. */
  suppressed?: string;
}

/**
 * Typed by provider. There is no `meta`; there is no string-keyed bag. A
 * provider absent from the profile is absent from the bundle — "not invited"
 * and "invited and found nothing" are different facts.
 */
export type CanonicalContextBundle = Readonly<Partial<Record<ProviderId, ComposedSection>>>;

export interface Adjudicated {
  admitted: ComposedItem[];
  excludedByReason: Partial<Record<ExclusionReason, number>>;
  admittedUpstream: number;
  admittedLegacyUncertified: number;
}

/**
 * Exported for certification. The `profileIsLegacy` guard on the
 * LEGACY_UNCERTIFIED arm is unreachable through the public constructor while
 * the canonical profile lists no providers, and a guard nothing reaches is not
 * certified (mutation K6).
 */
export function adjudicateCandidates(
  provider: IntelligenceProvider,
  candidates: readonly Candidate[],
  profileIsLegacy: boolean,
): Adjudicated {
  const out: Adjudicated = { admitted: [], excludedByReason: {}, admittedUpstream: 0, admittedLegacyUncertified: 0 };
  const exclude = (r: ExclusionReason) => { out.excludedByReason[r] = (out.excludedByReason[r] ?? 0) + 1; };
  for (const c of candidates) {
    const a = c.adjudication;
    if (a.kind === 'upstream') {
      if (a.verdict === 'excluded') exclude(a.reason ?? 'uncertified_provenance');
      else { out.admittedUpstream++; out.admitted.push({ id: c.id, basis: { kind: 'upstream', gate: a.gate }, body: c.body }); }
      continue;
    }
    if (a.kind === 'legacy_uncertified') {
      if (profileIsLegacy && provider.participationStatus === 'LEGACY_UNCERTIFIED') {
        out.admittedLegacyUncertified++;
        out.admitted.push({ id: c.id, basis: { kind: 'legacy_uncertified' }, body: c.body });
      } else exclude('uncertified_provenance');
      continue;
    }
    const v = adjudicateParticipation({ provenance: a.provenance, endorsement: a.endorsement });
    if (!v.admitted) exclude(v.reason);
    else out.admitted.push({ id: c.id, basis: { kind: 'canonical', provenance: v.provenance }, body: c.body });
  }
  return out;
}

// ── Composition — the certified formatters, applied by the constructor ───────

interface ComposeCtx {
  frame: TurnFrame;
  consent: Partial<Record<string, boolean>>;
  /** Admitted material of OTHER providers this turn (joint sections only). Never raw candidates. */
  admittedOf: (id: ProviderId) => readonly ComposedItem[];
}

type Composer = (admitted: readonly ComposedItem[], ctx: ComposeCtx) => { section: string; suppressed?: string };

const bodies = <T,>(items: readonly ComposedItem[]) => items.map((i) => i.body as T);
const suppression = (r: string | undefined) => (r && r !== 'empty' ? { suppressed: r } : {});

/**
 * One composer per provider that legacy composes into the prompt. A provider
 * with no composer contributes admitted items to the bundle and no block.
 */
const COMPOSERS: Partial<Record<ProviderId, Composer>> = {
  atoms: (admitted) => ({ section: formatAtomsForPrompt(bodies<MemoryAtomSnapshot>(admitted)) }),

  conversation: (admitted, ctx) => {
    const rows = bodies<PriorExchangeSnapshot>(admitted);
    const r = formatPriorExchangesForPrompt(rows, {
      recallEnabled: ctx.consent.conversational_recall_enabled ?? true,
      mode: ctx.frame.encounter.sanctuary ? 'Sanctuary' : null,
      currentSessionTurnCount: ctx.frame.encounter.sessionTurnCount ?? 0,
      lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(rows),
    });
    return { section: r.block, ...suppression(r.suppressedReason) };
  },

  episodes: (admitted, ctx) => {
    const r = formatMarkedEpisodesForPrompt(bodies<MarkedEpisodeSnapshot>(admitted), {
      recallEnabled: ctx.consent.episodic_recall_enabled ?? true,
      mode: ctx.frame.encounter.sanctuary ? 'Sanctuary' : null,
    });
    return { section: r.block, ...suppression(r.suppressedReason) };
  },

  // Legacy composes developmental + themes as ONE memory-influence block. The
  // joint section is keyed on `developmental`; `themes` contributes admitted
  // material without a block of its own — mirrored exactly in the legacy digest.
  developmental: (admitted, ctx) => {
    const plan = buildMemoryInfluencePlan({
      message: ctx.frame.encounter.input,
      userId: ctx.frame.identity.memberId,
      conversationHistory: [],
      recentDevelopmentalMemories: bodies<DevelopmentalMemorySnapshot>(admitted),
      recentThemeSignals: bodies<ThemeSignalSnapshot>(ctx.admittedOf('themes')),
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    return { section: plan.promptBlock || '' };
  },

  member_web: (admitted) => {
    const web = bodies<CertifiedMemberWeb>(admitted)[0];
    return { section: web ? formatMemberWebForPrompt(web) : '' };
  },

  relationship: (admitted) => {
    const m = bodies<CertifiedRelationshipMemory>(admitted)[0];
    return { section: m ? formatRelationshipMemoryForPrompt(m) : '' };
  },
};

// ── The constructor ──────────────────────────────────────────────────────────

export async function constructCanonicalTurn(frame: TurnFrame): Promise<CanonicalTurn> {
  const profile = TURN_PROFILES[frame.profile];
  const profileIsLegacy = profile.id !== 'canonical';
  const bundle: Partial<Record<ProviderId, ComposedSection>> = {};
  const provenanceClasses: ParticipationManifest['provenanceClasses'] = {};
  const consent: Partial<Record<string, boolean>> = {};
  const admittedById: Partial<Record<ProviderId, ComposedItem[]>> = {};

  // Profile order first — composition order is structure — then the rest of
  // the registry, held.
  const profileOrder = Object.keys(profile.providers) as ProviderId[];
  const rest = (Object.keys(STAGE1_PROVIDER_REGISTRY) as ProviderId[]).filter((id) => !profileOrder.includes(id));
  const order: ProviderId[] = [...profileOrder, ...rest];

  const blank = (id: ProviderId): ProviderManifestEntry => {
    const p = STAGE1_PROVIDER_REGISTRY[id];
    return {
      id, scope: p.scope, participationStatus: p.participationStatus, governedBy: p.governedBy,
      invoked: false, returned: 0, excluded: 0, excludedByReason: {}, admitted: 0,
      admittedUpstream: 0, admittedLegacyUncertified: 0, composed: 0, provenanceClasses: {},
    };
  };

  // Acquisition + adjudication, in parallel.
  const acquired = await Promise.all(
    order.map(async (id) => {
      const provider = STAGE1_PROVIDER_REGISTRY[id];
      const entry = blank(id);
      const params = profile.providers[id];
      if (!params) { entry.held = { reason: 'not_in_profile' }; return { entry, adj: null as Adjudicated | null }; }
      if (frame.encounter.sanctuary && provider.scope === 'member') { entry.held = { reason: 'sanctuary' }; return { entry, adj: null }; }
      if (provider.consentGate) {
        const allowed = await consentAllows(frame.identity.memberId, provider.consentGate);
        consent[provider.consentGate] = allowed;
        if (!allowed) { entry.held = { reason: 'consent_gate_off', gate: provider.consentGate }; return { entry, adj: null }; }
      }
      entry.invoked = true;
      const result = await provider.retrieve(frame, params);
      if (result.error) entry.error = result.error;
      entry.returned = result.candidates.length;
      const adj = adjudicateCandidates(provider, result.candidates, profileIsLegacy);
      entry.excludedByReason = adj.excludedByReason;
      entry.excluded = Object.values(adj.excludedByReason).reduce((a, b) => a + (b ?? 0), 0) + (result.excludedUpstream ?? 0);
      if (result.excludedUpstream) entry.excludedByReason.unendorsed_inference = (entry.excludedByReason.unendorsed_inference ?? 0) + result.excludedUpstream;
      entry.admitted = adj.admitted.length;
      entry.admittedUpstream = adj.admittedUpstream;
      entry.admittedLegacyUncertified = adj.admittedLegacyUncertified;
      admittedById[id] = adj.admitted;
      for (const item of adj.admitted) {
        if (item.basis.kind === 'canonical') {
          const k = `${item.basis.provenance.authoredBy}:${item.basis.provenance.authorityClass}` as const;
          provenanceClasses[k] = (provenanceClasses[k] ?? 0) + 1;
          entry.provenanceClasses[k] = (entry.provenanceClasses[k] ?? 0) + 1;
        }
      }
      return { entry, adj };
    }),
  );

  // Composition, sequentially in profile order — a joint section may read
  // another provider's ADMITTED material, never its raw candidates.
  const ctx: ComposeCtx = { frame, consent, admittedOf: (id) => admittedById[id] ?? [] };
  const entries: ProviderManifestEntry[] = [];
  for (const { entry, adj } of acquired) {
    if (adj && adj.admitted.length > 0) {
      const composer = COMPOSERS[entry.id];
      const out = composer ? composer(adj.admitted, ctx) : { section: '' };
      bundle[entry.id] = { items: adj.admitted, section: out.section, ...(out.suppressed ? { suppressed: out.suppressed } : {}) };
      entry.composed = out.section.length > 0 ? adj.admitted.length : 0;
      if (out.suppressed) entry.suppressed = out.suppressed;
    }
    entries.push(entry);
  }

  const manifest: ParticipationManifest = {
    version: 'cmt-01.manifest.v1',
    mode: 'shadow',
    identity: { memberIdPrefix: idPrefix(frame.identity.memberId), credentialPath: frame.identity.credentialPath },
    encounter: {
      sessionIdPrefix: idPrefix(frame.encounter.sessionId),
      mode: frame.encounter.mode, modality: frame.encounter.modality, sanctuary: frame.encounter.sanctuary,
    },
    profile: profile.id,
    policyVersion: POLICY_VERSION,
    runtimeContextVersion: RUNTIME_CONTEXT_VERSION,
    providers: entries,
    consent,
    provenanceClasses,
    cognition: { kind: 'MEMBER_TURN', invoked: false },
    constructedAt: new Date().toISOString(),
  };

  return __brandCanonicalTurn({ frame, bundle, manifest, policyVersion: POLICY_VERSION, runtimeContextVersion: RUNTIME_CONTEXT_VERSION });
}
