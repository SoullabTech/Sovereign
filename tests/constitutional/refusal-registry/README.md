# Refusal Registry — Falsification Harness

Companion to [`docs/architecture/REFUSAL_REGISTRY.md`](../../../docs/architecture/REFUSAL_REGISTRY.md).

**Status:** Candidate certification instrument — NOT canon.
**Last run:** 2026-07-01 — `11 passed · 0 failed · 0 warned` (4 refusals).

## What this is

The Registry makes *claims* about refusals ("the runtime is structurally prevented from taking action X"). This harness makes **proof attempts** against those claims. A PASS means a proof attempt tried to falsify the refusal and could not. A FAIL means the refusal is not currently true in code — and fails the suite (exit 1).

> `Registry = claims about refusals · Harness = proof attempts · Migration = new structure`
> Prove the existing structural refusals are real before adding new structure.

These are **source-level structural assertions** (absence of a construct across a module), not behavioural tests — because the claims are of the form *"no code path exists,"* which behaviour on exercised paths can never prove. This mirrors the project idiom (`scripts/verify-colab-boundaries.ts`, `scripts/check-*.ts`, `scripts/guards/*.ts`): structurally enforced, not assumed.

## Running

```bash
# Node 22.6+ native type stripping — no tsx dependency (verified runner):
node --experimental-strip-types tests/constitutional/refusal-registry/index.ts

# npm script (delegates to the node command above):
npm run check:refusals

# Project idiom, where tsx is installed correctly:
npx tsx tests/constitutional/refusal-registry/index.ts
```

Exit code is non-zero if any refusal is falsified.

> **Execution caveat (claim discipline).** Direct `node` execution and `sh -c`
> execution pass. `npm run` returned 194 with no output in one sandbox,
> consistent with the local npm/tsx issue already observed there. This should be
> verified in a normal dev environment before treating npm-script execution as
> proven. The deploy gate (`scripts/deploy-production.sh`) therefore invokes the
> direct `node` command, not the npm wrapper.

## Jurisdiction discipline (every check carries these)

Each refusal check declares, in its own source:

| Field | Meaning |
|---|---|
| `refusal` | what is refused |
| `grade` | authority location — A (architecture) / A-minus / B (gate) / C (prompt) |
| `enforcedBy` | the file/path that enforces it |
| `violationAttempted` | what this proof attempt tries to find |
| `passingAuthorizes` | what a PASS lets you claim |
| `passingDoesNotAuthorize` | what a PASS does **not** let you claim |
| `hostileForkMustChange` | the diff a fork would need to defeat it |

The last field is the certification test: if defeating the refusal requires a **visible code diff**, the refusal is real and forkable. If it requires only a string edit or a flag value, it is not yet Foundation-grade.

## Current checks

| id | Refusal | Grade | Result |
|---|---|---|---|
| **R01** | Memory read path does not write member data | A-minus¹ | ✅ |
| **R02** | `integration_passes` log is write-only (no readers) | A | ✅ |
| **R03** | Request identity never trusted from a client-asserted claim | A | ✅ |
| **R04** | `sacred_protected` atoms never surface in ambient recall | A | ✅ |

¹ **Correction surfaced by this harness.** Three of the four memory modules import no db handle (Grade A — structurally cannot write). But `memoryAtomsLoader.ts` imports a write-capable `query()` handle and is prevented from writing only by the *absence* of a write statement — Grade A-minus (behavioural absence, not structural incapacity). The row is graded to the weakest link. This is exactly the kind of over-claim the harness exists to catch.

## Discipline notes

- A FAIL is investigated, never silenced. During first authoring, R03 reported a false FAIL from a too-tight regex window; the guard genuinely exists (`lib/auth/getMemberFromRequest.ts:63-68`), so the fix went to the *test's precision*, not to the refusal. Distinguish "test bug" from "falsified refusal" by returning to the source evidence.
- Evidence line numbers drift. Each check matches on code *structure* (predicates, guards, imports), not line numbers, so it survives refactors. The Registry's line-number citations remain audit-derived and should be re-confirmed against a passing harness run.

## Next waves

- Grade-B rows (Sanctuary write-gating, recall consent, suppression branches) — behavioural tests with fixtures.
- The Grade-C rows ("do not synthesize") cannot reach A; they need adversarial evals, not structural assertions.
- Proposed/gap rows (`member_spiral_state` provenance, `systemPromptModifier`) get tests only *after* the closing structural work exists — a test for an unbuilt refusal would pass vacuously.
