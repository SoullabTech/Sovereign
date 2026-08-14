# JRF-08 — Corpus Callosum Synthesis · Relational Field Design Inquiry

**PROPOSED — NOT RATIFIED** · steward: JARVIS · founder: Kelly · 2026-08-13
**Building remains closed.** Nothing in this document authorizes implementation.

---

## 0. Provenance

Eleven invocations ran in parallel, blind to each other. Each read
[`00-INVOCATION-BRIEF.md`](00-INVOCATION-BRIEF.md) before working; each wrote exactly one file and
modified no other.

| ID | Inquiry | File | Tool uses |
|---|---|---|---|
| JRF-01 | Member experience | `JRF-01-member-experience.md` | 21 |
| JRF-02 | Provenance adversary | `JRF-02-provenance-adversary.md` | 26 |
| JRF-03 | Temporal intelligence | `JRF-03-temporal-intelligence.md` | 12 |
| JRF-04 | MAIA retrieval and offering | `JRF-04-maia-retrieval-offering.md` | 30 |
| JRF-05/Fire | Elemental council | `JRF-05-fire.md` | 29 |
| JRF-05/Water | Elemental council | `JRF-05-water.md` | 13 |
| JRF-05/Earth | Elemental council | `JRF-05-earth.md` | 32 |
| JRF-05/Air | Elemental council | `JRF-05-air.md` | 18 |
| JRF-05/Aether | Elemental council | `JRF-05-aether.md` | 22 |
| JRF-06 | Shared relational space | `JRF-06-shared-relational-space.md` | 29 |
| JRF-07 | Adversarial witness | `JRF-07-adversarial-witness.md` | 13 |

**Authorities bound before invocation** (all verified to exist):
A1 `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` ·
A2 `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` ·
A3 A1 §"Crosswalk — retired labels" ·
A4 `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` §7 ·
A5 `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`.

**Steward-verified independently of any invocation** (commands run by JARVIS):

- `scripts/verify-colab-boundaries.ts` **does not exist**; renamed to `verify-constitution-colab.ts`
  in `b806fa49c`. Still cited as mandatory at `CLAUDE.md:406,410` and
  `docs/ops/COLAB_RELEASE_GATE.md:14,73,90`. **Out of scope — reported, not fixed.**
- Custody: HEAD `d41b8b355` on `feature/labtools-redesign`; local `clean-main-no-secrets` is
  `f9a7326f1` (**stale**); `origin/clean-main-no-secrets` is `22200f967` = stated production.
  Production is **not** an ancestor of HEAD but **is** on origin trunk.
- **R23/R24 do not exist.** They appear nowhere in the repo outside JRF-04's own file. The steward
  introduced them in the JRF-04 invocation prompt; this is a steward error, corrected here. JRF-04's
  further claim that R12 is absent is **not confirmed** — R12 appears in the corpus.

**Steward-asserted, unverified:** production remains `22200f967` (founder-stated). No invocation
exercised database or runtime access. **Every production row count below is second-hand.**

---

## 1. Genuine convergence

Convergence increases confidence. **It does not confer authority**, and where invocations reached the
same place by different questions, both readings are preserved rather than merged.

**C-1 · The five acts do not survive contact — reached three ways.**
JRF-03 (mechanism: Correct and Supersede differ only in meaning, so the classification is decorative
unless it changes offerability) · Water (capacity: Water's territory is the interval before
nameability, and a member in grief cannot perform the classification) · JRF-01 (experience: as two
buttons they share composer, mechanism and outcome, and would feel identical). **Three distinct
questions, one convergent answer.** JRF-01 alone supplies a resolution: they diverge only if the
*entry point* diverges — Correct reached from the words, Supersede reached from the date.

**C-2 · `relationship_field_state.elemental_dynamics` is a pre-cut socket.**
Earth and Fire independently: the column exists (`20260403000001:30`), is read and returned on a
member-facing route (`app/api/relationships/[id]/route.ts:43,76`), has **no writer anywhere**, and is
non-null in 0 of 10 production rows (second-hand). Both predict the first A1 §4 implementer fills it,
persisting an elemental reading as a mutable authority field — which A2 §9 forbids. Both recommend
dropping it.

**C-3 · The containment A2 names as structural has no code referent.**
JRF-02 (three greps plus a working control) and JRF-01 (two structurally different searches)
independently establish that `DECLARATION_CAPABLE_SOURCES` **exists only in documents**. The operative
mechanism is a DB `CHECK (source IN (…))` at `…000010:49` — real, and liftable by a two-line
migration.

