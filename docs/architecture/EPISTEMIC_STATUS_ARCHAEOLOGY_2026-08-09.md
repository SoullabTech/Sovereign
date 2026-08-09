# Five-Status Epistemic Architecture — Archaeology and Liveness Map

**Date**: 2026-08-09
**Status**: **read-only archaeology complete · awaiting founder ruling · nothing changed**
**Ordered by**: founder correction — preserve the five-way epistemic architecture, 2026-08-09
**Governed by**: `docs/canon/SOUL_LAB_PRINCIPLE_AND_CAPABILITY_PRESERVATION_2026-08-09.md` · `docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md`

---

## 0. Headline — and a correction to the premise I was given

**The four statuses were not severed. They never had producers.**

The correction to reverse Option D was **right**. The reason given for it — *"where did the other four producers go?"* — is **not supported by the evidence**. No producer was ever written for `reported`, `claimed`, `inferred`, or `provisional`, and no commit ever removed one.

Reporting this the other way would repeat the original error in the opposite direction: fitting evidence to an expected conclusion. Under §2.2 of the Capability Preservation Rule the disposition still lands on **preserve** — but via **BUILD** (designed ahead of producers), not **RECOVER** (lost and to be restored).

The five-value vocabulary is **designed capability with a complete read side and an incomplete write side.** That is a materially better position than "lost," and it changes what the remedy is.

---

## 1. Origin — a single day, a single author

All five values entered in one commit lineage, **2026-06-24**, all by Kelly Nezat:

| Commit | Time | What it did |
|---|---|---|
| `060d30628` | 12:04 | **the writer** — With Me completion writes `practitioner_observation` atoms with `epistemological_status: 'observed'` |
| `9af0f061e` | 12:09 | **the renderer** — separate PRACTITIONER OBSERVATIONS block; `epistemicFraming` handles **all five values** |
| `d7886fd75` / `654aeb3ff` | same day | the governed bridge + migration `20260624000001` (the CHECK constraint defining all five) |
| `6df8b12d9` | same day | attribution guard — `facilitator_id` is canonical |
| `21d172d36`, `20e1b98fe` | same day | Selection rule added and tested |

The renderer commit message names the unused values explicitly — *"'observed by a practitioner in session', 'provisional practitioner impression', etc."* — so **the four were rendered-for from the hour they were defined.** They were designed, not discarded.

---

## 2. Archaeology — what the search covered and found

**Method**: `git log --all -S` pickaxe on each status literal across `*.ts` and `*.sql` over every branch; history of `epistemological_status` and `epistemologicalStatus` across all refs; history of the With Me writer path; full-repo grep across source, migrations, tests, docs, and canon.

**Result**: every hit for the four values traces to the introducing lineage above, plus the migration, plus `b806fa49c` (2026-06-30, the constitutional-verification family — a **verifier**, not a producer).

| Evidence sought | Found |
|---|---|
| A historical producer of `reported` / `claimed` / `inferred` / `provisional` | **none, on any branch, at any time** |
| A commit removing or disconnecting such a producer | **none** |
| A deleted source file containing one | **none** |
| A superseding implementation | **none** |
| Design intent for the four | **yes** — migration comments + renderer commit message |
| A consumer able to handle all five | **yes** — `epistemicFraming`, live since day one |

**No severance event exists here.** This is distinct from the March 2026 amputation (`d7cea280d`), where a real severance is documented; that pattern does not apply to this vocabulary.

---

## 3. This was already found — three days ago

`docs/architecture/PRACTITIONER_OBSERVATION_SUBSTRATE_INVENTORY_2026-08-06.md` (2026-08-06) already recorded it:

- §3: *"the only writer"* — and — *"⚠️ The column **permits** system authorship even though today's only writer is human."*
- §5 Q3: *"Does `epistemological_status='inferred'` survive on member atoms? It is currently unused by the only writer. **Removing it is cheap now and expensive later.**"*
- Closing line: *"⛔ This document rules none of the four."*

**That document anticipated this exact decision, warned against exactly the move I recommended, and refused to rule.** My trace presented C4 as a discovery; it was a rediscovery of a known finding whose accompanying warning I did not carry forward.

Two process findings follow:

