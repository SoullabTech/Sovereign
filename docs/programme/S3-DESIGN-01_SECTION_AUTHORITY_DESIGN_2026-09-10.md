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

## 10 · P1 — PAUSED ASK / FRESH RESUME · the candidate protocol

⛔ **Protocol design, not implementation.** Names are design vocabulary; nothing
here is a committed signature, schema, or migration.

⭐ **Named P1**, not "A" or "C" — see §12. A protocol is compared by what it does.

```text
P1 — PAUSED ASK / FRESH RESUME

Ask → BODY_AUTHORITY_REQUIRED → pendingAskRef → member authorizes section(s)
    → resumed invocation → server re-derives requirement + section set
    → fresh boundary → may_cross → body load → cognition
```

### 10.1 · The protocol states

```text
STRUCTURE_SUFFICIENT      ratified
BODY_AUTHORITY_REQUIRED   ratified · lawful intermediate state, not an error
BODY_SCOPE_INCOMPLETE     ⭐ NEW · ruled 2026-09-10 · lawful intermediate state
BODY_AUTHORIZED           ratified
BODY_UNVERIFIABLE         ratified · reachable ONLY after may_cross
```

⚠️ `BODY_SCOPE_INCOMPLETE` is a **fifth** state added to the ratified four. It is
recorded as an addition, not folded silently into `BODY_AUTHORITY_REQUIRED`:
*"authority absent"* and *"authority present for some of what is required"* are
different facts and must stay distinguishable, by the same reasoning that keeps
`BODY_UNVERIFIABLE` distinct.

### 10.2 · ACT 1 — ASK, to the decision point

```text
POST  /api/sovereign/manuscripts/[id]/ask
      { anchor: { on:'observation', readingId, observationKey }, question }

 1  resolveMember                      existing
 2  memberOwnsWork                     existing
 3  loadFrozenDevelopmentalReading     existing · member-gated SELECT
 4  checkObservationAnchor             existing
 5  canonicalFingerprint               existing
 6  openThread / reuse                 existing · ⭐ question appended BEFORE
                                       any model call (ratified ordering)
 7  ⭐⭐ RESOLVE THE EVIDENCE REQUIREMENT WITHOUT PROSE
       requirementOf(ref) over observation.evidenceRefs   → body|position|structure
       sectionIdsOf(ref)                                   → required section set
       readState.sections                                  → ranges + digests
                                                             ⛔ never text
```

⭐⭐ **Step 7 is the repair's hinge, and canonical already supports it.**
⛔ `loadRevisionContent` has not been called and is not reachable from here.

```text
no ref requires 'body'   → STRUCTURE_SUFFICIENT · answer normally
                           ⛔ no disclosure boundary · ⛔ no prose receipt
any ref requires 'body'  → this invocation minted no may_cross → ACT 2
```

### 10.3 · ACT 2 — `BODY_AUTHORITY_REQUIRED`

```text
{ result: 'BODY_AUTHORITY_REQUIRED',
  threadId,                       the question is already on the thread
  pendingAskRef,                  ⭐ NON-AUTHORITATIVE · §10.6
  workRef,
  sections: [ { sectionId, heading? }, … ]   ⭐ ALL required sections
}
```

**⭐ Q1 CLOSED — the heading may be shown.**

```text
heading shown to the MEMBER      recognition / orientation
                                 → NOT body disclosure
                                 → NOT cognition disclosure
                                 → ⛔ no body receipt manufactured

heading sent into COGNITION      authored-character disclosure
                                 → separate governance question · PARKED
```

⛔ **The heading must not become authority.** The server binds the act to the
section identity it independently re-derives. ⛔ **And a heading may not be
smuggled into MAIA's prompt merely because the consent surface displayed it.**
The heading is included only if available **without body loading**.

⛔ **What ACT 2 is not.** It cannot cause a load. No `may_cross`, no receipt, no
consent record, no body characters. Presented again unchanged, it does nothing.

⭐ **All required sections are named at once** — Q5 is all-or-none at the answer
contract, and a member cannot make an informed act about a partial set.

**Writer-facing (ruled):** *"I need to read the relevant section to answer that
faithfully"* — **sections**, plural, where several are required. ⛔ Never
"passage". The writer never leaves the Work; there is no Focus destination.

### 10.4 · ACT 2b — THE MEMBER ACT

```text
authorizes ALL required sections   → ACT 3
authorizes SOME                    → BODY_SCOPE_INCOMPLETE  · §10.5
declines                           → the Ask ends · ⛔ nothing loads
```

