# WHOLE-FIRST-RETURN CENSUS — RESULT + ADJUDICATION

```text
Authority       FR-W5 · b4bb6252 · instrument 9860e736
Mode            READ ONLY — discharged as such
Subject runtime Mac Studio, detached 0bd2b65789ec…, localhost:3100 listening
Custody         no checkout · no stash · no reset · no code/test/schema/state edit
                pre-existing dirty worktree left untouched
Evidence class  FOUNDER-READ throughout. ⛔ Jarvis read no source; it adjudicates only.
IMPLEMENTATION  ⛔ NOT PERFORMED
```

---

## 1 · What the census established

**C1 · The F6 caution resolved, and it mattered.**

```text
SHARED     control (ProposedChange.tsx → onShowChange) and top-level handler
           (CanvasRoom → showProposedChange), in BOTH views
SEPARATE   downstream reveal mechanisms
```

⭐ **Same control, same handler, different return mechanism.** Exactly the failure family the F6
caution was carried forward for — a name-level identity that is not an object-level identity. Had
C1 stopped at "shared handler", the census would have concluded the views were equivalent.

**C2/C3 · The witnessed symptom has a direct substrate correlate.**

```text
Whole:  showProposedChange → moveToProposal → proposalMove(view='whole')
        → { kind:'scroll', sectionId } → setJumpTo(sectionId) → setRevealToken(n+1)
        → commitWindow → setPendingScroll → layout effect
        → shells.current.get(sectionId) → revealWithin(SECTION SHELL, 'start')

Target = A · section shell.     Command value = proposalTarget.sectionId
ProposalEvidenceInWork renders <Locus …/> with NO innerRef.
```

⭐ `SECTION-ADDRESSED` was not a near-miss of an exact-locus mechanism. **It is what the Whole path
asks for.**

**C5 · The capability-level diff, stated at the right altitude:**

```text
SECTION   exact locus is ADDRESSABLE      (useBringIntoView: ref + two effects —
                                           automatic arrival, and revealToken per asked return)
WHOLE     exact locus is VISIBLE but NOT ADDRESSABLE by SHOW CHANGE
```

**C6 · The reveal guard finding is stronger than "differs".**

```text
Whole-first does not cross the Section reveal mechanism DIFFERENTLY — it does not cross it AT ALL.
```

⭐ Positional sovereignty in Whole therefore holds for a **different reason** than in Section: not
a guard that refuses to override voluntary scrolling, but the **absence of any exact-locus reveal
path to guard.** ⚠️ **That is a load-bearing distinction for the repair** — see §3.

**C7/C9 · Readiness and the test gap.**

```text
Whole exact Locus:  DOM rendered once the section mounts · ref NONE · reveal consumer NONE
Missing falsifier:  cold Whole → SHOW CHANGE → require EXACT LOCUS, not section shell
```

⭐ C7 avoided the trap the instrument named: this is **not** an unresolved readiness race. The
target is never registered as a navigation target at all.

---

## 2 · ⛔ C4 — WHAT THE CENSUS DID NOT ESTABLISH

```text
⛔ WHY the sealed `Whole / second asked return` was LOCUS-ADDRESSED.
```

The inspected Whole path contains **no exact-locus consumer**, on any invocation. `revealToken` is
incremented by `SHOW CHANGE` and **consumed nowhere in Whole**. A second press repeats the same
section-addressed mechanism.

⭐⭐ **The census refused to close this gap by invention** — it labelled neither a race condition
nor an initialization story. That refusal is the census's most valuable act, and it is why the
adjudication below can be trusted.

⚠️ C8 records the honest consequence: the Gate-A alternative (*view-independent initialization
defect masked by Section view*) is **not established** by the substrate — ⛔ **and cannot be
declared impossible either**, because `Whole / second` has a sealed runtime PASS that the inspected
code does not explain.

---

## 3 · ⭐⭐ ADJUDICATION (Jarvis) — the census BOUNDS the repair; it does not AUTHORIZE it

