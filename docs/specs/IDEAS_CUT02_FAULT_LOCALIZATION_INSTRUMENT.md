# Ideas Fault-Localization Instrument — Specification

**Lane:** `feature/ideas-cut02-fault-localization-instrument`
**Base:** `33b83fe` (narrowed INV-2), which contains `65dd0aa` (ratified Cut 0–2 repair contract)
**Opened:** 2026-09-02
**Status:** SPECIFICATION — **not ratified, not implemented**
**Authorization:** Specification only. No code, prompt, schema, migration, merge, or deployment change under this lane.

---

## 0. What this lane is, and what it is not

This instrument exists to close one narrowly stated defect, recorded in
`IDEAS_CUT02_INV2_ASK_MAIA_500.md` §2:

> The current route does not guarantee durable, stage-localizing evidence.

**It is not a repair.** It fixes no fault, changes no member-visible behavior,
and does not reproduce the witnessed 500. Its whole product is *evidence*.

**Sequencing constraint (ratified 2026-09-02):**

> Only after this instrument is **witnessed** may the 500 be reproduced or any
> candidate in INV-2 §4.2 be repaired.

"Witnessed" means §6's proof obligations have been satisfied *and* the
instrument has been exercised under real member use — the same standard applied
to Cut 0–2. A green test suite is not a witness.

**Explicitly out of scope:** C3 (unguarded `content[0]`) and C5 (unbounded
`lastDecision` / `ideaFraming`). Both are demonstrated defects held outside the
INV-2 verdict, and both must remain unrepaired while this lane runs — repairing
either would alter the very seam the instrument is meant to observe before it
has ever observed it.

---

## 1. The member action is the unit, not the request

The failure was witnessed as **one member act** — write, choose Distill, ask —
that crosses **two HTTP requests**:

```
POST /api/ideas/[id]/blocks     (autosave)
POST /api/ideas/[id]/ask-maia   (reflection)
```

No server-side identifier spans both. The autosave that *succeeded* and the
reflection that *failed* are, to an operator, unrelated events. This is why the
instrument is defined over an **attempt**, not a request.

### 1.1 Attempt ID

One `attempt_id` (UUIDv4) is minted **client-side** in `handleAskMaia`, before
the autosave, and sent on both requests as a header:

```
x-idea-attempt-id: <uuid-v4>
```

The client is the only participant that sees the whole member act, so the ID
must originate there. That makes it **untrusted input**, with three
non-negotiable consequences:

1. **Shape-validated** against the existing `UUID_RE` and **rejected silently**
   (the attempt proceeds; the record is written with a server-minted ID and a
   `attempt_id_source: 'server'` marker). A malformed correlation header must
   never fail a member's request.
2. **Never load-bearing.** It is never used for authorization, ownership, row
   lookup, or any control-flow decision. It is a join key for reading records
   after the fact, nothing more.
3. **Never a cross-member join key.** Every read of these records is scoped by
   server-resolved `member_id`. A client that replays another attempt's ID
   correlates only within its own member scope.

---

## 2. Stage map

Each seam emits at most one record. The stage vocabulary is closed — a new seam
requires an amendment to this table, not an ad-hoc string.

| Stage | Seam | Location |
|---|---|---|
| `attempt_open` | member act begins | client `handleAskMaia` |
| `autosave_write` | note block INSERT | `blocks/route.ts` |
| `session_resolve` | `getCurrentSession()` | `ask-maia/route.ts:93` |
| `idea_fetch` | ownership + title/framing | `:124` |
| `context_read_blocks` | recent block slice | `:137` |
| `context_read_decision` | last decision | `:150` |
| `context_read_reflections` | prior reflections | `:163` |
| `context_read_count` | reflection count | `:179` |
| `model_client_init` | `new Anthropic(...)` | `maiaThreadReflection.ts:261` |
| `model_call` | `messages.create(...)` | `:279` |
| `model_parse` | response block selection | `:286` |
| `recognition` | gated recognition block | `ask-maia/route.ts:217` |
| `persist_reflection` | `maia_reflection` INSERT | `:275` |
| `touch_idea` | `last_entered_at` UPDATE | `:323` |
| `attempt_close` | terminal outcome | `ask-maia/route.ts` |

