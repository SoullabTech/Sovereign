# W5-Z0 — CHAIN-LEVEL EDITORIAL SUBJECT

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-14
**Authorized by** founder act, 2026-09-14
**Base** `303212ae7` (W5-3 schema custody tip, `claude/w5-editorial-ontology-schema`)
**Branch** `claude/w5-z0-chain-editorial-subject`

---

## 1. The ruling this implements

> The Editorial Workspace subject is the **proposal chain**. A `ProposalVersion`
> is an **optional exact focus** within that subject.

and the restriction that makes it safe:

> Chain-only means **zero-version chain** — not *"show me the head"*.

W3 collapsed subject and target because every editorial object then carried a
formulation. W5's ontology falsified that: an Insight belongs to a **chain**, so
*"MAIA noticed this and recommends changing nothing"* has to be expressible. A
room that can only be entered by naming candidate wording cannot hold it.

**The separation this act establishes:**

```
editorialSubject   the identity of the editorial RELATIONSHIP
target             the exact candidate FORMULATION + its projection

no target  ⇒  there is no candidate formulation
no target  ⇏  there is no editorial relationship
```

---

## 2. What changed

| File | Change |
|---|---|
| `app/writers-studio/canvasIdentity.ts` | `requestedChainSubject()` — one reader for all three URL rows; `requestedProposalFocus()` **derived** from it so the two cannot disagree |
| `lib/manuscript/proposalChain/editorialSubject.ts` | **new** · `readChainOnlySubject()` — member → succession → **Work binding** → **zero versions**; ⛔ never reads `focused` |
| `app/api/sovereign/manuscripts/[id]/write-state/route.ts` | resolves `editorialSubject` beside `target`; the focused subject is built from **`r.target`**, never from the request |
| `lib/writersStudio/writeStateClient.ts` | `chain_only` selector kind; `editorialSubject?` on both section modes; `editorialSubjectOf()` |
| `lib/writersStudio/editorialWorkspace.ts` | `WorkspaceSubject`/`workspaceSubject()` → `EditorialWorkspaceSubject` (server-resolved). ⛔ The law file no longer imports `ProposalWorkTarget` at all |
| `app/writers-studio/canvas/page.tsx` | `const subject = editorialSubjectOf(writeState);` — one question, one answer |
| `app/writers-studio/EditorialWorkspace.tsx` | `versionId: string \| null`; omits `?version=`; **refuses** a chain read that comes back focused anyway |

**No migration. No schema change. No `openThread` change. No Insight store, no
Direction store, no bound discourse, no MAIA turn.** The zero-version workspace
does **not** offer the composer — whether a root version may be authored there is
a product ruling nobody has made, and this act does not quietly make it.

---

## 3. The URL contract

```
proposalChain=C + proposalVersion=V   → chain C, exact focus V
proposalChain=C, no proposalVersion   → chain C, no focus  (iff C holds 0 versions)
proposalChain=C, C holds versions     → ⛔ REFUSED, never defaulted to the head
proposalVersion=V, no proposalChain   → ⛔ not expressible by the type
?proposalVersion=  (empty)            → "none named", never a blank focus
```

Every refusal is **silent at the HTTP boundary**. `version_required` exists
internally so the condition is legible; the browser cannot tell it from
`chain_unknown`, `wrong_work`, or a corrupt chain.

For a zero-version subject the mode stays `section_aware`: nothing is suspended,
marked, compared, previewed or authorized, because there is no formulation.

---

## 4. Evidence

`scripts/witness/w5-z0-witness.ts` — **38 passed · 0 failed**
(disposable database only; refuses any database whose name lacks `witness`).

Evidence classes are labelled in the witness itself. BEHAVIOURAL for Z0-1…Z0-6,
Z0-8, Z0-9, Z0-10; SOURCE-LEVEL for Z0-7 and the mount rule, because
`getMemberIdFromRequest` correctly refuses a bare `x-member-id` and ⛔ was not
weakened and no test hook was added to production to make a witness easier.

`scripts/witness/w5-z0-mutations.sh` — **8 killed · 0 survived · 0 crashed · 0 stale**

