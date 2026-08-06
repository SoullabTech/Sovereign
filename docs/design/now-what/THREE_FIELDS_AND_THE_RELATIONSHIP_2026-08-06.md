# The Relationship Workspace — the primary domain object Studio and Now What? both render

**Date:** 2026-08-06
**Author:** Kelly Nezat (founder direction, stated and refined four times on 2026-08-06)
**Status:** ⛔ **DIRECTION RECORDED — NOT RULED, NOT BUILT.** Supersession candidate for the
practitioner-door half of `NOW_WHAT_PRACTITIONER_SURFACE_COMPOSITION_2026-08-05.md`.
**Scope:** the architecture of the member↔practitioner seam, and what may cross it.

> **Founder's engineering-lead framing:** *Define the Relationship Workspace as the primary domain
> object that Studio and Now What? both render — before building more features.*

---

## 1. The correction chain (all on 2026-08-06)

| # | Direction | Fate |
|---|---|---|
| 08-05 | *"admin at the bottom of Now What, full practitioner field behind that door"* — shipped `95cfae2e8` + `ab57d848b`, unmerged | 🔴 **overturned** |
| 1 | Practitioner looks *through* the relationship; perspective switch, not admin | superseded by 4 |
| 2 | Studio connects to the developmental **relationship**, not the client's fields; four tabs per client | 🔴 four tabs superseded by 4 (§4) |
| 3 | *"The relationship is the API between Studio and Now What?"* — my phrasing | 🔴 **corrected by founder** (§3) |
| 4 | **Relationship Workspace = primary domain object; both environments render it** | ✅ **current** |

⛔ Do not record 08-05 as "the door leaked practitioner surface." It did not — non-holders received
`practitioner: null`. The objection is ontological (whose place is this?), not a security finding.

---

## 2. The shape

```text
                Relationship
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
 Practitioner     Shared State     Client
    Studio                          Field
```

- Everything belonging to the **relationship** is available to both.
- Everything belonging to the **practitioner** stays in Studio.
- Everything belonging to the **client** stays in Now What?
- **MAIA stewards continuity among the three without owning any of them.**

⭐⭐⭐ The Relationship is a first-class object, **conceptually above** clients · practitioners ·
sessions · keeps · programs — not another table alongside them.

### ⭐⭐⭐ The primitive is a *shared developmental commitment*, not a relationship

Founder refinement, 2026-08-06:

> The relationship is not simply `Coach + Client`. It is **a shared developmental commitment**,
> with the participants occupying **roles within it**.

This is the deepest correction in the chain, and it is not cosmetic:

- **Roles are held inside the commitment, not globally.** "Practitioner" is not an identity; it is a
  position someone occupies in one commitment. The same person may be a member elsewhere. This is
  already what the auth chain asserts (⛔ no separate `/practitioner/login` — practitioner is a role
  held by an authenticated member).
- **It explains the contents.** Programs, Shared Questions, Offerings, Sessions, Practices belong to
  the *commitment*, not to either individual — which is why neither may unilaterally remove them and
  why neither owns the crossing.
- **It is what generalizes.** therapist–client · teacher–student · mentor–founder · physician–patient ·
  spiritual director–retreatant · collaborators · teams · families. ⭐⭐ What they share is **not
  their role pairing** — it is *"we are intentionally developing something together."* Model the
  role pair and you build a coaching product; model the commitment and you build the substrate.

⛔ The user never sees this terminology. It is architectural.

### ⭐⭐⭐ Four circles, and the one question asked of every object

Founder, 2026-08-06 — the ontological discipline that replaces countless feature decisions:

```text
   Practitioner Field        Relationship Workspace
   Client Field              Practice Wisdom
```

> Ask one question of every object in the system: **which field does this belong to?**
>
> - **relationship** → appears in both Studio and Now What?, rendered appropriately
> - **client** → never appears in Studio unless the client explicitly brings it into the relationship
> - **practitioner** → never appears in the client's field unless the practitioner intentionally offers it

⭐⭐ **Once every object has a home, the UI becomes an expression of the ontology instead of
inventing its own rules.**

#### The fourth scope is load-bearing — `practitioner_practice` ⊥ `practitioner_wisdom`

| | `practitioner_practice` | `practitioner_wisdom` |
|---|---|---|
| Bound to | **one** commitment | **no** commitment |
| Example | *"I wonder whether she confuses generosity with self-erasure"* | *"The difference between being generous and rescuing"* |
| Offerable | ⛔ **never directly** | ✅ that is what it is for |

**Governing rule:** *relationship-bound practitioner reflection is never directly offerable.
Practitioner wisdom may be offerable because the practitioner has re-authored it beyond the
individual relationship.*

