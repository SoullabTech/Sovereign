# Branch triage: 2026-10-01

**Instrument:** `scripts/ops/branch-triage.sh` (read-only; it merges nothing, deletes nothing and writes no ref). **Raw data:** `BRANCH_TRIAGE_2026-10-01.tsv`. **Canonical:** `origin/clean-main-no-secrets` @ `8f8ba73b8`.

For each `claude/*` branch, the script asks one question: *would merging it change canonical?* It answers by merging in memory (`git merge-tree --write-tree`) and comparing the result with canonical's tree. Commit counts cannot answer this, because a squash-merged branch still counts as "ahead."

⚠️ **The first run was wrong, and here is why.** The session's container clone was shallow, so every branch looked unrelated to canonical: 516 came out as `CODE` and 1 as `ABSORBED`. The script now refuses to run on a shallow clone. The numbers below come from a full clone.

| Class | Count | Meaning | Disposition |
|---|---|---|---|
| ABSORBED | 13 | The merge would change nothing | Delete |
| DOCS_ONLY | 60 | The merge is clean, and only docs/`*.md` would change | Extract any record still owed, then delete |
| CODE | 56 | The merge is clean, and code would change | Founder decision: open a PR or close |
| CONFLICT | 226 | Cannot merge cleanly against canonical | Close, unless the branch is named as live work |

## CODE: the decisions that matter

### A. Sanctuary and safety work that never reached canonical (review first)
Sanctuary is an absolute boundary (CLAUDE.md, Sanctuary invariant 6). Guard code sitting on unmerged branches is a gap in that boundary, not a backlog item. ⚠️ A clean merge that would change code does **not** prove the work is missing from canonical: canonical may already carry a different repair of the same defect. Each branch needs to be checked against canonical's current guard before it is opened as a PR or closed.
- `claude/admiring-einstein-8p0itg` · 2026-09-20 · lib/sanctuary/__tests__/sanctuaryGuards.test.ts,lib/sanctuary/sanctuaryGuards.ts
- `claude/determined-bell-olsuy7` · 2026-09-17 · app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts,components/__tests__/sanctuaryCaptu
- `claude/magical-volta-yh4njo` · 2026-09-15 · lib/consciousness/__tests__/relationalObserverPossessionGuard.test.ts,lib/consciousness/relationalOb
- `claude/sacred-instance-2-repair` · 2026-09-09 · lib/memory/__tests__/sacredInstance2TaskBypassRisk.test.ts,lib/memory/beads-sync/MaiaBeadsPlugin.ts,
- `claude/sanctuary-settings-write-safety-01` · 2026-08-28 · __tests__/sanctuary-settings-write-safety-01.test.ts,components/MaiaSettingsPanel.tsx,components/acc
- `claude/sanctuary-settings-disconnect-01-memory-lane` · 2026-08-28 · __tests__/sanctuary-settings-disconnect-01.test.ts,app/maia/page.tsx,lib/settings/accountSettings.ts
- `claude/sanctuary-button-state-issue-872q0a` · 2026-08-28 · app/field/talk/page.tsx,app/maia/page.tsx,components/account/AccountSettings.tsx

### B. Live or very recent lanes (keep; each owns its own PR)
- `claude/affectionate-carson-i6nqfu` · 2026-10-01 · app/api/sovereign/manuscripts/[id]/review-discuss/route.ts,app/api/writers-studio/editorial/turn/__t
- `claude/wonderful-newton-ddw3gx` · 2026-10-01 · lib/consciousness/autonomy/SafetyCircuitBreakers.ts,lib/consciousness/autonomy/__tests__/SafetyCircu
- `claude/confident-bell-8b6cc5` · 2026-10-01 · tests/constitutional/jarvis-o5-r4/FREEZE.json,tests/constitutional/jarvis-o5-r4/candidates.mjs
- `claude/exciting-euler-w49hze` · 2026-10-01 · app/api/astrology/transit-field/route.ts,app/astrology/page.tsx,components/astrology/WhatIsAliveNow.
- `claude/cool-feynman-8kvyyc` · 2026-10-01 · maia-desktop/scripts/build.mjs,maia-desktop/test/cabin-runtime-packaging.test.mjs
- `claude/intelligent-clarke-v9zk51` · 2026-10-01 · lib/comms/emailRouter.ts,lib/email/__tests__/identity-authority.test.ts,lib/email/identity.ts
- `claude/gracious-shannon-c5zmvy` · 2026-09-29 · app/globals.css,app/layout.tsx,components/OracleConversation.tsx
- `claude/disk-space-cleanup-iyjp0r` · 2026-09-28 · scripts/ain-worktree-claim.sh,scripts/disk-census.sh,scripts/disk-data-inventory.sh

