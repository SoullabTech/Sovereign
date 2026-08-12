# CMC-001 · Unit 7 — Conversational Conventions Surface (segment C5)

STATIC ONLY · NO REMEDIATION · no repository file modified.

## 1. Referent

| Field | Value |
|---|---|
| Canonical remote ref | `refs/heads/clean-main-no-secrets` (fetched fresh 2026-08-12) |
| Canonical SHA | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |
| Frozen mandate commit | `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0` |
| Mandate blob | `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **MATCHES** launch authority |
| `observed_status` | `NOT_OBSERVED` (no runtime witness) |
| `route_status` | `REGISTERED_CANONICAL_LIVE` (inherited claim, Units 1–6) |
| `evidence_basis` | `STATIC_POSSIBLE` |

## 2. Source identity + binding lineage

| Path | Blob SHA |
|---|---|
| `lib/sovereign/conversationalConventions.ts` | `e82fc83b75629f13d76046c6faf9f898e804b842` |
| `lib/sovereign/intelligentVoiceAdaptation.ts` | `232b68c8a89352756a8ff6c54d5b911489d31c4e` |
| `lib/sovereign/maiaVoice.ts` | `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c` |

Basename collision check at canonical SHA: `git ls-tree -r --name-only | grep -i conversationalConventions`
→ **exactly one path**. No collision. OBSERVED.

Import lineage (OBSERVED, canonical SHA):

```
maiaVoice.ts:4        import { buildComprehensiveVoicePrompt, ... } from './intelligentVoiceAdaptation'
maiaVoice.ts:1038     buildComprehensiveVoicePrompt(...)            [Unit 6, corroborated]
  └ intelligentVoiceAdaptation.ts:3    import { conversationalConventions, type ConversationalContext }
                                        from './conversationalConventions'
  └ intelligentVoiceAdaptation.ts:248  conversationalConventions.applyConventions(conversationalContext)
  └ intelligentVoiceAdaptation.ts:381  prompt += '\n\n' + conventionsResult.promptAdditions
