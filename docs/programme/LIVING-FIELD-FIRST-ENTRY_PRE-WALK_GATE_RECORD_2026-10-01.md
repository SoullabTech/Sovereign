# Living Field First Entry: Pre-Walk Gate Record

**Status:** PARTIAL · G1 PASS · G2 PASS · G0/G3/G4/G5/G6/G7 OPEN · ⛔ no member walk may start until every gate reads PASS
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

captured_at_utc: `2026-10-01T23:41:47Z`
production_sha_at_capture: `298414555`

```text
2026-10-01T23:41:47Z
298414555
exit=1
```

Verdict: **PASS**

---

## G2 · Database stable

What matters for a member is that the database is stable now. The question is not settled by
proving why the old container had drifted, which may be unprovable. Docker's event buffer may not
reach back that far, and a gate that demands an unprovable root cause either never passes or gets
waived.

**Established lineage (cite, do not re-derive):**
`docs/programme/WS-ADVANCED-RUNTIME-01_RC1_PRODUCTION_WITNESS_2026-10-01.md`, observation 1,
records the earlier RC1 recreate: `started=2026-10-01T14:34:47Z restarts=0 oom=false`.

A later read-only production observation at `2026-10-01T22:14:34Z` supersedes that start-time
value for this gate. Runtime was `56d0cd679`; `maia-postgres` reported
`started=2026-10-01T21:41:44.870926604Z restarts=0 oom=false status=running health=healthy`.
Docker's journal at `21:41:44Z` shows the prior Postgres task being stopped/deleted and a new
`maia-postgres` endpoint joining the compose network. This establishes another **recreate, not a
crash**. The initiating command or actor is **UNKNOWN** and must not be invented.

**Required now:**

```bash
ssh soullab@minisforum 'date -u +%FT%TZ; docker exec maia-sovereign printenv GIT_COMMIT; \
  docker inspect maia-postgres --format "started={{.State.StartedAt}} restarts={{.RestartCount}} oom={{.State.OOMKilled}} status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}"'
```

PASS requires all of:

- `restarts=0` and `oom=false`;
- `started=` still equal to `2026-10-01T21:41:44.870926604Z`. A later value means another recreate
  or restart has happened since the latest witnessed one and must be bounded before this gate can
  pass;
- `status=running` and, when health is present, `health=healthy`.

captured_at_utc: `2026-10-01T23:41:47Z`
production_sha_at_capture: `298414555`

```text
2026-10-01T23:41:47Z
298414555
started=2026-10-01T21:41:44.870926604Z restarts=0 oom=false status=running health=healthy
```

Verdict: **PASS**

**Root cause / trigger:** recorded as **UNKNOWN** for both the earlier drift and the 21:41Z
recreate. The newer daemon journal proves recreate-not-crash, not who or what invoked it. ⛔ Do
not upgrade inference to fact here.
**Tracked separately, not gating:** the deploy fix (`--no-deps` on the migrate container, so a
pending-set read cannot recreate Postgres).

**Recorded, not gating (founder attention):** the witness record also states that **disaster
recovery is not established**. The Hetzner standby has been offline for 7 days, and it needs a fresh
base backup when it returns. Off-host backups were verified on the Mac Studio at ~15:25Z. A member
who writes during the walk creates real substrate that exists on one host and in a nightly backup.
Accept that exposure explicitly or defer the walk; do not leave it assumed.

Standby exposure accepted for this walk: yes (by whom) / no (walk deferred)

Verdict: PASS / FAIL

---

## G3 · J18 rollback gate: emergency disable witnessed

Exactly one of G3a or G3b is filled.

⚠️ No branch carries the J18 verdict or the emergency-disable outputs; they exist only in the
Mac-connected session's transcript. G3a is therefore the only route by which they can reach the
repository, and it must land as a docs-only commit on canonical before this gate can cite it.

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
- The latest admitted source re-baseline for the currently observed runtime is
  `LIVING-FIELD_WITNESS_REBASELINE_56D0CD679_2026-10-01.md` (`56d0cd679`). If the walk starts on
  that SHA, cite that record. If it starts on any other SHA, a new source re-baseline is required
  **before** the walk and is named here.
- Whether the start SHA is an ancestor of `clean-main-no-secrets`
  (`git merge-base --is-ancestor <sha> origin/clean-main-no-secrets; echo $?`). At
  `2026-10-01T22:13:34Z`, production reported `56d0cd679`, and both `56d0cd679` and the earlier
  `03f0fd3ab` were ancestors of canonical `a999932df7aa`. Re-run the ancestry check at walk time;
  do not carry this observation forward as a permanent fact.
- Preconditions 3 and 6: when the start SHA is `56d0cd679`, cite the 56d0 re-baseline's aggregate
  content-blind census and explicit-MAIA-entry proof. On any other start SHA, re-witness them live
  using aggregate substrate **counts only** and deployed-source evidence.

captured_at_utc:
production_sha_at_capture:
Re-baseline needed: no / yes (record name):

```text
(paste verbatim)
```

Verdict: PASS / FAIL

---

## G6 · Observation setup (Amendment 2 §9)

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

## G7 · A human safety layer for the person in front of MAIA

If MAIA detects a crisis during the walk, nothing currently routes it to a person. This gate makes
the layer that covers that explicit. Fill **exactly one** of G7a or G7b.

### G7a · In-conversation crisis resources are live in the deployed build

Cite the code path in the walk's start SHA and a verbatim capture showing that a crisis-indicating
turn produces the resources in-conversation on that build. Citing legacy code that exists in the
repository is not enough: the path must be reachable from the route the member will use.

Code path at start SHA:
captured_at_utc:
production_sha_at_capture:

```text
(paste verbatim)
```

### G7b · A named facilitator is the human safety layer

Use this while G7a is not established. It makes the walk possible and keeps the gap visible.

- Facilitator present for the whole walk, in person or on a call the member chose: (name or role)
- The member was told, before the walk, who that person is and that they are there if anything
  becomes hard: yes / no
- The facilitator has a crisis line appropriate to the member's location ready before starting: yes / no
- The facilitator knows they may stop the walk at any time, and that stopping for the member's
  wellbeing is never a protocol failure: yes / no
- Member is an adult: yes / no / unknown. Production does carry `members.birth_date` plus
  developmental-tier / guardian fields, but those fields are not complete enough to make missing
  youth markers proof of adulthood. Satisfy this either from the facilitator's direct knowledge or
  from a server-side, read-only check for the chosen participant that emits only
  `adult=true|false|unknown` and never the birth date itself. **No or unknown → STOP. A founder
  ruling is needed before any minor walks.**

Verdict: PASS (G7a / G7b) / FAIL

---

## Gate summary

| Gate | Verdict |
|---|---|
| G0 protocol canonical | OPEN |
| G1 cabin mode unset | **PASS** |
| G2 database stable | **PASS** |
| G3 emergency disable witnessed | OPEN |
| G4 admission server-side | OPEN |
| G5 Amendment 1 at start | OPEN |
| G6 observation disclosed | OPEN |
| G7 human safety layer (a / b) | OPEN |

Any FAIL → **no walk**. The record names the failing gate and its next bounded act, nothing more.
All PASS → the walk proceeds under the protocol, recorded in the first-entry witness record template.
