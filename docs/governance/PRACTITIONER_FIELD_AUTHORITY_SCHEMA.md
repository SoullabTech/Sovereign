# Practitioner Field — Authority Schema

**Version:** v1 · **Date:** 2026-08-03
**Status:** ⛔ **SCHEMA / DESIGN — NOT IMPLEMENTED.** No table, no migration, no route, no compiler exists. This document authorizes nothing to run.
**Companions:** [Attachment A instrument](LARRY_ATTACHMENT_A_INSTRUMENT_v0.md) · [Source & Custody Sitting agenda](LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md)

---

## 0. The governing principle

> **Attachment A is not a description of permissions. It is the signed source record from which permissions are derived.**

The system must never ask *"what did the practitioner probably mean?"* after the fact. If a permission cannot be compiled from the signed record without inference, it does not exist.

```
Sitting → source + custody decisions → signed Attachment A
   → permission compiler → field controls → MAIA retrieval boundary
```

Every arrow is one-directional. Nothing downstream may write upstream. A retrieval outcome never edits a permission; a permission never edits the source record.

**Larry is not the exception — he is the first proof case.** The same schema must carry a therapist's practice, a spiritual director's tradition, an educator's curriculum, and Kelly's own AIN-derived field. Anything in this schema that only works for executive coaching is a design defect.

---

# Part 1 — Data model

## 1.1 `PractitionerSource` — the provenance object

Every item entering a practitioner field gets one. Creation is a **discovery** act, not an authorization act.

```ts
PractitionerSource {
  id
  practitioner_field_id
  title

  source_type:
    | 'authored_framework'
    | 'teaching'
    | 'exercise'
    | 'recording'
    | 'transcript'
    | 'selected_lineage'      // the practitioner's *selection*, not the text
    | 'third_party_reference'
    | 'derived_summary'       // Soullab- or system-produced from a source

  origin: {
    creator                   // who made it — NOT assumed to be the practitioner
    contributor
    received_from
    date
  }

  // ⭐ Independent of `creator`. What relationship does this artifact
  // CLAIM to its sources? Identity of the author cannot carry this.
  source_relationship: {

    // ⭐⭐ MISSING provenance ⊥ NEGATIVE provenance. `unknown` is the
    // absence of a claim; it is never a kind of claim. It can only be
    // DEFAULTED to, never chosen, and only a human act clears it.
    state: 'unknown' | 'asserted' | 'validated'

    kind:                     // required when state !== 'unknown'
      | 'primary'             // the practitioner's own authoring act
      | 'derived_from_primary'// composed from named primary sources
      | 'interpretation'      // a reading OF the work, not a derivation FROM it
      | 'selection'           // the practitioner chose it; text is someone else's

    derived_from: source_id[] // REQUIRED and non-empty when kind is
                              // 'derived_from_primary'; each must resolve
    validated_by              // required when state === 'validated' —
    validated_at              // the SOURCE practitioner, not the composer
    claim_text                // rendered from the fields above, never free-hand
  }

  custody: {
    owner
    rights_status
    agreement_reference       // which signed instrument covers this
  }

  status: 'discovered' | 'reviewed' | 'ratified' | 'rejected'
  content_ref                 // pointer; may be null for lineage-only rows
  version                     // monotonic; see §3.3
}
```

**Type integrity rule.** `selected_lineage` and `third_party_reference` **may not carry retrievable content**. `content_ref` must be null or a citation record. A Harvard slide deck and a practitioner's own worksheet can both be rows here; they can never be the same *kind* of row. Any migration path that would let a `third_party_reference` acquire retrievable content is prohibited.

**`derived_summary` is never a substitute for its source.** It inherits the strictest permission of its parents — it can never be more permissive than what it was derived from.

### ⭐⭐⭐ Author identity ⊥ source relationship

These are two axes, and the author field alone cannot carry the second. Four artifacts, two authors, four different authorities:

