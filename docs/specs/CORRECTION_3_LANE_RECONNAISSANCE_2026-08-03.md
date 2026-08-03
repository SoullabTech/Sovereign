# Correction 3 — lane reconnaissance

**Status: FINDINGS ONLY — NOT AN AUTHORITY.**
No edits, no PR on the lane, no implementation, no ownership taken.

> ⛔ **This document is not an instrument, not a specification, and not a ruling.** It does
> not govern the Correction 3 walk, does not rule on §1 conformance, and does not assign
> lane ownership. Where it names a divergence, it is **reporting an unresolved question**,
> not answering it.
>
> ⛔ **Do not cite this document as authority for any of the three gates below.** If it ever
> appears to compete with the frozen protocol (`CORRECTION_3_FEATURE_WALK_PROTOCOL.md`) or
> the bounded spec (#895), those govern and this yields.

**The three unresolved gates this report surfaces — all OPEN, none answered here:**

1. **Instrument authority** — which walk artifact governs?
2. **§1 equivalence** — is `keepSource()` consolidation an accepted implementation of the
   spec's `declareFieldObject`, or a divergence from it?
3. **Lane ownership** — who holds the acceptance act on this lane?

⛔ **Do not run F1–F10 until all three are resolved.** *Do not collect evidence before the
thing being measured has a defined referent.*

---

**Run:** 2026-08-03 · **Referent:** canonical trunk `origin/clean-main-no-secrets` @ `78b22c385`
**Scope:** establish what was decided, what remains provisional, what evidence is missing,
and whether the lane is owned by another process.

---

## Disposition

**The lane is ACTIVE and appears owned by another process.** Two open PRs were authored on it
within the last several hours. ⛔ **Do not take ownership.**

**The implementation is merged to canonical. Its frozen feature walk has never run.**

---

## 1. What was already decided (canonical)

| Artifact | State |
|---|---|
| Amendment 5 — Field Object Declaration (#894) | canonical `1e15f9c71` |
| `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` (#886) | canonical `d61872e2a` |
| `CORRECTION_3_FIELD_OBJECT_DECLARATION_2026-08-02.md` (#895) | **MERGED** — the bounded spec |
| `CORRECTION_3_FEATURE_WALK_PROTOCOL.md` | canonical, **FROZEN**, steps **F1–F10** |
| #905 — implementation | **MERGED** 2026-08-02 22:23:30Z |
| #892 — corrections 1 + 2 | MERGED |

#905 changed nine files: `app/api/psyche/field/declare/route.ts` ·
`components/capsules/CaptureSpiritPanel.tsx` ·
`database/migrations/20260802000002_capsule_field_declaration.sql` ·
`lib/psyche/portfolio.ts` · `lib/psyche/sources/capsule.ts` · `lib/psyche/types.ts` ·
tests · `scripts/repro/c3probe.ts` · the walk protocol.

## 2. Spec §1–§5 vs. what is on canonical

| § | Requirement | State |
|---|---|---|
| §1 | One common declaration service, conceptually `declareFieldObject({…})`; ⛔ no atom-minting in the capsule component or route | ⚠️ **Satisfied by a different design.** `declareFieldObject` **does not exist**. The route imports and calls the pre-existing governed writer `keepSource()` (`lib/psyche/portfolio.ts:373`), with `resolveCapsuleDeclarationSource()` (`lib/psyche/sources/capsule.ts:63`) resolving the source. Minting is **not** in the route or component. |
| §2 | An explicit **Keep in my Field** action, distinct from *Mark this moment* / *Save for later* | ✅ present in `components/capsules/CaptureSpiritPanel.tsx` |
| §3 | `draft:false` = eligibility to *offer*; the button press is the declaration; declaration must not mutate `draft` | ✅ per #912's measurement — the declaration path never touches `draft` |
| §4 | Idempotent at the database; `201 created` / `200 existing` / same atom id | ✅ apparently. The migration records that **no new index was needed** — `idx_memory_atoms_unique_source` already existed in production. *"The gap was never the constraint. It was that `keepSource()` did a bare INSERT."* `wasCreated` now derives from `(xmax = 0)` in the same statement. |
| §5 | The Shelf is unchanged; reads canonical Field Objects only | ⬜ **not verified in this pass** |

**§1 is the live provisional decision.** The spec's literal instruction was a *new* shared
function; the implementation instead **consolidated onto the already-governed `keepSource()`
capability**. That plausibly serves the spec's intent better — one governed writer rather
than a second one — but *the spec text and the implementation do not match*, and no artifact
records the substitution as a ruling. This is exactly the "canonical discriminator
alignment" obligation still open on the lane. ⛔ Not mine to rule.

## 3. What evidence is missing

**All of it.** The frozen protocol's own disposition is *"Feature walk passed — implementation
ready to publish as a PR."*

⚠️ **#905 merged without that walk.** The gate was walk-then-publish; publication happened
first. This is the same shape as #875 merging without its corrections and without its walk.

The frozen F1–F10 protocol requires:

- a **named commit** recorded in the evidence;
- a **fresh disposable member**, baseline captured **before any mutation** (⛔ `walk.878` is
  contaminated and inadmissible);
- **real pointer interaction** for F4, F5, F7 — ⛔ a programmatic `.focus()`, a direct
  `fetch()` to the declaration route, or a SQL insert is *not* evidence a member can perform
  the act (the W8 lesson);
- database reads are admissible only for F2, F3, F6, F9, F10 — assertions about state, not
  reachability;
- a closing obligation to **restore the fixture** to baseline.

Per the lane record, **F1 has not been started**, and #919 is explicitly *not* Correction 3
evidence.

## 4. ⚠️ Two walk instruments exist for one correction

| Instrument | Location | Status |
|---|---|---|
| `CORRECTION_3_FEATURE_WALK_PROTOCOL.md` | `docs/specs/` — **canonical** | **FROZEN**, F1–F10 |
| `CORRECTION_3_FEATURE_WALK_SPECIFICATION_v1.md` | `docs/product/walks/` — **PR #909, open** | DRAFT, **unfrozen**, +150 |

This is the container-identity problem the Phase 1 sequence just ruled on, appearing again
one lane over: **two instruments for one question, and no record of which governs.** A walk
run against the wrong one produces evidence that answers nothing. ⛔ Founder question, not
mine.

## 5. Collision check — the lane is owned

| PR | Branch | Content |
|---|---|---|
| #909 | `chore/correction3-feature-walk-spec` | the second walk instrument (draft) |
| #912 | `chore/capsule-walk-interpretation` | F4 interpretation record — *declaration must **not** flip `draft`*; a "fix" that made it flip would break F4 while appearing to resolve a bug |

Both authored 2026-08-02 within ~30 minutes of each other. **Another process is actively
working this lane.** Understanding the state is not ownership of it.

## 6. Incidental findings

- **The 14-item conflation is now supported.** The earlier open inference — that `W1→W16`
  conflated Correction 3 criteria with Phase 1 walk numbering — has a concrete source: the
  #895 acceptance test is a **14-step numbered list**. The frozen protocol explicitly warns
  against exactly this: *"Numbered F1–F10 deliberately — not W-numbers … reusing them would
  invite the two instruments to be confused."*
- **Stale cross-reference:** the canonical frozen protocol still cites #895 as `OPEN`. It is
  merged.
- **#912 names one thing worth watching:** #905 added ~108 lines to a panel where *Save for
  later* and *Keep in my Field* share one surface. F4 exists to keep those visibly distinct.

## 7. Is there a legitimate implementation action?

**No — not without a founder act first.** Three things are unresolved *above* the code:

1. Which walk instrument governs (canonical frozen F1–F10, or #909's draft v1).
2. Whether §1's substitution — `keepSource()` consolidation in place of a new
   `declareFieldObject` — is accepted as satisfying the spec, or is a deviation to correct.
3. Whether this session may act in a lane another process currently owns.

The evidence-gathering act itself (running F1–F10) is available in principle — the
instrument is frozen and canonical — but it requires a named commit, a fresh
baseline-recorded fixture, and real pointer interaction, and it should not be run against an
implementation whose §1 conformance is unresolved.
