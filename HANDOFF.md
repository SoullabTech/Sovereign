# HANDOFF — Writer's Studio experience rebuild

One path. Everything the driving session needs, and the three traps it cannot
see coming.

Branch `claude/great-lovelace-4e1q14`. Production frozen at `ae27205d9`.
Nothing here has been deployed. No product source was modified — the branch is
seven additive files.

---

## 1 · what the founder asked for

Verbatim, and it is the acceptance criterion, not a feature list:

> *I can't directly select sections I want to work on. I can't ask Maia to
> review the chapter fully first and work with me on her findings, that is what
> I want.*

Two things, and the second one is the harder one:

- **selection** — the writer picks the locus; the system binds to it.
- **chapter review producing findings the writer then works through with MAIA**
  — findings are durable objects, not chat text that scrolls away.

A rebuild that lands (1) and not (2) has not met the ask.

## 2 · read these, in this order

```
docs/programme/
  WS-EXACT-PASSAGE-LOCUS-01_FINDING_2026-09-16.md        the failure, causally
  WRITERS-STUDIO-EXPERIENCE-REBUILD-01_CHARTER_...md     mandate + the law
  WRITERS-STUDIO-EXPERIENCE-REBUILD-01_PACKAGE_...md     autopsy · salvage ·
                                                         focus · interaction ·
                                                         screens · build plan
  WRITERS-STUDIO-EXPERIENCE-REBUILD-01_TARGET_STATE_...md  four mockups in full,
                                                           plus part-two states
lib/writersStudio/focus/
  studioFocus.ts            Phase 1 — the one Focus
  outlineTree.ts            Phase 1 — book-shaped outline, degrades to flat
  __tests__/focus.test.ts   12/12 green under jest
```

The finding supersedes the earlier one-line reading that the click "jumped".
It did not jump. **Three quantities were in play and only one was on screen**:
what the rail highlighted (`199`, a scroll observation), what the member
believed they had selected (`198`), and what editorial actually bound to
(`writing.activeId` — the section last opened in *Section* view, possibly
`null`). The movement 198→199 was the scroll observer settling, coincident in
time. The click's own defect is worse than the movement: it bound to a passage
that was never on screen in either state.

Read-only production SQL confirmed **nothing was persisted** by that click.

## 3 · three things that save real time

**The Focus already exists server-side.** `/api/writers-studio/focus` has
accepted `workRef · scopeKind(whole_work|section|passage) · sectionRef · range ·
gesture` all along — governed, server-reads-the-text, founder-flagged off. The
live `/editorial/*` lane was built beside it speaking sectionId-only: no scope,
no range. That dialect is why *"this passage"* could not be expressed. Phase 1
is largely making the client speak a vocabulary that already exists.

**Two id namespaces. This is probably position-0.** `manuscript_sections.id`
(Source — what disclosure and provenance speak) versus
`manuscript_draft_sections.id` (navigation, save queue, editor). Identical-
looking uuids on objects that both have a heading and a position.
`outlineRows.ts` documents that mixing them **fails silently** in three places.
A field named `sectionId` cannot say which it is. `StudioFocus` carries both by
name, and `focusRequest()` **refuses rather than downgrading** when the Source
row is missing.

**WS2-08 08B is no longer a blocker.** The hierarchical outline needs depth and
08B is on hold. `outlineTree` degrades to flat where no confirmed depth exists
and infers none — so the rebuild proceeds without a founder act, and 08B becomes
an enrichment rather than a gate.

## 4 · three traps

**Chapter Review requires a governed schema act, and merging it is itself the
authorization.** Adding `chapter` as a scope means widening a CHECK constraint
on the disclosure boundary; findings need new tables. Per the 2026-09-07 finding
in `CLAUDE.md`:

> merging a migration to `clean-main-no-secrets` is latent schema-deploy
> authorization — the next unrelated full deploy applies it.

That is how the I0.5 Circle migrations reached production unauthorized. Know it
**before** writing the migration, not after.

**Three gates reject work that looks finished.**

```
npm run typecheck        no-regression vs typecheck-baseline.json.
                         Green means "not worse", NOT "typechecks".
scripts/verify-constitution-colab.ts    33 passed · 0 failed, mandatory
                                        before any tester wave
Dockerfile deploy-lane tripwire         a bare compose build FAILS.
                                        Deploys go through
                                        deploy-production.sh <SHA> only
```

Also: the project is **Jest, not vitest**.

**`WRITERS_STUDIO_FOCUS_ENABLED` has never been on in production.** When the
rebuilt slice first runs, passage-scoped cognition executes against a real
member for the first time ever. Expect first-run defects there, not just wiring
bugs.

## 5 · build plan, unchanged

Each stage is a founder act. **Zero founder testing before E4.**

- **E0** census — every read/write of `activeId` / `wholePlaceId` / editorial
  `sectionId`. Read-only. Names the blast radius.
- **E1** Focus beside — written by both surfaces, read by nothing. Prove it
  agrees with the rail in both views, automatically.
- **E2** readers move — editorial first, since it is the one that is wrong.
- **E3** remove — mode, toggle, affordance, chooser, lower band.
- **E4** three regions, then the founder writes for twenty minutes.

Verification is the session's own: unit, static, browser automation. The founder
is asked for a product decision only where one genuinely exists — MAIA inline
versus beside — and never for SQL, routes, ids or witness output.

## 6 · the regression witness that would have killed 2026-09-16

None exists today. `canvasEditorialMount.test.ts` asserts the panel renders
`This passage`, with the room in Section view. The missing mutant:

> enter editorial with `view === 'whole'` and `writing.activeId` different from
> `wholePlaceId` — a conforming room binds to the observed place or refuses.

Land that before the repair, or the repair proves nothing.

## 7 · two corrections to carry

- Chapter 10 is **198–221, 24 sections**. The `262` in the mockup is a
  placeholder.
- The suggested-revision card has **two** presentations behind `Show changes`
  (side-by-side, and inline with insertion highlighted), not one.

## 8 · single writer

PR #1239 cost half a day when two lanes wrote one branch, and the ruling was
single-writer. Same applies here. If another session drives the rebuild, it owns
this branch outright and every other session is read-only on it.
