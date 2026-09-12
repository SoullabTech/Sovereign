# The three-act founder witness — procedure

**Lane** JARVIS — DEVELOPMENTAL CREATIVE INTELLIGENCE 01
**Date written** 2026-09-12
**Branch** `claude/s3-implementation`
**Runs on** the founder's machine. ⛔ Not from a remote session.

```text
production DB                  NEVER TOUCHED
production flag                REMAINS OFF
migration                      applied ONLY to the named witness database
WRITERS_STUDIO_FOCUS_ENABLED   ON only in the local witness runtime
```

What is being witnessed is not `200 OK`. It is whether a writer and MAIA can
share distributed attention across a real manuscript through the canonical,
governed cognition path — and whether MAIA knows what she cannot see.

---

## 0 · Preflight — two known traps, proved before the witness is spent

⛔ **If either preflight fails, STOP. Do not improvise, do not work around it,
do not proceed to Act 1.** Both of these cost a full afternoon in the Step 7
lane, and neither was a defect in the protocol being witnessed.

### 0.1 · Prove the process is pointed at the named disposable database

The witness database is named here and nowhere else:

```
maia_focus_witness
```

Create it, and prove what you are connected to **before** the migration runs:

```bash
createdb maia_focus_witness
psql "postgresql://soullab@localhost:5432/maia_focus_witness" -c "SELECT current_database(), current_user;"
```

Expected: `maia_focus_witness`. ⛔ Anything else — most of all
`maia_consciousness` — is a STOP.

> ⚠️ The Step 7 walk scripts shell out to `psql`, which reads `PGHOST/PGPORT/
> PGUSER/PGDATABASE` and **NOT** `DATABASE_URL`. If any `PG*` variable is set in
> your shell it will silently win over the connection string you think you are
> using. Check and clear before anything else:

```bash
env | grep -E '^PG' || echo 'no PG* set — good'
```

Then apply the schema this witness needs. The Focus lane's own migration is the
last one; apply the ones it depends on first if this is a fresh database.

```bash
psql "postgresql://soullab@localhost:5432/maia_focus_witness" \
  -v ON_ERROR_STOP=1 \
  -f database/migrations/20260909000001_context_disclosure_receipts.sql \
  -f database/migrations/20260912000001_focus_crossing_acts.sql
```

Prove the tables exist, and prove production does not have them:

```bash
psql "postgresql://soullab@localhost:5432/maia_focus_witness" -c "\dt focus_crossing*"
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c "\dt focus_crossing*"'
```

Expected: two tables locally; **`Did not find any relation`** on minisforum.
⛔ If production shows them, STOP — the migration reached somewhere it was never
authorized to reach, and that is a finding, not a step.

### 0.2 · Prove there is exactly ONE valid `ANTHROPIC_API_KEY`

⛔ Both `unreachable` failures in the Step 7 lane had this one cause, and it was
never the protocol: `.env.local` acquired a **second** `ANTHROPIC_API_KEY` line,
and `grep | cut` glued them into a 217-character value containing a newline.
curl refused it (error 43) and the SDK failed identically, with no diagnosis.

```bash
grep -c '^ANTHROPIC_API_KEY=' .env.local
```

Expected: exactly `1`. If it is more, dedupe to one line **and restart the dev
server afterwards** so it re-reads the file.

Then prove the value's shape without ever printing it:

```bash
awk -F= '/^ANTHROPIC_API_KEY=/{print length($2)}' .env.local
```

Expected: a single line, ~108 characters, **no second number**. ⛔ A 217 is the
concatenation. A second line of output is two keys.

> ⛔ Do not paste the key into chat, into a commit, into this record, or into
> any witness output. Nothing below needs its value — only its shape.

### 0.3 · The runtime

```bash
WRITERS_STUDIO_FOCUS_ENABLED=1 \
DATABASE_URL="postgresql://soullab@localhost:5432/maia_focus_witness" \
npm run dev -- -p 3100
```

