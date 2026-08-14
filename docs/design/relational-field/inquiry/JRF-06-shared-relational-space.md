# JRF-06 — Shared Relational Space: the private ⇄ shared boundary

**PROPOSED — NOT RATIFIED** · invocation JRF-06 · 2026-08-13

---

## Scope

**The question given:** examine the boundary between a member's private Relational Field and a
consented `relationship_space`. Distinguish each participant's own declarations · jointly affirmed
declarations · private material · MAIA's non-authoritative offerings. A1 §7 marks shared space
*"later"*, so this is **boundary definition, not scheduling**: *what must be true at the boundary so
that shipping RF-R3 today does not foreclose or corrupt RF-R6 later.*

**Not examined:** production row counts (no DB access exercised from this invocation; A1's *"0 rows"*
for `relationship_spaces` is taken as founder-asserted, not re-verified here) · UI/visual design ·
the internals of RF-R4 and RF-R5 · the practitioner/Studio product surface except where it supplies
the only working precedent · the rupture containment itself (JRF's other lanes).

---

## Evidence and existing infrastructure

### The shared object that exists

**FACT (F1).** `relationship_spaces` exists —
`database/migrations/20260630000008_member_relationships.sql:19`. Its header (`:5-14`) explicitly
warns that `member_relationships` *"is constitutionally occupied. This table must not overload it."*

**FACT (F2) — the table is asymmetric by construction.** `relationship_type` is constrained to four
**professional** values only (`:23-28`): `practitioner_client` · `teacher_student` · `coach_client` ·
`supervisor_supervisee`. There is **no peer / personal / mutual value**. Roles are named
`steward_member_id UUID NOT NULL` and `participant_member_id UUID NULL` (`:31-34`), with
`CHECK (steward_member_id != participant_member_id)` (`:78`).

**FACT (F3) — visibility control is one-directional.** `relationship_space_notes.visible_to_participant
BOOLEAN NOT NULL DEFAULT TRUE` (`…0009_relationship_content.sql:53`) and the same column on
`relationship_space_artifacts` (`:90`). There is **no `visible_to_steward`**. The steward may hold
private material inside the shared space; the participant may not. Comment at `:74` states this
intent: *"visible_to_participant=false allows steward private notes."*

**FACT (F4) — only one party consents.** `consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (…
'pending','accepted','declined','withdrawn')` (`:59-60`); `consent_items JSONB NOT NULL DEFAULT '[]'`,
documented as *"additive — future consent types … append here"* (`:63`, `:114-116`). The space is
**created** by the steward with `consent_status 'pending'` —
`app/api/practitioner/practice-field/invite/route.ts:73-79`. The steward's own consent is implicit in
the act of creation; it is never recorded as a consent event.

**FACT (F5) — revocation is representable and has no writer.**
`app/api/relationship-spaces/[spaceId]/consent/route.ts:52-59` writes only `'accepted'`. The only two
routes under `app/api/relationship-spaces/` are `consent` and `threshold` (verified by `find`). Grep
for `relationship_spaces` across `app/`, `lib/`, `components/` returns seven files: the two above,
`app/api/join/[token]/route.ts`, `…/accept/route.ts`, `app/api/practitioner/practice-field/invite/route.ts`,
`app/api/member/portal/route.ts`, `app/api/sovereign/app/maia/list/route.ts`. **None writes
`'declined'` or `'withdrawn'`.** → **NOT ESTABLISHED that any revocation path exists in code.**

**FACT (F6) — the content tables have zero callers.** Grep for `relationship_space_` (messages /
notes / artifacts) across `app/` and `lib/` returns **nothing**. Three content tables exist with no
reader and no writer.

### The live cross-member channel that already exists

**FACT (F7) — one participant's authored material already reaches the other through MAIA's prompt, on
the traffic-bearing route.** `app/api/sovereign/app/maia/list/route.ts:704-724`: for an authenticated
member who is the **participant** of a space with `status='active' AND consent_status='accepted'`, the
route calls `buildPracticeFieldContext(space.id, space.practitioner_display_name)` and injects
`practiceFieldAddendum` into the prompt. Guarded by `isRecognizedUser && !isSanctuary` (`:704`).

**FACT (F8) — what crosses is steward-authored declaration, one direction only.**
`database/migrations/20260701000001_practice_fields.sql:6-7`: *"A Practice Field is not MAIA
configuration. It is practitioner-authored context. MAIA receives it as context, not as
instructions."* The reverse direction is **RESERVED and unbuilt**: `space_shared_atoms` —
*"client-initiated MAIA memory sharing with steward. Default: private. Sharing is an intentional act
by `participant_member_id` only"* (`…0008:129-130`, repeated `…0009:108`). Grep confirms the string
appears **only** in those two migration files — no table, no column, no code.

⭐ **INFERENCE (from F7+F8).** The existing model already answers the consent question once, in a
specific shape: **the author performs an authoring act; the recipient consents to the space; nothing
crosses on the recipient's consent alone, and nothing crosses on the author's consent alone.** Two
distinct acts, at two different grains.

### Sanctuary at this exact seam

**FACT (F9).** The cross-member injection is gated on `!isSanctuary` (F7, `:704`), one of nine such
gates on that route (`:412, 424, 444-445, 453, 653, 704, 729`). A structural test exists —
`app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts:104-113` — asserting that
*every relational write call site sits inside a `!isSanctuary` guard*, parsed from source.

**FACT (F10).** A2 §7 rules: *"a sanctuary session may not produce a Declaration. The gesture is real,
but the containment boundary is absolute."* A2 §7 also rules `posture_at_creation` must be carried
from creation, ⛔ never backfilled.

**FACT (F11).** A5 (`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`) contains the word *Sanctuary*
**zero times** across twelve articles — independently re-derived here by full read. A4 §7 ① makes this
the reconciliation's formal `R3` blocker.

### The private object

**FACT (F12) — the private field is single-owner and cannot represent a second participant.**
`member_relationships` — `database/migrations/20260403000001_relationship_field_v1.sql:5-15`:
`member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE`, plus `name`, `realm`, `bond_type`,
`note`, `archived_at`. **There is no column that could hold a second member.** A shared or jointly
held object is not representable there without the overload migration 8 explicitly forbids (F1).

**FACT (F13) — A2's governing constraints on a declaration.** `relationship_id` **NOT NULL at
creation** (§2 req 3, §9) · `declared_text` **write-once** (§2 req 4, §9) · gesture witness is
server-side, ⛔ never client-asserted (§2 req 2) · `retrieval_consent` is **FALSE when unanswered**
(§8 ruling 2) · eligibility is **computed from the event and its lineage, ⛔ never copied into a
mutable authority field** (§9) · OBSERVED assertions are **in-turn only** before RF-R6, with an
anti-laundering clause covering telemetry (§8 ruling 3) · promotion is **structurally unavailable**
(§6) · declarations get a **dedicated table** (§8 ruling 4).

### Departure / deletion mechanics as they stand

**FACT (F14) — the two migrations disagree with each other about departure.**
`relationship_spaces.steward_member_id … ON DELETE RESTRICT` but `participant_member_id … ON DELETE
SET NULL` (`…0008:31-34`) — the participant may be deleted and silently detached. Yet
`relationship_space_messages.sender_member_id … ON DELETE RESTRICT` (`…0009:17`),
`notes.author_member_id … ON DELETE RESTRICT` (`:48`), `artifacts.uploader_member_id … ON DELETE
RESTRICT` (`:84`). **INFERENCE:** a participant who ever wrote anything cannot be deleted at all; a
participant who never wrote is detached leaving an orphaned space. Neither outcome was designed;
they are two different answers in adjacent files.

### The Co-Lab gate — does this design trigger it?

**FACT (F15).** `docs/ops/COLAB_RELEASE_GATE.md:13-14` names `scripts/verify-colab-boundaries.ts`.
**That path does not exist on this tree** — verified three ways: `ls`, `find`, and `git ls-files`
(empty). `git log --all` shows it was **renamed** in `b806fa49c` to
`scripts/verify-constitution-colab.ts`, which does exist. **The gate document cites a stale path.**

**FACT (F16).** `grep -c relationship_space scripts/verify-constitution-colab.ts` → **0**. The shared
space is checked by **no** boundary assertion today. The gate does check `member_memory_atoms`
`memory_scope` + `team_id` (`:257, :313, :409`).

**FACT (F17).** The gate document carries its own warning (`:54`) that the `31 passed` pass-condition
is not re-observed since section 12 added two assertions; `33` is derived, not measured.

**ANSWER — INFERENCE (from F15–F17): YES, this design would trigger the gate.** A shared relational
space introduces a cross-member scope key on memory-shaped objects — precisely the pattern of gate
check 8 (`memory_scope` on `member_memory_atoms`), and `space_shared_atoms` is by its own reserved
description a cross-member atom-sharing scope. Per the gate's own §"Adding checks", a new
scoped surface **must** add a check and update the pass count. Two prerequisites therefore attach to
any R6 work: fix the stale script path in the gate document, and re-observe the true pass count.

---

## Proposed design

All items **RECOMMENDATION**.

### P1 — The two-key rule, and the answer on single-party consent

**Nothing crosses the boundary on one consent, but the two keys are not symmetric.**

| Key | Held by | Grain | What it authorizes |
|---|---|---|---|
| **Share act** | the **author** of the declaration | **per declaration** | that *this wording* may be offered inside *this space* |
| **Space consent** | the **recipient** | per space | that the recipient will receive shared material at all |

**Recommended ruling on the question asked:** **one participant's consent IS sufficient to surface
their own declaration — and is never sufficient to surface anything about the other participant.** A
member speaking their own words into a room they have been consented into is exercising authorship
(A5 II), not disclosing someone else's material. The recipient's consent is to *the space*, not to
each item; requiring per-item recipient consent would make the room a permissions queue and would
give B a veto over A's own speech — an inversion of A5 II in the opposite direction.

⚠️ This is exactly the shape the live substrate already implements (F7+F8 INFERENCE): the steward
authors a Practice Field, the participant consents to the space, and the material flows. R6
generalizes that precedent; it does not invent a consent model.

### P2 — Sharing is a new event referencing the declaration, never a copy and never a mutation

A `declaration_shares` event — `declaration_id` · `space_id` · `shared_by_member_id` · gesture witness
(route + method + server session identifier + server timestamp, per A2 §2 req 2) · `shared_at` ·
`revoked_at`. ⛔ No column on the declaration itself. ⛔ No copy of `declared_text` into the space.

Rationale: A2 §9 rules eligibility is **computed from the event and its lineage, never copied into a
mutable authority field**. A `is_shared` boolean on the declaration would be exactly the cached
authority bit that ruling forbids, and copying the text would break write-once (A2 §2 req 4) by
creating a second wording that can drift.

### P3 — Joint affirmation: **two linked events, never a new object**

**Recommended ruling: a jointly affirmed declaration is NOT a new object.** It is declaration `D`
authored by A, plus an affirmation event authored by B that references `D`.

Why not an object: a jointly-authored declaration would have **no single author**, and A2 §2 req 1
requires *"the `member_id` of the authenticated actor — the person whose session performed the
gesture"*. A two-author row cannot satisfy it. Worse, a joint object is the shape that lets *shared
truth* exist independently of anyone having said it — the precise failure A1 §7 forbids: ⛔ *"No
private interpretation may silently become shared truth."*

Rendering must therefore always name both acts and both dates:
> *"You wrote in June: 'we've stopped calling.' B affirmed this on 12 July."*

**Withdrawal asymmetry — recommended ruling:** the author owns the wording; the co-affirmer owns their
act. When A withdraws and B does not:

- A's `declared_text` stops being retrievable **immediately** in the shared space (A2 §4: withdrawal
  *"retrieval stops immediately; the row is not deleted"*).
