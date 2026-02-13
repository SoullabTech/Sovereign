# Release Ledger

One line per user-facing release. No narrative. This is how learning becomes visible.

| Date | Feature | Scope | Predicted risk | Actual outcome | Accuracy | Decision | Pattern learned |
|---|---|---|---|---|---|---|---|
| 2026-02-12 | Changes/I Ching Oracle | Studio: new oracle + AIN council + studio_changes table | Council prompt drift, hexagram mapping errors | — | — | Ship to beta | — |
| 2026-02-12 | Video Library Phase 1.5 | LabTools: member_videos table + Guides page + admin publisher + explainer scripts | adminSecret leakage in URLs/logs, uncommitted code shipped | — | — | Ship to beta, Guides defaultEnabled:false until aftercare | Shipped uncommitted code - discipline gap |

### Accuracy values

- **Accurate** — prediction matched reality
- **Missed friction** — real friction wasn't predicted
- **Overestimated** — predicted risk didn't materialize
- **Wrong signal** — predicted one thing, something else happened

This column is the calibration engine. Over time it reveals which risk signals matter and which are noise.
