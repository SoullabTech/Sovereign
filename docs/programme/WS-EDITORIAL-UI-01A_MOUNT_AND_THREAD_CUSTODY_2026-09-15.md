# WS-EDITORIAL-UI-01A · MOUNT + THREAD IDENTITY CUSTODY

**Branch** `claude/ws-editorial-ui-01` · **base** `4013dd9e0` (UI-01, server/data surface PASS).

**Status: MOUNTED · WITNESSED IN A REAL BROWSER 30/0 · SCREENSHOTS TAKEN ·
MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

> ⭐⭐ **Server state preserves the conversation. An address preserves which
> conversation you mean.** Those are different responsibilities, and UI-01
> conflated them.

---

## 1 · The flag: the fourth answer, taken

`app/writers-studio/canvas/page.tsx` is now a **server component** that reads
`WRITERS_STUDIO_EDITORIAL_ENABLED` exactly once and hands down a boolean. The
room moved to `CanvasClient.tsx` — `git mv`, unchanged but for its signature.

⛔ Refused, each for its own reason and each pinned by a test:

| refused | why |
|---|---|
| a `NEXT_PUBLIC_` mirror | a second independently-settable source of truth for one fact; two copies can disagree invisibly |
| **404** read as "disabled" | a client inferring **policy** from **transport** — the same family as inferring an act from prose |
| a feature-status API | a new endpoint, a new ontology, a second thing to keep in step |

⭐ **The boolean is presentation state, not authorization.** Editing it in the
browser changes which surface is drawn and grants nothing: both editorial routes
re-read the real server flag. `false` is not a degraded editorial panel — it is
the **existing** `StudioConversation`, untouched.

---

## 2 · The thread identity gap, closed

⭐ The opening act is now the member's **Conversations gesture**, in the room —
⛔ never a mount effect. `EditorialConversation`'s props narrowed to
`{ threadId, onClose }`: it can read `…/thread` and speak into `…/turn`, and it
has **no POST to the thread seam at all**.

The address is `?editorialThread=<uuid>`, written with
`canvasWithEditorialThread` beside the manuscript's own `?m=`, which it
**preserves**. ⛔ It is an address, not authority — witnessed: another member
holding the exact uuid gets **404**.

⛔ **No ranking, no "latest thread", no inferred relationship.** The schema
admits many threads per chain, so *the* thread is not a lawful question. When the
room is enabled and nothing is addressed it **says what is missing** rather than
choosing a passage on the writer's behalf.

---

## 3 · The witness — a real browser, 30 passed · 0 failed

`scripts/witness/ui-01a-mount-witness.ts` — Chromium via Playwright against a
disposable cluster, a real `maia_session` cookie, provider substituted at the
wire only.

```
select a section → click Conversations → URL receives the exact editorialThread
→ visible locus is the selected passage → "Could you make this quieter?"
→ You + MAIA visibly persist → explicitly mark a Direction
→ MAIA's candidate appears as MAIA's, not applied
→ close → reopen → same four turns → RELOAD → same four turns
→ boot again with the flag ABSENT → legacy conversation still there
```

⭐⭐ **The reload is the leg that matters.** UI-01's witness kept the thread id
in a variable; that proves a *known* thread can be reread. A browser reload
destroys every component, closure and module instance in the page. What survives
is the address bar and the database — which is exactly the division of
responsibility this act establishes. `R3` adds the other half: **the reload
opened no second relationship.**

Also witnessed: `A3` the room creates nothing merely by rendering · `G3` exactly
one relationship, not one per render · `C4` reopening creates nothing · `D4` **the
Work is untouched** — the passage still reads as the writer wrote it · `F3` the
closed room creates nothing.

Screenshots: `01-room` · `02-opened` · `03-spoken` · `04-directed` ·
`05-reopened` · `06-after-reload` · `07/08-flag-off`.

---

## 4 · Instruments, and the mutants they were falsified against

`app/writers-studio/__tests__/canvasEditorialMount.test.ts` (17) and five new
round-trip obligations in `canvasIdentity.test.ts`. These are **source
assertions** and are named as such: they establish WHERE a responsibility lives,
which no single behavioural pass can — a room that opens a thread once and a room
that opens one per render look identical from the outside on one run.

Nine known-bad mutants, each killed by its named obligation:

