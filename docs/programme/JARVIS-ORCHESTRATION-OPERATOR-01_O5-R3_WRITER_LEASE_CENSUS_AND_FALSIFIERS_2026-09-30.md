# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Writer Lease Census + Falsifier Suite

**Date:** 2026-09-30
**Base:** `2df99c9e` (O5-R3 grant-settlement census) · frozen O5-R1 @ `af2f0203` · **FREEZE INTACT**
**Standing:** ⭐ O5-R3 OPENED · census ✅ · founder rulings R3-R1…R11 taken (§7) · **BUILD GATE PASSED (§8)** ·
⭐ suite **FROZEN @ `3dc118ae`** (28 falsifiers · 37 candidates, LETHAL + DISCRIMINATING) · implementation authorized, ⛔ not started ·
⛔ not admitted · ⛔ not merged · production untouched

> §1–§6 below are the census and the pre-gate suite **as first recorded**. Where the rulings in §7 changed
> them, the text is marked, not rewritten.

## 1. Founder ruling (recorded)

> **A delegation home has exactly one active writer process. Multi-writer operation is unsupported and
> must be refused structurally. The per-append lock guarantees exclusive mutation of an individual append;
> it does not establish single-writer ownership. Desktop, recovery-write, and census-write processes must
> acquire a process-lifetime writer lease before writing any grant ledger. Read-only census operation does
> not require the lease.**

| Mechanism | Protects |
|---|---|
| Writer lease | who may write at all |
| Per-append lock | atomicity / exclusion during one mutation |
| Owner stamp | identifies the writer, supports reconciliation |
| Ledger state machine | valid grant transitions |

**Consequence (ruled):** census §3.1 (`CLAIMED` + W4) stops being a concurrency lane in the supported
system. A second writer fails at lease acquisition, before it can produce that state. The state is
evidence that the lease failed, not a normal race the ledger must survive.

**Carried scope (from the prior proposal):**
1. tail-tolerant grant-ledger reader;
2. owner-stamped lock, now carried by the lease (§4.7);
3. honest reason for CLAIMED on ROUTED, as a relabel only;
4. the four ignored returns surfaced.

**Fault model (ruled): process crash, not power loss.** fsync is deferred and named.

**Out of scope:** grant retirement (lean: recovery flags it, an operator retires it by a ledger entry,
never by deletion); the PR.

**Stale leases (ruled):** a pid alone is not identity. The owner record carries `pid ·
process_start_time · host · acquired_at · owner_nonce`, and takeover needs *owner stamp + proof of
abandonment + safe acquisition*.

## 2. Lease census (read-only)

### 2.1 Who writes grant ledgers, and where enforcement has to live

- **Canonical grant store**
  - Module: `scripts/builder/canonical-provider-execution-grant-store-v1.mjs`.
  - Callers: `work-unit-control.js` (Desktop, via `importBound`), `o5-path-b-recovery.js`, and
    `o5-recovery-census.mjs --write`.
  - Every mutator takes an optional `home` and defaults to `AIN_DELEGATION_HOME` or
    `~/.claude/ain-delegation`. **Any process that imports the module can write**, so a lease that callers
    are merely asked to take is advisory. ⭐ **The lease must be enforced inside the store's mutators**
    (R3-L2); DC-L1 is the caller-discipline version, and it dies.
- ⚠️ **Enforcement arrives through the binding.** Desktop loads the store with `importBound(root, …)` from
  its SHA-bound checkout. A Desktop running an older binding does not enforce the lease. The build gate
  has to state when enforcement actually takes effect, not only when it merges.
- ⚠️ **A second grant ledger exists, with no lock at all.**
  - `scripts/builder/human-provider-execution-grant-store.mjs` writes `<home>/execution-grants/<wu>.jsonl`
    with a bare `appendFileSync`, called from `work-unit-control.js`.
  - The ruling says "**any** grant ledger". **Question for the founder:** does R3 bring this store under
    the lease, or name it for its own act? (§6 Q2)

