# PC3-LIVE-00 — COMPLETE CONVERGENCE CENSUS + PROGRAMME SUCCESSION + ENVIRONMENT OPTIONS · RESULT

**Act:** `PC3-LIVE-00 — COMPLETE CONVERGENCE CENSUS + PROGRAMME SUCCESSION + ENVIRONMENT OPTIONS ONLY`
**Packet:** `PC3-LIVE-00_EXECUTION_PACKET_2026-09-24.md`, SHA-256 `b3364d383c9609aa511ae1884160f83b0a20f5fe54f6b28836f7de846d67bb81`, 9,384 bytes, 109 lines. Verified two ways:
- the founder's upload;
- transport commit `3acac74e1813759bd1c6651f859c10c4372ec4c6` on `chore/pc3-live00-packet-transport-20260924`. Its parent is exactly `e8868884` and it adds one file, which matches the upload byte for byte.

The transport branch was not merged.

**Canonical inspected:** `clean-main-no-secrets@e886888416062c7fcbcf899040e3827bc8013835`. I re-read the ref at census time; it has **not moved**, so there was no rebind.
**Founder-accepted experiential target:** `976dd1b5e0476fad8e71d4abce788ee17b5fe43d` (PC3-S3 PASS; not merged, not deployed). I read it only through `git diff`/`git log` against canonical.
**Method:**
- I exported the canonical tree with `git archive` into a scratchpad and read it there. No Sovereign branch was touched.
- Four sweeps ran in parallel: Write/place, Develop/Review/MAIA, programme succession, and EA isolation.
- Every consequential claim below was re-read at source by the census author before inclusion. Sweep claims I did not re-verify are marked *(sweep)*.
- No code or Sovereign document was edited. I made no commit, branch, merge, deploy or migration. I made no production contact, created no Work, and exported no manuscript. I read no corpus chunk and no Elemental Alchemy prose.

---

## 0. Evidence ceiling (read this first)

**No lawful runtime existed for this census.**
- In this environment: no PostgreSQL instance responds on `:5432`, the Docker daemon is not running, and `DATABASE_URL` is not set.
- Packet §2 does not require one to be provisioned, and forbids install, migrate, seed, Work-copy or export to obtain one.

**Consequences:**
- **Every row in this census rests on STATIC/CODE evidence** (source, schema, migrations, tests, programme records, git history). **Zero rows are LIVE.** That is the packet's evidence ceiling, not a failing census.
- Per packet §3, a runtime-dependent behaviour traced from source is **at most PARTIAL** when the producer is established, and otherwise **UNKNOWN**.
- **WITHHOLD** is used only where the source itself establishes that no truthful producer supports the claim. It is never used for "not witnessed".

Evidence-class codes used below:
- **S-CODE** — source read by the census author.
- **S-TEST** — a test file that exercises the real code (named).
- **S-STR** — a test that only checks source strings with `readFileSync`/`toContain`, and proves nothing about behaviour.
- **S-REC** — a programme or design record in canonical.
- **S-GIT** — git history.
- **S-DEP** — installed dependency source (Next 15.5.11 in `node_modules`, matching the lockfile pin `^15.5.11`).

---

## 1. Headline findings (whole-map read; no single row decides architecture)

1. **The live Write room is `RebuildStudioClient`, not the flagship host.**
   - `app/writers-studio/rebuild/page.tsx:1-30` ("RESTORATION 2026-09-23") mounts `RebuildStudioClient` again.
   - This came through PR #1501 (`e88688841`, the canonical tip) after PR #1498 (`2703cc309`) had merged the flagship lineage (S-GIT).
   - Every flagship-runtime surface is now **orphaned in the live composition**: the R1-1B review mount, R1-2 exact return, R1-1C navigation, C1C1 contextual MAIA, `CoverageLine` and `FacetControl`.
   - The frozen R2-2 laws still pin the orphaned host (*(sweep)* `tests/constitutional/writers-studio/flagship-r2-2/laws.ts:20`).
2. **Three sequencing authorities exist, and PC3 appears in none of them.**
   - `WRITERS-STUDIO-NEXT-01` is ratified as *the* sequencing authority. It supersedes CONVERGENCE-01 steps 2–8 (`WRITERS-STUDIO-NEXT-01_A0_…CONSTITUTION_2026-09-22.md:174,189`, S-REC). CONVERGENCE-01's laws L1–L8 remain binding.
   - `FLAGSHIP-RUNTIME-CONVERGENCE-01` has no charter and cites neither of the others.
   - Canonical has **no PC1/PC2/PC3 record**. PC3's authority lives in JARVIS custody and on the unmerged `976dd1b5` lineage.
3. **Two design authorities in canonical bear directly on PC3.**
   - `FLAGSHIP_VISUAL_CANON_v2.md:9`: "A functionally correct candidate that materially resembles the pre-flagship Writer's Studio fails visual acceptance."
   - `HOME_ARRIVAL_AND_OBSERVATION_ADDRESS_RULING_v1.md:39,41,117`: "Remove `Home` from live Writer's Studio navigation…", "Do **not** build an improvised Home room…", "Do not assume the word `Home` survives this review."
   - PC3-S2 is a *fixture* Home. It violates nothing live, but its live convergence would have to reconcile with that ruling.
4. **The Write substrate is real and partly unsafe for serious writing today (static).** Save acknowledgement exists but "Saved" is never said. "draft vN" counts server writes. After one version conflict, every later save in the session stalls silently. There is no unload guard. Place survives only in the URL and as "last-saved section". A hard-coded `/^Chapter 10\b/` default is the reopen place when no `?s` is carried.
5. **Develop and Review can be cut off by Write (static).** Live section saves insert no revision. Reading capture refuses `revision_not_current` whenever the latest revision differs from the draft. The Write room has no Keep a version or checkpoint control. So the **Write → Review/Develop loop has no in-Studio producer that clears the refusal** once the member edits.
6. **The EA governed-corpus isolation question stays open.** See §8. Static evidence cannot prove runtime unreachability.

---

## A. Convergence truth map

Columns follow packet §12A. **Truth status** records what the source establishes about the claim. **Classification** is LIVE / PARTIAL / WITHHOLD / UNKNOWN. **Environment** names where the missing witness could lawfully be obtained (see §C). `RSC` = `app/writers-studio/rebuild/RebuildStudioClient.tsx`.

