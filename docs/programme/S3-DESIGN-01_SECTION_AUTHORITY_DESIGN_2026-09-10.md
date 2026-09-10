# S3-DESIGN-01 · section-scoped disclosure authority for developmental Ask

```text
SUBJECT     canonical 7fa29678e
MODE        DESIGN ONLY · no implementation · no fixtures · no tests
            no migration · no production
TARGET      How does developmental Ask obtain FRESH, IN-PLACE, SECTION-SCOPED
            disclosure authority when — and only when — body evidence is
            actually required?
AUTHORIZED  founder, 2026-09-10, after #1278–#1281 landed on canonical
```

⛔ **Nothing in this document is settled by appearing in it.** Each question
carries its dispositions and its unresolved remainder separately, and the
unresolved remainder is the point.

---

## 0 · THE STATE MACHINE (ruled, not designed here)

```text
ASK REQUEST
    ↓ authenticate member
    ↓ establish Work ownership
    ↓ resolve developmental evidence requirement  ⭐ WITHOUT loading prose
    ↓
STRUCTURE / POSITION SUFFICIENT
    → existing lawful Ask path · no disclosure authority · no prose receipt
BODY REQUIRED
    ↓ identify containing SECTION, without reading body
    ↓
no fresh authority?
    → BODY_AUTHORITY_REQUIRED
    → writer remains in WRITE · ⛔ no loadRevisionContent · ⛔ no receipt
    ↓
writer authorizes THIS crossing
    ↓ fresh section-scoped authority established
    ↓ may_cross
    ↓ trusted retrieval required for verification            (W1)
    ↓ recover only needed evidence
    ↓ ONLY authorized section-derived characters reach       (W2)
    ↓ cognition
    ↓ receipt proves the completed crossing · ⛔ authorizes no other
```

### ⭐⭐ THE PENDING ASK — what it may and may not contain

```text
MAY      enough NON-PROSE information to resume this question
MAY NOT  may_cross
         reusable consent
         authored characters
         an authority-bearing receipt
```

```text
PENDING ASK IDENTITY     "this authorization gesture belongs to the Ask that
                          just paused"
DISCLOSURE AUTHORITY     "the member presently permits section S to cross for
                          this act"
```

⭐ The first may survive the gap. **The second is minted fresh inside the
resumed server invocation, or it does not exist.**

### `BODY_AUTHORITY_REQUIRED` is a protocol state, not an error

```text
✅  ASK → body needed → pause → member act → NEW invocation
                     → fresh section authority → load
⛔  ASK → error → retry with permission token
```

---

## Q1 · WHAT COMES BACK ON `BODY_AUTHORITY_REQUIRED`

**CANONICAL FACT.** `developmentalTurn` returns
`{ threadId, thread, staleness, location, observation:{ key, lens, frozenAt,
unverifiableEvidence } }`. Refusals return `{ refusal, detail }` at 4xx via
`ANCHOR_STATUS`. ⭐ **The author's question is already appended to the thread
BEFORE the model is called** — the ratified ordering *"a transport failure loses
the answer and never the question."* A pause after that append therefore already
leaves the question recorded, which is the shape a pending Ask needs.

**DESIGN REQUIREMENT.** Enough for the native Ask UI to offer the disclosure act.
No authority. No authored characters. Not a reusable authorization object.

**CANDIDATE SHAPES.**

```text
(a)  { result:'BODY_AUTHORITY_REQUIRED', threadId, workRef, sectionRef }
     names the section by id only
(b)  { result:'BODY_AUTHORITY_REQUIRED', threadId }
     the server recomputes the requirement on resume; the client learns nothing
(c)  (a) plus a member-recognisable label for each section
```

⭐ **(a) is consistent with receipt law.** `sectionRef` is refused only for
non-section scope; under `section` scope it is the admitted identity. Q6's
prohibition does not reach here.

