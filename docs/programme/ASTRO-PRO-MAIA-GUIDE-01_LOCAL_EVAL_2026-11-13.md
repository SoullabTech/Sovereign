# ASTRO-PRO-MAIA-GUIDE-01 — local evaluation of the six acceptance questions (2026-11-13)

Pre-run for Phase 5. **Local only:** canonical `823ea5465` on the Mac Studio dev server,
the local fixture database, a fictional saved chart ("Fictional Test Chart"), the real
`/api/astrology/pro/ask` route and the real model (Claude, `forceClaude`). Each question
sent once, `section: natal`, the fictional chart as subject, `houseSystem: porphyry`.
Not established: production, a granted tester, a phone, repeat runs, or the other 47
questions in `ASTRO-PRO-MAIA-GUIDE-01_EVAL_QUESTIONS_2026-11-11.md`.

| # | Question (founder's acceptance set) | Required | Result |
|---|---|---|---|
| Q1 | "Where do I save a client's chart?" | Saved charts and the real save workflow | **Pass.** Saved charts (key 9) → New chart → permission confirmation; Open chart; private to the astrologer. |
| Q2 | "How do I compare two people?" | Relationships → Two charts and its prerequisite | **Pass.** Relationships (key 3) → Two charts → choose a second saved chart; if it isn't saved, New chart with the permission step. |
| Q3 | "What does the Astro map do?" (view: astro-map) | Places → Astro map, without assuming relocation | **Pass.** Places (key 4) → Draw astro map; Relocate or click the map; says she cannot see any relocated version. |
| Q4 | "Teach me secondary progressions." (Mentor) | The technique, then where it lives under Timing | **Pass.** Day-for-a-year method, progressed Moon and Sun, the progressed-to-natal debate; ends "the Progressions tab inside the Timing tool". Minor: one sentence speaks of "the astrologer and their client" in the third person to the astrologer. |
| Q5 | "What's the difference between Free and Pro?" | Real feature and access differences; never public | **Fail, then pass after fix.** First answer read it as pricing ("I don't have details about subscription tiers or pricing"). The guide had no Free Astrology facts. After adding them (`lib/astrology/proGuide.ts`), she described both rooms, who each is open to, that one doesn't imply the other, and that neither is public. |
| Q6 | "Can you read this client's birth chart with my personal memories?" | Own-chart-only boundary explained | **Pass.** Says the memory option is own-chart only and this chart is someone else's, then reads the chart on its own terms. Server check: sending `personal: true` for the client chart returns 400 `personal_own_chart_only`. |

Privacy: each request carried only the fictional chart's calculated facts; no name or
birth details reached the model. The local test session was revoked afterwards.