### 10.5 · `BODY_SCOPE_INCOMPLETE` — ⭐ CLOSED: no automatic re-resolution

```text
required { A, B, C } · authorized { A, B }
```

⛔ **The original Ask remains INCOMPLETE.** The server must not silently
reinterpret *"what I said required A+B+C can apparently be answered from A+B."*
That would make `required` meaningless.

```text
{ result: 'BODY_SCOPE_INCOMPLETE',
  threadId, pendingAskRef, workRef,
  outstanding: [ … ] }        ⭐ still no authority, still no prose
```

The member may then:

```text
authorize the remaining section(s)                    → ACT 3, unchanged
explicitly choose a narrower answer
  "answer only from what I authorized"                → a NEWLY BOUNDED ASK
```

⭐⭐ **Narrowing requires a member act. It is never an automatic fallback.** The
member need not retype the question, but they must **consciously choose the
narrower epistemic contract**. The server then re-resolves the evidence
requirement *for that narrower claim* — and if the narrower claim still requires a
denied section, it is refused, not trimmed.

### 10.6 · `pendingAskRef` — ⭐ CLOSED: `threadId` is NOT enough

A thread identifies a **conversation**. It does not identify **this unfinished
Ask**, and it cannot by itself satisfy single-use.

```text
pendingAskRef
  IS      identifies ONE paused Ask
          member-bound · Work-bound · Ask-bound
          single-purpose · single-use · bounded lifetime · invalidatable
  IS NOT  may_cross · consent · reusable authority
          authored characters
          ⛔ the authorized section AS A PERMISSION CLAIM
```

The resumed invocation uses it **only** to answer *"which Ask are we
continuing?"*. Everything else — body requirement, required section set, current
eligibility to continue — the server **re-derives independently**, and the
member's **present** gesture establishes the fresh boundary.

⚠️ **Representation is open.** No new durable table is required by this ruling.
An existing uniquely-identifying Ask/turn object may serve **if it can genuinely
enforce single-use and invalidation**; otherwise a dedicated opaque reference is
needed. ⭐ **The requirement is the identity semantics, not the storage
mechanism.**

⛔⛔ **THE SHAPE TO NEVER BUILD:**

```text
durable object: { pendingAskRef, sectionId, authorized: true }
```

That is persistent permission wearing continuity's clothes.

### ⭐⭐ 10.6a · SINGLE-CONSUMPTION — ruled 2026-09-10 · REQUIRED

Expiry and single-use do **different jobs**, and the earlier statement is
**amended, not reversed**:

```text
expiry               continuity hygiene
                     "is this still the same resumable encounter?"

single-consumption   DISCLOSURE-EVENT INTEGRITY
                     "can this one member act cause another prose crossing?"
```

> **`pendingAskRef` is not disclosure authority, but its single-consumption
> property is a REQUIRED anti-replay control on the member's authorization act.**

⛔ This does **not** turn the ref into authority. Possessing it still permits
nothing: the server must still re-derive the Ask, the requirement and the section
set, receive the explicit member act, establish a fresh boundary, and mint
`may_cross`.

**⭐ THE CARDINALITY LAW:**

> **One explicit member authorization act may cause AT MOST ONE completed
> authored-body crossing and AT MOST ONE completed-crossing receipt.**

```text
BODY_AUTHORITY_REQUIRED
        ↓  member authorizes
ACT 3 arrives with pendingAskRef
        ↓  server re-derives everything
⭐ ATOMICALLY CONSUME pendingAskRef for this resume
        ↓  ONLY the winning invocation may proceed
establishDisclosureBoundary → may_cross → loadRevisionContent
        ↓
one crossing · one receipt
```

⛔ **A replay after consumption must NEVER mint another boundary and must NEVER
call `loadRevisionContent`.**

**⚠️ THE LOST-RESPONSE CASE.** The first invocation may complete the crossing
while its HTTP response is lost. A retry of the same request must not create a
second crossing:

```text
completion recoverable      → return the ALREADY-COMPLETED outcome
completion not recoverable  → return an ALREADY-CONSUMED state
⛔ NEVER re-execute the disclosure
```

**⚠️ CONSUMED, THEN DIED BEFORE ANY CROSSING COMPLETED.** The conservative lawful
behaviour is to **require a fresh member act** — ⛔ never to persist a
half-authorized permission waiting to be reused.

