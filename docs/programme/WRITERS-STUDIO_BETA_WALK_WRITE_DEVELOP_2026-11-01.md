# Writer's Studio · Beta walk of Write and Develop (2026-11-01)

```
STATUS:    Working record. Local walk only. Nothing fixed, merged or deployed.
CODE:      canonical 7fd479a59 (worktree, verified: server cwd + git rev-parse)
DATABASE:  ws-local-pg / maia_local (verified: SchemaCheck 8 ledger rows)
MEMBER:    kelly-local, admitted through the beta roster (ops_contacts beta_tester,
           writers_studio_beta=true), the same route real beta members use
FLAGS:     EDITORIAL, REVIEW_DISCUSS, FOCUS = 1, mirroring production (read-only
           check of the live container)
PRODUCTION: d49dbc98d, 242 commits behind canonical; canonical is a descendant
```

## 0. Earlier evidence withdrawn

An earlier walk the same day ran against the main checkout
(`fix/account-settings-save-feedback-20261031`, `d74b261c7`, 54 uncommitted entries,
99 commits behind canonical) and the host database (port 5432), signed in as the
founder's own account. Its findings are withdrawn as canonical evidence:

- "Themes 500": the host database lacks migrations `20260926000002/3`. On canonical
  with `ws-local-pg`, `/themes` returns 200.
- "writer-understanding 500": not reproduced on canonical (200).
- "No save indicator": canonical shows Unsaved → Saving… → Saved.
- "MAIA panel covers the editor at 1023px": that layout is not canonical's Write room.

During that walk one section of the founder's ELEMENTAL_ALCHEMY Work (host database)
was edited and restored exactly; it left extra revision rows there.

## 1. Results on canonical

| Element | Result | Evidence |
|---|---|---|
| Sign-in → Studio admission | PASS for roster member; non-roster member is redirected to the public preview page | proxy.ts invitation gate; same gate is in production |
| Studio Home (Return, New Work, Import, Notes & sources, History) | Renders | page text |
| Write: editor, breadcrumb, word count, Previous/Next, Full Canvas | Renders | DOM |
| Write: type → autosave → reload → persists → delete → persists | PASS | Unsaved → Saving… → Saved in ~3s; marker present after reload, gone after removal |
| Develop: Focused / Guided / Full views | PASS, choice persists across reload | select + reload |
| Develop: three starters + "Show more ways to explore" (8 more, incl. "Something feels off") | Renders | DOM |
| Develop Full: nine lenses | All respond; unread lenses say "NOT READ YET"; Themes 200 | network log |
| Relationships route | 404 with flags off (by design); 200 with production flags | route `enabled()` |
| Phone width 375px, Write and Develop | No horizontal overflow; Room dropdown reachable; editor usable | scrollWidth = 375 |

## 2. Findings

**F1 · Duplicate nav entries, two different "Publish" destinations (canonical only).**
With a Work open the nav shows eight entries for six rooms: `Publish` and `Listen`
twice. The `Listen` pair goes to the same place. The `Publish` pair does not:
the mode button opens `?mode=publish` (layout and cover study); the link opens
`?mode=home&publish=1` (Home "Publish · beta preview" panel). With no Work open,
a dimmed `Publish` span says "Open a Work to prepare it for publishing."
Cause: `91c2b84e8` (2026-10-10) added link entries; `732efd162` (2026-10-25) added
`publish` and `listen` to `PRIMARY_MODES` without removing them.
Production has the mode buttons only. `p4r1ProduceFlow.test.ts` pinned the link
("opens the existing Home publishing panel").

**Ruling (founder, 2026-11-01):** "Home publish panel, or whichever is best".
Chosen: nav Publish opens the layout and cover room, as production already does.
Reason: nothing else links into that room, so pointing nav Publish at the Home
panel would have left it unreachable; the Home panel stays reachable from the
Publish button on the Home card. **Fixed** on
`fix/writers-studio-nav-duplicate-publish-listen-20261101`: the three extra nav
entries are removed, `aria-current` follows the active room, and the test now
pins one entry per room. Verified live: six nav entries matching the room
switcher; Publish → layout room, Listen → Listen, Home card Publish → Home panel.
The rewritten test fails on the old Shell and passes on the fix; typecheck
gate 214 vs baseline 214, no regressions.

**F2 · "Guided" names two different things.** Develop's View control uses
Focused / Guided / Full as disclosure depth. FACETS-01 ratified Guided · Learning ·
Direct as a relationship, and declined delivering facets as disclosure depth.
Naming question for the founder. Not changed.

## 3. Not yet walked

Every model-backed act: Talk with MAIA, the starters, "What does MAIA think?",
lens readings, editorial marks and Teach-me, correction, Review. These call
Anthropic with the Work's text and store readings in `ws-local-pg`.
