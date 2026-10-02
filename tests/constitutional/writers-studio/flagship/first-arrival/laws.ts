/**
 * FIRST ARRIVAL — O1…O15 AS MECHANICAL LAWS.
 *
 * Source: `FIRST_ARRIVAL_AND_ONBOARDING_CANON_v1.md` §35.
 *
 * ⭐⭐ AUTHORED BEFORE ANY ARRIVAL COMPONENT EXISTS. That is the whole point:
 * a suite written against an implementation passes by construction and proves
 * nothing. These read the canon, ⛔ not the candidate.
 *
 * ⚠️ NAMING: the flagship suite already has `runArrivalLaws`, which governs
 * ARRIVING AT A PASSAGE from a finding. This is a different subject — the
 * member arriving at the STUDIO — so everything here is `first-arrival`.
 * ⛔ Two things called "arrival" in one suite is how a law gets applied to the
 * wrong object.
 *
 * ⛔ TWO OF THE FIFTEEN GATES ARE NOT HERE, DELIBERATELY:
 *   O15 curiosity — *did the member want another move?* is a fact about a
 *     person. ⛔ No DOM predicate is evidence about it.
 *   O10's felt half — *trust appears where it matters* is a judgment about a
 *     moment. ⭐ The STRUCTURAL half IS testable and is written below (O10):
 *     trust copy is not stacked into one legal-looking box. ⛔ That is not the
 *     same claim, and the difference is recorded rather than papered over.
 */

/** A rendered arrival, as the probes see it. ⛔ Not a component API. */
export interface ArrivalDom {
  /** Document order of the regions the arrival renders. */
  readonly order: readonly string[];
  /** Every action offered at rest, by its visible label. */
  readonly actions: readonly string[];
  /** Text of the Work identity region, empty when absent. */
  readonly workIdentity: string;
  /** Text naming where the member is, empty when absent. */
  readonly place: string;
  /** Does a modal/overlay block the manuscript at rest? */
  readonly blockingOverlay: boolean;
  /** A step counter such as "1 of 7". */
  readonly tourStepper: boolean;
  /** Every claim the arrival makes ABOUT the Work's meaning. */
  readonly meaningClaims: readonly string[];
  /** Discoveries offered, each with what backs it. */
  readonly discoveries: readonly {
    readonly text: string;
    readonly evidenceRefs: number;
    readonly address: string;
    readonly whyAnswerable: boolean;
  }[];
  /** Reading-scope requests, each with whether it names its scope first. */
  readonly scopeRequests: readonly { readonly namesScopeFirst: boolean }[];
  /** Separate elements carrying trust copy. */
  readonly trustElements: number;
  /** Trust copy all inside one container = the legal box. */
  readonly trustInOneBox: boolean;
  /** Does anything ask the member to rate or declare their own ability? */
  readonly selfGrading: readonly string[];
  /** Does anything require choosing a lens/mode before help begins? */
  readonly machineryPrerequisite: readonly string[];
  /** ⭐ Continuity statements the arrival makes, each with whether DURABLE
   *  evidence backs it. Session-known place is lawful; a remembered past is
   *  only lawful when something actually remembers it. */
  readonly continuityClaims: readonly { readonly text: string; readonly durablyEvidenced: boolean }[];
}

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string; }

const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

/** ⭐ §12 — *Keep writing* is a legitimate primary path at EVERY arrival. */
const KEEP_WRITING = /^(keep writing|start writing|continue (here|writing))$/i;

/** ⛔ §2 — the first promise is never a promise about the member's ability. */
const BARRED_PROMISE = [
  'write better', 'become a better writer', 'ai-powered', 'improve your writing',
  'unlock', 'master', 'level up',
];

