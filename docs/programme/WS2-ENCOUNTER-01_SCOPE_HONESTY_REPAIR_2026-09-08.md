# WS2-ENCOUNTER-01 — Scope honesty · REPAIR LANDED, NOT WITNESSED

**Lane**: WS2-ENCOUNTER-01 · **Branch**: `claude/studio-bring-work-back-icvfaa`
**Authorizing act**: founder ruling 2026-09-08 — *scope-honesty repair only*, after the second
live witness (`d5dafca3`) falsified F-2.
**Standing**: ⛔ **IMPLEMENTED · GATED · NOT WITNESSED.** No G8 rerun. No PR. No deploy.

---

## 1 · The law

> **Encounter scope is server-owned provenance. Every MAIA observation must carry the exact
> perceptual scope from which it arose. A window-local cognition may never emerge wearing
> whole-Work authority.**
>
> A cognition may not assert more than the evidence field it was actually permitted to perceive.

**The defect was not the wording.** Two notices claimed non-return across a 386,031-code-point
Work from a call shown 12,000 — but the failure the repair addresses is that the *record could
not tell*. `CandidateNotice` and `MaiaNotice` carried family, text and anchors; the window that
produced the assertion disappeared at promotion.

> Window was transport on the way in and vanished as authority on the way out.

⭐ **The founder's framing, kept because it is the whole point:** the defect is not that F-2
happened twice in twenty-one. It is that it was **possible at all**. Thirty more windows would
have measured a frequency, not changed a fact — which is why the remaining 30 windows on the
old code were ruled **not owed**.

---

## 2 · What landed

```
EncounterScope { kind: 'visible_window', startCodePoint, endCodePoint }
```

**Required**, not optional, not defaulted, on **both** `CandidateNotice` and `MaiaNotice`: a
notice that cannot say what it was shown cannot be constructed.

```
model proposal → exact evidence binding → server attaches perceptual scope
   → CandidateNotice → screen → MaiaNotice preserving that same scope
```

| file | change |
|---|---|
| `contract.ts` | `EncounterScope`; `scope` required on `CandidateNotice` and `MaiaNotice` |
| `bind.ts` | scope derived from the **same visible range the evidence is bound in** — one value, so evidence and authority cannot disagree |
| `read.ts` | `isLawfulScope()` / `withinScope()`; promotion preserves scope **unchanged**, and drops any candidate lacking a lawful scope or carrying an anchor outside it |
| `render.ts` | system rule **10** — every assertion concerns only the stretch shown; name the bound for a bounded non-return |
| `structuredGenerator.ts` | documentation only |
| `witness` | prints `scope : visible_window S..E of N` beside every surviving notice |

**Attachment point matters.** Scope is derived where the anchors are bound, from the same
`visible` range, so a notice cannot carry evidence from one field and authority from another.
The model never supplies it: the tool schema has no scope field, and a volunteered one is
refused by the closed key sets (S2), so there is nothing to honour even if it tried.

**Rule 10 is not the authority.** It is an instruction, and instructions are asked, not
enforced. If it were deleted tomorrow the record would still be honest: an assertion could
overreach, but it could no longer overreach **invisibly**. S7 pins exactly this — the F-2
wording, from a one-window call, still carries its true narrow scope.

---

## 3 · Falsifiers S1–S7

| # | obligation |
|---|---|
| S1 | scope is derived from the exact window used, equals the visible range (overlap included), and a single-window Work is truthfully scoped to the whole draft |
| S2 | the model has no say — no scope/window/visible/whole/range field in the tool schema; a volunteered scope is **refused, not ignored**; the parsed proposal carries no scope at all |
| S3 | promotion preserves the candidate's scope; a window-local notice never emerges with whole-draft bounds |
| S4 | two windows in one Encounter produce two different scopes; neither inherits the other's |
| S5 | an anchor outside its notice's scope is **dropped**; the same candidate scoped to what it was shown is promoted |
| S6 | no scope · foreign `kind` · inverted range · negative start · non-integer bound — each **dropped**, never defaulted, never thrown on |
| S7 | the contract instructs bounded non-return **and** an assertion ignoring it still carries its true scope |

## 4 · Gates

| gate | result |
|---|---|
| Encounter suite | **104 passed · 0 failed** (was 88; +16 for S1–S7) |
| PT-3 constitutional set | **39 passed · 0 failed** |
| `npm run typecheck` | **229 vs baseline 239 · 0 regressions** |
| `check:no-supabase` · witness typecheck | clean |

---

## 5 · Deliberately NOT absorbed

⛔ No synthesis pass · no cross-window interpretation · no hierarchy or sections · no lexicon
redesign · no change to exact-excerpt binding · **no F-1 grounding repair** · **no F-3
front-matter ontology repair** · **no F-4 indirect-speech screen repair** · no URL cleanup ·
no PR · no deploy.

**F-1, F-3 and F-4 remain live semantic-ear evidence.** The rerun after this repair measures
them again. Absorbing them now would have destroyed the evidence they constitute.

## 6 · Carried forward — an E3 acceptance constraint (founder, 2026-09-08)

> **A MAIA Encounter notice is never just its text. Its text has authority only within its
> server-owned scope. A future surface may not discard that scope and present the sentence as an
> unqualified whole-Work claim.**

⛔ **This does not open E3.** It is recorded here so that when a presentation surface is
constituted, this is an acceptance condition it must already satisfy rather than a discovery
made afterwards. The repair put the scope on the record; a surface that drops it on the way to
the writer would re-create F-2 downstream of every guard in this module — the same defect, one
layer further out, where none of S1–S7 can see it.

## 7 · Owed

1. ⛔ **G8 rerun on this commit**, founder-run from the product-authorized shell — whole Work,
   33 windows, with `scope` now printed beside every surviving notice.
2. **The residue this repair does not remove**: an assertion may still overreach its scope in
   wording. What changed is that it can no longer do so invisibly. That is a semantic-ear
   question, not a regex one, and F-2's recurrence rate is now measurable rather than
   inferable.
3. ⛔ E3 HOLD · PR HOLD · deploy HOLD.

> The witness could not previously tell an honest whole-Work observation from a window-local one
> wearing its clothes. Now the record always says which it is.
