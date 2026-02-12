# Skill: Deploy Checklist (Soullab / MAIA)

## Purpose

Generate a step-by-step deploy plan with verification, rollback notes, and "stop if" tripwires.

## Inputs Needed

- Repo / service name
- What changed (routes, DB migration, UI, worker)
- Environments (local, staging, prod)
- Any feature flags

## Output Format

1. **Pre-flight checks**
2. **Deploy steps**
3. **Post-deploy verification**
4. **Monitoring** (what to watch for + where)
5. **Rollback plan**
6. **"Stop if" conditions**

## Principles

- Smallest safe change first
- Verify at each step
- Prefer feature flags where possible
- Always include a quick smoke test script (manual steps ok)

## Verification Examples (Include Where Relevant)

- API health endpoint
- One read + one write path
- DB migration applied + schema sanity
- Logs: error rate, latency
- Key UI flow click-through
