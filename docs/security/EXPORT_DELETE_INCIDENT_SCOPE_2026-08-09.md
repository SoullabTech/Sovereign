# Incident scope — `DELETE /api/premium-storage/export` object-authorization gap

**Date:** 2026-08-09 · **Read-only.** No production state was modified.
**Question:** did any non-owner ever delete a member's export archive through the pre-auth gap?
**Finding:** **no evidence of any deletion, by anyone, ever — and two independent reasons it could not have succeeded.** Retention does not cover the endpoint's full life, so this is *no evidence of harm*, not *proof of no harm*.

---

## State (per `INCIDENT_RESPONSE_STANDARD.md` — seven independent facts)

| designed | implemented | tested | merged | deployed | live-verified | closed |
|---|---|---|---|---|---|---|
| ✅ | ✅ | ✅ 7/7 | ✅ `043cf3197` | ✅ `46cdd47dd` | ✅ 401 at boundary | ✅ |

## ✅ Production status: **CLOSED** (2026-08-09)

**Vulnerable behaviour is no longer reachable in production as of `46cdd47dd`.**

| | |
|---|---|
| Merged | PR #996 → `clean-main-no-secrets` (`043cf3197` under merge commit `46cdd47dd`) |
| Deployed | quick `deploy-maia` lane; provenance verified `GIT_COMMIT=46cdd47dd == asserted 46cdd47dd` |
| Classification | Class A — Sacred Boundaries (applied retroactively; see §6) |

**Verification at the live boundary** — no destructive action was exercised (unauthenticated call, deliberately nonexistent id):

```
401  DELETE /api/premium-storage/export?exportId=probe-nonexistent-0000
     {"error":"Unauthorized","message":"Authentication required."}
400  DELETE /api/premium-storage/export     {"error":"Missing exportId parameter"}   ← validation still first
400  GET    /api/premium-storage/export     {"error":"Missing userId parameter"}     ← unchanged
200  GET    /api/health                     version=46cdd47d…
```

The `401` is the closure evidence: that exact request previously reached `prisma.exportArchive.findUnique`, then `fs.unlink`, then the row delete. It now terminates at authentication, before the Prisma client is constructed.

**Residual condition:** `ExportArchive` remains non-backed and inert in production. ⭐ **This is no longer relied upon as the security boundary** — it is now redundancy behind an enforced control, which is the whole point of having shipped the repair despite zero evidence of harm.

**Rollback:** `maia-sovereign:previous` preserved; revert-commit alone is sufficient (+171/−0, no schema, no migration, no flag).

---

## 1. Access-log evidence

Caddy access logging is enabled for the API vhost (`/var/log/caddy/api-access.log`, `access.log`, plus size-rotated `.gz` archives).

**Every retained request touching `/api/premium-storage/**` or `/api/caseload/**`, across all plain and compressed logs:**

```
2026-08-09T22:30:55.053Z  GET  400  /api/caseload/probe-nonexistent/list   ua=Bun/1.3.2
2026-08-09T22:30:55.070Z  GET  400  /api/premium-storage/export            ua=Bun/1.3.2
--- 2 requests total
```

Both are **this audit's own reachability probes** (§0 of `API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md`), identifiable by the `Bun/1.3.2` agent and the timestamp. Neither carried an identity parameter; both were rejected by the route's own validator.

**Zero `DELETE` requests. Zero requests from any other client. Zero requests from any browser or app user-agent.**

**Retention window:** oldest rotated API log begins **2026-07-11T01:37Z**; coverage is continuous to now — roughly four weeks. ⚠️ **Requests before 2026-07-11 are not observable.** The endpoint predates that window; how far back is not established here.

## 2. Independent structural evidence — the handler could not have succeeded

The `ExportArchive` Prisma model **has no table in the production database.** A search for `export_archive*`, `exportarchive*`, `%premium%`, `%member_storage%` in `maia_consciousness` returns **nothing**.

So `prisma.exportArchive.findUnique({ where: { id: exportId } })` would throw before reaching `fs.unlink` or `.delete`. The destructive path was unreachable in production **regardless of authorization** — the same shape as the `delete-my-memory` finding, where the surface was inert because its tables did not exist.

⛔ **This is not a security control and must not be recorded as one.** A migration creating those tables would have converted a latent gap into a live one with nothing failing in between. It is why the fix was still worth cutting as a P0.

## 3. Determination

| | |
|---|---|
| Confirmed non-owner deletions | **0** |
| Deletions of any kind through this endpoint | **0 in the retained window** |
| Requests to the endpoint by any real client | **0 in the retained window** |
| Could a deletion have succeeded if attempted? | **No** — target table absent |
| Disclosure obligation triggered on this evidence | **No** |

**Stated limits.** (i) Four weeks of retention; the pre-2026-07-11 period is dark. (ii) Absence of the table today does not prove it never existed — no migration history for the Prisma models was traced. (iii) Caddy logs record method, path, status and user-agent; they would **not** have recorded which archive was targeted or who the caller was, because the endpoint required no identity. Had a deletion occurred inside the window, the log alone could confirm *that* it happened, not *whose* archive it was.

## 4. Follow-on questions for the founder

1. **Is `/api/premium-storage/**` a live product surface at all?** Zero traffic in four weeks, no backing tables, Prisma in a codebase that otherwise uses `lib/db/postgres.ts` directly. Retiring it may be more honest than defending it — and would remove six routes from the caller-identity remediation list.
2. **Should log retention be lengthened** for destructive endpoints specifically? Four weeks is short for a question of this kind, and the answer arrived by luck of the surface being inert rather than by the record being adequate.

## 5. Reproduce

```bash
# all retained requests to either namespace
ssh soullab@minisforum 'docker exec maia-caddy sh -c "
  for f in /var/log/caddy/*.log;    do grep -hE \"premium-storage|api/caseload\" \$f; done
  for f in /var/log/caddy/*.log.gz; do zcat \$f | grep -hE \"premium-storage|api/caseload\"; done"'

# the backing table does not exist
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc \
  "SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='"'"'public'"'"' AND c.relkind='"'"'r'"'"'
   AND (relname ILIKE '"'"'%export_archive%'"'"' OR relname ILIKE '"'"'%premium%'"'"');"'
```

---

*Read-only scope determination. No logs were altered, no production data read beyond schema names and request metadata.*
