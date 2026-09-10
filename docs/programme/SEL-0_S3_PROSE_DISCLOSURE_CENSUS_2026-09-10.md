# SEL-0 · S3 — an ungoverned prose→cognition crossing

```text
SUBJECT          canonical 5f65038d2
METHOD           read-only census · no fixes · no execution
CLASSIFICATION   S3 — PROSE → COGNITION, UNGOVERNED
STATUS           finding recorded · remediation authorized as a separate lane
D9 / PR #1277    INDEPENDENT — this finding does not enter that scope
```

---

## 1 · The question, and why it was asked this way

> Can member-authored characters reach model cognition through SEL-0 or any
> downstream consumer without fresh canonical disclosure authority?

Deliberately **not** *"does it use Focus"* — that phrasing pre-loads its own
answer and would have classified a lawful structure-only path as a violation for
lacking a mechanism it does not need. The census traces **characters**.

```text
S0  no authored characters — structure / identifiers / position / derived
S1  prose loaded, never cognition-bound
S2  prose → cognition, governed by fresh canonical disclosure authority
S3  prose → cognition, ungoverned                    ← the constitutional finding
```

---

## 2 · ⭐⭐ THE EPISTEMIC CORRECTION, PRESERVED

**This section is evidence, not an apology.** A previous census reported a claim
that was false, and a ruling was softened on the strength of it. Recording only
the corrected conclusion would delete the mechanism by which the error occurred —
which is the part with future value.

```text
EARLIER FINDING (reported, believed, wrong)
  "/ask does not disclose authored prose. Bodies are emptied, askReader sends
   no tools, the route header states ZERO BODY READS. What crosses is headings
   plus MAIA's prior reading."

CONSEQUENCE
  Amendment 4b was softened from a PRESENT violation to a PROSPECTIVE rule:
  "whenever Ask comes to need authored characters…" — on the belief that it
  did not presently need them.

SUPERSEDED BY
  The route contains TWO handlers. Every fact above describes the structure /
  heading handler and is true of it. The developmental observation handler
  loads, recovers and interpolates authored prose.

STATUS
  The founder's original premise was correct. The correction was not.
```

### How the error was made

Three sources agreed, and all three were scoped to the wrong handler:

```text
route.ts:18                "ZERO BODY READS. No section prose is loaded, sent,
                            or storable here."          ← module-level comment
frozenReading.ts:185       heads.map(h => ({ ...h, body: '' }))
askReader.ts:6             "there is no path by which a body reaches the model"
```

⛔ **A module-level comment asserting an invariant the module no longer holds is
worse than no comment.** `loadRevisionContent` is imported at line 42 of the same
file and called at line 415. The comment was read as a property of the route; it
is at best a property of one handler in it, and nothing marks the boundary.

⭐ **The general lesson, which outlives this finding:** a census that reads
documentation and stops has read a claim, not a system. The correction came only
from tracing the call graph to the interpolation site. *Prose about a boundary is
not the boundary.*

---

## 3 · The path, as traced

```text
POST /api/sovereign/manuscripts/[id]/ask      developmental observation anchor

  getMemberIdFromRequest                      authenticated identity
  loadFrozenDevelopmentalReading(…, memberId) Work ownership
  checkObservationAnchor                      the anchor names a real observation
        │
        │   ⛔ no disclosure authority anywhere above this line
        ▼
  loadRevisionContent(draftId, revisionNumber)          Q1 · PROSE LOADS
        ▼
  assembleDevelopmentalContext                          Q2 · CARRIED
     recoverEvidence → revisionContent.slice(start,end)      the member's characters
        ▼
  askMaiaDevelopmental(ctx, history, question)
     evidenceSays:
       `[${kind}] in ${section}, exactly as you read it:\n    ${r.text}`
        ▼                                               Q3 · INTO THE PROMPT
     the model
```

### The five questions

