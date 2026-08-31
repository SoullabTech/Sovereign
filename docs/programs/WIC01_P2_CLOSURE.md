# WIC01-P2 — PASS-THROUGH CONDUCTOR · CLOSURE

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Packet:** P2 — move the decision boundary; do not change the decision
**Executed:** 2026-08-31
**Standard:** byte-identical model-facing composition. *"Equivalent meaning" is not sufficient for this packet.*

---

## §1 — What moved

```text
BEFORE   MaiaContext ──▶ ADDENDA_SPECS loop ──▶ prompt

AFTER    MaiaContext ──▶ evidenceFromLegacyContext()   [typed P0 evidence]
                     ──▶ conduct()                     [the seam]
                     ──▶ CompositionPlan               [structured, inspectable]
                     ──▶ renderPlan()                  ──▶ prompt
```

`appendAllContextAddenda` — the shared seam serving **CORE** and **DEEP-repair** — now composes through `conduct()`. `ADDENDA_SPECS` survives only as a rendering/logging detail; **it is no longer the authority on what composes a turn.**

**Added:** `lib/maia/contract/conductor.ts` — `conduct()`, `renderPlan()`, `evidenceFromLegacyContext()`, `normalizeContent()`, `SHARED_SEAM_ORDERING`, `FAST_RUN_ORDERING`.

`conduct()` is deliberately stupid. It exercises no judgment: same source eligibility, same ordering, same tier omissions, same authority behavior, same consent behavior.

---

## §2 — The witness

`lib/maia/contract/__tests__/conductorEquivalence.test.ts` diffs the wired path against **verbatim copies of the pre-P2 implementation captured at `fc66b477a`** — not against reimplementations written to agree.

| Level | Result |
|---|---|
| 1 · Source-set equivalence | ✅ same sources present/absent per tier |
| 2 · Ordering equivalence | ✅ same order, same delimiters |
| 3 · Prompt equivalence | ✅ byte-identical over all scenarios + 200 randomized cases |

Scenarios covered: FAST · CORE · DEEP-repair fixture · member **with** developmental memory · member **without** · Sanctuary-gated evidence · member-declared significance only · empty/no-evidence turn · single source · the `'undefined'`/`'null'`-string quirk.

**49 contract tests pass.** `npm run typecheck` green: 231 errors vs 239 baseline, no regressions.

---

## §3 — The one divergence, explained

**FAST is not byte-identical, and is therefore NOT adopted in this packet.**

The FAST template literal (`lib/sovereign/maiaService.ts:1432`) interpolates `knowledgeFieldAddendum` as a bare `${knowledgeFieldAddendum}` with **no `\n\n` guard**, while every other field uses the guarded `${x ? '\n\n' + x : ''}` form. `renderPlan` always joins with `\n\n`.

The divergence is **exactly one leading delimiter and nothing else** — pinned by test:

```ts
expect(composed).not.toBe(legacy);              // honest: it differs
expect(composed.replace(/^\n\n/, '')).toBe(legacy);  // and differs by exactly this
```

A third test proves FAST **is** byte-identical once `knowledgeField` is unpopulated.

Per the packet's own rule — *if any prompt diverges, P2 stays open until the divergence is explained* — the divergence is explained and **the response is to defer FAST adoption, not to change bytes.** Rewiring a single 3,000-character template expression is a distinct risk unit and gets its own scoped pass.

**Consequence to hold consciously:** two composition paths still exist. CORE (72.9% of traffic) and DEEP-repair run through the Conductor; FAST (27.1%) does not. That is not worse than the pre-P2 state, which also had two paths — but it means P2 moved the *dominant* boundary, not *the* boundary.

---

## §4 — D7 and D8 remain reproduced, on purpose

```text
FAST  developmentalMemory → present   (current behavior)
CORE  developmentalMemory → ABSENT    (current defect, reproduced exactly)
DEEP  → current behavior
```

`SHARED_SEAM_ORDERING` deliberately **does not contain** `developmentalMemory`, and a test asserts this:

> *If this test ever fails, someone repaired D7 outside packet P3a and the byte-identical witness is void.*

Reproducing a known production defect is uncomfortable and necessary. Had P2 "helpfully" fixed it, every post-deployment behavior change would be ambiguous between Conductor extraction, memory restoration, ordering, authority, and formatting. **Causality is the deliverable.**

---

## §5 — One truthful emptiness

`CompositionPlan.withheld` is `[]` in every case. This is **not** a stub.

It is an accurate statement about the architecture being replaced: **today there is no restraint at composition time.** A source is either populated in the context or absent, and that decision happens upstream of this seam. P2 gives the Conductor somewhere to stand; P3+ give it something to decide. The `USED` distinction attaches here later without another rewrite.

---

## §6 — Pre-existing failure found, not caused, not fixed

`lib/sovereign/__tests__/presenceMode.test.ts` › *"should be called after sanitization, before voice synthesis"* fails.

**Verified pre-existing:** stashing the entire P2 change reproduces the identical failure at the pre-P2 tree. It is a source-position assertion over `maiaService.ts`, which P2 did not modify.

Reported, not repaired. **Finding a defect does not create authority to fix it** — and P2's non-authorization list is explicit.

---

## §7 — Closure gate

```text
[x] canonical conduct() seam exists
[x] P0 typed evidence crosses that seam
[x] CompositionPlan is structured and inspectable
[x] FAST source-set/order equivalence proven      (prompt: ONE divergence, explained §3)
[x] CORE source-set/order/prompt equivalence proven
[x] DEEP equivalence proven by fixture
[x] representative text path passes
[ ] representative voice path passes               ← CANNOT REACH THE SEAM (see below)
[x] Sanctuary behavior unchanged
[x] member-declared-significance behavior unchanged
[x] D7 remains intentionally reproduced
[x] D8 remains intentionally reproduced
[x] no model/tier routing change
[x] no endpoint consolidation
[x] contract + no-regression gates green
```

**The voice gate cannot be satisfied inside P2, by construction.** `/api/voice/stream-conversation` is a separate cognition implementation that never calls `appendAllContextAddenda` — it builds its own context via `buildMaiaContext`. Routing it through the seam **is endpoint convergence**, which P2's non-authorization list forbids. The authorization anticipated this: *"one representative voice and one text turn **if both can reach the extracted seam**."* It cannot. Recorded as unsatisfiable-here rather than silently checked or silently dropped.

---

## §8 — Standing

```text
P0   typed evidence contract          CLOSED   1d09c42
P1   runtime / source adjudication    CLOSED   9ab6046
P2   pass-through Conductor           CLOSED   this packet
       CORE + DEEP-repair             ADOPTED — byte-identical
       FAST                           PROVEN, adoption deferred (§3)
       voice / between-chat           OUT OF REACH until endpoint adoption
 ↓
P3a  DEVELOPMENTAL MEMORY ELIGIBILITY CONVERGENCE   ← NEXT · P0 PRIORITY
P3b  remaining tier convergence (incl. D8)
P4+  participation record · embodiment · restraint

HEALTH TRUTHFULNESS   KNOWN BROKEN · NOT REPAIRED
                      was blocked by the P2 seam — now unblocked
```

The program can now make its **first deliberate cognition change.** P3a asks one question and changes one thing:

> Given equivalent member state, does canonical composition make developmental memory eligible under the same authority and consent rules regardless of whether cognition executes FAST, CORE, or DEEP?

What converges is **intelligence eligibility, not inference budget.**
