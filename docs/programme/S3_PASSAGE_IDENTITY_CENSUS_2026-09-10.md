# S3 remediation · passage-identity census

```text
SUBJECT     canonical feddbaded  (branch material named where it is relevant)
MODE        READ-ONLY · no design · no repair · no tests · no fixtures
QUESTION    What does this manuscript system already use to identify a passage
            stably enough that the disclosure decision and the disclosed
            characters can both refer to the same thing?
AUTHORIZED  founder, 2026-09-10, following the load-scope census
```

⛔ **No representation is proposed here.** The census inventories what exists and
traces the three places the founder named, separately.

---

## P1 · THE INVENTORY — FIVE REPRESENTATIONS, NO TWO ALIKE

```text
1  PassageRef            lib/manuscript/development/evidenceRef.ts:57-62
   { kind:'passage', sectionId, range: CodePointRange }
   UNITS   Unicode CODE POINTS — the file says "never UTF-16 units"
   TARGET  the section AS READ inside an IMMUTABLE revision
   RESOLVE only through a frozen readState (revisionNumber + range + digest)
   ⛔ "Nothing here may ever be applied to manuscript_draft_sections.text"

2  SectionState          lib/manuscript/development/readState.ts:58-62
   { revisionNumber, range: CodePointRange, digest }
   The locating half of the above. PassageRef is NOT self-sufficient:
   passage identity in this lane is the PAIR (readState, PassageRef).

3  AskAnchor             lib/manuscript/ask/anchor.ts:49-58
   ⛔ HAS NO PASSAGE VARIANT. Finest textual anchor is { on:'section' }.
   ⭐ { on:'observation', readingId, observationKey } reaches a passage BY
      INDIRECTION — it names a frozen object that itself carries PassageRefs,
      and carries no offsets of its own.

4  FocusCrossingRequest.range   lib/writers-studio/focusCrossing.ts:87
   { start, end } — plain numbers, no units declared at the type
   canonical assembler  [...body].slice(...)  → CODE POINTS
   repaired assembler   text.slice(...)       → UTF-16 CODE UNITS
   TARGET  LIVE section text. No revision, no digest, no frozen state.

5  HeldFocus             app/writers-studio/field/heldFocus.ts
   ⛔ UNMERGED — origin/claude/d9-write-integration only
   { scale, sectionIds[], start, end, capturedText }
   UNITS   UTF-16, deliberately, to match textarea selection
   SPANS   MANY sections (start into the first, end into the last)
   ⭐ capturedText is the focus's OWN WITNESS: invalidation is a COMPARISON,
      never a relocation. "A focus that quietly moved would be the system
      deciding what the writer meant to be looking at."
```

⚠️ **Three incompatibilities, stated plainly:**

```text
UNITS      code points (1,2)  vs  UTF-16 (5, and the repaired 4)
TARGET     immutable revision (1,2)  vs  LIVE text (4,5)
EXTENT     exactly one section (1,4)  vs  many sections (5)
```

⛔ The canonical assembler slices code points while `HeldFocus` captures UTF-16.
⭐ The repaired assembler's comment names this exact defect and fixes it to
UTF-16 — **which makes it correct against the capture side and divergent from
`PassageRef`.** Both choices are right for their own lane. **There is no unit
convention shared across the two lanes.**

---

## P2 · TRACE 1 — WHAT THE MEMBER IS ASKED TO AUTHORIZE

```text
FINDING     NOTHING, on canonical.
```

**No client exists.** `/api/writers-studio/focus` is referenced from exactly two
places in the repository, both server-side self-description
(`writersStudioCognition.ts:127` `originRoute`, `canonicalWriterTurn.ts:103`
`ingressId`). ⛔ No component, hook, or page calls it. The request is constructed
only by tests and witness scripts. This is the previously-recorded 7U block, and
it is load-bearing here: **the first of the three traces has no implementation to
compare against the other two.**

**And the consent precondition is not scope-level.** `requireConsentState`
verifies the immutable **posture** of the request (Sanctuary) — "the immutable
posture already resolved for this request." ⭐ **It says nothing about which
characters.** So even where consent exists, the member has not authorized a
passage; they have established a posture.

