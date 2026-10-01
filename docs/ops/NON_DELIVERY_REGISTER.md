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
| S1 | **Crisis pipeline** (`lib/safety-pipeline.ts`) | A crisis alert reaches an on-call human (`alertService.sendAlert`) | Canonical still constructs `new MAIASafetyPipeline()` without practitioner dependencies. **Repair candidate:** that missing/deferred/failed practitioner path now falls through to `deliverHumanSafetyAlert()`, which attempts independent Twilio SMS and Slack delivery and returns false unless a provider accepts the alert. Raw member message content is excluded from the fallback payload. | SOURCE re-read at commit:`a999932df7aa3d4052ee78f044878026aa4f680b`; repair candidate on `fix/safety-human-delivery-r1-20261001`. Targeted transport/route tests 8/8 pass; production human witness still owed. | safety-human-delivery-r1 | REPAIR CANDIDATE · **safety-critical** · witness owed | Candidate merged and one crisis alert is witnessed reaching a human through either the practitioner path or the independent fallback. |
| S2 | **Teen safety alert** (`alertSoullabTeam` in `lib/safety/teenSupportIntegration.ts`) | Soullab team, and Phase 2 guardians, are alerted | **Current canonical correction:** `components/OracleConversation.tsx` now calls `alertSoullabTeam` from teen crisis mode, but canonical delivery still ends at `[SAFETY_NOTIFY_NO_RECIPIENT]`. **Repair candidate:** the browser caller posts a strict content-free event to authenticated `/api/safety/human-alert`; the server returns 503 unless SMS or Slack accepts it. Guardian delivery remains Phase 2. | SOURCE re-read at commit:`a999932df7aa3d4052ee78f044878026aa4f680b`; repair candidate on `fix/safety-human-delivery-r1-20261001`. | safety-human-delivery-r1 | REPAIR CANDIDATE · **safety-critical** · witness owed | Candidate merged and one teen crisis alert is witnessed reaching a Soullab human; guardian semantics remain separately governed. |
| S3 | **Stellium practitioner safety notice** (`lib/notifications/safety.ts`) | A practitioner is emailed when a client raises a safety concern | Practitioner email still depends on E1 and remains independently unresolved. **Repair candidate:** practitioner-not-found, missing-email, provider refusal, and exception paths now invoke `deliverHumanSafetyAlert()` so a failed email attempts independent SMS/Slack paging without message content. The original `safety_concern_logs.email_status='failed'` audit remains intact. | SOURCE re-read at commit:`a999932df7aa3d4052ee78f044878026aa4f680b`; repair candidate on `fix/safety-human-delivery-r1-20261001`. Production paging witness still owed. | safety-human-delivery-r1 | REPAIR CANDIDATE · **safety-critical**, latent · witness owed | Candidate merged and a simulated or real practitioner-email refusal is witnessed paging a human independently of Resend; E1 may remain open separately. |
| S4 | **Safety circuit breaker** (`lib/consciousness/autonomy/SafetyCircuitBreakers.ts`) | `intervention.humanNotified = true` | A `console.log`. `notifyHumans()` sets the flag whether or not `onHumanNotification` is wired. | SOURCE. ⚠️ Whether this path is reachable in production was **not** checked. | unassigned | OPEN | `humanNotified` is set only after a confirmed or falsifiable delivery, or the field is removed; reachability is established either way. |

