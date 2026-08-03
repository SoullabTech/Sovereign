# Practitioner Wisdom Field — Product Definition v0.2

**Status:** CANDIDATE product definition. Cat 1 (preserved direction) + Cat 2 (canonical primitive target).
**Authorizes:** nothing to be built, migrated, or ingested.
**Date:** 2026-08-03
**Upstream of:** `docs/governance/LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md`, the authority schema in commit `c327dd526`, and any future practitioner onboarding.

---

## 0. The three reframes this document encodes

**Reframe 1 — the unit of the build.**
> Do not build Larry's Wisdom Field. Build the Practitioner Wisdom Field system, then instantiate Larry's field inside it.

**Reframe 2 — the nature of the field.**
> The Wisdom Field is not a repository. It is a **developmental environment**. The system helps a practitioner *become better* — it does not clone who they already are.

**Reframe 3 — the doorway.**
> **MAIA does not begin by knowing the practitioner. MAIA begins by learning with the practitioner.**

The universal starting point is therefore not the practitioner's existing knowledge base. It is their **capacity to learn, evolve, and develop wisdom in relationship**. That is what makes the architecture apply equally to a 30-year executive coach, a therapist, a spiritual director, a teacher, and an emerging practitioner like Larry.

### The load-bearing principles

> **The constitution is shared. The wisdom is sovereign.**

> **MAIA can bring wisdom to the practitioner. MAIA cannot silently turn outside wisdom into the practitioner's authority.**

The second is the central design principle of the entire practitioner platform. Everything in §3–§5 exists to enforce it.

| Fixed (platform, non-negotiable) | Flexible (practitioner, sovereign) |
|---|---|
| provenance | vocabulary |
| authority | frameworks |
| permissions | practices |
| source relationships | modules |
| layer-promotion rules | experiences |
| safety boundaries | workflows |
| composition rules | pace of development |

**Opinionated about principles. Flexible about expression.**

---

## 1. What is already true (do not re-derive)

This is not speculative architecture. The fixed layer is the generalization of a **real incident** against a **real deployed spine**.

- ✅ **Custody spine exists and is deployed** — field-scoped ownership, immutable vault originals, append-only revisions, ratification re-checked at read time, absence-of-query doctrine intact.
- ❌ **Provenance is one axis short** — no `authored_by` / `rights_status` / `license` / `attribution` columns anywhere in the library/material/corpus/vault migrations. The `uploaded→processed→reviewed→ratified→archived` lifecycle is an **editorial trust gate, not a rights gate**.
- 🔴 **The corpus composition channel is CLOSED** — `corpusIsComposable()` returns `false` unconditionally at both boundaries (`formatFieldContextForRoom`, `buildPracticeFieldContext`) as of `c327dd526`. Practitioner-authored *identity* layers still compose; they are self-descriptive and were not the failure vector.
- ⛔ **Larry's materials agreement is UNSIGNED and Attachment A is empty.** Its own §1 is the gate: *"if it's not on the list, it's not in the system."*

**The incident that forces the fixed layer:** production field `now-what-demo` carried 63,861 chars of `active_field_content` that composed in full into every room resolving that slug. Its header claimed it was *"composed in full from Larry Closs's program documents."* It was not — it was composed from Soullab's own candidate documents. The **authorship** claim was correct. The **relationship** claim was false.

---

## 2. The three layers

```text
Layer 1 — WISDOM COMMONS            shared, licensed, attributed
          research · coaching science · psychology · leadership studies
          practices · frameworks · lineage
                    ↓  (acquisition — §3, §4)
Layer 2 — PRACTITIONER DEVELOPMENT FIELD    private, evolving, non-authoritative
          what they are learning · trying · reflecting on · noticing
          experiments · session learnings · emerging ideas
                    ↓  (⚠️ PROMOTION — §5, the governed moment)
Layer 3 — PRACTITIONER WISDOM FIELD         sovereign, authored, composable
          their frameworks · their language · their methods · their teachings
                    ↑  (⚠️ CONTRIBUTION back to Layer 1 — §12, not yet designed)
```

