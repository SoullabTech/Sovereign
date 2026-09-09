# LANE B · B4 — production occupancy witness · **RUN**

> ## ⚠️ PROVISIONAL — founder ruling, 2026-09-09, AFTER this record was written
>
> **This record is NOT withdrawn and NOT deleted.** Everything below stands as
> written and is internally coherent: the run happened, the counts are real, and
> occupancy is correctly kept apart from attribution.
>
> What it cannot establish **retroactively** is its INSTRUMENT subject.
>
> ```text
> result                      174,662 rows · 860 sessions
> database subject qualified  YES — the drift check passed
> instrument content likely   YES
> instrument subject proven   NOT TO CURRENT STANDARD
> verdict                     PROVISIONAL · NOT WITHDRAWN
> ```
>
> Two reasons, both about the instrument and neither about the database:
>
> 1. ⛔ **A local `git replace` ref cannot be excluded after the fact.** If one
>    existed on the executing host, `git show 8c2343…` could have supplied a
>    different tree under the same commit name. The remote side is verified —
>    commit `8c2343a98…` → tree `91e58cdd…` → blob `674684b74…`, and no replace
>    refs exist on the authoring side — but the *executing* host's state at the
>    moment of the run is not something this record can reach back and prove.
> 2. ⛔ **The run used the old concurrent pipeline**, before `6dc62f2fc` made
>    retrieval-before-contact structural. `pipefail` reported failure; it did not
>    order the processes.
>
> ⭐ **Evidence belongs to an instrument subject as well as a database subject,
> and this run proved only the second one to current standard.**
>
> **Closure is one superseding rerun** through the pinned launcher
> `6dc62f2fc2dd600f2080117a830478282dafc241`, which resolves, extracts with
> `--no-replace-objects`, proves non-empty, and only then contacts production.
>
> ⭐ **The rerun's count need NOT equal 174,662.** It is a later observation of a
> live table; the decisive property is `> 0`, never numerical identity with an
> earlier witness. A record that demanded identity would be asking the database
> to hold still to flatter the instrument.
>
> **Until that rerun:** occupancy is **PROVISIONALLY WITNESSED** · B5 is
> **PREPARATION ONLY, no remediation act** · B3 deploy **HOLD**.


**Class A, read-only.** Executed by the founder from the Mac Studio against
production, from the pinned instrument.

```text
instrument   8c2343a9866202cfcd5983d50da928eb891693a5
             scripts/witness/maia-turns-b4-occupancy.sql
invocation   set -o pipefail · git show <SHA> | ssh … psql -v ON_ERROR_STOP=1
date         2026-09-09
```

---

## 1 · The result, verbatim

```text
Pager usage is off.
BEGIN
SET
 total_rows | distinct_sessions
------------+-------------------
     174662 |               860
(1 row)

ROLLBACK
```

## 2 · What the run establishes

### 2.1 The subject was the qualified one

⭐ **The drift check passed silently, and that is itself evidence.** The witness
refuses mechanically before occupancy; reaching the counts means both conditions
held in production:

```text
maia_turns.member_id                     ABSENT  → production is pre-B3
expansion_events → maia_turns FK          'a'    → still NO ACTION
```

So the counts are counts of the subject that was qualified locally, not of
something else.

### 2.2 🔴 THE HISTORICAL POPULATION EXISTS

```text
total_rows          174,662
distinct_sessions       860
```

⛔ **The conditional is resolved.** Every prior document said *"if the backfill
has ever run"*. It has, or something equivalent to it has: 174,662 rows of
derivative member conversation text (`user_text` + `maia_text`) are sitting in
`maia_turns` right now.

⚠️ **Origin is NOT established by this witness.** The operator backfill is the
only working writer found in source — `/api/maia/log-turn` is schema-invalid and
cannot have produced them — but *"the backfill produced these rows"* is an
inference, not a reading. The witness counted; it did not attribute.

### 2.3 What that means, held to exactly what is known

Those 174,662 rows are, in production, today:

```text
member identity        NONE — no user_id; session_id is bare TEXT, no FK
account deletion       DOES NOT REACH THEM
S5 substrate           NOT COVERED — no mint gate, no tombstone, no manifest scope
deletion path          NONE anywhere in the tree
```

⭐ **This is no longer a design defect. It is a live custody condition.**

### 2.4 ⚠️ And deletion of them is currently BLOCKED, not merely absent

The drift check confirmed `expansion_events → maia_turns` is still **NO ACTION**
in production. So a `DELETE` of any `maia_turns` row that `expansion_events`
references would **raise a foreign-key violation today**. Nothing currently
attempts it — which is the only reason this has never surfaced as an incident.

## 3 · B4 OUTCOME LAW — triggered

```text
total_rows > 0
  → historical population EXISTS          ✅ 174,662
  → B5 OPENS
  → do NOT attribute rows from session_id
  → do NOT deploy B3 until historical custody is adjudicated
```

⛔ **B3 deployment is blocked by this result**, not merely unauthorized.

