# Runtime Walk — Practitioner Inference Containment (PR #993)

**Date:** 2026-08-06 · **Verdict:** ✅ **PASS on all five steps**, with **two findings recorded** (§7).
**Status:** ⛔ Evidence record. Does not approve, does not merge. Class A approvals remain unexercised.

| Fact | Value |
|---|---|
| **Application SHA (running)** | `95e7f5fdf8a77c0576cad4339b55e5b9a1b8f578` |
| PR head at walk time | `95e7f5fdf` — **unchanged before, during and after** |
| Working tree at walk time | **clean** (`git status --porcelain` empty; env files gitignored) |
| **Database identity** | `maia_containment_walk_95e7f5fdf` — **disposable, created for this walk** |
| Isolation boundary | separate Postgres database; app reads it via worktree-local `.env.local`; main checkout's env untouched |
| Server | pid 79590, port 3111, cwd = `.claude/worktrees/containment-slice` (verified via `lsof -d cwd`) |

⛔ Production was not touched. ⛔ The shared dev database (`maia_consciousness`) was not used.

---

## Reproduction

```bash
# 1. Isolated checkout at the PR head
git worktree add <wt> -b fix/practitioner-inference-containment origin/clean-main-no-secrets
# transplant the 7-file slice, or: git checkout 95e7f5fdf

# 2. Disposable database
psql -U soullab -d postgres -c "CREATE DATABASE maia_containment_walk_95e7f5fdf;"
for f in database/migrations/*.sql; do
  psql "postgresql://soullab@localhost:5432/maia_containment_walk_95e7f5fdf" -X -q -v ON_ERROR_STOP=1 -f "$f"
done                       # → 422 applied, 23 failed (see §6)

# 3. Fixture
psql "$URL" -X -v ON_ERROR_STOP=1 -f seed.sql          # §2 below
psql "$URL" -X -f fixture-repairs.sql                  # §6 below

# 4. App against the disposable DB (npm run dev strips shell DATABASE_URL —
#    it MUST come from the env file, or the app silently uses maia_consciousness)
echo 'DATABASE_URL=postgresql://soullab@localhost:5432/maia_containment_walk_95e7f5fdf' >> <wt>/.env.local
PORT=3111 npm run dev
```

⚠️ **Trap worth recording:** `"dev": "env -u DATABASE_URL next dev"` unsets `DATABASE_URL`, and
`lib/db/postgres.ts` falls back to `…/maia_consciousness`. A walk that exports `DATABASE_URL` in the
shell and assumes isolation would in fact have run **against the shared dev database** while
appearing correct. The env-file route is the only one that actually isolates.

---

## 1. Fixture design (the load-bearing choice)

`pattern_ledger` and `studio_field_signals` were seeded **non-empty**, because an empty response
from an empty table proves nothing. Seeded state:

| Table | Rows | Composition |
|---|---|---|
| `pattern_ledger` | 3 | `emerging` · `offered` · `confirmed` — with `recurrence_count` 7/4/3 and significance 0.65–0.94. The `emerging` row is the constitutionally worst case: never offered to the member. |
| `studio_field_signals` | 6 | all three sources (`client`, `maia`, `practitioner`) × {change, decision}, each with `intensity`, each with a unique `CANARYSIGNAL*` string |
| `studio_practitioner_observations` | 2 | **positive control** — `CANARYOBSERVATION*`, must survive |
| identities | 3 members / 2 practitioners / 1 client link | Practitioner **A** (walker), Practitioner **B** (negative control), Client **C** |

⚠️ Two distinct id spaces, both exercised: `pattern_ledger.member_id` → `members.id`;
`studio_changes.client_id` → `practitioner_clients.id`.

---

## 2. Step 1 — Pattern Ledger route ✅

Authenticated as Practitioner A via a real `auth_sessions` credential (`x-session-token`); bare
`x-member-id` is explicitly untrusted by `getMemberIdFromRequest`.

```
GET /api/studio/clients/cccccccc-…-003/pattern-ledger   (member id space)   → 200
GET /api/studio/clients/dddddddd-…-004/pattern-ledger   (client id space)   → 200

{ "patterns": [],
  "containment": { "contained": true,
    "reason": "Patterns here are produced by system inference about the member. They are not
               shown to you because the member has not declared them into your shared work.
               Nothing has been deleted — this view is closed until a member-declared crossing exists.",
    "ruling": "Practitioner Inference Containment, 2026-08-06" } }
```

✅ 200 · ✅ `patterns: []` · ✅ explicit containment reason · ✅ **no inferred patterns under any
alternate field** — the full response body is the three keys shown; no statements, scores,
recurrence counts, or `growth_edge` labels appear anywhere in it. Both id spaces contained.

---

## 3. Steps 2 & 3 — Consult composition ✅

The change-consult HTTP route was exercised end-to-end: `POST /api/studio/changes/…/consult → 200
in 29894ms`, firing real Anthropic calls (`claude-sonnet-4-6`, `claude-opus-4-6`). ⛔ Further paid
council calls were not repeated; the composed evidence bundle was instead observed **deterministically**
by replicating both routes' composition verbatim through the real
`admitFieldSignalsForConsult()` and real `buildChangeQuestion()` against the real seeded rows.