- B's affirmation event **is not deleted** — it was a true act B performed. It becomes a dated record
  that B affirmed something **now withdrawn, rendered without its wording**.
- ⛔ Never delete B's act to satisfy A's withdrawal. ⛔ Never keep A's wording visible to satisfy B's
  affirmation. Those are the only two failure modes, and they are opposite.

⚠️ **Residual leak, not closed (see Dissent):** the dated record tells B that A withdrew. That is
information about A's act. I do not believe a shared space can conceal that it changed.

### P4 — The inference channel, modelled explicitly

This is the leak that matters, and *"MAIA must not quote private material"* does not close it.
Five channels by which B may infer A's private material from MAIA's shared-space behaviour:

| # | Channel | Mechanism | Closed by |
|---|---|---|---|
| 1 | **Quotation** | MAIA repeats A's private wording | P1 (trivially) |
| 2 | ⭐ **Selection** | MAIA's *choice of what to offer* is conditioned on A's private declarations. No private word is uttered; the **presence of the offering** is the signal — "would it help to look at the boundary here?" appears only when A privately declared a boundary concern | P4-control below |
| 3 | **Timing** | an offering appears immediately after A's private session | P4-control + no cross-session triggering |
| 4 | **Absence** | MAIA visibly declines a topic it previously engaged → B infers a withdrawal | ⛔ **not closable**; see Dissent |
| 5 | **Differential** | B compares MAIA's shared-space behaviour before and after A joined, or across two spaces | P4-control |

