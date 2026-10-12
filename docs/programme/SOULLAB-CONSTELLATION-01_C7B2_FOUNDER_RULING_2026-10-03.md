# C7B2 — approved scope and founder working process

**Programme:** SOULLAB-CONSTELLATION-01
**Act:** C7B2 — founder approval; begin submission/withdrawal substrate and accessible working surface
**Predecessor:** SOULLAB-CONSTELLATION-01_C7B_PARTICIPATION_2026-10-03.md
**Standing:** BUILD AUTHORIZED — one experience, maximum 30-day retention, author-controlled withdrawal, optional invitation attribution, no return tracking or marketing follow-up. Production activation and member enrollment are not authorized by this act.

## Founder act, as received

Kelly asked for easy access from admin and a working process with his AI team, then said "approved" and explicitly answered "yes" to: "Do you approve that one-experience, 30-day scope as the basis for building the real participation and withdrawal flow?"

The answer is recorded as approval of the scoped BUILD, not inferred from praise, not approval of an unseen implementation, and not member consent. The former C7B1 retention proposal is now the authorized design basis. Do not ask Kelly to approve this same scope again.

## Binding product scope

One voluntary report about one Writer's Studio experience. Activity and usefulness are separate member-selected facts. Invitation attribution is a separate optional choice, not a permanent identity or inferred source. Uncertainty and negative feedback remain valid. No private writing, conversation, birth data, marketing contact, model-training consent, public testimonial, return tracking, or longitudinal behavioral record is included.

A report is excluded immediately on author withdrawal and after 30 days. Deletion, expiry, retry/replay behavior, and backup limitations must be verified before live collection opens. The 30-day approval is not evidence that current backups satisfy it. No automatic collection flag, cron, migration, cohort, or deploy is activated here.

## One founder workspace, not another dashboard

The browser entry should be **Admin → Growth & AI work** leading into the existing founder Constellation area, with **Doorway learning** and the participation preview in the same workspace. JARVIS/Kelly's World remains the governed operator and execution surface. ChatGPT and other authorized AI partners can help with bounded briefs and artifacts; no worker, conversation, or automatic delegation is claimed unless it is really connected.

Working rhythm: choose one outcome → inspect evidence → prepare a bounded brief → AI team drafts/builds/tests → Kelly reviews decisions and outward commitments → explicitly authorized release → inspect what happened. The browser must offer functional links and an explicit copyable working brief rather than an inert chat box or a pretend agent team. A copied brief grants no execution authority.

## First implementation boundary

Build the storage lifecycle as a separately testable candidate. Schema lives outside automatic migration discovery until a later migration/rollout act. A short-lived author-bound submission opportunity is not participation evidence; its atomic consumption plus an inserted report forms the submission. Retry recovers the same held report; withdrawal removes report content without renewing the consumed opportunity; expiry never renews authority. Only owner-scoped reads/deletion and grouped counts may cross the boundary. No raw private row is sent to an AI partner.

The candidate collection boundary stays closed. The first proof uses a disposable local PostgreSQL cluster with synthetic fixtures, not the production or member-development database. Scheduled cleanup and backup custody remain release obligations, not asserted by a unit test.

## Acceptance obligations before declaring the substrate verified

- Strict request vocabulary; reject preview payloads, unknown fields, free text, missing explicit submission agreement, and unconfirmed attribution.
- Two concurrent submissions for one opportunity produce one new report; retry returns that record without changing its expiry.
- Other members cannot use the opportunity, recover its report, or withdraw it.
- Withdrawal removes the report from active tables and a replay cannot recreate it, before or after the opportunity's expiry.
- Expired reports never appear in reads; cleanup removes expired active-table records without touching current records.
- Database failures roll back claim and insert together. No partial-success response.
- A live rollout requires authenticated route/UI wiring, cleanup operation, backup handling and founder activation beyond this candidate.

## Current progress

**Built in this candidate:** accessible `Admin → Growth & AI work` navigation; founder-authenticated `/founder/constellation/work`; a bounded, inspectable, copyable brief; and the isolated submission/withdrawal lifecycle store. The participation rehearsal footer now acknowledges the approved scope.

**Verified:** 140 Constellation tests across 14 suites; focused founder-workspace strict typecheck; isolated experience-store `strict` plus `noUncheckedIndexedAccess` typecheck; 19 checks against real disposable PostgreSQL; desktop/mobile GrowthWork rendering and copy-action tests using a mocked clipboard sink; signed-out founder refusal. These are different evidence classes, not one production pass.

The PostgreSQL witness forced both competing submissions to block at the claim boundary before releasing them: one created a report and one recovered it. It also exercised foreign access/withdrawal refusal, unchanged retry expiry, atomic rollback on an injected insert failure, author deletion, no replay resurrection, expired-read exclusion, cleanup and member-deletion cascades.

**A real defect was found and corrected:** a PostgreSQL `30 days` calendar interval lasted 30 days plus one hour across the autumn clock change. The candidate now uses exactly `720 hours`, and the same elapsed-time test passes without changing the server timezone to conceal the defect. The first cluster start separately failed on inherited locale; the harness now pins `LC_ALL=C` and uses only its own private socket directory.

The local witness creates a fresh database and synthetic member table, checks its data directory, and destroys its own cluster afterward. It does not use `DATABASE_URL` or inspect member data. Active-table deletion is not claimed as forensic disk or backup erasure.

Evidence: `docs/programme/evidence/SOULLAB-CONSTELLATION-01/C7B2-postgres-witness.json` and `C7B2-growth-work-witness.json`.

**Not implemented or activated:** member HTTP submission/withdrawal routes and final UI binding; rollout admission; running cleanup schedule; backup erasure/restore reconciliation; live report aggregation for this source; automatic AI-worker dispatch or an embedded agent conversation. Schema remains outside automatic migration discovery; the store has no production caller. No production change, member collection or scheduled background job was performed.

The approved scope is no longer a pending question. The next work is implementation and operational verification against that approval, with a separate activation decision.
