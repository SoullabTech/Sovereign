# P1-05 · ARTIFACT 2 — THE SELF-CORRECTION REGISTER

```text
STEP      P1-05 · CONTRADICTION / GAP PASS
ARTIFACT  2 of 3 — defects the census introduced into its OWN output, and the corrections it
          made to itself
TYPE      RECORD ONLY — ⛔ NOTHING HERE IS REPAIRED BY THIS STEP
SCOPE     the lane's own records: P1-00 · C-2 · P1-01 · P1-02 · P1-03 · P1-04 and their
          instruments, amendments, gates, adjudications and closes
```

> ⭐⭐ **Why this register exists, in the founder's words:** *"This census has repeatedly caught its
> own overclaims and checker defects. That is not noise to bury; it is evidence that the method can
> discriminate against its own outputs."*

**What is in scope.** A defect, overclaim or miscount that **the census produced**, and what
happened to it afterwards. ⛔ Not the organism's contradictions; ⛔ not disagreements between
governing documents; ⛔ not defects found in the subject repository. Those belong to the
contradiction register (artifact 1) and to the P1-02 records.

**One boundary declared before the entries.** `X-DEF-1` and `X-DEF-2` are **cross-record
disagreements between two census domain records about the organism** and are adjudicated as
contradictions elsewhere. Only `X-DEF-3` is recorded here, because the close record names it
precisely: *"a contradiction introduced by the census process itself."*

⛔ No entry below is ranked, scored, or given a severity. ⛔ No repair is proposed. ⛔ Where a
defect was recorded and not corrected, this register does not correct it either.

---

## SC-01 · The 133-commits-ahead miscount

```text
WHAT         The custody act first reported the census branch as 133 commits AHEAD of canonical.
             It was false: the divergence is 0 in both directions. The count had been computed
             against a stale remote-tracking ref (origin/clean-main-no-secrets pinned at 6345b8e0
             by the container's shallow initial fetch).
WHERE        P1-00 CUSTODY §1a — "Correction recorded, not deleted"
HOW CAUGHT   ⭐ the lane operator, inside the same act, on re-running the computation after
             `git fetch --depth=200 origin clean-main-no-secrets` — the ref advanced
             6345b8e0..1a555430 and the divergence resolved to zero
DISPOSITION  corrected in place · the false reading preserved verbatim beside the correction
```

⭐ The record states the mechanism rather than the number: *"a divergence claim computed against an
unrefreshed remote-tracking ref is a statement about the container's fetch depth, not about the
branch."*

---

## SC-02 · An `--is-ancestor` result that was not computable, and was not reported as a finding

```text
WHAT         `git merge-base` / `--is-ancestor` across independently fetched shallow branches
             returned FALSE between ee3e4c47 and HEAD, "where the honest answer is not computable
             at this depth."
WHERE        P1-00 CUSTODY §6 · exception E-1
HOW CAUGHT   ⭐ the custody act itself, recognising the shallow-clone constraint before quoting
             the result as evidence
DISPOSITION  recorded, not reported as a finding · a lane rule adopted: a census claim resting on
             git history must state the depth it was computed at, or be marked UNKNOWN —
             "shallow-clone silence is never evidence of absence"
```

---

## SC-03 · The `git add -A` custody error

```text
WHAT         An amendment commit swept in five census files that its commit message did not
             describe — a custody error in the lane's own committing, not in its findings.
WHERE        Attested inside the lane at P1-03 AMENDMENT-2 §5: the CONCLUDE supersession is
             recorded "⛔ not edited away — the same discipline this lane applied to its own
             `git add -A` error and to the 2026-09-07 production witness."
HOW CAUGHT   ⭐ the lane operator, on its own commit, at the time it happened
DISPOSITION  recorded, not rewritten · cited afterwards as the lane's own precedent for
             preserving a defect rather than tidying it
```

