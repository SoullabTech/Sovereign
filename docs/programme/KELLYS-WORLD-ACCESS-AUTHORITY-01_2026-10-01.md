# KELLY'S WORLD — ACCESS AUTHORITY 01 · 2026-10-01

## Purpose
Carry the production beta-access authority into Kelly's World as a human-readable projection without creating a second roster, changing access, or granting authority.

## Governing distinction
Beta tester / ordinary platform access ≠ Early Field experimental admission ≠ subscription state.

`members.tester` remains the beta-cohort authority. Early Field remains a separate experimental cohort. Subscription state does not gate ordinary platform access.

## Production witness
Witnessed against running production commit `56d0cd679` on 2026-10-01 after merge commit `d8e0c6bc` (#1614) had entered its ancestry.

```json
{"kind":"kellys_world_access_authority_v1","authority":"members.tester","ordinary_platform_minimum":"free","subscription_gates_ordinary_platform":false,"early_field_separate":true,"beta_testers":7,"password_capable":7,"email_code_capable":6,"early_field":4,"witnessed_running_commit":"56d0cd679","source_merge_commit":"d8e0c6bc","standing":"PRODUCTION_WITNESS","projection_law":"WITNESS_IS_NOT_AUTHORITY"}
```

## Kelly's World standing
System may render this record as governing orientation plus the latest witnessed counts. Field Library retains the evidence record and provenance.

The projection must say when it was witnessed and must never imply that Kelly's World itself grants, revokes, extends, or narrows member access.
