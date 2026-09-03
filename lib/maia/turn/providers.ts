/**
 * Governed intelligence providers — CMT-01, Step 2.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §3
 *
 * ── THE CONSTRUCTOR OWNS ORCHESTRATION; PROVIDERS OWN THEIR DOMAIN ──────────
 *
 *   route A retrieves intelligence X
 *   route C never retrieves intelligence X
 *           ↓
 *   same admission policy
 *           ↓
 *   still different MAIAs
 *
 * One judge with three different people deciding what evidence the judge ever
 * sees is still three MAIAs. So WHICH providers are invited is the
 * constructor's decision (by profile), and each provider does exactly one
 * thing: retrieve its own domain and hand back candidates. Providers do not
 * compose. They do not adjudicate. They do not read each other.
 *
 * ── STAGE 1 REGISTRY = WHAT ROUTES ALREADY INVOKE, AND NOTHING ELSE ─────────
 *
 * Every adapter below wraps an EXISTING loader that some supported member-turn
 * route calls today. No new provider. No P3-excluded intelligence restored. A
 * provider added to this registry later is a new intelligence source and needs
 * its own authorization.
 *
 * ── CHAIN OF CUSTODY, NOT A SECOND ADJUDICATION MODEL ───────────────────────
 *
 * Several loaders already return material adjudicated by a certified gate
 * (R24's discriminated unions, R25/R26/P3e inside MemoryBundle, R27's
 * certifyMemberWeb, P3f's breakthrough boundary). The provider does not
 * re-derive provenance it cannot see — that would be guessing — and it does
 * not discard a certified verdict either. It carries the verdict forward as
 * `{ kind: 'upstream', gate, verdict }`. The constructor honours an upstream
 * EXCLUDED unconditionally and an upstream ADMITTED only from a named certified
 * gate. Nothing is upgraded on the way through.
 *
 * Where no gate has spoken and the loader's write-path evidence establishes
 * authorship (P1b), the candidate carries a canonical provenance claim and the
 * shared `adjudicateParticipation` decides. Where neither holds, the provider is
 * `LEGACY_UNCERTIFIED` and says so: no epistemic class is invented to satisfy
 * the manifest.
 *
 * ── SCOPE IS DECLARED, AND IT IS WHAT KEEPS A PROBE FROM BECOMING A PERSON ──
 *
 * Every provider here is `member`-scoped. The probe arm's selector is typed
 * over `probe_safe` providers only, so a member provider is unselectable for a
 * probe at the type level — not merely absent from a list a future caller
 * could extend.
 */

import type {
  ProvenanceClaim,
  EndorsementState,
  ExclusionReason,
} from '../participationGate';
import type { CertifiedGate } from '../sovereignDisposition';
import type { ConsentGateName } from '../consentGates';
import { readConsentGate } from '../consentGates';