⭐ **And the restore concern the founder flagged is now live.** The B3 insert
gate makes historical NULLs representable *in place*, but ordinary reinsertion
of such a row would be refused. With 174,662 of them, backup/restore semantics
for this population are part of B5's custody question — not an afterthought, and
not something B3 may be deployed ahead of.

## 4 · ⛔ What this document does NOT do

No remediation is proposed. No attribution is attempted — **860 distinct
sessions is a count, and joining them to members would be exactly the heuristic
attribution ruled out.** No further production query was made; B4 authorized one
witness and one witness ran.

## 5 · Standing

```text
B1 containment      ✅ standing — no new rows can be created by either path
B2 identity design  ✅ ratified
B3 schema+falsifier ✅ qualified locally
B4 occupancy        ✅ RUN — historical population EXISTS (174,662 / 860)
B5 remediation      🔴 OPENS — not begun, scope is a founder act

B3 deploy           ⛔ BLOCKED by B4's result
historical rows     EXIST · unattributed · unreachable by deletion
deletion of them    currently BLOCKED by the expansion_events FK
Focus disclosure    ⛔ NOT AUTHORIZED — this outranks it
#1275               frozen @ 18d8c7004
production          read-only witness only; no mutation
```

---

*The count was the cheapest question in the lane and the only one that could
have closed it. It didn't close it. There are 174,662 rows here that the system
promised it could delete and cannot.*

---

## 6 · Supersession protocol — one rerun, then this record closes

⚠️ **AMENDED 2026-09-09 — the previously recorded block could report a false
`B4 exit=0`.** The launcher and instrument SHAs below are UNCHANGED and remain
byte-pinned; only the invocation is corrected. See §6.1 for what went wrong.

```bash
git fetch origin \
  refs/heads/claude/maia-turns-derivative-custody:refs/remotes/origin/claude/maia-turns-derivative-custody

LAUNCHER=6dc62f2fc2dd600f2080117a830478282dafc241
INSTRUMENT=8c2343a9866202cfcd5983d50da928eb891693a5

if (
  set -euo pipefail

  TMP="$(mktemp)"
  trap 'rm -f "$TMP"' EXIT

  git --no-replace-objects cat-file -e "${LAUNCHER}^{commit}"

  git --no-replace-objects show \
    "${LAUNCHER}:scripts/witness/run-b4-occupancy.sh" > "$TMP"

  test -s "$TMP"
  chmod 700 "$TMP"

  "$TMP" "$INSTRUMENT" soullab@minisforum
); then
  STATUS=0
else
  STATUS=$?
fi

echo "B4 exit=$STATUS"
```

⛔ **The braces around `${LAUNCHER}` are part of the contract.** No escaped `\:`
and no escaped `\@` — see §6.2.

⭐ **Both the launcher and the instrument are pinned, and the launcher is itself
extracted with `--no-replace-objects`** — so the tool that enforces the
instrument subject is not itself taken on trust from a working tree.

## 6.1 · 🔴 THE FALSE SUCCESS THIS AMENDMENT CLOSES

The previous block had no `set -e`. When launcher retrieval failed, execution did
not stop:

```text
launcher retrieval failed
→ empty temporary file existed
→ chmod made it executable
→ empty executable returned 0        ← measured: an empty script exits 0
→ wrapper reported B4 exit=0
→ production was NEVER contacted
```

⭐ **This is the FOURTH manifestation of one invariant in this lane:**

```text
1  `\quit 3`      printed STOP, exited 0            (psql ignores the argument)
2  pipefail        reported failure, did not ORDER   (ssh started anyway)
3  empty stdin     psql exits 0 having witnessed nothing
4  empty launcher  chmod + run returns 0             ← this one
```

> ⭐ **A path that did not perform the witnessed act must be structurally
> incapable of returning success.**

⛔ **And note where it sat: one level ABOVE everything already hardened.** The
launcher hardens retrieval of the *instrument*; nothing hardened retrieval of the
*launcher*. A bootstrap always needs its own guard, and the `set -euo pipefail`
subshell is that guard.

## 6.2 · ⚠️ Pasted terminal text is not an authoritative instrument carrier

The failing invocation contained `"$LAUNCHER\:scripts/…"`. Inside double quotes
`\:` is not an escape sequence, so the backslash survives into the pathspec and
git cannot resolve it. **That backslash was in neither party's message** — it
entered somewhere in transit between chat and terminal.

⛔ **The launcher's bytes are pinned; the invocation that reaches it is not.** The
small bootstrap typed into a shell cannot be eliminated, but it can be made to
fail closed before it reaches the pinned launcher — which is exactly what the
amended block does, and why `${LAUNCHER}` braces are now contractual rather than
stylistic.

### Outcome law for the superseding run

```text
exit 0 + counts
  → the superseding run is AUTHORITATIVE; this record closes as superseded
  → total_rows > 0  → B5 formally OPEN
  → B3 production deployment BLOCKED by historical custody

non-zero
  → NO B4 conclusion from that run
  → never read past the refusal or failure
  → this record remains PROVISIONAL
```
