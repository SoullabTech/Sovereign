# REQUEST-ORDER-01 — does the consent-state mint precede context assembly?

**2026-09-09 · READ ONLY.** No repair authored. No `#1275` change.

Obligation: `context_disclosure_receipts.request_ref` now
`REFERENCES runtime_consent_state(request_id)`. A violation fails closed — the
right direction, and **a silent capability loss**. The claim to prove:

> The serving boundary mints the consent row **before** Work context is assembled.

## Findings

### ⛔ F1 — THE MINT IS FIRE-AND-FORGET. Ordering of the CALL is not ordering of the ROW.

`lib/provenance/consentState.ts:36` — `recordConsentState()` returns `void` and
issues `void query(...)`. Nothing awaits it; by design it *"never blocks the
serving path, never throws"*, and a missing record is *"visible to auditors as an
absence, which is itself a truthful signal."*

⭐ That posture is correct **for consent auditing** and is exactly wrong as a
**precondition**. The FK requires the row to *exist* at the instant the receipt
INSERT runs. What the code establishes is that the INSERT was **started** earlier
— not that it **committed** earlier.

At `lib/sovereign/maiaService.ts:2695` the mint is followed by
`await incrementTurnCount(...)` and a history load, so in practice the row will
usually have landed. ⛔ **"Usually" is not an ordering guarantee.** Under pool
saturation or a slow write, the receipt's FK fails, the mint returns
`unavailable`, and Focus is refused — correctly, invisibly, and for a reason that
has nothing to do with the writer.

**This is the finding that blocks wiring.** It is not repaired here.

### ⛔ F2 — Three of five call sites mint an id NOTHING ELSE CAN SEE.

| Site | `requestId` | Referenceable? |
|---|---|---|
| `lib/sovereign/maiaService.ts:2695` | `meta.exchangeId` ?? fresh UUID | ⭐ **yes** when the caller supplies `exchangeId` |
| `app/api/conversation/turns/route.ts:169` | `exchangeId` | ⭐ yes |
| `lib/consciousness/maiaOrchestrator.ts:404` | `crypto.randomUUID()` inline | ⛔ **no** |
| `app/api/maia/translate/route.ts:76` | `crypto.randomUUID()` inline | ⛔ no |
| `app/api/voice/persist/route.ts:100` | (site read; id not carried out) | ⛔ no |

A disclosure minted on one of the latter paths has **no `request_ref` it could
lawfully cite** — the id exists only inside that call expression. Where
`maiaService` falls back to `randomUUID()` because no upstream `exchangeId` was
supplied, it lands in the same position.

### ⛔ F3 — The Writer's Studio path has no consent mint at all, because it has no serving route yet.

There is no `app/api/writers-studio/**`. The only Studio-adjacent API routes are
manuscript structure/write-state, and neither reaches `getMaiaResponse` or
`maiaService`. **The harness route that would perform a Focus crossing does not
exist**, so the ordering claim cannot be witnessed on the path that matters — it
can only be witnessed on paths Focus will not use.

## What this establishes

1. ⛔ **The claim is NOT proven, and cannot be proven today.** The path is unbuilt
   (F3), and on the paths that do exist the mint is fire-and-forget (F1) rather
   than a precondition.
2. ⭐ The FK is still right. It converts an unprovable assumption into a
   fail-closed one — but a fail-closed silence is exactly what F1 predicts, so
   **shipping Focus on today's mechanics would produce intermittent, invisible
   refusals.**
3. The repair is not this lane's to author, and its shape is already visible: the
   Focus path needs an **awaited, verified** consent mint — the row confirmed to
   exist before the disclosure is attempted — rather than the fire-and-forget
   posture that serves consent auditing. ⛔ **Do not make `recordConsentState`
   blocking globally**: four other call sites depend on it never blocking the
   serving path, and widening it would be a change to Sanctuary's own mechanics.

