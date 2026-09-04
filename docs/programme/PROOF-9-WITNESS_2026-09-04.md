# PROOF 9 — production witness, divination recall on `/list`

**Verdict**: **PASS** (founder adjudication, 2026-09-04)
**Programme**: `MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` · Track A, Pass 1
**Cuts closed**: `JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01` Cut 1B (recall) and Cut 1C (persistence)

## Runtime

```text
GIT_COMMIT     b20f2742e   (canonical; descends from the divination merge b7d3dacf9 — verified)
container      created 2026-09-04T16:30:39Z · restarts=0 · DEPLOY_LANE=deploy-lane
/list wiring   present in b20f2742e (3 references)
between cut    ABSENT from b20f2742e (0 references) — e3f379530 was replaced at 16:30
```

## The turn — one request, 17:56:39Z

```text
member                 88099bb1977c            [MAIA] userId resolved · fromSession present
durable exchange       9bacb232                🧱 [MAIA/durability] durable=true
divination-block       candidateCount 2 · emitted true · surfacedCount 2
                       intent 884 · cast 906 · interpretation 1472 chars
shadow                 turnId 9bacb232-0e5c-4569-8410-32032a945d4c
                       zeroDiff true · missingInCanonical [] · missingInLegacy []
                       digestMismatch [] · legacy 12 / canonical 12
injection              🜨 Member's questions/notes 883 · Casts on record 905
                       · House interpretation 1471
provider               Anthropic primary · MODEL_ROUTING sonnet · CORE tier
```

**Same-turn binding**: the durability line's `exchange=9bacb232` and the shadow line's `turnId 9bacb232-…` share the exchange identity, and the divination block sits between them inside one request. The three injection lines follow in the same request. This is turn-level binding, not co-occurrence in a window.

**Producer count**: 12/12 versus 9/9 in the negative control — the three divination producers admitted, nothing else changed.

## Member experience

Asked from the present without supplying the answer, MAIA returned hexagram 55 Abundance, fire below / thunder above, changing lines 5 and 6, transformation to hexagram 13 Fellowship with Others, the Larry Closs / Now What? question, and the corpus interpretation and guidance. Observed by the founder. Contrast with 2026-09-03, where she had the gist and explicitly lacked the hexagram identity.

## Chain

```text
REMEMBERED                    PASS · 13:52:25 cast persisted, primaryHex 55, readingId 1e098ab3
RETRIEVABLE                   PASS · loader returned candidates for the correct member
AVAILABLE                     PASS · no withholding; three producers admitted
ADMITTED                      PASS · shadow manifest, zeroDiff, 12/12
USED                          PASS · the reply named the record's own fields
EXPERIENCED AS CONTINUITY     PASS · asked from the present, MAIA already knew
```

## Open finding inside the pass

`candidateCount: 2`. Only one cast was made on 2026-09-04, and the five prior readings are all older than the 60-day window. The likely cause is the Save-button duplicate flagged before the witness: `/oracle/iching` now persists on cast (Cut 1C) while the page's Save button still writes a second row through `/api/divination/save`.

**Not yet proof.** Two rows sharing `primary_hex` would be suggestive only — two genuine casts can land on the same hexagram. The decisive read-only check compares the whole cast fingerprint:

```sql
SELECT id, created_at, question, cast_method, primary_hex, relating_hex,
       changing_lines, line_values
FROM divination_iching_readings
WHERE created_at > NOW() - INTERVAL '60 days'
ORDER BY created_at DESC;
```

Confirmation shape: two recent rows sharing question, `line_values`, `changing_lines`, and primary/relating hexagram, separated only by the cast-to-save interval. Then:

```text
SAVE DUPLICATE
CONFIRMED
FIRST BROKEN LINK   WRITE PATH
CAUSE SHAPE         cast auto-persists + Save persists the same reading again
```

Detection detail from the source: `app/oracle/iching/page.tsx` `handleSaveReading` hard-codes `cast_method: 'yarrow'`, while the cast path persists the method actually requested. So a duplicate pair may differ in `cast_method` while every cast field matches — that asymmetry is itself a signature, and it also explains why all five historical rows read `yarrow`.

Read-only confirmation is allowed now. The repair is a bounded write-path cut of its own, later — not folded into recall, convergence, or attribution.

## Custody finding, unadjudicated

`b20f2742e` replaced `e3f379530` in production at 16:30:39 with no act from this lane. **Who deployed it, and was it authorized, is UNKNOWN and must not be inferred** from the commit author or from a GitHub gate run. Host-side deploy provenance is required.
