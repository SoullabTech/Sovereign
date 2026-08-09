# Track 4 — Constitutional Implementation ⊥ Operational Adoption (candidate refinement)

**Status: CANDIDATE REFINEMENT.** ⛔ Records a proposed refinement to the gating rule. ⛔ It does
**not** change the track structure, does not renumber anything, and authorizes no work. Founder-authored,
2026-08-06, in response to the ordering question raised against
[the Track 4 charter](PRACTITIONER_PUBLISHING_TRACK_4_IMPLEMENTATION_CHARTER_2026-08-06.md) §4.6.

> ⭐⭐⭐ **The first sequencing question in this lane that is not editorial.** Every prior blocker was a
> **dependency**. This one asks whether **two kinds of work have been grouped under one track when they
> obey different rules.**

---

## 1. The distinction

⭐ Track 4 as chartered contains **two categories of implementation**.

### A — Constitutional implementation

Instantiates new constitutional concepts:

- Placement
- Commitment event home
- Authority source
- Delegation instrument
- Custodial instrument
- Event ledger
- Rendering bindings

⛔ **These absolutely require Track 2.** They are *implementing rulings*.

### B — Operational adoption

⛔ Introduces **no** constitutional concepts:

- linking `practitioner_clients.member_id`
- practitioner onboarding
- Work ratification
- seeding `relationship_spaces` *(⚠️ see §4 — presumptively crossed)*
- migrating existing practitioner content
- adoption tooling

⭐ These do **not decide what Placement means.** They **prepare the substrate so that, once Placement
exists, it has something truthful to operate on.**

## 2. What the gating would become

⛔ Not this:

```
Track 2 → Track 3 → Track 4
```

⭐ But something more like:

```
Track 1
     │
     ├──────────────┐
     │              │
Track 2        Operational Adoption
     │              │
     └──────┬───────┘
            │
 Constitutional Implementation
            │
      Track 5
```

⭐⭐⭐ **The load-bearing observation:** operational adoption does ⛔ **not create constitutional facts.**
That is a different activity.

### ⭐⭐ Three things, not two (founder sharpening, 2026-08-06)

⚠️ *"It creates governed data"* is **weaker than the rest of this document** and undersells the
category. Distinguish **three**:

| | What it is | Who may create it |
|---|---|---|
| **Constitutional fact** | a new meaning — what an act *is*, who may perform it | ⛔ governance only |
| **Governed data** | rows under an already-settled meaning | operational adoption |
| **Governed capability** | ⭐ **eligibility** — the standing for a later constitutional act to be performable at all | operational adoption |

⭐ Work ratification does ⛔ not merely create governed data — it creates **eligibility**.

> ⛔⛔ **AMENDED 2026-08-09 — Ruling 1 §2, §2.1.** ⭐ As authored this paragraph continued:
> *"`member_id` linkage does not merely populate rows — it establishes that later constitutional acts
> have somewhere truthful to land."* ⛔ **That claim does not survive the ruling.**
>
> ⛔ `practitioner_clients` population or member association *"does not establish the constitutional
> commitment and does not confer relational authority."* ⭐ Linkage resolves **identity / reference**;
> ⛔ it creates **no governed capability**, because the later constitutional acts require a
> **constituted commitment**, which linkage does not advance.
>
> ⭐⭐⭐ **Permitted claim, exactly this narrow:** *`member_id` linkage resolves identity reference.*
> ⛔ **Forbidden claim:** that it confers relationship authority, Placement eligibility, or
> "constitutional readiness."

> ⭐⭐⭐ **The operational track is not preparing data. It is preparing constitutional readiness.**
> ⚠️ **True of Work ratification. ⛔ NOT true of `member_id` linkage** — see the amendment above.

⭐ That language explains **why these tasks matter** while still ⛔ refusing to let them answer
constitutional questions.

### Why it matters

Ratifying practitioner Works changes nothing constitutional — it moves rows from `uploaded` to
`ratified` under an **already-governed lifecycle**. Linking twelve existing practitioner-client
relationships to real `member_id`s is operational: ⛔ it settles neither the meaning of a Placement nor
a new authority source.

> ⚠️ **Amended 2026-08-09 (Ruling 1).** ⭐ Both sentences remain **true on the dependency gate**. ⛔ But
> the `member_id` example ⛔ **must not be read as progress toward Placement**: per Ruling 1 §2 it
> resolves **identity reference** and nothing more. ⭐ **Work ratification remains the one item here
> that genuinely advances eligibility.**

⚠️ **Holding those activities behind unrelated governance rulings may unnecessarily delay the platform
becoming ready for implementation.**

## 3. ⭐⭐⭐ The proposed rule

> **Operational adoption may proceed in parallel with governance only when it consumes existing
> constitutional decisions without requiring new ones. If an adoption task encounters an unresolved
> constitutional question, it stops and returns that question to Track 2.**

⛔ The rule is **not** *"data migration is operational."*
⭐ It is *"operational work is permitted only when it does not require answering an unresolved
constitutional question."*

⭐ Same pattern already arrived at elsewhere in this lane: **authorize by dependency, not by
chronological phase.**