> ⭐ **A precondition and an audit trace are not the same write.** The same row can
> serve both only if something establishes that it exists before the thing that
> depends on it.

**Standing: REQUEST-ORDER-01 CLOSED as a trace · the ordering claim is REFUTED for
today's mechanics · repair NOT AUTHORIZED here · §3a still owed · `#1275` FROZEN.**

---

## REPAIR (authorized 2026-09-09) — a required-consent sibling, not a change to the audit trace

> ⭐⭐ **Resolve authority first. Prove it exists. Account for the disclosure.
> Then let the context cross.**

### `requireConsentState()` — `lib/provenance/requireConsentState.ts`

Awaited · verified · fail-closed · returns a discriminated outcome and **never
throws through the conversation path**, so a caller cannot take a crash for a
refusal:

```text
ready              minted here, now              → precondition satisfied
existing_exact     already present, identical    → satisfied (first write wins on retry)
identity_mismatch  present, DIFFERENT request    → ⛔ never satisfied
unavailable        absent / unwritable / forged  → ⛔ fail closed
```

⭐ Unlike a disclosure receipt, an **exact** existing consent row still satisfies
this precondition: it is not fresh authority over content, it is the immutable
posture already resolved for that request, and the S5 table is explicitly *first
write wins on retry*. The mismatch log names **fields**, never their values.

⛔ **`recordConsentState()` IS UNCHANGED** — still a synchronous `void` function
issuing an unawaited `query`. Bound by R4's last falsifier so a later edit cannot
quietly make it blocking for its four other callers.

### `establishDisclosureBoundary()` — `lib/disclosure/disclosureBoundary.ts`

The ordering made structural, because each step is the previous step's returned
authority rather than a convention:

```text
posture → ONE named requestId → AWAIT requireConsentState
   ↳ not established → REFUSE, before any Work context is assembled
→ mint receipt (same requestId as request_ref) → only `minted` authorizes
→ return may_cross          ⛔ the CALLER crosses; this seam never calls cognition
```

⭐ It returns **permission**, and does not perform the crossing. A seam that both
authorized and executed would make the two indistinguishable in a later audit.
⛔ It touches no Work content, mints no id of its own, and calls no model.

### Acceptance — R1–R4 · 15 jest falsifiers + 5 executed against Postgres

| | Falsifier | jest | shadow |
|---|---|---|---|
| R1 | awaited insert completes before the mint is attempted | 3 | `R1`, `R1b` |
| R2 | exact existing row accepted; mismatched refused | 4 | `R2` |
| R3 | missing consent → no receipt, no handoff | 4 | `R3` |
| R4 | one requestId carried, never regenerated | 4 | `R4` |

⭐ R1's second jest falsifier models the **pre-repair world** — the consent write
never lands — and confirms the FK rejects the receipt. That is the invisible
failure F1 predicted, now a test rather than a worry.

**Shadow witness: 19 checks · 19 PASS · 0 FAIL** (14 substrate + 5 ordering),
fixtures rolled back (0 rows verified), disposable cluster destroyed.

**Gates:** disclosure suites **55 passed · 0 failed** · typecheck 228 vs baseline
239 · 0 regressions · `check:no-supabase` clean.

### What is proven, and what is not

⭐ **PROVEN on the seam**: authority precedes accountability precedes permission,
and a violation is refused by the database rather than by discipline.
⛔ **NOT PROVEN**: that the Writer's Studio serving path uses it — **that path
still does not exist** (F3). This repair makes the ordering available and
correct; it does not make it universal. The first route to perform a Focus
crossing must call `establishDisclosureBoundary()` and nothing else.
⛔ Not repaired, deliberately: the five existing `recordConsentState` callers,
three of which mint inline ids. Their semantics are their own.

**Standing: REQUEST-ORDER-01 REPAIRED at the seam · REFUTED-then-PROVEN for the
ordering · §3a still owed · `#1275` FROZEN.**