| | change | decision |
|---|---|---|
| raw signals in DB | 3 (`client`,`maia`,`practitioner`) | 3 (`client`,`maia`,`practitioner`) |
| **admitted into bundle** | **0** ✅ | **0** ✅ |
| `CANARYSIGNAL*` in composed prompt | **[]** ✅ | **[]** ✅ |
| `CANARYSIGNAL*` anywhere in serialised bundle | **[]** ✅ | **[]** ✅ |
| `FIELD SIGNALS` section present | no ✅ | no ✅ |
| `intensity: N/10` in prompt | **[]** ✅ | **[]** ✅ |
| **practitioner observations admitted** | **1** ✅ | **1** ✅ |
| `CANARYOBSERVATION*` in prompt | present ✅ | present ✅ |

✅ No equivalent signal survives under renamed or nested fields — the whole bundle was serialised
and searched, not just the rendered prompt.

---

## 4. Step 4 — Practitioner interface ✅

Authenticated through the **real sign-in path** (bcrypt password set via the app's own
`hashPassword`, `POST /api/members/signin` → 200, httpOnly session cookie), then
`/studio/clients/dddddddd-…-004`:

- ✅ renders the containment explanation in the **Pattern Ledger** section
- ✅ does **not** render "No patterns recorded"
- ✅ no pattern statements, no `Growth Edge` badge, no `seen N times`, no scores
- ✅ screenshot captured

---

## 5. Step 5 — Negative and regression ✅

| Check | Result |
|---|---|
| practitioner-authored observations still appear | ✅ 1 per surface, canary present in prompt |
| unauthenticated → **401**, not converted to containment | ✅ `401 {"error":"Unauthorized"}` |
| invalid session token → **401** | ✅ |
| another practitioner (B) cannot access C's patterns | ✅ contained — ⚠️ **but see §7.2** |
| `pattern_ledger` unchanged | ✅ 3 rows, `emerging`/`offered`/`confirmed` intact |
| `studio_field_signals` unchanged | ✅ 6 rows, 2 per source |
| writes outside seed + session activity | ✅ only `auth_sessions` +1 (my sign-in), `change_iterations` +1 (the consult call), `maia_sessions`/`member_sessions`/`studio_teams` +1 (sign-in bootstrap). **Zero writes to either contained substrate.** |

---

## 6. Fixture caveats (recorded, not hidden)

- **23 of 445 migrations failed** on the fresh database. None affects the walk's tables: all nine
  required tables exist, and `pattern_ledger` carries every column the route selects. The
  `20260315120000_pattern_ledger.sql` failure was a rename step (`last_seen_at`) irrelevant to a
  fresh schema.
- **Three fixture repairs** were needed and are recorded in `fixture-repairs.sql`:
  `members.must_reset_password` (missing from a failed migration, blocked sign-in),
  `members.studio_mode='practice'`, `members.is_practitioner=true`. ⛔ Schema/fixture repairs only —
  no application code was changed for the walk.
- Probe scripts (`scripts/walk-containment-probe.ts`, `scripts/walk-setpw.ts`) were left
  **untracked** and are **not part of PR #993**. The PR head never moved.

---

## 7. Two findings

### 7.1 ⚠️ The prompt does not declare that signals were withheld

Fixed in the UI, **not** in the prompt. When the bundle is present but `fieldSignals` is empty,
`buildChangeQuestion` simply **omits** the `FIELD SIGNALS` section. The council model cannot
distinguish *"no field signals existed"* from *"field signals were withheld by containment."*

This is the **same defect class** as the panel's "No patterns recorded yet" — which the ruling
explicitly required be rendered distinctly from true emptiness. The code's own comment names the
principle, for the adjacent case:

> *"Without this, the model cannot distinguish 'no bundle' from 'bundle not rendered' and will
> silently proceed as if the evidence base were adequate."*

⛔ Not fixed here — fixing it changes the PR head, which resets CI, this walk, and review. Recommend
a follow-up line in the bundle (e.g. *"Field signals withheld pending authorship provenance"*)
decided as part of §7 rather than patched in now.

### 7.2 ⚠️ The ledger route has no practitioner↔client ownership check

Practitioner **B** — who has no relationship to Client C — received the same `200` + containment.
Correct outcome, but reached by the **containment**, not by authorization: the route runs
`getCurrentPractitioner()` and then queries `pattern_ledger WHERE member_id = $1` with **no join
proving the requesting practitioner is related to that member**. This is the standing
*list-filter-is-not-an-authorization-boundary* axis. Inert today; **live the moment §7 re-opens the
path.** ⛔ Must be resolved before any crossing mechanism ships.

### 7.3 Note on real-world exposure (does not change the ruling)

`app/studio/clients/[id]/page.tsx:343` passes `client.id` — a `practitioner_clients.id` — to a route
that queries `pattern_ledger WHERE member_id = $1`, i.e. **the members id space**. Where those ids
differ, the panel would have returned empty in production regardless of containment. So the crossing
was **architecturally live and constitutionally wrong**, but plausibly **inert in practice**.

