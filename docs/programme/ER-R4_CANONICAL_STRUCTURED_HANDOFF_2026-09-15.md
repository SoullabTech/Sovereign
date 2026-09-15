# ER-R4 · CANONICAL STRUCTURED HANDOFF

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Canonical base** `53cd18524`

```
ER-R1 · ER-R2 · ER-R3     18/0 · 38/0 · 28/0    green
ER-F1 … ER-F8             green · 7/7 killed
carried seals + writers-studio   all green
targeted typecheck        exit 0

ER-R4 handoff witness     ⛔ NOT RUN — written, complete, blocked on the route
```

⛔ **NO ROUTE. NO UI. NO ADOPTION. NO PRODUCTION CHANGE.**

---

## 1 · What landed

**One private Writer-turn constructor** (`buildWriterTurn`) under both Focus and
editorial entry points, and **one private render-and-prove** (`renderAndProve`)
under both verifiers — parameterised only by the required producer set. ⛔ Not two
answers to *how is a Writer's Studio CanonicalTurn constructed?* Focus behaviour
unchanged: `lib/writers-studio` 135/135.

⛔ `retrieved.writer_work_context` is **not** reused for the editorial locus, and
`cognitionPath` is `'room_direct'` — the honest value, since this turn is
answered by `runStructured` under a forced tool contract rather than by
`getMaiaResponse`. No vocabulary change was needed.

**`runEditorialTurn`** — the whole turn, no new substrate:

1. ⭐⭐ the **current utterance is read back from `ask_turns`**, never taken from
   the caller a second time. Otherwise a caller could persist A and think with B,
   and `ask_turns` would stop being the authoritative record.
2. assemble (ER-R2) → **freeze the invocation** → construct → MIPA → render,
   with **every supplied block required to cross**; a silently dropped block
   refuses the handoff rather than thinning the prompt.
3. `runStructured` with the forced tool. ⛔ No `getMaiaResponse`, no
   `generateText`, **no fallback** — source-pinned.
4. admit → persist (ER-R3) with provider provenance.

`EDITORIAL_MODEL = MAIA_EDITORIAL_MODEL || 'claude-opus-5'`, owned by the
capability, ⛔ never chosen by HTTP.

---

## 2 · ⚠️⚠️ TWO FINDINGS, NEITHER REPAIRED HERE

### F1 · The provenance law and the adapter's law conflict

The ruling: *the durable MAIA turn names the model that **actually authored**
it, not the model we intended to call.*

But `anthropicStructuredAdapter` reports:

```ts
/* THE MODEL ACTUALLY SENT. Reported from the request that went up the
   wire, so provenance can never drift from what was asked for. */
model: req.model,
```

⭐ Two deliberate, opposed laws. `StructuredResult` has **no field** for the
model the response says served the request, so the editorial layer cannot close
the gap — the information is discarded before it arrives.

**What ER-R4 persists is therefore the model REQUESTED**, plus provider, latency
and usage. ⛔ The stronger law needs a change to a shared adapter that serves
every structured caller, and whose current behaviour is its own recorded ruling.
**Not this lane's to make.** Reported, and the witness is written to catch it
(the stub answers with `stub-model-that-served`, deliberately different from the
requested pin).

### F2 · ⛔ The R4 witness is NOT RUN, and the reason is the guard working

`constructCanonicalTurn` refuses any identity not **minted** by
`resolveCanonicalIdentity` — minted identities live in a module-private
`WeakSet`, so a hand-built one is `identity_unverifiable` however correct its
fields. ⭐ **A witness cannot fabricate a member.** And
`resolveCanonicalIdentity` needs a Next request context (`cookies()` from
`next/headers`), which a plain script has no honest way to supply —
`next/headers` is not CJS-resolvable, so there is no narrow require-cache shim.

⛔ **Routes not taken, and why:** a test-only identity mint would be a hole in
the exact guard that just fired · an injection point on the turn would make
sovereignty a convention again · a framework-wide mock harness is more machinery
than the thing it proves.

⭐ **The identity boundary is a route concern** — the contract says so in its own
words (*"Minted by `resolveCanonicalIdentity` at the route"*) — and the thin HTTP
route is the next authorized cut. The witness is **complete and committed**,
exits `3`, and prints why. ⛔ `NOT RUN` is a first-class result: never a skip,
never a pass.

**What the witness will prove, already written**: the persisted body IS the
provider user message and is absent from the system prompt · every supplied
block rendered · the forced tool contract on the wire · `reply_only` → `1/0/0` ·
provenance persisted · a text-only response mints nothing · ⭐⭐ **ER-F4 through
the provider boundary** — the stub appends V2 *while the provider is thinking*,
the frozen predecessor is refused, zero MAIA rows, no rebase, V2 intact, the
member turn intact, and **exactly one provider call** (no retry).

⭐ The provider is stubbed **at the wire only** — a loopback server via
`ANTHROPIC_BASE_URL`. ⛔ No production code modified, no injection point added,
the router's sovereignty policy running exactly as in production.

---

## 3 · ⚠️ A pre-existing RED on canonical, reported not touched

```
lib/manuscript/development/__tests__/evidenceCannotAct.test.ts
  ✕ adds no migration — the evidence object needs no schema of its own
```

It fails because `20260913000002_disclosure_boundary_developmental_ask.sql` —
an **S3-lane** migration, **already on canonical `53cd18524`** — matches a
filename pattern (`/develop|evidence|reading|observation/i`) written to guard the
*evidence* substrate from acquiring a schema.

⛔ **Not caused by this lane**, and not repaired here: it is a guard about one
unit catching another unit's file by name. The C21 family again — *a
pattern-matching guard firing on something that merely reads like the thing it
bans.*

---

## 4 · Standing

```
WS-EDITORIAL-RUNTIME-01
  ER-F1…F8 · ER-CARRY-01 · ER-R1 · R1.1 · R2 · R3   ✅
  ER-R4 implementation                              ✅ built · typechecks
  ER-R4 witness                                     ⛔ NOT RUN (route-blocked)

thin HTTP route        ⏭ next — and it unblocks the R4 witness
provenance F1          ⚠️ open · shared adapter · not this lane's
canonical RED F2       ⚠️ open · pre-existing · not this lane's
UI · Adopt · legacy    ⛔
production             ⛔ NONE
```

> ***MAIA thinks with what the conversation actually contains, answers through a
> tool or not at all, and may claim to have authored only against what she was
> shown.***