### 2.2 The ruling says "home"; the mechanism covers grant ledgers

Other processes write the same home:

- `scripts/builder/work-unit.mjs` and `work-unit-create.mjs` (W0 envelopes);
- `session.mjs` and `rate.mjs`;
- `ain-delegate.sh` and `ain-worktree-claim.sh`;
- `jarvis-runtime-store.mjs` (Path A run records);
- the recovery writer itself, which appends W4 and dispositions.

A lease held by grant-ledger writers makes **the grant ledgers** single-writer. It does not make **the
home** single-writer. The ruling's first sentence ("exactly one active writer process" for the home) and
its operative sentence ("before writing any grant ledger") differ in scope. ⛔ Not resolved here (§6 Q1).

### 2.3 Why Electron's single-instance lock is not this lease

`app.requestSingleInstanceLock()` (`main.js:250`) is scoped to Desktop's userData directory, not to the
delegation home. It does not stop:

- two Desktop builds with different userData (dev and packaged) pointing at one home;
- a Desktop and a CLI writer on the same home.

A per-home lease is the right scope.

### 2.4 ⭐ Process start time: the build can get this wrong in the unsafe direction

- A process knows its own start time (`performance.timeOrigin`, Node 22). Reading **another** pid's start
  time needs a platform probe: `ps -o lstart= -p <pid>` on macOS (one-second resolution), or
  `/proc/<pid>/stat` on Linux.
- ⚠️ **The recorded start time and the probed start time must come from the same probe.** Suppose the
  owner stamps `timeOrigin` (milliseconds) and the reconciler compares it against `ps` (seconds). A **live**
  holder then reads as `DEAD_PID_REUSED`, which is an **unsafe takeover**. The owner must stamp its own
  start time *through the probe the reconciler will use*.
- A probe that fails yields UNDETERMINABLE, and the acquisition is refused (R3-L4 f).

### 2.5 ⭐ Compare-and-swap is not a single POSIX call

- The model world's `swap` is atomic by fiat. On a real filesystem, `rename` replaces **unconditionally**,
  so "verify the bytes, then rename" has the same window that kills DC-L6.
- A real takeover needs an exclusive **takeover gate**: for example, `O_EXCL` on `writer.lease.takeover`,
  then re-read and re-prove, then rename, then remove the gate.
- ⛔ The design is not chosen here. **The build owes a real two-process witness for R3-L6 and R3-L7**,
  because the model shows the laws are satisfiable, not that any OS mechanism satisfies them.

### 2.6 Precedent, and a deliberate departure from it

`session.mjs` liveness treats PID death and lease freshness as separate signals and extends a lease only on
an authenticated heartbeat. The writer lease deliberately has **no heartbeat and no TTL**:

- **age is not proof** (DC-L3b dies);
- a holder that can't be proven dead stays the holder until an operator acts.

That operator act, for `LEASE_RECORD_UNREADABLE` and `LEASE_OWNER_UNDETERMINABLE`, is named and not
designed. It is the same class of act as grant retirement.

## 3. The falsifier suite — `tests/constitutional/jarvis-o5-r3/`

`npm run matrix:jarvis-o5-r3` exits 0: **MATRIX LETHAL + DISCRIMINATING · CLASS A AS PREDICTED.**

- The reference double passes all **21** falsifiers.
- **25/25** defeat candidates die on their named falsifier, and every falsifier has a proven kill.
- `buildLease({})` is proven equal to the reference, so each candidate replaces exactly one decision.

⚠️ Naming: the founder's **"F5 — second writer cannot acquire the home" is R3-L1**, because `F5` already
names the frozen O5-R1 evidence-escalation falsifier.

### 3.1 Writer lease (R3-L1…L9)

