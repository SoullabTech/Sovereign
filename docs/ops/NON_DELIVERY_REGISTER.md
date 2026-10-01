# Non-Delivery Register

**One canonical list of mechanisms that record or report something but deliver it to no one.**

Opened 2026-10-01 by founder direction. On that day more than five such mechanisms surfaced separately, mostly by accident, and their records sat on different session branches.

## Rules

1. **Same change.** Any record that declares a non-delivery state adds its line here in the same change. A state written only in a lane record does not count as declared.
2. **No silent omission.** A register that is missing entries tells readers those gaps do not exist, which is worse than having no register. When in doubt, list it and mark the evidence class.
3. **Closure is witnessed.** A line leaves only when its closure condition is met and witnessed. Delete it in that change and cite the evidence in the commit message.
4. **Lane registers feed this one.** A lane may keep a detailed register (EMAIL-IDENTITY-01 does). Each of its lines that is a non-delivery state also appears here, citing that record.
5. **Commit references** are written as the word `commit`, a colon, then the full SHA in backticks, as in the Evidence column below. The SHA is copied from command output, never typed. `npm run check:record-shas` verifies each one is a commit in this repository and fails any malformed reference.

## Evidence classes

- **SOURCE**: read in the canonical source at the stated commit.
- **RECORD**: stated in a programme record, cited by path and commit.
- **REPORTED**: reported by the founder or another session; not yet located in source or a record. An open item, ⛔ not a verified fact.

Canonical source reads below are at commit:`cf9624cdf5c12b61cae250f0761b7b793e742a37` unless stated.

## Register