```text
pendingAskRef
    IDENTITY              yes
    RESUME CONTINUITY     yes
    SINGLE-CONSUMPTION    yes — REQUIRED
    AUTHORITY             no
    CONSENT               no
    PROSE PERMISSION      no

expiry          continuity property
single-use      anti-replay / act-integrity property
```

### 10.7 · ACT 3 — RESUME

```text
POST  (same route, distinct discriminated act)
      { act: 'authorize_sections_and_resume',
        pendingAskRef,
        authorizes: [ sectionId, … ],      ⭐ the member's explicit act
        gesture: <the one new S3 gesture> }
```

⛔ **The client never submits `may_cross`.** ⛔ No `allowBody: true` on an
ordinary Ask.

```text
 1  resolveMember
 2  RE-IDENTIFY the paused Ask from pendingAskRef
       member-bound · Work-bound · Ask-bound · single-use · unexpired
 3  ⭐ RE-DERIVE the body requirement and the required section set
       from the reading and the anchor — ⛔ NEVER from the client's account
 4  authorizes ⊇ required ?     NO → BODY_SCOPE_INCOMPLETE (§10.5)
 5  recognise the member's explicit present gesture
 5a ⭐⭐ ATOMICALLY CONSUME pendingAskRef
       only the winning invocation continues · §10.6a
       already consumed → completed outcome if recoverable,
                          else ALREADY-CONSUMED · ⛔ never re-execute
 6  establishDisclosureBoundary
       sourceRef = workRef · scopeKind = 'section' · sectionRef = S
       ⭐ ONE boundary per authorized section — `sectionRef` is singular and is
         admitted ONLY under section scope (receipt law, unchanged)
 7  mayCrossBoundary → may_cross, minted IN THIS INVOCATION
 8  ⭐ ONLY NOW is prose reachable
       W1 · the integrity envelope recoverEvidence requires
       W2 · characters derived from the authorized sections ONLY
 9  recoverEvidence · digest-verified
10  assembleDevelopmentalContext        ⭐ STILL PURE
11  cognition
12  confirmDisclosureCrossed            evidence of THIS crossing
                                        ⛔ authorizes no other
13  the Ask completes on its existing thread
```

⭐ **Step 3 is what makes step 2 safe.** Because the requirement is re-derived,
`pendingAskRef` carries nothing the server would otherwise have to believe —
which is exactly why it can be an identity rather than an authority.

⭐ Step 6 uses `scopeKind: 'section'`, where `sectionRef` **is** the admitted
identity. The canonical passage blocker (`sectionRef` refused for non-section
scope) is structurally avoided, ⛔ never patched. **S3 does not touch Focus's
broken route.**

---

## 11 · DESIGN FALSIFICATION PASS — P1 against G1–G8

⛔ **A design falsification pass is not a test.** It asks whether the protocol
*could* permit each failure, at the design level, and reports honestly where it
depends on something not yet settled.

### 11.1 · Can pending identity become authority?

**NO, by construction** — `pendingAskRef` carries no section permission, and every
fact the resume needs is re-derived. ⚠️ **Depends on §10.6 being honoured in
implementation**: the prohibited durable shape would defeat it silently. **The
design names it; only the implementation can violate it.**

### 11.2 · Can replay authorize a second load?

⭐⭐ **THIS ONE HAS A REAL FINDING, AND IT SHARPENS A RULING.**

The member's gesture arrives **as data in the ACT 3 request**. A replayed ACT 3
carries the same bytes, and each invocation mints its own `disclosureId`, its own
boundary, and its own receipt. So a replay would produce **a second authorized
load and a second completed-crossing receipt from one member act.**

⛔ **Nothing else in the protocol prevents that.** The *only* control is
`pendingAskRef` being **single-use**.

⚠️ **Therefore single-use is doing DISCLOSURE work, not merely continuity work.**
This does not contradict the ruling that *expiry* is continuity hygiene — expiry
and single-use are different properties, and it is single-use that is
load-bearing here. **Reported for ruling; not resolved by the design.**

*A receipt that records two crossings for one member act has told the record
something false about the member.*

### ⭐ DISPOSITION — founder, 2026-09-10 · CLOSED

**The finding is correct and the behaviour is lawful.** Single-consumption of
`pendingAskRef` is a **REQUIRED anti-replay control**, and it does not make the
ref authority. The cardinality law, the atomic transition, the lost-response case
and the consumed-then-died case are specified in **§10.6a**, and the atomic
consumption is placed in the protocol at **ACT 3 step 5a**.

