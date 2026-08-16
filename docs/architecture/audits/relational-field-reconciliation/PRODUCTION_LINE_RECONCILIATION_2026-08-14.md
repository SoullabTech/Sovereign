# Production-line reconciliation — candidate record

**Date:** 2026-08-14. **Reconciliation only.** ⛔ Not admitted to trunk.
⛔ Not deployed. ⛔ No build authority.

```
CANDIDATE ............. ee8226343   (branch chore/rf-reconcile-production-line)
TRUNK ................. ae57a7238   unchanged
PRODUCTION ............ b8eb2c626   unchanged
COMMON BASE ........... 22200f967
```

⚠️ **Admission HELD.** Required gates include the production build; disk is
**17 GiB**, below the standing **20 GiB** threshold. Targeted verification is
complete; canonical admission is not.

---

## The bounded question

> Does the production line, taken as a whole, leave the raw-member-ID containment
> coherent, mechanically guarded, and ready for the separately authorized next
> unit without carrying stale assumptions from `1429b3354`?

**Answer: coherent within its declared scope — but NOT globally coherent, and NOT
mechanically guarded.** Two gaps, detailed below. ⛔ Neither was fixed here;
fixing them is the separately authorized next unit.

---

## Lineage reconciled

| commit | role |
|---|---|
| `b14d96ed8` | CC-A per-turn memory provenance telemetry (observational) |
| `1429b3354` | ⚠️ **HISTORICAL INTERMEDIATE — not certified standalone** |
| `0577bf6e0` | raw-ID containment + guard + two-sided tests |
| `b8eb2c626` | `memberIdPrefix` → `memberRef` rename; **the governed object** |

⛔ `1429b3354`'s own record states *"INCOMPLETE — paused mid-unit by a lane
switch. Do not deploy."* It enters trunk lineage only as ancestry of the final
effective state, ⛔ never as an admissible state in its own right.

### Its declared NOT-DONE list, verified closed by `0577bf6e0`

| declared missing | closed by | verified at `b8eb2c626` |
|---|---|---|
| mechanical recurrence guard | `scripts/guards/member-id-log-gate.ts` | ✅ present |
| two-sided test suite (neg + pos controls) | `lib/privacy/__tests__/memberRef.test.ts` | ✅ present |
| typecheck gate | 231 vs baseline 239, baseline not re-recorded | ✅ |
| deploy referent construction | satisfied operationally — the line is deployed | ✅ |
| post-deploy bounded witness | ⛔ **no record found** | ⚠️ OPEN |

⭐ `0577bf6e0` also discloses two guard defects **caught by its own negative
control rather than by review** — a `git ls-files 'lib/memory/**/*.ts'` glob that
silently excluded top-level files (54 of 77 scanned, reporting green while
blind), and a fixed-line window replaced by paren-balanced extraction. That is
the evidence discipline working as intended.

---

## ⚠️ Gap 1 — containment is not globally coherent

Six raw identifier-prefix log sites survive at the production referent, **outside
the guard's scan scope**:

```
app/api/now-what/home/route.ts:264             memberId.slice(0, 8)
app/api/now-what/program-position/route.ts     memberId.slice(0, 8)   ×3
lib/maia/memoryTransitionRecord.ts:214         inputs.memberId.slice(0, 8) + '...'
lib/maia/roomComposition.ts:200                memberId.slice(0, 8)
```

⛔ These violate the production line's **own** stated standard, from `0577bf6e0`:

> *"Truncation counts as a violation: a truncated UUID is a fragment of the
> identifier, not a derivation of it."*

The guard covers `lib/memory/**` and the sovereign routes; it does not cover
`app/api/now-what/**` or `lib/maia/**`. ⛔ Not fixed here — expanding the scan
scope is the next unit's work, not reconciliation's.

## ⚠️ Gap 2 — the guard is not mechanically wired

`scripts/guards/member-id-log-gate.ts` exists but is **not** referenced in
`package.json` scripts, `.husky/`, or CI. It is a script someone must remember to
run — ⛔ precisely the class of control this programme has repeatedly found does
not hold. **A guard that does not fire is documentation.**

## ⚠️ Still open — member content, distinct from identifiers

`lib/memory/RelationshipMemoryService.ts:509` still logs the member's insight
text verbatim:

```
console.log(`💡 [BREAKTHROUGH] Saved for ${memberRef(userId)}: "${insight}"`)
```

The **identifier** is now contained; the **content** is not. `1429b3354` flagged
this as separately discovered and outside its authorized scope. ⛔ Deliberately
not fixed here — it needs its own ruling.

---

## Both parents' semantics verified intact

**Production side — byte-identical to `b8eb2c626`:** `lib/privacy/memberRef.ts` ·
`scripts/guards/member-id-log-gate.ts` · `lib/memory/provenance/turnMemoryProvenance.ts` ·
`scripts/witness/cc-a-memory-provenance-witness.ts` · `lib/privacy/__tests__/memberRef.test.ts`.

**Trunk side (`17bf9d4f3`) intact:** derived relationship-phase label absent from
prompt composition (0 occurrences) · authenticated subject binding present in the
essence route (3 session refs) · provenance-boundary ruling comment present.

**Shared file — the only file differing from both parents:**
`lib/memory/RelationshipMemoryService.ts`. Verified to be exactly the union:
against the production parent it shows *only* the trunk edits; against the trunk
parent *only* the production edits. ⛔ **No hand-resolution was performed** —
`git merge-tree` reported a clean merge (exit 0, zero conflict markers) and the
merge produced zero unresolved conflicts.

## Gates run (targeted)

| gate | result |
|---|---|
| privacy · relational · sanctuary · nav · sovereign · provenance suites | **175/175 pass**, 11 suites |
| typecheck no-regression | **231 vs 239 baseline — no regressions** |
| no-supabase | clean |
| design-canon | clean (no member-facing surfaces) |
| production build | ⛔ **HELD — 17 GiB < 20 GiB** |

⚠️ **A dependency-binding error recurred and was caught here** — for the third
time this programme. The worktree's `node_modules` symlink pointed at the *main
checkout* (a different branch's manifest), producing 4 phantom `@codemirror`
diagnostics. The lockfile-equivalence check passed while comparing the wrong
thing: it compared *tree* lockfiles without binding the *symlink target*.
⭐ **Rule: bind the actual dependency source, not a lockfile that resembles it.**

---

## Standing

```
CANDIDATE ............................ ee8226343 (branch, pushed, NOT on trunk)
CC-A ................................. included, byte-identical to production
PRIVACY CONTAINMENT .................. included, final effective state
WIP 1429b3354 ........................ ancestry only, not standalone authority
TRUNK 17bf9d4f3 SEMANTICS ............ preserved

CONTAINMENT GLOBALLY COHERENT ........ ⛔ NO — 6 sites outside guard scope
GUARD MECHANICALLY WIRED ............. ⛔ NO — not in package.json/husky/CI
BREAKTHROUGH CONTENT LOGGING ......... ⛔ OPEN — needs its own ruling
POST-DEPLOY WITNESS FOR PRIVACY UNIT . ⛔ no record found

FULL BUILD ........................... HOLD (<20 GiB)
CANONICAL ADMISSION .................. HOLD (full gates incomplete)
DEPLOYMENT ........................... HOLD
RELATIONAL FIELD BUILD ............... CLOSED
```
