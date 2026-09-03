/**
 * CanonicalTurn — the closed structural object every MAIA turn is constructed as.
 *
 * Spec: docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md (§3.3, §4, §14 rulings)
 * Lane: CMT-01. Standing: M1 — types with zero live callers; M2 — shadow-constructed on /list.
 *
 * WHAT IS DELIBERATELY ABSENT — and must stay absent (G3):
 *   no index signature · no Record<string, unknown> · no field named meta / extra / context /
 *   addenda / raw. The absence is the architecture: cognition can read this object and can
 *   never extend it.
 *
 * Two objects kept distinct (spec §1):
 *   CanonicalTurn  = the boundary (this file)
 *   MIPA           = the rules for what may enter it (adjudicate.ts)
 */

import type { ProducerId } from './producerRegistry';
import type {
  AdmittedEntry, AdmittedReason, AuthoredBy, Authority, ExcludedEntry, ExcludedReason,
  HeldEntry, HeldReason, OfferedEntry, OfferedReason, ParticipationClass, ParticipationDisposition,
} from './participationDisposition';

// The participation vocabulary is the pdc-1 contract (participationDisposition.ts) — imported,
// never redeclared. Re-exported here so the turn's consumers have one import surface.
export type {
  AuthoredBy, Authority, ParticipationClass, ParticipationDisposition,
  HeldReason, OfferedReason, AdmittedReason, ExcludedReason,
};

export const CANONICAL_TURN_CONTRACT_VERSION = 'ct-1' as const;

// ── Identity (spec §4.1) ──────────────────────────────────────────────────────
// Produced ONLY by resolveCanonicalIdentity() (identity.ts). The verified id is
// branded so a plain string cannot be passed where a verified member is required;
// the runtime mint-set in identity.ts is the second lock (G4).

declare const VerifiedMemberIdBrand: unique symbol;
export type VerifiedMemberId = string & { readonly [VerifiedMemberIdBrand]: true };

export type MemberIdentity =
  | { readonly status: 'verified'; readonly memberId: VerifiedMemberId; readonly memberRef: string }
  | { readonly status: 'anonymous'; readonly anonRef: string }
  | { readonly status: 'guest'; readonly guestKey: string };

export type IdentityStatus = MemberIdentity['status'];

// ── Surface (spec §4.3 / §9) — allowed to differ; MIPA never branches on it ───
export interface SurfaceDescriptor {
  readonly modality: 'typed' | 'spoken';
  readonly client: 'web' | 'ios' | 'android' | 'desktop' | 'unknown';
  readonly transport: 'http' | 'sse';
  readonly streaming: boolean;
}

// ── Encounter (spec §4.2) ─────────────────────────────────────────────────────
export type RoomKind =
  | 'sovereign_chat'
  | 'between'
  | 'now_what'
  | 'vision_studio'
  | 'living_field'
  | 'relational_navigation';

export interface RoomPolicy {
  readonly kind: RoomKind;
  /** Whether the persistence layer may write this turn (Now What: false). */
  readonly persists: boolean;
  /** Whether member-about producers may be admitted at all in this room. */
  readonly memberAboutAllowed: boolean;
  /** Whether a practitioner field may be composed. */
  readonly fieldCompositionAllowed: boolean;
}

export interface PresentEncounter {
  readonly input: string;
  readonly sessionRef: string;
  readonly exchangeId?: string;
  readonly room: RoomPolicy;
}

// ── Sovereignty (spec §4.4) — resolved by the constructor, never passed by a route ─
export type MemoryMode = 'ephemeral' | 'continuity' | 'longterm';

export interface SovereigntyState {
  readonly sanctuary: boolean;
  readonly memoryMode: MemoryMode;
  readonly allowCrossSessionMemory: boolean;
  /**
   * Member recall preferences. `undefined` = not resolved at this seam (M2 shadow: the
   * serving route applied the preference upstream and the block is simply absent).
   */
  readonly recallPrefs?: { readonly conversational?: boolean; readonly episodic?: boolean };
}

// ── Cognition request (spec §4.5) — route may request depth; may not set tier ─
export interface CognitionRequest {
  readonly mode: 'dialogue' | 'counsel' | 'scribe';
  readonly requestedDepth: 'auto' | 'deep';
  readonly includeAudio: boolean;
  readonly voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
}

// ── Participation axis — see pdc-1 (imported above) ───────────────────────────

// ── Candidate → Participant ───────────────────────────────────────────────────
/** What a producer hands to MIPA. `text` is the only content-bearing field in the lane. */
export interface CandidateBlock {
  readonly producerId: ProducerId;
  readonly text: string;
  /** Natural item count where the producer has one (atoms: n, exchanges: n). */
  readonly itemCount?: number;
}