1. **The prior record was right and was not consulted.** An audit that re-derives a finding without its prior caveats loses the caveats. This is the Convenience-Representation Hazard operating on *findings*.
2. **That inventory also names the correct disposition for the crossed atom**: *"this is the correct crossing model… the only one of the three with a consent gate, a provenance register, and reversibility."* The substrate under discussion is the healthy one.

---

## 4. Liveness map

Per `MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` §5.1, applied to each status.

| Status | Design intent | Producer | Consumer | Runtime | Production data | Classification |
|---|---|---|---|---|---|---|
| `observed` | facilitator witnessed in session | ✅ With Me completion | ✅ `epistemicFraming` | ✅ FAST + DEEP-repair | likely (unverified here) | **LIVE** |
| `reported` | member's own words in session | ❌ **never written** | ✅ handled | ✅ would render | none expected | **ABSENT (producer) · PRESENT (consumer)** |
| `claimed` | member asserts as their truth | ❌ **never written** | ✅ handled | ✅ would render | none expected | **ABSENT (producer) · PRESENT (consumer)** |
| `inferred` | derived from patterns (system-generated) | ❌ **never written** | ✅ handled | ✅ would render | none expected | **ABSENT (producer) · PRESENT (consumer)** |
| `provisional` | low confidence / flagged for member review | ❌ **never written** | ✅ handled | ✅ would render | none expected | **ABSENT (producer) · PRESENT (consumer)** |

**None is `MISSING`** — the vocabulary, the constraint, the type, and the renderer all exist and are reachable. **None is `SUPERSEDED`** — no equivalent mechanism exists; the §2.2 six-part replacement test is not even a candidate. **None is `RETIRED`** — no ruling ever retired them.

⚠️ **Production-data column is inference, not measurement.** Confirming it requires a production query (`SELECT epistemological_status, count(*) FROM member_memory_atoms GROUP BY 1`). **Not run** — read-only scope, and per the LIVE/in-use correction standard, an unmeasured claim would be exactly the kind of assertion this project has ruled against.

---

## 5. What the four statuses would enable

This is the Soul Lab argument for preservation, stated concretely. Each unproduced value names a real form of knowing that AIN currently cannot record:

| Status | The knowing it holds | What its absence costs |
|---|---|---|
| `reported` | *the member said this in session* — practitioner-transcribed, member-originated | member speech relayed by a practitioner is indistinguishable from practitioner perception |
| `claimed` | *the member asserts this as their truth* — stronger stance than reporting | a member's declared truth cannot be distinguished from a passing mention |
| `inferred` | *derived from patterns* — explicitly system-generated | **MAIA has no way to record an inference as an inference in member memory** |
| `provisional` | *held lightly, flagged for review* | no way to hold a hypothesis tentatively and revisit it |

The last two are the Soul Lab Principle in schema form. `inferred` + `provisional` are precisely *"MAIA may infer, but an inference must remain identifiable as an inference"* and *"hold a hypothesis lightly, revisit it, deepen it, contradict it, or let it go."*

**Removing them would have removed the only existing substrate for tentative, revisable, MAIA-authored knowing.** That is the capability the collapse would have destroyed — and it is why the founder's reversal was correct regardless of the reason given.

The richer combinations the founder named become expressible only with all five preserved **and** the axes separated:

`reported + member-authored + about self` · `reported + practitioner-authored + about member` · `inferred + MAIA-authored + about member` · `provisional + practitioner-authored + about member` · `claimed + member-authored + about another`

---

## 6. The axis error stands, and its correction is unchanged

The trace finding that **authorship was entangled with epistemic status** remains valid and is independent of the archaeology.

`observed` currently does double duty — it names an epistemic standing *and* is the de-facto marker of practitioner authorship, because it is the only value the only writer emits. That is a **coincidence of the write path**, not a property of the vocabulary.

**The correction is to separate the axes, not to delete one.** Preserve all five epistemic values; add explicit authorship (`authoredBy`); add subjecthood (`about[]`); derive assertion authority from `epistemic status × authorship × subjecthood × speaker context`. This restores dimensionality — which is what the founder ruled.

`docs/specs/ASSERTION_AUTHORITY_MODEL_2026-08-09.md` §§1, 3–7 stand under this reading; only its §2 (Option D dissolution) is withdrawn.

---

## 7. Disposition under the ladder

`PRESERVE → RECOVER → RECONNECT → REPAIR → GOVERN → EXTEND → SUPERSEDE → RETIRE` — plus `BUILD`.

