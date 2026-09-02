# Ideas Fault-Localization Instrument — Specification

**Lane:** `feature/ideas-cut02-fault-localization-instrument`
**Base:** `33b83fe` (narrowed INV-2), which contains `65dd0aa` (ratified Cut 0–2 repair contract)
**Opened:** 2026-09-02
**Status:** **RATIFIED SPECIFICATION CONTRACT** (2026-09-02) — **not implemented**
**Authorization:** Ratification authorizes **finalizing this specification only**. It does **not** authorize T1 or T2 implementation, schema work, fault repair, merge, or deployment.

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

### 1.1 Two identifiers, two authorities *(binding precision 1)*

The instrument carries **two** identifiers with **different origins and
different trust**. They are never interchangeable.

| | `attempt_id` | `request_id` |
|---|---|---|
| Minted by | **client**, in `handleAskMaia`, before the autosave | **server**, once per HTTP request |
| Spans | the whole member act (both requests) | exactly one request |
| Trust | **untrusted input** | server-authoritative |
| Answers | *"which member act was this?"* | *"which execution was this?"* |

`attempt_id` (UUIDv4) is sent on both requests as a header:

```
x-idea-attempt-id: <uuid-v4>
```

The client is the only participant that sees the whole member act, so that ID
must originate there — which is exactly why it cannot be trusted. `request_id`
exists because a retried or duplicated `attempt_id` would otherwise make two
distinct executions indistinguishable in the record.

**Neither identifier may authorize, select, or mutate member data.** Member and
idea scope come **only** from authenticated server context
(`getCurrentSession()` → `member_id`, and the ownership-checked `idea_id`). This
is absolute and applies to both IDs equally.

Three further consequences follow for `attempt_id` specifically:

1. **Shape-validated** against the existing `UUID_RE` and **rejected silently**
   (the attempt proceeds; the record is written with a server-minted ID and a
   `attempt_id_source: 'server'` marker). A malformed correlation header must
   never fail a member's request.
2. **Never load-bearing.** It is never used for authorization, ownership, row
   lookup, or any control-flow decision. It is a join key for reading records
   after the fact, nothing more.
3. **Never a cross-member join key.** Every read of these records is scoped by
   server-resolved `member_id`. A client that replays another attempt's ID
   correlates only within its own member scope, and `request_id` still separates
   the executions.

---

## 2. Stage map and lifecycle

### 2.1 Entry and resolution *(binding precision 2)*

Every risky seam emits **`entered` first**, then **`completed` or `failed`**.

A single terminal record per seam is not sufficient: a process that dies
*between* two calls emits nothing at all, and the seam it died in stays
invisible — which is the exact shape of the witnessed incident, where a restart
preceded the successful retry. Paired events make interruption legible as
interruption.

**Under T2, the last durable `entered` event with no matching resolution
localizes an interrupted seam.** This is the property that converts "the process
died somewhere in this route" into "the process died in `model_call`", and it is
the single strongest reason T2 is not optional.

An `entered` with no resolution is therefore **not** a defect in the
instrument — it is the instrument's most informative output. Readers of these
records must not treat unresolved entries as missing data.

### 2.2 Stages

The stage vocabulary is closed — a new seam requires an amendment to this table,
not an ad-hoc string.

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

`attempt_open` and `attempt_close` are the outer bracket; the twelve seams
between them are the ones that emit paired `entered`/resolution events per
§2.1.

---

## 3. Record shape

Operator-facing only. Every field is either a fixed enum, a numeric measure, or
an identifier — **never content**.

```
attempt_id            uuid          member-act correlation, client-minted (§1.1)
attempt_id_source     enum          client | server
request_id            uuid          server-minted, one per HTTP request (§1.1)
member_id             uuid          server-resolved ONLY, never client-supplied
idea_id               uuid          ownership-checked server context ONLY
stage                 enum          §2.2 — closed vocabulary
event                 enum          entered | completed | failed  (§2.1)
error_class           enum | null   §3.1 — set only when event = failed
upstream_status       int  | null   HTTP status from the model provider
upstream_request_id   text | null   provider request id, verbatim
upstream_error_type   text | null   provider error type slug (e.g. overloaded_error)
retryable             bool | null   whether the class is SDK-retried (§3.2)
stack_fingerprint     text | null   §4.5 — hash, not a stack
source_frames         text[]| null  §4.5 — allowlisted repo-relative frames only
runtime_revision      object        composite runtime identity (§3.3) —
                                    { git_commit, source_state, build_digest,
                                      source_digest, digest_scope }
taxonomy_version      int           stage/error-class schema version (§3.3)
duration_ms           int  | null   null on `entered`
stance                enum | null   already recorded in block metadata
prompt_chars          int  | null   size only, on model_call — never the prompt
occurred_at           timestamptz
```

