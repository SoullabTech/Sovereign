# SEL-0 · Develop Room — founder walk, PREPARED · NOT WALKED

**Runtime under walk**: `64e439f66` + `docs/programme/sel-0/SEL-0_DEVELOP_ROOM_SURFACE.patch`
**Contract awaiting discharge**: `docs/design/contracts/develop-room.md`

⛔ **Nobody has walked this yet.** `experience_verification` is deliberately empty in the contract
and must be written by the founder, in the founder's own words, after the walk below. Nothing in
this document is verification.

---

## The environment

```text
worktree     /Users/soullab/sel0-walk          disposable, HEAD 64e439f66 + the surface patch
database     maia_sel0_walk                    LOCAL postgres 17.7, bootstrapped + fully migrated
server       http://localhost:3111             next dev, DATABASE_URL pinned to the walk database
```

⛔ **Production was not touched.** The migration was applied to the disposable walk database only.
`maia_consciousness` — local or on minisforum — was neither read nor written. The main checkout at
`/Users/soullab/MAIA-SOVEREIGN` is clean; the surface patch exists only in the walk worktree.

⚠️ **The full migration chain applied cleanly here, invariants verified** — a stronger result than
the minimal shadow, and the first time `20260908000001` has run inside a complete schema.

## Sign in

```text
http://localhost:3111/signin
username   walker
password   sel0walk
```

## The room

```text
http://localhost:3111/writers-studio/develop?m=0051fdb9-beda-42e6-b836-f247d05a1f42
```

A six-section synthetic Work ("The Weather House") with one frozen developmental reading carrying
five observations: `o1` recurrence · `o2` term-drift · `o3` unresolved-thread · `o4` register-shift
· `o5` positional-asymmetry.

⚠️ **The Work is synthetic; the machinery is entirely real.** Sections, revision, partition, read
state and the frozen reading were produced by `partitionFromSections`, `captureEvidence` and
`freezeAndStore` — the repository's own functions. The room, the ask route, the boundary seam, the
selector, the model call and the database are all the real ones. **It is not the frozen SEL-0 19,
which was not used and must not be.**

⛔ **ONE THING IS NOT WHAT PRODUCTION WOULD WRITE, and it matters.** The fixture's F-7 verdicts are
set to `eligible` by the seed. A reading frozen by the runtime today records `unestablished` for
every observation, because no F-7 adjudicator exists — so in production the selector would return
`NO_LAWFUL_CANDIDATE` and you would never see an offer. **This walk demonstrates the surface, not
that a production reading would currently offer anything.**

---

## The walk

```text
1  arrive                     do nothing at first, and look
2  ask MAIA what is worth looking at
3  receive one observation
4  what else?                 repeat until it ends
5  leave it                   then ask again
```

## What to look for

The contract's falsifiers, in the order they are easiest to check:

```text
W1  ARRIVAL IS UNCHANGED
    Nothing is highlighted, scrolled to, reordered or marked before you press.
    The reading is in its own order, o1…o5.

W3  ONE OBSERVATION, AND ONLY ONE
    You are told which single observation she would start with. No list, no
    ranking, no score, no percentage, no "3 of 5".

W4  "WHAT ELSE?" DOES NOT REPEAT
    Each press names a different observation, until an ending.

W5  LEAVING ENDS THE COMMISSION
    After "leave it", asking again starts over — it may well offer the same
    observation it began with the first time. That is correct.

W8  AN ENDING READS AS AN ANSWER
    Whichever ending you reach, it should read as a plain sentence, not an
    error, not a retry, not an apology, and it must never mention what you
    dismissed or suggest reversing anything.

W9  THE OFFER IS REFUSABLE
    Ignore it entirely and use the room normally. Nothing should nag or change.

W10 MOBILE IS THE SAME ROOM
    At 390x844 the gesture should stay a quiet underlined sentence — not a card,
    banner, toast or alert.
```

⭐ **The one I would watch hardest is W1.** Everything else is mechanical; whether the room still
*feels* like a place you arrive at rather than a place that is waiting to advise you is the thing
only a person can judge.

## What a scripted run of the real path already produced

Recorded so you can compare, **not** as a substitute for your walk:

```text
one commission           o4 → o5 → o3 → END: decline
a fresh commission       offered o4 again          (commission scoping holds)
addressing o2 directly   resolved o2 exactly, selector never consulted
standing events written  0, after every offer was passed over
ask_threads opened       real rows, then cleared for your clean start
```

⭐ **MAIA declined after three of five.** She judged the remaining two not worth raising rather
than working through the set — so *decline* is what you are most likely to meet, and exhaustion
may not appear at all. **That is the contract working, not a fault**, and it is the behaviour most
worth your judgement: is her restraint reasonable, or is she quitting early?

⚠️ **A transient provider failure is visible in this room.** One capture attempt met one and the
room said *"She could not answer that just now."* If you see that, it is a failed model call, not
MAIA's restraint — the code deliberately keeps those distinct. Press again.

## Screenshots

```text
docs/design/contracts/screenshots/writer-develop-desktop.png   1440x1000, @2x — an offer made (o3)
docs/design/contracts/screenshots/writer-develop-mobile.png     390x844,  @2x — an offer made (o4)
```

Both were captured from **this running implementation**, through a real sign-in and a real press of
the gesture. Neither is a mockup.

⚠️ **The first desktop capture was discarded and is disclosed here rather than quietly replaced:**
it caught the transient provider failure above, so it depicted a fault instead of the room. The
retained frame is the second attempt. Nothing else was selected for.

## Afterwards

To discharge the contract, add to `docs/design/contracts/develop-room.md`:

```yaml
screenshot_desktop: docs/design/contracts/screenshots/writer-develop-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writer-develop-mobile.png
experience_verification: >
  <your account of the walk — what you did, what you looked for, what you saw>
```

Then the design-canon gate passes and the surface patch may be applied and committed.

## Teardown, when you are done

```text
kill the dev server on port 3111
dropdb maia_sel0_walk
git worktree remove --force /Users/soullab/sel0-walk
```

⚠️ Also still on disk from the earlier shadow validation, stopped and inert:
`/tmp/sel0sh.WjCv` and `/tmp/sel0sh.ksmD` (~51 MB). The session harness refuses `rm -rf`, so they
were left rather than removed.

---

```text
CONTRACT              DRAFTED · NOT DISCHARGED
WALK                  PREPARED · NOT PERFORMED
SCREENSHOTS           CAPTURED from the running implementation
experience_verification  EMPTY — founder's to write, not mine
SURFACE PATCH         HELD · applied only in the disposable worktree
PRODUCTION            UNTOUCHED · migration UNAPPLIED there
MANIFEST B            NOT OPENED · frozen 19 NOT USED
MERGE / DEPLOY        NOT AUTHORIZED · none performed
```