| Artifact | Creator | `source_relationship.kind` |
|---|---|---|
| Reflection on Larry's work | Kelly | `interpretation` |
| Summary of the Larry interview | Kelly | `derived_from_primary` |
| Larry's framework document | Larry | `primary` |
| Research Larry values | Larry (selector) | `selection` |

**Validation rule — this is the incident, made unrepresentable.** A row with `kind: 'derived_from_primary'` must name its `derived_from` sources, and each must resolve to a row with `kind: 'primary'` and `ownership: 'mine'`. If any named source is itself an `interpretation`, a `selection`, or unresolvable, **the claim is invalid and the row does not compose** — the compile fails rather than downgrading.

Applied to §4.2: the composed corpus claimed *"composed in full from Larry Closs's program documents"* while its first embedded source was a Soullab candidate. Under this rule that row's `derived_from` would resolve to an `interpretation`, the claim would fail validation, and it would never have reached a room. **The honest byline would not have rescued it, and it should not have** — the false claim was in the sourcing, not the authorship.

> **Provenance must preserve the relationship between an artifact and its claimed sources, not only the identity of its creator.**

### ⭐⭐ `state` — who has confirmed the relationship

`kind` records what relationship is claimed. `state` records **whether the source practitioner has confirmed it**, and the two must not merge.

| `state` | Means | Corpus composition |
|---|---|---|
| `unknown` | No source relationship recorded. An **absence**, not a category. | ⛔ blocked |
| `asserted` | Someone recorded a relationship; the source practitioner has not confirmed it | ⛔ blocked |
| `validated` | The **source practitioner** confirmed it — `validated_by` is them, never the composer | ✅ eligible |

`unknown` is strictly worse than `interpretation`. *"We know this is a reading of the work"* carries honest context; *"we do not know what this is"* carries none. So `unknown` may only ever be **defaulted to**, never chosen, and only a human act clears it — never inference from filename, folder, or similarity.

**This is where the five-domain artifact sits.** It is `interpretation` + `asserted`: not a provenance failure — it never claimed Larry wrote it — but a translation awaiting its source. Under this rule an `asserted` row cannot reach runtime composition, which makes the correct sequence structural rather than disciplinary:

```
Larry's language → confirmed distinctions → source relationship
    → field vocabulary → runtime composition          ✅ receives a world

candidate vocabulary → runtime → ask practitioner to confirm
                                                       ⛔ asks approval of ours
```

The second path is what produced both defects in §4.2. `state` closes it.

⚠️ `claim_text` is the sentence a reader sees. It is **rendered from** the structured fields, never authored free-hand alongside them — otherwise the prose and the record can disagree, which is exactly how §4.2 happened.

## 1.2 `AttachmentAPermission` — the enforceable decision

One per source. Produced **in the sitting**, signed by the practitioner.

```ts
AttachmentAPermission {
  source_id
  attachment_a_version

  ownership:
    'mine' | 'influenced_me' | 'third_party' | 'unknown'

  relationship_to_practice:
    'core_framework' | 'supporting_reference' | 'background' | 'private_context'

  permitted_use:
    'ground' | 'offer' | 'reference_only' | 'private' | 'never'

  member_visibility:
    'none' | 'practitioner_only' | 'selected_members' | 'all_members'

  maia_behavior: {
    may_retrieve
    may_summarize
    may_offer
    may_generate_from
  }

  practitioner_note                 // context so MAIA does not misuse it
  signed_by                         // practitioner identity
  signed_at
}
```

`maia_behavior` is **compiled, not hand-set** (§2.2). It is stored because enforcement reads it, and because a stored compile output is auditable against the record it came from.

## 1.3 `private` ⊥ `never` — these must not collapse

The hardest distinction in the model. Collapsing them is the failure mode that turns a custody system into a storage system.