⭐ **P4-control — the load-bearing recommendation.** MAIA's shared-space utterances must be a function
**only of shared-space inputs**. Not *filtered from* the private composition — **composed from a
separate input set**: `{declarations shared into this space · this space's own content · the speaking
member's own material}`. A filter over a private composition leaves channel 2 wide open, because the
*selection* was already made against private material before the filter ran. A separate composition
path closes it, because the private material was never an input.

This is not novel architecture: it is what `list/route.ts:704-724` already does — the practice-field
addendum is composed from `space.id`, not from the steward's private field.

**Additional constraints on MAIA in a shared space:**
- Offerings are labelled MAIA's own (A1 §7 *"MAIA's explicitly labelled observations"*; A5 VIII).
- Per A2 §8 ruling 3, an OBSERVED assertion is **in-turn only** — ⛔ nothing MAIA observes in a shared
  space may persist into **either** member's private field before RF-R6, and the anti-laundering
  clause extends that to telemetry and agent-run metadata.
- A5 III's test (*every sentence must survive being read aloud prefixed "In my experience, …"*) must
  be re-derived per-speaker in a shared room: a sentence that passes for A may still be a claim about
  B when B is in the room reading it. See Conflict C2.

### P5 — Peer space is a sibling of `relationship_spaces`, not a fifth `relationship_type`

