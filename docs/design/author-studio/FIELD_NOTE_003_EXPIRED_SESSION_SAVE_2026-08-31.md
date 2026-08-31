# Field Note 003 — "It's telling me it can't save my changes"

**Date**: 2026-08-31
**Source**: Beta writer, returning to their own uploaded book after time away.
**Scope**: This branch carries the save repair ONLY. The spacing half of the
same report was diagnosed, attempted twice, and withdrawn both times — see
`FIELD_NOTE_002_UPLOADED_BOOK_SPACING_AND_SAVE_2026-08-29.md`. The two were
split so a proved defect is not held behind an unproved transform.

## What they said

> Sorry…things have been a bit busy, but I'm getting back to my writing now.
> […] It's telling me it can't save my changes? Just FYI

## The defect

`putDraft` mapped **401** into the generic `error` result. A session that
expired mid-manuscript — precisely the case for a writer returning after a gap —
therefore surfaced as *"Could not save just now"*, alongside a **Save now**
button that could never succeed, for as long as they kept typing.

Three surfaces shared the fault, because they share the client:
`WorkingDraftEditor` (Soullab Press), `Worktable` and `WritingSurface` (Writer
Canvas).

## The repair

`unauthorized` is now its own `SaveResult` and `SaverState`:

```text
401
  → unauthorized, not error
  → the writer is told they are signed out, and that nothing was lost
  → the latest content stays queued
  → sign in, in a NEW tab
  → the same latest content saves
```

Three properties carry the repair, and each is a test:

- **It is not a conflict.** A conflict stops the saver for good, because only
  the writer can resolve a diverged draft. This resolves the moment they sign
  in, so the lane stays open.
- **Nothing is dequeued.** Text written *while* signed out replaces the older
  pending version rather than being dropped, so the save that eventually
  succeeds carries the latest words, not the ones from before the failure.
- **Sign-in opens a new tab.** The load-bearing detail: the words live only in
  the open page until a save succeeds, so navigating that tab away is the one
  action that would actually lose them.

The failed-save line is also no longer dim. In `WritingSurface` the whole margin
toolbar lifts to full opacity, because CSS opacity compounds and a bright child
inside a 45% parent is still 45% (W-4).

## Sovereignty check

- **Agency**: increases. The writer can recover their own work instead of being
  told a falsehood about why it will not save.
- **Provenance**: no capability was added; nothing is stored, inferred, or
  reinterpreted. The repair removes a false statement.
- **Restraint**: the client stops retrying on its own and hands the decision
  back, rather than hammering a session it cannot mend.

## Ruling of record (founder, 2026-08-31)

```text
401 / expired-session repair      PASS
queued-content recovery           PASS
writer-facing recovery copy       PASS
→ ships independently of the spacing lane
```

## Verification

- `npx jest app/press app/writers-studio` — passing.
- `npm run typecheck` — no regressions.
- Not yet verified under production load: this is branch state, not Live.