⚠️ Every arrow above except the last points **down**. The upward return path — a mature practitioner contributing into the Commons — is specified in **§12** and is a Cat 1 preserved direction: no scope axis exists, and no contribution surface may be built before §8 step 7.

### Layer 1 — Wisdom Commons

*"What the profession has learned."* Positive psychology, coaching methodology, behavioral science, leadership research, developmental psychology, communication frameworks.

⛔⛔ **The Commons is a POINTER layer, not a text corpus.** This is not a preference — it is a rights constraint already ruled on. A practitioner can license their own work; **they cannot license the text that influenced them.** The lineage signal is licensable; the text is not. (The Harvard PSY 1060 lectures in the Larry corpus are the canonical example: Larry was a *recipient*, not the author. Class B lineage — ⛔ never reproduced, never on Attachment A.)

So Layer 1 holds: citations, bibliographies, practice descriptions authored by us or licensed, and **pointers**. It does not hold third-party text awaiting composition.

MAIA's legitimate move here is:
> *"Here is wisdom that may enrich your practice."*

⛔ Never:
> *"Larry teaches this."*

### Layer 2 — Practitioner Development Field

Private and evolving. The dojo. Reflections, experiments, observations, "what am I noticing?", "what is changing?", "what do I now believe?"

⭐ **Layer 2 is non-authoritative by construction.** Nothing in Layer 2 composes into a member-facing room. It is the practitioner's own working surface. This is what makes it safe to be messy — and it is why the promotion gate in §5 is the whole ballgame.

### Layer 3 — Practitioner Wisdom Field

Their mature contribution. Composable, attributed, sovereign.

### The balance shift

```text
Emerging practitioner:     Commons ███████   Own ███
Experienced practitioner:  Commons ███       Own ███████
```

⚠️⚠️ **This is a description of a trajectory, never a measurement, and never a MAIA-computed score.** A "your development level" surface would violate the Sovereignty Invariants directly. The system may show a practitioner *what they have authored*; it may not tell them *how developed they are*.

---

## 3. The two provenance axes

The source-relationship vocabulary in the reframe — *learned from · inspired by · adapted from · created through experience · still exploring* — is correct, and it is **exactly the axis the incident failed on**. Encode as two independent axes, because either one alone would have passed the failure.

### Axis 1 — Class: *who authored this?*

| Class | Meaning |
|---|---|
| A | Authored by the practitioner |
| B | Curated by the practitioner (their selection, not their text) |
| C | Third-party owned |
| D | Soullab-derived |
| E | Architecture / platform |
| F | **Unknown — default** |

⚠️ **B and C overlap by design.** A paper Larry selected is B as to *his relationship with it*, C as to *ownership*.

### Axis 2 — Source relationship: *what relationship does this claim to what it references?*

| Relationship | Composable into a member-facing room? |
|---|---|
| `created through experience` | yes, attributed to the practitioner |
| `adapted from <referent>` | yes, only if the referent resolves |
| `interpretation of <referent>` | yes, labeled as interpretation |
| `learned from` / `inspired by <lineage>` | **pointer only** — never the source text |
| `still exploring` | **no** — Layer 2 only |
| `proposed synthesis` | yes, labeled as proposal |
| `unknown` — **default** | **no. Blocks composition.** |

Note `still exploring` and `created through experience` are the two developmental additions, and they are the two that most need distinguishing: they are the boundary between Layer 2 and Layer 3.

### ⛔⛔ The failure mechanism: the SILENT UPGRADE

> **The dangerous step is not interpretation. Interpretation is legitimate. It is the silent upgrade — `interpretation → derivation`, or `learned → authored` — without an actual lineage path.**

```text
candidate interpretation
  → described as derived from source
    → runtime treats it as field knowledge
      → source authority appears without source evidence
```

**A relationship claim with no verifiable referent is the mechanism by which a translation layer acquires source authority.** Relationship must be **checkable against a real referent, never asserted**.

### The fail-closed rule

> **Fail closed around MEANING, not only around access.**

- unknown permission → `never`
- unknown source relationship → **no composition**
- ambiguous consent → no permission
- missing provenance → no authority

⛔ Never *unknown → best guess → compose anyway.*

