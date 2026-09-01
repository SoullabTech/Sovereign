# WS2-05B-8B-02c-2P · PROVIDER + HTTP BOUNDARY CLOSEOUT

**A · HTTP scope — CLOSED.**
**B · Provider governance — STOPPED for adjudication, as the mandate directs.**

No migrations applied. No real-row Ask witness run. No thread ever opened.

---

## A · The HTTP boundary now accepts only what 02c-2 proved

`AskAnchor` remains the full contract vocabulary from 02c-1. The **runtime
boundary** accepts three kinds: `question`, `uncertainty`, `division`. They are
deliberately different lists.

`work` and `proposal` are out. The `work` cost was concrete rather than
theoretical: it loads no proposal, so a raw POST could **open and persist a
thread** and only then answer `no_reading` — an author-originated Work thread
entering over HTTP before the slice that defines one exists. `section` and
`concern` were never parseable.

The `no_reading` branch is kept and marked unreachable: it is the honest answer
the day a reading-less anchor is added, and deleting it would mean the first such
anchor arrives at a route with no opinion about having nothing to read.

**Two independent barriers** — the supported-kind list and the parse switch —
and the test was probed against both. Readmitting `work` to the list alone fails
one assertion; readmitting it to list *and* switch fails the refusal test too.

`__tests__/askHttpBoundary.test.ts`: 15 tests. Refusal is proved to occur before
`openThread`, and ownership before the anchor is even parsed.

---

## B · Provider governance — the seam that does not exist

### The violations, as run

```
$ npm run check:no-direct-anthropic
❌ Direct @anthropic-ai/sdk imports found outside allowlist (2):
   - lib/manuscript/ask/askReader.ts
   - lib/manuscript/structure/maiaReader.ts
```

Exactly as predicted. **This corrects the 02c-0 record**: that unit's gate set
was mechanically and custodially complete but did **not** include
`check:no-direct-anthropic`, so `maiaReader`'s direct import was transferred onto
the canonical-first branch without the provider boundary being adjudicated. The
custody proof stands; the governance proof was never run.

### Not solved by grandfathering

The allowlist says grandfathered entries are "migration debt, not green-light
status", and "New additions are strongly discouraged". Adding two **new**
cognitive surfaces to it would be the drift the guard exists to prevent. The
allowlist was modified only inside a probe (to prove the gate discriminates) and
restored **byte-identical to HEAD**.

### Why the approved seam cannot carry these two callers

The approved layer is `lib/ai/sovereignRouter` → `lib/ai/claudeClient`. Its
entire request vocabulary is:

```ts
interface TextRequest      { systemPrompt: string; userInput: string; meta?: Record<string, unknown> }
interface ClaudeChatParams { systemPrompt: string; userInput: string; meta?: Record<string, unknown> }
```

Four independent gaps, each a behaviour change the mandate forbids:

| # | What the readers require | What the seam offers |
|---|---|---|
| 1 | **Tool contract** — `tools`, `tool_choice`, `tool_use` block parsing, and a malformed call refused rather than coerced | `claudeClient` contains **zero** references to `tools`, `tool_choice` or `tool_use`. There is no structured path at all. |
| 2 | **Multi-turn history** — Ask replays author/MAIA turns as a `messages` array | One `userInput` string. Flattening the roles would alter request meaning. |
| 3 | **Pinned model** — `MAIA_STRUCTURE_READER_MODEL` / `MAIA_ASK_MODEL`, defaulting to `claude-opus-5`, recorded as provenance | `generateWithClaude` imposes `selectClaudeModel`, which picks sonnet/opus from `meta` flags. The resolved model would no longer be the one the reader pinned — and provenance would record a different answer to "who read this Work". |
| 4 | **No fallback** — a transport failure is reported, never rendered as an answer | `sovereignRouter` primary mode is "Anthropic first, **local fallback**, degraded if both fail". This would introduce a *local model silently producing a reading*, which is precisely what `readerProvenance` exists to make impossible to confuse. |

Gap 1 alone is fatal for `maiaReader`: routed through `generateText` there would
be **no tool call to parse**, so the reading contract does not merely degrade, it
ceases to exist. This is the same finding the allowlist already recorded for the
2026-07-27 batch: surfaces that "pin their own model and call `messages.create`
directly" need "a per-surface behavior change requiring its own reviewed
migration".

### The exact missing seam, for adjudication

A **structured-inference extension** to the approved provider layer. Minimally:

```
1. A structured request type alongside TextRequest, expressing:
     messages: { role: 'user' | 'assistant'; content: string }[]
     system:   string
     tools?:   ToolSpec[]          // absent for Ask, present for the reader
     toolChoice?: ...
     maxTokens: number
     model:    string              // PINNED BY THE CALLER, not selected for it

2. A structured result type preserving the tool_use block, so a malformed
   call can still be refused rather than coerced into a reading.

3. A routing rule for structured requests. The open question, and the reason
   this is an architectural decision rather than a refactor:
   THE LOCAL FALLBACK PATH CANNOT HONOUR A TOOL CONTRACT. Either structured
   requests are declared non-fallbackable (failure is refusal, matching the
   readers' current behaviour), or sovereignty requires a local structured
   path that does not exist. That choice is the adjudication.

4. Provenance must continue to record the RESOLVED model actually sent.
```

**Stopping here.** Building that extension is beyond a governance cleanup, and
forcing either reader through the inadequate abstraction would alter proven
behaviour to make a checker green — which the mandate explicitly forbids, and
which would corrupt the very reading the witness is meant to test.

No paid reading was run. The gate was proved live and discriminating by probe
(allowlist temporarily widened → GREEN; restored → RED), not by calling a model.

---

## Gates

```
ask suites              73 passed (5 structural · 10 anchor · 9 staleness · 34 closeout · 15 boundary)
maiaReader suite        65 passed — untouched, behaviour preserved
all affected suites     501 passed · 31 suites
typecheck               no regressions · baseline not re-recorded
negative gate           39/39 intact
check:no-direct-anthropic   RED · 2 violations · deliberately unresolved
```

## Board

```
02c-2 HTTP scope                 CLOSED
provider-governance seam         OPEN · adjudication returned above
02c-2 real-row persisted witness HOLD — behind the seam decision
migrations                       NOT APPLIED
Sanctuary                        DEBT · unchanged
```
