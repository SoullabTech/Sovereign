# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R6 Local Grokker Synthesis Adapter · 2026-10-01

## Purpose

Bind Grokker synthesis to the already-governed JARVIS C1 local reasoning lane without creating a second model-execution mechanism.

## Implementation

The Library now retains exact excerpt line ranges for programme records.

`field-library-local-synthesis.js` translates a valid `GROKKER_SOURCE_PACKET_V1` into an existing C1 task:
- `bounded_for_local: true`;
- prompt below the router's 4,000-character bound;
- maximum 8 programme sources;
- exact `lines` selectors over canonical programme records;
- explicit source-only reasoning;
- required `path:LINE` citations;
- explicit candidate-only language;
- contradiction and unresolvedness preserved.

Curated conceptual fields remain useful for Trace/orientation but are not silently converted into repository evidence for the local model.

## Result envelope

The returned C1 answer is wrapped as:
- authorship: `GROKKER_AUTHORED`;
- standing: `CANDIDATE_UNESTABLISHED`;
- explicit cited source paths;
- local execution verification kept separate;
- citation correctness kept separate;
- relation warrant remains absent.

An uncited answer fails the synthesis contract even if the local model executed successfully.

## Privilege boundary

R6 adds no IPC channel, filesystem executor, network client, or model invocation path.

The UI calls the existing `window.jarvis.submitTask(...)` bridge.
`jarvis-desktop/src/main.js` and `preload.js` are unchanged by this lane.
C1 continues to own Ollama invocation, context materialization, and canonical evidence verification.

## Witness

Focused Grokker stack: **16/16 PASS**.

The suite proves:
- exact line selectors are derived from packet custody;
- fewer than two materializable programme sources are refused;
- citation descent is parseable;
- verified local output remains candidate/unestablished;
- uncited output is not admitted as synthesis;
- the adapter performs no network, process, or filesystem execution itself;
- prior Trace and R5 standing falsifiers remain green.

Syntax checks and `git diff --check`: PASS.
No changes to JARVIS Desktop privileged host or preload bridge.

## Standing

**Implementation complete. Live local-model/runtime witness pending.**

No merge or deploy is authorized.