⚠️ **Missing provenance ≠ negative provenance.** Keep the two distinguishable in any data model: "we do not know" and "we know this may not be used" are different states with different remedies.

---

## 4. The governed object is the composition MOMENT

> **Do not create a provenance constitution for a table. Create it for the moment where practitioner meaning becomes available to MAIA.**

The substrate will change. The authority relationship is the invariant. The governed unit is a **`FieldContribution`**:

```text
FieldContribution
  ├── origin             — channel · practitioner · field · layer (1|2|3)
  ├── authority          — class × source-relationship (§3), both required
  ├── permission         — what MAIA may do with it (§7)
  └── composition-trace  — what was composed, when, into which room
```

### ⚠️⚠️ Bind ALL channels, not the vault

| Channel | Vault | Ratification-gated | Attribution |
|---|---|---|---|
| `library_sources` → `field_program_lessons` → `composeLessonContext` | ✅ | ✅ | ❌ |
| `practice_fields.active_field_content` → field block | ❌ | ❌ | ❌ |

`active_field_content` is a **free-text column** written via `PUT /api/practitioner/practice-field`. A practitioner can create MAIA context **without uploading a single file**.

⛔ **A provenance design that binds only the vault path governs the inert channel and leaves the live one open.** Every future channel — recording, transcript, reflection note, session learning, imported course — enters through the same `FieldContribution` gate or it does not enter. **The developmental model multiplies channels; that raises the stakes on this rule rather than relaxing it.**

### Two controls explicitly rejected (do not re-propose)

- **Readiness `status`** — computed from four text fields being non-empty. Gating on it means *"composable once someone finishes typing"*: a control whose name implies authority while enforcing completeness.
- **Revision history** — proves a practitioner *changed* something, never that they *reviewed what MAIA may compose*.

---

## 5. ⭐⭐⭐ Layer promotion — the second silent upgrade

The developmental model introduces a **new instance of the same failure class**, with a longer time constant and therefore harder to see:

```text
Layer 1 material read
  → reflected on in Layer 2
    → paraphrased in a practitioner's own words
      → accumulates, feels like theirs
        → composes as Layer 3 authored wisdom
          → the profession's knowledge acquires THIS practitioner's authority
```

That is **unattributed absorption at the developmental timescale**. It is not impersonation and it is not theft — it is the ordinary way humans learn, which is precisely why the system must not automate it.

### The promotion rule (binding)

> **Promotion between layers is an explicit practitioner act with a recorded lineage. It is never accumulative, never time-based, never MAIA-inferred.**

- ⛔⛔ **NO SILENT PROMOTION.** Nothing moves 1→2 or 2→3 because it was edited enough, revisited enough, or looks mature enough.
- **Declared ≠ derived.** A practitioner declaring *"this is now mine"* is a governed state change and must carry: what it was promoted from, when, and by whom.
- Promotion **may not be suggested by MAIA in a way that constitutes a nudge toward claiming authorship.** MAIA may show a practitioner what is sitting in Layer 2 unclaimed. It may not tell them it is ready.
- Layer 3 material whose lineage points to Layer 1 must **retain the pointer**, permanently. Attribution does not decay with the practitioner's growing fluency.

### This is Invariant 16 applied

