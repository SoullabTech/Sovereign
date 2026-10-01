# Non-Delivery Register

**One canonical list of mechanisms that record or report something but deliver it to no one.**

Opened 2026-10-01 by founder direction. In one day, five such mechanisms surfaced separately, mostly by accident, and their records ended up on different session branches.

## Rule

Any record that declares a non-delivery state adds a line here **in the same change**. A non-delivery state written only in a lane record does not count as declared.

A line leaves the register only when its closure condition is met and witnessed. Delete the line in that change and cite the evidence in the commit message.

## Evidence classes

- **SOURCE**: read in the canonical source at the stated commit.
- **RECORD**: stated in a programme record, cited by path and commit.
- **REPORTED**: reported by the founder; no source or record located yet. An open item, ⛔ not a verified fact.

## Register

| # | Mechanism | What it claims or records | What is actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| 1 | Deploy alert path (`/api/build/alert`) | Deploy and build failures raise an alert | Nothing while `INTERNAL_ALERT_TOKEN` / `ALERT_SMTP_*` / `ALERT_FROM` are unset. The send returns 503. | REPORTED (unconfigured) + RECORD: `c0edc6e5e7c868e2ed271b130b5f2a69975b0206` on `fix/deploy-ancestry-and-alert-honesty-20261001` (unmerged) makes the smoke test name the 503 reason. | unassigned | OPEN | The production env is configured and a deploy smoke delivers a real alert to a human, witnessed. |
| 2 | Safety circuit breaker (`lib/consciousness/autonomy/SafetyCircuitBreakers.ts`) | `intervention.humanNotified = true` | A `console.log`. The flag is set whether or not `onHumanNotification` is wired. | SOURCE: canonical `8f8ba73b83397c716722c7c9f5835c02d131cae8`, `notifyHumans()`, which logs `Human notification sent` and then assigns `intervention.humanNotified = true`. ⚠️ Whether this path is reachable in production was **not** checked. | unassigned | OPEN | `humanNotified` is set only after a delivery that is confirmed or falsifiable, or the field is removed; reachability is established either way. |
| 3 | Crisis pipeline | Crisis signals are handled | Console logging only | REPORTED. ⚠️ Source location not identified in the session that opened this register. | unassigned | OPEN · **safety-critical** | A record names the code path and a human-facing delivery is witnessed. |
| 4 | Postgres standby (`ubuntu-8gb-fsn1-2`) | A replication standby exists | Nothing. Tailscale shows the host offline, last seen 7 days ago; `pg_stat_replication` returns 0 rows. | RECORD: `docs/programme/WS-ADVANCED-RUNTIME-01_RC1_PRODUCTION_WITNESS_2026-10-01.md` @ `ac21d53ff9743f14175921a5452d196200938109` on `claude/wonderful-newton-ddw3gx` (unmerged). | unassigned | OPEN | `pg_stat_replication` shows the standby streaming, witnessed. |
| 5 | JARVIS consequence findings (`projectConsequenceFindingV1`) | A finding about a lane reaches that lane | Nothing. The projection has no runtime caller, **and no runtime code produces a consequence finding at all.** | RECORD: `docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O5-R4_FREEZE_AMENDMENT_2_AND_DELIVERY_STATE_2026-10-01.md` §4–§5 (this change). | founder (decision pending) | OPEN · ⚠️ declared, not yet accepted | The founder accepts the non-delivery state, or a runtime-caller lane closes it. |

## Not a register of failures

Some lines may be lawful, deliberate states. Line 5 satisfies every frozen law that governs it. The register exists so a non-delivery state is **visible**, not so it is presumed wrong.
