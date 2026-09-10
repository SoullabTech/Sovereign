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

⭐ **RULED THE SAME DAY — THE COLLISION DISSOLVES.** F7-C was phrased too
narrowly: the receipt does not need to *contain* the locator, only to support a
lawful reference chain from which the crossed scope can be established. Receipt
law is unchanged and every field above stays prohibited. See Ruling 2 below.

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

⛔ **Reported, not repaired — and RULED so.** This is a Focus fidelity defect and
is treated here, in the passage census; ⛔ it must not be silently repaired while
fixing developmental Ask, and ⛔ the D9 one-line guard must not be imported and
called "passage fixed" — that would make the path executable without solving
identity. ⚠️ It also means every canonical instrument that
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

## Founder rulings on this census — 2026-09-10

```text
Q6 DISPOSITION

PASSAGE AUTHORITY        NOT PRESENTLY IMPLEMENTED
CANONICAL PASSAGE PATH   POSITIVE MINT UNREACHABLE
RECEIPT LAW              UNCHANGED
F7-C                     proof through lawful reference chain permitted;
                         content-derived locator fields on receipt remain
                         prohibited
PASSAGE IDENTITY DESIGN  NOT AUTHORIZED IN S3
S3                       may not rely on nominal passage authority
```

### Ruling 1 — canonical `passage` is not presently a usable authority scope

It is **neither merely coarse nor merely under-specified**. It has no complete
lawful path:

```text
member act distinguishing passage A/B     ABSENT
boundary input distinguishing A/B         ABSENT
receipt fields that could encode range    REFUSED BY LAW
canonical positive passage mint           UNREACHABLE
```

The runtime contradiction confirms it: canonical passes `sectionRef` while
minting refuses `sectionRef` for `passage`. ⭐ **A green "passage" test today can
only prove refusal behaviour, not successful passage disclosure.**

> `passage` remains a **reserved semantic scope**, but MUST NOT be treated as
> implemented disclosure authority until a lawful passage-identity primitive
> exists.

⛔ **Do NOT import the D9 one-line guard and call passage fixed.** It would make
the path executable without solving identity.

### Ruling 2 — F7-C and receipt law do NOT actually conflict

F7-C was phrased too narrowly. **The receipt itself does not need to contain the
passage locator.** Receipt law remains intact and unchanged:

```text
NO   range · startOffset · endOffset · length · digest · geometry · authored text
```

What must be possible is: *from the completed crossing evidence, the system must
be able to establish which authorized scope was crossed.*

```text
F7-C  (revised)
Completed crossing evidence must distinguish the authorized passage from
another passage THROUGH A LAWFUL REFERENCE CHAIN.

The receipt need not, and MUST NOT, encode content-derived offsets,
geometry, digests, or authored characters to do so.
```

⭐ **The collision reported in §P6 is dissolved without authorizing an
implementation.** The observation precedent proves indirection is *possible*. ⛔
It does **not** prove that Focus should copy that architecture.

### Ruling 3 — no passage identity may be invented inside S3

The five representations disagree because they answer **different questions**:

```text
PassageRef    frozen evidence identity
AskAnchor     interaction location
Focus range   live selection
HeldFocus     live multi-section holding
receipt       evidence of crossing
```

⛔ Declaring any one of them "the canonical passage identifier" inside an S3
repair would **quietly settle several other architectures at once**. Passage
identity is therefore a **separate design dependency**, never something the S3
remediation may manufacture opportunistically.

### What this means for the S3 repair

S3 still exists and still needs repair. The repair may use **only disclosure
scopes the authority system can honestly establish**:

```text
whole_work    AVAILABLE
section       AVAILABLE
passage       NOT AVAILABLE AS AUTHORITY
```

If a developmental question ultimately needs passage characters, there are two
lawful future choices — ⛔ **neither chosen here; that belongs to the
producer/design decision**:

```text
A. the member explicitly authorizes the containing SECTION
   → W1 may be wider for integrity
   → only the needed passage reaches W2

B. a genuine passage-identity architecture is created first
   → exact passage authority becomes possible
```

⛔ **The third option is PROHIBITED:**

```text
scopeKind = "passage"
but authority really means "somewhere in this section"
```

That is **silent widening**.

### The unreachable canonical path — its own treatment

⭐ Recorded **here, in the passage census — NOT as an S3 repair**:

> Canonical Focus advertises a `passage` scope whose positive path is
> structurally unreachable.

That is a genuine defect/fidelity issue in Focus, ⛔ **and it must not be silently
repaired while fixing developmental Ask.**

Any future passage acceptance test must satisfy the ratified testing law:

```text
known lawful passage implementation    → GREEN
wrong passage / substituted passage    → RED
```

⛔ **Until a lawful positive implementation exists, there is no legitimate
positive passage acceptance test to write.**

### Census sequence CLOSED

⭐ Founder act: the census sequence stops here. Enough is now known about the
authority model to return to the actual S3 design problem.

---

## Standing

```text
#1279 AUTHORITY CENSUS      OPEN · Class C
#1280 LOAD-SCOPE CENSUS     OPEN · Class C
PASSAGE-IDENTITY CENSUS     COMPLETE · this record · Class C PR

Q4 FRESHNESS                CLOSED
Q6 PASSAGE                  RESOLVED AS NOT IMPLEMENTED
                            future identity design required

CENSUS SEQUENCE             CLOSED

S3 DEFECT                   CONFIRMED
S3 IMPLEMENTATION           STILL NOT AUTHORIZED
S3 SCOPE VOCABULARY         whole_work · section only
                            ⛔ passage NOT AVAILABLE AS AUTHORITY

POSITIVE PASSAGE TESTS      NOT YET POSSIBLE
CANONICAL PASSAGE PATH      unreachable · recorded here · ⛔ not repaired here
FOCUS ASSEMBLER CUSTODY     separate dependency · unmerged
LOADER CUSTODY              recorded observation · no repair

A / C                       HELD
#1277 D9                    UNTOUCHED · DRAFT
FOCUS WITNESS               UNSPENT
PRODUCTION                  UNTOUCHED
```

⭐ *"passage" currently exists as vocabulary in Focus, not yet as authority. That
is much safer to admit than to make the implementation catch up to the word by
accident.*
