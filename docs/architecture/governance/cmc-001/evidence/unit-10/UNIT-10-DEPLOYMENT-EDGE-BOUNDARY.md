# CMC-001 · Unit 10 — Deployment Edge Boundary Check

**Classification: `EDGE_PASSES`**

Read-only. No network request, no probe, no payload construction, no remediation.

**Referent**: `refs/heads/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. Frozen mandate blob `8374f1e942c8e4f8b41dab319eb75dabf609681b` verified.

> **Provenance note.** The executing unit returned its findings inline and wrote no artifact file. This record was authored from that return by the adjudicating session, with the three load-bearing claims independently re-derived against canonical before recording (binding lineage, absence of body directives, `/api` handler shape). Claims not independently re-derived are marked below.

---

## The question

> Does the deployed Caddy / middleware edge prevent externally supplied `conversationContext.depthConfig` from reaching the application, or does it pass through?

## Answer: it passes through

### Binding lineage — independently verified

`docker-compose.production.yml` (blob `55960fb38155a349588d4be61e7bab037a607602`) mounts `./Caddyfile:/etc/caddy/Caddyfile:ro` into the `maia-caddy` service on ports 80/443, using stock `image: caddy:2-alpine`.

`Caddyfile` blob **`b8c7b8706e2b3a55730fc26f1884b65934f9d714`** is therefore the in-repository production edge for `soullab.life`.

### No body filtering exists anywhere — independently verified

Zero occurrences across the entire tracked tree for every body-touching directive checked: `request_body`, `body_filter`, `client_body_buffer`, `proxy_set_body`, `lua_need_request_body`.

### The `/api` handler is a bare reverse proxy — independently verified

`reverse_proxy maia-sovereign:3000` with only `header_up Host / X-Real-IP / X-Forwarded-For / X-Forwarded-Proto`. Those add **request headers**; they do not touch the body. Every matcher in the file is path, method, header, or host based — no body-content matching.

### Reported by the unit, not independently re-derived

* Exhaustive two-pass sweep of all 10,671 tracked files for edge/proxy config by filename and by content.
* `nginx/*.conf` files exist but are **unreferenced** — the production compose contains no nginx/traefik/haproxy/envoy reference.
* The image is stock with no `xcaddy` build, so no body-aware Caddy module is present.
* `livekit.soullab.life` has a genuine default-deny allow-list, but it is path/protocol scoped and irrelevant to `soullab.life/api/*`.
* `middleware.ts` (blob `bb7d5fdb6272e5133444dbefa5c4c7c185fe265c`) never reads the body — no `.json()`, `.body`, `formData`, or body `clone()`; it rewrites URLs and sets response headers.
* `next.config.js` rewrites are URL-level. `middlewareClientMaxBodySize` and `serverActions.bodySizeLimit` are **size** ceilings, not field filters.

---

## Residual uncertainty — stated plainly

The compose mount is host-relative `./Caddyfile`, resolved from whatever directory production compose runs in. **That the running host's file is byte-identical to blob `b8c7b870…` is not provable from repository contents.**

This classification is therefore about the **in-repository** edge, which is what the unit's mandate scoped. Host-side drift would require an out-of-repository witness — reading the live container's config — which was explicitly out of scope and not performed.

Practically: repository evidence shows no filtering, and there is no in-repo mechanism that would introduce it. Drift could only make the edge *stricter* by someone having changed it on the host without committing the change.

## New application-layer surface opened?

**None.** Nothing found extends beyond what Units 8–9 established.

One adjacent observation recorded and not pursued: `middlewareClientMaxBodySize: 30 * 1024 * 1024` raises the buffered body ceiling for all middleware-matched routes. A capacity parameter, not a validation boundary. Out of scope, non-authorizing.

## Consequence

The static forensic map closes with the field path **unfiltered from edge to application**.

Per the founder's standing ruling for this outcome: **stop for security-remediation authority.** No repair authorized, none proposed, none begun.
