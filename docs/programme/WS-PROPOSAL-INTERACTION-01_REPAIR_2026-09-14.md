# WS-PROPOSAL-INTERACTION-01 — REPAIR RECORD

**Date:** 2026-09-14 · **Licence:** founder act, narrow · **Commit:** `d519c838b7`
**Authored against:** `dd7059b4` — the SHA measured on `localhost:3100`
**Lane split ruled:** schema identity moves to `WS-PROPOSAL-AUTHORSHIP-01`

---

## 1 · Runtime custody — settled, and the finding re-verified against it

```
localhost:3100 · PID 91053 · next-server
cwd    /Users/soullab/MAIA-SOVEREIGN
HEAD   dd7059b495943479df17e5086da6aafcb48d175e  (DETACHED)
       docs(studio): EW-F2 step 2 witness result
tree   globally dirty · proposal subject CLEAN
```

⭐ **The founder's custody statement is the strongest form available**: not "clean
tree" (false) and not "unknown" (now needlessly weak), but *the running checkout is
globally dirty and the Writer's Studio proposal subject is clean at `dd7059b4`*.

⚠️ **`dd7059b4` is NEWER than the `845b814df2` this session had traced** — four
commits newer. The defect was therefore **re-verified at `dd7059b4` before any
repair**, not carried over: `useBringIntoView` is byte-identical there, and
`showProposedChange` still calls only `moveToProposal()`. ⛔ A finding traced at one
SHA is not a finding about another.

---

## 2 · The defect, as a property

```
AUTOMATIC ARRIVAL     reveal the locus once · never drag the writer back
SHOW CHANGE           an explicit act · every invocation · repeatable · no limit
```

The reveal was spent on the **locus key alone**:

```ts
if (done.current === key || !ref.current) return;   // ⛔ one guard, two questions
```

That guard is **right and stays** — *being moved around your own manuscript is its
own kind of dispossession*. But it could not distinguish **automatic** from **asked
for**, so the explicit act was suppressed by a guard built for the involuntary one.
`SHOW CHANGE` fired, `moveToProposal()` scrolled the **section shell** to its start,
and the change was never reached again.

⭐ **Found while repairing, and worse:** in **Whole view** `ProposalEvidenceInWork`
had **no locus reveal at all**. There `SHOW CHANGE` could never reach the change even
once — only ever the top of the section. The census under-reported this; the Whole
view was assumed to share the Section view's reveal, and it did not.

### The fix is not a second guard

```ts
const token = `${key}#${revealRequest}`;   // ⭐ the locus, AND the ask
```

A reveal is spent **once per reason to reveal**. A new locus reveals; a new ask
reveals; a re-render that is neither does nothing. **The writer asking is now a
reason — which is precisely what it was not before.**

⛔ `revealRequest` is **orientation authority only**: a monotonic count of acts,
reaching no write path. Not a boolean — *"show me the change" is an act, and an act
that happens twice is two acts; a flag can only say that one has happened, which is
the shape that made the second press do nothing.*

⛔ A foreign coordinate space still draws nothing and reveals nothing, in both views.

---

## 3 · ⚠️ Two obligations broke, and both deserved to

| Obligation | Pinned | Property it should have held |
|---|---|---|
| `PW-16` | `done.current === key` | the reveal is spent **per reason**, through the room's seam |
| `PW-6` | one spelling of `range.space !== …` | an unstated space **draws nothing** |

`PW-6` broke only because the refusal had to move **below a hook** — a conditional
return above a hook is a hook-order violation. The refusal did not weaken; the
assertion was describing a line.

⭐⭐ **The method finding, now three times over.** `845b814df2` caught PW-16 asserting
`scrollIntoView` *by name* and wrote *"naming an API is not naming a property."* The
covering `Show change` obligation then asserted a `useCallback` existed, that
`onShowChange?.()` was called, and that the string `Show change` was present — green
throughout, while the act it named failed.

> **Wiring is not arrival.**

⛔ Neither obligation was weakened to pass. Both now assert the property, and both
name the behavioural suite that can fail for the right cause.

---

## 4 · The behavioural witness

`app/writers-studio/canvas/__tests__/proposalLocusReveal.test.ts` — **12 tests, both
views**:

```
arrive                  → locus revealed once
re-render, re-render    → nothing (not an ask)
ask                     → revealed again
ask                     → revealed again
ask                     → revealed again, no limit
foreign space           → draws nothing, reveals nothing
new locus, no ask       → reveals on its own
```

⭐ **Every reveal is asserted to be aimed at the node containing the bracketed
change** — identified by its prose, not its position — so a repair that revealed the
*section* again would pass a "something was revealed" assertion and **fail this one**.

⛔ **It does not assert pixels.** jsdom performs no layout and every rect it returns
is zero — `revealWithin`'s own source says so, which is why its arithmetic is
exported as a pure function. Asserting "visible" here would assert nothing. ⛔ **The
runtime witness the founder specified — arrive, scroll away, press, scroll away,
press — is still owed at `:3100` and is not replaced by this.**

**FALSIFIED:** restoring `const token = key` turns **4 red across both views** while
the once-only obligations stay **green** — the two authorities fail independently.

---

## 5 · Gates, read from the verdict line

```
typecheck    229 vs baseline 239 · 0 regressions · exit 0
jest full    474 suites · 7829 passed · 102 failed
  baseline   473 suites · 7817 passed · 102 failed   (at dd7059b4)
  delta      identical 40 pre-existing failing suites · 0 new · 0 fixed · +12 mine
no-supabase  clean
```

⛔ **The full suite carries 40 pre-existing failing suites** (vitest imports,
DB-requiring routes). The lane's `68 suites · 0 failed` is a **filtered** run, not the
whole gate. ⚠️ Recorded as scope, not as an accusation — and recorded *because* this
lane has already been bitten once by a gate result quoted from its neighbourhood.
The delta, not the total, is the evidence here.

---

## 6 · Lane split, as ruled

```
WS-PROPOSAL-INTERACTION-01     repeatable writer-requested locus reveal
                               behavioural property · NO schema work        ← this
WS-PROPOSAL-AUTHORSHIP-01      successor proposal state · execution authority
                               schema identity / naming · NO migration
                               until a naming ruling
```

⛔ **The `manuscript_revision_proposals` collision is NOT touched here**, and not
because it is unimportant — because *a navigation defect happening to open the files
is not a reason to resolve a schema-identity question.*

---

## 7 · Standing

| | |
|---|---|
| Repair | ✅ `d519c838b7` on `claude/exciting-brown-346wkb` |
| Branch base | `dd7059b4` — the measured SHA |
| Runtime witness at `:3100` | ⛔ **OWED** — the press-twice walk |
| Schema | ⛔ untouched · `WS-PROPOSAL-AUTHORSHIP-01` |
| ACCEPT path | ⛔ unchanged · no editing added · writer modification is still Step 3 |
| Manuscript | ⛔ untouched · nothing deployed |
| BCS-01A | ⛔ untouched |

⛔ **Landing this in the lane is a founder act.** `claude/exciting-brown-346wkb` is
based on `dd7059b4` and carries the lane's unaccepted migrations; per the 2026-09-07
finding, *a migration becomes deployable by becoming canonical.* **This branch must
not be merged to `clean-main-no-secrets`.** `d519c838b7` is a clean cherry-pick onto
`claude/s3-implementation`.

> *The guard that stops the Work moving under the writer was also stopping the writer
> going back to look. It was never the wrong guard — it was one guard doing two jobs,
> and only one of them was ever asked for.*
