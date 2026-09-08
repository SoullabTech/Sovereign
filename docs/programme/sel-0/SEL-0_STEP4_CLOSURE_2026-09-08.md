# SEL-0 Step 4 — eligibility overlay · state-read half · **COMPATIBLE**

**Branch** `feature/jarvis-ws2-sel0-production-discovery-2026-09-08`
**Opened from** `f9b6af7c9` (founder act, confirmed ancestor of HEAD before the read).
**Authority** `SEL-0_STEP4_OVERLAY_SOURCE_PROOF_2026-09-08.md` — structural half discharged
there; this document is the state-read half it defers to a session with production access.

Identifiers were taken from the frozen artifacts, never rediscovered from production:
reading id and frozen read state from Manifest C's `global_ranking_context`, member scope from
the source snapshot, the 19 keys from `Manifest C · items[].native_payload.key`. Manifest B was
not opened. No provider was called. The selector was not implemented and not run.

---

## How the read was performed

Inside the deployed container, using its own code paths — so the predicates were evaluated by
the same functions the Studio runtime uses, not by a reimplementation:

```text
host / container    minisforum · maia-sovereign · maia_consciousness
standing            currentStandings(memberId, readingId)
                    lib/manuscript/standing/store.ts
supersession        assessReading(frozenReading, loadLiveWork(manuscriptId, memberId))
                    lib/manuscript/developmentalReading/assess.ts
                    lib/manuscript/development/capture.ts
frozen reading       the Step-0 source snapshot — NOT a fresh production read
live Work            production, at read time
statements           SELECT only
```

The frozen reading came from the artifact and the live Work from production, which is exactly
the comparison `assessReading` is defined over: *the reading as frozen, against the Work as it
now stands.*

Temporary inputs were written into the container's `/tmp` and one script into `/app/scripts`,
then removed. No production data was written.

---

## Q12, applied as ruled

```text
current       -> passes
superseded    -> excluded
unmeasured    -> SELECTION_BOUNDARY_UNMEASURED -> ABORT
```

```text
live_work_sections_loaded        YES
standing_rows_for_reading        0
frozen F-7 candidates            19
excluded by dismiss              0
excluded by supersession         0
excluded by both                 0
unmeasured                       0
final contract-lawful n          19
```

`unmeasured = 0`, so the overlay did not abort and is valid. `n = 19 = 19`: the Step-0 corpus
and the ratified §2.3 boundary agree on every member.

⚠️ **This is a measurement, not a guarantee about the future.** The source proof warned that
`n < 19` was the more likely fork because supersession is evaluated against the manuscript as it
stands, and a worked manuscript supersedes observations covering edited sections. That it came
back 19/19 means the covered sections are unchanged since the 12:07Z freeze — **today**. The
overlay freezes that state for this run by founder ruling; a later production state does not
retroactively alter this fixture, and does not license reusing it after the Work moves.

⚠️ **`standing_rows_for_reading = 0` is a real reading, not an assumed default.** The reader
throws rather than returning `[]` on error, so zero rows is the store's answer, not the
instrument's silence. No standing value was invented for any observation; `UNSET` is recorded
as absence, exactly as the source proof requires.

---

## Fixture integrity

```text
Manifest B · blind        BYTE-IDENTICAL to the Step-0 freeze
Manifest C · native       BYTE-IDENTICAL to the Step-0 freeze
source snapshot           BYTE-IDENTICAL to the Step-0 freeze
Manifest A · source       CHANGED at 81d79b941 — the founder's blind-safety repair
excluded set              CHANGED at 81d79b941 — same act
```

A and the excluded set differ from their original freeze digests **by a recorded founder act,
not by drift**: `81d79b941 docs(ws2): blind-safety repair of SEL-0 Step-0 exclusion reasons`,
which followed this lane's reason-conformance FAIL. Recorded here rather than smoothed over,
because a digest that changed for a good reason and a digest that changed silently look
identical in a table that does not say which.

The stimulus and native surfaces — the two that decide what either ranker sees — are unchanged.

Overlay and lock:

```text
SEL-0_STEP4_ELIGIBILITY_OVERLAY.json   0e63748b84b02c40d69d54df43d90942fc3b23587a3f0be4c8d2f86228220244
SEL-0_FIXTURE_LOCK.json                f07322aedc5ed1b1a073c4bbd24ea33a308a3db025100369e2e425126d83f3bb
```

The overlay carries the same 19 observation identities as Manifest C, verified by set equality,
so the three views and the overlay still bind to one candidate-set identity.

---

## Standing

```text
STEP 4                    COMPATIBLE — MISMATCH RESOLVED
  standing predicate      READ · authoritative source · 0 rows
  supersession predicate  DERIVED · all 19 current
  Q12 abort gate          NOT TRIGGERED
OVERLAY                   FROZEN
FIXTURE                   LOCKED
contract-lawful n         19
STEP 5 (lock)             this document
STEP 6 (implement)        NOT ENTERED
SELECTOR                  NOT IMPLEMENTED · NOT RUN
MANIFEST B                NOT OPENED
THRESHOLD                 NOT SET
RANKINGS                  NOT STARTED · founder blind INTACT
F-7 REPAIR                NOT TOUCHED
PHASE 2                   NOT OPEN
PRODUCTION WRITES         NONE
MERGE / DEPLOY            NOT AUTHORIZED · none performed
```

Stopping before implementation.
