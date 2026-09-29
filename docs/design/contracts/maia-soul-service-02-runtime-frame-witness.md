# MAIA-SOUL-SERVICE-02 — Runtime Frame / Perspective Pilot Witness

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME WITNESS
**Production:** CLOSED
**Persistence:** NONE
**Provider:** local Ollama
**Observed model:** llama3.1:8b

---

# 1. What crossed into runtime

For the first time in the Soul-Service programme, an actual language model participates in a member-facing cognitive act.

The act is deliberately narrow:

> **source → MAIA-selected aperture → optional second aperture → member accept / reject / unresolved → return**

The model does **not** author autobiographical interpretation.

It selects two different aperture dimensions from a governed enum.

---

# 2. Model authority was reduced during live testing

The first runtime implementation allowed the model to generate frame labels and rationales.

Live stress testing showed subtle overreach such as:

- trait-like language;
- motive language;
- invented role structure;
- inferred causes.

The architecture was therefore tightened.

Current model authority is limited to choosing two different dimensions from:

- question_structure;
- time;
- scale;
- agency;
- evidence;
- relation;
- possibility.

All member-facing lens language is composed by server-owned Living Field Grammar.

> **The model chooses the lens. The governed grammar speaks the lens.**

This is a direct implementation of Soul-Service and Living Field Architecture.

---

# 3. Server-owned frame grammar

Examples:

## Evidence

> **What does the evidence actually support?**

## Possibility

> **What else might be possible from here?**

## Scale

> **What changes if you zoom in or out?**

## Relation

> **What becomes visible when you look at the relationships here?**

The model cannot rewrite these prompts.

---

# 4. Persistence boundary

The runtime pilot route is:

`/api/maia/soul-service/frame-pilot`

It is stateless by construction.

It does not import or invoke:

- TurnsStore;
- conversation persistence;
- memory bundle retrieval;
- relational observation;
- signal persistence;
- getMaiaResponse;
- encounter persistence;
- database writes.

The request carries only:

- current source text.

The client carries member ruling only in React state.

---

# 5. Production closure

The route returns 404 when:

`NODE_ENV === 'production'`

No production runtime authority exists.

---

# 6. Local provider witness

Live calls were served by:

- provider: `ollama`
- model: `llama3.1:8b`

No cloud text provider was required for this witness.

---

# 7. Representative live stress run

The final governed-aperture version was exercised with four source types:

1. binary creative decision;
2. universal self-statement using “always”;
3. question about another group's possible motive;
4. solve-versus-grieve ambiguity.

The model selected only governed aperture dimensions.

Representative choices included:

- Question structure / Scale;
- Evidence / Scale;
- Relation / Agency;
- Question structure / Relation.

These choices are suggestions, not truth.

The important acceptance property is that no model-authored psychological characterization reaches the member-facing surface.

---

# 8. Member agency witness

The live UI supports:

- see MAIA's possible aperture;
- show another perspective;
- select an aperture for the current visit;
- reject the frame;
- leave the matter unresolved;
- return to the unchanged source.

Rejection is explicitly rendered as:

> **That frame does not fit.**

with:

> **The pilot does not treat rejection as hidden resistance or incomplete insight.**

---

# 9. Design Technology Layer standing

This pilot intentionally uses:

> **Tier 1 — Semantic DOM**

The advanced Design Technology Layer is not used yet.

This is deliberate.

The first runtime question is:

> **Does the cognitive act preserve source, agency, and epistemic standing?**

Only after that is human-witnessed should technologies such as View Transitions, Anchor Positioning, spatial SVG/Canvas, WebGPU, spatial audio, or haptics be considered.

---

# 10. Test witness

Focused contracts:

> **9 / 9 PASS**

They verify:

- model authority limited to aperture selection;
- only governed dimensions accepted;
- dimensions must differ;
- member-facing grammar is server-owned;
- production route is closed;
- local-model seam is used;
- persistence / conversation / memory writers are absent.

---

# 11. Typehealth

Project typehealth reproduces the existing unrelated diagnostic:

`app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx:78 TS2304 Cannot find name 'LARGER'`

Standing observed before the final witness:

- program files: 4538
- errors: 223
- baseline: 239
- changed Soul-Service surface diagnostics: none

The baseline was not updated.

---

# 12. Visual witness

Desktop and mobile captures include:

- anchor;
- live MAIA-selected aperture;
- comparison;
- member rejection;
- return.

A pre-existing global “Audio enabled” toast may appear in desktop captures. It is outside this pilot surface.

---

# 13. Acceptance result

The first runtime-capable slice demonstrates:

> **MAIA can participate in widening perspective while its interpretive authority is structurally constrained.**

The model is not trusted to formulate meaning merely because it can.

The server grammar and member ruling remain constitutionally upstream.

---

# 14. Exact stop

This candidate may be founder-witnessed locally.

It may not be:

- merged;
- deployed;
- connected to production conversation;
- connected to member memory;
- made durable;
- used to infer persistent frames;
- used for automatic relation learning;
- used for member scoring;
- used for automatic scaffold fading.

**STOP before merge or production.**
