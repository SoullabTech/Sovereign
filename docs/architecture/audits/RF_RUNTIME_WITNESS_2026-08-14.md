# Relational Field — Runtime Witness

**Measured:** 2026-08-14 02:24:47 → 02:25:54 UTC · **Steward:** JARVIS
**Authorized by:** founder, 2026-08-13 — read-only runtime verification unit, post-ratification
**Standing:** ⛔ **Building remains CLOSED.** This is witness only. It produces **no**
implementation delta and authorizes nothing.

---

## 0. Runtime referent — bound on five criteria before any measurement

| Criterion | Value |
|---|---|
| Application process exists | `maia-sovereign` — **Up 2 hours (healthy)** |
| Serves the live member-facing domain | `maia-caddy` up; app answers on `127.0.0.1:3000`; `/api/health` → `200 {"health":"ok"}` |
| `DATABASE_URL` **read from the running process** | `postgresql://***@maia-postgres:5432/maia_consciousness` |
| Write recency consistent with activity | `relationship_essences.updated_at` max = **2026-08-14 02:02:00** — 22 min before measurement |
| Provenance | `GIT_COMMIT=22200f967` · `DEPLOY_LANE=deploy-lane` · created `2026-08-14T00:53:50Z` |
| LAN | `192.168.0.104` ✅ matches port-forward target |

⭐ **The running commit is exactly the ratified referent `22200f967`.** No stale-replica risk:
the reported SHA, the deploy lane, and live write recency all agree.

---

## Q1 · Does rupture containment actually prevent prohibited persistence?

# ⛔ NOT ESTABLISHED — the containment has never been exercised.

| Measure | Value |
|---|---|
| Signals written **since the containment container started** (00:53:50Z) | **0** |
| …of those, with `rupture_state` non-null | **0** |
| Last signal written, all time | **2026-08-13 21:17:28** — ~3.6 h **before** containment started |

⚠️ **This is a null observation, and JRF-07's negative-control law applies exactly:** the
null has at least five causes — boundary held · nothing apprehended · write path not
wired · route not exercised · laundering elsewhere. **The measurement cannot distinguish
them.**

⛔ Do not read "0 prohibited writes" as "containment works." Nothing has been written at
all. **The containment is unproven at runtime — not because it failed, but because it has
had no opportunity to run.**

⭐ **A positive control is required and does not yet exist:** exercise the write path with
a source that *would* have produced `rupture_state` before `22200f967`, and observe the
value withheld. Until that runs, Q1 stays open.

⚠️ **Second, separate open question this exposes:** *why* has nothing been written for
3.6 h across a live system? Either the traffic that produces relational signals is rarer
than assumed, or the write path is no longer reached. **Not established. Do not assume
the benign reading.**

### Stored state, all time (unchanged by containment — historical rows keep their values)

| `rupture_state` | rows | last written |
|---|---|---|
| *(null)* | 343 | 2026-08-13 17:59:28 |
| `strained` | 53 | 2026-08-13 21:17:28 |
| `ruptured` | 44 | 2026-08-13 02:13:35 |
| **total** | **440** | all `source = maia_conversation` |

---

## Q2 · Can prohibited inferred state reach a member-facing render path?

**Data-side answer — established:**

| Measure | Value |
|---|---|
| Rows carrying an inferred `rupture_state` | **97** |
| …**attached to any relationship** | **0** |

⭐ **Not one of the 97 inferred rupture assertions is attached to a relationship.** They
therefore cannot reach the Relationship Room through the relationship join — and never
could, containment or not.

⚠️ **This does not close Q2.** `getLatestSignal` / `rowToSignal` read **by member**, not by
relationship, so a member-scoped surface remains a live path. At `22200f967` the read
containment at `relationshipSignalService.ts:285` nulls `ruptureState` on that path — but
**that is a code fact, and the same negative-control problem applies to its runtime
behaviour.** ⛔ Q2 is established **only** in its data-attachment half.

---

## Q3 · What does `relationship_essences` actually do?

# ⚠️ It is LIVE, system-authored, and it varies with what was apprehended.

| Measure | Value |
|---|---|
| Rows / distinct users | **142 / 142** |
| First encounter → last write | 2025-12-28 → **2026-08-14 02:02:00** (22 min before measurement) |
| Total encounters | **3,388** |
| `morphic_resonance` | **6 distinct values**, range 0.2 – 1.0 |

`presence_quality` — a system-authored characterization of a person, in prose:

| value | rows |
|---|---|
| Present, listening, unfolding | 98 |
| Fierce clarity, grounded strength | 31 |
| Open curiosity, exploratory presence | 11 |
| Tender vulnerability, open heart | 1 |
| Reverent depth, mystery-holding | 1 |

⭐ **It passes the representational-completion test** — a caller exists, it is written
after encounters, and the values **vary**. This is not a stub and not a derived constant.

⛔ **Which makes it the more serious finding, not the lesser one.** 142 members carry a
system-written characterization of who they are — *"Fierce clarity, grounded strength"* —
produced by no member gesture, with no declaration provenance, updated minutes ago.
Aether reported this shape during the inquiry and could not establish its behaviour;
**it is now established.**

⚠️ **NOT established:** whether these values reach a prompt or a member-facing render.
Presence in a table is not composition. **Do not infer either way.**

---

## Q4 · What Relational Field surfaces are actually reachable?

Probed in-container at `127.0.0.1:3000` (bypasses the public path — see limitation below).

| Path | Status | Reading |
|---|---|---|
| `/api/health` | **200** | app serving; uptime 5521 s |
| `/relationships` | **307** → `/signin?next=%2Frelationships&reason=no_session_cookie` | ⭐ **reachable and auth-gated** — the surface exists and routes |
| `/api/relationships` | **401** Unauthorized | exists, gated |
| `/api/maia/relational-signal` | **401** Unauthorized | exists, gated — ⚠️ the ownership gap sits **behind** auth: it needs an authenticated member who then supplies another member's `relationshipId` |
| `/api/relationship-essence` | ⛔ **404 Not found** | **route file exists at `22200f967` but does not resolve at runtime** |

⚠️ **The 404 is a finding, not a pass.** A route present in the tree and absent from the
running app is an unexplained divergence between source and runtime. **Not established:**
whether it is build-excluded, path-shadowed, or renamed.

⚠️ **Limitation, stated:** this establishes **app-level** reachability only. The public
path (DNS → router → Caddy → app) was **not** exercised; the sandbox has no egress, and a
host-side probe would hit hairpin-NAT and mislead.

---

## Q5 · Production data state — freshly measured, 2026-08-14 02:24:47 UTC

| Table / measure | Count |
|---|---|
| `member_relationships` | **46** |
| …named **`Unresolved Relational Field`** (catch-all) | **31** ⛔ |
| `relationship_entries` | **1,190** |
| `relationship_field_state` | 10 |
| …with `elemental_dynamics` non-null | **0** ⭐ |
| `relationship_spaces` | **0** |
| `member_relational_signals` | 440 (all `maia_conversation`, **0 attached**) |

### Where the entries actually live

| Bucket | relationships | entries |
|---|---|---|
| ⛔ **CATCH-ALL** `Unresolved Relational Field` | **31** | **1,172** |
| named relationship | 15 | **18** |

| Provenance class | entries |
|---|---|
| `confidence` set (system-written) | **1,172** |
| `confidence IS NULL` (member-shaped) | **18** |

⭐ **67% of "People in your life" is machinery**, and **98.5% of all relational content
sits inside it.** The named relational life of every member on this system totals
**18 entries across 15 relationships.**

⭐ **`elemental_dynamics` is confirmed at runtime as an empty socket** — read on a
member-facing route, non-null in **0 of 10** rows. Earth and Fire predicted this; it holds.
⭐ **`relationship_spaces` is confirmed at 0 rows** — nothing has ever used the shared space.

---

## Summary of standing

| Question | Standing |
|---|---|
| Q1 rupture containment prevents prohibited persistence | ⛔ **NOT ESTABLISHED** — never exercised; positive control required |
| Q2 inferred state reaches member-facing render | ⚠️ **HALF ESTABLISHED** — 0 of 97 attached to a relationship; member-scoped path unproven |
| Q3 what `relationship_essences` does | ✅ **ESTABLISHED** — live, system-authored, varying, written minutes ago; ⚠️ prompt/render arrival NOT established |
| Q4 surface reachability | ✅ **ESTABLISHED at app level** — `/relationships` reachable + auth-gated; ⛔ `/api/relationship-essence` 404s; public path not exercised |
| Q5 production data state | ✅ **ESTABLISHED**, measured and timestamped above |

⛔ **No implementation delta is produced here.** That is the next unit, and it is not
authorized by this document. **Building remains CLOSED.**
