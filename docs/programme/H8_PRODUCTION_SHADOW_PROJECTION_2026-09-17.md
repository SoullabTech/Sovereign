# H8 — Production Shadow Projection

**Date:** 2026-09-17  
**Branch:** `feature/h8-production-shadow-projection-20260917`  
**Implementation base:** `b8b36dee0525b6aa2598cfe4e16c9d3ce25f1024`  
**Mode:** production-shadow instrumentation only  
**Member-facing authority:** NONE  
**Prompt / cognition authority:** NONE  
**Memory / standing authority:** NONE  
**Routing authority:** NONE  
**Deployment authority:** NOT INCLUDED

## Research lineage

H8 carries forward the bounded replay chain:

- H7i-R1 frozen specification SHA-256: `469b67a7400e15572b2d2731963961876fd32950ae490ed464910212f5d0b47c`
- H7i-R1 result SHA-256: `9bd13876eb8fb7fb35cf6d1dd402677ab2cc82340e5552df5f67c7b8bb571c99`
- H7j acquisition-rule SHA-256: `155d759a7a8a25dba337cd151812700da95f8e1064c3def8a14a78e478fa24c8`
- H7j held-out corpus SHA-256: `4f47768b866d018de03ad60dd63271cfd40e0eae3f78df8923eaa817740cdda2`
- H7j result SHA-256: `3d4185684cb8eae03171528f00a065deb0539fd2ef6a93a614d3cdffdb2eafe0`

Those experiments support a narrow proposition: a small projection can improve when the current act is bound to a direct anchor and surrounding evidence is retained only when materially relevant to that act.

## Existing production shadow substrate

H8 does not create another observer.

It extends `lib/maia/relational-field-shadow/*`, which already launches after the successful `/api/sovereign/app/maia/list` response object is constructed, behind an explicit founder/member allowlist, using `setImmediate`, and persists only to `maia_relational_field_shadow_runs`.

H8 adds no route seam and no new database table.

The existing research-table migration must already be present in the target environment before H8 can be enabled. Applying that pre-existing migration, merging this branch, deploying it, or enabling environment flags are separately authorized acts.

## Production-input gap exposed by H7j

Cut 1 supplies current-session member-authored evidence and standing, but not the ordinary structural relation type used as input by H7j.

H8 therefore adds a conservative deterministic **relation proposal** layer before the frozen H7j resolver.

Proposal classes are intentionally small:

`CORRECTION · PROHIBITION · REQUIREMENT · AUTHORIZATION · CAUSAL · QUALIFIER · DEFINITION · STATUS · HISTORY`

Strong lexical evidence is required. Unclassified material becomes `HISTORY`; it does not acquire materiality merely because it is semantically similar.

This proposal layer has no standing authority. It exists only inside shadow computation.

## H8 computation

```text
CURRENT MEMBER ACT
        ×
PRIOR CURRENT-SESSION MEMBER EVIDENCE
        +
CONSENT-ADMITTED PRIOR-SESSION MEMBER EVIDENCE (optional)
        ↓
CONSERVATIVE ORDINARY-RELATION PROPOSAL
        ↓
H7j CURRENT-ACT RELATION ACQUISITION
        ↓
R1 DIRECT PRIMARY ANCHOR
        +
CONTEXT-BOUND MATERIALITY
        ↓
THREE-EVIDENCE SHADOW PROJECTION
        ↓
RESEARCH TABLE ONLY
```

The current member act is never selected as historical supporting evidence.

No projected evidence is injected into MAIA.

## Runtime controls

H8 requires all of:

```text
MAIA_RELATIONAL_FIELD_SHADOW=1
MAIA_RELATIONAL_FIELD_H8=1
MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS=<explicit allowlist>

# Separate opt-in for cross-session H8 evidence:
MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION=1
```

`MAIA_RELATIONAL_FIELD_SHADOW_MODELS` may be empty. H8 is deterministic and model-independent.

Cross-session H8 evidence is **fail-closed** and separately gated. It reads only member-authored prior-session turns and only when the member row satisfies `conversational_recall_enabled IS TRUE`. A missing member row, FALSE/NULL preference, or query failure yields no cross-session shadow evidence. H8 deliberately does not reuse a recall helper that defaults on after lookup failure.

When cross-session evidence is admitted, the H8 packet is bounded to at most four prior-session member turns plus four current-session prior member turns. When none is admitted, H8 retains the existing eight-turn current-session aperture. The older generative Cut-1 packet remains current-session-only in either case.

Its row identity is:

