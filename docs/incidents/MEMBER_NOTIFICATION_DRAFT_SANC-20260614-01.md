# Member Notification — READY TO SEND (Kelly's send) — SANC-20260614-01

**Status (updated 2026-07-17 evening)**: ALL send-gates are now met — (1) containment
deployed to production (`33ec88ac6`: S1 store-boundary refusal + S2 oracle-lane
disable, verified live), (2) deletion complete and verified, (3) contaminated backups
destroyed with audit. Remaining before send: **Kelly's independent fact-check** against
`SANCTUARY_PRODUCTION_EVIDENCE_2026-07-17.md`, the incident record, and the backup
destruction audit; fill the [name]/[contact]/sign-off placeholders; choose the
channel. The affected member is the holder of member-id prefix `ce284751` (resolve
identity operationally via the members table — deliberately not written here). The
send itself is Kelly's act.

---

Subject: Something Sanctuary promised you — and where we broke that promise

Dear [name],

Sanctuary mode makes you one promise: what you say there won't be remembered. On one
occasion, we broke that promise, and I want to tell you exactly what happened.

**What happened.** On June 14, 2026, between roughly 12:44 and 12:58 UTC — a period of
about fourteen minutes — you used Sanctuary mode for five exchanges. Those five
exchanges should never have been stored. They were. The full text of what you said and
what MAIA said back was written into our internal conversation records and internal
processing logs: ten conversation-turn records, forty-four processing-log records, five
integration records, and five entries in the session's history record.

**What was not affected.** Everything before you switched Sanctuary on that day, and
every other session you've ever had, behaved normally. No kept moments, marks, themes,
or memory entries were created from the Sanctuary exchanges. We found no evidence that
any person viewed the content, and no evidence it was ever visible to any other member.

**What we did.** When we discovered this on July 17, we located the records by their
timestamps — deliberately without reading their content; the investigation used only
counts and timestamps — and deleted them the same day, verifying afterward that they
are gone. Our nightly database backups made between June 17 and July 17 contained
copies of those records; on July 17 we intentionally destroyed all thirty of those
backup files, ahead of their normal expiration, after taking a fresh backup of the
already-cleaned database. No off-site copies existed.

**Why it happened.** The Sanctuary check lived in the wrong place — in the code that
*calls* our storage, rather than in the storage itself. One writing path didn't check,
and everything it was handed, it kept.

**What we changed.** The storage layer itself now refuses Sanctuary content — every
writing path that failed here now cannot store a Sanctuary exchange regardless of what
the code above it does. We also shut down an old, unused processing route that had no
Sanctuary handling at all. Further work is underway to make Sanctuary status provable
server-side for every single exchange, and we won't consider this fully closed until
that ships.

**What remains uncertain.** Because some older records don't carry enough information
to trace their origin, we can say "we found no other trace of Sanctuary content
anywhere else" — but not, with absolute certainty, "nothing else ever escaped." We
looked everywhere the data could let us look. That distinction matters to us, so we're
giving it to you plainly.

You trusted Sanctuary with something, and the system did not keep its side. I'm sorry.
If you want to talk through any of this — what was stored, what was deleted, or what
we've changed — reply to this message or reach me directly at [contact].

[Kelly's sign-off]

---

## Send qualities (Kelly ruling): direct acknowledgment · exact facts · completed
repair · responsibility without dramatization. Not legalistic, not defensive.
Channel: the most personal appropriate one.

## Post-send record (fill in after delivery — nothing else goes here)

- Delivery date and channel:
- Delivery succeeded:
- Member responded:
- Requested follow-up:

## Fact-check anchors (for Kelly's independent verification, not part of the message)

- Date/window/counts: `SANCTUARY_PRODUCTION_EVIDENCE_2026-07-17.md` §1
- Deletion + verification: `INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md` execution log
- "No evidence of human review / cross-member access": no reader surfaces exist for
  the affected tables (refusal-02/-06 pattern); no admin access claim was checked
  beyond this — if Kelly ever queried these tables with content columns, amend the
  sentence before sending.
- Backup rotation: 30 daily dumps observed 2026-06-17 → 2026-07-17; expiry estimate
  assumes rotation continues.
- "Cannot say nothing else ever escaped": atoms lane unattributable (no session
  provenance); pre-observability periods invisible.