```text
Q1  where can authored characters first be loaded?
      capture.loadRevisionContent — route.ts:415

Q2  which functions carry them forward?
      assembleDevelopmentalContext → recoverEvidence → EvidenceView.recovered.text

Q3  where are they interpolated into model context?
      developmentalAskReader.ts:109, evidenceSays()

Q4  what authority exists BEFORE the first authored character loads?
      identity + Work ownership. NOTHING ELSE.
      grep for may_cross | context_disclosure_receipts | performFocusCrossing
      across lib/manuscript/** and app/api/sovereign/manuscripts/** → EMPTY

Q5  can a body-denied path still cause that load?
      The load is unconditional on this handler.
      ⭐ requirementOf / isStructural — the body-vs-structure classifier this
      lane's law is built on — IS NEVER CALLED IN THIS ROUTE.
      The classification exists. Nothing consults it here.
```

---

## 4 · ⭐ WHAT IS GENUINELY GOVERNED — and must not be flattened into the finding

Real constraints exist on this path. Reporting the S3 without them would
overstate it, and overstatement is its own failure:

```text
digest verification    recoverEvidence verifies the frozen digest before slicing;
                       a wrong or moved revision yields refusal, never substitution
unverifiable evidence  surfaces as COULD NOT BE VERIFIED — the text is withheld
                       rather than reconstructed
prompt discipline      MAIA is told she has not looked again, may not reconstruct
                       unseen prose, and may not treat her own observation as its
                       own evidence
```

⭐ **These govern FIDELITY, not DISCLOSURE.** They guarantee that the characters
shown are the ones actually read. They establish nothing about whether the member
authorized those characters to cross into cognition. *A faithful copy of
unauthorized material is still unauthorized.*

---

## 5 · What is lawful, and must not be dragged behind Focus

```text
headings · structure · position    → no prose authority required
                                     no receipt manufactured
authored body characters           → fresh canonical authority required
                                     only then may prose load
```

The structure/heading handler is lawful **under the very law this finding
invokes** and is not part of the defect. Requiring authority for headings would
turn a disclosure boundary into a generic MAIA-interaction permission system —
receipts written because MAIA was asked something, rather than because
member-authored material crossed.

---

## 6 · The repair seam — recorded, NOT implemented here

```text
authenticated identity
      ↓
Work ownership
      ↓
resolve evidence requirement  WITHOUT loading prose
      ↓
requirementOf(ref)
      ├── structure / position → existing lawful path, no receipt manufactured
      └── body
             ↓  establish FRESH canonical disclosure authority
             ↓  perform the canonical crossing / evidence
             ↓  loadRevisionContent          ⛔ never reached without authority
             ↓  recoverEvidence
             ↓  assembleDevelopmentalContext  ⭐ REMAINS PURE
             ↓  cognition
```

⛔ Authorization logic does not enter `assembleDevelopmentalContext`. An
assembler that authorizes is an assembler that can be asked to authorize.

### ⭐⭐ THE FOUR RESULT STATES — ratified 2026-09-10

The repair must keep these distinct. Collapsing any two is the defect wearing a
fix's clothes.

```text
STRUCTURE_SUFFICIENT
    no prose load · answer normally · no prose-disclosure receipt

BODY_AUTHORITY_REQUIRED
    body necessary · authority absent · no prose load
    ⛔ and no model answer pretending completion

BODY_AUTHORIZED
    fresh authority established · prose may load · verification proceeds
    cognition may receive authorized characters

BODY_UNVERIFIABLE
    authority EXISTED · the requested evidence cannot be faithfully recovered
```

⛔ **`COULD NOT BE VERIFIED` IS RESERVED FOR VERIFICATION FAILURE.** The path
today has exactly one shape for absent evidence, and the cheapest possible repair
is to route an unauthorized crossing into it. That would make these
indistinguishable to the writer:

```text
UNAUTHORIZED   "I was not permitted to read the required prose."
UNVERIFIABLE   "I was permitted, but could not recover or verify it."
```

⭐ *Authorization answers "may I read it?". Verification answers "is this actually
the material I claim it is?". Neither substitutes for the other, and a system
that reports one as the other has told the member something false about their own
boundary.*

⛔ **AND SILENT DEGRADATION IS PROHIBITED.** If `requirementOf` says body is
required, answering anyway from the observation alone hollows out the word
*required*. The absence of prose must change the RESULT, not merely the quality
of the answer.

### What the writer experiences — ruled

Not an error page. Not a trip to Focus. Not a mysterious refusal.