| | `private` | `never` |
|---|---|---|
| **Means** | This is mine; the system may hold it under my control | This must not exist as usable system material |
| **Examples** | private teaching note · unpublished draft · personal reflection | confidential client information · material included by accident · explicitly excluded work |
| **Stored** | yes | audit artifact only — the *decision* is stored, the material is not retained as field content |
| **Practitioner access** | yes | n/a |
| **MAIA access** | none, unless the practitioner explicitly changes it | none, and not changeable by permission edit |
| **Ownership** | confirmed as the practitioner's | may be someone else's entirely |
| **Reversal** | a practitioner gesture | requires a new sitting decision + re-signature |

**A `never` row is not an empty permission — it is a completed decision.** It must be representable, signable, and countable, precisely so that "not on the list" and "ruled out" are distinguishable in an audit.

---

# Part 2 — Permission compiler

## 2.1 The compiler is a pure function

`compile(signed AttachmentAPermission) → EligibilitySet`

- Deterministic. Same record in, same set out.
- **No defaults that widen.** A missing or unparseable field is a **compile failure**, not a fallback to permissive.
- An **unsigned** Attachment A compiles to the **empty set**. Not to "everything pending review."
- The compiler reads only the signed record. Not the corpus, not filenames, not folder structure, not what a source "obviously is."

## 2.2 Compile rules

| Signed input | `may_retrieve` | `may_summarize` | `may_offer` | `may_generate_from` |
|---|---|---|---|---|
| `ground` | ✅ | ✅ | ❌ | ✅ (grounding only) |
| `offer` | ✅ | ✅ | ✅ | ✅ |
| `reference_only` | ✅ (citation record only) | ❌ | ❌ | ❌ |
| `private` | ❌ | ❌ | ❌ | ❌ |
| `never` | ❌ | ❌ | ❌ | ❌ |

**Ownership gate, applied before the table.** If `ownership` is `third_party` or `unknown`, every behavior compiles to ❌ regardless of `permitted_use`. A practitioner cannot grant what they do not own; the compiler enforces that rather than trusting the row.

`influenced_me` compiles to at most `reference_only` — the *fact of the influence* is retrievable, the text never is.

**`may_generate_from` never authorizes reproduction or impersonation.** The governing agreement prohibits model training, impersonation, and cross-environment use; no compile path may produce a behavior that contradicts it.

## 2.3 Compile is not a promotion

Compiling produces eligibility. Eligibility is not activation, and activation is not member-visible. `member_visibility` is an independent axis — a `ground` source with `member_visibility: 'none'` grounds the practitioner's own surface and reaches no member.

---

# Part 3 — MAIA retrieval enforcement

## 3.1 The boundary sits *between* the corpus and MAIA

Not:
```
MAIA → search everything
```
But:
```
MAIA request → permission layer → eligible sources only → response generation
```

The layer is not a filter applied to results. It **scopes the query** so ineligible sources are never candidates. A filter that runs after retrieval has already let the material into the process.

**Worked example — an executive asks about flourishing:**

| Source | Outcome |
|---|---|
| Larry-authored framework — `ground` | ✅ eligible, grounds the response |
| Research Larry selected — `reference_only` | ✅ citation record only; text never retrieved |
| Harvard PSY 1060 lecture slides | ❌ not source material — `third_party`, ownership gate |
| Larry's private notes — `private` | ❌ blocked |

## 3.2 ⚠️⚠️ Absence must be absent

A blocked source must not leak through the channels a presence-check cannot see. **Presence assertions cannot detect relational failure.** Enforcement must be tested for leakage via:

- **result counts** — "12 sources considered" reveals the blocked ones exist
- **ordering** — a gap where a high-ranking blocked item would have sat
- **timing** — a measurably slower path when blocked material was scanned and dropped
- **metadata** — titles, dates, or counts surfacing without content
- **conversational tell** — *"there's something here I can't share"* is a disclosure. MAIA must respond from what it has, not narrate what it was denied.

