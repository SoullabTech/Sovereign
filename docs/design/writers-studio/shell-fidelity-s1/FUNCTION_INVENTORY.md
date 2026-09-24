# Writer's Studio — member-facing function inventory (full workspace)

Read-only census, 2026-09-24, against `origin/clean-main-no-secrets` @ `e88688841` (production runtime).
`RSC` = `app/writers-studio/rebuild/RebuildStudioClient.tsx`. Line numbers are orientation at that SHA.

`/writers-studio/rebuild` (`rebuild/page.tsx:25`) mounts RSC with `reviewDiscussEnabled = WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED==='1'`.
`layout.tsx` wraps all routes in `StudioAtmosphere`. Without `?m=` and with >1 manuscript: "Open the rebuild with a specific manuscript." (RSC:397).
Initial section: `s`, else "Chapter 10", else first (RSC:417).

## A · Write room — top bar
| function | where | flag | status |
|---|---|---|---|
| "← MAIA" | RSC:1492 | – | link /maia |
| Mode bar WRITE (active) | RSC:1504 → `studio/StudioModeBar.tsx:116`; modes `studioMap.ts:518` | – | preserves m, s |
| DEVELOP | `studioMap.ts:522` | – | real → /writers-studio/develop |
| EXPLORE · REVIEW · PUBLISH | `studioMap.ts:523-525` | – | **placeholder** — "Not yet available" card; no route |
| "Rebuild preview" | RSC:1513 | – | static text |
| Appearance menu (atmospheres Atelier/Night Study/Forest/Cloud/Midnight; canvas Dark/Paper/Parchment) | RSC:1514 → `atmosphere/AppearanceMenu.tsx:74` | – | real; localStorage + /api/sovereign/studio/atmosphere |
| Report a bug (global) | `components/bugs/BugReportButton.tsx:150` | – | real; POST /api/bugs |

## B · Write room — left panel
| function | where | flag | status |
|---|---|---|---|
| "‹ All Works" (only Work switch) | RSC:1530 | – | link /writers-studio |
| Work card + purpose sentence | RSC:1531-1548 | – | real; /api/sovereign/living-works |
| "Make this a Work" | RSC:1537 | – | real |
| BOOK STRUCTURE tree (member-authored) | RSC:1554-1563 | – | real, **read-only** |
| Unorganized sections list | RSC:1565-1583 | – | navigation |
| Imported-heading structure | RSC:1585-1591 | – | navigation |
| MATERIALS list + "bring in" | RSC:1614-1638 | – | real; only when manuscript belongs to a Work |

## C · Write room — centre manuscript
| function | where | flag | status |
|---|---|---|---|
| Breadcrumb | RSC:1660 | – | display |
| Show editorial layer / Clean manuscript | RSC:1665 | layer actions need EDITORIAL | real |
| Focus toggle (chapter / section / passage) | RSC:1666-1670 | – | local |
| Pure Canvas ↗ (Esc exits) | RSC:1671 | – | presentational |
| Section editor, autosave 1200 ms | RSC:1730 → `rebuild/RebuildAuthoredBody.tsx:62`, `lib/writersStudio/useSectionWriting.ts` | – | real |
| Passage selection → Passage Work | `RebuildAuthoredBody.tsx:41` | – | local |
| Footer words · draft vN · save state | RSC:1771 | – | real |
| Footer "✦ Ask MAIA  Aa⌄  ☷" | RSC:1772 | – | **dead label** — no handlers |
| Mobile tabs Outline / Manuscript / MAIA | RSC:2122-2126 | – | layout |

