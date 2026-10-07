# Craftsman's Table R1 — visible mark controls

Date: 2026-10-07
Candidate: feature/writers-studio-craftsmans-table-r1-20261006, local port 3741
Issue: MAIA-SOVEREIGN-c38

## Observed defect

Clicking the proposed deletion of “increasingly” registered in React, but the
controls were below the entire Fire section. The actual Safari viewport was
1003 CSS pixels tall; the controls began at y=1225. The narrowed writing pane
stacked the editorial margin after all surrounding section text. Nothing was
wrong with the writer's click.

## Repair

- Before/after prose is outside the focused paragraph's control row. Controls
  are beside the focus on wide panes and immediately below it on narrow panes.
- Clicking an insertion or deletion reveals the edit controls in the manuscript
  scroll area. A repeated click reveals the controls again rather than doing
  nothing when the same mark is already active.
- Marks support keyboard activation with Enter/Space. Close/Escape hides the
  controls and returns focus to the mark, without accepting the suggestion.
- Compact controls wrap horizontally; the explanatory note follows them.
- No provider, persistence, application, or model-routing code was changed.

## Verification

The new regression suite failed before repair (five failures), including
placement, keyboard activation, repeated-click reveal, and closing. After repair:

- 30 targeted suites passed: 263 tests, zero failed.
- Writer's Studio flagship typecheck passed.
- Git diff whitespace check passed.
- Seven new mounted-component tests cover opening controls, keyboard access,
  repeat reveal, Escape, working-copy acceptance, and author-written alternatives.
- In the existing bound Safari session, activating the mark rendered the full
  control panel at y=716.9–808.9, above the footer at y=937. All choices were visible.
- Both click activation and Enter activation opened the controls without choosing
  the deletion. Actual saved context and editorial thread were compared before
  and after; both were unchanged. Manuscript revision remained 2, the thread
  retained three turns and one MAIA proposal, and application remained null.
- No live Save, Apply, Undo, or model request was executed during this repair.

The existing Amplifying tab is left with the change's controls open. The working
copy still retains “increasingly.” The full manuscript Apply/Undo journey is not
certified by this mark-visibility repair.