### 11.3 · Can partial consent silently degrade?

**NO** — `BODY_SCOPE_INCOMPLETE` is a distinct state, narrowing requires a member
act, and a narrower claim that still needs a denied section is refused rather
than trimmed. ⭐ The prohibited automatic reinterpretation has no path.

### 11.4 · Can `null revisionContent` masquerade as "no permission"?

**NO** — `BODY_UNVERIFIABLE` is reachable only from ACT 3 step 9, *after*
`may_cross`. The unauthorized case returns at ACT 1 step 7 and never constructs a
loader call. ⚠️ **Depends on Q4's two-part gate**: the route decides, and the type
seam prevents an accidental later call. Route-level alone would leave the cheapest
repair one edit away.

### 11.5 · Can section S authorization disclose section T?

**NO for the complete-answer path — structurally.** Q5's all-or-none means
`authorized ⊇ required`, so every body ref is inside the authorized set by
construction; the W2 filter has nothing to exclude.

⚠️ **The narrower-answer path (§10.5) is where the filter earns its keep**: a
re-resolved requirement could still name a denied section, and there the W2 filter
must refuse rather than substitute. ⭐ **Named, because this is precisely where an
implementation would be tempted to trim.**

### ⭐ DISPOSITION — founder, 2026-09-10 · THE FILTER REMAINS REQUIRED

⛔ **Do not drop the W2 section filter because the all-or-none path makes it look
redundant.** It is not redundant constitutionally: it is the **positive
enforcement of the authority boundary**, and the narrower-answer path proves why.

```text
authority = section S

characters from S       → potentially eligible for W2
characters outside S    → IMPOSSIBLE at W2

⭐ even if some downstream requirement/selection object erroneously names them
```

⭐ **That is stronger than depending on earlier logic to ensure the sets always
happen to agree.**

### 11.6 · Can a receipt restart authority?

**NO** — receipts are evidence. The authority census established that no
application code reads receipts to authorize; the only application SELECT is
`unresolvedCrossings()`. `confirmDisclosureCrossed` at step 12 writes, never
grants.

### 11.7 · Can headings leak into cognition because they appear in the UI?

⭐⭐ **P1 DOES NOT CREATE SUCH A PATH — AND THE HONEST ANSWER IS STILL "YES,
TODAY, BY ANOTHER PATH."**

`FrozenStructureUnit` carries `title` — a member-authored heading.
`recoverEvidence` returns those units for `structure-unit` / `structure-units` /
`structure-topology` refs, `assembleDevelopmentalContext` places them in
`ctx.evidence`, and `askMaiaDevelopmental` receives them. Those refs carry
requirement **`structure`**, not `body`, so **authored headings already reach
cognition with no body authority.**

⛔ **This is NOT created by S3 and NOT closed by S3.** It is the parked
heading-to-cognition governance question, and this pass establishes that it is
**not hypothetical — it is current behaviour on canonical.** ⚠️ **Reported.**

⭐ What P1 must guarantee, and does: the heading shown in ACT 2 for recognition
does not itself become a cognition input. It is a surface fact, discarded with the
response.

### ⭐ DISPOSITION — founder, 2026-09-10 · SEPARATE LANE, S3 NOT WIDENED

The parked question changes status: not *"could headings someday reach
cognition?"* but **they already do**.

```text
member-authored heading characters
        ↓ structural evidence
        ↓ assembleDevelopmentalContext → ctx.evidence
        ↓ model cognition
                        ⛔ without section-body disclosure authority
```

⛔ **This is NOT another S3 body violation.** `heading disclosure ≠ body
disclosure`, and section-body authority would be the **wrong mechanism** to slap
onto structural evidence merely because both contain authored characters.

> **11.7 is a PRESENT AUTHORED-STRUCTURE DISCLOSURE GOVERNANCE QUESTION, outside
> the S3 body-remediation class.**

Two prohibitions at once:

```text
⛔ DO NOT declare the current heading crossing lawful merely because it is
   structural

⛔ DO NOT route headings through section-body authority merely because they are
   authored characters
```

**The governing question for that future lane:**

> *Under what authority may member-authored structural labels such as headings
> enter cognition, and does that authority require an explicit member act
> distinct from body disclosure?*

⭐ It deserves its own census and design, because headings occupy a genuinely
different phenomenological and technical role: **they are authored expression and
also the Work's navigational structure.**

**⛔ IT DOES NOT BLOCK S3** — but see §13: P1's claim is narrowed accordingly.

