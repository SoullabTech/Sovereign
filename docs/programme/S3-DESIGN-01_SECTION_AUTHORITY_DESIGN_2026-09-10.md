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
F7  ⚠️ SUPERSEDED IN FORM. "passage authority cannot silently broaden into
    section" cannot be tested while passage is not implementable authority.
    The live obligation is F7-D — a wider W1 retrieval authorizes no additional
    characters at W2 — plus Q5's positive statement.
```

⛔ **No falsifier is authored here.**

---

## Standing

```text
S3-DESIGN-01              ACTIVE · design document written
SUBJECT                   canonical 7fa29678e
Q1–Q6                     dispositions + unresolved remainders recorded
                          ⛔ NOTHING SELECTED

OPEN FOR RULING           Q1  is a heading disclosure?
                          Q2  is widening DisclosureGesture inside S3?
                          Q3  own verb, or a field on an ordinary Ask?
                          Q4  route-level gate or type-level gate?
                          Q5  multi-section observation — partial or all-or-none?
                          Q6  does the pending identity expire?
                          §8  ratified copy says "passage"; authority is section

A / C                     ⛔ NOT COMPARED — not defined on canonical
                          definitions owed before comparison
GEOMETRY CONTRACT         G1–G8 recorded · independent of their names

IMPLEMENTATION            NOT AUTHORIZED
TESTS / FIXTURES          NOT AUTHORIZED
PASSAGE DESIGN            OUT OF SCOPE
FOCUS ASSEMBLER CUSTODY   separate dependency · unmerged
#1277 D9                  UNTOUCHED · DRAFT
FOCUS WITNESS             UNSPENT
PRODUCTION                UNTOUCHED
```

⭐ *The cheapest repair — passing `null` to an assembler that already tolerates
it — is the prohibited one. Everything else in this design exists to make that
path unreachable rather than merely discouraged.*
