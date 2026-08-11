# JONDI U1 — DURABLE TURN ACCEPTANCE: VERIFICATION RECORD

**Date:** 2026-08-10
**Supersedes:** the interim *D — REGRESSION* ruling recorded earlier this day (retained in §1).

## FINAL CLASSIFICATION

## **B — FUNCTIONALLY CORRECT WITH DOCUMENTED NON-BLOCKING LIMITATION**

Every durability, identity and idempotency invariant (G1–G10) passes. The single
limitation is a **test-harness gap**: no legitimate slow-generation or
generation-failure seam exists, so §10/§M3 could not be run. Not fabricated.

---

## 1 — PRIOR RULING (retained)

An interim ruling of **D — REGRESSION** was issued earlier today: U1's durability
mechanism worked, but a *successful* request stored the same utterance **twice**
(controlled test: pristine 1 exchange → U1 2 exchanges). That ruling stands as
history and was the input to this unit. It is now resolved.

## 2 — CORRECTED WRITER ARCHITECTURE

**Before U1** — every writer ran *after* generation, so a client abort killed all of them:

```
request → getMaiaResponse() → generation → maiaService mints exchangeId
                                         → maiaService addExchange()   [tail]
                                         → sessionManager addConversationExchange (meta.exchangeId)
        → client pair-write /api/conversation/turns (mints its own id)
```

**U1 as first written** — durability moved early, but identity split in two:

```
route mints exchangeId A → EARLY durable member write (A)
                         → generation → maiaService mints exchangeId B → addExchange (B)
ONE UTTERANCE ⇒ exchange A + exchange B
```

**U1 after this unit** — one identity for the whole lifecycle:

```
route mints canonical exchangeId  ──┬─→ acceptance write: member half (seq 0)
                                    ├─→ meta.exchangeId → getMaiaResponse
                                    │      └─→ maiaService reuses it (no mint)
                                    │            ├─ addExchange (ON CONFLICT → collapses)
                                    │            └─ sessionManager (already read meta.exchangeId)
                                    ├─→ post-generation write: MAIA half (seq 1)
                                    └─→ client pair-write reuses it (ON CONFLICT → no-op)
ONE UTTERANCE ⇒ ONE EXCHANGE
```

## 3 — CANONICAL EXCHANGE IDENTITY RULING

> **ONE LOGICAL USER SEND = ONE CANONICAL EXCHANGE ID**, minted at the request
> boundary and propagated through the entire generation and persistence lifecycle.

`clientExchangeId` and the route's `exchangeId` are **the same canonical
identifier**, not distinct concepts — the client mints it at submit, the route
accepts it (falling back to `requestId`), and every downstream writer reuses it.
They were previously *accidentally conflated with* a third, independently minted
service id; that third identity is what has been removed.

**Channel:** `meta.exchangeId`. This is the pre-existing idiom, not a new
abstraction — `sessionManager.addConversationExchange` already read
`meta.exchangeId` for exactly this purpose. No signature change, no new context object.

## 4 — IMPLEMENTATION (5 files)

| File | Change |
|---|---|
| `lib/sovereign/maiaService.ts` | `exchangeId` now resolves `meta.exchangeId ?? randomUUID()` instead of always minting; `exchangeId?: string` added to `MaiaRequest.meta` |
| `app/api/sovereign/app/maia/list/route.ts` | canonical `exchangeId` passed in `meta` (placed **after** `...meta` so client meta cannot override); acceptance-boundary member write; post-generation MAIA write |
| `lib/memory/stores/TurnsStore.ts` | `addExchangeTurn()` — one half at explicit `seq`, idempotent on `(exchange_id, seq)`; S1 + S5 enforced as in `addExchange` |
| `components/OracleConversation.tsx` | one `turnExchangeId` per send, reused on resend, carried on `userMessage.metadata`, sent to the route and forwarded on the pair-write |
| `app/api/conversation/turns/route.ts` | honours client `exchangeId`; mints only when absent |

**Caller classification for the fallback mint (§4):**
**A. canonical** — `maia/list` (supplies the id). **B. legacy** — dormant
`app/api/sovereign/app/maia/route.ts`. **D. internal** — 3 `maiaOrchestrator`
sites. B and D supply no id, mint as before: **behaviour unchanged**.

**§5 writer responsibility — documented, not redesigned:** both writers remain, now
idempotent and non-competing (acceptance = member half; completion = MAIA half).
They are **conceptually redundant on the sovereign path** — the maiaService tail
write and the client pair-write now only ever re-assert what the route already
wrote. Collapsing them is a future simplification, deliberately **not** done here.

## 5 — PROOFS