**UNRESOLVED.** ⚠️ **Does (c) disclose prose?** A heading is authored characters.
A member asked to authorize "section 7f3a…" is being asked to consent to
something they cannot recognise; a member shown the heading has been shown their
own writing before authorizing. ⛔ **Not decided.** The question is whether a
heading the member authored, returned to that same member, is a disclosure at all
— and whether that answer changes when the surface is untrusted.

**FAILURE CONDITION.**

```text
the response alone is sufficient to cause a later load        → it is authority
it carries authored characters beyond what consent requires   → it is disclosure
```

### ⭐ DISPOSITION — founder, 2026-09-10

**A heading IS authored disclosure. It is NOT body disclosure.** Calling a
heading "structure" does not make its characters cease to be authored material,
and the design must stop describing headings as "no authored characters" — ⛔
that is simply false.

```text
STRUCTURAL METADATA   ids · positions · ordering
                      → NOT authored-character disclosure

AUTHORED STRUCTURE    member-written headings
                      → disclosure of authored characters
                      → DISTINCT from body disclosure

AUTHORED BODY         section / passage prose
                      → canonical body-disclosure authority required
```

⛔ **Do not manufacture a section-body receipt merely because MAIA sees a
heading.** ⛔ And do not keep calling heading text characterless.

⭐ **PARKED, NOT SOLVED HERE.** Q1 exposes a separate governance question about
authored structural labels. It does not widen S3-DESIGN-01 into answering it.

---

## Q2 · WHAT CONSTITUTES THE MEMBER'S ACT

**CANONICAL FACT.** `DisclosureGesture` is `ask_maia | work_with_this |
widen_focus`. `requireConsentState` verifies **posture** (Sanctuary), never
scope. ⛔ **No Ask-side disclosure gesture exists**, and `/api/writers-studio/
focus` has no client anywhere in the repository.

**DESIGN REQUIREMENT.** One act, scoped to the crossing that provoked it, native
to WRITE. ⛔ Not a Focus destination. ⛔ Not a persistent permission toggle. ⛔ No
generic permission system.

**CANDIDATE SHAPES.**

```text
(a)  reuse `ask_maia`
     ⚠️ gesture describes the member's act, and this is a different act
(b)  a new gesture value for the union AND the CHECK constraint
     ⚠️ schema change → Class B, and possibly outside S3
(c)  gesture stays `ask_maia`; the act is carried by a distinct verb/route
```

**UNRESOLVED.** ⚠️ Whether widening `DisclosureGesture` is inside S3's mandate or
is itself a separate lane. The gesture vocabulary is a constitutional record of
*what the member did*, and adding to it is not a refactor.

**FAILURE CONDITION.**

```text
the act creates permission that outlives the crossing         → reusable consent
the act is a setting rather than an act                       → toggle
the act happens somewhere other than the Work                 → destination
```

### ⭐ DISPOSITION — founder, 2026-09-10

**S3 MAY widen `DisclosureGesture`, narrowly** — by the one act necessary to
represent *"I authorize MAIA to read section S for this Ask."* That is squarely
inside the defect being repaired.

```text
one new truthful section-authorization act   IN SCOPE
generic consent framework                    OUT
persistent permission                        OUT
passage gesture                              OUT
heading-governance redesign                  OUT
```

⛔ The change may not be used to generalize `DisclosureGesture` into a permission
framework, add passage semantics, or alter unrelated disclosure classes.

---

## Q3 · HOW THE RESUMED ASK BINDS TO THE ORIGINAL

**CANONICAL FACT.** `ask_threads` is durable and member-gated
(`loadThread(threadId, memberId)`); `threadId` already travels to the client on
every turn. ⭐ **A resumption precedent already exists**: `isHeldRetry(priorTurns,
question)` — a retry of a held question reuses the turn it is retrying rather
than appending twice. The system already knows how to continue a paused Ask
without duplicating the member's words.

**DESIGN REQUIREMENT.** The resumed invocation establishes fresh authority
itself, while proving continuity with **this** unfinished encounter.

**CANDIDATE SHAPES.**