### A1. Work, manuscript, structure

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Work identity entering Write | `?m` param (RSC:292); if absent, `GET /api/sovereign/manuscripts` and **error unless exactly one manuscript** ("Open the rebuild with a specific manuscript.") | URL only; manuscript = `member_manuscripts` row, ownership-checked in `rebuild/context/route.ts` *(sweep :46-52)* | Reload keeps `?m`. No stored "last Work" | S-CODE | RSC:388-399 | Producer exists; zero or several manuscripts with no `?m` → error | Home links | E1 | **PARTIAL** |
| 2 | Work ⇄ manuscript relation | `living_works` + `living_work_expressions`; `resolveWorkContext` → none / work / ambiguous; room says "will not choose one for you" | DB | — | S-CODE *(sweep)* | `workContext.ts:61-72`; RSC:471-507 | Honest refusal on ambiguity. **But** Home `manuscriptIdOf(work)` silently takes the first expression (*(sweep)* `homeState.ts:56-58`) | — | E1 | **PARTIAL** |
| 3 | Section identity | `draftSectionId` = `manuscript_draft_sections.id`; `sourceSectionId` → immutable `manuscript_sections`; headings not editable | DB | Stable across reload | S-CODE *(sweep)* | context `route.ts:73-96`; `saveSection.ts:24-31,189-191` | Real | — | E1 | **PARTIAL** |
| 4 | Chapter / section rail | Authored tree (`/structure`) → else imported tree → else "No book hierarchy is established…" | DB (`manuscript_structure_units/members`; source `heading_depth/signal`) | Re-fetched per load | S-CODE *(sweep)*; S-TEST `rebuild/__tests__/model.test.ts` (real `chapterSpanFor`) | RSC:429-440, 1555-1605 | Real, honest fallbacks; imported tree cannot become authored | Structure editing is Canvas-only | E1 | **PARTIAL** |
| 5 | Whole-Work view in Write | none — pane shows a chapter span or the focused section only | — | — | S-CODE *(sweep)* | RSC:1700; `rebuild/model.ts:22-60` | No producer in Write (Canvas has one) | — | — | **WITHHOLD** |
| 6 | Chapter label in fixture ("Chapter 6 — The Current Changes") | `CHAPTER n` only for a confirmed depth-1 chapter root, else "SECTION · STRUCTURE NOT YET CONFIRMED" | — | — | S-CODE (CR0, re-read) | `rebuild/model.ts` | A truthful label producer exists, conditioned on structure | authored structure | E1 | **PARTIAL** |

### A2. Place, movement, reopen

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | In-session current place | `focusId` + `replaceAddress` → `replacePlaceAddress` → `history.replaceState(window.history.state, …)` | URL `?s` in the current tab only | — | S-CODE; S-DEP | RSC:691-699; `lib/writersStudio/placeInWork.ts:100-105` | Real. **Correction to CR0:** section clicks do **not** refetch or remount. Next 15.5.11's patched `replaceState` bypasses router sync when the state carries `__NA`, which Next writes into every state (`node_modules/next/dist/client/components/app-router.js:98-104, 324-333`). So `useSearchParams` keeps its arrival value | Next `__NA` internals (framework-version coupling); a Next router refresh may rewrite the bar to `canonicalUrl` (*(sweep)* `app-router.js:106-113`, trigger untraced) | E1 | **PARTIAL** |
| 8a | **Chapter 10 — static mechanism** | `requestedRow ?? chapter10 ?? sections[0]`, where `chapter10 = sections.find(s => /^Chapter 10\b/i.test(s.heading ?? ''))` | — | Used on every load without a matching `?s` | S-CODE | RSC:414-419 (quoted in sweep A §d, re-read) | **Established.** A hard-coded heading literal chooses the arrival place. No depth check (any heading level). "Chapter 100" is not matched. No match → first section. It is not the member's place | — | — | **WITHHOLD** (as a producer of *the member's place*) |
| 8b | **Chapter 10 — actual reload / reopen behaviour** | — | — | — | none | No runtime available | **Unwitnessed.** Which section a real reload or reopen lands on, for a real manuscript, is not observed. Whether a "Chapter 10…" heading exists in any member manuscript was not examined (reading manuscript prose is forbidden) | runtime witness | E1 (synthetic manuscript with and without a "Chapter 10" heading) | **UNKNOWN** |
| 9 | Same-tab reload | the replaced URL still carries `?s`, so `load` resolves `requestedRow` | URL | Returns to the section. **No scroll-to on load** (`scrollIntoView` only on clicks/insight: *(sweep)* RSC:777,796,1319,1360) | S-CODE | RSC:414-418 | Producer established; runtime unwitnessed | #7 | E1 | **PARTIAL** |
| 10 | Stale `?s` | not rewritten; `resolveInitialSection` (which returns `rewriteLocation`) is unused by the room | URL | A stale `s` → Chapter 10 / first section, and the false `s` stays in the address and **travels into other modes** via `StudioModeBar` | S-CODE *(sweep)* | `placeInWork.ts:48-56`; *(sweep)* `StudioModeBar.tsx:53-55,64` | Established defect | — | E1 | **WITHHOLD** (for "robust place") |
| 11 | Reopen the Work later (from Home) | Home "Return to this work" hero adds `s` only when `/locus` reports a **distinct** latest `manuscript_draft_sections.updated_at`; every other Home link carries `?m` only | DB `updated_at` (written by saves / adoption only) | Reopen = **last-saved** section, or Chapter 10 / first on a tie or when entered from any other link. Navigating without typing records nothing durable | S-CODE *(sweep)*; abstract rule S-TEST `sectionActivity.test.ts` | *(sweep)* `HomeView.tsx:152-164,874-1241`; `lib/writersStudio/sectionActivity.ts:61-88`; `saveSection.ts:193-195` | Last *saved* ≠ last *place* | durable member-place substrate — unprefixed `OBSERVATION-ADDRESS-01` A0 found "Member relationship place ⛔ NONE", "B-I runtime persistence ABSENT" (S-REC) | E1 | **PARTIAL** (last-saved) / **WITHHOLD** (last-place) |
| 12 | Previous / Next | none anywhere in `app/writers-studio` or `lib/writersStudio` (non-test) | — | — | S-CODE *(sweep; CR0 same)* | search result | No producer | — | — | **WITHHOLD** |
| 13 | Orientation breadcrumb / "Back to manuscript" | `PlaceInWork.tsx` + `placeCrumb.ts` exist, **imported nowhere** | — | — | S-CODE *(sweep)* | grep | Orphaned substrate | — | — | **WITHHOLD** (live) |

