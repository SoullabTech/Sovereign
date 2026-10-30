# Writer's Studio · R10 merged interface · founder walk findings (2026-10-29)

Source: branch `fix/writer-r10-interface-reconcile-20261029`, local dev server, fictional account,
founder's own *Elemental Alchemy* text imported as pasted text (12 sections, lossless).
Status: WORKING NOTES — founder observations, not acceptance, not a release record.

| # | Finding | Where | Status |
|---|---------|-------|--------|
| F1 | "Listen" tab clipped in Develop and Review (not Write) — the Studio nav shrank because the Work picker would not | top bar | CSS fix applied (`full-redesign-review.css`): tabs keep natural width, Work picker truncates. Needs founder confirmation on the signed-in Studio. |
| F2 | The control for telling the Studio how to work ("MAIA, show me fewer choices" box) is only inside the small **Preferences** popover; nothing on the page points to it | top bar → Preferences | OPEN — design decision (visible entry point on Develop). |
| F3 | "Talk with MAIA about this" is greyed with a reason below ("Your Work needs to be opened before a conversation can begin") that does not say how to open it | Develop, Focused view | OPEN — copy/affordance decision. Reproduced when the Work is reached by direct URL without Home → Return to this work. |
| F4 | Top bar is crowded: ~11 controls on one row (tabs, Preferences, Theme, text size, Manuscript, MAIA, Reset widths, Work picker) | top bar | FIX APPLIED at founder direction: tabs, Preferences, **View** menu and Work picker stay in the bar; Theme, text size, Manuscript/MAIA panel toggles and Reset widths moved into the View menu (`Shell.tsx`, `full-redesign-review.css`). Verified on the fixture route at 1500px; needs founder confirmation on the signed-in Studio. |
| F5 | Original-file upload is refused with an explanatory panel ("temporarily restricted … Source encryption, account ownership, and deletion-safe recovery must be qualified") — deliberate custody design in the lane source | Home → Upload manuscript | BY DESIGN in this source; paste import used for the walk. |

Not tested in this walk: live MAIA (provider off), Save/Undo through the lane's journey, two-member isolation, Publish and Listen content, mobile widths.
