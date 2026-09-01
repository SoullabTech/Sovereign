# Gate evidence discipline — when a green result is evidence, and when it isn't

A gate that did not look at your change is not a gate you passed. This records
the general rule and the specific case that produced it.

## The rule

> **New source files must be tracked before a repo-wide gate's result counts as
> evidence about them.**
>
> Run `git add` (or commit) *first*, then run the gate. A green result obtained
> while new files were untracked says nothing about those files.

State it in a closeout as *"gate run with all new source files tracked"*, not
merely *"gate green"*. The two are different claims.

## The case that produced it

**AIN-STRUCTURED-INFERENCE-SEAM-01**, 2026-09-01.

`scripts/check-no-direct-anthropic.ts` enumerates candidates with:

```
git ls-files '*.ts' '*.tsx' '*.js' '*.mjs' '*.cjs' | xargs grep -lE ...
```

`git ls-files` lists **tracked** files only. A newly written module that imports
`@anthropic-ai/sdk` is therefore invisible to the guard until it is staged.

In that lane a new vendor-facing adapter was written and the guard reported
**green**. It was green because the file did not exist as far as the guard was
concerned — not because the file was allowlisted. The error surfaced only because
a *controlled probe* (delist the adapter, expect RED) produced **no output at
all**. Re-run with the files staged, the guard reported `approved: 2` and went
red on delisting, as it should.

## Why the checker was not changed

Scanning untracked files would sweep in build output, vendored copies and
scratch files, and would make the guard's result depend on working-tree litter.
`git ls-files` is the right corpus. The defect was in the **procedure for
producing evidence**, not in the checker — so the procedure is what this
document fixes.

## Generalisation

Any gate that enumerates via `git ls-files`, `git diff`, or a committed manifest
has this property. Two habits close it:

1. **Stage before you gate.** Cheap, and makes every repo-wide gate honest.
2. **Probe every gate you cite.** A gate you have not seen fail is a gate you
   have not verified is watching. Probing is what caught this one: the absence
   of a failure was the finding.

The second habit is the load-bearing one. A green check is a weak claim on its
own; a green check plus a controlled failure is a strong one.
