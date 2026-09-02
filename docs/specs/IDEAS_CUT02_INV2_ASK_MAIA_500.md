# INV-2 — The Unexplained `/ask-maia` 500

**Lane:** `feature/ideas-cut02-inv2-ask-maia-500`
**Base:** `65dd0aa` (ratified Cut 0–2 repair contract)
**Opened:** 2026-09-02
**Status:** OPEN — diagnosis only
**Authorization:** Investigation only. *No repair, prompt, schema, migration, merge, or deployment change.* Failures may be diagnosed and reported, not repaired.
**Sibling lanes:** INV-1 (§5.3(4) attribution enforceability) — CLOSED, ratified at `ade2ce3`. Semantic-drift investigation (§7.1) — remains CLOSED.

---

## 1. The observed event

During the Cut 0–2 experiential witness, a single `POST /api/ideas/[id]/ask-maia`
returned **HTTP 500**. Recorded conditions:

| Condition | Value |
|---|---|
| Stance selected | **Distill** |
| Thread depth | Late — multiple prior MAIA reflections in-thread |
| Member's entry | **Saved.** The autosaved `note` block persisted; nothing was lost |
| MAIA block | Not created |
| Member-facing text | *"MAIA couldn't respond just now. Your thread is unchanged."* |
| Retry | **Succeeded**, after a dev-server restart |
| Server trace | **Never captured.** No stack, no error class, no request id |

---

## 2. The governing finding

> **The current route does not guarantee durable, stage-localizing evidence.**

`app/api/ideas/[id]/ask-maia/route.ts` wraps the entire handler — ~240 lines,
five database reads, one third-party API call, one insert, one update — in a
**single `try`** terminating in **one `catch`** that emits:

```ts
console.error('[ideas/ask-maia] failed:', error);           // line 333
return NextResponse.json(
  { error: 'Failed to generate reflection' }, { status: 500 }  // lines 334–337
);
```

Every distinct fault in §4 collapses into the same status code, the same
member-facing string, and the same operator-facing log line. Nothing is
persisted, nothing is classified, no request id is retained. The only record of
the cause lives in the process's stdout — **in the process whose restart is the
act that appears to "fix" it.**

This is a **Cut 0-class observability defect**, of the same family as the silent
12,000-character truncation: a failure the system experiences but does not
report.

**The claim is bounded — narrowed on ratification 2026-09-02.** It is *not*
that no future occurrence could ever be assigned. A captured stack frame or an
upstream `request_id` would assign a future failure on its own. The defect is
narrower and structural, and it has two parts:

1. **Not stage-localized.** Session resolution, five context reads, the model
   call, response parsing, and MAIA persistence are indistinguishable at the
   boundary. The response says which *route* failed, never which *seam*.
2. **Not durable.** The only cause-bearing record is process stdout, which
   does not survive the restart that repeatedly precedes a successful retry.

Assignment is therefore left to chance — whether an operator happens to be
watching the right process at the right moment — rather than guaranteed by the
system. That is the finding.

**Corollary for the incident:** the fault classes in §4 can be *ranked* but not
*assigned*, because for **this** occurrence no such evidence was preserved. Any
statement of the form "the 500 was caused by X" would be inference presented as
observation — the exact failure mode this lane exists to refuse.

---

## 3. Verified-correct behavior — do not "fix" this

The autosave-then-abort ordering in `app/maia/ideas/[id]/page.tsx:321–383`
is **correct and load-bearing**, and the 500 is the case that proves it:

1. Pending composer draft is saved as a `note` **before** the MAIA call (L334–342).
2. If the save fails, Ask MAIA **aborts** and the text stays in the composer (L343–352).
3. Only then is `/ask-maia` called (L365).
4. A non-`ok` response sets `composerError` and adds no block (L371–374).

Under the observed 500, this produced exactly the right outcome: the member's
words were durable, the thread carried no partial MAIA artifact, and the retry
was a clean re-ask against saved state.

**Constraint on any future repair:** deferring the note save until after a
successful reflection — a plausible-looking "don't write on failure"
simplification — would reintroduce content loss on the precise failure this
investigation is about. The write ordering is not incidental.

---

## 4. Static fault enumeration

Every path inside the single `try` that can reach the `catch`. Route line
numbers are `app/api/ideas/[id]/ask-maia/route.ts`; primitive line numbers are
`lib/team/maiaThreadReflection.ts`.

### 4.1 Faults that CANNOT be the cause (excluded)