### Email transport and its dependants

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| E1 | **All Resend mail** (sign-in codes, magic links, recovery, reminders, safety notices) | Transactional mail is sent | **Nothing since 2026-09-29 00:40Z.** Resend refuses every send with `provider_auth · validation_error`; the key is well-formed, so it was revoked or regenerated in Resend. **Sign-in codes are undelivered.** The outage ran 2.5 days unseen, because `[MAIA/email] TRANSPORT_DOWN` is logged and nothing reads it. | RECORD: `docs/programme/EMAIL-IDENTITY-01_MAIL_AUTHORITY_2026-10-01.md` R1 + meta-finding, at commit:`4975677ceda48e984843405a18b07098fd234914` on `claude/intelligent-clarke-v9zk51` (unmerged). | unassigned | OPEN · ⛔ **confirmed outage** | New key, locked redeploy of the live SHA, and the delivery ledger shows `accepted` again. |
| E2 | **Uptime monitor** (`scripts/maia-monitor.js`) | Outages raise an alert | **Current canonical correction:** the monitor already contains Twilio SMS alongside Resend, but no Twilio credentials/recipients are configured in the inspected production env, so its independent path is operationally absent. Its `--test` mode also previously printed success without proving any non-Resend delivery. **Repair candidate:** shared Twilio env names plus Slack support, and test mode exits nonzero unless SMS or Slack accepts both DOWN and RECOVERED alerts. | SOURCE re-read at commit:`a999932df7aa3d4052ee78f044878026aa4f680b`; production key-presence check found no Twilio/Slack safety transport configured; repair candidate on `fix/safety-human-delivery-r1-20261001`. | safety-human-delivery-r1 | REPAIR CANDIDATE · config + witness owed | Configure at least one independent channel; `npm run check:safety-human-delivery` must report `READY`; then witness `node scripts/maia-monitor.js --test` deliver both alerts to a human while Resend is unavailable or ignored. |
| E3 | **Member problem reports** → `problem@` | Reports reach Soullab | Unknown: the mailbox may not exist. | RECORD: EMAIL-IDENTITY-01 R3. | unassigned | UNKNOWN | An external test email arrives, or bounces and the mailbox is created. |
| E4 | **Data-rights requests** → `privacy@` | Requests reach Soullab | Unknown: the mailbox may not exist. There is a **legal deadline**. | RECORD: EMAIL-IDENTITY-01 R4. | unassigned | UNKNOWN · legal | As E3. |
| E5 | **`hello@` and other published contacts** | Mail reaches Soullab | Unknown: the mailboxes may not exist. | RECORD: EMAIL-IDENTITY-01 R5. | unassigned | UNKNOWN | As E3, per address. |
| E6 | **Replies to `bookings@` / `updates@`** | A member's reply reaches someone | No reply-to is set, so replies go nowhere useful. | RECORD: EMAIL-IDENTITY-01 R6. | unassigned | STRUCTURAL | Ruling on reply-to (practitioner or `support@`) implemented. |

EMAIL-IDENTITY-01 R7 (auth mail from `kelly@`) is a reputation and routing concern, not a non-delivery state, and is deliberately not listed.

### Operations

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| O1 | **Deploy and build alert path** (`/api/build/alert`) | Deploy and build failures raise an alert | Nothing: `INTERNAL_ALERT_TOKEN`, `ALERT_SMTP_HOST` and `ALERT_FROM` are UNSET in production (founder-confirmed), so the send returns 503. The smoke test scored that as PASS. | RECORD: [#1621](https://github.com/SoullabTech/Sovereign/pull/1621) body; its fix is commit:`c0edc6e5e7c868e2ed271b130b5f2a69975b0206` (merged via #1621 on 2026-10-01), which turns the 503 into a WARN. | unassigned | OPEN | The env is configured and a deploy smoke delivers a real alert to a human, witnessed. |
| O2 | **Postgres standby** (`ubuntu-8gb-fsn1-2`) | A replication standby exists | Nothing. Tailscale shows the host offline, last seen 7 days ago; `pg_stat_replication` returns 0 rows. | CANONICAL RECORD: this row was admitted by commit:`692d811da68105aea22abe7f7bdfd51aa699b8fa`. The detailed production witness is now canonical at `docs/programme/WS-ADVANCED-RUNTIME-01_RC1_PRODUCTION_WITNESS_2026-10-01.md`, admitted by commit:`6fddbf97cc9f3e0f4943eccb7ca4373100d760ae`. | unassigned | OPEN | `pg_stat_replication` shows the standby streaming, witnessed. |

### Development orchestration

| # | Mechanism | Claims or records | Actually delivered | Evidence | Owner | Status | Closes when |
|---|---|---|---|---|---|---|---|
| D1 | **JARVIS consequence findings** (`projectConsequenceFindingV1`) | A finding about a lane reaches that lane | Nothing. The projection has no runtime caller, **and no runtime code produces a consequence finding.** | RECORD: `docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O5-R4_FREEZE_AMENDMENT_2_AND_DELIVERY_STATE_2026-10-01.md` §4–§6. | founder | ⭐ **ACCEPTED** as a declared state (founder ruling 2026-10-01), under the ratified rule that consequence findings are **never a safety channel**. | A runtime-caller lane is opened and closes it. Until then the state stands as declared. |

## Not a register of failures

Some lines are lawful, deliberate states; D1 satisfies every frozen law that governs it. The register exists so a non-delivery state is **visible**, not so it is presumed wrong.

The pattern across the register: four of the safety-relevant lines (S1, S2, S3, S4) end at a console log or an unread database row, and two of the alarms (E2, O1) depend on the transport they are meant to watch, or on configuration nobody set. *Recording a failure is not the same as someone seeing it.*
