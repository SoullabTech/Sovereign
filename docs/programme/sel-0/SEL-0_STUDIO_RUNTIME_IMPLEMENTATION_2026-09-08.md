# SEL-0 · Writer's Studio developmental selection — **RUNTIME LOCKED · NOT MEASURED · SURFACE BLOCKED**

> ⛔ **THE LOCK BELOW COVERS THE RUNTIME PATH, NOT THE WRITER-FACING SURFACE.** The Develop room's
> commission gesture is written but **NOT COMMITTED**: the design-canon gate requires an Experience
> Contract with two screenshots on disk and a real experience walk, and neither can be produced by
> this session without fabricating evidence. The capability is therefore reachable by the API and
> **not yet reachable by a writer**. Under the Productization obligation that means the product gap
> is **narrowed, not closed**.

**Branch** `feature/jarvis-ws2-sel0-production-discovery-2026-09-08`
**Authority** founder rulings, 2026-09-08 — the D5 amendment and the F-7 eligibility ruling.
**Contract** `ebcb46d0d` §2.1–§2.10 + the Q12 amendment · **Instrument** `af155f414` (untouched)

Built against the product contract and synthetic fixtures only. **Manifest B not opened. Manifest C
and the source snapshot not used as examples and not read during implementation. The frozen 19 were
not run.** No provider called. No production data written. The founder blind is intact.

---

## 1 · The schema proposal, as the ruling required — and why it needs no further ruling

The ruling required inspection before any schema change. What the inspection found:

```text
developmental_readings   rows IMMUTABLE — every UPDATE aborts by trigger
observations jsonb       CLOSED KEY SET — an unknown key inside an observation RAISES
reader_provenance        written; classifier_provenance written
readingContractVersion   assembled by freeze.ts, DROPPED at the INSERT — reaches no column
```

**Smallest durable representation: two nullable columns beside the observations, and no change to
the observation shape.**

⭐ **Why not a field inside each observation.** The observation's key set is closed and enforced at
insert. Putting the verdict there would require reopening the ratified observation shape — a third
reading contract — to carry something that is *not part of what MAIA noticed*. F-7 eligibility is a
judgement **about** an observation under a constitutional rule; it is provenance of the reading,
not content of the claim. So the observation contract is left exactly as ratified.

**Immutability comes free and exactly.** The row already refuses every UPDATE, so a verdict written
at freeze can never be revised — which is what "immutable record" has to mean here.

### `reading_contract_version` — repairing the recorded defect, not compounding it

The ruling told me not to silently compound it. Leaving it dropped while adding a second provenance
dimension beside it would have been exactly that, so it is repaired in the same additive migration.

⭐ **This makes the ratified rule true rather than changing it.** The contract identifies v1 by the
*absence* of the field. Because the value reached no column, **every row — v1 and v2 alike — has
been indistinguishable from v1**, so the ratified discriminator has never worked. A nullable column,
written by new freezes and never backfilled, restores the semantics 20260904000002 already declared.
That migration also says why NOT NULL is refused: it would invalidate every v1 row. It is refused
here for the same reason.

⚠️ **One loss is permanent and is recorded rather than inferred away.** A v2 reading frozen *before*
this migration cannot afterwards be distinguished from a v1 reading. Nothing recovers that, and
guessing from the observation shape would be manufacturing provenance.

### The judgement, stated so it can be overturned

**No new founder ruling was required, and here is the reasoning to disagree with.** The change is
additive; it backfills nothing; it re-validates nothing; it replaces no existing constraint or
trigger function; it preserves the ratified "absence is the evidence" semantics in both columns; and
the verdict semantics are exactly as ruled. Schema authority for persisting F-7 eligibility was
granted by the ruling itself, and the contract-version column is the non-compounding half of the
same act. **If that reading is wrong, the migration is unapplied and reverts by dropping two
columns.**

---

## 2 · What a new reading is frozen with — and the honest consequence

```text
rule          E1 §3.2 — unbounded absence forbidden; bounded non-return lawful
ruleVersion   WS2-ENCOUNTER-01_E1_NOTICING_VOCABULARY_2026-09-08
adjudicator   { kind: 'none', reason: 'no F-7 adjudicator exists in this runtime;
                 the verdicts are unestablished, not assumed' }
verdicts      every observation -> 'unestablished'
```

⛔ **Every verdict is `unestablished`, and that is the truth rather than a placeholder.** Nothing in
this runtime classifies absence-shaped openness at freeze time. The ruling requires the record to
exist and be immutable; it does not authorize inventing verdicts, and building a classifier would be
the later F-7 repair phase, which is explicitly not open.

⚠️ **So the capability is wired and inert.** Until an adjudicator fills verdicts, every commission
returns `NO_LAWFUL_CANDIDATE`. That is the correct behaviour of a correct implementation — because
`unestablished` is not `eligible` — and it is stated here rather than discovered later as a bug.
**The substrate is what this phase was for.**

