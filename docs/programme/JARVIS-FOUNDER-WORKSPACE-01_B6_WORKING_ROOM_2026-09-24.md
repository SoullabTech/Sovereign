# JARVIS-FOUNDER-WORKSPACE-01 · B6
## Work becomes the actual working room

**Date:** 2026-09-24
**Predecessor:** B5R1 `401660160ee18d213ede1d3fd8f03e510706c9f9`
**Act:** **B6 — WORK BECOMES THE ACTUAL WORKING ROOM**
**Standing:** **BOUNDED IMPLEMENTATION CANDIDATE**

B6 changes one thing fundamentally:

> Work stops describing what JARVIS may someday do and becomes the place Kelly can actually think and work with JARVIS.

The first B6 slice is deliberately narrow:

```text
typed natural language
    ↓
O1 governed intent
    ↓
O2 bounded work plan
    ↓
explicit Kelly Run locally
    ↓
existing C1 local JARVIS reasoning
    ↓
result remains in the Work room
```

## 1 · What is already canonical

B6 does not invent a new intent or planning system.

Canonical already contains:

- **O1 Intent Contract** — natural language → governed intent;
- **O2 Work Graph** — CLEAR O1 intent → bounded planned Work Units;
- the existing Desktop **C1 local reasoning** seam through `jarvis:submit-task`;
- a local Qwen worker through Ollama;
- the Founder Workspace's persistent current-field context.

B6 composes those existing parts into one Founder-facing room.

## 2 · Intent is not authority

Typing:

> “Build this.”

does not silently authorize a change.

O1 still records desired outcome only.

If Kelly's wording is ambiguous, Work asks for clarification instead of guessing a stronger intention.

If the intent is CLEAR, O2 may show the bounded plan.

Only an explicit **Run locally** gesture invokes the already-authorized C1 local reasoning lane.

No provider, repository mutation, PR, merge, deployment or production authority is created by the typed sentence.

## 3 · Current-field context

The current field follows Kelly into Work.

B6 may tell local JARVIS:

- which field Kelly entered;
- whether it came from Today, Monitor, Graph or Work;
- the human-readable current state already visible in the Founder Workspace.

That context is orientation, not hidden authority.

B6 V1 does **not** silently attach arbitrary repository files, external conversations, member data, or filesystem content to the local model.

Programme evidence remains available through the existing evidence viewer until a separately governed precision-context act explicitly admits exact source fragments into the working-room prompt.

## 4 · MAIA, ChatGPT and Claude Code partnership

B6 establishes the **partnership contract**, not a fake live bridge.

MAIA, ChatGPT and Claude Code may later provide bounded context handoffs such as:

```text
source        ChatGPT
field         Writer's Studio
summary       "Kelly is deciding how MAIA should guide developmental editing."
receipt       exact handoff provenance
```

A partner may help JARVIS understand **what Kelly means**.

A partner may not grant repository, execution, member, practitioner, deployment or production authority.

No partner is displayed as live-connected until a real governed handoff exists.

## 5 · V1 working-room behavior

When no field is selected, Work is still usable. Kelly may start with a typed request.

When a field is selected, the room shows that field above the conversation so “this”, “it” and “that work” remain visibly anchored.

The working sequence is:

```text
Kelly types
    ↓
JARVIS preserves her exact words
    ↓
O1 classifies the requested outcome
    ↓
if ambiguous → ask Kelly to clarify
if clear     → show O2 bounded plan
    ↓
Kelly explicitly chooses Run locally
    ↓
existing C1 local worker reasons
    ↓
answer + execution-verification status shown in the room
```

The local result is a reasoning result. It is not evidence that repository facts are correct unless the canonical verifier actually establishes that.

## 6 · Explicit holds

B6 V1 does not yet authorize:

```text
repository write                    NO
Work Unit creation                  NO
provider execution beyond C1        NO
frontier/Nemotron execution         NO
MAIA live context handoff           NO
ChatGPT live context handoff        NO
Claude Code live context handoff    NO
voice input                         NO
B7 graph relationship join          NO
PR / merge / deploy                 NO
production                          NO
```

## 7 · Installed Founder-walk repair — C1 root binding

The first installed B6 walk established that O1 intent and O2 planning rendered correctly, then the explicit **Work with local JARVIS** gesture failed with:

```text
REPO_ROOT is not defined
```

This was a real runtime defect, not a Founder-use error.

The Desktop repository resolver had already migrated to the mutable `currentRoot()` authority, but the C1 branch of `jarvis:submit-task` still contained stale references to an old `REPO_ROOT` symbol when locating the canonical context/verifier modules.

The bounded repair is:

```text
submit-task entry
    ↓
snapshot validated currentRoot() as local root
    ↓
router / deterministic paths use that root
    ↓
C1 jarvis-context / verifier paths use that root
    ↓
context materialization uses that root
```

C0 retains its existing proved `runCapability(..., currentRoot())` call.

B6-L15 now kills any reintroduction of `REPO_ROOT` inside the submit-task handler.

No new authority, IPC channel, model, provider, repository mutation, deployment path, or production access is introduced by this repair.