**Agreed, and for the founder's stated reason.** A repair written now could add the missing Whole
locus consumer **and silently overwrite whatever actually produced the sealed `Whole / second`
PASS.** Custody of the evidence, not hesitation.

### ⚠️ A consequence the census implies and should not be left implicit

If C4 resolves such that `Whole / second` was **incidental geometry** rather than a mechanism, then
the FR-W5 invariant `Whole / second asked return — PASS` is currently protecting an **outcome**,
not a **capability**.

```text
⚠️ A repair that gives Whole a real exact-locus reveal would CHANGE where Whole/second lands
   (e.g. shell-at-'start' → locus-at-'center').
   Under a literal reading of FR-W5 that DISTURBS a sealed PASS.
   Under the ruling's PURPOSE it REPLACES an incidental pass with a guaranteed one.
```

⛔ **Not ruled here.** Jarvis names it because the repair cannot be adjudicated later without the
founder having decided which reading of the invariant governs. ⭐ This is the same distinction the
lane has drawn all along: **a permission is not an act; an outcome is not a capability.**

### Candidate explanations for C4 — ⛔ CANDIDATES, none established

Recorded so the resolving act is designed to **discriminate** between them rather than confirm one:

```text
K1  VIRTUALIZATION SETTLE.  First invocation commits a new window around the target; sections
    mount and resolve height AFTER the scroll lands, shifting content under the viewport so the
    locus ends up off-screen. Second invocation finds geometry already stable, so the same
    section-shell scroll leaves the locus in view.
    → consistent with C2, C4, C8 AND with the founder's own collateral note that invocations
      "land at roughly the same visible place". Requires NO exact-locus consumer.

K2  SECTION-LOCAL WARMTH.  Not "second press" but "this section already visited".

K3  LOCUS GEOMETRY.  The locus sits near the section start, so shell-at-'start' exposes it
    whenever layout is stable. Then PASS/FAIL is a property of the PROPOSAL, not the invocation.

K4  A path outside the inspected surface.
```

⭐ **K1–K3 all predict the same second-press PASS with no mechanism difference.** If any holds,
`Whole / second` is not evidence of an exact-locus capability at all.

### The discriminating observations (founder-side, read-only)

```text
O1  Cold Whole / first, then DO NOTHING. Watch whether the viewport position shifts after the
    initial scroll settles.            SHIFT OBSERVED → K1 strongly supported
O2  Cold Whole / first on a proposal whose locus sits LATE in a long section, and again on one
    whose locus sits NEAR the section start.    DIVERGENT RESULTS → K3
O3  ⭐ THE DECISIVE ONE. Warm runtime, but press SHOW CHANGE for a proposal in a section NEVER
    VISITED this session.
        FAIL → "second" is SECTION-LOCAL warmth (K2/K1), not an invocation property
        PASS → something global initializes on first use (keeps the Gate-A alternative alive)
```

⛔ Each is one observation, classified `LOCUS-ADDRESSED | SECTION-ADDRESSED`, sealed as a new cell.
⛔ No mechanism claim from any of them. ⛔ No code edit.

---

## 4 · Standing

```text
LANE      OPEN · FR-W5 AUTHORIZED
CENSUS    ✅ COMPLETE ENOUGH TO BOUND · ⛔ NOT COMPLETE ENOUGH TO PATCH
C1–C3     ESTABLISHED          C5–C9  ESTABLISHED
C4        ⛔ UNRESOLVED         C10    CANDIDATE BOUNDARY NAMED

BOUNDARY  Whole-view proposal-evidence return seam
          ProposalEvidenceInWork ↔ WholeManuscriptSurface / renderProposalEvidence

NEXT      resolve the Whole / second discrepancy (O1–O3, or a founder-chosen act)
          ⭐ and rule which reading of the `Whole / second` invariant governs
STOP      ⛔ NO CODE EDIT
Gate B    CLOSED               Gate C  CLOSED (blocked by F6′)
```

> ⭐ The census named the boundary. It did not earn the patch.
> **The symptom licensed an investigation of mechanism — and the investigation found the mechanism
> for the FAILURE, but not for the PASS beside it.**