```

Sole importer of `conversationalConventions` in `*.ts`/`*.tsx` at the canonical SHA is
`intelligentVoiceAdaptation.ts`. Sole importer of `intelligentVoiceAdaptation` is `maiaVoice.ts`.
The lineage is single-edged at both hops. OBSERVED.

Caller-side context construction (`intelligentVoiceAdaptation.ts:~241-247`):

```ts
const conversationalContext: ConversationalContext = {
  awarenessProfile,
  inputText: input,
  conversationHistory,
  sessionDepth: conversationHistory?.length || 0,
  elementalResonance: consciousnessAnalysis?.elementalResonance,
  memberProfile: context.memberProfile
};
```

## 3. VERDICT — `conversationHistory` is RECEIVED BUT NEVER READ

Exhaustive grep of the whole file for `conversationHistory`:

```
18:  conversationHistory?: ConversationExchange[];      // interface declaration
```

**One occurrence in 22,187 bytes — the type declaration itself.** It is never destructured,
never indexed, never passed onward, never length-checked, never logged. There is no branch,
count, or log that reads it. It does not reach `applyConventions`' body at all.

This is a **stronger** finding than Units 1–6's recurring "received, available, never composed":
the prior cases at least read the field. Here the field is **declared and populated by the
caller and never touched by the callee**. Classification: `PASSED_BUT_UNREAD`.

Adjacent fields, same file, same method:

| Field | Occurrences | Read? | Reaches `promptAdditions`? |
|---|---|---|---|
| `conversationHistory` | 1 (decl. `:18`) | **NO** | no |
| `memberProfile` | 1 (decl. `:21`) | **NO** | no |
| `elementalResonance` | 1 (decl. `:20`) | **NO** | no |
| `sessionDepth` | 3 (`:19` decl, `:372` destructure, `:396` use) | yes | **NO** — only into `adaptationReason`, a sibling field of `promptAddition`, never concatenated by `synthesizePromptAdditions` |
| `inputText` | 8 (`:17,102,208,210,232,310,312,347,349`) | yes | **YES** — derived labels only (see §4) |
| `awarenessProfile` | many | yes | yes — scores/levels only |

`detectRepairNeeds(context)` `:544-552` carries the comment
*"This would analyze conversation history for signs of misattunement / For now, return basic
structure"* and unconditionally returns `{ isNeeded: false, reason: '', suggestion: '' }`.
Per §III, code outranks comment: the history-analysis is **unimplemented**, and the
convention-9 interpolations at `:413-414` are therefore unreachable-with-content.
No §XXIII-5 contradiction — the comment is explicitly conditional ("would"), not asserted.

## 4. What `promptAdditions` actually contains

`synthesizePromptAdditions(conventions, context)` `:438-479` builds, in order:

1. `🌟 MAIA CONVERSATIONAL CONVENTIONS (<LEVEL>)` header — `awarenessProfile.primaryLevel`
2. Six intelligence-dimension percentages (analytical/emotional/intuitive/transpersonal/embodied/relational)
3. `ACTIVE CONVENTIONS (n/9):` then, for each convention with `applied === true`,
   its `.promptAddition` string concatenated verbatim
4. A fixed `🎯 INTEGRATION GUIDANCE:` block (static prose)
5. `preferredComplexity`, `structurePreference`, `depthTolerance`

The nine `promptAddition` strings are **static templates selected by branch**. The only
member-derived interpolations anywhere in the file are:

| Line | Interpolated value | Source | Nature |
|---|---|---|---|
| `:214` | `${languageStyle.style}` | `detectLanguageStyle(inputText)` | derived label from the **current turn only** |
| `:215` | `${languageStyle.patterns.join(', ')}` | same | derived pattern labels, current turn |
| `:216` | `${languageStyle.style}` | same | derived label |
| `:354` | `${coreNeed}` | `detectCoreNeed(inputText)` | derived label, current turn |
| `:413-414` | `${needsRepair.reason}` / `${needsRepair.suggestion}` | `detectRepairNeeds` | **always empty string** (stub) |

Bounds: **zero turns of conversation are quoted, summarized, counted, or labelled.**
No truncation exists because no history text is ever handled. `sessionDepth` — the only
numeric shadow of history reaching the function — dies in `adaptationReason`.

`adaptationReason` is used by `generateAdaptationReasoning` (`intelligentVoiceAdaptation.ts:255`)
for the analysis object, **not** by `synthesizePromptAdditions`. It is not in the prompt string.

## 5. Does `promptAdditions` reach the final prompt? — YES

`intelligentVoiceAdaptation.ts:381` `prompt += '\n\n' + conventionsResult.promptAdditions;`
inside `buildComprehensivePrompt`, whose return is `comprehensivePrompt.trim()` returned as
`prompt` from `buildComprehensiveVoicePrompt` `:~264`. Segment C5 is **live and populated** —
it is simply populated with awareness scores and current-turn labels, not member history.

**Availability is not composition** holds: the channel C5 is real, non-inert, and carries
content — but the content is turn-local, not continuity-bearing.

## 6. Corrections to Units 1–6

* **U7-C1 (resolves Unit 6 §11 open item).** Unit 6 recorded C5 as "passes history in; whether
  any of it is quoted into `promptAdditions` is not resolved". Resolved: **none of it**, and
  further, none of it is even read. Unit 6's phrasing "that context carries `conversationHistory`
  and `sessionDepth`" is accurate about the caller and must not be read as callee consumption.
* **U7-C2 (refines the census framing).** The recurring Units 1–6 pattern was
  *received-and-read-but-not-composed*. C5 introduces a distinct, weaker-still class:
  *populated-by-caller-and-never-dereferenced*. These should not share one classification.
* **U7-C3.** `conventionsResult` is NOT inert (contra any inference from Unit 6's "declared-and-inert"
  siblings such as `maiaVoice.ts:994 promptAdditions: ''`). Line `:994` in `maiaVoice.ts` is a
  **separate** empty-string literal on a different construction site; it must not be conflated
  with the `:381` append. Distinct sites, distinct blobs, distinct behavior.

No correction to Units 1–6 required beyond the above. No contradiction found.

## 7. Stop state

`UNIT_COMPLETE`. No stop condition triggered. No unenumerated assembly site opened —
the question was answerable entirely within `conversationalConventions.ts` plus the two
already-enumerated call sites (`:248`, `:381`). No runtime branch required: the finding is a
grep-exhaustive absence, which static evidence can carry fully.

## 8. Next bounded question

C5 is closed. The remaining member-continuity carriage on the comprehensive-prompt path is
`maiaVoice.ts:994 promptAdditions: ''` — a second, *different* conventions-shaped construction
whose relationship to `buildComprehensiveVoicePrompt` is unestablished. Bounded question:

> At `maiaVoice.ts` blob `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c`, what object is being
> constructed at `:994` with `promptAdditions: ''`, which branch reaches it, and does it
> substitute for or coexist with the `intelligentVoiceAdaptation:381` append?

That is a `maiaVoice` question, not a conventions question, and is out of Unit 7's scope.
