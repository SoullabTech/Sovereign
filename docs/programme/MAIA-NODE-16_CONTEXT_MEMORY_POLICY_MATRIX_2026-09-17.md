# MAIA-NODE-16 — CONTEXT MEMORY POLICY MATRIX

**Status:** CANDIDATE matrix, subject to repository reconciliation.
**Lane:** `MAIA-MAVEN-CANON-01` — documentation only. ⛔ Implementation NOT AUTHORIZED.
**Date:** 2026-09-17
**Depends on:** `MAIA-NODE-15_FOUR_LAYER_MEMORY_MODEL_2026-09-17.md` (read §0 naming hazard first)

---

## 0. What this matrix is

Every MAIA context answers the same four questions:

1. What is available **now**? (Encounter)
2. What gets **retained**? (History)
3. What may **return later**? (Memory)
4. What is intentionally **returnable**? (Continuation)

The answers differ per context. The architecture stays coherent.

⛔ **This is a candidate matrix, not a licence to invent absent substrate.** Where a row names a
context whose substrate does not exist in the repository, the row is a design target. The
`Substrate` column below states what actually exists today.

---

## I. Candidate baseline matrix

| Context | Encounter | History | Memory | Continuation |
|---|---|---|---|---|
| Personal `/maia` | Yes | Yes | Selective | Explicit/domain |
| Sanctuary | Yes | No | No | No by default |
| Journal | Yes | Domain artifact | Selective | Explicit |
| Keeps | Yes | Object | Strong explicit | Separate |
| Changes | Yes | Domain | Authorized | Domain state |
| Relationships private | Yes | Private | Selective | Explicit |
| Relationship shared | Yes | Shared field | Field governed | Explicit |
| Writer's Studio | Yes | Work governed | Work scoped | Work state |
| Practice | Yes | Practice governed | Role scoped | Domain |
| Circles / Co-Lab | Yes | Field governed | Strictly scoped | Contextual |
| Worldcraft | Yes | World governed | World/member scoped | Journey state |
| Living Field | Yes | Governed | Standing only | Source-derived |
| Calendar | Yes | External canonical | Minimal | Scheduled |
| Reminder | Yes | Action history | Minimal | Triggered |
| Astrology | Yes | Optional artifact | Adopted only | Explicit only |
| Ambient device | Yes | Policy-based | Governed | Governed |

## I-a. Substrate reconciliation

