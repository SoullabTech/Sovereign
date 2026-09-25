# WRITERS-STUDIO-NEXT-01 / A1-LS0 — Baseline Defeat Witness · RESULT

**Act:** `WRITERS-STUDIO-NEXT-01 / A1-LS0 — LIVE AUTHORSHIP SAFETY RUNTIME + BASELINE DEFEAT WITNESS ONLY`
**Packet:** `WRITERS-STUDIO-NEXT-01_A1-LS0_EXECUTION_PACKET_2026-09-24.md` · SHA-256 `4db3fd807c8f4444087becbbbbe7ddd5fa990731c56d407f23ffa8a00ca65300` · 10,065 bytes · 119 lines. Verified before execution, from the founder's upload.
**Canonical inspected (unmodified):** `clean-main-no-secrets@e886888416062c7fcbcf899040e3827bc8013835`. Re-read at the start of the act and again immediately before the authoritative run. It had not moved, so there was no rebind.
**Execution base:** a detached worktree of `e8868884`, with dependencies linked from an existing install whose `package.json` and `package-lock.json` are identical to canonical. No manifest or lockfile was changed, and nothing was installed or upgraded.
**Founder-accepted target `976dd1b5`:** reference only. It was not used as the execution base.

> **Result:** all eight RED candidates came back **RED REPRODUCED**. The S9 control came back **GREEN CONTROL ESTABLISHED**. Six flag configurations ran, and every outcome and observation was identical across them. The migration-sufficiency verdict is **INDEPENDENT** in every configuration, with zero PostgreSQL errors during any run. Canonical source was blob-identical before and after (30 of 30 exercised paths, 0 dirty paths).
> **LS0 grants no repair authority and names no successor.**

---

## 1. Environment E1 (packet §2)