`outcome` from the pre-ratification draft is replaced by `event`, which carries
the §2.1 lifecycle. There is no separate ok/fail field: `completed` and `failed`
*are* the outcome.

### 3.1 Error classification

Closed enum. Assigned at the seam that raised, never inferred later:

`auth` · `not_found` · `validation` · `db_read` · `db_write` ·
`model_config` · `model_upstream` · `model_parse` · `recognition` · `unknown`

`unknown` is a real outcome, not a placeholder. A fault that lands there is a
gap in this table and is an amendment trigger — and an amendment increments
`taxonomy_version` (§3.3).

### 3.3 Evidence is bound to the runtime that produced it *(binding precision 3, amended)*

Every event carries **`runtime_revision`** (the composite identity of the code
that actually executed) and **`taxonomy_version`** (the version of the stage and
error-class vocabularies that assigned it).

#### 3.3.1 Why a composite, not a SHA *(evidence-integrity amendment, 2026-09-02)*

The first ratified draft bound events to `git_commit` alone. **A SHA does not
uniquely identify a local-dev runtime.** A dev server executes whatever is on
disk, and Fast Refresh replaces modules inside a live process — so it can report
the last committed SHA while running code that commit never contained. An event
bound to `git_commit` alone would then appear *admissibly* bound to code it did
not run.

This is not hypothetical for this investigation. **The only occurrence in
evidence — the witnessed 500 — happened on exactly this runtime class**, on a
dev server, and cleared after that process was restarted. Binding its successor
events to a bare SHA would reproduce, inside the evidence layer, the same
runtime/tree confusion this programme has already met in the deploy lane
(`GIT_COMMIT=unknown`, and the 2026-07-27 shared-checkout incident that produced
the immutable-SHA deploy).

#### 3.3.2 `runtime_revision`

| Field | Meaning |
|---|---|
| `git_commit` | SHA reported by the running process |
| `source_state` | `clean` · `dirty` · `unknown` — whether the served tree matches that commit |
| `build_digest` | immutable build/image digest **when available** (container image digest in production) |
| `source_digest` | exact source-or-patch digest, required for dirty evidence to be admissible |
| `digest_scope` | `emission` · `process_start` — **when** the digest was computed (§3.3.4) |
| `digest_subject` | `disk_tree` · `loaded_modules` — **what** was digested (§3.3.4) |
| `digest_alg` | canonical algorithm + input-set identifier, e.g. `sha256/src-v1` (§3.3.6) |

In production the deploy lane already supplies what this needs: an immutable
image built from a `git archive` snapshot of a named SHA, with a fail-closed
post-swap provenance verify. The instrument **reads** that identity; it does not
introduce a second provenance mechanism. The composite exists for the runtimes
the deploy lane does not govern.

#### 3.3.3 Admissibility ladder

| Revision | Admissible for |
|---|---|
| **Clean and verifiable** — `source_state: clean` with `build_digest`, or a clean tree at a known `git_commit` | **Claims about a committed or deployed runtime.** Full admissibility |
| **Dirty with an exact `source_digest`** | Claims about **that digest only** — never about a committed or deployed runtime. The digest is the referent, not the branch it sat on |
| **Dirty or `unknown` with no digest** | **Immediate diagnosis only.** May guide a live investigation; may not support any claim about committed or deployed code, and may not be ranked as though it could |

The middle row is the one that keeps dev evidence usable without letting it
inflate: a fault reproduced on a dirty tree is real, and it is evidence *about
that tree*. Naming the tree exactly is what separates it from evidence about
`main`.

#### 3.3.4 Two independent axes: *when* and *what*

A digest is under-specified by timing alone. Two orthogonal questions must both
be answered, and answering one does not answer the other.

**`digest_scope` — when.** A digest computed at process start can be **stale by
the time an event is emitted**; Fast Refresh mutates the served modules inside a
live process. `process_start` scope on a dev runtime therefore **cannot reach
the top row** of §3.3.3 no matter how clean the tree was at boot: it establishes
what the process *started* as, not what it *ran*.

**`digest_subject` — what** *(amended 2026-09-03).* `emission` timing does not
by itself close the gap, because a digest taken at emission is still, in the
ordinary implementation, a digest of **files on disk** — and disk is not the
process. Under Fast Refresh the two can diverge in both directions: a module
compiled into the live process may predate an edit already on disk, and an edit
on disk may have failed to apply to the running process at all.

