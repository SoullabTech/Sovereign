# WS-DEVELOP-REFUSAL-TRUTH-OBS-01 — Constitution

**Standing: BUILD AUTHORIZED (founder, 2026-09-08 — see §5).**
Branch `fix/develop-refusal-truth-observability`, from canonical `379c9b40a`.
This document constitutes the contract. §1-4 were written at DISCOVER, before
any code moved; §5 records the rulings that authorized BUILD and corrects O-5.

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
it in a detail. **O-5 as corrected therefore persists no model-supplied value at
all** — this audit describes what today's details happen to contain, and is not
the basis on which anything is written down.

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

**O-5 · No model-supplied value is persisted. (CORRECTED — founder, 2026-09-08)**
The first draft said no manuscript prose enters the record and then permitted
model-authored `detail` to be merely length-bounded. **Those two statements do
not coexist: a 100-character excerpt of manuscript prose is still manuscript
prose.** Truncation is not redaction.

The record therefore persists **normalized diagnostics only** — a closed set of
fields whose every value is either system-generated or drawn from a closed
vocabulary:

```
timestamp · manuscriptId · lens · stage · refusal · detailKind
claimIndex · refIndex · completion · attribution · stopReason
inputTokens · outputTokens · readerVersion · promptHash
```

Barred absolutely: claim text · raw `detail` · foreign-field names · any
model-supplied section or unit id · IP · user-agent. `manuscriptId` is
system-issued and stays; a model-supplied id is untrusted and does not, because
a model can put prose where an id belongs. Where an untrusted value is
diagnostically necessary, persist a one-way digest of it, never the value.
*Falsifier:* a modelled refusal whose `detail` carries quoted prose produces a
record containing none of it, and no record path can reach `claim.text`.

**O-6 · Nothing about the reading store moves.**
A refusal still stores no reading (07C). Atomic all-or-nothing acceptance is
untouched. **A refusal record is telemetry about the machine; it is not a
reading, not an observation, and must not be reachable from any surface that
presents readings.**
*Falsifier:* after a refusal, `listReadings` returns exactly what it returned
before, and the DEVELOP room still shows "MAIA has not read this work
developmentally yet."

---

## 5 · Founder rulings — 2026-09-08. BUILD AUTHORIZED.

**R-1 · Keep the existing refusal codes; add orthogonal cause context.**
`claim_unbindable`, `malformed_output` and the rest continue to say *what
failed*. `output_truncated` is NOT invented as another semantic refusal —
that would collapse two independent dimensions into one. Carried alongside:

```
completion  : complete | truncated | unknown
attribution : contract_violation | system | unknown
stopReason  : the seam's value, verbatim
usage       : input + output tokens
```

*A response can, in principle, contain a genuine contract violation AND
terminate at a token boundary.* One axis cannot express that; two can.

**R-2 · The operator record is a dedicated persistent JSONL file family — not a
table, and not `auditLogger`.**
Production already mounts `audit_data:/app/data/audit-logs` with
`AUDIT_LOG_DIR=/app/data/audit-logs` (`docker-compose.production.yml:123,190-192`),
volume-backed so it survives container swaps. This lane uses that substrate in
its own subdirectory with its own writer. It does **not** reuse
`lib/security/auditLog.ts`: that carries a broader security-audit schema, and
`replicateToExternalService` fires on every production write
(`auditLog.ts:88-90,117`) — refusal telemetry must not leave the host. It has no
deletion mechanism either, which R-3 requires.

**R-3 · Retention is a hard seven days.**
Daily JSONL files; records physically removed after seven rolling days. **This
may not be "prune the next time a refusal happens"** — the falsifier must prove
an expired record disappears when no later refusal ever occurs. Nothing becomes
forever by accident.

**R-4 · Copy is one neutral outcome sentence plus one cause line.**
MAIA is no longer blamed *at all*, including when a protocol violation is
proven:

```
This reading could not be completed, so nothing was kept.
Your work has not changed.
```

then exactly one of:

```
proven contract violation → The result came back in a form the Studio could not
                            verify safely.
proven truncation         → The result ended before it was complete.
unknown                   → The Studio could not determine the cause.
```

More durable than a growing tree of bespoke sentences, and it retires
"MAIA's reading did not hold to its own rules" outright.

**Authorized:** BUILD, under R-1…R-4 and the corrected O-5.
**Not authorized:** any table · any migration · any reading-store change ·
retry · `DEFAULT_MAX_TOKENS` · hierarchical reading.

## 6 · Not in this lane

`DEFAULT_MAX_TOKENS` · the binder · atomic acceptance · retry · hierarchical
reading · the `section-run` instruction (that is #1266) · BRANCH GATE.

> A refusal that is honest about *what happened* and silent about *why* is not
> yet an honest refusal. It only looks like one because the member cannot see
> the difference.
