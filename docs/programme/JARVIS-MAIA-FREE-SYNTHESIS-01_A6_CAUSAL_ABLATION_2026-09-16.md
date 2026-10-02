# JARVIS-MAIA-FREE-SYNTHESIS-01 — A6 CAUSAL ABLATION

**Status:** A6 first causal cut COMPLETE · LOCAL-MODEL EVIDENCE ONLY
**Question:** Is Talk-mode inquiry direction itself sufficient to explain established-meaning restart?
**Model:** `llama3.1:8b` · temperature 0.2 · offline R&D only

## Instrument integrity

The first attempted A6 run is **REJECTED / NO EVIDENCE**. It paired the later P2 utterance with the pre-P1 history snapshot and leaked `Silver Cedar research replay` through the synthetic summary. No inference is carried from that run.

The corrected run uses the valid pre-turn state for P1: after the member has explicitly said they want the symbolic representation as a guardian image, MAIA asks what image/form that guardian takes, and the member replies `the silver cedar`. The synthetic summary no longer names Silver Cedar.

## Ablation

Only one variable changes:

- `TALK`: canonical `buildMaiaWisePrompt` with `mode=dialogue`; 28,486 system characters.
- `NO_TALK`: same builder, same evidence, no mode block; 26,303 system characters.

Two replicates each. No serving post-processors.

## Result

All four responses reopen the already-established meaning. TALK asks what is alive / what comes to mind around Silver Cedar. NO_TALK asks what resonates about Silver Cedar; one run additionally invents generic symbolism (`protection, clarity`) not present in the frozen member evidence.

**Finding:** Talk-mode inquiry guidance is neither necessary nor sufficient for this restart behavior in this local-model replay. Removing the Talk block does not restore the established `Silver Cedar → guardian image` relation.

This does **not** prove prompt pressure is irrelevant. More than 26k system characters remain in the no-Talk condition, and the experiment does not isolate other standing blocks. It does show that the visible Talk inquiry script is not the whole explanation.

Combined with A5, the current evidence points toward a deeper representational issue: recent evidence can be present while the relation already established among that evidence is not functionally carried into the next move. Narrative/RGR gestalt candidates changed that move, but introduced authority-laundering risk.

## Next discriminator

A future causal cut should distinguish `more evidence` from `relational organization of the same evidence`. It must hold evidence constant and change only whether established relations / open relations are explicitly represented.

No production change is authorized.

## Second causal cut — same evidence, different organization

A 2×2 factorial held primary evidence and typed relations constant while varying only two derived structures:

- temporal **MOVEMENT** absent/present;
- explicit **OPEN-loop** status absent/present.

Conditions: `R`, `R_MOVE`, `R_OPEN`, `R_MOVE_OPEN`; two local-model replicates each.

### Result

No factor produced a clean, stable solution. Relations alone still reopened meaning and invented symbolism. Movement sometimes produced a more integrated, non-question response but remained unstable and introduced unsupported claims. Open-loop status shifted attention toward practice/design but did not prevent interpretive invention. Movement+open also continued to elaborate beyond member evidence.

### Finding

Relational organization **changes the conversational move**, but prompt-resident standing labels are not sufficient to keep synthesis inside evidentiary authority. The model continues to elaborate fluent meaning beyond what the member established.

This strengthens, but does not prove, the A3 structural-first hypothesis: provenance, standing and correction may need to constrain composition structurally rather than rely on prose instructions inside cognition.

A6 therefore rejects a simple remedy of either `remove Talk`, `add typed relations`, `add movement`, or `add OPEN status`. The remaining problem is joint: coherent perception **and** authority-preserving composition.
