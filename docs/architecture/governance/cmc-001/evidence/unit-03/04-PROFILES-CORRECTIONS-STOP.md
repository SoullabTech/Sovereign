# CMC-001 · Unit 3 · Artifact 4 — Profile topology · Corrections · Capabilities · Stop

Referent `52a3b924…`.

---

## §C · Profile-selection topology

### C-i · The four outcomes are not four renderings of one context

| Profile | Assembly | User-message channel | Policy transform | Continuity reaching a model |
|---|---|---|---|---|
| **FAST** | one template literal, 33 interpolations, `maiaService:1297` | `userInput: contextPrompt` `:1339` — a **second** continuity channel | **yes** — `:1303`, additive | richest: C1–C8 |
| **CORE** | `MaiaContext` → `ADDENDA_SPECS` (24 fields) → `appendAllContextAddenda` `maiaVoice:913`; + 12 service appends; + `formatFieldAddendum` `:1708` | `userInput: input` (raw) `:1722` | **yes** — `:1684`, additive | C1–C5 preserved (§A-2); C6–C8 dropped; two total-bypass seams |
| **DEEP** | none in-body; delegates to `consciousnessWrapper` `:2052` → orchestrator | `input` only | not on primary | **none on primary** (§B); C1–C4 only via default-off consultation or validation-failure repair |
| **RCN** | none — preempts the switch entirely | n/a | n/a | corpus retrieval, not member continuity |

### C-ii · RCN is a pre-emption, not a fifth branch of the switch

`maiaService.ts:2836-2886` runs **before** the `switch (processingProfile)` at `:2943`.

Gate: `rcnDecision.used` (`:2839`) **AND** `rcnResult.confidence >= 0.7 && rcnResult.completedNormally` (`:2844`).
On pass, `rawResponse = formatRcnForMaia(rcnResult, rcnContext)` (`:2845`), egress discipline
via `finalizeMemberFacingText` (`:2852`), persistence (`:2857`), and an **early `return` at
`:2868`**. `fastPathResponse` / `corePathResponse` / `deepPathResponse` never execute.

On fail (`:2879-2882`) or throw (`:2884`) it is non-blocking and falls through to the switch.

### C-iii · The compatibility-reported-DEEP path — the label divergence, stated precisely

```
:2860   processingProfile: 'RCN'    → persisted via addConversationExchange
:2870   processingProfile: 'DEEP',  // Report as DEEP for client compatibility  → returned to client
```

**A turn the client is told is DEEP may never have run `deepPathResponse`.** The two fields
are different facts about the same turn:

* the **stored** value names the executed lane (`RCN`);
* the **returned** value is a compatibility label with no execution meaning.

Any future correlation of client-reported profile against stored profile — including any
runtime witness under §XXVII — must treat these as distinct fields. Unit 2 D-3 recorded the
divergence; this unit adds the operative consequence: `'DEEP'` on the wire is **not evidence
that the DEEP path ran**, and therefore is not evidence about which continuity survived.

`formatRcnForMaia` composition — **not traced** (Unit 2 F-8 stands; not required for
CORE/DEEP topology).

### C-iv · Which profile a real member experiences

**`RUNTIME_BRANCH_UNRESOLVED`.** The decision procedure is fully enumerated (Unit 2
Artifact 1 §B) but its inputs — member message text, `turnCount`, a DB-resident
`CognitiveProfile`, `rcnDecision.used`, `MAIA_SAFE_MODE`, `depthConfig.maxTokens`,
`MAIA_USE_CLAUDE_CONSULTATION` — are runtime state. No plausibility weighting is offered.
Requires §XXVII authority.

---

## §D · Corrections to Units 1–2

### C-1 · Unit 2 Artifact 3 — "rewritten wholesale" — **corrected**

> *"In CORE the assembled prompt is subsequently **rewritten wholesale** by
> `adaptResponsePromptWithPolicy(adaptivePrompt, policy)` at `maiaService:1684`."*

The function (`awareness-levels.ts:401-457`) never reads `basePrompt`; it terminates at
`return basePrompt + adaptation`. It is an **additive suffix**, not a rewrite. Unit 2 was
correct to refuse the intact-survival claim without tracing (its own F-4 discipline was
sound); the word "rewritten" over-described an untraced call. Content preserved; **position**
displaced (§A-2 caveat).

### C-2 · Unit 2 Artifact 3 — "FAST applies no equivalent transform" — **falsified**

> *"FAST applies no equivalent transform to `baseSystemPrompt`."*

`maiaService.ts:1301-1307`:
```ts
if (policy) {
  baseSystemPrompt = adaptResponsePromptWithPolicy(baseSystemPrompt, policy);   // :1303
```
The identical call, under the identical `if (policy)` gate, four lines after the FAST
assembly site at `:1297`. It occurs at **four** sites in the file — `:1303` FAST, `:1684`
CORE, `:1751` CORE-repair, `:2235` DEEP-repair. Since the transform is additive, the
correction changes no survival classification in either path; it removes a false asymmetry
between FAST and CORE. Recorded per §IV.

### C-3 · Unit 2 Artifact 2 — "DEEP has no prompt seam by construction" — **falsified as a path claim**

Unit 2 quoted the source comment at `maiaService.ts:2091-2093`. Code contradicts it one call
deep: `consciousness-layer-wrapper.ts:123` builds `observerPrompt`, and
`consciousness-orchestrator.ts:149-230` builds model input across ten stages. The accurate
statement is narrower and stronger:

> `deepPathResponse` constructs no prompt **in its own body**, and passes none of the route's
> continuity contributors to the generator it calls. The generator constructs prompts of its
> own, from a substrate the census has not surveyed.

