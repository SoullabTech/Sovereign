# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I3 EXACT-SHA DEPLOYMENT ACT

**Date:** 2026-10-02
**Standing:** deployment authority · conditional
**Class:** A
**Founder act:** continuation authorizes the bounded production promotion described here when all gates below hold.

> **I2R1 refresh:** the earlier draft target `aa42a174e` on `298414555` was never admitted or deployed. It became invalid when Writer Studio runtime `7be140182` landed first. This record now binds only the refreshed candidate below.

## 1. Authorized candidate

Production runtime base:

`7be140182723a25232689cc8c2afd5df14d37faa`

Exact isolated candidate:

`2143668824e50a3295464cbac3212970b0c4f845`

Branch:

`fix/maia-developmental-ancestry-i2r1-prod-cut-7be140182-20261002`

This act authorizes no other SHA.

The candidate is a direct descendant of the exact production runtime and contains only the developmental-ancestry programme cut. Current canonical is not the deployment target.

## 2. Preconditions

Deployment may proceed only if, immediately before the act:

1. production runtime still reports `7be140182`;
2. candidate SHA still resolves exactly to `2143668824e50a3295464cbac3212970b0c4f845`;
3. review PR #1717 has no failing Class A / build / sovereignty / diagram checks;
4. focused ancestry falsifiers remain 6/6 PASS;
5. TypeScript no-regression remains PASS;
6. migration lock-timeout law remains 10/10 PASS;
7. exact candidate snapshot has no production-pending migrations;
8. `developmental_memories.source_exchange_id` exists and zero historical rows have been populated by backfill;
9. deploy lock is available.

Any contradiction refuses the deployment.

## 3. Authorized command shape

The production act must use the immutable-SHA deployment lane:

`./scripts/deploy-production.sh deploy 2143668824e50a3295464cbac3212970b0c4f845`

No checkout-based deploy, no `update`, no HEAD escape hatch, and no current-canonical substitution are authorized.

## 4. Migration standing

The I0 migration filename is already present in production `schema_migrations` with an empty checksum.

The exact candidate snapshot has zero pending production migrations.

Current `apply-migrations.sh` semantics must therefore skip I0 as already applied. Re-executing I0 DDL is not authorized.

The historical blank checksum remains part of the I0A custody deviation and is not rewritten by this act.

## 5. Post-swap witness

After deployment, before I3 can close:

- running container `GIT_COMMIT` equals `214366882`;
- image provenance and running provenance agree with the asserted candidate;
- restart count is healthy;
- no historical lineage row was backfilled;
- Sanctuary retains its no-write behavior;
- the next naturally occurring eligible developmental-memory write, if/when one occurs, must carry the same UUID as its durable conversation exchange.

Do not synthesize a member conversation solely to manufacture the final behavioral witness.

Until a naturally eligible new memory exists, runtime standing is:
`DEPLOYED · LINEAGE-CAPABLE · BEHAVIORAL WRITE WITNESS OUTSTANDING`.

## 6. Rollback

If the candidate cannot remain healthy after swap, use the existing image rollback lane.

Because the I0 schema carrier is additive and already pre-existed this deployment, reader rollback does not require schema rollback.
