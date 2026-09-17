# F5-CONFORMANCE-REPAIR-01 - P5-E GOVERNED RESTORE REHEARSAL - FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Founder act:** continuation after P5-D-R4 PASS at `846910281623d7418a3839cf5c16a117a73191bc`

```text
MODE                       DISPOSABLE GOVERNED RESTORE REHEARSAL
PRODUCTION / STAGING       CLOSED
REAL MEMBER DATA           CLOSED
CANONICAL MERGE / DEPLOY   CLOSED
```

This act authorizes one fresh local PostgreSQL 17.7 rehearsal with synthetic identities only: canonical bootstrap/migrations, narrow adjudicated seed, targeted pre-erasure backup, successful governed executor completion, replay of that older backup through `scripts/restore-governed.sh`, and anti-resurrection/Circle historical-state verification.

The targeted dump may include only the synthetic member/account/session/Circle tables needed to falsify restore resurrection. Stop and return on any restore-path failure. A disposable PASS may earn rollout-readiness evidence but does not authorize production, staging, merge or deploy.