The acceptance test for this layer is an **absence test**, not a presence test: prove the instrument can see the blocked object before reading a clean result as enforcement.

## 3.3 Change governance — the dangerous moment is later, not at ingestion

A practitioner uploads "New Flourishing Model v2." The system **must not silently replace** v1.

```
uploaded → reviewed → practitioner ratified → composable
```

- Upload creates a new `PractitionerSource.version` at status `discovered`. It is **not** eligible.
- The prior version stays eligible and unchanged until the practitioner ratifies.
- **Only the practitioner's explicit ratify gesture makes a version composable.** No inference from recency, filename, or similarity.
- ⛔ **No silent promotion.** A new version never inherits the old version's permissions; permission is re-signed against the version.
- An **offering already made to a member is a declaration, not a live pointer** — it pins `source_version_at` and fails closed if that version is later withdrawn, rather than silently re-pointing at v2.

🔴 **Dependency, unresolved.** Field Object versioning is an open governance question and is **not ruled**. §3.3 states the constraint this schema requires; it does not settle the versioning model, and nothing here authorizes implementing one.

---

# Part 4 — What is and is not authorized

| | State |
|---|---|
| Schema design | ✅ this document |
| Attachment A instrument | ✅ drafted, **unpopulated** |
| Sitting agenda | ✅ drafted |
| Larry's signed Attachment A | ❌ does not exist |
| Signed materials agreement | ❌ **unsigned** |
| `PractitionerSource` / `AttachmentAPermission` tables, compiler, retrieval boundary | ❌ **not built, not authorized** |
| Any ingestion of practitioner material | ⛔ **blocked by the agreement's own §1** |

## 4.1 🔴 An unguarded composition path is already live

This schema is **not** being added to an empty seam. A field-composition path exists in production today and it has **none** of the controls in Parts 2–3.

`lib/maia/roomComposition.ts` → `resolveFieldBlock()`: any `?fieldContext=<slug>` on the room URL resolves via `getPracticeFieldBySlug` and renders through `formatFieldContextForRoom`, which composes **the field's corpus in full**. The function's own doc comment states this as intent: *"the field's corpus in full — depth is the product."*

What gates it: one env kill-switch, `NOW_WHAT_FIELD_CONTEXT_ENABLED === '0'`.
What does **not** gate it:

- ⚠️⚠️ **`status` gates nothing.** No read path filters on it. A row at `status='pending'` composes exactly like a ratified one. Per Part 2 this is the difference between eligibility and existence — the live path does not make it.
- No ownership check — the §2.2 ownership gate does not exist.
- No `permitted_use`, no `private`/`never` distinction, no `member_visibility`.
- No retrieval boundary — this is composition of the whole corpus into prompt context, the shape Part 3 exists to prevent.

## 4.2 The incident, and a measurement-ordering artifact

**⛔⛔ A prior revision of this section claimed the corpus was never in production. That claim was wrong** — it was produced by measuring prod at 17:27:56, five minutes **after** a parallel session had already contained the corpus at **17:22:31** under founder order. The instrument saw a repaired system and inferred an unbroken one. It is retained here as a worked example, not deleted.

### Ground truth (captured *before* any write)

`~/Larry_Corpus/00_PROVENANCE/evidence/` — read from `ssh minisforum docker exec maia-postgres`:

```
PRE-CONTAINMENT   field_slug: now-what-demo · status: pending · active_len: 63861
POST-CONTAINMENT  field_slug: now-what-demo · status: pending · active_len: 0
                  reason: contained 2026-08-03 …   updated: 17:22:31
```

Preserved dump: 65,382 bytes, `sha256:e984d324…cab3cd91`.

**So it was in production, on the reachable `now-what-demo` slug**, composed in full into every room resolving that slug, until containment.

### What the header actually said

Precision matters here, because both my earlier framings were wrong in opposite directions. The preserved corpus opens:

> *"Provenance: composed in full from Larry Closs's program documents by the platform steward (Kelly Nezat), 2026-07-10, pending Larry's own authoring act, which supersedes this. **Not authored by Larry directly.**"*

- ✅ **Authorship was disclosed correctly.** It names Kelly as composer and states outright that Larry did not author it.
- ⛔⛔ **The source attribution was false.** *"Composed in full from Larry Closs's program documents"* — while the first embedded source is a Soullab **candidate** whose own line reads *"Nothing here authorizes construction."*

The defect is therefore narrower and more interesting than "claimed to be Larry's": the system disclosed *who wrote it* and misdescribed *what it was written from*. A candidate translation was represented as a derivation from primary sources. That is precisely the failure §1.1's `derived_summary` / `selected_lineage` typing exists to make unrepresentable.

### Two databases, two real objects

Both sessions measured something real. Prod `now-what-demo` carried the 63,861-char corpus (now 0, with `status_reason` recording the containment). **Local dev also holds a 63,861-char copy**, on the row with NULL `field_slug` — slug-unreachable, still present. That second copy is what the post-containment measurement found, and mistook for the whole story.

⚠️ The earlier "prod labels itself correctly" observation conflated **two columns**. `about_practice` does carry an honest disclaimer; `active_field_content` carried the false source attribution. Both were true simultaneously.

### 🔴 Still live in production

The five-domain error, inside `about_practice` (512 chars, composes into every slug-resolved room):

> *"cultivated across five practice domains: **attention**, relationships, meaning, contribution, and presence"*

Invents "attention"; drops **Time Affluence** and **Health and Energy**. A **content/translation-fidelity** defect, not an authority-surface breach — and ⛔ fixable only from Larry's own language.

### ⭐⭐⭐ Standing rule this produced

> **Before concluding "it never happened," check whether a remediation timestamp precedes your measurement.**

A clean read is evidence about the system *now*. It is not evidence about the system at the time the concern was raised. Identify the object, verify its identity **and its version in time**, then measure, then interpret.

## 4.3 ⚠️⚠️ `status` cannot be the authority gate

The obvious containment — *"filter the slug path on `status`"* — **does not work**, and shipping it would create a false control surface.

`PracticeFieldStatus = 'pending' | 'warning' | 'live'`, and `checkPracticeFieldReadiness()` computes it as a **completeness heuristic**: are `welcome_message`, `how_we_work_together`, `how_maia_supports`, and `professional_practice` non-empty. That is a form-filled check. **No practitioner authority act is anywhere in it.**

Gating composition on `status = 'live'` would therefore mean: *a field becomes composable when someone finishes typing into four text boxes.* Filling in a missing paragraph would silently flip a field to composable with no ratification, no ownership check, and no signature — while the gate's name implied all three.

⛔ The authority gate must be a **distinct, explicit ratification state** written by a practitioner gesture (§3.3), not `status`. It does not exist yet, and this document does not authorize creating it.

**What this changes about this document.** Parts 1–3 describe a control surface that **does not exist**. Publishing a schema does not create a boundary — a control with no enforcing mechanism is a description. Until the compiler and retrieval boundary are built and wired, nothing in this file may be cited as protection for anything running in production.

**What it does not change.** The gate below still holds, and it held here: no Larry material has entered the system. The live defect is a **provenance-claim** defect — a Soullab candidate asserting Larry's authorship — not an IP breach. Those need different remedies and must not be collapsed into one alarm.

🔴 **Open, founder's call:** containment of the live demo field (correct the false header · gate the slug path on `status` · unpin the demo) is unexercised. This document does not authorize any of the three.

**Gate, unchanged:** *"If it's not on the list, it's not in the system"* · *"Nothing moves until both versions are signed."*

Persistence, when authorized, is self-hosted PostgreSQL via `lib/db/postgres.ts`. No Supabase, ever.

---

## The relationship this protects

> The practitioner provides the world.
> The system provides the custody architecture.
> The member remains the author of their own meaning.
