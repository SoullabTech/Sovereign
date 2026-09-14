# WS-PROPOSAL-INTERACTION-01 — RESPONSE TO FOUNDER RULING

**Date:** 2026-09-14 · **Ruling:** founder, 2026-09-13
**Standing:** steps 1–3 answered as far as evidence permits · **NO REPAIR PERFORMED**

---

## Step 1 · `localhost:3100` runtime SHA — **UNKNOWN, and must stay so**

⛔ **This session cannot run the measurement.** It executes in a remote container;
`localhost:3100` is a process on the founder's machine. There is no path from here
to that process, and any SHA asserted from here would be the inference the ruling
forbids.

**Custody state of record: `localhost:3100 runtime SHA = UNKNOWN`.**

The founder's script, with one hardening — `lsof` prints the cwd path on an `n`
line, but a Next.js dev server is usually a **child** of the process holding the
repo cwd, so the parent walk should be taken as ordinary, not exceptional:

```bash
PID=$(lsof -tiTCP:3100 -sTCP:LISTEN | head -1); echo "PID=$PID"
ps -p "$PID" -o pid=,ppid=,command=

resolve() {  # print the repo for a pid, or nothing
  local cwd; cwd=$(lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
  [ -n "$cwd" ] && git -C "$cwd" rev-parse --show-toplevel 2>/dev/null
}
TOP=$(resolve "$PID"); [ -z "$TOP" ] && TOP=$(resolve "$(ps -p "$PID" -o ppid= | tr -d ' ')")
echo "TOPLEVEL=${TOP:-NOT-A-REPO}"
[ -n "$TOP" ] && { git -C "$TOP" rev-parse HEAD; git -C "$TOP" status --porcelain; }
```

⭐ **Record `status --porcelain` even when empty.** A dirty tree means the running
process was serving something no SHA names, and that is a different custody answer
from a clean checkout — not a footnote to one.

---

## Steps 2–3 · SEMANTIC confirmed — **and the bounded mechanical test FAILS**

The ruling's classification holds: writer modification is Step 3, not a broken
Step 2, and EDITORIAL-WRITE-01A's boundary is preserved. The remaining question was
narrow — *does `SHOW CHANGE` actually move the writer to, visibly identify, and
reveal the proposed locus?*

### ⛔ Answer: NO — it reveals the SECTION, never the LOCUS, from the second press on

Traced at `845b814df2`:

```
SHOW CHANGE → onShowChange → showProposedChange → moveToProposal()
  view 'whole'   → setJumpTo(sectionId)
                 → WholeManuscriptSurface: revealWithin(shells.get(id), 'start')
                                           ^^^^^^ the SECTION SHELL, at its START
  view 'section' → writing.goToSection(sectionId)
```

Separately, the locus mark is revealed by `useBringIntoView(key)` inside
`ProposalWorkSurface`, which is **keyed and spent**:

```ts
if (done.current === key || !ref.current) return;
done.current = key;
revealWithin(ref.current, 'center', 'smooth');
```

⭐⭐ **So the first arrival reveals the locus; every later `SHOW CHANGE` reveals only
the top of the section.** On the section this lane is working — 1,334 characters,
with the change *"a thousand characters down"* — the writer is returned to the
section and must hunt for the change again.

⛔ **That is the founder's own step-2 complaint, unrepaired**: *"That is better yet I
still don't know what was changed."* And it is the exact promise the panel makes in
its own source: *"this brings them back when THEY ask."*

**Cause, stated as a property:** the one-shot spend guard exists to prevent
*involuntary* dragging — *"being moved around your own manuscript is its own kind of
dispossession"* — and it is right to exist. But it cannot distinguish **automatic**
from **asked for**, so it suppresses the voluntary return along with the involuntary
one. One guard is answering two questions.

### ⭐ Why the suite did not catch it

`app/writers-studio/__tests__/{proposalWorkMode,consentSurface}.test.ts` — run here
at the tip: **66 passed · 0 failed** (2 suites). Independently verified, because
`845b814df2`'s own message corrects an earlier commit for quoting a gate result it
had misread.

The covering obligation is `⭐ 'Show change' returns attention when the WRITER asks`.
It asserts:

```ts
expect(CODE(CANVAS)).toMatch(/const showProposedChange = useCallback/);
expect(CODE(SURFACE)).toMatch(/onShowChange\?\.\(\)/);
expect(CODE(SURFACE)).toMatch(/Show change/);
```