⚠️ **Evidence limit, stated rather than smoothed:** the commit object itself lies outside the P1-05
evidence boundary (records only). This entry rests on the in-lane reference above and on the
dispatch that names it. ⛔ The five files are not enumerated here, because no record inside the
permitted evidence enumerates them.

---

## SC-04 · Tarot recorded as zero files, falsified at the subject

```text
WHAT         P1-01 slice 05 recorded tarot as named in three canon documents with ZERO files.
             At the census subject that is false: 1,901 lines across five files
             (major-arcana · minor-arcana · spreads · drawing · index) plus a live route
             POST /api/oracle/tarot, and ~20 further referencing files.
WHERE        P1-02 F_symbolic.md §3.4 ("⭐ TAROT · P1-01's HYPOTHESIS IS FALSIFIED") · §6 · C-F3
HOW CAUGHT   ⭐ a later worker re-reading at the subject — domain F, under instrument constraints
             5 and 7 (citation ≠ implementation; every artifact opened and read at the subject)
DISPOSITION  corrected forward · ⛔ the P1-01 slice was NOT edited · both readings recorded, the
             re-read governs ("⛔ Per constraint 7 the predecessor claim is evidence-input only
             and the re-read governs; both recorded")
```

⭐ The worker did not stop at its own row: F OQ-10 asks *"Does any other slice-05 'zero files'
claim need the same re-read?"* — the defect generalised into a question rather than a patch.

---

## SC-05 · The `0.0225` decay term — a CLAUDE.md claim tested and not found

```text
WHAT         The anchor's (and P1-01's) statement that "the SQL confirmation term caps at 0.0225"
             has no referent at the subject: no 0.0225 term exists in database/migrations/ or
             lib/, and the SQL function read contains no confirmation term to cap.
WHERE        P1-02 C_developmental_relational.md §8.2 + §10 · D_field.md CONTRA-6 · restated in
             MAP 4 PART VIII (UC-ABC-Q)
HOW CAUGHT   ⭐ two workers independently re-reading the named artifact at the subject
             (domain C on the decay question; domain D because it was tasked to verify the
             anchor's field claims)
DISPOSITION  recorded as UNVERIFIED AT THE SUBJECT · ⛔ explicitly NOT recorded as refuted —
             "the claim may refer to an object this census did not locate" · routed forward as
             an owed read
```

⚠️ The same records **confirm** the rest of the anchor's claim (two divergent decay
implementations; `QuantumFieldMemory` 810 LOC / 0 persistence). ⭐ The confirmations and the one
disconfirmation are reported together, ⛔ neither suppressed.

---

## SC-06 · `recurring_interests` — described as session-inferred, found dormant

```text
WHAT         The P1-01 hypothesis described `recurring_interests` as session-inferred. At the
             subject it is a COLUMN, not a table, with ZERO code references in lib/ or app/ —
             inert. STATUS: DORMANT.
WHERE        P1-02 C_developmental_relational.md §5.5 · §10
HOW CAUGHT   ⭐ a later worker re-reading at the subject (domain C negative-findings pass)
DISPOSITION  corrected forward · both recorded · ⛔ the record adds that the finding "settles
             nothing about the governing ruling" (instrument constraint 6)
```

---

## SC-07 · The instrument defect: a ladder defined but never required per capability

```text
WHAT         The preserved distinctions (EXISTS ≠ PARTICIPATES ≠ DECIDES ≠ HAS AUTHORITY) were
             declared as a census rule, but no per-capability ladder value was required of a
             domain record. The consequence surfaced only at normalization: "roughly 209 of 221
             rows currently carry no usable ladder value."
WHERE        P1-03 AMENDMENT-2 §3 (Ruling 1) · the field list at P1-02 INSTRUMENT §3 · the LADDER
             field at P1-03 INSTRUMENT §3
HOW CAUGHT   ⭐ founder review of the normalized register — the gap was visible only once 221 rows
             were restated in one schema
DISPOSITION  corrected by a bounded, records-only recovery pass ("restate what the existing record
             text already establishes"), ⛔ WITHOUT re-running P1-02 — "which is the only reason
             it is authorizable at all" · 144 of 221 positions recovered, 77 UNKNOWN
```