A1's reuse note says *"Item 7 belongs here."* **I agree about the consent spine and disagree about the
whole object.** Adding a `peer` value to the `relationship_type` enum (F2) would import
`visible_to_participant` (F3) into a relationship of equals — a steward privilege with no mirror.
**Recommendation:** reuse `relationship_spaces`' **consent and lifecycle spine** (`consent_status`,
`consent_items`, `invite_token`, `status`), and do **not** reuse the three content tables, which are
in any case caller-less (F6). Whether that is a new table or a symmetric-role variant is an
implementation question below the authority boundary.

### P6 — ⭐ What must be true in RF-R3 **today** so RF-R6 is not foreclosed

This is the actual deliverable of this invocation. Four invariants on the RF-R3 declaration table:

| # | Invariant | Foreclosure it prevents |
|---|---|---|
| **a** | The declaration is **single-authored**. ⛔ No `co_author`, no `participants[]`, no `is_shared` column — ever. | A co-author column makes P3 unavailable and creates authorless shared truth. |
| **b** | `relationship_id` binds to the author's **own** `member_relationships` row (single-owner, F12). A shared space must be referenced by a **separate key on a separate event** (P2). ⛔ RF-R3 must not add a second-member column to `member_relationships`. | The overload migration 8 explicitly warns against (F1); it would make private and shared indistinguishable at the referent. |
| **c** | ⭐⭐ `retrieval_consent` must be **scope-qualified from day one** — defined as consent for *the member's own private field*, with sharing as a separate event. | **The single highest-value non-foreclosure act.** A bare boolean meaning *"MAIA may use this"* will silently come to mean *"in any space"* the moment R6 exists — and the alternative is re-consenting every declaration ever made. |
| **d** | `posture_at_creation` carried from creation (A2 §7), ⛔ never backfilled. | Preserves the ability to answer the Sanctuary question later rather than losing the fact. |