```text
(a)  threadId as the pending identity; the resume carries
     { threadId, authorizeSection: S }; the server re-reads the anchor and
     RE-DERIVES the requirement rather than trusting the client's account of it
(b)  a dedicated pending-ask row  ⚠️ schema change; and a durable row that
     names a section starts to look like a standing permission
(c)  no pending object at all — the resume is the same Ask repeated with the
     authorization act attached, and the server re-derives everything
```

⭐ **(a) and (c) share the property that matters**: the server never trusts the
client's claim that body was required. **Re-derivation is what makes the pending
identity safe to be non-authoritative** — it carries nothing the server would
otherwise have to believe.

**UNRESOLVED.** ⚠️ Whether the authorization act may travel as a field on an
ordinary Ask request (c) or requires its own verb (a). ⚠️ And whether a durable
pending row (b) can exist without becoming the reusable consent the law forbids.

**FAILURE CONDITION.**

```text
"I once authorized section 4, therefore any later Ask may read section 4"
the client hands the server a may_cross
authorization is looked up from a prior request rather than performed now
```

### ⭐ DISPOSITION — founder, 2026-09-10

**Own protocol verb. Same route is fine.** ⛔ Authorization must NOT be a
Boolean-ish field on an ordinary Ask:

```text
ask({ ..., allowBody: true })   ⛔ too easy to treat as client-supplied authority
```

The resumed request is a **distinct discriminated act**:

```text
ordinary Ask
BODY_AUTHORITY_REQUIRED
explicit AUTHORIZE_SECTION_AND_RESUME act
```

The client supplies the pending-Ask identity and the member's explicit gesture.
⛔ **The client never submits `may_cross`.** ⭐ This gives the authorization act
semantic weight without creating another UI destination.

---

## Q4 · WHERE EXACTLY IS THE GATE

**CANONICAL FACT.** `route.ts:415` calls `loadRevisionContent` **unconditionally**,
before `assembleDevelopmentalContext`. ⭐⭐ **And the assembler already tolerates
`revisionContent === null`** — it yields `revision_content_required`
"unverifiable" evidence and tells MAIA the evidence could not be verified.

⛔ **That tolerance is the trap.** Passing `null` because authority is absent
routes an unauthorized crossing into the *verification-failure* shape, which is
exactly the collapse SEL-0 prohibits:

```text
UNAUTHORIZED   "I was not permitted to read the required prose."
UNVERIFIABLE   "I was permitted, but could not recover or verify it."
```

⭐ **The cheapest possible repair is the prohibited one.** Naming that here is
the point of asking Q4 before writing code.

**CANONICAL FACT — the good one.** The requirement and the containing section are
both derivable **without prose**: `requirementOf(ref)` returns
`body | position | structure` from the ref's kind alone, and `sectionIdsOf(ref)`
returns the section ids. `readState.sections` holds ranges and digests, ⛔ never
text. **Section identification without reading body is already possible on
canonical.**

**DESIGN REQUIREMENT.**

```text
BODY REQUIRED + no may_cross   →   loadRevisionContent is UNREACHABLE
```

Authorization completes before that call. ⭐ `assembleDevelopmentalContext`
remains **pure** — an assembler that authorizes is an assembler that can be asked
to authorize.

**CANDIDATE SHAPES.**

```text
(a)  decide before loading: requirementOf over the observation's refs;
     any 'body' + no authority → return BODY_AUTHORITY_REQUIRED and never
     call the loader
(b)  make the loader itself require an authorization-typed argument, so the
     call is unconstructible without one
```

⭐ (b) is the stronger shape by the standard the repaired assembler already
states — *"ownership is part of the read, not a separate check a later edit could
drop"* — but it changes a function two lanes call. **NOT SELECTED.**

**UNRESOLVED.** ⚠️ Whether the gate is a route-level decision (a) or a type-level
one (b), and whether (b) can be done without widening S3 into `commission.ts`.

**FAILURE CONDITION.**

