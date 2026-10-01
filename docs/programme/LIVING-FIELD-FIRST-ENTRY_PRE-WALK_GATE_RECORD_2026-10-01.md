# Living Field First Entry: Pre-Walk Gate Record

**Status:** SKELETON · no gate filled · ⛔ no member walk may start until every gate reads PASS
**Governs:** `LIVING-FIELD-FIRST-ENTRY-HUMAN-WITNESS_PROTOCOL_2026-10-01.md` (with Amendments 1 and 2)
**Occasioned by:** a J18 verdict and an emergency-disable PASS that existed only in a session
transcript and were never committed. Under this programme's rules a probe is not the record.

## Evidence rule for every slot (read first)

Each gate is filled with **all three** of the following, or it is FAIL:

1. `captured_at_utc:` the UTC timestamp of the capture, taken from the host (`date -u +%FT%TZ`
   in the same command), not typed from memory;
2. `production_sha_at_capture:` the output of `docker exec maia-sovereign printenv GIT_COMMIT`
   from the same command;
3. a **verbatim** output block, pasted unedited: no trimming, paraphrase or "(output omitted)".

Prose such as "it passed", "confirmed", "looked fine" or "same as before" is **not admissible**
in place of an output block. A slot that has only prose is FAIL, whatever the prose says.
Output must be content-free: no member UUIDs, names, emails, or authored text. Any command whose
output would contain them must be changed to print counts or booleans before it is run.

Wrap every capture in this pattern so the timestamp and SHA come from the same moment as the output:

```bash
ssh soullab@minisforum 'date -u +%FT%TZ; docker exec maia-sovereign printenv GIT_COMMIT; <GATE COMMAND>'
```

---

## G0 · The amended protocol is canonical

The walk is governed by the document on `clean-main-no-secrets`. A protocol on a side branch
governs nothing.

```bash
git fetch origin clean-main-no-secrets && git log -1 --format='%H %cI' origin/clean-main-no-secrets \
  && git show origin/clean-main-no-secrets:docs/programme/LIVING-FIELD-FIRST-ENTRY-HUMAN-WITNESS_PROTOCOL_2026-10-01.md \
     | grep -n '^## Amendment'
```

PASS requires both `## Amendment 1` and `## Amendment 2` lines.

captured_at_utc:
canonical_sha:

```text
(paste verbatim)
```

Verdict: PASS / FAIL

---

## G1 · Cabin offline mode is unset in production

From the RC1 re-baseline: the House changes are inert only if this variable is empty.

```bash
ssh soullab@minisforum 'date -u +%FT%TZ; docker exec maia-sovereign printenv GIT_COMMIT; \
  docker exec maia-sovereign sh -c "printenv MAIA_CABIN_MODE; echo exit=\$?"'
```

PASS requires `exit=1` with no value printed before it (variable absent). `exit=0` means the
variable is set: a value line means it is set to that value, and an empty line means it is
**set but empty**. Record either as it is and adjudicate it; do not treat it as a pass.

captured_at_utc:
production_sha_at_capture:

```text
(paste verbatim)
```

Verdict: PASS / FAIL

---

## G2 · Postgres restart: cause established

A database restart with no known cause is an open production fault. No member goes in front of
production while one is open.

Required: the restart time, the cause, and the evidence for that cause. Suggested captures
(read-only):

```bash
ssh soullab@minisforum 'date -u +%FT%TZ; docker exec maia-sovereign printenv GIT_COMMIT; \
  docker inspect maia-postgres --format "started={{.State.StartedAt}} restarts={{.RestartCount}} oom={{.State.OOMKilled}} exit={{.State.ExitCode}}"; \
  docker logs maia-postgres --since 48h 2>&1 | grep -E "database system (is shut down|was shut down|was interrupted|is ready)|terminated by signal|out of memory|PANIC|FATAL" | tail -40; \
  journalctl -k --since "48 hours ago" 2>/dev/null | grep -iE "oom|killed process" | tail -20; \
  uptime'
```

The cause must be **named and supported by a line in the output**. "Probably a deploy" is not a
cause. If the output cannot establish one, the verdict is FAIL and the next step is investigation,
not the walk.

captured_at_utc:
production_sha_at_capture:

```text
(paste verbatim)
```