⭐ Only **(c)** costs anything to get right now, and only **(c)** is irrecoverable later.

### P7 — Departure, revocation, and death

- **Withdrawal of space consent** → all `declaration_shares` for that space get `revoked_at`;
  declarations return to author-private; each member retains their own material plus dated records
  that shared material once existed. ⛔ Never cascade-delete one member's own words because the other
  left.
- **Death of a participant** → A5 VII: *"A relationship with someone who has died remains a
  relationship in the member's lived world — not an archived contact."* The current
  `participant_member_id … ON DELETE SET NULL` (F14) does not honour this: it detaches silently.
  **Recommendation: archive, never delete; the survivor must still be able to enter the space.**
- **F14's internal disagreement must be settled before R6 ships** — it is presently two answers in
  adjacent files, and neither was chosen.

---

## Risks and falsification cases

1. **P4-control may be infeasible on the live route.** `list/route.ts` composes one prompt for one
   member. Whether a genuinely separate shared-space composition path can exist there is
   **NOT ESTABLISHED** — I did not trace the full composition. If it cannot, P4 degrades to a filter
   and channel 2 stays open. *Falsifier:* trace the addenda composition in `list/route.ts` and
   `lib/sovereign/maiaVoice.ts` and find no seam for a second input set.
2. **If `relationship_spaces` holds live rows with real content in production**, the "0 rows / no live
   shared semantics" premise this design rests on is falsified, and F6's caller-less content tables
   would need re-explaining. Not verified here.
3. **If the founder means R6 to be the *practitioner* space rather than a peer space**, P5 and much of
   C1 reframe entirely — the asymmetry becomes correct rather than a mismatch.