⛔ **The frozen 19 are not backfilled.** Their Step-0 adjudication stays benchmark evidence. Writing
it into production would convert an instrument's finding into production provenance — the direction
of authority this programme exists to prevent.

---

## 3 · The boundary seam — standing as authority, never as information

```text
lib/manuscript/boundary/candidateEligibility.ts
```

```text
standing store ──►  THE SEAM  ──► lawful KEYS ──► selector ──► model
                        │
                        └── standing values stop here, permanently
```

⭐ **The distinction the seam makes structural: standing is AUTHORITY, not information.** A dismissal
decides what MAIA may be shown at all; it must never become something she weighs. The seam reads the
authoritative store, applies one rule, and returns keys — never the map, never a count, never a
"the writer kept this one" hint a ranker could pick up.

```text
dismiss                      candidate EXCLUDED
keep · unresolved · UNSET    INDISTINGUISHABLE — no positive or negative weight
```

⛔ **Client-supplied standing is forbidden, and the enforcement is that there is nowhere to put it.**
The seam takes a `memberId` and reads the store itself. Option (c) is not implemented and cannot be
reached: the route holds no standing value, and the commission parser refuses any request carrying an
unexpected field.

⛔ **A failed standing read is not "nothing is dismissed."** `currentStandings` throws rather than
returning empty; the throw propagates and the route answers `boundary_unreadable` (503). An
infrastructure failure must never quietly re-offer something the writer dismissed.

---

## 4 · D5, amended, and now proving both sides

⚠️ **Half of the old gate would have passed vacuously.** A ban-only gate is satisfied by deleting the
feature. So the falsifiers now assert the permission as well as the confinement:

```text
PERMITS   the seam CAN reach the standing store
          the ask route CAN reach standing — through the seam
CONFINES  EVERY path from the route to standing passes through the seam
          the selector cannot reach standing at all, by import
          the selector cannot RECEIVE standing either — no such input exists
          the seam's outcome type names keys and gates, never a standing
          only `dismiss` is read; `keep` / `unresolved` are never compared
FALSIFIES a route reaching standing without the seam IS reported
          a selector given the standing import IS reported
          a selector input that DID carry standing IS reported
```

⛔ **The ask route left `COGNITION_ROOTS`, and that is not a loosening.** A blanket ban there would
have been satisfied by the route reaching standing through any second seam somebody added later. It
is replaced by the stricter, more specific assertion that *every* path passes through the named seam.

**Contract §2.4's standing input is superseded, not overlooked.** The amendment is later and narrower;
the selector's input type no longer has the field, and its absence is the enforcement. Open
ask-threads remain a permitted input and are unaffected.

---

## 5 · The runtime path, end to end

```text
DevelopRoom  "ask MAIA what is worth looking at"  — WRITTEN, NOT COMMITTED (see §9)
    │        mints commissionId; holds the offered keys for this commission only
    ▼
POST /api/sovereign/manuscripts/[id]/ask   { question, selectionCommission }
    │        commission read ONLY when no anchor parsed and no thread resumed
    ▼
loadFrozenDevelopmentalReading → loadLiveWork → assessReading
    ▼
resolveLawfulCandidates   gates in contract order; standing stops here
    ▼
selectDevelopmental       ordering + internal confidence, or DECLINE_TO_SELECT
    ▼
developmentalTurn         the ordinary ask thread, on the chosen observation
```

The offered observation reaches the writer as an ordinary `ask_threads` / `ask_turns` conversation —
the same surface an observation they named themselves would produce. **Nothing about the conversation
is a selection surface.**

⛔ **Writer precedence is the branch order and nothing else.** A request naming an observation cannot
reach the selector even if it also carries a commission: the selector is not consulted, rather than
consulted and overruled.

⛔ **The ordering never leaves the route and confidence is never returned.** The room receives one
key. There is nothing to render as a ranking because nothing ranked ever arrives.

**Ignoring or rejecting an offer is not a standing act.** Nothing in the room's commission surface
writes a standing, and it cannot — the standing surface is `YourStanding`, reached by a separate
deliberate gesture.

---

## 6 · Gates

```text
lib/manuscript + lib/writersStudio      78 suites · 1462 passed · 0 failed
  D5 / D6 (amended)                     37 passed — both sides proved
  selector falsifiers                   41 passed
  F-7 persistence falsifiers            25 passed
sovereignty pre-commit                  PASS (supabase · provider · anthropic · PHI · design canon)
npm run typecheck                       RED — pre-existing, see below
```

