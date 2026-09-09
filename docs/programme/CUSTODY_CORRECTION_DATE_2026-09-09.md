# Custody correction — systematic one-day-forward date error

**Found by founder · 2026-09-09 · CORRECTED IN PART · ⛔ ONE REPAIR PROPOSED, NOT EXECUTED**

---

## 1 · The error

**Twenty-six governance documents were authored on 2026-09-09 and dated 2026-09-10** — in their
filenames and in their in-text ruling headers. **The commit metadata was correct throughout; only
the authored record was wrong.**

**Founder detection method, recorded because it is the reusable part:** commit metadata
(`880aa6590` @ `2026-09-09 12:44:44Z`) was compared against the document's own date assertion
(`Founder ruling · 2026-09-10`) and the two disagreed. ⭐ **The machine-generated timestamp caught
the human-readable claim.**

⛔ **The error was inherited and then propagated.** Documents dated `2026-09-10` existed before this
session segment; every document authored afterward copied the convention without checking it against
the actual date. **A date is an assertion, and it was never verified against anything.**

## 2 · Extent — verified by `git log --diff-filter=A`

```text
26 files named _2026-09-10        ALL first committed 2026-09-09 (10:37Z – 12:44Z)
30 in-text date assertions        across 13 files
 0 correct                        the error is total, not partial
```

**Earliest affected: `D8_WALK_A1` @ 10:37Z. Latest: the constitution's Law 6 @ 12:44Z.**

## 3 · Repair — CORRECTED

⭐ **All 30 in-text date assertions rewritten `2026-09-10` → `2026-09-09`.**

**These were unambiguous factual errors**: they asserted that founder rulings occurred on a day that
had not yet happened. ⛔ **This is NOT a superseded reading kept as a dated before-state** — the
project's *"date it, don't edit it"* discipline governs facts that were true when recorded and are
false now. **These were never true.** A wrong date is corrected; it is not preserved.

## 4 · ⛔ NOT REPAIRED — 26 filenames still carry `_2026-09-10`

⚠️ **Deliberately not executed, on the authority of Law 4 ratified in these very documents.**

**Renaming twenty-six files is a systematic transformation of the record's identifiers.** It would:

```text
break the link between existing commit messages and the files they describe
invalidate every cross-reference in 13 documents
change identifiers the founder has already verified by SHA and by name
```

> ⭐ **Law 4 applies to me here: no strategic change to the record may be executed before the
> writer has been shown what is proposed, what it changes, and has authorized it.** **A systematic
> rename discovered after the fact is exactly the failure this constitution was written to
> prevent** — and it would be a poor irony to commit it while recording the law against it.

**FOUNDER DECISION REQUIRED:**

```text
OPTION A  rename all 26 files to _2026-09-09, update all cross-references
          → clean record; loses commit-message↔filename correspondence;
            cheapest now, before merge

OPTION B  keep filenames as stable identifiers, corrected in-text only
          → citations stay valid; 26 filenames remain permanently wrong

OPTION C  keep filenames, and let THIS record be the authority that the
          _2026-09-10 suffix is a known-wrong identifier
          → no churn; the error stays discoverable rather than hidden
```

⛔ **Nothing renamed pending that ruling.**

## 5 · The finding worth keeping

> ⭐ **Nothing in the record's own machinery verified a date against reality.** Every document
> asserted its date; no instrument compared that assertion to anything. **The founder's check —
> commit metadata against document claim — is the missing verification, and it is trivial to
> automate.**

⚠️ **This is a small instance of a pattern already named in this lane:** *an instrument can satisfy
all of its remaining questions by forgetting to ask the difficult ones* (FR-14). **A governance
record that cannot detect a wrong date in its own headers has an unexamined trust in its own
authorship.**

⛔ **No lane opened. No automation authorized.**
