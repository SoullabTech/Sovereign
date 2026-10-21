# MAIA-MEMORY-ATTRIBUTION-01 / R0A — Production Truth + Gate Status

```text
STANDING            EVIDENCE · normative authority NONE
BASE                clean-main-no-secrets @ 5f8d39c7f0ce206be42469e66f366c4ff82dc62e
INHERITS            R0 current-canonical reconciliation (2026-10-01)
PRODUCTION READ     bounded metadata / schema / container / content-free logs only
PRODUCTION WRITE    NONE
CODE / SCHEMA       NONE changed
DEPLOY               NONE
DATE                 2026-10-02
```

R0 left two founder-owned next acts:
1. a read-only production truth check for G6 (practitioner-observation return authority);
2. the Cut 1A production witness required before P6 attribution may open.

R0A performs only the evidence-bearing parts that can be completed without inventing a member turn,
changing authority, or altering production. It does not open P6, M3, or a repair lane.

## 1. Freshness correction since R0

R0 was grounded at `4ad29690c`. Current canonical advanced materially in one previously open area:
G1 developmental-memory ancestry is no longer an unimplemented missing capability.

Current canonical contains:
- `database/migrations/20261001000001_developmental_memory_source_exchange.sql`;
- runtime wiring in `lib/memory/MemoryWriteback.ts`;
- `lib/memory/__tests__/developmentalAncestryWiring.test.ts`.
The developmental-ancestry lane has its own custody record and must not be folded into G6/Cut 1A.
R0A therefore removes G1 from the active MAIA-MEMORY-ATTRIBUTION edge without adjudicating that
lane's separate sequence/custody questions.

## 2. G6 production schema truth — ESTABLISHED

Production `schema_migrations` records:

```text
20260903000001_return_authority_fail_closed.sql
applied_at = 2026-09-03 13:50:27.168384+00
```

The live `member_memory_atoms.return_preference` column default is:

```text
'member_pulled'::text
```

So the fail-closed schema change is real in production.

The current canonical practitioner-observation writer still explicitly inserts:

```text
source_type       = practitioner_observation
return_preference = contextual_doorway
generated_by      = practitioner-observation
```

at `app/api/studio/with-me/sessions/[sessionId]/route.ts`.

That literal overrides the fail-closed default. The writer-side defect remains structurally live.
## 3. G6 row census — RESIDUAL LIVE DEFECT

A narrow first query for the current writer signature
(`generated_by = practitioner-observation`) returned zero rows.

A broader source-type census then found the historical population R0 needed to distinguish:

```text
source_type              practitioner_observation
generated_by             unattributed-historical
return_preference        contextual_doorway
rows                     12
created                  2026-06-24 .. 2026-06-25
created after P6 migration 0
```

These rows predate the S5 provenance migration. S5 later truthfully backfilled pre-provenance atoms
as `unattributed-historical`. The Path-B P6 migration resealed only rows whose
`generated_by = practitioner-observation`, so this historical population was mechanically outside
its backfill predicate.

Current row posture:

| Attributed? | Status | Member response | Rows |
|---|---|---|---:|
| no | active | NULL | 9 |
| yes | archived | NULL | 2 |
| yes | active | NULL | 1 |

Applying the live prompt-loader predicates exactly yields:

```text
prompt-eligible practitioner observations = 1
affected members                         = 1
```
No member text, atom body, title, journal, session content, or practitioner content was read.
Only row counts and non-content custody fields were inspected.

### G6 disposition

```text
SCHEMA DEFAULT                 FAIL-CLOSED · member_pulled
CURRENT WRITER                 BROKEN · explicitly confers contextual_doorway
POST-MIGRATION CURRENT-WRITER ROWS
                               0
HISTORICAL PRACTITIONER ROWS   12
PROMPT-ELIGIBLE RESIDUAL       1 row · 1 member
REPAIR                         NOT PERFORMED
```

This is not merely a future hazard. One historical practitioner-authored object is currently
eligible for ambient prompt return under permission the P6 migration intended to remove.

R0A does not mutate that row. Altering its return authority is a member-affecting authority act
and remains outside an evidence-only witness.

## 4. Cut 1A runtime provenance — ESTABLISHED

Production runtime at witness time:

```text
GIT_COMMIT     13a0308d7
DEPLOY_LANE    deploy-lane
container      created 2026-10-02T11:18:58.960657944Z
image          sha256:8986038381b730aa71b1914b5a6c3f31de26bb4329819eb41450cd4384f0e1d3
```

