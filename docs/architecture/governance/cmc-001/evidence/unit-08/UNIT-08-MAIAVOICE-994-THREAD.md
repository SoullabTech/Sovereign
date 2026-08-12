# CMC-001 · Unit 8 — The `maiaVoice.ts:994` Thread

Mode: STATIC ONLY. No remediation. No runtime witness.

## 1. Referent

| Item | Value |
|---|---|
| Canonical ref | `origin/clean-main-no-secrets` (fetched fresh) |
| Canonical SHA | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |
| Frozen mandate commit | `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0` |
| Mandate blob | `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **VERIFIED, matches launch authority** |

Blob identities (path + canonical SHA + blob SHA):

| Repository-relative path | Blob SHA |
|---|---|
| `lib/sovereign/maiaVoice.ts` | `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c` (matches `8ea2f62a…`) |
| `lib/sovereign/intelligentVoiceAdaptation.ts` | (Unit 6 recorded `232b68c8a89352756a8ff6c54d5b911489d31c4e`) |
| `lib/sovereign/maiaService.ts` | resolved at canonical SHA |
| `lib/consciousness/conversationContext.ts` | resolved at canonical SHA |
| `lib/consciousness/maiaOrchestrator.ts` | resolved at canonical SHA |
| `app/api/sovereign/app/maia/route.ts` | `06e30438c0bd81b0f6f0da7cf331c7db8e7887d8` |
| `app/api/sovereign/app/maia/list/route.ts` | `04b08a20df52bd71ae05074e095e81abe9661379` |

## 2. Resolved identity and call lineage for `:994`

OBSERVED. `:994` sits inside `export function buildMaiaComprehensivePrompt(input, context, conversationHistory)`
declared at `lib/sovereign/maiaVoice.ts:953`, inside a **guarded early-return block** spanning `:963–:1033`.

Binding lineage (import-resolved, not name-matched):

```
app/api/sovereign/app/maia{,/list}/route.ts  → getMaiaResponse(...)      [import from '@/lib/sovereign/maiaService']
  lib/sovereign/maiaService.ts:2230          → buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)
                                                [import maiaService.ts:4 from './maiaVoice']
    lib/sovereign/maiaVoice.ts:953           → guard :963
       TRUE  → :966–:1032 synthetic object (contains :994) + hand-written `simplePrompt` :1007–:1027 → RETURN
       FALSE → :1038 buildComprehensiveVoicePrompt(...)  [import maiaVoice.ts:4 from './intelligentVoiceAdaptation']
                :1045 appendAllContextAddenda(context, result.prompt)