⚠️ **The typecheck gate is RED and was RED before this lane touched anything.** Verified by stashing
every change and re-running on the clean tip: the same three diagnostics in
`app/wisdom-keepers/sacred-texts/page.tsx`, `components/focus/InboxTriage.tsx` and
`components/focus/NextStepBuilder.tsx`. None is touched here, none is reachable from this path, and
this lane adds **zero** new diagnostics. ⛔ Not repaired — absorbing three unrelated defects because
this lane discovered them is the widening the standing rules forbid, and repairing them would also
erase the evidence that they were not this lane's doing.

⚠️ **Three repository suites fail and are also pre-existing** — `transcript-scroll-resettle`,
`encounter/cognitionBinding`, `notifications/safety` — identically at the clean tip. Not touched.

### ✅ SHADOW MIGRATION VALIDATION — **PASS**, on a disposable native cluster

⚠️ **An earlier state of this document said the migration had been executed nowhere. That was true
when written and is false now.** Corrected in place rather than deleted: Docker never became
responsive, and the shadow was instead run on the Mac Studio's native PostgreSQL toolchain.

```text
cluster        initdb, PostgreSQL 14.19 (Homebrew), a fresh cluster under /tmp
isolation      listen_addresses='' — unix socket only, unreachable over TCP
port           55437, unused
database       sel0_shadow_<pid>, uniquely named, created and destroyed by the run
credentials    a local trust-auth `shadow` role; NO production connection string
data           synthetic fixtures only; no production data copied or read
```

⛔ **Production was not touched.** Neither shadow script contains `minisforum`, `192.168.0.104` or
`maia_consciousness`. No existing MAIA database was read, mutated, or connected to.

**Applied by the repository's own runner** — `scripts/apply-migrations.sh` over a `MIG_DIR`
containing only the dependency chain, so the target table was built by its real migrations rather
than hand-rewritten:

```text
20260103000001_members.sql                             applied
20260721000003_press_manuscript_room.sql               applied   (member_manuscripts)
20260904000001_developmental_readings.sql              applied
20260904000002_developmental_reading_contract_v2.sql   applied
20260906000001_developmental_observation_standing.sql  applied
20260908000001_developmental_reading_f7_eligibility.sql  APPLIED, ledgered in schema_migrations
```

⚠️ **The minimum chain was derived from real dependency errors, not guessed.** The first run failed
on `relation "members" does not exist`; that migration was added and the chain completed. Nothing
was stubbed except what the runner itself demanded.

⚠️ **The runner exits 3 on a global post-migration invariant** — `episode_links must be a VIEW` —
which belongs to a migration deliberately outside this minimal chain. That is an artifact of running
six migrations instead of 476, **not a failure of this migration**, which committed and was
ledgered before the invariant check ran. Stated rather than hidden, because an exit code that is not
zero should never be reported as if it were.

#### Structure after the migration

```text
f7_eligibility            jsonb   nullable=YES
reading_contract_version  text    nullable=YES
triggers  developmental_readings_f7_eligibility        (new)
          developmental_readings_observations          (unchanged)
          developmental_readings_immutable_check       (unchanged)
          developmental_readings_no_orphan_delete_check (unchanged)
constraint developmental_readings_f7_eligibility_shape (new)
```

#### Behaviour, on synthetic rows only — **10 PASS · 0 FAIL**

```text
T1   legacy row: no record, no version               ACCEPTED
T2   complete record + contract v2                   ACCEPTED
T3   record present but an observation has no verdict  REFUSED
T4   verdict outside the three states                REFUSED
T5   verdict naming a non-observation                REFUSED
T6   record missing ruleVersion                      REFUSED by the CHECK
T10  UPDATE of a frozen row                          REFUSED — a verdict cannot be revised
```

**The observation contract was NOT replaced or weakened** — the specific risk of adding a trigger
beside an existing one:

```text
T7   v2 observation with phenomenon ABSENT           ACCEPTED   (v2 relaxation intact)
T8   phenomenon explicitly null                      REFUSED    (v2 rule intact)
T9   unknown key inside an observation               REFUSED    (closed key set intact)
```

⚠️ **Version difference, recorded as a limit.** The shadow ran PostgreSQL **14.19**; production runs
a different major version. Nothing in this migration uses version-specific syntax, but this is
evidence from 14.19 and is not a claim about production's engine.

⚠️ **My first verification harness reported 7 false failures.** It read psql's last output line,
which is `CONTEXT:`/`DETAIL:`, not `ERROR:` — every refusal had in fact fired correctly from the
expected trigger. The harness was repaired; the migration was not. Recorded because a green run
after a red one is worth knowing the cause of.

#### Teardown

```text
both clusters stopped     the successful run, and an earlier failed attempt
postgres processes        0 remaining
directories               /tmp/sel0sh.WjCv and /tmp/sel0sh.ksmD REMAIN (~51 MB)
```

