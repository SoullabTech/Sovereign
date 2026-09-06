# WS2-07 · BUILD-07F — production acceptance walk · SPEC

> **The W1–W12 claims were fixed BEFORE deployment, and that is the point of the document: a walk
> whose claims are written while it is being walked can only confirm what it finds. This revision
> does not restate them — it retargets custody and evidence after a promotion that has already
> occurred (runbook §0). The walk itself has NOT started, and the entire walk — W1 included — is
> gated on the founder's prospective act (runbook §2.2).**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
FROZEN EXECUTABLE ANCHOR   ca5fdff445526562ce11f68c01e20db9bf64548f   (re-frozen §2.1.1)
PRIOR FROZEN ANCHOR        66da58b4c4a4979240db460c045dd9daf1cd47d3   (superseded, not a fallback)
OBSERVED RUNTIME SHA       read at W1, then FIXED for the walk's duration (§2.1)
07F MIGRATION    APPLIED 2026-09-06 11:36:34+00 — before its consent checkpoint (runbook §0)
STANDING EVENTS  0 at the time of writing — the boundary this walk crosses at W3
GATED ON         the founder's prospective act, runbook §2.2 — NOT YET GIVEN
RUNS AFTER       #1228's own witness (runbook §6.2) — a separate record, not a step of this walk
STATE            PRODUCTION ACCEPTANCE NOT STARTED
```

**The executable subject moved before the walk began** — `cb557b8fb` → `ccd1c50ce` → `66da58b4c`,
then was re-frozen by the authorized agent-doable docs act to `ca5fdff44` under §2.1.1. The claims
below are unchanged: they were fixed before any of those SHAs was the subject. #1228's only overlap
with this unit is refusal copy for a different refusal. What changed is which program the frozen
claims will be walked against.

> ⛔ **NO WALK STEP MAY RUN BEFORE THE §2.2 ACT — W1 INCLUDED.** W1 is read-only, but it binds the
> observed runtime as the walk's subject, and that binding is the walk starting. W3 remains the first
> durable member standing act in production; `standing_events = 0` is still the boundary that keeps
> reversal available without destroying a member act. The founder's §2.2 act must precede both.

---

## 1 · Evidence classes — what each witness can and cannot establish

07E's lesson, carried: local gates measure the branch program, PR CI measures the merge program, the
walk measures the deployed runtime, and **none substitutes for the next**. 07F adds a fourth:

```text
L  ephemeral laboratory   deliberately deficient variants, destructive paths, race interleavings
M  merge program (CI)     8/8 on exact head 54776ed5d
S  deployed program       07F's own gates rerun statically at 66da58b4c: 254 · 15 · 14 · typecheck
R  deployed RUNTIME       this walk — the running container, which none of the above touches
```

`S` is not `R`. The same program passing its gates on a checkout says nothing about the container
serving members; that gap is the whole reason this walk exists.

Every claim below is labelled with the class that establishes it. A claim carried by **L** is not
weaker for being carried there — it is carried there because reproducing it in **R** would require
destroying a member's Work.

Two witness kinds inside **R**, kept apart because they fail differently:

```text
[B]  BROWSER / MEMBER   what a signed-in writer sees and does in the Develop room
[D]  DATABASE / PROVENANCE   what the row, the trigger and the container report
```

A `[B]` observation is never accepted as proof of persistence, and a `[D]` row is never accepted as
proof that the member was shown the truth. Where both matter, the claim names both.

---

## 2 · Preconditions

```text
the runbook's §0 is established — migration applied, guard live, consent checkpoint crossed
the founder's §2.2 act GIVEN, carrying the three consent markers and naming THIS bound subject
  (runbook §2.2) — without it, NO walk step runs, W1 included
the runbook's §3 reads pass on the CURRENT container — its GIT_COMMIT satisfies the §2.1
  subject-identity rule against the frozen anchor ca5fdff44 (re-frozen 2026-09-06, §2.1.1), and
  the migration is recorded with
  the table and all three developmental_readings triggers present
standing_events re-read immediately before starting, and its value recorded whatever it is
#1228's own witness (runbook §6.2) has been run and recorded SEPARATELY, if it was not already
  completed in its own lane — it clears an obstruction this walk needs for W9, and its result is
  never counted as a 07F witness
one authenticated founder member session in a browser
at least one existing frozen developmental reading with ≥ 2 observations
  (or one commissioned during W0 — a commissioning act, not a standing act)