### Relation to the implementation law

⭐ This is the **same law, one phase earlier**. The charter's law —
*implementation may specialize; it may never reinterpret* — governs building. This governs
**populating**: an adoption task that must decide a meaning has stopped being adoption.

## 4. ⚠️ The caution — where B crosses back into Track 2

⛔ Anything that forces you to answer **"what does this relationship actually mean?"** has crossed into
governance.

⚠️⚠️ **`relationship_spaces` is the live instance of that caution, not a hypothetical.** Seeding it is
⛔ **not automatically operational**: if doing so requires deciding whether it is the **authoritative
commitment container** or **merely a projection of `practitioner_clients`**, the task is governance.
📌 That is verbatim **Track 2 ruling 1 (Commitment Authority)**, which is open — so under the proposed
rule, seeding `relationship_spaces` is **presumptively blocked**, ⛔ despite appearing in the B list
above. ⭐ The discriminator disqualifies it; the list does not authorize it.

> ⚠️ **Amended 2026-08-09 — the example, ⛔ not the caution.** ⭐ Ruling 1 is now made, so this task no
> longer crosses because *"the ruling is open."* ⭐⭐⭐ **The caution itself is undamaged and remains the
> load-bearing paragraph** — it is simply no longer illustrated by this instance.
>
> ⛔ **What governs the instance now:** backfill from `practitioner_clients` is **prohibited**
> (Ruling 1 §2.1); constitution through a genuine **bilateral act is permitted** (§5.1). ⭐ The
> restriction survived the ruling — ⛔ but as **constitutional prohibition**, not as a queue position.

### Applying the discriminator to the B list

⚠️ **These are verdicts on the *dependency* gate only** — ⛔ passing here is **not** clearance to
proceed. A second, independent gate applies to every row: see §6.

| B-list item | Consumes settled decisions only? | Reading under the rule |
|---|---|---|
| link `practitioner_clients.member_id` | ✅ yes — no meaning decided | ⭐ operational **on this gate** · ⚠️ ⛔ **open on the §6 gate** · ⛔⛔ **and it advances nothing** — Ruling 1 §2: confers no relational authority, does **not** clear the Placement blocker |
| Work ratification (`uploaded` → `ratified`) | ✅ yes — lifecycle already governed (Ontology §5) | ⭐ operational |
| practitioner onboarding | ✅ likely | operational **until** it must assert a commitment container |
| adoption tooling | ✅ likely | operational **if** it only drives the two rows above |
| migrating existing practitioner content | ⚠️ unclear | ⛔ **stops** if it requires disposition of the six share-shaped tables (Phase Record §5.5) |
| seed `relationship_spaces` | ✅ **ruled 2026-08-09** (⛔ was: *"crossed — is Track 2 ruling 1"*) | ⛔⛔ **backfill from `practitioner_clients` PROHIBITED** — Ruling 1 §2.1, a constitutional bar, ⛔ no longer a procedural wait · ⭐ seeding **through a genuine bilateral constituting act is permitted** (§5.1) |

⚠️ This table applies the founder's discriminator to the founder's own examples. ⛔ It is not a ruling
and settles nothing — it shows the rule already has teeth on the list that motivated it.

## 5. Standing of this document

⛔ **Recorded as a candidate refinement, not adopted.** Until a founder act adopts it:

- ⛔ the [Track 4 charter](PRACTITIONER_PUBLISHING_TRACK_4_IMPLEMENTATION_CHARTER_2026-08-06.md) §2
  preconditions stand **unamended** — Track 4 in whole remains gated on Track 2
- ⛔ no adoption work is authorized to begin in parallel
- ⭐ what changes now is only that the question is **named and recorded** rather than resolved silently
  the first time someone links a `member_id`

⭐ Adoption would amend charter §2 (preconditions) and §4.6 (the adoption workstream), and would add the
discriminator as the gate on category-B work. ⛔ Nothing else in the charter is touched.

## 6. ⭐⭐⭐ What this document does NOT govern — the second gate

⛔⛔ **Two independent tests. ⛔ Do not couple them** (founder, 2026-08-06):

| Test | Governing question | Failure owner |
|---|---|---|
| **Constitutional dependency** | Does this require an unresolved ruling? | **Track 2** |
| **Population conformance** | Does this introduce facts **without an authored act**? | **Track 5** |

⭐⭐⭐ **This document governs the first test only.** Passing it means *"no ruling is required"* — ⛔ it
does **not** mean *"proceed."* A task may pass the dependency gate and still fail population
conformance.

📌 **`member_id` linkage is exactly that case** — it passes here and is ⛔ **open** at
[Track 5 §5.4a](TRACK_PROGRESSION_AND_TRACK_5_INHABIT_2026-08-06.md), which asks *what authored act
makes this identity link true?* ⛔ **That question is deliberately not answered in this document**, and
its reasoning is ⛔ not reproduced here — folding it in would re-couple two gates that must stay
independent.

⭐ Track 2 decides **meaning**. Track 5 decides **truthful population**. ⛔ Neither may settle the other.
