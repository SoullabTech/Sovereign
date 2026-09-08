# Develop refusal records — retention schedule

```
LANE        WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R-3
RULING      founder, 2026-09-08 — HOST CRON, hourly, fixed UTC minute
STATUS      specification only · ⛔ CRON NOT INSTALLED
```

## The ruling

```
scheduler          HOST CRON
in-process timer   ⛔ FORBIDDEN
new service        NONE
API endpoint       NONE
cadence            HOURLY, fixed minute, UTC (:17)
```

**Why the clock owns this.** `sweepExpired()` is time-driven by construction —
a quiet month must not retain records indefinitely merely because no further
refusal occurs. An in-process timer would reintroduce a dependency of the same
shape one layer down: **process lifetime.** Frequent restarts can reset a timer
before it fires, several application processes can each hold their own, and
retention becomes an incidental responsibility of the web server.

**Why hourly, for daily files.** Deliberately conservative. The directory holds
one file per day, so the cost of an hourly run is trivial; the benefit is that
a deploy or a brief outage at the scheduled minute cannot postpone retention
for another whole day. A missed run recovers within the hour rather than at the
next daily instant.

**Why `:17`.** A fixed off-peak minute, away from `:00`, where scheduled work
elsewhere tends to cluster.

## The command

The records live on the container's audit volume (`AUDIT_LOG_DIR`), so the
sweep runs inside the container — the same shape as the Co-Lab release gate.

```cron
17 * * * * docker exec maia-sovereign npx tsx scripts/sweep-develop-refusals.ts >> /var/log/maia/develop-refusal-sweep.log 2>&1
```

## What it emits

One structured line per run. Success, on stdout:

```
[MAIA/develop] refusal-record sweep {"outcome":"ok","removed_count":0,"cutoff_day":"2026-09-01","duration_ms":3}
```

Failure, on stderr, with exit code 1:

```
[MAIA/develop] refusal-record sweep {"outcome":"failed","reason":"ENOTDIR","duration_ms":2}
[MAIA/develop] refusal-record sweep {"outcome":"failed","reason":"unlink_failed","removed_count":0,"failed_count":1,"cutoff_day":"2026-09-01","duration_ms":4}
```

⛔ **There is no third outcome.** A file that was due and survived is reported
as a failure with a non-zero exit, never as a partial success — a retention job
that exits 0 while records remain is indistinguishable from one that works, and
cron will never tell anyone the difference.

## What is never logged

```
record bodies · refusal detail · manuscript ids · member data
the daily FILENAMES        — the line carries removed_count, not names
the error MESSAGE          — the errno code is reported instead; a message
                             carries a filesystem path and the code is the
                             whole diagnostic value of it
```

⛔ **This line is ordinary operational logging and must stay there.** Writing it
into the seven-day refusal-record family would mean the mechanism responsible
for deleting one record class creates more records inside that same retention
ontology.

## Installation order

⛔ **Do not install the cron before the corresponding code is deployed.**
`scripts/sweep-develop-refusals.ts` must exist in the running image, or every
hourly run fails and the log fills with noise that looks like a retention fault
and is not one.

```
1. merge (founder ruling)
2. deploy
3. verify:  docker exec maia-sovereign npx tsx scripts/sweep-develop-refusals.ts
            → one "outcome":"ok" line, exit 0
4. install the crontab entry
```

Step 3 is a live no-op on a system that has never refused: the directory does
not exist, which is the one lawful "nothing to do", and the sweep reports
`removed_count: 0` rather than treating it as a fault.
