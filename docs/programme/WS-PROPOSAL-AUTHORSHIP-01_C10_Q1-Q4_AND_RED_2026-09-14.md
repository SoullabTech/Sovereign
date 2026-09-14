# C10 · Q1–Q4 CENSUS + VALID RED — sealed, implementation NOT begun

```text
Authority   FR-W5 · plan ratified 45cdb0b2
Custody     detached worktree /private/tmp/c10-red-0bd2b657 at 0bd2b65789ec…
            source UNTOUCHED · founder checkout's pre-existing dirty state UNTOUCHED
Artefact    app/writers-studio/__tests__/wholeProposalReturnCapability.test.ts
            SHA-256 af85b6cdb27c29115ae4567e4649bb6a4e44cd76be6b396dde8db6e061c0dfd7
Evidence    FOUNDER-READ · ⛔ Jarvis read no source and ran no test
REPAIR      ⛔ NOT IMPLEMENTED
```

---

## 1 · Q1–Q4 — answered

```text
Q1 OWNERSHIP
   SECTION SHELL DOM / ref   WholeManuscriptSurface
   EXACT LOCUS DOM           ProposalEvidenceInWork
   EXACT LOCUS ref           ⛔ NONE registered in Whole
   ⭐ `Locus` ALREADY ACCEPTS an optional `innerRef`; Whole's renderer calls it without one.

Q2 LIFETIME
   shell      continuous, every section
   locus      BORN when the proposal section enters Whole's mounted window with authority
              `proposal_work` · DIES when that section is EVICTED
   ⭐ any addressability seam registers on mount and clears on unmount.
   ⛔ It may NOT pretend the locus has Whole-surface lifetime.

Q3 NO SECOND REPRESENTATION REQUIRED
   ✅ the existing `innerRef` seam suffices — ⛔ no detached excerpt, no second panel,
      no duplicate proposal representation is structurally required.

Q4 WHERE VOLUNTARY ACT MEETS RESOLVED LOCUS
   ⛔⛔ NOWHERE TODAY.
```

### ⭐⭐ Q4 is the substantive finding

```text
Canvas/page              owns the VOLUNTARY ACT — SHOW CHANGE · moveToProposal() · revealToken++
WholeManuscriptSurface   owns MOUNTING + shell completion — jumpTo · commitWindow ·
                         pendingScroll · revealWithin(shell)
ProposalEvidenceInWork   owns the EXACT LOCUS DOM · ⛔ receives no voluntary-return token
```

> **No existing object observes BOTH "the member still has a voluntary return owed" AND
> "the exact Whole locus now exists."**

⭐ **Therefore the repair must CREATE that observer — it cannot merely wire two existing ones
together.** ⛔ That is a real bound on the implementation, and it is why *retargeting every Whole
jump* is the wrong shape: the token that distinguishes a voluntary act from automatic arrival never
reaches the renderer that owns the locus.

### ⚠️⚠️ CONSEQUENCE Q2 CREATES FOR THE COMPLETION INVARIANT — must be answered by the design

The invariant says an unfulfilled voluntary return **remains pending until the locus exists, or
refuses explicitly.** ⭐ Q2 shows the locus can also be **EVICTED**. So:

```text
⛔ RISK   a request that waits for a locus which never arrives — or arrives much later,
          AFTER THE MEMBER HAS MOVED ON — and then moves the viewport.
```

⭐⭐ **That is precisely the sovereignty violation the one-shot guard exists to prevent, arriving
through the front door of the completion invariant.** The two requirements meet here:

```text
A PENDING VOLUNTARY RETURN MUST BE RELEASED BY A SUBSEQUENT VOLUNTARY MEMBER ACT.
  member scrolls away / navigates elsewhere  →  the request is WITHDRAWN, not deferred
  ⛔ a pending return may NEVER outlive the member's attention and then act on it
```

⛔ Not a design choice made here. ⭐ But `pending` must be **bounded by member intent**, not only
by locus arrival — otherwise the repair satisfies its invariant and breaks a sealed PASS.

---

## 2 · The RED — ADJUDICATED GENUINE

```text
FAIL wholeProposalReturnCapability.test.ts

C10_CAPABILITY_RED:
  fixture valid;
  exact locus rendered/resolvable;
  actual voluntary-return reveal target = CONTAINING SECTION SHELL, not exact locus

Test Suites: 1 failed, 1 total      Tests: 1 failed, 1 total
```

```text
REQUIRED FACT                              STATUS
1 fixture VALID                            ✅
2 exact locus RENDERED / RESOLVABLE        ✅
3 reveal target = CONTAINING SECTION SHELL ✅
⛔ NOT an element-not-found RED.
```

```text
⭐ RED · GENUINE — WRONG TARGET, FOR THE STATED REASON. SEALED.
```

### ⭐ Two properties that make this falsifier stronger than the plan required

```text
BEHAVIOURAL, NOT SOURCE-PROXY   mounts the real WholeManuscriptSurface and the real
                                ProposalEvidenceInWork; observes the seam's behaviour rather
                                than asserting a function name.
                                ⭐ The lane's C21 scar: a source-string scan went RED three
                                times on prose. A test that resolves real nodes cannot.

EVICTION PROVEN IN-TEST         it first establishes the target evidence is ABSENT while that
                                section is OUTSIDE the mounted window.
                                ⭐ That is a FOURTH fact beyond the three required, and it is
                                independent behavioural evidence for Q2's lifetime answer.
```

---

## 3 · Standing

```text
Q1-Q4     ✅ COMPLETE
RED       ✅ GENUINE · SEALED · af85b6cd…
SOURCE    ⛔ UNCHANGED — isolated worktree only
REPAIR    ⛔ NOT IMPLEMENTED · ⛔ still not authorized by this seal alone
MUTANT    owed AFTER green, not now
C10       boundary unchanged      FR-W5 fully governing      OLD FAIL sealed · untouched

OPEN      ⚠️ F1 — the ORIGINATING COMPLAINT ("Show Change doesn't open") remains
             carried, not disposed. ⭐ This is the natural moment to answer it.
```

> ⭐ The RED proves the capability is **absent**. It does not yet prove any particular repair is
> the right one — Q4 says the observer must be **created**, and Q2 says its `pending` state must be
> **bounded by member intent**.
