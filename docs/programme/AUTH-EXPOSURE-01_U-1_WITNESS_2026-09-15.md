# AUTH-EXPOSURE-01 · U-1 — `ACCESS_CONTROL_MODE` production truth

**Authorized act**: U-1 WITNESS ONLY (founder, 2026-09-15)
**Subject SHA**: `1a555430`
**Disposition**: ⛔ **NOT WITNESSED** · ⭐ **ENTAILED `permissive`** · **supply chain CLOSED at the subject**
**Standing**: STOP after U-1 · ⛔ no repair · ⛔ no config change · ⛔ no route probed · ⛔ no member data touched

---

## 1. The required return, up front

| # | Required | Answer |
|---|---|---|
| 1 | Observed production value/state | ⛔ **NOT OBSERVED.** The running container's environment was not read by this act |
| 2 | Evidence source and custody | Repository custody at `1a555430` (conclusive for the *supply chain*) + two historical production records (§4). ⛔ No live read |
| 3 | Resulting runtime mode | ⭐ **`permissive`, ENTAILED — not witnessed.** Every committed channel that could supply the variable is closed; two prior production records agree |
| 4 | 79 unmapped routes: matrix-denied or handler-authorized? | **Handler-authorized, on the entailed reading.** ⛔ Not proved. If the host-only `.env.production` carries the variable, the answer inverts to matrix-denied |
| 5 | Limitation preventing conclusiveness | **This container cannot reach production.** No `ssh` binary; `minisforum` does not resolve; TCP to `192.168.0.104:22` unreachable. Production is on a private LAN |

**⭐ This lane's own rule, applied to itself: entailment from source that has been read is
honest evidence; calling it witness is the move this discipline exists to refuse.** U-1 is
narrowed, not closed.

## 2. The runtime consequence, traced

```
config/accessMatrix.ts:726-729
  getAccessMode() → process.env.ACCESS_CONTROL_MODE === 'strict' ? 'strict' : 'permissive'

config/accessMatrix.ts:757-770  checkAccess(), matchRule() returns null
  strict     → { allowed:false, reason:'no-rule-match' } → middleware.ts:392-403 → 404 JSON
  permissive → { allowed:true,  reason:'no-rule-match' } → forwarded, flagged only

middleware.ts:464-476  runtime: 'nodejs'
  → process.env is read PER REQUEST from the container environment,
    not inlined at build time.
```

**Exactly one string produces strict.** Any other value — including `'Strict'`, `'STRICT'`,
`'true'`, `'1'`, or empty — yields `permissive`. A misspelling is indistinguishable from
absence in effect, and the census's classification turns on that comparison, not on
whether the variable exists.

## 3. Supply-chain census — every committed channel, at the subject