---

## SC-08 · `HAS AUTHORITY` treated as the top rung of the ladder

```text
WHAT         The census's own schema carried HAS AUTHORITY as the final rung of a single
             participation hierarchy — which invites exactly the promotion DECIDES ⇒ HAS
             AUTHORITY that the census exists to refuse.
WHERE        P1-03 AMENDMENT-2 §2 (INF-6 added) · P1-03 AMENDMENT-3 §2 ("HAS AUTHORITY therefore
             LEAVES the ladder … It was never a rung")
HOW CAUGHT   ⭐ founder ruling, mid-pass, while the three ladder workers were running — the
             refinement was relayed to them before their returns
DISPOSITION  corrected in the instrument · participation and authority become two orthogonal axes
             · INF-6's second clause added verbatim: "HAS AUTHORITY MUST NEVER BE INFERRED FROM
             DECIDES — that would violate INF-4 in a different costume" · ⛔ no finding amended
```

---

## SC-09 · `X-DEF-3` — the census promoting its own observation to authority

```text
WHAT         A P1-02 record established the effect ("it DECIDES, and its text replaces MAIA's",
             returned "before the turn reaches a model"), recorded at its own §7 that "no ratified
             source authorizing realm-based refusal was located", and one sentence later wrote
             "(e) is the only object in Domain D at HAS AUTHORITY."
WHERE        P1-02 D_field.md §6 answer 4 versus D_field.md §7 (P1-D-GOV-02) · refusal recorded at
             P1-03 05_ladder_D_E_F.md (row P3-D-06) · characterized at P1-03 CLOSE §2 · mapped at
             MAP 4 PART I
HOW CAUGHT   ⭐⭐ an instrument written before the evidence — INF-6, applied by the P1-03 bounded
             ladder pass, "fired against evidence this lane itself produced, eight hours earlier,
             under its own instrument. The prohibition earned its place by catching its author."
DISPOSITION  refused and preserved side by side · ⛔ the P1-02 source record is NOT corrected and
             is NOT described as needing correction · routed to P1-05 (its C-class is adjudicated
             in artifact 1, ⛔ not here)
```

⭐ The counter-example stands beside it in the same corpus: another P1-02 record had already
refused the identical promotion — *"authentication establishes `PARTICIPATES`, not `HAS
AUTHORITY`."*

---

## SC-10 · The inventory that asserted a negative it could not prove

```text
WHAT         The inventory of rows carrying effect without located authorization was first named
             EFFECT-WITHOUT-AUTHORIZATION. That name quietly asserts that no authorization exists
             — a verdict the census cannot reach.
WHERE        P1-03 AMENDMENT-3 §1
HOW CAUGHT   ⭐ founder ruling, while the ladder pass was running
DISPOSITION  renamed EFFECT-WITHOUT-LOCATED-AUTHORIZATION · ⛔ no finding amended · the
             distinction stated: "'Unauthorized' is a verdict; 'no authorization located' is a
             reading"
```

⭐ The record names why the honesty is load-bearing across lanes: keeping the name honest "is what
stops the two lanes contaminating one another — a census that pre-announced the security lane's
verdict would have decided its finding for it."

---

## SC-11 · "Six, with one refusing" — superseded by three incompatible enumerations

```text
WHAT         An earlier founder statement of the symbolic CONCLUDE set as "six with one refusing"
             was more settled than the evidence. Domain F carries THREE overlapping and
             incompatible enumerations of that set, differing in membership (F-09 versus F-12).
WHERE        P1-03 AMENDMENT-2 §5 · reproduced whole at MAP 4 PART II
HOW CAUGHT   ⭐ normalization — restating domain F's own three lists in one schema made their
             incompatibility visible
