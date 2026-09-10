# FOCUS DISCLOSURE AUTHORITY — ADDENDUM 02

**Extends:** `…_ARCHITECTURAL-RECORD_2026-09-09.md` (`acb048eaf`) · `…_ADDENDUM-01_2026-09-09.md` (`cf56ac7ec`)
**Status:** ARCHITECTURAL AMENDMENT · **Implementation:** SUSPENDED

> The disclosure scope names the act the writer authorized, not merely the
> geometry of the characters that happened to cross.

## 0 · Why a second addendum exists

Addendum-01 closed the vocabulary. Implementation then falsified that closure
within one consumer — which is what implementation is for, and why the stop
condition existed. Both prior records stay **frozen and unamended**. A vocabulary
that was corrected once and then corrected again is a more honest artifact than
one silently widened in code.

Nothing here reopens C, the capability contract, or F1a–F1n. One scope shape is
added.

## 1 · The finding

`lib/manuscript/developmentalReading/contract.ts:152` types an observation's
evidence as `evidenceRefs: NonEmptyArray<EvidenceRef>`, and
`lib/manuscript/ask/developmentalContext.ts:113` maps over **all** of them,
recovering prose for every body-bearing ref. So one Ask turn's disclosure is the
set of prose-bearing refs belonging to one observation — one section, one
passage, or several, and the several may be non-adjacent.

Non-adjacency is designed, not incidental. The reader's own system prompt
instructs it: *"For non-adjacent BODY-depth evidence, use separate `section` or
`passage` refs in the claim's refs array."* `section-run` exists in the evidence
vocabulary for contiguous runs precisely so that non-contiguous evidence must
arrive as several refs.

## 2 · Why Addendum-01 could be complete and still miss this

```
/readings   scope origin = the writer's chosen structural locus
Ask         scope origin = MAIA's frozen observation's evidentiary basis
```

The `/readings` census asked *what crosses*. It did not ask *what determines the
crossing's shape*. Every `/readings` gesture is a writer-chosen structural
selection, so four scope shapes covered it exactly. Ask's scope is not chosen by
the writer at all — it is whatever the observation they asked about happens to
rest on.

**This does not require a second authority.** One canonical authority accepts
multiple lawful scope forms arising from different gestures.

## 3 · Ruling — `evidence_set`

> `evidence_set` is the bounded set of prose-bearing evidence loci already
> belonging to one developmental observation, disclosed together in one cognition
> handoff.

⛔ **Narrow by definition.** It is not a generic arbitrary-selection mechanism,
and it may not be reached for by any caller that simply wants to disclose several
things at once.

```
one section EvidenceRef                     → section
one passage EvidenceRef                     → passage
2+ prose-bearing refs, one observation      → evidence_set
```

⛔ **Contiguity does not demote it to `range`.** `range` means the writer
commissioned a contiguous structural span. `evidence_set` means the crossing is
disclosing the evidence supporting an observation. **The same characters can have
different lawful scope because the authorized act is different.**

⛔ Not `unit`. Not `range`. Not `whole_work`. Not N acts.

## 4 · One handoff remains one act

The `/readings` granularity law generalizes:

> A single cognition handoff is not decomposed into multiple disclosure receipts
> merely because several prose loci are carried inside it.

```
Ask over [section A · passage X · section F]
        ↓
ONE authority act · ONE requestId · ONE disclosure_id · ONE receipt
scope_kind = evidence_set
ONE capability authorizing exactly that set
ONE cognition handoff
```

N receipts are **prohibited**.

## 5 · The receipt is not a replay recipe

This is the schema ruling, and it is the one most likely to be eroded by
convenience.

The **capability** must know exact set membership, because applicability is
enforced at the cognition-bound load. The **receipt** does not need to serialize
that set so it can later recreate the capability — doing so would blur 11b again.

```
RUNTIME AUTHORITY                   DURABLE TRACE
DisclosureAuthority                 receipt
  exact member                        scope_kind = evidence_set
  exact Work                          proves the composite disclosure occurred
  exact evidence refs                 ⛔ cannot reconstruct the refs
  exact permitted load                ⛔ is not an authority manifest
  ephemeral · unforgeable · one-shot
```

⛔ **No generic JSONB evidence bag. No child table invented merely because the
capability needs exact membership.** If durable constituent identity is later
proven independently necessary for audit, that is a new question; it is not
required to make this crossing lawful.

**Passage privacy is untouched.** An `evidence_set` containing passages gains no
permission to persist their containing section ids.

## 6 · Capability consequence

The capability's scope union becomes:

```
whole_work · section · passage · unit · range · evidence_set
```

For `evidence_set`, applicability at the load means the requested body-bearing
refs must match the authorized set exactly. Membership semantics follow the
existing observation/evidence definition — ⛔ **ordering is not to be decided
during implementation by convenience.** If `EvidenceRef` collection semantics are
a mathematical set, order must not create a false mismatch; if ordering itself
carries meaning there, canonical order is preserved.

## 7 · Falsifier added

```
F1o — EVIDENCE-SET EXACTNESS

  Given a genuine fresh capability authorizing evidence set S:

    exactly S                      → cognition-bound recovery may proceed

    S + an additional ref          → refused
    S − a ref                      → refused
    a substituted ref              → refused
    another observation's set      → refused

  → no unauthorized DisclosedContent
  → zero additional Work-derived characters reach cognition
```

## 8 · Implementation owed by this addendum

The two held local commits remain valid evidence and are **not** rewritten. What
they do not yet contain, and now must:

- `evidence_set` in the receipt's `scope_kind` vocabulary and its CHECK;
- `evidence_set` in `DisclosureLocus`, carrying exact ref membership;
- exact-set applicability in `locusMatches`;
- the Ask consumer, still unstarted, built to produce it;
- F1o.

## 9 · Standing

```
ONTOLOGY                      UNCHANGED — one boundary, one authority
C + CAPABILITY CONTRACT       UNCHANGED
F1a–F1n                       UNCHANGED
F1o                           ADDED

NEW SCOPE                     evidence_set — RATIFIED, narrowly defined
MULTI-REF ASK                 ONE disclosure act
N RECEIPTS                    PROHIBITED
CONTIGUOUS ASK SET            still evidence_set, NEVER range
CAPABILITY                    exact set membership REQUIRED
RECEIPT                       trace, NOT an authority manifest
JSONB BAG / CHILD TABLE       NOT AUTHORIZED

BASE RECORD                   acb048eaf · FROZEN
ADDENDUM-01                   cf56ac7ec · FROZEN / PUBLISHED

LOCAL IMPLEMENTATION          040db99d1 · 31a05048d — HELD, not rewritten
FOCUS                         migrated locally
ASK                           halted before code
/readings                     not started

IMPLEMENTATION                SUSPENDED
PUSH / PR / MERGE / DEPLOY    NOT AUTHORIZED
FORMAL FOCUS WITNESS          UNSPENT
D9-PHENOMENOLOGY-WITNESS-01   UNRUN
PRODUCTION                    5f65038d2 · Focus flag OFF · untouched
```