Prove the flag is actually on before spending the witness — with the flag off
the route 404s (deliberately; it does not 403):

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3100/api/writers-studio/focus
```

Expected: `401` (authentication required — the route exists). ⛔ `404` means the
flag did not reach the process; restart with it set, do not proceed.

---

## Act 1 — can the expertise be understood?

**Closes, or fails to close, Renaissance Test 3.**

1. Open Develop on a real Work with a real frozen reading.
2. Find an observation carrying one of the **hard** labels. Prefer, in order:
   `positional asymmetry` · `prospective reference` · `register shift`.
   (`recurrence`, `unresolved thread` and `movement` do not test the thing.)
3. Press the label. A small explanation opens beneath it.
4. Read it.

**The human question, asked honestly:**

> Do I understand what MAIA means now, without already knowing editorial
> terminology?

**Record exactly one:**

```text
UNDERSTOOD
NOT UNDERSTOOD
```

Also check, in passing: the explanation opens by keyboard (Tab to the label,
Enter), closes with Escape, returns focus to the label, and does not navigate
away from the observation.

⛔ **If NOT UNDERSTOOD, do not rewrite the definition during the witness.** That
is the finding: the definitions are in the classifier's register and a
member-language register is owed. Test 3 stays open. Acts 2 and 3 continue —
they do not depend on it.

---

## Act 2 — does Develop hand off without crossing its own boundary?

From the same real observation:

```text
Develop  →  work with this  →  Canvas / Focus
```

**PASS requires all six:**

| # | what must be true | how to see it |
|---|---|---|
| 1 | the Develop observation is unchanged | go back; the text, evidence and standing are as they were |
| 2 | no model call occurred | no new request in the server log for the gesture |
| 3 | no manuscript write occurred | no new revision; the draft is byte-identical |
| 4 | exactly the declared anchors became members | the count matches the observation's "Rests on" list — **no neighbours** |
| 5 | the historical origin is identifiable | the URL still carries `from`, `o`, `rev`, `at`; the set is labelled `o1 · <phenomenon>` |
| 6 | **no active edit target was invented** | the panel says *"no place chosen yet — click one to work on it"* |

This proves the sentence the whole lane rests on:

> **Develop stays historical; Focus becomes current.**

⛔ If an observation rests only on authored structure, `work with this` is
**absent** by design. That is not a failure of Act 2 — pick an observation with
section or passage evidence. Record which you used.

---

## Act 3 — the decisive one

### 3.1 · Reach the natural distributed state

⛔ **Do not manufacture prose changes to produce withheld members.** Use a Work
where the state arises naturally: an observation citing five places, read at an
earlier kept revision, where some anchors no longer resolve. If the real Work
gives 5/3/2, use it. If it gives 4/3/1 or 6/4/2, **use what it gives** and
record the real numbers — the shape is what matters, not the arithmetic.

If no Work produces any withheld member at all, record
`WITHHELD STATE NOT REACHED` and run Act 3 anyway on a fully-readable set. That
is a weaker witness and must be reported as one — ⛔ never as a pass of the
withheld case.

### 3.2 · Before pressing — confirm the panel tells the truth

The readiness line must state both numbers:

```text
5 places in focus · 3 ready for MAIA · 2 need confirmation
```

and each member must be marked `✓` or `!`. Click a **readable** member to make
it the active target; the panel changes to `working on Section N`.

⛔ If the counts disagree with what you can see in the Work, STOP and record it.
A panel that miscounts before the act is a fail, not a cosmetic issue.

### 3.3 · Ask

Type a real question about the Work — not a test prompt. The founder's own
example is the right shape:

> *Given these places together, what do you see?*

Press **Ask MAIA** once. Then press it again immediately, hard, twice more —
⛔ this is part of the witness (P9), not impatience.

### 3.4 · The three layers must agree

**LAYER 1 · UI** — what you saw before pressing, and the line after:

```text
MAIA read 3 of the 5 places in focus.
```

**LAYER 2 · ACT RECORD** — read it directly. ⛔ One row, not three:

```bash
psql "postgresql://soullab@localhost:5432/maia_focus_witness" -c "
SELECT act_id, active_member_id, canonical_turn_id IS NOT NULL AS completed
  FROM focus_crossing_acts ORDER BY created_at DESC LIMIT 5;"

