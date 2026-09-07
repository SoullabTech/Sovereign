# MAIL-03 — Release & Production Witness Runbook

Code under test: **`ee612602`** (containment). Docs commits may accompany it;
they do not change the security boundary.

**BUILD: PASS.** `npm run build` on `ee612602` exits 0 — verify scripts,
critical-file validation, internal-import check and `next build` all clean, no
errors in the log. Both containment routes are present in `.next/server` with
their runtime markers compiled in.

Current state:

```text
MAIL-03 IMPLEMENTATION   COMPLETE            ee612602 · 18 pinned tests · build PASS
MAIL-03 ACCEPTANCE       NOT COMPLETE        production not witnessed
MAIL-03 CLOSURE          NOT AUTHORIZED YET  founder act

MAIL-04                  HOLD
POSTAL                   DESIGN ONLY
```

Three states, not two, and they are not the same thing:

- **Implementation** is code and its own tests. Done.
- **Acceptance** is production evidence — W1–W5 and the running SHA. Code
  passing its own tests is not evidence about production.
- **Closure** is a founder act. A green witness LICENSES closure; it does not
  perform it. Do not read "W1–W5 passed" as "MAIL-03 is closed" — the same
  discipline the deploy lane applies to gates-green ≠ merge.

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

`GIT_COMMIT` must be the deployed short SHA. `unknown` means the deploy bypassed
the provenance chain — do not proceed.

It will often NOT read `ee612602` — a merge into `clean-main-no-secrets` gets its
own SHA. That is fine, but it must be PROVEN to contain the containment commit
rather than assumed:

```bash
cd /Users/soullab/MAIA-SOVEREIGN || exit 1
git fetch origin

RUNNING=$(ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT')
echo "running: ${RUNNING:-<empty>}"

# Guard the input before it is used as a revision.
case "$RUNNING" in
  '')        echo "STOP: could not read GIT_COMMIT — no verdict"; exit 1;;
  unknown)   echo "STOP: container reports 'unknown' — deploy bypassed the provenance chain"; exit 1;;
esac

git cat-file -e 'ee612602^{commit}' 2>/dev/null \
  || { echo "STOP: ee612602 not known locally — fetch the branch"; exit 1; }

git cat-file -e "${RUNNING}^{commit}" 2>/dev/null \
  || { echo "STOP: running commit $RUNNING not known locally — fetch it"; exit 1; }

if git merge-base --is-ancestor ee612602 "$RUNNING"; then
  echo "OK: running production contains ee612602"
else
  rc=$?
  if [ "$rc" -eq 1 ]; then
    echo "STOP: ee612602 genuinely NOT in running history"
  else
    echo "STOP: ancestry check errored (exit $rc) — NO VERDICT"
  fi
fi
```

Three states are preserved deliberately, because collapsing them is how the
2026-09-07 attempt produced a STOP that had evaluated nothing:

```text
OBJECT UNKNOWN           ≠ ancestry failure
CHECK ERROR (exit >1)    ≠ ancestry failure
EXIT 1 FROM MERGE-BASE   = genuine "not an ancestor"
```

`merge-base --is-ancestor` returns 0 for yes, **1 for no, and >1 for could not
determine**. Only exit 1 is a verdict. Run it from inside the repo: outside one,
git exits `fatal: not a git repository`, the `&&` falls through, and a plain
`||` branch prints STOP — a missing-repo error impersonating an ancestry
verdict. The revision is fully quoted because `^` is a glob operator in zsh
under `extendedglob`.

If artifact inspection says containment is present while ancestry says it is
not, neither signal is privileged by intuition — investigate the provenance of
both. That contradiction is precisely what a production witness exists to
expose.

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

> **Run the script, not the snippets.**
> ```bash
> cd /Users/soullab/MAIA-SOVEREIGN && git pull
> scripts/witness/mail-03-witness.sh <MEMBER_ID> <MEMBER_EMAIL>
> ```
> It performs §§1–4 in order, decides every machine-checkable result, and
> ABORTS on the first failure. Two witness attempts failed by running past a
> guard that had already printed REFUSE; a guard an operator can walk past is
> not a guard. The manual steps below remain as the reference for what the
> script checks and why.

### 3.0 Bind the variables FIRST, and let the shell refuse placeholders

A witness run on 2026-09-07 sent `<MEMBER_ID>` and `<MEMBER_EMAIL>` to
production as literal strings. Every behavioural case silently tested nothing —
the send-verification call 500'd on an invalid UUID instead of exercising the
409 path, and the recovery loop ran against an address no member owns, so its
200s were the enumeration-safe no-send response. The run LOOKED plausible. That
is the failure mode to design against: a witness that cannot tell you it did not
happen is worse than no witness.

So bind real values and make the shell fail loudly if they are unset:

