# Platform knowledge — Astrology and Astrology Pro evidence (2026-11-11)

Evidence for the Astrology entries and `PLATFORM_ASTROLOGY_PRO_GUIDE` in
`lib/sovereign/platformKnowledge.ts` (version 0.6.0). Each claim MAIA carries is
listed with where it was verified.

The file's header names `docs/architecture/PLATFORM_KNOWLEDGE_AUDIT_2026-07-16.md`
as the evidence register. That file is not present on canonical as of this date,
so this note records the Astrology evidence on its own. Restoring or replacing the
register is a separate task.

## Method

- Source read on canonical after PR #2228 (merge `f532f9d9f`).
- Local walk of `/astrology/pro-preview` on 2026-11-11 with a fictional saved chart
  at 1440×900 and 375×812, on code whose astrology paths matched production
  `089f6d98b`.
- Not established: production witness of the wording, a real phone, or how the
  model actually phrases these facts to a member.

## Claims

| Claim | Evidence |
|---|---|
| Astrology room is open only to invited testers; non-testers see no door | `lib/astrology/testerGate.ts` (founder admission 2026-10-30; proxy returns a hard 404 for non-testers); `docs/design/contracts/astrology-tester-gated-links.md` |
| Astrology Pro admits only individually granted members; not a tier or subscription | `lib/astrology/proAccess.ts` ("The tester flag, an allowlist, a tier claim or a subscription never" admit); grants in `astro_pro_tester_grant_events` |
| Status bar shows chart name, house system, sky now | `ProAstrologyExperience.tsx` header; walk |
| Nine tools on a rail, keys 1–9, panels beside the wheel, newest in hand and others folded | `ProAstrologyExperience.tsx` (`tools`, `openTool`, key handler); walk |
| Divider resizes wheel and panels | `ProAstrologyExperience.tsx` (`divider`, `resizeStage`) |
| Chart: point, Explore, My notes, Aspects, Views, Houses | `tools` tabs `chart`; walk |
| Timing: transits with step/play/live clock, Progressions, Ephemeris | `tools` tabs `timing`; walk |
| Relationships: Two charts, Questions | `tools` tabs `relationships`; walk |
| Places: astro map, relocation | `ProAstroMapPanel.tsx`; walk |
| Traditions: Vedic profile/dasha/planets, Chinese pillars/zodiac/ten-year cycles, Mayan count/path/signature/today | `ProSystemsPanel.tsx`; walk |
| Readings: Deep reading (optional life notes), Soul Portrait, Tradition report | `tools` tabs `readings`; `ProDeepReadingPanel.tsx`; walk |
| Research: positions, chart vs geometric house, motion, aspects | `ProResearchWorkbench.tsx`; walk |
| Study: five foundations lessons and one technique lesson per tool | `ProStudyWorkbench.tsx`; walk |
| Saved charts need permission attestation; only the astrologer sees them; delete is permanent | `ProSavedCharts.tsx` (attestation checkbox, header comment); walk |
| Share with client: view-only link, needs the client's agreement ticked, can be turned off | `ProChartShareAction.tsx`; walk |
| MAIA in Pro gets calculated facts only on asking, no name or birth details, nothing kept | Dock copy in `ProMaiaDock.tsx` / `ProAskMaiaPanel.tsx`; walk |
| Ask, Mentor, Brief/In depth, Draw on all systems (progressions, Four Pillars, Maya count) | `ProAskMaiaPanel.tsx`; walk |
| Own chart with kept memory, only when chosen per conversation | `docs/design/contracts/astrology-pro-preview.md` (founder ruling 2026-11-09); `ProAskMaiaPanel.tsx` |
| Limits: accuracy not certified; >66° latitude unsupported; some historical time zones; mean nodes; birth-time source not established | `ProResearchWorkbench.tsx`, `ProSavedCharts.tsx`, method panel in `ProAstrologyExperience.tsx` |
| MAIA cannot see charts from the main conversation | R4F hold #1817; the Pro dock does not use the main conversation (contract "Contract drift") |
