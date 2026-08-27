# JARVIS App Stabilization — Closure Record

**Status: COMPLETE.** Founder ruling 2026-08-27.

```
PINNED CANDIDATE   e73d9d4     (stabilization as ruled complete)
SUCCESSOR          this commit (click-path proof + STAB-04 founder path)
BRANCH             claude/jarvis-app-stabilization-1jwcen
PROOF              265 assertions, 0 failed
DEPLOYMENT         NOT PERFORMED
LANE A             UNTOUCHED
PRODUCTION         64c2b7c07 — CARRIED, not re-read
```

> **Tag not created.** `git tag jarvis-stabilization-complete e73d9d4` was
> attempted and **refused with HTTP 403** — this session's credentials permit
> branch pushes, not tag creation. The pin is therefore a record, not a ref.
> Create the tag locally to make it structural.

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

## Next unit

`PKG-01 — PACKAGED macOS JARVIS PROOF`. Harness:
`jarvis-desktop/scripts/pkg-01-proof.mjs`. It does not change JARVIS behavior;
it proves the stabilized behavior survives the packaged path.
