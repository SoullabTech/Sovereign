# Author's Studio — Phase B design corpus

## Status: RENDERED DESIGN

**These files are not implementation.** They are self-contained HTML prototypes and
observation records made on 2026-07-31. Nothing here runs in the product, and none of it
should be cited as evidence that a behaviour exists.

A design passes through five distinct states. They must never be blended:

| State | Meaning |
| --- | --- |
| **Rendered design** | a prototype exists and can be looked at ← *everything in this folder* |
| Repo implementation | code exists on a branch |
| Merged | it is on `clean-main-no-secrets` |
| Deployed | it is in the running container |
| Experientially verified | a person used it and it held |

This folder exists because that distinction failed once. The prototypes below were reviewed
repeatedly over a day and gradually became mentally indistinguishable from shipped product —
which produced a false alarm that the deployed Studio had regressed. It had not. The
prototypes had simply never been code.

## ⚠️ Palette warning

Every prototype here uses a **deep navy ground**, because MAIA's brand note is *navy field,
never purple*. **The Author's Studio does not use navy.** It uses the **Soullab Press
espresso palette**, which is a deliberate, committed decision in
[`app/press/studio/pressTheme.ts`](../../../../app/press/studio/pressTheme.ts):

```
bg      linear-gradient(135deg,#1A1513 0%,#241C18 60%,#1A1513 100%)
text    #F3EDE4
accent  #C9A227
rule    #4A4238
```

Implementation must **extend the espresso language**, or explicitly reopen and change that
ruling. It must not drift into navy because a prototype used it.

## The files

| File | What it holds |
| --- | --- |
| `writing-surface.html` | The page prototype — measure, type, section breaks, margin marks, recovery. **Its persistence is `localStorage` and is superseded** by the server durability layer already deployed (PR #849 + #850). Do not port it. |
| `sitting-001-returning.html` | Returning — what people lose, what to restore, what to leave out |
| `sitting-002-beginning.html` | Beginning — where work starts, what fades, what brings it back |
| `study-paper.html` | Why writers still print. *Finding: nothing moves. Don't move things.* |
| `study-revision.html` | Revision as a different practice from drafting. Observations only, no findings. |

## What Phase B may take from them

Typography · measure · page spacing · paste behaviour · section breaks · the simplest viable
marking gesture.

## What Phase B may not take

The editor foundation. The surface is a `<textarea>` and stays one — a `contenteditable`
migration would put the working autosave, selection restoration, scroll restoration, undo
behaviour and mobile editing at risk to reproduce one margin interaction. Nor may it take the
prototype's persistence, its navy, or any capability the prototypes imply but the product has
not built.