| Mutant | Dies on |
|---|---|
| `M-Z0-HEAD-DEFAULT` ⭐ *(founder-named, load-bearing)* | Z0-3, Z0-3b, M-Z0-HEAD |
| `M-Z0-WORK-UNBOUND` *(the 01A.1 mutant, carried forward)* | Z0-4, Z0-4b |
| `M-Z0-VERSION-WITHOUT-CHAIN` | Z0-6, Z0-6b, Z0-2f |
| `M-Z0-EMPTY-VERSION-FOCUS` | Z0-2e |
| `M-Z0-SUBJECT-FROM-REQUEST` | Z0-1b, Z0-1c |
| `M-Z0-MODE-FROM-SUBJECT` | Z0-7f, Z0-7g |
| `M-Z0-SUBJECT-FROM-TARGET` *(W3's derivation, reintroduced)* | Z0-M1, Z0-M2 |
| `M-Z0-WORKSPACE-ACCEPTS-HEAD` | Z0-M6 |

**Prior witnesses, re-run unchanged on the same database:**
01A `18/0` · 01A.2 `13/0` · 01B.0 `7/0` · Step 2 integration `20/0` ·
Step 2 authorization schema `27/0` · W2 `12/0` ·
runtime-seam mutations `6 killed · 0 survived · 0 crashed`.

**Repo gates:** `npm run typecheck` → *no regressions* (229 vs baseline 239) ·
`npm run check:no-supabase` → clean ·
scoped jest (`lib/writersStudio` `lib/manuscript` `app/writers-studio` `app/api`)
→ **23 failed · 3006 passed**, against a stashed baseline of **23 failed · 3005
passed** — identical failures, one net new passing obligation.

⚠️ Those 23 include the **4 held pre-existing red obligations** (2 in
`consentSurface.test.ts`, 2 in `proposalWorkMode.test.ts`): obsolete mechanism
pins from the old proposal path, still held, ⛔ not re-aimed, skipped or deleted.

---

## 5. Two instrument findings, reported not smoothed

### 5.1 ⚠️ A 01A source pin went stale and was passing vacuously

`cutover-01a-witness.ts`'s `M-R6` sliced the route from the anchor
`const focus =`. W5-Z0 renamed that binding to `const requested =`, so
`indexOf` returned `-1`, `slice(-1, …)` produced the empty string, and the
regex **could not fail**.

> A source pin whose anchor a rename can delete reports PASS for a file it
> never read.

Repaired in place: the anchors are asserted to **exist** before the slice is
judged (`M-R6a`, new), and a missing anchor substitutes a sentinel that fails.
01A therefore reports **18** rather than 17 — the number moved because an
obligation was **added**, not because one was relaxed. Every source pin written
in the W5-Z0 witness carries the same anti-vacuity guard.

### 5.2 The W3 law-1 obligations were **transferred**, not deleted

`workspaceSubject()` is removed because two sources of editorial subject is
exactly what the ruling forbids. Its obligations moved rather than lapsing:

- **W3-1 / W3-2 / "no subject"** → re-asserted against `editorialSubjectOf`.
- **The mount rule** → re-asserted against the room's single
  `const subject = editorialSubjectOf(writeState);`, and now at **both** render
  sites rather than wherever the first regex match landed.
- **W3-7** — *losing the exact locus does not erase the editorial
  relationship* — moved to the seam that now decides it: witness `Z0-7i` proves
  the route's subject assignment is guarded by `r.ok` and reads **nothing**
  about `located`.

`located` is deliberately **not** carried on the subject. W3 exposed it and the
room never read it; a field on the *mount identity* describing the *mark*
invites the very inference W3-7 forbids.

---

## 6. Standing after this act

```
W5-3 schema                          ✅ CLOSED · 303212ae7 · custody sealed on origin
W5-Z0 chain-level editorial subject  ✅ IMPLEMENTED · 38/0 · 8 killed
canonical schema merge               ⛔ HELD
W5-SCHEMA-LAND                       ⛔ future explicit founder act
W5-4 Insight/Direction stores        ⛔ not authorized
W4 chain-bound discourse/openThread  ⛔ not authorized
01B execution-response recovery      ⛔
W6 decision experience               ⛔
W7 retirement                        ⛔

production                           UNTOUCHED
maia_focus_witness                   FROZEN
```

This branch descends from `303212ae7` and therefore carries migration
`20260914000005` in its ancestry — it inherits the same custody status:
development/test ✅ · disposable-DB migration ✅ · push to origin ✅ ·
**canonical merge ⛔ · ordinary deployment ⛔ · protected migration execution ⛔.**

---

## 7. Open, and named

- **The zero-version workspace has no composer.** Persistence permits a root
  `ProposalVersion` with `supersedes = null`, so *"MAIA: I'd keep this." /
  "Kelly: actually, I'd try this…"* is reachable — but it is a product
  interaction ruling, and W5-Z0 does not grow merely because the substrate
  could support it.
- **Nothing yet creates a zero-version chain.** The object is now
  *representable and mountable*; producing one is W5-4's business.
- **The legacy `proposal=` path is untouched** and acquires no chain identity.
  It is retired at W7, not here.
