# JARVIS-IDEA-WORK-BRIDGE-01 — RATIFICATION + DESIGN

## `REFLECTIONS ↔ LIVING WORKS — CREATIVE PROVENANCE`

**Founder ruling, 2026-09-08.** RL-01…RL-11 **RATIFIED** · O-05 **CLOSED** · F-11 **corrected**
· F-13 **confirmed and governed** · DESIGN **AUTHORIZED** for the first registry witness.

---

## 1. The ruling *(recorded as given, in force)*

### 1.1 RL-01…RL-11 RATIFIED

**RL-11 is no longer provisional.**

> Every crossing into the creative genealogy of a Work must preserve **authorship
> provenance**. The Studio must never present MAIA-authored or MAIA-distilled language as
> though it were authored by the member. **This is a governing law of the relationship.**

### 1.2 O-05 — CLOSED. *Reflections is a field, not a class.*

> **Reflections is a field/surface, not a canonical ontology object.** It is a place in
> which a member can encounter meaningful artifacts from their reflective life. Those
> artifacts **retain their native identities**.
>
> Therefore **Reflections ≠ a source type.** Do not create a canonical object called
> `reflection` merely to unify everything shown in the Reflections experience. **Do not
> store `source_type = 'reflection'` when a more specific native identity exists.** Preserve
> the actual thing encountered: Journal entry · Keep · Idea · Change · Decision · or another
> future eligible artifact.
>
> The word *Reflections* may describe their experiential gathering place without asserting
> that they are one ontological class.

**This resolves F-10 without collapsing anything.** The naming collision was never a
problem to be unified — it was a category error in the question. A gathering place is not a
class, and three systems may each legitimately use the word.

### 1.3 F-11 — CORRECTED. *Dependence is not ineligibility.*

> **A source of inspiration does not need to be an independently existing ontology object.**
> Changes and Decisions may remain `member_idea_blocks` if that is their correct ontology.
> Their dependence upon an Idea is not itself a reason to exclude them from a Work's
> genealogy.
>
> A crossing may refer to a dependent artifact **while preserving its containment**:
> `Idea → Decision block → Work`. The genealogy must retain enough identity to express
> *"this Decision, belonging to this Idea, contributed to this Work"* and must not falsely
> imply *"this Decision exists independently of the Idea."*
>
> **Do not promote Changes or Decisions merely to satisfy the bridge.** If their present
> implementation does not provide stable enough identity to reference them safely, admission
> may wait for that capability — **an implementation constraint, not an unresolved ontology
> question.**

**The census reported this wrong.** F-11 treated *not independently existent* as *not
referenceable*, and recommended returning it to Ideas R&D as an ontology question. It was
never one. Promoting Decisions to first-class objects to satisfy a bridge would have been
the programme's characteristic failure — **collapsing an ontology to fit an interface** —
arriving through the lane built to prevent it. **F-11 is superseded in place by §1.3;
charter §9.4 is annotated, not rewritten.**

### 1.4 Keeps — eligibility follows provenance and role, not display label

> A Keep arising in the member's reflective field may be eligible as creative source
> material. **A manuscript Keep already downstream of a Living Work is not admitted as an
> ingress source to that same Work.** That would create an unexamined genealogy loop
> (`Work → manuscript Keep → same Work`). **Do not authorize that loop.**
>
> Possible future reuse of material from one Work by another Work is a **separate cross-Work
> provenance question** and must not be smuggled into this lane through the word "Keep."

### 1.5 F-13 — confirmed as a genuine authorship hazard

> A `reflection_capsule` containing MAIA's summary, synthesis, gold line, or next step **is
> not simply "the member's writing,"** even when derived entirely from the member's
> experience and conversation. It may still be meaningful creative material, **but its
> provenance must remain visible.**
>
> Minimum distinction: **MEMBER-AUTHORED** (language or acts authored by the member) ·
> **MAIA-DERIVED** (MAIA synthesis/distillation derived from member material). Where a
> MAIA-derived artifact points back to underlying member-authored material, the genealogy
> should preserve that derivation where possible.
>
> A writer may **explicitly choose** to use or develop a MAIA-derived insight. **MAIA may
> never silently launder that artifact into the genealogy as though the member originally
> authored its wording or interpretation.**

