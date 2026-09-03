# CMT-01 — M2 SHADOW DEPLOYMENT RUNBOOK

**Authorized**: 2026-09-03, founder. **Purpose**: collect the M2 live shadow witness. **Deploy exactly `2fafaa4`.**
**M3 remains explicitly unauthorized.** Legacy assembly stays response-producing; the canonical turn is shadow only.

**Branch rule in force**: `claude/canonical-maia-turn-j92opb` is **frozen to a single writer** until this witness is complete. `/list` and `adjudicate.ts` are load-bearing seam files; no concurrent branch writes.

**Where this runs**: the Mac Studio (`ssh soullab@minisforum`). The session that authored this runbook is a remote container with no route to minisforum; it prepared everything and cannot execute the deploy.

---

## 0. Pre-deploy condition — VERIFIED (only this was checked)

> The shadow path is observational. It must not duplicate member-state writes, writebacks, counters, recurrence updates, or other persistent side effects.

Pinned as **R31** (`tests/constitutional/refusal-registry/refusal-31-canonical-shadow-observational.ts`), run 2026-09-03 on the tree at `2fafaa4`+docs — **6/6 PASS**:

- the canonical-turn module has no persistence / side-effect surface (no db import, no write verb, no fetch, no ring-buffer push);
- the only DB touch reachable — `lib/auth/getMemberFromRequest` — is the read-only session `SELECT` that does not bump `last_active_at`;
- the `/list` shadow block calls exactly `resolveCanonicalIdentity, constructCanonicalTurn, candidatesFromLegacyAddenda, compareLegacyToCanonical, emitShadowDiff` (+ `console.warn`), in a `try/catch`, and the legacy `getMaiaResponse({` call follows it unchanged;
- `MAIA_CANONICAL_SHADOW` gates the instrument only.

Per-turn cost added: one indexed `auth_sessions` SELECT and two log lines. Nothing else.

Re-run before deploying if the tree moved: `npx tsx tests/constitutional/refusal-registry/cmt-01-gates.ts` → R31 must be GREEN (R25/R26 RED is expected).

---

## 1. Deploy `2fafaa4` (quick `maia`-only path, SHA-pinned)

The lane branch is not `clean-main-no-secrets`, so fetch it explicitly; the gate materializes the **named** commit via `git archive`, so the checkout on minisforum does not matter and later commits on the branch (docs, gates) are not what gets built.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin claude/canonical-maia-turn-j92opb \
  && git cat-file -e 2fafaa4^{commit} \
  && scripts/pre-deploy-gate.sh deploy-maia 2fafaa4'
```

Refuses if another deploy holds the lane lock (never delete the lockfile). Runs the Co-Lab boundary gate + disk gate, builds, refreshes rollback tags, swaps, verifies provenance. Does **not** run migrations (none in this SHA).

**Verify** (all four, per CLAUDE.md):

```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'      # < 1 min old
ssh soullab@minisforum 'hostname -I'                                                 # 192.168.0.104
curl -k https://soullab.life/api/health                                              # fresh JSON, uptime ≈ 0
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT DEPLOY_LANE'  # 2fafaa4 / deploy-lane
```

Record the witness **start** timestamp = the container `Created` time.

---

## 2. Witness window

Let real `/list` traffic flow. Bounded set: enough turns to include **at least one where memory/context is actually non-empty** (an authenticated member with atoms / recall / member web — `canonicalCount > 0` on the shadow line). Nothing to do during the window except not deploy anything else.

Watch (content-free lines only):

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "\[MAIA/shadow\]|canonical construction failed"'
```

**If one line shows `zeroDiff:false` or a construction failure: stop the witness. Classify it. Do not normalize, suppress, or fix M3 around it.** That line, verbatim (it carries producer ids and digests, never content), is the finding.

---

## 3. Collect the record

Record the witness **end** timestamp, then:

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since "<START>" --until "<END>" 2>&1' \
  | grep -E "\[MAIA/(shadow|manifest)\]|canonical construction failed" \
  | npx tsx scripts/witness/cmt-01-shadow-witness.ts --sha 2fafaa4 --start "<START>" --end "<END>" \
  | tee docs/programme/CMT-01_M2_LIVE_WITNESS_<date>.json
```

The collector emits exactly the founder-specified record — deployed SHA (as observed in every manifest's `buildSha`), window, number of shadow comparisons, `zeroDiff:true` count, turns with a non-empty field, loader errors (`held: loader_error`), construction failures, any non-zero diff verbatim, `legacyRemainedAuthoritative` (every manifest `cognitionPath === 'shadow'`), and the R31 reference for "no additional persistent writes". Exit 0 = ACCEPTED; exit 1 = STOP with the reason. It never re-emits anything but ids, digests, counts and reason codes.

Acceptance for the whole set:

```text
[MAIA/shadow]  zeroDiff: true · missingInCanonical: [] · missingInLegacy: [] · digestMismatch: []
```

---

## 4. Rollback (if needed — the instrument only, or the container)

- Instrument off without redeploy: set `MAIA_CANONICAL_SHADOW=0` in the container env and restart `maia` (gates nothing else).
- Container: `scripts/deploy-production.sh rollback` (rollback tags were refreshed by the deploy).

---

## 5. After a clean witness

Return the JSON record + the verbatim shadow lines to the lane. Then M3 is adjudicated:

```text
M0 falsifiers                  ✅
M1 canonical spine             ✅
M2 shadow implementation       ✅
M2 production parity           ← this runbook
M3 CanonicalTurn authoritative ⛔ until adjudicated
```
