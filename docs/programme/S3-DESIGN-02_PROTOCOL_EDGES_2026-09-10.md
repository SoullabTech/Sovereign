# S3-DESIGN-02 · the two remaining protocol edges

```text
SUBJECT     canonical c509976b5 · implementation branch 5ceccaa27
MODE        DESIGN ONLY · no code · no migration · no falsifier
QUESTIONS   A · MULTI-SECTION AUTHORITY
            B · DISCLOSURE_UNAVAILABLE
AUTHORIZED  founder, 2026-09-10 — "the immediate next act is not more route
            code. It is resolving multi-section authority and
            disclosure_unavailable."
```

⛔ **Both were reported from implementation rather than designed around.** Neither
is settled by appearing here.

---

## A · MULTI-SECTION AUTHORITY

### A1 · What the route actually hit

An observation may rest on the BODY of several sections:

```text
resolveBodyRequirement(observation.evidenceRefs) → requiredSections = [A, B, C]
```

`sectionRef` is **singular** and admitted **only** under `section` scope
(`mintDisclosureAttempt` refuses it otherwise). So three required sections means
three `establishDisclosureBoundary` calls, three `disclosureId`s, and three
`confirmDisclosureCrossed` rows.

That collides with the ratified law:

> One explicit member authorization act may cause **at most one** completed
> authored-body crossing and **at most one** completed-crossing receipt.

⛔ The route refuses (`multi_section_authority_undecided`, 501) and crosses
nothing rather than improvising.

### A2 · The distinction the law's two clauses do not share

```text
CLAUSE 1   one act → at most one completed CROSSING       an EVENT
CLAUSE 2   one act → at most one completed RECEIPT        a ROW COUNT
```

⭐ In the single-section case these coincide, which is why one sentence covered
both. **They are not the same claim.** A crossing is the handoff of authorized
context into the response-producing path; a receipt is the accountability record
of one governed scope having crossed. Three sections entering **one** handoff is
one crossing described by three scope records.

⚠️ Whether the second clause was meant as a law about accountability rows, or was
a shorthand for the first that the single-section case made indistinguishable, is
**the founder's to say.** The design cannot resolve it by preference.

### A3 · What the substrate permits — measured

```text
disclosure_id   TEXT NOT NULL UNIQUE          one row per disclosure identity
request_ref     TEXT NOT NULL REFERENCES runtime_consent_state(request_id)
                ⭐ NOT unique on the receipts table
```

⭐ **Several receipts may lawfully share one `request_ref` today**, with no schema
change. An auditor grouping by `request_ref` sees exactly one serving request —
one member act — carrying N section-scoped crossings. The substrate already
represents "one act, several scopes" without inventing anything.

### A4 · Candidate shapes

```text
A-i   ONE ACT · ONE CROSSING · N RECEIPTS, joined by request_ref
      requires: clause 2 read as per-scope accountability, not a row cap
      ⭐ no schema change · no new vocabulary · sectionRef stays singular
      ⚠️ amends the ratified law's wording

A-ii  N DISTINCT MEMBER ACTS, one per section
      each section its own pendingAskRef, its own act, its own crossing
      ⭐ clause 2 survives untouched
      ⛔ the member authorizes three times to ask one question, and the Ask
        cannot answer until the last — so the first two acts create authority
        that has crossed nothing and must be held somewhere. That is the
        half-authorized state §10.6a exists to forbid.

A-iii ONE ACT · ONE CROSSING · ONE RECEIPT carrying several sections
      ⛔ REFUSED HERE. It requires a multi-section authority token, which the
        founder explicitly prohibited: "Do not widen sectionRef into an ad hoc
        multi-section token just to make the route work."

A-iv  REFUSE MULTI-SECTION OBSERVATIONS AT THE PROTOCOL
      ⛔ Not a design; a capability amputation. MAIA legitimately notices things
        that rest on more than one section, and an architecture that cannot
        answer them has narrowed the Work rather than governed it.
```

### A5 · Recommendation, offered as one

⭐ **A-i**, on the ground that the substrate already carries it and the
alternatives each break something ratified: A-ii manufactures the half-authorized
state, A-iii the forbidden token, A-iv the capability.

⚠️ **A-i still needs two things ruled, not assumed:**

```text
1  the atomic claim is consumed ONCE, before the FIRST boundary — so a replay
   cannot re-enter even partway through a multi-section crossing
2  if boundary k of N fails, boundaries 1..k-1 have minted `attempted`
   receipts and NOTHING crossed. Those rows are truthful — "a crossing may have
   occurred and was not confirmed" — but the act is spent (see B).
   ⛔ Whether partial `attempted` rows are acceptable evidence is a ruling.
```

⛔ **NOT SELECTED. NOT IMPLEMENTED.**

---

