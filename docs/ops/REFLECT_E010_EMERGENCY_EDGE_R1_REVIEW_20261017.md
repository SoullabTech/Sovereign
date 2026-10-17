# Reflect E010 — Emergency edge quarantine R1, independent-of-reader review

**October 17, 2026. Status: LOCAL CADDY ACCEPTANCE PASS; PRODUCTION ACTIVATION AND EDGE MUTATION REMAIN ON HOLD.**

## Why this matters

An enabled E010 Reflect reader normally loses its invitation only after the two server environment variables are restored to OFF and the MAIA reader is recreated. The existing safety floor forbids ordinary recreation when root disk space falls below 60 GiB; that conflict could leave Reflect enabled during a resource incident. A separate edge containment would deny requests without first needing the MAIA reader to restart. **Edge containment is NOT true server-variable revocation.**

This candidate therefore makes a separately approved emergency `403` ingress rule an explicit precondition for any live founder-only ON. It does not supply a live operator capable of installing or reloading that rule.

## Source and artifacts

- Frozen E010 source commit: `e010c0977320ea3cceb7424e84a5cf5c58770cc2`.
- Original canonical `Caddyfile` remains byte-for-byte identical to E010. No configuration was edited on production or in the canonical worktree.
- Proposed handler: `docs/ops/fixtures/reflect-e010-emergency-deny.caddy`. **It is a standalone reference snippet, not imported or enabled by application code.**
- Reproducible actual-Caddy test: `scripts/verify-reflect-e010-emergency-caddy.sh`. It checks the exact frozen Caddyfile against git, requires an already cached image `caddy:2.11.2-alpine` with exact local image ID, and constructs copies only in a disposable local temp directory.
- Test infrastructure: Docker Desktop on the connected Mac Studio, `--pull=never --network none --read-only`, bounded CPU/RAM, no published host ports, a fictional response backend and automatic disposable-container cleanup. No login, member ID, secret, provider, external network, production SSH, or live Caddy volume is used.
- Release-lock and permit boundary remains as in `docs/ops/REFLECT_E010_ACTION_ADAPTER_REVIEW_R1_20261017.md`.

## Actual executed evidence

1. The full, unmodified canonical Caddyfile was copied and the candidate matcher injected only in that **temporary copy** at the start of the existing `(deny_disabled_routes)` block. `caddy adapt` on the real Caddy **2.11.2** image succeeded, with **19 compiled Reflect denial handler instances** across the existing imported sites.
2. A separate network-disabled Caddy process using the real canonical deny snippet, a local `:8080` listener and a fictional upstream response was started; Caddy config validation succeeded.
3. Real HTTP requests inside that container yielded **11/11 PASS**: GET exact Reflect, trailing slash, nested path, RSC query, RSC header, Next-Router-Prefetch header, HEAD, and POST all returned `403` and `Cache-Control: no-store`; `/pro-studio/reflection`, `/health`, and unrelated Next static assets continued to return `200`.
4. The temporary Caddy container was deleted; **no server-side state, release, production file or running reader was modified**.

**Evidence qualification:** This is stronger than a synthetic unit test because it exercises Caddy 2.11.2's real configuration parser and HTTP router. It is still **local**, not an actual production route reload or authenticated browser test. Header-presence and response status alone cannot establish complete cache invalidation or deny an already-rendered page.

## Independent production review / safety gates still missing

- Exact production edge-config custody: currently running Caddy image/config digest and mount provenance need read-only review. A separate privileged operator would later need an **approved, reversible Caddy configuration change**; a production file edit or Caddy reload is not authorized by this acceptance.
- Route precedence under all live hostnames: all canonical Soullab ingress hosts, direct-origin bypass, alternate host redirects, nested and encoded paths, query/RSC/Flight/prefetch, unexpected methods, and possible CDN/browser caches must be addressed with real request witnesses. The offline fixture does **not** prove upstream-network inaccessibility from every external path.
- Emergency incident condition: below-60-GiB access quarantine must be independently approved and rehearsed **before** enabling even the one founder account. Never silently exempt a live reader recreation from the disk floor, delete unrelated Docker volumes, prune caches, restart PostgreSQL, or claim the reader is OFF based only on edge denial.
- Fail-closed proof: if the MAIA reader fails, stalls, remains ON, or cannot be restarted, the independent Caddy deny must still block new privileged Reflect content. If Caddy itself fails to reload or becomes unhealthy, enter an incident; do not declare successful quarantine.
- Full OFF completion: under an independently permitted release operator, restore both E010 environment settings to the original values, recreate only the existing immutable E010 MAIA reader when safe and authorized, prove actual runtime flag disappearance and former-founder denial, and keep prior rollback custody.
- Consent/identity: the live founder must be freshly privately authenticated and must explicitly consent to the one-account canary. A fictional or cached fingerprint is not equivalent to a live signed-in session.
- Earlier rejected activation safeguard remains binding. **This candidate may not be used to bypass it**, whether through a tool, user Terminal command, generic GitHub Deploy workflow, or source patch.

