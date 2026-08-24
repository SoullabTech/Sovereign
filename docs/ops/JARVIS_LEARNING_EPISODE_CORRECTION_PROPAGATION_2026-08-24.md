# JARVIS learning episode — a correction that was recorded and never propagated

**Date:** 2026-08-24 · **Class:** learning episode (evidence for a future capability)
**Status:** `RECORDED`. This document **authorizes and implements nothing.**
**Do not build the capability it describes from this file.**

---

## 1. The episode

`scripts/verify-colab-boundaries.ts` does not exist and never has in this repository's
history. The canonical executable is `scripts/verify-constitution-colab.ts`.

That fact was **already discovered** and written down:

| Where | When | What it said |
|---|---|---|
| `docs/design/relational-field/inquiry/JRF-08-CORPUS-CALLOSUM-SYNTHESIS.md:37` | 2026-07 | "`scripts/verify-colab-boundaries.ts` **does not exist**; renamed to `verify-constitution-colab.ts`" |
| `docs/architecture/JONDI_COMPANION_INCREMENT_1_BUILD_PLAN_2026-07-21.md:43` | 2026-07-21 | "(**real name**; old `verify-colab-boundaries.ts` does not exist)" |
| `docs/reviews/JONDI_COMPANION_PASS2_REVIEW_2026-07-21.md:34` | 2026-07-21 | flagged the docstring drift as "**Pre-existing, not Pass 2**" |
| `docs/design/relational-field/inquiry/JRF-06-shared-relational-space.md:126` | 2026-07 | recorded as **FACT (F15)** that the gate spec names the wrong file |

Meanwhile `CLAUDE.md` — the file every worker loads first — continued to carry, under
**"Co-Lab Release Gate (MANDATORY before tester invites)"**:

```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-colab-boundaries.ts'
```

Copying that command verbatim fails at module resolution. It never runs. For roughly a
month, the mandatory pre-invite gate was **executably false in the hot instruction**, while
four separate documents recorded the correct name — one of them labelling it a FACT.

The deploy lane was never broken: `scripts/pre-deploy-gate.sh:116` invokes the correct path.
So automation was right and the instruction to humans and agents was wrong. That asymmetry is
why nothing forced the discrepancy into view.

## 2. The failure chain

```
   problem discovered
          |
   recorded somewhere            <-- four times, correctly, with evidence
          |
   NO DEPENDENCY / PROPAGATION PATH
          |
   hot instruction remains stale
          |
   future workers repeat the failure
```

The missing capability is **not memory**. Memory worked — the finding was recorded four
times and was still there to be found. What was missing:

> **A verified correction must be able to identify the operational instructions that depend
> on the corrected fact.**

## 3. What a future capability would need to represent

```
finding:  verify-colab-boundaries.ts is obsolete
     |
     | supersedes
     v
canonical executable:  verify-constitution-colab.ts
     |
     | affects
     v
CLAUDE.md (Co-Lab Release Gate)
docs/ops/COLAB_RELEASE_GATE.md
plugins/soullab-jarvis/skills/deploy/SKILL.md
...any other active instruction naming the old fact
     |
     v
propose dependent corrections
```

Three properties this episode argues for, stated as requirements and not as a design:

1. **A correction carries a subject**, not just prose — the thing corrected must be
   addressable (here: a path) so dependents can be found mechanically.
2. **Instructions are typed by whether they are executable.** The correction that mattered
   was to commands workers run. The mentions in `JRF-06`/`JRF-08` and the refusal-registry
   README are *records of the finding* and must never be rewritten — rewriting them would
   destroy the evidence that the discovery happened. **Correct executable commands; never
   rewrite a record of a finding.** Any propagation mechanism that cannot make that
   distinction is worse than none.
3. **Propagation proposes; it does not apply.** A cascade that edits hot instructions
   automatically is a new class of hazard.

## 4. Secondary datum — the inverse also held

The same asymmetry appears in the reverse direction: `pre-deploy-gate.sh` had *already been
updated* to the correct path. The system's executable layer was more current than its
instructional layer. Whatever eventually reads dependencies should treat **running code as
evidence about what the instruction should say**, not merely the other way round.

## 5. Boundary

- This is an episode record, not a specification. No capability is authorized by it.
- It touches no JARVIS core, self-learning, memory, or production system.
- The correction itself already shipped, isolated, in commit `2c6a95c`.
