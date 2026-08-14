# JRF-03 — Temporal Intelligence

**PROPOSED — NOT RATIFIED** · invocation JRF-03 · 2026-08-13

---

## Scope

**Question given:** specify the distinct temporal and relational meanings of **Affirm ·
Correct · Supersede · Withdraw · Release**; preserve immutable history without allowing
history to retain unauthorized relational influence.

For each act, establish: (1) the human meaning · (2) effect on the original event ·
(3) effect on **standing** · (4) effect on **currentness** · (5) effect on **visibility** ·
(6) what a reader must be able to reconstruct.

**Not examined:** production row counts (nothing was queried against prod — building is
closed and no claim here depends on volume); the gesture-witness mechanism itself (JRF-scope
of the provenance boundary, A2 §2); UI/room layout; RF-R6 pattern temporality; the
two-member shared case (A1 §7 / `relationship_spaces`), where a second person's acts
introduce a temporal axis this inquiry does not address.

---

## Evidence and existing infrastructure

### The five acts, as the governing authority states them

**FACT.** A2 §4 (`docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md:108-113`)
defines all five, with effects: Affirm → `updates affirmed_at`; Correct → new Declaration,
prior gets `superseded_by`; Supersede → "same mechanism, different meaning"; Withdraw → sets
`retrieval_consent = false`, row not deleted; Release → "member-initiated deletion — the only
path that destroys."

**FACT.** A2 §4:119-120 — "⛔ **No system process may perform any of these five acts.** Not
decay, not cleanup, not a migration."

**FACT.** A2 §9:230-233 — "Eligibility is COMPUTED from the declaration event and its
subsequent lineage — never copied into a mutable authority field. No denormalized
`is_eligible` / `is_current` flag may become the thing consulted."

**FACT.** A2 §9:239-241 (precision on Release) — "Release concerns **permission for the
declaration to remain available for relational use.** ⛔ It must NOT be interpreted as a
statement that the original experience was false."

**FACT.** A2 §8 ruling 2 (`:197-200`) — `retrieval_consent` is FALSE when unanswered.
"Silence creates no consent."

**FACT.** A1 §6 "Visible corrigibility" (`RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md:86-90`)
requires the member to see: where it came from · declared or inferred · **when last
affirmed** · whether corrected · whether MAIA may use it.

### ⚠️ Internal tension inside A2 — surfaced, not reconciled

**FACT.** A2 §4 describes Affirm and Withdraw as **mutations of fields on the declaration row**
(`affirmed_at`, `retrieval_consent`). A2 §9 forbids eligibility living in a **mutable authority
field**. `retrieval_consent` as a stored, UPDATEd boolean *is* a mutable authority field, and
it is the field A2 §5.2 says retrieval consults.

**INFERENCE** (from A2 §4 + §9 + A1 §6): these are reconcilable only if `affirmed_at` and
`retrieval_consent` are **names for derived values**, not columns. A stored `affirmed_at` is
additionally *lossy* — it retains the last affirmation and destroys the count and rhythm of
prior ones, which A1 §6 ("when last affirmed") tolerates but Constitution Article XI does not
(below). This tension is named here and left for founder ruling (§7 item 3).

### Constitutional temporal law already in force

**FACT.** `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` Article V BOUNDARY (`:117-119`) — the
distinction "may only be member-declared — **never inferred from silence, cadence, tone, or
elapsed time**."

**FACT.** Same file, Article VI BOUNDARY (`:150-153`) — "Nothing in the room may treat silence
as unfinished business, absence of action as a deficit, or an ending as disappearance.
**Deletion may not be the only available form of completion, and no surface may ask whether a
condition has changed.**"

**FACT.** Same file, Article XI — TIME (`:210-221`) — "A relationship must become **more**
representable as history accumulates, not less. History is part of relationship identity, not
a log attached to it… **Time must be legible** — a date without a year is not a history…
Depth is the design target, not recency… the system may show *when* and *how often the member
wrote*, never *which period mattered*."

**FACT.** `docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md:28` —
"silence is not consent · recurrence is not confirmation · repetition does not promote an
interpretation into member truth… **DO NOT RESURRECT.**"

### Existing supersession substrate — two implementations, opposite shapes

