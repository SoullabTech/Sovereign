# ER-R5 · THE THIN EDITORIAL TURN ROUTE

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Authorized** founder, 2026-09-15.

```
ER-R5 route witness   30 passed · 0 failed   REAL HTTP · REAL IDENTITY · wire-stubbed model
ER-R1 · R2 · R3       18/0 · 38/0 · 28/0
ER-F1 … ER-F8         green · 7/7 killed
all suites            340 / 340
```

⛔ **NO UI. NO ADOPTION. NO MERGE. NO PRODUCTION DEPLOY.**

---

## 1 · Three authority reductions

**One identity, not two.** `runEditorialTurn` took `memberId` **and** `identity`
— two potentially divergent answers to *who is acting*, the same defect class as
the second succession resolver and the duplicated act vocabulary, at the identity
boundary. It now takes a `VerifiedIdentity` and **derives** the member id.
⭐ No parallel identity truth survives the boundary.

**Thread identity is derived.** `sessionRef` is gone from the input; the service
calls the ruled `editorialTurnIdentity(threadId, exchangeId)`. ⛔ Not an
equivalent value handed in by another caller.

**The capability owns its tier.** `EDITORIAL_STRATEGY = { tier: 'CORE' }`, private
to the service. ⛔ HTTP cannot select it — and neither can any later *server*
caller without deliberately editing that file. *A tier accepted from a caller is
a tier some caller will eventually choose.*

---

## 2 · `POST /api/writers-studio/editorial/turn`

⛔ Off by default (`WRITERS_STUDIO_EDITORIAL_ENABLED`), **404 not 403** — the
Focus posture, followed rather than reinvented.

⭐⭐ **A closed shape, not a tolerant one.** Unknown top-level and unknown `act`
keys are **refused**, and the refusal **names them**. *A caller that sends
`chainId` and receives 200 would be left believing that value had standing — and
the next person to read their code would believe it too.*

```
gate → identity → verified only → CLOSED parse → posture
     → ⛔ SANCTUARY REFUSES HERE, BEFORE ANY WRITE
     → R1 persist → mint exchangeId → R4 turn → thin response
```

⭐⭐ **The Sanctuary refusal's position is the point.** The editorial stores are
durable and no ephemeral editorial mode has been ruled. *A member's words must
not reach `ask_turns` and only then discover that Sanctuary meant they should
never have been written.*

**The response is thin** — `threadId · memberTurnIndex · maiaTurnIndex ·
response · direction · version`. ⛔ No `StructuredRequest`, no `systemPrompt`, no
`EditorialInvocation`, no provider blocks, no MIPA proof: *those exist to
establish the act, not to become the client API.* `response` is read from the
**persisted** MAIA turn, not re-derived — R3 now returns the body it wrote.

⭐ On a MAIA-side failure the route returns 502 **with the member's turn index**:
their act stands and was theirs; only MAIA's turn failed, and the response says
exactly that rather than implying the exchange is gone.

---

## 3 · The witness — real HTTP, real identity, `30/0`

⭐⭐ **No identity shim anywhere.** The placeholder witness with its
`ER_R4_IDENTITY_FROM_ROUTE` switch is **deleted**: it could flip a flag and then
fabricate `{ status: 'verified', memberId: M as any }`. The evidence path is now
the real one — a fixture `auth_sessions` row, an `x-session-token` header, a real
`next dev`, and the private WeakSet mint doing its job.

⛔ The only substitution is the **transport**, via `ANTHROPIC_BASE_URL`,
downstream of prompt assembly, with the router's sovereignty policy running as in
production.

```
G1  no session → 401
G2  ⭐⭐ an unknown authority field REFUSED, not ignored · and named
G3  an unknown act field refused
G4  ⭐⭐ Sanctuary refused, 409, named
G5  ⭐⭐ ZERO WRITES — the member's words never reached ask_turns
G6  ⛔ and no provider call was made

A3  ⭐⭐ the provider user message IS the persisted member body
A4  ⛔ and that body is ABSENT from the system prompt
A5  ⭐ the forced editorial tool on the wire
A6  ⭐ the response body IS the persisted MAIA turn
A7  ⭐⭐ all three provenance facts durable — model/reportedModel/agreed
A8  ⛔ no internals leak

N1  a text-only provider response → 502, member turn stands, MAIA mints nothing
N2  ⭐⭐ a differing reported model → model_unattributable, zero MAIA facts

F1  ⭐⭐ ER-F4 through HTTP: the stale frozen predecessor refused
F3a/b/c  no stale MAIA turn · no stale binding · versions +1, the independent V2
F4  ⛔ no rebase · F5 V2 remains · F6 ⛔ exactly ONE provider call, no retry
```

⚠️ `E1` (404-when-disabled) is asserted **SOURCE-LEVEL** and says so: the server
was booted once with the gate on. ⛔ Not claimed as behavioural.

### ⭐ Two instrument defects, found and recorded

**`F3` failed first, and it was the obligation that was wrong.** It asserted the
whole count string unchanged and tripped on `versions 1 → 2` — but the second
version is `V2-INDEPENDENT`, inserted **by the race itself**, and `F5` *requires*
it to exist. The obligation had conflated *no stale MAIA facts* with *no new
versions at all*, so it would have failed the very state it was arranging. Split
into three narrower and stronger claims.

**The witness left a `next-server` alive at 100% CPU.** `SIGKILL` on the
immediate child never reaches the server Next forks, and the following run
stalled behind it. Repaired with `detached: true` and a **process-group** kill,
plus SIGINT/SIGTERM handlers. ⭐ *A witness that leaves a process running is a
witness that can wedge the machine it measured* — the 2026-09-10 lesson in a
different resource. Verified: zero strays after the passing run.

⚠️ **And one of my own patches silently no-op'd** — a `.replace()` without an
assert, so it reported success while changing nothing. The exact *anchor absent
→ judges nothing* defect this programme guards against elsewhere. Reapplied with
assertions and the counts printed.

---

## 4 · The unrelated RED, still recorded and untouched

`evidenceCannotAct.test.ts` → *"adds no migration"* fails on canonical because an
S3-lane migration already there matches a filename guard about the *evidence*
substrate. ⛔ Not an ER regression, ⛔ not repaired, ⛔ not whitelisted.

---

## 5 · Standing

```
ER-F1…F8 · CARRY-01 · R1 · R1.1 · R2 · R3 · R4 · R4.1 · R5    ✅
R4 evidence, spent through HTTP                               ✅ 30/0

WS-EDITORIAL-RUNTIME-01                                        ⭐ runtime complete
Writer's Studio UI                                             ⏭ next
Adopt · canonical merge · production deploy                    ⛔
```

> ***A verified writer says something, declares what kind of act it was, and the
> system either remembers the whole exchange or none of it — with MAIA answering
> through a tool, in a name the provider gave, against the wording she was
> actually shown.***