```bash
MEMBER_ID='<paste real uuid>'
MEMBER_EMAIL='<paste real address>'
ATTACKER='attacker@notyourdomain.example'

# Prints READY or REFUSE. Never calls exit — this is pasted into an
# INTERACTIVE shell, and `exit` there closes the operator's terminal.
witness_ready() {
  case "$MEMBER_ID$MEMBER_EMAIL" in
    *'<'*|'') echo 'REFUSE: placeholders not substituted'; return 1;;
  esac
  case "$MEMBER_ID" in
    [0-9a-fA-F]*-*-*-*-*) ;;
    *) echo 'REFUSE: MEMBER_ID is not a uuid'; return 1;;
  esac
  case "$MEMBER_EMAIL" in
    *@*.*) ;;
    *) echo 'REFUSE: MEMBER_EMAIL is not an address'; return 1;;
  esac
  echo 'READY'
}
witness_ready

WITNESS_START=$(date -u +%Y-%m-%dT%H:%M:%SZ); echo "witness start: $WITNESS_START"
```

Do not continue unless that printed `READY`.

Confirm the member exists and note its address BEFORE the run — W2 compares
against this:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT id, email, email_verified FROM members WHERE id = '$MEMBER_ID';\""
```

One row, and `email` equal to `$MEMBER_EMAIL`. No row means the witness cannot
proceed.

### 3.0b Clearing stale limiter state — narrowly

A failed witness leaves rate-limit rows behind, and the operator's own IP may be
blocked with exponential backoff (15m → 30m → 1h → 2h → 4h). Clear only what the
bad run produced. `auth_rate_limits` is shared with real member traffic, so
deleting every row for an endpoint also resets legitimate members' counters:

```bash
# Inspect first.
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT identifier_type, attempts, blocked_until, blocked_until > NOW() AS still_blocked
      FROM auth_rate_limits WHERE endpoint = 'members/recover'
     ORDER BY blocked_until DESC NULLS LAST;\""

# Clear ONLY the operator IP block, not the whole endpoint.
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"DELETE FROM auth_rate_limits
      WHERE endpoint = 'members/recover' AND identifier_type = 'ip'
        AND blocked_until > NOW();\""
```

Clear before `WITNESS_START`, so the clean run is what the §4 ledger window sees.
Leave `members/send-verification` alone — W2 needs its metering intact.

### 3.1 Ledger control — prove the ledger records at all

An empty ledger after the run is only meaningful if the ledger is known to be
recording. Establish that first:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT count(*), max(created_at) FROM email_delivery_attempts
       WHERE created_at > NOW() - INTERVAL '7 days';\""
```

A zero count here means the ledger is not recording, and §4 proves nothing
either way. Resolve that before continuing.

### W1 — normal signup/verification delivers

Register a fresh test member through the normal flow. Expect: verification email
arrives at the persisted address. *(Proves containment did not break sign-up.)*

### W2 — mismatching body address is refused (THE RELAY TEST)

```bash
curl -s -w '\n%{http_code}\n' -X POST https://soullab.life/api/members/send-verification \
  -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$MEMBER_ID\",\"email\":\"$ATTACKER\"}"
```

PASS requires **all three**:
- HTTP **409** with `reason: "destination_mismatch"`
- **no email** at the attacker address
- `members.email` unchanged:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT email, email_verified FROM members WHERE id = '$MEMBER_ID';\""
```

Any 200, any delivery, or any change to that row = **RELAY OPEN**, stop and roll
back.

**A 500 is not a pass.** It means the request died before reaching the refusal —
most often an invalid UUID. Re-check §3.0 and re-run; do not record a 500 as
evidence of containment.

### W3 — normal recovery delivers

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/members/recover \
  -H 'Content-Type: application/json' -d "{\"email\":\"$MEMBER_EMAIL\"}"
```

Expect 200 **and one email actually arriving**. Recovery returns 200 for unknown
addresses too — by design, for enumeration safety — so the status code alone
does not establish delivery. The arriving message is the evidence.

### W4 — repeated recovery is throttled

```bash
for i in $(seq 1 9); do
  printf 'attempt %s -> ' "$i"
  curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/members/recover \
    -H 'Content-Type: application/json' -d "{\"email\":\"$MEMBER_EMAIL\"}"
done
```

Expect a finite run of 200s (~5 in the 15-minute window, W3 counts toward it),
then **429**. Count delivered messages — no send beyond the ceiling.

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

**Acceptance condition, and nothing more than this:** the production SHA carries
`ee612602`, and W1–W5 pass.

On both, MAIL-03 is ACCEPTED and closure is licensed — **CLOSED is then a
founder act, not an inference from the evidence.** MAIL-04 stays HOLD and Postal
stays untouched across that act.

## Rollback

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh rollback'
```

Roll back on: a W2 that is not 409/no-send/unchanged, `GIT_COMMIT=unknown`, or
any failure of normal signup or recovery delivery.