```

`buildMaiaComprehensivePrompt` has exactly **one** executable caller repo-wide: `maiaService.ts:2230`
(the DEEP **repair/regeneration** path). `lib/learning/enhanced-maia-service.ts:20` imports the symbol
but calls only `buildMaiaWisePrompt` at `:297` — the import is unused for this symbol. All other hits
are documentation prose (`docs/architecture/*.md`, `MODE_VOICE_FIX_COMPLETE.md`) — non-authoritative per §III.

## 3. Branch and reachability condition

Executable guard, `maiaVoice.ts:959–963`:

```ts
const maiaPaiConfig     = context.conversationContext?.depthConfig;
const conversationDepth = context.conversationContext?.depth;
if (maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50) {
```

Profile: **DEEP-repair only**. Not FAST, not CORE, not DEEP-primary
(`consciousnessOrchestrator.processRequest`), not RCN.

### Feeder chain for the guard

`repairedContext.conversationContext` is assigned at `maiaService.ts:2180`:
`conversationContext: (meta as any).conversationContext as any` — i.e. it is **not server-derived**;
it is taken verbatim from `meta`.

**OBSERVED — sole server producer.** Repo-wide, `depthConfig:` is assigned into a context/meta object at
exactly **one** site: `lib/consciousness/maiaOrchestrator.ts:521`, inside the `meta:` literal at `:483`
passed to `getMaiaResponse` at `:480`. That value is `conversationContext.getDepthConfig('adaptive')`
(`maiaOrchestrator.ts:256`).

`ConversationContext.getDepthConfig` (`lib/consciousness/conversationContext.ts:74–129`) returns, for
`depth === 'opening'`: **`maxTokens: 200`** (adaptive, `:81`) or **`maxTokens: 100`** (classic, `:105`).
Other returns: 400/800/200 (adaptive), 200/300/200 (classic). **No producible value satisfies `<= 50`.**

Additionally, `maiaOrchestrator` is the `between/chat` lane (`originRoute: '/api/between/chat'`,
`processingProfile: 'BETWEEN'`, `:793–794`) — **out of census scope per §IX-A**, and it is not traced here.

**OBSERVED — in-scope routes.** Neither `app/api/sovereign/app/maia/route.ts` (blob `06e30438…`) nor
`app/api/sovereign/app/maia/list/route.ts` (blob `04b08a20…`) contains any occurrence of
`conversationContext` or `depthConfig`. Server-side, these routes never populate the field.

**OBSERVED — client passthrough.** Both in-scope routes destructure the raw HTTP body with a rest spread
and forward it: `route.ts:97` `const { sessionId, message, includeAudio, voiceProfile, userId, ...meta } = body`
→ spread at `:292`; `list/route.ts:287` equivalent → spread at `:1211`. The rest object is not schema-validated
for this field. A body carrying
`conversationContext: { depth: 'opening', depthConfig: { maxTokens: 10, depthGuidance: '…' } }`
would therefore reach `maiaService.ts:2180` → the `:963` guard → **TRUE**.

**Reachability verdict (INFERRED from OBSERVED code):**
* Via server-produced state on census-scoped routes: **unreachable** — no producer, and no producible
  `maxTokens` value ≤ 50.
* Via client-supplied request body: **statically reachable**; unvalidated passthrough exists on both
  in-scope routes. Whether any client actually sends it is **not statically decidable** →
  `RUNTIME_BRANCH_UNRESOLVED` for that sub-question only.

## 4. Verdict — substitutes / coexists / different consumer

The question resolves into two distinct answers, and conflating them is the error U7-C3 warned about.

**(a) The `:994` object itself: NEITHER — it has no consumer.**
OBSERVED: `conventionsResult` is read only inside `lib/sovereign/intelligentVoiceAdaptation.ts`
(`:352, :381, :389, :411–413`), reached solely through `buildComprehensiveVoicePrompt`. The `:994` literal
is constructed inside the branch that **returns before** `buildComprehensiveVoicePrompt` is called, so those
readers never see it. Its only consumer would be the caller, and `maiaService.ts:2231` reads
`comprehensiveResult.prompt` and nothing else (`comprehensiveResult` appears at exactly two lines: 2230, 2231).
The `:994` object is **type-conformance filler satisfying `ComprehensiveVoiceAnalysis`** — constructed,
returned, never read. It is not a data substitution and does not coexist as a competing value.

**(b) The branch it sits in: SUBSTITUTES for the entire `:381` assembly route.**
When the `:963` guard is TRUE, `buildComprehensiveVoicePrompt` is never invoked, so
`intelligentVoiceAdaptation.ts:381` (`prompt += '\n\n' + conventionsResult.promptAdditions`) never executes,
and `appendAllContextAddenda` (`maiaVoice.ts:1045`) never executes either. The returned `.prompt` is the
hand-written literal at `:1007–:1027`.

So: the empty object does not *displace* the populated one; the **branch displaces the route that would
have produced the populated one**. Nothing is overwritten with `''` — the append simply does not happen.

## 5. C5 consequence on the substituting branch

**C5 is absent, not empty-appended.** On the taken branch the prompt is `simplePrompt` (`:1007–:1027`),
which interpolates exactly three values: `getSimpleDateString(context.timezone)` `:1009`,
`maiaPaiConfig.depthGuidance` `:1011`, and `context.summary || 'New conversation beginning.'` `:1027`.
Note `context.summary` on this path is `` `Repair attempt for: ${input}` `` (`maiaService.ts:2171`) — the
current turn's input only, no prior-turn content.

Therefore the branch loses **even the turn-local convention content Unit 7 found live at C5**, and — because
`appendAllContextAddenda` is bypassed — all `MaiaContext` addenda as well. This matches the CORE-tier finding
already recorded by Units 2 and 3 for the twin guard at `maiaVoice.ts:543` and by the reconciliation record.
Unit 8 establishes that the DEEP-repair twin at `:963` has the identical consequence.

This consequence is **counterfactual with respect to server-produced state** (§3): it describes what the branch
does if taken, and no server producer can make it taken on the census-scoped routes.

## 6. Unenumerated assembly route

**None.** No `STOPPED_UNENUMERATED_ASSEMBLY_SITE`. This branch is already enumerated by prior units:
Unit 2 `02-ASSEMBLY-SITE-TOPOLOGY.md:85` and Unit 3 `02-CORE-SURVIVAL-MATRIX.md:101` (the CORE twin at `:543–568`),
and Unit 6 `UNIT-06-…-AUDIT.md:120` ("Branch A — MAIA-PAI early return, `maiaVoice.ts:962-1032`").
Unit 8 adds resolution, not a new site. §XXIII condition 4 is not met.

## 7. Corrections to Units 1–7

* **U8-C1 (closes Unit 3 open item U-1).** Unit 3 recorded "whether `depthConfig.maxTokens <= 50` with
  `depth === 'opening'` ever holds" as requiring **runtime** evidence. It is now **statically resolved for
  server-produced state**: the sole producer, `ConversationContext.getDepthConfig`
  (`conversationContext.ts:74–129`), returns 200/100 for `'opening'` and never ≤ 50; and the sole site that
  places a `depthConfig` into a context object (`maiaOrchestrator.ts:521`) is the out-of-scope `between/chat`
  lane. Only the client-injection sub-question remains runtime-bound.
* **U8-C2 (sharpens U7-C3).** The two sites are not two competing values of one field. `:381` is a *prompt
  append*; `:994` is an *unread type-conformance literal* inside a branch that pre-empts the route containing
  `:381`. The correct framing is route displacement, not value substitution. "Empty `promptAdditions` overwrites
  the populated one" would be a false claim.
* **U8-C3 (qualifies Unit 6 Branch A).** Unit 6 located Branch A but did not resolve its feeder. The feeder is
  `(meta as any).conversationContext` at `maiaService.ts:2180`, originating from unvalidated client body
  passthrough on both in-scope routes — not from any server computation on those routes.
* **U8-C4 (scope note, not a correction).** Documentation in `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`
  states `buildMaiaComprehensivePrompt` is at `maiaVoice.ts:914`; at canonical it is `:953`. Comment/doc line
  references are stale relative to code. Per §III, code carries the claim.

## 8. Recorded observation — not repaired (§XIX)

`maiaPaiConfig.depthGuidance` is interpolated directly into the prompt string at `maiaVoice.ts:1011` (and the
CORE twin at `:551`) from a field whose only in-scope feeder is unvalidated client body passthrough. Recorded
as an observation of the traced path. **No repair, no design, no plan.** Whether this is exploitable in
deployment is not statically decidable and is out of this unit's scope.

## 9. Stop state

**COMPLETED — question answered.** No mandate stop condition triggered.
One bounded sub-question carries `RUNTIME_BRANCH_UNRESOLVED`: whether any live client body populates
`conversationContext.depthConfig.maxTokens <= 50` with `depth === 'opening'`. Static analysis cannot settle it;
no runtime witness was taken.

## 10. Unopened static surface on the traced path

Recorded honestly rather than inferred:

1. **`conversationalConventions.applyConventions`** (`lib/sovereign/conversationalConventions.ts`) — Unit 7
   opened this for the `:381` path. Not re-opened here; irrelevant to `:994`, which never calls it.
2. **Request-body schema validation** on the two in-scope routes — I confirmed the rest-spread passthrough and
   the absence of `conversationContext`/`depthConfig` handling, but did **not** audit the routes' full body
   validation (e.g. any upstream zod/guard layer that might strip unknown keys before `body` is destructured).
   The client-reachability claim in §3 is therefore stated as *statically reachable given the observed spread*,
   and is not a claim that no upstream validator exists.
3. **DEEP-primary path** (`consciousnessOrchestrator.processRequest`, §II.C of the divergence doc) — out of
   scope for this unit and not traced; it does not pass through `buildMaiaComprehensivePrompt`.

Nothing else on the `:994` path is unopened. `maiaVoice.ts` was not audited generally.