```text
null revisionContent reaches the assembler because authority was absent
    → BODY_AUTHORITY_REQUIRED masquerades as BODY_UNVERIFIABLE
the answer degrades in quality instead of changing RESULT
    → silent degradation; the word "required" is hollow
```

### ⭐ DISPOSITION — founder, 2026-09-10

**BOTH, with different jobs. Route/protocol level DECIDES. Type level PREVENTS
accidental bypass.**

The route must make this path impossible:

```text
BODY REQUIRED → no authority → revisionContent = null
              → assembler says "unverifiable"        ⛔
```

The lawful control flow:

```text
BODY REQUIRED → no may_cross → BODY_AUTHORITY_REQUIRED → RETURN
                               loadRevisionContent is UNREACHABLE
```

Then the type/capability seam so the authorized body-loading path cannot casually
be called without the result of the disclosure boundary.

⭐⭐ **AND ONE DISTINCTION PRESERVED:** `revisionContent === null` MAY continue to
mean *verification/recovery unavailable* where that is legitimate. ⛔ **It must
never be reused to mean authorization absent.** That reuse is the silent
degradation this design found.

---

## Q5 · WHAT SECTION AUTHORITY PERMITS AT W2

**STATED POSITIVELY, as ruled:**

> Once section S is authorized, the resumed invocation **may disclose authored
> characters derived from S at W2**; authored characters belonging outside S have
> **no authority to enter cognition**.

**CANONICAL FACT.** `ctx.evidence` is built per `EvidenceRef` via
`recoverEvidence`; `sectionIdsOf(ref)` names each ref's sections. W1 may be the
whole revision where integrity requires it — ratified in the load-scope census —
and `recoverEvidence` digest-verifies before yielding a character.

```text
member authorizes SECTION S
W1   may retrieve the integrity envelope technically required
W2   may expose authored characters from S ONLY
     characters from any other section have ZERO disclosure authority
```

**CANDIDATE SHAPES.**

```text
(a)  filter refs to the authorized section set before recovery
(b)  refuse the whole turn if any ref lies outside the authorized set
```

⚠️ These differ in what the member experiences: (a) answers partially from what
was authorized; (b) makes the member authorize everything the observation rests
on, or nothing.

**UNRESOLVED.** ⚠️ **An observation whose evidence spans several sections.** Does
the member authorize each section, one act per section, or is the disclosure act
plural by nature? ⛔ Undecided, and it decides the gesture's shape in Q2. ⚠️ And
under (a), an answer built on a strict subset of the observation's evidence must
say so — a partial answer presented as complete is silent degradation wearing
consent's clothes.

**FAILURE CONDITION.**

```text
authority for S admits a ref belonging to another section
a multi-section observation is answered as though one authorization covered it
```

### ⭐ DISPOSITION — founder, 2026-09-10

**ALL-OR-NONE at the answer contract.** If answering faithfully requires authored
body evidence from sections A, B and C, the member must authorize A, B and C
before that answer proceeds.

```text
needed A+B+C · authorized A · quietly answer from A anyway   ⛔ PROHIBITED
```

That would turn *required* back into *nice to have*.

⭐ The member MAY decline some sections — but the original body-required Ask
cannot then silently continue as though complete. **A narrower answer is lawful
only if the system explicitly RE-RESOLVES the question's evidence requirement and
can truthfully establish that the narrower answer no longer requires the denied
sections.** That is a newly bounded answer, ⛔ not degradation.

⚠️ This is all-or-none **at the answer contract** — ⛔ NOT a ruling that the
implementation needs one giant multi-section authority object.

---

## Q6 · THE IDENTITY OF THE PENDING ASK ENCOUNTER

**CANONICAL FACT.** Three identifiers already exist, with different lifetimes:

```text
threadId      DURABLE · member-gated · already travels to the client
requestId     per-invocation UUID, minted server-side
disclosureId  per-member-act UUID, minted server-side, never reused
may_cross     IN-MEMORY ONLY · cannot be persisted or reconstructed  (Q4 ruling)
```