### C. Special handling
- `claude/festive-galileo-rplz8a` touches **2,993 files**, mostly `.jarvis/run/closeout-*`: committed runtime state. ⛔ Never merge it. Extract any authored file, then close.
- `claude/maia-turns-derivative-custody` carries a **migration** (`20260909000001_maia_turns_member_identi…`). Merging a migration to canonical authorizes the next deploy to apply it (2026-09-07 finding). It needs its own ruling.

### D. Remaining CODE (39): witness scripts, superseded experiments, and March–May one-commit branches
- `claude/busy-bohr-ngluni` · 2026-09-21 · scripts/witness/opencode-v2-containment-probe.sh
- `claude/wizardly-pascal-xjlgrm` · 2026-09-21 · work-units/wu-convergence-proof-portability-01.json
- `claude/ws-stage1-predeploy` · 2026-09-16 · scripts/witness/ws-stage1-postdeploy-verify.sh,scripts/witness/ws-stage1-predeploy-check.s
- `claude/loving-ramanujan-mlka7d` · 2026-09-15 · scripts/witness/ain-corpus-census.mjs
- `claude/w4-schema-implementation` · 2026-09-15 · scripts/witness/w4-post-landing-verify.sh,scripts/witness/w4-schema-land-preflight.sh
- `claude/ws-production-deploy-01` · 2026-09-15 · scripts/witness/ws-production-deploy-preflight.sh,scripts/witness/ws-production-deploy-pre
- `claude/jop-04-census` · 2026-09-14 · jarvis-desktop/src/main.js,scripts/builder/__tests__/desktop-c0-explorer-proof.mjs,scripts
- `claude/focus-assembler-custody-closure` · 2026-09-10 · lib/writers-studio/__tests__/focusProducer.test.ts,lib/writers-studio/assembleFocus.ts,lib
- `claude/ws-4b-witness-tooling` · 2026-09-09 · scripts/witness/whole-manuscript/export-work.sh,scripts/witness/whole-manuscript/witness-r
- `claude/local-fonts-closure` · 2026-09-06 · scripts/witness/local-fonts-production-witness.mjs
- `claude/ws2-08a-witness-custody-01` · 2026-09-06 · scripts/witness/ws2-08a-f6a-baseline.sh,scripts/witness/ws2-08a-f6b-compare.sh
- `claude/local-fonts-production-witness` · 2026-09-05 · scripts/witness/local-fonts-production-witness.mjs
- `claude/maia-reengagement-nudges-rtzrwg` · 2026-09-04 · app/api/reminders/[id]/route.ts,app/api/reminders/cancel/route.ts,app/api/reminders/route.
- `claude/memory-divination-between-room-01` · 2026-09-04 · app/api/between/chat/route.ts,lib/maia/canonical-turn/__tests__/divinationBetweenRoom.test
- `claude/maia-quality-acceptance` · 2026-09-03 · scripts/witness/now-what-register-and-history.ts
- `claude/chapter-10-kdp-revision-fee7ot` · 2026-09-01 · lib/manuscript/render/fonts/eb-garamond-static.css,lib/manuscript/render/print-book.css,sc
- `claude/ws2-02c-2r-witness-ltdfvw` · 2026-09-01 · .witness/browser-witness.mjs,.witness/seed.ts
- `claude/chapter-10-structure-7wz1ry` · 2026-08-31 · lib/manuscript/render/fonts/eb-garamond-static.css,lib/manuscript/render/print-book.css,sc
- `claude/jarvis-simulation-orchestration-sjsqm1` · 2026-08-29 · scripts/simulate-field-scaffold.sh
- `claude/maia-prosody-alloy-06r3r6` · 2026-08-28 · app/api/voice/stream-conversation/route.ts,lib/tts/__tests__/openaiSpeechAdapter.test.ts,l
- `claude/voice-capture-provenance-build` · 2026-08-28 · lib/provenance/captureProvenance.ts
- `claude/maya-voice-input-disconnect-agkuba` · 2026-08-25 · components/OracleConversation.tsx
- `claude/ops-dt-01-device-test-env` · 2026-08-25 · .gitignore,Caddyfile.device-test,docker-compose.device-test.yml
- `claude/session-room-capture-system-lzw56y` · 2026-08-25 · app/api/capture/[id]/promote/route.ts,app/api/capture/active-session/route.ts,app/api/capt
- `claude/jarvis-adapter-architecture-qrv8im` · 2026-08-24 · scripts/experiments/jma01_tokenrouter_probe.py
- `claude/jarvis-master-directive-ckcg9b` · 2026-08-24 · jarvis-desktop/src/main.js,jarvis-desktop/test/jop-05-c1-root-binding.test.mjs
- `claude/member-identity-portrait-split-y4zhaq` · 2026-08-24 · scripts/witness/identity-origin-read.sql,scripts/witness/member-identity-ownership-census.
- `claude/recover-kellys-soul-portraits-wldnv9` · 2026-08-24 · scripts/kelly-identity-footprint.sh,scripts/soul-portrait-db-witness.sh,scripts/soul-portr
- `claude/tokenrouter-kimi-k3-proof-f74ibx` · 2026-08-24 · scripts/jarvis-k3-00-keyshape.sh,scripts/jarvis-k3-00-probe.sh
- `claude/nostalgic-nash-dc7bf6` · 2026-05-14 · app/layout.tsx,components/NativeSessionHydrator.tsx,lib/storage/nativeSessionStorage.ts
- `claude/fervent-ardinghelli-5fa803` · 2026-05-05 · app/api/founder/field-signals/route.ts,app/founder/field-signals/page.tsx,lib/founder/foun
- `claude/zen-hermann-214ba3` · 2026-05-03 · scripts/ddns/iam-policy.json,scripts/ddns/install.sh,scripts/ddns/route53-ddns.service
- `claude/vigilant-mahavira` · 2026-04-01 · app/api/community/posts/[id]/route.ts,app/api/community/user-stats/route.ts,app/maia/commu
- `claude/awesome-murdock` · 2026-03-29 · app/api/oracle/conversation/route.ts,lib/greetings/greetingRender.ts,lib/maia/presence-gre
- `claude/flamboyant-feistel` · 2026-03-28 · app/api/oracle/conversation/route.ts,lib/maia/maiaPlanner.ts,lib/services/ClaudeService.ts
- `claude/clever-jackson` · 2026-03-23 · Dockerfile
- `claude/mystifying-poincare` · 2026-03-21 · lib/memory/MemberLiveContext.ts
- `claude/tender-mayer` · 2026-03-14 · app/api/oracle/conversation/route.ts,lib/consciousness/turnOutcome.ts
- `claude/gallant-yonath` · 2026-03-07 · components/OracleConversation.tsx,lib/maia/maiaPlanner.ts,lib/settings/accountSettings.ts

