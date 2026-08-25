# OPS-DT-01 — Safe Real-Device Test Environment

**Status:** Artifacts authored and validated locally · **NOT DEPLOYED**
**Branch:** `claude/ops-dt-01-device-test-env` (separate lane; PR #1093 stays frozen at `2a4d59c`)
**Authorized:** Founder, 2026-08-25
**Blocks:** USC-04 iPhone acceptance → PR #1093 merge ruling

> A reusable pre-merge environment for testing an exact branch/SHA against a real
> device, with a database that can never reach production.

**Terminology, because it governs what may be destroyed.** This environment's
*relationship to production* is read-only — that is the property that matters and
the one the isolation proof enforces. The environment **itself is intentionally
mutable and disposable**: its database is meant to be migrated, dirtied, reset and
rebuilt freely. "Read-only infrastructure" would be the wrong mental model and
would make later reasoning about what may be wiped needlessly timid.

This closes a structural hole: every future change that pairs a migration with
real-device behavior needs this, and today there is nowhere to run it.

---

## 1. Why not the environments we already have

| Candidate | Why it is disqualified |
|---|---|
| Production | Does not contain the branch. Testing it tests the feature's absence. Deploying an unmerged Class A PR to prod inverts the merge gate. |
| Existing staging | **Shares the production database** — its own header says *"be careful with migrations on staging branches."* A branch migration would land in production ahead of approval. |
| Existing staging (TLS) | HTTP-only on `:8090` behind an `/etc/hosts` entry a phone cannot take. Microphone and `SpeechRecognition` require a secure context, so USC-04 proof 6 cannot run there at all. |
| Mac Studio LAN | Useful as an emergency diagnostic, but solves certificates, device trust, and routing ad hoc every time. Not reproducible. |
| Merge first, verify after | Inverts the gate. The proofs graded RED (offline survival, replay, inbox fallback, backgrounding) are exactly the ones that would go unverified. |

**Existing staging is left exactly as it is.** Whether its production-DB coupling
should be retired is a separate decision, deliberately not taken here.

---

## 2. Design — isolation is topological, not configurational

```
branch build / exact SHA
        ↓
HTTPS hostname (valid public TLS, DNS-01)
        ↓
isolated app container      ─┐
                             ├── maia-device-test-net (private bridge)
isolated PostgreSQL         ─┘
```

The stack declares its **own private network** and does not join
`maia-sovereign_maia-network`. Production postgres is therefore **not routable**
from the app container. Isolation does not depend on a `DATABASE_URL` being
written correctly — a typo cannot reach production because no path exists.

That is the core difference from staging, and the reason this is a new stack
rather than a repointed one.

| Artifact | Purpose |
|---|---|
| `docker-compose.device-test.yml` | Isolated app + PostgreSQL + Caddy, private network, own volumes |
| `Caddyfile.device-test` | Valid public TLS via DNS-01 on a dedicated port |
| `scripts/device-test-up.sh` | Deploy an explicitly named SHA (immutable `git archive` context, provenance verified) |
| `scripts/device-test-migrate.sh` | Apply migrations to the isolated DB only; refuses unless isolation is proven |
| `scripts/verify-device-test-isolation.sh` | The independent isolation proof |
| `scripts/device-test-down.sh` | Teardown; `--wipe` resets the database |
| (env template) | Inlined in §3e below — `.gitignore`'s blanket `.env*` would swallow a `.sample` file, so the template lives here where it is actually tracked |

Further safety properties:

- The test database **publishes no host port** (production publishes 5432), so the two cannot be confused from outside either.
- `GIT_COMMIT` is **required** — this lane never builds "whatever is checked out", and never bakes `unknown`.
- The lane declares `DEPLOY_LANE_TOKEN=device-test` in-file, satisfying the Dockerfile tripwire without borrowing the production lane token.
- `MAIA_ENV=device-test` plus `X-MAIA-Env: device-test` on every response, so a tester cannot mistake this for production.
- `X-Robots-Tag: noindex, nofollow`.

---

## 3. ⚠️ Requires your hands — not executed

Per the authorization, anything beyond adding an isolated host/service is
reported, not performed. Three items need a human, and one needs a ruling.

**a. DNS record (new, additive).** An `A` record for the chosen hostname → the
LAN's public IP. Additive; changes no existing record.

```
device-test.soullab.life   A → <WAN IP>   TTL 60–300
```

⚠️ **Verify the WAN IP before creating the record.** `32.219.7.166` is what
`soullab.life` resolved to when this document was written — that is an
*observation*, not a permanent fact. Confirm the router's current WAN IP matches
before writing the record, and note whether the ISP address is static or dynamic.

A dynamic address does not block the first proof, but it means the test hostname
will eventually break silently. The follow-on, if so, is a small Route 53 DDNS
updater — deliberately out of scope here. The short TTL keeps that cheap.

**b. Router port-forward (new, additive).** Forward **only** `8443/TCP` →
minisforum. Additive; production `80`/`443` untouched.

```
WAN :8443/TCP → MINISFORUM :8443/TCP → device-test Caddy
                                          → device-test app
                                             → private device-test Postgres
```

**Expose nothing else through this rule.** Specifically not: PostgreSQL (test or
production), the Next app container directly, the Docker API, SSH, or the
production Caddy. The app and database are reachable only from inside
`maia-device-test-net`; the single forwarded port terminates at Caddy.

Because the certificate uses DNS-01, **Let's Encrypt never needs inbound port
80** — which is precisely why this design avoids contending with production.

> **Why a non-standard port, and the ruling it avoids.** Let's Encrypt's HTTP-01
> challenge needs port 80, which the production Caddy owns. Taking it would mean
> modifying production routing — the exact category the authorization says to
> stop and report. This design instead uses the **DNS-01** challenge on a
> dedicated port, so production routing is never touched. The cost is a `:8443`
> suffix in the test URL. That satisfies *valid public TLS* and *normal DNS
> resolution*; it is not a "manual trust hack" and iOS treats it as a fully
> trusted origin, so microphone and `SpeechRecognition` work.
>
> **Ruled 2026-08-25:** keep `:8443`; production Caddy is not touched during this
> unit. A portless URL is explicitly deferred to a small routing unit *after* this
> environment is proven — a pretty URL is not worth introducing a production-routing
> dependency into the very unit whose purpose is isolation from production.

**c. DNS provider — resolved: AWS Route 53.**

The authoritative nameservers for `soullab.life` were queried directly:

```
ns-171.awsdns-21.com     ns-646.awsdns-16.net
ns-1304.awsdns-35.org    ns-1566.awsdns-03.co.uk
```

`awsdns-*` across four TLDs is Route 53. An earlier draft named Cloudflare as a
placeholder; that was never an implementation choice and has been replaced. **No
Cloudflare module or credential is needed or should be requested.**

> Note for the infrastructure record: this is DNS hosting only. It does not
> contradict the project's "NOT EC2, no CDN/proxy middleman" stance — nothing is
> hosted at AWS and no traffic is proxied through it. Route 53 answers name
> queries; the LAN's public IP still terminates every connection.

Build the Caddy image with the Route 53 plugin:

```bash
docker build -t maia-caddy-dns:2 - <<'EOF'
FROM caddy:2-builder AS builder
RUN xcaddy build --with github.com/caddy-dns/route53
FROM caddy:2-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
EOF
```

**Minimal IAM policy.** Scope to the single hosted zone — this credential lives in
a disposable test environment and must not be able to edit the rest of the zone
inventory:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["route53:GetChange"],
      "Resource": "arn:aws:route53:::change/*" },
    { "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets", "route53:ListResourceRecordSets"],
      "Resource": "arn:aws:route53:::hostedzone/<SOULLAB_LIFE_ZONE_ID>" },
    { "Effect": "Allow",
      "Action": ["route53:ListHostedZonesByName"],
      "Resource": "*" }
  ]
}
```

**c-bis. Handling the AWS key.** Keep it outside git (the blanket `.env*` rule
already ensures this), present only in `.env.device-test` on the test host,
file-permission restricted (`chmod 600`), and **never copied into production
Caddy configuration**. Its one meaningful power is changing records in the
Soullab hosted zone; keep it that way.

**d. Test-only secrets.** `DEVICE_TEST_PHI_KEY` must **not** be the production
PHI key. Capture content written here is synthetic and the environment is
disposable; reusing the production key would defeat the isolation.

**e. Configuration template.** Create `.env.device-test` on minisforum with the
following. It is correctly ignored by `.gitignore`'s blanket `.env*` rule, so it
never reaches the repo — which is also why this template is inlined here rather
than shipped as a `.sample` file that would have been silently ignored too.

```bash
# OPS-DT-01 — device-test environment. EVERY secret here must be TEST-ONLY;
# reusing a production value defeats the isolation this environment provides.

