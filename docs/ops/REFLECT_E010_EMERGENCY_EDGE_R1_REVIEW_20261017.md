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
