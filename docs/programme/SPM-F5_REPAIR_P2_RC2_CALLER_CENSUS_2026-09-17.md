# SPM-F5 Repair P2 — RC-2 Keep / Provenance Caller Census — 2026-09-17

**Standing:** P2 COMPANION EVIDENCE · READ-ONLY · RC-2 PREREQUISITE CLOSED

## Authority

This census supports RC-2 in `SPM-F5_REPAIR_P2_CONTRACTS_2026-09-17.md`.

It classifies every located live non-test call into `lib/psyche/portfolio.ts::keepSource()` and the live routes that construct `ConversationalKeepResult`.

No source was modified.

## Classification vocabulary

- **SERVER-RESOLVED SOURCE** — wording is loaded by the server from an owned source object.
- **CURRENT-MEMBER-TURN** — wording is derived by the server from the authenticated member's current inbound utterance.
- **CALLER-CARRIED / UNPROVEN** — wording or provenance-bearing instruction is accepted from request body without independent source verification.
- **GESTURE ONLY** — no new authorship claim is minted.
## C1 — Field Object declaration

Path:

```text
POST /api/psyche/field/declare
  → resolveCapsuleDeclarationSource(memberId, capsuleId)
  → keepSource(...)
```

Classification: **SERVER-RESOLVED SOURCE**

The browser supplies only `capsuleId`. The resolver checks ownership/eligibility and loads title/summary from the owned capsule. The declaration route passes those server-read words to the mint.

Constitutional note: the member's declaration is an adoption/holding act; the source wording is established independently from the request body.

RC-2 posture: **lawful exemplar candidate**, subject to P3 falsification; not itself proof of a universal solution.
## C2 — Generic portfolio Keep

Path:

```text
POST /api/psyche/portfolio/keep
  → validateInput(request body)
  → keepSource(...)
```

Classification: **CALLER-CARRIED / UNPROVEN**

The request may supply:
`sourceType`, `sourceId`, `title`, and for `spontaneous`, `body`.

Validation checks shape and vocabulary, not authorship of the exact wording nor whether the supplied source identity produced it.

`keepSource()` subsequently stamps `generated_by='member-gesture'`.

RC-2 posture: **direct violating entry** for I-4/I-27.
## C3 — Direct conversational filing in /maia and Oracle

Located live callers:

- `app/api/sovereign/app/maia/list/route.ts`
- `app/api/oracle/conversation/route.ts`

Path:

```text
authenticated member message
  → parseFilingInstruction({ utterance: message })
  → applyConversationalKeepResult(...)
  → keepSource(...)
```

Classification: **CURRENT-MEMBER-TURN**

The `FilingInstruction.excerpt` is produced server-side from the current inbound member message rather than returned by the client after the fact.

For destination `keep` / `protected`, the current code uses a `spontaneous` atom and persists that excerpt.

For destinations such as ideas/decisions/journal/dream/reflection, the current bridge supplies no `sourceId`; `keepSource()` requires one and therefore refuses rather than minting a sourced atom.

RC-2 posture: the wording origin is stronger than C2/C4/C5, but P3 must not confuse “current member utterance” with the referent of phrases such as “keep this”.
## C4 — Accept conversational Keep offer

Path:

```text
POST /api/psyche/conversational-keep/respond
  kind = accept_offer
  body.excerpt + optional body.sessionId
  → route reconstructs KeepOffer
  → applyConversationalKeepResult(...)
  → keepSource(...)
```

Classification: **CALLER-CARRIED / UNPROVEN**

The route verifies only that `excerpt` is a non-empty string. It does not resolve the excerpt from the named session/turn or prove that the member, MAIA, or another producer authored those exact bytes.

When a session id is supplied, the bridge labels the atom `session_excerpt`; without one it falls back to `spontaneous`. Neither branch independently establishes the excerpt's producer.

RC-2 posture: **direct violating entry** and the clearest replay/forgery specimen.
## C5 — Confirm low-confidence conversational filing

Path:

```text
POST /api/psyche/conversational-keep/respond
  kind = confirm_filing
  body.instruction
  → isFilingInstruction(shape check)
  → applyConversationalKeepResult(...)
  → keepSource(...)
```

Classification: **CALLER-CARRIED / UNPROVEN**

The client supplies the entire `FilingInstruction`, including:
`destination`, `memberDirected: true`, and `excerpt`.

The validator proves shape and allowed vocabulary only. It does not re-derive the instruction from a durable/current member utterance, and `memberDirected: true` is therefore caller assertion rather than evidence.

RC-2 posture: **direct violating entry** for provenance and act-origin claims.

## C6 — Conversational gesture confirmation

`confirm_gesture` applies a gesture to an existing atom. It does not mint new wording.

Classification: **GESTURE ONLY**

It remains relevant to ownership/target authorization, but it is not an I-4/I-27 provenance-mint specimen.
## Census conclusion

Every located live non-test minting family is now classified:

```text
field declaration                 SERVER-RESOLVED SOURCE
generic portfolio keep            CALLER-CARRIED / UNPROVEN
direct /maia conversational file  CURRENT-MEMBER-TURN
direct Oracle conversational file CURRENT-MEMBER-TURN
respond: accept_offer             CALLER-CARRIED / UNPROVEN
respond: confirm_filing           CALLER-CARRIED / UNPROVEN
respond: confirm_gesture          GESTURE ONLY
```

The decisive P2 finding is that RC-2 is not merely a defect inside `keepSource()`.

The shared mint is downstream of **three different epistemic qualities of input**:
server-resolved, current-turn-derived, and caller-carried/unproven.

Therefore P3 must select an authority boundary that preserves those distinctions rather than applying one provenance label to every invocation.

## Gate effect

RC-2's pre-P3 caller-classification requirement is satisfied.

This census does not select a new API, field, enum, table, resolver registry, or migration.
