# Assertion Authority — Proposed Model

**Date**: 2026-08-09
**Status**: ⛔ **§2 SUSPENDED — FOUNDER CORRECTION, 2026-08-09 (same day).** Option D is **withdrawn**. The five-way epistemic model is **preserved**. §§1, 3–7 (axis separation, permission shape, truth table, missing fields) **stand and remain under review**; only the dissolution of the epistemic vocabulary is reversed.
**No code, spec, projection, loader, migration, or wiring was changed at any point.**
**Evidence base**: `docs/architecture/ASSERTION_AUTHORITY_TRACE_2026-08-09.md`
**Supersedes this document's §2**: `docs/architecture/EPISTEMIC_STATUS_ARCHAEOLOGY_2026-08-09.md`

> **Founder correction, verbatim in substance**: *"The finding that the currently traced With-Me writer hardcodes `observed`, with no currently identified writers for `reported`, `claimed`, `inferred`, and `provisional`, is not evidence that those epistemic categories should be removed or collapsed."*
>
> The C4 finding establishes a **production/reachability deficit**, not semantic invalidity. Per `docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` §2.1, **absent ≠ disconnected ≠ unreachable ≠ behaviorally unused** — and I collapsed those four into one when I recommended Option D. That is the exact error the completeness ruling exists to prevent, committed against the ruling written hours earlier.
>
> **The correction is to restore dimensionality, not eliminate a dimension.** Authorship was improperly entangled with epistemic status; the fix is to separate the axes, not to delete the epistemic axis. The richer target:
> `reported + member-authored + about self` · `reported + practitioner-authored + about member` · `inferred + MAIA-authored + about member` · `provisional + practitioner-authored + about member` · `claimed + member-authored + about another`
> — which carries far more epistemic information than collapsing everything to `declared`.

---

## 0. Rulings this design implements

| # | Ruling | Where honored |
|---|---|---|
| 1 | June-24 attribution contract is **operative, pending canonical consolidation** | §1, and every `mustPreserveAttribution` row |
| 2 | **Option D accepted** — `observed` was an authorship surrogate; no replacement third status | §2 |
| 3 | No runtime behavior change | nothing implemented |
| 4 | `AuthorityVerdict` **rejected as wrong shape** — independent permissions | §3 |
| 5 | Authority **derived, never persisted** | §3.3 |
| 6 | `authoredBy.role` insufficient; `about[]` **load-bearing** | §4, §6 |
| 7 | Both invariants preserved and tested | §5 |
| 8 | Six cases × six permissions | §4 |
| 9 | Verdict not stored | §3.3 |
| 10 | Stop at type shape, truth table, missing fields | §7 |

---

## 1. The four independent axes

The architecture got into trouble each time one of these was used as shorthand for another.

| Axis | Question | Carried by |
|---|---|---|
| **Epistemic kind** | What kind of record is this? | `epistemicStatus` |
| **Authorship** | Who established it? | `authoredBy` {ref, role} |
| **Subjecthood** | Who or what does the proposition concern? | `about[]` — **unpopulated** |
| **Speaker** | Who is presently voicing it? | **not represented** — evaluation context, not a field |

**Assertion authority is the derived fifth thing**, computed from all four. It is not an axis; it is a function of them.

**Operative rule (founder, 2026-06-24, accepted pending canonical consolidation):**

> **Attribution must survive whenever a statement about the member originates from someone other than the member.**

---

## 2. Consequence of Option D on the record model

`observed` ceases to function as a disguised authorship marker. Practitioner-originated records become **declared accounts with explicit authorship**:

```
epistemicStatus: 'declared'
authoredBy:      { ref: ain://practitioners/<id>, role: 'practitioner' }
```

The third epistemic status is **removed from v1** and **not replaced**. It is reintroduced only when a genuine impersonal-registration producer exists (§7.4).

**The distinction is not lost — it moves to the axis that owns it.** What was `epistemicStatus: observed` is now `authoredBy.role: practitioner`, which is where "who established this" belongs.

---

## 3. Proposed type shape

### 3.1 The permission record

Independent permissions, not a graded verdict. Names are provisional.

```ts
interface AssertionAuthority {
  /** May state the proposition itself as fact. */
  mayAssertObject: boolean;

  /** May state that an identified author established the proposition. */
  mayAssertAttribution: boolean;

  /** May surface as evidence for the member to weigh, without claiming it. */
  mayReturnAsContext: boolean;

  /** May be used as a premise for further derivation. */
  mayInferFrom: boolean;

  /** DUTY, not permission — attribution may not be dropped when surfaced. */
  mustPreserveAttribution: boolean;

  /** How MAIA may stand toward the content when voicing it. */
  speakerStance: SpeakerStance;
}

type SpeakerStance =
  | 'may_state'            // no stance constraint
  | 'must_attribute_other' // must name a source other than MAIA
  | 'must_hold_tentative'  // must be offered, not settled — closes F3
  | 'must_not_surface';    // consent gate closed
```