| Path | Line | Why excluded |
|---|---|---|
| Body parse / unknown stance | 108–121 | Has its own `catch` → **400**, never reaches the 500 catch |
| Unauthenticated | 93–96 | Returns **401** |
| Malformed idea id | 99–101 | Returns **400** |
| Idea not owned / missing | 130–132 | Returns **404** |
| `getRecentRecognitionEvents` | 221 | Internally caught; returns `[]` on any DB error (`decisionChangeRecognition.ts:609–618`) |
| `storeRecognitionEvent` | 293, 308 | Returns `void`; rejection handled by `.catch()` (`decisionChangeRecognition.ts:574–580`). Cannot reject into the handler |
| `runRecognition` | 238 | Synchronous, but the whole recognition block is gated by `isRecognitionEnabled()` (28–37), which is **default-OFF** — requires both a global env flag and a member UUID allowlist |
| `max_tokens: 300` truncation | 281 | Truncation yields `stop_reason: "max_tokens"` with a **valid text block**. Produces a clipped reflection, not a throw. Distinct defect, distinct lane |
| `parseInt(rows[0]?.count ?? '0')` | 185 | Optional-chained and defaulted; cannot throw |

### 4.2 Candidate causes, ranked

Ranking is by fit against the three observed conditions — **(i)** Distill /
deep thread, **(ii)** succeeded on retry, **(iii)** the retry followed a
server restart. Condition (iii) is the strongest discriminator, because it
selects for **process-level state** over per-request state.

---

**C1 — `ANTHROPIC_API_KEY` absent or unloaded in the running process**
`maiaThreadReflection.ts:261` — `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`

The client is constructed **per call**, inside the request, inside the `try`.
If the SDK constructor rejects a missing/empty key, it throws synchronously
at that line and lands in the generic catch. A restart reloads the environment
file — which is precisely condition (iii).

*Fit:* strongest against (iii). Neutral on (i) and (ii).
*Unverified:* `node_modules` is not present in this container, so
`@anthropic-ai/sdk@^0.27.3` constructor behavior on an undefined key could not
be confirmed empirically. **Do not treat this ranking as established.**
*Discriminating evidence:* the swallowed `console.error` string would name the
environment variable directly.

---

**C2 — Transient upstream Anthropic API error**
`maiaThreadReflection.ts:279` — `client.messages.create(...)`

429 / 500 / 529 / connection reset rejects the promise → generic catch.

*Fit:* strongest against (ii); explains (i) weakly via payload size (see C5).
*Standing:* **UNRANKED without the original error** — corrected on ratification
2026-09-02. An earlier draft of this document demoted C2 on the grounds that the
SDK's default `maxRetries: 2` would have absorbed a transient fault. That
reasoning was too broad: **the SDK retries only particular error classes** —
connection failures and specific statuses (408, 409, 429, 5xx). A
**non-retried** class rejects on the **first** attempt with no retry at all.
Since the original error was never captured, its class is unknown, and the retry
argument therefore cannot be applied. C2 is neither promoted nor demoted; it is
held open pending the error itself.
*Does not explain (iii).*
*Discriminating evidence:* an `APIError` with `status` and `request_id` in the log line.

---

**C3 — Unguarded `response.content[0]`** *(latent defect, independently real)*
`maiaThreadReflection.ts:286–289`

```ts
const content = response.content[0];
if (content.type !== 'text') { throw new Error('Unexpected response type…'); }
```

If `content` is an **empty array**, `content.type` throws
`TypeError: Cannot read properties of undefined (reading 'type')` — one line
*before* the guard that was written to catch exactly this class of surprise.
Index-0 selection is also positionally fragile: it assumes the text block is
first rather than selecting it by type.

The repository already carries the correct convention elsewhere —
`lib/story/archetypalNarrativeService.ts:89` uses
`content.find((block) => block.type === 'text')`, and
`lib/consciousness/relationalCheckin.ts:217` uses `content[0]?.type`. The Ideas
primitive does not. (`lib/team/maiaTitleProposal.ts:100` and
`lib/team/maiaReflectService.ts:46` share the same unguarded shape — noted for a
future lane, not repaired here.)

*Fit:* explains (ii) — a subsequent call returns normal content. Does not
explain (iii).
*Standing:* **independently demonstrated defect; NOT established as the cause of
the witnessed 500, and held outside the incident verdict.** Its standing rests on
reading the code, not on the incident, and the incident's verdict does not rest
on it. Not repaired under this lane's authorization.

---

**C4 — Dev-server module state / stale compilation**

A broken HMR-compiled module or a wedged route worker fails until the process
is replaced.

*Fit:* explains (iii) and (ii) directly. Cannot explain (i).
*Standing:* unfalsifiable without the trace, and non-reproducible by
construction. Named so it is not silently excluded; ranked low because it
predicts nothing testable.

---

**C5 — Prompt payload size at deep-thread Distill** *(bound gap, independently real)*

Distill is the stance a member reaches **late** in a thread, when accumulated
context is at its largest. Two prompt inputs are **unbounded**:

| Input | Budget | Line |
|---|---|---|
| Latest member block | 6,000 chars | `LATEST_BLOCK_CHAR_BUDGET` (69) |
| Older blocks (up to 5) | 1,200 chars each | `OLDER_BLOCK_CHAR_BUDGET` (70) |
| Prior MAIA reflections (up to 3) | 800 chars each | `PRIOR_REFLECTION_CHAR_BUDGET` (71) |
| `ideaFraming` | **none** | 296–298 |
| `lastDecision` | **none** | 302–304 |

