# RETRACTION RECORD — 2026-08-12 — Deployment Claims Made Against the Wrong Host

**Status:** findings, not errata. **Preserved deliberately** per founder ruling: these retractions are evidence about the deployment-observability problem itself.

**Scope:** deployment-related claims only. **The static census (CMC-001 Units 1–10 + reconciliation) and the SECREM-001 design and implementation are unaffected** — they were made against canonical source and remain true of canonical source.

---

## The root error

`soullab.life` is served by **`minisforum` (192.168.0.104)**, not by the Mac Studio (`192.168.0.101`) where all of today's operational work was performed.

Evidence, observed on the Mac Studio:

- `/etc/hosts:17-19` pins `minisforum`, `soullab.life`, and `api.soullab.life` all to `192.168.0.104`. The file's own comment claiming these "resolve to Mac Studio directly" is **false**.
- `openssl s_client -connect 127.0.0.1:443 -servername soullab.life` → **"Could not find certificate."** The local Caddy serves no `soullab.life` site.
- No running container on the Mac Studio is named or aliased `maia-sovereign`. That — not a configuration bug — is why `maia-sovereign:3000` NXDOMAIN'd inside `maia-caddy`.
- Live MAIA self-reports commit **`e5f2c5fa2ba6b1d4518e90e43945c7f67fe2033d`** (2026-08-11 19:07), an ancestor of canonical, **11 commits behind** `52a3b924b7cf52013c1c8b0d635359c2cad672fc`.

**The Mac Studio runs a parallel, non-serving MAIA stack.** Both hosts share one public IP (`32.219.7.166`) behind NAT, and the port forward targets `.104`. That is why availability checks from the Mac Studio returned HTTP 200 throughout: `.104` was answering, always.

---

## R-1 · `LIVE_EDGE_PASSES` — RETRACTED

**Claimed:** the deployed Caddy config was byte-identical to canonical blob `b8c7b8706e2b3a55730fc26f1884b65934f9d714`, contained zero body-filtering directives, and therefore the deployment residual on the client-reachable prompt-injection surface was closed.

**Why wrong:** measured against the Mac Studio's Caddy, which serves nothing.

**Corrected state:** **`LIVE_EDGE_UNRESOLVED` reinstated.** The deployment status of the SECREM-001 security finding is unknown pending inspection of the real edge on minisforum.

## R-2 · "Intentional production interruption" — RETRACTED

**Claimed:** the Docker Desktop restart during the maintenance window took production down for ~90 seconds, and production then recovered.

**Why wrong:** production was never affected. The restart touched a non-serving stack. The HTTPS 200 readings before, during, and after were `.104` responding throughout.

**Corrected state:** the maintenance window performed **no production interruption**. Docker management recovery on the Mac Studio was real and remains valid *for that host*.

## R-3 · "Backup coverage restored" — RETRACTED (most consequential)

**Claimed:** `maia_backup_20260812_163030.sql.gz` restored production backup coverage, verified structurally identical to the Aug 10 reference (6,124,527 vs 6,124,539 bytes; 12 vs 12 completion markers; 189,381 vs 189,381 lines).

**Why wrong:** the backup targets `maia-postgres` **on the Mac Studio**. That container has `PortBindings: map[]` — it publishes **no host port**. Host `:5432` is an unrelated Homebrew postgresql@17. **Nothing on `.104` can reach that database.** Production therefore does not use it.

**Corrected state:** the backup is valid, verified, and **of a database production does not use.** Production backup coverage is **UNKNOWN**. The last verified backup of the actual production database is undetermined, as is whether any backup of it exists.

The 38 daily artifacts on the Mac Studio may protect a parallel stack rather than members' data.

---

## What this says about the system, not just the session

The deployment-observability problem is the finding:

1. **`/etc/hosts` carries a comment that contradicts its own entries.** A reader trusting the comment concludes the opposite of the truth.
2. **Two near-identical MAIA stacks run on adjacent hosts**, one serving and one not, with overlapping container names and a shared public IP. Nothing at the shell distinguishes them.
3. **Availability checks cannot discriminate hosts** behind a single NAT'd IP — HTTP 200 from the Mac Studio proved only that *something* answered.
4. **The running artifact carries no verifiable build provenance** reachable from the Mac Studio; the commit is self-reported by the app, and compose reportedly injects `GIT_COMMIT` at runtime, which would override any baked value.
5. `IMMUTABLE_SHA_DEPLOY.md` reportedly documents a 2026-07-27 shared-checkout deploy race and a known dirty `Caddyfile` on minisforum; the preventive control is marked **proposed, not deployed**.

## The methodological failure

The principle was already recorded before these claims were made:

> **Source truth is not runtime truth until the deployment lineage is proven.**

It was applied to *source vs runtime* and not to *which host*. Every operational check assumed the host under the shell was the host under the domain. Nothing verified that, and the one artifact that would have — `/etc/hosts` — was not read until the deployment target could not be found.

**Extension for future units:** before any operational claim about production, prove *which machine* serves the domain. Locality is an assumption, and on this network it is the wrong one.

---

## Unaffected

CMC-001 Units 1–10 and the reconciliation · `CONTINUITY-INTEGRITY-FINDING-01` and `-02` · the four referred defect records · SECREM-001 design, implementation, and T3 (commit `d740f44c0`, parent `52a3b924`, **not deployed**).

All were bound to canonical source and remain true of it. What is now unproven is the bridge from canonical to what members actually meet — which is precisely what the runtime witness was to establish, and which must now come earlier.