DEVICE_TEST_HOST=device-test.soullab.life   # publicly resolvable, valid TLS
DEVICE_TEST_HTTPS_PORT=8443                 # dedicated; never contends with prod Caddy
DEVICE_TEST_CADDY_IMAGE=maia-caddy-dns:2    # Caddy build with the route53 plugin (§3c)
DEVICE_TEST_AWS_ACCESS_KEY_ID=              # Route 53, scoped to this hosted zone ONLY
DEVICE_TEST_AWS_SECRET_ACCESS_KEY=
DEVICE_TEST_AWS_REGION=us-east-1
DEVICE_TEST_DB_PASSWORD=                    # unrelated to production
DEVICE_TEST_PHI_KEY=                        # TEST-ONLY: openssl rand -base64 32
ANTHROPIC_API_KEY=                          # optional, for conversational surfaces
```

---

## 4. Run order

**Prove the environment before the branch exists anywhere on it.** The stack
comes up EMPTY first and isolation is proven against that empty stack. Otherwise
we would be assuming isolation because the compose file looks isolated, rather
than demonstrating it.

```
empty OPS-DT stack → prove test DB identity → prove production identity differs
→ sentinel written to test only → confirm sentinel absent from production
→ remove sentinel → ONLY NOW deploy 2a4d59c
```

```bash
# 0. one-time: .env.device-test written (§3e), DNS + port-forward in place

