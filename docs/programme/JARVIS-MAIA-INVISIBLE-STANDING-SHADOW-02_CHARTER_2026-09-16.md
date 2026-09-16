# JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02 — Charter

Date: 2026-09-16
Parent: `JARVIS-MAIA-INVISIBLE-STANDING-01` / PR #1321 / `bc2ada74888f10075074cd2ebb7714752c91e481`

## Governing question

> Can the deterministic hard plane observe the exact final Writer's Studio member-facing response in the live production path without changing response bytes, handoff truth, provider routing, persistence, or latency class?

## Authority

This is a **shadow-only implementation lane**. It may add feature-gated production instrumentation and tests. It may not merge, deploy, alter member-visible text, add a model call, or give the shadow result response authority.

## First-cut scope

- Writer's Studio canonical turns only.
- Gate: `MAIA_INVISIBLE_STANDING_SHADOW=1`; OFF otherwise.
- Audit target: the final `text` after AIN rewrite, SELFLET stripping, and identity-disclaimer scrub, immediately before `getMaiaResponse()` returns.
- Synchronous/pure audit only: no provider, network, database, persistence, or retrieval I/O.
- Existing deterministic identity/memory constitutional classes may be re-observed as parity witnesses.
- New Standing-specific observation: explicit direct member-quote attribution custody.
- `CanonicalTurn` is NOT a complete lifetime evidence population; unverified or non-member quote matches are observation-only.

## Falsifiers

1. Member-visible response bytes change because of the shadow.
2. Shadow result is assigned into `text`, returned response, audio, prompt, or provider routing.
3. Shadow exception can escape and fail the response.
4. Audit runs before the last text mutation.
5. The lane adds another `generateText`, model, network, database, or persistence call.
6. Incomplete evidence is promoted into hard absence / false-attribution proof.
7. Telemetry logs response text, quoted member text, member id, or raw turn id.
8. Writer's Studio handoff / disclosure receipt ordering changes.
9. Shadow runs for non-Writer paths.
10. Shadow is enabled by default.

## Stop condition

Once the gated final-egress wiring, falsifiers, S5 preferred-response replay, type/no-regression gates, and CI are witnessed, stop. A live deployment or response-authoritative hard plane requires separate authority.
