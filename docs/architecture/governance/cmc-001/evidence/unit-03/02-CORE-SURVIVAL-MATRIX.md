# CMC-001 · Unit 3 · Artifact 2 — CORE Survival Matrix (post-policy)

Referent `52a3b924…`. All rows OBSERVED from executable code unless marked INFERRED.

---

## §A-0 · F-4 RESOLVED — `adaptResponsePromptWithPolicy` is purely additive

`lib/consciousness/awareness-levels.ts:401-447` (blob `3ee205fc…`), signature
`(basePrompt: string, policy: ConsciousnessPolicy): string`.

Whole body, structurally: `let adaptation = "\n\n[CONSCIOUSNESS POLICY]"` … a chain of
`adaptation += …` (explicitness branch `:422-444`, tone directives `:446-455`) …
terminating at **`:457  return basePrompt + adaptation;`**

**No `slice`, no `substring`, no `replace`, no regex, no re-ordering, no length cap, and no
read of `basePrompt` at all** other than the final concatenation. The parameter is opaque to
the function.

> **Unit 2's characterisation "the assembled prompt is rewritten wholesale" (Artifact 3) is
> corrected: it is an unconditional suffix append.** See `04-CORRECTIONS.md` C-1.

Consequence: **the policy transform preserves every byte of everything above it.** Any
contributor present in `adaptivePrompt` at `maiaService.ts:1683` is present, unmodified and
in the same relative order, at `:1685`. Gate is `if (policy)` (`:1683`); when `policy` is
falsy the call does not run at all and the prompt is likewise untouched.

The claim Unit 2 F-4 forbade — that C1–C5 reach the CORE model intact — is therefore now
**warranted with respect to this transform**, and only this transform. It is stated below
with its positional caveat.

---

## §A-1 · The CORE chain, end to end

```
maiaService.ts:1529-1589   MaiaContext literal          C1 :1581  C2 :1584  C3 :1587  C4 :1588
                                                        C5 relationshipMemory :1544
:1592  buildMaiaWisePrompt(context, input, effectiveHistory)   → maiaVoice.ts:531
         maiaVoice:534   SAFE_MODE early return          ── seam 1 ──
         maiaVoice:543   opening / maxTokens<=50 return  ── seam 2 ──
         maiaVoice:864   ${summary} interpolated
         maiaVoice:868   history .slice(-4), .substring(0,120)
         maiaVoice:892   formatRelationshipMemoryForPrompt(C5) → :894 append
         maiaVoice:913   appendAllContextAddenda(context, adaptedPrompt)
         maiaVoice:915   return adaptedPrompt.trim()
:1597-1679  12 sequential `adaptivePrompt = adaptivePrompt + '\n\n' + X` appends
:1684  adaptivePrompt = adaptResponsePromptWithPolicy(adaptivePrompt, policy)   ← ADDITIVE
:1708  adaptivePrompt += formatFieldAddendum(fieldContext)
:1720  generateText({ systemPrompt: adaptivePrompt, userInput: input })          ← DISPATCH
```

`appendAllContextAddenda` (`maiaVoice.ts:489-524`): iterates `ADDENDA_SPECS` (24 entries,
`:406-431`), `out += "\n\n" + safe` per non-empty field, then four unconditional trailing
blocks — MEMORY SPEECH-ACT BOUNDARY `:507`, `PLATFORM_KNOWLEDGE_ADDENDUM` `:514`,
`PLATFORM_KNOWLEDGE_BOUNDARY` `:518`, `INTERFACE_HUMILITY_GUARDRAIL` `:522`.

`safeAddendum` (`maiaVoice.ts:394-399`) — the only per-field filter on the CORE channel:
non-string → `''`; `.trim()`; literal `'undefined'` / `'null'` → `''`. **No truncation.**

---

## §A-2 · Survival matrix — CORE default path (neither seam taken)