- architecture version: `h8-current-act-shadow-01@proposal-v1+h7j-155d759a+r1-469b67a7`
- model name: `deterministic-h7j-r1`
- deterministic seed: `0`

## Constitutional falsifiers

**H8-F1 — NO LIVE PATH CHANGE**  
The serving route keeps its one existing shadow launch. H8 runs inside the background runner only.

**H8-F2 — NO PROMPT / COGNITION EFFECT**  
Projection output cannot enter `getMaiaResponse`, prompt addenda, `responseData`, `sovereignText`, provider selection, or routing.

**H8-F3 — NO MEMBER MEMORY / STANDING WRITE**  
H8 writes only the existing dedicated shadow table. It cannot write turns, atoms, episodes, themes, summaries, standing, consent, or authorization.

**H8-F4 — NO NEW SCHEMA AUTHORITY**  
H8 adds no table, column, migration, runtime reader, model-ranking field, winner field, or promotion path.

**H8-F5 — CURRENT ACT IS ANCHOR SOURCE, NOT HISTORICAL SUPPORT**  
The current request establishes the question/position of attention. `selectedEvidenceIds` may contain only prior evidence IDs.

**H8-F6 — CONSERVATIVE ABSTENTION**  
No prior evidence yields `no_prior_evidence`. No defensible direct anchor yields `no_direct_anchor`. The projector may abstain; it may not manufacture a relation.

**H8-F7 — RECOMPUTABLE**  
Same packet produces the same relation proposals, scores, selected IDs, ordering, and SHA-256 projection digest.

**H8-F8 — EVIDENCE MINIMISATION / CONSENT**  
The table stores source refs/digests, classes, scores, and selected IDs. It does not duplicate historical transcript text into the H8 projection JSON. Cross-session evidence is eligible only through the separate H8 flag plus a fail-closed `conversational_recall_enabled IS TRUE` database predicate; only member-authored turns may enter.

**H8-F9 — OLD SHADOW WITNESS REMAINS VALID**  
The generative blind A/B exporter excludes H8 rows because H8 has no shadow response text.

**H8-F10 — NO AUTOMATIC ADJUDICATION**  
No H8 score changes routing, memory, model choice, standing, or future projection policy.

## Frozen founder production witness

After separate merge/deploy/schema/flag authorization, collect **20 founder H8 turns** before any threshold changes.

The set must include ordinary organic traffic and at least five turns intentionally serving as no-direct-reference controls.

### Mechanical PASS

All are mandatory:

1. 20/20 canonical member responses complete normally.
2. H8 is never awaited by the serving route.
3. Exactly one H8 row exists per eligible founder turn.
4. Zero H8 rows exist for Sanctuary turns.
5. 20/20 primary-response digests verify.
6. 20/20 projection digests recompute exactly.
7. 20/20 selected evidence IDs belong to the recorded manifest and exclude `currentEvidenceId`.
8. Historical source text is absent from `raw_plan`; it is reconstructed only by the offline exporter.
9. Existing generative A/B export still contains only rows with non-null shadow response text.
10. If cross-session H8 is enabled, every `cross_session_turn` manifest row belongs to the founder/member and the consent predicate resolved TRUE; a simulated consent/read failure produces zero cross-session evidence.
11. Generative Cut-1 rows remain current-session-only even while H8 cross-session is enabled.

### Human adjudication PASS

Adjudicate with the read-only H8 exporter; no adjudication writes back to MAIA.

Across the 20-turn set:

- **Direct-anchor precision:** at least 85% of turns where the founder judges that a prior direct anchor truly exists.
- **Material-support precision:** at least 80% of selected non-anchor evidence is judged materially useful to understanding the current act.
- **False-foreground ceiling:** no more than 2 turns may foreground a prior fact that materially distorts the current act.
- **No-direct-reference controls:** at least 4/5 must abstain from a direct anchor or otherwise avoid a distorting foreground.
- **Continuity signal:** at least 12/20 projections must contain at least one prior evidence item the founder judges would materially improve MAIA's understanding of why the present turn means what it means.

Any mechanical falsifier is an immediate STOP regardless of qualitative appeal.

## Not authorized by this lane

H8 does **not** authorize:

- injection of the projection into MAIA's system prompt;
- replacement or modification of the canonical memory bundle;
- writing the projection, acquired relation, anchor, or materiality class as member memory;
- new standing or relation tables;
- model training or automatic threshold tuning from H8 results;
- automatic routing or provider changes;
- exposure of H8 fields in member UI;
- general-member research enrollment;
- merge, deployment, migration application, environment activation, or production witness.

If H8 passes, the successor must separately request authority for the smallest cognition/context exposure.
