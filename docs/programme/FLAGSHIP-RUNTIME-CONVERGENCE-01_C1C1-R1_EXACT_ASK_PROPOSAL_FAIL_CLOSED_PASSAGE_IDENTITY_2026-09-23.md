# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1-R1 — Exact Ask + Proposal Fail-Closed + Passage-Identity Repair

**Date**: 2026-09-23
**Act**: C1C1-R1 (founder HOLD on C1C1 — narrow repair of three incompletely enforced laws)
**Against**: C1C1 candidate `c87a78eb4` · canonical `19be6b6ec` as named (fetched tip `4d6cc6789`; the further advance is `jarvis-desktop/**` + one JARVIS record — zero Writer's Studio overlap; the `b23ae2d7f → 19be6b6ec` advance verified as exactly the five named files)
**Lineage**: IR1 `9ea26c273` (separate instrument act, its own record) → R1 suite `f0b116776` → R1 repair `51e2fb783` → this record
**Authority**: repair only. ⛔ No capability added. ⛔ No second turn. ⛔ No merge, deploy or production enablement. ⛔ STOPPED for founder re-adjudication of C1C1. ⛔ No C1C2.

---

## 0. Standing at the top

- **Three defects repaired, each suite-first.** Against the exact candidate the extended suite went RED on L17 · L18 · L19 (reference 16/19) while D14 · D15 · D16 died on their named laws. After the repair: **reference 19/19 · 16/16 dead · LETHAL + DISCRIMINATING**.
- **Walk green with the three new proofs**: flag off **6/6** · flag on **27/27** · C1B live-write walk on the mounted host **22/22** · controlled visual witness **byte-identical**. Ship typecheck **226 vs 239, 0 regressions**. Every other named gate green (§5).
- ⚠️ **One collateral entry is classified by inheritance, not irreducibility, and is raised for your ruling** (§3): D12 also dies on L17/L18 because it was cloned from the pre-R1 reference; a one-line narrowing would fix it, withheld because R1 forbade rewriting the accepted thirteen.
- ⚠️ The proposal-material walk case is a **labelled controlled response mutation at the wire**: the server produced no version row (verified, `versions = 0`); the browser's view of one POST response was rewritten to carry `version:{id}`, so the *host's* backstop is what was exercised. The server gate itself is proved by the editorial-runtime matrix, unchanged.
- The Experience Contract was **not** edited (outside the R1 population); its 24/24 line remains a true statement of the C1C1 run. The extended walk now carries three more checks.

## 1. R1-1 — the member's exact utterance

`commissionDiscuss` and the host's `onSubmitAsk` now use `trim()` **only as an emptiness predicate** (`text.trim().length === 0 → refuse`); `ask` travels unchanged into `runDiscussAct` → `sendTurn` → the stored author turn. No leading/trailing/internal whitespace, punctuation, capitalization or wording is normalized. The panel's `memberAsk` renders the same bytes (React text node; the law asserts the exact string in the markup, the walk asserts `textContent` untrimmed).

- **L17** — `"  Why does this sentence feel flat?  "` reaches `sendTurn` byte-exact; the layer echoes it; host + act sources contain no `.trim()` other than the `.trim().length === 0` predicate; whitespace-only asks are refused. **D14** (`ask.trim().replace(/\s+/g,' ')`) dies.
- **Walk R1-1** — stored `ask_turns.body` = `"  Why does this sentence feel flat?  "` exactly (and ≠ its trim).

⚠️ Noted, not repaired (outside population): HTML *displays* edge whitespace collapsed unless the echo carries `white-space: pre-wrap`; the DOM bytes are exact.

## 2. R1-2 — proposal material fails closed

After a successful `sendTurn`, the act checks `producedVersionId === null` **and** `thread.versions.length === 0`. Either violated → `{ ok:false, stage:'proposal', copy: DISCUSS_COPY.proposalWithheld }`:

> MAIA’s reply arrived with proposed wording, which this conversation doesn’t take. Nothing was applied. Your Work was not changed.

No reply rendered, no wording exposed, no `/editorial/version` · `/adoption` · `/undo` referenced anywhere in the host (L6 static, unchanged). The server's discuss-first gate remains the structural protection; this is the live host's backstop.

- **L18** — a nominally successful turn with `producedVersionId:'v1'`, and one with a non-empty `versions`, are both refused with calm copy that carries no proposal wording; no proposal route touched. **D15** (launders the version material and reports success) dies.
- **Walk R1-2** — state `refused`, the withholding copy shown, no `Controlled witness reply` / version id / Apply in the panel, `versionRoutes = 0`, `dbVersions = 0`.

## 3. R1-3 — late results bound to the exact held passage

`resultAttaches(pending, current)` now requires generation unchanged **and** focus section unchanged **and** `samePassage(current.held, pending.held)` — `sectionId · start · end · text` all equal. New `discussAfterHold(discuss, next)`: the same passage keeps an open Discuss; any other passage (same section or not) releases it, and the host advances the generation. The server act is never cancelled; its result simply cannot attach to the new passage and is never resurrected.

- **L19** — another passage in the same section, a drifted range, a re-texted range and a null hold all refuse; the identical passage attaches; `discussAfterHold` detaches on B and keeps on A; the host references it. **D16** (section-only identity, keeps on same section) dies. **L8** now carries the exact held passage in its current state (all prior cases still pass).
- **Walk R1-3** — slow ask on `far bank` (21:29) → `sound` held (50:55) in the same section while pending → panel hidden at once, `Ask MAIA` available for B, still hidden after the server finished (MAIA turns 3→4, one turn POST), and **not resurrected** when `far bank` is held again.

**Collateral after repair**

| Candidate | Extra kills | Standing |
|---|---|---|
| D1 focus-discuss | + L17 · L18 | **irreducible** — never sends, so no bytes reach `sendTurn` and no send result exists to check |
| D8 late-result-migrates | + L19 | **irreducible** — an identity that ignores the gesture ignores the passage |
| D12 open-before-settlement | + L17 · L18 | ⚠️ **INHERITED, reducible** — cloned from the pre-R1 reference (no emptiness predicate, no proposal backstop). Left unedited per R1's "do not rewrite the thirteen". **Founder ruling requested**: (a) accept as classified-by-inheritance, or (b) authorize the one-line narrowing so D12 embodies only its named error. |

## 4. Files (population as authorized)

`app/writers-studio/rebuild/discussAct.ts` · `app/writers-studio/rebuild/FlagshipWriteHost.tsx` · `tests/constitutional/writers-studio/flagship-c1c1/{laws.ts,candidates.tsx}` · `scripts/witness/flagship/c1c1-discuss-walk.ts` · two re-taken captures · this record. `DiscussLayer.tsx` **unchanged** (detachment expressed in the host). The preserve-unchanged list is blob-identical to `8edca6c97` (C1C1-L14, 17 files, PASS).

## 5. Gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-c1c1` | reference **19/19** · **16/16** dead · LETHAL + DISCRIMINATING |
| `typecheck:ws-flagship-c1c1` | PASS, no new allowance |
| C1C1 walk flag off / flag on | **6/6** / **27/27** |
| C1B live-write walk (mounted host, flag off) | **22/22** |
| controlled flagship visual witness | byte-identical (44/44 + result file) |
| `matrix:ws-flagship` · `-c1a` · `-c1b` | LETHAL + DISCRIMINATING (C1A 9/9 · C1B 10/10 after IR1) |
| `typecheck:ws-flagship` · `-c1a` · `-c1b` | exit 0 · PASS · PASS |
| `npm run typecheck` | 226 vs baseline 239 · 0 regressions |
| `matrix:ws-sanctuary-editorial` · `matrix:ws-sanctuary-keep` | 22/22 · 27/27 |
| `matrix:editorial-runtime` · `matrix:editorial-reading-contract` · its typecheck | green |
| `check:design-canon` · `ci:sovereignty` · `check:no-openai` · `check:no-supabase` | green |

**Standing: C1C1-R1 ✅ BUILT AND WITNESSED ON CANDIDATE · exact member bytes preserved · unexpected proposal fails closed · late result bound to exact passage identity · suite lethal · candidate browser witness green · ⚠️ D12 inherited collateral awaiting ruling · ⛔ NO MERGE · ⛔ NO DEPLOY · ⛔ NO PRODUCTION ENABLEMENT · ⛔ NO C1C2 · STOPPED FOR FOUNDER RE-ADJUDICATION OF C1C1.**
