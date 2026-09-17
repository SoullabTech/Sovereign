# MAIA-RELATIONAL-FIELD-SHADOW-01 — Charter

**Date:** 2026-09-16
**Implementation base:** `fb391f20f` (`origin/clean-main-no-secrets` at lane open)
**Research parent:** `FREE-SYNTHESIS-STRUCTURAL-STANDING-01` at `d899b3df6`
**Replication evidence:** `ALIVE-MAIA-REPLICATION-01` closed at `ef7d1b2bb`
**Mode:** shadow-only implementation
**Member-facing authority:** NONE

## Founder authorization

Founder authorization, verbatim:

> OPEN `MAIA-RELATIONAL-FIELD-SHADOW-01` as a shadow-only implementation lane. Authorize SH-F1–SH-F10, standing-resolved relational-field assembly, disposable shadow synthesis, paired current-vs-shadow evidence capture, latency instrumentation, and offline human adjudication. Shadow output must remain invisible to members and may not write memory, standing, prompts, conversation state, or alter current MAIA behavior. No member-facing deployment or promotion of shadow output is authorized.

## Falsifiers

- **SH-F1 NO MEMBER VISIBILITY** — shadow output never enters the live response payload or member-facing text.
- **SH-F2 NO MEMORY WRITE** — shadow code writes no `conversation_turns`, memory, atoms, themes, episodes, summaries, or equivalent member-memory surface.
- **SH-F3 NO STANDING WRITE** — shadow code cannot create or alter member standing, claim standing, consent, or authorization.
- **SH-F4 NO CURRENT-MAIA BEHAVIOR CHANGE** — live response generation, routing, prompt assembly, persistence and egress remain semantically unchanged.
- **SH-F5 EVIDENCE / PROVENANCE COMPLETE** — every shadow synthesis records model, architecture version, deterministic seed, source refs/digests, basis ids, status and timing.
- **SH-F6 REFUSALS PRESERVED** — admission failure is stored as refusal evidence; no regeneration or repair is authorized in Cut 1.
- **SH-F7 LATENCY ISOLATED FROM LIVE RESPONSE** — the live path launches but never awaits shadow work.
- **SH-F8 RECOMPUTABLE / DISPOSABLE** — evidence packet construction and model seed are deterministic; shadow output has no runtime authority after capture.
- **SH-F9 FROZEN ARCHITECTURE MATCH** — the admission/render files are byte-identical to the research subject.
- **SH-F10 NO AUTOMATIC WINNER / PROMOTION** — no score, rank, routing preference, learning update, model promotion, or automatic feedback loop may consume this evidence.

## Cut 1 boundary

Cut 1 uses only **member-authored current-session evidence**. The current request is substrate-bound as current member evidence. Earlier member turns may provide interpretive lineage. Assistant turns, cross-session material, semantic similarity, model interpretation and recurrence do not mint standing.

Cut 1 does **not** infer `CORRECTS`, `ADOPTS`, `SUPERSEDES`, `CONFIRMS`, `RETURNS_TO` or any other relation whose standing is not mechanically present in the source substrate. Richer standing may be added only under a later, separately falsified act.

## Evidence plane

Shadow evidence lives only in `maia_relational_field_shadow_runs`. This table is deliberately not part of Loop C engine-comparison learning and contains no winner/reviewer/attunement fields. Historical member text is not duplicated there: the manifest records source row ids / exchange refs and SHA-256 digests. Shadow output itself is retained solely for offline founder adjudication.

The paired primary response is identified by `turn_id` and a digest of the `/list` response text at the final launch seam. This stage is named `sovereign_list_pre_http_return`; it must not be described as exact member-visible egress because serving routes may apply deterministic post-generation repair after the service returns.

## Research population gate

Cut 1 is not a general member-research enrolment. Runtime execution additionally requires the current member id to appear in `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS`. The allowlist is explicit and defaults empty. It is used only as a runtime eligibility check and is not persisted in the shadow evidence table.
