# CMC-001 · Phase 1 · Unit 2 — Assembly Topology Trace
## Artifact 1: Referent + Branch Selection

### A. Referent (§II)

| Field | Value |
|---|---|
| repository | `/Users/soullab/MAIA-SOVEREIGN` |
| canonical remote ref | `origin/clean-main-no-secrets` |
| inspected SHA | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (resolved fresh at launch) |
| mandate commit | `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0` |
| mandate blob digest | `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **VERIFIED MATCH** |
| working tree | non-canonical + dirty; **never read as source**. All source read via `git show <SHA>:<path>` |
| deployed production SHA | not obtainable under STATIC ONLY → `DEPLOYED_REFERENT_UNBOUND` |
| mode | STATIC ONLY. No runtime witnessing performed. |

Blob digests of every file relied on at `52a3b92`:

| Path | Blob | Lines |
|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts` | `04b08a20df52bd71ae05074e095e81abe9661379` | 1769 |
| `lib/sovereign/maiaService.ts` | `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1` | 3737 |
| `lib/sovereign/maiaVoice.ts` | `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c` | — |
| `lib/consciousness/processingProfiles.ts` | `f43869243e475c0815eefd3eb9d40bcff5c87884` | 281 |

Unit 1's blob bindings for `route.ts` and `maiaService.ts` independently reproduce. **No referent conflict.**

---

### B. Runtime profile calculation — the executable condition

**Producer — OBSERVED:** `lib/consciousness/processingProfiles.ts:47-279`,
`MaiaConversationRouter.chooseProcessingProfile`. Singleton exported at `:282`.
Called from `maiaService.ts:2800-2807`; result read at `:2808`.

`ProcessingProfile = 'FAST' | 'CORE' | 'DEEP'` (`processingProfiles.ts:15`). Exactly three.

**Inputs to the decision (`:58`, `:2800-2806`):** `message` (raw member text),
`turnCount`, `userId ?? sessionId`, plus `conversationHistory` (accepted at `:41` but
**never read** in the body — OBSERVED dead parameter) and `lastDepth` (destructured at
`:58`, **never read** — OBSERVED dead parameter).

**Stage 1 — content-based ladder (OBSERVED, `:97-226`), first match wins:**

| # | Line | Condition | Profile |
|---|---|---|---|
| 0 | `:97` | `!text \|\| textLength === 0` | FAST |
| 1 | `:121,138` | text contains any of 11 `explicitDeepPhrases` (`'take me deeper'`, `'shadow work'`, `'help me with my trauma'`, `'ritualize this'`, …) | DEEP |
| 1b | `:133-138` | `textLength > 700` AND one of 6 `processLanguageHints` AND `turnCount >= 5` | DEEP |
| 2a | `:154-160` | `isGreeting` AND `textLength < 60` | FAST |
| 2b | `:167` | `textLength < 60` AND `!/[?.!]/.test(text)` | FAST |
| 3 | `:201` | any of 21 `corePatterns` substrings OR `textLength > 150` | CORE |
| 4 | `:210` | `turnCount < 3` | FAST |
| 5 | `:219` | safe default | CORE |

All matching is `text.includes(...)` on `message.trim().toLowerCase()` — substring, not
token. OBSERVED at `:59`.

**Stage 2 — cognitive override (OBSERVED, `:233-269`), applied unconditionally after
Stage 1 when a profile loaded:** four sequential `if` blocks (not `else if`), so more
than one may fire in the same turn.

| Line | Condition | Effect |
|---|---|---|
| `:240` | `avg < 2.5 && profile === 'DEEP'` | DEEP → CORE |
| `:247` | `(spiritualBypass > 0.4 \|\| intellectualBypass > 0.4) && profile === 'DEEP'` | DEEP → CORE |
| `:255` | `avg >= 4.0 && stability === 'ascending' && profile === 'FAST'` | FAST → CORE |
| `:263` | `cognitiveProfile.fieldWorkSafe && textLength > 400 && profile === 'CORE'` | CORE → DEEP |

`cognitiveProfile` comes from `getCognitiveProfile(userId ?? sessionId)` at `:70/:72` — a
**stored per-member profile**, not derivable from the request. Load failure is caught and
non-blocking (`:83-85`), leaving `cognitiveProfile = null` and Stage 2 entirely skipped.

**Note the composed path (OBSERVED, not inferred):** `:255` can raise FAST→CORE and then
`:263` can raise that same turn CORE→DEEP, since `:263` re-tests the mutated `profile`.
A short greeting from a high-altitude field-safe member with >400 chars cannot reach this
(length conflicts), but a FAST-by-`turnCount<3` message of >400 chars can be promoted
FAST→CORE→DEEP within one call.

**`RUNTIME_BRANCH_UNRESOLVED` — recorded.** For any real member request the branch is a
function of (a) the member's literal message text, (b) `turnCount`, and (c) a
database-resident `CognitiveProfile`. None is statically decidable. Static analysis
determines the *complete and exact decision procedure* (above) but **cannot** determine
which profile a given production conversation took. This is the correct finding, per
launch constraint. No weighting by plausibility is offered.

---

### C. Dispatch — `maiaService.ts:2943-2988`

```
switch (processingProfile) {
  case 'FAST': fastPathResponse(sessionId, input, conversationHistory, meta, mindContext)  :2945
  case 'CORE': corePathResponse(...)                                                        :2956
  case 'DEEP': deepPathResponse(...)                                                        :2967
  default:     fastPathResponse(...)   // unreachable given the union type                  :2980
}
```

All three receive the identical argument tuple, including the full `meta` object carrying
every route-built addendum string. **Divergence is therefore entirely internal to the
three path functions — not a difference in what they are handed.** OBSERVED.

---

### D. A FOURTH dispatch path — RCN, upstream of the switch

**OBSERVED, `maiaService.ts:2837-2887`.** Before the switch, `maiaRcnProcess(input, rcnContext)`
runs. If `rcnDecision.used && rcnResult.confidence >= 0.7 && rcnResult.completedNormally`
(`:2839`, `:2844`), the function **returns at `:2868`** with
`rawResponse = formatRcnForMaia(rcnResult, rcnContext)` (`:2845`).

Consequences, all OBSERVED:
* No prompt is assembled. `formatRcnForMaia` is a corpus-navigation formatter; **no
  continuity contributor from the route reaches any model on this path.**
* It is persisted as `processingProfile: 'RCN'` (`:2860`) but **reported to the client as
  `'DEEP'`** (`:2870`, comment: "Report as DEEP for client compatibility").
* `rcnContext` (`:2827-2834`) carries only `userId`, `mode`, `isSanctuary`, `vaultPath`,
  `activeElement`, `processingDepth`. No addenda.

This is a **fifth assembly-relevant branch** not present in Unit 1's path map, and it is
the one case where the profile label recorded in storage and the label returned to the
client disagree. Recorded per §XXIII.4 as an enumerated site; it does not require a new
stop because Unit 2 was launched precisely to enumerate assembly sites.