### 11.8 · Can the experience say "passage" while authority says "section"?

**NO occurrence exists today** — the only disclosure-surface wording was the SEL-0
exemplar, now superseded in place. A repository scan for member-facing "passage"
copy finds only unrelated features (voice lab, book studio, library).

⚠️ **The risk is prospective, not present**, because no Ask disclosure surface
exists yet — the copy will be written for the first time by this repair. **G8 is
the guard**, and it needs to hold at the moment the surface is authored.

### 11.9 · Verdict

```text
11.1  pending → authority       SURVIVES · implementation hazard named
11.2  replay → second load      ⭐ CLOSED · single-consumption REQUIRED
                                   as anti-replay · §10.6a · cardinality law
11.3  partial → degradation     SURVIVES
11.4  null → "no permission"    SURVIVES · requires Q4's two-part gate
11.5  S authorizes T            SURVIVES · filter load-bearing on the
                                   narrower-answer path only
11.6  receipt → authority       SURVIVES
11.7  headings → cognition      ⭐ RULED · PRESENT authored-structure
                                   disclosure · SEPARATE LANE · S3 not widened
                                   · P1's claim narrowed accordingly (§13)
11.8  "passage" vs section      SURVIVES · prospective risk, G8 guards it
```

⭐ **P1 survives six of eight outright and returned two findings rather than
absorbing them.** Neither was a defect in P1; both were facts P1 made visible, and
both are now ruled — 11.2 by requiring single-consumption, 11.7 by opening a
separate lane and narrowing P1's claim.

---

## 12 · A / C — RETIRED AS DECISION VOCABULARY

```text
A / C
    previously held candidate labels
    definitions NOT ATTRIBUTABLE in the canonical record
    RETIRED as decision vocabulary
    ⛔ no substantive ruling inferred from their retirement
```

⭐ **A label whose definition cannot be recovered cannot legitimately win or lose
an architecture decision.** Protocols are compared by what they do.

**P1 is the first named candidate.** ⛔ **A second candidate is not to be created
merely because there used to be two letters.** If a genuinely different protocol
exists, it is defined with equal precision and compared against G1–G8 and Q1–Q6 —
otherwise there is one candidate, and saying so is the honest report.

---

## 13 · ⭐⭐ WHAT P1 CLAIMS — EXACTLY

⛔ **P1 does NOT claim:**

> *"No authored characters enter cognition before body authority."*

**That is demonstrably false** — §11.7 shows member-authored headings crossing
into cognition today, under `structure` requirement, with no body authority.

⭐ **P1's claim is narrower and exact:**

> **No authored BODY characters required by the Ask enter cognition without
> fresh, section-scoped body-disclosure authority.**

**⚠️ ADJACENT KNOWN ISSUE, recorded so the eventual S3 PR cannot imply otherwise:**

```text
AUTHORED-STRUCTURE DISCLOSURE (headings → cognition)
    PRESENT canonical behaviour
    governance UNRESOLVED
    SEPARATE LANE
    ⛔ does NOT widen S3
    ⛔ does NOT receive body authority by default
```

⭐ *S3 closes the known body-prose crossing. It does not close every
authored-character governance class in the system, and it must not be described
as though it did.*

---

## 14 · FOUNDER RATIFICATION — 2026-09-10

### Ruling 1 — P1 is RATIFIED

```text
P1 — PAUSED ASK / FRESH RESUME
STATUS        RATIFIED FOR IMPLEMENTATION

BODY scope    section
passage       unavailable
authority     fresh, invocation-bound
pending ref   identity only
replay        prohibited
W2            section-bounded
assembler     pure
```

⛔ **No competing candidate needs to be invented.**

### Ruling 2 — ONE SUBSTRATE CENSUS BEFORE CODE

⭐ Because single-consumption is now part of **disclosure law**, not UX
continuity, the `pendingAskRef` representation must be grounded in canonical
reality before any source change. The next act is a **read-only representation
census**, answering only:

```text
Can an existing Ask / turn / held-retry object provide:

  • identity of exactly one unfinished Ask
  • member binding
  • Work binding
  • enough non-prose state for server re-derivation
  • ATOMIC single-consumption
  • completion / cancellation invalidation
  • replay detection across separate requests
  • concurrent-request safety

WITHOUT carrying:

  • may_cross
  • consent
  • authorized = true
  • reusable section permission
  • authored prose
```

⭐⭐ **THE DECISIVE QUESTION IS NOT** *"can we call something `pendingAskRef`?"*
**IT IS:**

