# OPS-DT-01 — Safe Real-Device Test Environment

**Status:** Artifacts authored and validated locally · **NOT DEPLOYED**
**Branch:** `claude/ops-dt-01-device-test-env` (separate lane; PR #1093 stays frozen at `2a4d59c`)
**Authorized:** Founder, 2026-08-25
**Blocks:** USC-04 iPhone acceptance → PR #1093 merge ruling

> A reusable pre-merge environment for testing an exact branch/SHA against a real
> device, with a database that can never reach production.

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

**a. DNS record (new, additive).** An `A` record for the chosen hostname →
the LAN's public IP (`soullab.life` currently resolves to `32.219.7.166`).
Additive; changes no existing record.

**b. Router port-forward (new, additive).** Forward the chosen HTTPS port
(default `8443`) → minisforum. Additive; production `80`/`443` untouched.

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

```bash
# 0. one-time: .env.device-test filled in, DNS + port-forward in place
cp .env.device-test.sample .env.device-test && $EDITOR .env.device-test

# 1. bring up the isolated stack (DB + app + TLS) at the frozen SHA
scripts/device-test-up.sh 2a4d59c

# 2. PROVE ISOLATION BEFORE TRUSTING ANY RESULT
scripts/verify-device-test-isolation.sh

# 3. migrations — isolated DB only; refuses if step 2 did not pass
scripts/device-test-migrate.sh

# 4. record the environment, then run the seven proofs
#    docs/ops/USC_04_DEVICE_ACCEPTANCE.md
```

Step 2 is not a formality. It is read-only against production and checks
identity, connection target, **network unreachability**, sentinel non-crossover,
and that production has not acquired `session_captures`.

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
