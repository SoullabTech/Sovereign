# BW-02 — WORK AUTHORITY RECONCILIATION CENSUS

**Founder-authorized 2026-09-13.** Read-only. ⛔ **ZERO code changes.** No migrations, no repair.
**Corpus**: the 33 raw-`memberId` Work-scoped exports in the BW-F5 baseline.
**Read against**: `BW-LAW-1` / `AUTH-01` — *authorization precedes materialization.*

---

## 1. The distribution

| Class | Meaning | Count |
|---|---|---|
| **A** | identifier transport only — no authority implication | **1** |
| **B** | separate ownership predicate, then a scoped or locked action | **12** |
| **C** | authorization embedded in content retrieval | **20** |
| **D** | raw identifier functions as authority | ⭐ **0** |
| **E** | unclear — runtime evidence required | **0** |

**33 accounted for. Nothing unresolved.**

⭐ **Class D is empty.** Every one of the 33 either transports identifiers to a scoped callee, is
itself an ownership predicate, or carries ownership in the retrieval predicate. ⛔ **No raw
identifier in this corpus confers authority by itself.** The organism's discipline is real, and the
census should say so plainly rather than manufacture alarm.

**This is the first of the founder's two worlds** — closer to `A 21 · B 6 · C 4 · D 2` than to the
larger programme. ⛔ **With one correction that changes what the distribution means** (§3).

---

## 2. The classification

### Class A — identifier transport only (1)

| Symbol | Path | Why |
|---|---|---|
| `measureNow` | `ask/frozenReading.ts` | Holds no authority decision; passes both identifiers straight to `loadSectionHeads`, which is scoped |

### Class B — separate ownership predicate (12)

Ownership is established as **its own fact**, before and apart from the action.

| Symbol | Path | Predicate |
|---|---|---|
| `memberOwnsWork` | `ask/frozenReading.ts` | **is** the predicate — `SELECT 1 … id = $1 AND member_id = $2` |
| `readingIsAddressable` | `standing/store.ts` | `SELECT 1 AS one FROM developmental_readings … id AND member_id AND manuscript_id` |
| `captureEvidence`, `loadLiveWork` | `development/capture.ts` | via `readDraft` — *"Ownership is in the predicate. A draft that is someone else's is indistinguishable here from one that does not exist."* |
| `createProposal`, `listProposals` | `structure/proposalStore.ts` | `owns()` → `refuse('not_found')` |
| `loadStructure`, `createUnit`, `moveUnit`, `deleteUnit`, `placeSections` | `structure/structureService.ts` | `lockManuscript()` — `SELECT 1 … member_id = $2 **FOR UPDATE**` |
| `authorStructureFromProposal` | `structure/authorStructure.ts` | `SELECT 1 FROM member_manuscripts … FOR UPDATE` |

⭐ **`lockManuscript` deserves naming.** It is a separate predicate **under a row lock**, which
closes the read-then-write race that the I0.5 candidate `093379e8d` could not survive. `moveUnit`
and `deleteUnit` then mutate on `unitId` alone — a shape that *looks* like the precheck defect and
is not, because the lock is held for the transaction and `deleteUnit` additionally re-checks
`id = $1 AND manuscript_id = $2`. **Examined rather than presumed, exactly as ruled.**

### Class C — authorization embedded in content retrieval (20)

The BW-01 shape: **the query that returns the data is the only thing that establishes the right to it.**

`loadFrozenReading` · `loadFrozenDevelopmentalReading` · `loadSectionHeads` · `openThread` ·
`threadsOnAnchor` · `resolveDevelopPreparation` · `listReadings` · `convertDraftToSections` ·
`normalizeLegacyScaffoldForDraft` · `saveSection` · `resolveDraftWriteState` ·
`loadEditableSections` · `claimArrival` · `verifyCustody` · `eraseManuscript` · `currentStanding` ·
`currentStandings` · `recordStanding` · `renameUnit` · `resolveSituatedWork`

Every one carries `AND member_id = $N` in its predicate. **All 20 are, as written, correct.**

---

## 3. ⭐ The finding that changes what the distribution means

A benign-looking distribution would ordinarily argue *local remedy, not programme*. **BW-01R
refutes the inference**, and the evidence is one file away from this corpus:

> `assembleFocus` — the Work reader at the focus crossing — is Class C, and its predicate has been
> **wrong since it was written**. It joins `manuscripts m … m.user_id`, a table and column that do
> not exist. It throws, the throw is caught, and it returns `null`.
> **The focus crossing has never read a Work, and nothing reported that.**

Therefore:

> ⭐⭐ **Class C is not safe-by-construction. It is safe-only-if-the-predicate-is-right — and its
> failure mode is SILENCE.**

A Class C function with a broken predicate does not refuse; it returns nothing, which is
indistinguishable from *there is nothing*. A Class B function with a broken predicate refuses
loudly, because refusing is the only thing it does.

**That is the real argument against Class C, and it is an argument about observability rather than
about exploitability.** ⛔ The census is NOT claiming any of the 20 is currently wrong. It is
recording that **the class admits a defect that can persist indefinitely undetected**, and that the
organism has already sustained exactly that defect at its most scrutinised seam.

### 3.1 The two risks, kept distinct

| | Class C risk |
|---|---|
| **Exploitability** | ⛔ **Not demonstrated anywhere in the 33.** Every predicate scopes on `member_id` |
| **Observability** | 🔴 **Demonstrated.** A wrong predicate is silent, and was silent |

Conflating these would either inflate the finding into a security alarm it is not, or dismiss it as
cosmetic when it has already cost a whole feature.

---

## 4. What the census does NOT conclude

- ⛔ **Not** that 20 functions should be migrated. Migration remains unauthorized.
- ⛔ **Not** that Class C is a defect. It is a *shape* whose failures are quiet.
- ⛔ **Not** that Class B is finished. `lockManuscript`, `owns`, `readDraft` and `memberOwnsWork` are
  **four different spellings of one predicate** — evidence for the eventual extraction the founder
  described, and ⛔ still not enough consumers to justify inventing it.
- ⛔ **Not** a runtime claim. Every classification is from source; only `assembleFocus` was executed.

## 5. ⚠️ Instrument fault, recorded

The first automated pass returned **`B 9 · C 17 · E 7`**. Seven were misbinned because the brace
matcher truncated function bodies at braces inside template literals and comments, hiding
`owns()` / `lockManuscript()` calls. All seven were resolved by reading the source. **The corrected
counts are above; the automated counts are wrong and are kept here rather than deleted.** *An
instrument that cannot parse the code it audits will under-report the discipline it is measuring —
this one made the organism look worse than it is.*

## 6. What this decides

> **BW-01 is a local remedy AND the first instance of a larger pattern — but the pattern is about
> silence, not about breach.**

The next question is therefore not *how do we migrate 20 functions* but:

> **How does a Class C function fail loudly?**

⛔ Not answered here. Candidate directions, recorded and **not authorized**: a predicate that refuses
before it retrieves (Class B conversion, one seam at a time, ratcheting the baseline 33 → 32 → 31);
or a schema-shape assertion that makes a query naming a nonexistent relation fail at build rather
than at runtime — which would have caught W7 years earlier and is not a Work-authority change at all.

## 7. Standing

**BW-02 COMPLETE · READ-ONLY · ZERO CODE CHANGES · `A 1 · B 12 · C 20 · D 0 · E 0` · NO MIGRATION
AUTHORIZED · NO EXTRACTION AUTHORIZED · W7 NOT REPAIRED · BASELINE STILL 33.**

> *Class C is safe when it is right, and quiet when it is wrong.*
