# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Writer Lease Census + Falsifier Suite

**Date:** 2026-09-30
**Base:** `2df99c9e` (O5-R3 grant-settlement census) · frozen O5-R1 @ `af2f0203` · **FREEZE INTACT**
**Standing:** ⭐ O5-R3 OPENED (founder ruling) · census ✅ · falsifier suite ✅ **LETHAL + DISCRIMINATING** ·
⛔ **no implementation** · ⛔ suite NOT frozen (freeze is part of the build gate) · ⛔ not merged · production untouched

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
7. ⭐ **Proposed, ⛔ not ruled: scope item 2 largely collapses into the lease.**
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

## 6. Questions for the founder

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