DISPOSITION  recorded as SUPERSEDED, ⛔ not edited away — "the same discipline this lane applied
             to its own `git add -A` error and to the 2026-09-07 production witness" · ⛔ no
             number is settled · ⛔ nothing added to or removed from any list
```

---

## SC-12 · The `E1/E2/E3/E4` label — declared ambiguous, and it was neither candidate

```text
WHAT         A normalization authorization referred to an "E1/E2/E3/E4 inference contract" with no
             unambiguous referent in the lane's records. Two candidates existed (the P1-00
             declared exceptions E-1/E-2/E-3, which are three and are not inference rules; and the
             ruled prohibitions, which were never labelled E-n).
WHERE        P1-03 INSTRUMENT §1 (declared) · P1-03 AMENDMENT-2 §1 (resolved)
HOW CAUGHT   ⭐ the instrument declaring the ambiguity before use rather than guessing — then the
             founder, who answered that the referent was a THIRD thing the lane had not yet
             recorded: the four synthesis evidence classes (observed / derived / contradiction /
             unknown)
DISPOSITION  resolved · INF-1…INF-5 unchanged · E-1/E-2/E-3 keep their P1-00 meanings · a new
             non-colliding namespace SYN-1…SYN-4 created for the synthesis classes
```

⭐ *"Declaring the ambiguity rather than guessing is what made the correction cheap. Had the pass
adopted either candidate, a synthesis vocabulary would have silently become an inference
contract."*

---

## SC-13 · The `54 / 51` declared numeric deviation

```text
WHAT         Register 01 records GOVERNING SOURCE = NONE LOCATED on 51 of 62 rows; the ladder
             slice reads NONE LOCATED on 54, because three of the eleven named sources are, by the
             records' own sentences, not authorization text (P3-A-08 a witness recording its own
             witness as not yet obtained · P3-A-10 provenance headers · P3-A-13 an instrument the
             register itself calls "a CI instrument, not a governing document").
WHERE        P1-03 04_ladder_A_B_C.md §0 (declared at the head of the file) · adjudicated at P1-03
             ADJUDICATION 04 §4 · carried at P1-03 CLOSE §3b · mapped at MAP 4 PART VII
HOW CAUGHT   ⭐ the worker itself, declared in-file before judgement, with reasons and named rows
             — then confirmed as within bounds by the fixed gate
DISPOSITION  BOTH NUMBERS CARRIED · ⛔ not averaged, reconciled or chosen between · ⛔ no register
             cell altered · reversible by striking the three named rows · whether the two figures
             conflict at all is itself not established (they are different fields on different
             axes)
```

---

## SC-14 · The slice-05 summary versus its own per-row lines

```text
WHAT         Slice 05's summary block tallies AUTHORITY STANDING as NONE LOCATED 46 · UNKNOWN 58,
             while its 111 per-row AUTHORITY lines read 71 · 33.
WHERE        P1-04 MAP3_authority.md §"NONE LOCATED vs UNKNOWN — counted separately" · carried at
             P1-04 CLOSE §4
HOW CAUGHT   ⭐ a mechanical read of the rows by the MAP 3 assembler, which builds from the rows
             and not from the summary
DISPOSITION  recorded, ⛔ not reconciled · "no row's value was changed to make a column agree" ·
             routed to P1-05
```

---

## SC-15 · The checker's own check-1 false positive at P1-04

```text
WHAT         The adjudicator's first check-1 pass reported 3 unclassed edges in MAP 1 and 8 in
             MAP 2. That was wrong: it matched PHYSICAL LINES rather than EDGE ENTRIES, and
             multi-line entries carry their SYN class on a continuation line. Re-checked per
             entry: 59 · 54 · 58 · 47 edge entries, 0 without a SYN class in any map.
