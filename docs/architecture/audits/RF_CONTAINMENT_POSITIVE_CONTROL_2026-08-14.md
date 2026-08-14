**EXECUTABLE WITNESS — BUILDING CLOSED** · 2026-08-14

# RF Containment — Positive Control

Answers the question the runtime witness (`RF_RUNTIME_WITNESS_2026-08-14.md`) could not:
**zero prohibited writes proves nothing.** This unit distinguishes the ≥6 causes of that null by
executing the containment against the exact deployed artifact.

---

## VERDICT

> ## `RUNTIME CONTAINMENT ESTABLISHED AT EXACT REFERENT`

with two qualifications that are part of the verdict, not footnotes to it:

1. **The writer path is ACTIVE.** The production silence is *not* explained by a dormant or broken
   writer. A non-rupture signal traversed `detectRelationalSignal → persistDetectedSignal →
   insertRelationalSignal → database row` inside the exact `22200f967` image.
2. **`rowToSignal` is NOT a universal chokepoint.** Exactly one direct reader of `rupture_state`
   bypasses it (`/api/founder/relational-signals`). It is founder-gated, fails closed, and is
   forensic rather than member-facing — so it does not breach the founder ruling — but the
   "single row→signal chokepoint that every reader passes through" claim in the source comment at
   `relationshipSignalService.ts:276` is **too strong as written**. See §6.

---

## 1 · Referent binding

| Criterion | Bound value |
|---|---|
| Production container | `maia-sovereign`, started `2026-08-14T00:53:51.198932293Z`, image `maia-sovereign:prod` |
| Running provenance | `GIT_COMMIT=22200f967` · `DEPLOY_LANE=deploy-lane` |
| Image identity | `maia-sovereign:22200f967` = `:current` = `:prod` = `sha256:b7ef079ba089…` (one image, three tags) |
| Commit | `22200f9675a1a1c703b2c83c4c393a5fd233ab87` — *fix(relational): contain inferred rupture state at write and at read* (2026-08-13 20:47:28 -0400) |
| DB | `postgresql://***@maia-postgres:5432/maia_consciousness` (read from the running process, not from a repo `.env`) |

**Artifact ≡ SHA, proven by content, not by tag name.** `sha256sum` inside the running production
container vs `git show 22200f967:<path> | shasum -a 256`:

| File | sha256 (identical in image and at SHA) |
|---|---|
| `lib/relationships/relationshipSignalService.ts` | `7dba54ca3601aeb04a0baa1f73bf5e221ca05bab18feabe7c9540ad719cac7ed` |
| `lib/relationships/detectRelationalSignal.ts` | `1e2f5b1bdc9cbaa8eb32774f26700cdbca376aaa7d4fe0edf6d0b720998b43e9` |
| `lib/relationships/types.ts` | `7a18f0c8951d89efd732474348d92c6263e678106e12288b23b653771a552a98` |
| `database/migrations/20260409000010_member_relational_signals.sql` | `f45119df654ece5f27467b55a97d8d9ffbe4f1da50d933721cfc9367ddc39484` |

The working tree (`d41b8b355`, dirty) was **never read**. All source was read via
`git show 22200f967:<path>`. Nothing was rebuilt.

---

## 2 · Isolation — how, and proof no production row changed

**Method: physical unreachability, not discipline.**

1. A throwaway network `rf-witness-net` was created.
2. An ephemeral postgres (`pgvector/pgvector:pg16` — the image already on the host, nothing pulled)
   was started as `rf-witness-pg` with `--rm` and `--tmpfs /var/lib/postgresql/data`: **no volume,
   no persistence, memory-backed storage**, database `rf_witness`.
3. The fixture schema was applied verbatim from migrations `…000010`, `…000011`, `…000012` at
   `22200f967` (plus a one-column `member_relationships` stub to satisfy the FK).
4. The witness ran as a **new `--rm` container from `maia-sovereign:22200f967`**, attached **only**
   to `rf-witness-net`, with `DATABASE_URL` → the scratch DB. The witness script itself aborts with
   exit 2 unless `DATABASE_URL` matches `/rf_witness/` and does **not** match `/maia_consciousness/`.