⭐ Because Q4 forbids inventing a durable authority artefact, **a pending-Ask
identity is the only thing permitted to survive the gap** — which is precisely
why it must be constitutionally distinct from authority rather than a weaker
form of it.

**CANDIDATE SHAPES.**

```text
(a)  threadId alone
(b)  threadId + the anchor, both re-verified server-side against member custody
(c)  a new short-lived pending identifier
```

**UNRESOLVED.** ⚠️ **Does the pending identity need to expire?** It is not
authority, so Q4's freshness law does not reach it, and a TTL would be a UX
choice rather than a constitutional one. ⚠️ **But** an indefinite pending
identity plus a standing "authorize section" field is how a reusable permission
gets built by accident. The safeguard may be re-derivation (Q3) rather than
expiry — ⛔ not decided.

**FAILURE CONDITION.**

```text
the pending id, presented again, causes a load without a NEW member act
the pending id encodes which section may be read, and is treated as saying it may
```

### ⭐ DISPOSITION — founder, 2026-09-10

**YES, it expires.** Unlike `may_cross`, its lifetime need not be one stack frame,
because its purpose is specifically to bridge the pause. It must be:

```text
non-authoritative · single-purpose · single-use
member-bound · Work-bound · Ask-bound
invalidatable · bounded in lifetime
```

⭐⭐ **Expiry of pending identity is CONTINUITY HYGIENE, not disclosure-authority
freshness.** ⛔ Do not give it authority semantics simply because it expires.

It ceases to resume the encounter after completion or cancellation, and a
material change that makes the original Ask identity unreliable invalidates it.
⛔ **The exact TTL, if any, is implementation detail — do not invent one
constitutionally just to have a number.**

---

## 7 · A / C — THE CONTRACT, AND WHY NO COMPARISON IS OFFERED

⛔ **A and C are not defined in any record on canonical `7fa29678e`.** Searched:
`docs/`, `app/`, `lib/`. The only surviving reference is
`SEL-0_S3_PROSE_DISCLOSURE_CENSUS_2026-09-10.md:295` — *"A / C HELD. S3
establishes that Ask's body-capable path needs canonical authority. It does not
choose the implementation."* — which records the hold without stating what is
held.

⭐ **Comparing them from memory would be exactly the failure this lane exists to
prevent**: a claim whose subject is not attributable. Their definitions are owed
before any comparison is written down.

**What Q1–Q6 establish that ANY geometry must satisfy** — this is the useful half,
and it does not depend on their names:

```text
G1  BODY_AUTHORITY_REQUIRED is reachable and distinguishable from
    BODY_UNVERIFIABLE at the surface, not merely in the server
G2  the member's authorizing act is scoped to ONE crossing and creates no
    standing permission
G3  the pending encounter is resumable WITHOUT carrying authority
G4  the resumed invocation re-derives the requirement rather than trusting
    the client's account of it
G5  authority is minted inside the resumed invocation, never transported
G6  the writer never leaves the Work to perform the act
G7  a multi-section observation has a defined answer (Q5), not an emergent one
G8  the language of the act names SECTION, because section is what is authorized
```

⭐ **G8 is the one most likely to be lost**, and §8 shows it already has been.

### ⭐ DISPOSITION — founder, 2026-09-10 · LABELS HELD

The refusal to compare undefined alternatives is upheld. **A label preserved only
as "A/C held" is not enough provenance to reconstruct what the candidates meant.**
⛔ Do not compare them from conversational memory.

In the next design revision: either **recover attributable definitions from a
governed source**, or **retire the opaque labels and define the actual candidate
protocols explicitly** — then compare those concrete candidates against G1–G8 and
Q1–Q6.

---

## 8 · ⚠️ A CONFLICT FOUND IN RATIFIED COPY

The SEL-0 census ratified the writer's experience in these words:

> *"I need to read the relevant **passage** to answer that faithfully."*

