# FOCUS DISCLOSURE AUTHORITY — ARCHITECTURAL RECORD

**Lane:** FOCUS / D9 · **Status:** DESIGN CLOSED · **Implementation:** NOT AUTHORIZED

## 0 · What this record is, and is not

It **is** the faithful capture of rulings converged on in session. It **is not** an
implementation plan, and it does not re-litigate what it records. Where a question
was left open, it is recorded as open rather than resolved by the act of writing.

Two things it must not smooth over, because a later reader will otherwise assume
them away:

- **F1l.** C makes unauthorized disclosure structurally impossible *after* an
  invocation is classified. It cannot determine, from identical mechanics, whether
  a human meant *"try again"* or a transport meant *"send the same act again."*
- The formal Focus witness is **UNSPENT**. Nothing here is evidence about running
  software.

## 1 · The discovery

> **Focus is infrastructure, not a feature.**

The writer-facing gesture already exists. `AskMaia` → `askClient.ask` →
`POST /api/sovereign/manuscripts/[id]/ask` lets a writer anchor to a place in
their Work and ask MAIA about it. On the developmental branch the server recovers
bounded authored characters and interpolates them into the prompt.

What is missing is the constitutional layer underneath it.

> **Focus governs what MAIA takes from the Work — not what the writer says to
> MAIA, and not what the server privately handles without showing MAIA.**

## 2 · Census evidence

| Fact | Location |
| --- | --- |
| Client sends ids + question only; never prose | `lib/writersStudio/askClient.ts` |
| Structure branch selects no bodies | `lib/manuscript/ask/frozenReading.ts:18-22` |
| Developmental context carries `text: string` | `lib/manuscript/ask/developmentalContext.ts:76` |
| Authored prose interpolated into the prompt | `lib/manuscript/ask/developmentalAskReader.ts:109` |
| No disclosure authority anywhere in the chain | route + `lib/manuscript/ask/**`, `development/**`, `boundary/**` |
| Prompt hash exists; it is not a receipt | `developmentalAskReader.ts:86` |
| Evidence text is not persisted as a turn | ask route, `appendTurn` calls |

**Classification: Case 1, accepted with qualification.** Not a historical breach.
Integrity and ownership controls predate the disclosure layer; the new law reveals
an architectural absence, it does not retroactively criminalize the old
implementation.

`promptHash` proves *this prompt was assembled*. It does not prove *this member
authorized this authored material to cross into cognition under this boundary.*
Different constitutional facts.

## 3 · The ontology

```
A. DIRECT UTTERANCE
   writer explicitly sends characters to MAIA
   → no Focus receipt required
   (true even if the writer pastes their own manuscript prose)

B. INTERNAL PLAINTEXT OPERATION
   system handles Work text; it terminates before cognition
   → no Focus receipt required

C. SYSTEM-RETRIEVED WORK DISCLOSURE
   system retrieves Work text and supplies it to cognition
   → fresh Focus authority required first
   → receipt records the crossing
```

> **POSSESSION OF PLAINTEXT ≠ DISCLOSURE.** Disclosure occurs when Work-derived
> authored characters are made available to MAIA/model cognition. Integrity
> operations may transiently possess those characters without constituting
> disclosure, provided the characters terminate inside that operation and cannot
> propagate into cognition.

The evidence vocabularies converged independently. `requirementOf`
(`lib/manuscript/development/evidenceRef.ts:113-125`) partitions the six evidence
kinds; the two that carry authored characters — `section`, `passage` — are exactly
the two the receipt's `scope_kind` admits.

```
section, passage                 → body      → disclosure authority required
section-run                      → position  → no prose receipt manufactured
structure-unit/-units/-topology  → structure → no prose receipt manufactured
```

## 4 · SEL-0 — CLOSED

Census question: *can member-authored characters reach model cognition through
SEL-0 without passing through the prose-disclosure boundary?*

```
SEL-0 selector / prompt construction     S0   structure + MAIA observations + counts
loadLiveWork                             S1   prose in memory, digest use only
SEL-0 → developmentalTurn                     hands to the already-classified crossing
S3                                            NONE FOUND
```

`candidateSays` (`developmentalSelector.ts:146-161`) shows the selector the
observation key, MAIA's own observation text, the phenomenon, `evidenceRefs.length`
— **a count** — `doesNotEstablish`, a structure-dependency flag and an open-thread
flag. Evidence is reduced to a number before the prompt is built.

`loadLiveWork` (`capture.ts:181-197`) returns `sections: {id, text}[]` — every
section's current text — used only for `sha256(live.text) !== frozen.digest`.
It runs before the boundary gate. **S1, non-disclosure.** Preserved as a
plaintext-handling observation for a minimization lane; it must not silently
expand D9.

`writerTurn` is **direct utterance**, not Focus disclosure.

**Consequence:** one substantive system-retrieved prose-to-cognition class, not
two. One canonical producer, consumed by both entry paths.

## 5 · A / C ruling

