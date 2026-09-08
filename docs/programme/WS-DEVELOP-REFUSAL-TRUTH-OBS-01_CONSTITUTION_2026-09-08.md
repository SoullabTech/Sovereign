# WS-DEVELOP-REFUSAL-TRUTH-OBS-01 — Constitution

**Standing: DISCOVER / CONSTITUTE. BUILD NOT AUTHORIZED.**
Branch `fix/develop-refusal-truth-observability`, from canonical `379c9b40a`.
No code changed. This document constitutes the contract; it does not implement it.

Sibling lanes, deliberately separate: **#1266** (`section-run` prompt conformance,
head `e655f0719`) · **BRANCH GATE** (parked governance finding).

---

## 1 · What the incident exposed

On 2026-09-07 a whole-work Development read on production `379c9b40a` refused
twice, identically. The member was told:

> "MAIA's reading did not hold to its own rules, so nothing was kept."

That sentence was **true in outcome and unproven in attribution**. It asserts a
fact about MAIA's conduct. At the moment it was chosen, the system did not know
whether MAIA had violated the contract or had been cut off by our own token
budget — and it still does not, because the evidence that would tell them apart
is discarded one line earlier.

The cause was later recovered by hand, from a browser Network tab, on the third
attempt: `claim_unbindable`, `claims[26] refs[3] run_not_as_read`. It was a
genuine conformance violation. **That it turned out to be MAIA's is not a defence
of the sentence** — the sentence would have read the same either way.

Two defects, one lane:

| | |
|---|---|
| **Cause-blind attribution** | the member-facing copy collapses every non-ceiling read refusal into one sentence that blames MAIA |
| **Refusal observability** | the typed cause is constructed, returned to one browser, rendered, and discarded — no operator record exists |

---

## 2 · Census — where the evidence dies

**It exists.** `lib/ai/structured/types.ts:90-91` declares
`stopReason: string | null` and `usage: { inputTokens, outputTokens }`.
`anthropicStructuredAdapter.ts:102-105` populates both from the live message.

**It dies at one call.** `lib/manuscript/developmentalReader/read.ts:112-124`:

```ts
const { provenance } = outcome.result;      // stopReason + usage in scope HERE
...
return resultFromBlocks(
  outcome.result.content,                    // only the blocks travel
  request,
  readerIdentity(provenance.model),          // only provider + model survive
);
```

`resultFromBlocks` constructs every post-seam refusal — `malformed_output`,
`foreign_field`, `empty_claim_text`, `non_conclusion_*`, `claim_unbindable` —
without ever seeing whether the response was complete. **A truncated reading and
a malformed one are therefore the same event to this code.**

**Nothing anywhere reads `stopReason`.** Confirmed by grep across
`lib/manuscript/**` and `lib/ai/structured/**`.

**No logging exists on the whole path.** `console.*` count: reader `0`,
developmentalReading `0`, `lib/ai/structured` `0`, the readings route `0`. The
empty production log grep of 2026-09-07 was therefore expected and carried no
information about the read.

---

## 3 · Prose-leak audit (requirement 4, answered in advance)

Every refusal `detail` string in the path was read. **None embeds manuscript
prose.** They carry section ids, unit ids, claim indices, ref indices, and fixed
sentences (`bind.ts:93-153`, `parse.ts:57-115`, `read.ts:110-117`).

Two carry **model-authored** strings, bounded in intent and unbounded in fact:

- `foreign_field` — `tool input carries ${foreign.join(', ')}` (invented key names)
- `non_conclusion_unknown` — `carries ${JSON.stringify(v)}` (an invented vocabulary token)

A model that emitted a key or token containing quoted manuscript text would put
it in a detail. **The obligation below therefore bounds detail length and
forbids claim `text` from ever entering a record — it does not rely on the
current shape staying safe.**

---

## 4 · The six obligations, constituted

**O-1 · The seam carries cause far enough to classify it.**
`stopReason` and `usage` must reach the point where a post-seam refusal is
constructed. Passing them is not storing them; what may then be *recorded* is
O-4's question.
*Falsifier:* a modelled seam returning `stop_reason: 'max_tokens'` with a
truncated tool input produces a refusal that is distinguishable from the same
truncated input arriving with `stop_reason: 'tool_use'`.

**O-2 · The member is never told MAIA broke a rule unless MAIA broke a rule.**
The read-stage `else` branch (`DevelopRoom.tsx:167`) currently answers for both
families. It must answer only for **proven contract violation**. Every other
cause — truncation, infrastructure, configuration, unclassified — gets copy that
does not attribute fault to MAIA.
*Falsifier:* for each cause in the taxonomy, the rendered sentence is asserted;
no sentence containing "did not hold to its own rules" is reachable from any
cause that is not a proven contract violation.

**O-3 · An unknown cause is named as unknown.**
The failure mode this lane exists to prevent is a confident wrong attribution.
Replacing "MAIA broke a rule" with "we cut her off" on a *guess* is the same
defect pointed the other way.
*Falsifier:* a refusal whose cause cannot be classified renders copy that claims
neither.

**O-4 · The operator can reconstruct a refusal after the tab closes.**
Today the only witness is a browser inspector, live, once. What is owed is a
durable record naming: timestamp · manuscript ref · lens · stage · refusal code ·
detail · claim/ref index · `stopReason` · token usage · reader version · prompt
hash.
*Falsifier:* a refusal is provoked, every browser is closed, and the cause is
still recoverable.

**O-5 · No manuscript prose enters any record.**
Ids, indices, codes and counts only. Claim `text` is barred absolutely. Detail
strings are length-bounded at the record boundary, not trusted for shape.
*Falsifier:* a modelled refusal whose detail carries a long quoted string is
recorded truncated, and no record path can reach `claim.text`.

**O-6 · Nothing about the reading store moves.**
A refusal still stores no reading (07C). Atomic all-or-nothing acceptance is
untouched. **A refusal record is telemetry about the machine; it is not a
reading, not an observation, and must not be reachable from any surface that
presents readings.**
*Falsifier:* after a refusal, `listReadings` returns exactly what it returned
before, and the DEVELOP room still shows "MAIA has not read this work
developmentally yet."

---

## 5 · Open — founder rulings owed before BUILD

1. **Does truncation become its own refusal code** (e.g. `output_truncated`),
   or a cause field on the existing codes? A new code is legible and widens the
   union; a field keeps the union closed and moves the branching into copy.
2. **Where does the operator record live** — a log line, or a table? A table is
   storage, and storage of a refusal is exactly the boundary O-6 defends. A log
   line is weaker but cannot be mistaken for a reading.
3. **Retention.** A refusal record names a member's manuscript and section ids.
   Whatever it is, it inherits Sanctuary-adjacent obligations and needs a stated
   lifetime rather than an implicit forever.
4. **Copy shape.** One honest generic sentence plus a cause line, or a distinct
   sentence per cause? More sentences is more truth and more surface to get
   wrong.

---

## 6 · Not in this lane

`DEFAULT_MAX_TOKENS` · the binder · atomic acceptance · retry · hierarchical
reading · the `section-run` instruction (that is #1266) · BRANCH GATE.

> A refusal that is honest about *what happened* and silent about *why* is not
> yet an honest refusal. It only looks like one because the member cannot see
> the difference.
