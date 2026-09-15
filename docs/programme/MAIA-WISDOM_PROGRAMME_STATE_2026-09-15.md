# MAIA-WISDOM — Programme State

**As of 2026-09-15.** Records rulings **R10–R15** and the lane split. ⛔ Authorizes nothing.

## Acts

| | State |
|---|---|
| ACT 1 — repository census | ✅ ACCEPTED |
| ACT 1B — completion witness | ✅ ACCEPTED |
| ACT 1C — C/D (elemental semantics · R9 pathways) | ✅ ACCEPTED |
| ACT 1C — A/B | → extracted to `MAIA-WISDOM-WITNESS-01` |
| Discovery — repository | ✅ sufficient |
| Discovery — external corpus · population | ⚠️ witness owed |

## Rulings

**R1–R9** carried. New:

- **R10** — Weather is an active Spiralogic environment at the **relational/field** level. Structural roles need not be symmetrical; Weather may be the environment *of the elemental whole* rather than a peer content category.
- **R11** — **Aether remains distinct from Weather and unadjudicated.** ⛔ No normalization, mapping or merge.
- **R12** — **Deterministic elemental derivation is evidence, not authority.** Reproducibility makes a derivation inspectable, ⛔ never canonical.
- **R13** — **Collective intelligence must admit disconfirming evidence.** Equal *admissibility*, not equal weight.
- **R14** — ⛔ Contribution volume · popularity · status · affinity · reputation **cannot establish epistemic authority.**
- **R15** — ⛔ **Conversation ≠ contribution. Distillation ≠ consent.** Contribution requires an act.

⭐ **R7 amended by R10/R11**, not replaced: the five environments stand as
Fire · Water · Earth · Air · Weather, ⛔ without asserting they are ontologically identical.

## Lanes

| Lane | State |
|---|---|
| ⭐⭐ **`MAIA-WISDOM-CONSENT-01`** — existing AIN ingress boundary | **OPEN** · ACT 1 CLOSED · ✅ **ACT 2 CLOSED** (Seam 1 contained in production, `8cb640644`, all three probes `401`) · ⛔ ACT 3 unopened |
| **`MAIA-WISDOM-WITNESS-01`** — external corpus + production population | **OPEN, parallel** · ⛔ unreachable from any container · founder-side |
| `ACT 2C` — AIN toroidal circulation governance | ⛔ blocked on CONSENT-01 ACT 3 (the consent boundary), ⛔ not on ACT 2 |
| `ACT 2B` — epistemic relationship / contradiction architecture | ⛔ not opened · ⚠️ R13 has no substrate |
| `ACT 2A` — source / provenance / rights / elemental carrier | ⛔ design may proceed; **implementation held for WITNESS-01** |
| `MAIA-WISDOM-RUNTIME-01` — live member route severance | ⛔ recorded, not opened |

## `MAIA-WISDOM-WITNESS-01` — custody obligation

⛔ **Not runnable from any remote container** — failed for the same environmental reason in
1B and 1C. Requires the Mac Studio / an authorized DB environment.

**A — external AIN filesystem census**

```bash
node scripts/witness/ain-corpus-census.mjs \
  --root "/path/to/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1" \
  --out  ~/ain-census-2026-09-15
```
Read-only; refuses to start if `--out` resolves inside `--root`; validated against the
in-repo corpus (739 files, all machine-readable, 738/739 without ratified frontmatter,
15 redundant files).

**B — production population truth** (read-only, no writes)

```sql
SELECT 'ain_knowledge_chunks' t, count(*), count(embedding) embedded FROM ain_knowledge_chunks
UNION ALL SELECT 'corpus_chunks', count(*), count(embedding) FROM corpus_chunks
UNION ALL SELECT 'library_chunks', count(*), count(embedding) FROM library_chunks
UNION ALL SELECT 'library_sources', count(*), count(*) FILTER (WHERE ingestion_status='completed') FROM library_sources;
-- elemental tagging health:
SELECT meta->>'element' e, meta->>'element_secondary' e2, count(*) FROM library_chunks GROUP BY 1,2 ORDER BY 3 DESC;
```

⭐ **Result is a merge/admission gate for `ACT 2A` implementation** — ⛔ never a blocker on
CONSENT-01, 2C governance, or 2B epistemic design.

## Open question carried

**F.13** — the Unified Field ⇄ AIN boundary census (46 files carry unified/collective-field
language) remains **uncensused**; its own read-only act.

## Update — 2026-09-15, end of session

**`MAIA-WISDOM-CONSENT-01` ACT 2 CLOSED.** Seam 1 contained in production at `8cb640644`;
`breakthrough` · `control` · `knowledge` all refuse anonymous callers with `401`, where
`breakthrough` returned `400` that morning. Record:
`MAIA-WISDOM-CONSENT-01_ACT2_CLOSURE_2026-09-15.md`.

⛔ **Carried, unresolved:** identity binding (closed by unreachability, not by binding) ·
Seam 2 and R15 · `ACCESS-MATRIX-COVERAGE-01` · `MAIA-WISDOM-WITNESS-01` (A and B, now also a
rights question) · `MAIA-WISDOM-RUNTIME-01`.

⛔ **ACT 3 — contribution authority model — unopened.** It is the next act in this lane, and
it opens only by founder act.