### A3. Editing, saving, version, recovery

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 14 | Editor mutation | `RebuildAuthoredBody`: `<textarea>` while editing, `role="textbox"` div at rest; `onChange` → `writing.editSection` | memory → queue | — | S-CODE *(sweep)* | RSC:1737; `RebuildAuthoredBody.tsx:59-158` | Real, plain text | — | E1 | **PARTIAL** |
| 15 | Autosave / save semantics | 1200 ms per-section timer; flush on blur, `pagehide`, `visibilitychange=hidden`, unmount, and before any MAIA act (`settleWriting`, 5 s); `SectionSaveQueue` keeps one save in flight and reads `baseVersion` at send time; `PUT …/sections/{id}` → `saveSection`: `FOR UPDATE`, version check, update, `string_agg` content, `version = version + 1` | `manuscript_draft_sections` + `manuscript_working_drafts` | Server-acknowledged text survives reload / sign-out / device | S-CODE; S-TEST `sectionSaveQueue.test.ts` (real queue, fake server) | `lib/manuscript/sections/saveSection.ts:111-214`; `sectionSaveQueue.ts:199-245`; *(sweep)* `useSectionWriting.ts:319-393` | Real. Route and SQL untested | — | E1 | **PARTIAL** |
| 16 | Save acknowledgement (substrate for "Saved") | queue sets `version` only on `ok && typeof version==='number'`; `persisted.set` | memory | — | S-CODE | `sectionSaveQueue.ts:224-225` | The acknowledgement is known | — | E1 | **PARTIAL** |
| 17 | **"Saved" as a displayed claim** | none. Labels are `Needs attention` / `Save unavailable` / `Unsaved` / `Saving…` / `null` | — | — | S-CODE | RSC:1484-1487 | **No producer emits "Saved".** `clean`/null conflates *never touched* with *acknowledged*. The label is computed only over the **current chapter's** sections, so a failure elsewhere shows nothing | #16 could back a truthful producer | — | **WITHHOLD** |
| 18 | **"Draft vN"** | footer `draft v{writing.currentRevisionId()}` = `manuscript_working_drafts.version` (queue copy) | DB integer, `DEFAULT 1` | — | S-CODE | RSC:1771; `saveSection.ts:200-207` ("ONE version increment" per save); *(sweep)* also incremented by checkpoint, whole-draft save, restore, adoption, normalisation; migration `20260731000001_draft_concurrency.sql:21` | **A concurrency / save counter.** It grows on every acknowledged section save (≈ each 1.2 s pause or blur), across tabs and devices. It is **not** `working_draft_revisions.revision_number` and **not** a kept version | — | — | **WITHHOLD** (as a writer-meaningful draft version) · **PARTIAL** (as a concurrency token) |
| 19 | Version conflict and continued saving | queue latches `stale_base` → `conflicted`; `drain()` always takes the lowest-sequence pending entry **including a conflicted one**, re-sends it, gets 409, returns | memory | **After one conflict, no later save of any section lands in that session.** Other sections sit at `Unsaved`. `takeLocalVersion`/`discardLocalVersion` have no non-test caller, so there is no resolution UI | S-CODE; S-TEST covers single-section conflict only | `sectionSaveQueue.ts:206-244` (re-read); *(sweep)* `:168-181` | Established structural defect for serious writing | — | E1 (two-tab synthetic) | **WITHHOLD** (for "saving continues safely") |
| 20 | Loss on reload / close | no `beforeunload` in the room (exists only in `insight/RevisionDesk.tsx:124`, `EditorialApproaches.tsx:17`, `WorkInspiration.tsx:21`); no `keepalive`/`sendBeacon` on the unload flush; no local backup | memory | Unsaved text can be lost; magnitude unwitnessed | S-CODE | grep (re-read); *(sweep)* fetch path | No guard producer | — | E1 | **WITHHOLD** (for "no loss on reload") |
| 21 | Sign-out / new device | saved text is server-side; place is URL-only; unsaved text is memory-only | DB / URL / memory | Saved text is recoverable; place and unsaved text are not | S-CODE | as #11, #20 | — | — | E1 | **PARTIAL** |
| 22 | Multi-tab | row lock + version check → 409 → latch (#19); no cross-tab channel | DB | No silent overwrite; no recovery | S-CODE | as #19 | — | — | E1 | **PARTIAL** |
| 23 | Native undo | textarea undo | browser | History lost whenever the textarea unmounts (every blur) | S-CODE *(sweep)* | `RebuildAuthoredBody.tsx:102-119` | — | — | E1 | **PARTIAL** |
| 24 | Editorial undo | `POST /api/writers-studio/editorial/undo`, shown via `RevisionDesk` `onUndo` when `canUndo` | DB | — | S-CODE | route `:6` flag; RSC:1144-1172, 2150 | Real; gated by `WRITERS_STUDIO_EDITORIAL_ENABLED` (production value UNKNOWN) | flag | E1 | **PARTIAL** |
| 25 | Keep a version / revision history / restore from Write | `checkpointServerDraft` only in `canvas/SectionWritingSurface.tsx:122`; `restoreRevision` only in `press/manuscript/WorkingDraftEditor.tsx:598`; `loadRevisions` in Canvas + legacy | `working_draft_revisions` (append-only, UPDATE refused by trigger) | — | S-CODE *(sweep; CR0 same)* | grep | Substrate real; **not reachable from Write** | — | — | **WITHHOLD** (in Write) |

### A4. Selection, cursor, focus, Full Canvas

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 26 | Held passage / selection | `captureSelection` → `holdPassage` → `selectedPassage` (React state); editorial thread id in URL | memory; URL for the thread | Cleared on moving sections; rebuilt on reload **only** from an editorial thread | S-CODE *(sweep; CR0)* | RSC:325, 734-772 | Real in-session | — | E1 | **PARTIAL** |
| 27 | Cursor / caret | textarea only while editing | browser | Lost on every blur. A click into the resting div does not place the caret (no `setSelectionRange`) | S-CODE *(sweep)* | `RebuildAuthoredBody.tsx` | — | — | E1 | **PARTIAL** |
| 28 | Stale editorial-thread param after navigation | `requestedEditorialThread` frozen at arrival (Next `__NA`, #7) | URL | *(sweep, inferred)* each later focus change re-reads the stale thread → "belongs to a different place…" | S-CODE *(sweep, inferred)* | RSC:711-732 | Plausible defect, inferred | #7 | E1 | **UNKNOWN** |
| 29 | Full Canvas — same editor instance | `canvasExpanded`; header, outline and MAIA are conditional siblings; the `<section>` and keyed bodies stay mounted | — | — | S-CODE; S-STR `rebuildAppearance.test.ts` | RSC:300, 1490, 1529, 1779 | Static structure favourable; **no render test** | — | E1 | **PARTIAL** |
| 30 | Full Canvas — state tuple (place · passage · selection · cursor · version · save · focus) | — | — | ↗ and "← Workspace" are buttons, so clicking them blurs the textarea → caret and selection lost. Escape does not blur. **Nothing restores focus on exit** | S-CODE *(sweep; CR0 F6)* | RSC:441-448, 1517-1526 | S3 law "tuple identical" **not satisfied** on the pointer path (static) | — | E1 | **WITHHOLD** (pointer path) · **PARTIAL** (Escape path) |
| 31 | Full Canvas exits | "← Workspace" (RSC:1519), **"Workbench" link to `/writers-studio`** (RSC:1522, leaves the room), Escape (RSC:444) | — | — | S-CODE | re-read | **Three exits.** S3 contract forbids any third exit | — | — | **PARTIAL** |
| 32 | Save state in Full Canvas | shown only when non-null, bottom-right, 48% opacity; word count and version hidden | — | — | S-CODE *(sweep)* | RSC:1774-1776; `rebuild.css:85-93` | Inherits #17 | #17 | E1 | **PARTIAL** |
| 33 | No resident MAIA at rest (S3 / VC-03) | the live room renders a **MAIA aside at rest** (`{!canvasExpanded && !workspaceOpen && (<aside className="wsr-maia"…>` "✦ MAIA") | — | — | S-CODE | RSC:1779-1783 (re-read) | Live composition contradicts the S3 law | — | — | **WITHHOLD** (for the S3 claim) |
| 34 | Header copy | "Rebuild preview" shown to members | — | — | S-CODE | RSC:1512 (re-read) | Not member-truthful product copy | — | — | **WITHHOLD** (as product copy) |
| 35 | Formatting | plain textarea / plain-text div | — | — | S-CODE | CR0 §I | Consistent with S3 (no formatting model) | CR0 nine invariants | — | **PARTIAL** |

### A5. Develop, Review, observations

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 36 | Develop reading | `DevelopRoom` → `POST …/readings` (body admits `lens` + `scope` only) → `commissionReading` (capture → load revision → recover → read → classify → `freezeReading` → store); 7 lenses; **no env flag** | `developmental_readings` | Re-entered via `?m=&r=` | S-CODE *(sweep)*; S-TEST `freeze.test.ts` | *(sweep)* `readings/route.ts:140-230`; `commission.ts:52-102` | Real; not flag-gated (contradicts the CLAUDE.md "Develop is flag-gated" text) | #38 | E1 | **PARTIAL** |
| 37 | Chapter Review in Write | `runReview` → `runChapterReview` = 7 sequential readings over the chapter range; manifest in `writer_studio_chapter_review_runs`; rehydrates; drift → "The Work has changed since this reading…" | DB | Rehydrates by id | S-CODE *(sweep)*; S-TEST pure helpers only | RSC:584-642, 1795-1950; `chapterReview.ts:90-201` | Real in-room; `runChapterReview` untested | #38 | E1 | **PARTIAL** |
| 38 | **Write → Develop/Review loop after editing** | capture reads the **latest** `working_draft_revisions` row (`ORDER BY revision_number DESC LIMIT 1`); `freezeReadState` refuses `revision_not_current` unless its bytes equal the live draft; **`saveSection` inserts no revision** (revision INSERT sites: draft, revisions, checkpoint, blank, convertDraft, normalizeLegacyScaffold); no checkpoint before commissioning; the Write room has no checkpoint caller; the Develop refusal copy links back to Write | DB | Refusal persists until a checkpoint made outside Write (Canvas `/writers-studio/canvas`, unlinked) | S-CODE | `lib/manuscript/development/capture.ts:97-103`; `readState.ts:331-351`; `saveSection.ts` (no revision insert); grep of INSERT sites; `DevelopRoom.tsx:140,943` (all re-read) | **Established structure:** once the member edits in Write, readings of the edited range have no in-Studio path to proceed. Whether it fires on a given real manuscript depends on data (unwitnessed) | Keep-a-version convergence | E1 | **WITHHOLD** (in-Studio loop) · runtime **UNKNOWN** |
| 39 | Review mode in the mode bar | `STUDIO_MODES.review` = `later`, "Not yet available", while Chapter Review works inside Write | — | — | S-CODE | `studioMap.ts:518-525` (re-read) | Mode promise is honestly `later`; the capability lives elsewhere | — | — | **WITHHOLD** (Review mode) |
| 40 | Exact-passage return from a finding ("Show in manuscript →") | `openReviewFinding`: first `sectionIds` entry present in live context → `focusId`, `s=`, scroll | URL | **Section-level only.** Ignores code-point range; no digest check → after drift lands on the same section regardless of content (state shown as a label) | S-CODE *(sweep)* | RSC:785-797, 1911 | — | — | E1 | **PARTIAL** |
| 41 | Insight "Work on canvas" | `loadCanvasInsight(m, readingId, observationKey)` → marks passage only if section digest = frozen digest ∧ state `current` ∧ coverage `body` | DB | Drift-safe by construction | S-CODE *(sweep)*; S-TEST `insightCanvas.test.ts` (real `buildCanvasInsight`, `apiFetch` mocked) | `insightCanvas.ts:67-108` | Real | — | E1 | **PARTIAL** |
| 42 | Flagship review mount / R1-2 exact return / R1-1C navigation | `LiveReviewView`, `reviewReturn.ts`, `reviewNavigation.ts` | — | — | S-CODE *(sweep)* + S-GIT | only reachable via `FlagshipWriteHost`, unmounted (`page.tsx`; `productionWorkspaceMount.test.ts` S-STR) | Orphaned | — | — | **WITHHOLD** (live) |
| 43 | Observation standing | `postStanding(m, readingId, {observationKey,…})`; server gate `WS_STANDING_ENABLED`, client `NEXT_PUBLIC_WS_STANDING_ENABLED` | `developmental_observation_standing` | — | S-CODE *(sweep)* | `DevelopRoom.tsx:1262-1307`; `standings/route.ts:58-59` | Real, flag-gated (production value UNKNOWN) | flag | E1 | **PARTIAL** |
| 44 | Member action keyed to `observation_id` | none. Every action keys `(readingId, observationKey)`; resolver `observationAddress.ts` imported only by tests; `studio/capability.ts:100` blocks it | — | — | S-CODE *(sweep)*; S-REC | NEXT-01 ratification §IV | Not permitted until `WRITERS-STUDIO-OBSERVATION-ADDRESS-01` closes (no closure record exists) | external lane | — | **WITHHOLD** |
| 45 | Observation identity minted | `mintObservationId` → `dobs_${randomUUID()}` at the single `freezeReading` seam | `developmental_readings.observations` jsonb | — | S-CODE *(sweep)*; S-REC I1 closed | `observationIdentity.ts:46`; `freeze.ts:136-167` | Real in code; production migration state UNKNOWN (R2-2 recorded `20260921000001` pending at its read) | deploy | E1 | **PARTIAL** |
| 46 | Findings order | lens order then admission order; no ranking; no manuscript-order view in Chapter Review | — | — | S-CODE *(sweep)* | `chapterReview.ts:54-80` | Unranked (lawful per §4); not in manuscript order | charter §10.1 cut rule | — | **PARTIAL** |

### A6. MAIA, coverage, facets

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 47 | Editorial thread ("Work with MAIA", adopt, undo, versions) | `editorialCollaboration.ts` → editorial routes (all 404 unless `WRITERS_STUDIO_EDITORIAL_ENABLED==='1'`; turn requires Sanctuary posture) | DB threads | Thread id in URL | S-CODE | env-flag count (re-read: 8 sites); *(sweep)* `turn/route.ts:12-38` | Rendered unconditionally; learns unavailability from 404. **No disclosure boundary/receipt on this path** — `lib/manuscript/editorialRuntime/**` has no boundary call (the only "disclosure" hit, `turn.ts:358`, concerns a count, not a crossing) | flag; disclosure law (not ruled here) | E1 | **PARTIAL** |
| 48 | Focus "Ask MAIA" (passage) | `POST /api/writers-studio/focus`; `WRITERS_STUDIO_FOCUS_ENABLED`; boundary + receipt via `focusCrossing.ts:105` | DB receipts | — | S-CODE *(sweep)* | `focus/route.ts:28-31` | Real, flag-gated | flag | E1 | **PARTIAL** |
| 49 | Review Discuss | `commissionReviewDiscuss` → `review-discuss` route; flag on page and route; authorization act, one boundary per section, turn + receipt + completion in one transaction | DB (migration `20260923000001`) | — | S-CODE *(sweep)* | `page.tsx:26` (re-read); `review-discuss/route.ts:32-215` | Real; production migration state UNKNOWN | flag; deploy | E1 | **PARTIAL** |
| 50 | Developmental Ask body crossing (ACT 3) | route returns `BODY_AUTHORITY_REQUIRED` + `pendingAskRef`; **no client reads or sends either** | — | — | S-CODE | grep: `BODY_AUTHORITY_REQUIRED` only in `ask/route.ts` and `lib/disclosure/authorizationAct.ts` (re-read) | No client producer; a body-requiring Ask cannot complete | — | — | **WITHHOLD** |
| 51 | Developmental reading body disclosure | `commissionReading` sends recovered body to the reader with no boundary/receipt (`establishDisclosureBoundary` callers: ask, review-discuss, focus) | — | — | S-CODE | grep (re-read, `commission.ts`) | Observation for founder: whether commission requires a receipt is **not ruled** by any record read | disclosure law | — | **UNKNOWN** (governance, not behaviour) |
| 52 | Contextual MAIA (C1C1 discuss-only) | `DiscussLayer`, `flagship/ContextualMaiaPanel` | — | — | S-CODE *(sweep)* | only via FlagshipWriteHost | Orphaned | — | — | **WITHHOLD** (live) |
| 53 | Coverage disclosure — Develop | reading header "MAIA read X of N sections in full; Y by position only" from `reading.coverage` | — | — | S-CODE *(sweep)* | `DevelopRoom.tsx:1052-1054`; `developPresentation.ts:255-265` | Real, visible (L8) | — | E1 | **PARTIAL** |
| 54 | Coverage disclosure — Chapter Review | "MAIA read all ${chapter.sections.length} sections through ${DEVELOPMENTAL_LENSES.length} developmental lenses." | — | — | S-CODE | RSC:1814 (re-read) | **Not derived from `reading.coverage`**: the chapter's live section count stated as what MAIA read | L8 | — | **WITHHOLD** |
| 55 | Coverage — Insight / editorial / discuss answers | Insight "What I read" inside `<details open={!suggestedVersionId}>` → collapsed once a version is proposed; discuss shows none; editorial/focus none found | — | — | S-CODE *(sweep)* | RSC:280, 2164-2172; `InsightReading.tsx:127,145-148,284-286` | Reachable but can sit behind a collapsed disclosure; absent elsewhere | L8 | — | **PARTIAL** (Insight) · **WITHHOLD** (discuss/editorial/focus) |
| 56 | Facet parity (Guided / Learning / Direct) | `EditorialDepth`, default `guided`; changes **only** the editorial-turn prompt; the readings POST admits no depth | memory | — | S-CODE *(sweep)* | `editorialDepth.ts:31-70`; RSC:1021, 2141; `readings/route.ts:163-168` | Reading is facet-invariant **by construction**. A depth change yields a fresh turn. L6b ("no more prose at one depth") enforced **only by prompt text** | charter §9.3 | E1 | **PARTIAL** |
| 57 | Writer / Pro mode | none; "Pro" retired by charter §10.2 | — | — | S-CODE *(sweep)*; S-REC | — | No such mode (lawfully) | — | — | **WITHHOLD** |
| 58 | Studio map promises | 16 destinations: 3 `available` / 13 `later`; modes Explore/Review/Publish `later` | — | — | S-CODE | `studioMap.ts:175-250` (re-counted: 3/13), `:518-525` | Honest `later` flags. Notes, Goals, Discover, Insights, Suggestions, Find/Replace, Statistics, Timeline and Word Web have no producer | — | — | **WITHHOLD** (each `later` item) |

### A7. Access, Home, EA

| # | Affordance | Producer | Persistence boundary | Recovery / reload | Evidence class | Exact evidence | Truth status | Dependency | Environment | Classification |
|---|---|---|---|---|---|---|---|---|---|---|
| 59 | Route access | `/writers-studio/rebuild` and `/develop` are unmapped in `config/accessMatrix.ts` (only `exact:'/writers-studio'`); unmapped paths pass unless strict mode; APIs require auth; 401 → "Sign in…" | — | — | S-CODE *(sweep)* | `accessMatrix.ts:99,782,810-824`; `middleware.ts:431-437` | Page shell public, data authenticated | — | E1 | **PARTIAL** |
| 60 | Home "You're in Chapter N" (PC3-S2 fixture sentence) | none. Canonical Home says only "Return to this work" | — | — | S-CODE (CR0 C4); S-REC HOME ruling §9 (no continuity copy without durable evidence) | — | No producer | durable place (#11) | — | **WITHHOLD** |
| 61 | EA governed-corpus unreachability during manuscript review | see §8 | — | — | see §8 | see §8 | see §8 | see §8 | see §8 | see §8 |

**Count:** 0 LIVE. Rows are split by claim where one affordance carries two claims (8a/8b, 11, 18, 30, 38, 55).

---

## B. Programme succession map

### B1. What exists

| Authority | Nature | Current canonical standing | Evidence |
|---|---|---|---|
| **PC3 accepted experiential lineage** (`WRITERS-STUDIO-FULL-REDESIGN-01`) | Founder-accepted fixtures: S1 shell, S2R1 Home, S3 Write + Full Canvas | **Not in canonical.** 7 commits `b8a3656a2…976dd1b5e`, **74 files added, 0 modified, 0 deleted** relative to `e8868884` (purely additive: `app/writers-studio/full-redesign/**`, `app/dev/writers-studio-full-redesign-review/**`, contracts, evidence, instruments). No live file touched. Governing PC1/PC2/CR0 records are in JARVIS custody; **this census could not read them** and does not characterise their text | S-GIT (`git diff --name-only e8868884 976dd1b5`) |
| **`WRITERS-STUDIO-CONVERGENCE-01`** | Law charter L1–L8 (L6 → FACETS-01, Guided/Learning/Direct), spine, EA precondition, scope exclusions | **Laws binding** ("RATIFIED AND FROZEN"). Steps 2–8 **superseded as sequencing** by NEXT-01 ("historical traceability only"). C2–C4 structural work, C5 walk closed, C6R6 and three-level witness exist, with no merge ruling recorded in those records. The PR #1455 supersession record retired a vehicle, not the evidence. The charter's own "steps 2–8 NOT STARTED" lines and the CLAUDE.md text are stale | S-REC (charter; `…SUPERSESSION_RECORD_PR1455…`; C5/C6 records) *(sweep; supersession line re-read)* |
| **`WRITERS-STUDIO-NEXT-01`** | Ratified manuscript-first experience constitution; **the single sequencing authority** (A1–A9 layers; A1–A3 core critical path; each layer opens on its own founder act) | A0 ratified; A1 census / audits; A1B host-room ruling ("`rebuild/`… NO IMPLEMENTATION AUTHORIZED"); A1C host proof merged (#1483) without a programme record; EA walk = A9 with original conditions | S-REC `…NEXT-01_A0_…CONSTITUTION…:174,189` (re-read) · *(sweep)* for A1B/A1C |
| **`FLAGSHIP-RUNTIME-CONVERGENCE-01`** | Runtime programme under `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01` / COMPLETE-01 D0 ("product authority… existing code is a substrate mine"); design canon `FLAGSHIP_VISUAL_CANON_v2` | **No charter.** Stages C0…R2-2 recorded. Lineage merged via #1498 then **mount reversed by #1501** with no record admitting either. FS1–FS3 freezes still pin the orphaned host. Cites neither CONVERGENCE-01 (except for the unratified disagreement law) nor NEXT-01 | S-GIT (re-read); S-REC *(sweep)* |
| **`WRITERS-STUDIO-OBSERVATION-ADDRESS-01`** | Sole question: `observation_id` → one standing record | Chartered, **not closed**. A1 read-only resolver built, test-only consumers. Gate stands: no member action keyed to `observation_id` | S-REC *(sweep)*; S-CODE `studio/capability.ts:100` *(sweep)* |
| **`OBSERVATION-ADDRESS-01`** (unprefixed) | Member place / last place | Census + spec proposal; **implementation authority NOT GRANTED**; "Member relationship place ⛔ NONE"; B-I place contract accepted, runtime persistence ABSENT | S-REC *(sweep)* |
| **Design authorities in canonical** | `FLAGSHIP_VISUAL_CANON_v2` ("materially resembles pre-flagship… fails"); `HOME_ARRIVAL…RULING_v1` (no improvised Home; "Home" may not survive; no continuity copy without durable evidence) | Binding as canonical design records unless superseded | S-REC (re-read lines 9; 39, 41, 117) |

### B2. Constraints any PC3-LIVE relation must satisfy (from canonical records)
1. NEXT-01 §VIII rejects "run beside": two live sequencing authorities over one surface "eventually contradict each other" *(sweep)*. **PC3-LIVE cannot be a fourth independent sequencer.**
2. CONVERGENCE-01 L1–L8 and FACETS-01 bind any Writer's Studio surface. Charter §7: "opening any additional product-capability lane before the spine has been walked" NOT AUTHORIZED; §0: increasing what MAIA can *do* is out of scope *(sweep)*.
3. `productionWorkspaceMount.test.ts` pins that production mounts the full workspace. Any change of mount must supersede it deliberately.
4. Home ruling and Visual Canon v2 (B1) must be reconciled with PC3-S2 and PC3-S1/S3 before live convergence, or explicitly superseded by founder act.
5. The `observation_id` gate, Compass-is-not-evidence, and the EA precondition carry forward unchanged.

### B3. Proposal (not enacted)

**Proposed relation: SUBORDINATE**, with one named OTHER component.
- **Subordinate to NEXT-01 as sequencer.** PC3-LIVE would be the convergence work *within* a named NEXT-01 layer (most plausibly A1 host composition for Write/Full Canvas, and the layers owning Develop/Review for LIVE-02-type work), opened by that layer's founder act. It would be bound by CONVERGENCE-01 L1–L8, FACETS-01 and the EA precondition.
  - Evidence: NEXT-01's single-sequencer ratification; its explicit rejection of parallel sequencers; the purely additive, un-canonical state of the PC3 lineage.
- **OTHER — the visual-authority question is not a sequencing question.** PC3-S1…S3 are founder-accepted *experiential targets*. Canonical names `FLAGSHIP_VISUAL_CANON_v2` as design authority and carries the Home ruling. Which governs the live Studio's look (PC3 supersedes, PC3 is the realisation of, or PC3 is reconciled into Visual Canon v2) requires a founder ruling. This census cannot derive it, because PC3's own authority records are outside canonical.
- **Why not ABSORB:** absorbing CONVERGENCE-01 or NEXT-01 into PC3-LIVE would re-found sequencing on records not in canonical, and would orphan ratified law.
- **Why not SUCCEED:** succession would imply NEXT-01 and CONVERGENCE-01 are complete or closed. They are not (A1 open; steps and layers unbuilt; OBSERVATION-ADDRESS-01 open).
- **Consequence of SUBORDINATE:** PC3-LIVE inherits the flagship-runtime residue (orphaned host, stale contracts, freezes pinning unmounted code). That residue needs its own disposition before any mount change. Otherwise a third mount reversal becomes likely.

---

## C. Environment / manuscript-custody matrix (no selection)

| | **E1 — isolated local runtime + synthetic manuscript** | **E2 — production snapshot / copy as a new Work** | **E3 — export Kelly's manuscript to a local DB/runtime** | **E4 — live production Work on soullab.life** |
|---|---|---|---|---|
| Evidence obtainable | Mechanics: save / reload / conflict / place / Chapter 10 fallback (with and without a "Chapter 10" heading) / Full Canvas tuple / revision_not_current loop / Review return / flags on and off. Not: production flag values, production migration state, real-manuscript scale | All of E1 on real text and real structure at production scale, in the production build; production flag/migration truth | E1 on real text and structure; not production flags or build | The real experience; the only venue for "Kelly writes for an hour" |
| Data copied / created / mutated | Synthetic only; local DB created | **New Work rows in production** (member tables) | Manuscript leaves production to the Mac Studio (or other host) | Real Work mutated by every save |
| Privacy / custody consequence | None to member data | Production copy of authored work; deletion / erasure obligations (WS-DELETE / vault erasure) attach | Custody move of authored work off the sovereign host; local backups and cleanup become obligations | None new, but any defect in #17–#22 and #38 lands on the real book |
| Authorization required | Founder act to provision a local runtime (install / migrate / seed — forbidden to LIVE-00) | **Production mutation act** (packet §9) | **Custody decision** (packet §9) | Deploy act (+ merge / succession) and a named acceptance gate |
| Deploy / schema / data-write authority | Local only | Production data write; no schema change needed for a copy (unverified) | Local schema + data | Deploy of the converged build; possibly pending migrations (`20260921000001`, `20260923000001` production state UNKNOWN) |
| Destructive witness suitability | **High** | Medium — real text but a production write | High — real text, off production | **Unsuitable** |
| Save / reload / undo / place witness | **High** (mechanics) | High | High | Only after the others pass |
| Kelly's real writing session | No | No — a copy, not the book | No — off the sovereign host | **Yes**, and only after safety witnesses |

---

## D. Open proof obligations

1. **Chapter 10 / reopen:** runtime witness of arrival place with and without `?s`, with and without a "Chapter 10…" heading, stale `?s`, and Home hero on a tie (#8b, #10, #11).
2. **Saved:** a producer whose success and recovery semantics support "Saved", scoped to the whole draft, not only the chapter (#16–#17).
3. **Version semantics:** decide what, if anything, a writer-facing version label means. "draft vN" is a save counter (#18). `working_draft_revisions.revision_number` and Keep a version are the only kept-version substrate.
4. **Conflict latch:** a witnessed behaviour after a 409 across sections, and a resolution path (#19, #22).
5. **Unload safety:** a guard / keepalive / local backup decision, and a witness of loss on reload and close (#20).
6. **Place recovery:** durable last place vs last saved (OBSERVATION-ADDRESS-01 unprefixed; B-I persistence absent) (#11); Next `__NA` coupling (#7).
7. **Full Canvas tuple:** focus / caret / selection across the pointer path; the third exit (#30, #31).
8. **Undo / recovery in Write:** native undo lost on blur; Keep a version / restore not in Write (#23, #25).
9. **Write → Develop/Review loop:** the `revision_not_current` dead end (#38).
10. **Coverage truth:** the Chapter Review sentence, and discuss/editorial answers (#54, #55).
11. **Disclosure governance:** whether reading commission and editorial turns require receipts (#47, #51) — founder / governance question.
12. **Developmental Ask ACT 3 client** (#50).
13. **PC3 succession / base:** PC3 lineage is purely additive and unmerged; whether PC3 succession / merge-readiness must close before live convergence implementation. A future implementation would inherit the live substrate from canonical and presentation from PC3; whether it builds on `976dd1b5` is **not selected here**.
14. **Programme succession:** founder ruling on SUBORDINATE / OTHER (B3), and on the visual-authority reconciliation (Visual Canon v2, Home ruling).
15. **Flagship residue:** orphaned host, stale `flagship-studio.md` / `writers-studio-rebuild.md` contract jurisdiction, FS1–FS3 freezes pinning unmounted code, #1498/#1501 without admission records.
16. **Production state:** flag values (`WRITERS_STUDIO_EDITORIAL_ENABLED`, `…FOCUS…`, `…REVIEW_DISCUSS…`, `WS_STANDING_ENABLED`) and migrations `20260921000001` / `20260923000001` — UNKNOWN (no production probe authorized).
17. **EA governed-corpus unreachability** — §8.

---

## 8. Elemental Alchemy epistemic isolation (structural only)

**Method:**
- I read source and DDL only. Import graphs were built for every `app/api/sovereign/manuscripts/**` and `app/api/writers-studio/**` route: comments stripped, `@/` and relative paths resolved, static and dynamic `import()`/`require` followed, `import type` skipped (*(sweep)* walker, no writes).
- **No corpus chunk, source `.md`, JSON, prose-bearing prompt constant or manuscript text was opened.**

**What the contract pins:**
- `lib/corpus/governedKnowledgeRegistry.ts:31-45` names `ELEMENTAL_ALCHEMY_GOVERNED_SOURCE`: subject `elemental-alchemy`, a single source file under `data/ain/source/`, 1,238 chunks, pinned chunk-set and embedding-set SHA-256s. `lib/corpus/eaIngestContract.ts:9-26` mirrors it.
- Storage is `ain_knowledge_chunks` (`20260107000004_ain_knowledge_base.sql:8`), written by `lib/corpus/eaIngestTransaction.ts:64-116` and by legacy `scripts/embed-ain-knowledge.ts`.
- The source file ships in the runtime image (Dockerfile `:78-82`).
- The same text may also exist in `library_chunks` under the Library's global authority (`lib/library/globalRetrievalAuthority.ts:25-38`). That depends on data, which was not read. *(sweep)*

**Corpus consumers (code routes):**
- **Governed retriever** `GovernedRetrievalService`: sole application consumer is `app/api/sovereign/app/maia/list/route.ts` (re-read by grep).
- **Registry:** `retrieved.governed_knowledge` has `rooms: ['sovereign_chat']` (`producerRegistry.ts:194-201`, re-read). `collective.knowledge_gate` is `['sovereign_chat','between']`. None lists `writers_studio`.
- **Ungoverned `ain_knowledge_chunks` retriever** `RetrievalService`: `maiaOrchestrator` → `between/chat`, and `ain/knowledge`. *(sweep)*
- **Library:** `oracle/conversation`, `library/*`. *(sweep)*
- **Ungoverned book-file loaders** (`ElementalAlchemyBookLoader`, `ElementalAlchemyKnowledge`) are consumed by legacy oracle / agent modules. *(sweep)*
- No file under `lib/manuscript`, `lib/writersStudio`, `lib/writers-studio`, `app/writers-studio`, `app/api/writers-studio` or `app/api/sovereign/manuscripts` imports a corpus module or table (grep re-read; the single hit is a comment in `ingest/titleSuggestion.ts:17`).

**Per reader path:**

| Path | Model-call site | Classification (static) | Basis |
|---|---|---|---|
| A. Developmental reading / Chapter Review | `developmentalReader/read.ts:122-131`, `classify.ts` | **Structurally isolated by construction** | Constant `READER_SYSTEM`. User message = `renderRequest(request)`. `DevelopmentalReaderRequest` has exactly `commissionedLens · evidence · recovered`, and `recovered` is digest-validated against a readState captured only from manuscript tables. Graph: 27 files, no corpus. Guarded by constitutional L5/D7 field-shape checks *(sweep)* |
| B. Structure read | `structure/maiaReader.ts:741-746` | **Isolated by construction** | Constant system prompt over `StructureEvidence`; 13 files, no corpus *(sweep)* |
| C. Ask / developmental Ask | `askReader.ts`, `developmentalAskReader.ts` | **Isolated as far as the corpus is concerned** | System prompt from standing constants + work context; messages = `ask_turns` + question; 37 files, no corpus table *(sweep)* |
| D. Review Discuss | `reviewDiscussReader.ts` | **Isolated by construction** | `systemFor(ctx)` from evidence views; 28 files *(sweep)* |
| E. Editorial turn | `editorialRuntime/turn.ts` | **Isolated from the corpus; includes house floor constants** | Blocks only from editorial producers + teaching bridge (no `sources`, no I/O). The system prompt carries the canonical-turn floor (`MAIA_RUNTIME_PROMPT` incl. `AIN_INTEGRATIVE_ALCHEMY_PROMPT`, `PLATFORM_KNOWLEDGE_ADDENDUM`). 77 files, no retriever *(sweep)* |
| F. Focus "Ask MAIA" | `writersStudioCognition.ts` → `getMaiaResponse({writerStudio:{turn}})` | **Prompt-isolated by control flow; module-reachable** | `if (writerStudioTurn)` branch (`maiaService.ts:3688-3707`, re-read) renders only the floor + `member.writer_focus` + `retrieved.writer_work_context`, exclusive of the FAST/CORE/DEEP paths where governed/AIN knowledge is spliced; RCN barred (`:3518`). **But** `maiaService.ts:33` statically imports `consciousness-orchestrator`, whose graph reaches the ungoverned EA loaders (310-file graph). They are loaded but not called on this branch *(sweep)* |
| G. Quote candidates | `extractQuotes.ts` | **Isolated** | Input `manuscript_sections.body` *(sweep)* |

**Storage:** manuscript tables and corpus tables share **no table, foreign key or key** *(sweep)*. The only thing they can share is **the same prose**, when the member's manuscript is the book.

**Guards:**
- `governedKnowledgeParticipation.test.ts:18` pins the governed-knowledge room to `sovereign_chat`. It covers paths E and F only.
- The constitutional L5/D7 checks cover path A's request shape only.
- **No test or import-graph guard asserts that Writer's Studio trees do not import `lib/ain/knowledge/*`, `lib/library/*` or the ungoverned EA loaders.**
- `lib/writers-studio/membrane.ts:131` classifies `retrieved.governed_knowledge` as **`invited`** ("Teach from a governed source"). That is design intent, not wired, and not admitted by the registry. It is a future route that would have to be excluded while EA-as-manuscript is under review. *(sweep)*

**Undetermined, and not a code route:**
1. **Provider training knowledge** of a published book cannot be excluded by any code, on every path.
2. **House floor constants** on paths E and F are authored framework prose. They are not the 1,238 pinned chunks. Whether they paraphrase the book is a content question this census may not open.
3. **Member-supplied channels** (Ask history, editorial utterance, Focus) could carry pasted corpus text.

**Classification: UNKNOWN (for "provably unreachable during an actual reading").**
- Static evidence establishes **no code route carrying the governed 1,238-chunk corpus into any Writer's Studio model call**.
- Paths A–D and G are isolated by construction. E and F are isolated by room gating plus control flow, with F module-reachable.
- That is **supporting structure, not proof**. No runtime witness exists, no mechanical import-graph guard exists, and (1)–(3) are irreducible by code.
- The frozen precondition (EA-as-governed-knowledge provably unavailable to the reader while EA-as-manuscript is under review) is **not established**.
- **Witness a future act would need:** a runtime capture of the exact rendered request per reading path under a synthetic manuscript (E1). An import-graph guard over Writer's Studio trees would also be needed. A founder ruling is required on how (1) provider knowledge and (2) floor constants bear on "manuscript-derived independence".

---

## Not established by this census
- Any runtime behaviour. Every classification is structural.
- The text or authority of PC1 / PC2 / CR0 control-room records (outside canonical; not read).
- Production flag values, production migration state, production data.
- Whether any real manuscript contains a "Chapter 10" heading.
- That any finding is a defect *in the member's experience*. Findings describe code structure.

**Production, canonical, `976dd1b5` and every Sovereign branch were untouched. Nothing was merged, deployed, migrated, copied or exported.**

**STOP — FOUNDER ADJUDICATION — PC3-LIVE-00 COMPLETE CONVERGENCE CENSUS + PROGRAMME SUCCESSION + ENVIRONMENT DECISION.**
The census proposes; it does not enact. No successor exists until founder adjudication.
