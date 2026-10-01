/**
 * H1-COHORT-GATE-01 · the contract every gate design is judged against.
 *
 * This file types OBSERVABLE behaviour at the boundary (founder ruling, #1544 +
 * H1-COHORT-GATE-01 §3/§4). It does not prescribe module names, endpoint paths
 * or hook shapes: those are implementation. A gate is a set of functions; the
 * laws (laws.ts) run against the conforming reference and against deliberately
 * wrong designs (gates.ts).
 *
 * ⛔ Nothing here is the implementation. The reference gate is a TEST DOUBLE:
 * no env reader, no endpoint, no hook, no House change ships from this lane yet.
 */
import type { LivingWork, LivingWorksPhase } from '../../../app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '../../../app/writers-studio/useCurrentManuscript';
import type { ModeEntryTarget } from '../../../app/writers-studio/homeState';
import type { SituatedWorkContext, StudioArrival, HeldManuscriptsPhase, ArrivalManuscript } from '../../../app/writers-studio/situatedWork';

export type Env = Readonly<Record<string, string | undefined>>;

/** What the browser can observe of the Studio admission endpoint. */
export type AdmissionResponse =
  | { kind: 'loading' }
  | { kind: 'ok'; body: unknown }
  | { kind: 'status'; status: 401 | 403 | 500 }
  | { kind: 'network-error' }
  | { kind: 'timeout' };

/** Everything the browser holds that a wrong gate might mistake for authority. */
export interface ClientState {
  search: string;
  storage: Readonly<Record<string, string>>;
  /** an x-member-id / maia_member_id claim: never identity */
  claimedMemberId?: string;
}

/** The member's Studio world, as the existing pre-H1 machinery sees it. */
export interface World {
  phase: LivingWorksPhase;
  works: LivingWork[];
  heldPhase: HeldManuscriptsPhase;
  held: ArrivalManuscript[];
  manuscripts: CurrentManuscript[];
  /** the resume Work Studio Home would offer (#1538 mode entry) */
  resume: LivingWork | null;
}

export type ReaderName = 'home' | 'develop' | 'review' | 'writeEdit';
export type ReaderResult = StudioArrival | SituatedWorkContext;

export interface H1Gate {
  name: string;

  /** The one authority (§3.1). Identity is the verified server identity only. */
  authority(verifiedMemberId: string | null, env: Env): boolean;

  /** House server render (§3.2): its decision and its Writing link. */
  houseAdmits(verifiedMemberId: string, env: Env): boolean;
  houseHref(verifiedMemberId: string, env: Env, livingWorkId: string | null): string;

  /** Studio carrier (§3.3): what the admission endpoint answers for a verified identity. */
  endpoint(verifiedMemberId: string | null, env: Env): AdmissionResponse;
  /** Studio hook: what the browser concludes from the response and anything it holds. */
  studioAdmitted(response: AdmissionResponse, client: ClientState): boolean;

  /**
   * Any URL rewriting the design performs on arrival (a redirect, replaceState).
   * The ruled design performs none (F9). Absent ⇒ identity.
   */
  normalizeUrl?(search: string, admitted: boolean): string;

  /** The four readers (§1.3), each resolving a Studio request. */
  readers: Record<ReaderName, (search: string, admitted: boolean, world: World) => ReaderResult>;

  /** Studio Home mode entry (#1538), which must be population-neutral. */
  modeEntry(world: World, admitted: boolean): ModeEntryTarget;
}