`model_client_init`, `model_call`, and `model_parse` are separated
deliberately: they are three of INV-2's ranked candidates (C1, C2, C3) and are
today indistinguishable at the boundary.

---

## 3. Record shape

Operator-facing only. Every field is either a fixed enum, a numeric measure, or
an identifier — **never content**.

```
attempt_id            uuid          correlation key (§1.1)
attempt_id_source     enum          client | server
member_id             uuid          server-resolved, never client-supplied
idea_id               uuid
stage                 enum          §2
outcome               enum          ok | fail
error_class           enum | null   §3.1
upstream_status       int  | null   HTTP status from the model provider
upstream_request_id   text | null   provider request id, verbatim
upstream_error_type   text | null   provider error type slug (e.g. overloaded_error)
retryable             bool | null   whether the class is SDK-retried (see §3.2)
duration_ms           int
stance                enum | null   already recorded in block metadata
prompt_chars          int  | null   size only, on model_call — never the prompt
occurred_at           timestamptz
```

### 3.1 Error classification

Closed enum. Assigned at the seam that raised, never inferred later:

`auth` · `not_found` · `validation` · `db_read` · `db_write` ·
`model_config` · `model_upstream` · `model_parse` · `recognition` · `unknown`

`unknown` is a real outcome, not a placeholder. A fault that lands there is a
gap in this table and is an amendment trigger.

### 3.2 The `retryable` field earns its place

INV-2 §4.2 C2 is held **unranked** precisely because the SDK retries only
*particular* error classes, and the witnessed error's class was never captured.
Recording `upstream_status`, `upstream_error_type`, and whether that class falls
inside the SDK's retry set is what makes C2 rankable on a future occurrence. It
is the single field that converts C2 from open to decidable.

---

## 4. Boundaries (hard)

These are refusals, not preferences.

1. **No member text.** Not block content, not `framing`, not `title`, not the
   composed prompt, not the model's output. `prompt_chars` records size; nothing
   records substance.
2. **No secrets.** `model_config` records *that* client construction failed and
   its error class. It never records the environment variable's value, and the
   raw provider message is not persisted verbatim — only the classified enum and
   the structured upstream fields in §3.
3. **Nothing reaches the member.** `describeFailure`
   (`app/maia/ideas/[id]/page.tsx:304–319`) renders `body.error` **verbatim** to
   the member. Therefore the 500 response body stays **byte-identical**:
   `{ error: 'Failed to generate reflection' }`. No stage, no class, no
   `attempt_id`, no upstream id in any response body or header. This is the
   leak-surface constraint from INV-2 §6.1, and it is the reason the instrument
   is operator-only by construction rather than by convention.
4. **Sanctuary Mode.** The record contains no content, so it does not constitute
   memory. `isSanctuaryModeActive` is nonetheless honored: under Sanctuary the
   durable tier (§5, T2) is not written and only the ephemeral tier remains,
   consistent with "log that a session occurred, never content."
5. **Not memory.** These records are operational telemetry. They are never read
   into any prompt, never surfaced to MAIA, never enter atoms, semantic memory,
   or any member-facing surface, and they carry a bounded retention window
   (proposed: 30 days) rather than accumulating indefinitely.

---

## 5. Two tiers, because the defect has two parts

INV-2 §2 names two failures — *not stage-localized* and *not durable*. They are
closed by different mechanisms, and shipping only the first would leave half the
defect standing.

**T1 — structured stage log (no schema change).**
One JSON line per record to stdout under a stable marker, e.g.
`[ideas/attempt]`. Closes **stage-localization** immediately. Does **not** close
durability: stdout is exactly the store that dies with the restart which
repeatedly precedes a successful retry.

**T2 — durable operator table (requires migration + separate ratification).**
`idea_reflection_attempts`, indexed on `(member_id, occurred_at)` and
`(attempt_id)`, written fire-and-forget on the `decisionChangeRecognition`
pattern — a `void`-returning function with an internal `.catch()`, so a
telemetry write **can never fail a member's reflection**. Closes **durability**.

T1 may ship first. **The defect is not closed until T2 is live**, and this
document should not be cited as having closed it before then.