⛔ **That sentence now conflicts with the Q6 disposition.** `passage` is not
available as authority; the act being requested is authorization of a **section**.
Copy that says *passage* while the boundary establishes *section* is the exact
shape ruled prohibited — nominal passage semantics over section authority.

⭐ **Reported, not rewritten.** The wording was ratified before the passage-
identity census existed, and repairing ratified copy is a founder act, not a
design decision. **The design proceeds on `section`; the sentence needs a ruling.**

### ⭐ DISPOSITION — founder, 2026-09-10 · SUPERSEDED

```text
OLD EXEMPLAR   "I need to read the relevant PASSAGE to answer that faithfully."
LAWFUL         "I need to read the relevant SECTION to answer that faithfully."
```

Where several sections are genuinely required, the surface names **sections,
plural**.

```text
SUPERSEDED because passage authority was subsequently established to be
unimplemented.

The writer-facing language must name the actual scope being authorized.
```

⭐ **Superseded, NOT deleted.** The reason is recorded so the epistemic history
survives, rather than pretending the earlier sentence was never ratified. The
supersession is marked in place in
`SEL-0_S3_PROSE_DISCLOSURE_CENSUS_2026-09-10.md`.

---

## 9 · WHAT THIS DOES TO F1–F7

```text
F1  UNCHANGED and now precisely specified by Q4 — the null-tolerance of the
    assembler is the exact mechanism by which F1 would be violated
F2  UNCHANGED
F3  UNCHANGED — "fresh lawful authority" is Q6's second column
F4  UNCHANGED
F5  restated by the authority census as F5-A…F5-E (structural properties)
F6  UNCHANGED
F7  ⚠️ SUPERSEDED FOR THIS LANE — ruled 2026-09-10. "passage authority cannot
    silently broaden into section" is not a live S3 acceptance obligation while
    passage is not implementable authority. ⛔ Its history is NOT deleted.
```

### ⭐ THE LIVE S3 W2 BOUNDARY — ruled 2026-09-10

```text
SECTION S authorized
        ↓
characters derived from S may enter W2

characters belonging outside S
        ↓
ZERO authority to enter cognition

wider W1 integrity retrieval
        ↓
does NOT widen W2 authority
```

⭐ That is testable once test authoring opens. ⛔ **No falsifier is authored
here.**

---

## 10 · THE RESUMED-ASK PROTOCOL — concrete, end to end

⛔ **Protocol design, not implementation.** Names below are design vocabulary;
nothing here is a committed signature, a schema, or a migration.

### 10.1 · The three acts

```text
ACT 1   ASK                            ordinary developmental Ask
ACT 2   BODY_AUTHORITY_REQUIRED        server → client · a protocol STATE
ACT 3   AUTHORIZE_SECTIONS_AND_RESUME  client → server · a DISTINCT verb
```

⭐ Act 2 is not a failure and not an error status. It is a lawful intermediate
state of the Ask protocol, and Act 3 is its only continuation.

### 10.2 · ACT 1 — the ordinary Ask, to the decision point

```text
POST  /api/sovereign/manuscripts/[id]/ask
      { anchor: { on:'observation', readingId, observationKey }, question }

  1  resolveMember                     existing
  2  memberOwnsWork                    existing
  3  loadFrozenDevelopmentalReading    existing · member-gated SELECT
  4  checkObservationAnchor            existing
  5  canonicalFingerprint              existing
  6  openThread / reuse existing       existing · question appended BEFORE
                                       any model call (ratified ordering)
  7  ⭐ RESOLVE EVIDENCE REQUIREMENT — WITHOUT PROSE
        requirementOf(ref) over observation.evidenceRefs
        sectionIdsOf(ref)  → the containing section id(s)
        readState.sections → ranges + digests, ⛔ never text
```

⭐⭐ **Step 7 is the whole repair's hinge**, and canonical already supports it:
the requirement and the sections are both derivable from ref kinds and frozen
state. ⛔ **`loadRevisionContent` has not been called and is not reachable from
here.**