export function runFirstArrivalLaws(d: ArrivalDom): readonly LawResult[] {
  const out: LawResult[] = [];

  /* ── O1 · WORK FIRST ─────────────────────────────────────────────────────
     ⭐ Not "the Work is present somewhere" — PRESENT FIRST. A welcome panel
     above the manuscript satisfies presence and defeats the law. */
  const iWork = d.order.indexOf('work');
  const iExplain = d.order.findIndex((r) => r === 'explanation' || r === 'tour');
  out.push(law('O1-work-before-explanation',
    iWork >= 0 && (iExplain === -1 || iWork < iExplain),
    iWork < 0 ? 'the Work does not appear at all'
      : iExplain === -1 ? 'the Work appears and nothing explains the software first'
      : `feature explanation at ${iExplain} precedes the Work at ${iWork}`));

  /* ── O2 · PLACE CLEAR ────────────────────────────────────────────────── */
  out.push(law('O2-place-is-named', d.workIdentity.trim() !== '' && d.place.trim() !== '',
    d.workIdentity.trim() === '' ? 'no Work identity'
      : d.place.trim() === '' ? 'the Work is named but not the place in it'
      : `${d.workIdentity.trim()} · ${d.place.trim()}`));

  /* ── O3 · WRITE ALWAYS AVAILABLE ─────────────────────────────────────── */
  const keep = d.actions.filter((a) => KEEP_WRITING.test(a.trim()));
  out.push(law('O3-keep-writing-is-primary', keep.length >= 1,
    keep.length >= 1 ? `offered as "${keep[0]}"`
      : `no writing path among: ${d.actions.join(' · ') || 'nothing'}`));

  /* ── O4 · HUMAN INTENT ───────────────────────────────────────────────────
     ⭐ The law is the ABSENCE of a machinery prerequisite, ⛔ not the presence
     of any particular sentence: §33 requires the intents to work across memoir,
     philosophy and coaching alike, so a fixed wording list would be wrong. */
  out.push(law('O4-no-machinery-prerequisite', d.machineryPrerequisite.length === 0,
    d.machineryPrerequisite.length === 0 ? 'help begins without choosing a lens first'
      : `must choose first: ${d.machineryPrerequisite.join(' · ')}`));

  /* ── O5 · NO EXPERTISE TEST ──────────────────────────────────────────── */
  out.push(law('O5-no-expertise-test', d.selfGrading.length === 0,
    d.selfGrading.length === 0 ? 'nothing asks the member to rank themselves'
      : `asks the member to declare: ${d.selfGrading.join(' · ')}`));

  /* ── O6 · NO TUTORIAL REQUIRED ───────────────────────────────────────────
     ⭐ §28 permits an OPTIONAL orientation, so the law cannot be "no tour
     exists" — it is that nothing BLOCKS the Work. A stepper is the tell. */
  out.push(law('O6-nothing-blocks-the-work', !d.blockingOverlay && !d.tourStepper,
    d.blockingOverlay ? 'an overlay stands between the member and the manuscript'
      : d.tourStepper ? 'a step counter is present: the tour is a sequence to complete'
      : 'the Work is reachable at rest'));

  /* ── O7 · FIRST DISCOVERY IS REAL ────────────────────────────────────────
     ⭐ §13 requires evidence, exact place, and an answerable "why". A discovery
     without an address is a claim; with one it is a thing the member can check. */
  const thin = d.discoveries.filter((x) => x.evidenceRefs < 1 || x.address.trim() === '' || !x.whyAnswerable);
  out.push(law('O7-discovery-is-evidenced-and-addressed', thin.length === 0,
    thin.length === 0 ? `${d.discoveries.length} discovery/ies, each evidenced, addressed and explainable`
      : `${thin.length} unbacked: ${thin.map((x) => `"${x.text.slice(0, 40)}"`).join(' · ')}`));

  /* ── O8 · SCOPE CONSENT ──────────────────────────────────────────────── */
  const silent = d.scopeRequests.filter((r) => !r.namesScopeFirst);
  out.push(law('O8-scope-named-before-reading', silent.length === 0,
    silent.length === 0 ? `${d.scopeRequests.length} reading request(s), each naming scope first`
      : `${silent.length} request(s) would read without naming scope`));

  /* ── O9 · FIRST EXPERIMENT IS REVERSIBLE ─────────────────────────────── */
  const hasKeepOriginal = d.actions.some((a) => /keep (my )?original/i.test(a));
  const hasUndo = d.actions.some((a) => /\bundo\b/i.test(a));
  const offersApply = d.actions.some((a) => /\bapply\b/i.test(a));
  out.push(law('O9-apply-never-without-its-escape',
    !offersApply || (hasKeepOriginal && hasUndo),
    !offersApply ? 'no revision offered at arrival, so nothing to escape'
      : hasKeepOriginal && hasUndo ? 'Apply travels with Keep my original and Undo'
      : `Apply offered without ${!hasKeepOriginal ? 'Keep my original' : ''}${!hasKeepOriginal && !hasUndo ? ' and ' : ''}${!hasUndo ? 'Undo' : ''}`));

  /* ── O10 · TRUST IN CONTEXT (structural half only) ───────────────────────
     ⚠️ ⛔ This does NOT test that trust appears *where it matters*. It tests
     §10's negative: trust copy is not stacked into one legal-looking box.
     ⭐ Reported under its own narrower name so a pass is never read as the
     wider claim. */
  out.push(law('O10-trust-is-not-a-legal-box', !(d.trustElements > 1 && d.trustInOneBox),
    d.trustElements === 0 ? 'no trust copy at this arrival'
      : d.trustInOneBox && d.trustElements > 1 ? `${d.trustElements} trust statements stacked in one box`
      : `${d.trustElements} trust statement(s), placed where they apply`));

  /* ── O11 · EMPTY IS HONEST ───────────────────────────────────────────────
     ⭐⭐ §3's hard rule, and the one a competent implementation gets wrong by
     trying to be warm: the arrival may state Work FACTS and may repeat the
     member's OWN declaration, ⛔ but may never say what the book is about. */
  out.push(law('O11-no-fabricated-meaning', d.meaningClaims.length === 0,
    d.meaningClaims.length === 0 ? 'the arrival recognises the Work without interpreting it'
      : `states what the Work means: ${d.meaningClaims.map((m) => `"${m.slice(0, 50)}"`).join(' · ')}`));

  /* ── O9b · §21/§14 — NO REWARD LANGUAGE ────────────────────────
     ⭐⭐ THIS LAW EXISTS BECAUSE THE MATRIX EXPOSED ITS ABSENCE. D-O7 models
     *the product celebrates Apply as the correct choice*, and with no law
     against reward language the only way to make it die was to ALSO strip
     Keep my original — which made it a duplicate of D-O8 wearing a cheerful
     label. ⛔ A candidate shaped to die on a convenient law is not evidence.
     ⭐ The harm is specific: celebrating Apply makes Keep my original read as
     the wrong answer, which is coercion by tone rather than by structure. */
  const REWARD = [
    'great choice', 'nice work', 'well done', 'congratulations', 'perfect',
    'you earned', 'important insight', 'recommended', 'top pick', 'best option',
  ];
  const surfaceText = [...d.actions, ...d.discoveries.map((x) => x.text)].join(' ').toLowerCase();
  const rewards = REWARD.filter((w) => surfaceText.includes(w));
  out.push(law('O9b-no-reward-language', rewards.length === 0,
    rewards.length === 0 ? 'nothing praises the member for a choice'
      : `reward language present: ${rewards.join(' · ')}`));

  /* ── O12 · RETURN IS OBVIOUS ─────────────────────────────────────────────
     ⭐ Every arrival state must leave a way INTO the manuscript at rest. An
     arrival that can only be left by dismissing something is a trapdoor. */
  const intoWork = d.actions.filter((a) => KEEP_WRITING.test(a.trim())
    || /(go to|open|back to|return to).*(manuscript|chapter|work)/i.test(a));
  out.push(law('O12-a-way-into-the-work-at-rest', intoWork.length >= 1,
    intoWork.length >= 1 ? `${intoWork.length} path(s) into the Work` : 'no path into the manuscript'));

  /* ── O14b · §9 — CONTINUITY COPY DEGRADES HONESTLY ─────────────────
     ⭐⭐ The ruling draws the line inside the welcome itself, ⛔ not around it:
       ✅ *Welcome back to The River Between.*            — Work identity
       ✅ *You're in Chapter 6.*                          — the session knows
       ⛔ *You last worked here three days ago.*          — needs a memory
     ⭐ The third sentence is the dangerous one precisely because it is the
     WARMEST. A system with no durable state can still compose it, and it
     would be a fabricated relationship — the arrival-shaped version of
     claiming a reading that never happened.
     ⛔ This law does NOT make O14 testable: a returning member still cannot
     be observed. It only refuses the CLAIM when nothing backs it. */
  const unbacked = d.continuityClaims.filter((c) => !c.durablyEvidenced);
  out.push(law('O14b-continuity-claim-needs-a-memory', unbacked.length === 0,
    unbacked.length === 0
      ? d.continuityClaims.length === 0 ? 'no continuity claimed'
        : `${d.continuityClaims.length} continuity statement(s), each durably backed`
      : `claims a past nothing remembers: ${unbacked.map((c) => `"${c.text}"`).join(' · ')}`));

  /* ── O2b · §2 — the first promise is about the WORK, never the member ──── */
  const promises = [d.workIdentity, ...d.actions].join(' ').toLowerCase();
  const badPromise = BARRED_PROMISE.filter((p) => promises.includes(p));
  out.push(law('O2b-promise-is-about-the-work', badPromise.length === 0,
    badPromise.length === 0 ? 'nothing promises to improve the member'
      : `promises about the member: ${badPromise.join(' · ')}`));

  return out;
}

/**
 * ⛔ NOT MECHANICALLY TESTABLE — reported as UNKNOWN, ⛔ never as passed.
 * ⭐ Naming them in the same module as the laws is deliberate: a gate that
 * exists only in prose is a gate that quietly stops being checked.
 */
export const HUMAN_ONLY_GATES = [
  { id: 'O15-curiosity', why: 'whether the member wanted another move is a fact about a person' },
  { id: 'O10-felt-half', why: 'whether trust appeared *where it mattered* is a judgment about a moment' },
  { id: 'O13-felt-half', why: 'scaling and targets are measured; whether the first run was comfortable is not' },
  { id: 'O14-returning-quiet', why: 'blocked on persistence — there is no returning member to observe yet' },
] as const;
