# Comms: `/studio/comms` vs `/stellium/comms` — design note

**Date:** 2026-06-17
**Status:** Open architectural decision. One bug fix shipped ([Sovereign#491](https://github.com/SoullabTech/Sovereign/pull/491)); UI/architecture deliberately deferred.
**Author of note:** drafted by Claude during the "get comms running" session; filing/decision is Kelly's.

---

## TL;DR

The task began as *"wire `/studio/comms` mock data to the live backend (read-only)."* While preparing the PR off `main` it surfaced that **the real comms inbox already exists and works at `/stellium/comms`**, and `/studio/comms` was *deliberately* set to an honest empty state ([#417](https://github.com/SoullabTech/Sovereign/pull/417)). The original plan was built against a **stale branch** (`feature/rapport-pilot-v1`, ~143 commits behind `main`) that still had the old mock page. Shipping it would have reverted #417, duplicated `/stellium/comms` with a *less capable* read-only clone, and made an architecture decision implicitly.

**Action taken:** ship only the objectively-broken piece — the inbox query 500 (#491). Everything else left uncommitted pending a deliberate decision.

---

## What I found

| Surface | State on `main` | Wiring |
|---|---|---|
| **`/stellium/comms`** | **Canonical, working** (live since Jan 2026) | Fetches `/api/comms/inbox`; renders thread list, thread detail (`/stellium/comms/[threadId]`), safety ribbon + **safety-flag management**, domain summaries. |
| **`/studio/comms`** | **Honest empty state** ([#417](https://github.com/SoullabTech/Sovereign/pull/417), Jun 11) | No inbox. Only live capability = outbound SMS via `/api/notifications/sms`. Its own comment: *"inbox exists separately on /stellium/comms … we therefore show a truthful empty state."* |
| **Backend** (`lib/comms/*`, 14 `comms_*` tables) | Real, shared by both | `InboxService`, `ThreadService`, `ReplySuggestionService`, `SafetyService`, Resend/Twilio providers. |

Two latent defects in the shared backend, found during integration:

1. **`/api/comms/inbox` 500s** — `getInbox()` `GROUP BY t.id` with non-aggregated `t.*` columns; `comms_threads` has **no PRIMARY KEY** → Postgres `42803`. This breaks the live `/stellium/comms` inbox. **→ Fixed in [#491](https://github.com/SoullabTech/Sovereign/pull/491)** (portable GROUP BY).
2. **`comms_*` tables lack PRIMARY KEY constraints.** Root cause of (1). A migration (`20260617000002_comms_spine_primary_keys.sql`) is staged to add them — **separate PR, Class B** (migration).

## Why the original plan changed

- The plan ("replace mock with live, read-only") was correct **for the page I started from** — the 474-line mock `/studio/comms` on the stale feature branch.
- On `main` that page no longer exists: #417 already removed the mock (a claim-discipline move) and pointed users at the working `/stellium/comms`.
- Therefore the rewrite was solving an already-solved problem in the wrong place. Proceeding would have been an **accidental architectural regression** (revert #417 + duplicate the canonical inbox with a weaker read-only version).
- Discipline applied: *fix what is unquestionably broken (the SQL bug); do not choose the future architecture implicitly inside an integration PR.*

## The open question (for explicit decision — not code)

> **Why do both `/stellium/comms` and `/studio/comms` exist?**

Working hypothesis (unconfirmed): "Stellium" is the original practitioner portal; "Studio" (`/studio/*`) is the newer unified practitioner shell absorbing those modules (Command Center, Clients, Sessions, Calendar, Comms…). If so, `/studio/comms` is the intended long-term home and `/stellium/comms` is the current working one — but this should be **stated explicitly**, not inferred. If they serve different purposes, define them. If not, pick one canonical surface and make the other an alias or remove it.

## What consolidation would require (if `/studio/comms` becomes canonical)

1. **Port the proven `/stellium/comms` inbox** onto `/studio/comms`, reconciled against `main` — **not** the stale read-only rewrite from this session.
2. **Preserve `/stellium/comms`'s capabilities:** thread detail route, safety ribbon + **safety-flag acknowledge**, domain summaries, reply suggestions.
3. **Decide outbound SMS:** #417 intentionally kept SMS compose as `/studio/comms`'s "only live capability." Consolidation must decide whether it stays.
4. **Decide read-only vs. action:** moving from "view" to "reply/send" is a governance crossing (representation → action) requiring explicit authorization — not an implicit side effect.
5. **Practitioner vocabulary:** route domain labels through a translation layer (e.g. Clients / Admin / Community rather than the schema's clinical / ops / community).
6. **Resolve `/stellium/comms`:** redirect/alias, deprecate, or differentiate.
7. **Land the `comms_threads` PK migration** (`20260617000002`) separately (Class B).

## Salvageable artifacts from this session (uncommitted, reference only)

These are **read-only and less capable than `/stellium/comms`** — use as reference, prefer porting Stellium's implementation:

- `lib/studio/commsApi.ts` — typed read-only fetchers (inbox/thread/suggestions) + a domain→label translation layer.
- `components/studio/CommsThreadDetail.tsx` — read-only thread view (messages, safety flags, MAIA reply suggestions; explicit "sending disabled" notice).
- rewrites of `app/studio/comms/page.tsx` and `app/studio/comms/[messageId]/page.tsx` (domain-based filters, live inbox).

## Shipped vs. held

- **Shipped:** [#491](https://github.com/SoullabTech/Sovereign/pull/491) — the inbox query fix (Class C, 1 file).
- **Held (uncommitted on `feature/rapport-pilot-v1`):** all `/studio/comms` UI changes; the PK migration (`20260617000002`) awaits its own PR.