⚠️ **Consequence for F7-A/B:** "authority granted for passage A" currently has
**no member act that grants it**. The member-facing half of passage identity is
not weakly represented — it is **absent**.

---

## P3 · TRACE 2 — WHAT `establishDisclosureBoundary` RECEIVES

`focusCrossing.ts:105-120` passes:

```text
disclosureId · boundary · sourceClass · participationBasis
sourceRef   = workRef        ← the WORK, not the passage
scopeKind   = 'passage'      ← a KIND, not an identity
sectionRef  = req.sectionRef
gesture
```

⛔ **`range` is never passed. Nothing that distinguishes passage A from passage B
reaches the boundary.** That is Q6, read at its source.

⭐⭐ **AND IT IS DELIBERATE, NOT AN OVERSIGHT.** The receipt module states a
constitutional prohibition (`contextDisclosureReceipt.ts:94-116`):

```text
sectionRef  "Admitted ONLY when the section IS the disclosed thing. For a
             passage the containing section materially narrows reconstruction,
             so it is refused here as well as by a CHECK constraint — the
             receipt proves the governed crossing, not the identity of what
             crossed."

RefusedReceiptField
  text · passage · excerpt · summary · embedding
  hash · digest · fingerprint
  startOffset · endOffset · range · length · wordCount · geometry

  "The hash is the one that looks safe and is not: a digest leaks nothing
   WITHOUT the Work — but the Work is exactly what an auditor of this system
   holds, so a hash beside the manuscript is a selection locator."
```

⭐ **Every representation that would distinguish one passage from another is on
the refusal list by name.** Q6 is therefore not a gap someone forgot to fill. It
is a place where two ratified laws meet.

---

## P4 · TRACE 3 — WHAT ULTIMATELY SELECTS CHARACTERS

```text
FOCUS LANE          req.range → assembleFocus → slice of LIVE section text
                    ⛔ no revision · no digest · no frozen state
DEVELOPMENTAL LANE  observation.evidenceRefs → recoverEvidence(ref, readState,
                    revisionContent) → digest-verified slice of the FROZEN
                    revision, refusing range_outside_section
```

⭐ **The developmental lane's selector is verified against a digest before it
yields a character. The Focus lane's is not verified against anything.** In
Focus, `range` is applied to whatever the section says now.

---

## P5 · DO THE THREE DENOTE THE SAME PASSAGE?

```text
                      FOCUS LANE              DEVELOPMENTAL LANE
what the member
is asked to authorize  ⛔ NOTHING             ⛔ NOTHING
                       (no client; consent    (no boundary call at all
                        is posture-level)      — the S3 defect)

what the boundary
receives               workRef + 'passage'    ⛔ NOT CALLED
                       ⛔ no passage identity

what selects
characters             req.range on LIVE      (readState, PassageRef),
                       section text           digest-verified
```

⛔ **In neither lane do the three denote the same passage, and in neither lane is
the failure a mismatch — it is an absence.** Focus's boundary is never told which
passage; the developmental lane has no boundary at all.

---

## P6 · THE COLLISION F7-C MUST BE RULED THROUGH

F7-C requires that completed-crossing evidence *"distinguishes A from B
sufficiently to prove which crossing occurred, without becoming reusable
authority."*

⛔ **The receipt's ratified law forbids exactly the fields that would do that** —
range, offsets, length, digest, geometry — on the stated ground that anything
narrowing reconstruction, beside a manuscript the auditor holds, IS a locator.

```text
F7-C            evidence must distinguish A from B
RECEIPT LAW     no field that narrows reconstruction may be recorded
```

⚠️ **These are both ratified. They are in direct tension, and the tension is the
real content of Q6.** ⛔ Not resolved here.

---

## P7 · THE PRECEDENT THAT ALREADY EXISTS — IDENTITY BY INDIRECTION

⭐ The system has already solved a structurally similar problem once, in
`AskAnchor`:

```text
{ on: 'observation', readingId, observationKey }
        ↓
names a frozen, member-owned, immutable object
        ↓
that object carries the PassageRefs
        ↓
the anchor itself carries NO offset, NO digest, NO length
```

This satisfies the receipt module's own admission rule for `sourceRef` —
*"authored or assigned, never derived from its content"* — because an assigned
key is not a function of the prose.

⚠️ **Stated as a precedent, NOT proposed as the answer.** Two open questions it
does not settle, and which are the founder's to rule:

1. An assigned key still *narrows* for an auditor who can resolve it. It differs
   from a range in requiring a **second privileged lookup** rather than
   self-resolving against the Work. Whether that difference is constitutionally
   material is **NOT RULED**.
2. There is no analogous frozen object on the Focus path. A live selection is not
   a frozen reading, and manufacturing one to obtain an identifier would be a
   design act, not a census finding.

---

## P8 · BLOCKING FINDING — PASSAGE SCOPE IS UNREACHABLE ON CANONICAL, TWICE

Independent of Q6, and not previously recorded:

```text
BLOCKER 1  assembleFocus joins a `manuscripts` table and a `user_id` column
           that do not exist  →  W1 = 0 on every scope
           (already recorded in the load-scope census)

BLOCKER 2  focusCrossing.ts:117 passes `sectionRef: req.sectionRef`
           UNCONDITIONALLY, and mintDisclosureAttempt refuses when
           `sectionRef && scopeKind !== 'section'`  →  { kind: 'unavailable' }
```

⭐ **So a canonical passage request cannot succeed either way.** With a
`sectionRef` the mint refuses; without one the assembler cannot find the section.
The one-line guard (`scopeKind === 'section' ? sectionRef : undefined`) exists
only on the unmerged D9 branch.

⛔ **Reported, not repaired.** ⚠️ It also means every canonical instrument that
exercises passage scope is exercising a refusal path — **a green passage test on
canonical is evidence about refusal, not about passage handling.** That is a
direct application of the ratified rule: *an instrument that cannot fail when the
governed behavior is wrong has not tested that behavior.*

---

## Hard-stop conditions — adjudicated

```text
no passage identity exists anywhere            NOT TRIGGERED — five exist
one shared representation across lanes         ⛔ ABSENT — units, target and
                                               extent all disagree
member authorizes a passage today              ⛔ NO — trace 1 is unimplemented
                                               and consent is posture-level
F7-C achievable under current receipt law      ⚠️ COLLISION — P6, for ruling
passage scope reachable on canonical           ⛔ NO — two independent blockers
```

---

## Standing

```text
PASSAGE-IDENTITY CENSUS   COMPLETE
REPRESENTATIONS FOUND     5 · no two agree on units, target or extent
TRACE 1 (member act)      ⛔ UNIMPLEMENTED — no client; consent is posture-level
TRACE 2 (boundary)        ⛔ carries NO passage identity, BY RATIFIED LAW
TRACE 3 (selection)       Focus: live-text range · Developmental: digest-verified
THE THREE AGREE?          NO — and by absence, not mismatch

F7-C vs RECEIPT LAW       ⚠️ COLLISION reported for ruling
PRECEDENT NOTED           identity by indirection (readingId, observationKey)
                          ⛔ not proposed as the answer

Q4 FRESHNESS              CLOSED
Q6 PASSAGE                STILL OPEN — representation not selected
PASSAGE SCOPE             UNREACHABLE ON CANONICAL — two blockers, reported

S3 IMPLEMENTATION         NOT AUTHORIZED
F1–F7 IMPLEMENTATION      NOT AUTHORIZED
FOCUS ASSEMBLER CUSTODY   separate dependency · unmerged
A / C                     HELD
#1277 D9                  UNTOUCHED · DRAFT
#1279 · #1280             OPEN · record only
FOCUS WITNESS             UNSPENT
PRODUCTION                UNTOUCHED
```

⭐ *Passage identity is not missing from this system. It exists five times, in
two incompatible dialects, and never at the boundary that would need it. The
boundary's silence is not an oversight — it is a ratified refusal, and Q6 is the
place where that refusal and F7-C have to be reconciled.*
