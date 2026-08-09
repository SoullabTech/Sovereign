# APER — The Five-to-Three Epistemic Projection

**Date**: 2026-08-09
**Status**: **awaiting founder ruling on vocabulary.** No code change made.
**Governed by**: `docs/specs/AIN_PORTABLE_EPISTEMIC_RECORD_SPEC_2026-08-09.md` §3.5
**Purpose**: the remaining semantic gate before APER moves closer to runtime

> Founder direction, 2026-08-09: *"Don't choose `recorded` merely because I suggested it earlier. First produce the exact 5→3 mapping and the semantic definition of each destination value. Then we can rule on the vocabulary."*
>
> *"This is precisely where a portable ontology can accidentally become a new ontology while claiming merely to project the old one."*

No vocabulary is chosen below. Four options are analyzed; one is recommended; the ruling is the founder's.

---

## 1. The source vocabulary — what AIN governs today

`member_memory_atoms.epistemological_status`, migration `20260624000001_practitioner_observation_provenance.sql`, typed at `lib/maia/memoryAtomsLoader.ts:111-116`.

The migration states its constitutional intent directly, and it is load-bearing for everything below:

> *"approved practitioner observations enter memory as **'witnessed'** — a distinct register that preserves their epistemic standing (**facilitator saw this, not: this is unquestioned truth about the member**)."*

| Value | Schema comment | What it actually establishes |
|---|---|---|
| `observed` | *witnessed directly by a facilitator in session* | A **facilitator's first-person account of what they perceived.** The migration is explicit that this is *not* a fact about the member — it is the practitioner's seeing. |
| `reported` | *shared by the member in their own words* | The member recounted something. Authority: the member's, over their own account. |
| `inferred` | *derived from patterns (system-generated)* | AIN produced it. The parenthetical is unambiguous. |
| `provisional` | *low confidence or flagged for member review* | AIN produced it **and** flagged it as not standing on its own. |
| `claimed` | *asserted by the member as their truth* | The member asserts it as true for them. Stronger stance than `reported`; same source. |
| `NULL` | (member-placed atom) | No practitioner involved. Keeping is itself a member act. |

**Structural observation**: four of the five name a *person's relationship to what they know* (`observed`, `reported`, `claimed` — and `NULL` implicitly). Two name *AIN's production of a claim* (`inferred`, `provisional`). The vocabulary already partitions along source-of-knowing; it simply partitions more finely than transport requires.

---

## 2. The destination vocabulary — semantic definitions

APER's three values, defined by **what establishes the knowing** and **what authority follows**. These definitions are the thing under ruling; the spellings are secondary.

### D1 — `declared`

**Definition**: a person stated this as true for them, or gave their own account of what they perceived.

**Establishing act**: an authoring act by an identified person.
**Authority**: the author's own, over their own experience or their own perception. AIN never adjudicates it — never scores accuracy, never flags inconsistency.
**Required provenance**: `authoredBy` (identity + role), `authoredAt`.
**Excluded**: MAIA. MAIA has no experience to declare from (§3.1). `role: maia` here is a validation error.

**Note the scope**: this covers *"I felt abandoned"* (member) and *"I saw her shoulders drop"* (practitioner) alike. Both are first-person accounts. What differs is **who** — carried by `authoredBy.role`, not by the status.

### D2 — the third status *(currently spelled `observed` — this spelling is what is in dispute)*

**Definition**: a **non-personal registration that something occurred**. A mechanism recorded an event. No person is giving an account; the record is of the occurrence itself.

**Establishing act**: a registration event by a system or instrument.
**Authority**: the fact of the record — *that* it happened, when, and what registered it. **Never the meaning of what happened.**
**Required provenance**: `observedBy` (may be `system`), `occurredAt`, `observationMethod`.

**The boundary against D3**: *"the member opened the app at 09:14"* is a registration. *"the member is in a morning rhythm"* requires a model, and is D3 regardless of evidence quality.
**The boundary against D1**: if a **person is accounting for something**, it is D1. D2 has no narrator.

### D3 — `derived`

