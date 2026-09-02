# IDEAS — T1 Fault Localization · Lane Closure

**Date**: 2026-09-02
**Lane**: IDEAS Cuts 0–2 · T1 fault localization
**Status**: implementation complete, tests green, **stopped at the authorized boundary — awaiting founder adjudication before T2**

---

## 0. Base commit discrepancy (flagged, not resolved)

The authorization named base `2c7f7e3`. That revision is **not present in this
clone** (`fatal: ambiguous argument '2c7f7e3'`). This lane was therefore cut
from the current tip of the checkout rather than from the named base.

The authorized branch name was `feature/ideas-cut02-t1-fault-localization`;
this session's harness pins development to
`claude/ideas-cut02-t1-fault-localization-rlfash`. The work is on the pinned
branch. Both facts are adjudication inputs, not decisions taken.

---

## 1. What was authorized, and what was built

| Authorized | Built |
|---|---|
| T1 structured stage logging | `lib/ideas/faultLocalization.ts` — closed seam vocabulary, single-line JSON events behind the `[ideas/T1]` marker |
| Client `attempt_id`, server `request_id` | `newAttemptId()` / `newRequestId()`; transport is the `x-ideas-attempt-id` request header, one direction only |
| `entered/completed/failed` at each seam | 3 client seams + 8 server seams, all bracketed |
| Runtime-revision rule | `GIT_COMMIT` server-side, `BUILD_STAMP.commit` client-side; unstamped reads `unknown`, never a fabricated value |
| Sanitization rules | key allowlist + measurement-suffix rule + token-shape value rule |
| Mock-based seam tests | 63 tests across three suites, all green |
| Bit-for-bit unchanged member-facing behavior | asserted on success, all three refusals, and the 500 path |

## 2. The seams

**Client** (`app/maia/ideas/[id]/page.tsx`)
`client.autosave` · `client.ask_request` · `client.render`

**Server** (`app/api/ideas/[id]/ask-maia/route.ts`)
`server.auth` · `server.validate` · `server.idea_fetch` ·
`server.context_assemble` · `server.model_call` · `server.recognition` ·
`server.persist` · `server.touch`

The vocabulary is closed. It is the language the evidence will be read in, so
adding a seam later is a deliberate act, not a drift.

## 3. The two invariants the instrument exists to hold

**Authority separation.** The client may propose an `attempt_id` and nothing
else. `request_id` is minted server-side on every request; there is no
parameter, header, or code path by which an inbound value can reach it. A
malformed client proposal is *recorded as rejected* rather than silently
treated as absent — a rejection is evidence, not noise.

**No member content leaves the process.** Detail is not free-form. Keys must
be allowlisted or measurement-shaped (`_count`, `_len`, `_ms`, `_present`,
`_ok`, `_rejected`, `_fired`, `_offered`). String values must be token-shaped:
no whitespace, ≤64 chars. Member prose fails that by construction. Non-scalars
are dropped outright, so there is no nested structure to hide content in.
Neither member id nor idea id is logged.

## 4. What the tests prove

`lib/ideas/__tests__/faultLocalization.test.ts` — **28 passed**
Sanitization (content dropped, prose redacted, non-scalars dropped);
authority separation (forged `x-request-id` ignored; client-side events
structurally cannot carry a `request_id`); runtime revision truthful-or-unknown;
`stage()` returns values unchanged and re-throws the *original* error object;
a throwing sink or detail function degrades the log line, never the request.

`lib/ideas/__tests__/client-seam-attribution.test.ts` — **5 passed**
A structural guard, stated as such: the client handler is a React page
component and is not exercised here. It locks the property that the single
outer catch attributes a throw to the seam *in flight* rather than to a
hard-coded seam — without which an autosave transport failure and a
malformed-response parse failure would read identically, collapsing client-side
localization at exactly the point it is needed.

`app/api/ideas/[id]/ask-maia/__tests__/t1-seams.test.ts` — **30 passed**

*Seam distinction.* Each test fails exactly one seam and asserts the evidence
names that seam **and no other**. The pairs that matter most, because they were
previously the same opaque 500:
- model failure vs. persistence failure
- idea-fetch failure vs. context-assembly read failure
- persistence failure vs. post-write `touch` failure (member got a reflection;
  only the ordering update was lost)

*Zero member-facing diff.* Status and body byte-identical on 201, 401, 400,
404, and 500; **no response header added at all**; identical bytes with and
without a client `attempt_id`; identical behavior with the instrument disabled.

Gates: `npm run check:no-supabase` ✅ · `npm run typecheck` ✅ (231 errors vs.
239 baseline — no regressions; baseline deliberately **not** re-recorded, that
is a governed act).

## 5. Design decisions taken inside the authorization

1. **Nothing is written back into the HTTP response.** The correlation key
   between client and server logs is `attempt_id`, which the client already
   holds. This makes "zero member-facing diff" an assertable property rather
   than a claim, and it removes the only surface on which T1 could have leaked.
2. **`IDEAS_T1_DISABLED=1` kill switch, default-on.** This is a logging
   off-switch, not a runtime fault-injection flag — the excluded category is
   the ability to *cause* faults, which nothing here can do.
3. **Context assembly is one seam, not three.** Its three reads and the shaping
   that follows fail for the same class of reason and demand the same repair.

## 6. Growth-obligation check (per `RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04`)

T1 increases **observability**, not capability — no memory, personalization, or
inference is added. The three questions still apply:

- *What uncertainty does this introduce, and how is it preserved?* An unstamped
  build reports `unknown`, never a guessed revision; a rejected `attempt_id` is
  recorded as rejected rather than as absent. The instrument is built to make
  its own ignorance legible.
- *What provenance and ownership boundaries does this require?* Every event
  carries the runtime revision it was emitted from, so evidence cannot be
  attributed to the wrong code. Identity authority is one-directional.
- *What new responsibility does this create?* Logs now describe the shape of a
  member's Ideas activity (counts, lengths, timings) even though they carry no
  content. Retention of these lines is a real question and is **T2's to answer** —
  T1 deliberately writes nothing durable.

## 7. Explicitly NOT done

T2 or any database schema · C3/C5 repairs · prompt or MAIA-response changes ·
proposition/standing implementation · runtime fault-injection flags ·
reproduction, merge, or deployment · Cuts 3 and 4.

Nothing in this lane makes Cuts 0–2 green. It makes their failures
**distinguishable**, which is the precondition for the rest of the sequence.

## 8. For adjudication before T2

1. **Base/branch discrepancy** (§0) — accept as cut, or re-cut from a named base.
2. **Seam vocabulary** — is the 11-seam decomposition the vocabulary the
   evidence should be read in? It is closed on purpose; changing it later is a
   deliberate act.
3. **Retention** — T1 writes nothing durable. T2 must answer what is kept, for
   how long, and under whose consent. The sanitization rule bounds *what* can
   be kept; it does not decide *whether*.
4. **Reproduction** — not authorized here. Deciding whether T1 is sufficient to
   localize the demonstrated faults requires running it against a real failure,
   which is a separate authorization.
