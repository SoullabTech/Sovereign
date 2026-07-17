# Gold Reflection — Individual Reflection Architecture — 2026-07-17

**Ruling status (2026-07-17)**: Accepted by Kelly as the basis of the next phase.
Ratified/directed/unresolved items tracked in
`GOLD_REFLECTION_DECISION_REGISTER_2026-07-17.md` — the register supersedes the ruling
lists below where they overlap. The prototype (§11) is accepted in principle, **not
authorized**; eligibility gates are register P1–P5.

**Status**: Design investigation only. **Stop condition in force**: no schemas, no scoring,
no production prompts, no dashboards, no collective ingestion, no memory-write changes, no
background pattern analysis, no member labels, no deployment. This document and its three
companions end the phase; contradictions and rulings for Kelly are collected in §12.

Companions:
- `GOLD_REFLECTION_INTERACTION_STUDY_2026-07-17.md` (Doc B — ten cases)
- `GOLD_REFLECTION_COLLECTIVE_BOUNDARY_MODEL_2026-07-17.md` (Doc C)
- `GOLD_REFLECTION_EXISTING_SYSTEM_MAP_2026-07-17.md` (Doc D — source-verified map)

**Governing sentence**: MAIA does not tell a member who they are. She reflects what the
member has revealed, so the member may recognize it for themselves.

**Evaluation standard**: the member leaves with greater authorship, not greater dependence
on MAIA.

---

## 1. What "gold" is, operationally

"Gold" is not a construct the system detects. It is a **relationship among evidence types
the member has already authored**: recurring values, returning questions, marked moments,
language carrying unusual energy, commitments surviving difficulty, meaningful
contradictions, recognitions already made. The system's job is not detection but
**faithful assembly with provenance** — putting the member's own material where the member
can see it whole, at a moment they've invited it.

Consequence: **there is no gold table, no gold score, no gold model.** The first
architecture question — "is gold a new database or a relationship among existing evidence
types?" — resolves to the latter. See Doc D: the evidence types already exist as separate,
member-scoped, consent-gated substrates. What is missing is not data but a *ratification
grammar* over them.

## 2. Current relevant capabilities (source-verified)

Full evidence in Doc D. The findings that shape this architecture:

1. **The ratification grammar's ancestor already exists in schema.** Atoms carry
   `member_response_status ∈ {confirmed, rejected, modified}` (migration
   `20260702000002`; only `rejected` has a live writer — the decline route) and
   `epistemological_status ∈ {observed, reported, inferred, provisional, claimed}` — the
   observation ≠ interpretation distinction as a typed column. The reflection grammar
   completes ratified columns; it does not invent a new regime.
2. **The evidence substrate exists and is shaped correctly.** Marked moments persist
   byte-exact `verbatim_text` with `marked_by_member = TRUE`, interpretive columns NULL,
   and turn/session provenance. Significance without construal — exactly what §6 needs.
3. **The consent-triad pattern exists twice** (atoms `return_preference`, anchors
   `surface_preference`): default-private column + member gesture route + loader-side
   gate. Reflection surfacing policy is its third instance.
4. **Recall layers are live with consent gates** (`conversational_recall_enabled`,
   `episodic_recall_enabled`) and Sanctuary suppression in the loaders.
5. **MAIA already has prompt-layer license to name recurrence** ("You've mentioned that a
   few times now…", pacing-gated) and a ratified speech-act boundary (may reflect that
   something matters; must never claim it was kept). But these counting claims are
   currently *ungrounded* — model impression, not retrievable citation.
6. **A system-inferred theme pipeline already runs unratified**
   (`participatoryRealityHelper` → `member_theme_signals`, `RECURRENCE_THRESHOLD = 3`,
   prompt-wired, feeding the Circles pulse, no member review surface). The platform
   already construes; it doesn't yet ask. See Doc D §2.2 and the rulings in §12.
7. **Chapters (conversations) are docs-only** — approved-queued, no code. The prototype
   seam is therefore "end of conversation."
