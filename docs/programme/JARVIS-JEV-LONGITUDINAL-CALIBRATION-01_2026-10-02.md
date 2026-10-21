# JARVIS-JEV-LONGITUDINAL-CALIBRATION-01

**Status:** implementation candidate · presentation-only · no provider activation · no trust-envelope self-widening.

## Purpose

JEV must earn trust over time. JARVIS Desktop therefore exposes a longitudinal calibration surface rather than asking the founder to assume that a confident judgment is valid.

The loop is:

**observe → compare → calibrate → govern → integrate**

Evidence may recommend a narrower or wider operating envelope. JEV itself may never silently widen that envelope.

## Desktop surfaces

**System → JEV calibration** shows the current standing, trust law, task-shape envelope, under-deliberation measurements, abstention, and calibration history.

**Monitor → Judgment quality** shows the operational state. Drift, restriction, or uninterpretable evidence surfaces as attention; absent evidence reads **UNASSESSED**, never healthy.

The projection is read-only. It grants no execution, spend, provider, merge, deploy, or production authority.

## Evidence contract

The presentation layer reads an optional local evidence directory:

`$JARVIS_JEV_CALIBRATION_DIR`, default `~/.jarvis/jev-calibration/`.

Recognized evidence:
- `admitted-envelope.json` — externally governed task-shape admissions.
- `measurements.json` — longitudinal measurements by task shape.
- `events.jsonl` — append-only calibration history.

No writer is authorized by this act. A later governed act must define how a comparison becomes admitted evidence before automatic capture is wired.

## Standing law

1. Cognitive reduction requires an admitted task-shape envelope.
2. Uncertainty expands cognition rather than suppressing it.
3. Drift or restriction overrides prior admission in the presentation.
4. A pooled result may not erase a weak or unassessed task shape.
5. Provider confidence is never itself evidence of correctness.
6. JEV cannot promote its own operating envelope.

Verification: `npm run verify:jev-longitudinal-calibration` plus the existing Founder Workspace constitutional matrix.