> **Can two concurrent or replayed ACT 3 requests both get past consumption?**
> If yes, that representation FAILS.

If an existing canonical object can enforce the contract, use it. If none can, a
**dedicated opaque pending-Ask reference is permitted**, but its design must
remain non-authoritative.

⭐ **A durable IDENTITY record is not forbidden; a durable PERMISSION record is.**

```text
lawful durable state       "Ask 123 is pending / consumed"
prohibited durable state   "Ask 123 is authorized to read section 7"
```

### Ruling 3 — TESTS BEFORE REPAIR

⛔ **Do not write the repair and the tests together.** This session has produced
too much evidence about why that is dangerous — most directly the R1·B guard that
shipped green because it compared a function with itself.

Falsifier authoring is authorized **after** the representation is grounded and
**before** implementation. The test phase must first **reproduce canonical S3 and
demonstrate the failures**, at minimum:

```text
NO AUTHORITY          body required → loader unreachable
STRUCTURE SUFFICIENT  no body load · no body receipt
VALID SECTION ACT     fresh boundary → body may load
REPLAY                same member act twice → second invocation cannot reach
                      boundary or load
CONCURRENCY           two ACT 3 requests race → AT MOST ONE wins consumption
OLD RECEIPT           cannot authorize another load
PARTIAL SCOPE         cannot silently produce the complete answer
SECTION BOUNDARY      authority for S cannot put T characters into W2
VERIFICATION FAILURE  remains BODY_UNVERIFIABLE · cannot masquerade as
                      authorization absence
LOST RESPONSE         retry cannot create a second crossing or receipt
```

⭐⭐ **And the doctrine already earned applies to every one of them:**

> *Known-bad behaviour must make the purported regression test FAIL before that
> test counts as evidence.*

### Ruling 4 — FOCUS ASSEMBLER CUSTODY IS NOT A BLOCKER

P1 does not depend on `assembleFocus`; it establishes disclosure authority
directly in the developmental Ask protocol. The unmerged custody repair is
therefore **not a prerequisite for S3**. The boundary is frozen:

```text
S3 MAY       consume the canonical disclosure-boundary machinery

S3 MAY NOT   import assembleFocus merely for convenience
             absorb its custody repair
             fix Focus passage handling

IF implementation unexpectedly becomes dependent on assembleFocus
   ⛔ STOP — the dependency ruling reopens
```

### The sequence

```text
1  open record/design PR            ← this record
2  Class C if genuinely docs-only
3  gate it
4  merge on green
5  refresh canonical
6  open Class B S3 implementation branch
7  run pendingAskRef substrate census   READ-ONLY
8  author / falsify tests
9  only then implement
```

⭐ *That keeps the constitutional specification ahead of the code that claims to
implement it.*

---

## Standing

```text
P1 PROTOCOL               ⭐ RATIFIED FOR IMPLEMENTATION
S3-DESIGN-01              LAND AS RECORD BEFORE CODE
SUBJECT                   canonical 7fa29678e

ALL DESIGN QUESTIONS      CLOSED
  Q1 · Q2 · Q3 · Q4 · Q5 · Q6 · §10.5 · §10.6 · §10.6a
  11.2 · 11.5 · 11.7

P1 CLAIM (§13)            "No authored BODY characters required by the Ask
                          enter cognition without fresh, section-scoped
                          body-disclosure authority."
                          ⛔ NOT "no authored characters" — that is false

NEXT ACT                  pendingAskRef SUBSTRATE CENSUS · READ-ONLY
                          decisive question: can two concurrent or replayed
                          ACT 3 requests both get past consumption?

FALSIFIER AUTHORING       AUTHORIZED — after the representation is grounded,
                          BEFORE repair implementation
                          known-bad must make each test FAIL first

IMPLEMENTATION            AUTHORIZED IN PRINCIPLE
                          source changes WAIT on substrate census + falsifiers

FOCUS ASSEMBLER CUSTODY   NOT A BLOCKER · remains separate
                          ⛔ dependency reopens the ruling if it appears
AUTHORED-STRUCTURE        separate future lane · NOT OPENED
PASSAGE DESIGN            OUT OF SCOPE
#1277 D9                  UNTOUCHED · DRAFT
FOCUS WITNESS             UNSPENT
PRODUCTION                UNTOUCHED
```

⭐ *S3 stays small: it governs the paused Ask and the section-body crossing
without solving passage identity, Focus passage, authored-structure disclosure,
or general consent.*