8. **A member-pulled verbatim-quote extractor exists route-first**
   (`/api/sovereign/quotes/candidates`, writes nothing) — a ready-made evidence-citation
   mechanism with no UI yet.
9. **Sanctuary gap found in passing**: the episodic-mark route's Sanctuary guard is
   client-side only. Flagged for a separate fix; any reflection loader must gate on
   session provenance itself, not trust upstream filtering (Doc D §1.1).

## 3. Missing capabilities

Independent of verification detail, the following do not exist and are the actual gap:

1. **A reflection object** — a first-class record distinguishing observation, evidence,
   interpretation, and member response (§5).
2. **A complete member-response grammar** — recognized / revised / not-true / not-now /
   kept. Partially present: atoms' `member_response_status` models
   confirmed/rejected/modified, but only `rejected` has a live writer, and it applies to
   practitioner observations, not MAIA construals. The grammar needs completion
   (writers for confirm/modify) and extension to reflections — noting that the portfolio
   doctrine "curated, never rejected" applies to member-authored material and must not be
   contradicted: `not-true` adjudicates *construals*, never the member's own words
   (Doc D §2.1).
3. **Recurrence assembly with provenance** — nothing today gathers "these three moments
   share this phrase" as a checkable claim with citations.
4. **A rejection-suppression mechanism** — a way for `not-true` to structurally silence a
   construal (Doc B, Case 9).
5. **Member-initiated invitation surface** — a place where the member asks for reflection,
   rather than MAIA volunteering it.

## 4. The smallest reflection loop

```text
Member speaks or acts
        ↓
A moment carries significance
        ↓
The member marks it (existing gesture) — or, within an invited reflection, MAIA cites it
        ↓
At a member-invited moment, MAIA offers a grounded observation with visible evidence
        ↓
The member responds: recognized · revised · not-true · not-now · kept — or says nothing
        ↓
Only member-ratified meaning (member's wording) becomes durable
        ↓
Future MAIA may reflect it back, with provenance, under the member's surfacing preference
```

Properties that make it smallest:
- **No background analysis.** Assembly runs only at the member's invitation, in-session.
- **No new evidence types.** It reads marks, atoms, and conversation history that already
  exist under their existing consent gates.
- **One new record type** (the reflection object), written only on a member gesture.
- **Silence is the common case.** No response ⇒ nothing stored.

## 5. Reflection object (candidate design — not a migration)

As specified in the directive, with clarifications from the case study:

```ts
type Reflection = {
  id: string
  memberId: string

  observation: string          // countable, checkable; MAIA's or the member's noticing
  evidence: EvidenceReference[] // ≥1; each resolves to a member-authored moment
  interpretation?: string      // tentative meaning, NEVER merged into observation
  confidence?: "tentative" | "recurring" | "member-confirmed"
                               // ordinal states only — never a hidden probability

  memberResponse?: "recognized" | "revised" | "not-true" | "not-now" | "kept"
  memberRevision?: string      // when present, THIS is the durable text

  shape?: "statement" | "question" | "tension"
                               // tensions/contradictions are first-class (Doc B, Cases 3/6)

  provenance: {
    createdAt: string
    createdBy: "member" | "maia"
    sourceContainers: string[] // container-scoped; loader refuses cross-container assembly
  }
  memoryPolicy: {
    durable: boolean           // true ONLY via kept/recognized/revised
    collectiveEligible: boolean // ALWAYS false in this design; Stage-2 gate is elsewhere (Doc C)
    suppressed: boolean        // true after not-true: construal never re-surfaced
  }
}

type EvidenceReference = {
  kind: "atom" | "mark" | "utterance" | "anchor" | "kept-reflection"
  id: string
  quotedText?: string          // member verbatim, if the member's words are cited
  occurredAt: string
}
```