**FACT — the mutating one (⛔ do not copy).** `interpretive_ledger`
(`database/migrations/20260311000002_interpretive_ledger.sql:17-21`) has enum
`cogos_ledger_status` = `active | superseded | expired | revoked`, and
`lib/consciousness/interpretiveLedger.ts:137` executes
`UPDATE interpretive_ledger SET status = 'superseded' WHERE id = $1`. This is exactly the
denormalized authority field A2 §9 forbids: currentness is a stored, overwritten column. It
also carries `expired` — **natural decay**, i.e. a system-performed temporal act.
`ReplySuggestionService.ts:384` (`SET status = 'superseded'`) has the same shape.

**FACT — the append-only one (⭐ copy this).** `library_source_admissions`
(`database/migrations/20260812000001_house_source_admissibility.sql`, dated one day before this
inquiry): `admissibility_state IN ('unreviewed','admitted','excluded','superseded')`,
`version INT NOT NULL CHECK (version >= 1)`, `UNIQUE (source_id, scope, version)`, index on
`(source_id, scope, version DESC)`, and the governing comment at `:90` — "**Nothing is ever
UPDATEd or DELETEd**"; identity is "`source_id + source_checksum + scope + latest append-only
judgment`" (`lib/library/admissibility.ts:13,20`). Its test states the derivation directly:
"consults only the LATEST judgment, so a later reversal supersedes"
(`lib/library/__tests__/admissibility.test.ts:76`). Absence of a row **is** `unreviewed`; the
gate tests for `admitted`, so absence and every non-admitted state fail closed
(`lib/library/admissibility.ts:28-29`).

**NOT ESTABLISHED:** no existing implementation performs supersession as a **member act**. Both
found are system-authored. There is no member-act supersession substrate to reuse — only a
shape.

### Existing Withdraw / Release vocabulary — already ruled, and it contradicts A2 §4