4. **P1 may be wrong at the edges.** A member's own declaration can name the other participant
   (*"he stopped calling"*). Under P1 that crosses on A's act alone, and B reads a characterization of
   themselves. A5 IX admits the member's remembered experience as legitimate — but IX was written for
   **private** reflection where B never reads it. *Falsifier:* the Soul Test (A5 XII) applied to the
   difficult colleague and the former partner. I believe P1 survives it only because the alternative
   (B vetoing A's speech) fails it worse — but I do not claim it passes cleanly.
5. **Selection-channel closure is unverifiable by code review alone.** Proving MAIA's shared-space
   output is not conditioned on private material requires a differential witness (same space, two
   private states, identical output), not a read of the composition function.

---

## Constitutional conflicts — named, not resolved

**C1 — A1 §7 vs migration 8's type enum.** A1 §7 describes *"two consented people"* with
*"Kelly's experience · the other person's experience"* — a **peer** object. A1's reuse note places it
in `relationship_spaces`, which is **professional and asymmetric by construction** (F2, F3): four
role-typed values, steward/participant, and a steward-only private-material privilege. Placing a
relationship of equals in it either imports the asymmetry or requires changing the object.

**C2 — A5 III's "In my experience…" test does not survive translation to a shared room.** III defines
The Between as *the member's* phenomenology and tests every rendered sentence against a first-person
prefix. In a shared room there are **two Betweens**, and a sentence that passes the test for A may
still land as a claim about B when B is reading it. A5 does not say what governs where two members'
Betweens disagree.

**C3 — A5 IX's consent framing inverts across the boundary.** IX rules *"'Do we have consent?' is the
wrong question: a person reflecting privately on their marriage cannot be required to make their
spouse create an account."* That is right for private reflection. In a shared space where the spouse
**has** an account and is reading, it becomes exactly the right question. IX does not distinguish the
two settings, and its BOUNDARY is written as though only the private setting exists.

**C4 — ⚠️ SANCTUARY (A4 §7 D5). STATED, NOT RESOLVED.** Three instruments speak and one is silent:
- `CLAUDE.md` Sanctuary Invariant 6 — absolute: *"under any circumstances, including by user request
  during the session."*
- A2 §7 — a sanctuary session may not produce a Declaration (F10).
- The live route already gates the cross-member injection on `!isSanctuary` (F9), with a structural
  test enforcing it.
- A5 — **silent; zero mentions across twelve articles** (F11).

**The collision this invocation adds, which none of the four answers:** *what happens when a member
enters a **shared** space in Sanctuary?* Two readings, both defensible, both harmful:
(i) the shared space is suppressed — but its absence is visible to the other participant, which is
inference channel 4 (P4), so Sanctuary itself becomes a signal; (ii) Sanctuary is unavailable inside
a shared space — but then a member cannot speak unrecorded in the one room where another human is
present. ⛔ **I do not resolve this.** It is prior to R6 and belongs to the ratification act.

**C5 — A5 II does not contemplate a record two members both have standing in.** II vests authorship in
the member over *their own* relational record. A jointly affirmed declaration (P3) is two records with
a link between them; II is silent on whether B's affirmation event is B's record, A's, or the space's.

**C6 — Portability (A4 §7 ⑤) is undecided for shared material.** If the canon-level portability
invariant extends to Relationship Rooms, whose export contains a jointly affirmed item — A's, B's,
both, with or without the other's wording? The decision list asks about portability but not about
jointly held objects.

---

## Reuse opportunities

⛔ No third implementation. All verified present on this tree:

- **`relationship_spaces` consent + lifecycle spine** — `consent_status`, `consent_accepted_at`,
  `invite_token`/`invite_expires_at`, `status`. Do not invent a second invitation or consent state
  machine (F1, F4).
- **`consent_items JSONB`** — documented as *additive*, explicitly anticipating future consent types
  (F4, migration 8 `:114-116`). A shared-declaration consent type appends here.
- **`space_shared_atoms` reserved jurisdiction** (F8) — the direction R6 needs is already **claimed**
  in both migrations, with its default (`private`) and its actor (`participant_member_id only`)
  already stated. Claim it; ⛔ do not build a parallel sharing mechanism beside it.
- **The `!isSanctuary` guard and its structural test** —
  `app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts` (F9). This is a working
  acceptance instrument for "every write is guarded"; the same parse pattern extends to
  "every cross-member read is space-scoped."
- **The practice-field injection as the composition precedent** — `list/route.ts:704-724` (F7). It is
  the only working example on this tree of consented cross-member material reaching MAIA's prompt, and
  it is already composed from `space.id` rather than from private material — which is P4-control,
  already implemented once.
- **`retrieval_consent` shape** — A2 §7 already rules it should follow atoms' `return_preference` and
  Daily Anchor's `surface_preference`, ⛔ not invent a third. P6(c) qualifies the scope; it does not
  change the shape.
- **The Co-Lab gate** — extend `scripts/verify-constitution-colab.ts` (F15, F16), do not write a new
  verifier.

---

## Unresolved founder decisions

**① Is one participant's consent sufficient to surface *their own* declaration into a space the other
has consented to?**
**Recommended ruling: YES for their own wording, NEVER for anything about the other.** Two keys at two
grains — the author's per-declaration share act, the recipient's per-space consent. Requiring per-item
recipient consent would give B a veto over A's own speech, inverting A5 II; requiring nothing of the
author would let a space consent become a standing licence over a private field.

**② Is a jointly affirmed declaration a new object, or two linked events?**
**Recommended ruling: TWO LINKED EVENTS. No jointly-authored declaration object may exist.** A2 §2
req 1 requires a single authenticated actor per assertion; a two-author row cannot satisfy it, and a
joint object is precisely how private interpretation becomes shared truth with no one having said it
(A1 §7).

**③ When the author withdraws a shared declaration and the co-affirmer does not, what survives?**
**Recommended ruling: the wording goes immediately; the co-affirmer keeps a dated record that they
affirmed something now withdrawn, rendered without its text.** The author owns the words; the
co-affirmer owns their act. Deleting B's act to satisfy A, or keeping A's words to satisfy B, are the
only two failure modes and they are opposite.

**④ Must MAIA's shared-space utterances be composed from a separate input set, rather than filtered
from the private composition?**
**Recommended ruling: YES — separate composition.** A filter runs *after* selection has already been
conditioned on private material, leaving inference channel 2 open. This is a structural choice that
becomes very expensive to retrofit, and the live practice-field path already demonstrates the pattern.

**⑤ Must RF-R3 define `retrieval_consent` as scoped to the member's own private field, with sharing as
a separate event?**
**Recommended ruling: YES.** This is the single decision that determines whether R6 can be built
without re-consenting every declaration ever made. A bare *"MAIA may use this"* boolean will silently
acquire *"in any space"* the moment a shared space exists.

**⑥ Is the peer shared space the same object as `relationship_spaces`, or a sibling sharing its consent
spine?**
**Recommended ruling: a SIBLING sharing the spine.** Adding a peer value to a `relationship_type` enum
built for four professional roles imports `visible_to_participant` — a steward-only privilege to hold
private material inside the shared space — into a relationship of equals, where it has no mirror and
no justification.

---

## Dissent and uncertainty

**I disagree with A1's reuse note as literally stated.** *"Item 7 belongs here"* is right about the
consent spine and wrong about the object. The table is asymmetric by construction (F2, F3) and its
content tables encode a steward privilege. I do not think this is an error in A1 — I think A1 was
naming *where consent already lives*, correctly — but a future reader taking it literally would place
a relationship of equals in a professional-role container and inherit the asymmetry silently. Named,
per the brief, not reconciled.

**I disagree with my own P3 on one point.** The dated withdrawal record tells B that A withdrew — which
is information about A's act, obtained without A's consent. I recommended it anyway because the
alternative (silently vanishing the record) means B's own true act disappears without explanation.
**I do not claim this leak is closed.** A shared space cannot conceal that it changed; the honest
position is that channel 4 (absence) is **structurally open**, and R6 should say so to members rather
than claim a containment it does not have.

**NOT ESTABLISHED, explicitly:**
- Whether any revocation path for `relationship_spaces` exists in code (F5). Schema representable;
  no writer found by two methods.
- Whether P4-control is achievable on the current single-prompt composition in `list/route.ts` — I did
  not trace the addenda composition to the prompt builder.
- Production row counts for `relationship_spaces`, `relationship_space_*`, and `member_relationships`.
  No DB access exercised. A1's *"0 rows"* is taken as founder-asserted.
- Whether the Co-Lab gate's true pass count is 31 or 33 — the gate document itself records this as
  derived, not observed (F17).
- Whether `space_shared_atoms`' reserved semantics (*"intentional act by participant_member_id
  only"*) were meant to be symmetric in a peer space. The reservation is written from the
  professional-asymmetric frame.

**Where I am least confident:** P1's edge case (Risk 4). A member's own declaration frequently names
the other person, and under P1 it crosses on the author's act alone. I believe A5 IX admits it and
A5 II requires it, and I believe the alternative fails the Soul Test worse — but this is the point in
the design where I would most expect a founder ruling to overturn me, and it should be read as a
recommendation under genuine uncertainty rather than a finding.