| Channel | Carries `ACCESS_CONTROL_MODE`? |
|---|---|
| `Dockerfile` (`ENV` / `ARG`, both stages) | **NO** |
| `docker-compose.production.yml` — `maia` `environment:` block | **NO** (nor any other service's) |
| `docker-compose*.yml` — anywhere in any file | **NO** |
| `scripts/**` (deploy, pre-deploy gate, deploy-lock, migrate) | **NO** |
| `.github/**` workflows | **NO** |
| `next.config.js` `env:` build-time inline block | **NO** — the block carries only `NEXT_PUBLIC_BUILD_{SHA,DATE,BRANCH,TIME,MODE}` and `NEXT_PUBLIC_VERSION` |
| `.env.example`, `.env.docker.template`, `.env.android.template` | **NO** |

⭐ **Consequence worth stating plainly: a shell export at deploy time cannot reach the
container.** Compose passes only what `environment:` names or `env_file:` loads. The
variable is in no `environment:` block, so an exported shell variable is silently dropped.

**Two channels remain open, and both are host-only:**

- **(a)** `/home/soullab/MAIA-SOVEREIGN/.env.production` — gitignored (`.gitignore:110`),
  loaded by `env_file:` for the `maia` service (`docker-compose.production.yml:72-73`).
  `env_file` loads **every** key it contains, so this channel works even though compose
  never names the variable. **This is the live possibility.**
- **(b)** A manual container-level override (`docker run -e`, or a one-off `up` with an
  override file). The 2026-09-07 record already establishes that unlocked container
  recreation happens on this host and leaves no deploy-lane record.

## 4. Historical production evidence — real, and stale

Two committed records carry production observations. Both **predate the subject by ~7 weeks**
and neither is a reading of the current runtime.

- ⭐ `docs/architecture/HOUSE_MAP_RECONCILIATION_2026-07-23.md` §5 — a **behavioral
  witness** at `b33990c6d`: an unauthenticated GET to `/voice-controller-test`, then
  unmapped, returned **200, 30,896 bytes, no signin markers**, against a mapped control
  (`/maia` → 302 `no_session_cookie`). An unmapped route served unauthenticated **is**
  permissive behaviour observed, not inferred.
  ⚠️ **That probe is no longer repeatable**: the route was subsequently *mapped*
  (`config/accessMatrix.ts:135`, explicitly *"so it never relies on the permissive unmapped
  default (#717)"*). The control it provided has been consumed by the repair.
- `docs/reviews/TIER_ENFORCEMENT_AUDIT_2026-07-30.md:21-23` — *"Production runs
  `ACCESS_CONTROL_MODE` unset → permissive … **verified on minisforum 2026-07-30**"*. A
  claimed host verification; the record does not reproduce the command or its output, so it
  is an attested reading, not a transcribed one.
- `docs/reviews/HOUSE_00_STANDING_RECORD.md` SR-56 / F-14 — *"the strict-mode prerequisite
  is **NOT met** — `ACCESS_CONTROL_MODE` stays `permissive`"*, parent issue **#732**.
  ⭐ Read the other way round, this is the strongest structural evidence in the set:
  **an open issue exists whose entire purpose is to reach strict mode, and it is recorded
  as unmet.** Strict mode is a goal here, not a state.

⛔ **None of this is a current reading.** A `.env.production` edit on the host at any point
in the intervening seven weeks would be invisible to every source above.

## 5. Why this act could not witness it

- No `ssh` binary in this container (`timeout ssh … → No such file or directory`).
- `minisforum` does not resolve (`getent hosts` → empty).
- TCP to `192.168.0.104:22` does not connect (timed out, killed at 6s).

Production is a self-hosted box on a private LAN; this is a cloud container. The gap is
structural, not a missing credential. ⛔ **No HTTP request was issued to production** —
not to `/api/health`, not to any route. A behavioral inference from a live probe was
available and was **not taken**: it is not what the act authorized ("*read the deployed
configuration/environment*"), and a 404 shape is a weaker instrument than `printenv`.

## 6. What closes U-1 — four read-only commands, run from the Mac Studio

```bash
# 1. DECISIVE — what the running process actually has.
#    No output + exit 1 = unset → permissive. Only the exact string 'strict' → strict.
ssh soullab@minisforum 'docker exec maia-sovereign printenv ACCESS_CONTROL_MODE; echo "printenv_exit=$?"'

# 2. The one live supply channel (host-only, gitignored).
ssh soullab@minisforum 'grep -n ACCESS_CONTROL_MODE ~/MAIA-SOVEREIGN/.env.production || echo "ABSENT from .env.production"'

# 3. What docker recorded at container creation — catches a manual -e override.
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{range .Config.Env}}{{println .}}{{end}}" | grep -i ACCESS_CONTROL || echo "ABSENT from Config.Env"'

# 4. Does the DEPLOYED BUILD read it at runtime at all, or did the build inline a value?
#    Expect the literal to appear in the server bundle as a runtime lookup.
ssh soullab@minisforum 'docker exec maia-sovereign sh -c "grep -rl ACCESS_CONTROL_MODE .next/server 2>/dev/null | head -3" || echo "NOT FOUND in .next/server"'
```

⭐ **(4) is not redundant.** It is the one check that distinguishes *"the variable is unset"*
from *"the variable is unread"*. If the deployed bundle does not reference it, then setting
it in `.env.production` would change nothing without a rebuild — and a future strict-mode
repair could appear to land while the served behaviour never moved. Run it even if (1)
answers cleanly.

Custody for the reply: paste the four outputs verbatim. ⛔ Do not summarize (1) as
*"unset"* — the exit status and the empty line are the evidence.

## 7. Disposition

**U-1 NARROWED, ⛔ NOT CLOSED.**

- ⭐ **ENTAILED**: production runs `permissive`; the 79 unmapped routes are handler-authorized,
  and the eight findings F-01…F-08 stand as census-classified.
- ⛔ **NOT WITNESSED**: no current production read exists in this or any committed record.
- **The inversion condition is single and specific**: `ACCESS_CONTROL_MODE=strict` present in
  the host-only `.env.production` (or a manual container override). If it is there, the 79
  unmapped routes are matrix-denied, F-02, F-03, F-04, F-06 become unreachable as posed, and
  **F-01 and F-05 survive unchanged** — both are on *mapped* routes and never depended on the
  permissive default.

⭐ **That last clause is the part worth carrying**: the two strongest findings in the census
do not rest on U-1 at all. Whichever way this bit falls, `POST /api/practitioners/create`
takes its target from the body behind a tier-only gate, and `GET /api/stellium/chart/[clientId]`
checks a real relationship against a query-string assertion.

⛔ **No finding is reclassified by this act.** ⛔ **Nothing was repaired, modified, deployed,
restarted, or probed.** Source, configuration, schema and production are untouched.

**STOP.**
