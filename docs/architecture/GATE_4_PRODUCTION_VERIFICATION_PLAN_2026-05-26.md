# Gate 4 — Production Verification Plan

**Status:** Plan memorialized 2026-05-26. Execution pending external preconditions (#379 → #378 sequence). Verification window opens at deploy completion.

**Authority:** CLAUDE.md priority thread §4 (verification gate). Kelly directive 2026-05-26.

**Scope discipline:** Gate 4 verifies, it does not expand. No engagement-shape implementation, no episodic work, no dormant cleanup, no new memory behavior. Only deploy + verify what is already committed in the three-gate chain.

---

## §0. The three-commit chain being verified

```
46dd24923  docs(engagement):  close sacred-mirror engagement-shape ambiguity   ← Gate 3
bea61fb45  feat(consent):     add Memory & Consent surface + recall opt-out    ← Gate 2
cfcd742db  refactor(addenda): extract shared appendAllContextAddenda helper    ← Gate 1
```

On `feature/conversational-memory-phase2`. Gate 4 confirms the chain is operational in production, not whether it was a good idea — that question is foreclosed by the three already-committed cuts.

---

## §1. Decisions locked (2026-05-26)

| Decision | Choice | Rationale |
|---|---|---|
| Merge strategy | **Option α — PR with review** | Gate 4 is the constitutional inheritance bridge into episodic. Gate 1 changed prompt-path topology; Gate 2 introduced member-facing consent controls; Gate 3 clarified engagement-shape sequencing. All three form the inheritance layer episodic will open against. Implementation-sized downstream work still deserves a review boundary at this cut. |
| Verification window | **24h preliminary + 72h confirmation** | Preserves sequencing momentum (24h unblocks episodic spec authoring) without collapsing "early healthy signal" into "stable under live conditions" (72h closes Gate 4 formally). |
| Test member | **Fresh dedicated tester** | Avoids hidden history contamination; cleaner opt-out/opt-in verification; easier log attribution; cleaner future audit trail. |
| Scope memorialization | **This doc** | Prevents re-derivation under deploy pressure. Separates execution plan from execution result (results land in `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` §IV). Keeps Gate 4 observable as a constitutional verification stage, not "just deployment." Preserves the partial-DEEP caveat in load-bearing form. |

---

## §2. Execution order (Kelly directive)

```
1. Admin-merge #379
2. Merge #378 sequence (capsule adapter — separate from this gate)
3. Open PR: feature/conversational-memory-phase2 → clean-main-no-secrets
4. Commit Gate 4 verification plan doc (this file)
5. Review + merge PR
6. Apply migration to production PostgreSQL
7. Deploy
8. 24h preliminary verification
9. 72h confirmation verification
10. Episodic spec opens
```

**Position of this doc:** step 4. The plan must exist before the PR opens so the PR description can reference the verification criteria as the merge gate.

**Why #379 and #378 land first:** the capsule adapter PR sequence is operationally independent of Gate 4 conversational verification. Bundling them confuses the verification surface (any post-deploy anomaly becomes hard to attribute). Merging them first lets `clean-main-no-secrets` stabilize before the conversational chain lands; alternative would be merging conversational first and forcing capsule to rebase, which trades one risk for another. Kelly directive selects #379 → #378 → conversational order.

---

## §3. Pre-deploy prerequisites

### §3.A. Migration

```sql
-- database/migrations/20260524000001_member_conversational_recall.sql
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS conversational_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE;
```

Idempotent. Must land before or with the code deploy. Loader has graceful try/catch fallback (defaults to TRUE on column-missing) so timing is safe in either direction, but applying the migration first eliminates the fallback path entirely.

**Application command:**
```bash
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' \
  < database/migrations/20260524000001_member_conversational_recall.sql
```

**Verification:**
```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT column_name, column_default, is_nullable FROM information_schema.columns \
   WHERE table_name='\''members'\'' AND column_name='\''conversational_recall_enabled'\'';"'
```
Expected: `conversational_recall_enabled | true | NO`.

### §3.B. PR scope check (before merging)

```bash
git fetch origin clean-main-no-secrets feature/conversational-memory-phase2
git diff origin/clean-main-no-secrets..origin/feature/conversational-memory-phase2 --name-only
```
**Expected files only:**
- `lib/sovereign/maiaVoice.ts`
- `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`
- `app/api/members/recall-preferences/route.ts`
- `components/settings/MemoryConsentSection.tsx`
- `components/account/AccountSettings.tsx`
- `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md`
- `docs/architecture/GATE_4_PRODUCTION_VERIFICATION_PLAN_2026-05-26.md` (this file, once committed)

**Must NOT contain:** capsule files (`app/api/capsules/*`, `lib/capsules/*`), `CLAUDE.md`, `docs/canon/MAIA_MEMORY_CANON_v1.0.md`, `components/maia/MaiaLeftRail.tsx`, `app/labtools/reflections/page.tsx`. Those belong to PR #378 / #379 and travel separately.

### §3.C. Branch state check (before merging)

```bash
git branch --show-current
```
Must report `feature/conversational-memory-phase2`. If the deploy operator finds themselves on `fix/covenant-founders-bootstrap` or any other branch, do not proceed — surface the drift before any merge or deploy action. (Branch drift was an observed failure mode during Gate 2 implementation per session record 2026-05-26.)

---

## §4. Deploy sequence

```bash
# 1. Apply migration (per §3.A)
# (see §3.A)

# 2. After PR merge to clean-main-no-secrets — deploy from Mac Studio, executes on minisforum
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && git checkout clean-main-no-secrets \
  && git pull \
  && docker compose -p maia-sovereign -f docker-compose.production.yml \
       --env-file .env.production up -d --build maia'

# 3. Verify container freshness
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'
# Expected: timestamp under 1 minute old

# 4. Verify /api/health
curl -k https://soullab.life/api/health
# Expected: fresh JSON with uptime near zero
```

**Common pitfall (per CLAUDE.md):** rebuilding on the Mac Studio instead of minisforum. Verify with the minisforum-side `Created` check; the local Mac Studio stack will report healthy independently.

---

## §5. Verification criteria

Seven criteria. Each must pass at the 24h preliminary read, all must pass at the 72h confirmation read.

| # | Criterion | How verified | Pass condition |
|---|---|---|---|
| 1 | Deploy `feature/conversational-memory-phase2` to minisforum | `docker inspect maia-sovereign --format '{{.Created}}'` | timestamp < 1 minute old at deploy moment |
| 2 | `/api/health` ok | `curl -k https://soullab.life/api/health` | fresh JSON, uptime near zero |
| 3 | `[MAIA] conversational-block { emitted: true }` across ≥3 distinct members, multiple sessions | grep log for `MAIA] conversational-block` + `emitted: true`; count distinct `memberIdPrefix` | ≥3 distinct prefixes, each appearing across ≥2 timestamps separated by ≥session-resumption-window |
| 4 | Opt-out produces `suppressedReason: 'opt-out'` | Toggle off via `/account/settings → Memory & Consent` for dedicated tester (§6); trigger a conversation turn that would otherwise emit the block; grep logs | log line with `suppressedReason: 'opt-out'` present after toggle-off, absent before |
| 5 | Opt-in restores eligible recall | Toggle back on; trigger same turn-shape; grep logs | `emitted: true` for dedicated tester after toggle-on |
| 6 | DEEP **repair** path receives addenda marker after Gate 1 | Trigger a DEEP-tier turn (high lexical density or explicit depth request); grep logs for `[Conversational Recall]` log marker (from `appendAllContextAddenda`) appearing alongside a DEEP-tier indicator | marker present + DEEP-tier indicator (note: DEEP **repair** path only — see §7 Risk 1) |
| 7 | Record verification table in architecture doc | Append filled-in version of this table to `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` §IV gate, with 24h preliminary and 72h confirmation columns | doc commit with results filled at each read |

### §5.A. Grep commands (canonical)

```bash
# Criterion 3 — distinct-member count and session-spread
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
  | grep "MAIA] conversational-block" \
  | grep "emitted: true" \
  | head -50'
# Operator: count distinct memberIdPrefix in output; confirm ≥3.

# Criterion 4 — suppression marker
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 \
  | grep "MAIA] conversational-block" \
  | grep "suppressedReason"'
# Operator: confirm 'opt-out' present for dedicated tester memberIdPrefix.

# Criterion 6 — DEEP repair path addenda
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
  | grep -E "(\[Conversational Recall\]|MAIA] conversational-block)" \
  | grep -B 2 -A 2 "DEEP\|depthProfile"'
# Operator: confirm [Conversational Recall] marker appears in a DEEP-tier context.
```

---

## §6. Dedicated tester

**Username:** `phase2_gate4_tester_20260526`
**Purpose:** opt-out/opt-in verification (criteria 4 + 5); fresh history avoids contamination.
**Setup at deploy time:**
1. Create member row via `/signin` → "New to Soullab? Begin Journey" flow OR via direct SQL insert mirroring the registration shape (consult `database/migrations/20260103000001_members.sql` for schema)
2. Complete onboarding so `onboarded = true`
3. Have at least 2 prior cross-session exchanges saved (necessary for recall eligibility — otherwise criterion 3-5 don't have substrate to test against)
4. Note the `memberId` for log attribution

**Retirement:** retain the tester record for 72h confirmation read, then either delete (preferred — avoids polluting member counts) or relabel as historical-tester. Decision deferred to deploy operator.

**Log attribution:** because the system logs `memberIdPrefix` (not full ID) in `[MAIA] conversational-block` lines, note the first 8 chars of the dedicated tester's `memberId` at setup time so log greps can target it directly.

---

## §7. Risk flags (load-bearing)

### §7.A. Risk 1 — DEEP verification is partial (load-bearing, must not be compressed)

Gate 1 closed **§II.B** of `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` — DEEP **repair path** via `buildMaiaComprehensivePrompt`.

Gate 1 **did not close §II.C** — DEEP **primary path** via `consciousnessOrchestrator.processRequest`. That path remains uninstrumented.

**Criterion 6 verifies the repair path only.** A passing criterion 6 does NOT mean DEEP is fully wired.

**Compression to refuse, both in this doc and in any downstream summary:**
- ❌ "DEEP verified"
- ❌ "DEEP fully unified"
- ❌ "Phase 2 live across all tiers"

**Correct compressions:**
- ✅ "DEEP repair path verified; DEEP primary path remains open (§II.C)"
- ✅ "FAST + CORE + DEEP repair path verified; DEEP primary path tracked separately"
- ✅ "Phase 2 verified across the tiers Gate 1 wired; DEEP primary path is a separate cut"

This distinction is load-bearing because the constitutional-inheritance cluster (per memory `project_constitutional_defense_mechanisms`) explicitly identifies *bypass-by-renaming* as one of the three erosion routes: "DEEP verified" is exactly the kind of rename that lets a partial completion collapse into an apparent total completion. The plan doc preserves the distinction structurally; reviewers and operators must preserve it linguistically.

### §7.B. Risk 2 — Dedicated tester setup

Criteria 4-5 fail silently if the dedicated tester has no prior cross-session exchanges. Without recall-eligible substrate, toggling off and on produces no observable difference because the block was already suppressed by criterion §II.C.3 (`exchanges.length === 0 → suppress (empty)`). Setup step 3 in §6 (≥2 prior cross-session exchanges) is therefore prerequisite to criteria 4-5 being meaningful.

### §7.C. Risk 3 — Log retention window

`docker logs --since 24h` works if the container hasn't rotated logs in that window. If Docker log rotation kicks in mid-window, criterion 3 reads become incomplete (distinct-member counts drop because earlier turns are lost). Before declaring criterion 3 verified, confirm rotation policy: `ssh soullab@minisforum 'docker info --format "{{.LoggingDriver}}"; docker inspect maia-sovereign --format "{{json .HostConfig.LogConfig}}"'`. If rotation occurs faster than the 72h window, the verification needs an external log sink (substrate monitor DB rows, or a temporary log capture) to preserve the full 72h record.

### §7.D. Risk 4 — Capsule work leakage during merge

The §3.B file allowlist is the primary defense. If a reviewer merges the PR without checking that the diff matches the allowlist, capsule files could ride into `clean-main-no-secrets` and entangle Gate 4 verification with PR #378's deploy surface. The PR description must explicitly enumerate the expected files (copy from §3.B); the reviewer's approval should reference that match.

### §7.E. Risk 5 — Branch drift during deploy

Per §3.C — branch drift onto `fix/covenant-founders-bootstrap` (or any other branch) was an observed failure mode during Gate 2 implementation. The deploy operator must explicitly confirm `git branch --show-current` reports `feature/conversational-memory-phase2` (pre-merge) or `clean-main-no-secrets` (post-merge) before any merge, push, or deploy action.

---

## §8. Verification window mechanics

**24h preliminary read:**
- Opens: at deploy completion (when criterion 1 passes — container Created < 1 minute old at the deploy moment)
- Closes: 24 hours later
- Pass conditions: all 7 criteria pass within this window
- Outcome: "Phase 2 preliminary verified" — unblocks **episodic spec authoring** (not implementation; spec drafting allowed; episodic Phase 1 / Phase 2 implementation requires 72h confirmation)

**72h confirmation read:**
- Opens: at the 24h preliminary close (whether passed or not)
- Closes: 72 hours after deploy completion
- Pass conditions: all 7 criteria pass at this read; cumulative evidence across 72h shows stability
- Outcome: **Gate 4 formally closed.** Unblocks episodic spec implementation, engagement-shape implementation, and the rest of the sequence per CLAUDE.md priority thread.

**If 24h preliminary fails:**
- Criteria 1-2: revert per §10 rollback. Gate 4 reopens after the cause is fixed.
- Criteria 3-6: log specific failure; do not roll back; investigate without compounding fix work into Gate 4 scope.
- Criterion 7: append failed-state row to the §IV gate doc; do not pretend the criterion was met.

**If 72h confirmation fails after 24h passed:**
- Indicates instability under longer load. Investigate, file specific issue, do not bundle fix with engagement-shape implementation or episodic work. Gate 4 remains open until 72h passes cleanly.

---

## §9. Documentation landing

**This file (plan):** `docs/architecture/GATE_4_PRODUCTION_VERIFICATION_PLAN_2026-05-26.md` — execution plan, decisions, risks, mechanics.

**Verification results:** `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` §IV gate — append filled-in verification table at each read (24h preliminary, 72h confirmation). The §IV gate is the canonical landing because Phase 2 spec already names it as the verification surface; reusing it preserves single-source-of-truth.

**No new doctrine memory entries land via Gate 4.** Per the constitutional inheritance cluster, verification artifacts go in docs; doctrine consolidation is a separate pass.

---

## §10. Rollback

**If criteria 1-2 fail (deploy or health):**
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git reset --hard <prior-clean-main-no-secrets-SHA> \
  && docker compose -p maia-sovereign -f docker-compose.production.yml \
       --env-file .env.production up -d --build maia'
```
Note the prior SHA before deploy. The migration is non-destructive (adds a column, default TRUE) — no DB rollback needed even if code is reverted.

**If criteria 3-6 fail:** do not roll back. Keep deploy live (members get the default-on conversational recall, which is the prior behavior anyway). File a specific issue per failing criterion. Investigate without bundling fix work into other gates.

---

## §11. Out of scope (explicit per Kelly directive)

- Engagement-shape implementation (deferred per Gate 3 closure; unblocked by 72h confirmation only)
- Episodic Phase 2 spec **implementation** (24h unblocks **drafting** only; implementation requires 72h confirmation)
- Dormant service cleanup
- New memory behavior (no schema, no loader, no prompt influence beyond what's already committed)
- PR #378 / #379 capsule adapter sequence (separate merge/deploy/verify track)
- §II.C `consciousnessOrchestrator.processRequest` audit (separate cut; tracked in `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`)

---

## §12. Closure conditions

Gate 4 is **preliminary verified** when all 7 criteria pass at the 24h read.
Gate 4 is **formally closed** when all 7 criteria pass at the 72h confirmation read AND the verification table is committed to the §IV gate doc.

Until 72h confirmation passes, the language remains *"Phase 2 preliminary verified, gate 4 awaiting confirmation."* No upgrade of language without the corresponding read.

---

**This plan does not change anything in production. It memorializes the steps so that when execution begins, no decision needs to be re-derived under deploy pressure.**