```text
IF no ref requires 'body'
    → STRUCTURE_SUFFICIENT
    → existing lawful path · answer normally
    → ⛔ no disclosure boundary · ⛔ no prose receipt

IF any ref requires 'body'
    → this invocation holds no may_cross (it minted none)
    → ⭐ ACT 2
```

### 10.3 · ACT 2 — `BODY_AUTHORITY_REQUIRED`

```text
{ result: 'BODY_AUTHORITY_REQUIRED',
  threadId,                      the question is already on the thread
  pendingAskRef,                 ⭐ NON-AUTHORITATIVE · see 10.6
  workRef,
  sections: [ sectionId, … ]     ⭐ ALL sections whose body is required
}
```

⛔ **What this response is not.** It cannot cause a load. It carries no
`may_cross`, no receipt, no consent record, and no body characters. Presented
again unchanged, it does nothing.

⚠️ **Open (Q1, parked):** whether the surface may show the member their own
headings to make the act recognisable. Headings ARE authored characters — ruled —
and are not body disclosure — also ruled. **The protocol does not resolve this;
it must not silently assume either answer.** Until it is ruled, `sections`
carries ids.

⭐ **All required sections are named at once**, because Q5 is all-or-none at the
answer contract: a member cannot make an informed act about a partial set.

**Writer-facing (ruled):** *"I need to read the relevant section to answer that
faithfully"* — sections, plural, where several are required. ⛔ Never "passage".

**Then the writer either authorizes, or declines and the Ask ends there —
nothing loads.** ⛔ No Focus destination. ⛔ The writer never leaves the Work.

### 10.4 · ACT 3 — `AUTHORIZE_SECTIONS_AND_RESUME`

```text
POST  (same route, distinct discriminated act)
      { act: 'authorize_sections_and_resume',
        pendingAskRef,
        authorizes: [ sectionId, … ],   ⭐ the member's explicit act
        gesture: <the one new S3 gesture> }
```

⛔ **The client never submits `may_cross`.** ⛔ No `allowBody: true` on an
ordinary Ask.

The server, in this invocation:

```text
 1  resolveMember
 2  RE-IDENTIFY the pending Ask from pendingAskRef
       member-bound · Work-bound · Ask-bound · single-use · unexpired
 3  ⭐ RE-DERIVE the body requirement and the section set
       from the reading and the anchor — ⛔ NEVER from the client's account
 4  compare  authorizes ⊇ required-sections ?
       NO  → the answer does not proceed as claimed (10.5)
 5  recognise the explicit member gesture
 6  establishDisclosureBoundary
       sourceRef = workRef · scopeKind = 'section' · sectionRef = S
       ⭐ one boundary per authorized section (sectionRef is singular, and is
         admitted ONLY under section scope — receipt law, unchanged)
 7  mayCrossBoundary → may_cross, minted IN THIS INVOCATION
 8  ⭐ ONLY NOW is prose reachable
       W1 · the integrity envelope recoverEvidence requires
       W2 · characters derived from the authorized sections ONLY
 9  recoverEvidence · digest-verified
10  assembleDevelopmentalContext   ⭐ STILL PURE
11  cognition
12  confirmDisclosureCrossed        evidence of THIS crossing · authorizes no other
13  the Ask completes on its existing thread
```

⭐ **Step 3 is what makes step 2 safe.** Because the requirement is re-derived,
`pendingAskRef` carries nothing the server would otherwise have to believe — which
is exactly why it can be an identity rather than an authority.

⭐ Step 6 uses `scopeKind: 'section'`, where `sectionRef` **is** the admitted
identity. The Q6 prohibition does not reach it; the canonical passage blocker
(`sectionRef` refused for non-section scope) is structurally avoided rather than
patched.

### 10.5 · Partial authorization — the honest branch

```text
required { A, B, C } · authorized { A }
```