---

## 6. Proof obligations

Each seam must be shown to produce a **distinct, correct signal**. Failures are
induced by mocking the dependency at its module boundary under Jest — the
project's configured runner (`jest --config jest.config.js`; the `vitest`
devDependency is unconfigured and must not be used).

**No runtime fault-injection flag is specified, and none may be added.** An
injection surface reachable in a running process is a larger risk than the
defect it would prove, and it would create exactly the "internal error exposed"
condition §4.3 refuses.

| # | Obligation |
|---|---|
| **P1** | Each stage in §2 emits exactly one record; no seam is silent, none double-emits |
| **P2** | Each induced failure yields the correct `error_class`; classes do not collapse into one another |
| **P3** | `model_client_init`, `model_call`, and `model_parse` are **mutually distinguishable** — the C1/C2/C3 discrimination that motivates the lane |
| **P4** | An empty `content` array is classified `model_parse` **without repairing C3** — the instrument observes the defect, it does not fix it |
| **P5** | A provider error records `upstream_status`, `upstream_request_id`, `upstream_error_type`, and `retryable` when the SDK exposes them |
| **P6** | `attempt_id` correlates the autosave record and the ask-maia records across the two requests |
| **P7** | A malformed or absent `x-idea-attempt-id` never fails the member's request; a server ID is minted and marked |
| **P8** | The 500 response body is **byte-identical** to today's; no stage, class, or id appears in any response body or header |
| **P9** | No record contains member text, prompt text, model output, or any secret — asserted over the serialized record, not by inspection |
| **P10** | The autosave-then-abort ordering is unchanged: the note persists, no partial `maia_reflection` is written, the member-facing string is unchanged |
| **P11** | A telemetry write failure does not fail the reflection (T2 fire-and-forget) |
| **P12** | Under Sanctuary, T2 is not written and no content appears in T1 |

---

## 7. Acceptance gate

All must hold. Any single failure means the instrument does not ship.

- P1–P12 pass under `npm test`.
- `npm run typecheck` green — **no-regression**, not "everything typechecks"
  (`CLAUDE.md` §Before Making Changes).
- `npm run check:no-supabase` and `npm run preflight` clean.
- Co-Lab release gate 31/31 if any migration lands (T2).
- **Member-facing diff is empty.** The rendered workspace, the composer, the
  failure copy, and every response body are unchanged. If a member can tell this
  shipped, it is wrong.

---

## 8. Sovereignty Invariant Check

**Does this increase member agency?** Neutral. It is invisible to the member by
construction (§4.3, §7). It increases the *operator's* ability to keep a promise
already made to the member — that a failure will not cost their words.

**Does it push life outward?** Neutral.

**Does it reduce the system's psychological centrality?** Neutral.

**Invariant 14 — cultural sovereignty.** No framework is imposed; the record
contains no interpretation of the member, only mechanical facts about the
system's own execution.

**Invariant 17 — explicit member direction precedes inferred state.** Untouched.
`stance` is recorded as already stored in block metadata, and nothing here reads
or infers member state.

### Growth-obligation check (`RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04`)

*What uncertainty does this introduce, and how is it preserved?*
A newly legible failure record invites the inference that a *classified* fault
is an *understood* one. `error_class` names the seam that raised, never the
cause. `unknown` is retained as a real outcome and as an amendment trigger, so
the taxonomy cannot quietly close over faults it does not actually cover.

*What provenance and ownership boundaries does it require?*
`attempt_id` is member-supplied and therefore untrusted, never load-bearing, and
never a cross-member join key (§1.1). Every read is scoped by server-resolved
`member_id`. The records are operational telemetry, not memory (§4.5), and are
never read back into any prompt.

*What new responsibility does this capability create?*
Observability is retention. This lane creates a store of per-member failure
events, so it accepts a bounded retention window, an operator-only access
boundary, and a content prohibition asserted by test (P9) rather than by
discipline.

---

## 9. Status

**SPECIFICATION — awaiting ratification.** Nothing here is implemented. On
ratification, T1 and its proof obligations may be built on this lane; T2's
migration requires its own authorization.

*No code, prompt, schema, migration, merge, or deployment change was made.*
