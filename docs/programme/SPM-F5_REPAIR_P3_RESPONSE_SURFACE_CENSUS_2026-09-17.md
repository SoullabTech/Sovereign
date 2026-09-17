# SPM-F5 Repair P3 — Response-Producing Surface Census — 2026-09-17

**Standing:** P3 PREREQUISITE · READ-ONLY · CURRENT SOURCE CENSUS

## Scope

This census closes the P1 requirement to identify response-producing surfaces that admit member-related stored material before selecting RC-5 architecture.

It distinguishes cognition from TTS, live authority from dormant code, and turn modes that compose stored member context from modes that do not.

## Live family A — Sovereign MAIA

`POST /api/sovereign/app/maia/list`

- canonical live route per current source and route-authority map;
- builds developmental/memory/atom/recall addenda;
- constructs `CanonicalTurn` in shadow only;
- shadow failure is explicitly non-fatal;
- response-producing crossing remains `getMaiaResponse(...)`;
- `includeAudio` changes modality and triggers TTS after cognition; it does not create a second cognition path.

RC-5 standing: **live violating seam**.
## Live family B — Between

`POST /api/between/chat`

- live-secondary route;
- composes memory influence and other contextual addenda;
- response-producing crossing is `generateMaiaTurn(...)`;
- SAFE_MODE has a separate simplified response branch that does not take the normal stored-memory composition;
- normal mode therefore remains a distinct live stored-context cognition path.

RC-5 standing: **live violating seam** for the normal memory-bearing branch.

## Live family C — Now What turn

`POST /api/now-what/interview`, `mode='turn'`

- composes member presence through `lib/maia/roomComposition.ts`;
- presence includes developmental memory, atoms, and conversational recall;
- response-producing crossing is direct `getLLMProvider().generateSimple(...)`;
- does not pass through canonical-turn adjudication.

RC-5 standing: **live violating seam**.

`mode='propose'` receives the constitutional floor but does not compose the stored-presence block; it is not the same RC-5 specimen.
## Live family D — Vision Studio turn

`POST /api/maia/vision-studio/interview`, `mode='turn'`

- same shared room-composition family as Now What;
- composes developmental memory, atoms, recall, and optional field context;
- response-producing crossing is direct `getLLMProvider().generateSimple(...)`.

RC-5 standing: **live violating seam**.

Its `mode='propose'` path does not compose the stored-presence block and is separately scoped.

## Voice

`/api/sovereign/app/maia/voice` is TTS-only.

Spoken sovereign conversation uses the same `/maia/list` cognition request with `includeAudio=true`, then synthesis occurs downstream.

RC-5 consequence: voice parity is governed at the sovereign turn boundary; there is no separate memory-admission path to canonicalize in the TTS endpoint.
## Dormant / reactivation hazards

Current source marks at least:

- `/api/sovereign/app/maia` — dormant, superseded by `/list`;
- `/api/oracle/conversation` — dormant in the route-authority map, though it retains rich memory wiring;
- other prototype-era MAIA routes may remain response-capable but are not current sovereign chat authority.

These are not counted as live RC-5 crossings.

However, a repair that leaves them capable of being reactivated outside the governed participation boundary creates a future bypass. P3 therefore must include a reactivation rule: a dormant response route cannot become live without satisfying the same governed cognition-handoff contract.

## Selected census denominator for RC-5 design

```text
LIVE STORED-CONTEXT COGNITION FAMILIES

A  /api/sovereign/app/maia/list       → getMaiaResponse
B  /api/between/chat                   → generateMaiaTurn
C  /api/now-what/interview turn        → provider.generateSimple
D  /api/maia/vision-studio/interview   → provider.generateSimple

VOICE TTS                              → not a cognition path
DORMANT LEGACY/REFERENCE               → reactivation hazard, not live denominator
```

This census does not assert that these four routes exhaust every LLM use in the repository. It establishes the current response-producing **member-memory participation** surface relevant to RC-5 from current route authority plus source wiring.