**Note on `mustPreserveAttribution`**: this is a **duty with inverted polarity** sitting among permissions. Mixing the two in one record is a smell. It is retained because dropping it would lose the operative rule's force, and split into a separate structure only if review prefers. Flagged, not hidden.

**Note on `speakerStance`**: this is the **one place an ordinal-ish enum is defensible** — rendering stance is genuinely graded, unlike authority itself. It is offered for ruling, not assumed. If rejected, it decomposes into two booleans (`maySpeakInOwnVoice`, `mustMarkTentative`) at the cost of expressing their interaction.

### 3.2 Fail-closed result

The function must be able to say **"I cannot determine this"** and must never fall back to a permissive default.

```ts
type AuthorityResult =
  | { determined: true;  authority: AssertionAuthority }
  | { determined: false; reason: IndeterminacyReason };

type IndeterminacyReason =
  | 'indeterminate_subject'   // about[] unpopulated — cannot separate case 1 from case 2
  | 'unknown_author_role'
  | 'unknown_speaker'
  | 'unrepresentable_case';
```

**Indeterminate is not a failure mode to be engineered away.** Given §6, `indeterminate_subject` will be the *common* result for Keeps until subjecthood is representable. A consumer receiving it must degrade to the most restrictive treatment, never to a default.

### 3.3 Signature — derived, never stored

```ts
function assertionAuthority(
  record: PortableEpistemicRecord,
  context: SpeakerContext,
): AuthorityResult;

interface SpeakerContext {
  /** Who is voicing it right now. */
  speaker: AinRef | 'maia';
}
```

Two structural commitments:

1. **`AssertionAuthority` is never a field on any record**, never persisted, never projected. A stored verdict would drift from the authorship, subjecthood, and provenance it summarizes — a new laundering surface, and a textbook Convenience-Representation Hazard instance.
2. **`speakerIsAuthor` is context, not a record field.** It is `context.speaker === record.authoredBy.ref`. The same record has different authority depending on who is voicing it. Putting it on the record would freeze a relation that must stay live.

---

## 4. The truth table

Consent gates evaluate **first**; every row below assumes consent permits surfacing. If not: all false, `speakerStance: 'must_not_surface'`.

| # | Case | Assert object | Assert attribution | Context | Infer from | Preserve attribution | Speaker stance |
|---|---|---|---|---|---|---|---|
| 1 | **Member → self** | **yes** | yes | yes | yes | no | `must_attribute_other` |
| 2 | **Member → another person** | **no** | yes | yes | **restricted** ⚠ | **yes** | `must_attribute_other` |
| 3 | **Practitioner → member** | **no** ← operative rule | **yes** | yes | yes (hypothesis) | **yes** | `must_attribute_other` |
| 4 | **Practitioner → self** | n/a | n/a | n/a | n/a | n/a | *unrepresentable* |
| 5 | **MAIA → member** (derived) | **no** | **no** ← F3 | yes | yes | yes | `must_hold_tentative` |
| 6 | **Impersonal event record** | yes (that it occurred) | n/a — no author | yes | yes | method only | `may_state` |

### 4.1 Row notes

**Row 1** — `mayAssertObject: true` is the member's own account reflected back, per the live rule *"each atom stands as the member declared it."* `speakerStance: must_attribute_other` still holds: MAIA may not present a member's declaration as MAIA's own observation. That would be appropriation, a distinct failure from laundering.
*Not modeled*: tense and scope. The record supports *"you said you were afraid"*, not *"you are afraid."* That is a rendering constraint, not an authority one — named so it is not assumed covered.

**Row 2** — the case that cannot currently be reached (§6). ⚠ **`mayInferFrom` is the one dimension a boolean cannot hold here**: inference *about the member's relationship to that person* may be legitimate; inference *about the third party*, who never consented, is not. A single boolean collapses them. **Open question §7.2.**

**Row 3** — the operative rule, verbatim in production prose since 2026-06-24. `mayInferFrom: yes` follows the existing prose (*"hypothesis-generating rather than confirmed fact"*), not an inference of mine.

**Row 4** — `subject` would be the practitioner, so the record does not belong to the member's ownership axis at all. Already refused upstream (`lib/relationship/scope.ts:352` — *"A practitioner declaring their own private practice reflection is REFUSED"*). In a practitioner's own environment it is structurally row 1. **No new representation needed.**

