# Correction 3 — Feature Walk Specification v1

**Authority:** Kelly (Founder-Steward). **Recorded by:** Claude Code.
**Status:** 🟡 **DRAFT — not frozen.** Freeze is a separate act; see the Freeze Record below.
**Level:** **Feature acceptance.** ⛔ Not release acceptance, and not a substitute for the Phase 1
Walk Specification — those are different artifacts at a different level.

---

## Authority record

Ruled 2026-08-02: **founder authority currently holds all four state-authority roles unless
explicitly delegated.** Co-occupancy does **not** collapse the roles.

> ⭐⭐⭐ When one person occupies multiple authority roles, **the artifact must preserve the
> distinction between the acts.** The record does not say *"Kelly approved the feature."* It records
> five separate acts that happen to share one actor.

| # | Act | Authority | State |
|---|---|---|---|
| 1 | Author this specification | Kelly | ⬜ pending |
| 2 | Freeze this specification | Kelly | ⬜ pending |
| 3 | Execute the walk | Kelly, or a **named** delegated executor | ⬜ pending |
| 4 | Review the evidence record | Kelly | ⬜ pending |
| 5 | Make the feature acceptance decision | Kelly | ⬜ pending |

### ⚠️ Independence disclosure (state-authority question 4)

The builder role and the drafting of this document **overlap**, and the overlap is disclosed rather
than hidden:

- Claude Code contributed to the Correction 3 implementation on `feature/capsule-field-declaration`
  — the source resolver extraction, the `getAtomBySource` harvest, and the service-layer tests — and
  also transcribed this specification.
- **Mitigation:** every criterion below is **derived from `docs/specs/CORRECTION_3_FIELD_OBJECT_DECLARATION_2026-08-02.md`
  (#895), authored before that implementation work**, rather than from reading the implementation.
  Where this document adds anything beyond #895, it is marked **[added]** and says why.
- ⛔ **Unmitigated risk that remains:** a specification transcribed by a party close to the build can
  still inherit the build's blind spots — it cannot ask for behaviour nobody thought of. Independent
  review before freeze is the only real control, and **freeze authority rests with Kelly.**

### Pre-registration

⭐⭐⭐ **This specification was written before any walk was executed.** No walk results, screenshots,
or evidence existed when these criteria were fixed. Authorship being clear does not relax
pre-registration — it is what keeps the evidence from being post hoc.

---

## Candidate under walk

| | |
|---|---|
| **Feature** | Correction 3 — capsule → Field Object declaration |
| **Candidate SHA** | ⬜ **to be named before execution** — `7684e3940` or its published successor |
| **PR** | #905 |
| **Governing spec** | #895 · Amendment 5 (`1e15f9c71`) · `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` (`d61872e2a`) |

⛔ **The candidate SHA must be named before the first walk step**, not inferred afterwards from
whatever was checked out.

---

## Fixture protocol

- A **fresh disposable member.** ⛔ `walk.878` is contaminated and **inadmissible**.
- **Baseline recorded before any mutation** — capsule count, atom count, Shelf contents.
- The member must reach every surface through the **real authenticated browser path**.
- Exact cleanup at the end, recorded.

## Evidence admissibility

⭐⭐⭐ **An endpoint call is not admissible evidence for a member path.** This is the W8 lesson: the
route worked while no reachable member gesture existed. A criterion below that says *the member
sees/presses* is satisfied only by the member-facing surface.

| Admissible | Not admissible |
|---|---|
| the rendered surface, reached by navigation | a `curl` or fetch against the route |
| a value read back from the database **after** a member act | a value written by the walker to set up an assertion |
| a control the member can reach and press | a control present in the DOM but unreachable |

⚠️ Persistence probes (18/18 on PostgreSQL 16.13) are a **prerequisite** for this walk and **do not
substitute for any criterion below.**

---

## Criteria

Derived from #895's fourteen-step acceptance test, one criterion per step. ⚠️ Kelly's shorthand for
this series has been *"F1–F10"*; the source defines **fourteen** steps, and this document follows the
source rather than the shorthand.

| # | The member act | What must be observed |
|---|---|---|
| **F1** | Create a real conversation | The conversation exists and is the member's own |
| **F2** | Mark or capture the moment | A capsule is created through the member-facing gesture |
| **F3** | — | **No Shelf item exists yet.** Confirmed on `/maia/workbench`, not by query alone |
| **F4** | Review / save the capsule | The capsule saves; the review surface renders |
| **F5** | — | ⭐⭐⭐ **No atom was automatically minted.** Saving and reviewing are **eligibility, not declaration** |
| **F6** | Press **Keep in my Field** | The control is **reachable and distinct** from *Save for later* and *Bring into the Lab*; it responds |
| **F7** | — | **Exactly one** atom exists, `source_type='capsule'`, `source_id` = the capsule, `generated_by='member-gesture'` |
| **F8** | Double-submit the act | **No duplicate.** The second attempt reads as *already yours*, not as an error or a second creation |
| **F9** | Open `/maia/workbench` | The Shelf renders through the member path |
| **F10** | — | The new Field Object **appears on the Shelf** |
| **F11** | Place the card, then remove the placement | Both verbs are reachable and complete |
| **F12** | — | **Capsule and atom both unchanged** by placement or its removal |
| **F13** | Reopen the capsule | The atom **remains valid**; nothing implies the declaration was retracted |
| **F14** | — | ⛔ **No historical capsule was converted.** The 12 pre-existing eligible capsules remain undeclared |

### [added] F15 — the settled state reads as settled

After F6 succeeds, the surface shows a **non-actionable** *Kept in your Field* status rather than a
second Keep-looking control.

**Why added:** #895 requires the act be explicit and distinct (§2) but does not state what the
surface shows afterwards. A control that still looks pressable after a successful declaration
re-creates the ambiguity §2 exists to remove. ⚠️ Kelly may strike this before freeze; it is the only
criterion not traceable to a numbered step in #895.

---

## Disposition rules

- **Any criterion failing → the walk fails.** ⛔ There is no partial feature acceptance.
- A criterion **not reached** is recorded as **unreached** — ⛔ never as passing and never as pending.
- The evidence record is a **separate artifact** from this specification, and the acceptance decision
  is **separate from both**.
- ⛔ Passing this walk is **feature acceptance only.** It does not assemble a release candidate,
  does not accept Phase 1, and does not authorize deployment.

---

## Freeze Record

⬜ **UNFROZEN.** This specification is not yet an acceptance instrument.

| Act | Actor | Date | Record |
|---|---|---|---|
| Authored | Kelly | 2026-08-02 | this document, v1 |
| **Frozen** | **Kelly** | ⬜ | ⬜ *no criterion may change after this line is signed* |
| Candidate named | ⬜ | ⬜ | ⬜ SHA |
| Executed | ⬜ | ⬜ | ⬜ evidence record |
| Evidence reviewed | Kelly | ⬜ | ⬜ |
| Feature acceptance decision | Kelly | ⬜ | ⬜ accepted / refused |

⭐⭐⭐ **Freezing is the act that makes this an instrument.** Until the freeze line is signed, the
criteria may still be revised — including striking F15. **After it is signed, a criterion may only
change by superseding the specification with v2**, and a walk already executed against v1 remains
evidence for v1.
