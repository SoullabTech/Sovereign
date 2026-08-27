# JARVIS App Stabilization — Closure Record

**Status: COMPLETE.** Founder ruling 2026-08-27.

```
e73d9d4   SUPERSEDED STABILIZATION BASELINE
          module / store / lineage / Electron integration proved
          GAP: receipt ingestion had no founder application path

5237a92   STABILIZATION-COMPLETE CANDIDATE  —  DO NOT MOVE
          e73d9d4 + real founder click path + UI correctness repairs
          265 assertions / 0 failed
          RESIDUAL: packaged macOS application only

BRANCH      claude/jarvis-app-stabilization-1jwcen
DEPLOYMENT  NOT AUTHORIZED / NOT PERFORMED
LANE A      UNTOUCHED
PRODUCTION  64c2b7c07 — CARRIED, not re-read
```

**Why the completeness label sits at `5237a92`, not `e73d9d4`.** STAB-04 claimed
evidence could return to JARVIS. At `e73d9d4` that was true as an *internal*
capability and false as an *application* capability: the founder could issue work
but could not complete the return loop from JARVIS itself. `e73d9d4` is preserved
because it shows exactly what the final proving walk discovered.

> **Tags could not be pushed.** `git push origin refs/tags/…` was attempted and
> refused with **HTTP 403** — this session's credentials permit branch pushes,
> not tag creation. Create them locally; the second is the important pin:
>
> ```bash
> git tag -a stabilization-electron-baseline e73d9d4 -m "pre-click-path baseline"
> git tag -a jarvis-stabilization-complete   5237a92 -m "stabilization complete"
> git push origin --tags
> ```

## What was stabilized

| Unit | Claim | Where proved |
|---|---|---|
| STAB-01 | A submitted task survives the app | `test/stab-01-04-custody`, `stab-06`, `stab-07-electron-walk` |
| STAB-02 | Routing is deterministic, and *auditable from durable history* | `test/stab-01-04-custody`, `stab-06` |
| STAB-03 | C3 ends in a handoff packet, not a paragraph | `test/stab-01-04-custody`, `stab-06`, `stab-07` |
| STAB-04 | Evidence returns and rejoins its run | `test/stab-01-04-custody`, `stab-06`, `stab-07b` |
| STAB-05 | State consistency: HOLD ⇄ BLOCKERS, freshness, adjudication | `test/stab-05-programme-state` |
| STAB-06 | Base lineage: `BASE_MISMATCH` vs base drift | `test/stab-06-adversarial-lifecycle` |
| STAB-07 | Commit identity, ingestion bracket, Electron integration | `test/stab-07-identity-and-bracket`, `stab-07-electron-walk` |

Authority is unchanged throughout. C3 remains routed-not-executed; Desktop does
not invoke Claude.

## The two primitives worth carrying beyond this programme

**`BASE_MISMATCH` vs `BASE_DRIFT`.** The returned evidence is not about the
commissioned work → refuse. The commissioned work happened but the world moved
→ preserve, scope, block advancement pending reconciliation. This gives the
system a way to say *"this remains true about then, but it is not evidence about
now"* — which is not specific to code.

**Freshness as part of the value.** `value + provenance + freshness`, never a
bare value. `64c2b7c07` cannot silently acquire the meaning "JARVIS just verified
production is 64c2b7c07".

## Found during closure, and reopened rather than deferred

`ingestReceipt` was exposed on the preload bridge from the start and **no
renderer code ever called it**. STAB-04 had no founder click path at all —
evidence could only be ingested by something that was not the application.

This was a stabilization gap, not a packaging defect, so it was fixed here per
the founder's own rule. It was invisible to the in-process IPC walk by
construction: a button wired to nothing passes a handler-level proof untouched.
The click-path harness (`test/electron/click-path.js`) exists because of it.

Two smaller defects the same harness found, both real beyond the test:
- a stale refusal message sat beside a fresh ingest attempt, so a founder would
  read a previous verdict as the current one;
- run cards had no addressable id, so nothing could refer to one run.

## Residual bounds — handoff conditions to packaging, NOT stabilization failures

```
PACKAGED macOS APP      NOT PROVED
```
Everything was proved against the **dev** app (`app.isPackaged === false`) on
Linux under xvfb. The packaged branch resolves its runtime root differently
(`findRepoRootPackagedMode`: env → config → candidate, re-verified per launch),
and that branch is where the earlier "won't launch" and "every subsystem
UNKNOWN" defects lived. It is untested here because this session has no macOS.

```
FOUNDER CLICK PATH      PROVED on the dev app, NOT on the packaged artifact
```
Closed for dev by STAB-07b: real BrowserWindow, real `index.html`, real preload
with `contextIsolation`, real DOM clicks — submit → handoff → ingest refusal →
ingest acceptance, each asserted both on screen and in the canonical store.

## Reopening rule (founder ruling, preserved verbatim in intent)

If the Mac walk reveals **the packaged runtime path resolves incorrectly**, that
is a `PKG-01` defect. If it reveals **receipt lineage can incorrectly become
CURRENT**, stabilization was incomplete and the relevant invariant reopens.
Packaging fixes do not get merged back into "stabilization" because the packaged
app exposed a bug.

## Lineage discipline for what follows

If PKG-01 exposes an `app.isPackaged` path defect, **`5237a92` does not move.**
It remains the stabilization-complete baseline; the fix becomes a packaging
successor:

```
5237a92  →  PKG defect discovered  →  <new SHA>  →  PKG-01 candidate
```

So that six months from now JARVIS can answer what was stabilized, what
packaging changed afterwards, and why.

## Next unit

`PKG-01 — PACKAGED macOS JARVIS PROOF`. Harness:
`jarvis-desktop/scripts/pkg-01-proof.mjs`. It does not change JARVIS behavior;
it proves the stabilized behavior survives the packaged path.

### PKG-01 harness lineage (packaging lane — `5237a92` does not move)

The harness is packaging-lane work. None of these SHAs touch application code,
and none of them is a stabilization successor.

| SHA | What it corrected |
|---|---|
| `c4c30f5` | portability (`dist/mac` vs `mac-arm64`), signing-identity precheck |
| `31446cf` | step 4 was a hollow control — `open -a` ignores cwd and the bundle sat inside the checkout; now `ditto`-copied out and proven outside any repo |
| `105b64b` | bounded the build step |
| this commit | two harness defects that misreported a build which had in fact succeeded |

**Two corrections worth keeping, because both are the failure this programme
exists to refuse — a record that reports an intention rather than a fact:**

1. **A successful build was reported `FAIL`.** `sh()` called `.trim()` on the
   return of `execFileSync`, which is `null` when stdout is inherited. The throw
   landed on the *success* path and the catch reported a build failure. Every
   downstream assertion passed against a valid signed artifact while the summary
   said the build had failed.
2. **`--no-sign` did not disable signing.** `CSC_IDENTITY_AUTO_DISCOVERY=false`
   suppresses discovery only; `package.json` names `build.mac.identity`
   explicitly, so electron-builder signed anyway — and `provenance.signed` was
   set from the *flag*, recording `false` about an artifact that was signed. The
   flag now overrides the pinned identity, and `provenance.signature` is read off
   the artifact with `codesign -dvv` rather than inferred from what was asked for.

**Withdrawn hypothesis.** The first two runs appeared to stop at the `signing`
line and were diagnosed as codesign blocking on a keychain dialog. That was
wrong. The identity is in the keychain, signing succeeds, and the build finishes
in about a minute. Those transcripts were truncated, not blocked. The timeout
added on that hypothesis is retained on its own merits and is not evidence about
signing.