### Member safety

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| S1 | **Crisis pipeline** (`lib/safety-pipeline.ts`) | A crisis alert reaches an on-call human (`alertService.sendAlert`) | `console.error('Alert service or therapist database not configured for crisis alert')` and nothing else. `PersonalOracleAgent` constructs `new MAIASafetyPipeline()` with **no alert service and no therapist DB**, so every crisis alert on that path stops at the guard. Only `IntegratedSafetySystem` passes both. | SOURCE: `lib/agents/PersonalOracleAgent.ts` (`this.safetyPipeline = new MAIASafetyPipeline()`) and `lib/safety-pipeline.ts` (the guard before `sendAlert`). Also reported by the session behind [#1621](https://github.com/SoullabTech/Sovereign/pull/1621); the #1621 PR body does not record it, so this line rests on the source read. | unassigned | OPEN · **safety-critical** | Every constructor reachable from a member turn is given a delivering alert path, or the path is removed; one crisis alert is witnessed reaching a human. |
| S2 | **Teen safety alert** (`alertSoullabTeam` in `lib/safety/teenSupportIntegration.ts`) | Soullab team, and Phase 2 guardians, are alerted | `console.warn('[TEEN SAFETY ALERT]', …)` only. Guardian notification and the `guardian_safety_alerts` insert are `TODO (Phase 2)`. **The function has no caller** in `lib/` or `app/`. | SOURCE. | unassigned | OPEN · **safety-critical** | A caller exists on the teen path and its alert is witnessed reaching a human, or the function is removed and the gap is recorded where teen safety is designed. |
| S3 | **Stellium practitioner safety notice** (`lib/notifications/safety.ts`) | A practitioner is emailed when a client raises a safety concern | Sent from `Stellium <notifications@soullab.ai>`. Delivery is **currently impossible** (E1), and `soullab.ai`'s Resend verification is unknown. A refusal is logged and recorded as `safety_concern_logs.email_status='failed'`, but **nothing pages anyone on that row.** `safety_concern_logs` had 0 rows ever at the time of the record, so there is no historical exposure. | SOURCE (sender) + RECORD: EMAIL-IDENTITY-01 R2 (below). | unassigned | OPEN · **safety-critical**, latent | E1 closed, `soullab.ai` verified, and a failed row pages a human. |
| S4 | **Safety circuit breaker** (`lib/consciousness/autonomy/SafetyCircuitBreakers.ts`) | `intervention.humanNotified = true` | A `console.log`. `notifyHumans()` sets the flag whether or not `onHumanNotification` is wired. | SOURCE. ⚠️ Whether this path is reachable in production was **not** checked. | unassigned | OPEN | `humanNotified` is set only after a confirmed or falsifiable delivery, or the field is removed; reachability is established either way. |

### Email transport and its dependants

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| E1 | **All Resend mail** (sign-in codes, magic links, recovery, reminders, safety notices) | Transactional mail is sent | **Nothing since 2026-09-29 00:40Z.** Resend refuses every send with `provider_auth · validation_error`; the key is well-formed, so it was revoked or regenerated in Resend. **Sign-in codes are undelivered.** The outage ran 2.5 days unseen, because `[MAIA/email] TRANSPORT_DOWN` is logged and nothing reads it. | RECORD: `docs/programme/EMAIL-IDENTITY-01_MAIL_AUTHORITY_2026-10-01.md` R1 + meta-finding, at commit:`4975677ceda48e984843405a18b07098fd234914` on `claude/intelligent-clarke-v9zk51` (unmerged). | unassigned | OPEN · ⛔ **confirmed outage** | New key, locked redeploy of the live SHA, and the delivery ledger shows `accepted` again. |
| E2 | **Uptime monitor** (`scripts/maia-monitor.js`) | Outages raise an alert | Alerts go **through Resend** (`api.resend.com`), so the monitor went silent with E1. *An alarm routed through the thing it watches is silent exactly when it is needed.* | SOURCE + RECORD: EMAIL-IDENTITY-01 meta-finding. | unassigned | OPEN | The monitor alerts over a channel independent of Resend, witnessed while Resend is down or simulated down. |
| E3 | **Member problem reports** → `problem@` | Reports reach Soullab | Unknown: the mailbox may not exist. | RECORD: EMAIL-IDENTITY-01 R3. | unassigned | UNKNOWN | An external test email arrives, or bounces and the mailbox is created. |
| E4 | **Data-rights requests** → `privacy@` | Requests reach Soullab | Unknown: the mailbox may not exist. There is a **legal deadline**. | RECORD: EMAIL-IDENTITY-01 R4. | unassigned | UNKNOWN · legal | As E3. |
| E5 | **`hello@` and other published contacts** | Mail reaches Soullab | Unknown: the mailboxes may not exist. | RECORD: EMAIL-IDENTITY-01 R5. | unassigned | UNKNOWN | As E3, per address. |
| E6 | **Replies to `bookings@` / `updates@`** | A member's reply reaches someone | No reply-to is set, so replies go nowhere useful. | RECORD: EMAIL-IDENTITY-01 R6. | unassigned | STRUCTURAL | Ruling on reply-to (practitioner or `support@`) implemented. |

EMAIL-IDENTITY-01 R7 (auth mail from `kelly@`) is a reputation and routing concern, not a non-delivery state, and is deliberately not listed.

### Operations

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| O1 | **Deploy and build alert path** (`/api/build/alert`) | Deploy and build failures raise an alert | Nothing: `INTERNAL_ALERT_TOKEN`, `ALERT_SMTP_HOST` and `ALERT_FROM` are UNSET in production (founder-confirmed), so the send returns 503. The smoke test scored that as PASS. | RECORD: [#1621](https://github.com/SoullabTech/Sovereign/pull/1621) body; its fix is commit:`c0edc6e5e7c868e2ed271b130b5f2a69975b0206` (merged via #1621 on 2026-10-01), which turns the 503 into a WARN. | unassigned | OPEN | The env is configured and a deploy smoke delivers a real alert to a human, witnessed. |
| O2 | **Postgres standby** (`ubuntu-8gb-fsn1-2`) | A replication standby exists | Nothing. Tailscale shows the host offline, last seen 7 days ago; `pg_stat_replication` returns 0 rows. | CANONICAL RECORD: this row was admitted by commit:`692d811da68105aea22abe7f7bdfd51aa699b8fa`. Source probe detail originated in the unmerged `docs/programme/WS-ADVANCED-RUNTIME-01_RC1_PRODUCTION_WITNESS_2026-10-01.md` at `ac21d53ff9743f14175921a5452d196200938109`; that source is **not canonical custody**. | unassigned | OPEN | `pg_stat_replication` shows the standby streaming, witnessed. |

### Development orchestration

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| D1 | **JARVIS consequence findings** (`projectConsequenceFindingV1`) | A finding about a lane reaches that lane | Nothing. The projection has no runtime caller, **and no runtime code produces a consequence finding.** | RECORD: `docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O5-R4_FREEZE_AMENDMENT_2_AND_DELIVERY_STATE_2026-10-01.md` §4–§6. | founder | ⭐ **ACCEPTED** as a declared state (founder ruling 2026-10-01), under the ratified rule that consequence findings are **never a safety channel**. | A runtime-caller lane is opened and closes it. Until then the state stands as declared. |

## Not a register of failures

Some lines are lawful, deliberate states; D1 satisfies every frozen law that governs it. The register exists so a non-delivery state is **visible**, not so it is presumed wrong.

The pattern across the register: four of the safety-relevant lines (S1, S2, S3, S4) end at a console log or an unread database row, and two of the alarms (E2, O1) depend on the transport they are meant to watch, or on configuration nobody set. *Recording a failure is not the same as someone seeing it.*