⛔ **Wiring, not arrival.** It proves a handler exists and is called; it never
requires the writer to reach the locus.

⚠️⚠️ **This is the same error `845b814df2` confessed, one level up.** That commit
found PW-16 asserting `scrollIntoView` *by name* and wrote: *"Naming an API is not
naming a property."* Here, **naming a callback is not naming arrival.** The lane
caught the instance and not the class.

### Consequence for the repair, if authorized

The bounded mechanical repair is therefore **not** "make SHOW CHANGE fire" — it
fires. It is: *an asked-for reveal must reach the locus, and must be repeatable,
while an automatic reveal stays once-only.* The obligation must assert **arrival at
the locus on demand**, or the repair will go green on the same blind spot.

⛔ **Not performed.** It belongs to `claude/s3-implementation`, which is another
lane's branch; this session is not authorized to push there. And step 1 is
unresolved, so the failing behaviour has not yet been tied to the SHA that produced
the screenshot.

---

## Step 4 · Schema reconciliation — designed, **deliberately not authored**

⛔ **No migration file is written by this session, and this is not timidity.** Per
the 2026-09-07 structural finding in CLAUDE.md, *merging a migration to the
production branch is, in effect, authorizing it to be applied by whoever deploys
next.* Authoring `manuscript_revision_proposals` reconciliation onto a branch headed
for `clean-main-no-secrets` would arm exactly that mechanism — while the lane it
belongs to is still open. **It belongs on `claude/s3-implementation`, under a founder
act.**

The ruling's requirement, restated as acceptance law:

```
history A:  20260910000004  →  20260913000002  →  reconciliation
history B:  20260913000002  →  20260910000004  →  reconciliation
```

Both must converge to **one identical canonical schema**, or **fail loudly and
diagnostically**. Silence is the failure mode being repaired, so silence cannot be a
passing outcome.

⛔ **`CREATE TABLE IF NOT EXISTS` must not appear in the reconciliation**, and old
migrations must not be rewritten if any environment may have consumed them. The
reconciliation reads what is actually present — column-by-column, not
table-existence — and decides.

⭐ **One fact the census can add:** the two shapes are not near-misses. They share
only `id`, `member_id`, `draft_id`, `created_at`. `20260910000004` is a
**candidate/thread** model (`proposed_text`, `origin`, `authority`, `producer`,
`derived_from_candidate_*`, `declined_at`); `20260913000002` is an **exact-change
authorization** model (`base_version`, `operation`, `expected_text`,
`replacement_text`, `accepted_at`, `resulting_version`). ⛔ **They are two different
designs wearing one table name** — which means reconciliation is a **naming ruling**
before it is a migration, and EW-01B will want the candidate vocabulary the older
one already reaches for. Deciding that under time pressure during a schema repair is
how the wrong name becomes permanent.

---

## Steps 5–7 · Held

- **5 · Close / preserve EDITORIAL-WRITE-01A** — blocked on steps 1–3 completing.
- **6 · Open EDITORIAL-WRITE-01B** — founder has opened it in principle. ⭐ The law
  it must inherit, in the founder's words: *what the writer sees must remain
  inseparable from what the system ultimately applies.* Concretely, `/accept` must
  not become a generic text-mutation endpoint; the server must still be able to
  establish that **this candidate belongs to this proposal, against this manuscript
  version, at this locus, and is exactly what the writer witnessed**. ⛔ Not
  designed here.
- **7 · Extend existing instruments** — `scripts/witness/editorial-write-01-propose-o26.ts`
  and the two suites above. ⛔ No new harness.

**BCS-01A remains untouched.**

---

## Standing

| | |
|---|---|
| `:3100` runtime SHA | ⛔ **UNKNOWN** — founder-side measurement owed |
| Semantic classification | ✅ ruled: writer modification = Step 3 |
| EW-01A boundary | ✅ preserved, unmodified |
| Bounded mechanical test | ⛔ **FAILS** — locus revealed once, section thereafter |
| Mechanical repair | ⛔ **NOT PERFORMED** (other lane's branch; step 1 open) |
| Schema reconciliation | ⛔ **NOT AUTHORED** (would arm branch-gate defect) |
| Code changed | ⛔ **NONE** |
| Deployed | ⛔ **NOTHING** |

> *The guard that stops the Work from moving under the writer is also stopping the
> writer from going back to look. It is not the wrong guard. It is one guard doing
> two jobs, and only one of them was ever asked for.*