⛔⛔ That movement is **not** sharing, **not** redaction, **not** removing a name, **not** toggling
visibility. It is a **new authorship act**:

```text
Private practice inquiry
      ↓ practitioner develops / re-authors
Practitioner wisdom object
      ↓ deliberate offer
Shared developmental commitment
```

The original reflection remains private and unchanged. The wisdom expression is a **distinct
object** whose provenance runs back to the practitioner's own inquiry — never to the member's material.

⭐⭐⭐ **Practitioner wisdom is authored through reflection on practice; it is never computed from
members.** The fourth scope is ⛔ **not** permission for cross-client analysis, and
`practitioner_wisdom` must never become a polished aggregation surface.

⭐⭐ **Why this had to precede preservation:** without the fourth scope, the system eventually
smuggles a transformation of meaning into a permission flag. The type system now makes that
category error impossible.

### ⭐⭐ Accompanying, not monitoring

Founder, 2026-08-06: *"Not monitoring. Accompanying. Monitoring implies surveillance; accompanying
implies relationship. The practitioner isn't watching progress — they're accompanying development."*

🔴 **Disposition: the word `Monitor` is retired WITH `/now-what/admin`, not repaired in place.** The
larger direction has overturned the member-side practitioner door; ⛔ do not spend design effort
rehabilitating surveillance vocabulary on a surface already marked for retirement.

⭐⭐ Naming protection on the practitioner's per-relationship surface: **every item begins with
"shared"** — Shared Questions · Shared Practices · Shared Commitments · Shared Conversations.

### Relationship contents (founder enumeration)

Participants · Purpose · Status · Programs · Shared Questions · Shared Practices · Shared Resources ·
Shared Sessions · Shared Timeline · Shared Milestones · Shared Correspondence

⚠️ **"Shared Correspondence" needs care.** The founder also ruled ⛔ *never* `New Message (1)` —
correspondence is a record of **offerings made and received**, not an inbox. An inbox turns the
relationship into a channel.

---

## 3. ⭐⭐⭐ Not an API — a shared object

> *Stop thinking of Studio and Now What? as two applications. They're two perspectives on the same
> developmental relationship. You don't connect them with APIs after the fact — you define the
> relationship as the shared object, and both environments render it differently.*

🔴 **This corrects the earlier "the relationship is the API" formulation, which was mine, not the
founder's.** An API is a seam between two systems that own their own state; a shared domain object
means neither environment owns the crossing at all. The difference is load-bearing: an API model
invites synchronization, copying, and eventual drift between two truths. The shared-object model has
one truth, rendered twice.

**This reconciles with the 2026-08-04 House ruling** (`HOUSE_IA_RULING_STUDIO_ONE_THRESHOLD`):
*"Studio is one threshold. Mode is revealed after entry."* The practitioner's home is `/studio`.
There is no second practitioner address and no practitioner environment mounted inside the member's.

⭐⭐ Server-gate discipline is unchanged: a member holding no practice receives **no door and no
relationship payload** — absent at the payload, never suppressed at the pixel
(`feedback-absent-is-not-hidden`).

---

## 4. Studio, opening Maya — one screen, two layers

🔴 Supersedes the four-tab shape (Overview · Relationship · Development · Practice) proposed earlier
the same day.

```text
──────────────────────────────
Maya · Relationship
──────────────────────────────
Upcoming conversation
Shared questions
Shared work
Program
Resources
Offerings
Continuity
──────────────────────────────
Private Practice
Session preparation
Private reflections
Research
Inquiry
──────────────────────────────
```

⭐⭐⭐ **Everything above belongs to them. Everything below belongs to Larry. Nothing is confused.**

⚠️ **Private Practice must be absent from every member-facing payload**, not merely unrendered.

---

## 5. ⭐⭐⭐ The verb rule — contribution, never editing

The practitioner may never edit a member-authored object. Authority attaches to the verb, not to
visibility: Larry seeing Maya's question does not give him a write path to it.

| Member object | Larry may | Larry may NOT |
|---|---|---|
| **My Question** | leave a reflection · offer a question · attach a resource · bring to next session · let it remain | edit the question |
| **My Work** | offer encouragement · suggest a practice · ask about it next week | rewrite it |
| **My Story** | private reflection · offer observation · ask about this · **do nothing** | write any part of it |
| **My Coaching** | schedule · reschedule · place a program · share readings · upload audio · record reflections · leave preparation questions | — (this is the bridge room; it is *for* this) |

⭐⭐ **"Do nothing" is a first-class option and must render as one.** A surface offering only actions
manufactures intervention.

---

## 6. Gestures → relationship → render

