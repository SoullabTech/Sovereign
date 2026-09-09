# §3a — THE FOCUS DISCLOSURE SURFACE CONTRACT

**2026-09-09 · BUILT · `#1275` FROZEN.** Presentation logic only: no route, no
cognition call, no Focus text crossing.

> ⭐⭐ **The surface may state only what the receipt outcome proves about THIS
> invocation and any prior one.**

Not merely *pre-boundary vs post-boundary*. That distinction was the first
approximation; `MintOutcome` made a more precise one possible, and necessary.

## The epistemic ladder

| Rung | Reached from | What the writer is told | Actions |
|---|---|---|---|
| **did_not_cross** | `consent_unavailable` · receipt `unavailable` · receipt `identity_mismatch` | *"…Nothing from this Focus was sent."* | Try again · Continue without Focus |
| **prior_unresolved** | receipt `existing · attempted` | *"I can't safely retry this Focus because the previous attempt is unresolved. I haven't sent it again."* | ⭐ **Start a new Focus request** · Continue without Focus |
| **prior_crossed** | receipt `existing · crossed` | *"This Focus was already sent to MAIA in the earlier request. I haven't sent it again."* | Start a new Focus request · Continue without Focus |
| **crossed_accounted** | `may_cross` → confirm ok | *(nothing — an ordinary Focus conversation)* | — |
| **crossed_unaccounted** | `may_cross` → confirm failed | *"MAIA received this Focus, but I couldn't complete the disclosure record for this request."* | — |

### The three that matter

⭐ **`prior_unresolved` is the one the obvious copy would lie about.** The current
invocation sent nothing — but a prior one MAY HAVE CROSSED and was never
confirmed. *"Nothing was sent"* would be a claim about the prior attempt that no
evidence supports. **Try again is withheld deliberately**: replaying the same
disclosure identity is exactly what the substrate refuses to treat as fresh
authority.

> ⭐ **An unresolved prior crossing may be retried as a NEW act. It may not be
> replayed as though nothing happened.**

⭐ **`identity_mismatch` reads to the writer as ordinary trouble and is a
governance anomaly to us.** Same words, different urgency, both honest — severity
is internal routing and is never rendered. The differing *fields* are logged by
the store; nothing reaches the copy.

⭐ **`prior_crossed` says the earlier send happened and infers nothing further.**
The receipt proves the context crossed; it does not prove which answer the writer
is looking at, or that any response completed. A falsifier asserts the copy never
mentions an answer or a reply.

⛔ **`crossed_unaccounted` may never say nothing was sent — it was.** A
confirmation failure is our integrity problem, not the writer's mistake, and the
answer must not masquerade as fully accounted for.

## Scope substitution

```text
Focus request fails → surface explains → writer chooses Continue without Focus
                                       → a NEW ordinary-scope request
```

`authorizeOrdinaryScope()` returns true for **one** input:
`'continue_without_focus'`. Every other action, and `null`, refuse.

> ⭐ **Scope failure does not authorize scope substitution.**

## Acceptance — 34 falsifiers, S1–S8 plus the mutation test

| | | |
|---|---|---|
| S1 | a definite non-crossing may say nothing was sent | 4 |
| S2 | an unresolved prior attempt may NEVER make an unqualified non-crossing claim | 3 |
| S3 | a prior crossing is preserved; nothing beyond it inferred | 3 |
| S4 | no failure branch automatically invokes ordinary cognition | 6 |
| S5 | Continue without Focus requires a new member gesture | 4 |
| S6 | a post-boundary confirm failure may never say nothing was sent | 3 |
| S7 | only `may_cross` permits the eventual cognition call | 2 |
| S8 | copy never exposes ids, refs, mismatch values or database vocabulary | 6 |
| — | **MUTATION** | 3 |

⭐⭐ **The mutation test is the one that makes the rest credible.** It maps
`existing · attempted` to the simple *"Nothing was sent"* copy and asserts that
S2 goes **RED**. Without it, S2 could be passing because the states differ rather
than because the claim is checked — and these five failures look superficially
alike, which is precisely how the drift would arrive later.

> ⭐ Same family as the Postgres finding: **an instrument that cannot fail on the
> wrong answer has not tested the right one.**

**Gates:** `lib/disclosure` + `lib/writers-studio` **126 passed · 0 failed** ·
typecheck 228 vs baseline 239 · 0 regressions · `check:no-supabase` clean.

## What is built, and what is not

⭐ Built: the state machine, the copy, the action vocabulary, the scope-substitution
refusal, and the falsifiers — all against `BoundaryOutcome` and the confirmation
result.
⛔ Not built: the Writer's Studio serving route, any UI, and any cognition call.
The three layers now exist as *contracts*; **none of them has yet been exercised
by a real Focus request, because no route performs one.**

**Standing: §3a BUILT · `#1275` FROZEN · the cognition-wiring lane is the next
founder act, and its first obligation is that the route call
`establishDisclosureBoundary()` and nothing else.**
