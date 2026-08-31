# WIC01-P2 — PASS-THROUGH CONDUCTOR · CLOSURE

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Packet:** P2 — move the decision boundary; do not change the decision
**Executed:** 2026-08-31 · **P2A** shared seam · **P2B** FAST adoption

```text
P2A  SHARED-SEAM CONDUCTOR EXTRACTION   CLOSED   (CORE + DEEP-repair)
P2B  FAST CONDUCTOR ADOPTION            CLOSED   (byte-identical, incl. quirks)
P2   CANONICAL TIER BOUNDARY            CLOSED   — all three tiers cross conduct()
```
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

## §3 — P2B: FAST adoption, and the two asymmetries it had to reproduce

P2A closed with FAST still composing outside the Conductor. That left **two composition paths** and 27.1% of production turns bypassing the canonical boundary — which is not a canonical boundary. P2B closes it.

`fastComposedAddenda` now replaces the contiguous addendum run in the FAST template literal (`lib/sovereign/maiaService.ts:1432`). `placeAddendum` (earlier) and `youthPromptAddendum` (after `stateVectorContract`) sit outside that run and are untouched.

### Two asymmetries, not one

The first pass found one divergence. Wiring FAST for real surfaced a **second, more consequential** one that the earlier test had not exercised:

| | shared seam (CORE / DEEP-repair) | FAST template |
|---|---|---|
| separator | `\n\n` before every block | `\n\n` — **except `knowledgeField`, which is bare** |
| eligibility | `safeAddendum`: **trims**, drops `'undefined'` / `'null'` | **raw truthiness, NO trim** |

The second one has teeth: under the shared rule a whitespace-only block is *absent*; under FAST it is **present and renders verbatim**. The literal string `'undefined'` behaves the same way. Had P2B reused `normalizeContent` for FAST, those turns would have silently lost a block — a real cognition change, disguised as cleanup.

### The architecture accommodated reality

Both quirks are expressed as policy, not normalized away:

```ts
export const FAST_RUN_LAYOUT: LegacyLayout = {
  defaultSeparator: '\n\n',
  separatorBySource: { knowledgeField: '' },
  eligibility: 'truthy',
};
```

> **The delimiter discrepancy was not authority to normalize FAST. It was a requirement on the pass-through architecture.**

Reality does not get rewritten to make the abstraction prettier. The abstraction had to become able to say what reality already does — and `LegacyLayout` is that.

### Witness

Byte-identical against a verbatim reproduction of the FAST template's own rules, across full population · without `knowledgeField` · `knowledgeField` alone · with developmental memory · member-declared significance only · Sanctuary · empty turn · and **300 randomized populations that deliberately include whitespace-only blocks, the literal string `'undefined'`, empty strings and nulls.**

**57 contract tests pass.** `npm run typecheck` green: 231 vs 239 baseline, no regressions.

---

## §3b — The witness constrains the architecture, not the reverse

Worth recording as method, not anecdote.

The first FAST test I wrote contained a no-op `.replace()` chain that transformed

> *"our abstraction cannot reproduce legacy behavior"*

into

> *"legacy behavior is byte-identical."*

It passed. It was wrong. Caught and rewritten before closure — and the rewrite is what exposed the truthiness asymmetry that the tidy version would have hidden all the way into production.

**This is the epistemic discipline of the whole program in miniature.** A witness that bends to fit the architecture certifies nothing. The standard has to be able to fail, or it is not a standard — and here it failed twice before it passed honestly.

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

## §7 — Closure gates

### P2A — shared-seam extraction

```text
[x] canonical conduct() seam exists
[x] P0 typed evidence crosses that seam
[x] CompositionPlan is structured and inspectable
[x] CORE source-set / order / prompt equivalence proven
[x] DEEP-repair equivalence proven by fixture
[x] D7 + D8 intentionally reproduced
[x] no behavioral convergence smuggled in
[x] presenceMode failure correctly excluded from this unit
```

### P2B — FAST adoption

```text
[x] FAST enters conduct()
[x] existing FAST source set preserved
[x] existing FAST order preserved
[x] exact FAST delimiter behavior preserved      (knowledgeField bare)
[x] exact FAST eligibility behavior preserved    (raw truthiness, no trim)
[x] final FAST model-facing prompt byte-identical
[x] randomized equivalence witness green         (300 cases incl. quirks)
[x] D7 unchanged
[x] no eligibility changes
[x] no source changes
[x] no model/tier routing changes
[x] no endpoint convergence
[x] typecheck / contract gates green
```

---

## §8 — Voice: deferred by adjudication, not passed

```text
VOICE CANONICAL-SEAM ADOPTION
DEFERRED BY SCOPE

Reason:
voice/stream-conversation is itself a parallel cognition embodiment.
Moving it through conduct() is a later convergence packet, not a
pass-through extraction of the shared maiaService path.
```

This is **architectural information discovered by P2**, and the program's diagrams must not overstate it. The truthful picture:

```text
shared cognition (maiaService)
   CORE ─┐
   FAST ─┼─→ Conductor            ← canonical tier boundary, CLOSED
   DEEP ─┘

voice/stream-conversation
       └── independent cognition stack     ← convergence still owed

between/chat
       └── independent cognition stack     ← convergence still owed
```

**Not** "all MAIA cognition → Conductor." That claim is not yet true and must not be drawn.

---

## §9 — Standing

```text
P0   typed evidence contract          CLOSED   1d09c42
P1   runtime / source adjudication    CLOSED   9ab6046
P2A  shared-seam extraction           CLOSED   e8ac679
P2B  FAST adoption                    CLOSED   this packet
P2   canonical tier boundary          CLOSED
       CORE · FAST · DEEP             ALL CROSS conduct()
       voice · between/chat           convergence owed (own packets)
 ↓
P3a  DEVELOPMENTAL MEMORY ELIGIBILITY CONVERGENCE   ← NEXT · P0 PRIORITY
health truthfulness packet            D1/D2/D16 — now meaningfully scoped
P3b  remaining tier convergence
```

All three cognition tiers of the shared path now compose at one boundary, and none of them changed a byte doing it. **The program can now safely begin changing what the boundary decides.**

P3a asks one question and changes one thing:

> Given equivalent member state, does canonical composition make developmental memory eligible under the same authority and consent rules regardless of whether cognition executes FAST, CORE, or DEEP?

What converges is **intelligence eligibility, not inference budget.**
