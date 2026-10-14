# Pro Studio / MAIA R5gA — Authenticated Recall Preferences (October 14, 2026)

Status: **ISOLATED, SOURCE-ONLY FIX — TECHNICAL RELEASE QUALIFICATION PENDING**
Parent frozen R5f: `7d3e4823f57bccd6e6326c7a651d6a81fc27a46b`.
Held branch/worktree: `fix/pro-studio-r5gA-recall-preference-auth-20261014` on authorized T7 Shield.
No production changes, member records, beta flags, invites, provider calls or migrations.

## Verified existing vulnerability in R5f
`GET` and `PATCH /api/members/recall-preferences` previously used
`getCurrentSession()` OR `request.nextUrl.searchParams.get('memberId')`.
When unauthenticated, anyone supplying another member ID in the query could
attempt to read or alter that member's conversational/episodic recall flags.
This is a **source-established authorization gap**, not proof that any
external attacker accessed real settings. Recall flags alter later private
memory exposure, so treating this as a convenience fallback is unacceptable.

## Narrow R5gA correction
- Only `getMemberIdFromRequest(request)` authenticates the requested
  member from a verified, unrevoked session cookie or verified Safari
  session-token header. URL/body `memberId` never determines ownership.
- Unauthenticated requests refuse 401 before database queries.
- A cookie A plus URL memberId B still reads/writes only A. DB/session
  verification error refuses (500), not fallback B.
- All responses carry `Cache-Control: private, no-store` and
  `Vary: Cookie, Origin`.
- Null/unknown persisted preference flags are represented as false,
  respecting withheld historical consent. Existing expressly true member
  recall preferences are not silently rewritten.
- This endpoint **does not** create passage-specific chart recall grants.

## Chart recall remains a separate Class A blocker
The frozen R5f formatter `formatPriorExchangesForPrompt` was supplied a
fictional prior-session private chart passage and generic
`recallEnabled=true`. It emitted that passage in the MAIA prompt block,
despite **no source-specific chart permission**. That is a deterministic
source/formatter negative witness, **not** a real user-data disclosure.

The parallel R4L Astro Pro source keeps `R4F_MAIA_SEND_ACTIVATION_APPROVED =
false` and hard-closes automatic Western natal/BaZi ingress. Those changes
are held in their own isolated Writer's Studio integration and are NOT
merged into the R5gA branch. They prevent a new official chart transfer
but do not classify already stored raw conversations and derivatives.

A wider R5g proposal **temporarily suppresses all unclassified legacy
cross-session conversational/derived prompt context**. It passes new
privacy-focused tests but fails **3 existing Cut-1 developmental-recall
tests by design**. The proposal is therefore held, not committed or
represented as a compatible drop-in correction; it materially reduces
ordinary MAIA continuity. Its working source stays isolated at
`/Volumes/T7 Shield/pro-studio-r5g-recall-authority-20261014`, initial
tracked diff preserved at
`/Volumes/T7 Shield/ProjectCache/prostudio-r5g-recall-hold-proposal-20261014.patch`
(SHA256 `a5d5494f0fd6ba42af19fd3b446098b03da7686754d72ec0f86cacbcde7d3042`).

Before enabling future cross-session chart recall, first establish:
1. Unambiguous source lineage across chart passages, transcript turns,
   extracted developmental memories, atoms and summaries, including
   historical unknown-provenance records.
2. Separate **member-issued, per-source/per-purpose recall grant**, not a
   standing chart-view consent or global default-on conversation flag;
   server-authenticated owner, explicit expiry/scope/revocation.
3. Fail-closed suppression at **every** prompt producer/loader (including
   older raw turns, derived memories, themes, member episode and atom
   lineage), with negative tests and no chart fragments or derivatives
   crossing after revocation, account change or restore.
4. A member-visible continuity compromise decision: preserve already
   separately-authorized ordinary memory while withholding all unknown
   and unclassified chart-linked material.

## R5gA acceptance needed
Focused preference authorization tests, existing Cut-1 and memory-atom
tests, app-wide no-regression TypeScript, optimized Next build, real
fictional PostgreSQL/HTTPS A/B and revoked-session tests, owner-scoped
cache headers and producer-coverage review must be tied to exact
committed R5gA source before technical PASS.

## Separate release HOLD
Qualified human Class A, R4L independent source integration, R20 signed
deletion-safe recovery, full genuine MAIA voice/text/consent, physical
Safari, production image/rollback and consented tester-only GO remain open.

Tracking:
- https://github.com/SoullabTech/Sovereign/issues/1819
- https://github.com/SoullabTech/Sovereign/issues/1817
- https://github.com/SoullabTech/Sovereign/issues/1816

**No merge, deployment, production migration, member-data access, billing,
or tester invitation is authorized by this draft.**
