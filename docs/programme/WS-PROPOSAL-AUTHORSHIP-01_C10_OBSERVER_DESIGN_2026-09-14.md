# C10 · THREE-PART OBSERVER — DESIGN RULING

```text
Authority   FR-W5 · pending-intent ruling 558d98d9 · RED sealed dd0ebffc
CODE        ⛔ NOT YET
```

> ⭐⭐ **The repair does not teach Whole how to infer WHY it moved. It prevents inference from being
> necessary: the voluntary act travels as its own request to the exact locus, and that request must
> TERMINATE before it can become stale debt.**

---

## 1 · ⛔ NOT by enriching `jumpTo`

⛔ Making `jumpTo` a richer union would **preserve the very collapse the census exposed.**

```text
jumpTo                 UNCHANGED — ordinary Whole section navigation
                       rail / automatic arrival semantics UNCHANGED

wholeProposalReturn    ⭐ NEW DEDICATED CARRIER
                       emitted ONLY by the member's voluntary GO TO CHANGE act
                       exact-locus semantics
```

```text
⛔ no reinterpretation of jumpTo · ⛔ no downstream guessing
```

## 2 · Request identity

```text
WholeProposalReturn { requestId · sectionId · locusKey }

requestId   WHICH voluntary act is owed          — a NONCE, not a flag
sectionId   WHAT must be mounted
locusKey    WHICH EXACT rendered locus may discharge it
```

⛔ **`locusKey` must identify the exact proposal locus, not merely its section.** Two proposals, or
two ranges in one section, must **not** satisfy one another. The existing voluntary token may supply
`requestId` if the implementation read supports it.

## 3 · Where the three facts live

```text
ACT OWNER              Canvas/page              issues WholeProposalReturn
MOUNT/OBSERVER OWNER   WholeManuscriptSurface   keeps the request owed · makes the destination
                                                renderable · observes locus registration ·
                                                FULFILS / REFUSES / WITHDRAWS
DOM OWNER              ProposalEvidenceInWork   owns the real Locus node · REPORTS IT UPWARD
```

⭐ The observer lives at the Whole surface boundary because **that is the only layer that can
coordinate mounting with DOM availability.** ⛔ This does **not** move scrolling authority into
`ProposalEvidenceInWork` — the renderer merely **registers what exists.**

```text
ProposalEvidenceInWork → existing Locus `innerRef` → Whole observer: registry[locusKey] = node
```

⭐ Structurally possible today — ⛔ no new excerpt, panel, or proposal representation.

## 4 · ⭐ The shell is NOT an intermediate fulfilment path

```text
GO TO CHANGE
→ issue exact return request
→ Whole commits the mount window around sectionId
→ ⛔ DO NOT REVEAL SHELL
→ exact evidence renders
→ matching Locus registers
→ reveal exact Locus
→ consume request EXACTLY ONCE
```

⭐ The persistent shell supports Whole's **geometry**; C10 does not need to move the viewport to it
first. ⛔ Otherwise the repair would visibly perform *old behaviour → then repaired behaviour*, and
would retain both unnecessary machine movement **and the shell semantics the capability exists to
supersede.**

⭐ Automatic arrival is **untouched** and continues through its existing path.

```text
NOTE  this changes WHERE Whole/second lands (shell-at-start → exact locus).
      ✅ Already covered by the C4 adjudication: the sealed invariant protects the OUTCOME
      (locus exposed), ⛔ never the shell-at-start geometry.
```

## 5 · ⭐⭐ The sovereignty problem has a SMALLER solution than expected

```text
A voluntary proposal return MAY NOT REMAIN PENDING ACROSS AN INTERACTIVE PAINT.
```

The target section renders synchronously once its Whole window is committed, so the dedicated
return path coordinates through the **layout phase**:

```text
request issued → mount target → matching locus registers
→ LAYOUT-PHASE OBSERVER:
     exact locus exists                     → FULFIL
     target mounted but exact locus absent  → REFUSE EXPLICITLY
→ paint
```

```text
Two legitimate outcomes before control returns to an interactive member:
  FULFILLED   or   REFUSED
⛔ never "hang around until something turns up later"
```

⭐⭐ **This is stronger than detecting whether a later scroll was human or machine: it prevents the
ambiguous state from existing long enough for the question to matter.**

> ⭐ **Remove the state rather than disambiguate it.**

```text
⛔ no request surviving indefinitely awaiting a remount
⛔ no late reveal after the writer has wandered elsewhere
⛔ no cancel-on-scroll heuristic          ⛔ no "wheel = intent" assumption
```

