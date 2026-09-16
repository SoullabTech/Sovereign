# JARVIS-MAIA-INVISIBLE-STANDING-01 — I1 Egress Census

## Existing production seam

Writer's Studio Focus already converges through `getMaiaResponse()`. Free model generation becomes `rawResponse`, then the shared member-facing egress funnel runs before voice synthesis, persistence, and route return.

The funnel at `lib/sovereign/maiaService.ts:2847` / `:3698` currently applies:

1. output sanitization / internal state-vector stripping;
2. Presence constraints when applicable;
3. the identity-predicate emission guard.

This is an important precedent: the system already protects constitutional properties **after free generation** without making those rules part of the visible response when no violation occurs.

## Existing output-side memory precedent

The live `/list` route also applies `scrubMemoryAmnesia()` after generation when MAIA makes a substrate-falsifiable claim about her memory capability. The guard ignores quoted member speech and returns `null` when there is no provable violation; compliant prose ships unchanged.

## Candidate minimum seam

A future invisible-standing control plane therefore belongs conceptually beside these final egress properties, not in MAIA's conversational voice:

`free response → deterministic authority audit → unchanged pass OR named refusal → member`

This record is a trace only. No production wiring is authorized.