> **A `disk_tree` digest may never be described as a digest of the modules
> actually loaded or served.** It may be *labelled* `disk_tree` and used as
> such. It may be treated as equivalent to `loaded_modules` **only where that
> equivalence is proven** — which, under Fast Refresh, it is not.

Consequences for §3.3.3:

| `digest_subject` | Ceiling |
|---|---|
| `loaded_modules` | May support the row its `source_state` and `digest_scope` allow |
| `disk_tree`, on a runtime with **no** module-replacement mechanism (production container, `next start`) | Equivalence is structural, so it may support the same rows |
| `disk_tree`, on a runtime **with** Fast Refresh or any hot-replacement | **Diagnosis only.** It is honest evidence about a tree, and is not evidence about an execution |

The production path is unaffected: an immutable image has no module-replacement
mechanism, so `disk_tree` there *is* what ran. The distinction bites exactly
where the witnessed 500 occurred.

#### 3.3.6 The digest must be canonical and reproducible

A digest that cannot be recomputed is an identifier, not evidence. Any
implementation must therefore declare, in `digest_alg`:

1. **The hash function**, pinned.
2. **The covered input set**, explicitly enumerated — not "the repo". Path
   ordering, path normalization (repo-relative, never absolute), and the
   treatment of untracked and ignored files are all part of the definition.
3. **Byte-exactness.** Content is hashed as bytes. Normalizing line endings or
   formatting would make the digest describe a *rendering* of the tree rather
   than the tree, and two different executions could then share one digest.
4. **Reproducibility.** The same tree yields the same digest on any machine, any
   OS, any checkout path, at any later date. If it cannot be recomputed by a
   third party from the same inputs, it does not discharge §3.3.3's middle row.

**What the input set excludes is part of the claim.** A source-only digest does
not cover `node_modules`, the lockfile, or environment. This is not academic
here: **C2's rankability turns on which error classes the SDK retries**, which
is dependency behavior, not source behavior. A source-only digest therefore
cannot support a claim about SDK-level conduct; a claim of that kind needs the
lockfile digest inside the covered set. Any use of a digest must be read against
what it covers, and a digest must never be cited past its input set.

#### 3.3.5 Reporting rule

An inadmissible or partially admissible revision must be **surfaced as such** at
the point of use — reported, not silently ranked. Evidence that cannot support a
runtime claim must never be quietly counted as though it could; that is the
inflation this programme refuses in every other layer, and the evidence layer
gets no exemption.

*Why `taxonomy_version`:* stage names and error classes will be amended as
`unknown` faults are discovered. Without a version, records from before and
after an amendment silently mean different things while looking identical —
which would reproduce, in the evidence layer, exactly the provenance-blind
continuity named as Finding F in the Cut 0–2 witness.

### 3.2 The `retryable` field earns its place

INV-2 §4.2 C2 is held **unranked** precisely because the SDK retries only
*particular* error classes, and the witnessed error's class was never captured.
Recording `upstream_status`, `upstream_error_type`, and whether that class falls
inside the SDK's retry set is what makes C2 rankable on a future occurrence. It
is the single field that converts C2 from open to decidable.

---

## 4. Boundaries (hard)

These are refusals, not preferences.

**0. Sanitize structurally, not by review** *(binding precision 4).* The
instrument **never serializes an `Error`, a response body, a prompt, a stack, or
member text wholesale** — not truncated, not redacted, not "cleaned". There is
no path from a raw object to a record.

Construction is **allowlist-only**: a record is assembled field-by-field from
§3's list, and a field that is not on that list has no way to be written. This
is a structural property, not a discipline — `JSON.stringify(error)`,
spreading an error object, or persisting `error.message` are all absent from
the design rather than discouraged in it. The distinction matters because
redaction is a review activity that fails silently, while an allowlist fails
closed.