5. The script and the mutated module were `-v … :ro` bind mounts into the ephemeral container. **The
   image was not modified. No repository file was modified.**

**Isolation probe, executed before the witness:**

```
getent hosts maia-postgres   →  NO_DNS_maia-postgres
net.connect(5432, 'maia-postgres') →  UNREACHABLE:ENOTFOUND
```

The witness container could not resolve, let alone reach, the production database.

**Production untouched — measured before and after, same statement:**

```
BASELINE|440|2026-08-13 21:17:28.580085+00|3b2af7e08e385f3d9482665ac38cc810
AFTER   |440|2026-08-13 21:17:28.580085+00|3b2af7e08e385f3d9482665ac38cc810
```

(count | max(created_at) | md5 over `id ‖ rupture_state ‖ source` of every row, ordered by id.)
Identical. Distribution also unchanged: `NULL=343 · ruptured=44 · strained=53` — the 97 historical
rows the founder ruling preserves as forensic evidence are intact and untouched.

No production write of any kind was issued. No `BEGIN/ROLLBACK` was needed because **no statement
was ever addressed to `maia_consciousness`**; every write went to a memory-backed scratch database
on an isolated network. All witness infrastructure was destroyed afterwards (`docker rm -f
rf-witness-pg`, `docker network rm rf-witness-net`, `/tmp` artifacts removed); zero `rf-witness`
containers remain; `maia-sovereign` was never restarted (`StartedAt` unchanged: `00:53:51Z`).

---

## 3 · Part 1 — POSITIVE CONTROL (load-bearing)

**Question: is the writer path active at all?**

Input: *"Things with my partner have been really warm lately. We spent the weekend together and I
felt close and connected to her."*

```
DETECT  detected=true confidence=0.45 counterpart='partner' tone='warm' ruptureState=null
P1      persistDetectedSignal → id 02485439-2cb3-450b-be5c-c646c1124532
        row: {counterpart_label:'partner', tone:'warm', rupture_state:null,
              source:'maia_conversation', confidence:0.45}
        PASS = true
```

**A known non-rupture relational signal traversed detector → `insertRelationalSignal` → a real
database row.** The writer is not dormant, not broken, not feature-gated, and does not swallow an
exception on the happy path. **Four of the six candidate causes of the production null are hereby
eliminated.**

---

## 4 · Part 2 — NEGATIVE CONTROLS

Run in two forms, because the first form turned out not to exercise the gate.

| Case | message | detector `ruptureState` | persisted `rupture_state` |
|---|---|---|---|
| `NEG_LAPTOP` | "My laptop is broken." | `null` — **rejected upstream by `hasRelationalPresence`** | `null` |
| `NEG_NEGATION` | "I don't want to break up with him." | `null` — **rejected upstream** | `null` |
| `NEG_LAPTOP_REL` | "Things with my partner are fine right now, but my laptop is broken." | **`ruptured`** | `null` |
| `NEG_NEGATION_REL` | "I love my partner and I don't want to break up with him." | **`ruptured`** | `null` |

⚠️ **A correction to the record, earned here.** The source comment at
`relationshipSignalService.ts:118-122` states *"My laptop is broken" matches. "I don't want to break
up with him" matches.* Taken as end-to-end claims about the deployed pipeline, **both are false at
`22200f967`** — the `hasRelationalPresence` gate rejects both sentences before rupture scoring ever
runs. The comment is true of the *keyword list* and false of the *pipeline*. The two `_REL` variants
above were constructed to make the claim true, and they do: with any relational presence in the same
sentence, an unrelated broken laptop and an explicit **negation of** breaking up both yield
`ruptureState = 'ruptured'` at confidence 0.50. **The detector's false-positive class is real and
reproduced; the specific example sentences in the comment are not.** Both `_REL` cases persisted
through the ordinary `persistDetectedSignal` path (`detected:true`, ids returned) and stored
`rupture_state = NULL`.

---

## 5 · Part 3 — PROVENANCE CONTROLS

`insertRelationalSignal({ ruptureState: 'ruptured', source: X })` for each X:

| `source` | row written? | stored `rupture_state` |
|---|---|---|
| `maia_conversation` | yes | **`NULL`** |
| `labtool_manual` | yes | **`NULL`** |
| *(missing)* | **no** — returns `null` | — |
| `member_declared` *(unknown)* | **no** — returns `null` | — |

`P3_SUMMARY: rowCount=2 · storedRuptureStates=[null,null] · PASS=true`

No source in the current vocabulary can persist member-declaration semantics. Missing and unknown
sources fail closed at `safeSource()` before reaching the table; the two representable sources reach
the table but have their assertion withheld. **Provenance is not authorship, and the code enforces
that rather than asserting it.**

---

## 6 · Part 4 — READ CONTROL, and the chokepoint question

**6a. Reader suppression.** Two rows were seeded **directly into the fixture** (bypassing the write
gate entirely, exactly as the 97 historical production rows did):

```
raw in fixture:  {rupture_state:'ruptured', source:'maia_conversation'}
                 {rupture_state:'strained', source:'labtool_manual'}
getLatestSignal  → ruptureState = null
getRecentSignals → [null, null]
raw still in DB  → ['ruptured','strained']     ← forensic value preserved, not mutated
PASS = true
```

The normal reader suppresses a stored inferred rupture while the row keeps its value.

**6b. Is `rowToSignal` a universal chokepoint? — searched by two structurally different methods.**

*Method A — column-token search* (`git grep 'rupture_state'` and `'ruptureState'` at `22200f967`,
excluding tests).
*Method B — table-name search* (`git grep -l 'member_relational_signals'`). Method B is the
structurally different one: it catches a `SELECT *` reader that **no column-name grep could ever
find**. Both methods returned the same closed set of files touching the table:

```
app/api/founder/relational-signals/route.ts
app/api/founder/relational-signals/review/route.ts
lib/relationships/relationshipSignalService.ts
lib/relationships/types.ts
database/migrations/20260409000010 / …0011 / …0012
```

**Finding — one bypass exists.** `app/api/founder/relational-signals/route.ts` issues its own
`SELECT … s.rupture_state …` (line 188) and maps `ruptureState: row.rupture_state` (line 218)
**without passing through `rowToSignal`**. `app/founder/relational-signals/page.tsx` renders it
(`if (row.ruptureState) parts.push(row.ruptureState)`; `<DrawerRow label="Rupture" …>`).

Assessment, stated precisely:

- It is **not a breach of the founder ruling.** The read-side ruling forbids inferred state
  *rendering as first-person / member-authored language*; the ruling simultaneously preserves the
  rows *as forensic evidence*. This surface is the forensic review instrument — a founder-only
  triage page that shows the raw stored value beside the originating turn text, labelled
  `Rupture:`, never in the member's voice.
- It is **founder-gated and fails closed**: `requireFounder()` runs first and returns before any
  query; `lib/founder/founderAuth` fails closed when `FOUNDER_MEMBER_IDS` is unset.
- It **does falsify the chokepoint claim as written.** The comment at `:276` says the boundary is
  held at *"the single row→signal chokepoint that every reader passes through."* Every **member-facing**
  reader passes through it. Not every reader does. That distinction is load-bearing: a future
  member-facing surface built on the founder route's shape would inherit the bypass, not the
  containment.
- No member-facing reader of `rupture_state` outside `rowToSignal` exists at `22200f967`.

---

## 7 · Mutation proof — the controls could have failed

**A passing test proves nothing unless it can fail.** A copy of the service, **byte-identical except
one line**, was mounted into the ephemeral container:

```diff
-const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set();
+const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set(['maia_conversation','labtool_manual']);
```

Re-running the identical write and read cases through the mutated module:

| control | contained module | mutated module |
|---|---|---|
| forced `'ruptured'` write, `source='maia_conversation'` | stored `NULL` | **stored `'ruptured'`** |
| negative-control write (`NEG_LAPTOP_REL` member) | stored `NULL` | **stored `'ruptured'`** |
| `getLatestSignal` on seeded rows | `null` | **`'strained'`** |
| `getRecentSignals` on seeded rows | `[null, null]` | **`['strained','ruptured']`** |