Restart time (from output):
Cause (one sentence, citing the output line):
Recurrence risk before the walk:

Verdict: PASS / FAIL

---

## G3 · J18 rollback gate: emergency disable witnessed

Exactly one of G3a or G3b is filled.

### G3a · Commit the existing witness

Admissible only if the session that ran it can paste its **original verbatim outputs** with
timestamps: the disable, the instrument-absent check, the ordinary-Living-Field-intact check, the
restore, and the post-restore cohort/SHA/health proofs. Reconstructed or summarized output is not
admissible. If the originals cannot be produced, go to G3b.

Source session / transcript reference:

```text
(paste verbatim, in order, with timestamps)
```

### G3b · Rerun the emergency disable

**This briefly closes the early instrument to the four cohort members.** Before running:

- choose a quiet window and record why it is quiet, with evidence that no cohort member was
  mid-session (for example, a count of cohort sessions active in the last 15 minutes: **a count,
  never identities**);
- tell the cohort in advance, or record why they were not told;
- record the **lane** used to recreate the container with the changed environment. ⚠️ A bare
  `docker compose up -d --no-deps maia` takes no deploy-lane lock and runs no provenance verify
  (2026-09-07 finding). Use the governed lane, or record why that path was used and that the
  image SHA was unchanged before and after.

Window chosen (UTC) and evidence it was quiet:
Cohort notified: yes (how/when) / no (why)
Lane used:

Captures, each with the evidence rule above:

1. Pre-state: `EARLY_FIELD_ENABLED` value, cohort **size** (never IDs), SHA, health.
2. Disabled: `EARLY_FIELD_ENABLED=false` in the live container; SHA unchanged.
3. Instrument closed: the admission decision for a cohort member is `false` (Amendment 2 §5
   server-side check, never a member session).
4. Ordinary Living Field intact: how this is shown **without entering a member's session** (for
   example, route health plus an aggregate substrate count unchanged before/after). If it cannot be
   shown without a member session, say so, and get member consent for that check separately.
5. Restored: `EARLY_FIELD_ENABLED=true`, cohort size 4, admission `true`, SHA and health as in the
   pre-state.

```text
(paste verbatim, captures 1–5 in order)
```

Verdict: PASS / FAIL

---

## G4 · Admission (server-side, at walk time)

Run the Amendment 2 §5 command for the participant. The UUID is passed in at run time and is
**not** pasted here. Only the output line is pasted.

captured_at_utc:
production_sha_at_capture:

```text
(paste verbatim, expected: {"admitted":true})
```

Verdict: PASS / FAIL

---

## G5 · Amendment 1 conditions at walk start

- Start SHA (repeat at the end in the witness record; any difference → NO EVIDENCE).
- If the start SHA differs from the SHA re-baselined in `LIVING-FIELD_WITNESS_REBASELINE_RC1_2026-10-01.md`
  (`03f0fd3ab`), a new source re-baseline is required **before** the walk. Name it here.
- Preconditions 3 and 6 re-witnessed live: aggregate substrate **counts only**, and explicit MAIA
  entry present in the deployed build.

captured_at_utc:
production_sha_at_capture:
Re-baseline needed: no / yes (record name):

```text
(paste verbatim)
```

Verdict: PASS / FAIL

---

## G6 · Observation setup (Amendment 2 §8)

Not a command. It is a statement made **before** the walk and confirmed by the member.

- Device: the member's own (yes / no, and why)
- Every observation channel, each marked disclosed + accepted, or absent:
  - facilitator:
  - call / screen-share:
  - recording / screenshots:
  - AI agent with browser or screen access: **must read "absent"**
- Disclosure text as actually spoken (adapted from protocol §3):
- Member accepted: yes / no

Verdict: PASS / FAIL

---

## Gate summary

| Gate | Verdict |
|---|---|
| G0 protocol canonical | |
| G1 cabin mode unset | |
| G2 Postgres restart cause | |
| G3 emergency disable witnessed | |
| G4 admission server-side | |
| G5 Amendment 1 at start | |
| G6 observation disclosed | |

Any FAIL → **no walk**. The record names the failing gate and its next bounded act, nothing more.
All PASS → the walk proceeds under the protocol, recorded in the first-entry witness record template.
