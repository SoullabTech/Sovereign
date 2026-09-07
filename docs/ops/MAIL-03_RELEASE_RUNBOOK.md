# MAIL-03 — Release & Production Witness Runbook

Code under test: **`ee612602`** (containment). Docs commits may accompany it;
they do not change the security boundary.

**BUILD: PASS.** `npm run build` on `ee612602` exits 0 — verify scripts,
critical-file validation, internal-import check and `next build` all clean, no
errors in the log. Both containment routes are present in `.next/server` with
their runtime markers compiled in.

Current state:

```text
MAIL-03
CODE          COMPLETE
TESTS         PASS      18 pinned (11 containment + 7 emergency ceiling)
BUILD         PASS
PRODUCTION    NOT YET WITNESSED
CLOSE         NOT YET
MAIL-04       HOLD
POSTAL        DESIGN DECISION ONLY
```

MAIL-03 is release-ready. It is **not CLOSED** until the production witness in
§3 exists. Code passing its own tests is not evidence about production.

**Run from the Mac Studio.** Deploys execute on minisforum over SSH. The remote
Claude session that wrote this patch has no `ssh` binary, cannot resolve
`minisforum`, and has GitHub-only egress — it can build, but it cannot deploy or
witness production. Everything below is founder-executed.

**Do NOT break the production rate-limit database to exercise the emergency
fallback.** That failure mode is evidenced by the 7 pinned tests in
`lib/auth/__tests__/emergency-ceiling.test.ts`. Production witness establishes
externally observable security properties; it does not manufacture an outage.

---

## 1. Deploy

Merge to `clean-main-no-secrets` first, then deploy the merged SHA. Containment
touches no schema, so the quick `maia`-only path is sufficient:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

The gate takes the deploy-lane lock, snapshots the named SHA into an isolated
build context, runs the Co-Lab + disk gates, refreshes rollback tags, swaps, and
fail-closed verifies the running container's `GIT_COMMIT`.

## 2. Confirm the PRODUCTION SHA, not the source SHA

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
ssh soullab@minisforum 'docker exec maia-sovereign printenv DEPLOY_LANE'   # -> deploy-lane
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'
curl -k https://soullab.life/api/health
```

`GIT_COMMIT` must be the deployed short SHA and must contain `ee612602`'s
changes. `unknown` means the deploy bypassed the provenance chain — do not
proceed to witness.

Confirm containment is in the RUNNING artifact. Grep for a runtime string, not
a comment: minification strips comments, so a check against the explanatory
comment would pass on an unpatched build and prove nothing.

```bash
# send-verification: the 409 refusal reason. Present only with containment.
ssh soullab@minisforum "docker exec maia-sovereign sh -c \
  'grep -c destination_mismatch .next/server/app/api/members/send-verification/route.js'"

# recover: its rate-limit endpoint key. Absent before containment.
ssh soullab@minisforum "docker exec maia-sovereign sh -c \
  'grep -c members/recover .next/server/app/api/members/recover/route.js'"
```

Both must be non-zero. Verified against the local production build of
`ee612602`: `destination_mismatch` compiles into the send-verification route,
and `EMERGENCY_CEILING_BLOCKED` compiles into every route that uses the
limiter.

## 3. Production witness — controlled test member

Use a member you own, on a domain you control. Record `MEMBER_ID` and
`MEMBER_EMAIL`. Note the UTC start time; the ledger query in §4 is scoped to it.

```bash
WITNESS_START=$(date -u +%Y-%m-%dT%H:%M:%SZ); echo "$WITNESS_START"
```

### W1 — normal signup/verification delivers

Register a fresh test member through the normal flow. Expect: verification email
arrives at the persisted address.

### W2 — mismatching body address is refused (THE RELAY TEST)

```bash
curl -s -o /tmp/w2.json -w '%{http_code}\n' -X POST https://soullab.life/api/members/send-verification \
  -H 'Content-Type: application/json' \
  -d '{"memberId":"<MEMBER_ID>","email":"attacker@notyourdomain.example"}'
cat /tmp/w2.json
```

PASS requires **all three**:
- HTTP **409**, body `reason: "destination_mismatch"`
- **no email** at the attacker address
- `members.email` **unchanged**:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT email, email_verified FROM members WHERE id = '<MEMBER_ID>';\""
```

Any 200, any delivery, or any change to that row = **RELAY OPEN**, stop and roll back.

### W3 — normal recovery delivers

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/members/recover \
  -H 'Content-Type: application/json' -d '{"email":"<MEMBER_EMAIL>"}'
```

Expect 200 and one email.

### W4 — repeated recovery is throttled

```bash
for i in $(seq 1 9); do
  printf 'attempt %s -> ' "$i"
  curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/members/recover \
    -H 'Content-Type: application/json' -d '{"email":"<MEMBER_EMAIL>"}'
done
```

Expect: a finite run of 200s (~5 in the 15-minute window, W3 counts toward it),
then **429**. Count delivered messages — there must be no send beyond the
ceiling. The 429 body must be the same non-committal sentence as the
unknown-address response; a differing body is an enumeration oracle.

### W5 — enumeration parity

```bash
curl -s -X POST https://soullab.life/api/members/recover \
  -H 'Content-Type: application/json' -d '{"email":"definitely-not-a-member@example.com"}'
```

Body must be byte-identical to W4's 429 body.

## 4. Ledger — only the expected controlled sends

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT created_at, purpose, lane, state, failure_class, failure_code, recipient_domain
      FROM email_delivery_attempts
     WHERE created_at >= '\$WITNESS_START'
     ORDER BY created_at;\""
```

PASS: rows only for W1/W3/W4's allowed attempts. **No row whose
`recipient_domain` is the attacker domain** — a refused-but-attempted row there
would mean the route reached the provider before refusing, which the 409 path
must never do.

## 5. NOT part of the closure act

Founder ruling 2026-09-07: the cleanest closure is exactly *the code we accepted
is demonstrably the code running, and production behaviour satisfies W1–W5*.

Do **not** fold any of these into the MAIL-03 closure act:

- **Resend credential rotation.** Still required — the endpoint fix and rotation
  defend against two different possible causes, and the ledger cannot rule the
  second one out. But it is its own act, performed after closure, with its own
  verification that sending still works and that the old key is dead.
- Postal / transport work (MAIL-09/10)
- The Dependabot supply-chain census
- MAIL-04 admission work

Each has its own blast radius. Combining any of them with closure makes the
witness ambiguous about what it actually witnessed.

## 6. Record

```text
MAIL-03
CODE          ee612602
BUILD         <PASS|FAIL>
DEPLOY        <production SHA from step 2>
VERIFY        <PASS|FAIL>
RELAY         <CLOSED|OPEN> IN PRODUCTION
RECOVERY      <METERED|UNMETERED> IN PRODUCTION
CAUSATION     UNPROVEN
MAIL-04       HOLD
```

`CAUSATION UNPROVEN` stays until the ledger and Resend's own history are
correlated across the incident window. Containment closes a real surface; it does
not establish that this surface was the vector.

**Closure condition, and nothing more than this:** the production SHA carries
`ee612602`, and W1–W5 pass. On both, MAIL-03 is CLOSED. MAIL-04 stays HOLD and
Postal stays untouched.

## Rollback

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh rollback'
```

Roll back on: a W2 that is not 409/no-send/unchanged, `GIT_COMMIT=unknown`, or
any failure of normal signup or recovery delivery.