**A — procedural call-site discipline: REJECTED.** Correct when remembered; does
not make bypass impossible; failure surface scales with entry paths.

**C — capability-bound content: RATIFIED, LOADER-BOUND.**

The codebase already answers *"how do we make it impossible to skip the authority"*
with an unforgeable token twice over: `lib/maia/canonical-turn/identity.ts:21-31`
(MINTED WeakSet + branded `VerifiedMemberId`, refused at `construct.ts:68`) and
`lib/manuscript/development/bind.ts:21-56` (`BoundEvidence`, private member, no
exported constructor).

```
1. establishDisclosureBoundary is the sole mint for DisclosureAuthority.
2. DisclosureAuthority is an unforgeable runtime capability.
3. Cognition-bound loading requires that capability, or the loader is
   privately reachable only through the capability holder.
4. Its result is DisclosedContent, unconstructable independently.
5. recoverEvidence accepts DisclosedContent for prose-bearing evidence
   and cannot accept ordinary revision plaintext.
6. No receipt can construct, deserialize, recover or renew either.
7. Neither capability is persisted or resumable.
```

**Branding the output is insufficient.** Anyone able to call the loader could still
obtain branded content. The capability must gate the load itself.

**Provenance and applicability are separate invariants, both at the load:**

```
AUTHENTICITY   did canonical authority mint this capability?
APPLICABILITY  does this capability authorize THIS exact operation?
```

The same transfer as FR-18: authority checked upstream is context; authority
enforced where the consequential act occurs is a boundary.

The passage constraint holds. Runtime capability provenance and durable receipt
vocabulary serve different purposes; implementation convenience must not use one to
reopen the other. `context_disclosure_receipts.section_ref` remains prohibited for
`scope_kind = 'passage'`.

**The assembler remains pure.** `assembleDevelopmentalContext` fetches and checks
nothing; the capability is threaded through inputs.

**Both consumers migrate.** If `focusCrossing.ts` can continue obtaining
cognition-bound prose by the old permission mechanism, C is not canonical — it
would establish the dual system this lane prohibited. Including the consumer that
gave Focus its name.

## 6 · Handoff

`crossed` is marked at the actual cognition handoff. Not wrapper entry, not
request preparation, not a successful answer. The ruling already exists at
`lib/writers-studio/focusCrossing.ts:11-27`:

> *"The receipt is evidence of disclosure, not of successful inference. Response
> success is not disclosure evidence — handoff is."*

`askMaiaDevelopmental` is today a single `await` returning 502 on failure, so it
has no observable moment between dispatch and answer. **Migration scope includes
giving it the two-promise `{ handoff, result }` contract.** Both alternative
placements are prohibited: confirming before the await is the wrapper-entry defect
`focusCrossing` was repaired to remove; confirming after it records prose that
already reached the model as never having crossed.

```
handoff fails                    → receipt remains attempted
handoff succeeds, result fails   → receipt is crossed; HTTP may still be 502
```

## 7 · Retry and duplicate

```
HELD RETRY                        TRANSPORT / IDEMPOTENT DUPLICATE
fresh requestId                   requestId preserved
fresh consent row                 existing_exact lawful
fresh disclosure_id               disclosure_id preserved
fresh attempted receipt           existing lawful
fresh capability                  no duplicate durable rows
prior rows unchanged              not classified as a retry
```

`existing_exact` and `MintOutcome.existing` mean idempotent recognition of the
*same* act. Neither is authority resumption. The substrate already says so:
`lib/disclosure/contextDisclosureReceipt.ts:132-138` — *"A genuine retry by the
writer mints a NEW disclosure_id."*

Freshness must propagate through the whole chain. `disclosureBoundary.ts:63-64`
carries one `requestId` into both the consent row and `request_ref`; a new
`disclosure_id` sitting on an old `requestId` would look correct from the receipt
outward while remaining a resumed act underneath.

`isHeldRetry(...)` has **no authority-bearing semantics.** It may classify the
conversational event; once it says *held retry*, the disclosure system starts a new
authority lifecycle rather than locating the old one.

**Schema:** `UNIQUE(request_ref)` migration NOT AUTHORIZED and NOT ESTABLISHED —
it would encode a broader database law (one consent request ↔ exactly one receipt)
that this lane has not established and D9 does not need. The obligation lives at
the producer boundary and in behavioral falsification.

## 8 · Residual risk

> **C eliminated remembered authority from the prose crossing. It cannot eliminate
> remembered meaning from the event classification that precedes it.**

This is not A's weakness. Under A, forgetting a call lets unauthorized prose
through. Here, once the event is classified and identifiers chosen, the graph makes
the disclosure invariant structural. The residual risk is narrower: misclassifying
which authority act an invocation belongs to.

```
actual event   caller identifiers   result
─────────────────────────────────────────────────────────
retry          fresh                PASS
retry          reused               FAIL — old act resumed
duplicate      unchanged            PASS
duplicate      fresh                FAIL — one act duplicated
```