import { loadMemberMemoryAtomsForPrompt } from '../memoryAtomsLoader';
import {
  loadPriorCrossSessionExchanges,
  loadRecentMarkedEpisodes,
  loadRecentDevelopmentalMemories,
  loadRecentThemeSignals,
} from '../memoryLoaders';
import { loadRelationshipMemory, certifyRelationshipMemory } from '@/lib/memory/RelationshipMemoryService';
import { loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesis';
import { buildMemberLiveContext, certifyMemberWeb } from '@/lib/memory/MemberLiveContext';
import { loadRecentAnchors } from '@/lib/anchor/loadRecentAnchors';
import { loadSignificantMoments } from '@/lib/memory/SignificantMomentsService';
import { admittedBreakthroughs } from '@/lib/memory/breakthroughParticipation';
import { MemoryBundleService } from '@/lib/memory/MemoryBundle';
import { loadSelfletContext } from '@/lib/memory/selflet/SelfletIntegration';
import { retrieveForMode } from '@/lib/ain/knowledge/RetrievalService';
import { memoryOrchestrator } from '@/lib/memory/MemoryOrchestrator';

import type { ProviderParams } from './profiles';

// ── Vocabulary ───────────────────────────────────────────────────────────────

export type ProviderId =
  | 'conversation'
  | 'atoms'
  | 'episodes'
  | 'relationship'
  | 'relationship_essence'
  | 'developmental'
  | 'themes'
  | 'memory_bundle'
  | 'member_web'
  | 'significant_moments'
  | 'selflet'
  | 'session_recall'
  | 'anchors'
  | 'ain_knowledge';

export type ProviderScope = 'member' | 'probe_safe';

/** `certified` or marked. Never an invented class. */
export type ParticipationStatus = 'certified' | 'LEGACY_UNCERTIFIED';

/** Gates that may vouch for an upstream verdict. Named, not inferred. */
export type UpstreamGate = CertifiedGate | 'P2' | 'P3f' | 'P6' | 'R08' | 'R04';

export type CandidateAdjudication =
  /** No gate has spoken; the constructor runs the shared adjudicator. */
  | { kind: 'canonical'; provenance: ProvenanceClaim; endorsement: EndorsementState }
  /** A certified gate already decided; the verdict is carried, never upgraded. */
  | { kind: 'upstream'; gate: UpstreamGate; verdict: 'admitted' | 'excluded'; reason?: ExclusionReason }
  /** Composable ONLY under a legacy profile that lists an uncertified provider. */
  | { kind: 'legacy_uncertified' };

export interface Candidate {
  id: string;
  adjudication: CandidateAdjudication;
  /** Domain material. Opaque to the constructor; never logged. */
  body: unknown;
}

export interface ProviderResult {
  candidates: readonly Candidate[];
  /** Failure is reported, never rendered as absence. */
  error?: string;
}

export interface ResolvedMemberIdentity {
  memberId: string;
  /** Which credential path resolved it — recorded, never the credential. */
  credentialPath: 'session_cookie' | 'x_member_id' | 'bearer' | 'unknown';
}

export interface PresentEncounter {
  sessionId: string | null;
  input: string;
  mode: 'talk' | 'care' | 'note' | 'between' | string;
  modality: 'text' | 'voice';
  sanctuary: boolean;
}

export interface SurfaceDescriptor {
  surface: 'desktop' | 'pwa' | 'ios' | 'embedded' | 'unknown';
}

/** What a provider receives. Identity and present encounter — never another provider's output, never a meta bag. */
export interface TurnFrame {
  identity: ResolvedMemberIdentity;
  encounter: PresentEncounter;
  surface: SurfaceDescriptor;
  profile: import('./profiles').ProfileId;
}

export interface IntelligenceProvider {
  readonly id: ProviderId;
  readonly scope: ProviderScope;
  readonly participationStatus: ParticipationStatus;
  /** The gate(s) that govern this domain — recorded here, implemented upstream. */
  readonly governedBy: readonly UpstreamGate[];
  /** Consent gate the constructor reads before invoking; the provider never reads it itself. */
  readonly consentGate?: ConsentGateName;
  /** The write-path evidence behind any canonical provenance claim this provider makes. */
  readonly provenanceBasis: string;
  retrieve(frame: TurnFrame, params: ProviderParams): Promise<ProviderResult>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function failed(err: unknown): ProviderResult {
  return { candidates: [], error: err instanceof Error ? err.message : String(err) };
}

const memberTestimony: CandidateAdjudication = {
  kind: 'canonical',
  provenance: { authoredBy: 'member', authorityClass: 'testimony' },
  endorsement: 'none',
};
const memberAct: CandidateAdjudication = {
  kind: 'canonical',
  provenance: { authoredBy: 'member', authorityClass: 'member_act' },
  endorsement: 'none',
};
const maiaInference: CandidateAdjudication = {
  kind: 'canonical',
  provenance: { authoredBy: 'maia', authorityClass: 'inference' },
  endorsement: 'none',
};

// ── The Stage 1 registry ─────────────────────────────────────────────────────

const conversation: IntelligenceProvider = {
  id: 'conversation',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P2'],
  consentGate: 'conversational_recall_enabled',
  provenanceBasis:
    'conversation_turns: TurnsStore writes verbatim utterances; role discriminates member from MAIA (P1b). Prior MAIA turns are carried under the P2-gated Phase 2 conversational block, which composes verbatim exchanges of BOTH roles by ratified default; the class of MAIA\'s own prior words is a Stage 2 adjudication item, not invented here.',
  async retrieve(frame, params) {
    try {
      const rows = await loadPriorCrossSessionExchanges(
        frame.identity.memberId,
        frame.encounter.sessionId,
        params.limit ?? 6,
      );
      return {
        candidates: rows.map((r, i) => ({
          id: `${r.session_id}:${i}`,
          adjudication:
            r.role === 'user'
              ? memberTestimony
              : { kind: 'upstream', gate: 'P2', verdict: 'admitted' },
          body: r,
        })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const atoms: IntelligenceProvider = {
  id: 'atoms',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P6', 'R04'],
  provenanceBasis:
    'member_memory_atoms: Keep gesture writes member_act rows; practitioner_observation rows are attributed and epistemically framed (P1b). return_preference and the practitioner attribution guard are applied inside the loader (P6, R04).',
  async retrieve(frame, params) {
    try {
      const rows = await loadMemberMemoryAtomsForPrompt(frame.identity.memberId, params.limit ?? 8);
      return {
        candidates: rows.map((a) => ({
          id: a.id,
          adjudication:
            a.sourceType === 'practitioner_observation'
              ? {
                  kind: 'canonical',
                  provenance: { authoredBy: 'practitioner', authorityClass: 'observation' },
                  endorsement: 'none',
                }
              : memberAct,
          body: a,
        })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const episodes: IntelligenceProvider = {
  id: 'episodes',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P2'],
  consentGate: 'episodic_recall_enabled',
  provenanceBasis:
    'episodic_memories: Mark gesture; only marked_by_member rows with verbatim_text are loader-eligible (P1b, R18).',
  async retrieve(frame, params) {
    try {
      const rows = await loadRecentMarkedEpisodes(frame.identity.memberId, params.limit ?? 5);
      return {
        candidates: rows.map((e) => ({ id: e.episode_id, adjudication: memberTestimony, body: e })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const relationship: IntelligenceProvider = {
  id: 'relationship',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P1c', 'P3f'],
  provenanceBasis:
    'certifyRelationshipMemory (P1c) partitions themes/breakthroughs/patterns out and keeps the recurrence summary, itself adjudicated as a derivation over member testimony; breakthrough rows cross the P3f boundary before the summary is built.',
  async retrieve(frame, params) {
    try {
      const ctx = await loadRelationshipMemory(frame.identity.memberId, {
        maxThemes: params.maxThemes,
        maxBreakthroughs: params.maxBreakthroughs,
        includePatterns: params.includePatterns,
      });
      const certified = certifyRelationshipMemory(ctx);
      return {
        candidates: certified.summary
          ? [{ id: 'relationship:summary', adjudication: { kind: 'upstream', gate: 'P1c', verdict: 'admitted' }, body: certified }]
          : [],
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const relationshipEssence: IntelligenceProvider = {
  id: 'relationship_essence',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P1c'],
  provenanceBasis:
    'relationship_essences: machine-composed essence of the relationship (P1b SYSTEM; P1c EXPORT + INSPECT). MAIA-authored inference, unendorsed.',
  async retrieve(frame) {
    try {
      const essence = await loadRelationshipEssence(frame.identity.memberId);
      return {
        candidates: essence ? [{ id: 'relationship:essence', adjudication: maiaInference, body: essence }] : [],
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const developmental: IntelligenceProvider = {
  id: 'developmental',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['R24'],
  provenanceBasis:
    'developmental_memories: MemoryWriteback distils an LLM signal; no authorship column (P1b). The loader returns a discriminated union already adjudicated by R24; the verdict is carried, not re-derived.',
  async retrieve(frame, params) {
    try {
      const rows = await loadRecentDevelopmentalMemories(frame.identity.memberId, params.limit ?? 3);
      return {
        candidates: rows.map((r, i) => ({
          id: `developmental:${i}`,
          adjudication:
            r.participation === 'admitted'
              ? { kind: 'upstream', gate: 'R24', verdict: 'admitted' }
              : { kind: 'upstream', gate: 'R24', verdict: 'excluded', reason: r.exclusionReason },
          body: r,
        })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const themes: IntelligenceProvider = {
  id: 'themes',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['R24'],
  provenanceBasis:
    'member_theme_signals: automatic per-turn scored inference (P1b). Loader returns an R24-adjudicated union; verdict carried.',
  async retrieve(frame, params) {
    try {
      const rows = await loadRecentThemeSignals(frame.identity.memberId, params.limit ?? 10);
      return {
        candidates: rows.map((r, i) => ({
          id: `theme:${i}`,
          adjudication:
            r.participation === 'admitted'
              ? { kind: 'upstream', gate: 'R24', verdict: 'admitted' }
              : { kind: 'upstream', gate: 'R24', verdict: 'excluded', reason: r.exclusionReason },
          body: r,
        })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const memoryBundle: IntelligenceProvider = {
  id: 'memory_bundle',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['R25', 'R26', 'P3e', 'P3f'],
  provenanceBasis:
    'MemoryBundleService.build composes only admitted material: breakthroughs through the P3f boundary (R25), developmental rows through R26, the continuity summary through P3e. Bullets carry no provenance of their own; the bundle\'s certified gates vouch for them upstream.',
  async retrieve(frame, params) {
    try {
      const bundle = await MemoryBundleService.build({
        userId: frame.identity.memberId,
        currentInput: frame.encounter.input,
        sessionId: frame.encounter.sessionId ?? undefined,
        maxBullets: params.maxBullets ?? 5,
      });
      const candidates: Candidate[] = bundle.memoryBullets.map((b, i) => ({
        id: b.id ?? `bullet:${i}`,
        adjudication: { kind: 'upstream', gate: 'R25', verdict: 'admitted' },
        body: b,
      }));
      if (bundle.recentContinuity) {
        candidates.push({
          id: 'bundle:continuity',
          adjudication: { kind: 'upstream', gate: 'P3e', verdict: 'admitted' },
          body: bundle.recentContinuity,
        });
      }
      return { candidates };
    } catch (e) {
      return failed(e);
    }
  },
};

const memberWeb: IntelligenceProvider = {
  id: 'member_web',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['R27'],
  provenanceBasis:
    'certifyMemberWeb (R27): only the member\'s journal survives; patterns, session essences, themes and field state are partitioned out. Verdict carried.',
  async retrieve(frame) {
    try {
      const ctx = await buildMemberLiveContext(frame.identity.memberId);
      const web = certifyMemberWeb(ctx);
      return {
        candidates: web.journal.map((j, i) => ({
          id: `journal:${i}`,
          adjudication: { kind: 'upstream', gate: 'R27', verdict: 'admitted' },
          body: j,
        })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const significantMoments: IntelligenceProvider = {
  id: 'significant_moments',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P3f'],
  provenanceBasis:
    'captures and journals are member-supplied text (P1b canonical); breakthroughs cross the P3f boundary and only admitted ones are carried.',
  async retrieve(frame, params) {
    try {
      const m = await loadSignificantMoments(frame.identity.memberId, {
        maxBreakthroughs: params.maxBreakthroughs ?? 10,
      });
      const candidates: Candidate[] = [
        ...m.captures.map((c, i) => ({ id: `capture:${i}`, adjudication: memberTestimony, body: c })),
        ...m.journals.map((j, i) => ({ id: `sm-journal:${i}`, adjudication: memberTestimony, body: j })),
        ...admittedBreakthroughs(m.breakthroughs).map((b) => ({
          id: `breakthrough:${b.id}`,
          adjudication: { kind: 'upstream' as const, gate: 'P3f' as const, verdict: 'admitted' as const },
          body: b,
        })),
        ...m.breakthroughs
          .filter((b) => b.participation === 'excluded')
          .map((b) => ({
            id: `breakthrough:${b.id}`,
            adjudication: {
              kind: 'upstream' as const,
              gate: 'P3f' as const,
              verdict: 'excluded' as const,
              reason: b.participation === 'excluded' ? b.exclusionReason : undefined,
            },
            body: null,
          })),
      ];
      return { candidates };
    } catch (e) {
      return failed(e);
    }
  },
};

const selflet: IntelligenceProvider = {
  id: 'selflet',
  scope: 'member',
  participationStatus: 'LEGACY_UNCERTIFIED',
  governedBy: [],
  provenanceBasis:
    'selflet_* tables are UNKNOWN in the P1b corpus: SelfletChain writes them and no source evidence establishes who authors the content. No class is inferred. Composable under legacy profile C only, marked, never PROMOTED until independently certified.',
  async retrieve(frame) {
    try {
      const r = await loadSelfletContext(frame.identity.memberId, undefined, frame.encounter.input);
      return {
        candidates: r.promptInjection
          ? [{ id: 'selflet:injection', adjudication: { kind: 'legacy_uncertified' }, body: r.promptInjection }]
          : [],
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const sessionRecall: IntelligenceProvider = {
  id: 'session_recall',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['P3f'],
  provenanceBasis:
    'MemoryOrchestrator.getSessionRecallContext: recentTurns are verbatim conversation_turns (role-discriminated); recentBreakthroughs cross P3f; relationshipContext is user_relationship_context — MAIA-maintained inference (P1b SYSTEM, P1c EXPORT) with no certified participation gate. It is carried as canonical maia/inference and will be EXCLUDED by the shared adjudicator; legacy composes it as a RELATIONSHIP CONTEXT block. That is an EXPECTED SHADOW DIFF and a Stage 2 adjudication item.',
  async retrieve(frame) {
    try {
      const recall = await memoryOrchestrator.getSessionRecallContext(frame.identity.memberId);
      const candidates: Candidate[] = [];
      for (const [i, t] of (recall.recentTurns ?? []).entries()) {
        candidates.push({
          id: `recall-turn:${i}`,
          adjudication: t.role === 'user' ? memberTestimony : { kind: 'upstream', gate: 'P2', verdict: 'admitted' },
          body: t,
        });
      }
      for (const b of admittedBreakthroughs(recall.recentBreakthroughs ?? [])) {
        candidates.push({ id: `recall-bt:${b.id}`, adjudication: { kind: 'upstream', gate: 'P3f', verdict: 'admitted' }, body: b });
      }
      if (recall.relationshipContext) {
        candidates.push({ id: 'recall:relationship_context', adjudication: maiaInference, body: recall.relationshipContext });
      }
      return { candidates };
    } catch (e) {
      return failed(e);
    }
  },
};

const anchors: IntelligenceProvider = {
  id: 'anchors',
  scope: 'member',
  participationStatus: 'certified',
  governedBy: ['R08'],
  provenanceBasis:
    'member_daily_anchors: `response` is the member\'s own words, `prompt_shown` is system-authored (P1b field-mixed). The loader applies surface_preference (R08). Only `response` is carried, as testimony.',
  async retrieve(frame, params) {
    try {
      const rows = await loadRecentAnchors(frame.identity.memberId, params.limit ?? 3);
      return {
        candidates: rows.map((a) => ({ id: `anchor:${a.date}`, adjudication: memberTestimony, body: { date: a.date, response: a.response } })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

const ainKnowledge: IntelligenceProvider = {
  id: 'ain_knowledge',
  scope: 'member',
  participationStatus: 'LEGACY_UNCERTIFIED',
  governedBy: [],
  provenanceBasis:
    'AIN knowledge retrieval is not member-about material and has no adjudicated provenance class in this programme. Not inferred. Composable under legacy profile C only, marked, never PROMOTED until independently certified.',
  async retrieve(frame) {
    try {
      const rows = await retrieveForMode(frame.encounter.input, frame.encounter.mode);
      return {
        candidates: rows.map((r) => ({ id: r.chunkId, adjudication: { kind: 'legacy_uncertified' }, body: r })),
      };
    } catch (e) {
      return failed(e);
    }
  },
};

export const STAGE1_PROVIDER_REGISTRY: Readonly<Record<ProviderId, IntelligenceProvider>> = {
  conversation,
  atoms,
  episodes,
  relationship,
  relationship_essence: relationshipEssence,
  developmental,
  themes,
  memory_bundle: memoryBundle,
  member_web: memberWeb,
  significant_moments: significantMoments,
  selflet,
  session_recall: sessionRecall,
  anchors,
  ain_knowledge: ainKnowledge,
};

/** Providers a SYSTEM_COGNITION_PROBE may select. Typed over scope, not over a list a caller could extend. */
export type ProbeSafeProvider = IntelligenceProvider & { readonly scope: 'probe_safe' };

export function probeSafeProviders(): ProbeSafeProvider[] {
  return Object.values(STAGE1_PROVIDER_REGISTRY).filter(
    (p): p is ProbeSafeProvider => p.scope === 'probe_safe',
  );
}

/** The consent read is the constructor's, not the provider's — one reader, P2. */
export async function consentAllows(memberId: string, gate: ConsentGateName): Promise<boolean> {
  return readConsentGate(memberId, gate);
}