## ABSORBED: safe to delete
- `claude/determined-archimedes-d4ozo8` · 2026-09-30
- `claude/lucid-hopper-2hz7ty` · 2026-09-23
- `claude/auth-01-d3-shadow-authority-containment` · 2026-08-24
- `claude/xenodochial-bose-7a4504` · 2026-07-06
- `claude/hotfix-error-rethrow-redirects` · 2026-05-16
- `claude/peaceful-brattain-c8b5a8-final` · 2026-05-09
- `claude/peaceful-brattain-c8b5a8-fix-314` · 2026-05-09
- `claude/peaceful-brattain-c8b5a8-revert-319` · 2026-05-09
- `claude/peaceful-brattain-c8b5a8-tune-threshold` · 2026-05-09
- `claude/manuscript-remove-invocation-signature` · 2026-05-06
- `claude/manuscript-remove-part-placeholders` · 2026-05-06
- `claude/musing-nobel` · 2026-03-06
- `claude/goofy-wiles` · 2026-02-14

## DOCS_ONLY
- `claude/awesome-clarke-3yrktn` · 2026-10-01 · 1 files
- `claude/awesome-tesla-1itt11` · 2026-10-01 · 2 files
- `claude/charming-brown-olfead` · 2026-10-01 · 1 files
- `claude/charming-lovelace-j5h6bc` · 2026-10-01 · 1 files
- `claude/clever-mayer-q9zrym` · 2026-10-01 · 5 files
- `claude/magical-shannon-oht8gz` · 2026-10-01 · 4 files
- `claude/magical-shannon-oht8gz-rc1-witness` · 2026-10-01 · 8 files
- `claude/ecstatic-hamilton-cq5y89` · 2026-09-23 · 4 files
- `claude/admiring-turing-bodwdc` · 2026-09-20 · 3 files
- `claude/compassionate-edison-fgk9u5` · 2026-09-20 · 2 files
- `claude/focused-mccarthy-jv4xg7` · 2026-09-20 · 2 files
- `claude/intelligent-bell-6raooy` · 2026-09-20 · 1 files
- `claude/magical-feynman-5uu9wx` · 2026-09-20 · 2 files
- `claude/zen-keller-evr16j` · 2026-09-20 · 3 files
- `claude/adoring-goodall-0yhl8d` · 2026-09-17 · 2 files
- `claude/clever-einstein-mojiar` · 2026-09-17 · 1 files
- `claude/festive-sagan-apvfs5` · 2026-09-17 · 8 files
- `claude/loving-volta-k4gd1c` · 2026-09-17 · 6 files
- `claude/modest-brahmagupta-9r5fes` · 2026-09-16 · 2 files
- `claude/sweet-mayer-on4m5x` · 2026-09-15 · 8 files
- `claude/ws-02-census` · 2026-09-15 · 6 files
- `claude/elegant-mccarthy-k2zcgk` · 2026-09-14 · 2 files
- `claude/eloquent-clarke-fmz012` · 2026-09-13 · 6 files
- `claude/jws-01-census` · 2026-09-13 · 2 files
- `claude/nice-volta-fogiyw` · 2026-09-13 · 2 files
- `claude/voice-2026-research` · 2026-09-13 · 1 files
- `claude/voice-2026-research-ici0ph` · 2026-09-13 · 3 files
- `claude/cmt-focus-runtime-records-2026-09-10` · 2026-09-11 · 2 files
- `claude/focus-surface-design` · 2026-09-11 · 10 files
- `claude/finding-a-census` · 2026-09-09 · 1 files
- `claude/focus-disclosure-contract` · 2026-09-09 · 2 files
- `claude/focus-producer-01a-recovery` · 2026-09-09 · 1 files
- `claude/jarvis-flow-architecture-w2gont` · 2026-09-09 · 11 files
- `claude/two-day-integration-census` · 2026-09-09 · 2 files
- `claude/ws-focus-cognition-census` · 2026-09-09 · 1 files
- `claude/consciousness-technology-soul-7hgzk1` · 2026-09-08 · 2 files
- `claude/writer-author-studios-roadmap-b2tqf5` · 2026-09-08 · 6 files
- `claude/ws-write-selection-maia-01` · 2026-09-07 · 3 files
- `claude/deep-stage1-participation-census-01` · 2026-09-05 · 1 files
- `claude/elemental-alchemy-reading-group-as3p32` · 2026-09-04 · 5 files
- `claude/maia-whole-organism-census-01` · 2026-09-04 · 1 files
- `claude/ideas-t1-canonical-integration-01` · 2026-09-02 · 2 files
- `claude/jarvis-02c-witness-lane-e7qni0` · 2026-09-01 · 1 files
- `claude/d05-close-record` · 2026-08-28 · 1 files
- `claude/desktop-member-parity-census` · 2026-08-28 · 1 files
- `claude/fable-5-architecture-ucjwq0` · 2026-08-28 · 40 files
- `claude/ledger-b-lineage` · 2026-08-28 · 1 files
- `claude/member-entry-email-01` · 2026-08-28 · 1 files
- `claude/nw-f00-2-remeasure` · 2026-08-28 · 1 files
- `claude/nw-v1-design-01` · 2026-08-28 · 7 files
- `claude/signin-guidance` · 2026-08-28 · 1 files
- `claude/voice-capture-provenance-01` · 2026-08-28 · 1 files
- `claude/adoring-davinci-9ckuam` · 2026-08-24 · 2 files
- `claude/auth-lane-witness-record-73106dc9` · 2026-08-24 · 1 files
- `claude/jarvis-self-learning-build-uizovx` · 2026-08-24 · 1 files
- `claude/busy-lichterman-efd90c` · 2026-05-19 · 1 files
- `claude/laughing-gates-17573f` · 2026-05-16 · 1 files
- `claude/agitated-sutherland-93fb0a` · 2026-05-06 · 8 files
- `claude/park-authored-exception-doctrine` · 2026-05-06 · 1 files
- `claude/park-visual-lexicon-symbolic-atlas` · 2026-05-06 · 1 files