## Update — 2026-09-15 — PHASE 0 CLOSED (founder act)

**`MAIA-WISDOM-WITNESS-01` census instrument FINALLY ACCEPTED at
`28af4ef457c67c280a83c2149e92ef04302290e7`.** Eight amendments (1 · 2 · 2A–2F) accepted; the
evidentiary grammar — **visibility · readability · observation · applicability · identity ·
claim scope** — now has six separate semantics that may not be collapsed into one another.
Record: `MAIA-WISDOM-WITNESS-01_PHASE0_CLOSURE_2026-09-15.md`.

⛔ **Part A Run #2 remains on HOLD.** The block is host-side, not instrumental: the
authoritative tree is `compressed,dataless` (432K on disk, errno 60). The gate is
`head -c 100 "$ROOT/00-Context-Map.md"` returning `READ OK` — ⛔ never the iCloud UI.
Part B is complete and is not rerun.

⛔ **No further census-instrument design is earned.** The next problem is **custody**, not
measurement.

## Witness — 2026-09-15 — MATERIALIZATION GATE: `STILL BLOCKED`

Run on `Kellys-Mac-Studio` as `soullab`, against the pinned absolute path.

```text
ls -d  .../AIN Consciousness Intelligence System 1     → exists
du -sh .../Mobile Documents/iCloud~md~obsidian         → 432K
head -c 100 "$ROOT/00-Context-Map.md"                  → Error reading
                                                       → STILL BLOCKED
```

**Established:** the authoritative tree is **on the Mac Studio**, at
`/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1`.
⛔ The "different host / different user account" hypothesis is **closed**: it arose from searching
`MAIA_WISDOM_CORPUS` under `com~apple~CloudDocs`, ⛔ neither of which this programme ever recorded.

⚠️ **Not established:** readability. `ls -d` proves a NAME exists; dataless eviction removes
contents and leaves names intact. That is the trap, not the exception.

⚠️ **432K is the size of the WHOLE Obsidian container**, not of one folder — so essentially
nothing in it is materialized. The condition is **container-level**, ⛔ not specific to the corpus
directory.

⚠️ **Candidate ambiguity, recorded for the future custody act:** six near-identical directories
exist (`AIN` · `AIN Intelligence` · `AIN Consciousness Intelligence System` with and without the
trailing ` 1`, under three different parents, two containers). ⛔ The custody act must pin the
**absolute path verbatim, trailing ` 1` included** — ⛔ never a name, never a glob. A corpus
identity satisfiable by six directories is not an identity.

⛔ **Standing unchanged:** lane stopped at the materialization gate. ⛔ No census. ⛔ Run #2
unauthorized. ⛔ Nothing created. ⛔ `maia_sovereign_corpus` (audio eval dataset) is not the corpus
and is not used.

## Witness — 2026-09-15 — the gate is blocked BELOW the corpus

**Durable programme fact:** *Authoritative-corpus materialization is blocked by a host-wide
CloudDocs content-fetch failure; corpus integrity and availability have not been adjudicated.*

⭐ **The discriminator was a control file we do not care about.** A file inside Apple's own
`com~apple~CloudDocs` container fails the identical content-read operation, instantly:

```text
control file in com~apple~CloudDocs   → Operation timed out · 0.014s · CONTROL BLOCKED
corpus file in iCloud~md~obsidian     → Error reading · STILL BLOCKED
```

⛔ So there is **no evidentiary basis** for attributing the failure to AIN, to Obsidian, or to the
corpus. The failure is one layer below the programme:

```text
MAIA WISDOM PROGRAMME
        ↓
materialization gate
        ↓
host iCloud / CloudDocs service   ← FAILURE HERE
        ↓
authoritative corpus
```

⚠️ **TWO host failures, stacked, and they are independent claims** — ⛔ neither may be inferred
from the other:

| container | state |
|---|---|
| `com~apple~CloudDocs` | registered · `last-sync 2026-09-03` (stale) · content fetch times out |
| `iCloud~md~obsidian` | **`Client zone not found`** — not registered with the daemon at all |

⭐ `Client zone not found` is **not** eviction. A recovered daemon does not, by itself, create a
zone that is not there. So CloudDocs recovering would say **nothing** about the Obsidian path,
which must be re-probed independently.

Ruled out: storage (`brctl quota` → 1.18 TB remaining) · corpus-specific fault (control) ·
a wedged daemon alone (`killall bird cloudd` did not clear it).

⛔ **Not adjudicated, and not inferable from here:** whether the cloud-side copy exists or is
intact. A local materialization failure is a statement about this host, ⛔ never about the remote.
An independent cloud-side check (iCloud.com → Drive) would be its own reading.

⛔ Launching Obsidian to register the container is **host/application recovery, not a programme
act** — it authorizes nothing and is not performed on the programme's behalf.

**Standing: PHASE 0 ⭐⭐ CLOSED · CORPUS CUSTODY UNADJUDICATED · HOST MATERIALIZATION ⛔ BLOCKED ·
PART A RUN #2 ⛔ UNAUTHORIZED · ACT 2A ⛔ UNOPENED · ⛔ NO CENSUS · ⛔ NO ARCHITECTURE ACT.**
