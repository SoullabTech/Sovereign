# JARVIS-MAIA-STANDING-SHADOW-01 — S4 Offline Comparison

**Date:** 2026-09-16
**Mode:** local-model R&D only
**Production authority:** NONE
**Model:** `llama3.1:8b` · temperature `0.2` · seeds `42`, `137`

## Question

Can the same production-shaped Writer's Studio `CanonicalTurn` support a standing-aware shadow response while holding member input, participant membership and constitutional floor fixed?

## Instrument evolution — preserved, not rewritten

### Attempt 0 — no artifact

The first long replay process ended without a custody artifact. No result was admitted.

### S4-v2 — plain JSON contract

The next instrument captured failures per cell and one same-parameter transport retry.

```text
rows                 24
current responses    12
shadow cells         12
shadow rendered       1
shadow refused        6
transport failures    5
```

The transport failures were local Ollama repeat-limit aborts. Several other cells produced malformed or schema-incompatible JSON. **Finding:** prose asking for JSON is too brittle to be the structural standing boundary.

This labeled packet is held privately off-repo and hash-bound in S5 custody.

### S4-v3 — schema-constrained plan, but no current-input evidence id

The caller moved the plan grammar into an Ollama JSON Schema generated from the legal evidence ids. This removed the transport instability:

```text
rows                 24
current responses    12
shadow cells         12
shadow rendered       6
shadow refused        6
transport failures    0
```

But inspection found a deeper architecture defect: the projection contained only MIPA participants. The writer's actual current utterance lives separately at `CanonicalTurn.encounter.input` by design. The shadow model heard the current utterance as the user message but could not cite it as evidence, so several plans cited older history for claims about what the writer was saying now.

The canonical-turn spec explicitly classifies **current input** as `member_authored`; the editorial contract explicitly keeps current words out of history to avoid duplication. S1 was therefore corrected rather than papering over the gap.

### S4-v4 — schema-constrained plan + first-class current-input evidence

The final instrument adds a deterministic current-input evidence id:

```text
I:<turnId>:<inputDigest-prefix>
```

Standing:

```text
authoredBy          member
participationClass  authored
authority           situate
claimStanding       unavailable / not carried by CanonicalTurn
```

The current input's text is **not** copied into the system prompt. The prompt carries only its evidence id and standing metadata; the exact words remain the single user message.

Final run:

```text
rows                 24
current responses    12
shadow cells         12
shadow rendered      10
shadow refused        2
transport failures    0
```

Both refused cells were deterministic `borrowed_first_person` refusals.

## Finding 1 — structured plan grammar matters

Moving from a prose JSON request to a schema-constrained plan eliminated the local-model transport/shape failures in the final run.

This supports a narrow design principle:

> **If standing is structural, the plan grammar that carries synthesis across the boundary should also be structural.**

This does not prove Ollama JSON Schema is the future production mechanism. It proves only that “please return valid structured output” is a weaker boundary than a mechanically constrained output form.

## Finding 2 — present input must be citable without being duplicated

`CanonicalTurn.encounter.input` is not another participant and must not be copied into history or the system prompt. But a standing-aware composition needs an identity for it so current correction, rejection, adoption and reversal can be distinguished from older material.

The final projection therefore treats the present utterance as first-class evidence while preserving the one-copy rule.

## Finding 3 — valid evidence identity is not semantic entailment

A critical result remains unresolved:

```text
final rendered shadow plans using current-input evidence id: 0 / 10
```

All ten rendered plans cited valid participant evidence ids instead.

The model nevertheless had the present utterance as its user message, so this does **not** prove it ignored the current turn behaviorally. It proves something narrower and more important for provenance:

> **A model-selected valid evidence id is not proof that the cited evidence actually supports the synthesis.**

Therefore the instrument field named `supportEvidenceIds` must not be treated as substrate truth in any implementation proposal. At best it is a model-authored reference claim until separately validated. Participation, provenance and entailment are different axes.

This keeps `SH-G7 · CORRECTION-PRIORITY` structurally **UNPROVEN** even though the response texts can now be human-reviewed for correction behavior.

## Finding 4 — the first-person prototype is over-broad

The two final refusals were not repeats of the original Silver Cedar failure (“my work”, “my life” spoken as if MAIA were the member). They contained ordinary MAIA self-positioning such as:

- “I want to respect that boundary…”
- “I hear that you're still holding…”

The inherited prototype currently refuses *all* first-person singular tokens in MAIA-owned synthesis. Production-shaped replay shows that this heuristic conflates two different things:

1. **member-voice borrowing** — constitutionally dangerous;
2. **MAIA naming her own relational stance** — potentially legitimate.

The two cells remain refused and excluded from S5; the rule is not weakened after seeing outputs. A future implementation proposal must solve voice ownership structurally rather than shipping the blanket regex as doctrine.

## What S4 establishes

- Same-turn comparison apparatus is mechanically viable.
- Current and shadow arms preserve the same participant membership, participant texts, constitutional floor and member input.
- Structural output grammar materially improves plan reliability.
- Current utterance needs its own evidence identity outside MIPA participation.
- The Standing Envelope still prevents a model plan from assigning its own authorship/standing/authority.
- Ten complete A/B pairs are available for human blind review.

## What S4 does not establish

- that shadow responses are better;
- that correction priority is structurally solved;
- that model-selected evidence references are truthful support claims;
- that the blanket first-person refusal is production-suitable;
- that a production shadow call should be wired;
- that `llama3.1:8b` predicts production-model behavior.

## Standing

```text
S4 apparatus comparability         ✅
S4 local calls                     ✅ 24 / 24 final run
S4 shadow render                   10 / 12
S4 excluded constitutional cells   2 / 12
S4 transport failures              0 / 24 final run
current-input evidence identity    ✅
current-input citation by model    0 / 10 rendered · STRUCTURAL GAP
behavioral winner                  ⛔ NOT ADJUDICATED
production-shadow authority        ⛔ NONE
```

**Next:** S5 blind human review of the ten admissible pairs. No S6 implementation proposal may open from response quality alone; the support-lineage and voice-ownership gaps must remain explicit blockers.

## Off-repo labeled custody commitments

To preserve S5 blindness, labeled packets are **not** committed. Private custody is mode `0600`; only hashes are carried here:

```text
full production-shaped prompt fixture packet  a06434839c18ce6168d249b44f412e9d3b7f33008a1846b0ab25dd47e7dc908d
S4-v2 plain-JSON failure packet              9f4bc93edbb423553a0c115713c0a826fe21f994dd356ca2c2e2bab0db51c686
S4-v3 schema/no-current-input packet         bb3025a38cb3e886ba72e50e9c4b8134abef4f8ea8763add4b80763d2a625df5
S4-v4 labeled final packet                   99e44b2333500f779905fe4d93da0b7d144a0d2888b237560c479dabeb985962
S5 condition key                             76f8feef4b5a240836f8b6135a5049c7dfb9126399381be006d7fe77e358ba85
```

The labeled packets can be reconciled against these commitments after the human review is sealed. Publishing them before that would destroy the blind.
