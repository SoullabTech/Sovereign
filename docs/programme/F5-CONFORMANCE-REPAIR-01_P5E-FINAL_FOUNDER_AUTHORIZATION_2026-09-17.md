# F5-CONFORMANCE-REPAIR-01 - P5-E FINAL EXECUTOR + RESTORE REHEARSAL - FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** continuation after P5-D-R3 PASS at `396d2c2cc7cee6fe100a3168ad30c363dd338029`

```text
MODE                       DISPOSABLE GOVERNED EXECUTOR + RESTORE REHEARSAL
PRODUCTION / STAGING       CLOSED
REAL MEMBER DATA           CLOSED
CANONICAL MERGE / DEPLOY   CLOSED
```

This act authorizes one fresh local PostgreSQL 17.7 rehearsal using synthetic identities only: canonical bootstrap/migrations, narrow adjudicated seed, pre-erasure backup, read-only activation check, `executeAccountErasure()`, durable post-state verification, replay of the pre-erasure backup through `scripts/restore-governed.sh`, and anti-resurrection/Circle-history verification.

Stop and return on any failure. A disposable PASS may earn rollout-readiness evidence but does not authorize production, staging, merge or deploy.
