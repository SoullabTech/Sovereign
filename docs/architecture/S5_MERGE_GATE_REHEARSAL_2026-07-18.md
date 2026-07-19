# S5 Merge-Gate Rehearsal — Proofs A–E — 2026-07-18

**Ruling served**: Kelly's PR #631 review — *"Approve for final review and full deployment,
subject to a narrow merge gate"* — requiring production-shaped proofs A–E before S5 is
considered deploy-ready. All five proofs ran on **a disposable database restored from a
full read-only `pg_dump` of production taken 2026-07-18** (`s5_rehearsal` on the Mac
Studio host postgres; 0 restore errors; 37,841 turns · 142 atoms · 83 members · 76
episodic · 30,697 agent_runs · 2,413 integration_passes). All content-bearing rehearsal
artifacts (dump files, the rehearsal DB) were **destroyed after the rehearsal**.

**Outcome: all proofs PASS — after the rehearsal found and fixed two real defects**
(§6). This is the rehearsal doing exactly what it was for.

---

## 1. Proof A — Migration safety (production-shaped copy)

| Check | Result |
|---|---|
| Content fingerprint (row counts + content-length sums across turns/atoms/episodic/members) before vs after migration | **IDENTICAL** (`c4a58d48…` both sides) — zero member data lost |
| Historical turns → `unknown-historical` | **37,839 / 37,839** |
| Historical atoms → `unknown-historical` + `unattributed-historical` | **142 / 142** |
| `crossing_allowed` values preserved | **yes** (0 true before, 0 true after — nothing revoked, nothing granted) |
| Incident manifest SANC-20260614-01 seeded | 1 manifest, 3 scopes |
| Second run (idempotency) | **SUCCESS**, no duplicate seeds (still 1 manifest / 3 scopes) |
| Rollback script | drops exactly the 3 mint gates; restore-refusal triggers + consent immutability + governance tables **retained** (as documented); re-apply restores all 7 triggers |

## 2. Proof B — Ordinary persistence (real store paths)

`sanctuary-s5-behavioral-proof.ts` against the production-shaped copy: store-minted
exchange persists both turns with `posture_at_creation='normal'` and complete six-key
provenance; recorded posture matches the consent-state record; historical member data
untouched. **14 passed · 0 failed.**

## 3. Proof C — Fail-closed persistence

All refused, each with a loud, distinguishable error:

- no provenance at all → `[PROVENANCE] mint failed … provenance missing or incomplete`
- **malformed** provenance (partial keys — forge attempt) → refused (C2)
- `unknown-historical` mint attempt, turns and atoms → refused (A2, D1)
- `unattributed-historical` generation mint attempt → refused (D2)
- direct SQL insertion without attestation → refused (A1) — the DB gate, no store involved
- the previously-raw conversation-turns route → closed (structural check in R22)
- consent-state UPDATE → refused (E3, immutability trigger)

## 4. Proof D — Governed restore rehearsal (the critical one)

Shape: two attested turns created (A = kept, B = to-be-forgotten) → data-only dump taken
(contains BOTH) → sovereignty deletion of B (manifest + tombstone) → **disaster wipe of
the whole table** → `scripts/restore-governed.sh` with the dump.

| Check | Result |
|---|---|
| Forgotten row B survives restore | **0 rows** — refused during COPY by `s5_refuse_tombstoned` |
| Kept row A survives restore | **1 row** |
| Total restored | 37,840 = 37,841 − 1 forgotten |
| Historical rows replayed intact under the governed lane | 37,839 |
| Governance tables preserved across the restore | yes (manifests + tombstones intact) |
| Refusal evidence (content-free) | `[PROVENANCE] restore refused — reason=tombstone table=conversation_turns id_prefix=225a9cd2-613 manifest=a1aed8e6-… txid=250313 at=2026-07-18 14:08:17` |
| **Ungoverned raw replay of the same dump** | **FAILS LOUDLY** at the first historical row — `mint failed … not writable … outside the governed restore lane` |

App-exposure note (Kelly's item 5): within the script, the sweep completes before the
script reports success; keeping the application down until the script exits is the
operational half, stated in the script's output.

## 5. Proof E — Operational failure visibility

A refused write and a successful write are now distinguishable from logs alone,
content-free in every case:

- ordinary unattested writes: **hard database error** (never silent) — `[PROVENANCE] mint failed …`
- restore-time suppression (the only intentionally silent-continue path):
  `RAISE WARNING` carrying **reason class, table, row-id prefix, manifest id, txid,
  timestamp**
- app-side refusals: `[PROVENANCE] write refused / mint refused` markers (S1 idiom)
- consent-state: absence of a record resolves `null`, never `'normal'`

## 6. Defects the rehearsal found (and fixed, then re-proven)

1. **Empty-search_path restore broke the tombstone trigger.** pg_dump sessions run with
   `search_path=''`; the trigger's unqualified `provenance_tombstones` lookup failed
   mid-COPY. Fixed by schema-qualifying all table references in trigger SQL.
2. **The mint gate refused legitimate historical replay.** A restore replays
   `unknown-historical` rows; the gate could not distinguish replay from minting anew.
   Fixed with the **governed restore lane**: `SET s5.restore_lane = 'governed'`
   (set only by `restore-governed.sh`) admits historical replay; everywhere else the
   refusal stands. Net effect: R20 got *stronger* — ungoverned restores of historical
   dumps now fail structurally, not procedurally.

Both fixes were re-proven: behavioral proof 14/14 (rehearsal copy AND local dev),
refusal harness 96/0/0, typecheck 0.

## 7. Consent-state lifecycle (Kelly's concern 2 — settled)

- **Immutable once minted** — trigger-enforced (`s5_consent_state_immutable`), proven E3.
- **Retries idempotent** — unique `request_id` + `ON CONFLICT DO NOTHING`; first write wins.
- **Concurrency** — each request distinguished by its own UUID request id.
- **Late resolution** — `resolveRecordedPosture(requestId)` serves queued/scheduled work.
- **Retention** — no automatic pruning (content-free audit substrate); GC is an operator act.
- **Backups** — included (content-free, safe to restore).

## 8. What this rehearsal does NOT prove

Production migration execution, production traffic behavior, and the full
schema-replacing restore path (§4 residual) remain for the deploy-time checklist in
`S5_PROVENANCE_IMPLEMENTATION_2026-07-18.md` §4. Per Kelly's ruling, #631 is
**S5 Foundation — Provenance Minting and Restore Governance**, not S5 complete.
