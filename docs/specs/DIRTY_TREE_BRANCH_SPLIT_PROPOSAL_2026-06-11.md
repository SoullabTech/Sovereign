# Dirty-Tree Branch Split Proposal — 2026-06-11

**Audit type:** READ-ONLY. No tracked file was modified, staged, committed, or checked out. This document is the only write.
**Working tree audited:** `/Users/soullab/MAIA-SOVEREIGN` on `fix/studio-calendar-timezone-edit` (HEAD `ec78bf52e`).
**Proposed base for every branch below:** `clean-main-no-secrets`.
**Method:** classification from file path + sampled diff hunks (raw diffs kept in sandbox, never dumped).

> Scope note: a separate clean docs worktree exists in `git worktree list`; it was ignored. Only this working tree was audited. The PERSONAL_PORTAL / DAILY_FLOW / THRESHOLD_* / THRESHOLD_PRINCIPLE / THRESHOLD_ARRIVAL_SCRIPTS / THRESHOLD_NAVIGATION_DOCTRINE / THRESHOLD_RITUAL docs and any prior `DIRTY_TREE_BRANCH_SPLIT_PROPOSAL*` were excluded per instruction.

---

## 0. Headline numbers

- **255 changed paths** in `git status --porcelain` (NOT ~40): **74 modified tracked files** + **181 untracked entries** (many of which are *directories* that expand to far more files).
- The untracked set is dominated by **docs** (~120 `.md` files across `docs/**`, `Community-Commons/**`, `content/**`) and **two large junk caches** (`jest_dx/` = 102 files, `tsx-501/` = 32 files).
- The *code* changes cluster into ~12 coherent threads. The owner's active priority work — **feedback-inbox + image-attachments** — is real, well-formed, and largely separable.

---

## 1. JUNK / DO-NOT-COMMIT (handle first, separately)

These are **not features**. They should be `.gitignore`'d, not branched:

| Path | What it is | Action |
|---|---|---|
| `jest_dx/` (102 files: `haste-map-*`) | Jest haste-map cache | Add to `.gitignore`; never commit |
| `tsx-501/` (32 files: `NNNNN-<sha>`) | `tsx`/esbuild compile cache (uid-501 tmp) | Add to `.gitignore`; never commit |

> Recommend a tiny `chore/gitignore-build-caches` branch that adds `jest_dx/` and `tsx-501/` to `.gitignore`. **Do not** let these ride any feature branch.

---

## 2. CONFIG FILES — flagged, do NOT ride a feature branch blindly

| File | Change | Verdict |
|---|---|---|
| `CLAUDE.md` | diff shows **no visible `+`/`-` content** in sampling — appears to be a **whitespace/trailing-newline-only** change (`--stat` says `1 +`). | **Almost certainly accidental.** Recommend **discarding** this hunk rather than committing it. Confirm with `git diff CLAUDE.md` before any restore. |
| `.claude/launch.json` | adds local debug launch configs pointing at **personal worktree paths** (`/Users/soullab/maia-admin-monitor`, `maia-private-members-discoverability`, ports 3010/3011). | **Developer-local, machine-specific.** Should NOT ship on a feature branch. Either keep local-only (consider gitignoring) or its own `chore/launch-configs` commit. Do not bundle with features. |
| `.gitignore` | adds `artifacts/field-capture/` (Boundary Audit field captures — member content, sanctuary-skipped). | Belongs to the **Boundary Audit / field-capture** thread (Branch I). |
| `next.config.js` | adds `outputFileTracingIncludes` for `/beta-testers` → `content/beta-testers/**/*.md`. | Belongs to the **beta-tester learning field** thread (Branch H). |
| `package.json` | adds `"check:ledger"` jest script targeting `lib/consciousness/lenses/__tests__/claimLedger.test.ts`. | Belongs to the **claim-ledger / lenses** thread (Branch K). |
| `scripts/capacitor-patch-routes.sh` | adds `"beta-testers"` to excluded dynamic routes. | Belongs to the **beta-tester learning field** thread (Branch H). |
| `public/consciousness-manifest.json` | one-char fix: `/maya?...` → `/maia?...`. | Trivial typo fix; fold into any small infra/chore branch or its own one-liner. Not load-bearing for any feature. |