| # | Contributor | Classification | Binding evidence |
|---|---|---|---|
| C1 | `conversationalRecallAddendum` | **PRESERVED** | `MaiaContext:1581` → `SPECS:427` → `maiaVoice:494` (`out += "\n\n"+safe`) → additive `:1684` → dispatch `:1721`. Only mutation: `.trim()` at `maiaVoice:396`. |
| C2 | `episodicRecallAddendum` | **PRESERVED** | `:1584` → `SPECS:428` → same chain |
| C3 | `atomsAddendum` | **PRESERVED** | `:1587` → `SPECS:429` → same chain |
| C4 | `relationalContextAddendum` | **PRESERVED** | `:1588` → `SPECS:430` → same chain |
| C5 | `relationshipContext` | **TRANSFORMED** | Load `maiaService:1419` (`maxThemes:5, maxBreakthroughs:2` — a *retrieval* cap, not a prompt cap) → serialized `maiaVoice:892` `formatRelationshipMemoryForPrompt` → appended `:894`, **before** the addenda block. Structured→prose is the transform; the policy append does not touch it. |
| C6 | `memoryInfluenceAddendum` | **DROPPED** | Not in `ADDENDA_SPECS`; absent from 1377–1787. (Unit 2 finding, re-derived.) |
| C7 | `forwardReadinessAddendum` | **DROPPED** | Same. |
| C8 | `contextPrompt` channel | **DROPPED** | `userInput: input` (raw) at `:1722`. Identifier absent from the CORE range. |
| C9 | conversation history (`effectiveHistory`) | **TRUNCATED** | Two independent caps: `maiaService:1520` `pairs.slice(-4)` on cross-session recall, then `maiaVoice:868` `conversationHistory.slice(-4)` and per-turn `maiaMsg.substring(0, 120)` (`:872`) — **MAIA's side of each exchange is cut to 120 chars; the member's side is not cut.** |
| C10 | `context.summary` | **REPLACED** | `maiaService:1531` assigns the synthetic literal `` `Conversation: ${…dominantElement} element, ${conversationHistory.length + 1} turns` ``. Interpolated into the prompt at `maiaVoice:864`. **Carries no member content whatsoever** — a shape label standing where a summary is named. |

*The four §XXXV-C fields not varying by row are in `01-REFERENT.md`.*

### Positional caveat on C1–C5 "PRESERVED"

Preserved in **content**, displaced in **position**. After the addenda, CORE appends, in order:
four unconditional guardrail blocks (`maiaVoice:507-522`), up to 12 service-layer blocks
(`maiaService:1597-1679`), the `[CONSCIOUSNESS POLICY]` block (`:1684`), and
`formatFieldAddendum` (`:1708`). The member's own recalled material therefore sits far from
the recency edge of the CORE system prompt. Recorded as a topology property, **not a defect
claim** (§XIX).

---

## §A-3 · The two early-return seams — what survives a bypass

Both return **above** `maiaVoice:913`, so all 24 `ADDENDA_SPECS` fields (C1–C4 included),
C5, and the history block are dropped at the voice layer. The service layer does **not**
know a bypass occurred: `:1597-1684` and `:1708` still append onto the returned literal, and
`:1720` still dispatches it.

| Seam | Gate | Survivors reaching the model |
|---|---|---|
| **1 · SAFE_MODE** `maiaVoice:532-536` | `process.env.MAIA_SAFE_MODE === 'true'` → `return buildSimpleMaiaPrompt(context)` | `buildSimpleMaiaPrompt` (`:254-270`) interpolates exactly two context fields: `getSimpleDateString(context.timezone)` and `${context.summary \|\| 'This is a new conversation.'}`. Since `summary` is the synthetic label (C10), **zero member continuity survives.** |
| **2 · opening / `maxTokens ≤ 50`** `maiaVoice:543-568` | `depthConfig && depth === 'opening' && depthConfig.maxTokens <= 50` | Hardcoded greeting literal interpolating three values: `getSimpleDateString(context.timezone)` `:547`, `maiaPaiConfig.depthGuidance` `:551`, `context.summary` `:567`. **Zero member continuity survives.** |

C1–C10 classification under either seam: **DROPPED**, except C10 (`REPLACED`, and it is the
sole survivor) and timezone.

`MAIA_SAFE_MODE` and the `depthConfig` origin are environment/runtime state → the seams are
statically **reachable**; whether they are **taken** is `UNRESOLVED` under STATIC ONLY.
Recorded, not resolved. (Unit 2 F-2 stands.)