WHERE        P1-04 CLOSE §1 — "⚠️ A correction to my own method, recorded"
HOW CAUGHT   ⭐ the adjudicator re-checking its own parse before reporting a FAIL — "I nearly
             failed two maps on a criterion the contract does not contain"
DISPOSITION  corrected in place and recorded · no map failed on it
```

⭐⭐ **The deeper finding, which outlives the miscount:** *"requiring same-line placement would
have been exactly the rendering prescription that was refused after MAP 4's failure. The gate says
an edge must carry an explicit SYN standing — ⛔ it does not say where. A gate that silently
acquires a formatting rule while checking is no longer the gate that was fixed."*

⭐ **The same restraint fired a second time, on check 2:** MAP 4 titles its declined-edge section
*"EDGES OMITTED FOR WANT OF A QUOTED RELATION"* rather than *"Edges NOT drawn"*. ⛔ Not scored a
failure — "check 2 requires preservation, not a heading string, and inventing a naming requirement
would be the same error as §1."

---

## SC-16 · MAP 4's first final failed the gate it was judged against

```text
WHAT         The returned MAP 4 (frozen final c190338e, 983 lines) carried 47 edges in its edge
             list, EVERY ONE with a quoted basis and NONE with a SYN standing. The map had
             substituted BASIS (why the edge exists) for STANDING (what kind of claim it is).
