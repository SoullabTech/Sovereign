# Now What? Rehabilitation — Handoff Record, Unit A

**Status: RECORD — 2026-08-09.** ⛔ Authorizes nothing. States what Unit A did, what it deliberately
did not, and what the next session inherits.

**Branch:** `chore/rehabilitation-corpus-provenance` · **Base:** `origin/clean-main-no-secrets @ 46cdd47dd`
**Commits:** `c42cfe4a3` (corpus) · `f79c0e92d` (auth helper) · `7f004727f` (Layer 0) · this record
**Governing:** [`AIN_SYSTEM_REHABILITATION_DIRECTIVE_2026-08-09.md`](../governance/AIN_SYSTEM_REHABILITATION_DIRECTIVE_2026-08-09.md)

---

## 1. ⭐⭐⭐ What Unit A actually found

The session was authorized to complete **A — constitutional propagation**. Before reaching it, the
discovery phase found something that outranked it:

> ⛔⛔ **The entire 2026-08-09 rehabilitation phase was uncommitted.** The governing directive, five
> founder rulings, ratified canon, every audit and completion record, this rehabilitation map, and
> the caller-identity security helper existed **only as untracked working-tree files** on
> `feature/labtools-redesign` — a branch diverged from trunk. A single `git clean -fd` would have
> destroyed the constitutional basis of the rehabilitation.

⭐ This is the §17 question answered against the rehabilitation itself: *what allowed this to happen
without anything failing?* Nothing failed. Nothing was designed to notice.

---

## 2. What was preserved (founder-authorized scope)

| Commit | Contents | Deliberately excluded |
|---|---|---|
| `c42cfe4a3` | **194 documentation files**, zero code — directive, 5 founder rulings, ratified canon, audits, completion records, Now What? maps and decision instruments | all code |
| `f79c0e92d` | `lib/auth/selfScopedIdentity.ts` + its test (**23/23 pass** against this base) | ⛔ its **23 route call-sites** |

⭐ Scope was chosen by the founder specifically so that *"saving everything"* would not
**accidentally bless every untracked implementation file as coherent architecture.**

---

## 3. Layer 0 — reconciled, and closed

Six rows checked against their own cited evidence. **4 stale · 1 mis-dispositioned · 1 real repair.**
Detail in `7f004727f` and the map's Layer 0 status block.

> ⭐⭐⭐ **The finding worth carrying:** Dual Authority sat at **RECONCILE** — a disposition asserting
> *this lane can close it*. It cannot: it resolves into **7 open constitutional questions carried to
> the founder**. ⛔ A coordination surface that dispositions a founder decision as reconciliation
> work will, given enough sessions, produce an implementation that answered it **by building**.
> Corrected to **HOLD**.

⛔⛔ **Layer 0 complete ≠ the system conforms.** `relationship_spaces` holds **0 rows** · **zero**
routes consult it · **11 routes unresolved** under the standing hold · Ruling 2 held.

---

## 4. ⛔ What the next session inherits — still at risk

⚠️ These remain **uncommitted in the main working tree** and were excluded by design, not oversight:

| At risk | Why it matters |
|---|---|
| ⛔ **23 route call-sites** of `requireSelfScopedMember` (`app/api/caseload/**`, `app/api/premium-storage/**`) | ⛔⛔ **The helper alone repairs nothing — it has zero call sites on this branch.** Production remains as `API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md` describes |
| ⛔ `CLAUDE.md` record corrections | The Daily Anchor *"NOT IN USE"* correction and the Bridge D severance note — both **founder rulings** — live only in the working tree |
| ⛔ `lib/relationship/`, `lib/studio/containment/`, `lib/ain/portable/`, `lib/maia/correctionRepair.ts`, untracked test suites | Memory / corrigibility / portable-record work needing reconciliation against the map before it is blessed |
| ⛔ `PROJECT_ORIENTATION.md` | The orientation gate `CLAUDE.md` instructs every session to read **first** — untracked |

---

## 5. Next bounded unit

⭐ **B — governance containment deploy.** Branch `origin/feature/governance-containment` (3 commits:
`60eaa4aaa` · `4e0efaf53` · `11d2e147d`) carries migration
`…_practice_field_governance_containment.sql` + 474 lines of mutation tests. ⛔ **Not yet reconciled
against trunk `46cdd47dd`.** Master-prompt §4 pre-deploy checks apply in full; ⛔ the contained
legacy field must **never** be released or used for testing.

⛔ **Do not start C (relationship ceremony) or later.** §8.4 gates all My Coaching work, and the
7 §E questions gate the Dual Authority remedy. ⛔ Neither is CC's to answer.

**Recommended before anything else:** push this branch — the corpus is durable against `git clean`,
⛔ not against disk loss.