| Falsifier | Law | Killed candidate(s) |
|---|---|---|
| **R3-L1** (F5) | A holds; B's acquisition is refused `HOME_LEASE_HELD`; A remains owner; B cannot write with no lease, a forged lease, or **A's own lease object**; the ledger is unchanged by B | DC-L0a last-writer-wins · DC-L0b bearer nonce |
| R3-L2 | no mutation without the lease (`WRITER_LEASE_NOT_HELD`), enforced by the store | DC-L1 acquisition skipped |
| R3-L3 | the lease is process-lifetime: after each append, a second acquirer is still refused | DC-L2 released after one append |
| R3-L4 | abandonment needs proof. Takeover is licensed by: (a) dead → yes · (c) reused pid (start time differs) → yes. It is refused for: (b) alive **however old the lease** · (d) another host · (e) unreadable record, **preserved, not overwritten** · (f) probe undeterminable. (g) The same process asking again gets `HELD_BY_THIS_PROCESS` and never a second lease | DC-L3a local pid probe for a remote holder · DC-L3b age as death · DC-L3c unreadable treated as abandoned · DC-L3d pid without start time |
| R3-L5 | release checks writer identity; a superseded lease cannot release its successor | DC-L4 |
| R3-L6 | concurrent acquisition gives exactly one owner, and the durable owner is the reported winner | DC-L5 check-then-create |
| R3-L7 | concurrent takeover of one dead lease gives exactly one owner | DC-L6 overwrite after proof |
| R3-L8 | **fencing**: only the *current durable* lease writes. A released-and-reacquired lease object, or one superseded out of band, is refused | DC-L7 in-memory held flag |
| R3-L9 | a read-only census reads while Desktop holds the lease, and changes nothing | DC-L8 read requires the lease |

The founder's four named mutants map to DC-L1, DC-L2, DC-L3a–d and DC-L4. DC-L0a/b and DC-L5–L8 are added.

### 3.2 Ledger tail (R3-T1…T6), scope item 1

**The newline is the commit marker.**

| Falsifier | Law | Killed |
|---|---|---|
| R3-T1 | an unterminated final line is uncommitted: skipped and recorded, not fatal | DC-T0 **the current strict reader** |
| R3-T2 | a committed corrupt line still fails loudly, on read **and** on append, and append leaves it untouched | DC-T1 tolerance generalised to mid-file |
| R3-T3 | commitment is the newline, never parse success | DC-T2 |
| R3-T4 | record + newline are **one** write | DC-T3 two writes |
| R3-T5 | an append after a torn tail never manufactures a committed corrupt line | DC-T4 concatenate onto the fragment |
| R3-T6 | uncommitted bytes are never silently discarded (quarantined), and a clean ledger is never truncated | DC-T5 silent truncation |

⭐ **Item 1 as scoped was incomplete, and the matrix is what showed it.** A tolerant reader alone lets the
*next* append concatenate onto the torn fragment. That turns it into a **committed** corrupt line, and the
unit bricks one append later (DC-T4). So the writer must quarantine and truncate the uncommitted bytes
**before** appending, which is safe only under the lease. That touches an append-only file (§6 Q3).

### 3.3 Reason code (R3-C1…C3), scope item 3

| Falsifier | Law | Killed |
|---|---|---|
| R3-C1 | CLAIMED ∧ ROUTED ∧ no witness is labelled `CLAIMED_NEVER_DISPATCHED` | DC-C1 **the current classifier** |
| R3-C2 | **relabel only**: still `GATED · NEEDS_OPERATOR_AUTHORITY`, no act of any kind | DC-C2 relabel-and-retire |
| R3-C3 | the proof holds **only while ROUTED**. EXECUTING stays `DISPATCHED_WITHOUT_WITNESS_NO_PROBE`, past-EXECUTING and ROUTED-with-witness are never "never dispatched" | DC-C3 lifecycle ignored |