**Row 5** — the F3 amendment, and the only row where `mayAssertAttribution` is **false**. With both object- and attribution-assertion denied, the sole route to the member is `mayReturnAsContext` under `must_hold_tentative`: *"Is it worth looking at whether…?"* — never *"I noticed you tend to…"*. This matches the existing prose requirement that surfacing be *"descriptive and invitational"* and *"never a verdict."*

**Row 6** — no producer exists (trace §3 C4). Included to show the model does not require the removed third status in order to remain complete: if a real producer appears, this row is already specified.

### 4.2 What the table demonstrates

**No two rows share a permission vector.** Six distinct cases, six distinct outcomes — which is the proof that the single ordinal verdict was underdetermined. The old `authorityOf` collapsed rows 1, 2, and 3 into `may_assert`.

**Every column varies across rows.** No dimension is degenerate; each earns its place.

---

## 5. Invariants for test

**I-A1 (original, ratified)**
> The system may assert that an identified author made a declaration without thereby gaining authority to assert the declaration's object as fact.

Test: for every row, `mayAssertAttribution` does not imply `mayAssertObject`. Rows 2 and 3 are the witnesses.

**I-A2 (F3 amendment, ratified)**
> The system may not assert its own attribution as a means of asserting the object of its own interpretation.

Test: `context.speaker === record.authoredBy.ref` ⟹ `mayAssertAttribution === false`. Row 5 is the witness. **Attribution creates epistemic distance only when the attribution refers to a genuinely separate witness.**

**I-A3 (fail-closed, proposed)**
> Indeterminate authority never resolves to a permissive default.

Test: `determined: false` grants nothing; consumers must degrade to the most restrictive treatment.

**I-A4 (never stored, proposed)**
> No `AssertionAuthority` value is persisted or projected.

Test: no envelope field, no column, no APER key.

---

## 6. Fields genuinely missing

### 6.1 `about[]` — a schema gap, not a projection gap

`about[]` exists on the envelope and is **always empty** for Keeps, because `member_memory_atoms` has **no subject-link column at all**. This is not APER declining to populate a field — the source data does not exist.

**Consequence, stated plainly**: rows 1 and 2 are indistinguishable today. Every Keep authored by a member returns `indeterminate_subject` unless the system assumes self-reference — and that assumption is exactly what makes *"your brother is manipulative"* assertable.

**And it cannot be derived.** Under AIN discipline the system may not infer who a Keep is about by reading it — that is precisely the interpretive displacement the atoms schema forbids (*"The system NEVER auto-assigns…"*). **Populating `about[]` requires a member gesture**: the member says who or what this concerns.

So the honest sequence is: schema column → member gesture → UI surface → then rows 1 and 2 separate. Until then, **fail-closed is the correct behavior, not a temporary workaround.**

### 6.2 `speakerIsAuthor` — context, not a field

Correctly absent from the envelope. It belongs in `SpeakerContext` and is computed at evaluation time. **Recommendation: do not add it to any record.**

### 6.3 Not missing

`provenance`/`sourceType` and `scope` were tested and dropped (trace §7): the first adds nothing once role and status are known; the second is already a refusal gate upstream, not a permission input.

---

## 7. Open questions for ruling

- **Q1 — `speakerStance` as an enum.** Defensible for rendering stance, or should it decompose into booleans? (§3.1)
- **Q2 — Row 2 `mayInferFrom`.** Does this dimension need a subject scope rather than a boolean — *may infer about the member, may not infer about the third party*? (§4.1)
- **Q3 — `mustPreserveAttribution` as a duty among permissions.** Keep in one record, or split duties from permissions? (§3.1)
- **Q4 — Row 6 without a producer.** Keep the row specified but unreachable, or omit until a producer exists — mirroring the Option D discipline of not building ahead of evidence?
- **Q5 — `about[]` sequencing.** Does authority work proceed with fail-closed indeterminacy for the common case, or wait on the schema + member gesture?
- **Q6 — Row 1 `mayAssertObject`.** Is *"you were afraid of X"* genuinely assertable from a member's own kept declaration, or does the tense/verdict constraint noted in §4.1 belong inside authority rather than beside it?

---

## 8. State

**Changed**: nothing. This document only.

`projectKeep` — unwired, 0 callers, 33/33 passing, unmodified. `authorityOf` — unmodified, still contradicts the operative rule (trace C3); it is superseded by this design if ruled, and should then be deleted rather than fixed. APER projection, loader, migrations, prose blocks, `with-me` writer — all untouched.

**The correction this makes possible**: MAIA keeps working with rich practitioner observations and its own derived interpretations. What changes is that it becomes precise about whose knowing each one is, and what it is entitled to say with it. **Capability is preserved; only unearned authority is removed.**