**Definition**: AIN produced this by inference, synthesis, aggregation, or summarization.

**Establishing act**: a derivation.
**Authority**: **none over the person**, permanently. No consent setting, no member action, no repetition raises it.
**Required provenance**: non-empty resolvable `derivedFrom`, `derivationMethod`, `derivationConfidence`, `derivedAt`.
**Rule**: a derivation whose inputs cannot be named is not a derivation — it is an assertion, and must not be projected at all.

---

## 3. The mapping, as currently implemented

| AIN value | → | APER | Confidence | Provenance carried | Live producer among Keeps? |
|---|---|---|---|---|---|
| `NULL` | → | `declared` | — | `authoredBy: {member, role: member}`, `authoredAt: kept_at` | **Yes** — every member-placed Keep |
| `reported` | → | `declared` | — | same | Yes — practitioner atoms |
| `claimed` | → | `declared` | — | same | Yes — practitioner atoms |
| `observed` | → | **D2** | — | `observedBy: {facilitator, role: practitioner}`, `occurredAt`, `observationMethod` | Yes — practitioner atoms |
| `inferred` | → | `derived` | `supported` | `derivedFrom: [source]`, method, `derivedAt` | Yes — practitioner atoms |
| `provisional` | → | `derived` | `tentative` | same | Yes — practitioner atoms |

**Declared loss** (already recorded in the loss surface): `reported` vs. `claimed` is not recoverable from the envelope; neither is `inferred` vs. `provisional` beyond the confidence value. Both are recoverable via `ainRef` into the canonical row. This is intentional — a projected record is a pointer with enough epistemic character to be read safely, never a substitute for canon.

---

## 4. Collision analysis

### 4.1 The collision, stated exactly

| | AIN `observed` | APER D2 (as spelled today) |
|---|---|---|
| Who knows | a **facilitator**, personally | a **mechanism**, impersonally |
| What is established | *"I saw this"* | *"this occurred"* |
| Is there a narrator? | **yes** | **no** |
| Authority derives from | the practitioner's perception | the fact of registration |

These are **different concepts sharing a spelling**. They coincide on the only rows that currently exist, which is precisely what makes the collision dangerous: it is invisible in every current test.

### 4.2 The deeper finding — the mapping row itself is questionable

Re-read the migration's intent: *"facilitator saw this, not: this is unquestioned truth about the member."*

That is a statement that a practitioner observation is **the practitioner's account**, deliberately held short of being a fact about the member. Under §2's definitions, an account given by an identified person is **D1 `declared`** — a declaration authored by the practitioner — not D2.

**The current mapping may be wrong independent of the naming question.** `observed` was routed to D2 because the words matched, not because the semantics did. That is the exact failure mode the founder named: *a portable ontology accidentally becoming a new ontology while claiming merely to project the old one.*

**Consequence if that reading holds**: D2 has **zero producers among Keeps**. Its only apparent producer was a name-match artifact.

---

## 5. Options

### Option A — rename D2

Keep the three-status structure; give D2 a distinct spelling. Candidates, with the objection to each:

| Candidate | Objection |
|---|---|
| `recorded` | Broad — a declaration is also "recorded." Names the storage act, not the knowing. |
| `registered` | Narrower and mechanism-flavored; collides with `registers` (the member-placed vantage points on atoms). **Second collision.** |
| `logged` | Reads as telemetry; likely to attract system usage data that should not be memory. |
| `attested` | Implies a witness attesting — pulls *toward* the collision, not away. |
| `occurred` | Names the event, not the kind of knowing. The other two statuses name knowing; this would break the axis. |
| `captured` | Already loaded in this codebase (`capture_notes`, `capture_sessions`). **Third collision.** |
| `evidenced` | Suggests a claim being supported, which is a derivation concept. |

**Assessment**: no candidate is clean. `registers` and `capture` are already taken; `recorded` and `logged` are too broad; `attested`, `occurred`, `evidenced` are on the wrong axis. Renaming solves the collision by introducing a weaker word.

### Option B — keep the collision, document it

**Rejected by founder ruling, 2026-08-09.** Recorded for completeness.