**Instrument failure must not alter the member's request outcome.** A telemetry
write that throws, times out, or is unavailable changes nothing the member
experiences: not the status, not the body, not whether their note persisted, not
whether a reflection was produced. The instrument is strictly observational at
the boundary (see §5 T2's fire-and-forget shape, and P11/P14).

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
5. **Sanitized stack evidence only** *(§4.5).* A raw stack is never persisted.
   Two derived artifacts are permitted, both computed at the raising seam:
   - `stack_fingerprint` — a stable hash over the normalized top frames, with
     `node_modules` frames collapsed to their package name. It answers *"is this
     the same fault as last time?"* without carrying what the fault said.
   - `source_frames` — an allowlisted array of **repo-relative `path:line`
     frames only**. Absolute paths, home directories, and any frame outside the
     repository are dropped, not rewritten.

   Neither may contain an error message, an argument value, or interpolated
   text. A stack whose frames cannot be normalized yields `null`, never a
   partial dump.

6. **Not memory.** These records are operational telemetry. They are never read
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
`idea_reflection_attempts`, indexed on `(member_id, occurred_at)`,
`(attempt_id)` and `(request_id)`, written fire-and-forget on the
`decisionChangeRecognition` pattern — a `void`-returning function with an
internal `.catch()`, so a telemetry write **can never fail a member's
reflection** (§4.0, P11, P14). Closes **durability**, and with it the
interrupted-seam property of §2.1: the last durable `entered` with no
resolution names the seam a dying process was inside. T1 cannot provide this,
because the process death takes the stdout with it.

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
| **P1** | Each seam in §2.2 emits exactly one `entered` and exactly one resolution (`completed` or `failed`); no seam is silent, none double-emits |
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
| **P13** | A process killed mid-seam leaves a durable `entered` with no resolution, and that record **names the seam** (T2; §2.1) |
| **P14** | A telemetry path that throws, rejects, or is unavailable leaves the member's status, response body, saved note, and reflection outcome **bit-for-bit unchanged** (§4.0) |
| **P15** | `attempt_id` and `request_id` are proven non-authorizing: a forged, replayed, or foreign `attempt_id` selects, authorizes, and mutates **nothing** — scope is asserted to come only from `getCurrentSession()` and the ownership-checked idea (§1.1) |
| **P16** | Every event carries a complete `runtime_revision` and `taxonomy_version`. The §3.3.3 ladder is enforced: clean-and-verifiable is admissible; dirty **with** an exact `source_digest` is admissible **only as a claim about that digest**; dirty or `unknown` **without** a digest is surfaced as **diagnosis-only and inadmissible for any committed-or-deployed runtime claim**, never silently ranked. `digest_scope: process_start` on a dev runtime cannot be reported as fully admissible (§3.3.4) |
| **P18** | `digest_subject` is recorded and enforced: a `disk_tree` digest is never reported as evidence of loaded modules on a hot-replacement runtime, and is capped at diagnosis-only there (§3.3.4) |
| **P19** | `digest_alg` names a pinned hash and an explicitly enumerated input set; the digest is byte-exact and **recomputable by a third party** from the same inputs, on a different machine and checkout path. A claim about dependency-level behavior (e.g. SDK retry classes, C2) is refused unless the lockfile is inside the covered set (§3.3.6) |
| **P17** | No record contains a serialized `Error`, response body, prompt, raw stack, or absolute path. `stack_fingerprint` is stable across occurrences of the same fault and carries no message; `source_frames` are repo-relative only, and an un-normalizable stack yields `null`, never a partial dump (§4.0, §4.5) |

---

## 7. Acceptance gate

All must hold. Any single failure means the instrument does not ship.

- P1–P19 pass under `npm test`.
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

## 9. Status and standing

**RATIFIED SPECIFICATION CONTRACT — 2026-09-02**, amended 2026-09-02
(`runtime_revision`) and 2026-09-03 (`digest_subject` + canonical digest).
Ratified with four binding precisions, incorporated above:

| # | Precision | Where |
|---|---|---|
| 1 | Two identifiers, two authorities; neither authorizes, selects, or mutates | §1.1 |
| 2 | `entered` then `completed`/`failed`; last durable `entered` localizes an interrupted seam | §2.1, §5 T2, P13 |
| 3 | Every event bound to `runtime_revision` + `taxonomy_version` *(amended 2026-09-02: composite, not a bare SHA — a SHA does not identify a dev runtime; amended 2026-09-03: `digest_subject` separates disk from process, and the digest must be canonical and reproducible)* | §3.3, P16, P18, P19 |
| 4 | Allowlist-only construction; no wholesale serialization; instrument failure cannot alter the member's outcome | §4.0, §4.5, P14, P17 |

**What ratification authorizes:** finalizing this specification. Nothing else.

**What it does not authorize** — each still requires its own act:

| | Status |
|---|---|
| T1 implementation | **not authorized** |
| T2 implementation / schema / migration | **not authorized** |
| Reproducing the witnessed 500 | **not authorized** — gated behind §0, witnessing the instrument |
| Repairing C3 or C5 | **not authorized** — demonstrated defects, not causal findings |
| Merge or deployment | **not authorized** |

**Standing of the surrounding lanes, restated on ratification:**

- **T1** closes seam distinction **only**.
- **T2** closes durable preservation, subject to retention and operator access.
- **INV-2 incident** remains **open**; this occurrence remains **unassignable**.
- **C3 and C5** are independently demonstrated, **not causal findings**, and
  **not authorized for repair**.

*No code, prompt, schema, migration, merge, or deployment change was made.*