- **PRESERVE** — ✅ ruled. The vocabulary, constraint, type, and renderer stay exactly as they are.
- **RECOVER / RECONNECT** — **not applicable.** Nothing was lost or disconnected. Naming this accurately matters: a recovery lane would search for something that does not exist.
- **BUILD** — the actual remedy. Each of the four needs a producer, and each producer is a distinct design question with its own consent and authority implications (§8).
- **RETIRE** — excluded. No §2.2 condition is met.

**No producer should be built without its own authorization.** `inferred` in particular is the one that lets MAIA write its own interpretation into member memory — the highest-stakes producer in the set, and the one whose consent and authority model must be settled *before* it exists, not after.

---

## 8. Founder ruling — 2026-08-09

### 8.1 Ratified

> **Preserve all five epistemic statuses. Do not collapse them. The current absence of producers for four statuses is an implementation gap, not evidence against the ontology.**

> **`epistemic_status` must not carry authorship by implication.** The architecture moves toward
> **epistemic status × authorship × subjecthood × speaker → derived authority**,
> with `authoredBy` and `about[]` restoring the dimensions the current `observed` path accidentally collapsed.

Recorded to canon as the schema-level companion rule (`SOUL_LAB_PRINCIPLE_AND_CAPABILITY_PRESERVATION_2026-08-09.md` §2A.1):

> **No status may be removed merely because no current writer emits it. Removal requires evidence that the capability itself is constitutionally rejected or semantically redundant — not merely unimplemented.**

### 8.2 Disposition of the five questions

Ruled **only from evidence already established**. Anything requiring live production state or new constitutional authority is left open by design, not by omission.

| Q | Disposition |
|---|---|
| **Q1** — BUILD, not RECOVER | ✅ **RATIFIED.** Evidence-established (§2). Absence of producers = implementation never caught up to the vocabulary. Disposition unchanged; lane corrected. |
| **Q2** — run the production count? | ⏸ **OPEN — requires live production state.** Per canon §2A.2, anticipated counts may not influence the ruling, and a verified zero would establish non-use only. §4's production column stays marked inference, not measurement. |
| **Q3** — producer sequencing | ⏸ **OPEN — requires new constitutional authority.** No producer is authorized. The *constraint* is evidence-established and recorded below (§8.3); the *authorization* to build any producer is not granted here. |
| **Q4** — does the 2026-08-06 §5 Q3 close? | ✅ **RULED: PRESERVED.** *"Removing it is cheap now and expensive later"* resolves as preserved. That open question is now closed. |
| **Q5** — must a re-audit cite the prior document? | ⏸ **OPEN — process authority not granted.** Recommended as standing practice on the §3 evidence, but not ruled here. |

### 8.3 Standing constraint on future producers (evidence-established, not an authorization)

`reported` and `claimed` are **member-originated** — a producer records what the member said or asserted. Comparatively low stakes.

`inferred` and `provisional` are **MAIA-authored claims about a member**. A producer for either writes the system's own interpretation into member memory. **The assertion-authority model must be settled before such a producer exists** — not after. This is the highest-stakes producer in the set and the one whose consent and authority model cannot be retrofitted.

**No producer is authorized by this document.** The constraint governs whenever authorization is later sought.

### 8.4 Why preservation stands independent of archaeology

Ratified reasoning, recorded because it is the load-bearing argument and survives any future revision of §2:

`inferred` and `provisional` are the **only existing homes in AIN for tentative, revisable, MAIA-authored knowing**. Deleting them would remove the system's capacity to say, in effect:

> *"This is my interpretation, not your truth, and I may be wrong."*

That is the epistemic humility the Soul Lab Principle requires, expressed in schema. The preservation case would hold even if the archaeology had shown something different.

---

## 9. State

**Changed**: nothing. This document and the canon ruling only.

`member_memory_atoms` schema · the CHECK constraint · `EpistemologicalStatus` · `epistemicFraming` · the With Me writer · `formatAtomsForPrompt` · `projectKeep` (unwired, 0 callers, 33/33 passing) · `authorityOf` — **all untouched.**

**Still ordered, not yet performed**: the Capability Suppression Review (`SOUL_LAB_PRINCIPLE_AND_CAPABILITY_PRESERVATION_2026-08-09.md` §5). It is a separate substantial pass and I have not begun it.