WHERE        P1-04 ADJUDICATION MAP4 — "⛔ CHECK 1 FAIL · 3 PASS · 1 FAIL"
HOW CAUGHT   ⭐ the acceptance gate, fixed at 65fabb4a / f3f758aa BEFORE the artifact existed
DISPOSITION  FAIL recorded per check · identical-bounds RE-RUN · ⛔ NO HAND CORRECTION ("adding a
             SYN class to 47 edges myself would make me the author of the standing I am judging")
             · ⛔ no new rendering rule created · the failed final preserved unamended, "not
             deleted, not amended, not described as a draft" · checks 2–4 ⛔ not carried forward
             as pre-passed
```

⭐ The adjudication states what the failure is **not**: *"This is NOT a judgement that the edges
are wrong. It is that their standing is unstated — which is exactly the condition check 1 exists to
detect."*

---

## SC-17 · Two status tables that had gone stale, corrected rather than silently updated

```text
WHAT         (a) A founder status table recorded slice 05 as RUNNING; it had in fact signalled and
             been frozen FINAL at cd094d39 before the table was read.
             (b) A later founder table recorded slices 04 and 06 as unsignalled intermediates;
             both had signalled and been adjudicated.
WHERE        (a) P1-03 ADJUDICATION 05 §1c · (b) P1-03 CLOSE, header note
HOW CAUGHT   ⭐ the adjudicator, comparing each table against the artifacts' actual custody state
DISPOSITION  "Recorded as a correction rather than silently updated" — both times, in those words
```

⚠️ Recorded in the same place: slice 06's content did not change between its last intermediate
freeze and its signal. *"The tree at 3f904afb is the final artifact; the signal upgraded its
STANDING, not its CONTENT. ⛔ No new freeze commit was manufactured to make the sequence look
tidier."*

---

## SC-18 · Check 2's rationale was weaker than its PASS

```text
WHAT         The 04 and 05 adjudications leaned on empty KNOWS / CONSIDERS rungs as evidence that
             no monotonic ladder inference had slipped in. That is not decisive: a monotonic error
             could occur as DECIDES → inferred CONTRIBUTES without ever touching those rungs.
WHERE        P1-03 CLOSE §1 — "Check 2's rationale, tightened (founder) — ⛔ the PASS is unchanged"
HOW CAUGHT   ⭐ founder review of the gate's own reasoning, after two PASSes had been recorded on it
DISPOSITION  the operative basis restated (every recovered position has a direct record quote · no
             position appears unless its own quoted basis establishes it · no lower rung supplied
             merely because a higher rung exists); the empty rungs demoted to corroborating
             evidence · applied RETROACTIVELY to the 04 and 05 adjudications · ⛔ neither PASS
             changes
```

---

## SC-19 · `EXISTS 48/48` rested on a shared quote, not a per-row one

```text
WHAT         Slice 06 recovered EXISTS on 48 of 48 rows on a SLICE-LEVEL SHARED basis — the three
             records' own §0 subject-verification statements — not on a per-row quote, where the
             gate's check 1 requires an exact record quote per recovered position.
WHERE        P1-03 CLOSE §1a · carried again at MAP 2 §3c and MAP 4 PART VIII (UC-EXISTS-BASIS)
HOW CAUGHT   ⭐ the worker flagged it ITSELF and reported it separately "so it is not read as
             coverage", giving the honest reading: above EXISTS, 41 participate, 25 determine an
             outcome, 1 has a located governing source
DISPOSITION  check 2 passes; ⛔ the qualification travels with the PASS, and is restated at every
             later altitude · in MAP 2 the layer is shown on three different bases that ⛔ must
             not be merged
```

---

## SC-20 · Two map edge totals that do not match the adjudicator's recount

```text
WHAT         MAP 1's own closing block reads "61 edges (SYN-1 56 · SYN-2 1 · SYN-3 4 · SYN-4 0)";
             the close record's per-entry recount records 59 for that map. MAP 3's closing block
             reads "183 nodes · 59 edges"; the close record records 58. MAP 2 (54) and MAP 4 (47)
             agree with their own blocks.
WHERE        P1-04 MAP1_participation.md closing block · MAP3_authority.md closing block · against
             P1-04 CLOSE table and §1
HOW CAUGHT   ⭐ this register, comparing two census records' own stated totals
DISPOSITION  recorded, ⛔ NOT corrected and ⛔ NOT adjudicated here · ⛔ neither number is preferred
             and no edge list was re-counted to decide between them · if it is adjudicated at all
             it is bookkeeping, and it belongs to the contradiction register's record/arithmetic
             class
```

⚠️ Stated as the P1-05 instrument requires of arithmetic: the comparison is between a **source
total** and a **row-derived total**, and the two counts may be counting different things (a map's
own block against an adjudicator's per-entry parse). ⛔ That possibility is not resolved here.

---

## SC-21 · The legibility gap the lane created and declined to close

```text
WHAT         The C-2 ruling froze the predecessor census as PREDECESSOR · FROZEN INCOMPLETE ·
             EVIDENCE INPUT ONLY — while the predecessor's own file still reads
             "Status: CENSUS IN PROGRESS". A reader arriving at that file first reads a live
             census.
WHERE        C-2 RULING §5 — "One thing deliberately not done"
HOW CAUGHT   ⭐ the ruling itself, naming the consequence of its own act in the same document
DISPOSITION  recorded, NOT corrected · two reasons stated (editing another lane's record is the
             clearest instance of the cross-lane absorption this act forbids; and the file carries
             its own rule against being edited) · "the legibility gap is therefore real and is
             named rather than closed" · routed forward as D-P1-05
```

⭐ The ruling files its own residue under the category P1-05 exists to classify: *"That is
documentation drift of exactly the kind P1-05 exists to classify — and this lane now knows about
one instance before it starts."*

---

## SC-22 · The lane committed to a branch its own repository policy does not admit

```text
WHAT         The census branch claude/quirky-lovelace-yxaes0 is not matched by the committed
             branch allowlist, and the enforcing hook is not installed in this container
             (core.hooksPath unset, no non-sample hooks), so the declared gate does not run.
WHERE        P1-00 CUSTODY §6 · exception E-2 · status after ruling at C-2 §4
HOW CAUGHT   ⭐ the custody act, checking the committed policy against its own branch before
             writing to it
DISPOSITION  declared as an exception and carried, ⛔ not repaired — "adding claude/* to the script
             would answer Q1 silently while purporting to fix Q2" · the interim rule applied to
             itself: "absence of the branch hook is never evidence of branch-policy compliance" ·
             the successful push recorded as "the reason to doubt, not the reason to proceed" ·
             routed forward as D-P1-03
```

---

# What the mechanism was, each time

⭐ Grouped by **what caught it**. ⛔ No mechanism is ranked, preferred, or concluded to be the best;
several entries appear under more than one grouping because more than one thing caught them.

```text
A LATER WORKER RE-READING AT THE SUBJECT
  SC-04  tarot: "zero files" falsified by opening the files
  SC-05  the 0.0225 term: searched for at the subject and not found
  SC-06  recurring_interests: described as session-inferred, read as inert
  SC-14  the slice-05 tallies, caught by an assembler that built from rows rather than summaries
  — the enabling rule in every case is C-2 constraint 7: a predecessor or prior claim enters only
    as a hypothesis to be re-verified, never as a settled finding

A GATE CHECK FIXED BEFORE THE EVIDENCE EXISTED
  SC-16  MAP 4's missing SYN standings — the only outright FAIL the lane recorded
  SC-13  the 54/51 deviation, declared by the worker and then judged within bounds
  SC-19  the EXISTS 48/48 shared basis, flagged by the worker and carried by the gate
  — the gates were written while the workers were still running, "because a gate written after
    seeing the evidence is a gate shaped by it"

A FOUNDER REVIEW
  SC-07  the ladder defined but never required per capability
  SC-08  HAS AUTHORITY treated as a rung
  SC-10  EFFECT-WITHOUT-AUTHORIZATION renamed
  SC-11  "six with one refusing" superseded
  SC-12  the E1/E2/E3/E4 referent, which was neither candidate
  SC-18  check 2's rationale tightened without changing its PASS
  — four of these landed MID-FLIGHT and were relayed to running workers; none amended a finding

A MECHANICAL PARSE OR RECOUNT
  SC-15  the check-1 false positive, caught by re-parsing per entry instead of per line
  SC-14  111 per-row AUTHORITY lines counted against a summary block
  SC-20  two map totals compared against the adjudicator's recount (⛔ unadjudicated)

AN INSTRUMENT WRITTEN BEFORE THE EVIDENCE
  SC-09  INF-6 firing against the lane's own eight-hour-old record
  SC-12  the instrument declaring a label ambiguity instead of guessing a referent
  SC-02  the E-1 shallow-clone rule applied to a result the act had just produced

THE LANE OPERATOR, ON ITS OWN ACT
  SC-01  the 133-commit miscount, corrected inside the same act
  SC-03  the git add -A custody error
  SC-17  two stale status tables, corrected rather than silently updated
  SC-21  a legibility gap the ruling created, named in the ruling itself
  SC-22  a branch the committed policy does not admit, declared before being used
```

⭐ **One property is common to every disposition above and is recorded as an observation, not a
conclusion:** in no entry was the earlier text deleted. Corrections sit beside what they correct —
the false divergence count, the superseded enumeration, the failed MAP 4 final, the promoted
`HAS AUTHORITY` sentence, the stale status tables. ⛔ Whether that is sufficient, and what if
anything should follow from it, is not decided here.

```text
P1-05 · ARTIFACT 2 · SELF-CORRECTION REGISTER · COMPLETE
⛔ NOTHING REPAIRED · ⛔ NOTHING RANKED · ⛔ NO SEVERITY · ⛔ NO RECOMMENDATION · ⛔ NO LANE OPENED
⛔ NO SOURCE CODE READ · ⛔ NO RUNTIME INSPECTED · ⛔ NO NEW GOVERNING DOCUMENT SOUGHT
⛔ AUTH-EXPOSURE-01 NEITHER CITED, AWAITED NOR ANSWERED
⛔ NO FILE EDITED EXCEPT THIS ONE
```