```text
writer asks
    ↓
MAIA discovers prose is actually needed
    ↓
MAIA names the boundary, in place, in WRITE
    "I need to read the relevant passage to answer that faithfully."
    ⛔⛔ SUPERSEDED 2026-09-10 by founder ruling. The lawful exemplar is:
    "I need to read the relevant SECTION to answer that faithfully."
    — and "sections", plural, where several are genuinely required.

    SUPERSEDED because passage authority was subsequently established to be
    unimplemented (S3_PASSAGE_IDENTITY_CENSUS_2026-09-10.md, Q6 disposition).
    The writer-facing language must name the actual scope being authorized.

    ⭐ The original sentence is kept verbatim above, not deleted: it WAS
    ratified, and pretending otherwise would erase the epistemic history
    rather than record the correction.
    ↓
the native one-act disclosure gesture for THIS question / THIS crossing
    ↓
writer permits it, or declines and Ask ends there — nothing loads
    ↓
the writer never leaves the Work
```

⛔ No generic permission system. No Focus destination. No reusable session
authority. The gesture is scoped to the crossing that provoked it.

### Falsifiers (ratified, not yet built)

Each must be shown **red against the known S3 behaviour** and **green against the
repair** — a regression test is evidence only if the defective implementation
fails it.

```text
F1  body required + no authority
      · loadRevisionContent is never called
      · authored characters never enter cognition
      · the result is BODY_AUTHORITY_REQUIRED
      · ⛔ it cannot masquerade as evidence-recovery failure
      · no completed-crossing receipt is created
F2  structure / heading evidence     → prose never loads; no prose receipt minted
F3  fresh lawful authority           → body may load; characters may cross
F4  old receipt present              → cannot authorize a NEW load
F5  failed / stale / invalid auth    → cannot degrade to ownership-only disclosure
F6  digest verification failure      → authored text does not enter cognition
F7  passage authority                → cannot silently broaden into section
    ⛔ SUPERSEDED FOR THE S3 LANE 2026-09-10. Not a live S3 acceptance
    obligation: passage is not implementable authority, so no positive
    passage implementation exists for this falsifier to be red against.
    History retained, never deleted.
    LIVE REPLACEMENT — the section-bound W2 obligation:
      section S authorized → characters derived from S may enter W2
      characters outside S → zero authority to enter cognition
      wider W1 integrity retrieval → does NOT widen W2 authority
    (see S3_LOAD_SCOPE_CENSUS F7-D and S3-DESIGN-01 §9)
```

⛔ **The remediation is not complete because the Focus function appears in the
route.** Presence is not order, and order is the whole law here.

---

## 7 · The stale doctrine is repaired WITH the behaviour, not instead of it

`"ZERO BODY READS"` cannot stand as a module-level truth over a file containing a
body-reading handler. But deleting the comment repairs nothing — the defect is
the behaviour beneath it. Once the behaviour is lawful, the documentation is
narrowed to distinguish the two paths truthfully.

⭐ The comment is retained here as evidence of how a census was misled.

---

## 8 · What this finding does NOT decide

```text
A / C            HELD. S3 establishes that Ask's body-capable path needs
                 canonical authority. It does not choose the implementation.
D9 / PR #1277    scope frozen. This is a disclosure-architecture defect, not a
                 WRITE-layout question, and must not retroactively expand it.
FOCUS WITNESS    UNSPENT.
PRODUCTION       UNTOUCHED.
```

⛔ The seriousness of an S3 is not an argument for choosing a geometry quickly.

---

## 9 · Standing

```text
SEL-0 CENSUS             COMPLETE
CLASSIFICATION           S3 CONFIRMED · present defect, not prospective
SUBJECT                  canonical 5f65038d2
ASK structure path       LAWFUL · retain · do not place behind Focus
ASK body-capable path    PRESENT DEFECT
REMEDIATION              AUTHORIZED — separate Class B lane, canonical subject
AUTHORITY                MUST precede the first prose load
ASSEMBLER                REMAINS PURE
RECEIPT                  evidence of a completed crossing, never reusable authority
F1 MEMBER EXPERIENCE     in-place AUTHORITY REQUIRED · never leaves the Work
SILENT DEGRADATION       PROHIBITED
COULD NOT BE VERIFIED    RESERVED for verification failure
FIXES IN THIS ACT        NONE
```