/** A rendered participant (ADMITTED or OFFERED): the only place block text lives in the turn. */
export interface Participant {
  readonly producerId: ProducerId;
  readonly authoredBy: AuthoredBy;
  readonly participationClass: ParticipationClass;
  readonly authority: Authority;
  readonly disposition: 'ADMITTED' | 'OFFERED';
  readonly reason: AdmittedReason | OfferedReason;
  readonly text: string;
  readonly itemCount?: number;
}

/** Contract rows narrowed to the closed ProducerId (pdc-1 leaves producerId as string until M1). */
export type HeldParticipant = Omit<HeldEntry, 'producerId'> & { readonly producerId: ProducerId };
export type ExcludedParticipant = Omit<ExcludedEntry, 'producerId'> & { readonly producerId: ProducerId };
export type AdmittedRow = Omit<AdmittedEntry, 'producerId'> & { readonly producerId: ProducerId };
export type OfferedRow = Omit<OfferedEntry, 'producerId'> & { readonly producerId: ProducerId };

/** pdc-1: AVAILABLE → HELD | OFFERED | ADMITTED | EXCLUDED. A completed turn leaves nothing AVAILABLE. */
export interface Participation {
  readonly admitted: readonly Participant[];
  /** Disclosure-safe doorways only. Empty under pp-1 — no doorway producer exists yet (W1). */
  readonly offered: readonly Participant[];
  readonly held: readonly HeldParticipant[];
  readonly excluded: readonly ExcludedParticipant[];
}

// ── Floor (spec §5.4) — mandatory; renderer appends; tiers cannot omit ────────
export interface FloorBlock {
  readonly producerId: ProducerId;
  readonly position: 'first' | 'last';
  readonly text: string;
}

export interface ConstitutionalFloor {
  readonly blocks: readonly FloorBlock[];
}

// ── Manifest (spec §7) — evidence, never content ──────────────────────────────
export const MANIFEST_CONTRACT_VERSION = 'tpm-1' as const;

export interface TurnParticipationManifest {
  readonly contractVersion: typeof MANIFEST_CONTRACT_VERSION;
  readonly turnId: string;
  readonly builtAt: string;
  readonly buildSha: string;

  readonly identityStatus: IdentityStatus;
  readonly memberRef?: string;
  readonly surface: SurfaceDescriptor;
  readonly roomKind: RoomKind;
  readonly ingressId: string;

  readonly canonicalContextVersion: typeof CANONICAL_TURN_CONTRACT_VERSION;
  readonly participationPolicyVersion: string;
  readonly producerRegistryVersion: string;

  readonly sovereignty: {
    readonly sanctuary: boolean;
    readonly memoryMode: MemoryMode;
    readonly gatesApplied: readonly string[];
  };

  readonly producersConsidered: readonly ProducerId[];
  readonly participationClassesConsidered: readonly ParticipationClass[];
  /** pdc-1 rows: axes + disposition + basis; chars/blockDigest only where something rendered.
   *  `admitted` includes the mandatory floor rows (reason: mandatory_floor). */
  readonly held: readonly HeldParticipant[];
  readonly offered: readonly OfferedRow[];
  readonly admitted: readonly AdmittedRow[];
  readonly excluded: readonly ExcludedParticipant[];
  readonly counts: { readonly held: number; readonly offered: number; readonly admitted: number; readonly excluded: number };

  readonly floorDigest: string;
  readonly fieldDigest: string;
  readonly cognitionPath: 'getMaiaResponse' | 'room_direct' | 'shadow';
}

// ── The object ────────────────────────────────────────────────────────────────
export interface CanonicalTurn {
  readonly contractVersion: typeof CANONICAL_TURN_CONTRACT_VERSION;
  readonly turnId: string;
  readonly builtAt: string;
  readonly ingressId: string;

  readonly identity: MemberIdentity;
  readonly surface: SurfaceDescriptor;
  readonly encounter: PresentEncounter;
  readonly sovereignty: SovereigntyState;

  readonly floor: ConstitutionalFloor;
  readonly participation: Participation;
  readonly manifest: TurnParticipationManifest;

  readonly cognitionRequest: CognitionRequest;
}

// ── Refusal (spec §12.2) — fail closed, typed ─────────────────────────────────
export type RefusalCode =
  | 'unregistered_producer'
  | 'identity_unverifiable'
  | 'floor_missing'
  | 'unknown_input'
  | 'not_frozen';

export class CanonicalTurnRefused extends Error {
  readonly code: RefusalCode;
  readonly detail?: string;
  constructor(code: RefusalCode, detail?: string) {
    super(`CanonicalTurn refused: ${code}${detail ? ` — ${detail}` : ''}`);
    this.name = 'CanonicalTurnRefused';
    this.code = code;
    this.detail = detail;
  }
}