| Act | Origin | Relationship gains | Other side renders |
|---|---|---|---|
| Larry offers a poem | Studio · `Offer →` | Offering (recipient: Maya) | *"Larry left something for you."* |
| Larry places a program | Studio · `Place with Maya` | Program | *Your Program* |
| Larry leaves a preparation note | Studio · `Offer before next session` | Pending Offering | *"Larry has something for your next conversation."* |
| Maya declares a question into the relationship | Now What? | Shared Question | *Questions Maya has chosen to carry* |

### 🔴🔴 One correction to the founder's gesture table

The sketch reads `Maya keeps a question` → `Relationship · Shared Question`. **Keep is not a sharing
act.** Keeping is Maya's private act of carrying something; declaring it into the relationship is a
second, separate consent event.

⛔⛔ **A Keep must never auto-populate the practitioner's view.** The built system is already correct
here: `can_be_shown_to_practitioner` is a distinct flag set by an explicit member act, and
[`app/api/now-what/home/route.ts:24`](app/api/now-what/home/route.ts:24) states it. Collapsing Keep
into Shared would make a private act visible to a third party without the member choosing it —
the same failure class as §7's telemetry line.

⭐⭐⭐ **The crossing IS the consent event.** Preserve it as its own gesture.

### Programs — placement, not copying

⚠️ A placed program is the one legitimate **live pointer**: a shared relationship object under both
parties' awareness. An **offering** is a version declaration (`6d750c9ba`: *an offering declares a
VERSION, not a live pointer*). ⛔ Do not unify the two mechanisms — different ownership.

---

## 7. What may cross — and the one line that must not ship

Founder: *"No transcript. No AI summary. No sentiment score. No engagement score. Only relationship."*

⛔⛔ **"Returned twice" IS an engagement count** — activity telemetry about the member, sent to a
third party, with no declaring act.

| Line | Verdict | Why |
|---|---|---|
| "What / which questions she has chosen to carry" | ✅ admissible | authored **and** declared into the relationship |
| "Kept one reflection" | 🔴 inadmissible **as a count** | Keep ≠ share (§6). Admissible only if declared. |
| "Added one practice" | ⚠️ conditional | same test |
| "Returned twice" | 🔴 inadmissible | pure telemetry |

⭐⭐⭐ **Everything crossing the seam is a DECLARATION, never an OBSERVATION** — and it is
**two-sided**: intentionally offered *and* intentionally received.

### MAIA's relationship awareness — split the class

| Sketch | Class | Status |
|---|---|---|
| *"She has not yet opened your reflection"* | state of **Larry's own** offering | ⚠️ arguably admissible — the object is his |
| *"The article you offered has become part of her work"* | requires **Maya's declaration** | ⚠️ admissible only via her act |
| *"Maya has brought this same question back three times"* | **pattern claim about a person**, to a third party | 🔴 **UNRULED** |

⛔⛔ Build none of the three until this table is ruled. *"Not as alerts, as relationship awareness"*
governs **tone**; it does not settle **admissibility**.

---

## 8. ⭐⭐⭐ MAIA's scope rule — the most testable invariant here

| Question | Answered only from |
|---|---|
| Larry: *"What has become alive since our last conversation?"* | the **shared relationship** |
| Larry: *"What have I been wondering about Maya?"* | **Larry's private inquiry** |
| Maya: *"What have I been carrying?"* | **Maya's field** |

⭐⭐ **MAIA owns nothing; it knows the boundaries.** This is the operational form of "stewards
continuity without owning any of it" — and it can be pinned by tests **before any UI exists**.
It is the cheapest high-value thing to build first.

---

## 9. The wisdom loop

```text
Practitioner Wisdom → Offer → Relationship → Client encounters it → Conversation
   → Client authors meaning → Practitioner learns → Wisdom evolves
```

Nothing copied. Nothing overwritten. Everything under its proper authorship.

⭐⭐⭐ **Wisdom is the fourth inquiry**: not *what does the practitioner know?* but *how is the
practitioner's own wisdom evolving through this practice?* The practitioner develops too.

**Inquiry** is the genuinely new room: *what am I wondering now?* — not *what do I conclude?* An
inquiry belongs to Larry until intentionally shared; each may be kept privately, brought to the next
session, offered, converted into a practice, or developed into an article. ⛔ A practitioner never
writes into the member's Questions room.

---

## 10. Blockers

1. ⛔⛔ **The Relationship object has no schema and no authority model.** `coach_shared_offerings`
   (`20260705000001_offerings.sql`, `feature/bring-forward-v1`, **PARKED**) is *member →
   practitioner*, one-directional. This needs the reverse direction plus a container neither party owns.
