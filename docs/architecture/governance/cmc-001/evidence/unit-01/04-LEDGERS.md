# CMC-001 · §XXXIV — Artifact 4: Provenance / Capability / Correction Ledgers

Referent: `origin/clean-main-no-secrets @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc`

---

## A. Provenance discontinuity ledger

| # | Point | Preserved before | Lost / changed at | Evidence |
|---|---|---|---|---|
| P1 | Runtime-contract inventory | 11 addendum strings + memoryHealth | reduced to `!!x` and `x.length`; **no content retained** | `maiaRuntimeContext.ts:292-324` |
| P2 | Conversational recall | prior-exchange records (≤6) | prose block; per-exchange durable IDs do not survive; content clipped at 280 chars | `conversationalRecallBlock.ts:78,143-144`; `route.ts:980` |
| P3 | Episodic recall | marked-episode records (≤5) | prose block; episode ID lost; timestamp reduced to day granularity | `episodicRecallBlock.ts:84,114,149-150,158` |
| P4 | Atoms | `MemoryAtomSnapshot[]` structured | prose block for the model; **structured form survives in-route** and feeds health/telemetry — a partial, not total, discontinuity | `route.ts:959-961, 1075, 1092, 1217` |
| P5 | `relationalContext` | `ActiveRelationalContext` structured (`relationshipId`, kinds, themes, tensions) | prose; **`relationshipId` survives only out-of-band in `meta.relationalContextId`, not inside the block**; no timestamps survive at all | `formatRelationalContextForPrompt.ts:15-18,44-86`; `route.ts:882,1221` |
| P6 | `relationshipContext` | `RelationshipMemoryContext` (encounters, phase, themes, breakthroughs) | prose at `formatRelationshipMemoryForPrompt`; capped to 3 themes / 1 breakthrough / no patterns on FAST | `maiaService.ts:684-691,1090-1092` |
| P7 | Memory health | 12-layer structured status + confidence | **never reaches the model at all**; terminates in logs + response payload | `route.ts:1116-1119,1528-1529`; absent from `:1189-1237` |
| P8 | `*Expected` declarations | registry booleans | **no consumer exists**; declaration never meets reality | `git grep` exhaustive, 4 hits each, all definitional |
| P9 | Layer naming | atoms row count | stored as `memoryHealth.semantic`, a name asserting retrieval that does not occur on this path | `memoryHealth.ts:97-100`; `route.ts:1088-1092` |
| P10 | Health layer counts | retriever candidate counts | conflated with emission — `'ok'` does not mean "reached the prompt" | `route.ts:1097-1107` |

**Counter-observation worth equal weight (§IX, §X):** P5's loss of structured identity is
*partially compensated in prose* — the block names who authored what and forbids
present-tense assertion (`formatRelationalContextForPrompt.ts:10-21, 75-86`). This is the
inverse of the §XIII defect pattern: provenance was carried into the serialization as
*language* rather than discarded. Recorded as evidence, not endorsed as architecture.

---

## B. Capability candidate ledger (§XVII — record only, no redesign)

| ID | Capability | Location | Why worth preserving |
|---|---|---|---|
| CC-1 | Prose-carried provenance labelling — distinguishes member-authored from system-inferred *inside* the model-facing block | `formatRelationalContextForPrompt.ts:59-86` | Directly serves §X: gives latent/inferred material less assertion license than member-authored material, without hiding it |
| CC-2 | Assertion-warrant flooring — "no timestamp… never present it as current fact… if the member says otherwise, the member is right" | `formatRelationalContextForPrompt.ts:77-85` | An executable expression of "depth of synthesis does not confer authority of assertion" (§X) |
| CC-3 | Named suppression reasons — `opt-out` / `sanctuary` / `empty` / `session-resumption` / `non-recent` returned as data, not silence | `conversationalRecallBlock.ts:86-102`; `episodicRecallBlock.ts:92-111` | Makes non-emission observable and attributable; a ready substrate for honest degradation reporting |
| CC-4 | Member-marked-only episodic selection — explicit refusal to infer significance | `route.ts:998-999` | Keeps explicit-recall warrant high by construction |
| CC-5 | Memory Transition Records — available→retrieved→eligible→offered→injected, "reasons as sentences, never scores" | `route.ts:1024-1049`, `lib/maia/memoryTransitionRecord.ts` | Per-source accountability that already separates retrieved from offered — the exact distinction P10 shows `memoryHealth` lacks |
| CC-6 | Symmetric sanctuary gating on both write and read of relational content | `route.ts:865-866, 873` | Membrane discipline applied to retrieval, not only storage |
| CC-7 | Output-side memory-canon scrubber — post-generation guard against amnesia language | `route.ts:1254-1275`, `lib/maia/prompts/memoryCanonGuard.ts` | Enforcement at the traffic-bearing route rather than in a prompt instruction the model can override |
| CC-8 | Explicit-handoff-only relational retrieval, with `allowRecentThreadFallback` deliberately off | `route.ts:868-870` | Treats ambient relational retrieval as "membrane leakage"; a governed alternative to maximal recall |
| CC-9 | `context-inventory` per-turn emission listing evidence providers | `maiaService.ts:2905-2937` | An existing, already-wired inventory of what was available at dispatch |

---

## C. Correction / contradiction ledger

| ID | Prior claim | Superseding evidence | Disposition |
|---|---|---|---|
| X-1 | `memoryHealth.ts:203-210` — "the response **must** amplify the §VI fallback block"; "the handler **uses this** to decide whether to inject extra §VI emphasis" | `route.ts:1116-1120`: sole consequence of `isBaseChainDegraded()===true` is `console.warn`. No prompt injection; no downstream reader. | **Comment retracted as evidence of behavior.** §III: executable code outranks comments. Degradation is log-only. Not repaired (§XIX). |
| X-2 | Reading `relationshipContextService.ts` / `body.relationshipContextId` as producing `relationshipContext` | Executable dispatch: `route.ts:877-882` assigns to `relationalContextAddendum`; `maiaService.ts:1090-1092` builds `relationshipContext` from a different loader | **`SURFACE_SUBSTITUTION` avoided.** Two contributors, not one. Resolved from dispatch, not naming. |
| X-3 | `MaiaRuntimeContext` as the runtime *carriage* contract for continuity | `summarizePromptBlock` retains only booleans + lengths; content travels separately in `meta` to `getMaiaResponse` | Contract reclassified: **observability inventory, not carriage**. |
| X-4 | Registry `memoryHealthExpected` / `atomsExpected` as an enforced expectation | Exhaustive `git grep` at `52a3b92`: 4 hits each, all definitional; CI guard asserts neither | Reclassified as **declared-but-inert**. Comments at `:18-19, 34-37, 55-57` self-describe the enforcement as deferred, so this is a stated deferral, **not** a §IV method error. |
| X-5 | `memoryHealth.semantic` as evidence of semantic retrieval on `/list` | `memoryHealth.ts:97-100`; `route.ts:1088-1092` — fed by atoms row count; "no semantic retrieval exists on this path" | Layer name does not license the capability claim. Recorded; not repaired. |
| X-6 | `memoryHealth.conversational/episodic === 'ok'` as evidence a block reached the prompt | `route.ts:1097-1107` — counts are retriever candidate counts, emission is a separate signal | Health `'ok'` ≠ injected. |

No prior CMC-001 finding was superseded — this is the program's first execution unit.
Entries X-1…X-6 supersede *repository-internal* claims, not prior census claims.
Per §XXIV nothing is erased; each superseded claim is preserved above with its reason.