⚠️ **Teardown is incomplete and is reported rather than claimed.** The session harness refuses
`rm -rf`, so the two stopped cluster directories were left in place. They are inert — no server, no
listener, synthetic data only — but they are not gone, and `complete teardown` would be a false
statement.

---

## 7 · Lock

**This lock is SEPARATE from the selector-core lock at `15bb7f0b8`,** as instructed.

⚠️ **The selector core was AMENDED to conform to the D5 ruling** — `standings` was removed from its
input type and from the assembled prompt, and its gates moved to the boundary seam. So the
`15bb7f0b8` lock describes an implementation that no longer exists in that form. It is preserved as
history, not as a current claim; **this lock supersedes it for the selector's cognition surface.**

```text
STATUS                RUNTIME LOCKED — NOT MEASURED
                      the Studio SURFACE is not part of this lock (§9)
implementation        the commit carrying this file
selector version      ws2-sel0-selector-01
provider              anthropic
model                 MAIA_SELECT_MODEL || MAIA_ASK_MODEL || claude-opus-5
prompt hash           developmentalSelectorPromptHash() — sha256 of the standing prompt
confidence floor      0.50   below this the outcome is DECLINE_TO_SELECT
tie-break             candidates absent from or duplicated in the model ordering are
                      appended in ascending numeric-aware key order (o2 before o10)
F-7 rule              E1 §3.2 · WS2-ENCOUNTER-01_E1_NOTICING_VOCABULARY_2026-09-08
migration             20260908000001_developmental_reading_f7_eligibility.sql
                      shadow-validated on PostgreSQL 14.19 · 10/10 · UNAPPLIED in production
```

⚠️ **Determinism is claimed only where it holds.** `StructuredRequest` exposes no temperature and no
seed, so run-to-run identity of the *model's* answer is not claimed. What is deterministic is
everything this implementation controls: gate order, candidate set, and the completion of a partial
ordering.

---

## 9 · ⛔ The Studio surface is blocked by the design-canon gate

The commission gesture for the Develop room is implemented — a single door the writer opens, one
observation offered, a `what else?` that advances, and copy that never volunteers what the writer
dismissed. It is **held out of this commit**, because:

```text
scripts/check-design-canon.ts   app/writers-studio/develop/DevelopRoom.tsx is a
                                member-facing surface with no Experience Contract
required for change_class: experiential
                                screenshot_desktop  — must EXIST ON DISK
                                screenshot_mobile   — must EXIST ON DISK
                                experience_verification — an account of a real walk
```

⛔ **Three ways past this gate were available and all three are refused.** Declaring the change
`structural` would be false — it adds a member-facing gesture and copy. Writing an
`experience_verification` paragraph for a walk nobody took would be fabricated evidence of exactly
the kind this programme's whole method exists to prevent. Pointing at screenshot paths that do not
exist fails the gate anyway, and pointing at unrelated ones would be worse than failing.

⭐ **The gate is right and is not the obstacle to route around.** A member-facing surface without a
contract cannot say which room it belongs to or what human activity it serves, and this surface
introduces the first place in the Studio where MAIA chooses what to raise — precisely the kind of
change that should not ship on an engineer's say-so.

**What is owed**: an Experience Contract for the Develop room (nearest sibling:
`docs/design/contracts/structure-review.md`), a founder walk of the commission gesture against a
real reading, and the two screenshots. That is a founder act, not an implementation step.

⚠️ **Until then the capability is API-reachable and writer-unreachable.** It would be easy to
report this lane as complete because every test is green; it is not complete, and the gap between
"the route works" and "a writer can use it" is the whole subject of the Productization obligation.

---

## 8 · Standing

```text
BOUNDARY SEAM         IMPLEMENTED · D5 amendment satisfied, both sides proved
D5 ENFORCEMENT        REVISED · permits the seam, confines everything else
F-7 PERSISTENCE       IMPLEMENTED for new readings · migration UNAPPLIED
ROUTE WIRING          IMPLEMENTED · the real ask path
STUDIO RUNTIME        LOCKED — NOT MEASURED (API path)
STUDIO SURFACE        WRITTEN · NOT COMMITTED · blocked on an Experience Contract
PRODUCT GAP           NARROWED, NOT CLOSED — no writer-facing entry point yet
F-7 ADJUDICATOR       ABSENT — later repair phase, not opened
                      until it exists, every commission returns NO_LAWFUL_CANDIDATE
MIGRATION SHADOW RUN  PASS — native PostgreSQL 14.19, disposable cluster, 10/10
MIGRATION IN PRODUCTION  UNAPPLIED — must be applied before this code runs anywhere
MANIFEST B            NOT OPENED
FOUNDER RANKING       NOT STARTED
SEL-0 RUN             NOT PERFORMED
FOUNDER BLIND         INTACT
PRODUCTION WRITES     NONE
MERGE / DEPLOY        NOT AUTHORIZED · none performed
```
