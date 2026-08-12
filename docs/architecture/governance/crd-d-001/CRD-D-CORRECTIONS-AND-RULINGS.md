# CRD-D — Corrections and Founder Rulings

Attached to the Cognitive Range Discovery record. Corrections precede the findings they qualify.

---

## COR-1 · The interpretation of DEEP at 0% — founder ruling

> **DEEP at 0% is evidence about routing availability, not evidence about member need.**

An earlier framing of A0's result ("DEEP is effectively dead") invited the inference that members do not need depth. **That inference is not supported and must not be carried forward.**

The router structurally suppresses adaptive DEEP selection:

- `MAIA_ENABLE_COGNITIVE_TURN_EVENTS` gates **both** the writing and the reading of `cognitive_turn_events`. Off by default → `getCognitiveProfile` returns null → **the only adaptive DEEP trigger is unreachable, not merely rarely satisfied.** Self-sealing.
- The remaining triggers are 11 exact substrings and a >700-character threshold with additional conditions.
- CORE's catchment (`textLength > 150`) absorbs essentially everything substantive, regardless of environment.

**Prevalence therefore cannot be read as demand.** The measurement never had the opportunity to express member need. What 0% establishes is that *the router almost never permits DEEP* — a fact about architecture, not about people.

This is the same substitution pattern the session has been correcting throughout: *absence of routing* read as *absence of need*.

## COR-2 · EXPANSIVE — the absence claim is not supported as stated

CRD-D reported "zero identifier occurrences" for EXPANSIVE and classified the territory **D — the search is complete and clean**.

**The search was too narrow.** Uppercase `EXPANSIVE` is indeed absent, but **29 files contain `expansive`**, and some occurrences are live code rather than prose:

```
expansive: { maxSections: 6, targetWords: 100 }
cognitiveStyle: 'associative, expansive, experimental'
energySignature: "Sharp mental clarity with expansive thinking"
```

All sit under `app/api/_backend/` — the lineage established as *not* the sovereign path — and all denote **verbosity, voice profile, or prompt text.**

**Corrected formulation, per founder ruling:**

> **EXPANSIVE-as-word exists. EXPANSIVE-as-cognitive-capacity is not established.**

The conclusion is probably right; the evidence behind it was one casing of one token. **Do not let "zero uppercase identifier" survive as an absence claim.** The `D` classification stands with reduced confidence: not *"the search is complete and clean"* but *"nothing corresponding to the intended capacity has been found, by a search that was narrower than claimed."*

## COR-3 · CorpusCallosumPrinciple importers — conclusion holds, evidence adjusted

CRD-D reported **zero importers**. There is **one reference**: `lib/firewall/FirewallRepair.ts:13`, and it is `* @see lib/core/CorpusCallosumPrinciple.ts` — **a comment, not an import.**

The conclusion holds: the doctrine module is unreferenced by executable code. The evidence was slightly wrong, and fittingly the thing resembling an importer turned out to be a comment.

**Founder caution to carry:** this establishes only that the *doctrine module* is unexecuted. The same-named `corpusCallosumService.ts` **is** active as a trace writer. Do not infer implementation from the doctrine's existence, and do not infer absence of all corpus-callosum machinery from the doctrine's disuse. Two artifacts, one name.

---

## The surviving design conclusion

> **Resurrect the capacity called depth. Do not simply resurrect the implementation called DEEP.**

They are two different objects. What exists as DEEP is a **resource-allocation policy wearing the name of a cognitive capacity**: more memory, cross-session recall, an 8s elemental bridge, a 4.5s race — with its signature step (Claude consultation) **off by default** and its provider recorded as the literal `'consciousness-wrapper'`.

Reconnecting it would raise the DEEP *rate* without producing depth. This is why the territory classifies **B** — what is missing is a ruling on what DEEP *is*, not further investigation.

Corroborating: `profileToConsciousnessLevel` maps FAST→1 / CORE→3 / DEEP→5 with "Sonnet vs Opus" reasoning, and `ORACLE_PROFILE='DEEP'` is pinned to "always premium model." **The ladder the founder explicitly told the unit not to assume is already asserted in the codebase.** Capacity and compute are separated in fact and fused in doctrine.

## Classifications, as corrected

- **DEEP / CORE / FAST → B.** Pieces exist and are reachable; reconnection alone would not produce depth; viable substrates exist unread. Needs a founder ruling on what DEEP is.
- **EXPANSIVE / HIGH → D**, with COR-2's reduced confidence attached.

**Not performed and reserved to the north-star stage:** the `DEPTH × SPAN × ALTITUDE` ↔ `Fire/Water/Earth/Air → corpus callosum → Weather` reconciliation. Topology left open.
