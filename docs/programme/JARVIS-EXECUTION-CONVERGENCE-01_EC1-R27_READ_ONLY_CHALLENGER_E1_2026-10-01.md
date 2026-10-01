# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R27 — Read-Only Challenger E1 Seam

**Date:** 2026-10-01  
**Parent:** EC1-R26 evidence-ready census `44b344d0ede5`  
**Class:** bounded participant-scoped execution-authority seam

## Purpose

Enable the required GPT-OSS `local-review-1` challenger to use the existing canonical E1 read-only provider path without reopening E1 for the Qwen mutation primary and without weakening the full W0/W2 local-candidate authority.

## Change

For `local-native-candidate` Work only:

- Qwen `primary` remains refused by `LOCAL_CANDIDATE_USES_HOST_DECISION_PATH`;
- only challenger `local-review-1` / `GPT_OSS` / `independent_local_challenger` may enter E1;
- E1 derives a participant-scoped authority view for that challenger;
- the derived view narrows repository write to `none`, shell to `none`, and test execution to `false` while preserving read-only local evidence access;
- the full W0/W2 authorized-core snapshot remains unchanged and is still bound into the human grant.

## Grant truth

The E1 human one-shot grant now additionally records the exact `participant_authority_projection` used for the effect.

Grant validation re-derives and compares that projection before final admission.

Therefore:

- the grant remains bound to the full canonical Work authority;
- the effect receives a narrower subset appropriate to the challenger role;
- a later change in participant-scoped authority invalidates the grant;
- no second authority store or shadow Work Unit is introduced.

Final E1 permission for the challenger is:

```text
repo_read:          true
repo_write_scope:   none
execute_checks:     false
external_network:   false
provider_spend:     false
```

## Proof

`local-candidate-challenger-r27-proof.mjs`: **5/5 PASS**.

Proves:

- completed Qwen primary evidence unlocks a GPT-OSS challenger E1 preview;
- the preview is read-only while the full authorized-core snapshot still contains the original local-candidate worktree/test authority;
- Qwen primary remains refused by E1;
- the human challenger grant binds both full authorized core and narrowed participant authority;
- final grant evaluation yields a read-only permission envelope;
- narrowing is participant-specific and does not mutate canonical W0 authority.

Regression wall:

- canonical E1 proof: **15/15 PASS**;
- R20 local-candidate routing: **6/6 PASS**;
- R26 evidence-ready census: **3/3 PASS**.

## Standing

```text
Qwen primary execution:              HOST-DECIDED PATH ONLY
GPT-OSS challenger preview:          E1 ADMITTED
challenger authority:                READ-ONLY SUBSET
full W0/W2 authority:                UNCHANGED
human one-shot grant:                REQUIRED
challenger provider execution:       NOT YET WIRED BY EC1
EVIDENCE_READY:                      STILL BLOCKED UNTIL CHALLENGER ATTEMPT EXISTS
```

The next act may use the existing canonical E1 grant/confirm execution path for `local-review-1`, persist its durable result through the existing W4 result seam, and then re-run the unchanged `EVIDENCE_READY` law. It may not auto-authorize the challenger or bypass the human grant.