**C-4 · Selection, not quotation, is the leak.**
JRF-06 (a shared space: MAIA's *choice* of what to offer, if conditioned on A's private declarations,
signals them to B without a word — a filter cannot close this, only a separate input set) and Fire
(a private room: ordering, badging and prominence deliver an elemental reading with no utterance, so
no provenance, nothing to quote, no handle to correct) and Aether (even a bare juxtaposition asserts
relevance by choosing the pair). **Three invocations, three surfaces, one mechanism.**

**C-5 · Prohibition scenarios yield uninterpretable nulls.**
JRF-07 formalizes it: a null observation has five causes — boundary held · never apprehended · never
wired · never loaded · laundered elsewhere. Water reaches the same wall from measurement: correction
rate is not evidence of accuracy on Water-class offers, because a merely tender inaccurate offer is
affirmed too. Both require a paired positive control. A1's own precondition 1 already names this.

---

## 2. Unresolved contradictions — preserved, not reconciled

**X-1 · A2 contradicts itself on Release.** §4: Release is "the only path that destroys." §9: Release
"concerns permission for the declaration to remain available for relational use" — which is §4's
definition of *Withdraw*. Deletion is not a permission state. Raised independently by Air and JRF-03.
Two implementers reading in good faith build irreversibly different systems, and the divergence is
maximally visible to the member: "remove it" either destroys or silently retains.

**X-2 · A1 §5 and A2 §8③ cannot both hold.** JRF-07: *"You corrected my earlier understanding; I will
carry the correction forward"* requires persisting an OBSERVED assertion at member level; §8③ makes
OBSERVED in-turn-only before RF-R6. **One must be given up.**

**X-3 · `current` carries two meanings.** Air: *not superseded* in A2 §2/§9, *not expired* in A1:174's
`expires_at` reuse. The decay reading additionally requires the cached authority bit §9 forbids.

**X-4 · Earth vs Air on lineage — resolved by the steward, recorded because both were right.** Earth
reported this worktree lacks the rupture containment; Air derived a defect from the same area and then
**retracted it**, finding its evidence bound to a stale local ref. Steward verification: both hold.
The worktree lacks it; origin trunk has it. **Air's retraction is preserved as the most valuable
methodological artifact of the inquiry** — an impeccable distinction referring to nothing.

**X-5 · Aether vs JRF-06 on what the shared space is.** Aether: convergence between two members'
declarations is not an author, and must create no joint object. JRF-06: joint affirmation is two
linked events, never a new object — but reports `relationship_spaces` is **professionally asymmetric
by construction** (steward/participant, `visible_to_participant` with no `visible_to_steward` mirror),
while A1 §7 describes a **peer** object. A1 is right about the consent spine, wrong about the object.

**X-6 · JRF-04 vs A1/A2 on doctrine.** A founder-authored, tested relational block already exists —
`lib/relationships/buildRelationalContextBlock.ts` (V1.1, 12 conversation loops) — whose governing
doctrine is *"What you are given to see is not what you are given to say."* That **contradicts**
A1/A2's retrieve → attribute → offer. It is imported by exactly one file: the retired R19 oracle lane.

---

## 3. Constitutional collisions

| # | Collision | Raised by |
|---|---|---|
| K-1 | A5 Article VII forbids any surface asking whether a condition has changed. A2 §5's exemplar — *"Is that still how it is?"* — and A1 §3 ask exactly that. | Water, Fire |
| K-2 | A1 §4 assigns Aether *"what is trying to emerge"* — a Recognition-layer assertion, colliding with `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:103`. Phrasing it as a question does not launder it. | Aether |
| K-3 | The live relationship room opens on machine classification: *Current Field* (fieldTone / dominantPattern / developmentalTheme) renders **above** the member's own timeline. Eight FACT-level collisions catalogued C1–C8. | JRF-01 |
| K-4 | `RelationshipTimeline.formatDate` emits dates with **no year** past 7 days while `RelationshipCard` includes it — the two surfaces disagree about time. Article XI: a date without a year is not a history. | JRF-01 |
| K-5 | Air's lens is the most dangerous because it looks the safest — "communication / misunderstanding" reads as mechanism, not interpretation, and so imposes a taxonomy without being seen to. Invariant 14. | Air |
| K-6 | Sanctuary is constitutionally silent (A4 §D5) and undesigned at the declaring door and in the shared space. | JRF-01 (X3), JRF-06 |

**K-1 is settled by an existing instrument.** A5 is canon; A1/A2 are design documents. Canon governs.
This is recorded as a needed correction to A2's exemplar, **not** as a founder question.

---

## 4. Existing infrastructure — reuse, do not rebuild

The brief forbade duplication. What the invocations found already built:

- **A full authenticated member-facing relationship surface** — `app/relationships/page.tsx`,
  `app/relationships/[id]/page.tsx`, four API routes, `member_relationships` / `relationship_entries` /
  `relationship_field_state` (`20260403000001_relationship_field_v1.sql`). Server-scoped by
  `session.memberId`, so **A2's gesture witness is producible with no new auth work**. (JRF-01)
- **A working read-time-derivation model, one day old** — `library_source_admissions`
  (`20260812000001`) + `lib/library/admissibility.ts`: append-only, latest-judgment-wins computed at
  read, absence fails closed. Its counterexample is also present: `interpretiveLedger.ts:137` does
  `UPDATE … SET status='superseded'` — the same problem solved the forbidden way. (JRF-03)
- **The cross-member channel, already demonstrating the correct control** —
  `app/api/sovereign/app/maia/list/route.ts:704-724` injects a steward's authored Practice Field into
  a participant's prompt, gated `isRecognizedUser && !isSanctuary`, composed from `space.id` and never
  from the steward's private field. **The inference-channel answer is already implemented once.** (JRF-06)
- **The consent shape** — `surface_preference` / `return_preference`, which A2 §7 already directs
  toward. Do not invent a third mechanism. (JRF-01)
- **The egress chokepoint** — `finalizeMemberFacingText` → `enforceIdentityPredicateConstraint`
  (`maiaService.ts:2362`/`:3031`). (JRF-04)
- **A severed, tested relational block** — see X-6. Same severance shape as spiral state.

---

## 5. Proposed design additions — RECOMMENDATION class only

1. **Immutable declaration table with no mutable column at all**, plus an append-only acts ledger;
   currentness = anti-join on successor, computed at read. Three orthogonal axes so Withdraw never
   alters currentness and currentness never resurrects. Honest cost, stated by JRF-03: "current" is
   unindexable, no DB CHECK can enforce eligibility, and the fold must have exactly one
   implementation. (JRF-03)
2. **Consent asked after the declaration is already kept**, three real outcomes of equal visual
   weight, consequence stated before it happens, asked once. JRF-01 notes the existing modal grammar —
   filled jade confirm, grey text-link decline — *is* the dark pattern before any copy is written.
3. **Correct and Supersede distinguished by entry point**, not by a classification the member performs.
4. **Egress, not ingress, as the load-bearing guarantee**, because DEEP-primary has no prompt seam by
   construction and the consultation lane is gated on `MAIA_USE_CLAUDE_CONSULTATION`, unset in every
   repo env and compose file. (JRF-04)
5. **Separate composition for shared spaces**, never a filter over a private composition — selection
   has already happened by then. JRF-06 judges the absence channel (B infers a withdrawal from MAIA
   declining a topic) **structurally open**, and recommends disclosing rather than claiming contained.
6. **`retrieval_consent` scoped to the member's own private field at definition time**, with sharing
   as a separate event. (JRF-06 — see D-6; this is the irrecoverable one.)

---

## 6. Claims not supported by evidence

- **All production row counts** — 18 entries · 440 unattached signals · 0 `relationship_spaces` · 10
  `relationship_field_state` rows · 1172/1190 system-generated entries · 97 at-rest inferred rupture
  rows. Earth reports having verified several against production; **no other invocation had database
  access, and the steward exercised none.** Treat every figure as second-hand pending a runtime witness.
- **Whether any member has ever used the relationship surface.** JRF-01 names this its largest
  unexamined assumption.
- **Whether the live handoff path fires** — Earth's second-reader finding is code-read only.
- **DEEP-primary prompt arrival** — JRF-04 traced a dirty `feature/labtools-redesign` tree, not
  deployed `22200f967`.
- **`agent_runs` / `integration_passes` column sets** — so A2 §8.3's anti-laundering question is
  **unanswered**, not answered negatively.
- **Aether's `relationship_essences` finding** — reported as written system-side per turn
  (`…/maia/list/route.ts:1257`) and read back (`MemberLiveContext.ts:394`). Aether marked row counts,
  field variance and the auth state of `GET /api/relationship-essence` NOT ESTABLISHED. **JRF-02 worked
  the same ground and did not report it.** Orthogonal, not contradictory — JRF-02 attacked the
  signals/entries substrate. **No convergence established. Requires a dedicated check.**
- **The count of pending A4 rulings.** The founder's invocation named six; A4 §5 records eight
  disagreements (D1–D8) and §7 holds a decision list. The mapping was not established and is not
  asserted here.
- **JRF-07's own caveat**, preserved: it searched only A1–A5, so some of its 15 decisions may be
  settled by canon it did not read. **Check before any reach Kelly.**

---

