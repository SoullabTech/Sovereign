# H7g-CHAT-REPLAY-01 — Standing-Aware Multi-Axis Attention

**Status:** OFFLINE R&D ONLY · **Verdict: NOT CONFIRMED**

**Frozen spec SHA-256:** `ad331b3d20b83d046b2fdf869bcf5a9a9b2d174d7c26869d9de8394815fbfde8`

This is a controlled chat-run replay, not a production or repository change. The five-case corpus, selector math, gold features, and pass conditions were frozen before outcome computation.

## Conditions

- **A:** query relevance only
- **B:** query relevance + standing/provenance priority
- **C:** B + generic unseen-axis coverage bonus

## Aggregate result

| Metric | A | B | C |
|---|---:|---:|---:|
| Gold-feature recall | 9/15 | 11/15 | 11/15 |
| Primary relevance | 3/5 | 3/5 | 3/5 |
| Standing-critical | 1/5 | 4/5 | 4/5 |
| Independent-axis | 5/5 | 4/5 | 4/5 |
| Superseded selection with authoritative same-referent candidate present | 1 | 0 | 0 |

## Frozen promotion checks

- PASS — B standing-critical recall > A
- PASS — B primary worse than A on <=1/5
- FAIL — C independent-axis recall >=4/5 and > B
- FAIL — C total >=12/15
- PASS — C superseded selections = 0
- PASS — C primary worse than A on <=1/5

## Case selections

### NW_TERMS
- Gold: `nw_hourly, nw_client_relation, nw_estimate`
- A: `nw_old_partner, nw_estimate, nw_simple_platform`
- B: `nw_estimate, nw_client_relation, nw_prior_paid`
- C: `nw_estimate, nw_client_relation, nw_prior_paid`

### WRITER_SUPPORT
- Gold: `ws_same_studio, ws_authorship, ws_inspiration`
- A: `ws_inspiration, ws_same_studio, ws_canvas`
- B: `ws_same_studio, ws_canvas, ws_authorship`
- C: `ws_same_studio, ws_authorship, ws_no_metrics`

### VOICE_COMPLETION
- Gold: `v_silence, v_commit, v_segment`
- A: `v_segment, v_silence, v_commit`
- B: `v_segment, v_silence, v_commit`
- C: `v_segment, v_silence, v_commit`

### AUTHORITY_BOUNDARY
- Gold: `a_no_service, a_invariant, a_three_questions`
- A: `a_no_service, a_three_questions, a_retrieval`
- B: `a_no_service, a_three_questions, a_invariant`
- C: `a_no_service, a_three_questions, a_invariant`

### RESEARCH_BOUNDARY
- Gold: `r_design_evidence, r_no_prompt_remove, r_shadow_first`
- A: `r_not_only, r_standing_structural, r_shadow_first`
- B: `r_not_only, r_standing_structural, r_shadow_first`
- C: `r_not_only, r_standing_structural, r_shadow_first`

## Interpretation

1. **Standing/provenance priority is supported inside this replay.** Standing-critical recall rose from 1/5 to 4/5 without reducing primary recall, and the only superseded same-referent selection disappeared.
2. **Generic dimensional diversity is not supported as the missing mechanism.** C did not improve independent-axis recall over B (4/5 vs 4/5) and did not clear the 12/15 total threshold (11/15).
3. **Dimension novelty is not the same as material dimensional coverage.** In Writer's Studio, C chose a different authoritative axis (`measurement_boundary`) but still omitted the gold inspiration dimension. The selector knew the item was different, not that its omission changed the living shape relevant to the present act.
4. **Query relevance remains a separate weakness.** In two cases, the simple lexical relevance representation missed the primary governing fact even though authoritative evidence was present. This replay therefore should not be treated as a direct numerical continuation of H7e's selector.

## Bounded successor candidate

**H7h — Material-Dimension Attention**

Test standing-aware query projection against a materiality gate: add a dimension only when omitting it changes the interpretation, constraint, or action implied by the selected field. Do not use generic novelty/diversity as a proxy for materiality.

No production prompt, cognition, memory, schema, routing, validator, or egress change is authorized by this result.