Load-bearing distinctions:
- **Observation ≠ Interpretation ≠ Recognition.** Three fields, never collapsed. The
  observation must survive the member checking it against the evidence ("you used this
  phrase three times" is either true or false). The interpretation is optional, marked
  tentative, and dies silently if unratified. Recognition exists only as a member act.
- **`memberRevision` outranks everything.** Once present, MAIA's text is history, not truth.
- **`confidence` is a state machine, not a score**: `tentative` (first assembly) →
  `recurring` (threshold met, §6) → `member-confirmed` (only via member response). No
  numeric field exists anywhere.

## 6. Evidence model and thresholds

- **Eligible evidence**: member-marked moments, member-kept atoms, member verbatim
  utterances from non-Sanctuary conversation history, anchors the member created, prior
  kept reflections. All container-scoped.
- **Ineligible as seed evidence**: system-inferred states (spiral phase, element,
  processing tier), anything from Sanctuary, client material in practitioner containers
  (Doc B, Case 8), rejected construals.
- **Recurrence threshold** (Doc B, Case 2): a pattern claim requires **≥3 member-authored
  moments across ≥2 sessions**, or **1 member-marked moment + the member's own return to
  it**. Below threshold MAIA may respond to the present moment but may not name a pattern.
- **Restraint categories** (Doc B, Case 4): material disclosed in grief/crisis never seeds
  proactive reflection regardless of count — reflectable only on member initiative. How to
  bound this category without hidden content-classification is an open ruling (§12.3).

## 7. Member ratification, revision, rejection

- **Ratification** is the only path to durability. `kept`/`recognized`/`revised` set
  `durable: true`; the durable text is the member's wording wherever one exists.
- **Revision over time** (Doc B, Case 10): the member may later replace or accrete. Replaced
  versions remain as member-visible history marked superseded-by-member. MAIA never
  auto-updates kept meaning.
- **Rejection** (Doc B, Case 9): `not-true` stores the construal with `suppressed: true`.
  Effects: never re-surfaced as a claim; never re-argued with more evidence; usable only as
  a negative constraint on future construals — never as a covert prior about the member.
  The rejection record is member-visible and member-deletable.
- **`not-now`** defers without verdict: not durable, not suppressed, re-offerable only if
  the member invites reflection again.
- **Silence** stores nothing.

## 8. Provenance and evidence visibility

Every reflection can answer "what gave rise to this?" in one gesture — the evidence
references render as the member's own moments (their words, their dates, their marks), not
as database rows. The member should never need to inspect a database; the citation *is*
the interface. This mirrors the existing pattern where marked atoms surface as "marked as
a breakthrough by the member" — authorship named in the surfacing.

## 9. Memory boundaries and deletion

- **Sanctuary**: absolute. No reflection may cite, or be influenced by, Sanctuary content.
- **Containers**: reflection assembly is single-container; `sourceContainers` is recorded
  and enforced at the loader, not by policy prose.
- **Deletion**: deleting a reflection removes it entirely. Deleting underlying evidence
  (an atom, a mark) invalidates dependent reflections — they must either be re-grounded in
  remaining evidence or retired; a reflection may never outlive its evidence as a free-standing
  claim. (Implementation detail for later; the invariant is: **no orphaned meaning**.)
- **No export to collective**: `collectiveEligible` is structurally false in this design.
  Any future Stage-2 offering gesture is a separate act in a separate store (Doc C §5).

## 10. Risks of overinterpretation — named

1. **Flattery capture** — the mirror becomes a praise machine; members return for the
   feeling of being seen rather than to see. Mitigations: countable observations only,
   evidence-visible, no essence language, restraint as default, and the evaluation
   standard in §13.
2. **Recurrence inflation** — one vivid moment become a trait (Case 2). Mitigation:
   thresholds.
3. **Diagnosis drift** — contradiction or self-criticism construed as pathology (Cases
   3/6). Mitigation: tension as first-class shape; no trait labels anywhere.
4. **Vocabulary displacement** — MAIA's words replacing the member's (Case 7, Invariant
   14). Mitigation: verbatim privileging; `memberRevision` outranks.
5. **Persuasion after rejection** — the system "knows better" and re-argues. Mitigation:
   structural suppression.
6. **Prompt-side leakage** — durable reflections entering every prompt and quietly
   becoming MAIA's fixed idea of the member. Mitigation: kept reflections surface under a
   member preference mirroring `surface_preference` (default member-pulled), not
   ambiently.
7. **Invitation erosion** — proactive nudges creeping in ("I've noticed something — want
   to hear it?") which manufactures the invitation. Mitigation: invitation surfaces are
   member-initiated places, not MAIA-initiated prompts; any change to this is a Kelly
   ruling, not a tuning knob.

## 11. Recommended first prototype

**A member-invited end-of-conversation reflection: "What seemed most alive?"** — evaluated
against alternatives in §11.1, recommended in §11.2. **Not authorized for implementation
by this document.**

The member, at a natural close (the existing end-of-session/chapter seam), can ask for a
reflection. MAIA offers: one countable observation, two-to-three cited member moments
(verbatim, dated), optionally one tentative question — never a conclusion. The member may
recognize, rewrite, reject, or keep; only member-ratified wording persists, under the
member's surfacing preference; rejection suppresses.

Why it satisfies the directive's constraints: member-invited (no proactive noticing
problem); uses only existing evidence under existing gates; provenance is the interface;
no automatic durability; no collective learning; no identity claims; rejection recorded as
meaningful; reversible; requires no psychological model — only retrieval + citation +
the response grammar.

### 11.1 Alternatives considered

- **In-conversation quiet noticing** ("you've returned to this phrase…"): highest
  relational value, but proactive — it fronts the hardest unsolved problems (restraint
  categories, invitation erosion) in v0. Defer.
- **"Earlier" continuity view** (cluster of kept recognitions): valuable but requires kept
  reflections to exist first — it is naturally v2, downstream of the prototype.
- **Marks-thread surfacing** ("several of your marks share a thread"): good evidence
  discipline, but crosses sessions and so needs the recurrence threshold machinery plus
  retrospective assembly; more moving parts than the single-conversation case.
- **Return-moment reflection** ("last time you kept this question…"): mostly already
  achievable via existing kept-material surfacing preferences; it is a surfacing feature,
  not a ratification feature, and doesn't exercise the new grammar.

### 11.2 Recommendation

The end-of-conversation invited reflection is the only candidate that exercises the entire
new grammar (observe → cite → offer → member responds → ratified-or-nothing) within a
single session, with zero background analysis and zero proactive surfacing. It is the
smallest full loop. Rejection data from it (how often members say *not-true*) is precisely
the evidence needed before any bolder surface is considered.

## 12. Contradictions, risks, and rulings for Kelly

1. **Naming**: "gold" must never appear in member-facing surface or in code as a
   detectable quantity. Internal shorthand risks becoming ontology. Proposed member-facing
   register: "reflection," "what seemed alive." Ruling: ratify the naming boundary.
2. **Threshold ratification**: the ≥3-moments/≥2-sessions recurrence floor (§6) and the
   invitation-only constraint (§10.7) should be ratified as constraints, not defaults.
3. **Restraint categories** (grief/crisis material): bounding this without hidden content
   classification of the member is genuinely unsolved. Options: (a) no proactive
   reflection at all in v0 (recommended — dissolves the problem), (b) member-declared
   sensitive topics, (c) conservative in-session-only heuristics. Ruling needed before any
   proactive surface is ever proposed.
4. **Rejected-reflection influence** (Doc B, Case 9): recommend "negative constraint only,
   never covert prior" as an invariant. Ruling: ratify.
5. **Relationship to Invariant 16 / Corollary "generative, not authoritative"**: a kept
   reflection is member-authored recognition and so moves authority upward legitimately;
   an unratified MAIA construal carries **zero** authority and must be treated as
   generative material only. This design operationalizes the corollary; propose recording
   it as such at the next canon sitting.
6. **Chapters dependency**: the prototype's seam is "end of conversation." If the chapters
   model (currently approved-queued) ships first, the seam becomes "end of chapter."
   Sequencing ruling: prototype need not wait for chapters.
7. **Evidence-deletion cascade** (§9): "no orphaned meaning" has real implementation cost.
   Ratify as invariant now so no future schema forgets it.
8. **Disposition of the live theme pipeline** (Doc D §2.2): `member_theme_signals` is a
   reflection engine without ratification — system-inferred, no member review surface,
   prompt-ambient, cross-member at the Circles pulse. Options: subsume it under the
   ratification model (theme signals become candidate observations, member-reviewable),
   or quarantine it (prompt-side counting language must stop implying counted evidence).
   Recommendation: subsume — it is the natural v2 evidence source, and its threshold
   constant already matches §6. Pairs with Doc C §9.6–.7.
9. **Grammar reconciliation** (Doc D §2.1): ratify that `not-true` applies only to MAIA
   construals, never to member-authored material, preserving the portfolio doctrine
   "curated via set_aside/archive, never rejected" without contradiction. The
   practitioner-observation decline flow (`member_response_status`) is the precedent to
   extend, including completing the unwritten `confirmed`/`modified` writers.

## 13. What evidence would show this actually helps (Question 15)

Not engagement, not retention, not keep-rate. Candidate signals, all member-authored:
members *revise* reflections in their own words (authorship exercised); members reject
freely (safety to disagree — a healthy rejection rate is a **success** indicator, not a
quality failure); members reference their own kept meanings unprompted in later
conversations (recognition became theirs); and — per the Sovereignty Invariants — no
growth in dependence markers (asking MAIA who they are). A rising keep-rate with a falling
rejection rate is the *warning* sign of flattery capture, not the success sign.

## 14. Answers to the fifteen questions

1. **Remembering vs reflecting**: remembering returns the member's material as it was;
   reflecting places materials *next to each other* so a relationship becomes visible.
   Memory is retrieval; reflection is juxtaposition — and therefore carries construal
   risk memory does not, which is why it needs the ratification grammar memory never did.
2. **When pattern recognition becomes interpretation**: the moment the claim stops being
   checkable against citations. "Three times you said X" is observation; "X matters to
   you" is interpretation; "X is who you are" is prohibited.
3. **Faithful vs flattering**: faithful reflections are countable, citable, declinable,
   and include unflattering recurrences (Case 6); flattery is uncited, essence-flavored,
   and asks to be believed rather than checked.
4. **Sufficient moments**: ≥3 across ≥2 sessions, or 1 marked + member's own return (§6).
5. **Evidence without database inspection**: the citation is the interface — evidence
   renders as the member's own quoted, dated moments in the reflection itself (§8).
6. **On rejection**: acknowledged, stored suppressed, never re-argued (§7).
7. **Can rejected reflections influence MAIA?** Only as negative constraints; never as
   covert priors (§12.4).
8. **Durable without explicit keep**: nothing. Silence stores nothing; `not-now` stores
   no durable meaning (§7).
9. **How reflections change over time**: only by member revision — replace-with-history
   or accrete; MAIA never matures kept meaning (§7; Case 10).
10. **Member wording privileged**: `memberRevision` outranks all MAIA text; verbatim
    quotes are the preferred evidence form; MAIA never stores translations of member
    vocabulary (Case 7).
11. **Private recognition vs collective learning**: separate stores, separate consent
    acts, separate authority direction; `collectiveEligible` structurally false in the
    individual loop (Doc C §8).
12. **Collective patterns without normativity**: pattern-level observations of plurality
    and tension only; no norms, rankings, or advice; rarity weighted over frequency
    (Doc C §7).
13. **Withdrawal of collective material**: per-item withdrawal, re-runnable formation
    cycles, patterns retired below threshold (Doc C §5).
14. **Preventing "gold" from becoming manipulative praise**: no essence language, counts
    not qualities, rejection honored structurally, flattery named as failure in the
    evaluation standard, and the §13 inversion — high agreement is the warning sign.
15. **Evidence it helps**: §13.

## 15. Stop

The four documents and this recommendation complete the phase. No implementation is
authorized. Next act belongs to Kelly: rulings §12.1–.7 and Doc C §9.