## Decision table

| Decision | State |
| --- | --- |
| Offline parser with canonical site rules | PASS |
| Network-isolated real Caddy HTTP response matrix | PASS (11/11) |
| No-store for blocked requests | PASS in isolated fixture |
| Preserved normal unrelated routes | PASS in isolated fixture |
| Production Caddy edge deployment/reload | NOT EXECUTED / NOT AUTHORIZED |
| Direct-origin, existing-cache and physical Safari denial | NOT VERIFIED |
| Low-disk emergency quarantine formally authorized and rehearsed | NOT VERIFIED |
| Real founder Reflect ON then fully verified OFF | NOT EXECUTED |
| Wider beta admission | OUT OF SCOPE |

**Release conclusion:** The independent-of-reader ingress containment design is technically plausible and has an executable offline verification artifact. The remaining hurdle is **permitted live execution and incident authority**, not another fictional test count. Until that mechanism and the full OFF pathway are independently reviewed and qualified, production Reflect remains OFF.

## Live production Caddy provenance — read-only addendum (October 17)

A separate **metadata-only** Tailscale SSH inspection was conducted after the local commit. It did **not** modify or reload Caddy.

- Running production proxy: Caddy **v2.11.2**, container `maia-caddy` healthy/running with **zero** restarts. The host's `/home/soullab/MAIA-SOVEREIGN/Caddyfile` is mounted at `/etc/caddy/Caddyfile` **read-only**.
- Frozen E010 canonical file SHA-256: `cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d`.
- Current production host Caddyfile SHA-256: `3018deb217e3f48d6ab48ddb54f0f9f27ac2a6f31c00800688bb63e351debcfd`. The host configuration is **dirty relative to E010**, with 57 added lines and no deletions: 24 lines inside the shared security-denial snippet near canonical line 28, and 33 lines appended as an additional site block. The original 19 denial-rule imports remain present.
- The production Caddy **effective configuration**, fetched with a read-only GET from its administrative API and compared on the host with Caddy's adaptation of the currently mounted file, was **JSON-structurally identical** (SHA-256 `4cdc910d64143669cd6e99b701534cb8643c444ff3a3958bf5e5278a0a611740`). Thus the production-only additions are actually loaded. No config contents or secret values were exported to the conversation.
- The 24-line shared security addition has no Reflect or broader Pro Studio matcher. The appended 33-line site does not import the shared denial snippet, does have a reverse proxy, but does **not** directly proxy to `maia-sovereign` and has no explicit Reflect/Pro Studio paths. **Indirect forwarding and any alternate ingress remain unproven**; do not assume the proposed emergency deny reaches that added site.
- Root available during inspection was approximately **63.04 GiB**, still above the 60 GiB mandatory precondition but below the advisory 90 GiB.
- The Caddy container had started before the host Caddyfile's last modification; equal effective/configured JSON nonetheless proves a subsequent successful config load, though its exact reload timestamp was not established.

### Consequence

The **frozen E010 Caddyfile must not replace the live Caddyfile wholesale**. That could remove the 24-line production-only security protection and the additional 33-line site. A future separately permitted emergency edge operation must first freeze **the exact effective live configuration** with confidential governance, reconcile these additions and re-run real proxy denial/unauthorized-access acceptance against that reconciled source.

This does **not** alter the release decision: the local candidate's 19-handler parser and 11/11 real HTTP fixture PASS are valid for the frozen canonical rule, but **production-specific source convergence and independently permitted execution are still HOLD**. The read-only metadata inspection did not issue any Caddy admin write, reload, image pull, credential/member read, or production file change.
