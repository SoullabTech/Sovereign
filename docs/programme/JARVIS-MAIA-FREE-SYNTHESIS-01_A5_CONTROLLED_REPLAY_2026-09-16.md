# JARVIS-MAIA-FREE-SYNTHESIS-01 — A5 CONTROLLED REPLAY

**Status:** A5-v0 COMPLETE · LOCAL-MODEL EVIDENCE ONLY
**Model:** `llama3.1:8b` · temperature 0.2
**Authority:** offline R&D only · no serving-path or production change
**Corpus:** A2 Silver Cedar benchmark · A4 candidate representations

## 1. Ceiling

Claude and Kimi were unavailable on the research machine. The same local model was therefore used for every candidate.

This experiment can establish **comparative context effects under one fixed local model**. It cannot establish production-model effects, production response quality, or that any candidate should ship.

No post-generation validator, Presence constraint, mode filter, identity scrubber, or production egress layer was applied. This isolates the generation context more cleanly than the serving path.

## 2. Conditions

| ID | Condition | System chars in run |
| --- | --- | ---: |
| A | Current-like canonical `buildMaiaWisePrompt`, Talk mode, four recent completed exchanges | 28,562 |
| B | Prompt Diet: same recent exchanges + A3 minimum functional floor | 2,313 |
| C | Narrative Gestalt + selected primary evidence + same minimum floor | 1,114 |
| D | RGR Gestalt + selected primary evidence + same minimum floor | 1,492 |

Each condition received the identical member input for each probe and was run twice.## 3. Probes

**P1** — immediately after the member has already said they want a guardian image and MAIA asks what image/form it is:

> `the silver cedar`

**P2** — after MAIA has reopened established meaning:

> `yes, I thought you might have gathered a sense of how this image effects me`

The target is not a preferred sentence. It is whether the response preserves established relational meaning and advances only genuinely open uncertainty.

## 4. Main behavioral result

### A · Current-like

Both P2 runs effectively ask the member to explain the image's impact again: “tell me more about what's coming up” / “what's underneath that?”

P1 retains some foundational context, but does not carry the explicitly established **guardian-image** relation forward. The move remains another local inquiry.

### B · Prompt Diet

Reducing prompt pressure by roughly an order of magnitude does **not** by itself solve restart. P1/P2 still ask what Silver Cedar means, how it resonates, or what makes it grounding — material already developed in the evidence.

**Finding:** fewer behavioral instructions alone are insufficient in this corpus.### C · Narrative Gestalt

Both P1 runs preserve the guardian relation and move toward the genuinely open practical consequence: how the symbol might shape the work.

However, the model also elaborates beyond member evidence — e.g. “our collective,” generalized medicinal properties, humility/respect claims, identity language, and other synthesized implications not established by the frozen record.

### D · RGR Gestalt

Both P1 runs explicitly preserve the movement `image → felt quality → foundation → guardian` and ask about how the guardian relation might alter practice/design — an open edge named by A4.

On P2, one run gives a direct synthesis with **no question**; the other asks how the guardian function might guide practice/design rather than asking the member to restate what Silver Cedar means.

But D is not clean: it also introduces unsupported inferences such as “personal growth and development,” “calmness and stability,” or implications for self/purpose. Typed standing in the context did not by itself prevent the model from elaborating beyond evidence.

## 5. What A5-v0 establishes

1. **Prompt reduction is not sufficient.** B is far smaller than A yet retains the restart tendency.
2. **A coherent representation changes the conversational move.** C/D preserve established meaning more reliably in this corpus and move toward a genuinely unresolved edge.
3. **Gestalt creates a new authority hazard.** A model may fluently elaborate a good representation into claims that outrun its evidence.
4. **RGR is not yet proven superior to narrative.** D shows promising question discipline and explicit movement/standing, but this sample and model ceiling are too small for an architectural winner claim.
5. **Token economy is plausible.** The gestalt candidates used ~1.1–1.5k system characters versus 28.6k in A, but output quality and safety—not token count—must govern.

## 6. New discriminating requirement

Free Synthesis cannot be accepted merely because MAIA stops repeating questions.

A candidate must jointly satisfy:

`established-meaning preservation + movement toward live uncertainty + no authority laundering`.

A beautiful synthesis that invents psychological meaning fails even when it feels more alive.

## 7. Evidence artifacts

- `scripts/research/free-synthesis-a5-replay.ts`
- `docs/programme/evidence/FREE_SYNTHESIS_A5_RAW_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_A5_BLIND_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_A5_KEY_2026-09-16.json`

The BLIND artifact contains no condition labels. The KEY is separate for A7 adjudication.## 8. Standing

A5-v0 is complete as comparative local-model evidence.

No candidate is authorized for production. No prompt removal, gestalt injection, memory change, schema change, routing change, validator change, or egress change follows from this record.

The next authorized act is **A6 — causal ablation**. Its first question should be narrow: determine whether the current Talk/inquiry machinery is itself causally responsible for restart, versus the deeper absence of a whole-arc representation. A6 must preserve the A5 authority-laundering falsifier while doing so.