---

## 3. PRIORITY — Feedback inbox + image attachments

The owner's active work splits cleanly into **two priority branches** that share one foundation (`lib/team/attachments.ts`, `lib/storage/fileVault.ts`).

### Branch A (PRIORITY) — `feat/colab-image-attachments`
**Purpose:** image attachments on Co-Lab channel + DM messages (multipart upload, vault storage, render).
**Base:** `clean-main-no-secrets`.
**Files:**
- `lib/team/attachments.ts` *(new — server-authoritative validation/processing: `processUploadedImages`, `parseStoredAttachments`, `toClientAttachments`, `channelServeBase`, `AttachmentValidationError`)*
- `lib/storage/fileVault.ts` *(new — byte storage under `FILE_STORAGE_PATH`)*
- `app/api/team/channels/[channelId]/attachments/` *(new route — serve bytes)*
- `app/api/team/dm/[dmId]/attachments/` *(new route — serve bytes)*
- `app/api/team/channels/[channelId]/messages/route.ts` *(modified — accept multipart, `processUploadedImages`)*
- `app/api/team/dm/[dmId]/messages/route.ts` *(modified — same)*
- `lib/team/ChannelService.ts` *(modified — `parseStoredAttachments`/`toClientAttachments` on read; image-only allowed)*
- `lib/team/DMService.ts` *(modified — same; `'📷 Image'` preview)*
- `lib/team/types.ts` *(modified — `StoredMessageAttachment`, `MessageKind` additions — **see §6 shared-file note**)*
- `components/team/MessageInput.tsx` *(modified — file pick/preview/`MAX_IMAGES`; `onSend(body, kind, images)` signature change)*
- `components/team/MessageAttachments.tsx` *(new — render)*
- `components/team/ChannelView.tsx` / `components/team/DMView.tsx` / `components/team/MessageBubble.tsx` / `components/team/ThreadPanel.tsx` *(modified — pass/render attachments, new `onSend` signature)*
- `database/migrations/20260610000001_team_message_attachments.sql` *(this feature's migration)*
- `app/api/team/__tests__/` *(new — if covering attachments; verify)*

**Risk/sequencing:** This branch and Branch B both depend on `lib/team/attachments.ts` + `lib/storage/fileVault.ts`. Recommend **A lands first**; B rebases on A (or extract a tiny `feat/attachments-core` base shared by both — see §6).

### Branch B (PRIORITY) — `feat/feedback-inbox-and-screenshots`
**Purpose:** platform feedback gets screenshot attachments + an admin triage inbox + lifecycle (status) states.
**Base:** `clean-main-no-secrets` (depends on attachments-core from A — see §6).
**Files:**
- `app/api/feedback/route.ts` *(modified — multipart `images`, vault store via `processUploadedImages`/`readVaultBytes`, screenshots ride the notification email)*
- `components/feedback/FeedbackSheet.tsx` *(modified — `ImagePlus`, paste/pick screenshots, previews)*
- `app/admin/feedback-inbox/` *(new — admin triage UI)*
- `app/api/admin/feedback/` *(new — inbox list/lifecycle API)*
- `app/admin/page.tsx` *(modified — adds "Feedback Inbox" nav link)*
- `database/migrations/20260611000001_platform_feedback_attachments.sql`
- `database/migrations/20260611000002_platform_feedback_lifecycle.sql`
- Doc: `docs/specs/COLAB_IMAGE_ATTACHMENTS_2026-06-10.md` *(may belong to A — co-locate with whichever ships the attachment-core)*

**Risk/sequencing:** `app/api/feedback/route.ts` imports `@/lib/team/attachments` and `@/lib/storage/fileVault` — **hard dependency on Branch A's new files.** B must rebase on A or on the extracted attachments-core.

---

## 4. Co-Lab / SoulComms threads (separable from attachments)

### Branch C — `feat/colab-notification-preferences`
**Purpose:** per-member team notification preferences (event × channel) + `/team/notifications` settings surface + consent-gated email notify.
**Files:**
- `lib/team/notificationPreferences.ts`, `lib/team/notificationTypes.ts` *(new)*
- `lib/team/__tests__/notificationPreferences.test.ts` *(new)*
- `lib/team/notifications.ts` *(modified — `resolveNotificationPreference` consent gates; `sendEmail`; manage-footer)*
- `components/team/NotificationSettings.tsx` *(new)*
- `app/team/notifications/` + `app/api/team/notifications/` *(new — page + API)*
- `components/team/TeamSidebar.tsx` *(modified — adds 🔔 Notifications nav)*
- `database/migrations/20260609000003_member_notification_preferences.sql`
- Doc: `docs/architecture/NOTIFICATION_AVENUES_INVENTORY_2026-06-06.md`

**Dependency:** `notifications.ts` imports `@/lib/email/sendEmail` → **depends on Branch G (central email sender).** Sequence G → C.

### Branch D — `feat/colab-linkify`
**Purpose:** auto-linkify URLs in team messages.
**Files:** `lib/team/linkify.ts`, `lib/team/__tests__/linkify.test.ts`, `components/team/MessageText.tsx` *(all new)*. Verify whether any `MessageBubble`/`MessageInput` hunk references linkify (sampling said **no** — they look attachments-only), so this should be cleanly independent.
**Risk:** low; self-contained. Confirm no overlap with A in `MessageBubble.tsx`.

### Branch E — `feat/colab-team-shell`
**Purpose:** extract `TeamShell` wrapper for the team layout.
**Files:** `components/team/TeamShell.tsx` *(new)*, `app/team/layout.tsx` *(modified — renders `<TeamShell>`)*.
**Risk:** low, but `app/team/layout.tsx` is a shared shell — make sure C/D don't also need to touch it. (Sampling shows layout.tsx change is ONLY the TeamShell wrap.)

### Branch F — `feat/soulcomms-multi-team` *(verify against parked worktrees — may already be in flight)*
**Purpose:** multi-team SoulComms (channels-per-team, practitioner commons channels).
**Files:** `lib/team/teamRouting.ts` *(new)*, `app/api/team/channels/route.ts` *(modified)*, `app/api/team/decisions/[decisionId]/` *(new)*, migrations `20260609000001_soulcomms_multi_team.sql`, `20260609000002_soulcomms_practitioner_commons_channels.sql`, `20260607000001_integration_passes_record_type.sql` *(verify — may belong to Branch L corpus instead)*.
Docs: `SOULCOMMS_MULTI_TEAM_SPEC`, `SOULCOMMS_TEAM_IN_URL`, `SOULCOMMS_M2_DELTAS_HANDOFF`, `SESSION_ROOM_TO_COLAB_WIRE_SPEC`, `COLAB_DECISION_LOOP_*`.
**Risk:** **HIGH overlap with existing worktrees** (`maia-colab-teams`, `maia-private-channel-roster`, etc.). This may duplicate already-branched work — reconcile before creating. `app/api/team/channels/route.ts` is shared with the channels surface; confirm it isn't also touched by D/E.
**`integration_passes_record_type` migration is AMBIGUOUS** — see Branch L.

---

## 5. Cross-cutting foundation + remaining feature threads

### Branch G — `feat/central-email-sender` (FOUNDATION — land early)
**Purpose:** one central transactional-email wrapper that always inspects Resend `error` and never throws.
**Files:** `lib/email/sendEmail.ts` *(new)*; `lib/email/sendBetaInvite.ts`, `lib/email/sendBetaInviteWithPasscode.ts` *(modified — route through it)*.
**Sequencing:** **Consumed by Branches B (feedback email), C (notify), H (beta invites), and the auth branch (J).** Land G first, or extract `lib/email/sendEmail.ts` as a shared base. Note: an existing worktree `maia-email-sender` (`feature/central-email-sender`) likely already holds this — **reconcile, don't duplicate.**

### Branch H — `feat/beta-tester-learning-field`
**Purpose:** beta-tester cohort learning-field pages + doctrine markdown loader.
**Files:** `app/beta-testers/` (15), `app/api/beta-testers/` (9), `app/api/admin/beta-testers/` (9), `app/admin/beta-testers/content/`, `lib/beta-testers/` (5), `content/` (4 — `content/beta-testers/*.md`), `next.config.js` *(outputFileTracingIncludes)*, `scripts/capacitor-patch-routes.sh` *(exclude line)*, migration `20260603000001_beta_tester_field.sql`. Invite/guide docs: `BETA_TESTER_INVITATION_UNIFIED_VOICE`, `COLAB_BETA_*_GUIDE`.
**Risk:** large but self-contained. The `next.config.js` and capacitor-patch hunks MUST travel with this branch (they reference `content/beta-testers/**`).

### Branch I — `feat/boundary-audit-field-capture`
**Purpose:** Boundary Audit field-package capture at the live model seam (member-content; gitignored artifacts).
**Files:** `lib/ai/fieldCapture.ts` *(new)*, `.gitignore` *(adds `artifacts/field-capture/`)*, `lib/consciousness/LLMProvider.ts` + `lib/ai/claudeClient.ts` + `lib/ai/modelService.ts` *(modified — capture wired at the fingerprinted chokepoint; PLUS an Ollama-routing fix, see note)*. Docs: `BOUNDARY_AUDIT_PROTOCOL_2026-06-08.md`.
**⚠️ Note / possible split:** the `LLMProvider`/`modelService` hunks contain **two concerns**: (a) field-capture wiring and (b) a **local-tier Ollama routing bug fix** (`config.provider === 'ollama'` was being sent to Claude → 404 masked as "Primary provider unavailable"). The Ollama fix is arguably its own `fix/local-tier-ollama-routing` branch. Decide whether to split; they are interleaved in the same files.

### Branch J — `feat/unified-auth`
**Purpose:** collapse signin/signup/test-elemental into one `UnifiedAuth` component; magic-link/recover via central email; email login-code path.
**Files:** `components/auth/UnifiedAuth.tsx` *(new, 465 LOC)*, `app/signin/page.tsx` (−1382 net → thin `<UnifiedAuth/>`), `app/signup/page.tsx` (−517 → thin wrapper), `app/test-elemental/page.tsx` (−157), `app/api/members/magic-link/route.ts`, `app/api/members/recover/route.ts` *(modified — `sendEmail`/`SENDERS`)*, `app/api/members/email-code/` *(new)*, migration `20260604000001_email_login_codes.sql`. Docs: `AUTH_IDENTITY_HARDENING_2026-06-09`, `SESSION_AUTH_HARDENING_SPEC_2026-06-09`, `security/SESSION_TOKEN_MIGRATION`, `security/ONBOARDING_SESSION_MINT_FIX`.
**Dependency:** magic-link/recover import `@/lib/email/sendEmail` → **depends on Branch G.** Sequence G → J.
**Risk:** the −1382/−517 deletions are large; verify `welcome-back`/`onboarding` small hunks belong here (sampling inconclusive — they may be unrelated redirect tweaks).

### Branch K — `feat/wisdom-guide` (+ claim-ledger lenses)
**Purpose:** member-chosen "standing guide" / Wisdom Council picker → prompt addendum; archetypal grammar; claim-ledger lens tests.
**Files:** `lib/wisdom/` (new: `wisdomGuidePrompt.ts`, `wisdomGuidePersistence.ts`, `archetypeGrammar.ts`, `WisdomFacets.ts`, `QuietWisdoms.ts`, `wisdomGraphService.ts`, `WisdomQuotes.ts`, `wisdomSources.ts`, `sacredTexts/`, `__tests__/`), `app/api/members/wisdom-guide/` *(new)*, `app/api/members/recall-preferences/route.ts` *(modified — `recurrence_recall_enabled` — **actually recurrence, see Branch M**)*, `components/wisdom/CurrentTeachingModal.tsx` *(modified — `onClearGuide`)*, `lib/sovereign/maiaService.ts` + `lib/sovereign/maiaVoice.ts` *(modified — `wisdomGuideAddendum` into prompt)*, migration `20260605000001_member_active_guide.sql`. Lenses sub-cluster: `lib/consciousness/lenses/` (11), `docs/lenses/` (10), `package.json` `check:ledger`. Docs: `GUIDE_*`, `ARCHETYPAL_GRAMMAR.md`, `MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md`, `THE_EMPTY_THRONE.md`, `docs/canon/grammar/`.
**⚠️ Consider splitting** wisdom-guide (runtime feature) from claim-ledger/lenses (epistemic-lint tooling) — they share no files except `package.json`. Two branches: `feat/wisdom-guide` and `feat/claim-ledger-lenses`.

### Branch L — `feat/corpus-callosum-record-type` (+ substrate monitor + astrology)
**Purpose:** `integration_passes.record_type` (trace_observation vs synthesis) + substrate monitor admin page + Mayan/astrology context insights.
**Files:** `lib/services/corpusCallosumService.ts` *(modified — record_type clauses)*, `lib/services/maiaAstrologyContextService.ts` *(modified — Mayan insights)*, `app/admin/maia/substrate/page.tsx` (+424) + `app/api/admin/maia/substrate/route.ts` + `lib/maia/substrateMap.ts` *(modified — monitor UI)*, migration `20260607000001_integration_passes_record_type.sql`. Docs: `SYNTHESIS_MERGE_GATE_SPEC`, `EXECUTIVE_DISCERNMENT_PROVENANCE_MAP`.
**⚠️ Ambiguity:** the `record_type` migration was listed under Branch F (multi-team) candidate too — it belongs **here** (corpus), not multi-team. The substrate-monitor page change and the astrology change are arguably **two more sub-threads**; they're grouped only because all are "MAIA substrate observability." Split if desired.

### Branch M — `feat/single-member-recurrence`
**Purpose:** single-member theme-recurrence detector (#2), observation-stage receipt, gated surfacing prefs.
**Files:** `lib/maia/recurrenceDetector.ts` *(new)*, `app/api/members/recall-preferences/route.ts` *(modified — `recurrence_recall_enabled`)*, migration `20260601000001_member_recurrence_recall.sql`, and the **recurrence hunks inside `app/api/sovereign/app/maia/list/route.ts`** — **see §6 (this route is multi-thread).**

### Branch N — `feat/episodic-mark-and-stance`
**Purpose:** member-marked episodic write path (turn-primary, sanctuary-guarded) + retained-stance detection/re-anchor + surface-exchange read.
**Files:** `lib/sovereign/episodicSourceGuard.ts`, `lib/sovereign/surfaceExchangeTurns.ts`, `lib/sovereign/stanceDetector.ts`, `lib/sovereign/stanceReanchor.ts` *(all new; stance promoted from `scripts/repro/`)*, `app/api/sovereign/episodes/mark/route.ts` *(modified)*, `lib/consciousness/interruptionLedger.ts` *(new — interruptibility telemetry)*, `lib/consciousness/epistemicLint.ts` + `lib/consciousness/__tests__/epistemicLint.test.ts` *(new — may belong with Branch K lenses instead)*. Docs: `ENTRUSTMENT_*`, `ABSENT_MODE_PRACTICE_PROBE_PREREGISTRATION`, `MAIA_DISCERNMENT_MODE`, `GUIDE_ABLATION_PROTOCOL`. Scripts: `scripts/test-episodic-*.ts`, `scripts/probes/`, `scripts/repro/` (27 — **mostly dev repro; consider gitignoring rather than committing**).
**⚠️** `surfaceExchangeTurns` is also imported by `maia/list/route.ts` (see §6).

### Branch O — `feat/direct-recall-resolver`
**Purpose:** direct-recall resolver layer.
**Files:** `lib/memory/directRecall/` (4: `adapters.ts`, `index.ts`, `resolver.ts`, `types.ts`), `scripts/directRecall/`, `scripts/repro/`(subset). Docs: `DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md`. **Verify** whether any modified route consumes it (sampling did not surface a wire into `maia/list`).

### Branch P — `fix/voice-ios-playback-watchdog`
**Purpose:** iOS audio-hang guard — per-chunk playback watchdog + transcript accumulation.
**Files:** `lib/voice/StreamingAudioQueue.ts` (+101 — `playbackWatchdog`), `lib/voice/__tests__/StreamingAudioQueue.watchdog.test.ts`, `lib/voice/transcriptAccumulator.ts` + `lib/voice/__tests__/transcriptAccumulator.test.ts` *(new)*, `components/OracleConversation.tsx` (+158 — `BUILD_STAMP: ios_playback_watchdog`), `components/voice/ContinuousConversation.tsx`, `hooks/useStreamingVoice.ts`, `lib/tts/openaiTts.ts`, `app/api/voice/stream-conversation/route.ts` *(modified)*. **Verify** OracleConversation doesn't also carry stance/wisdom hunks (sampling showed watchdog only).

### Branch Q — `feat/studio-profile-settings`
**Purpose:** studio settings profile section (load/save via `/api/studio/profile`).
**Files:** `app/studio/settings/page.tsx` (+158), `app/api/studio/profile/route.ts` *(modified)*, `app/studio/layout.tsx` *(modified — verify it's profile-related, not unrelated)*. **Low confidence on `studio/layout.tsx` grouping** — confirm.

### Small / unclassified (need a human glance before assigning)
- `app/onboarding/page.tsx`, `app/onboarding/youth/page.tsx`, `app/welcome-back/page.tsx` — small hunks; sampling did **not** clearly tie them to a thread. Likely auth (J) or onboarding polish. **State: unclear — do not guess.**
- `lib/sovereign/maiaVoice.ts` / `lib/sovereign/maiaService.ts` — carry **both** wisdom-guide AND wuxing/astrology addenda in the same prompt template literal (see §6).
- `app/companion/` (1), `docs/**` mass (~120 files), `Community-Commons/**` (6), `docs/audit/`, `docs/review/`, `docs/integrations/`, `docs/curriculum/`, `docs/voice/`, `docs/onboarding/`, `docs/whitepaper/`, `scripts/load/`, `scripts/ops/`, `jest_dx/`, `tsx-501/` — **docs/scripts accumulation**, mostly orthogonal to code. Recommend a separate `docs/working-notes-2026-06` branch for the doc mass NOT excluded by instruction, and gitignore the caches. Co-locate each spec doc with its feature branch where the mapping is obvious (noted per-branch above); dump the rest into the docs branch.

---

## 6. MULTI-THREAD FILES (the hard part — cite hunks)

These files are touched by **more than one logical thread** and cannot be cleanly assigned to a single branch without splitting hunks:

1. **`app/api/sovereign/app/maia/list/route.ts`** (+136) — the most entangled file. Contains, in distinct hunks:
   - **wisdom-guide** (~11 refs): `import { buildWisdomGuideAddendum } …`, `loadActiveGuide` → Branch K
   - **recurrence** (~13 refs): `import { detectThemeRecurrence }`, `recurringThemeCount`, `[MAIA/sovereign] recurrence` log → Branch M
   - **surface-exchange / episodic** (~3 refs): `import { surfaceExchangeTurns }` → Branch N
   - **wuxing / bridged snapshot** (~27 refs): `buildWuXingSnapshot`, `computeWuXingMoment`, `BridgedSnapshot` → a separate **wuxing/bridged** sub-thread (not otherwise broken out; likely belongs with Branch L astrology/observability OR its own `feat/wuxing-snapshot`).
   **Recommendation:** split by hunk into K/M/N/(wuxing). If hunk-splitting is too costly, make **one carrier branch own the file** (whichever ships first) and have the others note the dependency. This file is the single biggest sequencing constraint.

2. **`lib/sovereign/maiaService.ts`** (+13) and **`lib/sovereign/maiaVoice.ts`** (+4) — the prompt-assembly template literal weaves **`wisdomGuideAddendum`** (Branch K) AND **`wuxingSnapshotAddendum` / `astrologyAddendum`** (Branch L/wuxing) into the **same single line**. These two threads literally share one line of code. Whichever branch ships first must include the shared addendum plumbing; the second rebases. Cannot be split by hunk (same line).

3. **`lib/team/types.ts`** (+34) — `StoredMessageAttachment` (Branch A) plus `MessageKind`/`ChannelMember`/`PromptScaffoldField` additions that may also serve C/F. Verify the non-attachment type additions; if they serve multi-team (F) or notifications (C), this file is shared across A/C/F. Likely safe to let **A own it** (attachments is the dominant change) and have C/F rebase.

4. **`lib/team/notifications.ts`** (+62) — imports BOTH `@/lib/email/sendEmail` (Branch G) AND `@/lib/team/notificationPreferences` (Branch C). Belongs to C, but **hard-depends on G**.

5. **`lib/consciousness/LLMProvider.ts` / `lib/ai/modelService.ts`** — field-capture wiring (Branch I) interleaved with the **Ollama local-tier routing fix**. Two concerns, same files. See Branch I note.

6. **`lib/consciousness/epistemicLint.ts`** — could attach to claim-ledger lenses (Branch K) OR episodic/stance discernment (Branch N). Ambiguous; assign by reading which feature actually imports it.

---

## 7. Recommended landing order (dependency-respecting)

1. **`chore/gitignore-build-caches`** (jest_dx/, tsx-501/) + discard the accidental `CLAUDE.md` whitespace hunk + decide `.claude/launch.json` (local-only).
2. **Branch G — central email sender** (foundation for B, C, H, J).
3. **`feat/attachments-core`** (extract `lib/team/attachments.ts` + `lib/storage/fileVault.ts` only) — foundation for A and B. *(Optional but clean.)*
4. **Branch A — colab-image-attachments** (PRIORITY).
5. **Branch B — feedback-inbox-and-screenshots** (PRIORITY; rebases on A + G).
6. Independent threads in any order: D (linkify), E (team-shell), C (notif-prefs, after G), H (beta-tester, after G), P (voice watchdog), Q (studio profile), O (direct-recall).
7. Memory/prompt threads last, carefully (shared `maia/list` + `maiaService`/`maiaVoice`): pick a carrier order among K (wisdom-guide), L (corpus/astrology/wuxing), M (recurrence), N (episodic/stance) — each subsequent one rebases on the prior because of §6 entanglement.
8. F (multi-team), I (boundary-audit) — **reconcile against existing worktrees first**; high duplication risk.

---

## 8. Three riskiest ambiguities (call out to the owner)

1. **`app/api/sovereign/app/maia/list/route.ts` + `maiaService.ts`/`maiaVoice.ts` are genuinely multi-thread at the line level** (wisdom-guide + recurrence + episodic + wuxing/astrology all in one route; two addenda on one prompt line). Clean per-branch commits here require either hunk-splitting or designating a single carrier branch and rebasing the rest. This is the dominant sequencing constraint.
2. **Heavy overlap with the ~60 existing worktrees** (`maia-email-sender`, `maia-colab-teams`, `maia-private-channel-roster`, `maia-relmem-phase1`, `maia-council-lens`, etc.). Several proposed branches (G email-sender, F multi-team, possibly C/D/E and the council/lens docs) may **duplicate work already on parked branches**. Reconcile before creating new branches — do not re-implement.
3. **`CLAUDE.md` (whitespace-only, likely accidental → discard) and `.claude/launch.json` (machine-local worktree paths → do not ship).** Plus the `LLMProvider/modelService` files mix a **real Ollama routing bug-fix** with field-capture wiring — that fix should arguably ship on its own and not wait behind the Boundary Audit thread. And `app/onboarding/*` + `app/welcome-back` small hunks are **unclassified** — their thread could not be determined from sampling and should be inspected, not guessed.