⛔ **Escape clause:** if the implementation census or falsifier proves the request cannot complete
or explicitly refuse before an interactive paint, ⭐ **STOP.** At that point the source-tagged
cancellation mechanism becomes mandatory and needs its own bounded design. ⛔ Do not build that
complexity pre-emptively while the synchronous renderer may eliminate the hazard entirely.

### ⭐⭐ REFUSAL RULING (founder, 2026-09-14) — inline, local, specific to the act

The hazard: on REFUSE the viewport does not move at all, so the member presses `GO TO CHANGE` and
**nothing visibly happens** — ⛔ indistinguishable from the originating complaint. Ruled:

```text
GO TO CHANGE · REFUSAL

If the exact proposal locus cannot be addressed:
  • viewport does NOT move          • proposal state does NOT change
  • view does NOT change            • manuscript state does NOT change

  • the proposal panel states, INLINE, beneath GO TO CHANGE:

      "I can't locate the exact passage in the manuscript right now.
       Nothing has moved."

  • announced as a STATUS for assistive technology
  • GO TO CHANGE remains a MEMBER ACT — ⛔ never converted into shell fallback
```

⭐ `ProposedChange` already has an established pattern for member-facing refusal copy rather than
silent failure. ⛔ No toast, modal, or Whole-surface notification system is needed.

### Why that copy — what it must NOT say

```text
⛔ "This change could not be made."   → that language belongs to AUTHORIZATION / WRITE refusal
                                        in this surface; using it collapses NAVIGATION failure
                                        with MANUSCRIPT MUTATION
⛔ "Section not found." · "Locus unresolved." · "Navigation failed."
                                      → implementation truths, ⛔ not MEMBER truths
⛔ "Try again."                        → the Studio has a discipline against offering a gesture
                                        guaranteed to refuse. ⭐ Automatic retry is OPTIMISM
                                        MASQUERADING AS HELP.
```

⭐ The copy says exactly the two things the member needs:

```text
1  WHAT could not be honoured   — locating the exact passage
2  WHAT DID NOT HAPPEN          — nothing moved
```

⭐⭐ **The second sentence is load-bearing precisely because the repair refuses the old shell
fallback.** Without it a member could reasonably wonder whether the button did something
off-screen.

### ⚠️ One wording check, not an objection

⛔ *"right now"* implies the condition is **transient**. If a refusal can arise from stale or
missing proposal state, a retry would fail identically — and the phrase would promise a transience
the system cannot back, which is the same claim-discipline problem the copy rules otherwise avoid.
⭐ Worth confirming against the actual refusal conditions before the copy is frozen; ⛔ not changed
here.

### ⭐ Keep the refusal WITH THE ISSUER

⛔ **Explicitly rejected:** `WholeManuscriptSurface`'s existing bottom `role="status"` seam. ⭐ That
status belongs to the **manuscript surface**; this refusal belongs to the **proposal request.**

```text
⭐ THE OBJECT THAT ISSUED THE ACT SHOULD REPORT WHETHER THAT ACT WAS FULFILLED.

ProposedChange  issues request A
      ↓
Whole observer  fulfil A  OR  refuse A(reason)
      ↓
ProposedChange  presents the result of A
```

⭐ The Whole surface may **discover** the refusal; ⛔ it must not become the **narrator** of why
`GO TO CHANGE` failed. **Discovery and narration stay separate** — the source-provenance rule
again, now on the return path.

### Refusal state obeys REQUEST IDENTITY

```text
ISSUE A → clear any prior return-refusal
        → A fulfilled → no refusal shown
        → A refused   → show refusal FOR A

ISSUE B → clear A's refusal IMMEDIATELY → adjudicate B independently

A WITHDRAWN BY B → ⛔ DO NOT show A as "failed"
```

```text
⭐⭐ WITHDRAWAL IS NOT REFUSAL. The member changed their mind.
⭐ Same carrier law again: a refusal belongs to ONE ACT, not to the control forever.
```

### Visual weight

⭐ Use the panel's existing **quiet textual vocabulary**, ⛔ not an alarming error treatment. This
is **a refusal to pretend success, not manuscript damage.** The acceptance refusal uses a warm error
colour because an attempted *authorization* failed; navigation refusal should read as ordinary
quiet metadata unless the design system has a specific refusal tone.

```text
⭐ THE KEY IS VISIBILITY, NOT ALARM.
```

```text
REFUSAL UX  ✅ inline in ProposedChange     TOAST ⛔  MODAL ⛔  SHELL MOVE ⛔
                                            MODE CHANGE ⛔  AUTO RETRY ⛔  WRITE LANGUAGE ⛔
```

