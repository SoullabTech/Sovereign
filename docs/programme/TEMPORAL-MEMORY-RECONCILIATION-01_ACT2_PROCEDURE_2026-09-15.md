# TEMPORAL-MEMORY-RECONCILIATION-01 · ACT 2 PROCEDURE — Two-Cut Availability Witness

**Date**: 2026-09-15 · **Status**: ⛔ **SPECIFIED, UNSPENT** · **Authority**: the ACT 1 ruling
(`…_ACT1_RULING_2026-09-15.md` §8) authorizes *F2 counterfactual + selectionTrace* as the evidence
method. ⛔ New runtime instrumentation NOT authorized. ⛔ Repair NOT authorized.

## 1. The question

> **Where does decay change availability, and at which cutoff?**

```
eligible pool
    ↓
decay-bearing SQL score
    ↓
TOP 12               ← CUT 1 · counterfactual required
    ↓
MemoryBundle merge → rank → dedupe
    ↓
TOP BULLETS          ← CUT 2 · selectionTrace already observes
```

## 2. ⭐ Stage A needs no new instrument — it already exists

`scripts/witness/temporal-memory-audit.sql` **§2** *is* the Cut-1 witness, already committed,
already run once against production (2026-09-06), read-only, no persistent writes, two
session-local temp tables dropped at the end.

Fidelity, verified by reading both:
- Its `score_with` is **term-for-term identical** to the live `getSemanticMemories` SQL — all four
  terms, same coefficients, same pool filter (`content_text IS NOT NULL AND (valid_to IS NULL OR
  valid_to > NOW())`).
- **Neutralization is by holding the decay factor at 1** (`0.40 * significance`) — same weight, no
  time penalty. ⛔ It is *not* removal of the term, which would change the score scale and make the
  comparison meaningless.
- **§2.c is literally the exclusion witness**: rows with `rank_without <= 12 AND rank_with > 12` —
  *memories decay kept out*. §2.d is its mirror — *memories decay held in*.

Two fidelity notes to carry into any claim:
1. The witness adds `, id` as a rank tiebreak; the live query is `ORDER BY score DESC LIMIT 12` with
   **no tiebreak**, so production is nondeterministic on exact score ties and the witness is not.
   The witness is therefore at least as strict: a flip it reports is real.
2. ⭐ **The live Cut-1 SQL binds only `$1 = userId`.** `queryText` and `facet` are accepted by
   `getSemanticMemories()` and never used in the non-vector path. **Which twelve developmental
   memories are available is decided before the member's current message is consulted at all** —
   relevance enters only later, at `rankCandidates`, where they compete against turns and
   breakthroughs. Stage A is therefore *faithful to the live cut*, not an approximation of it.

**Re-running it under this lane records into this lane's own result file.** ⛔ The 2026-09-06
direction note is FROZEN and is not edited.

## 3. ⚠️ Stage B is voice-scoped, and the record must say so

`selectionTrace` is emitted as `[voice:memory_selection:<turnId>]` — full JSON,
`{id, src, score, rank, sel}` per candidate, selected and unselected alike — from
`app/api/voice/stream-conversation/route.ts`.

`MemoryBundleService.build()` has **four** call sites. Only the voice route emits the trace:

| call site | emits selectionTrace |
|---|---|
| `app/api/voice/stream-conversation/route.ts` | ✅ |
| `app/api/sovereign/app/maia/list/route.ts` | ❌ |
| `lib/consciousness/maiaOrchestrator.ts` | ❌ |
| `lib/voice/wisdom/MaiaWisdomProvider.ts` | ❌ |

⛔ Adding the emission to the text route would be new runtime instrumentation, which this ruling
does not authorize. **ACT 2's Cut-2 evidence is therefore VOICE-SCOPED**, and must be stated that
way rather than presented as coverage of MAIA's main text path.

## 4. Procedure

**Stage A — Cut 1 (production, read-only, founder-run)**
```
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1' \
  < scripts/witness/temporal-memory-audit.sql
```
Record §2.a (pool size, members where top-12 is an actual cut), §2.b (headline: members whose set
changes), §2.c (excluded by decay), §2.d (held in by decay), §2.e (per-type displacement). Verbatim.

**Stage B — Cut 2 (voice turns only)**
```
ssh soullab@minisforum 'docker logs maia-sovereign --since <window> 2>&1 | grep -E "voice:memory_selection|voice:memory_trace"'
```
For each turn: how many candidates, how many `sel:true`, and whether the ordering that decided
selection is the decay-bearing SQL score (developmental rows keep it) or the decay-free fallback
formula (turns and breakthroughs get it).

## 5. Claim boundary — binding

ACT 2 **MAY** establish:
> Decay changes which valid memories survive into MemoryBundle's available and selected sets.

ACT 2 **MAY NOT** claim:
> Decay changed what the member experienced.

That requires binding a selected memory through the actual cognition / prompt / response path. **Keep
availability effect separate from member-visible consequence.**

## 6. Evidence discipline

- ⛔ No `content_text`, no excerpt, no digest. Member and memory ids as 8-char prefixes only (the
  existing script already enforces this).
- ⛔ No persistent writes. The script's temp tables are session-local and dropped.
- ⛔ No new observer, no shim, no added log line. If a question cannot be answered by these two
  existing surfaces, it is reported as unanswerable under the current authorization — not built
  around.

## 7. Stop conditions (a run that hits any of these yields NO EVIDENCE, not a finding)

1. The script errors or `calculate_decayed_confidence` is absent.
2. Fewer than two members have a pool exceeding 12 — Cut 1 is then not a cut and §2.b is vacuous.
3. Log retention does not cover a window containing voice turns with a non-empty trace.
4. Any observed divergence between the script's `score_with` and the live SQL at the runtime SHA —
   re-verify term-for-term before reading any result.
5. Any temptation to repair, re-weight, add an emission, or wire the unreached TS implementation.

## 8. Standing

⛔ **UNSPENT.** No stage run. No production read performed under this lane. The four routed
observations stay outside this act. Repair not authorized. New scorer out of scope. Production
untouched.