## 7. Decisions requiring founder ruling

The eleven invocations produced **62 candidate decisions**. Per
`JARVIS_FOUNDER_ESCALATION_CONTRACT_2026-08-12` — *resolve everything below the authority boundary;
escalate the boundary, never the implementation beneath it* — the steward applied the two tests.
**54 resolve below the boundary**: settled by an existing instrument (K-1 by Article VII; silence by
Article V/VI plus the 2026-08-09 corrigibility ruling; Sanctuary by the Sanctuary invariants), or
admitting no competent divergence (ownership verification on
`app/api/maia/relational-signal/route.ts:131-134`; absolute dates; the entry-point split for
Correct/Supersede). Those are recorded in the source files and are **blocked work, not open questions**.

**Eight pass both tests.** Each is one question of principle carrying a recommended ruling.

| # | Question | Recommended ruling |
|---|---|---|
| **D-1** | Does Release mark or destroy? A2 §4 and §9 define it two incompatible ways. | **Marks.** Name a separate act `Erase` if destruction is wanted. Shipped precedent (`20260626000003:3-8`) and Article VI both point this way. |
| **D-2** | Does Correct extinguish the predecessor's offerability while Supersede preserves it as dated history? | **Yes.** Otherwise the classification is decorative and the member's choice authors nothing. |
| **D-3** | A1 §5 and A2 §8③ cannot both hold. Which is given up? | **§8③ holds; A1 §5's carry-forward is withdrawn** until RF-R6. Anti-laundering is the load-bearing guarantee. |
| **D-4** | May a governing document cite a containment as *structural* when it has no code referent? | **No.** Either build `DECLARATION_CAPABLE_SOURCES` with a failing-by-mutation test, or correct A2 §6 to say policy — before RF-R3 opens. |
| **D-5** | Does a **structurally**-expressed reading — ordering, badging, prominence — require a member act, as an uttered one does? | **Yes.** Fire's case: a structural reading carries no provenance, no quotable words, and no handle to correct. It is worse than the sentence, not better. |
| **D-6** | Is `retrieval_consent` scoped to the member's own private field, with sharing a separate event? | **Yes — and this is the one decision that is irrecoverable later.** A bare boolean silently becomes "in any space" the moment R6 exists; the alternative is re-consenting every declaration ever made. |
| **D-7** | Does the act taxonomy close at five? Water proposes `HOLD` (the interval before nameability); JRF-07 proposes `Repudiate` (*"I didn't write that"*, unrepresentable under §9's Release precision). | **No — it does not close.** Rule on `HOLD` and `Repudiate` together; two invocations reached "a sixth act is missing" from unrelated directions. |
| **D-8** | Does A1 §4's Aether cell keep *"what is trying to emerge"*? | **Strike it.** It is a Recognition-layer assertion; `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:103` forbids manufacturing higher-order meaning, and asking it as a question has already asserted that something is. |

---

## 8. Dissent and uncertainty

- **JRF-02 dissents from itself**: "policy not structure" may be too sharp, since the CHECK constraint
  does real work; and whether `DECLARATION_CAPABLE_SOURCES` is an error or a forward-looking name is
  **not established**.
- **JRF-07 dissents from A2 §6's central claim** as overstated: §6 proves the back door sealed, not the
  front. Paste-into-composer produces a genuine gesture witness *and* qualifies as imported, and the
  classes are declared disjoint.
- **Fire declares its own bias**: it is biased to resolve K-1 in A2's favour, and says so.
- **Fire dissents entirely** from A1 §5's *"your stated boundary and your recent action seem to
  differ"* — its member-recognition gate is downstream of the harm.
- **Aether answers its own constitutional question with a near-null**: no Aether *reading* may be
  offered at all; what survives is posture, and even that leaks through selection.
- **Water reports an honest null it cannot fill**: what constitutes positive evidence of a good Water
  offer is NOT ESTABLISHED, and Water says it cannot supply it.
- **Earth names its own failure mode against its own evidence**: it wants to stand on a corpus that is
  98.5% the system talking to itself, and would read a member with no entries as a member with no
  relational life.
- **The steward's own error**, recorded: R23/R24 were named as existing refusals in the JRF-04
  invocation prompt. They do not exist.

---

## 9. Standing

**PROPOSED — NOT RATIFIED.** No code, schema, migration, or pull request was created or modified. No
`declaration` value was added to `member_relational_signals.source`. Nothing was promoted. No OBSERVED
assertion was persisted. No governing document was edited. **Building remains closed.**

The authority chain is intact and stops here:
`invocation → differentiated findings → synthesis → ⟨founder ruling⟩ → governing record → implementation authorization.`