| | mutant | dies on |
|---|---|---|
| M1 | open from a render (the UI-01 defect restored) | does not open from an effect |
| M2 | the panel may mint its own relationship | requires a threadId / issues no POST |
| M3 | mount unconditionally, ignoring the flag | false is the existing room |
| M4 | a scanner left pointing at the emptied page | the room is where its scanners look |
| M5 | a `NEXT_PUBLIC` mirror | mirrors the flag into no second name |
| M6 | the address drops every other parameter | PRESERVES the manuscript identity |
| M7 | a most-recent thread lookup | ranks nothing and guesses nothing |
| M8 | the room opens without a locus | refuses to open without a locus |
| M9 | one suite left behind by a future split | leaves NO suite at the old path |

---

## 5 · ⚠️ Five defects of my own, recorded

**(1) My mutant harness destroyed live work.** `git checkout -- <path>` restores
from the **index**, and after a staged `git mv` the index held the *pre-edit*
content — so each "restore" reverted past the mutation to the original room. Four
files of UI-01A were lost and re-applied. ⭐ Later mutant rounds copy files aside
and restore from the copy, and the clean state is re-run at the end to prove it.

**(2) The split stranded eight suites I did not find.** Three named the path as a
literal and were repointed; **eight more** built it with
`join(__dirname, '..', 'canvas', 'page.tsx')` and a grep for the literal could
not see them. They failed loudly — but only because their assertions were
positive. ⭐ The guard now **scans the directories** rather than a list, so the
list cannot go stale; M9 proves it bites.

**(3) ⚠️ THE C21 CLASS, SEVENTH OCCURRENCE.** That scanner's first run reported
**itself**: this file names the old path in its own prose and again in its
falsifier. Remedy as always — strip comments, and the scanner does not scan
itself. Both exclusions are explicit in the source.

**(4) A vacuous obligation, caught by a failing run.** `G1` compared the URL's
thread id to the database's and **passed on a run where nothing had been
created** — `null === null`. An identity assertion whose both sides can be absent
asserts nothing. `G0` now proves both are present first.

**(5) Two readiness defects, both instrument, both visible only in a browser.**
The witness waited for the rail word "Conversations" and screenshotted a shell
whose Work had not resolved — the rail is painted before the member's material
arrives. And `transcript()` asserted `startsWith('You')` against a panel
correctly displaying **`YOU`**, because `panelLabel` uppercases in CSS and
`innerText` returns *rendered* text; `MAIA` passed by luck, which made a
one-sided instrument bug look like a product defect.

⭐ **And one accidental confirmation worth keeping.** A first run sent an
envelope kind the contract does not declare (`version_offer` — my error). The
room **refused it, persisted the member's Direction anyway, and told the writer
"Your words are saved. MAIA could not answer this time."** The honest-failure
path was witnessed before anyone asked for it.

---

## 6 · Two visual observations, reported — ⛔ not repaired here

Both come from the screenshots and neither is a data-path question.

1. **The conversation panel carries two headers and two closes.** `StudioPanel`
   renders `MAIA · CONVERSATION ×` and `EditorialConversation` renders
   `THIS PASSAGE  CLOSE` directly beneath it. Which header owns the close
   affordance is a composition decision, not a fix to make silently.
2. **The legacy room still raises an "Audio enabled" toast.** Voice is absent from
   the editorial surface as required; it is `StudioConversation` that brings it.
   Named because legacy retirement is held, not because it is this cut's defect.

   > ⚠️ **CORRECTED 2026-09-15 BY WS-EDITORIAL-UI-01B, AND THE ATTRIBUTION ABOVE
   > IS WRONG.** The toast is an **app-global inline script in
   > `app/layout.tsx`** that unlocks `AudioContext` on the FIRST CLICK ANYWHERE
   > and announces itself. `StudioConversation` does not raise it. UI-01B's
   > browser run shows it in the **editorial** room, where no legacy surface is
   > mounted — which is the evidence that settles it. I had seen it only in the
   > flag-off screenshot and reasoned from where it appeared rather than from
   > where it comes from. Still outside this lane, but for a different reason:
   > it is a global-layout question, not a legacy-surface one. Left in place
   > above rather than edited, so the mistaken reading stays visible.

---

## 7 · Gates

- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**
- Writer's Studio suites → **857 passed · 0 failed** (baseline before this act:
  836; the 21 added are this act's own obligations)
- Browser witness → **30 passed · 0 failed**

---

## 8 · Standing

**WS-EDITORIAL-UI-01A · MOUNTED · BROWSER-WITNESSED 30/0 · ADDRESS CUSTODY
ESTABLISHED · LEGACY PRESERVED AND UNRETIRED · ADOPT CLOSED · VOICE ABSENT FROM
THE EDITORIAL SURFACE · MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

Held for a later act: member VersionComposer · comparison · Adopt · legacy
retirement · the two visual observations in §6 · canonical merge and production.