### 1.6 The registry — eligible kinds, not a superclass

> The registry represents **eligible kinds of creative source, not a new superclass into
> which their ontology is collapsed.** The first implementation may admit Idea alone. But
> the architecture must not encode `source_type = idea` as the permanent shape of the
> capability. **Idea is the first registered source, not the definition of source.**

### 1.7 Grammar — no universal verb

> Preserve **GAVE RISE TO** (provenance of the Work's beginning) · **INSPIRED / INFORMED**
> (creative influence) · **CONTRIBUTES TO / FEEDS** (ongoing material relationship). The
> registry may constrain which grammars are valid for which source kinds, but **DESIGN must
> not prematurely create a universal verb.**

---

## 2. The provenance model this yields

The ruling's most consequential product consequence, stated as the four things a genealogy
must be able to tell apart:

```
what I wrote                        MEMBER-AUTHORED   journal, idea framing, note
what I noticed                      MEMBER-AUTHORED   change, decision
what MAIA noticed in what I said    MAIA-DERIVED      capsule summary, gold line
what I later chose to make of it    THE WORK          the undertaking, and its forms
```

These are not the same thing, and conventional AI writing history collapses all four into
"your content." Keeping them apart is what makes the genealogy **trustworthy** rather than
merely complete — and it is the distinguishing capability, not a compliance cost.

---

## 3. Technical finding — Changes and Decisions are closer to admissible than reported

The ruling makes admission turn on *stable enough identity to reference safely*. Measured
against `member_idea_blocks` as implemented:

| Requirement | State | Verdict |
|---|---|---|
| Stable identity | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` | ✅ |
| Individually addressable | `GET/PATCH/DELETE /api/ideas/[id]/blocks/[bid]` | ✅ |
| Parentage preserved | `idea_id` FK NOT NULL — containment is structural | ✅ |
| **Type immutable once structured** | `PATCH` permits a type swap **only from `note`** — `AND ($1::text IS NULL OR block_type = 'note')`. A Decision can never become a Change or revert. | ✅ **stronger than expected** |
| Durable under deletion | `DELETE` is a **hard delete**, and `member_idea_blocks` carries **`ON DELETE CASCADE`** from `member_ideas` | 🔴 **the only real gap** |

**So the blocker is not ontology and not identity — it is referential durability under
deletion.** A genealogy row pointing at a block would dangle when the member deletes the
block, or silently vanish when they delete the parent Idea.

This is a **known, already-solved shape** in this programme: **FR-15** (Circles) ruled that
withdrawal is a **tombstone** — *keep the fact that an act occurred when the system needs
that fact for integrity; do not keep the person's surrendered meaning merely because storage
makes it easy.* Applied here: the genealogy keeps *that a Decision contributed*, and stops
being able to show its content once the member deletes it.

**Recommendation, not a ruling**: Changes and Decisions are admissible as the **second**
registry witness, immediately after Idea, and need **no ontology change** — only a deletion
disposition. **O-06 is withdrawn as an ontology question** and re-opened as **O-06′**
(*deletion disposition for referenced sources*), owned by this lane at DESIGN. It applies to
every source kind, not only blocks — a member may delete a journal entry too.

---

## 4. DESIGN — the registry

### 4.1 Source kind descriptor

The registry is a **description of kinds**, held in code, carrying exactly what the ruling
enumerates. No table of kinds; kinds are code, instances are data.

```ts
interface SourceKind {
  kind: string;                    // native identity — 'idea', never 'reflection'
  resolve(id, memberId): Resolved | null;   // member-scoped; unresolved fails visibly
  display: { label; describe(r) };          // how it is shown, per kind
  authorship: 'member_authored' | 'maia_derived' | 'per_instance';
  container?: { kind; resolveParent(id) };  // parentage where applicable
  grammars: RelationGrammar[];              // which crossings this kind permits
  eligibleForGenealogy: boolean;
}
```

Registered at first ship:

```ts
IDEA: {
  kind: 'idea',
  authorship: 'member_authored',
  container: undefined,
  grammars: ['gave_rise_to', 'inspired_by', 'contributes_to'],
  eligibleForGenealogy: true,
}
```

Prepared, **not registered**: `idea_decision_block` · `idea_change_block` (container: idea;
grammars minus `gave_rise_to`) · `journal_entry` · `capsule_keep` (authorship
`maia_derived` or `per_instance`). **Deliberately absent**: `manuscript_keep` (§1.4), and
any `reflection` kind (§1.2).

### 4.2 Relation grammar

| Grammar | Meaning | Admissible subject |
|---|---|---|
| `gave_rise_to` | provenance of the Work's beginning | **Ideas only** (R-01) |
| `inspired_by` | creative influence | any registered kind |
| `contributes_to` | ongoing material relationship | any registered kind |

Per RL-07 and §1.7 these are **three stored kinds, never one verb with a modifier**, and none
is derived from another. The grammar a crossing carries is the member's assertion.

### 4.3 The threshold act

> **Begin a Work from this Idea**
> *Start shaping an expression from this Idea. The Idea stays here and remains connected.*

One act. Writes: a `living_works` row (member-authored title, everything else NULL and
correct), and **one** genealogy row `(work, source_kind='idea', source_id, grammar='gave_rise_to',
authorship='member_authored', declared_by, declared_at)`. Nothing else — no material row, no
expression row, no `status` write on the Idea (**B-12**, **B-01**).

Optional, never default-all: a lightweight selection of framing · central question ·
selected blocks. Each selected item crosses as **its own genealogy row in its own kind**,
attributed — never flattened into the Work's body (**BL-14**, **RL-06**).

### 4.4 What the genealogy shows

```
Sources of this Work
  Idea      The soul does not develop linearly          gave rise to
  Journal   Entry from August 17                        inspired
  Change    I no longer think individuation is solitary  inspired      (from Idea: …)
  Keep      McGilchrist passage on attention            contributes
  Decision  Write this for young adults, not clinicians  contributes   (from Idea: …)
```

Each row shows **native kind**, **grammar**, **container where applicable**, and — where the
source is MAIA-derived — **says so, in the row, not in a tooltip** (RL-11).

### 4.5 Disposition of the existing drift path *(DESIGN's to determine; founder acts at STOP)*

`POST /api/book-studio/drafts/from-idea` + `MoveToStudioButton`: **RETIRE.** Not migrate —
it has no data to migrate (it writes markdown files, not rows) and it embodies the rejected
ontology in its verb, its payload, and its shape. Recommended: `410 Gone` when the
replacement ships, then delete the orphaned button.

⛔ **One item does not wait for the lane**: the route is **unauthenticated** and writes files
to disk from request input. That is worth closing on its own merits, independently of any
ontology, and I have not touched it per your direction.

---

## 4.6 The genealogy is the anti-blank-page mechanism

Founder, 2026-09-08 (Product Thesis, *Cultural ambition*): *"The person doesn't encounter an
empty document demanding that they manufacture something. They can see the living ground
beneath the Work. **The blank page becomes much less blank.**"*

**This reclassifies RL-09.** The census treated creative genealogy as a provenance
obligation — something the system owes for honesty. It is that, and it is also **the primary
member-facing value of the entire capability**: the reason a Work opens onto accumulated
living ground instead of an empty field.

Design consequence, binding on DESIGN: **a newly established Work is never empty.** At
minimum it opens showing the Idea it came from and whatever the member chose to bring. A
Work that renders as a blank document with a genealogy hidden behind a tab has implemented
the law and missed the point.

⛔ And the inverse temptation is now explicit: **the answer to the blank page is showing the
member their own ground, never generating an opening for them.** Those are the two available
moves, they look equally helpful, and only one is compatible with *"MAIA is never the hidden
source of the person's voice."*

## 4.7 *"There is a Work here"* — bounded

The thesis's turning point (*"one day MAIA can say, in effect: There is a Work here"*) sits
directly against R-01, which reserves establishment to the member. Both hold, on one
distinction:

| | |
|---|---|
| ✅ **Observe and wonder** | *"Six months of Reflections seem to be circling the same question — would you like to see them together?"* An observation about the member's material, offered as a question, refusable without residue. |
| ⛔ **Establish, or narrate as settled** | *"You have a Work here"* asserts an undertaking exists. Only the member's act makes that true, and asserting it tells a person what their life means. |

**RB-25 — MAIA NEVER ASSERTS AN UNDERTAKING.** No surfaced observation states or implies
that a Work exists, has begun, or should begin. Every such surface is refusable, leaves no
residue, and creates no relation. Extends RL-08 and RB-18 to the specific sentence most
likely to be written.

The feature is not weakened by this. An observation the member confirms is **more** moving
than a verdict, because the recognition stays theirs — which is precisely the design test:
*does this help someone discover they already have something worth saying?* A verdict tells
them; a question lets them find out.

## 4.8 The asymmetry, as a lane rule

> **Threshold low at EXPLORE. Sovereignty high at CREATE and OFFER.**

For this lane specifically: make **beginning a Work** as close to frictionless as the law
allows — no required title, no form, no selection, no naming of what it will become
(**BL-17**, **BL-18** already say this; the thesis says why it matters). Make **what crosses,
who authored it, and what is offered** strict — RL-11, RB-16, RB-24.

Both pressures will arrive disguised as the same kindness. The rule is directional:
**simplify the entrance, never the attribution.**

---

## 5. PROVE — what DESIGN must demonstrate

Ruling's list, bound to the obligations already named:

| Must prove | Obligation |
|---|---|
| Idea remains Idea | B-01 (row byte-identical, `status` never written) |
| Member establishes Work | B-09, B-14 (member act; no transfer verb) |
| Work is newly constituted | B-02 |
| Relationship is recorded | B-03 |
| Authorship/provenance preserved | **RB-16**, RL-11 |
| Nothing consumed or moved | B-05, B-10, RL-02 |
| One Idea → more than one Work | B-08, RL-03 |
| **Architecture admits later kinds without redefining the relationship** | **⭐ RB-22** |

**RB-22 — NO HARDCODED KIND.** Adding a second source kind requires registering a
descriptor and **no change** to the relation schema, the crossing path, or the genealogy
renderer. A grep for `'idea'` outside the registry entry returns nothing in the relation
layer. *No hardcoded Idea-only bridge ships* — made falsifiable.

**RB-23 — NO LOOP.** No manuscript keep, and nothing produced inside a Work, is admissible
as a source of that same Work (§1.4).

**RB-24 — CONTAINMENT IS NEVER IMPLIED AWAY.** A dependent source displays and stores its
container. Nothing presents a Decision as if it existed independently of its Idea (§1.3).

**RB-25 — MAIA NEVER ASSERTS AN UNDERTAKING.** No surface states or implies that a Work
exists or has begun; establishment is only ever the member's act (§4.7).

**RB-26 — A NEW WORK IS NOT BLANK.** An established Work opens showing its genealogy, and
nothing generates opening language on the member's behalf (§4.6).

---

## 6. Standing

```
RL-01..RL-11   RATIFIED — RL-11 in force, no longer provisional
O-05           CLOSED — Reflections is a field, not a class; no `reflection` source type
F-11           CORRECTED — no ontology promotion required; superseded in place
F-13           CONFIRMED — governed by RL-11 + RB-16
O-06           WITHDRAWN as ontology → reopened as O-06′ (deletion disposition, this lane)
O-08           EFFECTIVELY CLOSED by §1.4 — manuscript keeps not admitted; loop refused

DESIGN         AUTHORIZED — first registry witness: Idea
BUILD          NOT AUTHORIZED — STOP: founder witness before build or deploy
from-idea      UNTOUCHED; retirement RECOMMENDED, founder acts at STOP

no schema change · no migration authored · no route added or removed · no UI · no deploy
```

**Next founder act**: approve this design, or return it. Nothing here is built.
