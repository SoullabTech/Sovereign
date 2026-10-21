# MAIA-MEMORY-ATTRIBUTION-01 / R0B — Current Production Reconciliation

```text
STANDING            EVIDENCE · normative authority NONE
BASE                clean-main-no-secrets @ 8aa79ee44587c56617fbe386ea2fb98d48cc4a64
INHERITS            R0 + R0A
PRODUCTION READ     bounded metadata / schema / content-free logs only
PRODUCTION WRITE    NONE
DATE                 2026-10-02
```

R0A correctly observed production at `13a0308d7` while that SHA was on a divergent live
projection branch. Production and canonical moved after that witness. R0B records the successor
truth rather than rewriting R0A's historical observation.

## 1. Production lineage has converged

Production now runs:

```text
GIT_COMMIT  d4655e647
created     2026-10-02T12:08:26.421055868Z
image       sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab
```

`d4655e647` is merge PR #1727, **chore(production): converge live lineage into canonical**.
That PR joined canonical `5f8d39c7f` with the then-live `13a0308d7` lineage using a required
merge commit whose tree was byte-identical to canonical. Its purpose was ancestry convergence,
not runtime change.
Repository ancestry now establishes:

```text
d4655e647 is an ancestor of current canonical        YES
Cut 1A implementation 7bbec9b3d is in d4655e647    YES
governance amendment 825a0c2a5 is in d4655e647      YES
Cut 1A-relevant drift d4655e647 → current canonical NONE
```

Therefore R0A's "divergent live artifact" custody qualification is historical. The exact current
runtime is a canonical-lineage artifact and satisfies the artifact/ancestry side of the Cut 1A
production-candidate bar.

## 2. Cut 1A behavior remains unexercised

Since the current container was created:

```text
conversation_turn rows after 2026-10-02T12:08:26Z = 0
[MAIA/orientation-shadow] lines                       = 0
```

No negative behavioral conclusion follows. There has still been no ordinary persisted turn on the
exact runtime from which the required shadow observation could be taken.

```text
DECLARED BUILD IDENTITY        ESTABLISHED
RUNTIME ARTIFACT / ANCESTRY    ESTABLISHED
QUALIFYING LIVE TURN           NOT YET OBSERVED
SHADOW BEHAVIOR                NOT YET EXERCISED
CUT 1A PRODUCTION WITNESS      UNWITNESSED
P6 ATTRIBUTION                 CLOSED
M3                             UNAUTHORIZED
```
## 3. P6 drift is bilateral, not practitioner-only

R0A established the practitioner side:

- production default is `member_pulled`;
- current practitioner writer explicitly writes `contextual_doorway`;
- 12 historical practitioner rows still carry that permission;
- 1 row / 1 member is currently prompt-eligible.

R0B checked the opposite write path because Path B P6 explicitly said the fail-closed schema
change must not reverse the existing Keep doctrine.

Current canonical `keepSource()` still omits `return_preference` from its INSERT.
It therefore inherits production's post-P6 `member_pulled` default even though the member's own
Keep is the consent act that historically conferred contextual return.

Production metadata confirms the consequence:

```text
generated_by = member-gesture
return_preference = member_pulled
rows = 1
created after P6 migration = 1
untouched since creation = 1
```

No member content was read.

This is the mirror-image defect:

```text
practitioner write   too permissive   contextual_doorway without member act
member Keep          too restrictive  member_pulled despite member act
```

Both arise because canonical did not carry the P6 writer bindings when the fail-closed migration
was applied to production.
## 4. Existing law already fixes the direction

Path B's P6 donor mechanism does not supply new normative law here; it operationalizes law already
named by the current Memory Organism programme:

- contextual return requires member-conferred authority;
- practitioner authorship is not return authority;
- `member_pulled` is the truthful state when no return authority exists;
- a member Keep remains a member act that may confer contextual return;
- authorship and return authority must never rewrite each other.

The current production population also removes the main historical ambiguity:

```text
historical practitioner rows with contextual_doorway    12
last_touched_at before P6 apply time                    12
last_touched_at at/after P6 apply time                   0

post-P6 member-gesture rows at member_pulled              1
untouched since creation                                  1
```

So there is no evidence of a later member gesture that a bounded repair would overwrite.

## 5. Next lawful local act

A narrow Class A repair candidate is now mechanically bounded to:

1. carry the already-governed P6 return-authority constructor into the kept lineage;
2. make member Keep and member `set_return_preference` explicit member-conferred assignments;
3. make practitioner observations explicit `member_pulled` writes absent member authority;
4. restore canonical custody of the already-applied fail-closed migration;
5. add one new migration that:
   - reseals untouched practitioner-observation permissions left live by the provenance relabel;
   - catches any untouched current-writer rows created before deploy;
   - restores untouched post-P6 member Keeps to `contextual_doorway`;
6. certify the complete writer set and refuse new assignment paths.

This is local P6 completion only. It does not open Cut 1A/P6 attribution framing, M3, prompt
attribution, MemoryBundle partitioning, or Continuity Mode.

## 6. R0B conclusion

```text
Cut 1A artifact / ancestry      ESTABLISHED
Cut 1A behavior                 NOT YET EXERCISED
P6 return-authority drift       BILATERAL · demonstrated in production
practitioner residual           1 prompt-eligible row / 1 member
member-Keep residual            1 untouched row / 1 member
new constitutional vocabulary   NONE
implementation in R0B           NONE
production mutation in R0B      NONE
next local act                  Class A P6 writer/custody repair candidate
```

R0B stops as evidence.