## 9 · Falsifier family

```
F1a  ABSENCE      no fresh capability → cognition-bound load cannot succeed
F1b  TYPE         no DisclosedContent → textual recoverEvidence cannot succeed
F1c  FAIL-CLOSED  attempted body recovery without lawful content
                  → revision_content_required → zero characters in cognition
F1d  MISMATCH     genuine capability, wrong member/Work/scope-kind/scope-identity
                  → load refused, no DisclosedContent
F1e  REUSE        spent capability → cannot authorize another load or crossing
F1f  HANDOFF      handoff resolves, result rejects → receipt = crossed
F1g  PREMATURE    wrapper entered, handoff not occurred → receipt = attempted
F1h  RETRY        held retry → new disclosure_id; prior receipt unchanged
F1i  NO REMINT    existing attempted/crossed receipt cannot produce authority
F1j  BOTH LAYERS  held retry → fresh requestId AND fresh disclosure_id;
                  prior consent row and prior receipt both unchanged
F1k  DUPLICATE    same in-flight act replayed with same identifiers
                  → existing_exact / existing; no duplicate rows; not a retry
F1l  CLASSIFIER   retry-vs-duplicate is decided BEFORE the boundary and must be
                  falsified where it is decided; the boundary must not infer or
                  repair it
```

F1d requires behavioral cases for at least: right member / wrong Work; right Work /
wrong scope kind; right scope kind / wrong scope identity; spent capability; and
wrong member even where ownership controls make the path hard to construct — the
point of a capability falsifier is to attack the capability contract rather than
rely on upstream defenses.

These are behavioral obligations, not source scans.

## 10 · D9 crossing contract

No iframe. No modal as primary geometry. No top-level Focus route. No new
writer-facing Focus destination. `AskMaia` remains the native gesture.

```
 4b. EXISTING CROSSINGS
     The developmental Ask crossing predates disclosure authority. It SHALL NOT
     remain an independent prose-disclosure path. Whenever it requires authored
     characters for cognition it must consume the same canonical disclosure
     authority before authored content is loaded. If that authority cannot be
     established, authored content does not cross. A second prose crossing
     operating without that authority is prohibited.

11b. RECEIPT ≠ SESSION
     A receipt proves a crossing occurred. It does not preserve, extend, renew or
     recreate the authority under which it occurred. It may prevent duplicate
     evidence for the same completed act. It may never authorize fresh assembly.
     Re-entry requires a new lawful crossing or degrades to the Work.

 14. PHENOMENOLOGICAL FALSIFIER — D9-PHENOMENOLOGY-WITNESS-01
     Run with a writer who did not design or build the surface. Predeclared
     question, asked before they see the implementation:
       "Describe what happened to your sense of where you were working when you
        asked MAIA. Did you remain with your writing, or did it feel as though you
        entered another place or tool?"
     FAIL if the witness reports entering another place/tool/environment; having
     to manage Focus as a separate mode or destination; losing their sense of the
     Work they were inhabiting; or needing to navigate back to their writing
     after the encounter.
```

Should a Focus state later exist, it carries **history identity without destination
identity**: history is a coordinate, never authority; no authored prose, question,
selection or assembled disclosure enters the URL; Back exits Focus before it exits
WRITE; refresh reauthorizes and degrades toward the owning Work, never toward an
invented substitute.

## 11 · Governing sentences

> Focus is the disclosure authority; the receipt is the record that the authorized
> crossing occurred.

> A prose crossing is lawful not because every caller remembered to ask permission,
> but because cognition-bound manuscript content cannot exist in the developmental
> path without fresh disclosure authority.

> One fresh authority act has one fresh accountability record, one fresh disclosure
> trace, and one fresh ephemeral capability. None of those artifacts from a prior
> act can be promoted into authority for a retry.

> D9 does not take the writer to Focus. It lets the Work come into Focus.

## 12 · Standing

```
DESIGN                         CLOSED
F1a–F1l                        RATIFIED

RECORD AUTHORING               THIS DOCUMENT
IMPLEMENTATION                 NOT AUTHORIZED

FORMAL FOCUS WITNESS           UNSPENT
FOCUS FIXTURE BLOCKER          witness_focus_walk|f|begin|x
D9 PHENOMENOLOGY WITNESS       UNRUN

runtime subject                2de1b421bd0df20afdc8076804cba7cdf3a52520
instrument                     e246d0c8e7c2c5f0a683d59b4e057a33cdce30d2
custody split                  RATIFIED

request_ref UNIQUE migration   NOT AUTHORIZED / NOT ESTABLISHED
loadLiveWork minimization      SEPARATE LANE, NOT OPENED
test-quality / source-scan     SEPARATE LANE, NOT OPENED
dependency vulnerabilities     PARKED, SEPARATE LANE

PRODUCTION                     UNTOUCHED (runtime 5f65038d2, Focus flag OFF)
MERGE / DEPLOY                 NOT AUTHORIZED
```
