# ⭐ CUSTODY RULE — a witness binds to a served commit

**Founder ruling, 2026-09-07, verbatim:**

> **A founder witness binds to a served commit, not to whichever branch we were
> discussing when the witness was reported.**

## WHY THIS RULE EXISTS

It was earned three times in one lane, each time cheaper to state than the last
and each time missed anyway:

| # | The mistake |
|---|---|
| 1 | `227e4e63` — a founder view attributed to a commit that was on one ref and had never been served |
| 2 | Journey Truth **C-3** — `StudioRail`'s *existence* read as a member's *reach*, when it renders nowhere |
| 3 | Canvas material — the same, but about a whole build: a founder PASS attributed to `717cef35` while the served commit was `f7028f5d5` on a different branch |

⭐ **The third was committed by the session that had spent the lane naming the
first two.** That is the finding, not the individual error: **knowing the failure
mode does not confer immunity to it.** The rule has to be structural — a step
that is *performed* — because vigilance demonstrably is not enough.

## THE OPERATIVE FORM

⛔ Before recording any founder observation as evidence about a commit, the
**served** commit must be established, not assumed:

```text
1  ASK      what is actually being served?
             git branch --show-current && git rev-parse --short HEAD
2  PROVE    does the served commit CONTAIN the change under test?
             git merge-base --is-ancestor <change> <served>
3  BIND     record the witness against the SERVED commit, never the discussed one
```

⚠️ **Step 2 is the one that was skipped**, and it is one command. Both prior
attributions would have died there in under a second.

## THE COROLLARY THAT COST MORE

A witness naming the wrong subject does not merely mislabel a result — **it
manufactures evidence about code nobody ran.** This session read the founder's
*"screen still jumps"* as proof that its own first repair had failed, and built a
whole causal account on it (`preservingScroll`, a shared helper, seven tests, a
commit message asserting the mechanism). **The repair had never been served.**

> ⛔ **A report about a build you did not identify is not evidence about your
> change. It is evidence about a build.**

The engineering may yet be correct. It is no longer *supported*, and it is held
as hypothesis.

## SUBJECT / REPAIR PROTOCOL (founder-ruled)

```text
SUBJECT      build/ws-home-redesign-slice-a @ f7028f5d5
FIRST ACT    read-only characterization on that exact subject
⛔ DO NOT     edit build/ws-home-redesign-slice-a in place — it may be owned
              by another session
IF REPAIR    cut a bounded branch FROM f7028f5d5
             e.g. fix/ws-image-upload-fetch-failure
```

*Read it there; repair on a fresh bounded branch only after the failure is
characterized.*

## STANDING — corrected, founder-held

```text
CANVAS ARCHITECTURE
  survivor                build/ws-home-redesign-slice-a @ f7028f5d5

77f72055                  ⛔ SUPERSEDED · MUST NOT DEPLOY
717cef35 scroll repair    ⛔ NOT WITNESSED · prior claimed failure WITHDRAWN
surviving branch scroll   founder observed stable · mechanism NOT adjudicated

IMAGE FAILURE             resolved by founder act
                          ⛔ mechanism UNRECORDED — see below

DEPLOY                    HOLD · prior deploy-eligibility claim WITHDRAWN
```

## ⛔ OPEN — the image failure is resolved, its mechanism is not

The founder reports the image failure resolved. ⛔ **This session did not
characterize it and does not know what changed**, so nothing here claims a cause.

**Why that gap is worth naming rather than closing:** the leading hypothesis was
`FILE_STORAGE_PATH` resolving beneath the watched repository tree, so an upload
writes into the dev watcher's path and kills its own request. **If that was the
cause, it is environment configuration, not product** — and it will recur on
every fresh checkout that lacks the setting, including a tester's.

⛔ A defect that stops reproducing on the founder's machine has not necessarily
stopped existing. One line — *what changed* — decides whether this is closed or
merely quiet, and the discriminators (does **The cover** fail identically; does
the dev terminal recompile at the moment of upload) remain the way to settle it.