The following three tags resolve to that same image:
- `maia-sovereign:current`
- `maia-sovereign:prod`
- `maia-sovereign:13a0308d7`
The image's baked environment and the running container both report the same
`GIT_COMMIT=13a0308d7` and `DEPLOY_LANE=deploy-lane`.

Repository ancestry establishes that `13a0308d7` contains:
- Cut 1A implementation `7bbec9b3d`;
- the adopted governance amendment `825a0c2a5`;
- `lib/maia/orientation/contract.ts` and the shared service threading.

Therefore the Cut 1A code substrate is physically present in the running production artifact.

## 5. Cut 1A custody qualification — NOT CURRENT CANONICAL

The exact live commit is not current canonical lineage at this witness point.

```text
production SHA     13a0308d706c684f21aa53741791cb224334ff82
remote branch      origin/chore/maia-developmental-ancestry-i2-live-descendant-20261002
record base        5f8d39c7f0ce206be42469e66f366c4ff82dc62e
merge-base         298414555bbe7eccdf453b09e026737d4f7f4e29
13a ancestor of record base?  NO
```

So this runtime cannot satisfy the Cut 1A custody instruction by being silently treated as a
fresh candidate derived from current canonical. It is an exact, attested production artifact,
but it is a divergent named branch artifact.

R0A does not infer that its deploy was unauthorized; that question belongs to the lane that
produced the live-descendant branch. For Cut 1A, the narrower conclusion is enough:
the exact-canonical production-candidate condition is not established here.
## 6. Cut 1A behavioral witness — NOT YET EXERCISED

The Cut 1A contract requires a real signed-in production turn whose content-free shadow reports:

```text
[MAIA/orientation-shadow]
applied: false
zeroPromptDiff: true
contractSource: service (/list) or upstream (/between)
```

No such line exists in the current container logs.

That absence is not a negative behavioral result. A database count shows:

```text
conversation_turn rows created after 2026-10-02T11:18:58Z = 0
```

The exact runtime has therefore not yet processed a persisted conversation turn from which the
required shadow observation could be taken.

R0A deliberately does not manufacture a member turn to make the witness pass.

### Cut 1A disposition

```text
DECLARED BUILD IDENTITY        ESTABLISHED
RUNTIME ARTIFACT ATTESTATION   ESTABLISHED
CUT 1A CODE PRESENT            ESTABLISHED
FRESH CURRENT-CANONICAL SHA    NOT ESTABLISHED
QUALIFYING LIVE TURN           NOT YET OBSERVED
SHADOW BEHAVIOR                NOT YET EXERCISED
CUT 1A PRODUCTION WITNESS      UNWITNESSED
P6 ATTRIBUTION                 CLOSED
M3                             UNAUTHORIZED
```

This is a pending witness, not a failed one.
## 7. What may happen next

### G6

Evidence now earns a founder adjudication between bounded authority-preserving options.
R0A does not select one.

Any repair must account for both:
1. the writer's explicit `contextual_doorway` override for future practitioner observations;
2. the one currently prompt-eligible historical row missed by the Path-B migration predicate.

No content backfill, significance inference, authorship rewrite, or broad historical relabel is
licensed by this evidence.

### Cut 1A

Do not call the witness complete.

A later witness may proceed only when:
1. the lane has an exact production candidate satisfying its current-canonical custody rule;
2. image and container independently attest that exact SHA;
3. a naturally occurring ordinary signed-in turn exercises the runtime;
4. the content-free shadow line proves `applied: false`, `zeroPromptDiff: true`, and the
   correct `contractSource`.

Until then:

```text
P6 attribution  CLOSED
M3              UNAUTHORIZED
```

## 8. R0A conclusion

```text
G1 developmental ancestry      MOVED OUT OF THIS EDGE · implemented in its own lane
G6 schema default              HEALTHY / fail-closed
G6 current writer              BROKEN
G6 residual historical state   LIVE · 1 prompt-eligible row · 1 member
Cut 1A artifact provenance     ESTABLISHED
Cut 1A exact-canonical custody NOT ESTABLISHED
Cut 1A behavioral witness      NOT YET EXERCISED
Implementation in this act     NONE
Production mutation            NONE
```

R0A stops here. It is evidence, not repair authority and not a production-witness admission.
