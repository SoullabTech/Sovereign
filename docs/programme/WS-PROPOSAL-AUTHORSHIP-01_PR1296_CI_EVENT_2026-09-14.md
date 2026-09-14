# PR #1296 · WATCH EVENT 2 — ⚠️ SIX GREEN CHECKS, AND THE TYPECHECK GATE DID NOT RUN

```text
EVENT      check_suite.completed · head_sha 181fbaa2c
POSTURE    READ-ONLY · ⛔ no push · no merge · report only
```

---

## The four-part report

```text
1 EVENT      check_suite.completed on 181fbaa2c. The fast-forward fired
             `pull_request: synchronize`, so the previously-zero checks ran.

2 EXACT      6 check runs · ALL conclusion: success
               covenant-gates ×2 · check-diagrams · auto-label · sovereignty · build
             ⛔ ABSENT: canonical-pr-quality · jarvis-epistemic-guard

3 TOUCHES    ⛔ nothing failing touches the sealed 11-file repair.

4 REQUIRES   ⛔ NO. Nothing to respond to. No change to 181fbaa2c is implied.
   CHANGE?
```

---

## ⭐⭐ THE FINDING — the branch-filter defect just produced its predicted false green

The zero-check state resolved itself. ⛔ **What it resolved into is worse than zero.**

```text
RAN        covenant-gates · check-diagrams · auto-label · sovereignty · build
DID NOT    canonical-pr-quality   (`pull_request: branches: [clean-main-no-secrets]`)
           jarvis-epistemic-guard (`branches: [clean-main-no-secrets, main]`)
```

⭐⭐ **`canonical-pr-quality` is the ONLY workflow that runs `npm run typecheck` un-swallowed.**
It is branch-filtered to `clean-main-no-secrets`. This PR's base is
`claude/proposal-authorization-integration`. **So it did not run, and cannot.**

### ⚠️ This is the exact scenario that workflow's own header documents

> *"PR #1150 presented 6/6 green checks while neither TypeScript nor any unit test had run. Not a
> flake, and not a gate that failed: the repo's only non-swallowed `npm run typecheck` lives in
> `deploy.yml`, which triggers on `pull_request: branches: [main]` … The quality gate was aimed at
> a branch nobody merges to. The green check named `build` is `docker-build.yml` building an
> image."*

```text
⭐⭐ SIX GREEN CHECKS. ONE OF THEM NAMED `build`. NO TYPECHECK. ON THIS PR, RIGHT NOW.
```

⭐ The gate was repointed `main` → `clean-main-no-secrets`, and Writer's Studio work merges into
`claude/proposal-authorization-integration`. **The gate is aimed at a branch this work doesn't
merge to — the same defect, one branch over.** ⛔ It is no longer a prediction; it has occurred.

## ⛔ What this does NOT change

```text
The six greens are REAL — those five workflows ran and passed on 181fbaa2c.
⛔ They are simply NOT a typecheck, NOT the unit suite, and NOT an epistemic-guard result.
```

⭐ The local evidence stands exactly where it stood and is **unaffected by this event**:

```text
npm run typecheck          229 vs baseline 239 · no regressions   (run locally, on this head)
app/writers-studio suite   764 passing · zero new failures        (run locally, on this head)
npm run check:no-supabase  clean
bounded runtime witness    2/2 PASS
```

## ⭐⭐ CONSEQUENCE FOR THE MERGE RULING — sharper than before

```text
⛔ BEFORE   "GitHub CI evidence is absent" — legible as a gap.
⚠️ NOW      GitHub presents SIX GREEN CHECKS that do not include the typecheck gate.
```

⭐ **A green tick is now available to be mistaken for the evidence it is not.** The merge ruling's
*"local evidence only"* sentence therefore has to do MORE work than when the checks were zero:

```text
⭐ "All checks passed" on this PR does NOT mean typecheck ran.
   The typecheck evidence on 181fbaa2c is LOCAL, and only local.
```

⛔ Zero checks could not be mistaken for a pass. ⭐⭐ **Six green ones can.** That is precisely why
the finding must be named in the merge record rather than left to the checks UI.

## Standing — unchanged by this event

```text
PR #1296     OPEN · head 181fbaa2c · 6 checks green · ⛔ typecheck NOT among them
HEAD         🔒 181fbaa2c sealed integration candidate · 4df4e91d sealed ancestor
WATCH        ✅ read-only · nothing pushed · nothing merged
MERGE ⛔      F1 ⛔      CI-GATE LANE ⛔ separate — ⭐ and now demonstrated, not hypothetical
```
