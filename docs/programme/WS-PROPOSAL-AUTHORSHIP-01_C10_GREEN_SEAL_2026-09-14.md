# C10 · GREEN — sealed, adjudicated · closing witness UNSPENT

```text
Authority   FR-W5 · design 322d5b9a · RED sealed dd0ebffc
Custody     /private/tmp/c10-green-0bd2b657 · HEAD 0bd2b657… detached
            ⛔ no commit · no push · founder checkout untouched at the same SHA
Evidence    FOUNDER-READ · ⛔ Jarvis read no source and ran no test
```

---

## 1 · What was built

```text
GO/SHOW CHANGE in Whole
→ dedicated WholeProposalReturnRequest { requestId · sectionId · locusKey }
→ mount target section if necessary
→ existing ProposalEvidenceInWork registers the REAL Locus node
→ layout-phase observer addresses THAT EXACT NODE
→ FULFILLED once
    OR target mounted + exact locus absent → REFUSED → ⛔ zero shell fallback
```

```text
jumpTo                          ⭐ unchanged — ordinary section navigation
automatic arrival               ⭐ unchanged
Section moveToProposal+token    ⭐ unchanged
SHOW CHANGE label               ⭐ UNTOUCHED — the F1 rename lane was NOT smuggled in
```

⭐ **Refusal copy frozen WITHOUT the unsupported transience claim** — Jarvis's *"right now"* check
was taken:

```text
"I can't locate the exact passage in the manuscript. Nothing has moved."
inline in the proposal panel · role="status"
```

---

## 2 · ⚠️ EVIDENTIAL PRECISION — the RED did not turn green; a SUCCESSOR did

```text
RED       af85b6cd…   asserted against the OLD jumpTo path
GREEN     9e8efbb5…   asserts against the NEW dedicated carrier
```

⛔ These are **not the same test**, and the record must not say *"the sealed RED turned green."*
The design ruling changed the voluntary act's carrier, so the original falsifier's subject no longer
exists in the repaired code.

```text
⭐ THE FALSIFIER WAS NOT WEAKENED
   same hostile long-section construction · same real shell · same real locus ·
   same assertion that THE EXACT LOCUS, not its containing shell, is the addressed DOM object
```

### ⭐⭐ Where the lethality evidence actually rests now

⭐ Because RED and GREEN are different tests, the *"absent → present"* claim is carried by **two
separate facts**, and the second is the load-bearing one:

```text
1  ABSENCE   the sealed RED — the capability was demonstrably missing on untouched source,
             with target resolved to the SECTION SHELL (three facts, adjudicated genuine)

2  ⭐⭐ DISCRIMINATION   THE MUTANT — applied to the REPAIRED code and KILLED:
     "try exact locus → if absent after mount → reveal section shell → consume as fulfilled"
       F3 / F8  FAIL — shell reveal detected
       F4       FAIL — wrong exact locus degraded to shell
       mutant exit 1
```

⭐ **The mutant is what proves the matrix discriminates the real capability from the tempting
counterfeit** — the species the design warned *"looks like the intended repair in code review."*
⭐ That evidence is stronger than a RED/GREEN transition would have been, because it was run against
the repair itself.

```text
MUTANT DID NOT CONTAMINATE GREEN — verified BYTE-FOR-BYTE, not asserted:
  pre-mutant  2e8e3e426d08566f07531313a4ee5a54f84b024bd8254093dfd2aeb2ae6729ad
  post-mutant 2e8e3e426d08566f07531313a4ee5a54f84b024bd8254093dfd2aeb2ae6729ad
```

---

## 3 · The matrix — GREEN

```text
F1 unmounted target → mount → exact locus once        F6 evict/remount → no late reveal
F2 already-mounted → exact locus once                 F7 newer request supersedes older
F3 missing locus → REFUSE · zero shell fallback       F8 no counterfeit partial success
F4 wrong locusKey in same section → cannot satisfy    F9 stale refusal clears for a new act
F5 rerenders → no repeated reveal                     F10 withdrawal ⛔ not reported as failure

TWO LOCI IN ONE SECTION   request for B reaches B, ⛔ never A
```

⭐ The two-loci case passing is what rules out the `sectionId`-keyed implementation that would have
looked architecturally correct — the carrier-collapse family, killed before it could exist.

---

## 4 · ⚠️ DEVIATION FROM THE PINNED ACCEPTANCE SET — recorded, not absorbed

The acceptance set (plan §4 item 4) required:

```text
⛔ "proposal-work-mode contracts   UNCHANGED PASS"
```

What happened:

```text
⚠️ proposalWorkMode.test.ts WAS CHANGED, then passed.
```

⭐ **The change is defensible and is recorded with its reasoning rather than smoothed:** that test
hard-coded `showProposedChange` as a single `[moveToProposal]` callback — an assumption the design
ruling deliberately made explicit, because the census established Section and Whole have **different
return mechanisms.** Its updated contract now requires:

```text
Whole    dedicated proposal-return carrier · ⛔ no setJumpTo
Section  moveToProposal + revealToken
Both     viewport / orientation ONLY — ⛔ no write · no mode change · no acceptance
```

⭐ The **behavioural** Section test was unchanged and green.

```text
⭐ WHY THIS IS FLAGGED ANYWAY: modifying an existing contract test during a repair is exactly
   how an invariant gets quietly relaxed. This one was strengthened, not weakened — ⛔ but the
   acceptance set said "unchanged", and it was not. The deviation is the founder's to ratify.
```

---

## 5 · Gates and invariants

```text
COMBINED RUN   7 suites · 110 tests · 0 failed
  proposalRevealBehaviour · wholeManuscriptSurface · proposalWorkMode · consentSurface
  C10 primary capability · C10 lifecycle matrix · C10 refusal UX

npm run typecheck        4320 program files · 229 errors vs baseline 239 · ✅ NO REGRESSIONS
npm run check:no-supabase ✅ clean
git diff --check          ✅ clean
```

---

## 6 · Standing

```text
C10 CODE        ✅ IMPLEMENTED — isolated worktree only
PRIMARY GREEN   ✅        F1-F10 ✅        TWO-LOCI ✅
MUTANT          ✅ KILLED · restoration verified by digest
INVARIANTS      ✅ 110/110        TYPE GATE ✅        SUPABASE GATE ✅
SOVEREIGNTY     ✅ no shell fallback · no stale debt
F1 RENAME       ⛔ untouched — separate micro-lane
CLOSING WITNESS ⛔ UNSPENT
COMMIT / PUSH   ⛔ none

⚠️ OWED  founder ratification of the proposalWorkMode contract change (§4)
⚠️ OWED  disposition of the work itself — it exists ONLY in a temp worktree at 0bd2b657
```

> ⭐⭐ **A voluntary return is not complete because Whole reached the right section. It completes
> only when that request's exact locus is actually addressed — or the issuer tells the member
> plainly that it could not be.**
