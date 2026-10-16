# Soullab Writer's Studio R40 — Manuscript-first WebKit review

**October 16, 2026 · LOCAL BROWSER-UX FICTIONAL QUALIFICATION PASS · REAL-MEMBER, BACKEND CONNECTION, AND DEPLOYMENT HOLD**

## Why this review exists

R39 qualified a source-only authenticated synthetic member-session + signed Work-key/consent lease + multi-section encrypted Apply/Undo against disposable PostgreSQL 16 and an AES-GCM immutable file vault. That is necessary engineering but does **not** establish how easily a writer can see, choose, Apply, Undo or return to their work.

R40 qualifies a complementary, **browser-only** interaction rehearsal. It is a static fictional Writer's Studio sample, deliberately **not** wired into R39, real MAIA inference or any live manuscript route. It shows what an author would see before any backend grant, so user experience can be reviewed without promoting personally identifiable writing into unqualified services.

## Source custody

- Exact parent: clean committed R39 `ff5cef5d3da7270521e42f6fed5117b734e86334`. Isolated review branch `fix/ws-beta-r40-fictional-webkit-writer-20261016`, worktree `/Volumes/T7 Shield/ws-beta-r40-fictional-webkit-writer-20261016`.
- Earlier incomplete R34 `ws-beta-r34-editorial-webkit-review-20261016` contained local standalone HTML/CSS/JS and WebKit tests, but is separately **uncommitted** and was not modified. R40 copied only these fictional fixture source elements and customized two-section editing and review behavior; it did not replace or patch real UI components.
- New local WebKit server runner `scripts/ops/wsBetaR40WebkitReview.cjs` serves exactly three static assets on a disposable `127.0.0.1` port with `connect-src 'none'` CSP, denies all off-host requests, closes browser/server and removes only its own screenshots-in-temp on completion.
- A separately reproducible **fully offline single HTML** reviewer can be rebuilt using `R40_OFFLINE_BUNDLE_FIXTURE=fictional-only python3 scripts/ops/wsBetaR40BundlePreview.py`. Its explicit `script-src 'unsafe-inline'` is confined to local self-contained file review; `connect-src 'none'` forbids remote model/API requests. No package or deploy hooks promote this artifact.

## What is visually and interactively qualified

- Desktop 1440×900 actual WebKit: three panes **Outline | manuscript | MAIA**, warm paper, larger prose typography, protected quiet chapter layout and non-salmon editorial colors. Two genuine distinct fictional UUID section anchors; author text is not flattened into one long section. The second section is held stable through review, Apply, Undo, reload and browser reopen.
- The target text `lantern glows` is codepoint-anchored to section 1. Three **clearly labeled fictional examples**, MAIA/member in provenance, are optional and lightest-first. The word-level diff uses deterministic tokens and retains unchanged `lantern`, highlighting only `glows → shimmers`. Changed words are escaped when inserted into HTML; Apply is initially disabled and Ignore leaves both sections untouched.
- Apply modifies exactly the chosen words without changing the prefix/suffix/second paragraph; it creates a new fictional revision in sessionStorage. Undo appends a further fictional version restoring exact original words; double-Apply and double-Undo are blocked. A deliberately selected part of section 2 is refused instead of silently treated as the first section's passage.
- Semantic zoom toggles Passage ↔ Context without altering prose. **Both** horizontal dividers resize independently by keyboard arrows **and actual pointer drag**; browser-local preferences survive reload. Reset returns Outline and MAIA to the manuscript-first defaults.
- At 390×844 WebKit mobile emulation, the manuscript occupies **one pane**. Explicit Writing/Outline/MAIA navigation avoids squeezed three columns. Selecting the passage opens MAIA, author Apply/Undo returns to Writing, full sections remain readable, and desktop-only `Reset columns` is hidden. This is **mobile viewport emulation, not physical iPhone Safari acceptance**.
- Screen-reader-oriented baseline includes live status regions, visible focus, pressed states for choices/zoom/tabs, separators with keyboard value labels and no form or auto-apply. It does not amount to a full VoiceOver/WCAG audit.

## Accepted tests, bounded claims