2. ⛔⛔ **§7 MAIA-awareness table is UNRULED.**
3. ⛔ **Server-gate ruling formally open** (`project-practitioner-door-placement-conflict`) — the
   built code implements absence; canon does not yet require it.
4. ⛔⛔ **Larry's IP is not ingested and must not be** until the signed rights one-pager exists
   (`project-larry-ip-corpus-null`). The Wisdom Field is a container with no admissible content.
5. ⛔ **D9 unruled** — client research recruitment authority.
6. ⚠️ `AIN_OS_EXPERIENCE_CONSTITUTION` is DRAFT and gates further Now What? UI.

---

## 11. Recommended sequence

Founder-ruled order, 2026-08-06: **complete the four-scope module → preserve it → rule §7 → only
afterward define the commitment schema → model recipient sets when offerings become the active slice.**

1. ✅ **DONE 2026-08-06 — the four-scope boundary pinned as tests before any UI.**
   `lib/relationship/scope.ts` (pure boundary module — no storage, no schema, no UI) +
   `lib/relationship/__tests__/scope.test.ts`, **68/68 green**. Encodes: four scoped queries ·
   role-asymmetric readability (⛔ a practitioner can never read `member_field`; no role reads all
   four) · practice is commitment-bound, wisdom is not · **relationship-bound reflection is never
   directly offerable** · de-identification does **not** convert practice into wisdom · conversion
   requires an explicit practitioner authorship gesture, creates a **distinct** object, never mutates
   the source, and ⛔ **MAIA may never perform it** · wisdom may not cite member material (throws
   `Unruled`) · nothing bridges into `member_field` · declaration-not-observation · **Keep ≠ Share** ·
   the verb rule with `edit` absent by construction and `do_nothing` available on every member object
   **and on both sides of the transformation**. All three MAIA-awareness classes **throw `Unruled`**
   and name this document — ⛔ that refusal is a **HOLD, not a final disposition**.
   ### ⭐⭐⭐ System draw ⊥ person-initiated crossing (correction, 2026-08-06 review)

   Substantive review of the first head found the module's three crossing-related functions
   disagreeing about the same act: a practitioner declaring their own private practice
   reflection **passed** `admitsToCommitment` while `isOfferable` and the draw rule both
   refused it. ⭐⭐⭐ **An actual contradiction in the executable boundary language, even with
   zero callers** — and the most permissive function had the most inviting name. Corrected:

   | | System draw | Person-initiated crossing |
   |---|---|---|
   | Function | `maySystemDraw(into, from)` | `admitsToCommitment(crossing)` |
   | Act | the system retrieves or derives material across scopes | a person carries · declares · places · offers |
   | Gesture | ⛔ none | ✅ required |

   **Governing rule:** *a person-initiated crossing may be permitted where a system-initiated
   draw is forbidden, but both must preserve source provenance and satisfy the destination's
   constitutional rules.* A member declaring their own question into the commitment is exactly
   the legitimate difference; ⛔⛔ **a gesture never erases source scope.**

   A crossing now answers **both** questions — *who initiates* (`declaredBy`) **and** *what
   relationship the material already belongs to* (`sourceScope`, required). A person may only
   carry across what is already theirs: the member declares from `member_field`, the
   practitioner from `practitioner_wisdom`. ⛔⛔ `practitioner_practice` is absent from every
   crossing source **by construction**.

   ⚠️ **Documented floor:** `developIntoWisdom`'s difference check is a **minimum gesture test,
   not proof of substantive re-authorship** — a one-character mutation passes, and a test pins
   that honestly. Substantive re-authoring is the practitioner's responsibility and is not
   machine-checkable. ⛔ Never read a pass as a system attestation.

2. **Rule §7** — declaration-not-observation, plus the MAIA-awareness table. Everything downstream
   depends on it. ⛔ The fourth scope is **not** permission for cross-client analysis.
3. **Define the Relationship Workspace** — schema + authority model (§10.1). Its own lane. This is the
   architectural milestone; the founder's instruction is to do it *before building more features*.
4. **Retire `/now-what/admin`** (and the word `Monitor` with it), remove the door from `ClientHome`;
   the practitioner's home is `/studio`.
5. **Re-author the Studio per-client surface** to one screen, two layers (§4).
6. **Model recipient sets** when offerings become the active slice — HELD, downstream of admissibility.
   The likely shape: an offering declares a **bounded** recipient set; a cohort is a recipient entity;
   offer-to-many stays finite and intentional; publication has **no** relationship-bounded recipient set
   and follows a separate lifecycle. ⛔ Adding it now would move the lane from scope boundary into
   distribution modeling.

⛔ Do not do (4) before (2): relocating the surface without the seam rule ships the telemetry line
in a nicer frame.
