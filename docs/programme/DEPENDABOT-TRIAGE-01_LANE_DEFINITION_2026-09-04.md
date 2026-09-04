# DEPENDABOT-TRIAGE-01 — LANE DEFINITION

**Date**: 2026-09-04
**Opened by**: founder (Kelly), on a push-time signal from GitHub: 678 Dependabot findings on the
default branch (20 critical · 331 high · 275 moderate · 52 low).
**Status**: DEFINED. Not started. No package has been changed.
**Kind**: triage lane. **Not** "upgrade everything."

---

## Objective

Establish exposure before changing packages. Classify the **critical** findings first, each on
four axes:

| Axis | Question |
|---|---|
| Reachable production exposure | Is the vulnerable code path reachable from a production route, worker, or build step that ships? |
| Runtime vs development dependency | Does it ship in the production image, or only in dev/test/build tooling? |
| Exploitability | Does the advisory's precondition exist here (input shape, feature use, network position)? |
| Remediation risk | What does the fix change: patch bump, major bump, transitive override, replacement? |

A raw count includes transitive, development-only, unreachable, and already-compensated
findings. Conversely, one reachable critical dependency matters more than hundreds of low-value
findings. The lane's output is a ranked exposure table, not a lockfile diff.

## Sequence

1. **FIND** — pull the critical (then high) advisory list; for each, trace the dependency path
   (`npm ls <pkg>`), the importing module, and whether it is in the production image
   (`Dockerfile` stages, `docker-compose.production.yml`). Record method.
2. **CLASSIFY** — one row per finding across the four axes. Reachable + runtime + exploitable
   = **ACT**. Everything else is **HOLD** with reason.
3. **RULING** — founder reads the ACT set. Only then does any package change, one bounded PR
   per remediation, each with typecheck + smoke + the no-regression gate green.

## Stop conditions

- Any finding whose remediation requires a major bump in a load-bearing dependency (Next,
  React, `pg`, Capacitor) stops for a separate ruling.
- Any finding in the auth, consent, memory, or PHI path is Class A regardless of its
  Dependabot severity.

## Not this lane

- Bulk `npm audit fix` or `npm audit fix --force`.
- Touching the Coaching Template / Now What? work; the lanes share nothing.