`WRITE_CONTROL_CAN_FAIL = true` · `READ_CONTROL_CAN_FAIL = true`.

Every PASS in §3–§6 is a real discrimination, not a vacuous one. The single gating line is
demonstrably the thing doing the work — at both the write seam and the read seam.

---

## 8 · What the production null actually was

The runtime witness reported zero relational signals since `00:53:51Z`. That null is now **fully
attributed**, and it is not containment.

| Evidence | Value |
|---|---|
| `[Phase4] detection` log lines since container start | **1** — `{detected:false, confidence:0}` |
| `detectRelationalSignal` log lines since container start | **1** |
| `[relationalSignals]` warn lines (persist/detect errors) | **0** |
| `maia_turns` since container start, by `origin_route` | `/api/voice/stream-conversation` = **12** · `/api/sovereign/app/maia/list` = **1** |
| new `member_relational_signals` rows | 0 |

The detector logs on **every** non-detection (presence gate, or below threshold) and is silent only
on a positive detection — which would itself have produced a row (§3). One log line and zero rows
therefore means **the detector was invoked exactly once**, on the single turn that reached a route
carrying the observer, and that turn contained no relational content.

**The other 12 turns went through `/api/voice/stream-conversation`, which has no relational observer
wire at all** — the only two `persistDetectedSignal` call sites at `22200f967` are
`app/api/sovereign/app/maia/list/route.ts:1654` and `app/api/sovereign/app/maia/route.ts:386`.

So the causal chain for the null is: *near-total traffic migration to a route the observer is not on*
→ *one qualifying turn* → *no relational content* → *no write attempted*. Containment was not the
cause of the null. Containment was never tested by production traffic in that window at all — which
is precisely why this positive control was required.

---

## 9 · NOT ESTABLISHED (preserved, not softened)

- **That containment has been exercised by live member traffic.** It has been exercised by an
  executable witness against the exact artifact. Not the same claim. Production has produced zero
  qualifying turns since the containment container started.
- **Why 12 of 13 turns route through `/api/voice/stream-conversation`.** Observed, not explained.
  Whether that is expected, a shift in client behaviour, or a regression is **outside this mandate**
  and is not investigated here. It is, however, the single largest fact about relational observation
  coverage today and it is recorded so a later lane can pick it up.
- **Whether the relational observer *should* be wired on the voice-stream route.** Not asked, not
  answered, not authorized. Naming the gap is not proposing to close it.
- **Member-visible effect.** No member-facing surface was opened. The `RelationshipFieldCard`
  consumes `signal.ruptureState` from the `rowToSignal` path (§6a) and would therefore receive
  `null` — established by code path and by the read control, **not** by a rendered device witness.
- **Behaviour of `/api/founder/relational-signals` under live founder auth.** Its bypass is
  established by source at the exact SHA and by two independent search methods; it was **not**
  executed (that would require authenticating as the founder against production).
- **The 97 historical rows' interpretation.** Untouched, unread, uninterpreted. Preserved.
- **`safeSource` vs the DB CHECK as independent defences.** Both were observed to fail closed, but
  the CHECK constraint at `…000010:49` was never independently exercised, because `safeSource()`
  rejects an unknown source before SQL is ever issued.

---

## 10 · Reproduction

Everything above is reproducible from the exact artifact with no repository change:

1. `git show 22200f967:<path>` for all source (working tree is `d41b8b355` and dirty — do not use).
2. Ephemeral `pgvector/pgvector:pg16` with `--rm --tmpfs`, on a throwaway network.
3. Fixture DDL = migrations `…000010`/`…000011`/`…000012` verbatim + a `member_relationships(id)` stub.
4. `docker run --rm --network <throwaway> -e DATABASE_URL=<scratch> -v <script>:/app/scripts/…:ro
   -w /app --entrypoint ./node_modules/.bin/tsx maia-sovereign:22200f967 scripts/…`
5. Mutation = the one-line diff in §7.
6. Verify production `count | max(created_at) | md5` before and after.

*Building remains closed. This unit changed no code, no schema, no container, and no production row.*
