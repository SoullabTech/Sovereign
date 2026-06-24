# Soul Portrait — Provenance Registry

> **Editorial metadata, not part of any gift.** This is the durable audit trail for
> the portrait corpus (Kelly's suggestion, 2026-06-23). It is *never* rendered to a
> recipient — it lives here so that, as the corpus grows, data errors are easy to
> spot before they propagate, and revisions are easy to trace.
>
> The 1963→1969 birth-year error on Heather is the argument for it: a corpus-wide
> view is exactly how that kind of thing gets caught. Scan the columns; anomalies
> jump out.
>
> **Convention:** update the row whenever a portrait is revised (bump the version,
> set Last updated, note what changed). `(confirm)` marks a field not yet verified
> against the original source — never guess; verify or flag.

| Slug | Birth data | Source | TZ verified | Chart | Portrait ver | Last updated | Notes |
|------|-----------|--------|-------------|-------|--------------|--------------|-------|
| **heather** | Aug 8 1969 · 2:43 PM · New Orleans, LA | Astrograph report | **CDT (UTC−5)** | authoritative | v1.0 | 2026-06-23 | Birth **year corrected 1963→1969** from the initial message; the engine's longitude-based tz guess (CST) was overridden by Astrograph; "messenger-builder" read woven; markdown-asterisk render bug caught + fixed pre-deploy |
| **jondi** | Feb 19 1956 · 1:30 AM · Eupora, MS | Astrograph report | CST (UTC−6) | authoritative | v1.2 | 2026-06-22 | v1.1 wove Kelly's "wise woman / healer / collective maven" read; v1.2 softened three over-absolute lines |
| **nathan** | Dec 23 1968 · 2:00 PM · Philadelphia, PA | Astrograph report | EST (UTC−5) | authoritative · engine-verified to the arcminute | v1.0 | 2026-06-22 | Chart independently cross-verified by the in-house engine vs Astrograph (planets, angles, houses, node) |
| **kelly** | Dec 9 1966 · 10:29 PM · Baton Rouge, LA | Astrograph report | CST (UTC−6) | authoritative · engine-verified to the arcminute | v1.0 | 2026-06-22 | Self-portrait (`mode: 'self'`, no giver block); the engine's original verification oracle |
| **andrea** | Dec 31 1969 · 9:06 AM · Boston, MA | Astrograph report | EST (UTC−5) | authoritative | v1.1 | 2026-06-20 _(confirm)_ | De-hedged to the magical register; first literary-mode portrait |
| **katie** | Aug 28 2000 · 1:02 AM · Baton Rouge, LA | Astrograph report _(confirm)_ | CDT (UTC−5) | authoritative _(confirm)_ | v1.0 _(confirm)_ | _(confirm)_ | Pre-session portrait — provenance to confirm against original report |
| **sophie** | Dec 24 2008 · time _(confirm)_ | Astrograph report | _(confirm)_ | authoritative | v1.x _(confirm)_ | 2026-06-18 _(confirm)_ | **Minor** — Mentor/MAIA/memory off, noindex, unlisted. Time/TZ not in file header; confirm |
| **augusten** | Nov 2 2011 · time _(confirm)_ · New Orleans, LA | Astrograph report _(confirm)_ | _(confirm)_ | authoritative _(confirm)_ | v1.x _(confirm)_ | _(confirm)_ | **Minor** — Mentor/MAIA/memory off, noindex, unlisted. Time/TZ not in file header; confirm |

## Field meanings

- **Source** — where the chart data came from (Astrograph report, in-house engine, etc.). All current portraits trace to Astrograph reports Kelly provided.
- **TZ verified** — the resolved birth-time UTC offset. For 20th-century US births this is the load-bearing field (DST patchwork); Astrograph/ACS-atlas resolves it authoritatively. The in-house engine guesses tz from longitude and must *not* be trusted here without confirmation (it would have put Heather on CST).
- **Chart** — `authoritative` once confirmed against Astrograph; `engine-verified` adds an independent in-house cross-check.
- **Portrait ver** — bumped on each substantive prose revision.
- **Last updated** — date of the last revision.

## Open items

- Confirm `(confirm)` fields for the pre-session portraits (katie, sophie, augusten, andrea) against their original Astrograph reports.
- Sophie & Augusten are minors; their portraits carry the strictest posture (no Mentor, no memory, noindex, unlisted) — provenance confirmation is part of that care.