| Item | Value |
|---|---|
| Location | CC's temporary cloud container. Not the Mac Studio. Not production. |
| Database | PostgreSQL 16.13, already-installed server programs, `initdb` into a disposable data directory at `/tmp/ls0-e1-pg` (UTF-8, `C.UTF-8`). The directory had to sit outside the scratchpad because the scratchpad is root-only (`700`) and PostgreSQL runs as `postgres`. It is removed at teardown. |
| Database per configuration | Dropped and recreated before each of the six configurations. |
| Application | Canonical `next dev` (Next 15.5.11), launched with `env -i`: **no proxy variables, so the app had no outbound network at all**; `DATABASE_URL` set to the E1 cluster (the repo's `dev` script unsets it, so `next dev` was invoked directly); `ANTHROPIC_BASE_URL` set to a loopback stub; `ANTHROPIC_API_KEY` set to the non-key literal `ls0-e1-synthetic-not-a-key`. |
| Provider boundary | `ls0-e1-provider-stub.mjs` on `127.0.0.1` refuses every request with HTTP 400 and logs only method, path and byte count. **No provider credential entered E1, no network inference occurred, and no synthetic text left E1.** |
| Browser | Installed Chromium via the installed Playwright. |
| Environment notes | The existing install carries `@next/swc` 15.5.7 against Next 15.5.11 (framework warning, recorded, not changed). `next/font/google` could not reach the network and fell back, as dev mode allows. |

E1 proves mechanics only. **It proves nothing about production flags, migrations or data.**

## 2. Migration-sufficiency gate (packet §3)

- **Canonical bootstrap was not usable.** `database/baseline/0001_baseline_2026-09-01.sql:54` runs `CREATE EXTENSION "vector"` under `ON_ERROR_STOP`, and `pgvector` is absent. Patching the baseline is forbidden, and installing `pgvector` is outside §2's authorized list. So, following the S3 precedent the packet adopts, **the schema was built from `database/migrations/*.sql`**. Each file ran in byte order (`LC_ALL=C`) using the canonical runner's semantics: `\i` in autocommit, `ON_ERROR_STOP`, and a ledger row written only on success. Each refusal was recorded and the run continued. **No file was edited, skipped by choice, or patched.**
- **Result (every configuration):** 498 files; **455 applied, 43 refused**.
  - 8 refused because `pgvector` is absent.
  - 34 refused because a predecessor object was missing, mostly as a cascade from the vector refusals: selflet, comms, encounters and studio people, case memories, agent runs, maia sessions.
  - 1 refused on its own precondition guard (`studio_people` missing).
  - The full enumeration with exact reasons is in `evidence/C*/migrations/refused.tsv`.
- **Objects actually touched by the scenarios** (activity counters, before versus after):
  - **18 tables:** `auth_sessions`, `living_work_expressions`, `living_work_materials`, `living_work_visuals`, `living_works`, `manuscript_draft_sections`, `manuscript_keeps`, `manuscript_sections`, `manuscript_source_arrivals`, `manuscript_structure_units`, `manuscript_working_drafts`, `member_manuscripts`, `member_studio_atmosphere`, `members`, `schema_migrations`, `workbench_uploads`, `working_draft_revisions`, `writer_studio_chapter_review_runs`.
  - **3 called functions.**
  - **8 trigger functions** on touched tables.
  - Every one is created by an applied migration, except `schema_migrations`, which the runner and the instrument create.
- **Dependency check:**
  - **Static:** two refused files were flagged for review.
    - `20260107000001_practitioner_caseload.sql` failed on `vector(768)`, but its first statement had already added three columns to `members` under autocommit.
    - `20260315120000_pattern_ledger.sql` inserts its own ledger row, and never reached that statement.
  - **Runtime (decisive):** statement text was logged during each run with bind parameters disabled. The log stayed in E1 and is deleted at teardown. Every table, column and function each refused migration *supplies* was checked against the statements actually executed.
  - **No refused migration supplies anything the scenarios executed. Verdict: INDEPENDENT in C0–C5. PostgreSQL errors during every run: 0.**

## 3. Identity (packet §4)

- Two synthetic `members` rows, each with an `auth_sessions` row, presented as the `maia_session` cookie. That is the representation canonical consumes (`lib/auth/getMemberFromRequest.ts`).
- Member A serves S1, S2 and S4–S9. Member B serves S3 alone, because Home composes itself from all of a member's writing and S3 must observe a single Work.
- No production identity was copied. Session tokens are not included in this evidence.
- Every manuscript, draft, section and revision was created through canonical routes:
  - `POST /api/sovereign/manuscripts` with confirmed sections;
  - `POST …/draft` (born section-addressable, with revision 1);
  - `POST /api/sovereign/living-works` and `…/expressions` (S3 only).
- **Direct synthetic-data mutations, named:**
  - S3 (c) set two sections to equal `updated_at`.
  - S4 (b) advanced `manuscript_working_drafts.version` by one, simulating another writer.

## 4. Practice runs versus evidence (packet §5)

Four practice passes ran against canonical. **None is evidence.** They found and repaired defects in the *instruments* only; no canonical source was touched:
- `psql -c` does not interpolate variables (ledger insert);
- a self-ledgering canonical migration required `ON CONFLICT`;
- a `head` pipe killed the identity seed under `pipefail`;
- `tee` wrote into a directory that did not yet exist;
- the rail mounts about 1.5 s after load, so the place detector must poll;
- Home's hero reflects all of a member's writing, which led to the dedicated member B;
- Home's hero appears only after the member writes, so S3 was restructured;
- the hero link was read before the `/locus` response, fixed by waiting on the response itself;
- the static overlap test first counted mere references, and was narrowed to *supplies*.

The instruments were then **frozen** (`INSTRUMENT_MANIFEST.tsv`, SHA-256 `c256514c0c149032104b351a11f139d9e74b962b41d45605a99408557d2ce026`, frozen `2026-09-24T23:35:18Z`, 10 files). The authoritative run used only those bytes, and they were re-verified identical after the run.

## 5. Flag matrix (packet §6)

| Config | Flags (synthetic E1 values) |
|---|---|
| C0-all-off | none |
| C1-editorial-on | `WRITERS_STUDIO_EDITORIAL_ENABLED=1` |
| C2-focus-on | `WRITERS_STUDIO_FOCUS_ENABLED=1` (exact canonical source name, `app/api/writers-studio/focus/route.ts`) |
| C3-discuss-on | `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1` |
| C4-standing-on | `WS_STANDING_ENABLED=1` |
| C5-all-on | all four `=1` |

**Governing flags:** none. For every scenario, the outcome in C1–C5 equals C0, and the normalised observations are identical, so no flag governs any S1–S9 path in E1. **These values are E1 selections and say nothing about production configuration.**

## 6. Scenario results (packet §7–§8)

| # | Census rows | Outcome | What was observed (identities, states and codes only) |
|---|---|---|---|
| **S1** arrival fallback / stale place | #8b, #10 | **RED REPRODUCED** | The member saved in Scene 1.1. **Arrival with no `?s` resolved to the "Chapter 10" heading root**, not to the member's place. With no such heading, arrival resolved to the first section. A valid `?s` resolved to the requested section. **A stale `?s` resolved to the Chapter 10 root and stayed in the address.** ⚠️ *Contrary to a LIVE-00 sweep claim, the stale `?s` was **not** carried into the Develop link. The census note is corrected by this runtime observation.* |
| **S2** same-tab reload | #9 | **RED REPRODUCED** | A rail click moved the place, and the address carried it, with **0 context refetches**. This confirms at runtime the LIVE-00 correction that clicks do not remount the room. After reload the section identity was recovered, but **it was not brought into view**. |
| **S3** Home reopen / tie | #11 | **RED REPRODUCED** | Before writing, Home offers no "Return" hero (canonical). After saving in Scene 2.1 and moving without typing to Scene 3.1, **the hero carried Scene 2.1 and reopening landed there**: the last *saved* section, not the last place. After an explicit equal-`updated_at` tie, the hero carried **no place** and reopening landed on the first section. `/locus` returned 200 both times. |
| **S4** save truth | #17 | **RED REPRODUCED** | After acknowledged, persisted saves, the footer showed `Unsaved` → `Saving…` → nothing. **"Saved" never appeared.** A refused save (409) in chapter 1 showed **nothing** from chapter 2. `Needs attention` appeared only on returning to chapter 1. |
| **S5** conflict latch | #19, #22 | **RED REPRODUCED** | Session B saved (200). Session A's edit to a different section was refused (409). **A later edit by A to a third section was never persisted.** The only PUT that followed was a re-send of the refused section (409). The footer read `Needs attention`. |
| **S6** unsaved reload / close | #20 | **RED REPRODUCED** | **7 of 7 early trials lost the typed text with no `beforeunload` warning:** reload at 0 ms (×2), reload at 300 ms (×2), close (×2), navigate away (×1). The control, a reload 3 s after typing, persisted. |
| **S7** Full Canvas pointer vs Escape | #30 | **RED REPRODUCED** | With a focused textarea and selection 5–12: **pointer Return → focus on `BODY`, selection lost. Escape → same textarea, same selection 5–12.** Pointer *entry* also lost focus and selection, and is the only way in. |
| **S8** Write edit → readings capture | #38 | **RED REPRODUCED** | A Write save (200) moved the draft to version 2 while the latest revision stayed 1, so the latest revision differed from the draft. The real `POST …/readings` returned **409 `revision_not_current`**, with **0 requests to the model boundary**. |
| **S9** GREEN control: checkpoint | #25, #38 | **GREEN CONTROL ESTABLISHED** | The existing checkpoint route returned 200 and the revision count went to 2, with the latest revision equal to the draft. The identical readings request **no longer refused `revision_not_current`**. It passed capture and reached the structured-model boundary (1 request), where the stub refused it. The route then returned 422 `provider_unavailable`. **No inference.** This proves the mechanism only, not any future UX. |

## 7. Source integrity (packet §11)

- **Before and after:** HEAD `e886888416062c7fcbcf899040e3827bc8013835`; **0 dirty paths**, untracked files included; **30 of 30 exercised canonical paths blob-identical to HEAD.**
- The 30 paths are listed in `evidence/integrity-*.txt`. They include the Write room, the save queue and hook, saving and capture, the readings, draft, checkpoint and locus routes, Home and the mode bar, and `package.json` / `package-lock.json`.
- **No product source was modified at any point in LS0.**

## 8. Not established by LS0
- Anything about production: flag values, migration state, data, real manuscripts.
- Behaviour on a production build. E1 ran `next dev`.
- Mobile or soft-keyboard behaviour; screen-reader behaviour.
- Any repair, replacement arrival rule, version semantics, Keep-a-version UX, bridge UX, disclosure-receipt design, durable last place, or EA isolation (packet §9).

## 9. Custody

- **Instruments:** `instruments/*` + `INSTRUMENT_MANIFEST.tsv`.
- **Evidence:** `evidence/`: `matrix.json`, integrity proofs, and per configuration `results.json`, `migrations/{applied,refused}.tsv`, `schema-manifest.json`, activity snapshots, triggers, E1 object list, `pg-errors-during-run.txt`, `stub.log`, `witness.log`.
- **Excluded:** session tokens, raw application and server logs, the PostgreSQL statement log (deleted at teardown).
- **Manifest:** every file's SHA-256 is in `EVIDENCE_MANIFEST.tsv`. Teardown is recorded separately in `TEARDOWN_RECORD.md`, after this package was hashed.

**STOP — FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A1-LS0 BASELINE DEFEAT WITNESS.**
No repair, LS1 packet, implementation, merge, deployment, production probe or successor act is authorized by LS0.