```

No credential is handled by the agent. Every authenticated act is performed by the founder.

---

## 2.1 · Subject identity — a CUSTODY rule, not acceptance logic

**Why this exists.** The walk was frozen against `66da58b4c`. A documentation-only merge then became
canonical and was deployed, so the container reports a different commit while running the same
program. W1 halted on that, correctly: it could not tell "the subject moved" from "the program
changed". This section gives it a way to tell — and only that.

**What it does NOT do.** The W1–W12 claims and their pass/fail criteria are unchanged by this
amendment. Nothing here makes a witness easier to pass, admits a runtime difference, or adds a
condition to any claim. It defines executable-program equivalence for **custody** only, and it can
never admit a runtime change, because **any non-document byte difference halts the walk.**

### The rule

```text
FROZEN EXECUTABLE ANCHOR   ca5fdff445526562ce11f68c01e20db9bf64548f   (re-frozen §2.1.1)
PRIOR ANCHOR               66da58b4c4a4979240db460c045dd9daf1cd47d3   (superseded, not a fallback)
OBSERVED RUNTIME SHA       whatever the container reports at W1, self-discovered

PASS subject identity when:
  1. runtime SHA == frozen anchor
       OR
  2. frozen anchor is an ANCESTOR of runtime SHA
       AND
     the diff across every NON-doc path is EMPTY

otherwise: HALT
```

### The proof — executable, hardened, and retained with the walk's evidence

Eleven instrument defects were observed across earlier runs of this proof and are closed here. The
governing distinction: **an instrument that could not look is not a subject that failed.** The two
outcomes have different exit codes and different words, and neither is silence.

```bash
# Clean, non-interactive shell — nothing sourced, no profile, no rc, no aliases.
# Fed by a QUOTED heredoc: nothing inside is expanded or re-quoted by the pasting shell,
# so the single quotes in the SQL survive verbatim. Do not switch this to `zsh -f -c '...'`
# — the nested quoting silently mangles the ledger predicate.
zsh -f -s <<'WS207F_SUBJECT_IDENTITY'
set -euo pipefail                      # -e stop on error · -u unset var is an error · pipefail
(                                      # subshell: no state leaks into the operator shell

  ANCHOR=ca5fdff445526562ce11f68c01e20db9bf64548f
  REPO=${WS207F_REPO:-/Users/soullab/MAIA-SOVEREIGN}
  SQL='SELECT count(*) FROM schema_migrations WHERE filename = '\''20260906000001_developmental_observation_standing.sql'\'';'

  halt_instrument() { printf "SUBJECT-IDENTITY: INSTRUMENT-FAILURE — %s\n" "$1"; exit 3; }
  halt_subject()    { printf "SUBJECT-IDENTITY: HALT — %s\n"               "$1"; exit 1; }

  # 1 · explicit repo context — never inherit the operator's cwd
  cd "$REPO" 2>/dev/null || halt_instrument "cannot enter $REPO"
  ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || halt_instrument "not a git repository: $REPO"
  printf "REPO_ROOT=%s\n" "$ROOT"

  # 2 · self-discover the runtime — a pasted SHA proves the paste, not the container
  RAW=$(ssh soullab@minisforum "docker exec maia-sovereign printenv GIT_COMMIT" 2>/dev/null) \
    || halt_instrument "could not reach the container to read GIT_COMMIT"
  [ -n "$RAW" ]           || halt_instrument "container reported an empty GIT_COMMIT"
  [ "$RAW" != "unknown" ] || halt_instrument "GIT_COMMIT=unknown — a provenance defect, not a subject verdict"
  printf "RUNTIME_GIT_COMMIT_RAW=%s\n" "$RAW"

  # 3 · short → full; an object this clone has never seen is an INSTRUMENT failure, not a HALT
  git cat-file -e "${RAW}^{commit}" 2>/dev/null || git fetch --quiet origin 2>/dev/null \
    || halt_instrument "fetch failed while resolving $RAW"
  git cat-file -e "${RAW}^{commit}" 2>/dev/null \
    || halt_instrument "commit $RAW unknown locally — this clone cannot judge the subject"
  git cat-file -e "${ANCHOR}^{commit}" 2>/dev/null \
    || halt_instrument "anchor $ANCHOR unknown locally"
  RUNTIME_SHA=$(git rev-parse --verify "${RAW}^{commit}") || halt_instrument "cannot resolve $RAW"

  halt_w1_state()   { printf "W1-STATE: HALT — %s\n"                     "$1"; exit 2; }

  # 4 · the only two questions that may HALT the SUBJECT — both are about the PROGRAM
  git merge-base --is-ancestor "$ANCHOR" "$RUNTIME_SHA" \
    || halt_subject "runtime $RUNTIME_SHA does not descend from the anchor"
  DRIFT=$(git diff --name-only "$ANCHOR" "$RUNTIME_SHA" -- . ":(exclude)docs/**")
  [ -z "$DRIFT" ] || halt_subject "non-doc drift:
$DRIFT"

  # 5 · production STATE, not subject identity. A wrong ledger count is a real W1 halt, but it
  #     says nothing about whether the executable subject changed — a database is not a program.
  #     EXACT filename equality: LIKE would let _ match any character, and two 20260906000001_*
  #     migrations exist. The ledger stores no checksum, so this proves a filename, never bytes.
  LEDGER=$(ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -Atc \"$SQL\"" 2>/dev/null) \
    || halt_instrument "could not read the migration ledger"
  [ "$LEDGER" = "1" ] || halt_w1_state "ledger rows = ${LEDGER:-<none>}, expected exactly 1"

  # 6 · explicit success — full SHAs printed, and retained as the binding evidence
  printf "ANCHOR_FULL=%s\n"           "$ANCHOR"
  printf "RUNTIME_FULL=%s\n"          "$RUNTIME_SHA"
  printf "NON_DOC_DRIFT=none\n"
  printf "MIGRATION_LEDGER_ROWS=%s (exact filename equality)\n" "$LEDGER"
  printf "SUBJECT-IDENTITY: PASS\n"
)
WS207F_SUBJECT_IDENTITY
```

**Reading the result.**

```text
exit 0 · SUBJECT-IDENTITY: PASS                 subject bound AND W1 state read · proceed
exit 1 · SUBJECT-IDENTITY: HALT                 the program changed · the walk stops
exit 2 · W1-STATE: HALT                         the program is the right one; production state is
                                                wrong · a real W1 halt, and NOT evidence that the
                                                executable subject moved