- Browser server review: **38/38 WebKit checks PASS**, desktop and mobile emulation, no external requests; local screenshot staging area removed and browser/server confirmed closed. Private receipt: `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R40_WEBKIT_TWO_SECTION_EDITORIAL_20261016.json` (mode 0600), precommit SHA256 `12fe165e2fea8889d6324dd7da7a8a50ee80afb35161a1929372e5e4fab76935`.
- **Standalone file:// WebKit**: **14/14 PASS** on desktop/mobile emulation, no server, no external network request. Private receipt `R40_OFFLINE_PREVIEW_WEBKIT_20261016.json`, SHA256 `cdb86e94e9d1a6c22d5d574be006beb9ef0883b1e7cb6af87e7b24a850e26e7f`.
- Reproducible self-contained local preview: `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R40_FICTIONAL_WRITER_ROOM_PREVIEW_20261016.html` (18,686 bytes, SHA256 `5e176eaf81422d5f07cd094341982f0404d4e5a6bd818a5180c1294dc9c06400`), safe to inspect with synthetic text only. It contains no external links/scripts/fonts, no real login form, no credential and no actual model requests.
- Actual WebKit screenshots in same folder: `R40_DESKTOP_WRITER_REVIEW_20261016.png` (SHA256 `6a75fa18b99f52d978e51d417d0a77c8fd887bc03bc9bee07b7fb0a368d6904b`) and `R40_MOBILE_WRITER_REVIEW_20261016.png` (SHA256 `07bbeff9618fd08babcf0201dccd9279fdec087aacb073116c642da38ce7ab6c`).
- Source-side safety checks: **11/11 R40 tests PASS**. Combined selected R35–R40 tests: **6/6 suites, 69/69 tests PASS**. Scoped strict `tsconfig.r40-webkit-review.json` **zero diagnostics**. Entire runtime model, production API routes, actual member identity, R39 private signing adapters and SQL migrations are unchanged.
- Repository-wide `tsconfig.ship.json` ran against the combined R39/R40 source: **193 inherited TypeScript diagnostics, exit 2**. Normalized file/error-code/message sequence exactly matches R39, SHA256 `695ea8f398339d681a7882328449e6af9c8f168fa483839911780d6951566908`. **No new errors; NOT a successful enforced Next.js build.**
- The imported local R34 HTML/CSS/JS and explicit R40 adjustments are not an exact copy of the currently deployed production UI; this is **a visual and interaction candidate**, not proof the full Writer's Studio is usable yet.

## How to review locally on the Mac Studio

1. In Finder use **Go → Go to Folder** (Shift–Command–G).
2. Paste `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/`.
3. Open `R40_FICTIONAL_WRITER_ROOM_PREVIEW_20261016.html` in Safari.
4. Choose one option and inspect the changed-word comparison **before** clicking Apply. Apply, Undo and reopen the fictional writing. Try Semantic zoom, adjust the two desktop dividers and Reset.
5. Resize Safari to a narrow viewport to explore the single-pane mobile orientation. **Do not paste real manuscript or confidential member/client material into this fixture.** This is only a local UI study, not the encrypted R39 backend.

## Next acceptance, not silently assumed

1. Bring the exact manuscript-first UI into an **isolated actual Next.js Writer's Studio build**, not a second detached page, while preserving the 3 adjustable columns and mobile single-pane behavior. Visual contract must be measured on realistic chapters, epigraphs, Related passages, Develop/Write/Review, and MAIA conversation continuity.
2. Bind the actual UI selection/alternative click/Undo action to an **independently server-minted, one-time, Work+version+section+passage+consent+choice attestation**. A browser boolean is not sufficient. The live endpoint must invoke R39 only after actual independent key custody and distributed Work revocation fencing are qualified.
3. Migrate existing Source, drafts, revisions, keeps, editorial and derived context away from unencrypted SQL/WAL/logs/backup legacy routes, with approved original-file import, reader rollback and safe encrypted orphan recovery. Historical raw keys in old backups remain an erasure limitation.
4. Qualify actual trusted Safari on the Mac and **physical iPhone Safari**, first invited real-account sign-in/consent, authentic governed MAIA provider, full manuscript and export on one exact release image. Review approved privacy notice, Proton-only invitation transport and founder-governed exact deployment/rollback.
5. Do not activate provider billing, live member flags, data access, public cutover or invite transport as a side effect of this browser preview.

**R40 verdict:** manuscript-first user-facing interaction rehearsal PASS with fictional two-section text in WebKit, including an offline Mac-openable preview; live encrypted authoring UI and real five-person beta remain HOLD.