Cut 0 raised `IDEA_BLOCK_MAX_CHARS` to 12,000 and bounded the block slice, but
`lastDecision` is drawn straight from a `decision` block and enters the prompt
**unexcerpted** — so a 12,000-character decision bypasses the budget that every
other block obeys. `ideaFraming` is likewise unbounded.

An API-side 400 on an oversized request rejects the promise and surfaces as
**this exact generic 500**.

*Standing:* **independently demonstrated defect; NOT established as the cause of
the witnessed 500, and held outside the incident verdict.** The realistic ceiling
(~26,000 chars ≈ 7k tokens) sits far below the model's limits, so as an incident
cause it is unlikely. It is recorded on its own evidence: a **genuine
incompleteness in the Cut 0 bounding work** — the excerpt discipline was applied
to the block slice and not to the two fields that reach the prompt outside it.

*Also note:* the route fetches `LIMIT 6` (143) while the surrounding comments
and the primitive's docblock both say "last 3–4". The code and its
documentation disagree.

---

**C6 — Connection-pool or database fault**
Route lines 124, 137, 150, 163, 179, 275, 323 — five reads, one insert, one update.

A pool exhaustion or dropped connection rejects into the generic catch; a
restart resets the pool, fitting (iii).

*Counter-evidence:* the autosave `INSERT` via `/api/ideas/[id]/blocks` succeeded
**seconds earlier in the same member action**, so the pool was serving writes
immediately before the failure. Ranked below C1 for that reason, not excluded —
this route issues five sequential queries where the autosave issued one.

---

**C7 — `getCurrentSession()` throw**
Route line 93.

Session resolution precedes the null check; a throw inside it (DB read, cookie
decode) reaches the generic catch as a 500 rather than the 401 the shape
implies. No evidence for or against.

---

## 5. What each candidate would need to be assigned

None of the following can be produced from the current code. **This section
describes evidence, not repairs**, and implements nothing.

| Candidate | Discriminating evidence |
|---|---|
| C1 | Error message naming `ANTHROPIC_API_KEY`; constructor frame in the stack |
| C2 | `APIError` carrying `status` + `request_id`; upstream status page correlation |
| C3 | `TypeError … reading 'type'` with a `maiaThreadReflection.ts:286` frame |
| C4 | Absence of every other signature, plus non-reproducibility on a fresh process |
| C5 | API 400 with an explicit token/size message; recorded prompt character count |
| C6 | `pg` error code (`ECONNRESET`, `53300`, pool-timeout) and the failing query |
| C7 | Stack frame inside `serverSessions` |

**Precondition for assignment:** the evidence above must be (a) **separated by
stage**, so a failure names its seam and not merely its route, and (b)
**durable**, surviving the process that produced it. Today it is neither —
which is why *this* occurrence is unassignable, and why assignment of a *future*
occurrence is left to chance rather than guaranteed.

---

## 6. Constraint on any future repair lane

Recorded now so it is not lost between lanes:

1. **The member-facing string must stay generic.** `describeFailure`
   (`page.tsx:304–319`) renders `body.error` **verbatim** to the member. Any
   added fault classification must land in the operator-facing record only —
   a server error taxonomy must not become a member-facing leak surface.
2. **The autosave ordering is not to be simplified** (§3).
3. **C3 and C5 are defects on their own evidence** and do not depend on INV-2
   being assigned. They may be scheduled independently.
4. The `request.text()` `catch` (119–121) misclassifies a genuine read failure
   as *"Invalid request body"* → 400. Noted; not the observed fault.

---

## 7. Verdict

**INV-2: OPEN — THIS OCCURRENCE UNASSIGNABLE ON PRESERVED EVIDENCE.**

The event is real, the member-facing containment held, and the member's words
were preserved. For **this** occurrence no cause-bearing evidence survived, so
no candidate in §4.2 can be assigned. **C2 is held unranked** pending the
original error class.

The structural finding is narrower than "unknowable": **the current route does
not guarantee durable, stage-localizing evidence.** A captured stack or upstream
`request_id` could assign a future failure. What the route does not do is
*separate* that evidence by seam or *preserve* it across restart — so assignment
depends on an operator being present at the right process at the right moment.

**Two defects stand outside this verdict.** They were found by reading the code,
not by the incident, and neither is established as its cause:
**C3** (unguarded `content[0]`, contradicting the repository's own convention)
and **C5** (unbounded `lastDecision` / `ideaFraming` bypassing Cut 0's excerpt
discipline). They may be scheduled on their own evidence. They do not close
INV-2 and INV-2 does not depend on them.

**Sequencing (ratified 2026-09-02):** the next legitimate lane is a **bounded
fault-localization instrument, not repair** — specified in
`IDEAS_CUT02_FAULT_LOCALIZATION_INSTRUMENT.md`. Only after that instrument is
**witnessed** may the 500 be reproduced or any candidate repaired.

*No code, prompt, schema, migration, merge, or deployment change was made.*