## D · Write room — right MAIA panel
| function | where | flag | status |
|---|---|---|---|
| "✦ MAIA · In relation to Work" · "•••" | RSC:1783-1788 | – | "•••" dead |
| Gold line (choose among existing keeps) | RSC:1790 → `insight/GoldLine.tsx` | – | real read; choice in localStorage; cannot create keeps here |
| Work on canvas (opens inline layer, not /canvas) | RSC:1791 | – | real |
| Chapter Review / Passage Work toggle | RSC:1794-1796 | – | local |
| Review this chapter (7 lenses) · continue remaining | RSC:1850, 1830 | – | **real cognition**; /readings + /chapter-reviews |
| Lens cards · Every finding · Findings by section | RSC:1855-1970 | – | real |
| Per finding: Work on canvas · Show in manuscript | RSC:1921, 1932 | – | real |
| Per finding: Discuss with MAIA | RSC:1924-1929 | REVIEW_DISCUSS | real; /review-discuss |
| Passage tabs Interpret / Explore / Ask | RSC:2092-2114 | WRITERS_STUDIO_FOCUS_ENABLED | all three send the same `ask_maia` gesture; 404 when off |
| Suggest: Work with MAIA / Continue | RSC:2080-2086 | EDITORIAL | real; /editorial/turn; Sanctuary enforced |
| Suggested revision: Show changes · Side by side · Review in context · Try another · Discuss | RSC:2029-2061 | EDITORIAL | real |
| MaiaListen (TTS read-aloud) | `insight/MaiaListen.tsx:77` | – | real; no voice input |

## E · Inline editorial layer (all server calls need EDITORIAL)
Marked edits Accept / Change it / Why this? / Learn more / Keep mine · compose "Use selected / Use all / Keep all of mine" ·
Revision desk: Work statement, path Notice·Discuss·Try·Decide, depth dial, editing-latitude slider (Touch→Open), Try a revision,
Use this revision (/editorial/adoption), Name + Save version (/editorial/version), Undo (/editorial/undo), version history ·
InsightReadings controls (Talk about this, Choose a passage, Leave as it is, Try a revision, What this reading rests on).

## F · Other routes
- **/writers-studio (Home)** — Begin a new work · Import writing (→ legacy /press/manuscript) · Bring notes & sources · Return to this work · delete Work · Work image · kept lines · history. No flags.
- **/writers-studio/develop** — scope Work/Chapter (Passage permanently disabled) · readings list · custom range · 4 lenses + All · real cognition · "talk with MAIA about this" (/ask) · standing keep/dismiss/unresolved **hidden** unless `NEXT_PUBLIC_WS_STANDING_ENABLED=1` + `WS_STANDING_ENABLED=1`. No Appearance menu.
- **/writers-studio/sources** — upload, transcription review, bring to Work; OCR only with `WRITERS_STUDIO_HANDWRITING_OCR_ENABLED=1`.
- **/writers-studio/canvas** — the **only** structure editor (StructuredOutline) and the **only** "Keep a version"; **unreachable** from Home or the mode bar (only via legacy /press/manuscript).
- **/writers-studio/review** — structure-proposal witness page; no member link.
- **/writers-studio/lab/maia** — founder + flag only; access boundary with no surface.

## G · Flagship components — NOT MOUNTED
`app/writers-studio/flagship/*` (StudioChrome, WriteRoom, WriteFrame, ContextualMaiaPanel, DevelopReview, DevelopViews, ReviewPanels, flagship.css, flagshipTokens.ts)
are imported only by `rebuild/FlagshipWriteHost.tsx` and its helpers, which no page imports; `productionWorkspaceMount.test.ts:17` asserts the rebuild page does not mount it.

## H · Built but unreachable by members
1. EXPLORE / REVIEW / PUBLISH rooms. 2. Flagship set + FlagshipWriteHost chain. 3. Develop standing (flags off). 4. Develop Passage scope.
5. Review Discuss (flag). 6. Passage Interpret/Explore/Ask (FOCUS flag). 7. Suggest + revision desk (EDITORIAL flag; controls render and fail when off).
8. Handwriting OCR (flag). 9. MAIA lab harness. 10. /writers-studio/review. 11. /canvas — structure authoring, Keep a version, WorkConversation, drawers.
12. Creating keeps (legacy /press/manuscript only). 13. Unmounted: AuthorAgencyPreview, StudioMovements, CanvasWorkspace outside Develop.
14. Dead controls in the rebuild room: footer "✦ Ask MAIA Aa⌄ ☷", MAIA "•••", "Rebuild preview". 15. `studioMap` 'later' destinations (Materials, Structure, Notes, Versions, Goals, …) dropped at every member boundary.