The three-layer model is a direct instance of the **Constitutional Direction of Authority** (`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, Invariant 16):

> Authority may only move upward through authored experience — never skipping a layer, never manufacturing higher-order meaning. **The member may jump around; the system may not.**

Substituting *practitioner* for *member*: the practitioner's actual learning is messy and non-linear — they will read, try, forget, return, re-read. **That freedom is theirs.** What is strict is the constitutional direction: Commons → Development → Wisdom, one rung at a time, each promotion authored. MAIA never moves a practitioner through it. MAIA protects the boundaries within which their development occurs.

---

## 6. The capability surface

### 6.1 The developmental pathway (universal)

```text
Experience → Reflection → Pattern recognition → Learning
          → Practice refinement → Wisdom formation → Contribution
```

Everyone starts at a different place on it. **The pathway is the universal; the position is not.** Do not build a stage model that assigns practitioners a position.

### 6.2 Practitioner Field of Being

*Who is this person becoming as a practitioner?* Values · worldview · motivations · strengths · questions · edges of growth.

⚠️ This is **self-descriptive and self-authored**, which is why it is the one layer that composes on practitioner authorship alone (as identity does today). ⛔ It is not a precedent for anything else, and **"edges of growth" must be the practitioner's own naming — never MAIA's assessment.**

### 6.3 Wisdom acquisition

*How do they learn?* Books · research · teachers · trainings · conversations · observations · client experiences.

⚠️⚠️ **"Client experiences" is the highest-risk input in this entire document.** Cases and transformations witnessed are **not the practitioner's to license** — the client's material is the client's. Only the practitioner teaching *about* their practice is inventoriable. Any client-derived input requires its own consent instrument, and this document does not design one.

### 6.4 Practice development

```text
Idea → Experiment → Client experience → Reflection → Refinement → Emerging method
```

This is Layer 2's core loop and where a newer practitioner builds mastery. **Everything in this loop is `still exploring` until explicitly promoted (§5).**

### 6.5 Practice Model — same architecture, different vocabulary

| Coach | Spiritual director | Therapist |
|---|---|---|
| programs | practices | approaches |
| frameworks | contemplations | psychoeducation |
| exercises | rituals | resources |
| questions | reflections | |

⭐ **Invariant 14 (cultural sovereignty) applies directly:** do not translate a practitioner's meaning into Soullab vocabulary. Preserve their language; map, never rename.

### 6.6 Language Field

Phrases they repeat · metaphors · distinctions · questions · ways of seeing.

🔴 **NOT authorized by this document; requires its own ruling.** A voice pattern learned from Class B/C material is unattributed absorption of a third party's way of speaking, and no rights instrument covers it. Under the developmental model this gets *worse*, not better: a practitioner's language legitimately absorbs their teachers'. Admissible only from Class A / `created through experience` material.

### 6.7 Capability toggles

```text
Practitioner Field Settings
  ☑ Wisdom Commons access   ☑ Session Continuity     ☐ Community
  ☑ Development Field       ☑ Client Commitments     ☐ Courses
  ☑ Evolution Journal       ☑ Reflection Prompts     ☐ Certification
  ☑ Practice Laboratory     ☐ Assessments            ☐ Publishing
```

⚠️ **A sketch, not a roadmap.** Per *promote on observed use*: no capability becomes a built abstraction on an imagined second practitioner — only an observed one. The toggle **architecture** is the authorized design target; this specific list is not.

---

## 7. Permissions

Every contribution carries a permission, defaulting closed:

| Permission | MAIA may |
|---|---|
| `never` — **default** | nothing |
| `development_only` | hold in Layer 2, visible to the practitioner alone |
| `context_only` | hold as background, never quote |
| `attributed_reference` | name it, with attribution |
| `composable` | compose into room context, attributed |
| `member_visible` | surface to the member directly |

Permission is **separate from provenance**. Missing provenance does not mean permission is denied by default — it means **no authority exists to grant permission at all**.

---

## 8. Sequencing — binding

```text
1. define authority model              (§3 — this document, needs ratification)
2. bind ALL composition paths          (§4 — both channels + every future one)
3. define layer-promotion semantics    (§5 — the developmental addition)
4. add ratification semantics          (practitioner ratifies what MAIA may compose)
5. test with SYNTHETIC material        (a fictional practitioner, invented corpus)
6. only then onboard Larry
```

⛔ **Steps 1–5 complete before any Larry material is inventoried into a system surface.** Step 5 is not optional: the first real test of a provenance gate must run against material no one is invested in.

### On Larry as the first case

Larry is not the template. **He is the first learner in the learning architecture** — and that is a *better* first case, not a weaker one, because it validates the more universal claim:

| A mature practitioner tests | Larry tests |
|---|---|
| *Can MAIA preserve and extend an existing body of wisdom?* | *Can MAIA help someone become a better practitioner?* |

The second validation is the broader one. It also has a practical consequence: **it does not depend on the unsigned agreement.** Layer 2 development work with Larry's own reflections, authored by him in the system, requires no ingestion of pre-existing material. That is the one part of the Larry relationship that is not blocked — and it should be named as such at the sitting.

⚠️ It is *not* unblocked today: steps 1–5 still gate it, and the corpus channel is closed. But it is the shortest honest path to a real first instance.

---

## 9. What this document does NOT do

- ⛔ Does not authorize any migration, schema change, or code.
- ⛔ Does not authorize ingesting any Larry material. The agreement is unsigned; Attachment A is empty.
- ⛔ Does not re-open `corpusIsComposable()`.
- ⛔ Does not rule on the Language Field (§6.6) or on client-derived input (§6.3).
- ⛔ Does not authorize any Commons contribution surface, scope axis, or cross-practitioner composition path (§12). The upward arrow is described, not opened.
- ⛔ Does not resolve the five-domain language still live in `about_practice` — a translation-fidelity question **only Larry can answer**.
- ⛔ Is not canon. It is a candidate product definition awaiting founder ratification.

---

## 10. Sovereignty Invariant check

| Test | Reading |
|---|---|
| Does this increase agency? | ✅ The practitioner authors their own field and controls every promotion. |
| Does it push life outward? | ✅ The pathway terminates in **contribution** — the practitioner's work going out to the people they serve. |
| Does it reduce psychological centrality over time? | ✅ The balance shift is *away* from platform-supplied wisdom toward the practitioner's own. ⚠️ **A "your growth score" surface would invert this and must not be built.** |
| Cultural sovereignty (Inv 14)? | ⚠️ Live risk. Layer 1 defaults would carry a Western coaching/positive-psychology center of gravity. The Commons must be plural and pointer-based, and the practitioner must be able to reject its framing without losing platform function. |

---

## 11. Positioning (Representation & Claim Discipline)

| Claim | Status |
|---|---|
| "Practitioner fields have custody, ownership, and revision integrity" | **Live** |
| "Practitioner fields have provenance and rights authority" | **Designed** — §3 not built |
| "A platform where practitioners develop their wisdom in relationship with MAIA" | **Vision** |
| "Larry's Flourishing framework is in the system" | ⛔ **FALSE** — do not say this in any form |

The differentiator, stated carefully:

> AIN is the infrastructure that protects the difference between *AI trained on content* and *AI that composes a practitioner's material only under authority the practitioner actually granted.*

Deliberately **not** *"AI that understands a practitioner's way of seeing."* Understanding is unverifiable; granted authority is checkable. Claim the checkable one.

---

## 12. The upward arrow — governed contribution to the Commons

> **The collective grows through governed contribution, not extraction.**

Every arrow in §2 points **down**: Commons → Development → Wisdom. That is the acquisition path and it is fully specified. The **return path** — a mature practitioner contributing back into the Commons — is accepted as direction and specified here. It is not a sharing feature. It is **promotion at a fourth rung**, and it inherits §5 entirely.

```text
Layer 3 — Practitioner Wisdom Field
             ↑  ⚠️ CONTRIBUTION — a governed act, §12.2
Layer 1 — Wisdom Commons
```

### 12.1 ⭐ Contribution is the one path that may put text in the Commons

§2 rules the Commons a **pointer layer, not a text corpus** — because a practitioner cannot license the text that influenced them. Contribution is the exception that proves the rule, and the reason is precise:

> **A practitioner can license their own work.** Class A / `authored` material, contributed by its author, is the only material for which the Commons holds an actual grant.

⛔ This is not a loosening of §2. It narrows: Layer 3 → Commons admits **only** Class A with `authored` relationship. Class B/C/D/F material never becomes Commons text at any scope, by any route, including via a practitioner who has held it a long time.

### 12.2 Contribution is a second composition moment

§4 governs the moment practitioner meaning becomes available to MAIA. Contribution is that same moment **at a wider scope**, so it enters through `FieldContribution` or it does not enter:

```text
FieldContribution
  ├── origin · authority · permission · composition-trace   (§4)
  └── contribution-trace   — what was released, by whom,
                             under which grant, at which VERSION
```

⚠️ A grant binds a **version**, not an artifact. Per *declared ≠ derived*: a practitioner who revises a contributed framework has not re-contributed it. The Commons holds `source_version_at` and a stale pointer **fails closed** — the same rule already ruled for offerings in the Bring Forward lane.

### 12.3 Permission needs a second axis: scope

The §7 ladder answers *what may MAIA do*. It does not answer *whose MAIA*. Split them:

| | verb (§7) | scope (new) |
|---|---|---|
| asks | what may MAIA do with this | in **which fields** may MAIA do it |
| values | `never` · `development_only` · `context_only` · `attributed_reference` · `composable` · `member_visible` | `own_field` — **default** · `named_fields` · `commons` · `prohibited` |

**Both default closed, independently.** `composable × own_field` is the ordinary case. `composable × commons` is a distinct grant made **explicitly, per artifact, per version** — never inherited from a field-level setting, never implied by an account-level opt-in, never a side effect of a 2→3 promotion.

⚠️ **`prohibited` is not the same as unset.** §7 already rules that *missing provenance ≠ negative provenance*; the same distinction holds on scope. `own_field` (default) means *no grant has been made*. `prohibited` means *the practitioner has refused* — a recorded act that a later bulk grant, migration, or account-level opt-in must not silently overwrite. Keep them distinguishable in any data model.

### ⛔ Three axes, not two

The material's governance is `class × source-relationship × scope`. §3's two axes are **not** collapsible into a single "authority" list:

| Axis | Question | Values |
|---|---|---|
| Class (§3.1) | who authored this? | A–F |
| Relationship (§3.2) | what does it claim about what it references? | `authored` · `derived from` · `interpretation of` · `inspired by lineage` · `proposed synthesis` · `unknown` |
| Scope (§12.3) | where may it travel? | `own_field` · `named_fields` · `commons` · `prohibited` |

Flattening class and relationship into one ordered list is the drift to refuse — §3 records *why*: a single axis would have **passed** the production incident. The authorship claim was correct; the relationship claim was false. Only two axes catch that.

### 12.4 ⛔⛔ Anonymization is not a permission

> **"Anonymized patterns" is the extraction vector wearing the vocabulary of governance.**

Removing identity changes *who can be named*. It does not change *who authored it* or *what relationship it claims*.

- **Anonymization strips attribution, and §2/§6.6 require attribution.** An unattributed contribution composing into a second practitioner's field is *unattributed absorption at platform scale* — the incident generalized, not a new problem.
- **Class laundering must be structurally impossible.** No pipeline may take Class B/C/D/F inputs and emit a Class A or E output. A derived artifact inherits the **lowest** authority among its inputs — never the contributing practitioner's own class.
- **Cross-practitioner aggregation is not a rights event any single practitioner can authorize.** If a pattern is visible only across three practitioners' material, none of them holds the authority to release it. That grant does not exist and cannot be manufactured by aggregation.

### 12.5 🔴 Client-derived material is excluded, not "bounded"

Session learnings feeding a practitioner's Layer 2 — and from there the Commons — is the most attractive and most dangerous edge of the return path. **Refused at this layer.**

- Member material is governed by **member** consent (Sanctuary Mode; the atoms and anchor consent gates), not practitioner ownership. A practitioner cannot pass upward a grant they never held.
- `sessions.notes` carries **plaintext PHI** today (open lane, `#899` prerequisite). Any path from session material to a practitioner corpus would move PHI across a scope boundary with no consent instrument behind it.
- *"With proper boundaries"* names an intention, not a control. Per *documentation as false control surface*: a boundary with no enforcing mechanism is a description.

⛔ **No client-derived artifact may enter a `FieldContribution` at any scope — including `own_field`.** A practitioner's own reflection *about* their practice is Layer 2 authored material and is fine; the client's material is not theirs to promote. This is a separate constitutional question and this document does not open it.

### 12.6 The return path creates a third composition channel

Commons text reaching a *receiving* practitioner's field means a channel where the composing field does not own the material. §4's table gains a row — gated before it exists:

| Channel | Ratification-gated | Attribution | Status |
|---|---|---|---|
| `library_sources` → `field_program_lessons` | ✅ | ❌ | closed (`c327dd526`) |
| `practice_fields.active_field_content` | ❌ | ❌ | closed (`c327dd526`) |
| **Commons → practitioner field** | — | — | **does not exist; must not be built before §8 steps 1–5** |

### ⭐⭐ Inbound sovereignty — permission systems usually only govern exit

Every control in §3–§7 asks *may this leave?* The return path forces the symmetric question: **may this enter?** A receiving practitioner is not a consumer of the Commons; they are the steward of a field that something is being added to.

A practitioner receiving Commons material must be able to see, at the point it reaches their field:

- **where it came from** — the contributing field, not an abstraction
- **who contributed it** — attribution survives transit; ⛔ anonymous arrival is refused (§12.4)
- **what relationship it claims** — the §3.2 value travels with it, unaltered
- **what limits it carries** — the verb, and whether it may be promoted further

…and must be able to **refuse it** without losing platform function.

⛔⛔ Silent inheritance would make a practitioner's field partly authored by people they never chose, and would break §5's promise that Layer 3 is what *they* authored. It also reconstructs the original failure one level up:

```text
unseen source → assumed authority
```

That is the same mechanism as the incident, with the Commons standing in for the missing referent. **A collective that arrives invisibly is an unattributed absorption channel pointed at every practitioner at once.**

### 12.7 What the flywheel may not become

The developmental framing — beginners receive scaffolding, experienced practitioners contribute mastery, same architecture at different stages — is sound and is the strongest part of the direction. Under Invariant 16 it carries two prohibitions:

- Commons material may arrive as **Encounter** — something a practitioner meets. ⛔ It may not arrive as **Recognition**: it cannot tell them what their practice is, or substitute for practice not yet done.
- ⛔⛔ **No contribution standing, ranking, reputation, or "mature practitioner" status.** §10 already forbids a growth score; a contribution count is the same surface with a different name. Contribution is an act, never a rank.

### 12.8 Sequencing — the return path is downstream of everything

Appended to §8, not interleaved:

```text
1–5. (unchanged: authority model · bind all channels · promotion semantics ·
      ratification · synthetic test)
6.   onboard Larry — single field, NO Commons contribution surface
7.   observe a SECOND practitioner field in real use
8.   only then design contribution scope (§12.3) against observed need
```

⛔ Per *promote on observed use*: the return path is a **Cat 1 preserved direction**. Contribution mechanics designed before a second field exists would be an abstraction over a population of one — the exact error §6.7 already warns about for toggles.

**Why a population of one cannot settle it.** One field can reveal the *principles*; it cannot reveal the *social dynamics*. Each step answers a different question, and the second is not a scaled version of the first:

| Population | Question it can answer |
|---|---|
| One practitioner | *Can a single wisdom field grow safely?* — authority, promotion, composition |
| Two practitioners | *Can two sovereign fields coexist?* — scope, attribution in transit, refusal |
| The Commons | only becomes an **observed** design problem after the second is answered |

⚠️ Contribution is a *relational* mechanism. Building it against one field would be specifying a relation with only one term.

### 12.9 Claim discipline for the Commons (extends §11)

| Claim | Status |
|---|---|
| "AIN is a professional wisdom commons with sovereignty built in" | **Vision** |
| "Practitioners contribute to a shared field under explicit permission" | **Vision** — no scope axis exists |
| "Practitioner material never silently trains a shared model" | **Live** — true today *because no collective path exists at all* |

⚠️⚠️ The third row is honest **only while stated as** *no such path exists*. The moment a Commons contribution path is built, that claim moves to **Designed** and must be re-earned by the gate — never carried forward on the strength of having once been true.

### 12.10 ⭐⭐⭐ A commons, not a canon

> **The collective is not the top of the hierarchy. The practitioner remains the steward of their own field.**

The cycle in §2/§12 — inheritance → practice → transformation → contribution — is how human traditions actually evolve, and it has a characteristic failure: **the commons hardens into a canon.** Contributed material accumulates, acquires the weight of consensus, and starts arriving as *what the profession has established* rather than *what some practitioners have offered*.

The structural guards, all already stated, exist for this:

- Commons material arrives as **Encounter**, never Recognition (§12.7)
- attribution survives transit, permanently (§12.6)
- the receiving practitioner may refuse without losing function (§12.6)
- ⛔⛔ no standing, ranking, or contribution count (§12.7)

⚠️ **Three further surfaces would convert commons into canon and must not be built**: consensus indicators ("most practitioners frame it this way"), popularity-weighted retrieval, and any *"best practice"* / *"validated approach"* framing in composed context. Each is a mechanism by which aggregate use silently becomes authority — the same silent upgrade as §3 and §5, at ecosystem scale.

### ⛔⛔ The threat model is emergence, not bad actors

Canonization does not require anyone to claim authority. It assembles itself:

```text
many practitioners use this
  → the system surfaces it often
    → it feels established
      → it becomes the norm
```

No step in that chain is a decision. **Use is not truth**, and frequency is not warrant — but a retrieval system that orders by frequency has *asserted* warrant without anyone authoring the claim. This is why §12.7's prohibition on ranking is structural rather than a policy: there is no bad actor to catch.

### Plurality is a requirement, not a byproduct

Refusing ranking is necessary and not sufficient. A living commons must **actively preserve** what canonization strips:

| A living commons preserves | A canon tends toward |
|---|---|
| lineage | compliance |
| **disagreement** | standardization |
| context | authority claims |
| evolution | |
| plurality | |

⭐ **Disagreement is the load-bearing one.** Two practitioners may contribute incompatible framings of the same territory, and both are legitimate — the Commons must be able to hold them *as incompatible* rather than resolving, merging, averaging, or selecting between them. Any synthesis step that reconciles contributed material into a single account has produced Class D text carrying Class A weight, and has quietly ruled on a question no one authorized it to rule on.

⭐ This is **Invariant 14 (cultural sovereignty)** at ecosystem scale — the risk §10 already flags for Layer 1 defaults, now compounded: a Commons that resolves disagreement will resolve it toward its own center of gravity, and a practitioner whose tradition sits outside that center will find their framing rendered as the deviation.

### 12.11 MAIA's role — do not become the place where disagreement disappears

The shape to refuse:

```text
Practitioner A ─┐
Practitioner B ─┼→ AI synthesis → "the emerging model"
Practitioner C ─┘
```

That is `interpretation → derivation` (§3) at ecosystem scale, with the synthesis step supplying the missing referent.

The shape to build:

```text
Practitioner A perspective ─┐
Practitioner B perspective ─┼→ Commons  (tension remains visible)
Practitioner C perspective ─┘
```

The Commons may say *"these practitioners understand this territory differently."* ⛔ It may not say *"these differences have been resolved into the best model."*

**This is an intelligence gain, not a limitation.** MAIA's contribution is in *preserving distinctions*, and the legitimate moves are:

- *this practitioner frames it this way*
- *this tradition frames it another way*
- *this evidence suggests another possibility*
- ⭐ *this remains unresolved* — a first-class output, never a failure to answer

### 12.12 The milestone is an honest empty state

The next real milestone is **not more architecture**. It is the first moment a practitioner sits down and the system can truthfully say:

> *"I don't know your work yet. Help me understand it."*

⭐⭐⭐ This is the Wisdom Field's equivalent of the empty `01_Larry_Own_Framework/` folder in the IP corpus: **an absence that is doing work.** It is the feature that prevents the system from pretending it already knows — the same doctrine as the absence-of-query rule in the custody spine (§1) and the *empty measurement ≠ absence* discipline.

⚠️ The pressure will be to fill it — with Commons defaults, with inferred framing, with a helpful starting template. Each of those is a system-supplied answer occupying the place where the practitioner's own authority belongs, and would make Layer 3 partly authored by the platform before the practitioner has written a line.

Under Invariant 16 the direction of authority is unchanged by the cycle: authority moves **upward through authored experience**. Contribution is the practitioner's authored work going outward — ⛔ it is not the Commons acquiring standing over the practitioner. A commons is something practitioners **draw from and add to**; a canon is something they are **measured against**.