> ⭐⭐ **Explicit refusal means the member is told, AT THE PLACE THEY MADE THE REQUEST, that the
> exact request could not be honoured — and the interface must not COUNTERFEIT PARTIAL SUCCESS to
> avoid saying so.**

## 6 · Observer state machine — the completion invariant in executable form

```text
IDLE

ISSUE(request)                                  → OWED(request)
OWED + matching locus ALREADY registered        → reveal exact locus → FULFILLED → IDLE
OWED + locus not mounted                        → mount request.sectionId → still OWED
OWED + matching locus registers                 → reveal exact locus ONCE → FULFILLED → IDLE
OWED + target section mounted, matching locus ABSENT
                                                → REFUSED → IDLE
OWED(A) + newer voluntary request B             → A WITHDRAWN → B OWED

FULFILLED + locus later evicts / remounts       → NOTHING
ordinary rerender                               → NOTHING
ordinary scroll after fulfilment                → NOTHING
```

```text
⛔ THE SECTION SHELL CAN NEVER TRANSITION OWED → FULFILLED
⛔ A WRONG locusKey CAN NEVER TRANSITION OWED → FULFILLED
```

## 7 · Falsifier matrix — lifecycle around the repair

⭐ The existing RED remains the **primary capability falsifier**; this matrix proves the lifecycle.

```text
F1  unmounted target       request → mount → exact locus → reveal ONCE
                           ⛔ shell never used as completion target
F2  target already mounted request → exact locus once · no remount required
F3  no matching locus after target mounts        → EXPLICIT REFUSAL · ⛔ zero shell fallback
F4  same section, WRONG locusKey                 → wrong node cannot satisfy the request
F5  one request, later rerenders                 → no repeat reveal
F6  fulfilled locus evicts then remounts         → no late reveal
F7  request A superseded by B before fulfilment  → only B may reveal

F8  target mounts, exact locus absent  → zero reveal · request REFUSED ·
                                        member-facing inline status emitted ·
                                        copy says the exact passage could not be located ·
                                        ⛔ no shell fallback
F9  refused A → new request B succeeds  → A's refusal CLEARS when B is issued ·
                                        B reveals exact locus · ⛔ stale refusal absent
F10 A superseded by member request B    → A = WITHDRAWN · ⛔ NO refusal message for A
                                        ⭐ prevents the UI accusing the system of failure
                                          when the member simply changed intent

MUTANT  "try locus; if absent consume on shell"  → ⭐ MUST FAIL
```

### ⭐⭐ The one test to be sure of: TWO EXACT LOCI IN ONE SECTION

```text
If the implementation keys only on sectionId it will look ARCHITECTURALLY CORRECT
and still violate the rule:  EXACT LOCUS IDENTITY ≠ CONTAINING SECTION IDENTITY.
```

⭐ Another likely instance of the carrier-collapse family — ⭐ and cheap to kill now.

## 8 · At the act boundary

```text
AUTOMATIC ARRIVAL   ⭐ UNCHANGED

SECTION view        existing behaviour: section orientation + revealToken consumer
WHOLE view          ⛔ DO NOT reduce GO TO CHANGE to setJumpTo(sectionId)
                    ⭐ issue WholeProposalReturn
```

⭐ **That branching is not an architectural smell.** The census established Section and Whole have
**different return mechanisms**; forcing them through one command again would simply recreate
C1 / F6 at another layer.

---

## 9 · Standing

```text
F1                  ✅ semantic ruling complete
C10 RED             ✅ genuine · sealed
pending census      ✅ complete

THREE-PART OBSERVER
  act identity       ✅ dedicated voluntary request
  supersession       ✅ newer request replaces older, by identity
  exact locus        ✅ renderer registers the real existing Locus node

DESIGN PRINCIPLES   ⭐ tag at source; never classify at sink
                    ⭐ remove the state rather than disambiguate it

NEW BOUND           ⭐ fulfil or explicitly refuse BEFORE an interactive pending state

jumpTo              unchanged as ordinary section-navigation carrier
automatic arrival   unchanged
shell fallback      ⛔ PROHIBITED

REFUSAL UX          ✅ RULED — inline in ProposedChange · issuer narrates · quiet, not alarming
                    ⭐ withdrawal is not refusal · refusal belongs to one act
⚠️ CHECK BEFORE FREEZE  does "right now" promise a transience the refusal conditions can back?

DESIGN              ⭐ COMPLETE — GREEN phase may be authorized
CODE                ⛔ NOT YET WRITTEN
```
