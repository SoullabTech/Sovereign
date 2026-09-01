/**
 * WS2-05B-8B-02c-2 — has anything moved under this conversation.
 *
 * FIVE INDEPENDENT DIMENSIONS, EACH GENUINELY THREE-STATE. A real thread can
 * have moved text AND a moved reviewed tree AND a newer reading, all at once; a
 * tagged union over the five would force a surface to pick one and drop the
 * rest, which is the collapse the contract exists to forbid.
 *
 * `unmeasured` IS A STATE, NOT AN ABSENCE. An earlier draft used `null` for
 * "could not measure" on some dimensions and for "measured and unchanged" on
 * others, so a failed measurement rendered as a clean bill. Tagging the union
 * makes the third case unrepresentable-as-absence, and lets `ReviewChange` carry
 * its numbers only in the case that actually has them.
 *
 * The doctrine is `reviewClient`'s, about `staleAsRead`: "True, false, or NULL
 * when the server could not measure it. Three states, because a surface that
 * cannot say 'I do not know' will say 'no'."
 */

export type ChangeFlag =
  | { state: 'unchanged' }
  | { state: 'changed' }
  | { state: 'unmeasured' };

export type ReviewChange =
  | { state: 'unchanged' }
  | { state: 'changed'; was: number; now: number }
  | { state: 'unmeasured' };

export type Supersession =
  | { state: 'not-superseded' }
  | { state: 'superseded'; by: string | null }
  | { state: 'unmeasured' };

export interface StalenessState {
  inputMoved: ChangeFlag;
  topologyMoved: ChangeFlag;
  reviewMoved: ReviewChange;
  readingSuperseded: Supersession;
  canonicalMoved: ChangeFlag;
}

/** Every dimension unmeasured. The honest starting point, never a default answer. */
export const UNMEASURED: StalenessState = {
  inputMoved: { state: 'unmeasured' },
  topologyMoved: { state: 'unmeasured' },
  reviewMoved: { state: 'unmeasured' },
  readingSuperseded: { state: 'unmeasured' },
  canonicalMoved: { state: 'unmeasured' },
};

/**
 * CURRENT = every required signal was successfully measured
 *           AND every measured signal is unchanged.
 *
 * UNKNOWN IS NOT CURRENT. If any dimension is `unmeasured` this is false, and
 * the thread is *unknown* rather than fresh - which is its own answer and must
 * render and reason as one. Derived, never stored: a summary flag kept beside
 * the parts is how the parts drift out of agreement with it.
 */
export function isCurrent(s: StalenessState): boolean {
  return s.inputMoved.state === 'unchanged'
    && s.topologyMoved.state === 'unchanged'
    && s.reviewMoved.state === 'unchanged'
    && s.readingSuperseded.state === 'not-superseded'
    && s.canonicalMoved.state === 'unchanged';
}

/** True where an answer must not assert what the material currently says. */
export function mustNotAssertCurrent(s: StalenessState): boolean {
  return s.inputMoved.state !== 'unchanged' || s.topologyMoved.state !== 'unchanged';
}

const flag = (a: string | null | undefined, b: string | null | undefined): ChangeFlag =>
  a == null || b == null ? { state: 'unmeasured' } : a === b
    ? { state: 'unchanged' } : { state: 'changed' };

/**
 * Compare a thread's frozen reference against what is true now.
 *
 * Every `now` argument is nullable ON PURPOSE: a caller that could not compute a
 * digest passes null and gets `unmeasured`, rather than being tempted to pass a
 * placeholder that would compare unequal and report a change that did not
 * happen - or equal, and report freshness it never established.
 */
export function computeStaleness(input: {
  frozen: {
    interpretationInputHash: string;
    sectionTopologyHash: string;
    reviewRevision: number;
  } | null;
  canonicalAtOpen: string;
  now: {
    interpretationInputHash?: string | null;
    sectionTopologyHash?: string | null;
    reviewRevision?: number | null;
    /** Newest proposal id for this Work, or null if it could not be looked up. */
    newestProposalId?: string | null;
    canonicalFingerprint?: string | null;
  };
  /** The proposal this thread is anchored to, when it has one. */
  frozenProposalId: string | null;
}): StalenessState {
  const { frozen, now, canonicalAtOpen, frozenProposalId } = input;

  const canonicalMoved = flag(canonicalAtOpen, now.canonicalFingerprint);

  /* A thread with no reading has nothing to compare on the reading dimensions.
     `unmeasured` is right, not `unchanged`: there is no measurement, and saying
     "unchanged" would claim one. */
  if (!frozen) {
    return { ...UNMEASURED, canonicalMoved };
  }

  const reviewMoved: ReviewChange =
    now.reviewRevision == null
      ? { state: 'unmeasured' }
      : now.reviewRevision === frozen.reviewRevision
        ? { state: 'unchanged' }
        : { state: 'changed', was: frozen.reviewRevision, now: now.reviewRevision };

  const readingSuperseded: Supersession =
    now.newestProposalId === undefined || now.newestProposalId === null
      ? { state: 'unmeasured' }
      : frozenProposalId !== null && now.newestProposalId !== frozenProposalId
        ? { state: 'superseded', by: now.newestProposalId }
        : { state: 'not-superseded' };

  return {
    inputMoved: flag(frozen.interpretationInputHash, now.interpretationInputHash),
    topologyMoved: flag(frozen.sectionTopologyHash, now.sectionTopologyHash),
    reviewMoved,
    readingSuperseded,
    canonicalMoved,
  };
}

/**
 * Which side of the comparison is "was".
 *
 * THE FROZEN SIDE COMES FROM THE THREAD, ALWAYS. On a resumed thread the route
 * reloads the proposal to learn what is true NOW; taking the frozen side from
 * that same fresh load compared the current revision to itself, so a member
 * could edit their reviewed structure with a conversation open and still be told
 * nothing had moved. The thread stores what the author was actually looking at
 * when they opened it, and that is the only honest `was`.
 *
 * A pure function so this is checkable without a database — the defect lived in
 * the wiring, so the wiring is what has to be testable.
 */
export function frozenSideFor(input: {
  /** `ReadingIdentity` stored on the thread, when it is a resumed thread. */
  stored: {
    proposalId: string;
    interpretationInputHash: string;
    sectionTopologyHash: string;
    reviewRevision: number;
  } | null;
  /** The freshly loaded proposal, used only when the thread is being opened. */
  fresh: {
    proposalId: string;
    interpretationInputHash: string;
    sectionTopologyHash: string;
    reviewRevision: number;
  } | null;
}): {
  proposalId: string;
  interpretationInputHash: string;
  sectionTopologyHash: string;
  reviewRevision: number;
} | null {
  return input.stored ?? input.fresh ?? null;
}
