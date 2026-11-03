# JARVIS-WRITERS-STUDIO-DEADEND-WALK-01 — Programme Charter

**Opened:** 2026-11-03, on the founder's instruction in session ("make sure this is a Jarvis flow if needed"), recorded here as a DRAFT charter. The founder ratifies it by merging it or saying so; until then no walk step may be treated as authorized.
**Governing question:** From the writer's side, does any step in Write, Develop or Review end with no visible outcome or no lawful next action?
**Subject:** Writer's Studio Write and Develop surfaces on soullab.life, as walked from `docs/programme/WRITERS-STUDIO_DEAD-END_WALK_SPEC_2026-11-03.md` (CS-1 to CS-8).
**Current state:** DISCOVER (walk only; no repair).
**Canonical base:** `clean-main-no-secrets` after PR #2084 merges (SHA to be recorded at the first walk).
**Branch / custody:** `claude/jarvis-ws-deadend-walk-20261103` for records; evidence under `docs/programme/` only.

## Five-field preamble (manual §27)
```text
Class: A (passage acts sit behind the posture and MAIA-relationship consent gates)
Governing authority: JARVIS_INSTRUCTIONAL_MANUAL_v1 §§ census / stop conditions; Sanctuary invariants (CLAUDE.md); founder instruction 2026-11-03
Current gate: Walk CS-1 to CS-8 and record PASS / DEAD END / BLOCKED-BY-CONFIG per step
Evidence subject: the production runtime SHA recorded at walk time, one tester session, one fictional or consented manuscript
Stop boundary: no repair, no deploy, no flag change, no read of a member's real manuscript text, no step run under Sanctuary that would send text
```

## Authority
Founder / designated authority: Kelly (Founder-Steward).
JARVIS may autonomously: run the automated guards in the walk spec §1; maintain the step table; record results; file each DEAD END as a defect with the exact click; propose (not make) repairs.
Founder stops: opening the walk against production; supplying the logged-in tester session; any repair, merge or deploy; any change to a flag or gate; any decision on Standing, Focus composer, chapter rearrangement (WS2-08B to E).

## Existing law
- Sanctuary: nothing sent, saved or inferred under Sanctuary; held acts never run under it.
- Kept ("Stet") marks are session-only; the server refuses non-empty `kept` (`settled_choices_not_persisted`). Not a dead end.
- MAIA proposes; the writer decides. No step may be marked PASS on the strength of model fluency.
- Capability gaps (no way to split or merge a chapter) are FINDINGS, never PASS.
- Production flags as read 2026-11-03: editorial, focus and review-discuss ON; Standing OFF.

## Explicit non-authorizations
- No sign-in by JARVIS on its own; no use of a member's credentials.
- No repair during the walk (repair changes the subject).
- No generalizing automated results (fictional manuscript, inert providers) into claims about model answer quality.
- No production mutation, no deploy, no migration.

## Flow
1. Founder opens the walk and supplies a tester session and manuscript.
2. Record runtime SHA (`/api/health`, `printenv GIT_COMMIT`) and flag state.
3. Run automated guards; record result.
4. Walk CS-1 to CS-8 in order. Per step: action, expected visible outcome, screenshot, status of `/api/writers-studio/editorial/*` calls, verdict.
5. A DEAD END stops that case study, files a defect, and is never skipped. BLOCKED-BY-CONFIG names the flag or permission.
6. Walk record handed to the founder; repairs are a separate lane.

## Current act
Founder opens the walk (step 1). Nothing else is due.

## Exit gate
Every step is PASS or a named BLOCKED-BY-CONFIG, with no DEAD END, or every DEAD END is filed with its exact click. The ~11 Teach me entry points are each walked once.

## Outputs
`docs/programme/JARVIS-WRITERS-STUDIO-DEADEND-WALK-01_WALK_RECORD_<date>.md` with the step table, screenshots referenced by path, and the runtime SHA the evidence speaks about.