**FACT.** `database/migrations/20260626000003_field_note_release.sql:3-8` — "**Release does NOT
delete history**: the thread is marked released (`released_at`), a 'released' event is appended
to the ledger, and the thread no longer appears as an active carried thread or as the member's
current self-understanding. The past is honored, not erased ('deletion must not become erasure
of authorship')." Column comment (`:31`): "Released threads are **honored history, never used
as current self-understanding**."

**FACT.** `database/migrations/20260730000002_practitioner_visibility_withdrawn_event.sql:7-9`
draws the withdraw/release line explicitly: "`'released'` — **wrong act.** Release removes the
thread from the member's **OWN** field as well; withdrawal leaves it fully present." Column
comment (`:37`): `practitioner_visibility_withdrawn` = "the member ended a practitioner's access
to a thread that remains fully present in the member's own field — **distinct from 'released'**
(thread leaves both fields) and from 'consent_changed'."

**FACT.** Reversible withdrawal precedent exists.
`database/migrations/20260702000002_member_memory_atoms_response.sql` — `member_response_status
IN ('confirmed','rejected','modified')`, NULL default, "The system **NEVER** sets
`member_response_status`… moves only via an explicit member action against a route that requires
authenticated ownership"; "'rejected' **RELEASES** the atom: the loader's surfacing query
excludes it… **Reversible** — the member may withdraw a decline (DELETE), restoring NULL."
Coherence CHECK `member_response_coherent` binds verdict and timestamp so "when did the member
respond" is always recoverable.

### Existing decay mechanism — in the inference substrate only

**FACT.** `database/migrations/20260409000001_relationship_entry_patterns.sql` — `expires_at
TIMESTAMPTZ`, "Confidence decays via `expires_at`. Relational dynamics are stateful, not fixed
traits", detector sets +30 days. The table's own discipline header: "**Observation only.** Not
read back into `buildRelationalContextBlock`. Not rendered in MAIA's speech." This is an
**INFERRED**-class mechanism (A2 §3), and A1 assigns it to RF-R6 pattern work.

### Consent-gate precedent (A2 §7 names these as the shape to follow)

**FACT.** `member_memory_atoms.return_preference` — `member_pulled | contextual_doorway |
ritual_review_opt_in`, default flipped to `contextual_doorway` by
`20260523000001_atoms_return_preference_default_contextual_doorway.sql`.
`member_daily_anchors.surface_preference` mirrors the identical vocabulary verbatim
(`20260702000003:24,44-45`); reader gate at `lib/anchor/loadRecentAnchors.ts:66`.

**FACT — ⚠️ this precedent contains a system-performed act.**
`20260521000001_member_memory_atoms.sql:126-127` — "Phase 2 enforces a maximum; after
decline-twice, `return_preference` **auto-reverts** to `'member_pulled'`." A system process
rewriting a consent field is, in A2 §4 terms, the system performing **Withdraw**. A2 §4:119
forbids that for declarations. Surfaced, not reconciled (§5 below).

**FACT.** Member-only flags already ship with coherence CHECKs binding flag↔timestamp:
`breakthrough_flag_timestamp_coherent` (`20260524000002:32-43`), "The system NEVER auto-sets
`is_breakthrough`."

---

## Proposed design

**All of this section is RECOMMENDATION.**

### R1 — Two tables: an immutable event, and an append-only ledger of acts against it

```
relationship_declarations          -- the event. NO mutable column. Never UPDATEd, never DELETEd.
  id · member_id · relationship_id (NOT NULL)
  declared_text (write-once)
  gesture witness (route · method · server session/auth event id · server timestamp)
  posture_at_creation · created_at

relationship_declaration_acts      -- append-only. Never UPDATEd, never DELETEd.
  id · declaration_id · seq (INT, UNIQUE per declaration, >= 1)
  act ∈ affirm | correct | supersede | withdraw | grant_retrieval | release
  acted_at · gesture witness (same shape — every act is itself an authenticated gesture)
  successor_declaration_id  -- REQUIRED for correct/supersede, NULL otherwise (CHECK)
  member_stated_basis       -- optional member words; never system-generated
```

**Rationale.** If the declaration table carries **no** mutable column, "the original event is
never mutated" stops being a discipline and becomes a structural fact: there is no UPDATE
statement to write, and its absence is greppable. This is A2 §6's own lesson — *prefer a
boundary whose shape makes the violation impossible over one that forbids it* — applied to
time. It also satisfies A2 §9 literally: nothing is copied into an authority field because
there is no field.

`seq` + `UNIQUE (declaration_id, seq)` follows `library_source_admissions`'s
`UNIQUE (source_id, scope, version)` rather than trusting timestamp ordering.

⛔ **Do not** copy `interpretive_ledger`'s shape (UPDATE-the-parent), and ⛔ do not admit an
`expired` state — there is no natural decay for a declaration (R6).

### R2 — The five acts, fully specified

| | **Affirm** | **Correct** | **Supersede** | **Withdraw** | **Release** |
|---|---|---|---|---|---|
| **1. Member means** | "still true" | "that's not what I meant" | "that was true then; it isn't now" | "stop using this" | "I'm done carrying this" |
| **2. Original event** | untouched | untouched | untouched | untouched | untouched |
| **3. Standing** (MAIA may retrieve) | unchanged — ⛔ affirming does **not** create standing (A2 §8.2) | predecessor **permanently ineligible**; successor starts with no standing | predecessor eligible **only as dated history**; successor starts with no standing | **ends**, immediately; reversible by a later `grant_retrieval` | **ends, terminally** — no later act reopens it |
| **4. Currentness** | remains current; affirmation count/rhythm accrues | predecessor → **not current**; successor current | predecessor → **not current, historically true**; successor current | **unchanged** — a withdrawn declaration is still the current one, merely unspeakable | ends currentness; ⛔ predecessor does **not** resurrect |
| **5. Visibility — member** | full | full, both, with lineage | full, both, with lineage | full | removed from active/living surfaces; reconstructable in the record (see §7 item 1) |
| **5b. Visibility — other participant** (RF-R5+) | unchanged | correction must propagate **before** any further offer | as history, dated | ends | ends |
| **6. Reader must reconstruct** | that it was affirmed, **how many times and when** | that the predecessor was **never an accurate capture** — and is therefore not offerable as history | that the predecessor was **accurate as of its date** | that MAIA's license ended, when, and by whose act | that the material was released, when — and ⛔ **not** that the experience was false (A2 §9) |

**Uniform reconstruction rule.** For any declaration at any past instant *T*, a reader must
recover: the exact wording · who authored it · when · under what posture · every act performed
against it with actor and time · its standing and currentness **as of T** · and, if it is not
being spoken now, **why not**. An append-only acts ledger yields all of this by construction. A
mutable `retrieval_consent` boolean yields none of it — it cannot answer "why not", which is
precisely what A1 §6 (visible corrigibility) requires.

### R3 — Affirm is an EVENT, not an annotation

**Recommendation: a new row in the acts ledger; `affirmed_at` is derived as
`max(acted_at) WHERE act='affirm'`.**

An annotation preserves truth **worse**. A member who affirmed in June, September and January
has re-committed to the same sentence three times across seven months; a single overwritten
`affirmed_at` column retains only January and silently destroys the other two. Article XI
requires a relationship to become *more* representable as history accumulates, and permits the
system to show "**how often the member wrote**" — an affirmation count is exactly that, and an
overwriting column makes it unrecoverable. The event form also keeps the observable surface A2
§4 describes (a field that reads as "last affirmed") while satisfying A2 §9's "computed, never
copied."

⚠️ **Affirm must not create standing.** Affirmation answers *is this true?*; retrieval consent
answers *may MAIA speak it?* Collapsing them would let "yes, still true" be read as "yes, use
it", which is precisely the silence-creates-consent failure A2 §8.2 rules out.

### R4 — Correct vs Supersede: give the classification a consequence

**The distinction is real and is exactly as posed:** Correct = an error of **capture** (the
record never accurately stated the member's meaning). Supersede = an error of **currentness**
(the record accurately stated what was true then; it is no longer true).

**Recommendation — the operative difference (A2 §4 does not state this; INFERENCE from A2 §5.4
+ §4's "the prior remains historically true"):**

- **Superseded predecessor** → retrievable **as dated history**: *"You wrote in June: 'we've
  stopped calling'. Is that still how it is?"*
- **Corrected predecessor** → **permanently retrieval-ineligible.** It was never an accurate
  statement of the member's meaning; offering it as history would re-assert a misquote of the
  member in the member's own voice. It stays fully visible to the member and fully
  reconstructable by a reader — but MAIA may never speak it.

Without this asymmetry the two acts are behaviourally identical, and capturing the member's
intent explicitly (A2 §4's ⭐ requirement) would be theatre.

**Who classifies:** the member, always (A2 §9 — "the system may never infer which one a member
intended"). **How:** two distinct doorways in plain language — *"That's not what I meant"* vs
*"That was true then"* — never one form with a type selector. The member never sees the words
"correct" or "supersede"; the doorway they walk through **is** the classification.

**If the member picks wrong — asymmetric remedy.** Correct is strictly more restrictive than
Supersede, so the two mis-picks are not equally dangerous:

- *Supersede chosen where Correct was meant* → **unsafe**: MAIA may quote back a sentence the
  member says misrepresents them. Remedy must be immediate and needs **no new machinery** — the
  moment MAIA offers the historical line, A2 §5's own loop (*retrieve → attribute → offer → ask
  → receive correction*) is the remedy path. The member's answer is a gesture and produces a new
  Declaration; a reclassification act may accompany it.
- *Correct chosen where Supersede was meant* → **safe**: the member loses a retrieval
  affordance, nothing else. Remedy is a new explicit member act, at leisure.

⭐ **Default to the restrictive act when a gesture is ambiguous** — never to Supersede. This
matches `DEFAULT_USE_CONSTRAINT = 'synthesis_only'` and admissibility's "a row created without a
deliberate choice fails safe" (`20260812000001:73-76`).

⛔ Reclassification is a **new appended act naming the prior act**. The acts ledger is never
edited.

### R5 — Withdraw vs Release: what each ENDS

**INFERENCE — the documents do not settle this; A2 §4 and A2 §9 read differently, and repo
precedent contradicts A2 §4 (see §5).** My reading:

> **Withdraw ends MAIA's license to speak the material.**
> **Release ends the material's active claim on the relationship's present.**

- **Withdraw** is about *the system's speech*. The member keeps everything; the relationship
  keeps everything; only retrieval stops. It is **reversible** — the exact shape already shipped
  for atoms, where a decline is undone by DELETE restoring NULL
  (`20260702000002:36-38`).
- **Release** is about *the member's own carrying*. It is not "MAIA, be quiet"; it is "this is
  no longer part of what this relationship is now." It therefore leaves the member's active
  surfaces too — matching `20260730000002:7-9`'s ruled distinction ("release removes the thread
  from the member's **OWN** field as well; withdrawal leaves it fully present") — and it is
  **terminal**: the acts ledger admits no act after a release.

This reading makes A2 §9's precision coherent: Release is about *permission for relational use*
and is emphatically *not* a recantation. A member releasing something is exercising authority
over its use, not revising their life.

**Recommendation on the destroy question (§7 item 1): Release MARKS; it does not destroy.**
A separately-named **Erase** act may carry destruction if the founder wants that path. Three
reasons: (a) Constitution Article VI forbids deletion being the only available form of
completion, which requires a non-destroying completion to exist — Release is its natural
carrier; (b) A2 §9 says Release must not be read as a claim the experience was false, yet
destroying the record makes it unreconstructable, which is functionally indistinguishable from
its never having been true; (c) the repo has already ruled this word once
(`20260626000003:3-8` — "Release does NOT delete history… The past is honored, not erased"),
and a second, opposite meaning for the same word across two member-facing surfaces is the
"names are not identity" trap. ⚠️ Note the concrete collision risk: `member_field_note_events`
is **shared substrate** written by Field Lab, Vision Studio and Now What?
(`20260730000002:18-20`), and `scripts/repro/consent_gate_proof.mjs` DELETEs rows of one event
type as test cleanup (`:12-14`) — a vocabulary collision here has already once put real member
records adjacent to a delete path.

### R6 — Currentness computed at read time, not cached

For declaration **D** at read time **T**, load `acts(D)` ordered by `seq` and fold **three
orthogonal axes**. Nothing is stored; nothing is written on read.

```
CURRENTNESS  := 'historical' if ∃ act ∈ {correct, supersede} with predecessor = D
                'released'   if ∃ act = release
                'current'    otherwise
                -- pure anti-join on successor_declaration_id. Independent of consent.

STANDING     := false                        -- floor: A2 §8.2, silence creates no consent
                then the LAST act on the consent axis {grant_retrieval, withdraw} wins
                := false, terminal, if ∃ release

VISIBILITY   := full to the member for every state except released
                (released → removed from living surfaces; record reconstructable)

ELIGIBLE_TO_SPEAK := STANDING
                     ∧ CURRENTNESS ≠ 'released'
                     ∧ ¬ predecessor-of-a-correct        -- R4: a corrected line is never offerable
                     ∧ (CURRENTNESS = 'current'  →  speak as present, dated)
                     ∧ (CURRENTNESS = 'historical' →  speak ONLY as dated history + ask)
```

**Two safeguards that fall out of keeping the axes orthogonal:**

1. **Withdraw does not alter currentness.** A withdrawn declaration remains the current one —
   it is simply unspeakable. If withdrawal also flipped currentness, an older declaration would
   silently become "what is true now" the instant a member asked MAIA to stop using the newest
   one. That would be the system authoring a change of view.
2. ⛔ **Currentness never resurrects.** When the current declaration is withdrawn or released,
   its predecessor does **not** become current again. The relationship simply has **no current
   declaration** on that matter — which is a truthful state, and the one Article VI protects
   ("the room must be able to hold what cannot be improved").

**Where the fold lives.** Recommend **one Postgres VIEW** (`v_declaration_standing`) plus
**exactly one** application reader that is the only caller. A view is recomputed on every read
and denormalizes nothing, so it is not a cache; it gives a single definition that cannot drift
between callers. ⛔ A **materialized** view is forbidden — that *is* the cached authority bit.

**Cost, stated honestly:**

- *Performance is the small cost.* Per declaration: one indexed scan of `(declaration_id, seq)`
  plus one anti-join on an index over `successor_declaration_id`. Act chains will be short
  (single digits). Sub-millisecond at any plausible member volume. **NOT ESTABLISHED:** no
  volume measurement was taken — building is closed and the tables do not exist.
- *The real cost is that "current" is not indexable.* You cannot cheaply answer "all current
  declarations across all relationships" by looking at a column; every such read pays the
  anti-join. Accept it. That query is the one a cached flag would make fast, and it is exactly
  the query whose answer must never be stale.
- *Second real cost: no DB CHECK can enforce eligibility*, because eligibility is not a column.
  Enforcement must be a single chokepoint reader, and the falsification test is
  architectural — *count the callers that compute this themselves.* Any number above one is the
  defect (§4).
- *Third: reads get slower as history accumulates* — proportionally to a member's own
  faithfulness in tending the record. This is the correct direction for the cost to run, but it
  must be named rather than discovered.

### R7 — Staleness by circumstance, and whether silence is ever a signal

**Recommended ruling: elapsed time NEVER changes standing, currentness or eligibility. There is
no decay, no expiry, no staleness state, and no system-initiated act — ever. What time may do,
and the only thing it may do, is be DISPLAYED.**

This is not a conservative choice; it is the settled law of this project stated three times
independently: Article V — the distinction "may only be member-declared — **never inferred from
silence, cadence, tone, or elapsed time**"; Article VI — "Nothing in the room may treat silence
as unfinished business, absence of action as a deficit"; and the 2026-08-09 founder ruling —
"silence is not consent · recurrence is not confirmation… DO NOT RESURRECT."

So a declaration made in June and untouched since is **exactly as current, and exactly as
eligible, as one made yesterday.** A declaration does not become stale. It becomes **dated** —
and dating it is an obligation, not a downgrade. Article XI: "Time must be legible — a date
without a year is not a history." A2 §5's own model utterance already does this correctly:
*"You wrote in June: 'we've stopped calling'. Is that still how it is?"* The date is carried in
the utterance so the **member** judges currency. Time is a **legibility obligation, never an
authority**.

⛔ **Corollary — no `expires_at` on declarations.** `relationship_entry_patterns.expires_at`
(+30 days) is real and is the right mechanism *for its class* — but that table is INFERRED-class
observation, explicitly "not rendered in MAIA's speech", and A1 assigns it to RF-R6. Extending
decay to declarations would be a system process performing Supersede, which A2 §4:119 forbids
outright.

⚠️ **And no staleness surface.** Article VI's boundary is stronger than it first reads: "**no
surface may ask whether a condition has changed.**" That forbids the polite "review your older
declarations" prompt as a *room feature*. It does **not** forbid A2 §5's "Is that still how it
is?", because that is asked *while MAIA is already speaking the material*, inside the
attribution loop — MAIA may ask when she is quoting; the room may not ask on a timer.

**Is silence ever a temporal signal?** Yes — but only about **one** thing:

> ⭐ **Silence is evidence about the offering, never about the material.** It may only ever
> REDUCE what MAIA says. It may never change what is held to be true, never alter currentness,
> and never create standing.

If MAIA has offered a declaration repeatedly and the member has never engaged, that is real
evidence the *offering* is unwelcome. The atoms substrate already reasons this way via
`surface_count` and the decline-twice rule.

⚠️ **But do not copy the atoms mechanism.**
`20260521000001:126-127` **auto-reverts `return_preference` to `member_pulled`** — a system
process rewriting a consent field, which in A2 §4's vocabulary is **the system performing
Withdraw**, forbidden by A2 §4:119. **Recommendation: keep the effect, refuse the ledger row.**
MAIA may **suppress** offering via a read-time throttle computed from offer history;
she may not **write a withdraw act**. Suppression is MAIA declining to speak. Withdrawal is a
member act with standing. Only the second belongs in the ledger.

---

## Risks and falsification cases

1. **The fold gets duplicated.** The design's single point of failure. **Falsified by:** more
   than one call site computing currentness or eligibility. Standing test: `grep` for the
   anti-join outside the one view and the one reader; any second implementation invalidates
   this design.
2. **`affirmed_at` / `retrieval_consent` reappear as columns** because a reader wanted them
   cheap. **Falsified by:** any column on `relationship_declarations` that is ever UPDATEd. A
   table with no mutable column makes this greppable; a table with one does not.
3. **R4's asymmetry is rejected**, leaving Correct and Supersede behaviourally identical. Then
   the member's classification is decorative and R4 is wrong — the honest response would be to
   merge them into one act rather than keep two words that do the same thing.
4. **My Withdraw/Release reading is wrong** and the founder intends Release-as-deletion
   literally (A2 §4). Then R5 and §7 item 1 fail, and the terminal-state logic in R6 needs
   replacing with a tombstone design that still satisfies A2 §9's "not a statement that the
   experience was false" — which I do not believe is achievable if the wording is destroyed.
5. **The no-decay rule proves unlivable at scale** — a member with years of declarations gets an
   unusably long "current" set. **This does not falsify the rule**; it falsifies the *offering*
   strategy, and the remedy is on the retrieval side (relevance, proximity, throttle), never on
   the standing side.
6. **Read cost grows** with history. **Falsified by:** a measured regression. ⚠️ If that
   happens, the fix is a better index or a narrower read — ⛔ never a cached flag.
7. **NOT ESTABLISHED:** whether members will ever distinguish Correct from Supersede in
   practice. If observed use collapses to one doorway, the two-doorway design is over-built and
   should be revisited — but ⛔ only by observation, never by inference from low counts.

---

## Constitutional conflicts — named, not resolved

1. ⚠️ **A2 §4 vs A2 §9, within one ratified document.** §4 specifies Affirm and Withdraw as
   mutations of `affirmed_at` / `retrieval_consent`; §9 forbids eligibility living in a mutable
   authority field and requires it be computed from the event chain. R1/R3 propose a reading
   that satisfies both (the names denote derived values). **Founder ruling required** — §7
   item 3.
2. ⚠️ **A2 §4 ("Release destroys") vs A2 §9 ("Release concerns permission for relational use…
   must NOT be interpreted as a statement that the original experience was false") vs repo
   precedent (`20260626000003:3-8`, "Release does NOT delete history… the past is honored, not
   erased") vs Constitution Article VI ("Deletion may not be the only available form of
   completion").** Three live meanings of one word. **Founder ruling required** — §7 item 1.
3. ⚠️ **A2 §4:119 ("No system process may perform any of these five acts") vs the atoms
   decline-twice auto-revert (`20260521000001:126-127`)**, which is a system process performing
   Withdraw on the substrate A2 §7 names as the shape to follow. R7 proposes suppression-not-
   withdrawal for declarations. ⛔ This inquiry makes **no** claim about whether the atoms
   behaviour should change — that is another lane's material.
4. ⚠️ **A2 §5's "Is that still how it is?" vs Article VI's "no surface may ask whether a
   condition has changed."** R7 reads these as compatible (utterance-in-loop vs room-feature).
   That reading is mine, not the documents' — **INFERENCE**.
5. ⚠️ **`interpretive_ledger` is live substrate that already implements the forbidden shape**
   (`status = 'superseded'` by UPDATE; an `expired` state produced by decay). It is a different
   domain and RF-R3 must not inherit from it. Named as a contradiction with A2 §9; ⛔ **not** a
   recommendation to change it.

---

## Reuse opportunities

- ⭐ **`library_source_admissions` + `lib/library/admissibility.ts` is the model.** Append-only,
  never UPDATEd or DELETEd, `version` per subject, latest-judgment-wins derived at read, absence
  fails closed, vocabulary widening requires a migration. This is the same problem solved one
  day earlier for a different subject. **Copy its shape; do not build a third.**
- ⛔ **`interpretive_ledger` / `ReplySuggestionService` — do not copy.** Both UPDATE the
  predecessor's status. Correct pattern, wrong mechanism.
- ⭐ **`member_field_note_threads.released_at` + `member_field_note_events`** already implement
  release-as-marking with an append-only authorship ledger, and `20260730000002` already draws
  the withdraw/release distinction. ⚠️ Reuse the **semantics**; ⛔ do **not** write declarations
  into `member_field_note_events` — it is shared substrate with a script that DELETEs rows by
  event type.
- ⭐ **`member_memory_atoms.member_response_status`** — the reversible-decline pattern, with a
  coherence CHECK binding verdict↔timestamp and an explicit "the system NEVER sets this."
  Withdraw/`grant_retrieval` should behave identically.
- ⭐ **Coherence CHECKs** (`breakthrough_flag_timestamp_coherent`, `member_response_coherent`) —
  every act row must carry its timestamp and actor inseparably.
- ⭐ **`return_preference` / `surface_preference` vocabulary** — A2 §7 requires the consent gate
  follow this shape rather than invent a third. ⚠️ Reuse the **vocabulary and default-restrictive
  posture**; ⛔ not the auto-revert.
- ⛔ **`relationship_entry_patterns.expires_at`** — reuse for RF-R6 patterns as A1 directs; ⛔
  never for declarations.
- ⛔ **`member_relational_signals`** — remains inference substrate. No declaration value in
  `source` (A2 §9, A1).

---

## Unresolved founder decisions

1. **Does Release mark or destroy?** — *Recommended ruling:* **it marks.** Release is terminal
   and removes the material from the living field, but the record stays reconstructable; if a
   destroying path is wanted it is a separately named **Erase** act, so that "I am done carrying
   this" and "erase this from the record" are never the same button. *Reasoning:* Article VI
   requires a non-deleting form of completion to exist; A2 §9 says Release is not a claim the
   experience was false, and an unreconstructable record cannot carry that distinction; and the
   repo already ruled this word once in the opposite direction from A2 §4.
2. **Does Correct render the predecessor permanently unspeakable, while Supersede leaves it
   offerable as dated history?** — *Recommended ruling:* **yes.** *Reasoning:* it is the only
   consequence that makes the member's classification load-bearing rather than decorative, and
   quoting a corrected line back would re-assert a misquote in the member's own voice — the
   precise failure A2 §2 requirement 4 exists to prevent.
3. **Are `affirmed_at` and `retrieval_consent` stored columns or derived folds of the act
   chain?** — *Recommended ruling:* **derived; `relationship_declarations` carries no mutable
   column at all.** *Reasoning:* A2 §9 forbids the cached authority bit, A1 §6 requires a reader
   to reconstruct *why* something is not spoken (which a boolean cannot answer), and Article XI
   requires affirmation history to accumulate rather than overwrite.
4. **May elapsed time or member silence ever alter standing, currentness or eligibility?** —
   *Recommended ruling:* **never.** Time is a display obligation — every retrieval carries its
   date so the member judges currency. Silence may only ever reduce what MAIA *says*, via
   read-time suppression, and may never write an act. *Reasoning:* Article V, Article VI, and
   the 2026-08-09 corrigibility ruling each state this independently.
5. **When the current declaration is withdrawn or released, does its predecessor become current
   again?** — *Recommended ruling:* **no. Currentness never resurrects**; the relationship holds
   no current declaration on that matter. *Reasoning:* resurrection would be the system
   authoring a change of view the member never stated, and "no current declaration" is a
   truthful state Article VI explicitly protects.

---

## Dissent and uncertainty

- **I disagree with A2 §4's mechanism for Affirm and Withdraw** — not with their meanings, which
  are right. As written they are field mutations, and A2 §9 in the same ratified document
  forbids exactly that. I read §9 as governing and §4 as descriptive shorthand; ⚠️ if the
  founder reads it the other way, R1/R3/R6 all fail together, and A1 §6's visible corrigibility
  becomes unsatisfiable, since a boolean cannot record why MAIA is silent.
- **My Withdraw/Release reading (R5) is INFERENCE and I hold it with real uncertainty.** A2 §4
  and A2 §9 genuinely point different directions on this word, and I resolved toward §9 plus
  repo precedent. A reasonable reader could resolve toward §4. I have marked it rather than
  smoothed it.
- **I am unsure whether the fold belongs in a Postgres view or in application code.** A view is
  one definition that cannot drift, but it puts governing logic where migrations own it and
  reviewers rarely look; application code is reviewable but duplicable. I lean view + single
  reader, ⚠️ and I do not consider this settled.
- **I may be over-designing the mis-classification remedy (R4).** The asymmetric-remedy argument
  is sound, but it assumes members will use two doorways in a way no evidence yet supports. If
  the simpler design is right, it is *one* doorway with the restrictive semantics — ⛔ not one
  doorway with the permissive ones.
- **I disagree with myself about `member_stated_basis`.** Requiring a reason per act follows
  `admission_basis`'s excellent "a judgment without a stated reason is not a judgment"
  (`20260812000001:57-58`); but demanding an explanation each time a member says "stop using
  this" is friction on a refusal gesture, and refusals should be cheap. I left it optional and
  am not confident that is right.
- **NOT ESTABLISHED:** no member-act supersession substrate exists anywhere in this repo — only
  system-authored ones. Whatever is built here is the first of its kind, and no existing
  behaviour can be cited as precedent for how members actually use these five acts.
