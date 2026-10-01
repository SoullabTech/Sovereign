# H1-COHORT-GATE-01 · R3 — Runtime Convergence Deployment Witness · 2026-10-01

```text
Class: A programme · runtime-convergence evidence
H1 convergence PR: #1578
PR head: 6e44edca32cfa8f382b255ef433dab5f44ec8205
PR merge / deployed runtime: 68af62fda2ab64220e3fc9c319bc8916406a6626
Prior production runtime: 3421a2096
Current canonical at record time: bde0f6590eca905af9a3f20e5b4edf9520bceab2
Standing: R3 PASS · CONVERGED H1 RUNTIME LIVE · FOUR-PERSON COHORT PRESERVED
Human-lived witness: PENDING under H1-FIRST-HUMAN-WITNESS_PROTOCOL_2026-09-30.md
```

## 1 · What R3 establishes

R3 establishes that the H1 authority admitted under #1551 is now running through the single governed arrival seam merged by #1578, without reopening or changing the already-designated production cohort.

It does **not** claim that a human participant has experienced continuity successfully. That evidence class remains human-only and is governed by the canonical first-human protocol.

## 2 · Immutable deployment

The governed production entry point was run on the Minisforum with the exact merge SHA:

```bash
./scripts/deploy-production.sh deploy 68af62fda2ab64220e3fc9c319bc8916406a6626
```

The deploy lane:

- acquired the production deploy lock;
- resolved the named commit object;
- materialized it with `git archive` into an isolated build context;
- used the target commit's snapshot `docker-compose.production.yml`;
- proved `.env.production` does not define `GIT_COMMIT`;
- stamped `GIT_COMMIT=68af62fda` from the asserted SHA;
- passed the disk preflight with approximately 168 GB free;
- found no host `pnpm`, so the script explicitly skipped its optional dependency-audit command rather than using an override.

The shared production checkout was not used as build authority.

## 3 · Pre-swap gates

The candidate image was built successfully. Before any reader swap:

- `maia-sovereign:prod` carried `GIT_COMMIT=68af62fda`;
- deploy-context verified that image stamp against the asserted target;
- REVIEW-CUSTODY found **no production-pending migrations**;
- the migration runner independently reported **no pending migrations**;
- the current production image was preserved as `:previous`;
- the candidate was tagged as `:current` and `:68af62fda`.

No schema change was needed for this convergence.

## 4 · Running provenance and health

After the swap, the deployment script proved:

```text
printenv GIT_COMMIT = 68af62fda
Docker Config.Env     = 68af62fda
asserted target       = 68af62fda
```

The resulting `maia-sovereign` container was healthy. Post-deployment smoke tests all passed:

- `/api/health`
- `/api/version`
- `/api/ready`
- main page
- `/api/build/status` remained locked
- `/api/build/alert` remained locked
- constitutional verification

Public `https://soullab.life/api/health` reported `health=ok`, version `68af62fda`, and safe mode off.

The first post-restart aggregate log check contained 15 lines and **0 error-like lines**.

## 5 · H1 operational configuration survived the deployment

The existing production cohort was preserved unchanged:

```text
HOUSE_STUDIO_H1_ENABLED = true
configured cohort count = 4
```

No cohort identity was added to source control, and this witness records no names, UUIDs, emails, session tokens or manuscript content.

## 6 · Converged authority present in the running image

The runtime image itself contains:

- `/app/lib/access/houseStudioH1Access.ts` reading only `HOUSE_STUDIO_H1_ENABLED` and `HOUSE_STUDIO_H1_MEMBER_IDS`;
- the #1578 pure `houseStudioH1AdmissionResponse`;
- the built dynamic endpoint bundle at `/app/.next/server/app/api/house-studio/admission/route.js`.

Function names from the client-side arrival seam are minified in the production bundle, so no stronger claim is made from string inspection. The immutable image provenance binds the whole deployed image to #1578's exact merge SHA.

## 7 · Production authority-path witness

A temporary script was executed **inside the running `68af62fda` container**. It selected:

- one member from the configured H1 allowlist;
- one real production member outside that allowlist;
- the signed-out state.

It emitted no identity, Work id, title, manuscript content or session credential.

The live authority core returned:

```json
{
  "cohortCount": 4,
  "admitted": { "status": 200, "admitted": true },
  "ordinary": { "status": 200, "admitted": false },
  "signedOut": { "status": 401, "admitted": false }
}
```

Separately, an unauthenticated public request to `/api/house-studio/admission` returned HTTP 401.

This establishes the live production authority distinction after convergence. It is **not** substituted for a signed-in browser or human continuity witness.

## 8 · Rollback truth

After convergence:

```text
:prod     → 68af62fda
:current  → 68af62fda
:68af62fda→ 68af62fda
:previous → 3421a2096
```

Therefore the immediate reader rollback target is the prior admitted H1 runtime, `3421a2096`.

The cohort can also be closed independently by setting `HOUSE_STUDIO_H1_ENABLED=false` and recreating MAIA. Neither rollback hides Writer's Studio, member Works or manuscripts.

## 9 · Canonical movement after deployment

After #1578 merged and was deployed, canonical advanced to `bde0f6590` through #1563, a separate Living Field SVG interaction lane.

R3 deliberately did **not** widen its deployment target to that later commit. The H1 runtime witness is bound to the exact #1578 merge SHA `68af62fda`. Any promotion of later canonical work belongs to the lane that owns that later change.

## 10 · R3 ruling

> **H1-COHORT-GATE-01 / R3 — PASS.**
>
> The converged H1 authority is deployed at its exact merge SHA, production provenance is verified, the existing four-member cohort is preserved, the live authority distinguishes admitted / ordinary / signed-out states correctly, health and constitutional smoke gates are green, and rollback remains explicit.

The next H1 evidence class is the already-preregistered human encounter:

> **PRODUCTION COHORT OPEN · CONVERGED RUNTIME LIVE · HUMAN WITNESS PENDING**

No automated agent or server-side authority check may upgrade that standing to `HUMAN-WITNESSED PASS`.
