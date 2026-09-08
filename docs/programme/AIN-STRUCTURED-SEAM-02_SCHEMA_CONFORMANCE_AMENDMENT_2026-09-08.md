# AIN-STRUCTURED-INFERENCE-SEAM-01 — Governed amendment #2 · schema conformance

**Authorizing act**: founder ruling 2026-09-08, after G8 attempt #3 stopped at Window 4.
**Amendment commit**: `f6a8a3dc` · **baseline move**: the commit that follows it.
**Standing**: ⛔ IMPLEMENTED · GATED · **NOT WITNESSED.** No G8 rerun. No PR. No deploy.

---

## 1 · The law

> **A structured caller may require provider-enforced schema conformance. A provider that
> cannot guarantee it must refuse; it may not silently downgrade to ordinary tool use.**

The failure it answers: a completed `tool_use` whose `notices` array arrived as a **JSON string
containing corrupt JSON**. Post-cognition contract failure — no retry, C5 stands — so the repair
had to move *upstream of the failure* rather than build tolerance downstream of it.

> Stop asking for schema-invalid arguments in the first place.

## 2 · Provider-neutral by construction

The seam states the **requirement**; each adapter chooses its **mechanism** — the precedent is
`execution.completion`, which says "this completion may take long" and lets the Anthropic
adapter satisfy it by streaming.

```
StructuredTool.inputSchemaConformance?: 'best_effort' | 'provider_enforced'
StructuredProvider.enforcesInputSchema: boolean        (REQUIRED — declared, never inherited)
StructuredRefusal += 'schema_conformance_unavailable'
```

⛔ **No vendor term appears in `types.ts` or `router.ts`** — asserted by **SC6** with comments
stripped, since those files must be able to *discuss* the mechanism they may not *name*. The
vendor's field lives only in the adapter, where the seam's whole design puts it.

```
Encounter → inputSchemaConformance: 'provider_enforced'
              ↓
          structured seam → refuses BEFORE cognition if unguaranteed
              ↓
          Anthropic adapter → the vendor's own tool-definition mechanism
```

**Refusal, not downgrade.** The check sits in the router's shared `execute()` funnel, before any
provider call, on every path including local. A downgrade would send the request as ordinary
tool use and return an answer that happens to validate — but the caller asked for a *guarantee*,
and a likely outcome is not one.

## 3 · Boundaries preserved

| required boundary | how |
|---|---|
| No retry | nothing here retries; C5 untouched |
| Parser stays strict, as an independent backstop | **SC8** pins the exact Window 4 shape as still refused |
| No malformed-envelope salvage | unchanged |
| No schema relaxation | schema passed through unrewritten (**SC2**) |
| No change to exact-excerpt binding | `bind.ts` untouched |
| No change to scope | `contract.ts` scope untouched |
| **DEVELOP unchanged** | omitting the field omits the key entirely — **SC1** proves byte-identical wire params |
| Provider unable to guarantee must refuse before cognition | **SC3/SC4** — refusal returned, `execute` never called |
| Byte-pinned baseline moves only as a governed act | see §5 |

⭐ **The parser is not relaxed and must never be.** Provider enforcement and `parseNoticeBlocks`
are two independent instruments, and only the second is one we compute ourselves. *A guarantee
we did not compute is a guarantee taken on trust* — if enforcement silently stopped working, the
parser is what would still catch it.

## 4 · Falsifiers SC1–SC8

| # | obligation |
|---|---|
| SC1 | a caller that asks for nothing sends byte-identical params; explicit `best_effort` is also silent on the wire |
| SC2 | `provider_enforced` reaches the vendor on the **tool definition**, on that tool only, with the schema unrewritten |
| SC3 | a provider that does not guarantee conformance **refuses** |
| SC4 | the refusal is **before cognition** — no call is made |
| SC5 | a provider that does guarantee it proceeds |
| SC6 | ⛔ no vendor term in `types.ts` or `router.ts`, comments stripped; the requirement is spelled in seam vocabulary |
| SC7 | Encounter's result tool declares the requirement, and Encounter never names the vendor term either |
| SC8 | ⛔ the parser is **not** relaxed — the exact Window 4 shape and every other parser obligation still refuse |

## 5 · ⭐ The baseline move is its own commit

The byte-pin failed on three of the four seam files. **It was right to fail** — it is a
constitutional stop asking *who authorized the seam itself to change?*

The amendment lands at `f6a8a3dc` with the pin **still on the previous baseline**, so that guard
is red there **on purpose**. The move to `f6a8a3dc` is the commit after it.

> ⛔ Folding the pin move into the amendment would let a seam change and its own authorization
> arrive as one indistinguishable act — exactly the property this instrument exists to deny.

`ORIGINAL_SEAM_MERGE` and the superseded `PROVENANCE_SEAM_BASELINE` are both retained, with a new
control asserting all three are distinct: an amendment history that collapses to its latest value
cannot show that each change was separately authorized.

## 6 · Two DEVELOP call sites, and why they were touched

Widening `StructuredRefusal` surfaced `lib/manuscript/developmentalReader/read.ts:110` and
`lib/manuscript/developmentalReading/classify.ts:217`, which pass the seam's refusal straight
into their own narrower unions. The new value is **unreachable** for them — DEVELOP requests no
enforcement — so each maps it explicitly to `not_configured` rather than adding it to its
vocabulary. ⛔ *Declaring a refusal it cannot receive would itself be the behaviour change the
amendment must not cause.*

## 7 · ⚠ The one unknown, stated before the run

The Encounter envelope has `required: ['outcome']` with `notices` **optional**, and uses
`minItems`. Whether the provider's enforcement admits optional properties and every keyword this
schema uses is **not established here**. If it does not, the request is rejected at validation —
which surfaces as a refusal **before cognition**, not as corrupted output. That is the correct
failure mode, and it is the first thing the rerun will reveal.

⛔ **Do not pre-emptively restructure the envelope to make enforcement more likely.** `outcome:
'none'` carrying no `notices` is a ratified part of the contract (B3), and reshaping it to suit a
provider would be bending the caller's constitution to a vendor's validator.

## 8 · Gates

| gate | result |
|---|---|
| structured seam suites (incl. the moved pin) | **74 passed · 0 failed** |
| Encounter suite | **107 passed · 0 failed** |
| `lib/ai/structured` + `lib/manuscript` | **1112 tests · 0 failed** |
| `npm run typecheck` | **231 vs baseline 239 · 0 regressions** |

## 9 · Owed

1. ⛔ **G8 whole-Work rerun at the SAME 12k windows**, founder-run. The point is to learn whether
   33 consecutive completions are reliable once the provider is no longer permitted to generate
   schema-invalid arguments.
2. **Only then** decide whether reliability architecture is needed at all.
3. ⛔ `retry taxonomy` HOLD · `window-size change` HOLD · `p measurement campaign` HOLD ·
   **F-4 stays separate** — three false positives across three lexical families is a clear
   pattern, and it fails safe; mixing it into this repair would repair two things at once.
4. ⛔ E3 HOLD · PR HOLD · deploy HOLD.

> The seam did not learn a vendor's word. It learned to ask for a guarantee, and to refuse when
> nobody can give one.