## B · `DISCLOSURE_UNAVAILABLE`

### B1 · The state none of the five describes

```text
member authorization act     HAPPENED
atomic claim                 WON
boundary establishment       FAILED
prose load                   DID NOT HAPPEN
verification                 NEVER BEGAN
```

```text
BODY_AUTHORITY_REQUIRED   ⛔ would tell the member their own act did not happen
BODY_SCOPE_INCOMPLETE     ⛔ they authorized everything required
BODY_AUTHORIZED           ⛔ nothing crossed
BODY_UNVERIFIABLE         ⛔ nothing was read, so nothing failed verification
ALREADY_CONSUMED          ⛔ this invocation is the one that consumed it
```

⭐ Every existing state would misdescribe it, and a 500 would describe it as a
system defect when the system refused correctly.

### B2 · ⭐⭐ THE COST THE ORDERING IMPOSES — the real finding

The claim precedes the boundary, by constitutional ruling. So when boundary
establishment fails, **the member's authorization act is already spent.**

```text
claim consumed  →  boundary fails  →  nothing crossed  →  the act cannot be reused
```

That is not a bug in the ordering; it is the ordering's price, and §10.6a already
chose it: *"consumed, then died before any crossing completed → require a FRESH
member act — never a half-authorized permission waiting to be reused."*

⭐ **So a sixth state must say two things, not one:**

```text
"the disclosure could not be established, and nothing was read"
"your authorization has been spent — authorizing again is a new act"
```

⛔ **A state that reports only the failure would leave the member believing they
are still authorized.** That is the same class of untruth as an unauthorized
crossing wearing the verification-failure shape: the system telling a person
something false about their own boundary.

⚠️ **Any reordering that would preserve the act across a boundary failure
reopens replay** — the loser of a race would reach the boundary. The cost is not
optimizable away without giving up 5.2.

### B3 · Candidate shapes

```text
B-i   SIXTH PROTOCOL STATE `DISCLOSURE_UNAVAILABLE`
      carries: nothing crossed · the act is spent · a new act is required
      ⭐ the only shape that states both facts
      ⚠️ widens the ratified five, which is a founder act

B-ii  KEEP IT AN HTTP-LEVEL REFUSAL (today's 503 `disclosure_unavailable`)
      ⚠️ the surface must still render it, so it becomes a state in practice
        while remaining unnamed in the protocol — a state nobody ratified

B-iii FOLD INTO `BODY_AUTHORITY_REQUIRED` and re-offer the act
      ⛔ REFUSED. It is accidentally CORRECT about what to do next and FALSE
        about what happened, and it invites an infinite loop against a
        persistently unavailable substrate.
```

### B4 · Recommendation, offered as one

⭐ **B-i.** The state exists whether or not it is named; naming it is the
difference between a protocol that describes reality and one whose surface
improvises. And the "act is spent" half is not a detail — it is the member-facing
consequence of the ordering the lane deliberately chose.

⛔ **NOT SELECTED. NOT IMPLEMENTED.** Adding a sixth state amends the ratified
four-plus-one, which is a founder act.

---

## What is owed once both are ruled

```text
1  the P1 protocol record gains the ruled answers          (design)
2  falsifiers extend to cover them                         (instruments)
   · multi-section: one act, one crossing, N-or-1 receipts as ruled
   · partial boundary failure: nothing crosses, act spent, truthfully reported
   · a spent act cannot be re-presented
3  the route implements them                               (code)
4  ONLY THEN the Class B PR leaves draft
```

⛔ Order preserved: rulings → instruments → code. ⛔ The instruments must fail
against implementations of the prohibited shapes before they are evidence.

---

## Standing

```text
S3-DESIGN-02              OPEN · DESIGN ONLY
A MULTI-SECTION           4 candidates · A-i recommended · ⛔ NOT SELECTED
                          two sub-rulings owed (claim-once · partial attempts)
B DISCLOSURE_UNAVAILABLE  3 candidates · B-i recommended · ⛔ NOT SELECTED
                          ⭐ a sixth state must also say the act is SPENT

ROUTE REPAIR              5ceccaa27 · refuses both cases · crosses nothing
CLASS B PR                ⛔ NOT OPENED — draft only after both are in code
                          and falsified
PRODUCTION MIGRATION      NOT AUTHORIZED
UI                        NOT YET
D9 / #1277                UNTOUCHED · DRAFT
PHENOMENOLOGY WITNESS     UNSPENT
AUTHORED-STRUCTURE        separate lane · NOT OPENED
PASSAGE IDENTITY          out of scope
FOCUS ASSEMBLER CUSTODY   separate · S3 no longer depends on it
PRODUCTION                UNTOUCHED
```

⭐ *Both edges were found by building, not by reasoning — the route refused
rather than improvised, and that refusal is what made them visible.*
