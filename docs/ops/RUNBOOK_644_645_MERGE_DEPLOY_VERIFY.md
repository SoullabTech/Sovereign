# Runbook — #644 (TURN open-relay guard) + #645 (content-first review) + audit witness

**Prepared 2026-07-18. Standing rule: secure the room → prove the review → witness the audit → then Rung 1.**
Do the two PRs strictly in order; do not overlap them, so each piece of evidence stays attributable.

Prod baseline at prep time: `GIT_COMMIT=68e259b9f`, deploy lane free, both PRs `MERGEABLE` (no conflict), covenant-gates green, Docker build finishing.

---

## STAGE A — #644 TURN open-relay guard (security first)

### A1. Merge (requires branch up-to-date + all checks green)
```bash
gh pr checks 644                       # all four must be pass
gh pr update-branch 644                # required: BLOCKED = behind base
# wait for the re-run checks to go green, then:
gh pr merge 644 --merge
```

### A2. Deploy (quick maia path — code only, no migration)
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && git checkout clean-main-no-secrets && git pull \
  && scripts/pre-deploy-gate.sh deploy-maia'
```

### A3. Provenance verify
```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"; \
  docker exec maia-sovereign printenv GIT_COMMIT DEPLOY_LANE; hostname -I'
```
PASS = fresh Created, `GIT_COMMIT` = the #644 merge SHA, `DEPLOY_LANE=deploy-lane`, LAN `192.168.0.104`.

### A4. External relay-boundary verify (the security proof)
- **Closed relay:** unauthenticated `POST /api/open/session-room/<randomRoom>/turn-credentials` (no threshold token) → **403** (was: 200 with valid coturn creds).
- **Rate limit:** burst >20/min on that endpoint → **429**.
- **Legitimate path intact:** a real threshold-consented room still mints creds (200) and relay still connects — this is the regression guard. Cleanest as a forced-relay loopback via a prod-minted cred for a genuinely consented probe room (same method used 2026-07-16), OR confirm during the #645 walk that a real room still connects.
- Record: endpoint, before/after status, timestamp.

**Gate: do not proceed to Stage B until A4 shows closed-relay 403 AND legitimate traffic still works.**

---

## STAGE B — #645 content-first review

### B1. Merge
```bash
gh pr checks 645
gh pr update-branch 645
gh pr merge 645 --merge
```

### B2. Deploy (quick maia path)  — same as A2, re-run after #645 is on main.

### B3. Provenance verify — same as A3; `GIT_COMMIT` = #645 merge SHA.

### B4. Kelly's walk (embodied — cannot be automated)
1. Open a **short** session's Review first.
2. Confirm the **overview appears without naming anyone** (no name gate).
3. Click **Transcript** → confirm it is the **raw session text**, not a summary.
4. **Add** a client name from the header, then **clear** it — confirm both work and neither blocks content.
5. Open the **373-turn** session → observe overview timing (expect ~30–60s; the audit row is written *before* generation, so it lands immediately regardless).

---

## STAGE C — close the audit witness

### C1. Read the production row
```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "cat /app/data/audit-logs/audit-$(date +%F).jsonl"'
```
Confirm the row contains: `resource":"scribe_transcript"`, `resourceId` = the reviewed session id, `userId` = Kelly's member id, `result":"success"`, `action":"access"`, a plausible `timestamp`, and a `hash` (chain intact).

### C2. No-duplication check (the Strict-Mode concern)
- **Opening one review = exactly ONE auto-overview POST = exactly ONE grant row.**
- Guards: `hasAutoOverview` ref in `SessionReviewChat` + React never double-invokes effects in production (Strict-Mode double-invoke is dev-only). Both hold independently.
- Verify: after a single review open (before clicking any further deliverable), the file has grown by exactly one row for that session id. Each subsequent deliverable/question or a **Transcript** click (GET) writes its own additional row — those are expected, not duplicates.

### C3. Record the evidence, in Kelly's wording (from memory `project_scribe_route_auth_survey`):
> "Production audit persistence fully verified. A real scribe transcript access event generated a durable audit record, survived container lifecycle boundaries, and remained externally observable through the watcher path."
Chain complete: initialization + persistence + operational + behavioral.

---

## STOP

After A4 verified, B4 walked, and C1–C3 recorded (one legitimate row, no duplication), **stop and present the evidence. Do not begin Rung 1 until then.**