⛔ This is recorded for completeness, not as mitigation — per the ruling, the path is illegitimate
whether it currently returns zero rows or ten thousand. It does mean the practical blast radius was
likely smaller than the architecture implied.

---

## 7bis. Founder disposition of the two findings (2026-08-06)

**The walk is accepted as satisfying the containment acceptance test for this head only.** It does
**not** satisfy: route ownership · truthful withholding disclosure · full migration fidelity ·
substantive diff review · the four Class A approvals or signoff.

> **The runtime walk verifies containment behavior at `95e7f5fdf`; it does not verify requester
> ownership, and containment must not be relied on as an authorization boundary.**

### 7.1 — ruled as an *epistemic disclosure gap*, not a containment failure
The prompt receives the correct protected-content boundary but not the correct **reason** for the
absence. Containment pass stands; the prompt is **safe but not fully truthful about state**.

⭐ **Ruled wording constraint** — the eventual disclosure must be narrow and non-inferential, e.g.:

> *Practitioner-inference signals are not available in this context.*

⛔ It must **not** include counts, categories, intensity, or any description that leaks the withheld
substrate. (A disclosure that says *how much* was withheld is itself a crossing.)

### 7.2 — ruled a real **authorization defect**, currently inert
> A practitioner unrelated to the requested person should not reach the same internal route and
> receive a constitutionally contained result. The route should **first** establish that the
> requester has a governed relationship to the relevant client object, **then** apply containment.

Present state: *correct content result reached through an insufficient authorization boundary.*
⛔ Must not be normalized as "secure because nothing leaked" — the containment rule and the
ownership rule protect different things. Must be dispositioned **before any future reopening of
practitioner-inference material.**

### 7.3 — preserved as blast-radius evidence, ⛔ not mitigation
Architecturally live and constitutionally wrong; plausibly less exercised in practice than
initially believed. Evidence of practical inertness in some cases — **not** evidence that the path
was constitutionally safe.

---

## 7ter. Findings from the substantive diff review (2026-08-06)

### 🔴 F1 — the pins under-scan (material; instrument defect, not behaviour defect)
Git pathspec `X/**/*.ts` matches only files **≥1 subdirectory deep**; files directly in `X/` are
silently skipped.

| pathspec | scanned | actual `.ts` | missed |
|---|---|---|---|
| `lib/maia/**/*.ts` | 50 | 165 | **115** |
| `lib/consciousness/**/*.ts` | 77 | 347 | **270** |
| `lib/oracle/**/*.ts` | 34 | 75 | 41 |
| `lib/sovereign/**/*.ts` | 6 | 23 | 17 |

PIN 1 and PIN 2b were scanning ~27% of the intended surface. ⚠️ The same defect was found once
during the walk, fixed at the single PIN 4 call site, and **not generalized**.

✅ **Every pin re-run with corrected directory pathspecs still passes** — no violation was hiding in
the gap. The conclusion holds; the *evidence* was overstated when reported as "23 pins green."
⛔ Unfixed at `95e7f5fdf`: the guard would not currently catch a regression in a top-level
`lib/maia/*.ts`. Fix is test-only and moves the head.

### F2 — the anti-vacuity guard cannot detect F1
`harness sanity` validates one pattern against one pathspec family and passed throughout. It should
assert a known-present file per pathspec family.

### F3 — `isCategoricallyRefusedSource` is dead in production
Referenced only by tests: documentation-by-export, not an enforced path.

### F4 — observation, out of scope, ⛔ **not** a crossing
`app/studio/metrics/page.tsx:341` renders `components/dev/SymbolicTelemetryPanel` ungated, which
references `pattern_ledger` — but only as an **aggregate telemetry domain label** via
`/api/debug/symbolic-telemetry`, not per-member inference. The adjacent concern (a debug endpoint on
a practitioner page) belongs to a separate lane. Recorded so it is not rediscovered as a containment gap.

### Confirmed correct by review
`components/consciousness/PatternLedger.tsx` also reads `pattern_ledger` but is the **member's own**
view (carries `ResonanceResponse: fits/partly/not_now/no/explore`) on member surfaces. Correctly
untouched — containment restricts the practitioner path, never the member's own relationship to
patterns about themselves.

---

## 8. Cleanup

The disposable database is retained until PR #993 merges, so the walk can be re-run against the same
fixture if the head changes. Drop with:

```bash
psql -U soullab -d postgres -c "DROP DATABASE maia_containment_walk_95e7f5fdf;"
git worktree remove .claude/worktrees/containment-slice
```

## 9. What this does not establish

- ⛔ **Not an approval.** Class A still requires Founder-Steward + two Council + one Mentor, then
  covenant signoff through the governed mechanism. `covenant-signoff` remains absent and was not
  self-applied.
- ⛔ **Not production evidence.** Production still exposes both paths until this merges and deploys.
- ⛔ Production `pattern_ledger` row counts remain unmeasured (per ruling, not a prerequisite).
- ⛔ Any change to the head resets CI, this walk, and substantive review.
