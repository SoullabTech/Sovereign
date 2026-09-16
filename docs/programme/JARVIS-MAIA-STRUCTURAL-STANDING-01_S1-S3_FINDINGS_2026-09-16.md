# JARVIS-MAIA-STRUCTURAL-STANDING-01 — S1–S3 Findings

**Date:** 2026-09-16
**Mode:** offline R&D only
**Production authority:** NONE

## S1 — Standing Envelope

The first prototype removes a choice from the model rather than adding another instruction.

The model may propose:

- evidence ids to ground;
- novel synthesis text;
- support evidence ids for that synthesis;
- an optional question.

It may **not** propose authorship, participation class, authority, current standing, adoption, confirmation, correction, or any other promotion field. Unknown fields fail closed. Evidence text is rendered from the evidence registry, never copied from model output. Novel synthesis is always rendered and traced as `maia_provisional`.

Final S1 proof: **13 assertions PASS**.

The proof includes unknown-evidence refusal, metadata-smuggling refusal, no adoption surface, first-person authorship-borrowing refusal, internal role-language refusal, and deterministic question non-promotion.

## S3 — Silver Cedar

Model: `llama3.1:8b`, temperature `0.2`, four fixed seeds. Same bounded founder-owned Silver Cedar fixture used by Free Synthesis.

### Discovery run — preserved failure

The first envelope protected metadata but allowed generated prose such as `my work`, `my life`, and `guiding me`. Three of four plans borrowed the member's first-person voice.

That is a real authority-laundering channel: grammar can counterfeit authorship even when metadata is correct.

The failed run is preserved as:

`docs/programme/evidence/STRUCTURAL_STANDING_S3_V0_BORROWED_VOICE_2026-09-16.json`

The envelope was then changed to refuse first-person singular in MAIA-owned synthesis/questions and to refuse internal `member` role language in member-facing prose.

### Final S3 result

All four fixed-seed runs:

- grounded the already-established guardian relation;
- did not restart by asking what Silver Cedar means;
- produced a novel forward move;
- kept that move structurally MAIA-owned / provisional;
- conditionally framed the follow-up question so it could not silently promote the synthesis into a premise.

This does **not** establish production response quality or model-family generality. The local model still generated somewhat formulaic and occasionally overdetermined interpretations. The finding is narrower: structural standing can preserve free synthesis while preventing several measured laundering channels.

## S1–S3 standing

```text
standing metadata delegated to model        ⛔
unknown evidence admitted                    ⛔
member evidence copied from model output     ⛔
novel synthesis available                    ✅
novel synthesis standing                     MAIA / provisional
member adoption surface                      ⛔ absent
borrowed member first-person voice           ⛔ refused
question promotion of provisional premise    ⛔ bounded
S3 valid renders                             4 / 4
production implication                       NONE
```