### Option C — rename the AIN column value

Out of scope. It is a live column with a CHECK constraint, production rows, a typed union, and a loader. Changing it to accommodate a transport format inverts the dependency — the envelope would be dictating canonical vocabulary, which §0.1 forbids.

### Option D — dissolve the collision *(recommended)*

Correct the mapping per §4.2:

- **`observed` → `declared`**, with `authoredBy: {ref: <facilitator>, role: 'practitioner'}`.
  The practitioner's account is a declaration by the practitioner. This preserves the migration's stated standing exactly — *facilitator saw this*, authority is the facilitator's own, not truth about the member.
- **D2 then has no producer in v1** and is **deferred** — removed from the v1 vocabulary rather than shipped unexercised.

**What this gains**

1. The collision **stops existing** rather than being renamed around. No weaker word is introduced.
2. The who-distinction moves to `authoredBy.role`, which is the field whose job is *who established this*. It stops being duplicated in the status axis. The two axes separate cleanly — the same reasoning by which `witnessed` was ruled out as a fourth status (§3.6).
3. **The third status gets named when a real producer exists**, with the producer in hand — not speculatively. Occurrence-records (encounters, sessions, calendar events) are plausible future producers, and naming the concept against a concrete case will be far more accurate than naming it now.
4. Fewer moving parts reach runtime unexercised. A status with no producer is untested surface area.

**What this costs — stated plainly**

1. **Two statuses, not three, in v1.** The spec's tidy tripartite structure becomes a v1 pair with a documented third concept held in reserve. Less elegant on paper; more honest about what exists.
2. **An open sub-question this exposes** — and it is a real one:
   `authorityOf()` currently returns `may_assert` for any `declared` record. Under Option D, a **practitioner's declaration about a member** becomes `declared` and would inherit `may_assert`. But *"a practitioner observed X about you"* and *"you said X"* are not equally assertable in a member's environment. The envelope **carries** the distinction (`authoredBy.role`), so a consumer can act on it — but `authorityOf` collapses them today.
   **This must be resolved before any wiring**, whichever option is ruled. It is arguably a defect already present, surfaced by this analysis rather than caused by it.
3. If a future occurrence-record producer appears, the third status must be added — a spec version bump. Acceptable: `aperVersion` exists for exactly this.

---

## 6. Recommendation

**Option D.** The collision is a symptom; the wrong mapping row is the cause. Renaming D2 (Option A) would leave a semantically incorrect mapping in place under a weaker word — treating the symptom and preserving the disease.

The migration's own constitutional intent supports the correction directly: a facilitator observation is held as *the facilitator's seeing*, which is a declaration by a practitioner, not an impersonal registration of occurrence.

**If Option D is ruled**, the required changes are small and confined:
- `projectKeep`: route `observed` → `declared` with `role: 'practitioner'`
- `types.ts`: remove `ObservedRecord` from the v1 union; keep the concept documented as deferred
- tests: the `observed → observed` case becomes `observed → declared/practitioner`; the D2 suite retires
- spec §3.5: mapping table updated; §3.6's axis reasoning cited as precedent

**Not made pending ruling.** No code was changed for this document.

---

## 7. The sub-question requiring separate ruling

Independent of A/B/C/D:

> Does a **practitioner's declaration about a member** carry the same authority in that member's environment as the **member's own declaration**?

Current `authorityOf` says yes (both `may_assert`). The migration's *"not: this is unquestioned truth about the member"* suggests it should not.

This needs a ruling before `projectKeep` acquires any caller. **It is not resolved here**, and no change was made to `authorityOf`.

---

## 8. State of the work

**Unchanged and preserved**: all APER scope refusals (`colab` / `client` / `encounter` remain out of v1 as an unresolved relational-consent boundary, not missing implementation) · `set_aside`/`archived` compression, acceptable only because declared and recoverable via `ainRef` · every §7 invariant · the §9 A7 laundering suite · 33/33 tests passing.

**Not done, per direction**: `projectKeep` remains **unwired** — no caller · scope not broadened · loader not remediated · no vocabulary chosen.