| Context | Substrate today | Standing |
|---|---|---|
| Personal `/maia` | `components/maia/MaiaShell.tsx`, canonical turn, atoms loader | LIVE |
| Sanctuary | `lib/sanctuary/turnPosture.ts`, `lib/workbench/sanctuary.ts` | ⭐ LIVE and structurally enforced |
| Journal | `app/api/journal/{list,quick,reflect,chart-integration}` | READ/WRITE routes LIVE |
| Keeps | `app/api/sovereign/keeps/route.ts` + `keepsReadDoctrine.test.ts` | ⭐ LIVE with doctrine |
| Changes | `lib/studio/changes/types.ts`, `app/api/changes/*` | LIVE |
| Relationships | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` | Canon ratified; substrate partial |
| Writer's Studio | `lib/writers-studio/*`, `lib/disclosure/*` | ⭐⭐ LIVE, most mature crossing law |
| Practice | `lib/practice/*`, `PracticeStore.ts` | Substrate present; scope law not located |
| Circles / Co-Lab | `docs/canon/CIRCLE_FIELD_DOCTRINE.md`, circle migrations | Founder-gated |
| Worldcraft | Coaching Journey Template lane (`COACHING-TEMPLATE-EXTRACTION-01`) | Lane not opened |
| Living Field | `lib/maia/living-field/indexAtom.ts`, `living_field_affinities` | ⚠️ See §XIV |
| Calendar | none found in repository | ⛔ ABSENT — design target only |
| Reminder | none found in repository | ⛔ ABSENT — design target only |
| Astrology | `app/api/astrology/*` (11 routes) | Routes LIVE; not MAIA-invocable |
| Ambient device | none | ⛔ ABSENT — design target only |

---

## II. Sanctuary — the strongest row

**Encounter: YES.** Sanctuary must still support a coherent conversation — pronouns, follow-ups,
capability results and temporary context remain available *during* the encounter.

**History: NO by default.** The Sanctuary promise must remain meaningful.

**Memory: NO.** Material does not silently become cross-session memory.

**Continuation: NO by default.** A Sanctuary conversation does not become an open loop merely
because it mattered.

**Explicit crossing may be allowed** — *"Keep that sentence."* / *"Leave just this question
open."* MAIA should name the boundary:

> This conversation is in Sanctuary. I can persist just that item separately if you want.

⭐ **This row is already structurally enforced**, not merely declared. `lib/sanctuary/turnPosture.ts`
resolves posture **once per request at the serving boundary**, passes it by reference to every
content writer, and protected stores refuse content writes when the posture is sanctuary — and
refuse when no resolvable posture is provided at all (fail closed). The class has a private
constructor so a posture cannot be forged downstream. Exiting Sanctuary mid-session does not
retroactively change prior turns.

Constitutional ancestor (Kelly ruling 2026-07-17): *the privacy posture governing a turn is the
posture in force when that turn occurred* — established after incident `SANC-20260614-01`, in
which a session recorded as `standard` had persisted five sanctuary exchanges.

⚠️ **The explicit-crossing carve-out is NOT implemented and must not be assumed safe.** A
"Keep that sentence" path out of Sanctuary would be a write on a sanctuary-posture turn, which
the present store guard refuses by design. Building it is a governed act requiring its own
falsifiers. ⛔ Not authorized here.

---

## III. Personal `/maia`

**Encounter: YES** — current referents, recent capability results, conversational focus,
pending confirmation.

**History: YES by ordinary default**, subject to member settings and Sanctuary. History alone
does not grant future memory eligibility.

**Memory: SELECTIVE / GOVERNED** — eligible only through defined authority: explicit Keep ·
member-authored durable preference · adopted reflection · canonical personal fact · governed
memory eligibility.

⛔ No blanket *conversation existed → MAIA remembers it forever*.

**Continuation: EXPLICIT / DOMAIN-GOVERNED** — *"Leave this question open."* / *"Come back to
this tomorrow."* / an active Change. ⛔ No inferred unfinishedness.

**Ancestors.** `lib/maia/memorySelectionPolicy.ts` already makes eligibility consent-bounded and
version-governed (*"only atoms the member has consented to surface (`return_preference`), never
sacred_protected registers, never member-rejected atoms"*).

⚠️ **TENSION T-1 lands on this row.** `MAIA_MEMORY_CANON_v1.0.md` §II declares a non-negotiable
base chain that *must be queried every time a recognized member speaks*. See the
canonicalization report. ⛔ Unresolved.

---

## IV. Journal

**Encounter: YES** — the active entry and bounded local context.

**History: DOMAIN-OWNED.** ⭐ Do not confuse the *Journal artifact* with *conversation about the
Journal artifact*.

**Memory: SELECTIVE.** A Journal entry's existence does not authorize its entire contents for
ambient retrieval everywhere.

**Continuation: OPTIONAL / EXPLICIT.** A Journal entry is not inherently unfinished. ⛔ Journal
must not become an open-loop generator.

---

## V. Keeps

**Encounter: YES.** **History: OBJECT HISTORY** — the Keep and its provenance persist.

**Memory: YES — EXPLICIT MEMBER STANDING.** *"Keep this"* means *"I choose for this to remain
available to me."* ⭐ The strongest current bridge into durable member-authorized memory.

**Continuation: NO automatically.** ⭐ A Keep can matter without asking for return. *"Come back
to this"* is a separate Continuation act. **This distinction is important.**

**Ancestor.** `app/api/sovereign/keeps/route.ts` already enforces the discipline the row needs:
*"⛔ This route ORDERS but never SELECTS… It does not choose which of a member's lines is most
beautiful, relevant, or timely — that would be the system curating the member's book, which no
gesture underneath it authorizes."* Eight doctrine assertions in
`__tests__/keepsReadDoctrine.test.ts`.

---

## VI. Changes

**Encounter: YES.** **History: DOMAIN-OWNED.** **Memory: YES, within personal continuity where
authority permits.**

**Continuation: DOMAIN-GOVERNED.** Open states: `naming` · `active` · `integrating`.
Not: `casting` · `consulting` · `complete` · `archived`.

⭐ **Repository confirmation.** `lib/studio/changes/types.ts` independently annotates `casting`
and `consulting` as **transient** (*"I Ching cast in progress (transient)"*, *"council
deliberating (transient)"*). The founder's exclusion of them from open states matches what the
code already says they are.

> The state gives **factual** continuity standing. It does not imply psychological importance
> or daily priority.

---

## VII. Relationships — private exploration

**Encounter: YES.** **History: PRIVATE / RELATIONSHIP-BOUND.**

**Memory: SELECTIVE** — member-authorized relational facts and Keeps may return. ⛔
MAIA-generated interpretations do not automatically become durable relational truth.

**Continuation: EXPLICIT.** ⛔ No inferred *"unresolved relationship issue."*

---

## VIII. Shared Relationship Space

**Encounter: YES**, within the bounded shared field.

**History: SHARED-FIELD GOVERNED.** ⛔ Private exploration does not migrate automatically.

**Memory: PARTICIPANT / FIELD-GOVERNED.** MAIA must preserve source and audience.

**Continuation: EXPLICIT SHARED OR PERSONAL** — ⭐ a shared open question and a participant's
private continuation are **not the same object**.

---

## IX. Writer's Studio

**Encounter: YES** — current Work, manuscript locus, editorial proposal, relevant source.

**History: WORK-GOVERNED** — versions, editorial succession, decisions.

**Memory: WORK-BOUND.** Personal material enters only through an explicit crossing.

**Continuation: EXPLICIT WORK STATE.** Desired future substrate may include active Work ·
explicit resume locus · paused locus · unresolved member-marked question · project milestone.

> ⭐ Recent editing alone is not necessarily Continuation.

⚠️ Subject to the T1-C census. ⛔ Do not conflate *last touched* with *paused* with *unresolved*.

### IX-a. Writer's Studio → personal MAIA

**May cross:** member identity · immediate intent · bounded recognition that work prompted
something personal.

**Does not automatically cross:** manuscript text · editorial commentary · Work history ·
project sources.

**Governing seam (existing, mature).** `lib/writers-studio/focusCrossing.ts` C1/C2 and
`lib/disclosure/disclosureBoundary.ts`. ⭐⭐ Any implementation of this row inherits boundary
singularity and the server-side read rather than restating them.

---

## X. Sovereign Practice

**Encounter: YES**, within professional authority. **History: PRACTICE-GOVERNED.**

**Memory: ROLE-BOUND.** ⛔ Client/practice material must not become generic personal memory.

**Continuation: DOMAIN-GOVERNED**, bounded by professional authority.

### X-a. Practice → personal MAIA

The practitioner may say *"I need to talk about how that session affected me."*

**May carry:** the fact that the member has just left a professional encounter · the member's
own personal reaction.

**⛔ Must not carry:** client transcript · client identity · client private material ·
professional notes.

> **The practitioner remains a person. The client remains sovereign.**

⚠️ No explicit practitioner/client memory-scope law was located in the repository. Substrate
exists (`lib/practice/*`); the governing law appears to be **NEW SYNTHESIS** here. Treat as
unproven until censused.

---

## XI. Circles / Co-Lab

**Encounter: YES.** **History: FIELD-GOVERNED**, subject to membership, moderation, visibility.

**Memory: STRICTLY SCOPED.** ⛔ A participant's personal MAIA must not quietly absorb other
participants' contributions.

**Continuation: CONTEXTUAL.** ⛔ Should not become a personal task by default.

**Ancestor.** `docs/canon/CIRCLE_FIELD_DOCTRINE.md`; the `JARVIS-CIRCLES-01` lane and its
ratified FR-06 (*explicit selection only; free text is expressive, never inferred into
taxonomy*) is the direct ancestor of "strictly scoped".

---

## XII. Worldcraft environments (e.g. *Now What?*)

**Encounter: YES** — the configured world's authored method and corpus may shape the encounter.

**History: WORLD-GOVERNED.** **Memory: WORLD / MEMBER-BOUND** — ⛔ the author's ontology does
not automatically become member truth.

**Continuation: WORLD-GOVERNED + MEMBER AUTHORITY.** MAIA may use factual authored stages. ⛔
She may not infer developmental progress beyond them.

**Ancestor.** `COACHING-TEMPLATE-EXTRACTION-01` naming ruling (2026-09-04): Coaching Platform →
Coaching Journey Template → *Now What?* instance. ⛔ That lane is not open.

---

## XIII. Living Field

Living Field is unusual: less a source context than an **integrative receiving field**.

**Encounter: YES.** **History: YES where canonical records exist** — ⛔ but system-derived
affinities do not automatically acquire member meaning.

**Memory: ONLY WITH STANDING** — member-authored · member-marked · member-adopted ·
member-enacted · explicit crossing.

**Continuation: ONLY WHERE THE SOURCE OBJECT SUPPORTS IT.** Living Field may display the
continuity of canonical source objects. ⛔ It may not invent open loops.

Permitted: *"This Change remains active."*
⛔ Forbidden: *"Your relationship with Sophie remains unresolved."* — unless a legitimate source
object says so.

⚠️ **Direct repository confirmation, and a live hazard.** The `JARVIS-CIRCLES-01` I0 census
established that `living_field_affinities` is **system-created from private memory atoms**
(`created_by='system'`, `affinity_score`, `evidence_reason`) and that it is **BARRED ABSOLUTELY
by FR-06** as a substrate for member-authored interest. ⭐ This row is therefore not a new
caution — it is a restatement of a boundary the repository has already ruled and enforced.

---

## XIV. Calendar · XV. Reminders

**Calendar.** Encounter: current query/result set. **History: EXTERNAL DOMAIN** — the provider
remains canonical; ⛔ MAIA does not clone calendar history. Memory: MINIMAL — ⛔ individual
meetings do not become autobiographical memory merely because MAIA read them. Continuation:
temporal domain state; reminder authority is separate.

**Reminders.** Encounter: the reminder under discussion. History: creation/modification/
cancellation record. Memory: MINIMAL — the reminder object carries the state.
**Continuation: YES, WITH FUTURE INTERRUPTION AUTHORITY** — reminder is continuation *plus*
trigger *plus* permission to surface. ⭐ Stronger than an open loop.

⛔ **Both substrates are ABSENT from the repository.** These rows are design targets. ⛔ No
calendar or reminder work is authorized.

---

## XVI. Astrology

Encounter: current symbolic reading. History: may be retained as a reading artifact if member
policy permits. **Memory: NOT AUTOMATIC** — ⛔ a symbolic reading must not silently become
factual personal memory; member-adopted reflection may become memory separately.
Continuation: none automatic.

⚠️ **Precision correction.** Astrology execution is *not* withheld by a gate. Eleven routes
exist under `app/api/astrology/`, and `lib/maia/capabilities.ts` declares `astrology.reading`
and `astrology.transit`. What is absent is the **invocation seam** — the registry has no
consumers (report finding F-1). ⛔ Do not record astrology as "withheld by ruling"; it is
"declared, unwired".

---

## XVII. Ambient device · XVIII. Constrained modality

**The device introduces no new memory policy.** It operates under the same four layers.

> ⭐ The fact that interaction is easy and ambient must not make persistence more permissive.

**Constrained modality (e.g. car)** may narrow capability — READ schedule, spoken reminders,
simple handoff — and may restrict long sensitive record review, complex confirmation,
manuscript editing, sharing private content.

> **Modality can narrow execution. It must never widen authority.**

---

## XIX. Cross-layer transition rules

| Transition | Requires |
|---|---|
| Encounter → History | retention policy |
| History → Memory | memory eligibility |
| Memory → Continuation | explicit or canonical return-state |
| Encounter → Memory | explicit act (e.g. Keep) |
| Encounter → Continuation | explicit *"leave this open"* |
| Sanctuary → any persistent layer | ⛔ explicit crossing (⚠️ unimplemented — see §II) |

### Context crossings require layer decisions

Every handoff answers: **which layer is crossing?**

Worked example — Writer's Studio → personal `/maia`: Encounter referent? *Perhaps.* Work
History? *No.* Work Memory? *No by default.* Continuation target? *Only if the member
explicitly references it.*

---

## XX. Member-facing grammar

| Utterance | Effect |
|---|---|
| *Keep this* | promotes selected material toward durable Memory |
| *Leave this open* | creates Continuation |
| *Journal this* | creates a canonical Journal artifact |
| *Don't remember this* | restricts future Memory |
| *Start fresh* | clears Encounter foregrounding (⚠️ T-1 unresolved) |
| *Delete this* | may remove canonical History/artifact — consequence-specific handling |
| *Bring this with me* | creates explicit cross-context authority |

### Legibility

> Member: *Will you remember this?*
> MAIA: *I can use it while we're talking now. If you want me to bring it back in future
> conversations, you can ask me to keep it.*

In Sanctuary:

> *I can stay with it for this conversation, but Sanctuary won't retain it afterward unless you
> explicitly save something separately.*

---

## XXI. Policy precedence

Candidate ordering when policies conflict:

1. constitutional / privacy boundary
2. current explicit member instruction
3. context-specific policy
4. explicit durable preference
5. canonical domain rule
6. general default

> ⛔ **Never: inferred preference outranks present instruction.**

⚠️ CANDIDATE ordering. Note that (1) above (*constitutional boundary*) outranking (2) is what
makes Sanctuary hold against a member's in-session request to persist — consistent with
CLAUDE.md's Sanctuary invariant 6 (*absolute boundary… including by user request during the
session*). ⛔ The full ordering is not ratified.

---

## XXII. Member rights expressed through the layers

**Right to narrow** — *"For this conversation, don't use my Journal."* / *"Stay inside the
manuscript."* ⭐ The architecture must support restriction as naturally as expansion.

**Right to widen** — *"Use the Journal entry I wrote yesterday."* Widening is purposeful, not
ambient.

**Right to inspect** — *"What are you using right now?"* MAIA should answer in human terms.
⭐ This may become one of MAIA's signature trust capabilities.

**Right to release** — *"Stop carrying that question forward."* Revokes Continuation without
necessarily deleting History or Memory. ⭐ Layer-specific control makes release less destructive.

**Right to erase** — *"Delete the Journal entry itself."* Artifact destruction; derived Memory
and Continuation references must be reconciled. ⚠️ Needs its own evidence gates. ⛔ Note the
open `F5 ERASURE CONFORMANCE FAIL / STOP` standing in `SPM-FC-01-R5` — erasure is **already a
non-conformant area** and must not be casually extended.

---

## XXIII. Why this architecture

**Architectural:** one concept of memory across every environment; four questions, different
answers, coherent whole.

**Psychological:** not everything experienced becomes autobiographical memory; not everything
remembered remains unfinished; not everything unfinished deserves attention.

**Spiritual:** a person is more than what persists. The architecture leaves room for
ephemerality, forgetting, ambiguity, completion, transformation, release, and fresh beginnings.

> A system that remembers everything would not necessarily understand a person better.
> It may understand them less.

**The Aether principle:** Aether here is not total memory. It is **continuity without collapse**
— the whole remains coherent while parts retain their distinct nature. *Relation without fusion.*

---

## XXIV. Governing law

> **Every MAIA context must explicitly distinguish what is present, what is retained, what may
> return, and what remains open.**

> **The right memory policy is not maximum continuity. It is the minimum continuity necessary
> to preserve relationship, authorship, and meaningful return.**

---

## Standing

CANDIDATE matrix · derivation record beneath `MAIA-MAVEN-01` · Sanctuary row ⭐ already
structurally enforced · Sanctuary explicit-crossing ⚠️ UNIMPLEMENTED · Calendar / Reminder /
Ambient ⛔ ABSENT substrate · Practice scope law ⚠️ NEW SYNTHESIS, uncensused · T-1 unresolved
on the Personal `/maia` row · ⛔ no implementation authorized · production UNTOUCHED.