The census `STOP_CATEGORY` mapping for the new reason is owed at build. CENSUS-8 already makes an unmapped
reason inadmissible, so it cannot be forgotten.

### 3.4 Settlement surfacing (R3-S1…S3), scope item 4

| Falsifier | Law | Killed |
|---|---|---|
| R3-S1 | a refused consume is reported as unsettled with its reason | DC-S1 ignored (today's B7) |
| R3-S2 | surfacing never changes what is recorded: the witnessed W4 is appended exactly once either way | DC-S2 suppress W4 on refusal |
| R3-S3 | a refused invalidation is reported, never assumed recorded | DC-S3 ignored (today's B1/B2/B5) |

### 3.5 Class A: what the canonical code fails today

| Falsifier | Canonical result | Predicted |
|---|---|---|
| R3-T1 | RED (the real `readCanonicalGrantEventsV1` throws on a torn tail) | RED ✅ |
| R3-T3 | RED (it commits a parseable unterminated line) | RED ✅ |
| R3-C1 | RED (the real classifier says `W2_NOT_EXECUTING`) | RED ✅ |
| R3-C2, R3-C3 | PASS | PASS ✅ |

Not Class A:

- **the lease**: none exists, and its absence is the finding;
- **settlement surfacing**: the ignored returns are inside `canonicalConfirmAuthorizedExecution`, so
  DC-S1 and DC-S3 model that shape;
- **tail append laws**: the append function isn't exported.

### 3.6 Classified collateral (irreducible)

| Candidate | Also dies on | Why it can't be narrowed |
|---|---|---|
| DC-L0a (no exclusion) | L3, L4, L6, L7 | a lease with no exclusion *is* the multi-writer home, so every boundary that asks "can a second process take this home?" refuses it. Its S3 analogue is DC-2 |
| DC-L1 (no guard) | L1, L8 | the refused writer's writes land |
| DC-L2 (release after append) | L5 | the owner's own second write is refused |
| DC-T0 (current reader) | T3 | with no commit marker, a parseable unterminated line is committed by construction |
| DC-T4 (concatenate) | T6 | concatenating onto the fragment is exactly not quarantining it |

⭐ **The first matrix run was DEFECT(4), and every defect was in the instrument:**

- R3-L1 had no named killer, so DC-L0a/b were added;
- DC-L2's L5 death was unclassified;
- DC-T0 declared stale collateral;
- DC-T1 was too broad. It was rebuilt as "tolerance generalised to mid-file", and it now dies on T2 alone.

⛔ No falsifier was weakened. One falsifier helper was tightened instead: a "fails loudly" assertion now
counts only a `CORRUPT` refusal, so an incidental `TypeError` cannot pass it vacuously.

## 4. What the build gate must carry

1. **Freeze** the R3 suite before implementation (the blob-hash guard pattern of `verify-jarvis-o5-r1-freeze.mjs`).
2. The lease is **enforced in the store mutators**; Desktop, the recovery writer and `census --write`
   acquire it; the read-only census does not.
3. The owner stamps its start time **through the reconciler's own probe** (§2.4).
4. A **real two-process witness** for R3-L6 and R3-L7 on the Mac Studio's filesystem (§2.5).
5. The census `STOP_CATEGORY` entry for `CLAIMED_NEVER_DISPATCHED`.
6. The `census --write` refusal while Desktop holds the lease, which turns "run it with Desktop closed" into
   a structural refusal.
7. ~~⭐ **Proposed, ⛔ not ruled: scope item 2 largely collapses into the lease.**~~ ⛔ **WITHDRAWN by R3-R10 (§7).**
   The argument below holds only once every grant writer is lease-aware. Until then, an older pinned
   Desktop may be a lease-unaware writer, so an append lock found under a held lease is *not* provably
   residue. The proposal is now defeat candidate DC-L11, and it dies on R3-L10.
   - Under a held lease, an existing append lockfile cannot belong to a live writer. The only other writer
     would be this process, and its locked sections are synchronous.
   - So a lockfile found at acquisition is **provably residue** of a dead prior holder, and it can be
     cleared and recorded then.
   - An owner stamp on the append lock would add identification only.

## 5. Not done, and not claimed

- ⛔ No lease, reader, classifier or confirm-path code changed.
- ⛔ The races are **modelled** (`tick()` between read and write); OS atomicity is **not proved** (§2.5).
- ⛔ fsync is deferred under the ruled process-crash fault model, so power loss remains unexamined.
- ⛔ Grant retirement, the lease-reconciliation operator act and the PR are out of scope.

## 6. Questions for the founder (answered in §7)

- **Q1 (scope).** Does the lease cover **the home** or **the grant ledgers**?
  - Home-wide brings W0/W4, session, run-record and delegate-script writers under it. That is a much
    larger act.
  - Grant-ledger scope matches the operative sentence and this suite.
  - **Recommend grant ledgers for R3**, with the ruling's first sentence narrowed to match. Home-wide
    single-writer would be a later act.
- **Q2.** Is the lock-free **human-provider** grant ledger brought under the lease in R3, or named for
  its own act? **Recommend in R3.** It is a grant ledger in the same home with less protection than the one
  R3 is hardening.
- **Q3.** Truncating **never-committed** bytes, after quarantining them, from an append-only ledger: is that
  lawful? R3-T5 and R3-T6 assume yes, since no committed history is rewritten.

**Standing: O5-R3 OPENED · LEASE CENSUS ✅ · SUITE 21 falsifiers / 25 candidates, LETHAL + DISCRIMINATING
· CLASS A 3 RED AS PREDICTED · ⛔ NOT FROZEN · ⛔ NO IMPLEMENTATION · O5-R1 FREEZE INTACT · O5-R2
MATRIX UNCHANGED · PRODUCTION UNTOUCHED.**

---

## 7. Founder rulings R3-R1…R11 (2026-09-30)

Answers to §6: **Q1 grant ledgers only · Q2 human-provider in · Q3 lawful, with an exact definition.**

| Ruling | Substance |
|---|---|
| **R3-R1** scope | Single-writer authority for the **grant authority domain**: every store whose writes create, mutate, revoke, route, claim or record execution-grant authority. ⛔ Not Work Unit, session, Path A run or general recovery records, and not the home. *One proven writer may mutate the grant authority domain at a time*, not *one process may write anything beneath the home*. Whole-home single-writer would be a later governed act. |
| **R3-R2** human-provider | `human-provider-execution-grant-store.mjs` is inside the boundary. Every mutating entry point requires the same writer authority. There is no second, weaker grant-writing path. |
| **R3-R3** enforcement | Inside the grant-store mutation functions. Caller discipline is insufficient: a caller holding a lease that then calls an unguarded store is not conforming. |
| **R3-R4** reads | Lease-free. Requiring the lease to inspect a ledger is a defeat candidate. |
| **R3-R5** terminal fragment | Lawful removal, and only when all ten conditions hold: (1) lease held; (2) last committed boundary proven; (3) only the suffix after it touched; (4) exact bytes quarantined first, separately; (5) the record names ledger · byte offset · exact or lossless bytes · reason · lease identity · time; (6) quarantine durable before truncation; (7) quarantine failure ⇒ no truncation; (8) truncate only to the proven offset; (9) repaired ledger durable before the next append; (10) no committed record changed. *Recovery may remove bytes that never became a ledger record. It may not rewrite ledger history.* |
| **R3-R6** no semantic repair | Never guess, reconstruct, complete or merge a fragment. Corruption anywhere but the terminal uncommitted suffix is a STOP under R3, and a different failure class. |
| **R3-R7** identity | host · pid · process incarnation (start time) · unforgeable lease token. The owner and the reconciler use the same probe and unit. A local probe is never evidence about another host. *Unknown is not dead; unreadable is not stale; age is not death.* |
| **R3-R8** takeover | Never `check → decide stale → rename/overwrite` without an exclusive takeover gate, because POSIX rename is not compare-and-swap. The single-process race falsifiers are necessary but not sufficient. A **real two-process race witness on the Mac Studio** is an admission requirement. |
| **R3-R9** release | Only if the authoritative record still names that exact lease incarnation. A fenced-out former owner cannot delete its successor. |
| **R3-R10** legacy append lock | ⭐ **Kept.** Under a held lease an append lock is *not* abandoned by that fact alone, because an older pinned Desktop may be a lease-unaware writer that honours only the append lock. Retirement is a later, evidenced act, taken once no lease-unaware grant writer can coexist. |
| **R3-R11** runtime binding | Merging R3 does not establish enforcement. Admission witnesses the **exact checkout SHA** the participating Desktop/JARVIS process runs. |

## 8. Build gate

### 8.1 Laws added before freeze

| New law | Guards | Killed candidate(s), with the recorded reason |
|---|---|---|
| **R3-D1** every grant ledger, human-provider included, refuses lease-less and stolen-lease mutation; the holder writes | R3-R2 / R3-R3 | DC-D1 canonical-only guard: "`home/execution-grants/…`: a non-holder mutated it" |
| **R3-D2** Work Unit, session, Path A run and recovery writes are not serialized behind the lease | R3-R1 | DC-D2 whole-home lease: "a non-grant home write was serialized behind the grant lease" |
| **R3-L10** mixed version. (a) While a legacy writer holds the append lock, the holder is refused `GRANT_LEDGER_BUSY`; the lock and ledger are untouched. (b) Every holder append happens under the append lock, and the holder releases only its own. (c) Acquiring the lease never clears an append lock | R3-R10 | DC-L9 lease subsumes the lock · DC-L10 holder clears "stale" lock at append · **DC-L11 the withdrawn §4.7 proposal**: "lease acquisition treated a legacy append lock as residue" |
| **R3-T7** quarantine strictly before truncate; a quarantine failure surfaces, and nothing is truncated or appended | R3-R5 (4, 6, 7) | DC-T6 truncate-first · DC-T7 swallowed failure |
| **R3-T8** the quarantine record carries ledger · **byte** offset · exact bytes · reason · lease incarnation · time | R3-R5 (5) | DC-T8a bare bytes · **DC-T8b character offset**: "offset 45, expected the byte boundary 46". The fixture's committed prefix contains `é`, so R3-R7's unit hazard is tested in the ledger too |
| **R3-T9** tail recovery without the lease quarantines, truncates and writes nothing | R3-R5 (1) | DC-T9 |
| **R3-T10** a *completable* fragment is never completed or merged, and is preserved verbatim | R3-R6 | DC-T10 JSON completion |
| **R3-T2 extended** committed corruption, including corruption **plus** a torn tail, stops the append with zero operations | R3-R6 | DC-T11 repair-anywhere (cut back to the first bad line) |
| **R3-T5 tightened** the committed prefix is preserved byte for byte | admission list | DC-T4, plus DC-T8b as collateral |

### 8.2 Instrument repairs made at the gate (⛔ no law weakened)

- **Known-bad candidates are now pinned as code.** Previously DC-T0 imported the live grant-ledger reader and
  DC-C1 *was* the live classifier. Both would have **started passing the moment R3 was implemented**, which is a
  matrix defect disguised as progress. DC-T0 is now a pinned snapshot of today's strict reader. DC-C1 forces
  today's label back onto the live classifier's output. The live code appears only in the Class A adapters,
  which the unfrozen matrix runs.
- **The matrix prints why each candidate died:** the first failure message of its named falsifier. All 37
  were read. Each dies for the reason its law names; none dies on an incidental error.
- The tail laws moved to `tail-falsifiers.mjs` and `tail-reference-candidates.mjs`. The contract gained `ctx`
  (ledger · lease · holdsLease · now) and byte offsets.

### 8.3 Result

`npm run matrix:jarvis-o5-r3` exits 0: **MATRIX LETHAL + DISCRIMINATING · CLASS A AS PREDICTED.**

- **28 falsifiers:** R3-L1…L10 · R3-D1…D2 · R3-T1…T10 · R3-C1…C3 · R3-S1…S3.
- **37/37 candidates** die on their named falsifier, with 20 collateral deaths, all classified irreducible.
- `buildLease({})` is proven equal to the reference.
- **Class A** is unchanged: the canonical reader is RED on T1 and T3, and the classifier is RED on C1.

Neighbouring gates: O5-R1 freeze intact, and the O5-R2 matrix is still LETHAL + DISCRIMINATING.

### 8.4 Freeze

`tests/constitutional/jarvis-o5-r3/FREEZE.json` pins eight files by git **blob hash**: the world, the lease
reference, the lease falsifiers and candidates, the tail falsifiers and reference/candidates, and the reason and
settlement falsifiers and reference/candidates. `freeze_commit` is `3dc118ae`.

`npm run verify:jarvis-o5-r3-freeze` is proven lethal both ways: intact exits 0; a one-line append to a frozen
file exits 1 and names the file; restoring it exits 0.

⚠️ **The unfrozen matrix has a known, lawful change ahead.** When the implementation lands, its Class A
predictions must flip to PASS, in the open. That flip is part of the implementation's evidence. The matrix may
also gain integration checks against the real stores. It may never weaken lethality or classification.

### 8.5 Findings the gate surfaced (for implementation, ⛔ not new rulings)

1. ⚠️ **The legacy human-provider writer takes no lock at all.** R3-R10's append-lock compatibility therefore
   protects only the canonical ledger. For the human-provider ledger, a lease-unaware writer on an older binding
   is invisible to every lock, so mixed-version safety there rests **entirely** on R3-R11 (witnessing that no
   lease-unaware binding is running). The implementation should also add the append lock to the human-provider
   store, so the next version transition is protected the way the canonical ledger is today.
2. ⚠️ **Quarantine must hold raw bytes losslessly** (for example base64). A torn write can split a multi-byte
   UTF-8 sequence. The model's string io cannot represent that, which is a named limit of the frozen suite, so
   the build's integration check owns it.
3. ⚠️ **"Durably" under the ruled fault model.** R3-R5 (6) and (9) say durable. Under the ruled fault model
   (process crash, fsync deferred), a write is durable once its call returns, and the suite reads it that way.
   If "durably" was meant to require fsync for the quarantine-then-truncate pair, which is the one place a power
   loss could lose the evidence *and* the bytes, that is a narrow exception to the fsync deferral and needs a
   ruling before the build writes it.

## 9. Admission evidence owed (verbatim from the ruling, ⛔ none yet produced)

Real two-process acquisition contention · real stale-owner takeover · live-owner non-takeover · PID-reuse /
incarnation discrimination · release-after-fencing rejection · torn-terminal quarantine + truncation + next
append · exact preservation of all committed pre-fragment bytes · human-provider grant writes refusing mutation
without lease authority · runtime proof that Desktop runs the lease-aware pinned checkout.

**Implementation order (ruled):** lease substrate → store-enforced mutation authority → human-provider store →
terminal-tail recovery → reason-code correction → ignored-return surfacing → integration verification.

**Standing: RULINGS R3-R1…R11 RECORDED · BUILD GATE ✅ · SUITE FROZEN @ `3dc118ae` (28 / 37, LETHAL +
DISCRIMINATING, guard proven both ways) · IMPLEMENTATION AUTHORIZED, ⛔ NOT STARTED · ⛔ NOT ADMITTED · ⛔ NOT
MERGED · PRODUCTION UNTOUCHED.**