psql "postgresql://soullab@localhost:5432/maia_focus_witness" -c "
SELECT ordinal, focus_member_id, currency_state, body_available,
       disclosure_receipt_id IS NOT NULL AS receipted
  FROM focus_crossing_act_members
 WHERE act_id = (SELECT act_id FROM focus_crossing_acts ORDER BY created_at DESC LIMIT 1)
 ORDER BY ordinal;"
```

Must show: **5 member rows**, **3 with `body_available = t` and receipted**,
2 with `f` and no receipt, the active member matching what you chose, and
`completed = t`. ⛔ **And exactly ONE act row for the whole press-press-press
sequence.**

**LAYER 3 · MAIA** — the gold observation. She must demonstrate, in her own
words, that she knows:

- the Focus has five places;
- she can presently read three of them;
- the other two are not available to her *in this turn*.

Something naturally equivalent to:

> *There are five places we're working across. I can currently read three; two
> aren't available to me yet.*

⛔ **We are witnessing semantic truth, not prompt compliance.** She does not
need that sentence. She needs to not be wrong about the shape of what she was
given.

### 3.5 · Then the real proof

Ask a genuine editorial question about the Work. She must reason across the
three readable members **as distinct locations** — referring to them separately,
comparing them, noticing something between them — rather than answering as
though she had been handed one undifferentiated passage.

That is the actual proof. A fluent answer that treats three passages as one blob
is a **FAIL**, however good the prose.

---

## Fail immediately, and preserve the attempt

```text
MAIA behaves as though 3 members = the whole Focus Set
an unreadable member's body appears in cognition
the active target silently changes
one click creates multiple acts
the act record fails and MAIA answers anyway
Focus members lose their identities before cognition
whole_work is substituted for the distributed set
Develop rereads during `work with this`
the manuscript changes
```

⛔ **PRESERVE THE COMPLETE FAILED ATTEMPT.** No patching mid-witness and
reporting only the rerun. Capture: the panel as it appeared, MAIA's answer
verbatim, both act-record queries, and the server log for the request. A repair
is a separate act, afterwards, with its own witness.

---

## Recording the result

Write `docs/programme/WS-THREE-ACT-FOUNDER-WITNESS_RESULT_2026-09-12.md`:

```text
PREFLIGHT 0.1   database proved ·  PG* clear ·  production clean
PREFLIGHT 0.2   one key ·  length recorded (value NOT RECORDED)
PREFLIGHT 0.3   flag on, route reachable

ACT 1           UNDERSTOOD | NOT UNDERSTOOD        label used:
ACT 2           PASS | FAIL                        observation used:
ACT 3           PASS | FAIL | WEAKER (no withheld member reached)
                real numbers:  N places / N readable / N withheld
                act rows for the press sequence:  N   (must be 1)
                MAIA's own words:  <verbatim>
```

⛔ `NOT UNDERSTOOD`, `WEAKER`, and `NOT REACHED` are **first-class results**.
None of them is a skip, and none may be reported as a pass.

---

## Afterwards

```text
drop the witness database         dropdb maia_focus_witness
production flag                   STILL OFF
production migration              STILL NOT AUTHORIZED
```

**On Act 3 PASS**, what has closed is this:

> Develop → living Work → canonical MAIA, with the writer's distributed
> attention preserved faithfully from gesture through selective disclosure into
> cognition — and MAIA truthfully aware of what she cannot see.

⛔ **HELD regardless of outcome:** RevisionProposal · staged diff · manuscript
mutation · write authority · production activation.