This is a §IV `SURFACE_SUBSTITUTION` of the mild form — a comment inside the traced file was
allowed to bound a claim about code outside it. Unit 2's *survival* classifications are
unaffected (nothing it classified as DISAPPEARS reappears); its *architectural* claim is
narrowed. Downstream reasoning from "DEEP has no prompt seam" must not continue.

### C-4 · Unit 2 Artifact 2 — "the only continuity carrier is `conversationHistory`" — **narrowed**

Correct as to what is *passed* (`:2037`), incorrect as to what is *consumed*. Sole read is
`cwrapper.ts:303` `.length > 3`. See §B-2.

### Reproduced without change

Unit 1/2 findings independently re-derived at `52a3b92…` and confirmed: the FAST site and
contributor order at `:1297`; C6/C7 absence from `ADDENDA_SPECS` (`maiaVoice:406-431`, 24
entries, verified by full enumeration); `ADDENDA_SPECS` ordering with C1–C4 last at
`:427-430`; `appendAllContextAddenda` trailing-invariant blocks `:507-522`; the CORE
dispatch shape at `:1720-1730`; `consciousnessContext`'s eight fields at `:2034-2043`; the
RCN label divergence `:2860`/`:2870`. Unit 2.5 A-1/A-2/A-3 are unaffected by anything here.

---

## §E · Capability candidates (§XVII — record only, no repair, no design)

* **E-6 · Additive-only prompt adaptation.** `adaptResponsePromptWithPolicy` mutates nothing
  it is given and appends a delimited, self-labelling block (`[CONSCIOUSNESS POLICY]`,
  `[AWARENESS LEVEL: …]`, `[EXPLICITNESS: …]`, `[SAMPLE SIZE: … beads]`). A transform that
  is trivially provable safe by inspection — the property Unit 2 needed and could not assume.
  Worth preserving as the *shape* every prompt transform should take.
* **E-7 · `safeAddendum` as a uniform field guard** (`maiaVoice:394-399`). One place that
  normalises non-strings, whitespace, and the stringified-`undefined`/`null` failure mode,
  applied to all 24 fields. A small, complete input discipline.
* **E-8 · Retrieval depth as an explicit, per-path parameter.** `loadRelationshipMemory`'s
  options object (`:684`, `:1419`, `:1826`) makes each path's intended depth legible at the
  call site — 5/2 for CORE, 10/5 + `includePatterns` for DEEP. The declaration is a genuine
  capability; that DEEP's declaration is not honoured downstream (§B-1) is a separate matter
  and is **recorded, not repaired** (§XIX).

---

## §F · Runtime-only unknowns (carried forward; none guessed)

| # | Unknown | Class |
|---|---|---|
| F-2 (carried) | `MAIA_SAFE_MODE` production value → CORE seam 1 | environment |
| F-3 (carried) | `MAIA_USE_CLAUDE_CONSULTATION` production value → DEEP S1 | environment |
| F-1 (carried) | which profile a real turn takes, incl. RCN pre-emption | `RUNTIME_BRANCH_UNRESOLVED` |
| U-1 | whether `depthConfig.maxTokens <= 50` with `depth === 'opening'` ever holds → CORE seam 2 | runtime |
| U-2 | whether `sacredCore` / `memoryBridge` / `obsidianVault` are substantive or stubbed at runtime | behind the stop |
| U-3 | whether `woven.content` is ever empty (would fire `fallbackGeneration` and make `observerPrompt` reachable) | behind the stop |
| U-4 | whether the orchestrator's recalled memories overlap the `/list` contributor set | behind the stop |

Answering U-2/U-3/U-4 requires no induced failure — they are **static** questions about
unsurveyed modules — but they are outside this unit's authorized scope and behind the stop.
Nothing here requires failure injection (§XV); no perturbation was performed.

---

## §G · Stop state

# `STOPPED_UNENUMERATED_ASSEMBLY_SITE`

Triggered by §XXIII.4 at `lib/orchestration/consciousness-orchestrator.ts:1011` /
`:149-230`, reached from `maiaService.ts:2052` via
`consciousness-layer-wrapper.ts:123-138`. Full basis in `03-DEEP-SURVIVAL-MATRIX.md`.

**Complete and returned, unaffected by the stop** (independent evidence chains, all bound):
* §A — the CORE survival matrix, including the F-4 resolution and both bypass seams.
* §C — profile-selection topology, including the RCN pre-emption and the DEEP label divergence.
* §D — four corrections to Units 1–2.

**Terminated at the boundary:** the DEEP primary-path question "what actually survives into
the final model request." Established up to the orchestrator boundary and no further.

**Boundaries returned rather than crossed:** no runtime witness; `DEPLOYED_REFERENT_UNBOUND`
stands; no repair, no consolidation, no architecture proposed (§XIX); the refused Oracle lane
untraced; `between/chat` unfollowed (§IX-A); no MFR-001 or frontier material opened; census
not broadened to the general 33 contributors — the only additions beyond Units 1–2 are C9
(conversation history) and C10 (`context.summary`), both required because they are the sole
survivors of the CORE bypass seams this unit was directed to examine. No subagents spawned.
**No file in `/Users/soullab/MAIA-SOVEREIGN` was modified; every read was `git show` at a
bound SHA.**

### Next bounded unit (scope only — not authorized here)

Survey `consciousness-orchestrator.ts` and its four bridges (`MemorySystemsBridge`,
`ObsidianVaultBridge`, `AIIntelligenceBridge`, `multiEngineOrchestrator`) to establish where
the DEEP-primary terminal model request is constructed and what continuity, if any, that
substrate supplies independently of the `/list` route.
