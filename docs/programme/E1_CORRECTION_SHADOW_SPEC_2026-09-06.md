# E1 — correction-candidate shadow · specification and build record

**Lane:** JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1, Phase 2 · **Authorized:** founder, 2026-09-06
(whole-organism map §9: "E1 correction-candidate shadow — first") · **Built:** 2026-09-06 on
`claude/maia-human-experience-phase1-census` · **Deploy:** NOT AUTHORIZED here — a founder act
via the deploy lane · **Status:** BUILT · GATED · UNDEPLOYED · UNWITNESSED.

## 1 · Stage 10 hypothesis (the form the charter requires)

*If* MAIA's live path had any system-level signal that the member's turn is a correction of
MAIA's previous response, *then* AP14 (Validation Spiral) and AP15 (Approval-Optimized
Relationship) would become falsifiable and P3 (correction as intelligence) would have a first
instrument. *Today* no such signal exists (map rank 1; 04 C1/C3; 01 G6). The shadow does not
test the hypothesis; it produces the counts the hypothesis needs.

## 2 · What was built

| Piece | Path | Nature |
|---|---|---|
| Classifier | `lib/maia/canonical-turn/correctionShadow.ts` | pure; zero imports; conservative English lexicon in three classes with precedence correction > not-it > disagreement; returns `null` under Sanctuary; declares no candidate without a prior MAIA response; output carries no member text |
| Route block | `app/api/sovereign/app/maia/list/route.ts` — "E1 — CORRECTION-CANDIDATE SHADOW" | after the interruption ledger, after the legacy `getMaiaResponse` call; try/catch; gated by `!isSanctuary && process.env.MAIA_CORRECTION_SHADOW !== '0'`; emits one `console.log('[MAIA/shadow] correction-candidate', { memberRef, candidate, markers, classes, hasPriorResponse, turnIndex })` per non-Sanctuary turn; no persistence |
| Unit falsifiers | `lib/maia/canonical-turn/__tests__/correctionShadow.test.ts` | 8 tests: Sanctuary refused; correction / not-it / disagreement; precedence; no prior response → none; ordinary turn → none, 0 markers; no content in output; never throws; stable marker |
| Registry falsifier | `tests/constitutional/refusal-registry/refusal-32-correction-shadow-observational.ts` (R32) | module has zero imports and no side-effect surface; block calls only the allowed set; try/catch; kill-switch + Sanctuary gate; block after cognition; no member-text key inside the log call |

## 3 · What it does not claim

- A candidate is a lexical marker, not a finding of misattunement. The lexicon is conservative
  and English-only; it will miss corrections and will flag some non-corrections ("that's not it"
  about a third party). Counts are diagnostic, never a score of MAIA.
- Nothing reads the classification: it runs after the response and no producer, prompt, router,
  memory writer or UI consumes it. Zero response diff by construction (R32).
- No member text is logged or stored; `memberRef` is pseudonymous and correlatable, not
  anonymous (`lib/privacy/memberRef.ts`). Sanctuary turns emit nothing.
- It does not make MAIA notice a correction. Whether MAIA notices is the E1 witness ("did MAIA
  notice when she got you wrong"), which needs Phase 4 consent and is not opened by this build.

## 4 · Gates at build (2026-09-06)

design-canon n/a (no member-facing surface) · `npx jest lib/maia/canonical-turn` (see build
record below) · `npm run check:refusals` 113 passed · 0 failed · 0 warned (24 refusals, R32
included) · CMT-01 gate set run and recorded below · `npm run typecheck` no regression ·
`npm run check:no-supabase` PASS · `git diff --check` clean.

**Build record.** `npx jest lib/maia/canonical-turn`: 5 suites, 79 tests, all pass (E1's 8
included). CMT-01 gate set (`cmt-01-gates.ts`): R25 RED and R26 RED (expected until M3); R27,
R28, R29, R31 GREEN; **R30 RED, unexpected — and PRE-EXISTING**: with the E1 change stashed the
same run reports R30 RED (`admission expanded beyond seed → practitioner.atoms_observations,
member.divination_intent, computed.divination_cast, house.divination_interpretation` — producers
admitted by earlier merged lanes, not by this build). Recorded, not repaired (stop rule); it is a
Phase 2 register item for the CMT-01 owner (pp-1 policy-version bump or seed reconciliation is a
founder decision). E1 adds no producer to the registry and does not touch pp-1.

## 5 · Witness plan (after a founder deploy act)

1. Deploy through the deploy lane; verify `GIT_COMMIT` and that `MAIA_CORRECTION_SHADOW` is unset (instrument on).
2. Window: 14 days. Read-only census: `docker logs maia-sovereign --since 336h | grep -c "\[MAIA/shadow\] correction-candidate"`, then distribution by `candidate` and by `hasPriorResponse`; per-`memberRef` counts only.
3. Record under the Phase 2 census terms (SHA, window, counts; no content). Result is *prevalence of candidate corrections*, nothing more.
4. The second stage — whether MAIA's *next* response acknowledges the correction — is a separate instrument (offline blind rating on consented transcripts, E9 dimensions) and a separate founder act.

## 6 · Kill-switch and rollback

`MAIA_CORRECTION_SHADOW=0` silences the instrument without redeploy. Revert of the single commit
is sufficient. No schema, no migration, no flag file.

## 7 · Deploy runbook (founder ruling 2026-09-06: isolated E1 commit only)

Candidate: branch `claude/e1-correction-shadow-deploy` at `0780f368` — the six E1 code paths of
`7d894b72` on canonical `ca5fdff4`; diff against canonical = E1 only (jest 79/79 · registry 113/0/0
with R32 · typecheck no regression). Never the Phase-2 head.

```bash
# from the Mac Studio; runs on minisforum through the deploy lane
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin claude/e1-correction-shadow-deploy \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/claude/e1-correction-shadow-deploy)"'

# witness, immediately after swap
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'            # → 0780f368
ssh soullab@minisforum 'docker exec maia-sovereign printenv MAIA_CORRECTION_SHADOW' # → empty (instrument on)

# 14-day window, counts only
ssh soullab@minisforum 'docker logs maia-sovereign --since 336h 2>&1 | grep -c "\[MAIA/shadow\] correction-candidate"'
ssh soullab@minisforum 'docker logs maia-sovereign --since 336h 2>&1 | grep "\[MAIA/shadow\] correction-candidate" | grep -o "candidate: .[a-z-]*" | sort | uniq -c'
```

Witness record fields (founder): candidate diff = E1 only · production `GIT_COMMIT` · kill-switch
unset · no response-path consumer (R32) · no Sanctuary emission (module + route gate) · no member
text in logs (R32) · window · counts/distributions only. `memberRef` stays, with no new
persistence or sink.