# 1. bring the stack up EMPTY — no branch, no migrations yet.
#    Any SHA builds the image; the point is a running DB to prove against.
scripts/device-test-up.sh $(git rev-parse --short origin/clean-main-no-secrets)

# 2. PROVE ISOLATION NOW, on the empty stack — then STOP and report.
scripts/verify-device-test-isolation.sh

# ── gate: do not continue until the proof passes and is reported ──

# 3. only then deploy the frozen capture SHA
scripts/device-test-up.sh 2a4d59c

# 4. migrations — isolated DB only; refuses if the proof did not pass
scripts/device-test-migrate.sh

# 5. record the environment, then run the seven proofs
#    docs/ops/USC_04_DEVICE_ACCEPTANCE.md
```

### Deploy the SHA, never a moving target

Deploy exactly `2a4d59c` — not `latest`, not the branch tip, not a freshly
rebased head. `device-test-up.sh` requires an explicit SHA and verifies it in the
running container for this reason. It is what lets the final statement be precise:

> `2a4d59c` passed repository CI, automated capture tests, migration proofs,
> isolation proofs, and real-iPhone acceptance.

Rebasing onto fresh canonical happens *after* that, under the invalidation rule.

The isolation proof is not a formality. It is read-only against production and
checks identity, connection target, **network unreachability**, sentinel
non-crossover, and that production has not acquired `session_captures`.

**It is built to refuse a false green.** Every inconclusive path scores as FAIL,
never PASS:

```
PASS          positive evidence obtained
FAIL          evidence contradicts isolation
INCONCLUSIVE  a required observation could not be made

NEVER: unknown / unreadable / unexecuted → PASS
```

**Both FAIL and INCONCLUSIVE exit non-zero.** A human-readable "INCONCLUSIVE"
followed by exit `0` would be automation-dangerous — a wrapper would read the
command as passing.

| Situation | Verdict | Exit |
|---|---|---|
| Production identity unreadable | INCONCLUSIVE | 1 |
| Test identity unreadable | INCONCLUSIVE | 1 |
| `node` unavailable to probe with | INCONCLUSIVE | 1 |
| Positive control fails (probe can't reach the test DB) | INCONCLUSIVE | 1 |
| Sentinel could not be created, or production not queryable | INCONCLUSIVE | 1 |
| Production postgres reachable from the test app | **FAIL** | 1 |
| Sentinel appears in production | **FAIL** | 1 |
| Test and production are the same database | **FAIL** | 1 |
| `session_captures` already in production | **FAIL — investigate** | 1 |
| All observations made, all evidence consistent with isolation | PASS | 0 |

> **On `session_captures` already existing in production:** do **not** infer
> leakage from OPS-DT-01. Stop and establish provenance — it may have arrived
> through another canonical lane. Either way this proof can no longer establish
> the expected clean baseline, and the script says so rather than guessing.

`set -e` is deliberately **not** used. Every probe here is expected to fail in
some scenario, and an early abort would skip later checks and suppress the final
verdict — yielding a correct exit code for the wrong reason and an unreadable
report. Every external call is guarded instead.

**Verdict logic is proven, not asserted.** All four paths were exercised against
a simulated estate: healthy → PASS/0; production reachable from the test app →
FAIL/1; test and production sharing one database → FAIL/1; every observation
impossible → INCONCLUSIVE/1. In each non-PASS case the script still reached and
printed the final verdict block.

The network check runs a **positive control first**: it confirms the probe can
reach the test database before treating "production unreachable" as meaningful.
An earlier draft shelled out to `getent`, which is absent from musl images —
command-not-found exited non-zero and would have been scored as "not reachable",
certifying isolation without testing anything.

---

## 5. Acceptance gate

### INFRA
- [ ] test hostname resolves normally on iPhone
- [ ] HTTPS certificate validates without manual trust hacks
- [ ] microphone works in browser/app context
- [ ] exact deployed git SHA is observable (`docker exec maia-device-test printenv GIT_COMMIT`)

### DATABASE
- [ ] test DB identity != production DB identity
- [ ] test app credentials cannot address production
- [ ] test-only sentinel never appears in production
- [ ] #1093 migrations apply only to test DB
- [ ] environment can be reset/rebuilt (`device-test-down.sh --wipe`)

### APPLICATION
- [ ] test member can authenticate
- [ ] synthetic Session Room session works
- [ ] no production member/session data required
- [ ] logs clearly identify device-test environment

Items 1–3 of DATABASE and item 4 of INFRA are produced automatically by
`verify-device-test-isolation.sh` and `device-test-up.sh`. The rest are observed.

**Never seed this environment from production content.** Create synthetic members
and sessions.

---

## 6. Then, and only then

```
OPS-DT-01 acceptance
        ↓
deploy 2a4d59c → USC-04 seven-proof iPhone acceptance
        ↓
fetch fresh canonical → rebase if required → invalidation check
        ↓
44 tests + CI again → merge ruling
```

PR #1093 stays frozen at `2a4d59c` throughout — which is the unusual advantage
here: the commit under device test is the exact commit that already holds 7/7 CI,
not a moving target.
