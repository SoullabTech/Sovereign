# WS2-04B — Section-Aware WRITE Path: Witness Record

**Status:** PASS · founder-witnessed locally (2026-08-30)
**Head at witness:** `6ddfdc895`
**Book:** a 174-section manuscript in local dev. Not production.
**Witness:** Kelly, on his own machine, in a browser, against local PostgreSQL.

This file is the record of what was *observed*, not of what was built. It is
closed. Nothing here authorises a further 04B code change; evidence that a
mechanism works is not a mandate to keep touching it.

---

## Unit state

```text
WS2-04A  section-addressable substrate          PASS · local
WS2-04B  section-aware WRITE path               PASS · founder-witnessed locally

Proven:
  draft-section identity
  exact section navigation
  edit isolation
  1200 ms staged autosave
  serialized versioned PUT
  navigation while saving
  persisted return
  persistence across server restart
  stale-base 409 refusal
  local conflicted text retained
  conflict latch
  no automatic overwrite past conflict

Production conversion                            NOT AUTHORIZED
Production deployment                            NOT DONE

Separate / unstarted:
  04B-0                                           legacy # normalization
  SECTION-AWARE-CHECKPOINT                        section-authoritative Keep a version
```

---

## The four observations

**1. Persistence — PASS.** After a full dev-server restart and a fresh page
load, section 22 still contained `WITNESS-ALPHA`. A restart clears every
module-level cache and all React state, so the only path by which that text
could reappear is `GET write-state` reading the persisted
`manuscript_draft_sections` row. This establishes database persistence, not
surviving client state. It is a stronger result than the in-tab reload
originally asked for.

**2. Layout — PASS.** `6ddfdc895` removed the fixed `60vh` sizing I had
introduced on the section field and returned it to the same content-driven
growth strategy the continuous editor uses (`rows={1}`, `overflow: hidden`,
height set to `scrollHeight` on change). Field and outline geometry are
coherent again; the room was measured for one sizing strategy and now has
only that one.

**3. Conflict refusal — PASS.** After an external version bump
(`UPDATE manuscript_working_drafts SET version = version + 1`), the next
section save produced exactly one PUT, answered 409. The locally typed
conflicted text remained visible in the field, and row 22 showed `!`.

**4. Conflict latch — PASS, with its condition preserved.** The final capture
showed the conflict marker still latched and a single section request in the
Network panel after further typing.

> **Condition retained on the record:** this conclusion assumes the second
> observation was taken *after* the shared ~1200 ms debounce window had
> elapsed. Read before that window, a quiet network panel proves only that the
> debounce had not yet fired. The mechanism is not in doubt — see below — but
> the observation's strength depends on that timing, and the record should say
> so rather than round it off.

---

## Why the latch result is mechanism, not luck

`lib/writersStudio/sectionSaveQueue.ts:131`

```ts
if (!this.conflicted.has(sectionId)) void this.pump();
```

Typing into a conflicted section updates the preserved local body and returns
without pumping. Only `reconcile()` clears the latch. A section that has been
told "the draft moved elsewhere" therefore cannot overwrite that other truth
by continuing to type — which is the whole point of the refusal.

The debounce is `AUTOSAVE_DELAY_MS = 1200`
(`app/press/manuscript/workingDraftClient.ts`), shared with the continuous
editor; `useSectionWriting.ts:241` uses the same constant.

---

## Recovery rule (still in force)

The text typed during the conflict test was **intentionally not persisted.**
That is the refusal working, not data loss through a bug — but it is also not
saved.

To return to a writable state: reload the page, which establishes the fresh
server version, and deliberately re-enter anything wanted from the refused
local text.

Do **not** clear the latch by hand. Do **not** null `section_addressable_at`
as a cleanup: that disarms both round-trip triggers and permits the continuous
editor to diverge from orphaned section rows. Any real rollback must be
explicit and transactional.

---

## Boundaries this record does not cross

- No production manuscript has been converted to section-addressable form.
- Nothing from this unit is deployed.
- `DESKTOP_SEAM_CHANGED: NO` — Writer's Studio owns the canonical seam;
  Desktop consumes it. This unit reports no seam change.

The next Writer's Studio work is a **new bounded unit**, not a reopening of
the witnessed write path.