```text
⛔ answer from A and present it as the answer          PROHIBITED
✅ the body-required Ask does not proceed as complete
✅ lawful ONLY IF the system re-resolves the evidence requirement and can
   truthfully establish that a narrower question no longer requires B and C
   → that is a NEWLY BOUNDED ANSWER, not a degraded one
```

⚠️ **Design remainder:** whether re-resolution happens automatically or requires
a fresh member question. ⛔ Not decided here — and it must not be decided by
whichever is easier to implement.

### 10.6 · `pendingAskRef` — the identity, stated as constraints

```text
IS        non-authoritative · single-purpose · single-use
          member-bound · Work-bound · Ask-bound
          invalidatable · bounded in lifetime
IS NOT    may_cross · reusable consent · authored characters
          an authority-bearing receipt
          a statement that any section MAY be read
```

⭐ **Expiry here is continuity hygiene, not disclosure freshness.** It ceases to
resume the encounter after completion or cancellation, and a material change that
makes the original Ask identity unreliable invalidates it. ⛔ No TTL is invented
constitutionally.

⚠️ **Design remainder:** whether `threadId` + re-derivation is already sufficient
(no new artefact), or whether a distinct single-use reference is needed to make
"single-use" enforceable. ⛔ A durable row that names an authorized section is
where a standing permission gets built by accident — that risk decides this, not
convenience.

### 10.7 · The four result states, placed on the protocol

```text
STRUCTURE_SUFFICIENT     ACT 1 · step 7 · no ref requires body
BODY_AUTHORITY_REQUIRED  ACT 1 · step 7 · body required, no may_cross → ACT 2
BODY_AUTHORIZED          ACT 3 · step 8 onward
BODY_UNVERIFIABLE        ACT 3 · step 9 · authority EXISTED, recovery failed
```

⭐⭐ **`BODY_UNVERIFIABLE` is reachable only from ACT 3, after `may_cross`.** That
placement is the structural guarantee that an unauthorized crossing can never
present as a verification failure — the collapse §Q4 identified as the cheapest
and the prohibited repair.

---

## Standing

```text
S3-DESIGN-01              ACTIVE · DESIGN ONLY
SUBJECT                   canonical 7fa29678e

Q1 headings               AUTHORED DISCLOSURE · not body disclosure
                          separate governance question PARKED
Q2 DisclosureGesture      narrow S3 extension PERMITTED
Q3 resumed act            DISTINCT PROTOCOL VERB · native in WRITE
                          no client-supplied authority
Q4 gate                   ROUTE DECISION + TYPE ENFORCEMENT
                          null/unverifiable fallthrough PROHIBITED
Q5 multi-section          ALL REQUIRED SECTIONS, or no claimed complete answer
                          silent partial degradation PROHIBITED
Q6 pending identity       EXPIRING · SINGLE-PURPOSE · NON-AUTHORITATIVE

ratified "passage" copy   SUPERSEDED with section language · reason recorded
F7 passage form           SUPERSEDED FOR S3 · history retained
live W2 obligation        SECTION-BOUND

RESUMED-ASK PROTOCOL      DRAFTED · §10 · three acts, end to end

DESIGN REMAINDERS         Q1  may the surface show member headings?
                          10.5 re-resolution automatic or re-asked?
                          10.6 threadId sufficient, or a distinct single-use ref?

A / C                     HELD UNTIL ATTRIBUTABLY DEFINED
                          next revision: recover governed definitions OR
                          retire the labels and define the candidates

IMPLEMENTATION            NOT AUTHORIZED
TESTS / FIXTURES          NOT AUTHORIZED
PASSAGE DESIGN            OUT OF SCOPE
FOCUS ASSEMBLER CUSTODY   separate dependency · unmerged
#1277 D9                  UNTOUCHED · DRAFT
FOCUS WITNESS             UNSPENT
PRODUCTION                UNTOUCHED
```

⭐ *S3 stays small: it governs the paused Ask and the section-body crossing
without solving passage identity, Focus passage, or general consent.*