| # | Test | Result |
|---|---|---|
| §7 | Normal bare server request | **1 exchange, 2 rows** (`ex=43b28265`). Pristine baseline was also 1; U1-before-fix was 2. **Regression closed.** |
| §8 A | Warm, navigate **250 ms** after Send | **PASS — 1 exchange** (`9de744c5`), member + MAIA durable |
| §8 B | Warm, navigate **1500 ms**, mid-generation | **PASS — 1 exchange** (`058a5da6`) |
| §8 C | Warm, **hard reload** mid-generation | **PASS — 1 exchange** (`6a180717`); restored and visible |
| — | Session total for 3 UI sends | **6 rows / 3 exchanges** — exactly one per send (**G6**) |
| §9 | 2 sends + 1 pair-write on `11111111-…` | **1 exchange**; `'pair-write echo MUST NOT APPEAR'` → **0 rows**. Dedupe is identity-based, not content-based (**G5, G8**) |
| §9 | Distinct id `22222222-…` | second exchange appears (**G6**) |
| §13 | **M6** — remove canonical id propagation | duplicate **returns** (2 exchanges) → restored → **1 exchange** again. Discriminates (**G9**) |
| — | M1 (prior unit) — remove early durability | interruption loses the turn. Still valid. |
| §8 | Keep regression | **PASS** — `marked_by_member=true`, `source_session_id` correct, verbatim intact, retrievable |
| — | Continuity regression | **PASS** — prior turns intact, restore endpoint correct |

**Gates:** G1 ✅ G2 ✅ G3 ✅ G4 ✅ G5 ✅ G6 ✅ G7 ✅ G8 ✅ G9 ✅ G10 ✅

## 6 — TYPECHECK

```
errors 231 · baseline 239 · delta −8 · ✅ no regressions
```
Not re-baselined (governed act).

## 7 — §10 GENERATION FAILURE — NOT TESTABLE WITH CURRENT HARNESS

No legitimate controlled failure seam exists; none was fabricated.
**Intended contract, recorded but not implemented:** member turn remains durable;
no fabricated MAIA turn; the exchange persists with `seq 0` only. The current code
already behaves this way by construction (the MAIA write is gated on
`memberTurnDurable && sovereignText`), but this is **reasoned, not proven**.
**Missing capability:** a test-only injectable delay/fault inside `getMaiaResponse`.

## 8 — §11 PRE-ACCEPTANCE WINDOW

```
PRE_ACCEPTANCE_LOSS_WINDOW:   ~5 ms warm  (848 ms was cold-start, not architectural)
MEASURED_ACCEPTANCE_LATENCY:  5 ms typical (19/40/99 ms outliers)
CURRENT SEMANTIC BOUNDARY:    authenticated semantic acceptance
```
**Ruling: A — acceptable for U1.** No canon requires zero-window durability. A
member utterance interrupted before semantic acceptance may still be lost. The
open architectural question — *should durability begin at validated request
arrival, or only after authenticated semantic acceptance?* — is **recorded, not
decided**, and opens no work unit.

## 9 — §12 PRE-EXISTING PRODUCTION DUPLICATION

**Classification: A — same root cause (dominant class), bounded by evidence.**

Production, 30 days:
- **120** duplicate groups; **120/120** have all-non-NULL `exchange_id`s — i.e. the
  identity-split shape, not the older NULL-id shape.
- **103/120** have all rows within **10 seconds** — the machine-generated defect shape.
- **6/120** spread over **> 1 hour** — legitimate member repeats, correctly two exchanges.

Corroborated behaviourally: the same UI send produced **2** exchanges before this
fix and **1** after. So canonical id propagation incidentally removes the dominant
production duplicate class (~103 of 120). ⛔ This is a claim about **future** writes
only. **No historical data was touched**; U1 is not a cleanup unit.

## 10 — COMMIT

```
COMMIT:   86649f5f1  fix(maia): make an accepted member turn durable independently of the client
BRANCH:   fix/u1-durable-turn-acceptance  (rebased onto trunk b00340cfc)
REBASE:   originally verified at d2db55d7b as f2d07b56c; rebased onto b00340cfc
          (RU-0 Sanctuary containment + House door). Re-verified after rebase:
          typecheck 231/239 no regressions; one send -> one exchange; same-id
          retry collapses; 400ms navigation interrupt keeps both halves durable.
PUSHED:   NO
DEPLOYED: NO
```
Pre-commit sovereignty gates passed (no Supabase, no new OpenAI surface, branch
guard). The commit-msg hook rejects Claude attribution, so none is present —
repo policy over default convention.

## 11 — TREE

```
FILES CHANGED:        5 (all authorized; maiaService.ts added by this unit)
UNRELATED CHANGES:    NONE — fsck clean, no stale locks, no mutation leftovers
DISK FREE:            35 Gi
HEAD:                 d2db55d7b (detached)
WORKTREE:             /Users/soullab/maia-audit-d2db55d7b
PRODUCTION TOUCHED:   NO
DEPLOYED:             NO
```

## 11 — TEST RESIDUE (local DB only)

Sessions `verify-u1-*`, `mutant-m1-*`, `u1on-*`, `u1fix*`, `m6-mutant-*`,
`warmup-session-audit`; 3 kept moments in `episodic_memories`; fixture
`auth_sessions` row (expires 2026-08-12). Production untouched.