## CONFLICT, by month of last commit
Branches last touched before September are almost certainly superseded. The September ones include named lanes (W4/W5, proposal-authorization, S3, voice-2026), which should be checked against their closure records before closing.
- 2025-12: 1
- 2026-02: 15
- 2026-03: 36
- 2026-04: 14
- 2026-05: 13
- 2026-07: 1
- 2026-08: 53
- 2026-09: 91
- 2026-10: 2

The full list is in the TSV.

## Deleting (founder act; nothing here deletes)

**Archive before deleting (founder ruling):** every closure must be reversible. `scripts/ops/archive-branches.sh` tags `archive/<branch>` at the remote tip and pushes the tag. It deletes only with `ARCHIVE_DELETE_AUTHORIZED=1`, and only branches whose tag still equals the remote tip; a branch that moved after tagging is refused. Restore with `git push origin archive/<branch>:refs/heads/<branch>`. Verified on a scratch remote: tag, verify, unauthorized-refuse, moved-refuse, delete and restore all behave as stated.

```bash
L=$(scripts/ops/branch-triage.sh | awk -F'\t' '$1=="ABSORBED"{print $5}')
scripts/ops/archive-branches.sh tag    $L
scripts/ops/archive-branches.sh verify $L
ARCHIVE_DELETE_AUTHORIZED=1 scripts/ops/archive-branches.sh delete $L
```

**Sanctuary rows (section A) were verified by running each branch's own tests on canonical:** see `docs/programme/SANCTUARY_BRANCH_VERIFICATION_2026-10-01.md`. Five need porting (four protections absent, one live), one is covered, one is dead-code retirement.
