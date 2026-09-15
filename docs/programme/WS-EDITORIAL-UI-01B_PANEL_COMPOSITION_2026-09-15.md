# WS-EDITORIAL-UI-01B · PANEL COMPOSITION

**Branch** `claude/ws-editorial-ui-01` · **base** `a38dc9d13` (UI-01A, CLOSED).

**Status: ONE HEADER · ONE CLOSE · ONE CONVERSATION · BROWSER-WITNESSED 36/0 ·
MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

---

## 1 · The correction, and where its authority came from

⭐ **The repository already answered this.** `StudioPanel`: *"A panel is chrome
around content"*, and its contract owns the band label, whether the panel is
dismissible, and the dismiss control. So a second title bar and a second exit
inside the content were `EditorialConversation` answering a question it was not
asked — not a design disagreement to relitigate.

| | before | after |
|---|---|---|
| band label | `MAIA · conversation` **and** `This passage` as a header | `MAIA · conversation` only |
| dismiss | the panel's `×` **and** the content's `CLOSE` | the panel's `×` only |
| orientation to the locus | inside a title bar | **kept**, as content |

⭐ **"This passage" survives, because the two labels answer different
questions**, and losing the second would cost real orientation:

```
MAIA · conversation   →  what region am I in?     (StudioPanel)
This passage          →  what is this about?      (the content)
```

`EditorialConversationProps` is now `{ threadId }`. The component has no
`onClose`, no `<header>`, and nothing to dismiss.

---

## 2 · Witness — 36 passed · 0 failed, in Chromium

The 01A sequence re-run unchanged, with six composition obligations added at the
point where the room is already open and populated:

- **P1** exactly **one** dismiss control in the conversation region
- **P2** and it is the **panel's** (`Dismiss MAIA · conversation`)
- **P3** the editorial content declares **no `<header>`**
- **P4** "This passage" still orients the member
- **P5** the locus wording is **unchanged**
- **P6** the four turns are **untouched** by the composition change

⭐ The close/reopen leg now exercises the panel's own `×` — which is the point:
there is no longer a second exit to pick between. Every 01A address and
relationship obligation stayed green, including the browser reload and *no
second relationship created*.

Two source obligations added to `canvasEditorialMount.test.ts` (**19 total**):
the panel carries no chrome of its own but keeps "This passage", and the room
hands it no close to hold while the `StudioPanel` above it still dismisses.

---

## 3 · ⚠️ A correction to the UI-01A record

**My attribution of the "Audio enabled" toast was wrong**, and the founder ruled
on it as I reported it — that it belongs to the flag-off `StudioConversation`
path and that fixing it there would turn feature-gate compatibility into legacy
redesign.

⭐ It is an **app-global inline script in `app/layout.tsx`** that unlocks
`AudioContext` on the **first click anywhere** in the application and announces
itself. `StudioConversation` does not raise it. **UI-01B's browser run shows it
in the *editorial* room**, where no legacy surface is mounted — that is the
evidence that settles it. I had seen it only in the flag-off screenshot and
reasoned from *where it appeared* rather than from *where it comes from*.

The disposition does not change — it stays outside this lane — but the reason
does: it is a **global-layout** question, not a legacy-surface one, and it will
not be resolved by legacy retirement. The UI-01A record carries this correction
**in place**, beneath the sentence that was wrong, rather than edited to read as
if it had always said otherwise.

---

## 4 · One observation, reported — ⛔ not changed

The editorial content still draws its own `background` / `border` / `borderRadius`
inside the panel, so there is one inset surface within the panel's surface. It is
no longer two competing **headers** and it satisfies every obligation above, but a
panel-inside-a-panel is still visible in the capture.

⛔ Not touched, because the authorization named the header and the close, and
widening a deliberately tiny visual correction into a surface-treatment decision
is the move this lane keeps refusing. If the ramp should carry that separation
instead of a border — which is what `RULE.quiet`'s own comment argues for
elsewhere — that is a ruling, not a tidy-up.

---

## 5 · Gates

- Browser witness → **36 passed · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions**
- Writer's Studio suites → unchanged and green

## 6 · Standing

**WS-EDITORIAL-UI-01B · COMPOSITION CORRECTED · BROWSER-WITNESSED 36/0 ·
LEGACY PRESERVED AND UNRETIRED · ADOPT CLOSED · MERGE NOT AUTHORIZED ·
PRODUCTION UNTOUCHED.**

⚠️ **Integration note carried, not acted on.** Canonical has advanced to
`8cb640644` while this editorial chain is based through `a2ed3c67d`. ⛔ That is
not a reason to rebase, and this branch is **not merge-ready by implication** —
an eventual canonical merge needs its own integration ruling and re-verification.

Next: the member-authored VersionComposer, then comparison.