exit 3 · SUBJECT-IDENTITY: INSTRUMENT-FAILURE   we could not look · fix the instrument and re-run
                                                NOT a verdict on subject or state, in either direction
no line at all                                  INSTRUMENT-FAILURE by default
```

**Silence is not evidence.** A run that prints no verdict line established nothing — not a pass, not
a failure. The absence of output has been read as absence of a problem before in this lane; it is
read here as an instrument that did not run. Both commands, their output, and the verdict line are
pasted into the walk's record. A rule whose satisfaction is asserted rather than shown is not a rule.

### Safeguard — the subject is bound ONCE, at W1

```text
W1 passes  →  record the OBSERVED RUNTIME SHA in the walk's record
              from that point it is FIXED for the walk's duration
```

Any later deployment — **including a documentation-only one** — halts the active walk rather than
being absorbed midstream. The equivalence rule binds a subject; it does not license a moving one. A
walk whose runtime changed between W5 and W9 witnessed two programs and can speak for neither.

### The already-observed transitions

```text
66da58b4c → 1116f7813        non-doc diff: EMPTY (4 files, all under docs/)   — historical
66da58b4c → ca5fdff44        non-doc diff: 19 paths                           — see §2.1.1
```

Custody equivalence did not carry the walk from `66da58b4c` to current canonical, and no reading of
§2.1 makes it. The walk was re-frozen instead, which is a different act with a different basis.

---

## 2.1.1 · The re-freeze — a RETARGET, not a custody equivalence and not a source acceptance

**AUTHORIZED in-session, 2026-09-06 · agent-doable docs act.** This is **not** a founder act, and
nothing here is one: no founder-authority act occurred for the re-freeze, and §2.2 remains the only
open act reserved to the authority holder. The distinction is the one corrected in the WS2-08A
closure — an agent may perform authorized work and draft wording; it may not hold authority.

**Prior frozen executable anchor** `66da58b4c4a4979240db460c045dd9daf1cd47d3`.

*Correction, 2026-09-06:* an earlier draft of this section named `c1b0470e2` as the old bound
subject. It never was. `c1b0470e2` is the later canonical commit that introduced the §2.1
custody-equivalence rule; the frozen executable anchor throughout was `66da58b4c`. Every measurement
below is taken from `66da58b4c`.

*Freshness corrections, 2026-09-06:* PR #1242 was retargeted twice while exact-head checks were
running. First canonical advanced `69f6fb7c8 → 2b4ec96a8` via PR #1241, including non-`docs/**`
`CLAUDE.md`. Then, after that retarget's checks completed, canonical advanced again
`2b4ec96a8 → ca5fdff44` via PR #1239, including non-doc `CLAUDE.md` and
`app/accounted-for/page.tsx`. Neither provisional target was carried forward. After each move, and
again for the final tip, the ten-path endpoint blob check was rerun directly from the true prior
anchor. Final result `66da58b4c → ca5fdff44`: **10 identical · 0 differing**. The broader non-doc
drift count remains **19 paths**. The bound subject below is the fresh tip.

```text
BOUND WALK SUBJECT
ca5fdff445526562ce11f68c01e20db9bf64548f
```

**What was verified.** Endpoint comparison `66da58b4c → ca5fdff44`. The seven 07F subject files are
byte-identical across the two commits — blob identity, not a diff summary:

```text
IDENTICAL  app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts  10a1a14357ca…
IDENTICAL  lib/manuscript/standing/contract.ts                                         1b7bf7a68265…
IDENTICAL  lib/manuscript/standing/store.ts                                            2549bc216329…
IDENTICAL  lib/manuscript/standing/__tests__/standingContract.test.ts                  afc4c59f45cc…
IDENTICAL  lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts          468513c37987…
IDENTICAL  lib/writersStudio/observationStanding.ts                                    e34a5bc51450…
IDENTICAL  lib/writersStudio/__tests__/observationStanding.test.ts                     90764795502d…
                                                    7 files · 7 identical · 0 differing
                                                    (10 identical · 0 differing with the three below)
```

Checked beyond the seven, and also identical — the migration is subject, not instrument, and the
falsifiers are the instruments the earlier reviews ran:

```text
IDENTICAL  database/migrations/20260906000001_developmental_observation_standing.sql   c12d809901a7…
IDENTICAL  scripts/ws2-07f/falsify-standing-persistence.ts                             bfdded4338a4…
IDENTICAL  scripts/ws2-07f/falsify-standing-store.ts                                   5e07e1587ee2…
```

**What this establishes.** 07F's own executable subject did not move between the old anchor and the
new one. The three source-review rounds, their repairs, and the falsifier runs were performed
against these exact bytes, so they still speak to the re-frozen subject without re-review.

**What this does NOT establish — and the distinction matters.** This is a *narrower* basis than the
§2.1 custody rule. §2.1 asks whether **every** non-doc path is unchanged; that question is answered
NO between `66da58b4c` and `ca5fdff44` — **19** non-doc paths moved, none of them 07F's. The
re-freeze does not claim the program is unchanged. It discards the old anchor and adopts the current
program wholesale, and everything outside the seven-plus-three is newly bound and unwitnessed by
anything 07F has done.

*This is the same shape as SC-1 in the WS2-08A closure: a narrower successor claim standing where a
broader one failed. It is recorded as narrower here for the same reason — so that a later reader
cannot mistake it for the broader claim.*

**What it is not:** not a new source acceptance, not a W1 pass, not a §2.2 act.

```text
earlier W1 custody halt     remains HISTORICAL · the re-freeze does not convert it to a pass
walk order                  re-freeze → §2.2 → W1 · NO walk step runs before §2.2
fresh W1                    NOT RUN / NOT BOUND until a valid subject-bound §2.2 act exists
standing_events             0 · a standing event write remains FORBIDDEN
```

**Freshness applies again, to this too.** If canonical moves before the §2.2 act, re-check the seven
subject files against the new tip before binding anything. `ca5fdff44` is not carried forward by
having been named here.

---

## 3 · The walk

### W1 · provenance and schema `[D]`

The runbook's §3 production-state reads, re-stated here as the walk's first witness so the walk
stands alone. Two parts, in this order:

**a · Subject identity.** Read the container's `GIT_COMMIT`, then satisfy §2.1's rule against the
frozen anchor `ca5fdff44` and retain both commands' output. Record the observed runtime SHA; it is
the walk's subject from here on.

**b · Schema.** `schema_migrations` carries the 07F filename; the events table exists with its UNIQUE
quad and two triggers; `developmental_readings` carries **both**
`developmental_readings_immutable_check` and `developmental_readings_no_orphan_delete_check`.

**Fails if:** §2.1's rule is not satisfied, or any object is missing, or 07C's immutability trigger
is gone. A failure of (a) is a CUSTODY halt — the walk is retargeted or the program is different,
and which one it is has been made decidable. A failure of (b) is a finding about production.

**W1 also records the pre-walk count.** `SELECT count(*) FROM developmental_observation_standing_events`
was **0** when this spec was retargeted. If it is non-zero when the walk begins, STOP and classify
before W2: a member act exists that this lane did not author, and the walk's own arithmetic (W3's
"exactly one row", W5's "two rows", W7's "three rows") assumes it starts from zero.

### W2 · UNSET is what a writer sees before they act `[B]` + `[D]`

Open a reading whose observations have no standing. Each shows **"No standing taken."** and three
enabled controls.

`[D]` `SELECT count(*) … WHERE reading_id = R` → **0**.

**Fails if:** any observation shows a value, or the row count is non-zero, or the controls are
disabled while the lookup succeeded.

### W3 · a standing is taken, and it is an append `[B]` + `[D]`

Choose **Keep** on `o1`. The row reads *"You marked this keep."*

`[D]` exactly one event: `event_index = 0`, `standing = 'keep'`, `member_id` = the founder's id,
`reading_id` = R, `observation_key = 'o1'`, `recorded_at` server-stamped.

**Fails if:** more than one row, an index other than 0, or a `member_id` the request could have supplied.

### W4 · it survives the reload `[B]`

Hard-reload the room. `o1` still reads *keep*; every other observation still reads *No standing taken.*

**Fails if:** the standing is lost, or absence is rendered as anything other than "No standing taken."

### W5 · changing a standing does not rewrite the first act `[B]` + `[D]`

Choose **Dismiss** on the same `o1`. The row reads *dismiss*.

`[D]` **two** rows: `event_index 0 = keep` **unchanged, same `id`, same `recorded_at`**, and
`event_index 1 = dismiss`. Current is the greatest index.

**Fails if:** the first row changed in any field, or was replaced, or the count is still one.

### W6 · repeating a standing writes nothing `[B]` + `[D]`

Choose **Dismiss** again. The row still reads *dismiss*; `[D]` the count is **still two**.

**Fails if:** a third row appears — the no-op is not a no-op.

### W7 · a stale act is refused, and nothing is overwritten `[B]` + `[D]`

Two browser tabs, same member, same reading — no credential leaves the founder's hands and no token
is extracted by the agent:

```text
tab A  loads the room (holds the token for event 1)
tab B  loads the room, chooses Unresolved   → event 2 written
tab A  without reloading, chooses Keep      → REFUSED
```

Tab A must say *"This standing changed elsewhere while you were looking. Nothing was overwritten —
here it is as it now stands."* and then show **unresolved**, not keep.

`[D]` exactly **three** rows; no row with `standing = 'keep'` at index 2; the stream is
`keep → dismiss → unresolved`.

**Fails if:** tab A's write is accepted, or the row count reaches four, or tab A claims to show
current state while the refresh has not landed.

### W8 · unknown is not UNSET `[B]`

With DevTools, block **only** the `GET …/standings` request, then reload the room.

The row must read *"Your standing could not be reached. Nothing has been changed."* and **the three
controls must be disabled.** It must NOT read "No standing taken."

**Fails if:** a failed lookup renders as UNSET, or a control remains clickable while the current
standing is unknown. *(Blocking the GET is a read-path fault only; it writes nothing.)*

### W9 · a new reading starts UNSET, and the old one keeps its standing `[B]` + `[D]`

Commission a second reading of the same Work. In the **new** reading, `o1` reads *No standing taken.*
Return to the first reading: `o1` still reads *unresolved*.

`[D]` all rows still carry the **first** reading's `reading_id`; none was copied, cleared or
re-pointed.

**Fails if:** the standing appears under the new reading, or the old reading's standing changed.

### W10 · the observation is untouched by the standing `[B]`

With `o1` standing at **unresolved** — the state W7 leaves and W9 confirms — MAIA's text is verbatim
and unfaded, its position in the list is unchanged, no
strike-through, its "Rests on" and "Does not establish" lists are intact, and no history, count or
timestamp of standings is rendered anywhere.

**Fails if:** any standing-driven change to the observation, or any exposure of the stream. The
invariant is value-independent: it would fail identically for `keep`, `dismiss` or `unresolved`, and
the value is named only so the instrument is executable as written.

### W11 · MAIA does not see it `[B]`

Open the dialogue on `o1` — standing at **unresolved** — and ask a question about the observation.
Her answer must carry no awareness of the standing: no acknowledgement that it was ruled on at all,
no adjustment of tone toward it. Then ask her directly what the writer decided about it.

**Fails if:** any answer reflects the standing. *(D5 is structural — the module-graph and table-name
gates in `M`/`L` — and this witness is corroboration of the running system, not the primary proof.)*

### W12a · ownership, in the rows `[D]`

`SELECT DISTINCT member_id FROM developmental_observation_standing_events` → exactly the founder's
member id, and every row for reading R carries it.

**Fails if:** any row carries an unexpected member.

### W12b · another member cannot address this resource `[B]` · CONDITIONAL

Run **only if a second real member account already exists** — this walk does not manufacture one.

Signed in as that member, request reading R's standing resource. The correct outcome is the
existing **not-found / unauthorized** posture: a reading that is not yours is indistinguishable from
one that does not exist, and the room never renders R's observations for them at all.

> **What would be a FAILURE, not a pass:** that member being shown reading R with *"No standing
> taken."* Not-addressable and UNSET are different claims — one says *you may not ask about this*,
> the other says *you have never ruled on this* — and collapsing them is the precise confusion 07F
> exists to prevent. A second member seeing UNSET here would mean the resource answered a question
> it should have refused.

**Fails if:** any standing of the founder's is visible, **or** the refusal is rendered as UNSET.

**If no second account exists:** record W12b as NOT RUN with that reason. Member scope is carried
meanwhile by `L` (`read-is-member-scoped`, `write-is-member-scoped`, each observed RED against its
deficient variant) and by W12a. An unrun witness is recorded as unrun, never as a pass.

---

## 4 · NOT REPRODUCED IN PRODUCTION — bound to the laboratory

These claims are accepted on **L** and will **not** be walked in **R**. Reproducing them requires
destroying a member's real Work or deliberately deficient code in front of real data. Manufacturing
a production deletion witness would be the opposite of what 07F protects.

| claim | where it is established | probe |
|---|---|---|
| deleting one standing event is refused while the Work exists | **L** — ephemeral PG16 | `single-delete-refused` |
| deleting a reading is refused while its manuscript exists | **L** | `reading-delete-refused` |
| deleting the Work cascades reading → standing away | **L** | `work-cascade-permitted` (two-hop, `DELETE FROM member_manuscripts`) |
| UPDATE of a recorded event is refused at the row | **L** | `update-refused` |
| two simultaneous writers cannot both be accepted | **L** | `simultaneous-write-refused` (deterministic race) |
| `unset` / NULL cannot be stored | **L** | `standing-values-closed`, `null-standing-refused` |
| every deficient variant observed RED before its repair | **L** | 8 persistence + 6 write-boundary variants |

`15 checks · 0 failures` (persistence) and `14 checks · 0 failures` (write boundary), on the tree
that became `54776ed5d`, recorded in the implementation witness.

**W1 is what carries these into production**: the same triggers, verified present on the deployed
database by name. The laboratory establishes *what the guards do*; W1 establishes *that these guards
are there*. Neither alone is the claim.

An offer this spec explicitly declines: creating a throwaway manuscript in production to delete it.
It would witness the cascade on a Work that was never a writer's, in a database that holds writers'
work, for a claim already established where deficient variants are safe.

---

## 5 · Stop rule

Any observation that does not conform **halts the walk for classification** — runtime defect,
instrument defect, or a claim written wrongly here. Nothing is repaired mid-walk, and no later
witness is run to "see if it also fails": the walk's value is that its claims were fixed in advance,
and a walk that edits itself while running has forfeited that.

A halted walk is reported with the exact observation, the class it belongs to, and nothing else
decided.

---

## 6 · What completing this walk does and does not authorize

```text
DOES        establish that the deployed runtime behaves as the accepted design says
DOES NOT    close BUILD-07F — closure is a founder act, taken after the walk, not by it
DOES NOT    authorize BUILD-07G or 07H
DOES NOT    licence any claim beyond what the witnesses above actually observed
```
