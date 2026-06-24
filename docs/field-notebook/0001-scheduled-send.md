# 0001 — Scheduled Send (L2 / first outward action)

- Date opened:  2026-06-18
- Last reviewed: 2026-06-18
- Status:        divergence-found
- Entry type:    internal-engineering
- Confidence:    L2 (delivery rail) · L1 (member-used executor certification)

## Context
MAIA's first move from *reflection* to *action*: a one-time, human-authored email sent at a
chosen time. The question was whether agency could cross outward without violating the consent
spine — could a member author content+recipient+time, grant permission once, and have it
dispatched and audited, with nothing inferred or initiated by the system.

## Constitutional Prediction
`docs/canon/MAIA_CONSENT_GATES.md` — Article 2 (Proposal gate: never silently), Article 5
(Standing: granted, revocable, domain-scoped), Article 6 (Grants are mortal). Derivation in
`docs/architecture/MAIA_ASSIST_SCOPE_2026-06-17.md`.

### Expected Observation
A persisted row that *is* the permission; dispatch only after an explicit consent warrant; a
`provider_message_id` audit on send; revoke honored before the fire time.

### Potential Falsifier
Any dispatched send whose content / recipient / time was system-originated rather than
human-authored; OR a send with no consent warrant; OR a double-send (atomic-claim failure) —
which would be a **Faithful-Execution** falsifier, not a cosmetic one.

## Decision
Built (#486 · `c1c036294` · "studio"): table `scheduled_sends`, write + revoke + cron routes,
`/test`, a `consent_confirmed` warrant, UI. Email-only, one-time, human-authored.
Rejected: recurring sends, SMS, MAIA-authored content, autonomous outreach.

## Observation
Verified 2026-06-18, this session:
- Production `maia-postgres` **contains `public.scheduled_sends`** (psql `\dt`). The rail is live.
- Commit `c1c036294` (#486) is in history; migration `20260619000001_scheduled_sends.sql`.
- Project memory records a self-send delivered 2026-06-17 with `provider_message_id` —
  **not re-verified this pass** (no row inspection under member, non-self use).

## Divergence
1. A **second, parallel implementation exists**: `e5fe737c2` ("maia-assist / one-time scheduled
   message send"), table `scheduled_messages`, migration `20260618000002_scheduled_messages.sql`,
   branch-only and undeployed. Duplicate-capability debt — two table names for one capability.
2. A careful grounding agent surfaced **only** the undeployed parallel build and concluded "not
   deployed." The direct prod query corrected it.
3. The notebook author (me) repeated that doubt in narration *before* verifying.

## Epistemic Outcome
Headline: **Confirmed** — the load-bearing claim (consent-gated outward action is live) is verified;
the one unverified piece is a *certification* (mechanism), not the purpose.
Per claim:
- *`scheduled_sends` rail is live in prod* → **Confirmed** (confidence: up — psql, today).
- *There is one clean implementation* → **Diverged** (a second build, `scheduled_messages`, exists undeployed).
- *The member-path executor preserves authorship + consent end-to-end* → **Underdetermined** (UI A/B not run; self-send only).

No falsifier fired: no evidence of an unauthorized or system-originated send.

## Promotion
**Claimed**
- Level: Constitution-adjacent — *governance extends from knowledge to agency*.
- Date: 2026-06-17
- Rationale: first live Commit-tier outward action under the warrant model.

**Verified**
- Level: Operation / Evidence
- Date: 2026-06-18
- Evidence: prod table `scheduled_sends` exists (psql); #486 in git history.
- Verified by: Claude — prod psql + git, this session.
- NOTE: the **email executor is not yet certified** — pending UI A/B
  (A = UI Send preserves authorship + consent to execution; B = UI Revoke proves revocability).

**Refuted / Demoted** — none.

## Confidence note
L2 for the rail (table live, code present, doctrine explicit). L1 for the *member-used* executor
(self-send only; A/B not run). Last reviewed 2026-06-18.

## Self-audit
**Mistaken picture:** a reader with only this entry would conclude *the project is about safe
communication* — sending messages without leaks. Incomplete: the send is one instance of a deeper
claim — *authored, consented, revocable outward action* — of which email is merely executor #1.
**Generative case that restores the whole:** the second executor (calendar; 0004's open question),
which shows the project is about authored *action*, not email. *(Two entries now commission this
case — see 0004.)*

## Open Questions
- Is there a real `sent` row with `provider_message_id` under member (non-self) use?
- Reconcile the two implementations (`scheduled_sends` vs `scheduled_messages`) — name one
  canonical, retire the other.
- Run UI A/B to certify the executor.
- The general Authorized-Action → Executor interface is not extracted (see 0004; needs a second,
  structurally-different executor before it can be abstracted).
